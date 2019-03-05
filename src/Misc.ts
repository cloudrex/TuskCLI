export interface IPackageScripts {
    readonly build?: string;
    readonly start?: string;
}

export interface IPackage {
    readonly scripts?: IPackageScripts;
}

export enum DefaultAction {
    Start = "start",
    Build = "build",
    Infer = "infer"
}
