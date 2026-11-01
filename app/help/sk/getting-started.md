---
title: Začíname s CivilCraft
summary: Čo CivilCraft robí, ako ho otvoriť a prvých desať minút s ukážkovým staveniskom od bodov po vrstevnice, cestu a uložený projekt.
keywords: začiatok, prvé spustenie, ukážkové stavenisko, úvod, rýchly štart, návod, začať, nový projekt
from: c9b6dd8e
---

CivilCraft je aplikácia rodiny CadCraft na inžinierske stavby a návrh pozemkov. Zo zameraných bodov vytvorí povrch (TIN) s vrstevnicami, potom vám umožní vytýčiť osi trás s návrhovými profilmi, viesť jednoduchý koridor cesty, upraviť stavebné plošiny až po líniu zásahu, skontrolovať gravitačnú sieť potrubí podľa vašich pravidiel a zobraziť objemy výkopu a násypu. Číta a zapisuje LandXML, exportuje pôdorys ako DXF a vykresľuje ho do PDF.

Ak ste používali Civil 3D, myšlienky vám budú povedomé: body, skupiny bodov, hrany zlomu, osi podľa PI, profily podľa PVI, koridory, úpravy terénu, siete potrubí. Spôsob práce je iný a oveľa menší: nie je príkazový riadok, štýly ani súbor výkresu. Pred prvou skutočnou zákazkou si raz prečítajte [Ak prichádzate z iného inžinierskeho softvéru](topic:coming-from).

## Čo potrebujete

- Aktuálny prehliadač pre počítač: Chrome, Edge, Firefox alebo Safari. Pozrite [Prehliadače](common:browsers).
- Myš alebo touchpad a klávesnicu, alebo dotykovú obrazovku: kreslenie tam má na obrazovke tlačidlá {{ui:Dokončiť}}, {{ui:Späť o bod}} a {{ui:Zrušiť}} (pozrite [Myš, touchpad a dotyk](topic:keyboard#mouse-trackpad-and-touch)).
- Pôdorys sa kreslí v 2D na plátne prehliadača. [3D pohľad](topic:site-3d) používa grafiku WebGL prehliadača; ak sa nedá spustiť, riadok stavu povie prečo a pôdorys stále funguje.
- Bez účtu a bez nahrávania. Súbory sa otvárajú na vašom počítači a ukladajú ako stiahnuté súbory. Pozrite [Vaše súbory](common:your-files).

:::note
CivilCraft dnes beží ako skorá prehliadačová zostava, ktorá sa ešte vyvíja. Zostavenia pre počítač zatiaľ nie sú k dispozícii a ukladanie do cloudu tiež nie. Všetko, čo vytvoríte, zostáva na vašom počítači, kým to neuložíte alebo neexportujete.
:::

## Otvorenie CivilCraft

1. Otvorte CivilCraft v prehliadači.
2. Počkajte, kým sa obrazovka zaplní: hore panel nástrojov, vľavo panel, v strede pôdorys a vpravo panel **Vlastnosti**.
3. Na prázdnom pôdoryse uvidíte rámček s názvom **Začnite zamernými bodmi**. Uvádza prvé kroky a obsahuje odkaz {{ui:Otvoriť ukážkové stavenisko}}.

Ak chcete CivilCraft neskôr používať bez pripojenia, kliknite na lište aplikácie na {{ui:Uložiť na offline použitie}} a počkajte na {{ui:Pripravené offline}}. Zahŕňa tohto pomocníka, ukážkové stavenisko a knižnice 3D a GIS. Pozrite [Offline](common:offline). Stlačením klávesu {{key:F1}} alebo kliknutím na {{ui:Pomocník}} otvoríte tohto pomocníka kedykoľvek vedľa aplikácie.

## Prvých desať minút: ukážkové stavenisko

Ukážkové stavenisko je malé zameranie v amerických stopách: 276 bodov v súradniciach štátnej roviny, hrebeň, priekopa s osou rigolu a dvomi hornými hranami brehu. Dodáva sa s aplikáciou, takže môžete postupovať bez vlastného súboru.

1. V rámčeku na pôdoryse kliknite na {{ui:Otvoriť ukážkové stavenisko}}.
   Otvorí sa dialógové okno **Import bodov**. Hovorí „276 bodov načítaných ako PNEZD (z riadka záhlavia), oddelených čiarkami.“ a zobrazuje prvé riadky.
2. Kliknite na {{ui:Importovať}}.
   Pôdorys sa zaplní bodmi, vrstevnicami a okrajom povrchu. Riadok stavu dole hovorí, že body boli importované a koľko trojuholníkov má povrch (546).
3. Pozrite sa na ľavý panel pod **Body**. Body sú zoskupené podľa prvého slova ich popisu: CP, FL, GRD, RIDGE, TBN, TBS a TREE.
4. V stĺpci **Povrch** tejto tabuľky nastavte **FL**, **RIDGE**, **TBN** a **TBS** na {{ui:Hrana zlomu}}.
   Povrch sa hneď znova vytvorí. Údaje o **Povrchu** teraz hovoria „Hrany zlomu: 4“ a vrstevnice sa ostro lámu pozdĺž rigolu a hrebeňa namiesto toho, aby ich pretínali.
5. Presuňte ukazovateľ nad pôdorys. Riadok stavu zobrazuje východ a sever pod ukazovateľom a tam aj výšku terénu.
6. Pod **Zobrazenie** nastavte {{ui:Vrstevnice každých}} na 0.5 ft a zapnite {{ui:Pásma výšok}}. Pod zaškrtávacími poľami sa objaví farebná škála s legendou. Keď skončíte, pásma znova vypnite.

Teraz máte povrch jestvujúceho terénu. Ďalej cesta.

## Vytýčenie krátkej cesty

1. Stlačte {{key:A}} (alebo kliknite na {{ui:Os trasy}} v skupine **Návrh**).
2. Klikajte po sebe na tri body na stavenisku. Červená čiara sleduje ukazovateľ a zobrazuje dĺžku a smerník nasledujúcej priamej.
3. Stlačením klávesu {{key:Enter}} dokončite.
   Os trasy sa zobrazí so staničením. Pravý panel zobrazuje **Os trasy**: jej dĺžku, tabuľku PI a oblúk v strednom PI (polomer 100 ft, alebo menší, ak sa 100 ft nezmestí).
4. V pravom paneli pod **Návrhový profil** kliknite na {{ui:Začať z terénu}}.
   Pod pôdorysom sa otvorí pohľad na profil s jestvujúcim terénom a rovnou návrhovou niveletou od konca ku koncu.
5. Stlačením klávesu {{key:I}} zapnite {{ui:Pridať PVI}} a potom raz kliknite v pohľade na profil blízko stredu. Objaví sa PVI.
6. V tabuľke PVI vpravo napíšte dĺžku oblúka (napríklad 100) do poľa **Oblúk L** stredného PVI a stlačte {{key:Enter}}. Profil má teraz vertikálny oblúk s označenou hodnotou K.
7. Pod **Koridor** zaškrtnite **Viesť zostavu po návrhovom profile**.
   Cesta sa zarovná do terénu: jazdné pruhy, krajnice a svahy po líniu zásahu. Blok **Zemné práce** zobrazuje výkop a násyp.

Nerobte si starosti s presnými hodnotami. Každé číslo sa dá zmeniť v pravom paneli a {{key:Mod+Z}} vráti poslednú zmenu.

## Uloženie práce

1. Napíšte názov do **Názov** na vrchu ľavého panela.
2. Stlačte {{key:Mod+S}} (alebo kliknite na {{ui:Uložiť}}).
   Prehliadač stiahne súbor pomenovaný podľa staveniska s príponou `.civilcraft.json`. Obsahuje body, nastavenia povrchu, osi trás, profily, koridory, plošiny a potrubia.
3. Ak chcete pokračovať neskôr, kliknite na {{ui:Otvoriť}} (alebo stlačte {{key:Mod+O}}) a vyberte ten súbor, alebo ho pustite na pôdorys.

:::warning
Automatické ukladanie neexistuje. Ak zatvoríte kartu s neuloženými zmenami, prehliadač sa opýta, či ju chcete opustiť; ak ju opustíte, zmeny sú preč. Ukladajte často.
:::

## Kam ďalej

- [Import zameraných bodov](topic:import-points) z vlastných súborov.
- [Vytvorenie a spresnenie povrchu](topic:build-surface) pomocou hrán zlomu a hranice.
- [Obrazovka po častiach](topic:workspace).
- [Klávesy a myš](topic:keyboard).
