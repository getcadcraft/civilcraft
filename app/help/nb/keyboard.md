---
title: Taster og mus
summary: Alle tastatursnarveier og mus-, styreflate- og berøringshandlinger i CivilCraft, gruppert, med forskjellene for nettleser og plattform.
keywords: tastatur, snarveier, hurtigtaster, taster, mus, styreflate, berøring, panorer, zoom, klype, hjul, høyreklikk, mac, command-tasten
from: a9756f46
---

Enkeltbokstavtaster virker når du ikke skriver i en boks. Snarveier med {{key:Mod}} bruker Command på en Mac og Ctrl ellers. Se også [Taster i nettleseren](common:keys).

## Filer og redigering

| Tast | Handling |
|---|---|
| {{key:Mod+O}} | Åpne en punktfil, LandXML eller prosjekt |
| {{key:Mod+S}} | Lagre prosjektet (laster ned en `.civilcraft.json`-fil) |
| {{key:Mod+P}} | Plott planen til PDF (åpner plottdialogen, ikke nettleserens utskrift) |
| {{key:Mod+Z}} | Angre |
| {{key:Mod+Y}} | Gjør om |
| {{key:Delete}} | Slett de valgte oppmålingspunktene, linjeføringen, byggeplaten, konstruksjonen, røret eller PVI-en |
| {{key:Mod+C}} | Kopier de valgte oppmålingspunktene (også som punktrader for et regneark) |
| {{key:Mod+X}} | Klipp ut de valgte oppmålingspunktene |
| {{key:Mod+V}} | Lim inn punkter: de følger pekeren, klikk der de skal være |
| {{key:Mod+Shift+V}} | Lim inn på samme sted: på punktenes egne koordinater |
| {{key:Mod+D}} | Dupliser de valgte punktene: en kopi følger pekeren |
| {{key:Mod+A}} | Velg alle oppmålingspunkter |
| {{key:Esc}} | Fjern utvalg (og avbryt innliming) |

{{key:Mod+S}}, {{key:Mod+O}} og {{key:Mod+P}} virker også mens du skriver i en boks. {{key:Mod+Z}} og {{key:Mod+Y}} i en tekstboks angrer skrivingen din i stedet, som vanlig, og det samme gjelder {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} og {{key:Mod+A}}: i en boks kopierer, klipper ut, limer inn og velger de teksten sin. Med tekst valgt på siden (i et panel) kopierer {{key:Mod+C}} den teksten. {{key:Mod+Shift+Z}} gjør ingenting i CivilCraft: bruk {{key:Mod+Y}} eller knappen {{ui:Redo}}.

:::mac
På Mac er tasten merket **delete** {{key:Backspace}} for nettleseren. For å slette et utvalg trykker du {{key:Delete}} (Fn og delete), eller velger {{ui:Delete}} i verktøylinjens {{ui:More}}-meny.
:::

## Verktøy

| Tast | Verktøy |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:M}} | {{ui:Measure}}: avstander, arealer og fall på planen ([Mål](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Vis eller skjul profilvisningen |
| {{key:I}} | Slå {{ui:Add PVIs}} av eller på (åpner profilvisningen hvis den er lukket) |
| {{key:F}} | {{ui:Fit}}: vis alt |
| {{key:D}} | {{ui:3D}}: vis tomten i 3D, eller gå tilbake til planen |
| {{key:E}} | Vis eller skjul stigninger og koter langs alle formlinjer (bare på skjermen) |

Trykk tasten til det aktive verktøyet på nytt for å gå tilbake til {{ui:Select}}. Bokstaver med Shift gjør ingenting.

## Under tegning

| Tast | Handling |
|---|---|
| {{key:Enter}} | Fullfør linjeføringen, byggeplaten, rørstrekket, bruddlinjen eller avgrensningen |
| {{key:Backspace}} | Fjern det siste klikkede punktet |
| {{key:C}} | Formlinje: slå buer av eller på (etter et hjørne, klikk et punkt på kurven, deretter enden) |
| {{key:Esc}} | Avbryt tegningen (eller innlimingen); trykkes igjen (eller når ingenting er tegnet), gå tilbake til {{ui:Select}} og fjern utvalget |

## Planvisning

| Tast eller handling | Resultat |
|---|---|
| Hjul | Zoom inn eller ut ved pekeren |
| Dra på tom plass | Panorer (i alle verktøy; et kort klikk klikker fortsatt; med {{key:Shift}} holdt nede tegnes en utvalgsboks i stedet) |
| Dra med midtknappen | Panorer |
| Dra med høyre knapp | Panorer (ingen meny åpnes) |
| {{key:Space}} og dra | Panorer |
| Klikk | Velg (med {{ui:Select}}), eller plasser et punkt (med et tegneverktøy) |
| {{key:Shift}} og klikk | Legg et oppmålingspunkt til utvalget, eller ta det ut |
| {{key:Shift}} og dra | Tegn en boks: oppmålingspunktene innenfor legges til utvalget. Dra rundt dem for et [lasso](topic:lasso-selection) |
| {{key:Space}} mens du tegner lasso | Vindu, deretter kryssing, deretter gjerde |
| Klikk mens du limer inn | Plasser de innlimte punktene der ({{key:Enter}} setter dem på deres egne koordinater) |
| Dra et håndtak | Flytt en PI, et byggeplatehjørne eller en konstruksjon (ett angrestegg) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Panorer, når planen har fokus (klikk den først) |
| {{key:Plus}} og {{key:Minus}} | Zoom inn og ut midt i visningen, når planen har fokus |

Tasten = zoomer inn på samme måte som {{key:Plus}}, så Shift trengs ikke.

## Profilvisning

| Handling | Resultat |
|---|---|
| Klikk med {{ui:Add PVIs}} på | Legg til en PVI der |
| Klikk en PVI | Velg den |
| Dra en PVI | Flytt den (ett angrestegg) |
| {{key:Delete}} eller {{key:Backspace}} | Fjern den valgte PVI-en ({{key:Backspace}} bare når profilvisningen har fokus) |

Profilvisningen zoomer ikke og panorerer ikke.

## Skjerm og hjelp

| Tast | Handling |
|---|---|
| {{key:F1}} | Åpne eller lukk denne hjelpen (sidepanelet); {{ui:Help}} i appens linje gjør det samme |
| {{key:Esc}} | Lukk hjelpepanelet når det er åpent |
| {{key:Ctrl+Shift+F}} | Bla gjennom skjermmodusene: fullskjerm, fullskjerm med linjene skjult, normal |
| {{key:Esc}} | Gå ut av fullskjerm (nettleserens egen tast) |

{{key:F1}} når hjelpen før CivilCraft ser den, så den virker i alle verktøy. På de fleste Mac-tastaturer trykker du fn sammen med F1, eller klikker {{ui:Help}}. {{key:Ctrl+Shift+F}} bruker Control-tasten på alle plattformer, også på en Mac. Se [Bruk hjelpen](common:help) for hvordan du søker i denne hjelpen.

## Mus, styreflate og berøring

:::mouse
- Hjulet zoomer ved pekeren. Et mus med et fritt roterende hjul zoomer raskt: gi det korte bevegelser.
- Panorer med en hvilken som helst dra på tom plass, midtknappen, høyre knapp, eller {{key:Space}} og dra.
:::

:::mac
På en Mac-styreflate:

- Tofingersveiping **zoomer** (den panorerer ikke), og klyping zoomer også.
- For å panorere trykker du og drar på tom plass med ett finger, eller holder {{key:Space}} og drar.
- Et tofingerklikk (høyreklikk) åpner ingen meny og gjør ingenting alene.
:::

:::touch
På en berøringsskjerm:

- Den første berøringen gjør knapper og menyrader fingerstore.
- Trykk for å velge eller plassere et punkt; ett finger som dras på tom plass panorerer. Et trykk kan vingle litt: det panorerer først når fingeren har beveget seg omtrent 10 piksler.
- To fingre klyper for å zoome og flytter sammen for å panorere.
- Dra et håndtak eller en PVI med ett finger. Håndtak har rom for et fingers bredde rundt seg.
- Mens du tegner en linjeføring, byggeplate, bruddlinje, avgrensning, rørstrekk, formlinje eller parsell, tilbyr en linje over planen {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) og {{ui:Cancel}} ({{key:Esc}}). Et langt trykk (et halvt sekund uten å bevege seg) fullfører også.
- I {{ui:Select}} legger et langt trykk på et oppmålingspunkt det til utvalget, eller tar det ut, slik {{key:Shift}}+klikk gjør.
- I 3D-visningen kretser ett finger rundt, to klyper og panorerer, og et trykk velger.
- Det finnes ingen sveving på berøring, så statuslinjens verdier oppdateres bare mens et finger er nede.
:::

## Nettleser-taster som går først

Noen taster hører til nettleseren og når aldri CivilCraft, for eksempel {{key:Mod+W}} (lukk fane), {{key:Mod+T}} (ny fane), {{key:Mod+N}} (nytt vindu) og {{key:F11}} (fullskjerm i Windows- og Linux-nettlesere). CivilCraft bruker dem ikke. Hvis en snarvei åpner noe i nettleseren i stedet, klikk planen én gang slik at siden får fokus, og prøv igjen.

## Hvor Flytt er

Det finnes ingen kommando for Flytt: velg {{ui:Select}} og dra et punkt eller et hjørne, eller rediger koordinatene i {{ui:Properties}}. Se [Rediger punkter](topic:edit-points).
