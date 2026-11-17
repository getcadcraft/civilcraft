---
title: "Klimaattoekomste: 2050 en 2080 vloed, hitte en veldbrand"
summary: In Adres na terrein, verhoog die terrein se vloedvlak vir 'n toekomstige klimaat, toets die veldbrandblootstelling en verander 'n weerlêer, en stel hede en toekoms naas mekaar voor, uit 'n klimaatdatapakket (SSP2-4.5 en SSP5-8.5, 2050 en 2080).
keywords: klimaat, klimaatsverandering, toekoms, 2050, 2080, ssp, cmip6, scenario, seevlak, vloed, basisvloedhoogte, bfe, fema, hitte, weerlêer, epw, morf, veldbrand, bosbrand
from: b0d2ee38
---

Die klimaatsyfers kom uit 'n **datapakket**, nie uit die program nie. Skakel die {{ui:Klimaattoekomste}}-byvoeging aan in Instellings › Byvoegings, of laai 'n pakketlêer van jou eie in die {{ui:Klimaattoekoms}}-blok.

:::warning
Die pakket wat by die byvoeging kom, is 'n **monster**: drie plekke (Denver, Miami, Johannesburg), een klimaatmodel, vyf jaar in elke 20-jaar-tydperk. Dit is daar om die gereedskap te probeer, **nie vir ontwerp nie**. 'n Volledige pakket word met `tools/climate/build-pack.mjs` uit NASA se NEX-GDDP-CMIP6-data gebou.
:::

## Waar dit is

Oppervlak › Meer › Adres na terrein. Stel die punt, voeg die lae by ('n FEMA-vloedlaag gee die basisvloedhoogte) en druk die knoppie wat die terrein lees. Onder die terrein se rye is die {{ui:Klimaattoekoms}}-blok: kies 'n **Scenario** (SSP2-4.5 of SSP5-8.5) en 'n **Jaar** (2050 = 2041-2060, 2080 = 2071-2090, albei teen 1995-2014). Die pakket se plek naaste aan die punt word gebruik, of die een wat jy kies; ver van elke plek af word die globale gemiddelde veranderinge gebruik, en die paneel sê so.

## Ontwerp-vloedvlak

Die huidige vlak is FEMA se basisvloedhoogte wanneer die vloedlaag een gehad het (voet, NAVD 88), anders tik jou eie. Kies die vloedtipe (kus, rivier of swaar reën, of albei), die vloeddiepte by die terrein vir die reënvaldeel, en 'n vryboord as jy een wil hê. {{ui:Verhoog die vloedvlak}} wys die huidige en toekomstige vlak langs mekaar, die seevlak- en reënvaldele, en die aannames: die hele seevlakstyging word by 'n kusvlak getel; rivierstroming styg een-tot-een met die natste-dag se reënval, en diepte volg stroming tot die mag 0.6 (Manning, breë kanaal); die dele word getel.

:::warning
'n Sifting van die verandering, nie 'n vloedstudie nie. Die ontwerp-vloedvlak is die owerheid se of jou ingenieur se.
:::

## Veldbrandblootstelling (sifting alleen)

Die naaste plantegroei, die helling op van daaraf en die afstand gee 'n band van baie laag tot uiters, huidig en toekomstig (die toekoms vermenigvuldig met die pakket se verandering in die veldbrand-weerindeks). **Slegs sifting:** ons eie relatiewe skaal om te sien of 'n terrein 'n behoorlike veldbrandassessering nodig het; nie 'n kodegradering nie.

## Hitte: 'n toekomstige weerlêer

Kies 'n hedendaagse `.epw`-lêer en {{ui:Maak die toekomstige weerlêer}}: dit word gemorf met die gepubliseerde verskuiwing-en-rek-metode (Belcher, Hacker en Powell 2005) en die hitte word vergelyk (gemiddelde en warmste temperatuur, ontwerptemperature, ure bo 30 °C en 35 °C, graad-dae). {{ui:Stoor die toekomstige weerlêer}} stoor dit vir die Omgewingspaneel, BimCraft se energiekontrole of jou eie gereedskap.

## Waar die syfers vandaan kom

NASA NEX-GDDP-CMIP6 (afgeskaalde CMIP6-modeluitset, CC BY 4.0 per model) vir temperatuur, humiditeit, sonskyn, reën en veldbrandweer; die IPCC AR6-globale gemiddelde vir seevlakstyging tensy die pakket plaaslike syfers dra. Die paneel wys die pakket se bron, lisensie en datum.
