import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://ten.my.id"),
  title: {
    default: "TEN — Ruang Personal & Catatan Karya",
    template: "%s | TEN",
  },
  description:
    "Ruang personal untuk mendokumentasikan perjalanan, karya, inisiatif, tulisan, dan catatan kegiatan berkala oleh TEN.",
  keywords: [
    "TEN",
    "ten.my.id",
    "Ruang Personal",
    "Catatan Karya",
    "Inisiatif Mandiri",
    "Proyek Web",
    "Publikasi",
    "Kabar Terkini",
    "Rekayasa Sistem",
    "Cloudflare",
  ],
  authors: [{ name: "TEN", url: "https://ten.my.id" }],
  creator: "TEN",
  publisher: "TEN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://ten.my.id",
    siteName: "TEN Platform",
    title: "TEN — Ruang Personal & Catatan Karya",
    description:
      "Ruang personal untuk mendokumentasikan perjalanan, karya, inisiatif, tulisan, dan catatan kegiatan berkala.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "TEN — Ruang Personal & Catatan Karya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEN — Ruang Personal & Catatan Karya",
    description:
      "Ruang personal untuk mendokumentasikan perjalanan, karya, inisiatif, tulisan, dan catatan kegiatan berkala.",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80",
    ],
    creator: "@ten_my_id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ten.my.id/#website",
      "url": "https://ten.my.id",
      "name": "TEN — Ruang Personal & Catatan Karya",
      "description":
        "Ruang personal untuk mendokumentasikan perjalanan, karya, inisiatif, tulisan, dan catatan kegiatan berkala.",
      "inLanguage": "id-ID",
    },
    {
      "@type": "Person",
      "@id": "https://ten.my.id/#person",
      "name": "TEN",
      "alternateName": "Teguh Eko N.",
      "url": "https://ten.my.id",
      "jobTitle": "Inisiator Karya & Praktisi Sistem",
      "description":
        "Eksplorasi Karya, Inisiatif Mandiri, Catatan Pemikiran & Dokumentasi Berkelanjutan.",
      "sameAs": [
        "https://github.com",
        "https://auth.ten.my.id",
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": "https://ten.my.id/#profilepage",
      "url": "https://ten.my.id",
      "name": "Profil Personal & Catatan Karya TEN",
      "isPartOf": { "@id": "https://ten.my.id/#website" },
      "mainEntity": { "@id": "https://ten.my.id/#person" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body>
        <AuthProvider>
          <div className="app-container">
            <Header />
            <main className="content-wrapper">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
