import fs from "fs/promises";
import path from "path";

export const clearImage = async (imagePath: string) => {
  const filePath = path.resolve(__dirname, "../../images", imagePath);
  try {
    await fs.unlink(filePath);
    console.log(`File removed: ${filePath}`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.warn(`File not found, skipping removal: ${filePath}`);
    } else {
      throw error;
    }
  }
};
