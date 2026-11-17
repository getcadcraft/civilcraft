---
title: Reljefa veidošana ainavai
summary: Platformas, uzbērtnes, zemesgrāvji un brīvs reljefs ar punktveida augstumiem un horizontālēm, ko velciet; izrakums un uzbērums tiešā laikā, nogāzes analīze, plūsmas bultiņas un ūdens uzkrāšanās — viss CivilCraft projektētajā virsmā.
keywords: atbalstsiena, atbalstsienas, vertikāla mala, siena nogāzes vietā, nogāzes katrai malai, uzbērums, reljefs, ainavas reljefs, platforma, terase, kupenis, uzbērtne, zemesgrāvis, punktveida augstums, punktveida līmenis, horizontāles, horizontāļu rediģēšana, izrakums un uzbērums, zemes darbi, nogāzes analīze, pieejamība, stāvas nogāzes, plūsmas bultiņas, drenāža, ūdens uzkrāšanās, peļķes
from: e1559eb9
---

Viss šeit tiek veidots **projektētajā virsmā** ar tādu pašu reljefu kā platformas un koridori. **Esošā zeme** nekad netiek mainīta, un Zemes darbi to visu skaita. Reljefa izvēlne atrodas grupā Ainava.

## Platformas

{{ui:Reljefs}} › {{ui:Platforma}}, tad noklikšķiniet stūrus un nospiediet {{key:Enter}}. Platforma sākas ar vidējo zemes augstumu zem tās; ievadiet **Augstums**, lai to iestatītu, vai iztukšojiet, lai tā atkal sekotu zemei. **Kritums** % un **Krīt uz** grādos (0 = austrumi, 90 = ziemeļi) to sašķiebj. Tās malas tiek izlīdzinātas līdz zemei ar **Izrakuma nogāzi** un **Uzbēruma nogāzi** (horizontāli līdz 1).

## Nogāzes pa malām un atbalstsienas

Platformas vai uzbērtnes rekvizītos sadaļā **Malas un atbalstsienas** katru malu var izlīdzināt savādāk. 1. mala iet no pirmā stūra, uz kuru noklikšķinājāt, līdz otrajam; 2. mala no otrā līdz trešajam, un tā tālāk.

- **Visas malas**: **Slīpa** izmanto iepriekš minētās izrakuma un uzbēruma nogāzes katrā malā; **Vertikālas: atbalstsienas** liek sienu katrā malā.
- Katrai malai atsevišķi: **Virs nogāzēm**, **Savas nogāzes** (ievadiet izrakuma un uzbēruma nogāzi šai malai) vai **Vertikāla (atbalstsiena)**.
- Nogāzi ievadiet kā `3` vai `3:1` (horizontāli pret 1 vertikāli), `33%` vai `18.4°`; tā tiek rādīta kā H:1. Platformas paša **Izrakuma nogāze** un **Uzbēruma nogāze** pieņem to pašu.
- Vertikālai malai nav uzbērtnes: atbalstsiena iet gar malu no platformas uz leju līdz esošajai zemei (uzbērumā) vai no zemes uz leju līdz platformai (izrakumā). **Sienas biezums** (sākumā 0.3 m vai 1 ft) ir tas, cik tālu zeme pakāpjas no platformas malas līdz esošajai zemei. Izrakuma un uzbēruma tilpumos netiek skaitīta uzbērtne, kuras šai malai vairs nav.
- Vietā, kur siena saskaras ar slīpu malu, nogāze apiet sienas galu; divas sienas saskaras šķautnē.
- Laukos zem tiem: sienu garums, atklātais sejas laukums (augstums × garums), augstākais un vidējais augstums.

Plānā katras sienas ārējā mala ir attēlota ar īsām svītrām pāri tai, un tās augstums ir rādīts abos galos un augstākajā vietā (slānī Atbalstsienas, kas iekļaujas arī DXF un DWG). 3D skatā sienas redzamas kā cietas formas (**Rādīt** › Atbalstsienas), un GLB, OBJ un USD eksporti tās iekļauj. Griezumi pāri malai parāda pakāpienu.

**Brīdinājumi** (rekvizītos un Problēmu panelī): siena, kas augstāka par **Brīdināt virs sienas augstuma** (sākumā 1.0 m vai 3.3 ft), "var būt vajadzīga inženiera projektēta siena vai atļauja; pārbaudiet vietējos noteikumus", un, kad ierakstāt **Stāvākā nogāze, ko grunts notur**, jebkura mala, kuras izrakuma vai uzbēruma nogāze ir stāvāka par to. Tie ir brīdinājumi: reljefs tik un tā tiek veidots. Katra izmaiņa ir viens solis {{key:Mod+Z}}.

## Uzbērtnes

{{ui:Reljefs}} › {{ui:Uzbērtne}}: kupenis, kura virsotne ir **Augstums** virs vidējās zemes zem tās, ar izlīdzinātām malām.

## Zemesgrāvji

{{ui:Reljefs}} › {{ui:Zemesgrāvis}}, tad noklikšķiniet gar zemesgrāvi **tajā virzienā, kādā ūdens tek**, un nospiediet {{key:Enter}}. Iestatiet tā **Dziļumu**, **Apakšas platumu** (0 V formai) un **Malas nogāzi**. Bez **Krituma** tā apakša seko zemei, tās dziļums zem tās un nekad neiet augšup; ievadiet kritumu, lai tam būtu vienmērīgs kritums no sākuma.

## Punktveida augstumi un horizontāles

1. {{ui:Reljefs}} › {{ui:Vertikālās plānošanas laukums}}: noklikšķiniet to laukuma kontūru, kuru vēlaties veidot.
2. {{ui:Reljefs}} › {{ui:Punktveida augstums}}: noklikšķiniet laukuma iekšpusē. Ievadiet tā augstumu rekvizītos vai izmantojiet pogas ▲ ▼.
3. {{ui:Reljefs}} › {{ui:Rediģēt horizontāli}}: noklikšķiniet horizontāli laukuma iekšpusē, lai to paņemtu kā līniju, ko var pārveidot.

Atlasiet punktu vai horizontāli un **velciet** (vai tās punktus) plānā: virsma seko, kad atlaižat, viens atsaukšanas solis. Laukuma iekšpusē zeme tiek pārveidota no tās malas (kur tā saskaras ar esošo zemi), punktveida augstumiem un rediģētajām horizontālēm.

## Izrakums un uzbērums tiešā laikā

Katra reljefa objekta rekvizītos ir rādīts tā **Izrakums** un **Uzbērums** un visas vietas kopā, pēc režģa metodes, ko izmanto Zemes darbi, kad to maināt. Problēmas (ārpus virsmas, kontūra, kas krustojas pati ar sevi) ir uzskaitītas tur.

## Reljefa pārbaudes

Sadaļā **Reljefa pārbaudes** kreisajā pusē:

- **Nogāzes analīze** krāso virsmu pēc slīpuma: līdz maigajai robežai, starp robežām un stāvāk par stāvo robežu (sākumā 5 % un 33.3 %: parastais 1:20 pieejamiem maršrutiem un 1:3 pļaušanai). Legenda parāda, cik daļa platības iekrīt katrā. Stāvās vietas tiek izdrukātas arī uz lapām.
- **Plūsmas bultiņas un ūdens uzkrāšanās** parāda, kurp tek ūdens, un iezīmē katru vietu, kur tas uzkrāsies, ar tā dziļumu; sadaļa parāda, cik vietu ir, dziļākā un cik ūdens tās satur.

Pārbaudes nolasa projektēto virsmu, ja kaut kas ir veidots, citādi esošo zemi.
