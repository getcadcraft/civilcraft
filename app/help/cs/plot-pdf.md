---
title: Vykreslení půdorysu do PDF
summary: Vykreslete vše nebo aktuální zobrazení do vektorového PDF na standardním listu v inženýrském nebo metrickém měřítku, v barvách vrstev nebo černě.
keywords: vykreslení, tisk, pdf, list, měřítko, formát papíru, list půdorysu, publikování, razítko, šipka severu, měřítková lišta
from: 9af396ca
---

{{ui:PDF}} vykreslí půdorys do vektorového PDF na jeden list, s razítkem, šipkou severu a měřítkovou lištou. PDF se vytvoří v prohlížeči a stáhne; neprochází dialogem tisku prohlížeče.

## Vykreslení

1. Nastavte půdorys v části **Zobrazení**: zobrazený povrch, interval vrstevnic a které prvky jsou zapnuté. Vykreslení se těchto nastavení drží.
2. Pokud chcete jen část lokality, přiblížte a posuňte půdorys na ni.
3. Klikněte na {{ui:PDF}} ve skupině **Export**, nebo stiskněte {{key:Mod+P}}.
   Otevře se dialog **Vykreslení půdorysu do PDF**.
4. Vyberte **Oblast**: {{ui:Vše}} nebo {{ui:Co je na obrazovce}}.
5. Vyberte **Papír**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 nebo A1. Projekt v stopách začíná na Tabloid, projekt v metrech na A3. Listy jsou vždy na šířku.
6. Vyberte **Měřítko**. Seznam označí největší měřítko, které se vejde, textem "(vejde se)" a vybere je.
   - Stopy: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metry: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Vyberte **Barvy tisku**: {{ui:Barvy vrstev}} nebo {{ui:Černě}}.
8. Přečtěte řádek pod volbami. Uvádí velikost plochy na papíře a velikost listu, například "Plocha má na papíře 297 × 222 mm v měřítku 1" = 40' na listu 432 × 279 mm (na šířku)."
9. Klikněte na {{ui:Stáhnout PDF}}.
   Prohlížeč stáhne `<name>.pdf`. Stavový řádek hlásí "Vykresleno <name>.pdf v měřítku 1" = 40'."

Pokud je plocha při zvoleném měřítku větší než list, vykreslení se vycentruje a okraje se ořežou. Zvolte měřítko označené "(vejde se)" nebo větší list.

## Co je na listu

- Půdorys vycentrovaný v oblasti kresby jako pravé vektory: vrstevnice, popisky, osy tras se staničením, koridory, plošky a čáry napojení na terén, potrubí, body.
- Tloušťky čar podle vrstev: osy tras, plošky a potrubí silněji; trojúhelníky a vedlejší vrstevnice jemně.
- Razítko podél spodního okraje s **Názvem** projektu, měřítkem, poznámkou o intervalu vrstevnic a o tom, který povrch (stávající nebo upravený), a vpravo datum a verze sestavení.
- Šipka severu v pravém horním rohu (sever půdorysu je nahoře) a měřítková lišta v razítku.
- Mapové vrstvy zobrazené pod půdorysem (obrázek, mapové dlaždice nebo mapová služba), když je zaškrtnuto **Mapové vrstvy pod půdorysem**: vykreslí se jako jeden obrázek celé oblasti kresby při 150 bodech na palec, pod čárovou kresbou, a údaj o autorovi mapy jde do razítka. CivilCraft čeká až 8 sekund na mapové obrázky, které ještě přicházejí; pokud některé stále chybí, stavový řádek to uvede.

Text používá vestavěné písmo PDF Helvetica. Znaky mimo západoevropskou sadu (Windows-1252) se vytisknou jako "?" a stavový řádek je spočítá.

## Co se nevykresluje

- Pásma výšek.
- Pohled podélného profilu. Vykreslování profilů ještě není k dispozici.
- Více než jeden list (pro osu trasy použijte [listy půdorysu a podélného profilu](topic:plan-profile-sheets)), výřezy, vlastní razítko nebo listy na výšku.

:::note
Dialog uvádí, že šipky sklonu jsou jen na obrazovce. V této verzi se šipky sklonu zapnuté v **Zobrazení** vykreslí (a exportují do DXF). Pokud je nechcete, před vykreslením je vypněte.
:::

## Tisk na papír

Otevřete stažené PDF v libovolné prohlížečce PDF a vytiskněte jej na 100 % (skutečná velikost), aby měřítko zůstalo správné. "Přizpůsobit stránce" měřítko změní.
