export type PromiseOr<T> = Promise<T> | T;

export type Callback<T = void> = (...args: any[]) => T;

export type OpCallback = Callback<void | PromiseOr<boolean>>;

export interface IOp {
    readonly name: string;
    readonly description?: string;
    readonly callback: OpCallback;
};


