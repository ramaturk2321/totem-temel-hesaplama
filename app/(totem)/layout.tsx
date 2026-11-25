import { sayfaMetadata, SemaJsonLd } from "../seo";

const baslik = "Totem Tabela Temel Hesaplama Aracı | Eymen Reklam";
const aciklama =
  "Totem/pylon tabela beton temel boyutu ve hacim hesaplama aracı. Rüzgâr direnci hesabıyla güvenli temel ölçüleri; ücretsiz, kayıt gerektirmez.";

export const metadata = sayfaMetadata({ baslik, aciklama, yol: "/statik-hesap/" });

export default function TotemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SemaJsonLd ad="Totem Tabela Temel Hesaplama" aciklama={aciklama} yol="/statik-hesap/" />
      {children}
    </>
  );
}
