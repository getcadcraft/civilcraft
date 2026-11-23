---
title: Nytt i 0.9 (tidigare)
summary: Korridor- och terrängmallar, fångst och valknappar vid ritning, GIS-analys med en attributtabell, skugga, solenergi, komfort och vindstudier för en plats, en 3D-renderingsvy, samt tilläggen Punktmoln och WaterCraft.
keywords: nytt i 0.9, tidigare version, nytt, 0.9, versionsinformation, korridormallar, terrängmallar, mallredigerare, typisk tvärsektion, flera korridorer, fångst, välj, flytta, kopiera, rotera, tangent, rendera, 3d-rendering, gis-analys, buffert, överlagring, rumslig koppling, attributtabell, formatera efter attribut, skuggstudie, solenergi, utci, utomhuskomfort, vindstudie, openfoam, punktmoln, las, laz, watercraft, brandflöde, brandpost, vattnets ålder, klor, förbrukning, verktygstips, layout, nytt i, versionsinformation, ändringslogg, ändringar, 0.8, 0.8.1, version, nya funktioner, regn, dagvatten, översvämning, överströmning, jordarbeten, balans, schakt och fyllning, transport, bästa sträckning, minst kostnad, linjeföring, fördröjningsdamm, utlopp, avsänkning, fribord, framdrift, inmätning, drönare, upplag, adress till tomt, fastighet, jord, översvämning, slänt-stabilitet, bishop, sättning, korsning, målning, skyltar, siktsträcka, utjämning, minsta kvadrat, polygontåg, dagbrott, blockmodell, radiolänk, fresnel, växel, korsningsspår, språk, problem, live, dwg
from: 4664522c
---

Det här är vad som ändrats i CivilCraft 0.9, jämfört med 0.8.1. CivilCraft 0.9 ingår i CadCraft Studio 0.9 och dess åtta appar. De stora delarna är korridor- och terrängmallar, fångst vid ritning, GIS-analys, studier av en plats sol, solenergi, komfort och vind, samt två tillägg: Punktmoln och WaterCraft.

## Nytt

### Korridor- och terrängmallar

- **Korridormallar.** Öppna {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Korridormallar…}} (eller skriv {{cmd:TEMPLATES}}). En mall är en liten tvärsektion med komponenter, förskjutningar, lutningar, material och punktkoder. Spara dem i projektet, i {{ui:Mitt bibliotek}} eller som en `.cctemplates.json`-fil. Mallredigeraren visar en ritning i verklig skala och listar problem medan du skriver.
- **Bygg från mallar per station.** Markera en linjeföring och slå på {{ui:Bygg från mallar per station}} i dess Egenskaper. Varje sida av varje region har sin egen beläggningslista och sitt eget ändvillkor. {{ui:Lägg till en korridor}} under {{ui:Korridorer på den här linjeföringen}} lägger flera korridorer på en linjeföring.
- **Terrängmallar.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Terrängmallar…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) lägger skiktade material, till exempel matjord eller beläggning och bärlager, över en terräng, med area och volym per lager. Se [Korridormallar och terrängmallar](topic:corridor-templates).

### Ritning

- **Fångst.** Verktygen Linjeföring, Platta, Fastighet, Massa, Funktionslinje, Mät, Gräns och Avrinningsområde fångar till punkter, PI:er, hörn, hörnpunkter och konstruktioner, med en etikett vid markören. Håll ned {{key:Alt}} för en fri punkt.
- **Valknappar, tangent och flytta, kopiera, rotera.** Plattans, fastighetens och funktionslinjens hörn har inmatningsrutor för Östvärde och Nordvärde och en Välj-knapp med korshår. Egenskaper har också {{ui:Tangent från två punkter}} för linjeföringar och {{ui:Flytta, kopiera och rotera}} för linjeföringar, plattor, fastigheter och funktionslinjer. Se [Rita med fångst, valda hörn och flytta, kopiera, rotera](topic:draft-with-snaps).
- **Renderingsvy i 3D.** Knappen {{ui:Rendera}} i 3D-fältet ritar marken med naturliga färger, himmel, dis och mjuka skuggor. Den ändrar inte modellen. Menyn {{ui:Sol}} har nu knapparna {{ui:Verkställ}} och {{ui:Stäng}}. Se [Visa platsen i 3D](topic:site-3d).
- **Paneler öppnas ett avsnitt i taget.** Vänsterpanelen och Egenskapspanelen öppnar ett avsnitt och stänger de andra, och de Landskap-menyflikar som rymmer flera verktyg är delade knappar.

### GIS-analys

- **Analysera.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Analysera}} erbjuder buffert, överlagring, rumslig koppling, val efter attribut eller form, och mätning. Varje verktyg skapar ett nytt lager i ett steg som kan ångras.
- **Attributtabell.** Ett lagers menyn med tre punkter har {{ui:Attributtabell…}} och {{ui:Formatera efter attribut…}}. Se [Analysera GIS-lager](topic:gis-analysis) och [Arbeta med ett lagers attributtabell](topic:gis-table).

### Platsen: sol, solenergi, komfort och vind

- **Miljöavsnitt.** Markera en volym: avsnittet {{ui:Miljö}} ligger under {{ui:Soltimmar}} i dess Egenskaper. Det har en skuggstudie (karta, tabell, animering, CSV), solenergi från en väderfil för ett typiskt år (.epw) och utomhuskomfort (UTCI).
- **Vind, endast screening.** {{ui:Kör vindstudie}} färglägger marken från sittbar till obekväm för varje vindriktning i väderfilen. Den är ovaliderad och panelen säger det.
- **Vind i tätort (OpenFOAM)-tillägg.** Av tills du slår på det i {{ui:Inställningar}} › {{ui:Tillägg}}. OpenFOAM är programvara som du installerar själv. Se [Skugga, solenergi och utomhuskomfort](topic:environment).

### Punktmoln (tillägg)

- Slå på {{ui:Punktmoln}} i {{ui:Inställningar}} › {{ui:Tillägg}}; en flik Punktmoln visas i högerpanelen. Öppna en LAS- eller LAZ-fil, rensa den, sortera den i mark, vegetation och byggnader, bygg marken, höjdkurvor och volymer, och exportera LAS eller LAZ. Se [Punktmoln från drönare eller skanner](topic:point-clouds).

### WaterCraft (tillägg)

- Slå på {{ui:WaterCraft (vattendistribution)}} i {{ui:Inställningar}} › {{ui:Tillägg}}; en flik WaterCraft visas. Den har förbrukning från kunder, brandflöde vid varje brandpost, vilket ledningsavbrott som spelar roll, samt vattnets ålder och klor, var och en sparad som CSV. Se [WaterCraft: förbrukning, brandflöde, avbrott och vattenålder](topic:watercraft).

### Att arbeta tillsammans

- I en live-session ser du varandras markörer och namn i planen. Biblioteksväxter: CivilCraft Landskap startar från sin standardsamling i Bibliotek, {{ui:CivilCraft landskap}}.

## I varje app

- Tips visas som Bootstrap-verktygstips, och starttipset kan stängas.
- En panels flikrad som inte ryms rullar i stället för att klippas av.
- Webbläsarens flikrubriker lyder `<dokument> - CivilCraft | CadCraft`.
- {{ui:Inställningar}} har ett avsnitt Layout där layouterna är en rullgardin med tvårads-val.
- Vikt- och temperaturenheter finns i {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Enheter}}.
- Språklistan visar de språk som bygget har filer för. Språk andra än engelska är maskinöversättningar.

## Åtgärdat

- Tilläggen för adressuppslag och EnergyPlus-kontroll gick inte att slå på; nu går det.
- Hjälpen säger nu att tillägget Punktmoln skriver ett rensat moln som LAS 1.4 eller LAZ.
- Att klicka på det markerade objektets eget handtag startar inte längre en handtagsdragning som stoppade ett väntande Välj.

## Ärliga begränsningar

- Exempelmallarna för korridorer är platshållare utan någon standard bakom; en ingenjör måste kontrollera dem. Terrängmallar lägger inte till någon yta och ritas inte i 3D eller i sektionsvyn. Den andra korridoren på en linjeföring ingår inte i IFC-exporten. Det finns ingen övergång mellan två mallar per station.
- Punktmoln testades på påhittade filer, inte på en verklig drönarmätning. Endast LAS och LAZ läses.
- GIS-analysen testades på påhittade lager.
- Sol, solenergi och komfort är planeringsuppskattningar; vind är ovaliderad screening. Ingen av dem är ett projekteringsvärde.
- WaterCraft är ett beräkningsstöd som kontrollerats på påhittade nät. En vatteningenjör avgör vad siffrorna är värda.
- Språk utöver engelska är maskinöversättningar.
- Windows-installerare är inte kodsignerade, och macOS-skivbilden är inte notariserad.

## Tidigare: 0.8 och 0.8.1

Det här är vad som ändrats i CivilCraft 0.8 (2026-11-01) och 0.8.1 (2026-11-02), jämfört med 0.7. De stora nya delarna är verktyg som testar din markplanering och din plats (regn, jordarbeten, vägsträckningar, dammar, framdrift), och sex beräkningsfönster för mark, vägar, mätning, gruvor, länkar och järnväg.

### Nytt

**Testa din markplanering**

- **Låt det regna.** {{ui:Låt det regna…}} (under {{ui:Terrängmodell}}) släpper ett skyfall över den planerade marken. Du ser vattnet rinna av från plattorna, samlas i de låga hörnen och överströmma de dammar som är för små. Körningen animeras och ger volymerna, den högsta avrinningen och en CSV med varje damm. Standardcellen är grov så att en första titt går snabbt; en finare cell tar längre tid. Dammar som överströmmar visas också i panelen Problem.
- **Massbalansering.** {{ui:Massbalansering…}} höjer eller sänker en platta tills schakt är lika med fyllning, och visar transporttabellen mellan dem.
- **Bästa sträckning.** {{ui:Bästa sträckning…}}: välj en start och ett slut, och CivilCraft hittar den billigaste vägen över terrängen som håller sig inom dina lutnings- och kurvgränser, och gör sedan en linjeföring av den.
- **Fördröjningsdammar.** {{ui:Fördröjningsmagasin…}} beräknar nivåer och magasinsvolym från din mark, tar emot utloppsanordningar (öppning, överfall, V-skåra, bräddavlopp), dirigerar ett skyfall genom dammen och kontrollerar den maximala tillbakahållna avrinningen, tömningstiden och fribordet.
- **Framdrift från inmätningar.** {{ui:Framdrift från inmätningar…}} jämför drönar- eller skanningsytor från olika datum med marken som den var och med projekteringen: procent klart efter volym, överschaktade och överfyllda områden, upplag, och när arbetet blir klart i denna takt (markerat som en uppskattning).

**Känn till platsen**

- **Adress till tomt.** {{ui:Adress till tomt…}} sammanför öppna data om fastighet, byggnad, zonering, jord, översvämning och terräng för en plats. Du kan spara platsen i projektfilen: den inskrivna adressen, varje källa med dagen du hämtade den och dess licens, och vad som kom tillbaka. Öppnar eller delar du projektet igen finns platsen kvar, utan att något hämtas på nytt. Du kan även spara den som en platsfil eller skicka den till BimCraft. Se [Adress till tomt](topic:address-to-site).

**Mark, vägar, mätning, gruvor, länkar och järnväg**

- **Jordar och slänter.** {{ui:Jordar och slänter…}} ritar jordprofilen mellan borrhål du skriver in. Bishops metod söker sedan den kritiska cirkeln på din mark, med en grundvattennivå, en överbelastning och en jordbävningskoefficient; sättning under en fundament får konsolidering, omedelbar sättning och tid.
- **Korsningar och målning.** {{ui:Korsningar och målning…}} sätter ihop vägarmar med kantstensradier (en radie per arm, eller treradiga returer), siktsträckan för dimensioneringshastigheten, en kontroll av siktrianglarna, övergångsställen, stopplinjer, markeringar och skyltar med en skyltförteckning. De ritas i planen och sparas som en .dxf med namngivna lager.
- **Utjämning av mätning.** {{ui:Utjämning av mätning…}} kör en minsta kvadratutjämning av ett polygontåg eller nät: utjämnade koordinater, felellipser, chi-två-testet och en flagga på mätningen som inte passar. Fria nät, stängning av ett polygontåg med kompassregeln och RW5, GSI-, JobXML- eller CSV-fältfiler ingår, och de utjämnade punkterna sparas som CSV.
- **Dagbrott.** {{ui:Dagbrott…}} gör borrprover till en blockmodell och den slutliga gropen inom din slänt­vinkel, med strippningskvoten, en tabell per bänk och en halt- och tonnagekurva. Inbäddade gropar efter intäktsfaktor och en produktionsplan med diskonterat kassaflöde finns också.
- **Radiolänkar.** {{ui:Radiolänkar…}} kontrollerar siktlinjen över din mark med jordens krökning, första Fresnelzonen, länkbudget, fadingmarginal och flervägsavbrott, och ger den masthöjd som skulle rensa sträckan. Den gör även fiberförlustbudgetar, mängder för sträckan och vinden på ett torn.
- **Spårväxlar.** {{ui:Spårväxlar…}} gör en växel från dess korsnummer, korsningsspår mellan parallella spår och en konstruktionsprofil som lutar av vinkling och breddas i en kurva. En växel kan ligga vid en station på en linjeföring.

Se [Jordar, vägar, mätning, gruvor och länkar](topic:soils-roads-survey-mines-links).

### I varje app

- **Språk.** 54 språk, tio av dem nya. Språk andra än engelska är maskinöversättningar tills en modersmålstalare läst dem. Hjälpämnena är fortfarande mest på engelska.
- **Verktygsfältsrader.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Verktygsfältsrader}}: Radbryt (som tidigare), 2 rader eller 1 rad. CivilCraft-menyfliken visar det mest använda verktyget stort, de nästa små, och resten bakom gruppnamnets pil.
- **Indataenheter.** Styrplatta, penna, 3D-mus, handkontroll och MIDI kan styra apparna.
- **Problem.** En panel Problem som varnar i varje app, med kontroller som läser regelpaket.
- **Live.** En vy över vem som är var i en live-session.
- **Tillägg.** En tilläggslista, med belysningstillägg.
- **Anslut din AI.** Varje assistent du ansluter kan styra CivilCraft-verktygen. Den levereras med en notering om att anslutning med ett klick i CadCraft Studio och den hostade kopplingen inte är klara än. Se [Låt en AI-assistent arbeta med din plats](topic:assistants).

### Åtgärdat i 0.8.1

- **DWG-klassavsnittet.** Det lästes som fel typ (GitHub cadcraft#5). Åtgärdat i CivilCraft tillsammans med CadCraft, BimCraft, ModelCraft och TakeoffCraft.
- **Byte av språk under körning.** CadCraft Studio och de paketerade utgåvorna kan byta språk under körning. Tidigare fanns bara engelska. Ännu inte testat på alla plattformar: säg till om språket inte byts.

### Finns inte i denna version ännu

- **Det här är beräkningsstöd.** Varje resultat i de nya fönstren behöver en ingenjörs kontroll. Jordhållfastheter utgår från typiska värden för jordgruppen, och fönstret säger det.
- **Låt det regna.** En körning på exempelplatsen kan ta över två minuter i webbläsaren vid en fin cell. Den kontrollerades mot handfall och en V-formad avrinningsyta, inte ännu på en verklig planerad plats.
- **Adress till tomt.** Den läser öppna datafiler som du tar med, och testades endast på våra egna filer. Träd är inte en källa. Att hämta källor åt dig väntar på integritetstexten.
- **Framdrift från inmätningar.** Testad endast på påhittade inmätningar. Framdrift på ritningsblad och markeringar (MarkupCraft) och skanning mot modell (BimCraft) är inte byggda.
- **Jordar och slänter.** Endast cirkulära ytor: ingen kil- eller blocksökning och ingen dragspricka.
- **Korsningar.** En radie per arm, inga svepta körvägar för lastbilar, och de går ännu inte in i korridoren.
- **Fältfiler.** Läsarna skrevs utifrån offentliga formatbeskrivningar och prövades på filer vi gjort. Riktiga instrumentfiler efterlyses.
- **Länkar och järnväg.** Radiolänkar: endast fri rymdförlust och flervägsavbrott (ingen regnfading eller antennmönster), och ingen järnvägsstandard: varje järnvägsgräns är en platshållare, med preliminära siffror som ingen järnvägsingenjör har kontrollerat.
- **Windows och macOS.** 0.8 är inte kodsignerad. Windows kan varna, och macOS ber dig högerklicka och sedan välja Öppna.

Allt annat finns i [Finns inte ännu](topic:not-built-yet). För den tidigare versionen, se [Nytt i 0.7](topic:whats-new-0-7).
