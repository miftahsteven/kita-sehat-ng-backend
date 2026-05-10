import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import crypto from "crypto";

const prisma = new PrismaClient();

async function downloadImage(url: string, articleId: string): Promise<string | null> {
  try {
    // Check if it's a relative URL and prepend domain if necessary
    let finalUrl = url;
    if (!finalUrl.startsWith("http")) {
      if (finalUrl.startsWith("/")) {
        finalUrl = `https://kita-sehat.id${finalUrl}`;
      } else {
        finalUrl = `https://kita-sehat.id/${finalUrl}`;
      }
    }

    console.log(`Downloading: ${finalUrl}`);
    const res = await fetch(finalUrl);
    
    if (!res.ok) {
      console.log(`Failed to download (Status: ${res.status}): ${finalUrl}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get original extension or default to .jpg
    const urlObj = new URL(finalUrl);
    const extname = path.extname(urlObj.pathname) || ".jpg";
    
    const randomHash = crypto.randomBytes(4).toString("hex");
    const filename = `${randomHash}-${path.basename(urlObj.pathname)}`;
    
    const publicDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, buffer);

    const relativePath = `/uploads/${filename}`;

    // Create a media record as well
    await prisma.mediaAsset.create({
      data: {
        url: relativePath,
        type: "image",
        articleId: articleId,
      }
    });

    return relativePath;
  } catch (error: any) {
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("Starting missing cover images fix...");
  
  const csvPath = path.join(process.cwd(), "Posts-Export-2026-May-09-1610.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found!");
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`Found ${records.length} records in CSV.`);

  // Get articles that have null coverImage
  const articlesWithoutCover = await prisma.article.findMany({
    where: { coverImage: null },
    select: { id: true, title: true }
  });

  console.log(`Found ${articlesWithoutCover.length} articles with null coverImage in DB.`);

  let updatedCount = 0;

  for (const article of articlesWithoutCover) {
    // Find matching record in CSV by title
    const record: any = records.find((r: any) => r.Title === article.title);
    
    if (record && record["Image URL"]) {
      // Image URL might contain multiple URLs separated by |
      const rawUrl = record["Image URL"].split("|")[0].trim();
      
      if (rawUrl) {
        console.log(`Found image URL for "${article.title.substring(0, 30)}...": ${rawUrl}`);
        const newPath = await downloadImage(rawUrl, article.id);
        
        if (newPath) {
          await prisma.article.update({
            where: { id: article.id },
            data: { coverImage: newPath }
          });
          updatedCount++;
          console.log(`[SUCCESS] Updated article ${article.id} with image ${newPath}`);
        } else {
          console.log(`[FAILED] Could not download image for ${article.id}`);
        }
      }
    } else {
      console.log(`No image URL found in CSV for "${article.title.substring(0, 30)}..."`);
    }
  }

  console.log(`\nFix complete! Updated ${updatedCount} articles.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
