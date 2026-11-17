---
title: Realizarea unui raport de trasare
summary: Listați reperele de-a lungul unui ax de traseu la pichete și decalaje, sau punctele topografice din apropiere, cu pichet, decalaj, X (Nord), Y (Est), cote de proiect și ale terenului și debleu sau rambleu, apoi salvați raportul ca CSV sau PDF.
keywords: trasare, raport de trasare, fișă de repere, fișă de debleu, fișă de cote, pichet, decalaj, debleu, rambleu, amplasare, trasare pe teren, as-built
from: d8a4e9f1
---

Selectați un ax de traseu și faceți clic pe **Raport de trasare** în **Proprietăți**.

## Repere la pichete și decalaje

1. **De la** și **până la**: pichetele de trasat (1+50 sau 150).
2. **La fiecare**: intervalul. Reperele se pun la fiecare multiplu al acestuia, la ambele capete și (cu caseta bifată) acolo unde încep și se termină curbele axului de traseu.
3. **Decalaje**: stânga și dreapta axului de traseu, privind în sensul crescător al pichetelor: `12 L, 0, 12 R`, `L12 CL R12` sau `-12, 0, 12` (stânga este minus). Un ax de traseu cu coridor începe cu marginile părții carosabile și ale acostamentelor.
4. **Numerotare de la** și **cu prefix** denumesc reperele: 1, 2, 3 sau S101, S102.

## Puncte topografice lângă axul de traseu

Alegeți **Puncte topografice lângă axul de traseu** și distanța de apropiere. Fiecare punct aflat în această distanță primește pichetul și decalajul său, proiectul din acel loc și propria cotă ca teren: o verificare a punctelor trasate sau măsurate ca as-built.

## Ce conține raportul

| Coloană | Ce este |
|---|---|
| Punct | Numele reperului sau numărul punctului topografic |
| Pichet, Decalaj | Unde se află de-a lungul axului de traseu: L stânga, R dreapta |
| X (Nord), Y (Est) | Coordonatele sale |
| Cota de proiect | Suprafața coridorului proiectat în acel loc (de la punctul de intersecție cu terenul la următorul), altfel profilul de proiect pe axă |
| Cota terenului | Suprafața existentă în acel loc sau propria cotă a punctului topografic |
| Debleu/rambleu | C când terenul este deasupra proiectului (de tăiat), F când este sub (de umplut), la sutime |

Un reper fără cotă de proiect (în afara coridorului sau pe un ax de traseu fără una, departe de axă) nu are debleu sau rambleu; caseta de dialog spune câte sunt.

## Salvarea raportului

- **CSV**: o linie de titlu, apoi coloanele de mai sus, plus debleul sau rambleul ca număr cu semn (teren minus proiect), pentru foi de calcul și colectoare de date.
- **PDF**: pagini de tabel pe hârtia aleasă, un reper pe rând, debleurile în portocaliu și rambleurile în verde, cu cartușul celorlalte foi.

:::note
Reperele se calculează din proiectarea proiectului. Verificați-le față de planurile aprobate înainte ca ceva să fie construit.
:::
