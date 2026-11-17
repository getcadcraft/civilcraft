---
title: Planuri și tabele de plantare
summary: Plasați plante individuale, straturi de plantare umplute la distanța plantelor, cu plante amestecate în procente, și garduri vii; etichetați-le; numărați-le într-un tabel de plante pentru o foaie de calcul sau TakeoffCraft.
keywords: plan de plantare, tabel de plante, strat de plantare, plantare în masă, gard viu, arbore, arbust, acoperitor de sol, distanță, distanță triunghiulară, număr de plante, cantități, etichete, coronament, simboluri de plante, ifc, takeoff
from: ab49eab5
---

## Plasarea plantelor

1. Alegeți o plantă din secțiunea **Plante** din stânga.
2. Faceți clic pe {{ui:Plantă}}, apoi faceți clic pe plan: fiecare clic plasează o plantă. Apăsați {{key:Esc}} pentru a opri.

Simbolul unei plante este desenat la extinderea sa la maturitate; Mai multe › {{ui:Afișare la dimensiunea de plantare}} desenează fiecare plantă la dimensiunea la care se plantează. Arborii stau pe sol sub coroana lor: când modelați terenul mai târziu, ei îl urmează. Pentru a fixa o plantă la o anumită cotă, scrieți cota în **Cotă** din Proprietăți.

## Straturi de plantare

1. Alegeți planta principală, faceți clic pe {{ui:Strat}} și faceți clic pe colțurile stratului. Apăsați {{key:Enter}} (sau faceți clic din nou pe primul colț) pentru a-l închide.
2. Stratul se umple cu acea plantă la distanța ei, într-un model **triunghiular** (cel obișnuit: fiecare plantă la aceeași distanță de alte șase), la jumătate de distanță față de margine.
3. În Proprietăți, **Adăugare plantă** amestecă planta aleasă din stânga. Setați **Pondere %** a fiecărei plante: stratul ia exact acel procent din fiecare, distribuit prin el. **Amestecare din nou** schimbă locul fiecăreia.

**Distanța** necompletată folosește distanța proprie a plantelor (ponderată după ponderi); scrieți una pentru a o folosi pentru fiecare plantă. **Modelul** poate fi pătrat, iar **Rânduri la** rotește rândurile.

## Garduri vii

Alegeți planta gardului viu, faceți clic pe {{ui:Gard viu}}, faceți clic de-a lungul gardului și apăsați {{key:Enter}}. Plantele merg pe linie la distanța lor, centrate astfel încât ambele capete să aibă aceeași margine. Un gard viu poate avea **două rânduri, decalate**, la o distanță stabilită.

## Etichete

Plantele individuale sunt etichetate cu setarea de etichetă (`{name}` implicit); scrieți propria etichetă pentru o plantă în Proprietăți. Straturile sunt etichetate cu numărul fiecărei plante, iar gardurile vii cu al lor. Mai multe › {{ui:Etichete de plante}} pornește și oprește etichetele. Câmpurile de etichetă sunt: `{name}`, `{botanical}`, `{size}` (recipientul), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Tabelul de plante

Mai multe › {{ui:Tabel de plante…}} numără fiecare plantă după specie, din plantele individuale, straturi și garduri vii împreună, cu dimensiunea de plantare. Salvați-l ca **CSV** sau **XLSX**, sau **Trimitere către TakeoffCraft**: un fișier de cantități pe care TakeoffCraft îl deschide pentru a prețui plantele (cu cantitățile de elemente construite și de irigație alături).

## IFC

Mai multe › {{ui:Export IFC peisagistic}} salvează peisajul ca fișier IFC (IFC 4.3) pe care un model BIM îl poate conține: fiecare plantă este un `IfcGeographicElement` de tip VEGETATION, tipizat după specia sa, cu proprietățile plantei (nume botanic, dimensiuni, rezistență la îngheț, apă, lumină); fiecare strat și gard viu este un singur element cu numărătorile sale, pe amplasament. BimCraft îl deschide alături de clădire.
