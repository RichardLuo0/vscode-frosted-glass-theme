import * as esbuild from "esbuild";
import { generateLicenseFile } from "generate-license-file";

const buildList = [];
function build(options) {
  buildList.push(
    esbuild.build(options).then((result) => ({ ...result, options }))
  );
}

const common = {
  bundle: true,
  platform: "node",
  target: ["node18"],
  external: ["vscode"],
  logLevel: "silent",
  minify: true,
};

const buildExtensionOptions = {
  ...common,
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
  target: ["esnext"],
  format: "esm",
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
await generateLicenseFile("./package.json", thirdPartyLicenseFile);
console.log(thirdPartyLicenseFile);
console.log("\u001b[32mDone\u001b[0m");
