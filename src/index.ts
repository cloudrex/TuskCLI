#!/usr/bin/env node

import Task, {Tasks} from "./task";
import OpRunner from "./opRunner";
import fs from "fs";
import {IPackage, DefaultAction} from "./misc";
import cli from "commander";
import TuskCache from "./tuskCache";
import Tusk from "./tusk";
import Report from "./report";
import tusk from "tusk";

// Ensure TuskFile exists.
if (!fs.existsSync(Tusk.options.tuskFilePath)) {
    throw Report.fatal("tuskFile.js not found in specified path (case-sensitive).");
}

// Inject globals.
(global as any).Task = Task;
(global as any).tusk = tusk;

// Register default tasks.
Tusk.registerDefaultTasks();

// Import TuskFile.
require(TuskCache.getResolvedPath());

// Prepare & process CLI. Ensure CLI is processed post-TuskFile importing.
Tusk.prepareCli();
Tusk.processCliOptions();

// Begin processing arguments.
const requestedTasks: string[] = cli.args;

async function handleRequest() {
    // Attempt to invoke the default action.
    if (requestedTasks.length === 0) {
        // Attempt to choose default action from package manifest.
        if ((Tusk.options.defaultAction === undefined || Tusk.options.defaultAction === DefaultAction.Infer) && TuskCache.packageExists) {
            const pckg: IPackage = JSON.parse(fs.readFileSync(Tusk.packageLocation).toString());

            if (pckg.scripts !== undefined) {
                // 'build' is present and 'start' is not.
                if (pckg.scripts.build !== undefined && pckg.scripts.start === undefined) {
                    Tusk.options.defaultAction = DefaultAction.Build;
                }
                // 'start' is present and 'build' is not.
                else if (pckg.scripts.start !== undefined && pckg.scripts.build === undefined) {
                    Tusk.options.defaultAction = DefaultAction.Run;
                }
                // If both are present, 'start' takes priority.
                else if (pckg.scripts.build !== undefined && pckg.scripts.start !== undefined) {
                    Tusk.options.defaultAction = DefaultAction.Run;
                }
            }
        }

        // Attempt to execute the default action (if applicable).
        if (Tusk.options.defaultAction !== undefined) {
            // Run the 'start' task.
            if (Tusk.options.defaultAction === DefaultAction.Run) {
                OpRunner.runTask(DefaultAction.Run);
            }
            // Run the 'build' task.
            else if (Tusk.options.defaultAction === DefaultAction.Build) {
                OpRunner.runTask(DefaultAction.Build);
            }
            // An invalid default action was specified.
            else {
                throw Report.fatal("An invalid default action was specified.");
            }

            // Attempt to update default action in cache.
            TuskCache.updateDefaultAction(Tusk.options.defaultAction);
        }
        // No default action was specified.
        else {
            throw Report.fatal("No default action could be inferred.");
        }
    }
    else {
        // Notify the user of more than one tasks being processed.
        if (requestedTasks.length > 1) {
            console.log(`\n  {!} Processing ${requestedTasks.length} tasks\n`);
        }

        // Run the requested tasks.
        for (const task of requestedTasks) {
            // The requested task exists, run it.
            if (Tasks.has(task)) {
                await OpRunner.runTask(task);
            }
            // Otherwise, the requested task does not exist.
            else {
                Report.fatal(`Task '${task}' does not exist.`);
            }
        }
    }
}

handleRequest();
