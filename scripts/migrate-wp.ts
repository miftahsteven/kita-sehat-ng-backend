import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import axios from "axios";
import { PrismaClient, ArticleStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const CSV_PATH = "/Users/miftahsyarief/MyLab/kita-sehat-ng/kita-sehat-backend/Posts-Export-2026-May-09-1610.csv";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function downloadImage(url: string): Promise<string | null> {
  if (!url || !url.startsWith("http")) return null;
  
  try {
    const filename = `${uuidv4()}-${path.basename(url.split("?")[0])}`;
    const targetPath = path.join(UPLOAD_DIR, filename);
    
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 10000,
    });

    const writer = fs.createWriteStream(targetPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(`/uploads/${filename}`));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Failed to download image: ${url}`);
    return null;
  }
}

async function migrate() {
  console.log("🚀 Starting migration...");
  
  const parser = fs
    .createReadStream(CSV_PATH)
    .pipe(parse({ 
      columns: true, 
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      ltrim: true,
      rtrim: true
    }));

  let count = 0;
  let successCount = 0;

  parser.on("error", (err) => {
    console.error("❌ Parser Error:", err);
  });

  for await (const record of parser) {
    count++;
    try {
      const {
        Title,
        Content,
        Excerpt,
        Date: postDate,
        "Image URL": imageUrl,
        Categories,
        Status,
        "Author Email": authorEmail,
        "Author First Name": firstName,
        "Author Last Name": lastName,
        Slug,
        "Post Type": postType
      } = record;

      // ONLY import articles (post)
      if (postType !== "post") continue;
      if (!Title || !Content) continue;

      // 1. Get or Create Author
      const authorName = `${firstName} ${lastName}`.trim() || "Admin WordPress";
      let author = await prisma.author.findUnique({ where: { email: authorEmail || "admin@kita-sehat.id" } });
      if (!author) {
        author = await prisma.author.create({
          data: {
            name: authorName,
            slug: slugify(authorName) || uuidv4().substring(0, 8),
            email: authorEmail || `author-${uuidv4().substring(0, 5)}@kita-sehat.id`,
            passwordHash: "$2b$10$fallback_hash",
            role: "Health Writer",
            isActive: true
          }
        });
      }

      // 2. Get or Create Category
      const catName = Categories.split("|")[0] || Categories.split(",")[0] || "Uncategorized";
      const catSlug = slugify(catName);
      let category = await prisma.category.findFirst({ where: { name: catName } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: catName,
            slug: catSlug || uuidv4().substring(0, 8)
          }
        });
      }

      // 3. Handle Featured Image
      let coverImage = null;
      if (imageUrl) {
        const firstUrl = imageUrl.split("|")[0].trim();
        coverImage = await downloadImage(firstUrl);
      }

      // 4. Create Article (Always PUBLISHED as requested)
      const articleSlug = Slug || slugify(Title);

      await prisma.article.upsert({
        where: { slug: articleSlug },
        update: {
          status: ArticleStatus.PUBLISHED
        },
        create: {
          title: Title,
          slug: articleSlug,
          content: Content,
          excerpt: Excerpt || Title.substring(0, 160),
          coverImage: coverImage,
          status: ArticleStatus.PUBLISHED,
          viewCount: 0,
          authorId: author.id,
          categoryId: category.id,
          publishedAt: new Date(postDate),
          createdAt: new Date(postDate),
        }
      });

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`✅ Processed ${successCount} articles...`);
      }
    } catch (err: any) {
      console.error(`❌ Error migrating row ${count}:`);
      console.error(err.message || err);
    }
  }

  console.log(`\n🎉 Migration finished!`);
  console.log(`Total: ${count}, Success: ${successCount}`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
