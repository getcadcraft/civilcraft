---
title: Sjena, solarni prinos i ugodnost na otvorenom
summary: Proučite sjenu koju vaši volumeni bacaju tijekom dana ili sezone, pogledajte njezinu animaciju, izračunajte koliko električne energije bi solarni paneli na krovovima i zidovima proizveli u tipičnoj godini, pogledajte koliko je ugodna ulica uz zgradu (UTCI) i dobijte orijentacijsko očitanje ugodnosti vjetra za pješake.
keywords: studija sjene, sjena, sunčani sati, animacija, solarno, PV, fotonaponski, paneli, prinos, kWh, EPW, meteorološka datoteka, UTCI, toplinska ugodnost, ugodnost na otvorenom, toplinski stres, vjetar
from: 96e7af4d
---

Odjeljak **Okoliš** nalazi se ispod **Sunčani sati** u **Svojstvima** volumena. Koristi volumene koje ste nacrtali kao zgrade.

## Učitavanje meteorološke datoteke

Odaberite meteorološku datoteku tipične godine (**.epw**) za svoj grad. Besplatne su s mrežnog mjesta EnergyPlus i s climate.onebuilding.org. Datoteka ostaje u vašem pregledniku za ovaj posjet. Solarni prinos i studija ugodnosti trebaju je; studija sjene radi i bez nje kada projekt ima koordinatni sustav.

## Studija sjene

Odaberite datum (ili označite **Sezonu** te zadnji datum i korak u danima) i vremensku zonu, zatim **Pokreni studiju sjene**. Dobivate kartu sunčanih sati ili sjene na terenu oko volumena; tablicu koliki dio terena je u sjeni tijekom dana; i animaciju dana koju možete pustiti ili prolaziti korak po korak. **Spremi kartu**, **Spremi kadrove animacije** (svi kadrovi na jednoj slici) i **Spremi sate** (CSV) čuvaju rezultate.

Teren se uzima kao ravan na razini najnižeg volumena. Za sjenu na nagnutom terenu koristite **Sunčani sati**, koji čita reljef.

## Solarni prinos

Postavite učinkovitost panela, koliki dio svakog krova i zida je prekriven i gubitke sustava, zatim **Pokreni solarni prinos**. Za svaki krov i zid dobivate električnu energiju koju bi kvadratni metar panela proizveo u tipičnoj godini, koliki dio joj oduzimaju susjedni volumeni, i ukupno za svaki volumen. Model je napisan običnim riječima uz gumb: riječ je o procjeni za planiranje iz tipične godine, a ne o jamstvu.

## Ugodnost na otvorenom

**Pokreni ugodnost** izračunava Univerzalni toplinski klimatski indeks (UTCI) za osobu koja stoji na otvorenom terenu i uz prvi volumen (južna, sjeverna, istočna i zapadna strana), uz sjenu svakog volumena. Prikazuje koliko neba se vidi, prosječni dnevni UTCI te sate iznad 32 (toplinski stres) i ispod 0 (hladni stres).

## Vjetar (orijentacijski)

**Pokreni studiju vjetra** rješava strujanje zraka oko vaših volumena jednom za svaki smjer vjetra koji puše u vašoj meteorološkoj datoteci (4, 8, 12 ili 16 smjerova), za okolinu koju odaberete (otvoreni teren, predgrađe ili središte grada), a zatim zbraja satni vjetar cijele godine. Karta boji teren prema klasi ugodnosti, od zelene (**sjedenje**) preko **stajanja**, **šetnje** i **hodanja** do crvene (**neugodno**): aktivnost čija granična brzina (4, 6, 8 i 10 m/s) je prekoračena najviše 5 % sati. Druga tablica daje razred NEN 8100 (A do E) prema udjelu sati u kojima vjetar prelazi 5 m/s. Faktor udara množi satni srednji iznos da bi dao efektivni udar.

Kako radi, običnim riječima: rješavač strujanja lattice-Boltzmann velikih vrtloga (naš vlastiti, u biblioteci `lib/wind`) u kutiji oko zgrada, profil brzine vjetra koji raste s visinom prema odabranoj hrapavosti, i brzina oko 1.5 m iznad tla u usporedbi s brzinom uzvodno na 10 m. **Orijentacijski** je brz i grub; **Standardni** koristi više ćelija i radi znatno dulje. Ako ploča kaže da je mreža gruba (manje od 10 ćelija preko najviše zgrade) ili da se strujanje još mijenjalo, manje vjerujte karti.

**Što ovo nije.** Rješavač je provjeren na udžbeničkim strujanjima (kanal, kavitet s pomičnim poklopcem) i pokrenut na kocki da se vidi jesu li trag iza i ubrzanje na kutovima dobri. **Nije** provjeren u odnosu na mjerenja u aerotunelu zgrada, pa je svaki rezultat označen kao neprovjeren. Ne koristite ga za projektnu vrijednost, opterećenje vjetrom ili planski certifikat: inženjer za vjetar mora pokrenuti i potvrditi pravu studiju. Ravan teren, glatki zidovi zgrada, prečac hrapavosti s meteorološke postaje i tablica pragova su pojednostavljenja; pragovi se mogu razlikovati od kriterija vašeg nadležnog tijela.

## Vjetar s OpenFOAM-om (dodatak)

Ugrađeni motor vjetra iznad je eksperimentalan. Za pravi rješavač strujanja uključite dodatak **Vjetar na pješačkim površinama (OpenFOAM)** u **Postavke > Dodaci** (isključen je dok to ne učinite). To je zaseban softver licenciran pod GPL-om, odvojen od ostatka programa CadCraft, i ne uključuje OpenFOAM: njega sami instalirate. Zatim **Motor** u bloku vjetra navodi OpenFOAM.

Što jednom postavljate:
1. **Instalirajte OpenFOAM** (ESI serija v s openfoam.com; dodatak je testiran s v2512). Na Ubuntuu ili Debianu (također unutar WSL-a na Windowsima): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, zatim `sudo apt install openfoam2512-default`. Instalira se pod `/usr/lib/openfoam/openfoam2512`. Za rad programa CadCraft trebaju `blockMesh`, `snappyHexMesh` i `simpleFoam`. (Stariji paket `openfoam` 1912 iz vlastitog arhiva Ubuntua također radi, ali njegovi function objects padaju; dodatak tada sam čita datoteke rezultata.)
2. **Pokrenite pomoćnika** iz mape `runner` dodatka pomoću Node.js: `node cc-openfoam-runner.mjs serve`. Ako OpenFOAM nije na putanji pretraživanja, dajte mu mali `runner.json` s putanjom do `etc/bashrc` datoteke OpenFOAM-a (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) i pokrenite ga s `--config runner.json`. Pomoćnik sluša samo na ovom računalu i ispisuje token.
3. **Zalijepite token** u polja dodatka u bloku vjetra (adresa ostaje `http://127.0.0.1:8765`) i pritisnite **Provjeri pomoćnika**.

Zatim **Pokreni studiju vjetra** radi jedan slučaj po smjeru vjetra u meteorološkoj datoteci: vaši volumeni postaju površina (STL) u kutiji dimenzioniranoj prema uobičajenoj smjernici (5 visina zgrada sa strana i iznad, 10 iza), mrežu izrađuju blockMesh i snappyHexMesh, pokreće se kao stacionarni k-epsilon RANS s ulaznim graničnim slojem atmosfere preko odabrane hrapavosti, a brzina na 1.5 m se čita natrag i pretvara u iste Lawsonove i NEN 8100 klase. Ništa ne napušta vaše računalo.

**Što je provjereno.** Tekst iznad rezultata to jasno kaže i dio je svakog spremljenog CSV-a. Pisanje slučajeva dodatka, čitanje rezultata i cijeli tok provjereni su bez OpenFOAM-a, a jedna kocka prošla je kroz pravi OpenFOAM pri tri veličine mreže (brojevi su u bilješkama projekta). **Nije** provjereno u odnosu na mjerenja u aerotunelu zgrada. Riječ je o orijentacijskom očitanju, a ne o projektnoj vrijednosti ili certifikatu. Standardni k-epsilon precjenjuje turbulenciju ispred zgrada, teren je ravan, zidovi su glatki i nema reljefa ni vegetacije.
