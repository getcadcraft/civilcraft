---
title: Nytt i 0.9
summary: Maler for korridorer og terreng, snapping og Velg-knapper under tegning, GIS-analyse med attributttabell, skygge, soleutbytte, komfort- og vindstudier for et område, en 3D-Render-visning, og tillegggene Punktsky og WaterCraft.
keywords: nytt, 0.9, utgivelsesnotater, korridormaler, terrengmaler, malredigering, typisk snitt, flere korridorer, snap, snapping, velg, flytt, kopier, roter, tangent, render, 3d render, gis-analyse, buffer, overlegg, romlig sammenføyning, attributttabell, stil etter attributt, skyggestudie, soleutbytte, utci, utendørs komfort, vindstudie, openfoam, punktsky, las, laz, watercraft, brannvann, hydrant, vannalder, klor, forbruk, tooltips, oppsett, nytt, utgivelsesnotater, endringslogg, endringer, 0.8, 0.8.1, versjon, nye funksjoner, regn, overvann, oppdemming, overflyt, massebalanse, massetransport, beste trasé, minste kostnad, veglinje, fordrøyningsdam, utløp, nedtapping, fribord, fremdrift, oppmåling, drone, lagerhaug, adresse til område, eiendom, jord, flom, skråningsstabilitet, bishop, setning, kryss, oppmerking, skilt, siktlengde, utjevning, minste kvadrater, polygontog, dagbrudd, blokkmodell, radiolinje, fresnel, sporveksel, kryssing, språk, problemer, live, dwg
from: d7ac5b14
---

Dette er endringene i CivilCraft 0.9 sammenlignet med 0.8.1. CivilCraft 0.9 er en del av CadCraft Studio 0.9 og dens åtte apper. De store delene er maler for korridorer og terreng, snapping under tegning, GIS-analyse, studier av et områdes sol, soleutbytte, komfort og vind, og to tillegg: Punktsky og WaterCraft.

## Nytt

### Korridor- og terrengmaler

- **Korridormaler.** Åpne {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Korridormaler…}} (eller skriv {{cmd:TEMPLATES}}). En mal er et lite tverrsnitt med komponenter, forskyvninger, helninger, materialer og punktkoder. Oppbevar dem i prosjektet, i {{ui:Mitt bibliotek}} eller som en `.cctemplates.json`-fil. Malredigeringen viser en tegning i riktig målestokk og lister opp problemer mens det skrives inn.
- **Bygg etter maler per stasjon.** Velg en veglinje og slå på {{ui:Bygg etter maler per stasjon}} i dens {{ui:Egenskaper}}. Hver side av hver region har sin egen liste over kjørebaner og sin egen endebetingelse. {{ui:Legg til en korridor}} under {{ui:Korridorer på denne linjen}} legger flere korridorer på én linje.
- **Terrengmaler.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Terrengmaler…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) legger lagdelte materialer, for eksempel matjord eller belegg og underlag, over et terreng, med areal og volum per lag. Se [Korridormaler og terrengmaler](topic:corridor-templates).

### Tegning

- **Snapping.** Verktøyene Veglinje, Byggeplate, Eiendom, Masse, Formlinje, {{ui:Mål}}, Grense og Nedbørfelt snapper til målepunkter, PI-er, hjørnepunkter og konstruksjoner, med en merkelapp ved markøren. Hold {{key:Alt}} for et fritt punkt.
- **Velg-knapper, tangent og flytt, kopier, roter.** Hjørner på byggeplater, eiendommer og formlinjer har felt for skrevet Øst og Nord og en Velg-knapp med krysshår. Egenskaper har også {{ui:Tangent fra to punkter}} for veglinjer og {{ui:Flytt, kopier og roter}} for veglinjer, byggeplater, eiendommer og formlinjer. Se [Tegn med snapping, valgte hjørner og flytt, kopier, roter](topic:draft-with-snaps).
- **Render-visning i 3D.** Knappen {{ui:Render}} på 3D-linjen tegner terrenget med naturlige farger, himmel, dis og myke skygger. Den endrer ikke modellen. Menyen {{ui:Sol}} har nå knappene {{ui:Bruk}} og {{ui:Lukk}}. Se [Vis området i 3D](topic:site-3d).
- **Paneler åpnes én seksjon om gangen.** Venstre panel og Egenskaper-panelet åpner én seksjon og lukker de andre, og flisene på Landskap-båndet som har flere verktøy, er delte knapper.

### GIS-analyse

- **Analyser.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Analyser}} tilbyr buffer, overlegg, romlig sammenføyning, velg etter attributt eller form, og mål. Hvert verktøy lager et nytt layer i ett angretrinn.
- **Attributttabell.** Menyen med tre prikker for et layer har {{ui:Attributttabell…}} og {{ui:Stil etter attributt…}}. Se [Analyser GIS-layer](topic:gis-analysis) og [Arbeid med attributttabellen til et layer](topic:gis-table).

### Området: sol, soleutbytte, komfort og vind

- **Miljøseksjon.** Velg en masse: seksjonen {{ui:Miljø}} ligger under {{ui:Soltimer}} i dens {{ui:Egenskaper}}. Den har en skyggestudie (kart, tabell, animasjon, CSV), soleutbytte fra en værfil for et typisk år (.epw) og utendørs komfort (UTCI).
- **Vind, bare screening.** {{ui:Kjør vindstudie}} fargelegger terrenget fra sitting til ubehagelig for hver vindretning i værfilen. Den er ikke validert, og panelet sier det.
- **Fotgjengervind (OpenFOAM)-tillegg.** Av til det slås på i {{ui:Innstillinger}} › {{ui:Tillegg}}. OpenFOAM er programvare som installeres selv. Se [Skygge, soleutbytte og utendørs komfort](topic:environment).

### Punktsky (tillegg)

- Slå på {{ui:Punktsky}} i {{ui:Innstillinger}} › {{ui:Tillegg}}; en fane for Punktsky vises i panelet til høyre. Åpne en LAS- eller LAZ-fil, rydd den, sorter den i terreng, vegetasjon og bygninger, bygg terreng, høydekurver og volumer, og eksporter LAS eller LAZ. Se [Punktskyer fra drone eller skanner](topic:point-clouds).

### WaterCraft (tillegg)

- Slå på {{ui:WaterCraft (vannfordeling)}} i {{ui:Innstillinger}} › {{ui:Tillegg}}; en WaterCraft-fane vises. Den har forbruk fra kunder, brannvann ved hver hydrant, hvilket ledningsavbrudd som betyr mest, og vannalder og klor, hver lagret som CSV. Se [WaterCraft: forbruk, brannvann, avbrudd og vannalder](topic:watercraft).

### Samarbeid

- I en Live-økt vises hverandres markører og navn i planen.
- Planter i biblioteket: CivilCraft Landscape starter fra sin standardsamling i biblioteket, {{ui:CivilCraft landscape}}.

## I alle apper

- Hint vises som Bootstrap-verktøytips, og starttipset kan lukkes.
- En faneraden som ikke får plass, ruller i stedet for å bli kuttet av.
- Faneoverskrifter i nettleseren har formen `<document> - CivilCraft | CadCraft`.
- {{ui:Innstillinger}} har en seksjon for oppsett der oppsettene er en rullegardin med tolinjevalg.
- Vekt- og temperaturenheter står i {{ui:Innstillinger}} › {{ui:Globalt}} › {{ui:Enheter}}.
- Språklisten viser språkene som denne versjonen har filer for. Andre språk enn engelsk er maskinelle utkast.

## Rettet

- Tilleggene for adresseoppslag og EnergyPlus-kontroll kunne ikke slås på; nå kan de det.
- Hjelpen sier nå at Punktsky-tillegget skriver en renset sky som LAS 1.4 eller LAZ.
- Å klikke på det valgte objektets eget håndtak starter ikke lenger en håndtaksdra som stoppet en ventende Velg.

## Begrensninger

- Eksempelmalene for korridorer er plassholdere uten standard; en ingeniør må kontrollere dem. Terrengmaler legger ikke til noen flate og tegnes ikke i 3D eller i snittvisningen. Den andre korridoren på en linje er ikke med i IFC-eksporten. Det finnes ingen jevn overgang mellom to maler etter stasjon.
- Punktsky er testet på oppdiktede filer, ikke på en ekte dronemåling. Bare LAS og LAZ leses.
- GIS-analysen er testet på oppdiktede layer.
- Skygge, sol og komfort er planleggingsestimater; vind er ikke-validert screening. Ingenting av dette er en dimensjonerende verdi.
- WaterCraft er et beregningshjelpemiddel kontrollert på oppdiktede nett. En vannekspert avgjør hva tallene er verdt.
- Andre språk enn engelsk er maskinelle utkast.
- Installasjonsprogrammene for Windows er ikke kodesignert, og diskbildet for macOS er ikke notarisert.

## Tidligere: 0.8 og 0.8.1

Dette er endringene i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02) sammenlignet med 0.7. De store nye delene er verktøy som tester terrengforming og området (regn, massebalanse, traséer, dammer, fremdrift) og seks beregningsvinduer for terreng, veier, måling, gruver, koblinger og bane.

### Nytt

**Test terrengformingen**

- **Lag regn.** {{ui:Lag regn…}} (under {{ui:Terrengmodell}}) slipper et uvær over det formede terrenget. Vannet renner av byggeplatene, samler seg i lavpunktene og flyter over dammer som er for små, og det vises som en animasjon. Kjøringen gir volumene, toppavløpet og en CSV med hver dam. Standardcellen er grov, så en første titt er rask; en finere celle er tregere. Dammer som flyter over, vises også i Problemer-panelet.
- **Massebalanse.** {{ui:Massebalanse…}} hever eller senker en byggeplate til skjæring og fylling er like, og viser transporttabellen mellom dem.
- **Beste trasé.** {{ui:Beste trasé…}}: velg start og slutt, så finner CivilCraft den billigste veien over terrenget som holder seg innenfor helnings- og kurvegrensene som er satt, og lager deretter en veglinje av den.
- **Dammer for fordrøyning.** {{ui:Fordrøyningsdammer…}} beregner vannstand og lagring fra terrenget, tar med utløpsinnretninger (åpning, terskel, V-åpning, overløp), leder en regnstorm gjennom dammen og kontrollerer toppen som holdes tilbake, tømmetiden og fribordet.
- **Fremdrift fra oppmålinger.** {{ui:Fremdrift fra oppmålinger…}} sammenligner drone- eller skannede terrengflater fra ulike datoer med terrenget slik det var, og med prosjektet: prosent ferdig etter volum, områder som er gravd for dypt eller fylt for høyt, lagerhauger, og når arbeidet er ferdig i dette tempoet (merket som et estimat).

**Kjenn området**

- **Adresse til område.** {{ui:Adresse til område…}} samler åpne data om eiendom, bygning, soning, grunn, flom og terreng på ett område. Området kan beholdes i prosjektfilen: den skrevne adressen, hver kilde med datoen den ble hentet og lisensen, og det som kom tilbake. Når prosjektet åpnes på nytt eller deles, er området der fortsatt, uten at noe hentes på nytt. Området kan også lagres som en områdefil eller sendes til BimCraft. Se [Adresse til område](topic:address-to-site).

**Terreng, veier, måling, gruver, koblinger og bane**

- **Jord og skråninger.** {{ui:Jord og skråninger…}} tegner jordprofilet mellom borehull som skrives inn. Bishops metode søker deretter den kritiske sirkelen i terrenget, med grunnvannstand, overlast og jordskjelvkoeffisient; setning av et fundament får konsolidering, øyeblikkelig setning og tid.
- **Kryss og oppmerking.** {{ui:Kryss og oppmerking…}} setter armer sammen med kantsteinsavrundinger (én radius per arm, eller trekentrede avrundinger), siktlengden for dimensjonerende hastighet, en kontroll av siktarealene, fotgjengerfelt, stoppstreker, merking og skilt med en skiltliste. De tegnes i planen og lagres som en .dxf med navngitte layer.
- **Oppmålingsutjevning.** {{ui:Oppmålingsutjevning…}} kjører en minste kvadraters utjevning av et polygontog eller et nett: utjevnede koordinater, feilellipser, chi-kvadrat-test og et flagg på målingen som ikke passer. Frie nett, lukking av et polygontog etter kompassregelen og RW5-, GSI-, JobXML- eller CSV-feltfiler er med, og de utjevnede punktene lagres som CSV.
- **Dagbrudd.** {{ui:Dagbrudd…}} gjør borprøver om til en blokkmodell og den endelige gropen innenfor skråningsvinkelen, med avdekningsforholdet, en tabell per benk og en kurve for gehalt og tonnasje. Nøstede groper etter inntektsfaktor og en produksjonsplan med diskontert kontantstrøm finnes også.
- **Radiolinjer.** {{ui:Radiolinjer…}} kontrollerer fri sikt over terrenget med jordkrumningen, første Fresnel-sone, linjebudsjett, fadingmargin og flerveisutfall, og gir mastehøyden som ville gi fri passasje. Den gjør også fiber-tapsbudsjetter, traséemengder og vind på et tårn.
- **Sporveksler.** {{ui:Sporveksler…}} lager en sporveksel fra tungenummeret sitt, kryssinger mellom parallelle spor og en konstruksjonsprofil som helles av sporhelning og utvides i en kurve. En sporveksel kan ligge ved en stasjon på en veglinje.

Se [Jord, kryss, målingsutjevning, gruver, radiolinjer og sporveksler](topic:soils-roads-survey-mines-links).

### I alle apper

- **Språk.** 54 språk, ti av dem nye. Andre språk enn engelsk er maskinelle utkast til en morsmålstalende har lest dem. Hjelpeemnene er fortsatt for det meste på engelsk.
- **Verktøylinjerader.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Verktøylinjerader}}: Bryt (som før), 2 rader eller 1 rad. Båndet i CivilCraft viser det mest brukte verktøyet stort, de neste små, og resten bak pilen på gruppenavnet.
- **Inndataenheter.** Styreflate, penn, 3D-mus, kontroller og MIDI kan styre appene.
- **Problemer.** Et Problemer-panel som varsler i alle apper, med kontroller som leser regelpakker.
- **Live.** En visning av hvem som er hvor i en Live-økt.
- **Tillegg.** En liste over tillegg, med belysningstillegg.
- **Koble til en AI.** Enhver assistent som kobles til, kan styre verktøyene i CivilCraft. Den leveres med en merknad om at tilkobling med ett klikk i CadCraft Studio og den hostede koblingen ikke er klare ennå. Se [La en AI-assistent arbeide med området](topic:assistants).

### Rettet i 0.8.1

- **DWG-klasseseksjon.** Den ble lest som feil type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Bytte språk mens programmet kjører.** CadCraft Studio og de pakkede utgavene kan bytte språk mens programmet kjører. Tidligere var de bare på engelsk. Ikke testet på alle plattformer ennå: meld fra hvis språket ikke endres.

### Ikke med i denne versjonen ennå

- **Dette er beregningshjelpemidler.** Hvert resultat i de nye vinduene må kontrolleres av en ingeniør. Jordstyrker starter fra typiske verdier for jordgruppen, og vinduet sier det.
- **Lag regn.** En kjøring på eksempelområdet kan ta over to minutter i nettleseren med en fin celle. Den er kontrollert mot håndberegninger og et V-formet nedbørfelt, ikke ennå på et ekte formet område.
- **Adresse til område.** Den leser åpne datafiler som tas inn, og er testet bare på egne filer. Trær er ikke en kilde. Henting av kilder venter på personvernformuleringen.
- **Fremdrift fra oppmålinger.** Testet bare på oppdiktede oppmålinger. Fremdrift på ark og markeringer (MarkupCraft) og skanning mot modell (BimCraft) er ikke bygget.
- **Jord og skråninger.** Bare sirkulære flater: ingen kile- eller blokksøk og ingen strekksprekk.
- **Kryss.** Én radius per arm, ingen kjørekurver for lastebiler, og de kommer ikke inn i korridoren ennå.
- **Feltfiler.** Leserne er skrevet etter offentlige formatbeskrivelser og prøvd på filer vi har laget. Ekte instrumentfiler er ønsket.
- **Koblinger og bane.** Radiolinjer: bare frirommedempning og flerveisutbredelse (ingen regnfading eller antennediagrammer), og ingen jernbanestandard: alle grenser for bane er plassholdere, med utkastverdier som ingen jernbaneingeniør har kontrollert.
- **Windows og macOS.** 0.8 er ikke kodesignert. Windows kan advare, og macOS ber om høyreklikk og deretter Åpne.

Alt annet står i [Ikke bygget ennå](topic:not-built-yet). For den tidligere utgivelsen, se [Nytt i 0.7](topic:whats-new-0-7).
