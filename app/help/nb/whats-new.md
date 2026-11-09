---
title: Nytt i 0.8 og 0.8.1
summary: CivilCraft 0.8 legger til Lag regn (en storm over terrengarbeidet ditt), en massebalanse, en finner for beste trasé, fordrøyningsdammer, fremdrift fra oppmålinger, en importør fra adresse til område som beholder området i prosjektet, og vinduer for jord og skråninger, kryss og oppmerking, oppmålingsutjevning, dagbrudd, radiolinjer og sporveksler. 0.8.1 retter hvordan DWG-filer leses.
keywords: hva er nytt, nyheter, versjonsnotater, endringslogg, endringer, 0.8, 0.8.1, versjon, nye funksjoner, regn, storm, ponding, overløp, massearbeid, balanse, skjæring og fylling, transport, beste trasé, minste kostnad, veglinje, fordrøyningsdam, utløp, nedtapping, fribord, fremdrift, oppmåling, drone, lager, adresse til område, eiendom, jord, flom, skråningsstabilitet, bishop, setning, kryss, oppmerking, skilt, siktlinje, utjevning, minste kvadraters metode, polygontog, dagbrudd, blokkmodell, radiolinje, fresnel, sporveksel, kryssingsspor, språk, problemer, live, dwg
from: b0932cf0
---

Dette er endringene i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), sammenlignet med 0.7. De store nye delene er verktøy som tester terrengarbeidet og området ditt (regn, massearbeid, traseer, dammer, fremdrift), og seks beregningsvinduer for terreng, veier, oppmåling, gruver, radiolinjer og jernbane.

## Nytt

### Test terrengarbeidet

- **Lag regn.** {{ui:Make it rain…}} (under {{ui:Surface}}) slipper en storm over det planerte terrenget. Du ser vannet renne av plattformene, samle seg i de lave hjørnene og gå over dammene som er for små. Kjøringen er animert og gir volumene, toppavløpet og en CSV-fil med alle dammene. Standardcellen er grov, så en første titt går raskt; en finere celle tar lengre tid. Dammer som renner over, vises også i Problemer-panelet.
- **Massebalanse.** {{ui:Earthwork balancer…}} hever eller senker en plattform til skjæring er lik fylling, og viser massetransporttabellen mellom dem.
- **Beste trasé.** {{ui:Best route…}}: velg en start og en slutt, så finner CivilCraft den billigste veien over terrenget som holder seg innenfor stigning- og kurvegrensene dine, og lager en veglinje av den.
- **Fordrøyningsdammer.** {{ui:Detention ponds…}} beregner nivå og lagring ut fra terrenget ditt, tar med utløpsinnretninger (åpning, overløp, V-overløp, overløpskanal), kjører en storm gjennom dammen og kontrollerer toppavløpet som holdes tilbake, nedtappingstiden og fribordet.
- **Fremdrift fra oppmålinger.** {{ui:Progress from surveys…}} sammenligner drone- eller skanneflater fra ulike datoer med terrenget slik det var, og med prosjektet: prosent ferdig etter volum, områder som er gravd for dypt eller fylt for mye, lagerhauger, og når arbeidet er ferdig i dette tempoet (merket som et anslag).

### Kjenn til området

- **Adresse til område.** {{ui:Address to site…}} samler åpne data om eiendom, bygg, arealplan, jord, flom og terreng for ett område. Du kan beholde området i prosjektfilen: den skrevne adressen, hver kilde med datoen du hentet den og lisensen, og hva som kom tilbake. Åpner eller deler du prosjektet på nytt, er området fortsatt der, uten at noe hentes på nytt. Du kan også lagre det som en områdefil eller sende det til BimCraft. Se [Adresse til område](topic:address-to-site).

### Terreng, veier, oppmåling, gruver, radiolinjer og jernbane

- **Jord og skråninger.** {{ui:Soils and slopes…}} tegner jordprofilet mellom boringene du skriver inn. Bishops metode søker så etter den kritiske sirkelen i terrenget ditt, med grunnvannstand, tilleggslast og jordskjelvkoeffisient. Setning av et fundament får konsolidering, øyeblikkelig setning og tid.
- **Kryss og oppmerking.** {{ui:Junctions and striping…}} setter sammen armer med hjørnekurver (én radius per arm, eller tresenterkurver), siktlinjen for dimensjonerende hastighet, kontroll av siktrekantene, gangfelt, stoppstreker, merking og skilt med en skiltliste. De tegnes på plantegningen og lagres som .dxf med navngitte lag.
- **Oppmålingsutjevning.** {{ui:Survey adjustment…}} kjører en minste kvadraters utjevning av et polygontog eller nett: utjevnede koordinater, feilellipser, chi-kvadrat-test og et flagg på målingen som ikke passer. Frie nett, lukking av polygontog etter kompassregelen og RW5-, GSI-, JobXML- eller CSV-feltfiler er med, og de utjevnede punktene lagres som CSV.
- **Dagbrudd.** {{ui:Open pits…}} gjør borprøver om til en blokkmodell og det endelige dagbruddet innenfor skråningsvinkelen din, med avrabbingsforholdet, en tabell per benk og en kurve for gehalt og tonnasje. Nøstede dagbrudd etter inntektsfaktor og en produksjonsplan med diskontert kontantstrøm finnes også.
- **Radiolinjer.** {{ui:Radio links…}} kontrollerer frisikt over terrenget ditt med jordkrumningen, første Fresnel-sone, linkbudsjett, fadingmargin og flerveisbortfall, og gir masthøyden som skal til for å få veien fri. Det gjør også fibertapsbudsjetter, mengder for traséen og vind på et tårn.
- **Sporveksler.** {{ui:Rail turnouts…}} lager en sporveksel fra frosknummeret, kryssingsspor mellom parallelle spor, og et konstruksjonsprofil som vippes av overhøyde og utvides i kurve. En sporveksel kan ligge ved en stasjon på en veglinje.

Se [Jord og skråninger, kryss, oppmålingsutjevning, dagbrudd, radiolinjer og sporveksler](topic:soils-roads-survey-mines-links).

## I alle programmer

- **Språk.** 54 språk, ti av dem nye. Språk andre enn engelsk er maskinutkast til en morsmålsbruker har lest dem. Hjelpeemnene er fortsatt mest på engelsk.
- **Verktøylinjerader.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Bryt (som før), 2 rader eller 1 rad. CivilCraft-båndet viser det mest brukte verktøyet stort, de neste små, og resten bak pilen på gruppenavnet.
- **Inndataenheter.** Styreplate, penn, 3D-mus, kontroller og MIDI kan styre programmene.
- **Problemer.** Et Problemer-panel som varsler i alle programmer, med kontroller som leser regelverkspakker.
- **Live.** En visning av hvem som er hvor i en Live-økt.
- **Tillegg.** En liste over tillegg, med belysningstillegg.
- **Koble til AI-en din.** Enhver assistent du kobler til, kan styre CivilCraft-verktøyene. Den leveres med en merknad om at tilkobling med ett klikk i CadCraft Studio og den hostede koblingen ikke er klare ennå. Se [La en AI-assistent arbeide med området ditt](topic:assistants).

## Rettet i 0.8.1

- **DWG-klasseseksjonen.** Den ble lest som feil type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Bytte språk mens programmet kjører.** CadCraft Studio og de pakkede utgavene kan bytte språk under kjøring. De var bare på engelsk før. Ikke testet på alle plattformer ennå: si fra hvis språket ikke endres.

## Ikke i denne versjonen ennå

- **Dette er beregningshjelpemidler.** Alle resultater i de nye vinduene må kontrolleres av en ingeniør. Jordstyrker tar utgangspunkt i typiske verdier for jordgruppen, og vinduet sier det.
- **Lag regn.** En kjøring på eksempelområdet kan ta over to minutter i nettleseren med en fin celle. Den er kontrollert mot håndberegninger og et V-formet nedbørfelt, men ikke ennå på et virkelig planert område.
- **Adresse til område.** Den leser åpne datafiler du tar med deg, og er bare testet på våre egne filer. Trær er ikke en kilde. Å hente kilder for deg venter på formuleringene om personvern.
- **Fremdrift fra oppmålinger.** Testet bare på oppdiktede oppmålinger. Fremdrift på ark og merknader (MarkupCraft) og skanning mot modell (BimCraft) er ikke bygget.
- **Jord og skråninger.** Bare sirkulære flater: ingen kile- eller blokksøk og ingen strekksprekk.
- **Kryss.** Én radius per arm, ingen sveipebaner for lastebiler, og de går ennå ikke inn i korridoren.
- **Feltfiler.** Leserne er skrevet etter offentlige formatbeskrivelser og prøvd på filer vi laget selv. Ekte instrumentfiler er ønsket.
- **Radiolinjer og jernbane.** Radiolinjer: bare frirom-tap og flerveisbortfall (ingen regnbortfall eller antennemønstre), og ingen jernbanestandard: alle grenseverdier for jernbane er plassholdere, med utkastverdier som ingen jernbaneingeniør har kontrollert.
- **Windows og macOS.** 0.8 er ikke kodesignert. Windows kan varsle, og macOS ber om høyreklikk og deretter Åpne.

Alt annet står i [Ikke bygget ennå](topic:not-built-yet). For den forrige utgaven, se [Nytt i 0.7](topic:whats-new-0-7).
