---
title: Nytt i 0.8 och 0.8.1
summary: CivilCraft 0.8 lägger till Låt det regna (en storm över din planerade terräng), en massbalansering, ett verktyg för bästa sträckning, fördröjningsmagasin, framdrift från inmätningar och ett adressimport som håller tomten kvar i projektet, samt fönster för jordar och slänter, korsningar och målning, utjämning av mätning, dagbrott, radiolänkar och spårväxlar. 0.8.1 åtgärdar hur DWG-filer läses.
keywords: nytt, vad är nytt, versionsinformation, ändringslogg, ändringar, 0.8, 0.8.1, version, nya funktioner, regn, storm, översvämning, översvämmas, massa, balans, schakt och fyllning, transport, bästa sträckning, lägsta kostnad, linjeföring, fördröjningsmagasin, utlopp, avtappning, fribord, framdrift, inmätning, drönare, upplag, adress till tomt, fastighet, jord, översvämning, släntstabilitet, bishop, sättning, korsning, målning, skyltar, siktsträcka, utjämning, minsta kvadrat, polygontåg, dagbrott, blockmodell, radiolänk, fresnel, spårväxel, korsningsväxel, språk, problem, live, dwg
from: b0932cf0
---

Det här ändrades i CivilCraft 0.8 (2026-11-01) och 0.8.1 (2026-11-02), jämfört med 0.7. De största nya delarna är verktyg som testar din planerade terräng och din tomt (regn, massor, sträckningar, dammar, framdrift), samt sex beräkningsfönster för mark, vägar, mätning, gruvor, länkar och järnväg.

## Nytt

### Testa din planerade terräng

- **Låt det regna.** {{ui:Låt det regna…}} (under {{ui:Terrängmodell}}) släpper en storm över den planerade marken. Du ser vattnet rinna av från plattorna, samlas i de låga hörnen och flöda över de dammar som är för små. Körningen är animerad och ger volymerna, det största utflödet och en CSV-fil med alla dammar. Standardcellen är grov så att en första titt går snabbt; en finare cell tar längre tid. Dammar som vattnet flödar över syns också i panelen {{ui:Problem}}.
- **Massbalansering.** {{ui:Massbalansering…}} höjer eller sänker en plattform tills schakt är lika med fyllning, och visar transporttabellen mellan dem.
- **Bästa sträckning.** {{ui:Bästa sträckning…}}: välj en start och ett mål, så hittar CivilCraft den billigaste vägen över terrängen som håller sig inom dina gräns för lutning och kurvradie, och gör sedan en linjeföring av den.
- **Fördröjningsmagasin.** {{ui:Fördröjningsmagasin…}} beräknar nivå och magasinsvolym utifrån din mark, tar med utloppsanordningar (öppning, överfall, V-skåra, bräddavlopp), låter ett regn passera genom dammen och kontrollerar den maximala tillbakahållna flödestoppen, tömningstiden och fribordet.
- **Framdrift från inmätningar.** {{ui:Framdrift från inmätningar…}} jämför drönar- eller skanningsytor från olika datum med marken som den var och med konstruktionen: procent klart efter volym, områden som grävts för djupt och fyllts för högt, upplag, och när arbetet blir klart i denna takt (markerat som en uppskattning).

### Känn till tomten

- **Adress till tomt.** {{ui:Adress till tomt…}} samlar öppna fastighets-, byggnads-, planerings-, jord-, översvämnings- och terrängdata för en tomt. Du kan behålla tomten i projektfilen: den inskrivna adressen, varje källa med dagen du hämtade den och dess licens, samt vad som kom tillbaka. Öppnar du om eller delar projektet finns tomten kvar, utan att något hämtas på nytt. Du kan också spara den som en tomtfil eller skicka den till BimCraft. Se [Adress till tomt](topic:address-to-site).

### Mark, vägar, mätning, gruvor, länkar och järnväg

- **Jordar och slänter.** {{ui:Jordar och slänter…}} ritar jordprofilen mellan borrningar som du skriver in. Bishops metod söker sedan den kritiska cirkeln i din mark, med grundvattenyta, överlast och en jordbävningskoefficient; sättning av en grund får konsolidering, omedelbar sättning och tid.
- **Korsningar och målning.** {{ui:Korsningar och målning…}} sätter ihop vägarmar med kantstensavrundningar (en radie per arm, eller tre-centrumavrundningar), siktsträckan för projekteringshastigheten, en kontroll av siktrianglarna, övergångsställen, stopplinjer, markeringar och skyltar med en skyltförteckning. De ritas på planen och sparas som en .dxf-fil med namngivna lager.
- **Utjämning av mätning.** {{ui:Utjämning av mätning…}} kör en utjämning enligt minsta kvadrat av ett polygontåg eller nät: utjämnade koordinater, felellipser, chi-två-test och en flagga på mätningen som inte passar. Fria nät, slutning av ett polygontåg med kompassregeln samt RW5-, GSI-, JobXML- eller CSV-fältfiler ingår, och de utjämnade punkterna sparas som CSV.
- **Dagbrott.** {{ui:Dagbrott…}} omvandlar borrprover till en blockmodell och den slutliga gropen inom din slänt­vinkel, med stripningskvot, en tabell per bänk och en halt- och tonnagekurva. Inbäddade gropar efter intäktsfaktor och en produktionsplan med diskonterat kassaflöde finns också med.
- **Radiolänkar.** {{ui:Radiolänkar…}} kontrollerar siktlinjen över din mark med jordytans krökning, första Fresnelzonen, länkbudget, fädningsmarginal och bortfall på grund av flervägsutbredning, och ger den masthöjd som skulle ge fri passage. Den gör också budgetar för fiberförluster, ruttmängder och vinden mot ett torn.
- **Spårväxlar.** {{ui:Spårväxlar…}} gör en spårväxel utifrån dess korsningsnummer, korsningsväxlar mellan parallella spår och en konstruktionsgräns som lutar efter överhöjning och breddas i en kurva. En spårväxel kan ligga vid en station på en linjeföring.

Se [Jordar, korsningar, utjämning av mätning, gropar, radiolänkar och spårväxlar](topic:soils-roads-survey-mines-links).

## I alla appar

- **Språk.** 54 språk, varav tio nya. Språk utöver engelska är maskinöversatta utkast tills en infödd talare har läst dem. Hjälpämnena är fortfarande mestadels på engelska.
- **Verktygsfältsrader.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Verktygsfältsrader}}: Radbryt (som tidigare), 2 rader eller 1 rad. CivilCraft:s menyflik visar det mest använda verktyget stort, de nästa små, och resten bakom pilen på gruppnamnet.
- **Indatorer.** Pekplatta, penna, 3D-mus, handkontroll och MIDI kan styra apparna.
- **Problem.** En panel {{ui:Problem}} som varnar i alla appar, med kontroller som läser regelpaket.
- **Live.** En vy över vem som är var i en Live-session.
- **Tillägg.** En förteckning över tillägg, med belysningstillägg.
- **Koppla din AI.** Vilken assistent du än kopplar kan styra CivilCraft:s verktyg. Den levereras med en anteckning om att koppling med ett klick i CadCraft Studio och den webbaserade kopplingen inte är klara ännu. Se [Låt en AI-assistent arbeta med din tomt](topic:assistants).

## Åtgärdat i 0.8.1

- **Avsnittet DWG-klasser.** Det lästes som fel typ (GitHub cadcraft#5). Åtgärdat i CivilCraft tillsammans med CadCraft, BimCraft, ModelCraft och TakeoffCraft.
- **Byte av språk under körning.** CadCraft Studio och de paketerade utgåvorna kan byta språk under körning. Tidigare fanns de bara på engelska. Ännu inte testat på alla plattformar: berätta för oss om språket inte byts.

## Finns inte ännu i den här versionen

- **Det här är hjälpmedel för beräkning.** Varje resultat i de nya fönstren behöver kontrolleras av en ingenjör. Hållfastheter för jord utgår från typiska värden för jordgruppen, och fönstret säger det.
- **Låt det regna.** En körning på exempeltomten kan ta över två minuter i webbläsaren vid en fin cell. Den har kontrollerats mot handberäknade fall och ett V-format avrinningsområde, men ännu inte på en verklig planerad tomt.
- **Adress till tomt.** Den läser öppna datafiler som du tar med dig, och har bara testats på våra egna filer. Träd är ingen källa. Att hämta källor åt dig väntar på integritetstexten.
- **Framdrift från inmätningar.** Testat endast på påhittade inmätningar. Framdrift på ritningar och markeringar (MarkupCraft) samt skanning mot modell (BimCraft) är inte byggt.
- **Jordar och slänter.** Endast cirkulära ytor: ingen kil- eller blocksökning och ingen dragspricka.
- **Korsningar.** En radie per arm, inga svepvägar för lastbilar, och de går ännu inte in i korridoren.
- **Fältfiler.** Läsarna skrevs utifrån offentliga formatbeskrivningar och prövades på filer vi själva gjort. Riktiga instrumentfiler efterlyses.
- **Länkar och järnväg.** Radiolänkar: endast friutrymmesförlust och flervägsutbredning (ingen regnfädning eller antennmönster), och ingen järnvägsnorm: varje gräns för järnväg är en platshållare, med preliminära siffror som ingen järnvägsingenjör har kontrollerat.
- **Windows och macOS.** 0.8 är inte kodsignerad. Windows kan varna, och macOS ber dig högerklicka och sedan välja Öppna.

Allt annat finns under [Finns inte ännu](topic:not-built-yet). För den tidigare versionen, se [Nytt i 0.7](topic:whats-new-0-7).
