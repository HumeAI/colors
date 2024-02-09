import { Document, parse } from "kdljs";
import { Project, VariableDeclarationKind } from "ts-morph";
import * as prettier from "prettier";
import chroma from "chroma-js";
import path from "path";
import fs from "fs";

const rootDir = path.resolve(__dirname, "..", "..");

const generatedFile = path.resolve(rootDir, "lib", "generated", "colors.ts");

function createSchema() {
  const fileString = fs.readFileSync(
    path.resolve(rootDir, "lib", "schema.kdl"),
    "utf8",
  );
  const parsed = parse(fileString);
  return parsed.output;
}

function getDyadicColors(doc: Document) {
  const map = new Map<
    string,
    {
      hex: string;
      gl: [number, number, number, number];
      rgba: [number, number, number, number];
      hsl: [number, number, number];
    }
  >();

  const collection =
    doc.find((node) => node.name === "dyadic-colors")?.children ?? [];

  for (const node of collection) {
    const name = node.name ?? "";
    const value = String(node.values[0] ?? "");

    const color = chroma(value);
    const hex = color.hex();
    const gl = color.gl();
    const rgba = color.rgba();
    const hsl = color.hsl();

    map.set(name, {
      hex,
      gl,
      rgba,
      hsl,
    });
  }

  return map;
}

const schema = createSchema();

const colors = getDyadicColors(schema!);

const project = new Project();
const sourceFile = project.createSourceFile(`./lib/generated/colors.ts`, ``, {
  overwrite: true,
});
sourceFile.insertStatements(
  0,
  `// ⚠️ This is a generated file ⚠️
// DO NOT EDIT DIRECTLY

`,
);

const variableStatement = sourceFile.addVariableStatement({
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "expressionColors",
      initializer: `${JSON.stringify(Object.fromEntries(colors.entries()))} as const`,
    },
  ],
});

variableStatement.setIsExported(true);

const rawFile = sourceFile.getFullText();

prettier.format(rawFile, { parser: "typescript" }).then((formatted) => {
  fs.writeFileSync(generatedFile, formatted);
});
