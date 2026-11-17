---
title: "Vienetai, stotys ir skaičių formatai"
summary: "Pėdų ir metrų projektai, kaip rašomos ir įvedamos stotys, nuolydžiai, šoniniai nuolydžiai, rumbai, plotai, tūriai ir vamzdžių dydžiai bei ką daro vienetų keitimas."
keywords: "ilgio įvedimas, aritmetika, skaičiuotuvas, suma, trupmena, pėdos ir coliai, 4+7/16, vienetai, pėdos, JAV geodezinės pėdos, metrai, metrinė, imperinė, stočių formatas, stacionavimas, nuolydis, procentas, šoninis nuolydis, h:v, rumbas, kubiniai jardai, skersmuo"
from: 0b9b5b6b
---

## Projekto vienetai

Projektas būna **JAV pėdomis** arba **metrais** (**Vienetai** kairiajame skydelyje). Visos projekto koordinatės, aukščiai, ilgiai ir stotys yra tuo vienetu.

:::warning
Pakeitus **Vienetus**, keičiasi žymos, stočių formatas, numatytosios reikšmės ir tai, kaip rašomi failai. Skaičiai **nekonvertuojami**. Vietovė, išmatuota pėdomis ir perjungta į metrus, išlaiko tuos pačius skaičius, dabar skaitomus kaip metrai. Būsenos juostoje rašoma „Vienetai dabar yra metrai. Koordinatės nekonvertuotos.“ Prieš projektuodami nustatykite vienetus, atitinkančius jūsų duomenis.
:::

Nuo vienetų priklauso:

| | JAV pėdos | Metrai |
|---|---|---|
| Stočių formatas | `12+34.56` (100 ft stotys) | `1+234.567` (1000 m stotys) |
| Siūlomi horizontalių intervalai | nuo 0.25 iki 20 ft | nuo 0.1 iki 10 m |
| Plotas | sq ft | sq m |
| Tūris | cu yd | cu m |
| Vamzdžio ir konstrukcijos skersmuo | coliai | milimetrai |
| Numatytasis kreivės spindulys | 100 ft | 30 m |
| Stacionavimo žymos plane | kas 50 ft, žymos kas 100 ft | kas 20 m, žymos kas 100 m |
| Spausdinimo masteliai | nuo 1" = 5' iki 1" = 1000' | nuo 1:50 iki 1:10000 |
| LandXML linijinis vienetas | USSurveyFoot | meter |

Naujas projektas pradedamas pėdomis arba, jei ilgio vienetas, pažymėtas {{ui:Parametrai}} › {{ui:Bendra}} › {{ui:Vienetai}}, yra metrinis, – metrais. Sąraše **Vienetai** rodomi ten įjungti vienetai ir visada paties projekto. Jei ten pažymėtas ploto ar tūrio vienetas (akrai, hektarai, akrų pėdos …), plotai ir tūriai pateikiami juo, o ne aukščiau esančioje lentelėje. Žr. [Vienetai, įvedamos reikšmės ir vienetų sąrašai](common:unit-lists).

Atidarant LandXML, projektas perima failo vienetus. Failas tarptautinėmis pėdomis atsidaro kaip pėdų projektas; skaičiai nekeičiami.

## Ilgių ir sumų įvedimas

Bet kuris langelis, priimantis ilgį ar aukštį, skaito daugiau nei paprastą skaičių: paspauskite {{key:Enter}}, ir langelis parodys rezultatą projekto vienetais.

| Įvedate | Pėdų projekte | Metrų projekte |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | tie patys ilgiai metrais |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | pėdomis | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, o kiti – JAV geodezinėmis pėdomis | tie patys ilgiai metrais |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | suma pėdomis | suma metrais |

Veikia bet koks bendros vienetų lentelės ilgio žymėjimas, tiksliu dydžiu: projekto pėdos yra JAV geodezinės pėdos, todėl `10 US ft` yra 10, o `3 ch` (tarptautinės pėdos grandinė) yra 197.9996. Naudokite `+ - * /` ir skliaustus bei `abs`, `round`, `ceil` ir `floor`. Brūkšnys, įrašytas į ilgį, yra jo dalis (`24'-6"`, `6-1/2`); su tarpais aplink jį jis atima (`24' - 6"` = 23.5 ft). Paprastas skaičius dauginamas arba dalijamas iš ilgio, o pridėtas prie ilgio tampa ilgiu projekto vienetais. Jei CivilCraft nepavyksta perskaityti to, ką įvedėte, langelis pažymimas, o būsenos juostoje nurodoma, kur.

Stotys nėra sumos: `10+00` stočių langelyje yra stotis 10+00. Nuolydžiai procentais, taškų numeriai ir aprašymai skaitomi kaip yra.

## Stotys

Stotis yra atstumas palei trasą, rašomas su pliuso ženklu:

- Pėdos: dalis prieš pliusą yra šimtai pėdų. `12+34.56` yra 1,234.56 ft.
- Metrai: dalis prieš pliusą yra tūkstančiai metrų. `1+234.567` yra 1,234.567 m.
- Neigiamos stotys išlaiko ženklą prieš jas: `-0+50.00`.

Kur tik įvedate stotį (**Pradžios stotis**, PVI **Stotis**), galite ją įvesti su pliusu (`12+34.56`) arba kaip paprastą skaičių (`1234.56`). Tarpai ignoruojami.

## Nuolydžiai ir šlaitai

- **Nuolydžiai** (profiliai, vamzdžiai, juostos ir pakraščio nuolydžiai) matuojami procentais: `+1.25%` kyla į stoties kryptį, `-0.50%` krenta.
- **Šoniniai nuolydžiai** (aikštelės iškasimas ir įpylimas, koridoriaus iškasimas ir įpylimas) nurodomi horizontalės ir vertikalės santykiu: `3` reiškia 3 : 1, tris horizontaliai vienam aukštyn ar žemyn.
- **K** vertikaliai kreivei yra jos ilgis, padalytas iš nuolydžio pokyčio procentais.

## Rumbai ir kampai

Rumbai yra ketvirčio rumbai laipsniais, minutėmis ir sekundėmis: `N 63°12'05" E`. Kreivių nuokrypiai (Δ) naudoja tuos pačius laipsnius, minutes ir sekundes, su „kairėn“ arba „dešinėn“.

## Nuokrypiai

Nuokrypiai nuo trasos yra atstumai statmenai jai, žymimi **L** (kairė) arba **R** (dešinė), žiūrint į stoties kryptį.

## Skaičių rodymas

- Koordinatės ir aukščiai skydeliuose ir būsenos juostoje rodomi su 2 skaitmenimis po kablelio (3 pasirinktam geodeziniam taškui).
- Plotai ir tūriai grupuojami po tūkstančius: `128,250 sq ft`, `454.9 cu yd`.
- Koordinatės niekada negrupuojamos, todėl jas galima kopijuoti tokias, kokios yra.

## Koordinatės

CivilCraft dirba plokštumoje: rytai – į dešinę, šiaurė – aukštyn. Projektavimo darbai visada vyksta projektinėse koordinatėse (valstybinė plokštuma, UTM arba vietinis tinklelis). Galite nurodyti CivilCraft, kokioje koordinačių sistemoje jos yra ir ar tai tinklelio, žemės ar vietinės koordinatės; tada programa rodo platumą ir ilgumą bei talpina GIS failus ir žemėlapių sluoksnius, bet niekada pati nekeičia vienetų ir nejudina jūsų koordinačių. Žr. [Nustatyti projekto koordinačių sistemą](topic:coordinate-systems) ir [Žemės ir vietinės koordinatės](topic:ground-and-local-coordinates). Didelės valstybinės plokštumos reikšmės (milijonai pėdų) tinka; CivilCraft vidiniam tikslumui išlaikyti dirba santykiu su vietove.
