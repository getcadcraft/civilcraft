---
title: Čiary rezov a priečne rezy
summary: Rezy kolmo na os trasy, pohľad na terén, návrh a výkop a násyp na každom staničení a objemy metódou priemerných plôch na koncoch.
keywords: bilancia zemín, diagram bilancie, bod vyrovnania, zmrštenie, nafúknutie, dĺžka prevozu, zemník, skládka, listy rezov, listy priečnych rezov, pdf rezov, rezy, priečne rezy, čiary rezov, pohľad na rez, výkop, násyp, plochy, priemerná plocha koncov, objemy koncov, zemné práce, staničenie, odsadenie, csv
from: 09639ce2
---

Priečny rez zobrazuje cestu tak, ako bude postavená: naprieč osi trasy na jednom staničení, existujúci terén, návrh (koridor alebo plošina zapracovaná do terénu) a výkop a násyp medzi nimi.

## Pridanie čiar rezov

1. Vyberte os trasy. V **Vlastnostiach** v časti **Čiary rezov** kliknite na {{ui:Pridať čiary rezov}}.
2. Nastavte **Každých** (rozstup: 50 ft alebo 20 m na začiatku), **Šírka vľavo** a **Šírka vpravo** (ako ďaleko každý rez siaha od osi trasy).
3. Ak chcete rez na konkrétnom staničení, zadajte ho do **Pridať staničenie** (napríklad `2+35`) a stlačte {{key:Enter}}.

Rezy sa vedú na každom celom násobku rozstupu, na oboch koncoch osi trasy, na začiatku a konci každého oblúka (PC a PT) a na staničeniach, ktoré pridáte. Čiary rezov sa na pôdoryse zobrazujú ako sivé čiary cez os trasy; vyvádzajú sa aj do DXF, DWG a PDF na hladine C-ROAD-SCTN. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Pohľad na rez

Otvorte ho cez {{ui:Zobrazenie rezu}} vo **Vlastnostiach** osi trasy, cez {{ui:Priečne rezy}} pod **Povrch** › {{ui:Viac}}, alebo stlačte {{key:X}}. Zaberá miesto pohľadu na profil pod pôdorysom.

- Prechádzajte rezmi šípkami na jeho lište, zoznamom staníc, alebo klávesmi {{key:Left}} a {{key:Right}}, keď je pohľad na rez zameraný ({{key:Home}} a {{key:End}} pre prvý a posledný).
- Sivá čiara je existujúci terén, červená čiara návrh. Výkop je tieňovaný oranžovo, násyp zeleno. Body koridoru sú označené: CL (os trasy), EOP (hrana vozovky), SH (krajnica) a DL (čiara napojenia na terén).
- Hlavička uvádza staničenie, plochy výkopu a násypu tohto rezu a zveličenie výšky. {{ui:Prispôsobiť}} vyplní panel; zvoľte 1×, aby ste rez videli v skutočnej mierke.
- Hrubá čiara na pôdoryse ukazuje, ktorý rez je na obrazovke.
- **Priblíženie a posun:** koliesko priblíži k ukazovateľu a ťahanie posúva pohľad. {{ui:Prispôsobiť}} (alebo {{key:F}}, alebo dvojklik) znova prispôsobí celý rez.

## Meranie v reze

1. Kliknite na {{ui:Meranie}} na lište rezu, alebo stlačte {{key:M}}. Nápoveda hovorí: "Kliknite na prvý bod a potom na druhý."
2. Kliknite na dva body. Každý sa prichytí ku koncu čiary alebo bodu koridoru (CL, EOP, SH, DL); podržte {{key:Alt}} pre voľný bod.
3. Odčítanie uvádza vodorovnú vzdialenosť (ΔH), zvislú vzdialenosť (ΔV), sklon v percentách s jeho pomerom a priamu dĺžku, v jednotkách projektu.

Kliknutím znova začnete nové meranie. {{key:Esc}} ho vymaže a {{key:M}} vypne {{ui:Meranie}}.

## Listy rezov

{{ui:Listy rezov (PDF)}} pod **Čiary rezov** umiestni každý rez na strany PDF, v radoch zľava doprava a zhora nadol v poradí staníc. Vyberte **Formát papiera**, **Mierka** (vodorovná mierka rezov) a **Zveličenie profilu** (1×, 2×, 5× alebo 10×); dialóg uvádza, koľko rezov sa vojde na stranu a koľko strán to vytvorí.

Každý rez zobrazuje mriežku s odsadeniami a výškami, terén (prerušovane), návrh, výkop a násyp tieňované (oranžovo a zeleno), body koridoru a pod ním staničenie a jeho plochy výkopu a násypu. Každý rez na listoch je nakreslený rovnako veľký, dosť vysoký pre najväčší; ak sa pri vašom zveličení nevojde na stranu, CivilCraft použije najväčší, ktorý sa vojde, a povie to. Titulný pás uvádza os trasy, staničenia na tej strane, mierky a "List 1 z 3".

## Na čo sa výkop a násyp merajú

Koridor môže mať vrstvy pod vozovkou: vrstvy vozovky, časti šablóny, koľaj. Výber **Objemy merané po** v lište rezu určuje, po čo výkop a násyp idú:

- **Spodný povrch** (východiskový): po spodok týchto častí, takže výkop zahŕňa hĺbku skladby vozovky.
- **Horný povrch**: iba po vrch návrhu, ako predtým, keď sa časti nepočítali.

Plochy v hlavičke, objemy nižšie, CSV a bilancia zemín všetky nasledujú túto voľbu a uloží sa s projektom.

## Objemy metódou priemerných plôch na koncoch

Medzi dvoma susednými rezmi je objem priemer ich dvoch plôch krát vzdialenosť ich staníc. Lišta ukazuje súčty pre os trasy a {{ui:CSV}} stiahne plochy a objemy každého rezu s priebežnými súčtami (kubické yardy pre projekty v stopách, kubické metre pre metrické).

**Vlastnosti** ukazujú rovnaké súčty vedľa objemov mriežkovou metódou z [Objemy zemných prác](topic:volumes). Obe sú iné priblíženia: bližšie rezy ich priblížia k sebe a na rovnej ceste na rovnom teréne sú rovnaké.

:::note
Výkop a násyp sa počítajú iba vnútri zapracovaných plôch (čiar napojenia koridoru alebo plošiny), ako to robí mriežková metóda. Bez koridoru alebo plošiny je návrh terén, takže rez nezobrazuje žiadny výkop ani násyp.
:::

## Bilancia zemín

**Bilancia zemín** pod **Čiary rezov** nakreslí diagram bilancie zemín z tých istých objemov metódou priemerných plôch: pozdĺž staničení priebežný súčet výkopu mínus násyp.

- **Zmrštenie (−) alebo nafúknutie (+) výkopu** hovorí, čo jeden kubický yard výkopu urobí, keď sa uloží ako násyp: −10 % (východisková hodnota, zástupná) znamená, že sa zmenší na 0.9; skala, ktorá nabobtnáva, môže mať +5 %. Použite údaj zo svojho geotechnického posudku.
- Tam, kde čiara stúpa, je cesta vo výkope; kde klesá, v násype. Nad nulou (oranžovo tieňované) sa zemina presúva smerom k vyššiemu staničeniu; pod nulou (zeleno) smerom k nižšiemu.
- **Body vyrovnania** sú miesta, kde čiara pretína nulu: medzi dvoma z nich sa výkop a násyp vyrovnávajú. Tabuľka uvádza každý vyrovnaný úsek, presunutý objem (jeho najvyšší alebo najnižší bod) a priemernú vzdialenosť prevozu (tieňovaná plocha delená týmto objemom).
- Kde čiara končí mimo nuly, zostatok je **skládka** (nad) alebo **zemník** (pod). V tom poslednom úseku sa ako presunutá počíta iba zemina za úrovňou, na ktorej čiara končí.

**CSV** uloží ordinátu bilancie pri každom reze, úseky a faktor.
