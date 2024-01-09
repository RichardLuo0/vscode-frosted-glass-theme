import File from "./File";
import InjectionNormal from "./InjectionNormal";

const args = process.argv;
if (args.length < 4) throw new Error("Not enough argv");
const funcName = args[args.length - 4] as "inject" | "restore";
const files: File[] = JSON.parse(args[args.length - 3], (key, value) =>
  typeof key == "number" ? new File(value._path) : value
);
const base = args[args.length - 2];
const htmlFile = args[args.length - 1];

const injectionNormal = new InjectionNormal(files, base, htmlFile);
injectionNormal[funcName]();
