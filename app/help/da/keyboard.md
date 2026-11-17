---
title: Taster og mus
summary: Alle tastaturgenveje og mus-, trackpad- og berøringshandlinger i CivilCraft, grupperet, med forskellene for browseren og platformen.
keywords: tastatur, genveje, hurtigtaster, taster, mus, trackpad, berøring, panorér, zoom, knibe, hjul, højreklik, mac, command-tast
from: a9756f46
---

Taster med ét bogstav virker, når du ikke skriver i et felt. Genveje med {{key:Mod}} bruger Command på en Mac og Ctrl ellers. Se også [Taster i browseren](common:keys).

## Filer og redigering

| Tast | Handling |
|---|---|
| {{key:Mod+O}} | Åbn en punktfil, LandXML eller et projekt |
| {{key:Mod+S}} | Gem projektet (downloader en `.civilcraft.json`-fil) |
| {{key:Mod+P}} | Plot planen til PDF (åbner plotdialogen, ikke browserens udskrivning) |
| {{key:Mod+Z}} | Fortryd |
| {{key:Mod+Y}} | Gentag |
| {{key:Delete}} | Slet de valgte opmålingspunkter, tracé, plateau, konstruktion, rør eller PVI |
| {{key:Mod+C}} | Kopiér de valgte opmålingspunkter (også som punktrækker til et regneark) |
| {{key:Mod+X}} | Klip de valgte opmålingspunkter |
| {{key:Mod+V}} | Sæt punkter ind: de følger markøren, klik dér, de skal være |
| {{key:Mod+Shift+V}} | Sæt ind på samme sted: på punkternes egne koordinater |
| {{key:Mod+D}} | Duplikér de valgte punkter: en kopi følger markøren |
| {{key:Mod+A}} | Vælg alle opmålingspunkter |
| {{key:Esc}} | Fravælg alle (og annuller en indsætning) |

{{key:Mod+S}}, {{key:Mod+O}} og {{key:Mod+P}} virker, selv mens du skriver i et felt. {{key:Mod+Z}} og {{key:Mod+Y}} i et tekstfelt fortryder i stedet din skrivning, som sædvanligt, og det samme gælder {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} og {{key:Mod+A}}: i et felt kopierer, klipper, sætter de ind og vælger de dets tekst. Med tekst valgt på siden (i et panel) kopierer {{key:Mod+C}} den tekst. {{key:Mod+Shift+Z}} gør intet i CivilCraft: brug {{key:Mod+Y}} eller knappen {{ui:Gentag}}.

:::mac
Tasten på en Mac, der er mærket **delete**, er for browseren {{key:Backspace}}. For at slette et valg, tryk {{key:Delete}} (Fn og delete), eller vælg {{ui:Slet}} i værktøjslinjens menu {{ui:Mere}}.
:::

## Værktøjer

| Tast | Værktøj |
|---|---|
| {{key:V}} | {{ui:Vælg}} |
| {{key:M}} | {{ui:Mål}}: afstande, arealer og hældninger på planen ([Mål](topic:measure)) |
| {{key:A}} | {{ui:Tracé}} |
| {{key:G}} | {{ui:Byggeplateau}} |
| {{key:P}} | {{ui:Rør}} |
| {{key:B}} | {{ui:Brudlinje}} |
| {{key:O}} | {{ui:Afgrænsning}} |
| {{key:R}} | Vis eller skjul profilvisningen |
| {{key:I}} | Slå {{ui:Tilføj PVI'er}} til eller fra (åbner profilvisningen, hvis den er lukket) |
| {{key:F}} | {{ui:Tilpas}}: vis alt |
| {{key:D}} | {{ui:3D}}: vis grunden i 3D, eller gå tilbage til planen |
| {{key:E}} | Vis eller skjul hældninger og koter langs hver feature-linje (kun på skærmen) |

Trykker du på det aktive værktøjs tast igen, går du tilbage til {{ui:Vælg}}. Bogstaver med Shift gør intet.

## Mens du tegner

| Tast | Handling |
|---|---|
| {{key:Enter}} | Afslut tracéet, byggeplateauet, rørstrækningen, bruddlinjen eller afgrænsningen |
| {{key:Backspace}} | Fjern det sidst klikkede punkt |
| {{key:C}} | Feature-linje: slå buer til eller fra (efter et hjørne klikker du på et punkt på kurven, derefter dens ende) |
| {{key:Esc}} | Annuller tegningen (eller indsætningen); trykker du igen (eller når intet er tegnet), går du tilbage til {{ui:Vælg}} og ryder valget |

## Planvisning

| Tast eller handling | Resultat |
|---|---|
| Hjul | Zoom ind eller ud ved markøren |
| Træk på tomt område | Panorér (i ethvert værktøj; et kort klik klikker stadig; med {{key:Shift}} holdt nede tegner det en valgboks i stedet) |
| Træk med midterknappen | Panorér |
| Træk med højreknappen | Panorér (ingen menu åbner) |
| {{key:Space}} og træk | Panorér |
| Klik | Vælg (med {{ui:Vælg}}), eller placér et punkt (med et tegneværktøj) |
| {{key:Shift}} og klik | Føj et opmålingspunkt til valget, eller tag det ud |
| {{key:Shift}} og træk | Tegn en boks: de opmålingspunkter, der er indeni, føjes til valget. Træk rundt om dem for et [lasso](topic:lasso-selection) |
| {{key:Space}} mens du tegner et lasso | Vindue, derefter kryds, derefter hegn |
| Klik mens du indsætter | Sæt de indsatte punkter dér ({{key:Enter}} sætter dem på deres egne koordinater) |
| Træk et greb | Flyt en PI, et hjørne af et byggeplateau eller en konstruktion (ét fortrydelsestrin) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Panorér, når planen har fokus (klik på den først) |
| {{key:Plus}} og {{key:Minus}} | Zoom ind og ud i midten, når planen har fokus |

Tasten = zoomer ind ligesom {{key:Plus}}, så du behøver ikke Shift.

## Profilvisning

| Handling | Resultat |
|---|---|
| Klik med {{ui:Tilføj PVI'er}} til | Tilføj en PVI dér |
| Klik på en PVI | Vælg den |
| Træk en PVI | Flyt den (ét fortrydelsestrin) |
| {{key:Delete}} eller {{key:Backspace}} | Fjern den valgte PVI ({{key:Backspace}} kun når profilvisningen har fokus) |

Profilvisningen zoomer ikke og panorerer ikke.

## Skærm og hjælp

| Tast | Handling |
|---|---|
| {{key:F1}} | Åbn eller luk denne hjælp (sidepanelet); {{ui:Hjælp}} i appens bjælke gør det samme |
| {{key:Esc}} | Luk hjælpepanelet, når det er åbent |
| {{key:Ctrl+Shift+F}} | Skift mellem skærmtilstande: fuld skærm, fuld skærm med bjælker skjult, normal |
| {{key:Esc}} | Forlad fuld skærm (browserens egen tast) |

{{key:F1}} når hjælpen, før CivilCraft ser den, så den virker i ethvert værktøj. På de fleste Mac-tastaturer trykker du fn med F1, eller klikker på {{ui:Hjælp}}. {{key:Ctrl+Shift+F}} bruger Control-tasten på alle platforme, også på en Mac. Se [Brug af hjælp](common:help) for, hvordan du søger i denne hjælp.

## Mus, trackpad og berøring

:::mouse
- Hjulet zoomer ved markøren. En mus med et frit roterende hjul zoomer hurtigt: giv det korte drej.
- Panorér med et hvilket som helst træk på tomt område, midterknappen, højreknappen, eller {{key:Space}} og træk.
:::

:::mac
På en Mac-trackpad:

- To-fingers scroll **zoomer** (den panorerer ikke), og knibning zoomer også.
- For at panorere trykker og trækker du på tomt område med én finger, eller holder {{key:Space}} nede og trækker.
- Et klik med to fingre (højreklik) åbner ingen menu og gør intet i sig selv.
:::

:::touch
På en berøringsskærm:

- Det første tryk gør knapper og menurækker fingerstore.
- Tryk for at vælge eller placere et punkt; én finger trukket på tomt område panorerer. Et tryk kan vakle lidt: det panorerer først, når fingeren har flyttet sig omkring 10 pixels.
- To fingre knibes for at zoome og bevæges sammen for at panorere.
- Træk et greb eller en PVI med én finger. Greb tager en fingers bredde rundt om sig.
- Mens du tegner et tracé, byggeplateau, en bruddlinje, afgrænsning, rørstrækning, feature-linje eller parcel, tilbyder en bjælke over planen {{ui:Afslut}} ({{key:Enter}}), {{ui:Fortryd punkt}} ({{key:Backspace}}) og {{ui:Annuller}} ({{key:Esc}}). Et langt tryk (et halvt sekund uden bevægelse) afslutter også.
- I {{ui:Vælg}} føjer et langt tryk på et opmålingspunkt det til valget, eller tager det ud, ligesom {{key:Shift}}+klik gør.
- I 3D-visningen kredser én finger, to knibes og panorerer, og et tryk vælger.
- Der er ingen svæveeffekt på berøring, så statuslinjens aflæsninger opdateres kun, mens en finger er nede.
:::

## Browsertaster, der vinder

Nogle taster hører til browseren og når aldrig CivilCraft, fx {{key:Mod+W}} (luk fane), {{key:Mod+T}} (ny fane), {{key:Mod+N}} (nyt vindue) og {{key:F11}} (fuld skærm i Windows- og Linux-browsere). CivilCraft bruger dem ikke. Hvis en genvej i stedet åbner noget i browseren, så klik én gang på planen, så siden har fokus, og prøv igen.

## Hvor Flyt findes

Der er ingen kommando Flyt: vælg {{ui:Vælg}} og træk et punkt eller et hjørne, eller rediger dets koordinater i {{ui:Egenskaber}}. Se [Redigér punkter](topic:edit-points).
