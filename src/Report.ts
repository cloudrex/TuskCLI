import colors from "colors";

/**
 * Report errors and warnings to the user.
 */
export default abstract class Report {
    public static fatal(message: string) {
        console.log(colors.red(message));
        process.exit(0);
    }

    public static warn(message: string) {
        console.log(colors.yellow(message));
    }
}
