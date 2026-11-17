---
title: Vykreslenie pôdorysu do PDF
summary: Vykreslite všetko alebo aktuálny pohľad do vektorového PDF na štandardnom liste v inžinierskej alebo metrickej mierke, vo farbách hladín alebo v čiernej farbe.
keywords: vykreslenie, tlač, pdf, list, mierka, formát papiera, list pôdorysu, publikovanie, popisové pole, severka, mierkový pás
from: 9af396ca
---

{{ui:PDF}} vykreslí pôdorys do vektorového PDF na jednom liste s popisovým poľom, severkou a mierkovým pásom. PDF sa vytvorí v prehliadači a stiahne sa; neprechádza cez dialóg tlače prehliadača.

## Vykreslenie

1. Nastavte pôdorys v časti **Zobrazenie**: zobrazovaný povrch, interval vrstevníc a to, čo je zapnuté. Vykreslenie sa riadi týmito nastaveniami.
2. Ak chcete len časť lokality, priblížte a posuňte pôdorys na ňu.
3. Kliknite na {{ui:PDF}} v skupine **Export** alebo stlačte {{key:Mod+P}}. Otvorí sa dialógové okno **Vykresliť pôdorys do PDF**.
4. Vyberte **Oblasť**: {{ui:Everything}} alebo {{ui:What is on screen}}.
5. Vyberte **Papier**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 alebo A1. Projekt v stopách sa začína na Tabloid, metrický projekt na A3. Listy sú vždy na šírku.
6. Vyberte **Mierku**. Zoznam označí najväčšiu mierku, ktorá sa zmestí, značkou "(fits)" a vyberie ju.
   - Stopy: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metrické: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Vyberte **Farbu tlače**: {{ui:Layer colors}} alebo {{ui:Black}}.
8. Prečítajte si riadok pod voľbami. Udáva veľkosť oblasti na papieri a veľkosť listu, napríklad "Plocha má 297 × 222 mm pri 1" = 40' na liste 432 × 279 mm (na šírku)."
9. Kliknite na {{ui:Download PDF}}.
   Prehliadač stiahne `<name>.pdf`. Stavový riadok zobrazí "Vykreslené <name>.pdf pri 1" = 40'."

Ak je oblasť pri zvolenej mierke väčšia ako list, pôdorys sa vycentruje a okraje sa orežú. Vyberte mierku označenú "(fits)" alebo väčší list.

## Čo je na liste

- Pôdorys, vycentrovaný v kresliacej ploche, ako skutočné vektory: vrstevnice, popisky, osi so staničením, koridory, plošiny a čiary hraníc výkopu a násypu, potrubia, body.
- Hrúbky čiar podľa hladiny: osi, plošiny a potrubia hrubšie; trojuholníky a vedľajšie vrstevnice jemné.
- Popisové pole pozdĺž spodku s **Názvom** projektu, mierkou, poznámkou o intervale vrstevníc a o tom, ktorý povrch (jestvujúci alebo upravený), a dátumom a verziou zostavenia vpravo.
- Severka v pravom hornom rohu (sever pôdorysu smeruje hore) a mierkový pás v popisovom poli.
- Mapové vrstvy pod pôdorysom (obrázok, mapové dlaždice alebo mapová služba), keď je zaškrtnuté **Mapové vrstvy pod pôdorysom**: kreslia sa ako jeden obrázok celej kresliacej plochy pri 150 bodoch na palec, pod čiarami, a autorstvo mapy ide do popisového poľa. CivilCraft čaká až 8 sekúnd na mapové obrázky, ktoré ešte prichádzajú; ak niektoré chýbajú, stavový riadok to uvedie.

Text používa vstavané písmo PDF Helvetica. Znaky mimo západoeurópskej sady (Windows-1252) sa vytlačia ako "?", a stavová správa ich spočíta.

## Čo sa nevykresľuje

- Pásy výšok.
- Pohľad na profil. Vykresľovanie profilov zatiaľ nie je k dispozícii.
- Viac než jeden list (pre os trasy použite [listy pôdorysu a pozdĺžneho profilu](topic:plan-profile-sheets)), výrezy, vlastné popisové pole alebo listy na výšku.

:::note
Dialóg uvádza, že šípky sklonu sú len na obrazovke. V tejto verzii sa šípky sklonu, ktoré sú zapnuté v časti **Zobrazenie**, vykreslia (a exportujú do DXF). Pred vykreslením ich vypnite, ak ich nechcete.
:::

## Tlač na papier

Otvorte stiahnuté PDF v ľubovoľnom prehliadači PDF a vytlačte ho na 100 % (skutočná veľkosť), aby mierka zostala správna. "Prispôsobiť strane" mení mierku.
