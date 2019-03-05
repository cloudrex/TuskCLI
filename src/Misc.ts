export interface IPackageScripts {
    readonly build?: string;
    readonly start?: string;
}

export interface IPackage {
    readonly scripts?: IPackageScripts;
}

export enum DefaultAction {
    Run = "run",
    Build = "build",
    Infer = "infer"
}
