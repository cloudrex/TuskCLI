import {IOp} from "./Op";

export const Tasks: Map<string, ITask> = new Map();

export interface ITask {
    readonly name: string;
    readonly desc?: string;
    readonly ops: IOp[];
}

export type TaskDef = (name: string, desc: string | undefined, ops: IOp[]) => void;

const Task: TaskDef = (name: string, desc: string | undefined, ops: IOp[]): void => {
    Tasks.set(name, {
        name,
        desc,
        ops
    });
};

export default Task;
