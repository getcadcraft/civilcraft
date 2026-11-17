---
title: Een zwaartekrachtleidingnetwerk opzetten
summary: Teken hemelwater- of vuilwaterleidingen kunstwerk voor kunstwerk, stel uw regels in voor helling, dekking en val, laat CivilCraft de binnenonderkanten bepalen, en los de problemen op die het aangeeft.
keywords: kunstwerkbouwer, kunstwerktype, rechthoekig kunstwerk, straatkolk, ring, dekking, wanddikte, bibliotheekitem, leidingnetwerk, hemelwater, vuilwater, riool, kunstwerken, putten, straatkolken, binnenonderkanten, helling, val, rand, zandvang, zwaartekrachtleidingen
from: 10a3c14d
---

Een project bevat één zwaartekrachtleidingnetwerk, hemelwater of vuilwater. Het bestaat uit kunstwerken (putten, straatkolken) en rechte leidingen ertussen. De stroming loopt in de richting die u tekent. CivilCraft controleert elke leiding en elk kunstwerk tegen drie regels die u instelt, en kan alle binnenonderkanten uit die regels instellen.

## Een traject tekenen

U kunt leidingen tekenen zonder oppervlak, maar randen, dekking en automatische binnenonderkanten hebben er een nodig.

1. Druk op {{key:P}}, of klik op {{ui:Leidingen}} in de groep **Ontwerp**.
   De hint luidt: "Leidingen: klik kunstwerken van het begin van het traject naar beneden (klik op een bestaand kunstwerk om aan te sluiten). Enter sluit af."
2. Klik waar het stroomopwaarts gelegen kunstwerk moet komen. Er wordt een kunstwerk geplaatst.
3. Klik op elk volgend kunstwerk stroomafwaarts. Om aan te sluiten op een kunstwerk dat al bestaat, klikt u erop: de statusbalk zegt "S3 aangesloten."
4. Druk op {{key:Enter}}. De leidingen worden getekend, hun binnenonderkanten worden uit de regels ingesteld, en de statusbalk zegt bijvoorbeeld: "3 leidingen getekend, 12 binnenonderkanten ingesteld uit de regels; elke controle slaagt."

Nieuwe kunstwerken krijgen de namen S1, S2 … met een diameter van 48 in (1200 mm). Nieuwe leidingen krijgen de namen P1, P2 … met een diameter van 12 in (300 mm). Diameters zijn in in bij een project in ft en in mm bij een project in m.

Rond af met {{key:Enter}}. Dubbelklikken werkt ook, maar wanneer u dubbelklikt op een bestaand kunstwerk om het traject daar te beëindigen, vervalt de aansluiting: klik er eenmaal op, en druk daarna op {{key:Enter}}.

## Stel uw regels in

Wanneer niets is geselecteerd, heeft het rechterpaneel (**Project**) een blok **Leidingnetwerk**:

| Instelling | Startwaarde | Betekenis |
|---|---|---|
| Type | Hemelwater | {{ui:Hemelwater}} of {{ui:Vuilwater}}; wordt naar LandXML geschreven |
| Minimale helling | 0.50% | Elke leiding moet minstens zoveel dalen |
| Minimale dekking | 2 ft (0.6 m) | Van maaiveld tot kruin van de leiding, over de hele leiding |
| Val in kunstwerken | 0.10 ft (0.03 m) | De binnenonderkant van de uitlaat moet minstens zoveel lager liggen dan elke binnenonderkant van een inlaat |

**Deze startwaarden zijn tijdelijke invulwaarden, geen norm.** Stel de waarden in die uw instantie of project vereist. Dekking wordt gemeten van het maaiveld tot de kruin (binnenonderkant plus binnendiameter); wanddikte telt niet mee. Waar plateaus of corridors zijn gegrade, is het gegrade oppervlak het maaiveld.

## Laat CivilCraft de binnenonderkanten instellen

- {{ui:Alle binnenonderkanten uit de regels instellen}} (in het blok **Leidingnetwerk**) stelt alle leidingen in.
- {{ui:Binnenonderkanten uit de regels instellen}} (met één leiding geselecteerd) stelt alleen die leiding in.

Stroomafwaarts werkend begint elk traject op minstens de minimale dekking bij zijn bovenste kunstwerk, daalt het minstens de minimale helling, daalt het minstens de val door elk kunstwerk, en gaat dieper waar het maaiveld langs de leiding minder dan de minimale dekking zou laten. Binnenonderkanten worden naar beneden afgerond op 0.01, nooit naar boven. De statusbalk zegt "Binnenonderkanten ingesteld: minimale dekking bovenaan elk traject, minstens de minimale helling, minstens de val in elk kunstwerk." of noemt wat niet kon.

## Kunstwerken en leidingen bewerken

Klik met {{ui:Selecteren}} op een kunstwerk of leiding om het in het rechterpaneel te zien.

**Kunstwerk**: **Naam**, **Rand**, **Diepte zandvang**, **Diameter**, daarna **Gebruikte rand**, **Zandvang**, **Easting** en **Northing**, en de leidingen in en uit met hun binnenonderkanten.

- Laat **Rand** leeg om hem van het oppervlak te nemen; het vak toont dan de oppervlaktewaarde in grijs. Typ een waarde om de rand vast te zetten.
- Sleep de grip van het kunstwerk op het plan om het te verplaatsen. Zijn leidingen volgen; hun binnenonderkanten blijven zoals ze waren, dus controleer daarna de problemen.

**Type**: kies een van de kunstwerktypen van het netwerk (hieronder), of geen voor een rond kunstwerk met zijn eigen diameter.

**Leiding**: **Naam**, de kunstwerken waartussen hij loopt, **Diameter**, **Bovenste binnenonderkant**, **Onderste binnenonderkant**, daarna **Lengte**, **Helling** en **Minimale dekking**.

Druk na elke waarde op {{key:Enter}}.

## Problemen lezen en oplossen

Het blok **Leidingnetwerk** somt elk probleem op (tot 40); klik op een probleem om de leiding of het kunstwerk te selecteren. Een geselecteerde leiding of een geselecteerd kunstwerk toont zijn eigen problemen. Zonder selectie staat er "Elke leiding en elk kunstwerk voldoet aan de regels."

| Melding (voorbeelden) | Wat te doen |
|---|---|
| "P2 loopt omhoog (-0.40%)." of "… loopt vlak …" | Wissel de binnenonderkanten om, of stel ze in uit de regels. |
| "P2 met 0.30% is vlakker dan het minimum van 0.50%." | Verlaag de stroomafwaartse binnenonderkant of verhoog de stroomopwaartse. |
| "P3 heeft er langs 1.40 aan dekking van 35, minder dan het minimum van 2." | Verlaag de leiding; stel zijn binnenonderkanten in uit de regels. |
| "In S3 vertrekt P4 op 245.20, minder dan 0.1 onder P3 die binnenkomt op 245.25." | Verlaag de bovenste binnenonderkant van de uitlaatleiding. |
| "De kruin van P1 ligt boven de rand van S1." | De leiding ligt te hoog voor het kunstwerk. |
| "S2 heeft 2 leidingen die eruit gaan; een zwaartekrachtnetwerk moet één uitweg per kunstwerk hebben." | Verwijder één uitgaande leiding, of teken hem opnieuw in de juiste richting. |
| "De leidingen vormen een lus; de stroming moet eindigen bij een uitlaat." | Een traject is terug in zichzelf getekend; verwijder een leiding. |
| "S5 ligt buiten het oppervlak en heeft geen randhoogte." | Typ een rand, of verplaats het kunstwerk naar het oppervlak. |
| "P6 loopt gedeeltelijk buiten het oppervlak; de dekking daar is onbekend." | Breid het oppervlak uit, of accepteer dat de dekking daar niet wordt gecontroleerd. |
| "P7 heeft nog geen binnenonderkanten." | Typ ze in, of stel ze in uit de regels. |

Probleemleidingen en -kunstwerken worden ook rood gemarkeerd op het plan.

## Kunstwerktypen

Een kunstwerktype is een kunstwerk dat is opgebouwd uit zijn parameters: een put, straatkolk, verdeeldoos of uitlaat, **rond** (binnendiameter) of **rechthoekig** (binnenbreedte en -lengte), met zijn **wanddikte**, **vloerplaat**, een **zandvang** onder de laagste leiding en een **ring en deksel** (ronde of rechthoekige opening, hoogte van de ring). Typen horen bij het netwerk, onder **Kunstwerktypen** in de Eigenschappen van het project.

1. Klik op {{ui:Nieuw kunstwerktype}}. Het dialoogvenster tekent het kunstwerk in plan en in doorsnede terwijl u typt.
2. Klik op {{ui:Het type toevoegen}}.
3. Selecteer een kunstwerk en kies het type onder **Type**. Het neemt de afmeting en zandvang van het type over; zijn eigen zandvang kan nog worden gewijzigd.

Bewerk een type en elk kunstwerk van dat type volgt zijn afmetingen. Verwijder een type en zijn kunstwerken blijven als ronde kunstwerken met dezelfde breedte. Elke wijziging is één stap: {{key:Mod+Z}} maakt haar ongedaan.

Een rechthoekig kunstwerk wordt getekend op het plan, in DXF, DWG en PDF, en in 3D als een rechthoek met zijn lengte langs zijn uitlaatleiding; leidingen beginnen bij zijn wand. LandXML schrijft het als een rechthoekig kunstwerk (`RectStruct`) met zijn wanddikte, en leest zulke kunstwerken terug als typen.

### Een type delen via de bibliotheek

{{ui:Opslaan als bibliotheekitem}} schrijft het type als een CadCraft-bibliotheekitem (een `.json`-bestand): zijn plansymbool, een 3D-lichaam tot een typische diepte, en elke afmeting. Upload het naar de bibliotheek om het te delen. {{ui:Een bibliotheekitem openen}} leest een zo opgeslagen kunstwerk terug in het netwerk, omgezet naar de eenheden van het project. Bibliotheekitems die geen in CivilCraft gemaakte kunstwerken zijn, worden geweigerd, met de reden.

## Verwijderen

Selecteer een leiding en druk op {{key:Delete}} om hem te verwijderen. Een kunstwerk verwijderen verwijdert ook de leidingen die erop zijn aangesloten. Op een Mac drukt u op Fn en Delete, of klikt u op {{ui:Verwijderen}}.

## Nog niet beschikbaar

Stromen, leidingafmetingen en de hydraulische gradiëntlijn staan in [Hemelwaterafvoer](topic:storm-drainage). Leidingcatalogi, niet-ronde leidingen, leidingen in de profielweergave, gebogen leidingen en meer dan één netwerk per project zijn nog niet beschikbaar. Zie [Nog niet beschikbaar](topic:not-built-yet).
