---
title: Ograje
summary: Ograja ob črti, parceli ali podlagi: količki, prečke, paneli ali letve, vrata, nagnjena ali stopničasta po terenu, razpredelnica, simboli na načrtu in elementi IFC. Na voljo tudi pomočniku.
keywords: ograja, količki, prečke, paneli, letve, vrata, nagnjeno, stopničasto, teren, razpredelnica, ifc, ograjni elementi, meja
from: c0e7b84a
---

Naredite ograjo ob karakteristični črti, trasi, parceli ali podlagi, s količki in vrati, ki so postavljeni samodejno.

## Naredite ograjo

1. Izberite črto, parcelo ali podlago.
2. Odprite **Površje, Več, Ograje...**
3. Izberite slog (paneli, prečke ali letve), nagnjeno ali stopničasto, višino, razmik količkov in širino vrat, nato **Ograja ob izboru** ali **Z vrati**, da postavite vrata na sredino najdaljšega ravnega odseka.

Količki so postavljeni na koncih, na vsakem vogalu (oglišče, ki se zasuče za 20 stopinj ali več), na obeh robovih vsakih vrat in v enakih poljih vmes, nobeno ne sme biti daljše od razmika. **Nagnjeni** paneli sledijo terenu med svojimi količki. **Stopničasti** paneli ostanejo vodoravni in se na količkih stopničasto zamaknejo; reža pod panelom je najširša pri njegovem količku na strani navzdol, okno pa opozori, kadar je reža čez mejo ali kadar se teren dviga skozi panel. Vrata, široka 6 feet (1.8 m) ali več, dobijo dve krili; načrt prikaže krili odprti z njunim zamahom.

## Razpredelnica in izhodi

Vsaka ograja prikazuje svojo dolžino, količke po vrsti, panele, vrata in stopnice, z razpredelnico **CSV** količkov, panelov, prečk, letev in vrat. Načrt ima sloje ograje (`C-FENC`, `C-FENC-POST`, `C-FENC-GATE`) za PDF, DXF in DWG. Izvoz IFC vsebuje količke (`IfcMember, post`), panele (`IfcRailing, user defined fence panel`), prečke (`IfcMember`) in vrata (`IfcDoor, gate`), en sistem na ograjo.

## Od pomočnika

`fence_build` naredi ograjo (točke ali poimenovana črta, parcela ali podlaga, vrata glede na stacionažo), `fence_list` pa izpiše ograje z njihovo razpredelnico.

## Kaj še ni narejeno

Začetne velikosti so običajne izbire, ne predpis. Tipi iz knjižnice se prenesejo samo kot ime. Vrata morajo ležati v enem ravnem odseku. BimCraft tega orodja še nima.
