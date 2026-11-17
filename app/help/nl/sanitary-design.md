---
title: Ontwerpafvoeren vuilwater bepalen en het riool controleren
summary: Voer de personen en het oppervlak in die bij elke put van een vuilwaterriool binnenkomen; CivilCraft telt ze op stroomafwaarts door het net, berekent de piekafvoer met een piekfactor en infiltratie, en controleert de capaciteit en snelheid van elke leiding.
keywords: vuilwater, riool, vuilwaterriool, afvalwater, ontwerpafvoer, piekafvoer, piekfactor, harmon, babbitt, infiltratie, bevolking, per hoofd, procent vol, zelfreinigend, snelheid, leidingdimensionering, ontwerpblad
from: 73ba197a
---

Ontwerpafvoeren voor vuilwater werken op het [leidingnetwerk](topic:pipe-network) wanneer het {{ui:Type}} {{ui:Vuilwater}} is. Zonder selectie toont het rechterpaneel dan **Ontwerpafvoeren vuilwater** waar een hemelwaternetwerk de hemelwaterafvoer toont.

## Invoer

1. Selecteer een put. Typ onder **Ontwerpafvoeren vuilwater** de {{ui:Mensen die hier binnenkomen}} en het {{ui:Oppervlak dat hier binnenkomt}} (hectare in een metrisch project, acres in een project in feet).
2. Voor winkels, kantoren of industrie typt u equivalente personen: het oppervlak maal de personen per hectare (of acre) die uw instantie gebruikt. Het oppervlak telt in beide gevallen mee voor de infiltratie.
3. Herhaal dit voor elke put waar een straat of een perceel aansluit. Een put waar niets aansluit, houdt beide op 0.

Elke leiding voert alles af dat bij zijn bovenste put en daarboven binnenkomt. Selecteer een put om te zien wat erdoorheen gaat.

## De instellingen

| Instelling | Wat het betekent |
|---|---|
| {{ui:Afvoer per persoon}} | de gemiddelde afvoer van één persoon per dag: liters (metrisch project) of US gallons (project in feet) |
| {{ui:Infiltratie}} | grondwater dat binnenlekt: liter per seconde per hectare, of gallons per dag per acre |
| {{ui:Piekfactor}} | Harmon, 1 + 14 / (4 + √P), of Babbitt, 5 / P^0.2, met P de bevolking in duizenden |
| {{ui:Piekfactor minstens}} / {{ui:Piekfactor hoogstens}} | de factor wordt tussen deze twee gehouden |
| {{ui:Manning n}} | voor capaciteit en snelheid |
| {{ui:Minimale snelheid}} / {{ui:Maximale snelheid}} | bij de eigen diepte van de piekafvoer in de leiding |
| {{ui:Hoogste deel van de volle capaciteit}} | hoe vol een leiding bij de piek mag lopen, als percentage van wat hij vol stromend draagt |

De startwaarden zijn placeholders, geen norm. Gebruik de waarden die uw instantie publiceert.

## Wat het berekent

Voor elke leiding, in stroomvolgorde:

- piekafvoer = personen × afvoer per persoon × piekfactor + oppervlak × infiltratie
- capaciteit bij vol stromen (vergelijking van Manning bij het verval van de leiding), en hoe vol de piek hem maakt
- de normale diepte van de piekafvoer en de snelheid daar

De tabel **Resultaten vuilwater** toont per leiding de personen, de piekfactor, de piekafvoer (L/s, of gpm en cubic feet per second), het percentage vol en de snelheid. Problemen staan eronder vermeld: een leiding die voller is dan de grens, langzamer dan de minimale snelheid (hij reinigt zichzelf misschien niet), sneller dan de maximale, of zonder verval. {{ui:Dimensioneer de leidingen voor deze afvoeren}} kiest voor elke leiding de kleinste standaardmaat (200 mm of 8 inch en groter) die zijn piek binnen de grens draagt; één {{key:Mod+Z}} maakt het ongedaan.

:::note
Dit is de stationaire piekafvoer die een ontwerpblad berekent, gecontroleerd tegen een gepubliceerd ontwerpblad tot op de gedrukte afronding. Het is geen model van het riool in de tijd: geen hydrografen, berging, pompen of overstorten. Zie [Nog niet beschikbaar](topic:not-built-yet).
:::

Snelheden gebruiken de vergelijking van Manning met dezelfde n op elke diepte. Sommige instanties laten n met de diepte veranderen in hun diagrammen voor gedeeltelijk gevulde leidingen, wat een iets lagere snelheid geeft in een leiding die 60 tot 70 procent vol loopt (ongeveer 3 procent minder).
