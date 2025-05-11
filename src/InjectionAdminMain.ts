import InjectionNormal from "./InjectionNormal";

const args = process.argv;
if (args.length < 3) throw new Error("Not enough argv");
const funcName = args[args.length - 3] as "inject" | "restore";
const files: string[] = JSON.parse(args[args.length - 2]);
const baseFile = args[args.length - 1];

const injectionNormal = new InjectionNormal(files, baseFile);
injectionNormal[funcName]();
