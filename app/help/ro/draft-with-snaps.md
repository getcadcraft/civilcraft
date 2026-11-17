---
title: Desenarea cu agățări, colțuri alese și mutare, copiere, rotire
summary: Plasați trasee, platforme, parcele și linii caracteristice exact pe puncte și colțuri existente, tastați sau alegeți estul și nordul unui colț, orientați o tangentă spre două puncte și mutați, copiați sau rotiți un obiect printr-o distanță sau un unghi.
keywords: agățare, agățări, agățare la obiect, agățare la punct, agățare la colț, PI, vârf, colț, alegere, cruce, est, nord, coordonate, coordonate tastate, tangentă, direcție, orientare, mutare, copiere, rotire, transformare, copiere rotită, duplicare, alt, punct liber, desenare
from: 49864dda
---

Nou în 0.9: când desenați, cursorul se așază pe punctele și colțurile care există deja în plan, iar un colț de platformă, parcelă sau linie caracteristică poate fi tastat sau ales. Acest subiect parcurge cele trei instrumente.

## Ce veți face

- Desenați cu agățări, astfel încât un traseu, o platformă, o parcelă sau o linie nouă începe și se termină exact pe ceva care există.
- Setați estul și nordul unui colț tastându-le sau alegând un loc în plan.
- Orientați o tangentă de traseu spre două puncte alese.
- Mutați, copiați sau rotiți un obiect întreg.

## Pași

1. Alegeți un instrument de desenare, de exemplu {{ui:Axul traseului}}, {{ui:Platformă}}, {{ui:Parcelă}} sau {{ui:Linie caracteristică}}. Mutați cursorul aproape de un punct de măsurare, de un PI de traseu, de un colț de platformă, de parcelă sau de masă, de un vârf de linie caracteristică ori de o structură de canalizare. Apare un marcaj cu o etichetă (PI, Colț, Vârf, Structură sau Punct și numărul lui) și estul și nordul unde va ajunge. Faceți clic pentru a plasa punctul acolo.
2. Ca să plasați un punct liber, țineți {{key:Alt}} apăsat în timp ce faceți clic. Agățarea se oprește.
3. Selectați o platformă, o parcelă sau o linie caracteristică. La **Proprietăți**, blocul {{ui:Colțuri}} listează fiecare colț cu o casetă Est și o casetă Nord. Tastați numere noi sau apăsați butonul cu cruce de lângă un colț și faceți clic pe un loc din plan. Colțul primește acel est și nord. Apăsați {{key:Esc}} ca să anulați alegerea. Crucea funcționează doar în plan: închideți mai întâi vizualizarea 3D.
4. Ca să orientați o tangentă, selectați un traseu. La **Proprietăți**, sub {{ui:Tangentă din două puncte}}, alegeți tangenta, apăsați {{ui:Primul punct}} și faceți clic în plan, apăsați {{ui:Al doilea punct}} și faceți clic din nou, apoi apăsați {{ui:Setare direcție}}. Tangenta se orientează să meargă de la primul punct spre al doilea și își păstrează lungimea.
5. Ca să mutați, copiați sau rotiți, selectați un traseu, o platformă, o parcelă sau o linie caracteristică. La **Proprietăți**, sub {{ui:Mutare, copiere și rotire}}, tastați {{ui:Mutare spre est}} și {{ui:Mutare spre nord}} (numerele negative merg spre vest și sud) și apăsați {{ui:Mutare}} sau {{ui:Copiere}}. Sau apăsați {{ui:Distanță din două puncte}} și faceți clic pe punctul de la care să mutați și pe punctul la care să mutați.
6. Ca să rotiți, tastați unghiul în {{ui:Rotire în sens trigonometric}} (grade), apoi apăsați {{ui:Rotire}} sau {{ui:Copiere rotită}}. Obiectul se rotește în jurul mijlocului colțurilor sale, dacă nu alegeți cu crucea de lângă unghi un punct în jurul căruia să se rotească.

## Note

- O copie lasă originalul la locul lui și este selectată după aceea.
- Fiecare mutare, copiere, rotire, colț ales și tangentă orientată este un singur pas de anulare.
- Agățările ajung până la 10 pixeli de ecran de la cursor. Un marcaj de agățare doar oferă un loc; nimic nu se schimbă până nu faceți clic.
- Aceeași cruce se află pe rândurile PI ale axului traseului. Vezi [Axul traseului](topic:alignment), [Parcelele](topic:parcels) și [Liniile caracteristice](topic:feature-lines).
