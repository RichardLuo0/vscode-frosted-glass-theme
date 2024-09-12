import File from "./File";
import InjectionNormal from "./InjectionNormal";

const args = process.argv;
if (args.length < 3) throw new Error("Not enough argv");
const funcName = args[args.length - 3] as "inject" | "restore";
const files: File[] = JSON.parse(args[args.length - 2]).map(
  (value: { _path: string }) => new File(value._path)
);
const htmlFile = args[args.length - 1];

const injectionNormal = new InjectionNormal(files, htmlFile);
injectionNormal[funcName]();
