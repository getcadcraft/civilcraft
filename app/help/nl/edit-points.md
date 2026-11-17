---
title: Een meetpunt bewerken
summary: Wijzig het nummer, de coördinaten, de hoogte of de beschrijving van één punt, of sleep het naar een andere plek op het plan.
keywords: punt bewerken, punt verplaatsen, hoogte wijzigen, hernummeren, puntnummer, beschrijving, slepen, northing, easting, punt vastzetten, verkeerd ingemeten
from: 375ae2e9
---

Een verkeerd ingemeten punt, een verkeerde instrumenthoogte, een verkeerd getypte beschrijving: corrigeer het ene punt, en het terrein volgt mee.

## Waarden van een punt wijzigen

1. Klik met {{ui:Selecteren}} op het punt in het plan. **Eigenschappen** toont het nummer, de easting, de northing, de hoogte en de beschrijving in velden.
2. Typ de nieuwe waarde en druk op {{key:Enter}} (of klik ergens anders). Laat **Hoogte** leeg voor een punt zonder hoogte.
3. Het terrein, de hoogtelijnen en alles wat erop is gebaseerd, worden meteen bijgewerkt.

Elke wijziging is één stap: {{key:Mod+Z}} maakt ze ongedaan en {{key:Mod+Y}} brengt ze opnieuw. Een waarde die CivilCraft niet kan gebruiken (een nummer dat een ander punt al heeft, letters in een coördinaat) wordt geweigerd: het veld krijgt een kader en de statusbalk zegt waarom.

Een nieuwe beschrijvingscode maakt een nieuwe puntengroep, net als bij een import (zie [Een terrein opbouwen](topic:build-surface)).

## Een punt verplaatsen op het plan

1. Selecteer het punt (het krijgt een ring).
2. Sleep de ring. De statusbalk toont de easting en northing waar het naartoe gaat.
3. Laat los om het te verplaatsen; de hoogte blijft gelijk. Druk op {{key:Esc}} vóór het loslaten om het terug te zetten.

## Breeklijnen volgen het punt

Een breeklijn die met het gereedschap {{ui:Breeklijn}} is getekend, neemt de punten over waar hij doorheen gaat. Wanneer u een punt verplaatst of de hoogte ervan wijzigt, verschuiven de hoekpunten van de breeklijn daarmee mee, in dezelfde stap. Breeklijngroepen die uit beschrijvingen zijn gemaakt, worden altijd opnieuw uit de punten opgebouwd.

:::note
Een terrein dat uit een LandXML-bestand is ingelezen, houdt zijn eigen driehoeken: puntwijzigingen veranderen het pas nadat u {{ui:Het oppervlak opnieuw bouwen uit de punten}} hebt gebruikt.
:::
