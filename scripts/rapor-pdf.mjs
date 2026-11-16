// Yönlendirme tabelası ön statik hesap raporunu PDF'e basar.
// Kullanım: node scripts/rapor-pdf.mjs <is.json> <cikti.pdf>
// is.json: { musteri, proje, referans, tarih, durumlar: [{ adet, girdi: { ...VARSAYILAN_YON'dan farklı alanlar } }] }
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { raporHTML } from "../lib/rapor.ts";
import { VARSAYILAN_YON } from "../lib/yonlendirme.ts";

const [isDosyasi, cikti] = process.argv.slice(2);
if (!isDosyasi || !cikti) {
  console.error("Kullanım: node scripts/rapor-pdf.mjs <is.json> <cikti.pdf>");
  process.exit(1);
}
const is = JSON.parse(fs.readFileSync(isDosyasi, "utf8"));
is.durumlar = is.durumlar.map((d) => ({ adet: d.adet, girdi: { ...VARSAYILAN_YON, ...d.girdi } }));

const html = raporHTML(is);
const gecici = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "statik-rapor-")), "rapor.html");
fs.writeFileSync(gecici, html);

const adaylar = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];
const tarayici = process.env.CHROME_PATH || adaylar.find((p) => fs.existsSync(p));
if (!tarayici) {
  console.error("Chrome bulunamadı. CHROME_PATH ile yolunu verin. HTML: " + gecici);
  process.exit(1);
}
execFileSync(
  tarayici,
  ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${path.resolve(cikti)}`, "file://" + gecici],
  { stdio: "ignore", timeout: 60000 }
);
console.log("ok", path.resolve(cikti));
