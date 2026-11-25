import type { Metadata } from "next";

// Araç eymenreklam.com.tr/statik-hesap/ altında yayınlanıyor (basePath).
// Ana site (Astro) her sayfaya canonical + OG + JSON-LD basıyor; burada aynısı.
export const SITE = "https://www.eymenreklam.com.tr";
const OG_GORSEL = `${SITE}/images/fabrika-og.jpg`;

export function sayfaMetadata(p: { baslik: string; aciklama: string; yol: string }): Metadata {
  const url = `${SITE}${p.yol}`;
  return {
    title: p.baslik,
    description: p.aciklama,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: p.baslik,
      description: p.aciklama,
      siteName: "Eymen Reklam",
      locale: "tr_TR",
      images: [{ url: OG_GORSEL, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: p.baslik, description: p.aciklama, images: [OG_GORSEL] },
  };
}

export function SemaJsonLd(p: { ad: string; aciklama: string; yol: string }) {
  const url = `${SITE}${p.yol}`;
  const sema = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: p.ad,
      description: p.aciklama,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      inLanguage: "tr-TR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
      provider: { "@type": "LocalBusiness", name: "Eymen Reklam", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: p.ad, item: url },
      ],
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sema) }} />;
}
