import cli from "commander";
import fs from "fs";
import Task, {Tasks} from "./Task";
import Report from "./Report";
import colors from "colors";
import {IOptions} from "./Options";
import {ScriptOps} from "tusk";
import {DefaultAction} from "./Misc";
import TuskCache from "./TuskCache";

export default abstract class Tusk {
    public static readonly packageLocation: string = "package.json";
    public static readonly gitIgnoreLocation: string = ".gitignore";

    public static readonly options: IOptions = {
        tuskFilePath: "TuskFile.js",
        verbose: false
    };

    public static processCliOptions(): void {
        // Turn on verbose mode. This should be the first check, since others may end the program prematurely.
        if (cli.verbose) {
            Tusk.options.verbose = true;
        }

        // Apply CLI arguments & override options (if applicable).
        if (cli.tuskfile) {
            Tusk.options.tuskFilePath = cli.tuskFile;
        }

        // Specify the default action.
        if (cli.default) {
            Tusk.options.defaultAction = cli.default;
        }

        // List all available tasks.
        if (cli.list) {
            for (const task of Tasks.values()) {
                console.log(colors.cyan(task.name) + " " + colors.gray(task.desc || ""));
            }

            if (Tasks.size === 0) {
                Report.error("No tasks found.");
            }

            process.exit(0);
        }

        // Initialize a new TuskFile.
        if (cli.init) {
            // Ensure TuskFile does not already exist.
            if (fs.existsSync(Tusk.options.tuskFilePath)) {
                throw Report.fatal(`${Tusk.options.tuskFilePath} already exists in current directory.`);
            }

            // Write TuskFile.
            fs.writeFileSync(Tusk.options.tuskFilePath, "//\n");

            // Attempt to add TuskCache file entry to '.gitignore'.
            if (fs.existsSync(Tusk.gitIgnoreLocation)) {
                const lines: string[] = fs.readFileSync(Tusk.gitIgnoreLocation).toString().trim().split("\n");

                // Add TuskCache file if it's not already ignored.
                if (!lines.includes(TuskCache.location)) {
                    lines.push(TuskCache.location);

                    // Save the '.gitignore' file along with the new entry. Also add an extra line.
                    fs.writeFileSync(Tusk.gitIgnoreLocation, lines.join("\n") + "\n");
                }

                Report.verbose(`Added entry for ${TuskCache.location} in ${Tusk.gitIgnoreLocation}`);
            }

            // Exit application.
            process.exit(0);
        }
    }

    public static prepareCli(): void {
        // Prepare & parse CLI.
        cli
            .version("Please see NPM package for details")
            .usage("[options] [task]")
            .option("-t, --tuskfile", "specify the path to the TuskFile")
            .option("-d, --default <action>", "specify the default action")
            .option("-l, --list", "list all available tasks")
            .option("-i, --init", "initialize a TuskFile in the current directory")
            .option("-v, --verbose", "display additional information")
            .parse(process.argv);
    }

    public static registerDefaultTasks(): void {
        Task(DefaultAction.Build, "Build the project", [
            {
                name: "build",
                desc: "Build the project",
                callback: ScriptOps.npmBuild
            }
        ]);

        Task(DefaultAction.Run, "Run the project", [
            {
                name: "run",
                desc: "Run the project",
                callback: ScriptOps.npmStart
            }
        ]);
    }
}
;
