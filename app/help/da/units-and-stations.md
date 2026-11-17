---
title: Enheder, stationer og talformater
summary: Fod- og meterprojekter, hvordan stationer, hældninger, sideskråninger, retninger, arealer, volumener og rørdimensioner skrives og indtastes, og hvad ændring af enheder gør.
keywords: indtast længde, regning, lommeregner, sum, brøk, fod og tommer, 4+7/16, enheder, fod, US survey-fod, meter, metrisk, imperial, stationsformat, stationering, hældning, procent, sideskråning, h:v, retning, kubikyard, diameter
from: 0b9b5b6b
---

## Projektenheder

Et projekt er i **US-fod** eller **meter** (**Enheder** i venstre panel). Alle koordinater, koter, længder og stationer i projektet er i den enhed.

:::warning
Ændring af **Enheder** ændrer etiketterne, stationsformatet, standardværdierne og hvordan filer skrives. Den konverterer **ikke** nogen tal. Et projekt målt i fod og skiftet til meter beholder de samme tal, nu læst som meter. Statuslinjen siger »Enheder er nu meter. Koordinater blev ikke konverteret.« Angiv enhederne, så de passer til dine data, før du projekterer.
:::

Det, der afhænger af enhederne:

| | US-fod | Meter |
|---|---|---|
| Stationsformat | `12+34.56` (100 ft stationer) | `1+234.567` (1000 m stationer) |
| Tilbudte højdekurveintervaller | 0.25 til 20 ft | 0.1 til 10 m |
| Areal | sq ft | sq m |
| Volumen | cu yd | cu m |
| Rør- og konstruktionsdiameter | tommer | millimeter |
| Standard kurveradius | 100 ft | 30 m |
| Stationeringsmærker på planen | hver 50 ft, mærkat hver 100 ft | hver 20 m, mærkat hver 100 m |
| Plotmålestoke | 1" = 5' til 1" = 1000' | 1:50 til 1:10000 |
| LandXML længdeenhed | USSurveyFoot | meter |

Et nyt projekt starter i fod, eller i meter, når længdeenheden markeret med stjerne i {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Enheder}} er en metrisk. Listen **Enheder** viser de enheder, der er slået til dér, og altid projektets egne. Med en areal- eller volumenenhed markeret dér (acres, hektar, acre-fod …) angives arealer og volumener i den i stedet for kolonnen ovenfor. Se [Enheder, indtastede værdier og enhedslisterne](common:unit-lists).

Når du åbner LandXML, overtager projektet filens enheder. En fil i internationale fod åbnes som et fodprojekt; tallene ændres ikke.

## Indtastning af længder og summer

Et felt, der tager en længde eller kote, læser mere end et almindeligt tal: tryk på {{key:Enter}}, og feltet viser resultatet i projektets enheder.

| Du skriver | I et fodprojekt | I et meterprojekt |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | de samme længder i meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | i fod | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, og de andre i US survey-fod | de samme længder i meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summen, i fod | summen, i meter |

Alle længdemærker fra den fælles enhedstabel virker, med deres præcise størrelse: et projekts fod er US survey-fod, så `10 US ft` er 10, og `3 ch` (kæden i internationale fod) er 197.9996. Brug `+ - * /` og parenteser samt `abs`, `round`, `ceil` og `floor`. Et bindestreg skrevet ind i en længde er en del af den (`24'-6"`, `6-1/2`); med mellemrum omkring den trækker den fra (`24' - 6"` = 23.5 ft). Et almindeligt tal ganger eller dividerer en længde og er en længde i projektets enheder, når det lægges til en. Hvis CivilCraft ikke kan læse det, du skrev, markeres feltet, og statuslinjen siger, hvor.

Stationer er ikke summer: `10+00` i et stationsfelt er station 10+00. Hældninger i procent, punktnumre og beskrivelser læses, som de er.

## Stationer

En station er en afstand langs et tracé, skrevet med et plustegn:

- Fod: tallet før plusset er hundredvis af fod. `12+34.56` er 1,234.56 ft.
- Meter: tallet før plusset er tusindvis af meter. `1+234.567` er 1,234.567 m.
- Negative stationer beholder fortegnet foran: `-0+50.00`.

Hvor du skriver en station (**Startstation**, et PVI's **Station**), kan du skrive den med plus (`12+34.56`) eller som et almindeligt tal (`1234.56`). Mellemrum ignoreres.

## Hældninger og skråninger

- **Hældninger** (profiler, rør, kørebane- og skulderhældninger) angives i procent: `+1.25%` stiger op ad stationeringen, `-0.50%` falder.
- **Sideskråninger** (byggeplateauets afgravning og opfyldning, korridorens afgravning og opfyldning) angives vandret til lodret: `3` betyder 3 : 1, tre vandret for én op eller ned.
- **K** for en lodret kurve er dens længde divideret med ændringen i hældning i procent.

## Retninger og vinkler

Retninger er kvadrantretninger i grader, minutter og sekunder: `N 63°12'05" E`. Kurvedrejninger (Δ) bruger de samme grader, minutter og sekunder, med »venstre« eller »højre«.

## Forskydninger

Forskydninger fra et tracé er vinkelrette afstande fra det, markeret **L** (venstre) eller **R** (højre), set i stationeringens retning.

## Talvisning

- Koordinater og koter vises med 2 decimaler i paneler og statuslinjen (3 for et valgt punkt).
- Arealer og volumener grupperes med tusinder: `128,250 sq ft`, `454.9 cu yd`.
- Koordinater grupperes aldrig, så de kan kopieres, som de er.

## Koordinater

CivilCraft arbejder i et fladt plan: øst til højre, nord opad. Projekteringsarbejde sker altid i projicerede koordinater (statsplan, UTM eller et lokalt net). Du kan fortælle CivilCraft, hvilket koordinatsystem de er i, og om de er gitter-, terræn- eller lokale koordinater; så viser det bredde- og længdegrad og placerer GIS-filer og kortlag, men det ændrer aldrig enheder eller flytter dine koordinater af sig selv. Se [Angiv projektets koordinatsystem](topic:coordinate-systems) og [Terræn- og lokale koordinater](topic:ground-and-local-coordinates). Store statsplanværdier (millioner af fod) er i orden; CivilCraft arbejder internt relativt til stedet for at bevare præcisionen.
