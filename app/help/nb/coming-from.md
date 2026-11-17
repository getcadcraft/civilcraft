---
title: Kommer fra annen anleggsprogramvare
summary: Hvordan kjente arbeidsflyter for anleggsprosjektering knyttes til CivilCraft, og forskjellene som lurer erfarne brukere den første timen.
keywords: bytte, migrere, kjent, forskjeller, arbeidsflyt, kommandoer, kartlegging, cogo, korridor, terrengforming, rørnett, stiler, kommandolinje
from: feae37d6
---

Hvis du har brukt Civil 3D, kjenner du allerede ideene i CivilCraft: punkter og punktgrupper, TIN-terrengmodeller med bruddlinjer og avgrensninger, veglinjer etter PI, profiler etter PVI, sammensetninger feid inn i korridorer, terrengforming til skjæring, rørnett med selvfall, LandXML. Det som er annerledes, er nesten alt rundt dem: det finnes ingen tegningsfil, ingen kommandolinje (med mindre du velger menystilen {{ui:Klassisk tegning}}), ingen stiler, ingen Prospector og ingen innstillingsdialoger. CivilCraft er et lite, fokusert verktøy i en nettleser, og i denne versjonen gjør det en brøkdel av det en full anleggspakke gjør. Denne siden viser hva du kjenner, og hvor det finnes her.

:::tip
Hvis du liker båndet i Civil 3D, velg menystilen {{ui:Veibånd}} i {{ui:Innstillinger}} › {{ui:CivilCraft}} › {{ui:Menyer, taster og mus}}: fanene Hjem, Terrengmodeller, Endre, Geolokalisering, Visning og Utdata, midtknappen panorerer, og {{key:Shift}} med midtknappen roterer 3D-visningen. Hvis du skriver kommandoer, legger {{ui:Klassisk tegning}} til en kommandolinje (ALIGNMENT, PAD, PROFILE, ZOOM …). Se [Menyer, taster og mus](topic:menus-keys-and-mouse).
:::

## Arbeidsflytkart

| Det du vil gjøre | Kjent måte | I CivilCraft |
|---|---|---|
| Hente inn oppmålingspunkter | Importer punkter med et punktfilformat | {{ui:Åpne}}, og kontroller deretter kolonnerekkefølgen i **Importer punkter** ([Importer oppmålingspunkter](topic:import-points)) |
| Sortere punkter | Punktgrupper, beskrivelsesnøkler | Automatiske grupper etter første ord i beskrivelsen; ingen beskrivelsesnøkler |
| Redigere et punkt | Punktredigerer, håndtak | Klikk på det og skriv inn i Egenskaper, eller dra det ([Rediger et oppmålingspunkt](topic:edit-points)) |
| Bygge eksisterende terreng | Opprett en terrengmodell, legg til punktgrupper som data | Automatisk: terrengmodellen bygges på nytt når inndataene endres |
| Legge til bruddlinjer | Legg til bruddlinjer fra polylinjer eller formlinjer | Sett en punktgruppe til {{ui:Bruddlinje}}, eller klikk punkter med verktøyet {{ui:Bruddlinje}} ({{key:B}}) |
| Trimme terrengmodellen | Ytre avgrensning, skjult avgrensning, maksimal trekantlengde | {{ui:Avgrensning}} ({{key:O}}, bare ytre) og **Lengste ytterkant** |
| Vise høydekurver | Stil for terrengmodell | **Vis** i venstre panel: intervall, hver hovedkurve, etiketter, bånd, skråningspiler |
| Legge ut senterlinjen | Verktøy for å opprette linjer, innstillinger for kurver og overgangskurver | {{ui:Veglinje}} ({{key:A}}): klikk PI-er, {{key:Enter}}; radier og lengder på overgangskurver i PI-tabellen |
| Lage en profilvisning | Veiviser for profilvisning, bånd | {{ui:Lengdeprofil}} ({{key:R}}): én profilvisning under planen, alltid tilpasset |
| Prosjektere stigningen | Verktøy for profiloppsett | {{ui:Start fra terrenget}}, {{ui:Legg til PVI-er}} ({{key:I}}), dra PVI-er, skriv inn **Kurve L** |
| Bygge en vei | Sammensetning, delsammensetninger, korridor, mål, regioner | Kryss av for **Sveip en sammensetning langs prosjekteringsprofilen** under veglinjen; et kjørefelt, skulder og sideskråning på hver side, eller hver side bygget av deler (rennestein, kantstein, fortau …) |
| Prosjektere en byggeplate | Formlinjer, prosjekteringsgrupper, prosjekteringskriterier | {{ui:Byggeplate}} ({{key:G}}): en flat byggeplate med skjærings- og fyllingsskråninger ut til dagslinjen |
| Beregne massene | Volumoverflater, volumoversikt | **Jordarbeider** i høyre panel, rutenettmetode, oppdateres direkte |
| Legge ut overvann eller spillvann | Rørnett med delliste, regler | {{ui:Rør}} ({{key:P}}): klikk konstruksjoner nedstrøms; tre regler du setter; automatiske bunnkoter |
| Utveksle med andre | Import og eksport av LandXML | {{ui:Åpne}} en LandXML-fil; {{ui:LandXML}} for å eksportere ([Utveksle LandXML](topic:landxml)) |
| Sende linjeverk til CAD | Eksport til DWG | {{ui:DWG}} (format 2000 til 2018) eller {{ui:DXF}} (R12) |
| Plott | Layouter, visningsområder, arkset | {{ui:PDF}}: ett liggende ark med planen i valgt målestokk; plan- og profilark og snittark som PDF |
| Dele arbeid mellom filer | Datasnarveier, referanser | Ikke tilgjengelig: ett prosjekt per fil |
| Angre | Angre | {{key:Mod+Z}} og {{key:Mod+Y}}, 200 steg; visningsinnstillinger er ikke steg for å angre |

## Forskjeller som lurer folk

**Det finnes ingen kommandolinje** med mindre du velger menystilen {{ui:Klassisk tegning}}. Verktøyene er knapper på verktøylinjen og enkeltbokstaver: {{key:A}} veglinje, {{key:G}} byggeplate, {{key:P}} rør, {{key:B}} bruddlinje, {{key:O}} avgrensning, {{key:R}} lengdeprofil, {{key:I}} legg til PVI-er, {{key:V}} velg, {{key:F}} tilpass. I de andre menystilene gjør det ingenting å skrive et kommandonavn. Se [Taster og mus](topic:keyboard).

**Enter avslutter; dobbeltklikk er risikabelt.** Klikk på det siste punktet én gang, og trykk deretter {{key:Enter}}. I denne versjonen avslutter et dobbeltklikk også, men det fjerner punktet du dobbeltklikket på. Høyreklikk avslutter eller gjentar ikke; det panorerer bare når du drar med det.

**Alt er dynamisk, hele tiden.** Endrer du en punktgruppe, en radius, en PVI eller en byggeplateskråning, oppdateres terrengmodellen, høydekurvene, korridoren, dagslinjene og volumene med én gang. Det er ingenting å bygge på nytt, og ingenting blir utdatert.

**Ingenting er et tegningsobjekt.** Planen er en visning av prosjekteringen, ikke en tegning du kan redigere med CAD-kommandoer. Du kan ikke legge til egne linjer eller tekst, endre fargen på et layer, eller eksplodere noe. Eksporter til DXF og fullfør tegningen i et CAD-program.

**Ingen stiler.** Farger, linjetykkelser, tekststørrelser og layernavn er faste (se [Planlag](topic:plan-layers)). Papir og Modell i programlinjen bytter mellom en lys og en mørk skjerm.

**Én av hver.** Én modell av eksisterende terreng, ett planert resultat og ett rørnett per prosjekt. Mange veglinjer og byggeplater er greit.

**Enheter er bare merkelapper.** Å velge {{ui:US feet}} eller {{ui:Meter}} konverterer ingenting. Det finnes ingen tegnemålestokk. Et koordinatsystem er valgfritt: sett ett under {{ui:Koordinater}}, og ingenting flyttes; det sier bare hva tallene betyr (se [Sett prosjektets koordinatsystem](topic:coordinate-systems)). Fot behandles som US survey feet når de skrives til LandXML.

**Bruddlinjegrupper kobles sammen i punktnummerrekkefølge.** En gruppe satt til {{ui:Bruddlinje}} blir én linje gjennom alle punktene, i nummerrekkefølge. Felles koder (to rennelinjer som begge er kodet «FL») gir én sikksakklinje; tegn dem for hånd.

**Profilnummer ser like ut, meter er forskjellig.** Fot bruker 100 ft profilnummer (12+34.56); meter bruker 1000 m profilnummer (1+234.567).

**Slett på Mac.** Tasten som er merket delete på Mac er Backspace for nettleseren. Bruk Fn og delete, eller knappen {{ui:Slett}}, for å slette et valg.

**Filer lastes ned.** {{ui:Lagre}} laster ned en `.civilcraft.json`-fil hver gang; det finnes ingen «lagre over den åpne filen». En gjenopprettingskopi av ulagret arbeid holdes i denne nettleseren ([Gjenopprett ulagret arbeid](common:recover)). Åpning av en punktfil erstatter punktene uten å spørre. Se [Filer du kan åpne, lagre og eksportere](topic:files).

**Reglene er dine.** Regler for rørnettverk og korridorens sammensetning starter med plassholderverdier som ikke er en norm. Sett egne før du stoler på en kontroll.

**Volumer er rutenettbasert.** Skjæring og fylling kommer fra et fint rutenett mellom de to terrengmodellene, innenfor dagslinjene, uten svell eller setning. De ligger nær, men er ikke det samme som et TIN-til-TIN-volum.

## Hva som mangler

Overgangskurver som ikke er klotoider, sammensetninger som endres langs veien, skrå byggeplater, innløpskapasitet og fordrøyning, delekataloger, rør i profil, eiendomsoppsett og tomtedeling, minste kvadraters utjevning og oppmålingsdatabaser, åpning av DWG, og mer. Hele listen, med hva du kan gjøre i stedet i dag, står i [Ikke bygget ennå](topic:not-built-yet).
