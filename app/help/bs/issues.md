---
title: Problemi i BCF
summary: Zakači problem za plan, stanicu trase, tačku na površini ili cijev, daj mu status i komentare, i razmjenjuj probleme kao BCF 2.1 datoteke uz LandXML datoteku.
keywords: problem, problemi, bcf, komentar, označavanje, nedostatak, greška, gradilište, pribadača, status, otvoren, riješen, zatvoren, format BIM saradnje, landxml, problemi
from: e44153b1
---

Problem je napomena zakačena za mjesto u tvom CivilCraft crtežu, sa naslovom, statusom i komentarima. Koristi ga da kažeš osoblju na gradilištu ili drugom programu šta treba pogledati, i da pročitaš njihove odgovore.

## Dodaj problem

1. Otvori **Teren, Više, Problemi (BCF)...**
2. Upiši naslov i šta nije u redu.
3. Odaberi gdje da ga zakačiš: centar pogleda na planu, tačku na površini u centru, stanicu odabrane trase (upiši stanicu i odmak; desno je pozitivno), ili odabranu cijev, konstrukciju ili liniju elementa.
4. Pritisni **Dodaj problem**. Oznaka se prikazuje na planu kao mali romb sa svojim brojem.

Klikni na naslov problema da zumiraš na njega, promijeni njegov status u listi (Otvoren, Aktivan, Riješen, Zatvoren) i dodaj komentare. Svaka promjena je jedan korak za Poništi, a problemi se čuvaju u datoteci projekta.

## Razmjena kao BCF

- **Izvezi BCF** zapisuje BCF 2.1 datoteku sa jednom temom po problemu: naslov, status, komentari i jedan pogled sa ortogonalnom kamerom plana i oznakom.
- **Uvezi BCF** čita BCF datoteku (datoteke 2.0 i 3.0 se čitaju koliko se poklapaju sa 2.1). Tema sa guid-om koji već imaš ažurira taj problem (status, novi komentari) umjesto da doda drugi.
- **Iz problema** pravi problem od svakog otvorenog unosa u panelu Problemi koji kaže gdje se nalazi.

BCF nosi metre u koordinatama ovog projekta, bez pomaka. Drugi program mora biti u istom koordinatnom sistemu kao tvoja LandXML datoteka da bi oznake pale na pravo mjesto. Element na koji oznaka pokazuje (trasa, stanica, odmak, cijev) prenosi se kao oznake koje počinju sa „cc:“, a CivilCraft ih čita nazad.

## Šta nije provjereno

Oznake i pogledi su testirani samo tako što je datoteka zapisana i zatim pročitana nazad u CivilCraftu. Nijedan drugi BIM program ih još nije otvorio, a to da li BCF „view to world scale“ znači punu ili pola visine pogleda razlikuje se između programa: CivilCraft zapisuje punu visinu.
