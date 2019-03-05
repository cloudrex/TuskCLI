import {IOp} from "./Op";
import colors from "colors";
import SpaceFactory from "./SpaceFactory";
import {Tasks} from "./Task";

export default class OpRunner {
    protected static readonly ops: Map<string, IOp> = new Map();

    /**
     * Load operation queue from a registered task.
     */
    public static prepare(taskName: string): boolean {
        if (!Tasks.has(taskName)) {
            return false;
        }

        this.ops.clear();
        
        for (const op of Tasks.get(taskName)!.ops) {
            this.ops.set(op.name, op);
        }

        return true;
    }

    /**
     * Clear operation queue.
     */
    public static clear(): void {
        this.ops.clear();
    }

    /**
     * Append an operation to the operation queue.
     */
    public static queue(op: IOp): void {
        OpRunner.ops.set(op.name, op);
    }

    /**
     * Remove a registered operation from the queue.
     */
    public static remove(name: string): boolean {
        return OpRunner.ops.delete(name);
    }

    /**
     * Retrieve the operation queue.
     */
    public static getQueue(): ReadonlyArray<IOp> {
        const ops: IOp[] = [];

        for (const op of OpRunner.ops.values()) {
            ops.push(op);
        }

        return ops;
    }

    /**
     * Determine if a operation is registered.
     */
    public static hasOp(name: string): boolean {
        return this.ops.has(name);
    }

    /**
     * Run all queued operations.
     */
    public static async run(): Promise<void> {
        let counter: number = 1;

        // Create initial newline.
        console.log();

        for (const op of this.ops.values()) {
            // Prepare styled entities.
            const progress: string = colors.gray(`${counter}/${this.ops.size}`);
            const name: string = colors.cyan(op.name);

            const description: string = colors.gray(OpRunner.breakDescription(
                (counter.toString().length + this.ops.size.toString().length + 1),
                op.name.length,
                op.desc || "")
            );

            // Display operation info.
            console.log(`  ${progress} ${name} ${description}\n`);

            // Execute the operation and capture the result.
            const result: undefined | boolean = await op.callback() as undefined | boolean;

            // Operation was successfully completed.
            if (result === undefined || result === true) {
                counter++;

                continue;
            }

            // Otherwise, the operation failed.
            console.log(colors.red(`  Operation '${op.name}' failed\n`));

            return;
        }

        console.log(colors.green(`  Task completed successfully\n`));
    }

    /**
     * Prepare and run operations from a registered task.
     */
    public static runTask(name: string): Promise<void> {
        OpRunner.prepare(name);

        return OpRunner.run();
    }

    /**
     * Break up description with newlines using a threshold amount of characters.
     */
    protected static breakDescription(opsLength: number, nameLength: number, description: string, threshold: number = 45): string {
        let result: string = "";
        let counter: number = 0;

        for (const char of description) {
            if (counter >= threshold) {
                // '+ 4' corresponds to 2 initial spaces and the counter-name-desc (3) separation spaces.
                result += "\n" + SpaceFactory.make(nameLength + opsLength + 4);
                counter = 0;
            }
            else {
                counter++;
            }

            result += char;
        }

        return result.trim();
    }
}
