import colors from "colors";

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
}
