---
title: Jednotky, staničenie a formáty čísel
summary: Projekty v stopách a metroch, ako sa zapisujú a zadávajú staničenia, sklony, bočné sklony, smery, plochy, objemy a veľkosti potrubí a čo zmena jednotiek robí.
keywords: zadanie dĺžky, aritmetika, kalkulačka, súčet, zlomok, stopy a palce, 4+7/16, jednotky, stopy, US survey feet, metre, metrický, imperiálny, formát staničenia, staničenie, sklon, percento, bočný sklon, h:v, smer, kubické yardy, priemer
from: 0b9b5b6b
---

## Jednotky projektu

Projekt je v **US stopách** alebo **metroch** (**Jednotky** na ľavom paneli). Každá súradnica, výška, dĺžka a staničenie v projekte je v tejto jednotke.

:::warning
Zmena **Jednotiek** zmení popisky, formát staničenia, predvolené hodnoty a spôsob zápisu súborov. Žiadne číslo sa **neprepočíta**. Lokalita zameraná v stopách a prepnutá na metre si zachová tie isté čísla, teraz čítané ako metre. Stavový riadok hovorí: "Jednotky sú teraz metre. Súradnice neboli prepočítané." Nastavte jednotky tak, aby zodpovedali vašim údajom, skôr než začnete navrhovať.
:::

Čo závisí od jednotiek:

| | US stopy | Metre |
|---|---|---|
| Formát staničenia | `12+34.56` (staničenie po 100 ft) | `1+234.567` (staničenie po 1000 m) |
| Ponúkané intervaly vrstevníc | 0.25 až 20 ft | 0.1 až 10 m |
| Plocha | sq ft | sq m |
| Objem | cu yd | cu m |
| Priemer potrubia a objektu | palce | milimetre |
| Predvolený polomer oblúka | 100 ft | 30 m |
| Značky staničenia na pláne | každých 50 ft, popisky každých 100 ft | každých 20 m, popisky každých 100 m |
| Mierky vykreslenia | 1" = 5' až 1" = 1000' | 1:50 až 1:10000 |
| Dĺžková jednotka LandXML | USSurveyFoot | meter |

Nový projekt začína v stopách, alebo v metroch, ak je dĺžková jednotka v {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Jednotky}} označená hviezdičkou a je metrická. Zoznam **Jednotky** zobrazuje jednotky zapnuté tam a vždy vlastnú jednotku projektu. Ak je tam označená jednotka plochy alebo objemu (akre, hektáre, acre-feet …), plochy a objemy sa uvádzajú v nej namiesto údajov v tabuľke vyššie. Pozri [Jednotky, zadané hodnoty a zoznamy jednotiek](common:unit-lists).

Pri otvorení LandXML projekt prevezme jednotky súboru. Súbor v medzinárodných stopách sa otvorí ako projekt v stopách; čísla sa nemenia.

## Zadávanie dĺžok a súčtov

Každé pole, ktoré prijíma dĺžku alebo výšku, číta viac než obyčajné číslo: stlačte {{key:Enter}} a pole zobrazí výsledok v jednotkách projektu.

| Zadáte | V projekte v stopách | V projekte v metroch |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | rovnaké dĺžky v metroch |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | v stopách | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft a ostatné v US survey stopách | rovnaké dĺžky v metroch |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | súčet, v stopách | súčet, v metroch |

Funguje každá značka dĺžky zo spoločnej tabuľky jednotiek s presnou veľkosťou: stopy projektu sú US survey stopy, takže `10 US ft` je 10 a `3 ch` (reťaz s medzinárodnou stopou) je 197.9996. Používajte `+ - * /` a zátvorky, a `abs`, `round`, `ceil` a `floor`. Pomlčka napísaná v dĺžke je jej súčasťou (`24'-6"`, `6-1/2`); s medzerami okolo nej odčítava (`24' - 6"` = 23.5 ft). Obyčajné číslo dĺžku násobí alebo delí a pri sčítaní s dĺžkou je dĺžkou v jednotkách projektu. Ak CivilCraft nevie prečítať, čo ste zadali, pole sa označí a stavový riadok ukáže, kde.

Staničenia nie sú súčty: `10+00` v poli staničenia je staničenie 10+00. Sklony v percentách, čísla bodov a popisy sa čítajú tak, ako sú.

## Staničenie

Staničenie je vzdialenosť pozdĺž osi trasy, zapísaná so znamienkom plus:

- Stopy: časť pred plusom sú stovky stôp. `12+34.56` je 1,234.56 ft.
- Metre: časť pred plusom sú tisícky metrov. `1+234.567` je 1,234.567 m.
- Záporné staničenia si ponechajú znamienko pred sebou: `-0+50.00`.

Kdekoľvek zadáte staničenie (**Začiatočné staničenie**, **Staničenie** PVI), môžete ho zadať so znamienkom plus (`12+34.56`) alebo ako obyčajné číslo (`1234.56`). Medzery sa ignorujú.

## Sklony a bočné sklony

- **Sklony** (profily, potrubia, sklony jazdných pruhov a krajníc) sú v percentách: `+1.25%` stúpa v smere staničenia, `-0.50%` klesá.
- **Bočné sklony** (výkop a násyp plošiny, výkop a násyp koridora) sú vodorovne ku zvislo: `3` znamená 3 : 1, tri vodorovne na jeden zvislo nahor alebo nadol.
- **K** zvislého oblúka je jeho dĺžka delená zmenou sklonu v percentách.

## Smery a uhly

Smery sú kvadrantové smery v stupňoch, minútach a sekundách: `N 63°12'05" E`. Uhly zakrivenia (Δ) používajú rovnaké stupne, minúty a sekundy, s "vľavo" alebo "vpravo".

## Odsadenia

Odsadenia od osi trasy sú vzdialenosti kolmo na ňu, označené **L** (vľavo) alebo **R** (vpravo) pri pohľade v smere rastúceho staničenia.

## Zobrazenie čísel

- Súradnice a výšky zobrazujú 2 desatinné miesta v paneloch a stavovom riadku (3 pre vybraný bod).
- Plochy a objemy sú zoskupené po tisíckach: `128,250 sq ft`, `454.9 cu yd`.
- Súradnice sa nikdy nezoskupujú, aby sa dali kopírovať tak, ako sú.

## Súradnice

CivilCraft pracuje v rovine: X doprava, Y nahor. Projektovanie prebieha vždy v súradniciach zobrazenia (štátna rovina, UTM alebo miestna mriežka). Môžete CivilCraft povedať, v akom súradnicovom systéme sú, a či ide o mriežkové, terénne alebo miestne súradnice; potom zobrazí zemepisnú šírku a dĺžku a umiestni GIS súbory a mapové vrstvy, ale nikdy sám nemení jednotky ani neposúva vaše súradnice. Pozri [Nastavenie súradnicového systému projektu](topic:coordinate-systems) a [Terénne a miestne súradnice](topic:ground-and-local-coordinates). Veľké hodnoty štátnej roviny (milióny stôp) sú v poriadku; CivilCraft interne pracuje vzhľadom na lokalitu, aby zachoval presnosť.
