import * as esbuild from "esbuild";

const buildList = [];

const common = {
  bundle: true,
  platform: "node",
  target: ["node18"],
  external: ["vscode"],
  logLevel: "info",
};

const buildExtensionOptions = {
  ...common,
  entryPoints: ["src/extension.ts"],
  outfile: "out/extension.js",
};
if (process.argv.includes("watch")) {
  const ctx = await esbuild.context(buildExtensionOptions);
  await ctx.watch();
  console.log("watching...");
} else buildList.push(esbuild.build(buildExtensionOptions));

buildList.push(
  esbuild.build({
    ...common,
    entryPoints: ["src/InjectionAdminMain.ts"],
    outfile: "out/InjectionAdminMain.js",
  })
);

buildList.push(
  esbuild.build({
    ...common,
    platform: "browser",
    target: ["esnext"],
    format: "esm",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    loader: { ".css": "copy" },
    assetNames: "[name]",
    keepNames: true,
    legalComments: "inline",
    entryPoints: ["src-inject/main.ts"],
    outfile: "inject/vscode-frosted-glass-theme.js",
  })
);
