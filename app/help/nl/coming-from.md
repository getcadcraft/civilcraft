---
title: Overstappen vanuit andere civiele software
summary: Hoe vertrouwde werkwijzen voor civiel ontwerp overeenkomen met CivilCraft, en de verschillen waarin ervaren gebruikers in het eerste uur struikelen.
keywords: overstappen, migreren, vertrouwd, verschillen, werkwijze, opdrachten, koppeling, cogo, corridor, grading, leidingnetwerk, stijlen, opdrachtregel
from: feae37d6
---

Als u Civil 3D heeft gebruikt, kent u de ideeën in CivilCraft al: punten en puntengroepen, TIN-terreinen met breeklijnen en begrenzingen, tracés met PI's, profielen met PVI's, dwarsprofielen die tot corridors worden geveegd, grading tot de daglijn, zwaartekrachtleidingnetwerken, LandXML. Wat anders is, is bijna alles eromheen: er is geen tekeningbestand, geen opdrachtregel (tenzij u de menustijl {{ui:Klassiek tekenen}} kiest), geen stijlen, geen Prospector en geen instellingendialogen. CivilCraft is een klein, gericht hulpmiddel in een browser, en in deze versie doet het een fractie van wat een volledig civiel pakket doet. Deze pagina koppelt wat u kent aan wat hier is.

:::tip
Als u het lint van Civil 3D prettig vindt, kies dan de menustijl {{ui:Civiel lint}} in {{ui:Instellingen}} › {{ui:CivilCraft}} › {{ui:Menu's, toetsen en muis}}: de tabbladen Start, Terreinen, Wijzigen, Geolocatie, Weergave en Uitvoer, de middelste knop verschuift het beeld, en {{key:Shift}} met de middelste knop draait de 3D-weergave. Als u opdrachten typt, voegt {{ui:Klassiek tekenen}} een opdrachtregel toe (ALIGNMENT, PAD, PROFILE, ZOOM …). Zie [Menu's, toetsen en muis](topic:menus-keys-and-mouse).
:::

## Werkwijzenoverzicht

| Wat u wilt doen | Vertrouwde manier | In CivilCraft |
|---|---|---|
| Meetpunten inlezen | Punten importeren met een puntbestandsformaat | {{ui:Openen}}, en controleer daarna de kolomvolgorde in **Punten importeren** ([Meetpunten importeren](topic:import-points)) |
| Punten sorteren | Puntengroepen, beschrijvingssleutels | Automatische groepen op het eerste woord van de beschrijving; geen beschrijvingssleutels |
| Een punt bewerken | Puntbewerker, grepen | Klik erop en typ in Eigenschappen, of sleep het ([Een meetpunt bewerken](topic:edit-points)) |
| Bestaand maaiveld opbouwen | Een terrein aanmaken, puntgroepen als gegevens toevoegen | Automatisch: het terrein wordt opnieuw opgebouwd wanneer de invoer verandert |
| Breeklijnen toevoegen | Breeklijnen toevoegen uit polylijnen of elementlijnen | Zet een puntengroep op {{ui:Breeklijn}}, of klik punten aan met het gereedschap {{ui:Breeklijn}} ({{key:B}}) |
| Het terrein bijsnijden | Buitenbegrenzing, binnenbegrenzing, maximale driehoekslengte | {{ui:Begrenzing}} ({{key:O}}, alleen buiten) en **Langste buitenrand** |
| Contourlijnen tonen | Terreinstijl | **Weergave** in het linkerpaneel: interval, hoofdlijn elke, labels, banden, hellingpijlen |
| Een as uitzetten | Tracégereedschappen, boog- en spiraalinstellingen | {{ui:Tracé}} ({{key:A}}): klik PI's aan, {{key:Enter}}; stralen en spiraallengten in de PI-tabel |
| Een profielweergave maken | Profielweergavewizard, banden | {{ui:Profiel}} ({{key:R}}): één profielweergave onder het plan, altijd passend |
| Het verhang ontwerpen | Profielindelingsgereedschappen | {{ui:Beginnen vanaf het maaiveld}}, {{ui:PVI's toevoegen}} ({{key:I}}), PVI's slepen, **Boog L** typen |
| Een weg bouwen | Assemblage, deelassemblages, corridor, doelen, regio's | Vink **Een assemblage langs het ontwerpprofiel vegen** aan onder het tracé; een rijstrook, vluchtstrook en taludhelling per zijde, of elke zijde opgebouwd uit onderdelen (goot, band, trottoir …) |
| Een plaat afwerken | Lijnen van het terrein, groepen van grading, grading-criteria | {{ui:Plaat}} ({{key:G}}): een vlakke plaat met ontgraving en ophoging en hellingen tot de daglijn |
| Grondverzet berekenen | Volume-terreinen, volumedashboard | **Grondverzet** in het rechterpaneel, rastermethode, werkt live bij |
| Regen- of vuilwaterriolering uitzetten | Leidingnetwerk met onderdelenlijst, regels | {{ui:Leidingen}} ({{key:P}}): klik de punten stroomafwaarts aan; drie regels die u instelt; automatische binnenkanten |
| Uitwisselen met anderen | LandXML importeren en exporteren | {{ui:Openen}} een LandXML-bestand; {{ui:LandXML}} om te exporteren ([LandXML uitwisselen](topic:landxml)) |
| Lijnwerk naar CAD sturen | Exporteren naar DWG | {{ui:DWG}} (formaat 2000 tot 2018) of {{ui:DXF}} (R12) |
| Afdrukken | Indelingen, viewports, bladenset | {{ui:PDF}}: één liggend blad van het plan op een gekozen schaal; plan- en profielbladen en dwarsprofielbladen als PDF |
| Werk delen tussen bestanden | Gegevenssnelkoppelingen, verwijzingen | Niet beschikbaar: één project per bestand |
| Ongedaan maken | Ongedaan maken | {{key:Mod+Z}} en {{key:Mod+Y}}, 200 stappen; weergave-instellingen zijn geen stappen |

## Verschillen waarin mensen struikelen

**Er is geen opdrachtregel**, tenzij u de menustijl {{ui:Klassiek tekenen}} kiest. Gereedschappen zijn werkbalkknoppen en losse letters: {{key:A}} tracé, {{key:G}} plaat, {{key:P}} leidingen, {{key:B}} breeklijn, {{key:O}} begrenzing, {{key:R}} profiel, {{key:I}} PVI's toevoegen, {{key:V}} selecteren, {{key:F}} passend maken. In de andere menustijlen doet het typen van een opdrachtnaam niets. Zie [Toetsen en muis](topic:keyboard).

**Enter beëindigt; dubbelklikken is riskant.** Klik het laatste punt eenmaal aan en druk daarna op {{key:Enter}}. In deze versie beëindigt een dubbelklik ook, maar vervalt het punt waarop u dubbelklikte. Met de rechtermuisknop beëindigt of herhaalt u niets; slepen met de rechtermuisknop verschuift alleen het beeld.

**Alles is de hele tijd dynamisch.** Verander een puntengroep, een straal, een PVI of een plaathelling, en het terrein, de contourlijnen, de corridor, de daglijnen en de volumes werken meteen bij. Er is niets opnieuw op te bouwen en niets raakt verouderd.

**Niets is een tekeningobject.** Het plan is een weergave van het ontwerp, geen tekening die u met CAD-opdrachten kunt bewerken. U kunt geen eigen lijnen of tekst toevoegen, de kleur van een laag wijzigen, of iets ontbinden. Exporteer naar DXF en werk de tekening af in een CAD-programma.

**Geen stijlen.** Kleuren, lijndiktes, labelgroottes en laagnamen zijn vast (zie [Lagen van het plan](topic:plan-layers)). Papier en Model in de app-balk schakelen tussen een licht en een donker scherm.

**Één van elk.** Eén bestaand maaiveldterrein, één uitkomst van het grading, één leidingnetwerk per project. Veel tracés en platen zijn prima.

**Eenheden zijn labels.** Kiezen van {{ui:US feet}} of {{ui:Meter}} rekent niets om. Er is geen tekenschaal. Een coördinatenstelsel is optioneel: stel er een in onder {{ui:Coördinaten}} en er verschuift niets, het zegt alleen wat de getallen betekenen (zie [Het coördinatenstelsel van het project instellen](topic:coordinate-systems)). Bij het wegschrijven naar LandXML worden ft als US survey feet behandeld.

**Breeklijngroepen worden verbonden in volgorde van puntnummer.** Een groep die op {{ui:Breeklijn}} staat, wordt één lijn door al haar punten, in nummervolgorde. Gedeelde codes (twee stroomlijnen die allebei "FL" heten) maken één zigzaglijn; teken die met de hand.

**Stationeringen zien er hetzelfde uit, maar meters verschillen.** In ft gelden stationeringen van 100 ft (12+34.56); in meter van 1000 m (1+234.567).

**Verwijderen op een Mac.** De toets met het opschrift delete is in de browser {{key:Backspace}}. Gebruik Fn en delete, of de knop {{ui:Verwijderen}}, om een selectie te verwijderen.

**Bestanden zijn downloads.** {{ui:Opslaan}} downloadt elke keer een `.civilcraft.json`-bestand; er is geen "over het open bestand opslaan". Een herstelkopie van niet-opgeslagen werk wordt in deze browser bewaard ([Niet-opgeslagen werk herstellen](common:recover)). Het openen van een puntenbestand vervangt de punten zonder te vragen. Zie [Bestanden die u kunt openen, opslaan en exporteren](topic:files).

**Regels zijn van u.** De regels van het leidingnetwerk en de corridorassemblage beginnen met voorlopige waarden die geen norm zijn. Stel eigen waarden in voordat u een controle vertrouwt.

**Volumes zijn rastergebaseerd.** Ontgraving en ophoging komen uit een fijn raster tussen de twee terreinen, binnen de daglijnen, zonder zwel- of krimpfactor. Ze liggen dicht bij, maar zijn niet hetzelfde als een TIN-naar-TIN-volume.

## Wat ontbreekt

Andere overgangsbogen dan klothoïde, assemblages die langs de weg veranderen, hellende platen, inlaatcapaciteit en retentie, onderdelencatalogi, leidingen in het profiel, perceelindelingen en kavelgroottes, kleinstekwadratenvereffening en meetdatabases, het openen van DWG, en meer. De volledige lijst, met wat u vandaag in plaats daarvan kunt doen, staat in [Nog niet beschikbaar](topic:not-built-yet).
