---
title: Legg ut en horisontal veglinje
summary: Tegn en veglinje etter PI-ene, sett radier på kurvene og startprofilnummeret, flytt PI-er, og les kurvedata, profilnummer og forskyvning.
keywords: veglinje, ingen løsning, kurve passer ikke, største radius, minste radius, minimumsradius, dimensjonerende hastighet, overlapp, senterlinje, pi, horisontalkurve, radius, profilnummerering, tangent, opprett veglinje, veglinjeoppsett, pc, pt, profilnummer forskyvning
from: 8c5df4aa
---

En veglinje i CivilCraft er en kjede av tangenter gjennom skjæringspunkter (PI-er), med en sirkelkurve i hver indre PI som har en radius. Den får profilnummer fra et startprofilnummer du velger. Et prosjekt kan ha mange veglinjer.

## Tegn veglinjen

1. Trykk {{key:A}}, eller klikk {{ui:Veglinje}} i gruppen **Design**.
   Hintet sier «Veglinje: klikk PI-ene i rekkefølge. Enter eller dobbeltklikk avslutter, Backspace fjerner den siste, Esc avbryter.»
2. Klikk på den første PI-en (starten på veglinjen).
3. Klikk på hver påfølgende PI i rekkefølge. En rød linje følger pekeren og viser lengden og retningen på tangenten du tegner, for eksempel «212.40 ft  N 63°12'05" E».
4. Klikk på den siste PI-en (slutten på veglinjen).
5. Trykk {{key:Enter}}.
   Veglinjen tegnes med profilnummer og er valgt. Statuslinjen sier for eksempel «Veglinje 1: 386.36 ft, kurver med 100 ft radius der de får plass. Rediger radier i Egenskaper; Lengdeprofil (R) for å prosjektere stigningen.»

Mens du tegner: {{key:Backspace}} fjerner den siste PI-en, {{key:Esc}} avbryter, og å dra på et tomt område panorerer uten å legge til en PI.

:::warning
Avslutt med {{key:Enter}}. Dobbeltklikk avslutter også, men i denne versjonen fjerner den PI-en du dobbeltklikket på. Klikk på den siste PI-en én gang, og trykk deretter {{key:Enter}}.
:::

Hver indre PI får en kurve med 100 ft (30 m i et prosjekt i meter), eller den største hele radiusen som får plass i halvparten av hver tangent hvis 100 ft ikke får plass. Svært skarpe PI-er og PI-er som går rett gjennom, får ingen kurve.

## Sett radier og koordinater

Med veglinjen valgt viser høyre panel **Veglinje**:

1. **Navn** og **Startprofilnummer**. Skriv inn et profilnummer som `10+00` (fot) eller `0+500` (meter), eller som et vanlig tall. Se [Enheter, profilnummer og tallformater](topic:units-and-stations).
2. **Lengde** og **Sluttprofilnummer** beregnes for deg.
3. Tabellen **PI-er** viser hver PI sin **Øst** og **Nord**, og en **Radius** for hver indre PI. Skriv inn en ny verdi og trykk {{key:Enter}}.
   - Radius 0 gir et knekkpunkt uten kurve.
   - Første og siste PI har aldri radius.
   - Den lille x-en på slutten av en rad fjerner den PI-en (en veglinje har minst to).
4. Les lista **Kurver**: for hver kurve, PC- og PT-profilnumrene, radius R, avbøyning Δ og retning (venstre eller høyre), lengde L, tangent T, ytre E og korde.
5. Linjen under kurvene gir retningen på den første tangenten.

## Når en kurve ikke får plass

Hvis kurvene trenger mer tangent enn det som finnes mellom PI-ene, har veglinjen ingen løsning: den tegnes ikke riktig før du retter den, og den utelates fra LandXML-eksport. En rød boks forklarer hvorfor, med tall, og tilbyr det som ville passet:

- «Kurvene ved PI 2 og PI 3 trenger 240.00 ft tangent mellom seg (130.00 + 110.00), men PI-ene ligger 180.00 ft fra hverandre.» — eller, når bare én av dem har en kurve, «Kurven ved PI 2 trenger 240.00 ft tangent mot PI 1 …».
- En knapp for hver PI setter **den største radiusen som får plass** der, med den andre kurven beholdt som den er (den må også passe til PI-ens andre tangent). Når begge PI-ene har kurver, krymper **Begge** de to radiene i samme forhold, slik at de akkurat møtes.
- Når én kurve alene er lengre enn tangenten, sier boksen at ingen kurve ved den andre PI-en får plass så lenge den er så stor.
- En PI som vender rett tilbake, kan ikke få en kurve; boksen tilbyr **Ingen kurve ved PI n**.

Hver knapp er ett steg: {{key:Mod+Z}} setter radiene tilbake. Tilbudte radier rundes ned til 0.01, slik at de alltid får plass.

### En minimumsradius for prosjektering

Skriv inn en **Minimumsradius for prosjektering** (for eksempel fra den dimensjonerende hastigheten) for å få hver kurve kontrollert mot den; la feltet stå tomt for ingen. En kurve under den vises med en knapp for **den minste radiusen som oppfyller minimum**, når den radiusen får plass. Når den ikke får plass, sier boksen det og gir den største radiusen tangentene tillater, slik at du vet at du må flytte en PI eller senke minimum.

## Flytt PI-er i planen

1. Med {{ui:Velg}} aktiv, klikk på veglinjen for å velge den. Firkantede håndtak vises i PI-ene.
2. Dra et håndtak. Veglinjen, profilnummereringen, lengdeprofilet og korridoren følger med.
3. Slipp. Flyttingen er ett steg for å angre.

Å legge til en PI mellom to eksisterende er ikke tilgjengelig ennå: slett veglinjen og tegn den på nytt, eller skriv inn nye koordinater for PI-ene du har.

## Les profilnummer og forskyvning

Før pekeren over planen. Statuslinjen viser nærmeste veglinje (eller den valgte) med profilnummer og forskyvning, **V** eller **H** sett i retning mot økende profilnummer, for eksempel «Veglinje 1: Pn 2+15.30, forskyvning 18.42 H». Utenfor den ene eller andre enden legger den til «(utenfor enden)».

## Hva som tegnes

I planen, i DXF og i PDF: senterlinjen (tangenter som linjer, kurver som sanne buer), en strek hver 50 ft (20 m) med en lengre strek og en profilnummeretikett hver 100. enhet, og PC- og PT-streker merket med profilnumrene deres.

## Slett en veglinje

Velg den og trykk {{key:Delete}}, eller klikk {{ui:Slett}} i verktøylinjen eller nederst i høyre panel. Lengdeprofilet og korridoren går med den. {{key:Mod+Z}} henter den tilbake.

:::mac
På et Mac-tastatur er tasten merket **delete** {{key:Backspace}} for nettleseren, og den sletter ikke et valg. Trykk {{key:Delete}} (Fn og delete), eller bruk knappen {{ui:Slett}}.
:::

## Neste

- [Prosjekter en vertikal profil](topic:profile).
## Dimensjonerende hastighet og klasse

Under veglinjens **Egenskaper** lagres **Dimensjonerende hastighet** (km/h eller mph) og **Dimensjoneringsklasse** sammen med veglinjen, i prosjektet og skrevet til IFC (Pset_RoadDesignCriteriaCommon). CivilCraft har ingen tabell som knytter en hastighet til en minimumsradius, så ingenting kontrolleres ut fra dem: sett **Minimumsradius** etter din egen prosjekteringsnorm.

## Overgangskurver

En kurve kan ha en klotoide-overgangskurve i hver ende: tangent, overgang, kurve, overgang, tangent. I PI-tabellen skriver du inn en lengde i **Overgang inn** og **Overgang ut** for en PI som har en radius. PI-en blir stående der den er; kurven flyttes innover for å gi plass, slik at tangentavstanden øker med overgangens forskyvning. De to lengdene kan være ulike, og en PI med bare én lengde får overgangskurve bare i den enden.

Lista over kurver viser da TS, SC, CS og ST (tangent til overgang, overgang til kurve, kurve til overgang, overgang til tangent) med overgangsvinkelen θs, tangentavstandene og den ytre avstanden. Profilnumrene går langs overgangskurvene som ellers. Overgangskurver som til sammen dreier mer enn kurven, avvises med PI-en nevnt; en overgang som er lengre enn tangenten tillater, er en overlapp, slik som for enhver kurve. Overhøyde bruker overgangskurven som utløpsstrekning (se [Korridor](topic:corridor)).
