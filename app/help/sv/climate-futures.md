---
title: "Klimatframtider: 2050 och 2080 översvämning, hetta och skogsbrand"
summary: I Adress till tomt, höj tomtens översvämningsnivå för ett framtida klimat, gör en screening av skogsbrandsexponeringen och morfa en väderfil, jämför nuläget med framtiden, från ett klimatdatapaket (SSP2-4.5 och SSP5-8.5, 2050 och 2080).
keywords: klimat, klimatförändring, framtid, 2050, 2080, ssp, cmip6, scenario, havsnivå, översvämning, basflödesnivå, bfe, fema, värme, väderfil, epw, morfing, skogsbrand, buskbrand
from: b0d2ee38
---

Klimatsiffrorna kommer från ett **datapaket**, inte från appen. Slå på tillägget {{ui:Klimatframtider}} under Inställningar › Tillägg, eller läs in ett eget paketfil i blocket {{ui:Klimatframtid}}.

:::warning
Paketet som följer med tillägget är ett **exempel**: tre platser (Denver, Miami, Johannesburg), en klimatmodell och fem år i varje 20-årsperiod. Det finns för att prova verktygen, **inte för design**. Ett fullständigt paket byggs med `tools/climate/build-pack.mjs` från NASAs NEX-GDDP-CMIP6-data.
:::

## Var det finns

Terrängmodell › Mer › Adress till tomt. Ange punkten, lägg till lagren (ett FEMA-översvämningslager ger basflödesnivån) och tryck på knappen som läser tomten. Under tomtens rader finns blocket {{ui:Klimatframtid}}: välj ett **Scenario** (SSP2-4.5 eller SSP5-8.5) och ett **År** (2050 = 2041-2060, 2080 = 2071-2090, båda jämförda med 1995-2014). Paketets plats närmast punkten används, eller den du väljer; långt från varje plats används de globala medelförändringarna, och panelen säger det.

## Dimensionerande översvämningsnivå

Den nuvarande nivån är FEMAs basflödesnivå när översvämningslagret hade en (fot, NAVD 88), annars skriver du in din egen. Välj översvämningstyp (kust, flod eller kraftigt regn, eller båda), översvämningsdjupet på platsen för regndelen, och en friboard om du vill ha en. {{ui:Höj översvämningsnivån}} visar nuvarande och framtida nivå sida vid sida, havsnivå- och regndelarna, och antagandena: hela havsnivåhöjningen läggs till en kustnivå; flodflödet stiger en till en med den våtaste dagens nederbörd och djupet följer flödet upphöjt till 0.6 (Manning, bred flodfåra); delarna läggs ihop.

:::warning
En screening av förändringen, inte en översvämningsstudie. Den dimensionerande översvämningsnivån är myndighetens eller din konstruktörs.
:::

## Skogsbrandsexponering (endast screening)

Närmaste vegetation, lutningen upp från den och avståndet ger ett band från mycket låg till extrem, nu och i framtiden (framtiden multipliceras med paketets förändring i brandvädersindex). **Endast screening:** vår egen relativa skala för att se om en plats behöver en riktig skogsbrandsbedömning; inte en normklassning.

## Hetta: en framtida väderfil

Välj en `.epw`-fil från nuläget och {{ui:Gör den framtida väderfilen}}: den morfas med den publicerade förskjutnings- och töjningsmetoden (Belcher, Hacker och Powell 2005) och hettan jämförs (medel- och högsta temperatur, dimensionerande temperaturer, timmar över 30 °C och 35 °C, graddagar). {{ui:Spara den framtida väderfilen}} sparar den för panelen Miljö, BimCraft:s energikontroll eller dina egna verktyg.

## Varifrån siffrorna kommer

NASA NEX-GDDP-CMIP6 (nedskalad output från CMIP6-modeller, CC BY 4.0 per modell) för temperatur, luftfuktighet, solsken, regn och brandväder; IPCC AR6:s globala medelvärde för havsnivåhöjning om inte paketet bär lokala siffror. Panelen visar paketets källa, licens och datum.
