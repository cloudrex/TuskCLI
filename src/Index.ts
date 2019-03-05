#!/usr/bin/env node

import colors from "colors";
import Task, {Tasks} from "./Task";
import OpRunner from "./OpRunner";
import fs from "fs";
import path from "path";
import {ScriptOps} from "@atlas/automata";
import {IPackage, DefaultAction} from "./Misc";
import cli from "commander";
import {IOptions} from "./Options";

// Prepare & parse CLI.
cli
    .version("Please see NPM package for details")
    .option("-t, --tuskfile","specify the path to the TuskFile")
    .option("-d, --default", "specify the default action")
    .option("-l, --list", "list all available tasks")
    .option("-i, --init", "initialize a TuskFile in the current directory")
    .parse(process.argv);

const options: IOptions = {
    tuskFilePath: "TuskFile.js"
};

// Apply CLI arguments & override options (if applicable).
if (cli.tuskfile) {
    options.tuskFilePath = cli.tuskFile;
}

if (cli.default) {
    options.defaultAction = cli.default;
}

// Ensure TuskFile exists.
if (!fs.existsSync(options.tuskFilePath)) {
    console.log(colors.red(`TuskFile.js not found in specified path (case-sensitive).`));
    process.exit(1);
}

// Register default tasks.
Task("build", "Build the project", [
    {
        name: "build",
        description: "Build the project",
        callback: ScriptOps.npmBuild
    }
]);

// Inject globals.
(global as any).Task = Task;

// Import ActionFile.
require(path.resolve(path.join(".", options.tuskFilePath)));

// Begin processing arguments.
const args: string[] = process.argv.slice(2);
const taskName: string | undefined = args[0];

// Attempt to invoke the default action.
if (taskName === undefined) {
    // Attempt to choose default action from package.json.
    if ((options.defaultAction === undefined || options.defaultAction === DefaultAction.Infer) && fs.existsSync("package.json")) {
        const pckg: IPackage = JSON.parse(fs.readFileSync("./").toString());

        if (pckg.scripts !== undefined) {
            // 'build' is present and 'start' is not.
            if (pckg.scripts.build !== undefined && pckg.scripts.start === undefined) {
                options.defaultAction = DefaultAction.Build;
            }
            // 'start' is present and 'build' is not.
            else if (pckg.scripts.start !== undefined && pckg.scripts.build === undefined) {
                options.defaultAction = DefaultAction.Start;
            }
            // If both are present, 'start' takes priority.
            else if (pckg.scripts.build !== undefined && pckg.scripts.start !== undefined) {
                options.defaultAction = DefaultAction.Start;
            }
        }
    }

    // Attempt to execute the default action (if applicable).
    if (options.defaultAction !== undefined) {
        // Run 'npm start'.
        if (options.defaultAction === DefaultAction.Start) {
            ScriptOps.npmStartSync(true);
        }
        // Run 'npm run-script build'.
        else if (options.defaultAction === DefaultAction.Build) {
            ScriptOps.npmBuildSync(true);
        }
        // An invalid default action was specified.
        else {
            console.log(colors.red("An invalid default action was specified."));
            process.exit(1);
        }
    }
    // No default action was specified.
    else {
        console.log(colors.red("No default action could be inferred."))
        process.exit(1);
    }
}
// List registered tasks.
else if (taskName === "list") {
    for (const task of Tasks.values()) {
        console.log(colors.cyan(task.name) + " " + colors.gray(task.desc || ""));
    }
}
// Run a specific task.
else if (Tasks.has(taskName)) {
    OpRunner.prepare(taskName);
    OpRunner.run();
}
// Otherwise, task does not exist.
else {
    console.log(colors.red("That task does not exist."));
}
