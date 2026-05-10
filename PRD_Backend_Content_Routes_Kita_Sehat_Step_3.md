# PRD — Kita-Sehat.id NG Step 3: Backend, Prisma ORM, PostgreSQL & Content Routes

**Project:** Kita-Sehat.id NG  
**Step:** Step 3 — Backend Development & Content Routing  
**Output Target:** Google Antigravity ready  
**Frontend Stack:** Next.js, TypeScript, Tailwind CSS  
**Backend Stack:** Next.js API Routes / Node.js, Prisma ORM, PostgreSQL  
**Brand:** Kita-Sehat.id — Informasi Kesehatan Keluarga  
**Tagline:** `#HidupSehatMulaiSekarang`

---

## 1. Executive Summary

Kita-Sehat.id NG adalah pengembangan ulang platform informasi kesehatan dari website lama berbasis WordPress + Elementor menjadi platform news kesehatan modern berbasis Next.js, Node.js, Prisma, dan PostgreSQL.

Pada Step 3 ini, pengembangan akan langsung difokuskan pada backend dan persiapan route data untuk semua konten public website. Step 2 admin panel akan dilewati sementara, tetapi struktur backend tetap harus disiapkan agar admin panel bisa dibangun dengan mudah pada tahap berikutnya.

Backend harus mampu menyediakan data untuk:

- Homepage public site
- Slider hero
- Artikel terbaru
- Artikel populer
- Artikel pilihan editor
- Artikel per kategori
- Detail artikel
- Search artikel
- Banner iklan
- Halaman statis
- Newsletter subscriber
- Site setting

---

## 2. Objective Step 3

Tujuan utama Step 3 adalah membangun fondasi backend yang scalable, clean, dan siap dihubungkan ke UI public site Kita-Sehat.id.

### Target utama:

1. Setup Prisma ORM.
2. Setup koneksi PostgreSQL.
3. Membuat schema database untuk portal berita kesehatan.
4. Membuat route API untuk seluruh konten public website.
5. Membuat seed data sekitar 20 artikel sample.
6. Membuat struktur backend yang siap untuk admin panel di tahap berikutnya.
7. Menyiapkan standard API response.
8. Menyiapkan pagination, search, filter, dan relation data.
9. Menyiapkan data banner iklan untuk header dan area tengah website.
10. Menyiapkan data SEO untuk artikel dan halaman.

---

## 3. Important Security Note

Database URL yang diberikan oleh owner harus hanya disimpan di file `.env` lokal/server.

**Jangan commit `.env` ke Git repository.**

Gunakan format berikut di `.env`:

```env
DATABASE_URL="<PASTE_DATABASE_URL_POSTGRESQL_DARI_OWNER_DI_SINI>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Gunakan `.env.example` seperti ini:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4. Scope

### 4.1 In Scope

Step ini mencakup:

- Instalasi Prisma dan Prisma Client.
- Schema Prisma.
- Koneksi PostgreSQL.
- Database seed.
- API route public.
- Standard response helper.
- Pagination helper.
- Basic validation.
- Data relation antara article, category, tag, author, banner, dan page.
- Route untuk public content.
- Persiapan integrasi ke public site demo.

### 4.2 Out of Scope

Step ini belum mencakup:

- Admin panel UI.
- Login admin.
- Role permission.
- Rich text editor.
- Upload image ke object storage.
- Media library advanced.
- Comment system.
- AI article generator.
- Editorial workflow approval.

Namun schema dibuat agar kebutuhan tersebut tetap mudah dikembangkan pada step berikutnya.

---

## 5. Content Categories

Kategorisasi Kita-Sehat.id:

| Category | Slug | Description |
|---|---|---|
| Umum | umum | Informasi kesehatan umum untuk keluarga Indonesia |
| Nutrisi | nutrisi | Pola makan, gizi, makanan sehat, dan nutrisi keluarga |
| Keluarga | keluarga | Kesehatan anak, orang tua, dan kebiasaan sehat keluarga |
| Pria dan Wanita | pria-dan-wanita | Informasi kesehatan pria dan wanita dewasa |
| Jiwa | jiwa | Kesehatan mental, stres, tidur, emosi, dan keseimbangan hidup |
| Kesehatan & Karir | kesehatan-karir | Kesehatan pekerja, produktivitas, burnout, dan gaya hidup kantor |

---

## 6. Recommended Project Structure

```txt
kitasehat-ng/
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts
│   │   ├── home/
│   │   │   └── route.ts
│   │   ├── articles/
│   │   │   ├── route.ts
│   │   │   ├── latest/
│   │   │   │   └── route.ts
│   │   │   ├── popular/
│   │   │   │   └── route.ts
│   │   │   ├── featured/
│   │   │   │   └── route.ts
│   │   │   └── [slug]/
│   │   │       └── route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   │       └── route.ts
│   │   ├── search/
│   │   │   └── route.ts
│   │   ├── banners/
│   │   │   └── route.ts
│   │   ├── pages/
│   │   │   └── [slug]/
│   │   │       └── route.ts
│   │   ├── settings/
│   │   │   └── route.ts
│   │   └── newsletter/
│   │       └── route.ts
│   ├── berita/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── kategori/
│   │   └── [slug]/
│   │       └── page.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   ├── api-response.ts
│   ├── pagination.ts
│   ├── slug.ts
│   └── validators.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env
├── .env.example
└── package.json
```

---

## 7. Dependency Installation

```bash
npm install @prisma/client zod slugify date-fns
npm install -D prisma tsx
npx prisma init
```

Tambahkan script ke `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 8. Database Model Overview

### Main Entities

1. Author
2. Category
3. Article
4. Tag
5. ArticleTag
6. MediaAsset
7. AdvertisementBanner
8. StaticPage
9. SiteSetting
10. NewsletterSubscriber

### ERD Concept

```txt
Author 1 ──── * Article
Category 1 ──── * Article
Article * ──── * Tag
Article 1 ──── * MediaAsset
AdvertisementBanner
StaticPage
SiteSetting
NewsletterSubscriber
```

---

## 9. Prisma Schema

Create file:

```txt
/prisma/schema.prisma
```

Use this schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum BannerPlacement {
  HEADER_TOP
  BELOW_HERO
  SIDEBAR
  ARTICLE_MIDDLE
  ARTICLE_BOTTOM
  MOBILE_STICKY
}

model Author {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  email     String?   @unique
  avatarUrl String?
  bio       String?
  role      String    @default("Health Writer")
  articles  Article[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("authors")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  color       String?
  order       Int       @default(0)
  isActive    Boolean   @default(true)
  articles    Article[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("categories")
}

model Article {
  id             String        @id @default(cuid())
  title          String
  slug           String        @unique
  excerpt        String
  content        String
  coverImage     String?
  coverImageAlt  String?
  status         ArticleStatus @default(DRAFT)
  readingTime    Int           @default(3)
  isFeatured     Boolean       @default(false)
  isHero         Boolean       @default(false)
  isPopular      Boolean       @default(false)
  viewCount      Int           @default(0)
  publishedAt    DateTime?
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  categoryId     String
  authorId       String

  category       Category      @relation(fields: [categoryId], references: [id])
  author         Author        @relation(fields: [authorId], references: [id])
  tags           ArticleTag[]
  mediaAssets    MediaAsset[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@index([categoryId])
  @@index([authorId])
  @@index([isFeatured])
  @@index([isHero])
  @@index([isPopular])
  @@map("articles")
}

model Tag {
  id        String       @id @default(cuid())
  name      String
  slug      String       @unique
  articles  ArticleTag[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@map("tags")
}

model ArticleTag {
  articleId String
  tagId     String

  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
  @@map("article_tags")
}

model MediaAsset {
  id         String   @id @default(cuid())
  articleId  String?
  article    Article? @relation(fields: [articleId], references: [id], onDelete: SetNull)
  url        String
  altText    String?
  caption    String?
  type       String   @default("image")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("media_assets")
}

model AdvertisementBanner {
  id          String          @id @default(cuid())
  name        String
  placement   BannerPlacement
  imageUrl    String
  targetUrl   String?
  title       String?
  description String?
  isActive    Boolean         @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([placement])
  @@index([isActive])
  @@map("advertisement_banners")
}

model StaticPage {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  content        String
  seoTitle       String?
  seoDescription String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("static_pages")
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  group     String   @default("general")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("site_settings")
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  source    String   @default("public_site")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("newsletter_subscribers")
}
```

---

## 10. Library Helper

### 10.1 Prisma Singleton

Create file:

```txt
/lib/prisma.ts
```

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 10.2 API Response Helper

Create file:

```txt
/lib/api-response.ts
```

```ts
import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message = "Success",
  meta?: Record<string, unknown>
) {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta: meta ?? null,
  });
}

export function errorResponse(
  message = "Internal Server Error",
  status = 500,
  details?: unknown
) {
  const isProduction = process.env.NODE_ENV === "production";

  return NextResponse.json(
    {
      success: false,
      message,
      details: isProduction ? null : details ?? null,
    },
    { status }
  );
}
```

### 10.3 Pagination Helper

Create file:

```txt
/lib/pagination.ts
```

```ts
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 50);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
}
```

### 10.4 Slug Helper

Create file:

```txt
/lib/slug.ts
```

```ts
import slugify from "slugify";

export function createSlug(text: string) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "id",
  });
}
```

### 10.5 Validators

Create file:

```txt
/lib/validators.ts
```

```ts
import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
});
```

---

## 11. Public API Routes

### 11.1 GET `/api/health`

Purpose:

- Mengecek apakah API dan database berjalan.

Response:

```json
{
  "success": true,
  "message": "Kita-Sehat API is healthy",
  "data": {
    "service": "kita-sehat-ng",
    "database": "connected"
  },
  "meta": null
}
```

Implementation:

```ts
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return successResponse(
      {
        service: "kita-sehat-ng",
        database: "connected",
      },
      "Kita-Sehat API is healthy"
    );
  } catch (error) {
    return errorResponse("Database connection failed", 500, error);
  }
}
```

---

### 11.2 GET `/api/home`

Purpose:

Mengambil semua data homepage dalam satu request.

Data yang dikembalikan:

- Hero articles
- Featured articles
- Latest articles
- Popular articles
- Categories
- Header top banner
- Below hero banner

Business rule:

- Hero: `isHero = true`
- Featured: `isFeatured = true`
- Popular: order by `viewCount desc`
- Latest: order by `publishedAt desc`
- Semua artikel harus `PUBLISHED`

Implementation:

```ts
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ArticleStatus, BannerPlacement } from "@prisma/client";

export async function GET() {
  try {
    const [
      heroArticles,
      featuredArticles,
      latestArticles,
      popularArticles,
      categories,
      headerTopBanners,
      belowHeroBanners,
    ] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isHero: true },
        take: 5,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isFeatured: true },
        take: 8,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 10,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 8,
        orderBy: { viewCount: "desc" },
        include: { category: true, author: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.advertisementBanner.findMany({
        where: { isActive: true, placement: BannerPlacement.HEADER_TOP },
      }),
      prisma.advertisementBanner.findMany({
        where: { isActive: true, placement: BannerPlacement.BELOW_HERO },
      }),
    ]);

    return successResponse({
      heroArticles,
      featuredArticles,
      latestArticles,
      popularArticles,
      categories,
      banners: {
        headerTop: headerTopBanners,
        belowHero: belowHeroBanners,
      },
    });
  } catch (error) {
    return errorResponse("Failed to retrieve homepage data", 500, error);
  }
}
```

---

### 11.3 GET `/api/articles`

Purpose:

Mengambil list artikel dengan pagination, filter kategori, dan sort.

Query params:

```txt
?page=1&limit=10&category=nutrisi&sort=latest
```

Sort options:

- latest
- popular
- featured

Implementation:

```ts
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { buildPaginationMeta, getPagination } from "@/lib/pagination";
import { ArticleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take } = getPagination(searchParams);

    const category = searchParams.get("category");
    const sort = searchParams.get("sort") ?? "latest";

    const where = {
      status: ArticleStatus.PUBLISHED,
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    };

    const orderBy =
      sort === "popular"
        ? { viewCount: "desc" as const }
        : sort === "featured"
          ? { isFeatured: "desc" as const }
          : { publishedAt: "desc" as const };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return successResponse(
      articles,
      "Articles retrieved successfully",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Failed to retrieve articles", 500, error);
  }
}
```

---

### 11.4 GET `/api/articles/[slug]`

Purpose:

Mengambil detail artikel.

Business rule:

- Hanya ambil artikel `PUBLISHED`.
- Include author, category, tags, media assets.
- Increment `viewCount`.
- Return related articles dari kategori yang sama.

Implementation:

```ts
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ArticleStatus } from "@prisma/client";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;

    const article = await prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
      },
      include: {
        category: true,
        author: true,
        mediaAssets: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return errorResponse("Article not found", 404);
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    const relatedArticles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        categoryId: article.categoryId,
        id: {
          not: article.id,
        },
      },
      take: 4,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: true,
        author: true,
      },
    });

    return successResponse({
      article,
      relatedArticles,
    });
  } catch (error) {
    return errorResponse("Failed to retrieve article detail", 500, error);
  }
}
```

---

### 11.5 GET `/api/articles/latest`

Purpose:

Mengambil artikel terbaru.

Query:

```txt
?limit=8
```

Business rule:

- Default limit: 8
- Max limit: 20
- Order by `publishedAt desc`

---

### 11.6 GET `/api/articles/popular`

Purpose:

Mengambil artikel populer.

Business rule:

- Default limit: 8
- Order by `viewCount desc`
- Artikel harus `PUBLISHED`

---

### 11.7 GET `/api/articles/featured`

Purpose:

Mengambil artikel pilihan editor.

Business rule:

- `isFeatured = true`
- Artikel harus `PUBLISHED`
- Order by `publishedAt desc`

---

### 11.8 GET `/api/categories`

Purpose:

Mengambil daftar kategori aktif.

Business rule:

- `isActive = true`
- Order by `order asc`

---

### 11.9 GET `/api/categories/[slug]`

Purpose:

Mengambil detail kategori dan artikel di kategori tersebut.

Query:

```txt
?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "message": "Category articles retrieved successfully",
  "data": {
    "category": {},
    "articles": []
  },
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 11.10 GET `/api/search`

Purpose:

Search artikel berdasarkan keyword.

Query:

```txt
?q=imunitas&page=1&limit=10
```

Search target:

- title
- excerpt
- content
- seoKeywords

Validation:

- Jika `q` kosong, return 400.

---

### 11.11 GET `/api/banners`

Purpose:

Mengambil banner iklan.

Query:

```txt
?placement=HEADER_TOP
```

Business rule:

- Jika placement kosong, return semua banner aktif.
- Jika placement ada, return banner sesuai placement.
- Hanya `isActive = true`.
- Jika startDate dan endDate tersedia, filter berdasarkan tanggal saat ini.

Placement:

- HEADER_TOP
- BELOW_HERO
- SIDEBAR
- ARTICLE_MIDDLE
- ARTICLE_BOTTOM
- MOBILE_STICKY

---

### 11.12 GET `/api/pages/[slug]`

Purpose:

Mengambil halaman statis.

Contoh route:

- `/api/pages/tentang-kami`
- `/api/pages/kebijakan-privasi`
- `/api/pages/disclaimer-medis`
- `/api/pages/kontak`
- `/api/pages/pedoman-konten`

---

### 11.13 GET `/api/settings`

Purpose:

Mengambil basic site settings.

Data:

- site name
- tagline
- campaign tagline
- brand colors
- meta description
- contact email

---

### 11.14 POST `/api/newsletter`

Purpose:

Menyimpan newsletter subscriber.

Payload:

```json
{
  "email": "reader@example.com",
  "name": "Nama Pembaca"
}
```

Business rule:

- Email wajib valid.
- Jika email sudah ada, return message ramah bahwa email sudah terdaftar.
- Jangan membuat duplicate email.

---

## 12. Public Route Mapping

| Public Page | API Source |
|---|---|
| `/` | `/api/home` |
| `/berita` | `/api/articles` |
| `/berita/[slug]` | `/api/articles/[slug]` |
| `/kategori/[slug]` | `/api/categories/[slug]` |
| `/search?q=keyword` | `/api/search?q=keyword` |
| `/tentang-kami` | `/api/pages/tentang-kami` |
| `/kebijakan-privasi` | `/api/pages/kebijakan-privasi` |
| `/disclaimer-medis` | `/api/pages/disclaimer-medis` |
| `/kontak` | `/api/pages/kontak` |

---

## 13. Seed Data Requirement

Seed data harus membuat:

- 6 categories
- 3 authors
- 12 tags
- 20 articles
- 6 advertisement banners
- 5 static pages
- 8 site settings
- 3 newsletter subscribers

### 13.1 Authors

1. Redaksi Kita Sehat
2. dr. Ananda Putri
3. Tim Gaya Hidup Sehat

### 13.2 Tags

1. imunitas
2. anak
3. keluarga
4. nutrisi
5. mental-health
6. olahraga
7. tidur
8. karir
9. wanita
10. pria
11. pencegahan
12. gaya-hidup

### 13.3 Article Samples

| No | Title | Category | Flag |
|---|---|---|---|
| 1 | 7 Kebiasaan Sederhana untuk Memulai Hidup Sehat dari Rumah | Umum | Hero, Featured, Popular |
| 2 | Cara Menjaga Imunitas Keluarga di Tengah Aktivitas Padat | Keluarga | Hero, Popular |
| 3 | Panduan Nutrisi Seimbang untuk Anak Usia Sekolah | Nutrisi | Hero, Featured |
| 4 | Mengenal Pentingnya Tidur Berkualitas untuk Kesehatan Jiwa | Jiwa | Featured |
| 5 | Tips Tetap Bugar untuk Pekerja Kantoran | Kesehatan & Karir | Popular |
| 6 | Makanan Tinggi Serat yang Baik untuk Pencernaan | Nutrisi | Featured |
| 7 | Kapan Harus Memeriksakan Diri ke Dokter Saat Demam? | Umum | Popular |
| 8 | Peran Ayah dan Ibu dalam Membentuk Kebiasaan Sehat Anak | Keluarga | Featured |
| 9 | Kesehatan Pria: Tanda Tubuh Butuh Istirahat | Pria dan Wanita | Popular |
| 10 | Kesehatan Wanita: Menjaga Energi di Tengah Rutinitas Harian | Pria dan Wanita | Featured |
| 11 | Cara Mengelola Stres Ringan Tanpa Panik | Jiwa | Popular |
| 12 | Minum Air Putih: Kebutuhan Sederhana yang Sering Dilupakan | Umum | Normal |
| 13 | Bekal Sehat Anak: Praktis, Bergizi, dan Disukai | Nutrisi | Normal |
| 14 | Olahraga Ringan Bersama Keluarga di Akhir Pekan | Keluarga | Normal |
| 15 | Bahaya Duduk Terlalu Lama bagi Pekerja Digital | Kesehatan & Karir | Popular |
| 16 | Mengenal Burnout dan Cara Mencegahnya | Jiwa | Featured |
| 17 | Checklist Kesehatan Dasar untuk Pria Dewasa | Pria dan Wanita | Normal |
| 18 | Checklist Kesehatan Dasar untuk Wanita Dewasa | Pria dan Wanita | Normal |
| 19 | Cara Membaca Label Gizi pada Kemasan Makanan | Nutrisi | Normal |
| 20 | Langkah Kecil Membangun Keluarga Lebih Sehat | Keluarga | Featured |

---

## 14. Seed File

Create file:

```txt
/prisma/seed.ts
```

Use this implementation:

```ts
import { PrismaClient, ArticleStatus, BannerPlacement } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function createSlug(text: string) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "id",
  });
}

function articleContent(title: string, category: string) {
  return `
    <p>${title} adalah salah satu topik penting dalam menjaga kualitas hidup keluarga Indonesia.</p>
    <p>Informasi kesehatan yang mudah dipahami membantu pembaca mengambil keputusan yang lebih baik dalam kehidupan sehari-hari.</p>
    <h2>Mengapa topik ini penting?</h2>
    <p>Dalam kategori ${category}, pembaca membutuhkan panduan yang praktis, terpercaya, dan dapat diterapkan tanpa harus merasa terbebani.</p>
    <h2>Langkah sederhana yang bisa dilakukan</h2>
    <ul>
      <li>Mulai dari kebiasaan kecil yang konsisten.</li>
      <li>Perhatikan pola makan, waktu istirahat, dan aktivitas fisik.</li>
      <li>Konsultasikan dengan tenaga kesehatan bila gejala berlanjut.</li>
    </ul>
    <p><strong>Disclaimer:</strong> Artikel ini bersifat informasi umum dan tidak menggantikan konsultasi langsung dengan dokter atau tenaga kesehatan profesional.</p>
  `;
}

async function main() {
  console.log("Start seeding Kita-Sehat.id NG...");

  await prisma.articleTag.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.advertisementBanner.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();

  const categoriesData = [
    { name: "Umum", slug: "umum", description: "Informasi kesehatan umum untuk keluarga Indonesia.", color: "#0098b0", order: 1 },
    { name: "Nutrisi", slug: "nutrisi", description: "Panduan nutrisi, makanan sehat, dan pola makan seimbang.", color: "#2596be", order: 2 },
    { name: "Keluarga", slug: "keluarga", description: "Tips kesehatan untuk anak, orang tua, dan keluarga.", color: "#103174", order: 3 },
    { name: "Pria dan Wanita", slug: "pria-dan-wanita", description: "Informasi kesehatan pria dan wanita dewasa.", color: "#0098b0", order: 4 },
    { name: "Jiwa", slug: "jiwa", description: "Kesehatan mental, emosi, stres, dan keseimbangan hidup.", color: "#2596be", order: 5 },
    { name: "Kesehatan & Karir", slug: "kesehatan-karir", description: "Kesehatan pekerja, produktivitas, dan gaya hidup profesional.", color: "#103174", order: 6 },
  ];

  const categories = await Promise.all(
    categoriesData.map((category) => prisma.category.create({ data: category }))
  );

  const categoryMap = Object.fromEntries(categories.map((category) => [category.name, category]));

  const authorsData = [
    {
      name: "Redaksi Kita Sehat",
      slug: "redaksi-kita-sehat",
      email: "redaksi@kita-sehat.id",
      role: "Editorial Team",
      bio: "Tim redaksi Kita-Sehat.id yang menyajikan informasi kesehatan keluarga secara ringan dan terpercaya.",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "dr. Ananda Putri",
      slug: "dr-ananda-putri",
      email: "ananda.putri@kita-sehat.id",
      role: "Medical Contributor",
      bio: "Kontributor medis yang fokus pada edukasi kesehatan keluarga, nutrisi, dan pencegahan penyakit.",
      avatarUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "Tim Gaya Hidup Sehat",
      slug: "tim-gaya-hidup-sehat",
      email: "lifestyle@kita-sehat.id",
      role: "Lifestyle Writer",
      bio: "Tim penulis gaya hidup sehat yang membahas kebiasaan, aktivitas, dan pola hidup keluarga modern.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const authors = await Promise.all(
    authorsData.map((author) => prisma.author.create({ data: author }))
  );

  const tagNames = [
    "imunitas",
    "anak",
    "keluarga",
    "nutrisi",
    "mental-health",
    "olahraga",
    "tidur",
    "karir",
    "wanita",
    "pria",
    "pencegahan",
    "gaya-hidup",
  ];

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: {
          name,
          slug: createSlug(name),
        },
      })
    )
  );

  const tagMap = Object.fromEntries(tags.map((tag) => [tag.name, tag]));

  const articlesData = [
    { title: "7 Kebiasaan Sederhana untuk Memulai Hidup Sehat dari Rumah", category: "Umum", hero: true, featured: true, popular: true, tags: ["gaya-hidup", "pencegahan"] },
    { title: "Cara Menjaga Imunitas Keluarga di Tengah Aktivitas Padat", category: "Keluarga", hero: true, featured: false, popular: true, tags: ["imunitas", "keluarga"] },
    { title: "Panduan Nutrisi Seimbang untuk Anak Usia Sekolah", category: "Nutrisi", hero: true, featured: true, popular: false, tags: ["nutrisi", "anak"] },
    { title: "Mengenal Pentingnya Tidur Berkualitas untuk Kesehatan Jiwa", category: "Jiwa", hero: false, featured: true, popular: false, tags: ["tidur", "mental-health"] },
    { title: "Tips Tetap Bugar untuk Pekerja Kantoran", category: "Kesehatan & Karir", hero: false, featured: false, popular: true, tags: ["karir", "olahraga"] },
    { title: "Makanan Tinggi Serat yang Baik untuk Pencernaan", category: "Nutrisi", hero: false, featured: true, popular: false, tags: ["nutrisi", "pencegahan"] },
    { title: "Kapan Harus Memeriksakan Diri ke Dokter Saat Demam?", category: "Umum", hero: false, featured: false, popular: true, tags: ["pencegahan", "keluarga"] },
    { title: "Peran Ayah dan Ibu dalam Membentuk Kebiasaan Sehat Anak", category: "Keluarga", hero: false, featured: true, popular: false, tags: ["anak", "keluarga"] },
    { title: "Kesehatan Pria: Tanda Tubuh Butuh Istirahat", category: "Pria dan Wanita", hero: false, featured: false, popular: true, tags: ["pria", "tidur"] },
    { title: "Kesehatan Wanita: Menjaga Energi di Tengah Rutinitas Harian", category: "Pria dan Wanita", hero: false, featured: true, popular: false, tags: ["wanita", "gaya-hidup"] },
    { title: "Cara Mengelola Stres Ringan Tanpa Panik", category: "Jiwa", hero: false, featured: false, popular: true, tags: ["mental-health", "gaya-hidup"] },
    { title: "Minum Air Putih: Kebutuhan Sederhana yang Sering Dilupakan", category: "Umum", hero: false, featured: false, popular: false, tags: ["gaya-hidup", "pencegahan"] },
    { title: "Bekal Sehat Anak: Praktis, Bergizi, dan Disukai", category: "Nutrisi", hero: false, featured: false, popular: false, tags: ["anak", "nutrisi"] },
    { title: "Olahraga Ringan Bersama Keluarga di Akhir Pekan", category: "Keluarga", hero: false, featured: false, popular: false, tags: ["keluarga", "olahraga"] },
    { title: "Bahaya Duduk Terlalu Lama bagi Pekerja Digital", category: "Kesehatan & Karir", hero: false, featured: false, popular: true, tags: ["karir", "pencegahan"] },
    { title: "Mengenal Burnout dan Cara Mencegahnya", category: "Jiwa", hero: false, featured: true, popular: false, tags: ["mental-health", "karir"] },
    { title: "Checklist Kesehatan Dasar untuk Pria Dewasa", category: "Pria dan Wanita", hero: false, featured: false, popular: false, tags: ["pria", "pencegahan"] },
    { title: "Checklist Kesehatan Dasar untuk Wanita Dewasa", category: "Pria dan Wanita", hero: false, featured: false, popular: false, tags: ["wanita", "pencegahan"] },
    { title: "Cara Membaca Label Gizi pada Kemasan Makanan", category: "Nutrisi", hero: false, featured: false, popular: false, tags: ["nutrisi", "gaya-hidup"] },
    { title: "Langkah Kecil Membangun Keluarga Lebih Sehat", category: "Keluarga", hero: false, featured: true, popular: false, tags: ["keluarga", "gaya-hidup"] },
  ];

  const coverImages = [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
  ];

  for (let index = 0; index < articlesData.length; index++) {
    const item = articlesData[index];
    const category = categoryMap[item.category];
    const author = authors[index % authors.length];

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - index);

    const article = await prisma.article.create({
      data: {
        title: item.title,
        slug: createSlug(item.title),
        excerpt: `Ringkasan singkat tentang ${item.title.toLowerCase()} untuk membantu pembaca memahami langkah sehat yang praktis.`,
        content: articleContent(item.title, item.category),
        coverImage: coverImages[index % coverImages.length],
        coverImageAlt: item.title,
        status: ArticleStatus.PUBLISHED,
        readingTime: 3 + (index % 5),
        isFeatured: item.featured,
        isHero: item.hero,
        isPopular: item.popular,
        viewCount: 150 + index * 37,
        publishedAt,
        seoTitle: `${item.title} | Kita-Sehat.id`,
        seoDescription: `Baca panduan ${item.title.toLowerCase()} di Kita-Sehat.id. Informasi kesehatan keluarga terpercaya dan mudah dipahami.`,
        seoKeywords: item.tags.join(", "),
        categoryId: category.id,
        authorId: author.id,
      },
    });

    for (const tagName of item.tags) {
      await prisma.articleTag.create({
        data: {
          articleId: article.id,
          tagId: tagMap[tagName].id,
        },
      });
    }

    await prisma.mediaAsset.create({
      data: {
        articleId: article.id,
        url: coverImages[index % coverImages.length],
        altText: item.title,
        caption: `Ilustrasi artikel ${item.title}`,
        type: "image",
      },
    });
  }

  await prisma.advertisementBanner.createMany({
    data: [
      {
        name: "Header Top Banner - Health Campaign",
        placement: BannerPlacement.HEADER_TOP,
        imageUrl: "https://placehold.co/970x90/0098b0/ffffff?text=Banner+Iklan+Header+Kita-Sehat.id",
        targetUrl: "https://kita-sehat.id",
        title: "Banner Iklan Header",
        description: "Slot iklan utama di bagian atas website.",
        isActive: true,
      },
      {
        name: "Below Hero Banner - Family Health",
        placement: BannerPlacement.BELOW_HERO,
        imageUrl: "https://placehold.co/1200x180/103174/ffffff?text=Banner+Iklan+Tengah+Kita-Sehat.id",
        targetUrl: "https://kita-sehat.id",
        title: "Banner Iklan Tengah",
        description: "Slot iklan di bawah hero slider.",
        isActive: true,
      },
      {
        name: "Sidebar Banner - Nutrition",
        placement: BannerPlacement.SIDEBAR,
        imageUrl: "https://placehold.co/300x600/2596be/ffffff?text=Sidebar+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Sidebar Ads",
        description: "Slot iklan sidebar desktop.",
        isActive: true,
      },
      {
        name: "Article Middle Banner",
        placement: BannerPlacement.ARTICLE_MIDDLE,
        imageUrl: "https://placehold.co/728x90/0098b0/ffffff?text=Article+Middle+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Article Middle Ads",
        description: "Slot iklan tengah artikel.",
        isActive: true,
      },
      {
        name: "Article Bottom Banner",
        placement: BannerPlacement.ARTICLE_BOTTOM,
        imageUrl: "https://placehold.co/728x90/103174/ffffff?text=Article+Bottom+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Article Bottom Ads",
        description: "Slot iklan bawah artikel.",
        isActive: true,
      },
      {
        name: "Mobile Sticky Banner",
        placement: BannerPlacement.MOBILE_STICKY,
        imageUrl: "https://placehold.co/360x80/2596be/ffffff?text=Mobile+Sticky+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Mobile Sticky Ads",
        description: "Slot iklan sticky mobile.",
        isActive: true,
      },
    ],
  });

  await prisma.staticPage.createMany({
    data: [
      {
        title: "Tentang Kami",
        slug: "tentang-kami",
        content: "<p>Kita-Sehat.id adalah platform informasi kesehatan keluarga yang menyajikan artikel terpercaya, tips kesehatan, dan panduan gaya hidup sehat.</p>",
        seoTitle: "Tentang Kami | Kita-Sehat.id",
        seoDescription: "Tentang platform informasi kesehatan keluarga Kita-Sehat.id.",
      },
      {
        title: "Kebijakan Privasi",
        slug: "kebijakan-privasi",
        content: "<p>Kami menghargai privasi pembaca dan berkomitmen menjaga data yang diberikan melalui website ini.</p>",
        seoTitle: "Kebijakan Privasi | Kita-Sehat.id",
        seoDescription: "Kebijakan privasi website Kita-Sehat.id.",
      },
      {
        title: "Disclaimer Medis",
        slug: "disclaimer-medis",
        content: "<p>Seluruh informasi di Kita-Sehat.id bersifat edukatif dan tidak menggantikan konsultasi langsung dengan dokter.</p>",
        seoTitle: "Disclaimer Medis | Kita-Sehat.id",
        seoDescription: "Disclaimer medis untuk seluruh konten kesehatan Kita-Sehat.id.",
      },
      {
        title: "Kontak",
        slug: "kontak",
        content: "<p>Hubungi redaksi Kita-Sehat.id melalui email resmi untuk kerja sama, koreksi, atau pertanyaan.</p>",
        seoTitle: "Kontak | Kita-Sehat.id",
        seoDescription: "Kontak resmi Kita-Sehat.id.",
      },
      {
        title: "Pedoman Konten",
        slug: "pedoman-konten",
        content: "<p>Konten Kita-Sehat.id disusun dengan prinsip mudah dipahami, bertanggung jawab, dan mengutamakan kepentingan pembaca.</p>",
        seoTitle: "Pedoman Konten | Kita-Sehat.id",
        seoDescription: "Pedoman konten editorial Kita-Sehat.id.",
      },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "site_name", value: "Kita-Sehat.id", group: "general" },
      { key: "tagline", value: "Informasi Kesehatan Keluarga", group: "general" },
      { key: "campaign_tagline", value: "#HidupSehatMulaiSekarang", group: "general" },
      { key: "primary_color", value: "#0098b0", group: "brand" },
      { key: "secondary_color", value: "#103174", group: "brand" },
      { key: "accent_color", value: "#2596be", group: "brand" },
      { key: "meta_description", value: "Platform informasi kesehatan keluarga, tips kesehatan, dan panduan gaya hidup sehat.", group: "seo" },
      { key: "contact_email", value: "redaksi@kita-sehat.id", group: "contact" },
    ],
  });

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "pembaca1@example.com", name: "Pembaca Satu", source: "seed" },
      { email: "pembaca2@example.com", name: "Pembaca Dua", source: "seed" },
      { email: "pembaca3@example.com", name: "Pembaca Tiga", source: "seed" },
    ],
  });

  console.log("Seeding completed.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 15. API Implementation Checklist

Google Antigravity harus membuat file route berikut:

```txt
app/api/health/route.ts
app/api/home/route.ts
app/api/articles/route.ts
app/api/articles/[slug]/route.ts
app/api/articles/latest/route.ts
app/api/articles/popular/route.ts
app/api/articles/featured/route.ts
app/api/categories/route.ts
app/api/categories/[slug]/route.ts
app/api/search/route.ts
app/api/banners/route.ts
app/api/pages/[slug]/route.ts
app/api/settings/route.ts
app/api/newsletter/route.ts
```

---

## 16. API Response Standard

Semua response sukses harus menggunakan format:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": null
}
```

Semua response error harus menggunakan format:

```json
{
  "success": false,
  "message": "Error message",
  "details": null
}
```

---

## 17. Frontend Integration Notes

Setelah backend tersedia, public site Step 1 dapat mulai diganti dari dummy data ke API.

### Homepage

```ts
async function getHomeData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/home`, {
    next: {
      revalidate: 60,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch home data");
  }

  return res.json();
}
```

### Article Detail

```ts
async function getArticle(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/articles/${slug}`, {
    next: {
      revalidate: 60,
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
```

---

## 18. SEO Requirement

Setiap artikel wajib mendukung:

- `title`
- `excerpt`
- `seoTitle`
- `seoDescription`
- `seoKeywords`
- `coverImage`
- `publishedAt`
- `author`
- `category`

Mapping metadata:

| Metadata | Source |
|---|---|
| title | article.seoTitle fallback article.title |
| description | article.seoDescription fallback article.excerpt |
| keywords | article.seoKeywords |
| og:image | article.coverImage |
| author | article.author.name |
| published_time | article.publishedAt |
| section | article.category.name |

---

## 19. Performance Requirement

1. Semua article list wajib memakai pagination.
2. Limit maksimal pagination adalah 50.
3. Homepage route menggunakan `Promise.all`.
4. Gunakan index pada field:
   - slug
   - status
   - publishedAt
   - categoryId
   - isHero
   - isFeatured
   - isPopular
5. Article detail boleh return full content.
6. Article list sebaiknya tidak return content penuh jika ingin lebih optimal di tahap berikutnya.
7. Frontend fetch dapat menggunakan `revalidate`.

Recommended cache behavior:

| Route | Revalidate |
|---|---|
| `/api/home` | 60 seconds |
| `/api/articles` | 60 seconds |
| `/api/articles/[slug]` | 60 seconds |
| `/api/categories` | 300 seconds |
| `/api/banners` | 300 seconds |
| `/api/pages/[slug]` | 3600 seconds |

---

## 20. Security Requirement

1. `.env` tidak boleh masuk repository.
2. Jangan expose credential database di log public.
3. Error response production tidak boleh menampilkan stack trace.
4. Validasi query param.
5. Validasi email newsletter.
6. Pagination limit harus dibatasi.
7. Route public tidak boleh menerima mutation selain newsletter.
8. Untuk admin panel tahap berikutnya, siapkan JWT/Auth.js dan role-based access.

---

## 21. Database Command

### Generate Prisma Client

```bash
npx prisma generate
```

### Push Schema to DB

```bash
npx prisma db push
```

### Formal Migration

```bash
npx prisma migrate dev --name init_kitasehat_backend
```

### Seed Data

```bash
npm run db:seed
```

atau:

```bash
npx prisma db seed
```

### Prisma Studio

```bash
npx prisma studio
```

---

## 22. Testing Checklist

### 22.1 Database

- [ ] Prisma connected to PostgreSQL.
- [ ] Schema pushed/migrated successfully.
- [ ] Seed runs without error.
- [ ] 20 sample articles exist.
- [ ] 6 categories exist.
- [ ] 3 authors exist.
- [ ] Banners exist.
- [ ] Static pages exist.

### 22.2 API

- [ ] `GET /api/health` returns database connected.
- [ ] `GET /api/home` returns homepage data.
- [ ] `GET /api/articles` returns paginated data.
- [ ] `GET /api/articles?category=nutrisi` filters article by category.
- [ ] `GET /api/articles?sort=popular` sorts by view count.
- [ ] `GET /api/articles/[slug]` returns article detail.
- [ ] `GET /api/categories` returns active categories.
- [ ] `GET /api/categories/[slug]` returns category articles.
- [ ] `GET /api/search?q=imunitas` returns matching articles.
- [ ] `GET /api/banners?placement=HEADER_TOP` returns header banner.
- [ ] `GET /api/pages/tentang-kami` returns static page.
- [ ] `POST /api/newsletter` stores subscriber.
- [ ] Duplicate newsletter email handled gracefully.

---

## 23. Acceptance Criteria

Step 3 dianggap selesai jika:

1. Backend berhasil terkoneksi ke PostgreSQL.
2. Prisma schema tersedia dan berhasil di-push/migrate.
3. Seed data tersedia sekitar 20 artikel.
4. Route API public berjalan.
5. Homepage data sudah dapat ditarik dari `/api/home`.
6. Detail artikel sudah dapat ditarik dari `/api/articles/[slug]`.
7. Category page sudah dapat ditarik dari `/api/categories/[slug]`.
8. Search sudah bisa digunakan.
9. Banner iklan header dan bawah hero sudah tersedia dari database.
10. Static pages sudah tersedia.
11. Struktur code clean dan siap dikembangkan untuk admin panel.

---

## 24. Prompt Ready for Google Antigravity

Copy prompt berikut ke Google Antigravity:

```txt
You are an expert fullstack engineer. Continue Kita-Sehat.id NG project.

We are skipping Step 2 admin panel for now and moving directly to Step 3: Backend Development and Content Routing.

Build the backend foundation using Next.js App Router API Routes, TypeScript, Prisma ORM, and PostgreSQL.

Requirements:
1. Setup Prisma ORM and PostgreSQL connection.
2. Create schema.prisma exactly based on this PRD.
3. Create .env.example without exposing real credentials.
4. Create Prisma singleton at /lib/prisma.ts.
5. Create API response helper at /lib/api-response.ts.
6. Create pagination helper at /lib/pagination.ts.
7. Create slug helper at /lib/slug.ts.
8. Create validators at /lib/validators.ts.
9. Create seed file with:
   - 6 categories
   - 3 authors
   - 12 tags
   - 20 sample articles
   - 6 advertisement banners
   - 5 static pages
   - 8 site settings
   - 3 newsletter subscribers
10. Create public API routes:
   - GET /api/health
   - GET /api/home
   - GET /api/articles
   - GET /api/articles/[slug]
   - GET /api/articles/latest
   - GET /api/articles/popular
   - GET /api/articles/featured
   - GET /api/categories
   - GET /api/categories/[slug]
   - GET /api/search
   - GET /api/banners
   - GET /api/pages/[slug]
   - GET /api/settings
   - POST /api/newsletter
11. Every API response must use format:
   { success, message, data, meta }
12. Use pagination for article list and category article list.
13. Use include relation for category, author, tags where needed.
14. Do not expose sensitive database error in production.
15. Do not build admin panel UI in this step.
16. Make the backend scalable and ready for future admin panel.
17. Prepare public site integration for homepage, category page, article detail page, search page, and banner ads.
18. Use Kita-Sehat.id brand colors in settings:
   - #0098b0
   - #103174
   - #2596be
```

---

## 25. Future Development Recommendation

Setelah Step 3 selesai, jalur terbaik adalah:

1. Integrasikan public site Step 1 ke API Step 3.
2. Pastikan homepage, detail artikel, kategori, search, dan banner sudah real data.
3. Setelah public site stabil, lanjut Step 2 admin panel.
4. Admin panel harus dibuat powerful seperti WordPress, namun lebih clean dan ringan.
5. Tambahkan login, article CRUD, category management, media management, banner management, dan static page editor.

---

## 26. Final Development Direction

Backend Kita-Sehat.id NG harus menjadi fondasi health news platform yang:

- Cepat.
- SEO-ready.
- Clean secara arsitektur.
- Mudah dikembangkan.
- Siap mobile-first public site.
- Siap admin panel.
- Siap migrasi dari WordPress lama.
- Siap menjadi portal informasi kesehatan keluarga yang lebih profesional.
