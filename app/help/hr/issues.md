---
title: Teme i BCF
summary: Prikvačite problem na plan, stacionažu osi trase, točku terena ili cijev, dodijelite mu status i komentare te razmijenite teme kao datoteke BCF 2.1 uz datoteku LandXML.
keywords: tema, teme, bcf, komentar, markup, nedostatak, greška, lokacija, pribadača, status, otvoreno, riješeno, zatvoreno, format za BIM suradnju, landxml, problemi
from: e44153b1
---

Tema je bilješka prikvačena na određeno mjesto u vašem crtežu CivilCraft, s naslovom, statusom i komentarima. Koristite je da biste službenicima na terenu ili drugom programu rekli na što trebaju obratiti pozornost te da biste pročitali njihove odgovore.

## Dodavanje teme

1. Otvorite **Teren, Više, Teme (BCF)...**
2. Upišite naslov i opis što nije u redu.
3. Odaberite mjesto na koje ćete prikvačiti temu: središte pogleda na plan, točku terena u središtu, stacionažu odabrane osi trase (upišite stacionažu i odmak; desno je pozitivno) ili odabranu cijev, građevinu ili liniju terena.
4. Pritisnite **Dodaj temu**. Pribadača se na planu prikazuje kao mali romb s brojem.

Kliknite naslov teme da biste na nju zumirali, promijenite njezin status na popisu (Otvoreno, Aktivno, Riješeno, Zatvoreno) i dodajte komentare. Svaka promjena je jedan korak poništavanja, a teme se spremaju u datoteku projekta.

## Razmjena teme kao BCF

- **Izvezi BCF** zapisuje datoteku BCF 2.1 s jednom temom za svaku temu: naslov, status, komentare i jedan prikaz s ortogonalnom kamerom za plan i pribadačom.
- **Uvezi BCF** čita datoteku BCF (datoteke 2.0 i 3.0 čitaju se u mjeri u kojoj odgovaraju formatu 2.1). Tema s guid-om koji već imate ažurira tu temu (status, novi komentari) umjesto da dodaje drugu.
- **Iz problema** stvara temu iz svakog otvorenog unosa na ploči Problemi koji navodi gdje se nalazi.

BCF sadrži metre u koordinatama ovog projekta, bez pomaka. Drugi program mora biti u istom koordinatnom sustavu kao vaša datoteka LandXML da bi pribadače bile na ispravnom mjestu. Element na koji pokazuje pribadača (os trase, stacionaža, odmak, cijev) prenosi se kao oznake koje počinju s „cc:“, a CivilCraft ih čita natrag.

## Što nije provjereno

Pribadače i prikazi testirani su samo tako da je datoteka zapisana i zatim pročitana u CivilCraftu. Nijedan drugi BIM program ih još nije otvorio. Značenje BCF polja „view to world scale“ (je li to puna ili polovina visine prikaza) razlikuje se među programima: CivilCraft zapisuje punu visinu.
