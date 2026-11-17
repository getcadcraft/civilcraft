---
title: Ondergrondse kabels
summary: Kabeltracés in sleuven tussen steunpunten en apparatuur, dekking en kruisingen, verbindingen per haspellengte, en de hoeveelheden voor sleuf en kabel.
keywords: ondergrondse kabel, kabeltracé, sleuf, kanaal, dekking, kruising, leidingkruising, verbinding, haspel, kast, transformator, bron, spanningsval
from: adfd2717
---

## Een kabeltracé tekenen

1. Plaats eerst de apparatuur als de kabel bij een kast, een transformator of een verbinding eindigt: {{ui:Apparatuur}}, klik daarna.
2. Klik op {{ui:Kabel}} en klik het tracé aan; begin en eindig op een steunpunt of op apparatuur om er verbinding mee te maken. Met {{key:Enter}} voltooit u het.

Kies in Eigenschappen de **Kabel**, het **Sleuftype**, hoeveel **kabels naast elkaar**, en de **speling** (%). Het tracé toont zijn lengte, waar het begint en eindigt, en de stroom die erdoor loopt.

## Wat wordt gecontroleerd

- **Dekking**: de bovenkant van de kabel moet langs het tracé onder het maaiveld liggen, tegen de dekking van het sleuftype (of de minimumdekking van de regelset).
- **Kruisingen**: waar het tracé een CivilCraft-leiding of een andere kabel kruist, de afstand ertussen tegen een vrijstandsregel: de eigen **Vrije ruimte bij kruising** van het tracé (in de Eigenschappen) wanneer u er een kiest, anders de regel **Ondergrondse kruisingen** van de regelset (de voorbeeldsets gebruiken *Underground crossing*, 0.3 m), anders de afstand van het sleuftype tot andere leidingen. Twee kruisende kabels houden de grootste van beide waarden aan. Een gekruist bovenleidingtracé wordt ter informatie vermeld, en de kabel verschijnt in het profiel van die lijn.
- **Verbindingen**: één per haspellengte van de kabel (met speling), wanneer het kabelitem een haspellengte opgeeft.

## Apparatuur

Apparatuur heeft een bibliotheekitem, een **belasting** (kW) met zijn **vermogensfactor**, en kan **een bron** zijn: het net wordt vanaf daar gevoed. De spanning van een bron komt uit zijn bibliotheekitem, of anders uit de lijn of kabel die hij voedt.

## Hoeveelheden

{{ui:Meer}} › {{ui:Hoeveelheden…}} telt de kabel (lengte van het tracé × (1 + speling) × kabels naast elkaar + de opstijging aan elk uiteinde), de sleuf per type, de ontgraving, de volumes voor zandbed en terugvulling, kanalen en verbindingen, en met de geleiders, steunpunten en apparatuur van de bovenleidingen.
