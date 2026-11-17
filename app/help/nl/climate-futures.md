---
title: "Klimaatprojecties: overstroming, hitte en bosbrand in 2050 en 2080"
summary: Verhoog in Adres naar bouwplaats het overstromingsniveau van de bouwplaats voor een toekomstig klimaat, toets de blootstelling aan bosbranden en bewerk een weerbestand, en zet heden naast de toekomst, op basis van een klimaatdatapakket (SSP2-4.5 en SSP5-8.5, 2050 en 2080).
keywords: klimaat, klimaatverandering, toekomst, 2050, 2080, ssp, cmip6, scenario, zeespiegel, overstroming, basisoverstromingshoogte, bfe, fema, hitte, weerbestand, epw, morph, bosbrand, bushfire
from: b0d2ee38
---

De klimaatcijfers komen uit een **datapakket**, niet uit de app. Schakel de add-on {{ui:Klimaatprojecties}} in bij Instellingen › Add-ons, of laad een eigen pakketbestand in het blok {{ui:Klimaatprojectie}}.

:::warning
Het pakket dat bij de add-on zit is een **voorbeeld**: drie plaatsen (Denver, Miami, Johannesburg), één klimaatmodel, vijf jaar in elke periode van 20 jaar. Het is er om de gereedschappen uit te proberen, **niet voor ontwerp**. Een volledig pakket wordt gebouwd met `tools/climate/build-pack.mjs` uit de NEX-GDDP-CMIP6-gegevens van NASA.
:::

## Waar het staat

Terrein › Meer › Adres naar bouwplaats. Stel het punt in, voeg de lagen toe (een FEMA-overstromingslaag geeft de basisoverstromingshoogte) en druk op de knop die de bouwplaats uitleest. Onder de rijen van de bouwplaats staat het blok {{ui:Klimaatprojectie}}: kies een **Scenario** (SSP2-4.5 of SSP5-8.5) en een **Jaar** (2050 = 2041-2060, 2080 = 2071-2090, beide ten opzichte van 1995-2014). De plaats van het pakket die het dichtst bij het punt ligt wordt gebruikt, of de plaats die u kiest; ver van elke plaats worden de mondiale gemiddelde veranderingen gebruikt, en het paneel zegt dat.

## Ontwerp-overstromingsniveau

Het huidige niveau is de basisoverstromingshoogte van FEMA wanneer de overstromingslaag die had (in ft, NAVD 88), anders typt u uw eigen. Kies het type overstroming (kust, rivier of zware regen, of beide), de overstromingsdiepte op de plek voor het regendeel, en een vrijboord als u die wilt. {{ui:Overstromingsniveau verhogen}} toont het huidige en het toekomstige niveau naast elkaar, de delen van zeespiegel en regen, en de aannames: de volledige zeespiegelstijging wordt bij een kustniveau opgeteld; rivierafvoer stijgt één-op-één mee met de regen op de natste dag en de diepte volgt de afvoer tot de macht 0,6 (Manning, brede geul); de delen worden opgeteld.

:::warning
Een screening van de verandering, geen overstromingsstudie. Het ontwerp-overstromingsniveau is aan de autoriteit of uw ingenieur.
:::

## Blootstelling aan bosbranden (alleen screening)

De dichtstbijzijnde begroeiing, de helling omhoog vanaf daar en de afstand geven een band van zeer laag tot extreem, nu en in de toekomst (de toekomstige waarde vermenigvuldigt met de verandering van de brandweerindex van het pakket). **Alleen screening:** onze eigen relatieve schaal om te zien of een bouwplaats een echte beoordeling van bosbrandrisico nodig heeft; geen wettelijke classificatie.

## Hitte: een toekomstig weerbestand

Kies een actueel `.epw`-bestand en {{ui:Het toekomstige weerbestand maken}}: het wordt gemorfd met de gepubliceerde methode van verschuiving en uitrekking (Belcher, Hacker en Powell 2005) en de hitte wordt vergeleken (gemiddelde en heetste temperatuur, ontwerptemperaturen, uren boven 30 °C en 35 °C, graaddagen). {{ui:Het toekomstige weerbestand opslaan}} slaat het op voor het paneel Omgeving, de energiecontrole van BimCraft of uw eigen gereedschappen.

## Waar de getallen vandaan komen

NASA NEX-GDDP-CMIP6 (verkleinde CMIP6-modeluitvoer, CC BY 4.0 per model) voor temperatuur, luchtvochtigheid, zonneschijn, regen en brandweer; het IPCC AR6-mondiaal gemiddelde voor zeespiegelstijging, tenzij het pakket lokale cijfers bevat. Het paneel toont de bron, licentie en datum van het pakket.
