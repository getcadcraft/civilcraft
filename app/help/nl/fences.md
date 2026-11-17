---
title: Hekken
summary: Een hek langs een elementlijn, perceel of plateau: palen, liggers, panelen of spijlen, poorten, schuin of getrapt op het terrein, een staat, plansymbolen en IFC-elementen. Ook beschikbaar voor een assistent.
keywords: hek, palen, liggers, panelen, spijlen, poort, schuin, getrapt, terrein, staat, ifc, leuning, grens
from: c0e7b84a
---

Maak een hek langs een elementlijn, een tracé, een perceel of een plateau, met de palen en poorten die voor u worden geplaatst.

## Een hek maken

1. Selecteer een lijn, een perceel of een plateau.
2. Open **Terrein, Meer, Hekken...**
3. Kies de stijl (panelen, liggers of spijlen), schuin of getrapt, de hoogte, de palenafstand en de poortbreedte, en klik dan op **Hek langs selectie**, of op **Met poort** om een poort in het midden van het langste rechte stuk te plaatsen.

Palen komen aan de uiteinden, bij elke hoek (een hoekpunt dat 20 graden of meer draait), aan beide zijden van elke poort en in gelijke vakken daartussen, waarbij geen vak langer is dan de palenafstand. **Schuine** panelen volgen het terrein tussen hun palen. **Getrapte** panelen blijven waterpas en springen bij de palen; de opening onder een paneel is het grootst bij de paal aan de lage kant. Het dialoogvenster waarschuwt wanneer die opening de grens overschrijdt, of wanneer het terrein door een paneel heen omhoog komt. Poorten van 6 ft (1.8 m) en breder krijgen twee vleugels; het plan toont de vleugels open met hun draairichting.

## Staat en uitvoer

Elk hek toont zijn lengte, palen per soort, panelen, poorten en treden, met een **CSV**-staat van palen, panelen, liggers, spijlen en poorten. Het plan heeft hekkenlagen (C-FENC, C-FENC-POST, C-FENC-GATE) voor PDF, DXF en DWG. De IFC-export bevat de palen (IfcMember, post), panelen (IfcRailing, user defined fence panel), liggers (IfcMember) en poorten (IfcDoor, gate), één systeem per hek.

## Van een assistent

`fence_build` maakt een hek (punten of een benoemde lijn, perceel of plateau, poorten op stationering) en `fence_list` toont de hekken met hun staat.

## Wat niet is gedaan

De startafmetingen zijn gebruikelijke keuzes, geen norm. Typen uit de bibliotheek worden alleen als naam overgenomen. Poorten moeten op één rechte lijn liggen. Deze tool is in BimCraft nog niet beschikbaar.
