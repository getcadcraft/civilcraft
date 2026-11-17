---
title: Izračun ur sonca na lokaciji
summary: Izberite dan (ali letni čas) in časovni pas ter poglejte ure neposrednega sonca na vsaki steni vsake mase in na tleh okoli njih, s tlemi, narisanimi v tlorisu, in številkami kot CSV.
keywords: sonce, ure sonca, senca, zasenčenje, sončni dostop, dnevna svetloba, fasada, stena, letni čas, solsticij, enakonočje, časovni pas, poletni čas, zemljepisna širina, zemljepisna dolžina, CSV, raster
from: 4e32a314
---

**Ure sonca** šteje ure neposrednega sonca, ki dosežejo vsako steno vsake mase stavbe in tla okoli njih, na dan, ki ga izberete, ali povprečno čez letni čas. Mase in tla same mečejo senco; nič drugega ne (ni dreves, ni sosedov, ki jih niste narisali). Sončna svetloba, ki ni neposredno sonce, se ne šteje.

## Preden začnete

Položaj sonca je odvisen od zemljepisne širine in dolžine lokacije, ki izhajata iz **koordinatnega sistema** projekta. Projekt brez njega se zavrne s sporočilom: najprej ga nastavite (**Koordinate** v skupini GIS). Zemljepisne širine in dolžine, vnesene ročno, bi bile ugibanje, zato zanje ni polja.

## Izračun

V **Lastnostih**, pod **Mase stavb**, **Ure sonca**:

1. Izberite **Dan**. Začne se pri dnevu, ko je sonce tam, kjer ste, najnižje (21. decembra, oziroma 21. junija na južni polobli). Za letni čas označite **Čez letni čas**, izberite **Zadnji dan** in kako narazen v dnevih naj se vzorči.
2. Vpišite **Časovni pas**: ime, na primer `America/Mexico_City`, ali odmik od UTC, na primer `-6`. Ime sledi pravilom poletnega časa tega pasu za dan; odmik, ki ga vpišete, se uporabi natanko tako, kot je vpisan, zato uporabite tistega, ki velja na ta dan. Vrstica pod poljem pove, kateri odmik je našla.
3. Izberite, kako pogosto naj se postavi sonce (na vsakih 5, 10, 15 ali 30 minut), nato **Izračunaj ure sonca**. Letni čas se izvaja v ozadju; **Ustavi** ga prekliče.

## Kaj dobite

- Preglednica po masah: **najslabša stena**, **povprečje** in **najboljša stena** v urah na dan ter preglednica vseh sten z njihovo orientacijo in urami po etažah.
- Tla okoli mas, narisana v tlorisu od temne (brez sonca) do rumene (največ, kolikor katera celica dobi), z legendo. Celice pod maso ostanejo prazne. **Prikaži tla v tlorisu** to izklopi.
- **Stene kot CSV** in **Tla kot CSV** shranita številke.

Pri letnem času so vrednosti povprečje na dan čez vzorčene dneve. Ničesar se ne shrani v projekt: rezultat je namenjen za ogled, ponovni zagon pa ga ustvari znova.

## Dobro je vedeti

- Stena šteje trenutek kot sončen le, kadar je obrnjena proti soncu in ji nič ne stoji na poti. Stena, obrnjena stran, ne dobi ničesar.
- Tla se vzorčijo na mreži, ki je odvisna od velikosti lokacije, položaj sonca pa na sredini vsakega časovnega koraka, zato so ure pravilne do približno koraka, ki ste ga izbrali.
- Položaj sonca je objavljena astronomska formula, natančna na približno ločne minute.
