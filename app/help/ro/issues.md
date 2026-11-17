---
title: Probleme și BCF
summary: Fixați o problemă pe plan, într-un pichet al axului traseului, într-un punct de pe suprafață sau pe o conductă, dați-i o stare și comentarii, și schimbați problemele ca fișiere BCF 2.1 alături de fișierul LandXML.
keywords: problemă, probleme, bcf, comentariu, adnotare, defect, șantier, marcaj, stare, deschisă, rezolvată, închisă, bim collaboration format, landxml, probleme
from: e44153b1
---

O problemă este o notă fixată într-un loc din desenul CivilCraft, cu un titlu, o stare și comentarii. Folosiți-o pentru a le spune personalului de pe șantier sau altui program ce trebuie verificat și pentru a citi răspunsurile primite.

## Adăugarea unei probleme

1. Deschideți **Model de teren, Mai multe, Probleme (BCF)...**
2. Introduceți un titlu și descrierea a ceea ce nu este corect.
3. Alegeți unde să fixați marcajul: centrul vederii în plan, punctul de pe suprafață din centru, un pichet al axului traseului selectat (introduceți pichetul și un decalaj, dreapta este pozitivă) sau conducta, structura ori linia caracteristică selectată.
4. Apăsați **Adăugare problemă**. Marcajul apare pe plan ca un mic romb cu numărul său.

Faceți clic pe titlul unei probleme pentru a face zoom până la ea, schimbați starea în listă (Deschisă, Activă, Rezolvată, Închisă) și adăugați comentarii. Fiecare modificare este un singur pas de anulare, iar problemele sunt salvate în fișierul proiectului.

## Schimbul ca BCF

- **Export BCF** scrie un fișier BCF 2.1 cu un subiect pentru fiecare problemă: titlu, stare, comentarii și un punct de vedere cu o cameră plan ortogonală și marcajul.
- **Import BCF** citește un fișier BCF (fișierele 2.0 și 3.0 sunt citite în măsura în care corespund cu 2.1). Un subiect cu un guid pe care îl aveți deja actualizează acea problemă (stare, comentarii noi) în loc să adauge una a doua.
- **Din Probleme** creează o problemă din fiecare intrare deschisă din panoul Probleme care indică unde se află.

BCF transportă coordonatele proprii ale acestui proiect, în metri, fără deplasare. Celălalt program trebuie să fie în același sistem de coordonate ca fișierul LandXML pentru ca marcajele să ajungă în locul corect. Elementul spre care indică un marcaj (ax al traseului, pichet, decalaj, conductă) este transmis ca etichete care încep cu „cc:”, pe care CivilCraft le citește la import.

## Ce nu este verificat

Marcajele și punctele de vedere au fost testate doar prin scrierea unui fișier și citirea lui în CivilCraft. Niciun alt program BIM nu le-a deschis până acum. Dacă „view to world scale” din BCF înseamnă înălțimea completă sau jumătate din înălțimea vederii diferă între programe: CivilCraft scrie înălțimea completă.
