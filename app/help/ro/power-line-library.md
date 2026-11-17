---
title: Biblioteca proprie de linii electrice
summary: Creați propriii conductori, cabluri subterane, suporturi, echipamente și tipuri de șanț, în categorii pe care le denumiți, și împărtășiți-le ca fișiere.
keywords: bibliotecă, conductor, cablu, stâlp, suport, traversă, izolator, accesoriu, fixare, odgon, tirant, transformator, dulap, mufă, șanț, categorie, csv, import, export
from: 88733744
---

Secțiunea **Bibliotecă** din spațiul de lucru Linii electrice conține fiecare element pe care o linie sau un cablu îl poate folosi. Nimic din ea nu este legat de o țară sau de un producător: creați elementele cu care lucrați.

## Trei tipuri de elemente

| Tip | Unde se află | Se poate modifica? |
|---|---|---|
| **Exemple** | Livrate cu CivilCraft, cu cifre generice pe care le-am calculat din proprietățile materialelor | Nu: întâi {{ui:Copiere în biblioteca mea}} |
| **În proiect** | Venite cu fișierul de proiect pe care l-ați deschis | Nu: întâi {{ui:Copiere în biblioteca mea}} |
| **Ale mele** | Elementele proprii, păstrate în acest browser | Da, iar modificările se salvează imediat |

Fiecare proiect păstrează o copie a fiecărui element pe care îl folosește, astfel încât un proiect se deschide pe orice computer cu propriii săi conductori și stâlpi.

:::warning
Elementele exemplu sunt doar exemple: verificați fiecare cifră față de datele furnizorului. Cablurile subterane nu au o valoare de curent admis, intenționat, deoarece aceasta depinde de modul în care sunt așezate.
:::

## Crearea unui element

1. În **Bibliotecă**, alegeți **Tipul** (conductori aerieni, cabluri subterane, suporturi, echipamente sau tipuri de șanț).
2. Faceți clic pe {{ui:Element nou}}, sau alegeți un exemplu și faceți clic pe {{ui:Copiere în biblioteca mea}} sau {{ui:Duplicare}}.
3. Completați câmpurile. Câmpurile marcate cu `*` sunt cele de care au nevoie verificările; un element căruia îi lipsește unul este marcat cu `!` și listat sub **Verificări** atunci când o linie îl folosește.
4. Dați-i o **Categorie**, cu `/` între niveluri: `Aerian/JT/Grupat`, `Suporturi/Beton/12 m`. Arborele urmează categoriile.

De ce are nevoie fiecare tip:

| Tip | Necesar pentru verificări |
|---|---|
| Conductor aerian | secțiune, diametru, masă pe metru, rezistență la rupere, modul de elasticitate, dilatare termică |
| Cablu subteran | conductoare, secțiune, tensiune, diametru, rezistență, curent admis |
| Suport | lungime totală, sarcină nominală (luată într-un punct sub vârf), adâncime în sol |
| Echipament | tipul său; o sarcină nominală pentru traverse, accesorii și odgoane; distanța între faze și căderea pentru traverse; lungimea pentru izolatori; unghiul pentru odgoane |
| Tip de șanț | adâncime, lățime, acoperire peste cabluri |

## Împărtășirea

- {{ui:Salvare bibliotecă proprie}} salvează fiecare element propriu ca un singur fișier `.cclines.json`; {{ui:Deschidere bibliotecă…}} îl citește înapoi (elementele cu aceeași cheie sunt înlocuite).
- {{ui:Salvare ca CSV}} salvează tipul pe care îl vedeți ca o foaie de calcul; {{ui:Deschidere bibliotecă…}} citește înapoi un CSV de acel tip. Coloanele pot veni în orice ordine; un fișier separat prin punct și virgulă poate folosi virgulă zecimală.
