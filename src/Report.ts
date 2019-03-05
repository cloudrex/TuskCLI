import colors from "colors";
import Tusk from "./Tusk";

/**
 * Report errors and warnings to the user.
 */
export default abstract class Report {
    public static fatal(message: string): void {
        Report.error(message);
        process.exit(0);
    }

    public static warn(message: string): void {
        console.log(colors.yellow(message));
    }

    public static error(message: string): void {
        console.log(colors.red(message));
    }

    public static verbose(message: string): void {
        if (Tusk.options.verbose) {
            console.log("  %s %s", colors.white("verbose"), colors.gray(message));
        }
    }
}
