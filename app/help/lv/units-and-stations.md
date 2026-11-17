---
title: Mērvienības, stacijas un skaitļu formāti
summary: Pēdu un metru projekti, kā stacijas, slīpumi, sānu nogāzes, rumbi, laukumi, tilpumi un cauruļu izmēri tiek rakstīti un ievadīti, un ko dara mērvienību maiņa.
keywords: garuma ievade, aritmētika, kalkulators, summa, daļa, pēdas un collas, 4+7/16, mērvienības, pēdas, ASV mērījumu pēdas, metri, metriskā sistēma, collu sistēma, stacijas formāts, stacionēšana, slīpums, procenti, sānu nogāze, h:v, rumbs, kubikjardi, diametrs
from: 0b9b5b6b
---

## Projekta mērvienības

Projekts ir **ASV pēdās** vai **metros** (**Mērvienības** kreisajā panelī). Katra koordināta, augstums, garums un stacija projektā ir šajā mērvienībā.

:::warning
Mainot **Mērvienības**, mainās uzraksti, stacijas formāts, noklusējumi un tas, kā faili tiek rakstīti. Tas **nepārveido** nevienu skaitli. Vieta, kas uzmērīta pēdās un pārslēgta uz metriem, paturēs tos pašus skaitļus, tagad lasītus kā metri. Statusa joslā rakstīts "Units are now metres. Coordinates were not converted." Pirms projektēšanas iestatiet mērvienības atbilstoši saviem datiem.
:::

Atkarībā no mērvienībām:

| | ASV pēdas | Metri |
|---|---|---|
| Stacijas formāts | `12+34.56` (100 ft stacijas) | `1+234.567` (1000 m stacijas) |
| Piedāvātie horizontāļu intervāli | 0.25 līdz 20 ft | 0.1 līdz 10 m |
| Laukums | sq ft | sq m |
| Tilpums | cu yd | cu m |
| Cauruļu un konstrukciju diametrs | collas | milimetri |
| Noklusējuma līknes rādiuss | 100 ft | 30 m |
| Stacionēšanas atzīmes plānā | ik 50 ft, uzraksti ik 100 ft | ik 20 m, uzraksti ik 100 m |
| Plāna mērogi | 1" = 5' līdz 1" = 1000' | 1:50 līdz 1:10000 |
| LandXML lineārā mērvienība | USSurveyFoot | meter |

Jauns projekts sākas pēdās vai metros, ja garuma mērvienība, kas atzīmēta **Iestatījumi** › **Vispārīgi** › **Mērvienības**, ir metriska. Saraksts **Mērvienības** rāda tur ieslēgtās mērvienības un vienmēr projekta pašas. Ja tur atzīmēta laukuma vai tilpuma mērvienība (akri, hektāri, akru pēdas …), laukumi un tilpumi tiek rādīti tajā, nevis iepriekš minētajā kolonnā. Skatiet [Mērvienības, ievadītās vērtības un mērvienību saraksti](common:unit-lists).

Atverot LandXML, projekts pārņem faila mērvienības. Fails starptautiskajās pēdās atveras kā pēdu projekts; skaitļi netiek mainīti.

## Garumu un summu ievadīšana

Jebkurš lodziņš, kas pieņem garumu vai augstumu, nolasa vairāk nekā vienkāršu skaitli: nospiediet {{key:Enter}}, un lodziņā parādās rezultāts projekta mērvienībās.

| Jūs ierakstāt | Pēdu projektā | Metru projektā |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | tie paši garumi metros |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | pēdās | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, un pārējie ASV mērījumu pēdās | tie paši garumi metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summa, pēdās | summa, metros |

Jebkurš garuma apzīmējums no kopīgās mērvienību tabulas darbojas ar savu precīzo izmēru: projekta pēdas ir ASV mērījumu pēdas, tātad `10 US ft` ir 10, bet `3 ch` (starptautiskās pēdas ķēde) ir 197.9996. Izmantojiet `+ - * /` un iekavas, kā arī `abs`, `round`, `ceil` un `floor`. Domuzīme, ierakstīta garumā, ir tā daļa (`24'-6"`, `6-1/2`); ar atstarpēm ap to tā atņem (`24' - 6"` = 23.5 ft). Vienkāršs skaitlis reizina vai dala garumu, un, pieskaitīts garumam, tas ir garums projekta mērvienībās. Ja CivilCraft nevar nolasīt ierakstīto, lodziņš tiek atzīmēts un statusa joslā norādīts, kur.

Stacijas nav summas: `10+00` stacijas lodziņā ir stacija 10+00. Slīpumi procentos, punktu numuri un apraksti tiek nolasīti tā, kā ierakstīti.

## Stacijas

Stacija ir attālums pa trasi, rakstīts ar plusa zīmi:

- Pēdas: daļa pirms plusa ir simti pēdu. `12+34.56` ir 1,234.56 ft.
- Metri: daļa pirms plusa ir tūkstoši metru. `1+234.567` ir 1,234.567 m.
- Negatīvas stacijas patur zīmi priekšā: `-0+50.00`.

Jebkur, kur ierakstāt staciju (**Sākuma stacija**, PVI **Stacija**), varat to ierakstīt ar plusu (`12+34.56`) vai kā vienkāršu skaitli (`1234.56`). Atstarpes tiek ignorētas.

## Slīpumi un nogāzes

- **Slīpumi** (profili, caurules, joslu un malu nogāzes) ir procentos: `+1.25%` paceļas pa stacijām, `-0.50%` krītas.
- **Sānu nogāzes** (platformas izrakums un uzbērums, koridora izrakums un uzbērums) ir horizontāle pret vertikāli: `3` nozīmē 3 : 1, trīs pa horizontāli par vienu uz augšu vai uz leju.
- **K** vertikālai līknei ir tās garums dalīts ar slīpuma izmaiņu procentos.

## Rumbi un leņķi

Rumbi ir kvadranta rumbi grādos, minūtēs un sekundēs: `N 63°12'05" E`. Līkņu novirzes (Δ) izmanto tos pašus grādus, minūtes un sekundes, ar "pa kreisi" vai "pa labi".

## Nobīdes

Nobīdes no trases ir attālumi taisni pret to, atzīmētas **L** (pa kreisi) vai **R** (pa labi), skatoties virzienā uz augšu pa stacijām.

## Skaitļu attēlojums

- Koordinātas un augstumi paneļos un statusa joslā tiek rādīti ar 2 decimāldaļām (3 izvēlētam uzmērījuma punktam).
- Laukumi un tilpumi ir grupēti pa tūkstošiem: `128,250 sq ft`, `454.9 cu yd`.
- Koordinātas nekad netiek grupētas, lai tās varētu kopēt tādas, kādas tās ir.

## Koordinātas

CivilCraft strādā plakanā plaknē: austrumi pa labi, ziemeļi uz augšu. Projektēšanas darbs vienmēr notiek projicētās koordinātās (valsts plaknes koordinātas, UTM vai vietējais režģis). Varat norādīt CivilCraft, kurā koordinātu sistēmā tās ir un vai tās ir režģa, zemes vai vietējās koordinātas; tad tā parāda platumu un garumu un novieto GIS failus un karšu slāņus, bet nekad pati nemaina mērvienības un nepārvieto jūsu koordinātas. Skatiet [Projekta koordinātu sistēmas iestatīšana](topic:coordinate-systems) un [Zemes un vietējās koordinātas](topic:ground-and-local-coordinates). Lielas valsts plaknes vērtības (miljoniem pēdu) ir labi; CivilCraft iekšēji strādā attiecībā pret vietu, lai saglabātu precizitāti.
