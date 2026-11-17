---
title: Wysig 'n opmetingspunt
summary: Verander een punt se nommer, koördinate, hoogte of beskrywing, of sleep dit na 'n nuwe plek op die plan.
keywords: wysig punt, skuif punt, verander hoogte, hernommer, puntnommer, beskrywing, sleep, noordelik, oostelik, herstel 'n punt, verkeerde skoot
from: 375ae2e9
---

'n Verkeerde skoot, 'n verkeerde roedehoogte, 'n beskrywing verkeerd getik: herstel die een punt, en die oppervlak volg.

## Verander 'n punt se waardes

1. Met {{ui:Kies}}, klik die punt op die plan. **Eienskappe** wys sy nommer, oostelike en noordelike koördinaat, hoogte en beskrywing in blokkies.
2. Tik die nuwe waarde en druk {{key:Enter}} (of klik weg). Los **Hoogte** leeg vir 'n punt sonder hoogte.
3. Die oppervlak, kontoere en alles wat daarop gebou is, werk dadelik by.

Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit en {{key:Mod+Y}} herdoen dit. 'n Waarde wat CivilCraft nie kan gebruik nie ('n nommer wat 'n ander punt al het, letters in 'n koördinaat) word geweier: die blokkie word omlyn en die statusbalk sê hoekom.

'n Nuwe beskrywingskode maak 'n nuwe puntgroep, soos 'n invoer doen (sien [Bou 'n oppervlak](topic:build-surface)).

## Skuif 'n punt op die plan

1. Kies die punt (dit kry 'n ring).
2. Sleep die ring. Die statusbalk wys die oostelike en noordelike koördinaat waar dit heen gaan.
3. Laat los om dit te skuif; sy hoogte bly. Druk {{key:Esc}} voor jy loslaat om dit terug te plaas.

## Breeklyne volg die punt

'n Breeklyn wat met die {{ui:Breeklyn}}-gereedskap geteken is, kopieer die punte waardeur dit gaan. Wanneer jy 'n punt skuif of sy hoogte verander, skuif die breeklyn-hoeke op hom saam, in dieselfde stap. Breeklyngroepe wat uit beskrywings gemaak is, word altyd uit die punte herbou.

:::note
'n Oppervlak wat uit 'n LandXML-lêer gelees is, hou sy eie driehoeke: puntwysigings verander dit slegs nadat {{ui:Bou die oppervlak weer uit die punte}} gebruik is.
:::
