---
title: Cabluri subterane
summary: Trasee de cabluri în șanțuri între stâlpi și echipamente, adâncime de îngropare și traversări, mufe după lungimea tamburului, și cantitățile de șanț și de cablu.
keywords: cablu subteran, traseu cablu, șanț, tub de protecție, adâncime de îngropare, traversare, traversare conductă, mufă, tambur, dulap, transformator, sursă, cădere de tensiune
from: adfd2717
---

## Desenați un traseu de cablu

1. Plasați mai întâi echipamentul dacă cablul se termină la un dulap, un transformator sau o mufă: {{ui:Echipament}}, apoi faceți clic.
2. Faceți clic pe {{ui:Cablu}} și apoi pe traseu; începeți și terminați pe un stâlp sau pe un echipament ca să vă conectați la el. {{key:Enter}} termină.

În Proprietăți alegeți **Cablu**, **Tipul șanțului**, câte **cabluri alăturate** și **rezerva de lungime** (%). Traseul arată lungimea sa, unde începe și unde se termină și curentul pe care îl transportă.

## Ce se verifică

- **Adâncime de îngropare**: partea de sus a cablului sub nivelul terenului de-a lungul traseului, comparată cu adâncimea de îngropare a tipului de șanț (sau cu cea mai mică adâncime din setul de reguli).
- **Traversări**: unde traseul traversează o conductă CivilCraft sau alt cablu, distanța dintre ele față de o regulă de distanță: **Distanța de traversare** a traseului (în Proprietățile sale), când alegeți una; altfel regula **Traversări subterane** din setul de reguli (setările exemplu folosesc *Traversare subterană*, 0.3 m); altfel distanța tipului de șanț față de alte servicii. Două cabluri care se traversează păstrează distanța cea mai mare dintre ele. O linie aeriană traversată este listată doar informativ, iar cablul apare în profilul acelei linii.
- **Mufe**: una la fiecare lungime de tambur a cablului (cu rezerva de lungime), când elementul de cablu indică o lungime de tambur.

## Echipament

Echipamentul are un element de bibliotecă, o **sarcină** (kW) cu **factorul său de putere** și poate fi **o sursă**: rețeaua este alimentată de acolo. Tensiunea unei surse vine din elementul său de bibliotecă sau, altfel, din linia ori cablul pe care îl alimentează.

## Cantități

{{ui:Mai multe}} › {{ui:Cantități…}} numără cablul (lungimea traseului × (1 + rezerva) × cabluri alăturate + ridicarea la fiecare capăt), șanțul pe tip, volumele de săpătură, de pat de așezare și de umplutură, conductele și mufele, împreună cu conductorul, stâlpii și echipamentele liniilor aeriene.
