---
title: Citirea curbelor de nivel, a cotelor și a pantelor
summary: Stabiliți intervalul curbelor de nivel și curbele majore, afișați benzile de cote, săgețile de pantă și triunghiurile și citiți cotele terenului sub cursor.
keywords: curbe de nivel, interval între curbe de nivel, curbe majore, etichete, benzi de cote, săgeți de pantă, triunghiuri, cotă de punct, analiza modelului de teren, analiza cotelor, analiza pantelor
from: 585e500a
---

Modelul de teren este afișat cu curbe de nivel imediat ce există. Tot ce ține de acest subiect se setează la **Afișare** din panoul din stânga. Setările de afișare modifică doar ce vedeți (și ce exportați); nu sunt pași de anulare.

## Stabilirea intervalului curbelor de nivel

1. La **Afișare**, alegeți o valoare la **Curbe de nivel la fiecare**.
   - În picioare: 0.25, 0.5, 1, 2, 5, 10 sau 20 ft.
   - În metri: 0.1, 0.25, 0.5, 1, 2, 5 sau 10 m.
2. Alegeți **Curbe majore la fiecare**: a 2-a, a 4-a, a 5-a sau a 10-a curbă de nivel.
   Curbele majore sunt desenate mai groase și etichetate cu cota lor. Ele cad pe multipli întregi ai distanței majore (cu curbe de 1 ft și fiecare a 5-a majoră: 245, 250, 255 …).
3. Dezactivați {{ui:Etichete ale curbelor de nivel}} dacă etichetele aglomerează un plan mic.

Un proiect nou pornește cu 1 unitate și cu fiecare a 5-a curbă majoră. Curbele de nivel se îndoaie la liniile de rupere; dacă taie drept peste o linie de scurgere sau o creastă, acea linie nu este încă o linie de rupere (vezi [Construirea și rafinarea modelului de teren](topic:build-surface)).

:::note
Curbele de nivel sunt desenate doar când între cel mai jos și cel mai înalt punct există cel mult 2.000 de niveluri. Pe un amplasament cu relief mare și un interval foarte mic, planul nu arată deloc curbe de nivel: alegeți un interval mai mare.
:::

## Netezirea curbelor de nivel

Curbele de nivel sunt trasate ca segmente drepte, câte unul peste fiecare triunghi al modelului de teren, deci fac un mic colț la fiecare muchie de triunghi. **Netezirea curbelor de nivel** de la **Afișare** rotunjește aceste colțuri:

- **Fără (segmente drepte)**: liniile trasate, așa cum sunt. Acesta este ce arată un desen nou sau mai vechi.
- **Ușoară**: colțuri rotunjite puțin. O linie nu se mută niciodată mai mult de 10% spre următoarea curbă de nivel și niciodată mai departe de segmentul său drept decât o șesime din lungimea acestuia.
- **Puternică**: o curbă fluentă. O linie nu se mută niciodată mai mult de 25% spre următoarea curbă de nivel și niciodată mai departe de segmentul său drept decât o treime din lungimea acestuia.

Cu oricare alegere, o curbă netezită taie în continuare fiecare muchie de triunghi în același punct ca cea trasată, rămâne în triunghiul pe care îl taie fiecare segment și, astfel, nu poate tăia sau atinge altă curbă de nivel. Acolo unde o curbă taie o linie de rupere sau limita, își păstrează colțul ascuțit. Liniile netezite sunt cele trasate și exportate (DXF, DWG, PDF, GIS și 3D), având mai multe vârfuri decât liniile trasate.

Netezirea schimbă doar liniile desenate. Cotele, volumele, profilele și secțiunile sunt citite în continuare din modelul de teren în sine. O curbă de nivel care trece exact prin punctele de măsurare (un punct la 250.00 pe curba de 250) păstrează un mic colț în fiecare astfel de punct.

## Cum se construiește modelul din spatele curbelor de nivel

Curbele de nivel urmează modelul de teren, iar modelul de teren urmează **Metoda de conturare** de la **Model de teren** din panoul din stânga. Implicit, **Triangulare cu interpolare liniară**, unește punctele dumneavoastră în triunghiuri și păstrează exact fiecare punct și fiecare linie de rupere. Celelalte metode potrivesc mai întâi o grilă regulată pe puncte (kriging, curbură minimă, vecin natural, distanță inversă și altele), ceea ce dă curbe mai rotunjite între puncte, dar nu trec exact prin fiecare punct; raportul modelului de teren de la **Model de teren** arată cât de departe este rezultatul în punctele dumneavoastră.

**ABOS (aproximare bazată pe netezire)** este una dintre metodele pe grilă. Are două setări proprii: **Netezime** (0.5 la început; mai mic înseamnă mai neted) și **Precizie** (1 la început: modelul este adus în limita a 1% din intervalul de înălțime al amplasamentului în punctele dumneavoastră; scrieți un număr mai mic pentru o potrivire mai strânsă). Dacă nu poate atinge precizia pe grila pe care o are, raportul modelului de teren spune acest lucru: scrieți un **Pas al grilei** mai mic.

## Citirea unei cote oriunde

Mutați cursorul peste plan. Bara de stare arată:

- **E** și **N** sub cursor
- **Teren** și cota terenului natural acolo, interpolată pe triunghiul de sub cursor
- **Amenajat** și cota propusă, acolo unde o platformă sau un coridor a modificat terenul
- „În afara modelului de teren” în afara modelului de teren

Pentru a citi exact un punct de măsurare, alegeți {{ui:Selectare}} și faceți clic pe punct: panoul din dreapta arată numărul lui, E, N, cota, descrierea și grupul.

## Afișarea benzilor de cote

1. Bifați {{ui:Benzi de cote}}.
   Modelul de teren este umplut cu culoare de la joasă (albastru-verde) la înaltă (ocru-maro). O legendă sub casetele de validare enumeră intervalul de cote al fiecărei benzi.
2. Alegeți câte benzi la **Benzi**: 5, 8, 10 sau 12. Benzile împart intervalul de la cota cea mai joasă la cea mai înaltă în pași egali.

Benzile sunt doar pentru vizualizare. Nu sunt exportate în DXF și nu sunt trasate în PDF.

## Afișarea săgeților de pantă

Bifați {{ui:Săgeți de pantă}}. O săgeată scurtă pe fiecare triunghi suficient de mare o arată în jos. Triunghiurile plate nu primesc săgeată. Săgețile sunt o verificare rapidă a direcției de scurgere; valoarea pantei în sine nu este încă etichetată.

## Afișarea triunghiurilor, punctelor și muchiilor

- {{ui:Triunghiuri}} desenează muchiile TIN. Activați-l ca să verificați cum leagă modelul de teren punctele, mai ales de-a lungul liniilor de rupere și la margine.
- {{ui:Puncte}} desenează fiecare punct de măsurare; {{ui:Etichete de puncte}} adaugă numărul, cota și descrierea lui (sau doar o parte: vezi **Etichete de puncte** în [Setările CivilCraft](topic:settings)).
- {{ui:Linii de rupere}} desenează liniile de rupere (și limita) în portocaliu.
- {{ui:Marginea modelului de teren}} desenează conturul modelului de teren.

## Existent sau propus

Odată ce o platformă sau un coridor se nivelează fără probleme, **Model de teren** de la **Afișare** oferă {{ui:Proiectat (gradat)}}. Curbele, benzile și săgețile arată atunci modelul de teren nivelat, ca să vedeți terenul nou și punctele de intersecție cu terenul din jurul lui. Reveniți la {{ui:Teren natural}} ca să vedeți măsurătoarea.

## Ce se exportă

Exportul DXF și PDF urmează aceste setări: ce ați dezactivat nu se scrie, iar curbele de nivel sunt cele ale modelului de teren afișat. Benzile de cote nu se exportă niciodată.
