import * as esbuild from "esbuild";
import fs from "fs/promises";
import { generateLicenseFile } from "generate-license-file";
import { parseLiterals } from "parse-literals";
import path from "path";

const buildList = [];
function build(options) {
  buildList.push(
    esbuild.build(options).then(result => ({ ...result, options }))
  );
}

function minifyLiteralsPlugin(tags) {
  return {
    name: "minifyLiteralsPlugin",
    setup(build) {
      const cache = new Map();
      build.onLoad({ filter: /\.[jt]s$/ }, async ({ path }) => {
        const content = await fs.readFile(path, "utf8");
        const value = cache.get(path);
        if (value && value.content === content) return value.output;
        let result = "";
        let index = 0;
        for (const literal of parseLiterals(content)) {
          if (tags.includes(literal.tag)) {
            for (const part of literal.parts) {
              result += content.substring(index, part.start);
              result += part.text.replace(/\s+/gm, " ");
              index = part.end;
            }
          }
        }
        result += content.substring(index);
        const output = {
          contents: result,
          loader: path.endsWith(".ts") ? "ts" : "js",
        };
        cache.set(path, { content, output });
        return output;
      });
    },
  };
}

const common = {
  bundle: true,
  platform: "node",
  target: ["node18"],
  logLevel: "silent",
  minify: true,
  legalComments: "none",
  plugins: [minifyLiteralsPlugin(["css"])],
};

const buildExtensionOptions = {
  ...common,
  external: ["vscode"],
  entryPoints: ["src/extension.ts"],
  outfile: "out/extension.js",
};
if (process.argv.includes("watch")) {
  const ctx = await esbuild.context({
    ...buildExtensionOptions,
    logLevel: "info",
  });
  await ctx.watch();
  console.log("watching...");
} else build(buildExtensionOptions);

build({
  ...common,
  entryPoints: ["src/InjectionAdminMain.ts"],
  outfile: "out/InjectionAdminMain.js",
});

build({
  ...common,
  platform: "browser",
  external: ["vs/base/browser/dompurify/dompurify"],
  target: ["esnext"],
  format: "esm",
  loader: { ".css": "copy", ".json": "copy" },
  assetNames: "[name]",
  sourcemap: true,
  entryPoints: ["src-inject/main.ts"],
  outfile: "inject/vscode-frosted-glass-theme.js",
});

for (var result of await Promise.all(buildList)) {
  console.log(result.options.outfile);
  if (result.warnings.length == 0 && result.errors.length == 0)
    console.log("\u001b[32mDone\u001b[0m");
  else {
    console.log(
      esbuild
        .formatMessagesSync(result.warnings, {
          kind: "warning",
          color: true,
        })
        .join("\n")
    );
    console.log(
      esbuild
        .formatMessagesSync(result.errors, {
          kind: "error",
          color: true,
        })
        .join("\n")
    );
  }
  console.log();
}

const thirdPartyLicenseFile = "3rdPartyLicense.txt";
const licensesPath = "./licenses";
await generateLicenseFile("./package.json", thirdPartyLicenseFile, {
  append: (await fs.readdir(licensesPath)).map(file =>
    path.join(licensesPath, file)
  ),
});
console.log(thirdPartyLicenseFile);
console.log("\u001b[32mDone\u001b[0m");
