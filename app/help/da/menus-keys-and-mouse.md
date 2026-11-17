---
title: Menuer, taster og mus
summary: Vælg en menustil, der passer til den måde, du allerede arbejder på, giv en kommando din egen tast, flyt kommandoer mellem faner på båndet, og angiv hvad hjulet og museknapperne gør i planen og i 3D.
keywords: menustil, menuer, bånd, anlægsbånd, værktøjslinje, kommandolinje, klassisk tegning, tastaturgenveje, genveje, taster, tilpas, omdefiner, mus, hjul, invertér, zoomretning, midterknap, højreknap, panorér, kredsbevægelse, eksportér, importér, skift, bekendt
from: 07ac73a0
---

CivilCraft's kommandoer er de samme, uanset hvordan du når dem. En **menustil** bestemmer kun, hvor de sidder på skærmen, hvad de hedder dér, og hvilke taster der kører dem, så du kan beholde dine vaner. Vælg en i {{ui:Indstillinger}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menuer, taster og mus}}; ændringen træder i kraft med det samme, og denne browser husker den.

## De tre stilarter

| Stil | Det får du |
|---|---|
| {{ui:CivilCraft}} | CivilCraft's egen værktøjslinje (File, Export, Surface, Design, Edit, GIS, View) og enkelte taster: {{key:A}} tracé, {{key:G}} byggeplateau, {{key:P}} rør, {{key:B}} brudlinje, {{key:O}} grænse, {{key:L}} feature-linje, {{key:R}} længdeprofil, {{key:X}} snit, {{key:E}} planering, {{key:D}} 3D, {{key:F}} tilpas, {{key:V}} vælg. Startstilen. |
| {{ui:Klassisk tegning}} | Et lille bånd ({{ui:Start}}, {{ui:Indsæt}}, {{ui:Output}}) og en kommandolinje, til dem der skriver kommandoer: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (fortryd), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Begynd at skrive hvor som helst, så går bogstaverne til kommandolinjen; {{key:Enter}} kører, {{key:Enter}} på intet gentager den sidste kommando, og {{key:Esc}} rydder den. Midterknappen panorerer. |
| {{ui:Anlægsbånd}} | Faner med store knapper, sådan som anlægsdesignprogrammer grupperer deres værktøjer: {{ui:Start}} (terrændata, opret design, længdeprofil- og tværprofilvisninger), {{ui:Overflader}}, {{ui:Rediger}}, {{ui:Geolokation}}, {{ui:Visning}} og {{ui:Output}}, med en {{ui:Fil}}-menu og hurtigknapper til højre. Taster med ét bogstav bliver. Midterknappen panorerer planen; i 3D panorerer midterknappen, og {{key:Shift}} med midterknappen kredser. |

Alle stilarter beholder {{key:Mod}}-tasterne: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
En tast, der hører til CivilCraft's egen layout, men som din stil har givet en anden kommando, gør ingenting, og statuslinjen siger, hvor dens kommando er blevet af ("I Mine taster er Pad Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} og piletasterne beholder altid deres betydning, og mens du tegner en linje, beholder dens punkter deres taster ({{key:Backspace}}, {{key:Enter}}).
:::

## Gør det til dit eget

1. Vælg den stil, der ligner det, du vil have, og klik derefter på {{ui:Tilpas…}}.
2. Under {{ui:Taster og menuer}} finder du en kommando (søgefeltet hjælper). Klik på {{ui:Tilføj en nøgle}}, og tryk på tasten, eller to taster lige efter hinanden for en tast med to bogstaver. Klik på en tast for at fjerne den.
3. Med et bånd flytter {{ui:Hvor den sidder}} kommandoen til en anden fane og et andet panel, til menuen {{ui:Fil}}, eller til {{ui:Kun taster}}.
4. Under {{ui:Mus}} angiver du hjulet, de knapper der panorerer planen, og hvad hver knap gør i 3D-visningen.
5. Giv den et navn, og klik på {{ui:Gem}}.

Når du gemmer en indbygget stil, laves din egen kopi ("Mit anlægsbånd"); den indbyggede ændres aldrig. En tast, der er givet til to kommandoer, eller en der ville køre, før en tast med to bogstaver kan skrives, vises med rødt og skal rettes, før du kan gemme.

## Mus

- **Musehjul**: {{ui:Rul op zoomer ind}} (startstilen) eller {{ui:Rul op zoomer ud}}, og hvor hurtigt, i planen og i 3D. En knibebevægelse på touchpad zoomer altid den vej, fingrene bevæger sig.
- **Panorér planen med**: midterknappen, højreknappen eller begge. {{key:Space}} og træk panorerer også. Venstre knap vælger og tegner altid.
- **Træk i 3D-visningen**: {{ui:Hver visnings egne}} beholder CivilCraft's knapper (venstre kredser, højre panorerer). Eller sæt hver knap til at kredse, panorere, zoome eller ingenting; {{key:Shift}} med knappen bytter kredsning og panorering. Et klik uden træk vælger stadig.

## Tag den med dig

{{ui:Eksportér}} gemmer den stil, der er i brug, som en lille `.ccinput.json`-fil; {{ui:Importér…}} tilføjer en, fra en anden computer eller en kollega. En importeret fil kan kun pege på CivilCraft's egne kommandoer: alt andet i den udelades og tælles i statuslinjen. {{ui:Slet denne stil}} fjerner en af dine egne.

:::note
Disse indstillinger bliver i denne browser. {{ui:Brug denne stil i alle apps}} under stilkortene får hver app til at åbne i den tilsvarende stil (sin egen værktøjslinje, et bånd eller Klassisk tegning), med de ændringer, du har lavet i hver app. CivilCraft har ingen menulinjestil: når en anden apps menulinje vælges for alle apps, beholder CivilCraft sin egen værktøjslinje.
:::

Se også: [Tastatur og mus](topic:keyboard) · [CivilCraft-indstillinger](topic:settings) · [Kommer fra anden anlægssoftware](topic:coming-from)
