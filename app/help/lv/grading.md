---
title: Vertikāli plānot ēkas platformu
summary: Uzzīmēt līdzenu platformu, iestatīt tās augstumu un griezuma un uzbēruma slīpumus, ļaut CivilCraft to vertikāli plānot ar dienasgaismas līniju pret esošo zemi un pievienot projektētajai virsmai.
keywords: atbalsta siena, atbalsta sienas, vertikāla mala, siena slīpuma vietā, sānu slīpums katrā pusē, uzbērums, vertikālā plānošana, platforma, ēkas platforma, dienasgaismas līnija, griezuma slīpums, uzbēruma slīpums, gala augstums, projektētā virsma, vietas vertikālā plānošana
from: 482319a6
---

Platforma ir līdzena zona vienā augstumā. No tās malas CivilCraft plāno uz āru ar jūsu griezuma slīpumu, kur zeme ir augstāk par platformu, un ar jūsu uzbēruma slīpumu, kur tā ir zemāk, līdz slīpums sasniedz esošo zemi. Šī saskares līnija ir dienasgaismas līnija. Platforma un tās slīpumi aizstāj esošo zemi dienasgaismas līnijas iekšpusē, veidojot projektēto virsmu.

## Uzzīmēt platformu

Vispirms vajadzīga esoša zemes virsma.

1. Nospiediet {{key:G}} vai noklikšķiniet {{ui:Platforma}} grupā **Projektēšana**.
   Norāde saka: "Platforma: noklikšķiniet tās stūrus. Enter vai dubultklikšķis pabeidz, Backspace noņem pēdējo, Esc atceļ."
2. Noklikšķiniet platformas stūrus pēc kārtas, jebkurā virzienā. Zils kontūrs seko rādītājam.
3. Nospiediet {{key:Enter}} pēc pēdējā stūra (vismaz trīs).
   Platforma tiek uzzīmēta un atlasīta. Tā sākas ar zemes augstumu tās vidū, noapaļotu līdz 0.1, ar 2 : 1 griezuma slīpumu un 3 : 1 uzbēruma slīpumu. Statusa rindā, piemēram, teikts: "Platforma 1 augstumā 254.3 (zeme tās vidū), griezums 2:1, uzbērums 3:1. Mainiet tos sadaļā Rekvizīti."

:::warning
Pabeidziet ar {{key:Enter}}. Dubultklikšķis arī pabeidz, bet šajā versijā tas noņem stūri, uz kura dubultklikšķināts. Noklikšķiniet pēdējo stūri vienreiz un tad nospiediet {{key:Enter}}.
:::

Platformas kontūrs nedrīkst krustoties pats ar sevi ("Platformas kontūrs krustojas pats ar sevi.").

## Iestatīt augstumu un slīpumus

Kad platforma ir atlasīta, labajā panelī redzama sadaļa **Platforma**:

1. **Nosaukums**.
2. **Augstums**: platformas līdzenais augstums.
3. **Griezuma slīpums** un **Uzbēruma slīpums** kā H:V (2 nozīmē 2 : 1). Abiem jābūt lielākiem par 0.
4. **Platformas laukums** un **Stūri** tiek rādīti informācijai.

Pēc katras vērtības nospiediet {{key:Enter}}. Dienasgaismas līnija, projektētā virsma un apjomi atjaunojas uzreiz.

Zem laukiem rindā teikts, piemēram: "Dienasgaismas līnija: 48 slīpuma līnijas (20 griezumā, 28 uzbērumā), tālākā 31.20 ft no malas." Plānā dienasgaismas līniju un slīpuma līnijas rāda magentā krāsā.

## Kā atrod dienasgaismu

- Slīpuma līnijas iziet no katras malas taisni pret to, aptuveni ik pēc divdesmitās daļas no platformas izmēra.
- Ārējos stūros tās izplešas ik pēc 10°, lai slīpums apietu stūri.
- Iekšējos stūros viena līnija iet pa bisektrisi, kur slīpumi no abām malām satiekas.
- Katra līnija paceļas ar griezuma slīpumu vai nolaižas ar uzbēruma slīpumu, līdz sasniedz zemi.

## Slīpumi pa malām un atbalsta sienas

Sadaļā **Malas un atbalsta sienas** platformas, laukuma vai valnīša rekvizītos katru malu var plānot atsevišķi. 1. mala iet no pirmā stūra, ko noklikšķinājāt, līdz otrajam; 2. mala no otrā līdz trešajam, un tā tālāk.

- **Visas malas**: **Slīpa** izmanto iepriekš minētos griezuma un uzbēruma slīpumus visās malās; **Vertikāla: atbalsta sienas** novieto sienu katrā malā.
- Katrai malai: **Slīpumi virs**, **Savi slīpumi** (ierakstiet griezuma un uzbēruma slīpumu šai malai) vai **Vertikāla (atbalsta siena)**.
- Ierakstiet slīpumu kā `3` vai `3:1` (horizontāli pret 1 vertikāli), `33%` vai `18.4°`; tas tiek rādīts kā H:1. Platformas paša **Griezuma slīpums** un **Uzbēruma slīpums** pieņem to pašu.
- Vertikālai malai nav uzbēruma: atbalsta siena iet gar malu no platformas līdz esošajai zemei (uzbērumā) vai no zemes līdz platformai (griezumā). **Sienas biezums** (sākumā 0.3 m vai 1 ft) ir tas, cik tālu zeme pāriet no platformas malas līdz esošajai zemei. Griezuma un uzbēruma apjomi neietver uzbērumu, kuru šī mala vairs nesatur.
- Kur siena satiekas ar slīpu malu, slīpums apiet sienas galu; divas sienas savienojas šķautņu savienojumā.
- Zem laukiem: sienu garums, atklātā virsma (augstums × garums), augstākais un vidējais augstums.

Plānā katras sienas ārējā virsma ir atzīmēta ar īsām svītrām pāri tai un tās augstumu abos galos un augstākajā punktā (atbalsta sienu slānī, kas iekļaujas arī DXF un DWG). 3D skats rāda sienas kā cietus ķermeņus (Rādīt › Atbalsta sienas), un GLB, OBJ un USD eksporti tās iekļauj. Griezumi pāri malai rāda pakāpienu.

**Brīdinājumi** (rekvizītos un problēmu panelī): siena, kas augstāka par **Brīdināt, ja sienas augstums pārsniedz** (sākumā 1.0 m vai 3.3 ft), "var būt nepieciešama inženiertehniska siena vai atļauja; pārbaudiet vietējos noteikumus", un, kad ierakstāt **Stāvākais slīpums, ko grunts notur**, jebkura mala, kuras griezuma vai uzbēruma slīpums ir stāvāks par to. Tie ir brīdinājumi: vertikālā plānošana tik un tā tiek veidota. Katra izmaiņa ir viens solis {{key:Mod+Z}}.

## Pārvietot stūrus

Atlasiet platformu un velciet kvadrātisku rokturi pie stūra. Katra vilkšana ir viens atsaucams solis. Stūra pievienošana vai noņemšana vēl nav pieejama: dzēsiet platformu un uzzīmējiet to vēlreiz.

## Kad vertikālā plānošana nenotiek

Sarkana kaste zem **Zemes darbi** nosauc platformu un problēmu:

| Ziņojums | Ko darīt |
|---|---|
| "3 slīpuma līnijas iziet ārpus virsmas, pirms sasniedz to: platforma ir pārāk tuvu virsmas malai vai pārāk augstu/zemu." | Pārvietojiet platformu no virsmas malas uz iekšu vai tuviniet tās augstumu zemei. |
| "Dienasgaismas līnija krustojas pati ar sevi (slīpumi no dažādām platformas malām saskrienas). Pārveidojiet platformu vai mainiet slīpumus." | Raksturīgi šaurām vai L formas platformām dziļā griezumā vai augstā uzbērumā. Padariet platformu platāku, samaziniet starpību vai padariet slīpumus stāvākus. |
| "Platformas kontūrs krustojas pats ar sevi." | Pārzīmējiet stūrus pēc kārtas ap platformu. |

Platforma ar problēmu tiek izlaista no projektētās virsmas un apjomiem, līdz tā ir salabota.

## Skatīt rezultātu

1. Sadaļā **Attēlojums** iestatiet **Virsma** uz {{ui:Projektētā (ar slīpumiem)}}. Horizontāles tagad iet līdzeni pāri platformai un seko slīpumiem līdz dienasgaismas līnijai.
2. Pārvietojiet rādītāju virs platformas: statusa rindā tiek rādīti **Zeme** un **Ar slīpumiem** augstumi.
3. Lasiet griezumu un uzbērumu sadaļā **Zemes darbi**; skatiet [Zemes darbu apjomi](topic:volumes).

Platformas tiek vertikāli plānotas pēc koridoriem, tādā secībā, kādā tās uzzīmētas. Vēlāka platforma aizstāj visu, kas agrāk atradās tās pašas dienasgaismas līnijas iekšpusē.

## Dzēst platformu

Atlasiet to un nospiediet {{key:Delete}} (Mac datorā Fn un delete) vai noklikšķiniet {{ui:Dzēst}}.

## Vēl nav izveidots

Platformas ir līdzenas: slīpas platformas, pārejas līnijas ar mainīgu slīpumu, terases un vertikālā plānošana līdz attālumam vai augstuma mērķim vēl nav pieejamas. Skatiet [Vēl nav izveidots](topic:not-built-yet).
