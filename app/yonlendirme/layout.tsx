import { sayfaMetadata, SemaJsonLd } from "../seo";

const baslik = "Yönlendirme Tabelası Statik Ön Hesap | Eymen Reklam";
const aciklama =
  "Çift direkli yönlendirme tabelası için rüzgâr yükü, direk profili, flanş, ankraj ve beton temel ön hesabı; PDF rapor. Ücretsiz, kayıt gerektirmez.";

export const metadata = sayfaMetadata({ baslik, aciklama, yol: "/statik-hesap/yonlendirme/" });

export default function YonlendirmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SemaJsonLd ad="Yönlendirme Tabelası Statik Ön Hesap" aciklama={aciklama} yol="/statik-hesap/yonlendirme/" />
      {children}
    </>
  );
}
