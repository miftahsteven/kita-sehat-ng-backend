import { PrismaClient, ArticleStatus, BannerPlacement } from "@prisma/client";
import slugify from "slugify";
import bcrypt from "bcryptjs";

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

  // Cleanup existing data
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
  await prisma.auditLog.deleteMany();
  await prisma.adminUser.deleteMany();

  // Admin Users
  console.log("Seeding admin users...");
  const passwordHash = await bcrypt.hash("AdminKitaSehat123!", 10);
  await prisma.adminUser.create({
    data: {
      name: "Admin Kita Sehat",
      email: "admin@kita-sehat.id",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  // Categories
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

  // Authors
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
      bio: "Kontributor medis yang fokus pada edukasi kesehatan keluarga, nutrisi, and pencegahan penyakit.",
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

  // Tags
  const tagNames = [
    "imunitas", "anak", "keluarga", "nutrisi", "mental-health", "olahraga",
    "tidur", "karir", "wanita", "pria", "pencegahan", "gaya-hidup",
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

  // Articles
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

  // Banners
  await prisma.advertisementBanner.createMany({
    data: [
      {
        name: "Header Top Banner - Health Campaign",
        placement: BannerPlacement.HEADER_TOP,
        imageUrlDesktop: "https://placehold.co/970x90/0098b0/ffffff?text=Banner+Iklan+Header+Kita-Sehat.id",
        imageUrlMobile: "https://placehold.co/970x90/0098b0/ffffff?text=Banner+Iklan+Header+Kita-Sehat.id",
        targetUrl: "https://kita-sehat.id",
        title: "Banner Iklan Header",
        description: "Slot iklan utama di bagian atas website.",
        isActive: true,
      },
      {
        name: "Below Hero Banner - Family Health",
        placement: BannerPlacement.BELOW_HERO,
        imageUrlDesktop: "https://placehold.co/1200x180/103174/ffffff?text=Banner+Iklan+Tengah+Kita-Sehat.id",
        imageUrlMobile: "https://placehold.co/1200x180/103174/ffffff?text=Banner+Iklan+Tengah+Kita-Sehat.id",
        targetUrl: "https://kita-sehat.id",
        title: "Banner Iklan Tengah",
        description: "Slot iklan di bawah hero slider.",
        isActive: true,
      },
      {
        name: "Sidebar Banner - Nutrition",
        placement: BannerPlacement.SIDEBAR,
        imageUrlDesktop: "https://placehold.co/300x600/2596be/ffffff?text=Sidebar+Ads",
        imageUrlMobile: "https://placehold.co/300x600/2596be/ffffff?text=Sidebar+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Sidebar Ads",
        description: "Slot iklan sidebar desktop.",
        isActive: true,
      },
      {
        name: "Article Middle Banner",
        placement: BannerPlacement.ARTICLE_MIDDLE,
        imageUrlDesktop: "https://placehold.co/728x90/0098b0/ffffff?text=Article+Middle+Ads",
        imageUrlMobile: "https://placehold.co/728x90/0098b0/ffffff?text=Article+Middle+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Article Middle Ads",
        description: "Slot iklan tengah artikel.",
        isActive: true,
      },
      {
        name: "Article Bottom Banner",
        placement: BannerPlacement.ARTICLE_BOTTOM,
        imageUrlDesktop: "https://placehold.co/728x90/103174/ffffff?text=Article+Bottom+Ads",
        imageUrlMobile: "https://placehold.co/728x90/103174/ffffff?text=Article+Bottom+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Article Bottom Ads",
        description: "Slot iklan bawah artikel.",
        isActive: true,
      },
      {
        name: "Mobile Sticky Banner",
        placement: BannerPlacement.MOBILE_STICKY,
        imageUrlDesktop: "https://placehold.co/360x80/2596be/ffffff?text=Mobile+Sticky+Ads",
        imageUrlMobile: "https://placehold.co/360x80/2596be/ffffff?text=Mobile+Sticky+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Mobile Sticky Ads",
        description: "Slot iklan sticky mobile.",
        isActive: true,
      },
      {
        name: "Category Sub Topic Banner",
        placement: BannerPlacement.SUB_TOPIC,
        imageUrlDesktop: "https://placehold.co/1200x240/0098b0/ffffff?text=Sub+Topic+Banner",
        imageUrlMobile: "https://placehold.co/600x300/0098b0/ffffff?text=Sub+Topic+Banner",
        targetUrl: "https://kita-sehat.id",
        title: "Sub Topic Banner",
        description: "Banner bagian atas halaman sub topik/kategori.",
        isActive: true,
      },
      {
        name: "Category Mini Ads",
        placement: BannerPlacement.MINI_ADS,
        imageUrlDesktop: "https://placehold.co/400x240/103174/ffffff?text=Mini+Ads",
        imageUrlMobile: "https://placehold.co/400x240/103174/ffffff?text=Mini+Ads",
        targetUrl: "https://kita-sehat.id",
        title: "Mini Ads",
        description: "Slot mini ads di atas artikel populer kategori.",
        isActive: true,
      },
    ],
  });

  // Static Pages
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

  // Settings
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

  // Subscribers
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
