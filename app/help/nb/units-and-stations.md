---
title: Enheter, profilnummer og tallformat
summary: Prosjekter i fot og meter, hvordan profilnummer, stigninger, sideskråninger, retninger, arealer, volumer og rørdimensjoner skrives og tastes inn, og hva endring av enheter gjør.
keywords: skriv inn en lengde, aritmetikk, kalkulator, sum, brøk, fot og tommer, 4+7/16, enheter, fot, US survey feet, meter, metrisk, imperisk, profilnummerering, stigning, prosent, sideskråning, h:v, retning, kubikkyard, diameter
from: 0b9b5b6b
---

## Prosjektets enheter

Et prosjekt er i **US feet** eller **meter** (**Enheter** i venstre panel). Hver koordinat, kote, lengde og profilnummer i prosjektet er i den enheten.

:::warning
Å endre **Enheter** endrer etikettene, profilnummerformatet, standardverdiene og hvordan filer skrives. Det konverterer **ikke** noe tall. Et område målt i fot og byttet til meter beholder de samme tallene, nå lest som meter. Statuslinjen sier "Enhetene er nå meter. Koordinatene ble ikke konvertert." Velg enhetene som stemmer med dataene dine før du prosjekterer.
:::

Dette avhenger av enhetene:

| | US feet | Meter |
|---|---|---|
| Profilnummerformat | `12+34.56` (profilnummer på 100 ft) | `1+234.567` (profilnummer på 1000 m) |
| Tilbudte høydekurveintervaller | 0.25 til 20 ft | 0.1 til 10 m |
| Areal | sq ft | sq m |
| Volum | cu yd | cu m |
| Rør- og konstruksjonsdiameter | tommer | millimeter |
| Standard kurveradius | 100 ft | 30 m |
| Profilnummermerker på planen | hver 50 ft, etiketter hver 100 ft | hver 20 m, etiketter hver 100 m |
| Plottmålestokker | 1" = 5' til 1" = 1000' | 1:50 til 1:10000 |
| LandXML lengdeenhet | USSurveyFoot | meter |

Et nytt prosjekt starter i fot, eller i meter når lengdeenheten som er stjernemerket i {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Enheter}}, er en metrisk enhet. Listen **Enheter** viser enhetene som er slått på der, og alltid prosjektets egne. Med et areal- eller volumenhet stjernemerket der (acres, hektar, acre-feet …), rapporteres arealer og volumer i den enheten i stedet for kolonnen over. Se [Enheter, skrevne verdier og enhetslistene](common:unit-lists).

Når du åpner LandXML, tar prosjektet filens enheter. En fil i internasjonale fot åpnes som et fotprosjekt; tallene endres ikke.

## Skrive inn lengder og summer

Ethvert felt som tar en lengde eller kote, leser mer enn et vanlig tall: trykk {{key:Enter}}, og feltet viser resultatet i prosjektets enheter.

| Du skriver | I et fotprosjekt | I et meterprosjekt |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | de samme lengdene i meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | i fot | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, og de andre i US survey feet | de samme lengdene i meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summen, i fot | summen, i meter |

Alle lengdemerker i den felles enhetstabellen fungerer, med sin nøyaktige størrelse: et prosjekts fot er US survey feet, så `10 US ft` er 10, og `3 ch` (kjeden i internasjonale fot) er 197.9996. Bruk `+ - * /` og parenteser, samt `abs`, `round`, `ceil` og `floor`. En strek skrevet inn i en lengde er en del av den (`24'-6"`, `6-1/2`); med mellomrom rundt trekkes den fra (`24' - 6"` = 23.5 ft). Et vanlig tall multipliserer eller deler en lengde, og er en lengde i prosjektets enheter når det legges til en. Hvis CivilCraft ikke kan lese det du skrev, merkes feltet, og statuslinjen sier hvor.

Profilnummer er ikke summer: `10+00` i et profilnummerfelt er profilnummer 10+00. Stigninger i prosent, punktnumre og beskrivelser leses slik de er.

## Profilnummer

Et profilnummer er en avstand langs en veglinje, skrevet med et plusstegn:

- Fot: delen før plusstegnet er hundrevis av fot. `12+34.56` er 1,234.56 ft.
- Meter: delen før plusstegnet er tusenvis av meter. `1+234.567` er 1,234.567 m.
- Negative profilnummer beholder fortegnet foran: `-0+50.00`.

Der du skriver inn et profilnummer (**Startprofilnummer**, PVI-ens **Profilnummer**), kan du skrive det med pluss (`12+34.56`) eller som et vanlig tall (`1234.56`). Mellomrom ignoreres.

## Stigninger og skråninger

- **Stigninger** (profiler, rør, kjørefelt- og skulderskråninger) er i prosent: `+1.25%` stiger oppover profilet, `-0.50%` synker.
- **Sideskråninger** (byggeplatens skjæring og fylling, korridorens skjæring og fylling) er horisontalt mot vertikalt: `3` betyr 3 : 1, tre på tvers for én opp eller ned.
- **K** for en vertikalkurve er lengden delt på endringen i stigning i prosent.

## Retninger og vinkler

Retninger er kvadrantretninger i grader, minutter og sekunder: `N 63°12'05" E`. Kurveutslag (Δ) bruker de samme gradene, minuttene og sekundene, med "venstre" eller "høyre".

## Forskyvninger

Forskyvninger fra en veglinje er avstander vinkelrett på den, merket **L** (venstre) eller **R** (høyre) sett i retning av økende profilnummer.

## Tallvisning

- Koordinater og koter vises med 2 desimaler i paneler og statuslinjen (3 for et valgt oppmålingspunkt).
- Arealer og volumer grupperes i tusener: `128,250 sq ft`, `454.9 cu yd`.
- Koordinater grupperes aldri, så de kan kopieres slik de er.

## Koordinater

CivilCraft arbeider i et flatt plan: øst mot høyre, nord oppover. Prosjektering skjer alltid i projiserte koordinater (statlig plankoordinatsystem, UTM eller et lokalt rutenett). Du kan fortelle CivilCraft hvilket koordinatsystem de er i, og om de er rutenettkoordinater, terrengkoordinater eller lokale koordinater; da viser den breddegrad og lengdegrad og plasserer GIS-filer og kartlag, men den endrer aldri enheter eller flytter koordinatene dine av seg selv. Se [Angi prosjektets koordinatsystem](topic:coordinate-systems) og [Terreng- og lokale koordinater](topic:ground-and-local-coordinates). Store verdier i statlig plankoordinatsystem (millioner fot) er fine; CivilCraft jobber internt i forhold til området for å ta vare på presisjonen.
