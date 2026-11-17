---
title: Postavitev parkirišča
summary: Razporedite parkirna mesta, vozne pasove, mesta za invalide in kombije ter otoke znotraj obrisa, uredite teren z nagibi do odvodnikov glede na obstoječi teren, nato parkirišče tlakujte in zasadite. Na voljo tudi pomočniku.
keywords: parkirišče, parkirno mesto, vozni pas, invalidi, ada, kombi, otok, odvodnik, padec, nagib, izkop, nasip, tlakovanje, tlakovci, zasaditev, drevesa, teren, oblak točk, mcp, pomočnik
from: 06c14da9
---

Vstavite parkirišče v parcelo, podlago ali zaprto karakteristično črto ter v enem koraku dobite število mest, urejanje terena in tlakovanje.

## Razporedite

1. Na načrtu izberite parcelo, podlago ali zaprto karakteristično črto.
2. Odprite **Površje, Več, Parkirišče...**
3. Izberite pravila, kot parkirnih mest (90, 75, 60, 45, 30 stopinj ali vzporedno) ter enosmerne ali dvosmerne vozne pasove. Velikosti parkirnih mest, voznih pasov in otokov se začnejo pri tabeli, vsako pa je mogoče prepisati.
4. Izberite **Razporedi**.

Vrste potekajo ob robu obrisa, ki da največ parkirnih mest (ali pod kotom, ki ga vnesete). Parkirno mesto se šteje le, če leži v celoti znotraj obrisa. Kjer je prostora za eno vrsto in vozni pas, se doda pas z mesti samo na eni strani. Okno našteva prostore, mesta za invalide in kombije, otoke, odvodnike in površino na prostor, načrt pa prikazuje parkirna mesta, mesta za invalide s šrafiranimi dostopnimi pasovi, otoke, središčne črte voznih pasov in odvodnike na lastnih slojih (`C-PARK-...`), zato gredo v PDF, DXF in DWG.

## Mesta za invalide

Po pravilih Združenih držav število sledi tabeli 208.2 standardov ADA iz leta 2010 za zagotovljena mesta (vsako šesto, zaokroženo navzgor, je mesto za kombi), postavljena najbližje prvemu vogalu obrisa (vhodu), vsako z dostopnim voznim pasom; dva delita enega. Parkirno mesto, ožje od širine za invalide, ali nagib, strmejši od 1:48 na mestih za invalide, se prikaže kot težava. **Te številke so bile vnesene iz standarda, kot si ga zapomnimo, in niso bile preverjene z natisnjenim standardom.** Tipične velikosti parkirnih mest in voznih pasov izhajajo iz vodnikov za načrtovanje parkirišč in prav tako niso preverjene. Preverite obe in lokalne predpise, preden se nanju zanesete. Izberite **Po meri**, da vnesete lastno število mest za invalide.

## Nagibi do odvodnikov, izkop in nasip

Če tega ne izklopite, parkirišče v delovnem okolju Landscape postane območje urejanja terena. Odvodniki so postavljeni na središčne črte voznih pasov približno vsakih 100 feet (30 m); površje se dvigne od vsakega odvodnika z nagibom, ki ga vnesete (na začetku 1.5 odstotka), tako da vsaka točka pada k najbližjemu odvodniku. Višina je izbrana tako, da se izkop in nasip parkirišča uravnotežita na obstoječem terenu. Obstoječi teren je obstoječe površje projekta, ki lahko izvira iz geodetskih točk, LandXML, oblaka točk lidarja ali optičnega skeniranja, pretvorjenega v površje, ali plastnic. Okno prikaže oceno izkopa in nasipa; prostornine projekta kasneje pokažejo natančno vrednost. Območje urejanja ohrani svoj rob na obstoječem terenu, zato je tam, kjer se novo površje na robu razlikuje od terena, stopnica, okno pa pove, kako velika je.

## Tlakovanje in zasaditev

Ves obris dobi tlakovanje s tlakovci (vzorec opečne vezi, ki ga lahko spremenite pod Landscape, Hardscape), vsak otok dobi gredico z grmovnicami in, kjer je dovolj širok, drevo, vzeto s seznama rastlin. Potem je vse običajen objekt Landscape: uredite ga ali izberite **Razporedi znova**, da nadomestite, kar je parkirišče naredilo. Odstranitev parkirišča odstrani, kar je naredilo.

## Od pomočnika

Isto parkirišče je mogoče zahtevati prek MCP: `parking_layout` pripravi predogled, `parking_build` zapiše, `parking_remove` odstrani parkirišče. Zahtevajte po imenu parcele ali pošljite obris.

## Kaj še ni narejeno

Ali vozni pasovi segajo do ceste, se ne preverja. Tlakovanje pokriva ves obris, zato površina vključuje tudi otoke. Izbire materialov tlakovanja iz knjižnice in tip iz knjižnice za parkirna mesta še nista narejena; vzorec tlakovanja je vzorec Hardscape. Pravila drugih držav še niso narejena.
