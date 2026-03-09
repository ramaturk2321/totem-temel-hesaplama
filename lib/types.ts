export interface TotemConfig {
  panelGenislik: number;    // metre
  panelYukseklik: number;   // metre
  direkBoyu: number;        // metre (yerden panelin altina)
  boruCapi: number;         // cm (dis cap)
  ruzgarHizi: number;       // km/h
  zeminTipiId: string;
}

export interface TemelSonuc {
  ruzgarBasinci: number;       // Pa
  panelRuzgarKuvveti: number;  // N
  direktRuzgarKuvveti: number; // N
  toplamRuzgarKuvveti: number; // N
  devrilmeMomenti: number;     // N·m
  temelGenislik: number;       // cm
  temelUzunluk: number;        // cm
  temelDerinlik: number;       // cm
  betonHacmi: number;          // m³
  demirDonati: string;
  guvenlikKatsayisi: number;
  direncMomenti: number;       // N·m
}

export interface ZeminTipi {
  id: string;
  label: string;
  aciklama: string;
  tasimagucu: number;          // kPa
  pasifBasincKatsayisi: number;
  yogunluk: number;            // kg/m³
}

export interface RuzgarBolgesi {
  id: string;
  label: string;
  hiz: number; // km/h
}

export interface BoruSecenegi {
  capCm: number;
  label: string;
  etKalinlik: number; // mm
}

export const DEFAULT_CONFIG: TotemConfig = {
  panelGenislik: 2,
  panelYukseklik: 3,
  direkBoyu: 4,
  boruCapi: 21.9,
  ruzgarHizi: 80,
  zeminTipiId: "siki_kum",
};
