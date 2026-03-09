export function formatSayi(n: number, decimals: number = 2): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatKN(newtons: number): string {
  return formatSayi(newtons / 1000, 2) + " kN";
}

export function formatKNm(nm: number): string {
  return formatSayi(nm / 1000, 2) + " kN·m";
}

export function formatM3(m3: number): string {
  return formatSayi(m3, 3) + " m³";
}

export function formatCm(cm: number): string {
  return formatSayi(cm, 0) + " cm";
}
