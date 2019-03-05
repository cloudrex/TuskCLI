import cli from "commander";
import fs from "fs";
import Task, {Tasks} from "./Task";
import Report from "./Report";
import colors from "colors";
import {IOptions} from "./Options";
import {ScriptOps} from "@atlas/automata";
import {DefaultAction} from "./Misc";

export default abstract class Tusk {
    public static readonly packageLocation: string = "package.json";

    public static readonly options: IOptions = {
        tuskFilePath: "TuskFile.js"
    };

    public static processCliOptions(): void {
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
                console.log(colors.red("TuskFile.js already exists in current directory."));
                process.exit(1);
            }

            // Write TuskFile.
            fs.writeFileSync("TuskFile.js", "//\n");

            // Exit application.
            process.exit(0);
        }
    }

    public static prepareCli(): void {
        // Prepare & parse CLI.
        cli
            .version("Please see NPM package for details")
            .usage("[options] <task>")
            .option("-t, --tuskfile", "specify the path to the TuskFile")
            .option("-d, --default", "specify the default action")
            .option("-l, --list", "list all available tasks")
            .option("-i, --init", "initialize a TuskFile in the current directory")
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
