import fs from "fs";
import {DefaultAction} from "./Misc";
import md5File = require("md5-file");

export interface ICache {
    readonly packageJsonVersion: string;
    readonly defaultAction: DefaultAction;
}

export default class TuskCache {
    protected static readonly location: string = ".TuskCache.json";
    protected static readonly packageLocation: string = "package.json";

    public static get packageExists(): boolean {
        return fs.existsSync(TuskCache.packageLocation);
    }

    public static getPackageHash(): string | null {
        if (!TuskCache.packageExists) {
            return null;
        }

        return md5File.sync(TuskCache.packageLocation);
    }

    public static readCache(): ICache | null {
        // TuskCache does not exist.
        if (!TuskCache.exists) {
            return null;
        }

        return JSON.parse(fs.readFileSync(TuskCache.location).toString());
    }

    public static get isPackageModified(): boolean {
        // TuskCache does not exist yet--nothing to compare current package.json version to.
        if (TuskCache.exists) {
            return true;
        }
        // TODO
        else if (false) {

        }

        // TuskCache exists, read & compare.
        // TODO

        return false;
    }

    public static updateDefaultAction(defaultAction: DefaultAction): void {
        // TODO: if modified--update--defaultAction
    }

    public static update(options: Partial<ICache>): void {
        let existing: ICache | undefined = undefined;

        if (fs.existsSync(TuskCache.location)) {
            existing = JSON.parse(fs.readFileSync(TuskCache.location).toString());
        }

        fs.writeFileSync(TuskCache.location, JSON.stringify({
            ...existing,
            ...options
        }));
    }

    public static get exists(): boolean {
        return fs.existsSync(TuskCache.location);
    }
}
