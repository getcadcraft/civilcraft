---
title: Čiary rezov a priečne rezy
summary: Rezy kolmo na os trasy, pohľad na terén, návrh a výkop a násyp pri každom staničení a objemy metódou priemerných koncových plôch.
keywords: bilancia zemín, diagram bilancie zemín, bod bilancie, zmrštenie, nafúknutie, dĺžka prepravy, zemník, skládka, listy rezov, priečne rezy, objemy, priemer koncových plôch, výkop, násyp, plochy, staničenie, odsadenie, CSV, zemné práce, čiary rezov, zobrazenie rezu, koridor
from: 5060173c
---

Priečny rez ukazuje cestu tak, ako sa postaví: priečne na os trasy na jednom staničení, jestvujúci terén, návrh (koridor alebo plošina zarovnaná do terénu) a výkop a násyp medzi nimi.

## Pridanie čiar rezov

1. Vyberte os trasy. Vo **Vlastnostiach**, pod **Čiary rezov**, kliknite na {{ui:Pridať čiary rezov}}.
2. Nastavte **Každých** (rozstup: na začiatok 50 ft alebo 20 m), **Šírka vľavo** a **Šírka vpravo** (ako ďaleko každý rez siaha od osi).
3. Ak chcete rez na konkrétnom staničení, zadajte ho do poľa **Pridať staničenie** (napríklad `2+35`) a stlačte {{key:Enter}}.

Rezy sa vytvárajú pri každom celom násobku rozstupu, na oboch koncoch osi trasy, na začiatku a konci každého oblúka (PC a PT) a pri staničeniach, ktoré pridáte. Čiary rezov sú v pôdoryse zobrazené ako sivé čiary napríč osou; idú aj do DXF, DWG a PDF na hladinu C-ROAD-SCTN. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Zobrazenie rezu

Otvorte ho cez {{ui:Zobrazenie rezu}} vo **Vlastnostiach** osi trasy, {{ui:Priečne rezy}} pod **Povrch** › {{ui:Viac}}, alebo klávesom {{key:X}}. Nahrádza pohľad na profil pod pôdorysom.

- Prechádzajte rezy šípkami na jeho lište, zoznamom staníc alebo klávesmi {{key:Left}} a {{key:Right}}, keď je zobrazenie rezu zamerané ({{key:Home}} a {{key:End}} pre prvý a posledný).
- Sivá čiara je jestvujúci terén, červená čiara návrh. Výkop je vyšrafovaný oranžovo, násyp zeleno. Body koridoru sú označené: CL (os), EOP (okraj vozovky), SH (krajnica) a DL (napojenie na terén).
- Hlavička uvádza staničenie, plochy výkopu a násypu tohto rezu a zvislé zväčšenie. **Prispôsobiť** vyplní panel; zvoľte 1×, aby ste videli rez v pravej mierke.
- Hrubá čiara v pôdoryse ukazuje, ktorý rez je na obrazovke.

## Listy rezov

{{ui:Listy rezov (PDF)}} pod **Čiarami rezov** umiestni každý rez na stránky PDF, v riadkoch zľava doprava a zhora nadol v poradí staníc. Zvoľte **Formát papiera**, **Mierku pôdorysu** (vodorovnú mierku rezov) a **Zväčšenie profilu** (1×, 2×, 5× alebo 10×); dialóg povie, koľko rezov sa zmestí na stranu a koľko strán to vytvorí.

Každý rez zobrazuje mriežku s odsadeniami a výškami, terén (prerušovane), návrh, výkop a násyp vyšrafované (oranžovo a zeleno), body koridoru a pod ním svoje staničenie a plochy výkopu a násypu. Každý rez na listoch je nakreslený rovnakej veľkosti, dostatočne vysoký pre najväčší; ak sa pri vašom zväčšení nezmestí na stranu, CivilCraft použije najväčší, ktorý sa zmestí, a povie to. Pásik s názvom uvádza os trasy, staničenia na tejto strane, mierky a "List 1 z 3".

## Objemy metódou priemerných koncových plôch

Medzi dvoma susednými rezmi je objem priemerom ich dvoch plôch krát vzdialenosť ich staníc. Lišta zobrazuje súčty pre os trasy a {{ui:CSV}} stiahne plochy a objemy každého rezu s priebežnými súčtami (yd³ pre projekty v stopách, m³ pre metrické).

**Vlastnosti** zobrazujú rovnaké súčty vedľa objemov metódou sietí z [Objemy výkopov a násypov](topic:volumes). Obe sú iné aproximácie: bližšie rezy ich priblížia, a na rovnej ceste na rovnom teréne sú rovnaké.

:::note
Výkop a násyp sa počítajú iba v zarovnaných plochách (v napojeniach koridoru alebo plošiny), rovnako ako metóda sietí. Bez koridoru alebo plošiny je návrh terén, takže rez neukazuje žiadny výkop ani násyp.
:::

## Bilancia zemín

**Bilancia zemín** pod **Čiarami rezov** kreslí diagram bilancie zemín z tých istých objemov metódou koncových plôch: pozdĺž staníc priebežný súčet výkopu mínus násyp.

- **Zmrštenie (−) alebo nafúknutie (+) výkopu** hovorí, čo z jedného yd³ výkopu vznikne, keď sa uloží ako násyp: −10 % (východisková, zástupná hodnota) znamená zmrštenie na 0.9; hornina, ktorá nabobtnáva, môže byť +5 %. Použite hodnotu z vášho geotechnického posudku.
- Kde čiara stúpa, cesta je vo výkope; kde klesá, v násype. Nad nulou (vyšrafované oranžovo) sa zemina presúva smerom k vyššiemu staničeniu; pod nulou (zeleno) smerom k nižšiemu.
- **Body bilancie** sú miesta, kde čiara pretína nulu: medzi dvoma z nich sa výkop a násyp vyrovnávajú. Tabuľka uvádza každý vyrovnaný úsek, presunutý objem (jeho najvyšší alebo najnižší bod) a priemernú dĺžku prepravy (vyšrafovaná plocha delená týmto objemom).
- Kde čiara končí mimo nuly, zvyšok je **skládka** (nad nulou) alebo **zemník** (pod nulou). V tomto poslednom úseku sa ako presunutá počíta iba zemina za úrovňou, na ktorej čiara končí.

**CSV** uloží hodnotu bilancie v každom reze, úseky a činiteľ.
