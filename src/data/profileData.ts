export interface WorkItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  details: string[];
  skills: string[];
  href: string;
  imageUrl: string;
}

export interface ProjectItem {
  slug: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  details: string;
  metrics: string;
  tech: string[];
  liveApp: boolean;
  status?: "completed" | "in-progress" | "planned";
  href: string;
  externalHref: string;
  imageUrl: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  year: string;
  summary: string;
  abstract: string;
  tags: string[];
  href: string;
  imageUrl: string;
}

export interface StackItem {
  id: string;
  name: string;
  category: "Hardware & EDC" | "Software & Otomasi" | "Infrastruktur & Cloud";
  description: string;
  review: string;
  platforms: string[];
  status: "active" | "evaluating" | "retired";
  icon?: string;
  href?: string;
  likes: number;
}

export type SenseCategory = "Membaca" | "Mendengar" | "Mengecap" | "Melihat";

export interface DailyLogItem {
  id: string;
  title: string;
  category: SenseCategory;
  date: string;
  subtitle?: string;
  summary: string;
  thoughts: string;
  tags: string[];
  imageUrl?: string;
  link?: string;
  rating?: number; // e.g. 4.9 (skala 1 - 5)
  itemType?: string; // e.g. "Film", "Video Podcast", "Dokumenter", "Buku", "Album", "Seduh Manual"
  creator?: string; // e.g. "Christopher Nolan", "Andrew Huberman", "Don Norman"
  year?: string; // e.g. "2023", "2024"
}

export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  href: string;
  imageUrl: string;
}

export interface UpdateFeedItem {
  id: string;
  badge: "Karya" | "Riset" | "Alat" | "Keseharian" | "Pengalaman";
  title: string;
  date: string;
  summary: string;
  link: string;
  imageUrl: string;
}

export const PROFILE_DATA = {
  name: "TEN",
  fullName: "Teguh Eko N.",
  tagline: "Eksplorasi Karya, Inisiatif Mandiri, Catatan & Dokumentasi",
  bio: "Ruang personal untuk mendokumentasikan perjalanan, membagikan eksplorasi karya, inisiatif kegiatan, catatan pemikiran, serta ragam proyek yang dikembangkan secara berkelanjutan.",
  avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=260&auto=format&fit=crop&q=80",
  status: "Terbuka untuk Kolaborasi & Diskusi",
  location: "Indonesia",
  stats: [
    { label: "visits", value: "1.2k+" },
    { label: "projects", value: "4" },
    { label: "writings", value: "3" },
    { label: "experiences", value: "3" },
  ],
  contact: {
    email: "admin@ten.my.id",
    website: "https://ten.my.id",
    ssoPortal: "https://auth.ten.my.id",
    docsUrl: "https://ten.my.id/docs",
    location: "Indonesia",
  },
  socialLinks: [
    { label: "Website", url: "https://ten.my.id", icon: "🌐" },
    { label: "GitHub", url: "https://github.com", icon: "💻" },
    { label: "Dokumentasi", url: "https://ten.my.id/docs", icon: "📖" },
    { label: "SSO Auth", url: "https://auth.ten.my.id", icon: "🛡️" },
    { label: "Email", url: "mailto:admin@ten.my.id", icon: "✉️" },
  ],
};

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "digital-architect",
    role: "Inisiator & Koordinator Program",
    company: "TEN Initiative",
    period: "2023 — Sekarang",
    location: "Indonesia / Remote",
    summary: "Memimpin perancangan inisiatif mandiri, koordinasi kegiatan kolaboratif, pengarsipan terbuka, dan pengembangan solusi terpadu.",
    details: [
      "Mengembangkan kerangka kerja mandiri dengan tata kelola terstruktur, terbuka, dan terdokumentasi secara berkala.",
      "Membangun kolaborasi lintas bidang untuk mendorong efisiensi kegiatan dan keterbukaan akses informasi publik.",
      "Mengintegrasikan sarana komunikasi dan pencatatan yang mudah dipahami serta dapat diakses oleh berbagai kalangan.",
    ],
    skills: ["Pengembangan Inisiatif", "Perencanaan Strategis", "Kolaborasi Tim", "Manajemen Program"],
    href: "https://ten.my.id",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "cloud-systems-engineer",
    role: "Spesialis Tata Kelola Alur Kerja",
    company: "Modular Solutions",
    period: "2020 — 2023",
    location: "Indonesia",
    summary: "Mengelola efisiensi operasional alur kerja, penyederhanaan proses, koordinasi tim, dan pemeliharaan media dokumentasi.",
    details: [
      "Merancang standarisasi prosedur operasional guna memastikan konsistensi kualitas hasil dan kelancaran alur koordinasi.",
      "Menerapkan evaluasi berkala untuk mengenali hambatan kerja dan mengoptimalkan ritme kerja tim.",
      "Menyusun dokumentasi panduan kerja yang terstruktur, komunikatif, dan mudah dipelajari oleh anggota tim.",
    ],
    skills: ["Tata Kelola Operasional", "Manajemen Alur Kerja", "Optimasi Proses", "Dokumentasi"],
    href: "https://ten.my.id/docs",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "web-technology-consultant",
    role: "Konsultan Program & Transformasi Lembaga",
    company: "Community Empowerment Alliance",
    period: "2017 — 2020",
    location: "Indonesia",
    summary: "Mendampingi lembaga kemasyarakatan dan komunitas nirlaba dalam penyusunan strategi, pengorganisasian data, dan modernisasi tata kelola.",
    details: [
      "Memberikan pendampingan lapangan bagi lembaga non-profit dalam pembenahan tata kelola informasi dan pelaporan.",
      "Mengembangkan materi pelatihan dan lokakarya peningkatan kapasitas serta kemandirian pengurus lembaga.",
      "Membantu transformasi alur kerja manual menuju sistem pencatatan berbasis digital yang transparan dan akuntabel.",
    ],
    skills: ["Konsultasi Program", "Pemberdayaan Komunitas", "Pelatihan SDM", "Penyusunan Strategi"],
    href: "https://auth.ten.my.id",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
  },
];

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    slug: "views-counter",
    name: "Sistem Metrik & Kunjungan Terbuka",
    category: "Analitik & Metrik",
    icon: "📊",
    description: "Pencatatan statistik kunjungan publik secara real-time yang transparan, ringan, dan akurat.",
    details: "Inisiatif pelacak statistik pengunjung yang dirancang untuk memberikan transparansi interaksi publik tanpa mengorbankan privasi pengguna. Dilengkapi antarmuka pemantau metrik yang ringkas dan informatif.",
    metrics: "1,240+ Kunjungan • 34 Apresiasi",
    tech: ["Transparansi Data", "Statistik Real-time", "Antarmuka Responsif"],
    liveApp: true,
    status: "completed",
    href: "/projects/details?slug=views-counter",
    externalHref: "https://ten.my.id/views-counter",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "cloudflare-status",
    name: "Dasbor Pemantauan Layanan",
    category: "Pemantauan Publik",
    icon: "⚡",
    description: "Pemantauan status jaringan dan ketersediaan infrastruktur layanan publik secara terbuka.",
    details: "Dasbor pemantauan keterhubungan jaringan dan ketersediaan layanan publik yang menyajikan data operasional terkini bagi para pengunjung dan mitra.",
    metrics: "890+ Pantauan • 19 Status Normal",
    tech: ["Monitoring Terbuka", "Status Real-time", "Transparansi Jaringan"],
    liveApp: true,
    status: "completed",
    href: "/projects/details?slug=cloudflare-status",
    externalHref: "https://www.cloudflarestatus.com",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "docs-api",
    name: "Pusat Panduan & Dokumentasi",
    category: "Panduan & Rujukan",
    icon: "📖",
    description: "Kumpulan panduan tata cara kolaborasi, alur kerja terstruktur, dan referensi inisiatif terbuka.",
    details: "Pusat rujukan dan dokumentasi komprehensif yang disusun untuk memudahkan siapa pun dalam memahami tata kelola, acuan kerja sama, dan pemanfaatan sarana yang ada.",
    metrics: "650+ Pembaca • 27 Kontributor",
    tech: ["Panduan Terstruktur", "Dokumentasi Terbuka", "Standar Kolaborasi"],
    liveApp: true,
    status: "completed",
    href: "/projects/details?slug=docs-api",
    externalHref: "https://ten.my.id/docs",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "scratchpad",
    name: "Catatan Cepat & Gagasan Instan",
    category: "Produktivitas Personal",
    icon: "📝",
    description: "Ruang pencatatan gagasan kilat di peramban dengan penyimpanan otomatis yang aman dan praktis.",
    details: "Alat bantu sederhana untuk menuangkan gagasan kilat, draf tulisan, dan memo penting harian langsung di peramban tanpa memerlukan proses registrasi yang rumit.",
    metrics: "430+ Catatan • 12 Tersimpan",
    tech: ["Penyimpanan Lokal", "Antarmuka Bersih", "Auto-Save"],
    liveApp: true,
    status: "completed",
    href: "/projects/details?slug=scratchpad",
    externalHref: "/projects/scratchpad",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "komunitas-otomasi",
    name: "Automasi Tata Kelola Komunitas Nirlaba",
    category: "Inisiatif Sosial",
    icon: "🤝",
    description: "Integrasi sistem pendataan mandiri dan transparansi laporan kegiatan untuk organisasi kemasyarakatan.",
    details: "Rancangan alur kerja otomatis berbasis teknologi tepat guna untuk membantu relawan dan pengurus lembaga non-profit mengelola informasi dan pelaporan terbuka.",
    metrics: "Tahap Pengembangan • 3 Mitra Komunitas",
    tech: ["Automasi Alur Kerja", "Tata Kelola Data", "Non-Profit"],
    liveApp: false,
    status: "in-progress",
    href: "/karya",
    externalHref: "#",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "repositori-ilmiah",
    name: "Khazanah Ilmiah & Pengarsipan Terbuka",
    category: "Riset & Pengetahuan",
    icon: "🏛️",
    description: "Platform digital kurasi referensi ilmiah, skripsi, dan kajian periset independen terbuka.",
    details: "Inisiatif platform rujukan periset untuk mengindeks dan menyebarluaskan hasil karya ilmiah serta telaah kritis secara terbuka dan berkeadilan akses.",
    metrics: "Rencana Eksplorasi • Q4 2026",
    tech: ["Open Access", "Arsip Digital", "Metodologi Ilmiah"],
    liveApp: false,
    status: "planned",
    href: "/karya",
    externalHref: "#",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
  },
];

export const PUBLICATION_ITEMS: PublicationItem[] = [
  {
    id: "edge-architecture-wp",
    title: "Membangun Sistem Modular Berkelanjutan: Pendekatan Efisiensi & Kemandirian",
    publisher: "Seri Gagasan Mandiri",
    year: "2025",
    summary: "Refleksi dan telaah komprehensif mengenai strategi membangun sistem kerja yang adaptif, modular, dan hemat sumber daya.",
    abstract: "Tulisan ini mengulas pentingnya pendekatan modular dalam merancang sebuah sistem maupun inisiatif kerja. Dengan mengurai kompleksitas menjadi bagian-bagian yang mandiri, organisasi dapat bergerak lebih lincah dan meminimalkan ketergantungan pada struktur yang kaku.",
    tags: ["Efisiensi", "Kemandirian", "Sistem Kerja"],
    href: "https://ten.my.id/docs",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sso-rbac-specification",
    title: "Prinsip Keamanan & Tata Kelola Akses Terpadu dalam Lingkungan Kolaborasi",
    publisher: "Jurnal Tata Kelola & Organisasi",
    year: "2024",
    summary: "Kajian mengenai tata kelola hak akses, transparansi informasi, dan perlindungan privasi dalam ruang kerja bersama.",
    abstract: "Membahas konsep dan prinsip dasar dalam mengelola identitas pengguna, hak akses berjenjang, dan transparansi otorisasi agar tercipta ruang kolaborasi yang aman, teratur, dan saling percaya.",
    tags: ["Tata Kelola", "Keamanan", "Privasi"],
    href: "https://auth.ten.my.id",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "automation-nonprofit",
    title: "Digitalisasi & Pemberdayaan Komunitas Nirlaba di Era Terbuka",
    publisher: "Warta Transformasi Sosial",
    year: "2024",
    summary: "Dokumentasi pengalaman lapangan dalam mendampingi komunitas nirlaba menerapkan efisiensi kerja dan pelaporan terbuka.",
    abstract: "Studi reflektif mengenai tantangan dan peluang implementasi teknologi tepat guna pada organisasi kemasyarakatan, serta pentingnya menyelaraskan inovasi dengan kebutuhan nyata masyarakat.",
    tags: ["Sosial", "Non-Profit", "Pemberdayaan"],
    href: "https://ten.my.id",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    slug: "launching-next-v1",
    title: "Pembaruan Ruang Personal: Desain Baru yang Terbuka & Minimalis",
    date: "05 Sep 2026",
    category: "Pembaruan Ruang",
    summary: "Meluncurkan tampilan ruang personal yang lebih segar, fokus pada kemudahan membaca, kesederhanaan visual, dan keterbukaan informasi.",
    content: "Ruang personal ini hadir sebagai wadah terpadu untuk merangkum berbagai inisiatif, portofolio karya, tulisan reflektif, serta catatan perjalanan. Dengan antarmuka yang bersih dan navigasi yang langsung, diharapkan pengunjung dapat dengan nyaman mengeksplorasi setiap bagian.",
    author: "Teguh Eko N.",
    href: "/news/details?slug=launching-next-v1",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "sso-v9-upgrade",
    title: "Penyelarasan Akses & Keamanan Ruang Informasi",
    date: "28 Agu 2026",
    category: "Tata Kelola",
    summary: "Penyempurnaan mekanisme identitas dan akses untuk mendukung kemudahan navigasi di seluruh ruang publikasi.",
    content: "Memperbarui sistem akses agar lebih ramah pengguna, memudahkan sinkronisasi data profil, serta memastikan keandalan akses pada berbagai modul layanan yang disediakan.",
    author: "Teguh Eko N.",
    href: "/news/details?slug=sso-v9-upgrade",
    imageUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=80",
  },
  {
    slug: "edge-kv-optimization",
    title: "Optimalisasi Kecepatan & Aksesibilitas Halaman",
    date: "15 Agu 2026",
    category: "Kinerja Halaman",
    summary: "Peningkatan efisiensi waktu muat halaman agar dapat diakses dengan lancar dan ringan dari berbagai perangkat.",
    content: "Melalui penyesuaian tata kelola aset dan pemangkasan beban transfer data, kini seluruh halaman dapat dibuka dengan sangat cepat baik melalui ponsel pintar maupun komputer desktop.",
    author: "Teguh Eko N.",
    href: "/news/details?slug=edge-kv-optimization",
    imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80",
  },
];

export const STACK_ITEMS: StackItem[] = [
  {
    id: "thinkpad",
    name: "Laptop ThinkPad Workhorse",
    category: "Hardware & EDC",
    description: "Komputer kerja harian dengan ketahanan tinggi dan keyboard ergonomis.",
    review: "Mesin andalan untuk coding, riset, dan analisis data berjam-jam tanpa khawatir keyboard lelah.",
    platforms: ["Windows", "Linux", "Physical"],
    status: "active",
    icon: "💻",
    likes: 42,
  },
  {
    id: "mechanical-kb",
    name: "Mechanical Keyboard 75%",
    category: "Hardware & EDC",
    description: "Papan ketik mekanikal tata letak ringkas dengan switch linier halus.",
    review: "Memberi ritme ketukan yang mantap dan minim kelelahan saat menulis draf karya ilmiah panjang.",
    platforms: ["Physical"],
    status: "active",
    icon: "⌨️",
    likes: 38,
  },
  {
    id: "anc-earphones",
    name: "Earphone ANC / IEM Hi-Fi",
    category: "Hardware & EDC",
    description: "Perangkat audio isolasi kebisingan untuk fokus mendalam.",
    review: "Penyaring kebisingan lingkungan saat bekerja di ruang bersama atau kafe, membantu deep work.",
    platforms: ["Physical"],
    status: "active",
    icon: "🎧",
    likes: 29,
  },
  {
    id: "analog-notebook",
    name: "Buku Catatan Grid & Pulpen Gel",
    category: "Hardware & EDC",
    description: "Buku catatan kertas bergaris kotak untuk sketsa ide mentah pertama.",
    review: "Sebelum membuka editor kode, diagram arsitektur dan alur pikiran selalu tertuang pertama kali di sini.",
    platforms: ["Physical"],
    status: "active",
    icon: "📓",
    likes: 34,
  },
  {
    id: "vscode-antigravity",
    name: "VS Code & Antigravity IDE",
    category: "Software & Otomasi",
    description: "Lingkungan pengembangan kode terpadu dengan asisten AI cerdas.",
    review: "Pusat komando koding harian. Ekstensi ringkas, navigasi cepat, dan integrasi agen AI yang responsif.",
    platforms: ["Windows", "Linux"],
    status: "active",
    icon: "🛠️",
    href: "https://code.visualstudio.com",
    likes: 56,
  },
  {
    id: "obsidian",
    name: "Obsidian (Second Brain)",
    category: "Software & Otomasi",
    description: "Sistem pencatatan berbasis Markdown dengan tautan dua arah.",
    review: "Tempat mengumpulkan intisari buku, catatan riset kuliah sarjana, dan outline paper periset.",
    platforms: ["Windows", "Android", "iOS"],
    status: "active",
    icon: "🧠",
    href: "https://obsidian.md",
    likes: 67,
  },
  {
    id: "powershell-cli",
    name: "PowerShell & Git CLI",
    category: "Software & Otomasi",
    description: "Antarmuka baris perintah untuk automasi alur kerja dan versioning.",
    review: "Menghemat banyak klik repetitif melalui skrip otomatisasi pipeline git dan deployment.",
    platforms: ["Windows"],
    status: "active",
    icon: "⚡",
    likes: 25,
  },
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers & Pages",
    category: "Infrastruktur & Cloud",
    description: "Platform serverless edge terdistribusi secara global.",
    review: "Hosting super cepat dengan latensi rendah di seluruh dunia, hemat biaya dan ideal untuk inisiatif mandiri.",
    platforms: ["Web", "Cloud"],
    status: "active",
    icon: "☁️",
    href: "https://workers.cloudflare.com",
    likes: 83,
  },
  {
    id: "nextjs",
    name: "Next.js Framework",
    category: "Infrastruktur & Cloud",
    description: "Fondasi aplikasi React modern dengan static export dan rendering adaptif.",
    review: "Fondasi utama website ten.my.id; fleksibel, modular, dan optimal untuk SEO personal.",
    platforms: ["Web"],
    status: "active",
    icon: "▲",
    href: "https://nextjs.org",
    likes: 61,
  },
];

export const DAILY_LOG_ITEMS: DailyLogItem[] = [
  // --- KATEGORI: MELIHAT (WATCHED LIST) ---
  {
    id: "watch-oppenheimer",
    title: "Oppenheimer",
    category: "Melihat",
    itemType: "Film",
    creator: "Dir. Christopher Nolan",
    year: "2023",
    rating: 4.9,
    date: "24 Sep 2026",
    subtitle: "Dilema Moral, Ambisi Sains, & Ledakan Trinity",
    summary: "Karya biopik monumental yang menguliti psikologi J. Robert Oppenheimer dalam perlombaan senjata atom Proyek Manhattan.",
    thoughts: "Penyuntingan suara dan keheningan saat detik ledakan Trinity adalah salah satu pencapaian sinematik tertinggi. Refleksi mendalam tentang beban etis seorang ilmuwan dan perekayasa teknologi modern.",
    tags: ["Film", "Sinema", "Sains", "Biografi"],
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "watch-huberman-focus",
    title: "Huberman Lab: Master Your Focus & Productivity",
    category: "Melihat",
    itemType: "Video Podcast",
    creator: "Dr. Andrew Huberman (YouTube)",
    year: "2024",
    rating: 4.8,
    date: "16 Sep 2026",
    subtitle: "Protokol Neurobiologi Dopamin & Pandangan Panoramik",
    summary: "Eksplorasi mekanisme visual dan neurokimiawi di balik fokus intensitas tinggi, manajemen sirkadian, dan siklus ultradian 90 menit.",
    thoughts: "Menerapkan protokol pandangan panoramik (panoramic vision) saat lelah menatap layar kode terbukti sangat efektif meredakan ketegangan korteks visual dan memulihkan stamina mental.",
    tags: ["Video Podcast", "Neuroscience", "Fokus", "Produktivitas"],
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "watch-alphago-doc",
    title: "AlphaGo — DeepMind Documentary",
    category: "Melihat",
    itemType: "Dokumenter",
    creator: "Dir. Greg Kohs • DeepMind",
    year: "2017",
    rating: 5.0,
    date: "05 Sep 2026",
    subtitle: "Laga Bersejarah Kecerdasan Mesin vs Intuisi Lee Sedol",
    summary: "Dokumentasi dramatis pertarungan 5 babak permainan Go di Seoul antara AI AlphaGo melawan grandmaster legendaris Lee Sedol.",
    thoughts: "Move 37 AlphaGo dan balasan Move 78 'Divine Touch' Lee Sedol adalah salah satu momen paling puitis dalam sejarah komputasi. Kecerdasan buatan bukan meniadakan keindahan manusiawi, justru memperluas horizon imajinasi.",
    tags: ["Dokumenter", "Kecerdasan Buatan", "AI", "Sains Komputer"],
    imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "watch-severance-s1",
    title: "Severance — Musim 1",
    category: "Melihat",
    itemType: "Serial TV",
    creator: "Dan Erickson • Dir. Ben Stiller",
    year: "2022",
    rating: 4.8,
    date: "28 Agu 2026",
    subtitle: "Distopia Korporasi & Pemisahan Memori Kesadaran",
    summary: "Serial fiksi ilmiah psikologis tentang karyawan Lumon Industries yang ingatannya dioperasi bedah menjadi dua entitas terpisah.",
    thoughts: "Desain interior koridor dingin dan sinematografi simetris Lumon menciptakan atmosfer alienasi modern yang menghantui. Kritik berbobot mengenai batas komodifikasi batin manusia dalam kultur korporasi.",
    tags: ["Serial TV", "Sci-Fi", "Psikologi", "Desain"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  },

  // --- KATEGORI: MEMBACA (READING LIST) ---
  {
    id: "read-design-things",
    title: "The Design of Everyday Things",
    category: "Membaca",
    itemType: "Buku",
    creator: "Don Norman",
    year: "2013",
    rating: 4.9,
    date: "18 Sep 2026",
    subtitle: "Prinsip Affordance, Signifier, & Kejelasan Desain",
    summary: "Telaah fundamental tentang psikologi interaksi benda sehari-hari dan bagaimana merancang antarmuka sistem yang berpusat pada manusia.",
    thoughts: "Kunci utama sistem yang baik bukan terletak pada banyaknya fitur, melainkan pada kemampuannya memberikan sinyal alami kepada manusia tanpa perlu panduan manual rumit.",
    tags: ["Buku", "Desain UI/UX", "Psikologi", "Human-Centered"],
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "read-atomic-habits",
    title: "Atomic Habits",
    category: "Membaca",
    itemType: "Buku",
    creator: "James Clear",
    year: "2018",
    rating: 4.8,
    date: "10 Sep 2026",
    subtitle: "Sains Perubahan Perilaku & Efek Kompon 1%",
    summary: "Framework berbasis sains kognitif untuk membangun kebiasaan produktif berkelanjutan dan mengikis friksi kebiasaan buruk.",
    thoughts: "Kita tidak naik ke tingkat impian kita, melainkan turun ke tingkat sistem harian yang kita jalani. Sangat esensial untuk menjaga konsistensi riset dan pembuatan karya mandiri.",
    tags: ["Buku", "Kebiasaan", "Produktivitas", "Sains"],
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "read-deep-work",
    title: "Deep Work: Rules for Focused Success",
    category: "Membaca",
    itemType: "Buku",
    creator: "Cal Newport",
    year: "2016",
    rating: 4.9,
    date: "01 Sep 2026",
    subtitle: "Strategi Konsentrasi Tanpa Distraksi di Era Ekonomi Digital",
    summary: "Analisis tajam mengenai kelangkaan kemampuan fokus mendalam dan bagaimana memanfaatkannya sebagai modal diferensiasi terkuat.",
    thoughts: "Membatasi konsumsi media dangkal dan menyisihkan blok waktu hening tanpa notifikasi adalah satu-satunya jalan menghasilkan sintesis pemikiran dan kode bermutu tinggi.",
    tags: ["Buku", "Deep Work", "Fokus", "Produktivitas"],
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
  },

  // --- KATEGORI: MENDENGAR (LISTENING LIST) ---
  {
    id: "listen-music-airports",
    title: "Ambient 1: Music for Airports",
    category: "Mendengar",
    itemType: "Album Musik",
    creator: "Brian Eno",
    year: "1978",
    rating: 4.9,
    date: "14 Sep 2026",
    subtitle: "Masterpiece Ambient: Musik yang Mengisi Keheningan Ruang",
    summary: "Eksplorasi komposisi suara tape-loop minimalis yang dirancang untuk meredakan ketegangan dan menemani aktivitas kontemplasi.",
    thoughts: "Dentur piano lambat yang hangat tidak pernah menuntut perhatian berlebih, melainkan secara halus mentransformasi suasana ruangan menjadi ruang kerja yang tenang.",
    tags: ["Album", "Ambient", "Fokus", "Elektronik"],
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "listen-ram-daftpunk",
    title: "Random Access Memories",
    category: "Mendengar",
    itemType: "Album Musik",
    creator: "Daft Punk",
    year: "2013",
    rating: 5.0,
    date: "07 Sep 2026",
    subtitle: "Eksplorasi Rekaman Analog Murni & Kejayaan Disko-Elektronik",
    summary: "Karya agung duo Prancis yang memadukan rekaman instrumen live organik era 70-an dengan pemrosesan vokal vocoder futuristik.",
    thoughts: "Penyuntingan dan mixing yang presisi luar biasa. Trek 'Giorgio by Moroder' selalu memberikan dorongan ritmis yang menyegarkan saat menyelesaikan modul sistem rumit.",
    tags: ["Album", "Daft Punk", "Disko", "Elektronik"],
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "listen-karpathy-podcast",
    title: "Lex Fridman Podcast: Andrej Karpathy",
    category: "Mendengar",
    itemType: "Audio Podcast",
    creator: "Lex Fridman Podcast",
    year: "2023",
    rating: 4.8,
    date: "29 Agu 2026",
    subtitle: "Arsitektur LLM, Neural Network, & Konsep Software 2.0",
    summary: "Perbincangan teknis dan filosofis mendalam seputar evolusi kecerdasan buatan, arsitektur transformer, dan masa depan otomatisasi.",
    thoughts: "Gagasan bahwa LLM berfungsi seperti kernel sistem operasi baru yang mengeksekusi instruksi bahasa alami memberikan fondasi konsep yang kuat untuk perancangan alat masa depan.",
    tags: ["Podcast", "AI", "Software Engineering", "Komputasi"],
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
  },

  // --- KATEGORI: MENGECAP (TASTING LIST) ---
  {
    id: "taste-v60-flores",
    title: "Flores Bajawa Single Origin (V60)",
    category: "Mengecap",
    itemType: "Seduh Manual",
    creator: "Origin: Ngada, NTT • Kelimutu Roastery",
    year: "2026",
    rating: 4.9,
    date: "09 Sep 2026",
    subtitle: "Rasio 1:15 • Suhu 91°C • Notes: Cokelat Hitam, Kacang, Plum Manis",
    summary: "Eksplorasi teknik pour-over kopi arabika dataran tinggi Ngada pada ketinggian 1.400 mdpl dengan metode wet hulled.",
    thoughts: "Ritual pagi yang meditatif. Kelembutan keasaman plum berpadu serasi dengan aroma kacang panggang dan aftertaste karamel yang bertahan lama di lidah.",
    tags: ["Kopi", "Seduh Manual", "V60", "Flores"],
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "taste-gayo-wine",
    title: "Gayo Wine Anaerobic (Japanese Iced)",
    category: "Mengecap",
    itemType: "Seduh Manual",
    creator: "Origin: Takengon, Aceh • Ketiara Cooperative",
    year: "2026",
    rating: 4.8,
    date: "03 Sep 2026",
    subtitle: "Metode Drip Es • Notes: Fermented Grape, Blackcurrant, Dark Cocoa",
    summary: "Biji kopi yang melalui fermentasi anaerobik 30 hari, diseduh perlahan menetes di atas bongkahan es batu bening.",
    thoughts: "Sensasi rasa fermentasi anggur merah yang pekat berpadu dengan kesegaran asam buah beri hitam. Sangat efektif memulihkan kejernihan pikiran di siang terik.",
    tags: ["Kopi", "Japanese Drip", "Anaerobic", "Gayo"],
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "taste-uji-matcha",
    title: "Ceremonial Uji Matcha (Cultivar Asahi)",
    category: "Mengecap",
    itemType: "Artisan Tea",
    creator: "Origin: Uji, Kyoto • Marukyu Koyamaen",
    year: "2026",
    rating: 5.0,
    date: "25 Agu 2026",
    subtitle: "Whisking Bambu Tradisional • Notes: Umami Kuat, Krim Manis, Vegetal",
    summary: "Teh hijau seremonial panenan pertama musim semi di Uji, digiling perlahan menggunakan batu granit tradisional.",
    thoughts: "Lapisan rasa umami yang pekat dan tekstur krim kental tanpa rasa getir. Sinergi kafein dan L-Theanine menghadirkan ketenangan fokus yang berdaya tahan lama.",
    tags: ["Artisan Tea", "Matcha", "Kyoto", "Teh"],
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
  },
];

export const UPDATE_FEED_ITEMS: UpdateFeedItem[] = [
  {
    id: "upd-1",
    badge: "Karya",
    title: "Sistem Metrik & Kunjungan Terbuka",
    date: "Sep 2026",
    summary: "Pencatatan statistik kunjungan publik real-time kini aktif dengan tampilan visual yang ringkas.",
    link: "/karya",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "upd-2",
    badge: "Riset",
    title: "Membangun Sistem Modular Berkelanjutan: Pendekatan Efisiensi & Kemandirian",
    date: "Agu 2026",
    summary: "Telaah strategi perancangan sistem kerja yang adaptif, mandiri, dan hemat sumber daya bagi periset.",
    link: "/karya",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "upd-3",
    badge: "Alat",
    title: "Katalog Alat & Setup Instrumen Kerja Digital",
    date: "Sep 2026",
    summary: "Rangkuman perangkat keras, software editor, dan infrastruktur cloud yang dipakai harian.",
    link: "/alat",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "upd-4",
    badge: "Keseharian",
    title: "The Design of Everyday Things — Don Norman",
    date: "18 Sep 2026",
    summary: "Catatan bacaan mengenai prinsip keterbacaan dan desain empati dalam interaksi manusia.",
    link: "/keseharian",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "upd-5",
    badge: "Pengalaman",
    title: "Inisiator & Koordinator Program — TEN Initiative",
    date: "2023 — Sekarang",
    summary: "Perancangan inisiatif mandiri, koordinasi kegiatan kolaboratif, dan pengarsipan terbuka.",
    link: "/pengalaman",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  },
];
