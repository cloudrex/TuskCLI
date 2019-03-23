const tusk = require("tusk");

Task("deploy", "Publish package to the NPM registry.", [
    {
        name: "clean",
        desc: "Clean output directory.",
        callback: () => tusk.FileOps.forceRemove("dist")
    },
    {
        name: "build",
        desc: "Build the project.",
        callback: () => tusk.ScriptOps.execute("tsc", undefined, true)
    },
    {
        name: "deploy",
        desc: "Publish package to the NPM registry.",
        callback: () => tusk.ScriptOps.npm("publish")
    }
]);
