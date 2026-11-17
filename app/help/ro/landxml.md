---
title: Schimbul de date LandXML
summary: Deschideți LandXML de la alt software civil ca proiect nou, exportați punctele, modelele de teren, aliniamentele, profilurile și rețeaua de conducte ca LandXML 1.2 și aflați ce nu ajunge.
keywords: landxml, xml, import, export, schimb, TIN, model de teren, aliniament, profil, rețea de conducte, interoperabilitate, schimb de date
from: 870d5ece
---

LandXML este formatul deschis de schimb pe care îl citesc și scriu majoritatea programelor civile. CivilCraft citește și scrie LandXML 1.2. Dacă ați folosit Civil 3D, dialogurile sale de import și export LandXML sunt cel mai apropiat echivalent; aici nu există alegeri de făcut, iar notele spun ce a fost lăsat deoparte.

## Deschiderea unui fișier LandXML

1. Faceți clic pe {{ui:Open}} (sau apăsați {{key:Mod+O}}) și alegeți fișierul `.xml` sau `.landxml`, ori trageți-l pe plan.
2. Dacă proiectul curent are modificări nesalvate, CivilCraft întreabă mai întâi. Alegeți {{ui:Save a copy}}, {{ui:Don’t save}} sau {{ui:Cancel}}.
3. Se creează un **proiect nou**. Bara de stare spune ce s-a citit, de exemplu „Deschis site.xml: 412 puncte, 2 modele de teren, 3 aliniamente.”
4. Priviți caseta de sub datele **Model de teren**. Ea listează tot ce a fost omis sau schimbat, de exemplu:
   - „Doar prima suprafață („EG”) a fost deschisă; fișierul mai are 1.”
   - „Aliniamentul „Ramp A” are elemente pe care CivilCraft nu le poate desena încă (nu linii, arce sau spirale clotoide); a fost omis.”
   - „Regulile rețelei de conducte nu erau în fișier; se folosesc valori provizorii — setați regulile proprii sub Proiect.”

Ce devine ce:

| În fișier | În CivilCraft |
|---|---|
| Unități (Imperial sau Metric) | **Unitățile** proiectului (picioare sau metri) |
| Numele proiectului | **Numele** proiectului |
| CgPoints | Punctele proiectului; descrierea (sau codul) dă grupul |
| Prima suprafață TIN | Terenul natural, folosit ca atare („Model de teren (din LandXML)”) |
| Fiecare aliniament de linii, arce și spirale clotoide | Un aliniament cu PI-urile, razele și lungimile spiralelor refăcute din curbe |
| Primul profil de proiectare al fiecărui aliniament | Profilul său de proiectare, cu curbe verticale parabolice |
| Prima rețea de conducte | Rețeaua de conducte, cu gurile, sumpurile și radierele ei |
| Linii caracteristice de linii și arce | Linii caracteristice, cu arcele păstrate; dintr-un alt program încep ca **Doar desenată** |

Lista completă a elementelor și atributelor este în [LandXML: ce se citește și ce se scrie](topic:landxml-reference).

:::note
O suprafață citită din LandXML nu se reconstruiește când schimbați grupurile de puncte sau desenați linii de rupere. Faceți clic pe {{ui:Rebuild the surface from the points}} din secțiunea **Model de teren** ca să o construiți din puncte în schimb ({{key:Mod+Z}} readuce suprafața LandXML).
:::

## Exportul LandXML

1. Faceți clic pe {{ui:LandXML}} din grupul **Export**.
2. Browserul descarcă `<name>.xml`. Bara de stare spune ce a intrat, de exemplu „Exported LandXML 1.2: 276 points, 2 surfaces, 1 alignment, the pipe network. Pads are not part of LandXML here; the graded surface is.”

Fișierul conține:

- **Units**: picioare de topografie SUA sau metri.
- **CgPoints**: fiecare punct, cu numărul său ca nume, descrierea și grupul ca cod.
- **Surfaces**: terenul natural ca TIN, cu liniile sale de rupere și limita exterioară ca date sursă; și, când platformele sau coridoarele sunt sistematizate, o a doua suprafață TIN numită „Proposed”.
- **Alignments**: linii, arce și spirale clotoide cu stațiile lor, fiecare cu un profil care conține terenul natural eșantionat de-a lungul lui și profilul de proiectare (PVI-uri și curbe parabolice) când are cel puțin două PVI-uri.
- **PipeNetworks**: structurile cu gurile, sumpurile și radierul fiecărei conducte, și conductele cu diametru, lungime și pantă.
- **PlanFeatures**: fiecare linie caracteristică ca linii și arce, cu cota de la fiecare capăt și la ce servește.

## Ce nu ajunge

- Platforme și coridoare ca obiecte. Rezultatul lor este în suprafața „Proposed”.
- Aliniamente cu erori (de exemplu curbe suprapuse): lăsate deoparte și numărate în mesajul de stare.
- Conducte fără ambele radiere și rețele cu mai puțin de două structuri.
- O gură luată din suprafață se scrie ca gură fixă. Redeschis, structura păstrează acel număr chiar dacă suprafața se schimbă.
- Regulile rețelei (pantă minimă, acoperire, cădere): LandXML nu are loc pentru ele.
- Setările de afișare și alegerile de suprafață ale grupurilor de puncte: pentru acestea salvați un proiect CivilCraft.

La deschidere, CivilCraft nu citește spirale altele decât clotoide, suprafețe de tip grilă, puncte care se referă doar la alte puncte, parcele, spirale în liniile caracteristice, drumuri sau date de ridicare. Fiecare este numită în note, niciodată ghicită.

## Dus și întors

Pentru a preda lucrarea cuiva care folosește alt software civil și a o primi înapoi, exportați LandXML, lăsați-l să editeze și deschideți LandXML-ul rezultat ca proiect nou. Păstrați și propriul `.civilcraft.json`: este singurul fișier care păstrează tot ce știe CivilCraft.
