import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

async function downloadImage(url: string, destFilename: string): Promise<string | null> {
  try {
    console.log(`Downloading from WP: ${url}`);
    const res = await fetch(url);
    
    if (!res.ok) {
      console.log(`Failed to download (Status: ${res.status}): ${url}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filepath = path.join(publicDir, destFilename);
    fs.writeFileSync(filepath, buffer);

    return `/uploads/${destFilename}`;
  } catch (error: any) {
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

function stripHash(filename: string): string {
  // Pattern 1: UUID (36 chars + hyphen)
  // e.g. 496d349d-6cca-4fd6-9afc-fd269b4f2806-filename.jpg
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
  if (uuidPattern.test(filename)) {
    return filename.replace(uuidPattern, "");
  }

  // Pattern 2: 8-char hex hash + hyphen
  // e.g. a564b85a-filename.jpg
  const shortHashPattern = /^[0-9a-f]{8}-/;
  if (shortHashPattern.test(filename)) {
    return filename.replace(shortHashPattern, "");
  }

  return filename;
}

async function main() {
  console.log("Starting WordPress image sync...");
  
  const articles = await prisma.article.findMany({
    where: {
      coverImage: {
        startsWith: "/uploads/"
      },
      publishedAt: {
        not: null
      }
    }
  });

  console.log(`Found ${articles.length} articles to process.`);

  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    if (!article.publishedAt || !article.coverImage) continue;

    const date = new Date(article.publishedAt);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    
    const currentFilename = article.coverImage.replace("/uploads/", "");
    const wpFilename = stripHash(currentFilename);
    
    const wpUrl = `https://kita-sehat.id/wp-content/uploads/${year}/${month}/${wpFilename}`;
    
    console.log(`Processing Article [${article.id}]: ${article.title}`);
    const localPath = await downloadImage(wpUrl, wpFilename);

    if (localPath) {
      await prisma.article.update({
        where: { id: article.id },
        data: { coverImage: localPath }
      });
      
      // Also update or create MediaAsset
      const existingMedia = await prisma.mediaAsset.findFirst({
        where: { url: localPath }
      });

      if (!existingMedia) {
        await prisma.mediaAsset.create({
          data: {
            url: localPath,
            articleId: article.id,
            type: "image"
          }
        });
      }

      successCount++;
      console.log(`[OK] Updated: ${localPath}`);
    } else {
      failCount++;
      console.log(`[SKIP] Failed to fetch image for ${article.title}`);
    }
  }

  console.log(`\nSync complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
