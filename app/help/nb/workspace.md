---
title: Skjermen, del for del
summary: En omvisning i hver linje og hvert panel i CivilCraft med navnet de har på skjermen, fra verktøylinjen til statuslinjen.
keywords: grensesnitt, skjerm, verktøylinje, paneler, egenskaper, statuslinje, lengdeprofilvisning, oppsett, omvisning, brukergrensesnitt
from: 76272010
---

CivilCraft har én skjerm. Det finnes ingen faner og ingen layouter. Sidepanelene kan flyttes, flyte eller gå til et eget vindu: se [Ordne panelene og bruk en andre skjerm](common:arrange-panels). Ovenfra og ned og fra venstre mot høyre:

- **appfeltet** (CadCraft-merket, appnavn, versjon, Om, skjermmodus, Hjelp, Lagre for frakoblet bruk, Papir og Modell)
- **verktøylinjen** med sju grupper knapper
- **panelet til venstre**: Område, Punkter, Terrengmodell, Visning og, når du har importert noen, GIS-layere
- **planen** i midten, med **lengdeprofilvisningen** under når den er åpen
- **panelet til høyre**: Egenskaper for det som er valgt
- **statuslinjen** langs bunnen

## Appfeltet

Den tynne linjen helt øverst tilhører CadCraft-nettstedet, ikke CivilCraft selv.

- Versjonsmenyen viser hvilket bygg du kjører.
- {{ui:Om CivilCraft}} åpner appens side på nettstedet.
- {{ui:Fullskjerm}} bytter mellom skjermmodusene: fullskjerm, deretter fullskjerm med linjene skjult, deretter tilbake til normal. {{key:Ctrl+Shift+F}} gjør det samme på alle plattformer, også en Mac (det er Control-tasten der, ikke Command). Med linjene skjult flytter du pekeren til toppkanten for å få dem tilbake.
- {{ui:Hjelp}} (eller {{key:F1}}) åpner denne hjelpen i et sidepanel; {{key:F1}} eller {{key:Esc}} lukker det.
- {{ui:Lagre for frakoblet bruk}} beholder CivilCraft i denne nettleseren slik at den åpnes uten forbindelse; den viser da {{ui:Klar frakoblet}}. Se [Filer du kan åpne, lagre og eksportere](topic:files#online-and-offline).
- {{ui:Papir}} og {{ui:Modell}} bytter mellom et lyst og et mørkt tema. Planen og lengdeprofilet følger temaet; PDF-er skrives alltid ut på hvitt.

## Verktøylinjen

Hver gruppe har en liten etikett over knappene sine. Hold pekeren over en knapp for å se verktøytipset og tasten.

| Gruppe | Knapper | Hva de gjør |
|---|---|---|
| Fil | {{ui:Ny}}, {{ui:Åpne}}, {{ui:Lagre}} | Begynne på nytt, åpne en punktfil, LandXML eller et prosjekt, lagre prosjektet som en nedlasting |
| Eksporter | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Skrive LandXML 1.2, en R12-DXF eller en DWG av planen, eller plotte planen til PDF |
| Terrengmodell | {{ui:Bruddlinje}}, {{ui:Avgrensning}} | Tegne en bruddlinje gjennom oppmålingspunkter; tegne ytre avgrensning |
| Prosjektering | {{ui:Veglinje}}, {{ui:Byggeplate}}, {{ui:Rør}}, {{ui:Lengdeprofil}} | Tegne en veglinje, en byggeplate, en rørstrekning; vise eller skjule lengdeprofilvisningen |
| Rediger | {{ui:Angre}}, {{ui:Gjør om}}, {{ui:Kopier}}, {{ui:Lim inn}}, {{ui:Mer}} | Angre, gjøre om, kopiere og lime inn oppmålingspunkter; {{ui:Mer}} har Klipp ut, Lim inn på samme sted, Dupliser, Slett, Velg alle punkter og Fjern utvalg |
| GIS | {{ui:Koordinater}}, {{ui:Importer}}, {{ui:Eksporter}}, {{ui:Kart}} | Sette koordinatsystemet, importere og eksportere GIS-filer, vise kartlayere under planen |
| Visning | {{ui:Velg}}, {{ui:Tilpass}}, {{ui:3D}} | Velge og flytte ting; zoome for å vise alt; vise området i 3D ([Se området i 3D](topic:site-3d)) |

Et tegneverktøy blir stående nedtrykt mens det er aktivt. Å klikke det igjen, trykke {{key:Esc}} eller trykke {{key:V}} går tilbake til {{ui:Velg}}. {{ui:Angre}}, {{ui:Gjør om}}, {{ui:Kopier}} og valgene i {{ui:Mer}} er grået ut når de ikke kan virke; verktøytipset sier hvorfor (for eksempel «Velg oppmålingspunkter først»). Hver knapp er listet i [Verktøylinjereferanse](topic:toolbar).

I et smalt vindu ruller verktøylinjen sidelengs.

## Panelet til venstre

### Område

- **Navn**: prosjektnavnet. Det navngir hver fil du lagrer eller eksporterer og skrives i PDF-ens tittellinje.
- **Enheter**: {{ui:US feet}} eller {{ui:Meter}}. Dette sier hva tallene betyr. Å endre det konverterer **ikke** koordinater; se [Enheter, profilnummer og tallformater](topic:units-and-stations).

### Punkter

Tomt forteller det hvordan du åpner en punktfil. Med punkter viser det filnavnet, antall punkter og hvor mange som har en høyde, deretter en tabell over **punktgrupper**: én rad per første ord i beskrivelsen (GRD, FL, TBS …), med et antall og et valg for **Terrengmodell**:

- {{ui:Punkter}}: punktene går inn i terrengmodellen (standard for hver gruppe).
- {{ui:Bruddlinje}}: gruppens punkter slås sammen, i punktnummerrekkefølge, til én bruddlinje.
- {{ui:Utelatt}}: gruppen berører ikke terrengmodellen.

### Terrengmodell

Fakta om eksisterende terreng: punkter, trekanter, laveste og høyeste høyde, middelhøyde, areal i 2D og 3D, bruddlinjer og om det finnes en avgrensning. Under faktaene lister en boks alt terrengbyggeren måtte rette eller ikke kunne gjøre. Deretter:

- **Lengste ytre kant**: 0 beholder alle ytre trekanter; et tall trimmer lange, tynne trekanter av utsiden.
- Lenker som dukker opp når de gjelder: {{ui:Fjern avgrensningen}}, {{ui:Fjern tegnede bruddlinjer}} og, for en terrengmodell lest fra LandXML, {{ui:Bygg terrengmodellen på nytt fra punktene}}.

### Visning

- **Terrengmodell**: {{ui:Eksisterende terreng}} eller {{ui:Prosjektert (formet)}}. Den andre er tilgjengelig når en byggeplate eller korridor former uten problemer.
- **Høydekurver hver**, **Hovedkurve hver** og **Bånd** (antall fargebånd).
- Avmerkingsbokser: {{ui:Høydekurver}}, {{ui:Kurveetiketter}}, {{ui:Trekanter}}, {{ui:Høydebånd}}, {{ui:Fallpiler}}, {{ui:Punkter}}, {{ui:Punktetiketter}}, {{ui:Bruddlinjer}}, {{ui:Terrengmodellens kant}}, {{ui:Rør}}.
- En tegnforklaring over båndhøyder vises når bånd er på.

Visningsinnstillinger lagres med prosjektet, men er ikke angretrinn: {{key:Mod+Z}} slår aldri en avmerkingsboks tilbake.

## Planen

Planen viser punktene, terrengmodellen og alt du prosjekterer, i planvisning med nord opp. Hjulet zoomer ved pekeren, dra i tomt område for å panorere. Hele listen står i [Taster og mus](topic:keyboard).

- På et tomt prosjekt lister en boks med tittelen **Start med oppmålingspunkter** de første trinnene og tilbyr {{ui:Åpne eksempelområdet}}.
- Mens et tegneverktøy er aktivt, sier et hint øverst på planen hva du skal klikke og hvordan du fullfører.
- Å dra en fil over planen viser «Slipp en punktfil, LandXML eller et prosjekt».
- Valgte ting utheves. En valgt veglinje eller byggeplate viser firkantede håndtak ved PI-ene eller hjørnene; en valgt konstruksjon viser ett håndtak. Dra et håndtak for å flytte det.
- Valgte oppmålingspunkter har en ring. {{key:Shift}} og et klikk legger til eller fjerner et punkt; {{key:Shift}} og en drag tegner en boks (eller, dratt rundt dem, en lasso) som legger til punktene innenfor. Se [Velg, kopier og lim inn oppmålingspunkter](topic:copy-paste-points).

## Lengdeprofilvisningen

Trykk {{key:R}} eller klikk {{ui:Lengdeprofil}} for å åpne den under planen. Linjen har:

- en veglinjeliste (aktivert når det er to eller flere veglinjer)
- {{ui:Legg til PVI-er}}: mens den er nedtrykt, legger et klikk i lengdeprofilet til en PVI ({{key:I}} slår den av og på)
- en avlesning av profilnummer, terreng, prosjektert høyde, stigning og skjæring eller fylling under pekeren
- en lukkeknapp

Lengdeprofilet viser eksisterende terreng, det prosjekterte lengdeprofilet, stigninger på hver rettstrekning, hver PVIs profilnummer og høyde, hver vertikalkurves L og K med BVC og EVC, høyeste og laveste punkter og den vertikale overhøyden. Det tilpasses alltid hele veglinjen: det zoomer eller panorerer ikke. Å flytte pekeren langs det setter en prikk på veglinjen i planen.

## Panelet til høyre: Egenskaper

Overskriften sier hva det viser.

- **Prosjekt** (ingenting valgt): veglinjene og byggeplatene som lenker, blokken **Masseberegning** og blokken **Rørnett** med reglene og problemene.
- **Veglinje**: navn, startprofilnummer, lengde, PI-tabellen, kurvene, det prosjekterte lengdeprofilets PVI-tabell og fakta, og innstillingene for **Korridor**.
- **Byggeplate**: navn, høyde, skjærings- og fyllingsskråninger, areal, dagslinjefakta og masseberegning.
- **Konstruksjon** eller **Rør**: størrelser, toppkoter, bunnkoter, fall, overdekning og eventuelle problemer.
- **Punkt** og nummeret: punktets koordinater, høyde, beskrivelse og gruppe (skrivebeskyttet).

Felt trer i kraft når du trykker {{key:Enter}} eller forlater feltet. En verdi som ikke godtas, merkes som ugyldig, og ingenting endres.

## Statuslinjen

- **Ø** og **N**: øst og nord under pekeren.
- **Terreng**høyde der (og **Formet** der en byggeplate eller korridor endret den), eller «Utenfor terrengmodellen».
- Den nærmeste veglinjen (eller den valgte) med **Pr** og avstand (**V** eller **H**) under pekeren.
- Til høyre meldinger: hva som nettopp skjedde, eller hvorfor noe ble avvist. En melding fjerner seg selv etter noen sekunder.

## Dialoger

- **Importer punkter**: åpnes med hver punktfil. Se [Importer oppmålingspunkter](topic:import-points).
- **Plott planen til PDF**: se [Plott planen til PDF](topic:plot-pdf).
- **Ulagrede endringer**: spør før {{ui:Ny}} eller å åpne et prosjekt eller en LandXML-fil kaster ulagret arbeid. {{ui:Lagre en kopi}} laster ned prosjektet først.

## Små skjermer

Opp til 760 piksler bredt, for eksempel på en telefon, beholder planen skjermen: verktøylinjen er én rad som ruller sidelengs, og panelene åpnes som ark fra en linje nederst. {{ui:Verktøy}} skjuler verktøylinjen og {{ui:Flytt}} setter den nederst.
