---
title: Doorhang en spanning
summary: Uw belastinggevallen (temperatuur, wind, ijs) en spanningsgrenzen, hoe CivilCraft de spanning van elk stuk berekent, en de montagetabellen.
keywords: doorhang, spanning, belastinggeval, temperatuur, wind, ijs, asymmetrisch ijs, bepalende overspanning, equivalente overspanning, toestandsverandering, kettinglijn, montagetabel, breeksterkte, dagelijkse spanning
from: f8876c35
---

## Belastinggevallen en grenzen

{{ui:Meer}} › {{ui:Belastinggevallen en grenzen…}} bewerkt de regels die elke lijn in het project volgt.

- **Belastinggevallen**: een temperatuur, een winddruk op de geleider (Pa), en radiaal ijs (mm, met zijn dichtheid). Het eerste geval is de referentie.
- **Spanningsgrenzen**: een deel van de breeksterkte van de geleider, op de horizontale spanning of op de grootste spanning bij een steun, in één belastinggeval. Of geef de horizontale spanning zelf op.
- **Vrije ruimte**: de ruimte die de geleider boven het terrein, een weg, een gebouw enzovoort houdt. Voeg ze toe, hernoem en verwijder ze: ze zijn van u. Daaronder kiest u de regels voor **Beplanting onder een lijn**, **Muren onder een lijn** en **Ondergrondse kruisingen**.
- **Gevallen die de controles gebruiken**: welk geval de grootste doorhang geeft (heet), de zwaai van de isolator (wind), ijs, en ijs aan één zijde van een steun.
- **Factoren**: de fase-afstandsfactor k, de grootste zwaai van de isolator, een factor op de belasting van steunen en verbindingen, de hoeken die hoek- en eindsteunen bepalen, de minimale dekking over begraven kabels, het grootste spanningsverlies.

## Pakketten: regels en een bibliotheek voor een land

Geen landregels zijn in CivilCraft ingebouwd. Een **pakket** bewaart een regelset en een bibliotheek samen in één bestand (`.cclinepack.json`), voor een land, een netbeheerder of een bedrijf:

- **Opslaan als pakket…** in {{ui:Belastinggevallen en grenzen…}} schrijft de getoonde regelset en uw bibliotheek (of, als uw bibliotheek nog leeg is, de items die dit project gebruikt). Typ eerst het **Land of regio**.
- **Regelset of pakket openen…** leest een pakket, een regelbestand of een bibliotheekbestand. De regels van een pakket worden in het dialoogvenster getoond (klik op **Toepassen** om ze te gebruiken), en de items gaan naar uw bibliotheek.
- Pakketten die anderen delen, staan op de add-onpagina onder **Pakketten voor hoogspanningslijnen**. Twee voorbeeldpakketten tonen het formaat; het zijn geen regels van een land.

Elk pakket wordt bij het openen gecontroleerd, zoals elk bestand. Controleer elke waarde tegen de toepasselijke norm voordat er iets wordt gebouwd.

Er zijn twee voorbeeldregelsets om mee te beginnen: **Voorbeeld: koud klimaat** en **Voorbeeld: gematigd klimaat**. Hun getallen komen uit geen enkele norm: stel de waarden in die uw norm geeft. {{ui:Regels opslaan}} en {{ui:Regels openen…}} delen een regelset als bestand.

## Hoe de spanning wordt bepaald

Voor elk stuk tussen eindsteunen:

1. De **bepalende overspanning** is √(ΣL³ ÷ ΣL) van de overspanningen.
2. Elke grens wordt via de **toestandsveranderingsvergelijking** op de bepalende overspanning omgezet in een horizontale spanning in het referentiegeval: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. De meest beperkende bepaalt de spanning.
3. De spanning van elk belastinggeval volgt daaruit, en de vorm van elke overspanning is de exacte **kettinglijn** door de twee bevestigingspunten (ook overspanningen op een helling): de doorhang uit het koord, de lengte en de spanning aan elk uiteinde.

De belasting per meter in een geval: gewicht plus ijs (ijsoppervlak × dichtheid × g) verticaal; winddruk × de diameter met ijs horizontaal.

## Montagetabellen

{{ui:Meer}} › {{ui:Montagetabellen…}} toont voor elk stuk de horizontale spanning en de doorhang van elke overspanning bij elke temperatuur van de regelset (−5 °C tot 40 °C per 5 °C om mee te beginnen), in stilstaande lucht. Sla ze op, en de steuntabel ook, als CSV.

Niet meegerekend: het kruipen van de geleider over de jaren en de rek van een nieuwe geleider. Voeg ze toe via de temperaturen waarbij u monteert.
