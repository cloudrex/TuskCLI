import {DefaultAction} from "./Misc";

export interface IOptions {
    /**
     * The path to the TuskFile.
     */
    tuskFilePath: string;

    /**
     * The default action to be inferred when target task is missing or not specified.
     */
    defaultAction?: DefaultAction;
    
    /**
     * Whether verbose mode is active.
     */
    verbose: boolean;

    /**
     * Whether to skip registration of default tasks.
     */
    bare: boolean;
}
