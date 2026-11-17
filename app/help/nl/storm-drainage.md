---
title: Hemelwaterafvoeren, leidingmaten en de hydraulische grade line berekenen
summary: Teken de stroomgebieden die naar elk kunstwerk afwateren, tel de afvoeren door het net heen op met de rationele methode, bepaal de leidingmaten met de vergelijking van Manning en zie waar de hydraulische grade line vol loopt of het oppervlak bereikt.
keywords: hemelwater, stroomgebied, afwateringsgebied, rationele methode, afvoercoëfficiënt, concentratietijd, regenintensiteit, idf, manning, leidingdimensionering, hydraulic grade line, hgl, energy grade line, egl, opstuwing, overstroming, benedenwaterstand
from: e44872ec
---

Hemelwaterafvoer werkt op het [leidingnet](topic:pipe-network): teken eerst het net, daarna de gebieden die erop afwateren. Alles verschijnt onder **Hemelwaterafvoer** in het rechterpaneel wanneer niets is geselecteerd.

## Een stroomgebied tekenen

1. Klik onder **Hemelwaterafvoer** op **Stroomgebied tekenen**.
2. Klik op de hoekpunten van het gebied dat op één kunstwerk afwatert. {{key:Enter}} of een dubbelklik rondt af; {{key:Backspace}} neemt het laatste hoekpunt terug, {{key:Esc}} stopt.
3. Het stroomgebied watert af op een kunstwerk binnen het gebied, anders op het dichtstbijzijnde. Het **Eigenschappen**-venster gaat open: stel de naam in, de **Afvoercoëfficiënt C** (het deel van de regen dat afvloeit, 0 tot 1), de **Concentratietijd** in minuten en naar welk kunstwerk het **Afwatert naar**.

**Nog een stroomgebied tekenen** in het Eigenschappen-venster start het volgende. Klik binnen een stroomgebied op het plan om het te selecteren; {{key:Delete}} verwijdert het. Elke wijziging is één stap: {{key:Mod+Z}} maakt ze ongedaan.

## De ontwerpbui instellen

De regenintensiteit is i = a ÷ (tc + b) tot de macht c, in inch per uur voor een project in feet en in millimeter per uur voor een project in meter. Pas **Intensiteit a**, **b** en **c** aan op uw eigen intensiteit-duur-frequentiecurve (IDF) voor de herhalingstijd waarvoor u ontwerpt.

:::warning
De startcurve van de intensiteit, Manning n (0.013) en knooppuntverlies (0.5) zijn tijdelijke waarden, geen norm. Stel ze in op basis van uw eigen neerslaggegevens en ontwerpcriteria.
:::

- **Kortste concentratietijd**: geen leiding wordt berekend bij een kortere tijd (begin: 10 minuten).
- **Manning n**: de ruwheid van de leidingen.
- **Knooppuntverlies**: het verlies aan opvoerhoogte in elk kunstwerk, als deel van de snelheidshoogte V²/2g van de leiding die eruit gaat.
- **Waterpeil bij de uitlaat**: de benedenwaterstand, waar de laatste leiding uitmondt. Laat dit leeg wanneer de uitlaat vrij afloopt.

## Hoe de afvoeren optellen

Elke leiding voert alle stroomgebieden erboven af. Q = C × i × A, waarbij C × A door het net heen wordt opgeteld en i de intensiteit is bij de langste concentratietijd van het toestromende water: de eigen tijd van een stroomgebied, of de tijd van een stroomgebied hoger in het net plus de looptijd door de leidingen (lengte ÷ de snelheid bij vol lopen). Q is in cubic feet per second (A in acres) of in cubic meters per second (A in hectares).

## Leidingen dimensioneren

De tabel onder **Afvoeren en grade lines** toont per leiding de afvoer, wat ze bij vol lopen op haar helling kan voeren, de snelheid, de hydraulische grade line bij haar bovenkant en onderkant, en hoe diep het water stroomt.

Met **Leidingen dimensioneren voor deze afvoeren** krijgt elke leiding de kleinste standaardmaat die haar afvoer op haar eigen helling kan voeren (12 tot 72 in, of 300 tot 1800 mm). Dit is één stap. De binnenonderkanten blijven waar ze zijn: wanneer de maten veranderen, gebruikt u **Alle binnenonderkanten uit de regels instellen** om de dekking te behouden, en controleert u daarna de tabel opnieuw.

## De grade lines lezen

De hydraulische grade line (HGL) wordt vanaf de uitlaat stroomopwaarts berekend:

- Een leiding die deels vol loopt heeft haar HGL op het wateroppervlak: de binnenonderkant plus de normale diepte.
- Wanneer het water beneden hoger staat dan haar kruin, of wanneer zij meer voert dan zij bij vol lopen kan, loopt zij vol (opgestuwd) en stijgt haar HGL met het wrijvingsverval over haar lengte.
- Bij elk kunstwerk is de HGL de HGL bovenaan de wegvoerende leiding plus het knooppuntverlies.
- De energy grade line (EGL) is de HGL plus de snelheidshoogte.

Een leiding die vol loopt wordt vermeld, en dat geldt ook voor elk kunstwerk waar de HGL boven de rand ligt: daar bereikt het water het oppervlak, en het kunstwerk wordt rood omcirkeld op het plan. Selecteer een leiding of een kunstwerk om de afvoer, diepte, snelheid en beide grade lines in het Eigenschappen-venster te zien.

## Een bui doorrekenen

De rationele methode geeft één piek per leiding. {{ui:Bui doorrekenen}} (onder de resultaten, in het Eigenschappen-venster van het net) berekent in plaats daarvan de hele bui: de afvoer van elk stroomgebied in de tijd, doorgevoerd door de leidingen met hun looptijd en berging, en opgeteld waar ze samenkomen.

1. Laat {{ui:Regen duurt}} en {{ui:Regenintensiteit}} leeg om de langste concentratietijd en de neerslagcurve hierboven te gebruiken, of typ uw eigen waarden.
2. Druk op {{ui:Bui doorrekenen}}. De tabel toont per leiding de hoogste in- en uitgaande afvoer, hoeveel lager de uitgaande piek is, hoeveel van de volle capaciteit van de leiding wordt gebruikt, en de minuut waarop de piek optreedt.
3. Elke uitlaat krijgt een kleine grafiek van de afvoer in de tijd en {{ui:Hydrograaf downloaden (CSV)}}.

Een stroomgebied geeft de regen gemiddeld over zijn concentratietijd af, dus een bui die korter is dan dat, piekt lager dan C × i × A. Elke leiding wordt doorgerekend met de methode van Muskingum–Cunge, met de stroomdiepte die de rationele methode al heeft gevonden. Twee takken met verschillende concentratietijden pieken niet tegelijk, zodat hun som lager is dan de som van hun pieken.

Dit modelleert geen opstuwing, terugstuwing, berging in kunstwerken of overstroming. Een leiding waarvan de doorgerekende piek boven haar volle capaciteit ligt, wordt vermeld, en haar water wordt doorgegeven alsof het erin past. Gebruik het om timing en demping te zien, niet om de leiding te dimensioneren. Het is een rekenhulp: een ingenieur controleert het.

## Opgeslagen met het project

Stroomgebieden en de instellingen voor de bui worden opgeslagen in het projectbestand. Ze staan nog niet in de PDF-plot, de DWG of DXF, of LandXML: zie [Nog niet beschikbaar](topic:not-built-yet).
