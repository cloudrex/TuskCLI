import fs from "fs";
import {DefaultAction} from "./Misc";
import md5File = require("md5-file");
import Report from "./Report";
import path from "path";
import Tusk from "./Tusk";

export interface ICache {
    readonly packageJsonVersion: string;
    readonly defaultAction: DefaultAction;
}

export default abstract class TuskCache {
    public static readonly location: string = ".TuskCache.json";

    protected static loadedTuskCache?: ICache;

    public static get packageExists(): boolean {
        return fs.existsSync(Tusk.packageLocation);
    }

    public static getPackageHash(): string | null {
        if (!TuskCache.packageExists) {
            return null;
        }

        return md5File.sync(Tusk.packageLocation);
    }

    public static getResolvedPath(): string {
        return path.resolve(path.join(".", Tusk.options.tuskFilePath))
    }

    public static readCache(primeLoaded: boolean = true): ICache | null {
        // Give priority to previously loaded cache, return it.
        if (primeLoaded && TuskCache.loadedTuskCache !== undefined) {
            Report.verbose("Using cached TuskCache file.");

            return TuskCache.loadedTuskCache;
        }

        // TuskCache file does not exist.
        if (!TuskCache.exists) {
            return null;
        }

        const cache: ICache = JSON.parse(fs.readFileSync(TuskCache.location).toString());

        // Save cache for later use and faster retrieval.
        TuskCache.loadedTuskCache = cache;

        return cache;
    }

    /**
     * Determine whether the package manifest file's hash no longer matches TuskCache file hash.
     */
    public static get isPackageModified(): boolean {
        // TuskCache file does not exist yet--nothing to compare current package manifest version to.
        if (!TuskCache.exists) {
            return true;
        }
        
        // TuskCache file exists, but package manifest is missing.
        if (!TuskCache.packageExists) {
            throw Report.fatal(`Package manifest '${Tusk.packageLocation}' does not exist.`);
        }

        // TuskCache file & package manifest exist, proceed to read & compare.
        return TuskCache.readCache()!.packageJsonVersion === TuskCache.getPackageHash()!;
    }

    /**
     * Updated cached default action if applicable.
     */
    public static updateDefaultAction(defaultAction: DefaultAction): void {
        // No need to update.
        if (!TuskCache.isPackageModified) {
            return;
        }

        // Otherwise, perform the update.
        TuskCache.update({
            defaultAction
        });
    }

    public static update(options: Partial<ICache>): void {
        let existing: ICache | undefined = undefined;

        // A TuskCache file already exists. Load it.
        if (TuskCache.exists) {
            existing = JSON.parse(fs.readFileSync(TuskCache.location).toString());
        }

        const newOptions: Partial<ICache> = {
            ...existing,
            ...options
        };

        // Write & merge changes to the TuskCache file.
        fs.writeFileSync(TuskCache.location, JSON.stringify(newOptions));

        // Also merge changes with the loaded TuskCache file (if applicable).
        if (TuskCache.loadedTuskCache !== undefined) {
            TuskCache.loadedTuskCache = {
                ...TuskCache.loadedTuskCache,
                ...newOptions
            };

            Report.verbose("Updated existing TuskCache file in-memory cache.");
        }

        Report.verbose("Updated TuskCache file.");
    }

    public static get exists(): boolean {
        return fs.existsSync(TuskCache.location);
    }
}
