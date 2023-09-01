import { IFile } from "./File";
import InjectionNormal from "./InjectionNormal";

class File implements IFile {
  constructor(private _path: string) {}

  public get path(): string {
    return "file:///" + this._path;
  }
}

const args = process.argv;
if (args.length < 4) throw new Error("Not enough argv");
const funcName = args[args.length - 4];
const files = (JSON.parse(args[args.length - 3]) as any[]).map(
  (e) => new File(e._path)
);
const base = args[args.length - 2];
const htmlFile = args[args.length - 1];

const injectionNormal: any = new InjectionNormal(files, base, htmlFile);
(injectionNormal[funcName] as () => Promise<void>)();
