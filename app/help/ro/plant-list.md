---
title: Lista de plante
summary: Aproximativ 420 de plante temperate și mediteraneene obișnuite, cu dimensiunile, rezistența la îngheț, lumina și apa lor, căutabile în orice limbă, plus propria listă salvată cu proiectul.
keywords: lista de plante, baza de date de plante, specii, nume botanic, nume comun, paletă de plante, listă de pepinieră, zonă de rezistență, csv, import plante, export plante, plantele mele, listă de arbori, listă de arbuști, bibliotecă de plante
from: 7ed09e7e
---

Secțiunea **Plante** din panoul din stânga listează fiecare plantă pe care o puteți plasa. Faceți clic pe una pentru a vedea dimensiunile sale și pentru a o face planta folosită de **{{ui:Plantă}}**, **{{ui:Strat}}** și **{{ui:Gard viu}}**.

## Căutare și filtrare

Scrieți în **Căutare**: orice cuvânt din numele unei plante, în orice limbă (engleză, spaniolă, portugheză), numele său botanic, tipul sau un cuvânt din notele sale. Fiecare cuvânt scris trebuie să se potrivească, astfel că `quercus evergreen` găsește stejarii veșnic verzi. Diacriticele nu contează.

Restrângeți lista cu **Tip**, **Lumină**, **Apă** și **Zonă de rezistență** (zona USDA în care se află amplasamentul; o plantă apare în listă când zona se află în intervalul ei).

## Ce conține o plantă

| Câmp | Înseamnă |
|---|---|
| Tip | Arbore, arbust, gard viu, iarbă (inclusiv gazonul), plantă perenă, acoperitor de sol sau cățărătoare |
| La maturitate | Înălțimea și extinderea plantei crescute într-o grădină sau pe o stradă, în metri |
| La plantare | Dimensiunea la care se plantează și recipientul său |
| Distanță | De la centru la centru, într-un strat sau de-a lungul unui gard viu |
| Zonă de rezistență | Zonele USDA în care este de obicei rezistentă |
| Lumină, apă, sol | Ce necesită |
| Note | Utilizări și avertismente, de exemplu părți toxice sau o plantă care se răspândește |

:::note
Lista încorporată a fost scrisă pentru CadCraft din cunoștințe generale de horticultură: dimensiuni tipice, rotunjite. Nu este catalogul niciunei pepiniere. Verificați dimensiunile și rezistența la îngheț cu o pepinieră locală. Cele mai cunoscute plante invazive din Peninsula Iberică și din cea mai mare parte a lumii temperate sunt omise intenționat, iar câteva care sunt invazive în alte părți au o notă.
:::

## Plantele dvs.

- **Adăugare în lista acestui proiect** copiază o plantă în lista proprie a proiectului, unde este salvată odată cu proiectul. O plantă din lista dvs. înlocuiește planta încorporată cu aceeași cheie, astfel încât puteți modifica dimensiunile pentru regiunea dvs.
- **Importare listă de plante…** citește un CSV (sau un fișier de plante). CSV-ul are nevoie de o coloană cu numele botanic și, de preferat, tip, înălțime și extindere; sunt acceptate nume de coloane în propriile cuvinte (de exemplu Latin, Common name, Height, Spread, Width, Zone). Sunt citite virgule, punct și virgulă sau tabulatori și virgule zecimale. Dimensiunile de plantare, distanțele și recipientele goale primesc valori implicite rezonabile pentru tip.
- **Exportare ca CSV** salvează lista dvs. (sau, dacă nu aveți una, plantele afișate de căutare) pentru a o deschide într-o foaie de calcul.

O listă de plante este citită ca orice fișier din exterior: tot ce nu poate fi folosit este lăsat deoparte și numărat.

## Plante în alte aplicații

Lista de plante este o singură bibliotecă pentru fiecare aplicație CadCraft: BimCraft și ModelCraft au aceeași listă, dar propria lor plasare din bibliotecă nu oferă încă plante. Astăzi plantele ajung într-un model BIM prin IFC-ul peisagistic al CivilCraft (fiecare plantă este un `IfcGeographicElement`). Vezi [Plantare](topic:planting#ifc).
