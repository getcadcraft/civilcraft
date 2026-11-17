---
title: Spațiul de lucru Linii electrice
summary: Linii aeriene și cabluri subterane pe amplasament, cu biblioteci proprii, săgeată și tensiune sub ipotezele de încărcare, verificări de distanță și rezistență, tabele de întindere, cantități, planșe și export GIS.
keywords: linie electrică, linie aeriană, electric, distribuție, stâlpi, suporturi, conductor, săgeată, tensiune, întindere, distanță, cablu subteran, șanț, spațiu de lucru, utilitate
from: 638dd856
---

Spațiul de lucru Linii electrice așază liniile aeriene și cablurile subterane pe amplasamentul CivilCraft pe care îl aveți deja: aceleași puncte topografice, același teren, același fișier de proiect.

:::warning
O unealtă de proiectare. Spațiul de lucru calculează săgeata, tensiunea, distanțele și sarcinile din **propriile** ipoteze de încărcare și limite; nu este încorporat niciun standard al vreunei țări. Un inginer verifică fiecare rezultat față de standardul aplicabil înainte ca ceva să fie construit.
:::

## Deschiderea

Alegeți {{ui:Model de teren}} › {{ui:Mai multe}} › {{ui:Spațiul de lucru Linii electrice}}, sau **Linii electrice** sub Spațiu de lucru. Bara de instrumente afișează atunci un grup **Linii electrice**; grupurile Proiectare și GIS se dau la o parte. Alegeți **Civil** sub Spațiu de lucru pentru a reveni. CivilCraft ține minte spațiul de lucru folosit ultima dată pe acest computer.

Panoul din stânga câștigă două secțiuni în partea de sus:

- **Linii electrice**: ipotezele de încărcare și limitele, liniile și cablurile din proiect și **Verificări**, mereu actualizate. Faceți clic pe o verificare pentru a selecta ce o privește.
- **Bibliotecă**: propriii conductori, cabluri, suporturi, echipamente și tipuri de șanț. Vezi [Biblioteca proprie de linii electrice](topic:power-line-library).

## Ce este în grupul Linii electrice

| Unealtă | Ce face | Subiect |
|---|---|---|
| **Linie** | O linie aeriană: faceți clic pe fiecare suport | [Desenarea unei linii aeriene](topic:overhead-line) |
| **Suport** | Adaugă un suport pe o deschidere | [Desenarea unei linii aeriene](topic:overhead-line) |
| **Cablu** | Un traseu de cablu subteran într-un șanț | [Cabluri subterane](topic:underground-cables) |
| **Echipament** | Un dulap, un transformator, o mufă sau sursa din care este alimentată rețeaua | [Cabluri subterane](topic:underground-cables) |
| **Obstacol** | Ceva pe care o linie îl traversează: un drum, o clădire, o altă linie | [Verificări](topic:power-line-checks) |
| **Profil** | Profilul liniei: terenul, suporturile și conductorul la fiecare ipoteză de încărcare | [Desenarea unei linii aeriene](topic:overhead-line#the-line-profile) |
| **Mai multe** | Ipoteze de încărcare și limite, tabele de întindere, cantități, planșe și raport, GIS, fișiere de studiu | [Săgeată și tensiune](topic:sag-and-tension), [Ieșiri](topic:power-line-outputs), [Fișiere de studiu](topic:power-line-study-file) |

Tot ce adăugați este un singur pas de anulare, se salvează în fișierul de proiect și se desenează în plan pe straturi numite `C-POWR-…`, astfel încât exporturile DXF, DWG și PDF le conțin și ele.
