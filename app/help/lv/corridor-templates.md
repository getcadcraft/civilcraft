---
title: Koridoru veidnes un reljefa veidnes
summary: Izveidojiet nelielas atkārtoti lietojamas veidnes (bordiūra un notekas, ietve, siena, grāvis), veidojiet koridoru no tām pēc piketa ar kreiso un labo pusi atsevišķi, sadaliet trasi vairākos koridoros un uzklājiet slāņotus materiālus uz reljefa.
keywords: veidne, veidnes, veidņu bibliotēka, veidņu izveide, tipiskais šķērsgriezums, sastāvs, apakšsastāvs, komponentes, punktu kodi, beigu nosacījums, nogāzes robeža, grāvis, atbalstsiena, bordiūrs, notekas, ietve, apgabali, piketu diapazons, vairāki koridori, kreisā un labā puse, reljefa veidne, augsnes slānis, segums, pamats, uzklāt, materiāli, apjomi
from: ce70e58b
---

**Veidne** ir nelielu šķērsgriezumu, ko zīmējat vienreiz un izmantojat atkārtoti: punkti ar nobīdēm, slīpumiem un punktu kodiem, kā arī komponentes ar materiāliem. Koridoru var veidot no veidnēm pēc piketa, katrā pusē ar savām segumu veidnēm un savu beigu nosacījumu, un tās pašas veidnes var uzklāt uz reljefa.

:::warning
Piemēra veidnes ir vietturi, no kuriem sākt. To skaitļi nav ņemti no kāda standarta vai aģentūras. Inženierim jāpārbauda katra veidne un katra tai dotā vērtība, pirms tā tiek izmantota projektā.
:::

## Atvērt veidnes

Atveriet {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Koridoru veidnes…}} (vai ierakstiet {{cmd:TEMPLATES}}). Logā ir trīs saraksti:

- **Šajā projektā**: veidnes, ko izmanto šā projekta koridori un reljefa veidnes. Tās tiek saglabātas projekta failā.
- **Mana bibliotēka**: veidnes, kas glabājas šajā pārlūkprogrammā un ir pieejamas katrā projektā. Lai to saglabātu, izmantojiet {{ui:Saglabāt Manā bibliotēkā}} projekta veidnei.
- **Piemēri**: divas joslas ar kursiem, bordiūrs un notekas, ietve, nogāzes robeža, grāvis, atbalstsiena, augsnes slānis zem reljefa un segums uz reljefa. Katra ir atzīmēta ar „Pārbauda inženieris“.

{{ui:Izmantot šajā projektā}} kopē bibliotēkas vai piemēra veidni projektā. {{ui:Eksportēt šī projekta veidnes}} saglabā tās kā `.cctemplates.json` failu, un {{ui:Importēt failu}} nolasa vienu failu projektā un Manā bibliotēkā. Izmantojiet failu, lai dalītos ar veidnēm vai pārceltu tās uz citu datoru.

## Izveidot veidni

{{ui:Jauna veidne}} (vai {{ui:Rediģēšana}} projekta veidnei) atver veidņu redaktoru. Zīmējiet labo pusi, sākot no veidnes punkta 0,0 uz āru; kreisā puse izmanto to pašu veidni uz āru pa kreisi.

1. Piešķiriet tai nosaukumu un veidu: **Segums** (nākamā veidne piestiprinās tās galam), **Beigu nosacījums** (tā satiekas ar terēnu) vai **Reljefa veidne**.
2. Pievienojiet **vērtības**: nosauktus skaitļus, piemēram, platumu `w` vai slīpumu `s`. Skaitļa lauks jebkurā veidnes vietā pieņem skaitli vai vērtības nosaukumu; `-t` ir vērtība `t`, kas padarīta negatīva. Koridors var dot katrai veidnes izmantošanai savas vērtības, tāpēc viena bordiūra veidne kalpo katram bordiūra augstumam.
3. Pievienojiet **punktus** secībā. Katrs tiek novietots no iepriekšēja punkta (vai punkta 0,0) pēc sava ierobežojuma:

| Ierobežojums | Ko novieto punkts |
|---|---|
| Nobīde ar slīpumu | Nobīdi uz āru un slīpumu (pacēlums uz garumu; −0.02 nozīmē 2% krišanu) |
| Nobīde un pacēlums | Nobīdi un pacēlumu |
| Taisni uz augšu vai uz leju | Tikai pacēlumu |
| Sānu nogāze līdz terēnam | Uz āru no sava punkta līdz terēnam, griezuma attiecībā, kur terēns ir augstāk, un uzbēruma attiecībā, kur tas ir zemāk |
| Līdz terēnam | Nobīdi, tad taisni uz augšu vai uz leju līdz terēnam |
| Atbalstsiena | Sienu ar jūsu norādīto biezumu: griezumā tās augša satiekas ar terēnu pie ceļa malas, uzbērumā ceļš iet pāri tai un tās ārējā mala krītas līdz terēnam |

   Atzīmējiet **Augšā** punktus, caur kuriem iet gatavā virsma. Pēdējais augšējais punkts ir vieta, kur sākas nākamā veidne šajā pusē. **Mērķis** ļauj koridoram pārvietot punktu: tā nobīde vai augstums nāk no līnijas.
4. Pievienojiet **komponentes**: slēgtas formas, kas veidotas ar punktu kodiem (`0` ir punkts 0,0), katrai ar nosaukumu, materiālu un veidu. To laukumi dod tilpumus.

Zīmējums seko katrai izmaiņai pareizā mērogā, un saraksts zem tā norāda, kas nav kārtībā (punkts, kas satiekas ar terēnu pirms beigām, vērtība, kuru veidnei nav, komponente bez laukuma). {{ui:Pievienot šim projektam}} vai {{ui:Saglabāt}} to paturē kā vienu atsaukšanas soli.

## Veidot koridoru no veidnēm

Izvēlieties trasi ar koridoru un tās Rekvizītos ieslēdziet {{ui:Veidot no veidnēm pēc piketa}}. Koridors sākas ar divu joslu un nogāzes robežas piemēriem abās pusēs.

- **Apgabali.** Katrs apgabals sākas piketā un iet līdz nākamā apgabala sākumam. {{ui:Pievienot apgabalu}} pievieno vienu; mainiet tā sākuma piketu tā lodziņā.
- **Kreisā un labā puse atsevišķi.** Katrai pusei katrā apgabalā ir sava **Segumu** saraksts no centrālās līnijas uz āru un savs **Beigu nosacījums**: nogāzes robeža, grāvis, siena vai jebkura veidne, kas satiekas ar terēnu. Bez beigu nosacījuma puse sasniedz nogāzes robežu koridora griezuma un uzbēruma slīpumos. {{ui:Kopēt no kreisās uz labo}} kopē vienu pusi.
- **Vērtības un mērķi.** Zem katras veidnes vienā pusē ir lodziņš katrai vērtībai (tukšs = veidnes pašas vērtība) un, punktam, kas pieņem mērķi, līnija, kuru pārvieto, — ceļa līnija vai citas koridora līnija.
- **No** un **Līdz** ierobežo koridoru līdz daļai no trases.

Griezumi, plāna līnijas katram punkta kodam, projektētā virsma, nospraušana un zemes darbi visi seko. Rekvizīti rāda katras komponentes tilpumu katrā pusē un apgabalā (vidējie galu laukumi gar centrālo līniju). Virsaugstināšana un koridora malu mērķi netiek izmantoti, kamēr koridors ir veidots no veidnēm.

## Vairāki koridori vienā trasē

Sadaļā **Koridori šajā trasē** {{ui:Pievienot koridoru}} pievieno koridoru pārējai trasei: pirmajam koridoram tiek dots beigu piketu vidū (vai tas paturē savu), un jaunais sākas tur ar pirmā koridora pēdējo veidņu apgabalu. Katram koridoram ir savs nosaukums, piketu diapazons, veidnes un zemes darbi. Izslēdziet vienu ar tā {{ui:Ieslēgts}} lodziņu. Ja diapazoni pārklājas, vēlākais koridors izlīdzina pār agrāko.

## Reljefa veidnes

Reljefa veidne uzklāj veidnes slāņus uz reljefa no tās punkta 0,0: slānis zem punkta 0,0 iet zemē (augsne, ko noņemt), slānis virs tā atrodas uz terēna (pamats un segums stāvvietā). Platumi un slīpumi nav svarīgi, svarīgs ir tikai katras komponentes dziļums virs vai zem punkta 0,0.

Atveriet {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Reljefa veidnes…}} (vai ierakstiet {{cmd:TERRAINTEMPLATES}}); bloks ir arī projekta Rekvizītos. {{ui:Pievienot reljefa veidni}} pievieno vienu ar augsnes piemēru. Katrai izvēlieties:

- **veidni** (tās vērtības šai var mainīt),
- **reljefu**: esošo terēnu vai projektēto virsmu,
- **formu**, kas to apgriež: visu reljefu, zemesgabalu, platformu vai slēgtu raksturlīniju. Vairākas reljefa veidnes var izmantot dažādas formas uz viena reljefa.

Katrā slānī ir norādīts tā biezums, plāna laukums un tilpums. Tilpums ir plāna laukums reizināts ar biezumu, biezums mērīts taisni uz leju; laukums tiek mērīts režģī, un tiek dots arī uzklātais (slīpais) laukums. Formas tiek zīmētas plānā slānī C-TOPO-TMPL. Reljefa veidnes nemaina projektēto virsmu.

## Materiāli un daudzumi

Projekta bloks **Zemes darbi** uzskaita **Materiālus no veidnēm**: katru koridora komponenti un reljefa veidnes slāni ar tā tilpumu. {{ui:Nosūtīt uz TakeoffCraft}} tos ieraksta daudzumu failā pēc griezuma un uzbēruma, katru kā vienu vienumu, kubikjardos (pēdu projektiem) vai kubikmetros.

## Faili

Veidnes, apgabali, papildu koridori un reljefa veidnes tiek saglabāti projekta failā. Projekts, kas neizmanto nevienu no tiem, tiek saglabāts tieši kā iepriekš, un vecākas CivilCraft versijas atver projektu, kas tos izmanto (tās ignorē veidnes un izveido koridora pašu sastāvu).
