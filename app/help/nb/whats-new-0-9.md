---
title: Nytt i 0.9 (tidligere)
summary: Korridor- og terrengmaler, fangst og plukkeknapper i tegning, GIS-analyse med attributttabell, skygge-, solenergi-, komfort- og vindstudier for et område, en 3D-rendervisning, og tilleggene Punktskyer og WaterCraft.
keywords: nytt i 0.9, tidligere utgivelse, nytt, 0.9, utgivelsesnotater, korridormaler, terrengmaler, malredigerer, typisk tverrprofil, flere korridorer, fangst, fang, plukk, flytt, kopier, roter, tangent, render, 3d render, gis-analyse, buffer, overlegg, romlig sammenkobling, attributttabell, stil etter egenskap, skyggestudie, solenergi, utci, utendørs komfort, vindstudie, openfoam, punktskyer, las, laz, watercraft, brannvann, brannhydrant, vannalder, klor, forbruk, verktøytips, oppsett, endringslogg, endringer, 0.8, 0.8.1, versjon, nye funksjoner, regn, storm, dammer, overløp, jordarbeider, balanse, skjæring og fylling, transport, beste trasé, minste kostnad, veglinje, fordrøyningsdam, utløp, nedtapping, fribord, fremdrift, oppmåling, drone, lagerhaug, adresse til område, eiendom, jord, flom, skråningsstabilitet, bishop, setning, kryss, merking, skilt, siktlengde, utjevning, minste kvadrater, polygontog, dagbrudd, blokkmodell, radiolink, fresnel, sporveksel, språk, problemer, live, dwg
from: 4664522c
---

Dette er det som endret seg i CivilCraft 0.9, sammenlignet med 0.8.1. CivilCraft 0.9 er en del av CadCraft Studio 0.9 og dets åtte apper. De store delene er korridor- og terrengmaler, fangst mens du tegner, GIS-analyse, studier av et områdes sol, solenergi, komfort og vind, og to tillegg: Punktskyer og WaterCraft.

## Nytt

### Korridor- og terrengmaler

- **Korridormaler.** Åpne {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Korridormaler…}} (eller skriv {{cmd:TEMPLATES}}). En mal er et lite tverrsnitt med komponenter, forskyvninger, helninger, materialer og punktkoder. Behold dem i prosjektet, i {{ui:Mitt bibliotek}} eller som en `.cctemplates.json`-fil. Malredigereren viser en tegning i riktig målestokk og lister opp problemer mens du skriver.
- **Bygg etter maler per stasjon.** Velg en veglinje og slå på {{ui:Bygg etter maler per stasjon}} i dens Egenskaper. Hver side av hvert område har sin egen liste over kjørebaner og sin egen endetilstand. {{ui:Legg til en korridor}} under {{ui:Korridorer på denne linjen}} legger flere korridorer på én veglinje.
- **Terrengmaler.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Terrengmaler…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) drapperer lagdelte materialer, for eksempel toppjord eller belegning og bærelag, over et terreng, med areal og volum per lag. Se [Korridormaler og terrengmaler](topic:corridor-templates).

### Tegning

- **Fangst.** Verktøyene Veglinje, Byggeplate, Eiendom, Masse, Formlinje, Mål, Grense og Nedbørfelt fester seg til oppmålingspunkter, PI-er, hjørner, hjørnepunkter og konstruksjoner, med en etikett ved markøren. Hold {{key:Alt}} for et fritt punkt.
- **Plukkeknapper, tangent og flytt, kopier, roter.** Hjørnene på byggeplater, eiendommer og formlinjer har felt for skrevet Øst og Nord og en plukkeknapp med kryss. Egenskaper har også {{ui:Tangent fra to punkter}} for veglinjer og {{ui:Flytt, kopier og roter}} for veglinjer, byggeplater, eiendommer og formlinjer. Se [Tegn med fangst, plukkede hjørner og flytt, kopier, roter](topic:draft-with-snaps).
- **Rendervisning i 3D.** Knappen {{ui:Render}} på 3D-raden tegner terrenget med naturlige farger, himmel, dis og myke skygger. Den endrer ikke modellen. {{ui:Sol}}-menyen har nå knappene {{ui:Bruk}} og {{ui:Lukk}}. Se [Vis området i 3D](topic:site-3d).
- **Paneler åpnes én seksjon om gangen.** Venstre panel og Egenskaper-panelet åpner én seksjon og lukker de andre, og flisene på Landskap-båndet som har flere verktøy, er delte knapper.

### GIS-analyse

- **Analyser.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Analyser}} tilbyr buffer, overlegg, romlig sammenkobling, utvalg etter egenskap eller form, og måling. Hvert verktøy lager et nytt lag i ett angrestegg.
- **Attributttabell.** Et lags meny med tre prikker har {{ui:Attributttabell…}} og {{ui:Stil etter egenskap…}}. Se [Analyser GIS-lag](topic:gis-analysis) og [Arbeid med et lags attributttabell](topic:gis-table).

### Området: sol, solenergi, komfort og vind

- **Miljøseksjonen.** Velg en masse: seksjonen {{ui:Miljø}} ligger under {{ui:Soltimer}} i dens Egenskaper. Den har en skyggestudie (kart, tabell, animasjon, CSV), solenergi fra en værfil for et typisk år (.epw) og utendørs komfort (UTCI).
- **Vind, bare grov vurdering.** {{ui:Kjør vindstudie}} farger terrenget fra sitte til ubehagelig for hver vindretning i værfilen. Den er ikke validert, og panelet sier det.
- **Vind for fotgjengere (OpenFOAM)-tillegg.** Av til du slår det på i {{ui:Innstillinger}} › {{ui:Tillegg}}. OpenFOAM er programvare du installerer selv. Se [Skygge, solenergi og utendørs komfort](topic:environment).

### Punktskyer (tillegg)

- Slå på {{ui:Punktskyer}} i {{ui:Innstillinger}} › {{ui:Tillegg}}; fanen Punktskyer vises i høyre panel. Åpne en LAS- eller LAZ-fil, rens den, sorter den i terreng, vegetasjon og bygninger, bygg terreng, høydekurver og volumer, og eksporter LAS eller LAZ. Se [Punktskyer fra drone eller skanner](topic:point-clouds).

### WaterCraft (tillegg)

- Slå på {{ui:WaterCraft (vannfordeling)}} i {{ui:Innstillinger}} › {{ui:Tillegg}}; en WaterCraft-fane vises. Den har forbruk fra kunder, brannvannsstrøm ved hver hydrant, hvilket hovedledningsavbrudd som betyr mest, og vannalder og klor, hver lagret som CSV. Se [WaterCraft: forbruk, brannvann, avbrudd og vannalder](topic:watercraft).

### Samarbeid

- I en live-økt ser dere hverandres markører og navn i planen. Bibliotekplanter: CivilCraft Landskap starter fra sin standard bibliotekssamling, {{ui:CivilCraft landskap}}.

## I alle apper

- Hint vises som Bootstrap-verktøytips, og starttipset kan lukkes.
- En panelfanerad som ikke får plass, ruller i stedet for å bli kuttet av.
- Titlene på nettleserfaner er `<document> - CivilCraft | CadCraft`.
- {{ui:Innstillinger}} har en seksjon for oppsett der oppsettene er en rullegardin med tolinjevalg.
- Vekt- og temperaturenheter står i {{ui:Innstillinger}} › {{ui:Globalt}} › {{ui:Enheter}}.
- Språklisten viser språkene bygget har filer for. Språk utover engelsk er maskinelle utkast.

## Rettet

- Tilleggene for adresseoppslag og EnergyPlus-kontroll kunne ikke slås på; nå kan de det.
- Hjelpen sier nå at tillegget Punktskyer skriver en renset sky som LAS 1.4 eller LAZ.
- Å klikke på det valgte objektets eget håndtak starter ikke lenger en håndtaksdra som stoppet en ventende Plukk.

## Ærlige begrensninger

- Eksempelmalene for korridorer er plassholdere uten standard; en ingeniør må kontrollere dem. Terrengmaler legger ikke til noen flate og tegnes ikke i 3D eller i tverrprofilvisningen. Den andre korridoren på en veglinje er ikke med i IFC-eksporten. Det finnes ingen avsmalning mellom to maler etter profilnummer.
- Punktskyer er testet på oppdiktede filer, ikke en ekte drone-oppmåling. Bare LAS og LAZ leses.
- GIS-analysen er testet på oppdiktede lag.
- Skygge, sol og komfort er planleggingsanslag; vind er ikke validert grov vurdering. Ingenting av dette er en prosjekteringsverdi.
- WaterCraft er et beregningshjelpemiddel kontrollert på oppdiktede nett. En vannfaglig ingeniør avgjør hva tallene er verdt.
- Språk utover engelsk er maskinelle utkast.
- Installasjonsprogrammene for Windows er ikke kodesignert, og diskavbildet for macOS er ikke notarisert.

## Tidligere: 0.8 og 0.8.1

Dette er det som endret seg i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), sammenlignet med 0.7. De store nye delene er verktøy som tester terrengformingen og området ditt (regn, jordarbeider, ruter, dammer, fremdrift), og seks beregningsvinduer for terreng, veier, oppmåling, gruver, lenker og bane.

### Nytt

**Test terrengformingen din**

- **Lag regn.** {{ui:Lag regn…}} (under {{ui:Terrengmodell}}) slipper en storm over det formede terrenget. Du ser vannet renne av byggeplatene, samle seg i de lave hjørnene og gå over dammene som er for små. Kjøringen er animert og gir volumene, topputløpet og en CSV for hver dam. Standardcellen er grov, så en første titt går raskt; en finere celle er tregere. Dammer som flyter over, vises også i panelet Problemer.
- **Massebalanse.** {{ui:Massebalanse…}} hever eller senker en byggeplate til skjæring er lik fylling, og viser transporttabellen mellom dem.
- **Beste trasé.** {{ui:Beste trasé…}}: velg en start og en slutt, og CivilCraft finner den billigste veien over terrenget som holder seg innenfor fall- og kurvegrensene dine, og lager deretter en veglinje av den.
- **Fordrøyningsdammer.** {{ui:Fordrøyningsdammer…}} beregner vannstand og magasinering fra terrenget ditt, tar med utløpsinnretninger (åpning, overløpskant, V-kutt, flomløp), ruter en storm gjennom dammen og kontrollerer toppen som holdes tilbake, nedtappingstiden og fribordet.
- **Fremdrift fra oppmålinger.** {{ui:Fremdrift fra oppmålinger…}} sammenligner drone- eller skanneflater fra ulike datoer med terrenget slik det var, og med prosjektet: prosent ferdig etter volum, områder som er gravd for dypt eller fylt for høyt, lagerhauger, og når arbeidet blir ferdig i dette tempoet (merket som et anslag).

**Kjenn området**

- **Adresse til område.** {{ui:Adresse til område…}} samler åpne data om eiendom, bygning, regulering, jord, flom og terreng for ett område. Du kan beholde området i prosjektfilen: den skrevne adressen, hver kilde med dagen du hentet den og lisensen, og det som kom tilbake. Åpne eller del prosjektet på nytt, og området er der fortsatt, uten at noe hentes på nytt. Du kan også lagre det som en områdefil eller sende det til BimCraft. Se [Adresse til område](topic:address-to-site).

**Terreng, veier, oppmåling, gruver, lenker og bane**

- **Jord og skråninger.** {{ui:Jord og skråninger…}} tegner jordprofilet mellom borhull du skriver inn. Bishops metode søker deretter den kritiske sirkelen i terrenget ditt, med grunnvannstand, overlast og en jordskjelvkoeffisient; setning av et fundament får konsolidering, øyeblikkelig setning og tid.
- **Kryss og oppmerking.** {{ui:Kryss og oppmerking…}} setter armer sammen med kantsteinsavrundinger (én radius per arm, eller tre-sentrum-avrundinger), siktlengden for prosjekteringshastigheten, en kontroll av siktrekantene, fotgjengerfelt, stoppstreker, markeringer og skilt med en skiltliste. De tegnes i planen og lagres som en .dxf med navngitte lag.
- **Oppmålingsutjevning.** {{ui:Oppmålingsutjevning…}} kjører en minste kvadraters utjevning av et polygontog eller nett: utjevnede koordinater, feilellipser, chi-kvadrat-testen og et flagg på målingen som ikke passer. Frie nett, lukking av et polygontog etter kompassregelen, og RW5-, GSI-, JobXML- eller CSV-feltfiler er med, og de utjevnede punktene lagres som CSV.
- **Dagbrudd.** {{ui:Dagbrudd…}} gjør borprøver om til en blokkmodell og det endelige dagbruddet innenfor skråningsvinkelen din, med avdekningsforholdet, en tabell per benk og en gehalt- og tonnasjekurve. Innkapslede dagbrudd etter inntektsfaktor og en produksjonsplan med diskontert kontantstrøm finnes også.
- **Radiolinjer.** {{ui:Radiolinjer…}} kontrollerer siktlinjen over terrenget ditt med jordkrumningen, den første Fresnel-sonen, linkbudsjett, fadingmargin og multipath-avbrudd, og gir mastehøyden som ville gi fri sikt over strekningen. Den gjør også fiberkurs-budsjetter, mengder for traseen og vinden på et tårn.
- **Sporveksler.** {{ui:Sporveksler…}} lager en sporveksel fra dens krysningsnummer, kryssingsspor mellom parallelle spor og en profilramme som helles av sporhelling og utvides i en kurve. En sporveksel kan ligge ved et profilnummer på en veglinje.

Se [Jord, kryss, oppmålingsutjevning, gruver, radiolinjer og sporveksler](topic:soils-roads-survey-mines-links).

### I alle apper

- **Språk.** 54 språk, ti av dem nye. Språk utover engelsk er maskinelle utkast til en morsmålsbruker har lest dem. Hjelpeemnene er fortsatt for det meste på engelsk.
- **Verktøylinjerader.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Verktøylinjerader}}: Bryt (som før), 2 rader eller 1 rad. CivilCraft-båndet viser det mest brukte verktøyet stort, de neste små, og resten bak pilen på gruppenavnet.
- **Inndataenheter.** Styreflate, penn, 3D-mus, kontroller og MIDI kan styre appene.
- **Problemer.** Et panel for problemer som varsler i alle apper, med kontroller som leser regelpakker.
- **Live.** En visning av hvem som er hvor i en live-økt.
- **Tillegg.** En liste over tillegg, med belysningstillegg.
- **Koble til din assistent.** Enhver assistent du kobler til, kan styre CivilCraft-verktøyene. Den leveres med en merknad om at tilkobling med ett klikk i CadCraft Studio og den hostede koblingen ikke er klare ennå. Se [La en assistent jobbe med området ditt](topic:assistants).

### Rettet i 0.8.1

- **DWG-klasseseksjonen.** Den ble lest som feil type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Bytte språk mens appen kjører.** CadCraft Studio og de pakkede utgavene kan bytte språk mens de kjører. Før var de bare på engelsk. Ikke testet på alle plattformer ennå: si fra hvis språket ikke endres.

### Ikke i denne versjonen ennå

- **Dette er beregningshjelpemidler.** Hvert resultat i de nye vinduene må kontrolleres av en ingeniør. Jordstyrker starter fra typiske verdier for jordgruppen, og vinduet sier det.
- **Lag regn.** En kjøring på eksempelområdet kan ta over to minutter i nettleseren med en fin celle. Den er kontrollert mot håndregnede tilfeller og et V-formet nedbørfelt, men ikke ennå på et ekte formet område.
- **Adresse til område.** Den leser åpne datafiler du tar med deg, og er bare testet på egne filer. Trær er ikke en kilde. Å hente kilder for deg venter på personvernformuleringen.
- **Fremdrift fra oppmålinger.** Testet bare på oppdiktede oppmålinger. Fremdrift på ark og markeringer (MarkupCraft) og skanning mot modell (BimCraft) er ikke bygget.
- **Jord og skråninger.** Bare sirkelformede flater: ingen kile- eller blokksøk og ingen strekksprekk.
- **Kryss.** Én radius per arm, ingen sveipkurver for lastebiler, og de går ennå ikke inn i korridoren.
- **Feltfiler.** Leserne ble skrevet fra offentlige formatbeskrivelser og prøvd på filer vi laget. Ekte instrumentfiler etterspørres.
- **Lenker og bane.** Radiolinjer: bare fri-romsdemping og multipath (ingen regnfading eller antennediagrammer), og ingen jernbanestandard: hver grense for bane er en plassholder, med utkastverdier ingen jernbaneingeniør har kontrollert.
- **Windows og macOS.** 0.8 er ikke kodesignert. Windows kan advare, og macOS ber om høyreklikk og deretter Åpne.

Alt annet står i [Ikke bygget ennå](topic:not-built-yet). For den tidligere utgivelsen, se [Nytt i 0.7](topic:whats-new-0-7).
