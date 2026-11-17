---
title: Nytt i 0.9
summary: Mallar för korridorer och terrängen, fångst och välj-knappar vid ritning, GIS-analys med attributtabell, skuggstudier, solenergiutbyte, komfort och vindstudier för en plats, en 3D-renderingsvy, samt tilläggen Punktmoln och WaterCraft.
keywords: vad är nytt, 0.9, versionsnoter, korridormallar, terrängmallar, mallredigerare, typisk sektion, flera korridorer, fångst, välj, flytta, kopiera, rotera, tangent, rendering, 3d-rendering, gis-analys, buffert, överlagring, rumslig koppling, attributtabell, formatera efter attribut, skuggstudie, solenergiutbyte, utci, utomhuskomfort, vindstudie, openfoam, punktmoln, las, laz, watercraft, brandflöde, brandpost, vattnets ålder, klor, förbrukning, verktygstips, layout, nytt, ändringslogg, ändringar, 0.8, 0.8.1, version, nya funktioner, regn, dagvatten, uppdämning, överströmning, massbalans, schakt och fyllning, transport, bästa rutt, minsta kostnad, linjeföring, fördröjningsmagasin, utlopp, avtappning, fribord, framdrift, inmätning, drönare, upplag, adress till tomt, fastighet, jord, översvämning, släntstabilitet, Bishop, sättning, korsning, målning, skyltar, siktsträcka, utjämning, minsta kvadrat, mätning, dagbrott, blockmodell, radiolänk, fresnel, spårväxel, överfart, språk, problem, live, dwg
from: d7ac5b14
---

Det här är vad som ändrats i CivilCraft 0.9, jämfört med 0.8.1. CivilCraft 0.9 ingår i CadCraft Studio 0.9 och dess åtta appar. De stora delarna är mallar för korridorer och terräng, fångst när du ritar, GIS-analys, studier av en plats sol, solenergiutbyte, komfort och vind, samt två tillägg: Punktmoln och WaterCraft.

## Nytt

### Mallar för korridorer och terräng

- **Korridormallar.** Öppna {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Korridormallar…}} (eller skriv {{cmd:TEMPLATES}}). En mall är en liten tvärsektion med komponenter, förskjutningar, lutningar, material och punktkoder. Behåll dem i projektet, i {{ui:Mitt bibliotek}} eller som en `.cctemplates.json`-fil. Mallredigeraren visar en ritning i verklig skala och listar problem medan du skriver.
- **Bygg från mallar per station.** Markera en linjeföring och slå på {{ui:Bygg från mallar per station}} i dess Egenskaper. Varje sida av varje region har sin egen beläggningslista och sitt eget slutvillkor. {{ui:Lägg till en korridor}} under {{ui:Korridorer på den här linjeföringen}} sätter flera korridorer på en linjeföring.
- **Terrängmallar.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Terrängmallar…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) lägger lagerdelade material som matjord eller beläggning och underbyggnad på en terräng, med area och volym per lager. Se [Korridormallar och terrängmallar](topic:corridor-templates).

### Ritning

- **Fångst.** Verktygen Linjeföring, Byggplatta, Fastighet, Volym, Funktionslinje, Mät, Gräns och Avrinningsområde fångar mätpunkter, PI:n, hörn, hörnpunkter och konstruktioner, med en etikett vid markeringen. Håll ned {{key:Alt}} för en fri punkt.
- **Välj-knappar, tangent och flytta, kopiera, rotera.** Byggplattors, fastigheters och funktionslinjers hörn har inskrivna rutor för Östvärde och Nordvärde och en Välj-knapp med korsmarkör. Egenskaper har också {{ui:Tangent från två punkter}} för linjeföringar och {{ui:Flytta, kopiera och rotera}} för linjeföringar, byggplattor, fastigheter och funktionslinjer. Se [Rita med fångst, valda hörn och flytta, kopiera, rotera](topic:draft-with-snaps).
- **Renderingsvy i 3D.** Knappen {{ui:Rendera}} på 3D-verktygsfältet ritar marken med naturliga färger, himmel, dis och mjuka skuggor. Den ändrar inte modellen. Menyn {{ui:Sol}} har nu knapparna {{ui:Verkställ}} och {{ui:Stäng}}. Se [Visa platsen i 3D](topic:site-3d).
- **Paneler öppnar ett avsnitt i taget.** Den vänstra panelen och Egenskapspanelen öppnar ett avsnitt och stänger de andra, och de delade knapparna i Landskapets menyflik-brickor som innehåller flera verktyg är delade knappar.

### GIS-analys

- **Analysera.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Analysera}} erbjuder buffert, överlagring, rumslig koppling, välj efter attribut eller form, och mät. Varje verktyg skapar ett nytt lager i ett enda steg för ångra.
- **Attributtabell.** Ett lagers menyn med tre punkter har {{ui:Attributtabell…}} och {{ui:Formatera efter attribut…}}. Se [Analysera GIS-lager](topic:gis-analysis) och [Arbeta med ett lagers attributtabell](topic:gis-table).

### Platsen: sol, solenergi, komfort och vind

- **Avsnittet Miljö.** Markera en volym: avsnittet {{ui:Miljö}} ligger under {{ui:Soltimmar}} i dess Egenskaper. Det har en skuggstudie (karta, tabell, animation, CSV), solenergiutbyte från en typisk årsväderfil (.epw) och utomhuskomfort (UTCI).
- **Vind, endast som sållning.** {{ui:Kör vindstudie}} färgar marken från sittande till obehaglig för varje vindriktning i väderfilen. Den är inte validerad, och panelen säger det.
- **Pedestrian wind (OpenFOAM)-tillägget.** Av tills du slår på det i {{ui:Inställningar}} › {{ui:Tillägg}}. OpenFOAM är ett program du installerar själv. Se [Skugga, solenergiutbyte och utomhuskomfort](topic:environment).

### Punktmoln (tillägg)

- Slå på {{ui:Punktmoln}} i {{ui:Inställningar}} › {{ui:Tillägg}}; en flik Punktmoln visas i den högra panelen. Öppna en LAS- eller LAZ-fil, rensa den, sortera den i mark, växtlighet och byggnader, bygg marken, höjdkurvor och volymer, och exportera LAS eller LAZ. Se [Punktmoln från en drönare eller skanner](topic:point-clouds).

### WaterCraft (tillägg)

- Slå på {{ui:WaterCraft (vattendistribution)}} i {{ui:Inställningar}} › {{ui:Tillägg}}; en flik WaterCraft visas. Den har förbrukning från kunder, brandflöde vid varje brandpost, vilket ledningsavbrott som betyder mest, samt vattnets ålder och klor, var och en sparad som CSV. Se [WaterCraft: förbrukning, brandflöde, avbrott och vattnets ålder](topic:watercraft).

### Att arbeta tillsammans

- I en Live-session ser du varandras markörer och namn i planen. Växter i biblioteket: CivilCraft Landskap startar från sin standardsamling i biblioteket, {{ui:CivilCraft landskap}}.

## I alla appar

- Tips visas som Bootstrap-verktygstips, och starttipset kan stängas.
- En panels flikrad som inte får plats rullar i stället för att klippas av.
- Webbläsarens flikrubriker lyder `<dokument> - CivilCraft | CadCraft`.
- {{ui:Inställningar}} har ett avsnitt Layout där layouterna är en rullgardinslista med tvårads val.
- Vikt- och temperaturenheter finns i {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Enheter}}.
- Språklistan visar de språk som bygget har filer för. Andra språk än engelska är maskinutkast.

## Åtgärdat

- Tilläggen för adressuppslag och EnergyPlus-kontroll gick inte att slå på; nu går de.
- Hjälpen säger nu att tillägget Punktmoln skriver ett rensat moln som LAS 1.4 eller LAZ.
- Att klicka på det markerade objektets egna handtag startar inte längre en handtagsdragning som stoppade en väntande Välj.

## Ärliga begränsningar

- Exempelmallarna för korridorer är platshållare utan någon standard; en ingenjör måste kontrollera dem. Terrängmallar lägger inte till någon yta och ritas inte i 3D eller i sektionsvyn. Den andra korridoren på en linjeföring ingår inte i IFC-exporten. Det finns ingen övergång mellan två mallar längs stationer.
- Punktmoln testades på påhittade filer, inte på en verklig drönarinmätning. Bara LAS och LAZ läses.
- GIS-analys testades på påhittade lager.
- Skugga, sol och komfort är planeringsuppskattningar; vind är ovaliderad sållning. Ingen av dem är ett dimensionerande värde.
- WaterCraft är ett beräkningsstöd som kontrollerats på påhittade nät. En vatteningenjör avgör vad siffrorna är värda.
- Språk utöver engelska är maskinutkast tills en modersmålstalare läst dem.
- Windows-installationsprogram är inte kodsignerade, och macOS-diskavbildningen är inte notariserad.

## Tidigare: 0.8 och 0.8.1

Det här är vad som ändrats i CivilCraft 0.8 (2026-11-01) och 0.8.1 (2026-11-02), jämfört med 0.7. De stora nya delarna är verktyg som testar din planering och din plats (regn, massbalans, rutter, dammar, framdrift) och sex beräkningsfönster för mark, vägar, mätning, gruvor, länkar och järnväg.

### Nytt

**Testa din planering**

- **Låt det regna.** {{ui:Låt det regna…}} (under {{ui:Terrängmodell}}) släpper en storm över den planerade marken. Du ser vattnet rinna av från byggplattorna, samla sig i de låga hörnen och flöda över de dammar som är för små. Körningen animeras och ger volymerna, det högsta utflödet och en CSV över varje damm. Standardcellen är grov så att en första titt går snabbt; en finare cell är långsammare. Dammar som flödar över visas också i panelen Problem.
- **Massbalansering.** {{ui:Massbalansering…}} höjer eller sänker en byggplatta tills schakt är lika med fyllning, och visar transporttabellen mellan dem.
- **Bästa rutt.** {{ui:Bästa sträckning…}}: välj en start och ett slut, och CivilCraft hittar den billigaste vägen över terrängen som håller sig inom dina planerings- och kurvgränser, och gör sedan en linjeföring av den.
- **Fördröjningsmagasin.** {{ui:Fördröjningsmagasin…}} räknar ut nivå och magasinsvolym från din mark, tar utloppsanordningar (orificium, damm, V-skåra, bräddavlopp), leder en storm genom dammen och kontrollerar det högsta tillbakahållna flödet, avtappningstiden och fribordet.
- **Framdrift från inmätningar.** {{ui:Framdrift från inmätningar…}} jämför drönar- eller skanningsytor från olika datum med marken som den var och med planen: procent färdigt per volym, över- och underschaktade områden, upplag och när arbetet blir klart i denna takt (markerat som en uppskattning).

**Känn till platsen**

- **Adress till tomt.** {{ui:Adress till tomt…}} samlar öppna data för fastighet, byggnad, planbestämmelser, jord, översvämning och terräng på en och samma plats. Du kan behålla platsen i projektfilen: den inskrivna adressen, varje källa med dagen du hämtade den och dess licens, och vad som kom tillbaka. Öppnar eller delar du projektet igen finns platsen kvar, utan att något hämtas på nytt. Du kan också spara den som en platsfil eller skicka den till BimCraft. Se [Adress till tomt](topic:address-to-site).

**Mark, vägar, mätning, gruvor, länkar och järnväg**

- **Jordar och slänter.** {{ui:Jordar och slänter…}} ritar jordprofilen mellan borrprover du skriver in. Bishops metod letar sedan efter den kritiska cirkeln i din mark, med en grundvattenyta, en tilläggslast och en jordbävningskoefficient; sättning av en grundsula får konsolidering, omedelbar sättning och tid.
- **Korsningar och målning.** {{ui:Korsningar och målning…}} sätter ihop anslutningar med kantstensbågar (en radie per anslutning, eller tre-centrerade bågar), siktsträckan för den dimensionerande hastigheten, en kontroll av siktrianglarna, övergångsställen, stoppstreck, markeringar och skyltar med en skyltförteckning. De ritas i planen och sparas som en .dxf med namngivna lager.
- **Utjämning av mätning.** {{ui:Utjämning av mätning…}} kör en minsta kvadrat-utjämning av en polygontåg eller ett nät: utjämnade koordinater, felellipser, chi-två-testet och en flagga på mätningen som inte passar. Fria nät, sluten polygontåg med kompassregeln och RW5, GSI, JobXML eller CSV-fältfiler ingår, och de utjämnade punkterna sparas som CSV.
- **Dagbrott.** {{ui:Dagbrott…}} gör borrprov till en blockmodell och det slutgiltiga brottet inom din släntvinkel, med förhållandet mellan avtäckning och malm, en tabell per bänk och en halt- och tonnagekurva. Nästlade brott efter intäktsfaktor och en produktionsplan med diskonterat kassaflöde ingår också.
- **Radiolänkar.** {{ui:Radiolänkar…}} kontrollerar siktlinjen över din mark med jordens krökning, den första Fresnel-zonen, länkbudget, fädningsmarginal och utfall på grund av flervägsutbredning, och ger den masthöjd som skulle rensa sträckan. Den gör också budgetar för fiberförluster, mängder för sträckan och vinden på ett torn.
- **Spårväxlar.** {{ui:Spårväxlar…}} gör en spårväxel från dess korsningsnummer, överfarter mellan parallella spår och ett profilmått som lutar av kant och vidgas i en kurva. En spårväxel kan ligga vid en station på en linjeföring.

Se [Jordar, korsningar, utjämning av mätning, dagbrott, radiolänkar och spårväxlar](topic:soils-roads-survey-mines-links).

### I alla appar

- **Språk.** 54 språk, tio av dem nya. Andra språk än engelska är maskinutkast tills en modersmålstalare läst dem. Hjälpavsnitten är fortfarande mestadels på engelska.
- **Verktygsfältsrader.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Verktygsfältsrader}}: Radbryt (som förut), 2 rader eller 1 rad. CivilCraft:s menyflik visar det mest använda verktyget stort, nästa små, och resten bakom gruppnamnets pil.
- **Indatorenheter.** Pekplatta, penna, 3D-mus, handkontroll och MIDI kan styra apparna.
- **Problem.** En panel Problem som varnar i varje app, med kontroller som läser regelpaket.
- **Live.** En vy över vem som är var i en Live-session.
- **Tillägg.** En lista över tillägg, med belysningstillägg.
- **Anslut din AI.** Varje assistent du ansluter kan styra CivilCraft:s verktyg. Den levereras med en anteckning om att anslutning med ett klick i CadCraft Studio och den hostade kopplingen inte är klara ännu. Se [Låt en AI-assistent arbeta med din plats](topic:assistants).

### Åtgärdat i 0.8.1

- **Avsnittet DWG-klasser.** Det lästes som fel typ (GitHub cadcraft#5). Åtgärdat i CivilCraft tillsammans med CadCraft, BimCraft, ModelCraft och TakeoffCraft.
- **Byte av språk medan programmet körs.** CadCraft Studio och de paketerade utgåvorna kan byta språk under körning. De var tidigare bara på engelska. Ännu inte testat på alla plattformar: säg till om språket inte ändras.

### Inte i den här versionen ännu

- **Det här är beräkningsstöd.** Varje resultat i de nya fönstren behöver en ingenjörs kontroll. Jordstyrkor utgår från typiska värden för jordgruppen, och fönstret säger det.
- **Låt det regna.** En körning på exempelplatsen kan ta över två minuter i webbläsaren med en fin cell. Den har kontrollerats mot handfall och ett V-format avrinningsområde, men ännu inte på en verklig planerad plats.
- **Adress till tomt.** Den läser öppna datafiler som du tar med, och har testats bara på våra egna filer. Träd är inte en källa. Att hämta källor åt dig väntar på formuleringen om integritet.
- **Framdrift från inmätningar.** Testad bara på påhittade inmätningar. Framdrift på blad och markeringar (MarkupCraft) och skanning mot modell (BimCraft) finns inte.
- **Jordar och slänter.** Endast cirkulära ytor: ingen kil- eller blocksökning och ingen dragsprick.
- **Korsningar.** En radie per anslutning, inga svepande spår för lastbilar, och de ingår ännu inte i korridoren.
- **Fältfiler.** Läsarna skrevs utifrån offentliga formatbeskrivningar och testades på filer vi gjort. Verkliga instrumentfiler efterfrågas.
- **Länkar och järnväg.** Radiolänkar: endast fri rymdförlust och flervägsutbredning (ingen regnfädning eller antennmönster), och ingen järnvägsstandard: varje gräns för järnväg är en platshållare, med preliminära siffror som ingen järnvägsingenjör kontrollerat.
- **Windows och macOS.** 0.8 är inte kodsignerad. Windows kan varna, och macOS kräver högerklick och sedan Öppna.

Allt annat finns i [Inte byggt ännu](topic:not-built-yet). För den tidigare versionen, se [Nytt i 0.7](topic:whats-new-0-7).
