---
title: Problemi i BCF
summary: Zakači problem za plan, tačku stacionaže osovine, tačku površine ili cev, dodeli mu status i komentare i razmenjuj probleme kao BCF 2.1 datoteke uz LandXML datoteku.
keywords: problem, problemi, bcf, komentar, označavanje, nedostatak, greška, gradilište, oznaka, status, otvoreno, rešeno, zatvoreno, format za BIM saradnju, landxml, problemi
from: e44153b1
---

Problem je beleška zakačena za mesto u vašem CivilCraft crtežu, sa naslovom, statusom i komentarima. Koristite ga da kažete osoblju na gradilištu ili drugom programu šta treba pogledati, i da pročitate njihove odgovore.

## Dodaj problem

1. Otvori **Teren, Više, Problemi (BCF)...**
2. Ukucaj naslov i šta nije u redu.
3. Izaberi gde da ga zakačiš: centar pogleda na osnovi, tačku površine u centru, stacionažu izabrane osovine trase (ukucaj stacionažu i odstupanje, desno je pozitivno) ili izabranu cev, konstrukciju ili liniju elementa.
4. Pritisni **Dodaj problem**. Oznaka se na osnovi prikazuje kao mali romb sa svojim brojem.

Klikni na naslov problema da zumiraš do njega, promeni njegov status na listi (Otvoreno, Aktivno, Rešeno, Zatvoreno) i dodaj komentare. Svaka izmena je jedan korak za opoziv, a problemi se čuvaju u datoteci projekta.

## Razmeni ih kao BCF

- **Izvezi BCF** upisuje BCF 2.1 datoteku sa po jednom temom za svaki problem: naslov, status, komentare i jedan pogled sa ortogonalnom kamerom osnove i oznakom.
- **Uvezi BCF** čita BCF datoteku (datoteke 2.0 i 3.0 čitaju se u meri u kojoj se poklapaju sa 2.1). Tema sa guid-om koji već imate ažurira taj problem (status, novi komentari) umesto da doda drugi.
- **Iz problema** pravi problem od svakog otvorenog unosa u panelu Problemi koji kaže gde se nalazi.

BCF nosi metre u koordinatama ovog projekta, bez pomeranja. Drugi program mora biti u istom koordinatnom sistemu kao vaša LandXML datoteka da bi oznake završile na pravom mestu. Element na koji oznaka pokazuje (osovina, stacionaža, odstupanje, cev) prenosi se kao oznake koje počinju sa „cc:“, a CivilCraft ih čita nazad.

## Šta nije proveren

Oznake i pogledi su testirani samo tako što je datoteka upisana i zatim pročitana u CivilCraftu. Nijedan drugi BIM program ih još nije otvorio, a to da li „view to world scale“ u BCF-u znači punu ili polovinu visine pogleda razlikuje se između programa: CivilCraft upisuje punu visinu.
