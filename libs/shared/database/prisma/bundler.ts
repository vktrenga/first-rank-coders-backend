import * as glob from "glob";
import * as fs from "fs-extra";
import * as path from "path";

// Path to models folder
const modelsDir = path.resolve(__dirname, "models"); // libs/shared/database/prisma/models
const outputSchema = path.resolve(__dirname, "schema.prisma");

async function mergePrismaModels() {
  try {
    // Find all .prisma files
    const files = glob.sync(path.join(modelsDir, "*.prisma").replace(/\\/g, "/"));
    console.log("Found model files:", files);

    if (files.length === 0) {
      console.log("No model files found.");
      return;
    }

  const mergeOrder = ["connection.prisma", "basic.prisma", "org.prisma","enum.prisma"];
  const Orderedfiles = mergeOrder
  .map(f => path.join(modelsDir, f))
  .filter(f => fs.existsSync(f));

    // Read all files
    const mergedSchema = await Promise.all(
      Orderedfiles.map(file => fs.readFile(file, "utf-8"))
    );

    // Join with double newline for readability
    const finalSchema = mergedSchema.join("\n\n");

    // Write merged schema.prisma
    await fs.writeFile(outputSchema, finalSchema, "utf-8");
    console.log("Merged schema.prisma created at:", outputSchema);
  } catch (error) {
    console.error("Error merging Prisma models:", error);
  }
}

// Run the merge
mergePrismaModels();
