---
title: Senka, solarni prinos i udobnost na otvorenom
summary: Proučite senku koju vaše mase bacaju tokom dana ili sezone, pogledajte njenu animaciju, izračunajte koliko struje bi solarni paneli na krovovima i zidovima proizveli u tipičnoj godini, pogledajte koliko je udoban ulica pored zgrade (UTCI) i dobijte orijentacionu procenu udobnosti vetra za pešake.
keywords: studija senke, senka, sunčani sati, animacija, solar, PV, fotonaponski, paneli, prinos, kWh, EPW, datoteka vremena, UTCI, toplotna udobnost, udobnost na otvorenom, toplotni stres, vetar
from: 96e7af4d
---

Odeljak **Okruženje** nalazi se ispod **Sunčani sati** u **Svojstvima** mase. Koristi mase koje ste nacrtali kao zgrade.

## Učitavanje datoteke vremena

Izaberite datoteku vremena za tipičnu godinu (**.epw**) za vaš grad. Besplatne su na sajtu EnergyPlus-a i na climate.onebuilding.org. Datoteka ostaje u vašem pregledaču za ovu posetu. Prinos solarne energije i studija udobnosti je traže; studija senke radi i bez nje kada projekat ima koordinatni sistem.

## Studija senke

Izaberite datum (ili označite **Sezona** i poslednji datum i korak u danima) i vremensku zonu, pa **Pokreni studiju senke**. Dobijate mapu sati sunca, odnosno senke, na terenu oko masa; tabelu koliko je terena zasenčeno kroz dan; i animaciju dana koju možete pustiti ili prolaziti korak po korak. **Sačuvaj mapu**, **Sačuvaj kadrove animacije** (svi kadrovi na jednoj slici) i **Sačuvaj sate** (CSV) čuvaju rezultate.

Teren se uzima kao ravan, na nivou najniže mase. Za senku na nagnutom terenu koristite **Sunčani sati**, koji čita teren.

## Solarni prinos

Podesite efikasnost panela, koliki deo svakog krova i zida je prekriven i gubitke sistema, pa **Pokreni solarni prinos**. Za svaki krov i zid dobijate struju koju bi kvadratni metar panela proizveo u tipičnoj godini, koliko od toga oduzimaju susedne mase, i ukupno za svaku masu. Model je opisan običnim rečima pored dugmeta: to je procena za planiranje iz tipične godine, a ne garancija.

## Udobnost na otvorenom

**Pokreni udobnost** računa Univerzalni indeks toplotne klime (UTCI) za stojeću osobu na otvorenom terenu i pored prve mase (južna, severna, istočna i zapadna strana), uz senku svake mase. Prikazuje koliko neba se vidi, prosečan dnevni UTCI, i sate iznad 32 (toplotni stres) i ispod 0 (hladni stres).

## Vetar (orijentaciono)

**Pokreni studiju vetra** rešava strujanje vazduha oko vaših masa jednom za svaki smer vetra koji duva u vašoj datoteci vremena (4, 8, 12 ili 16 smerova), nad okolinom koju izaberete (otvoreni predeo, prigradsko područje ili centar grada), pa sabira ceo satni vetar za godinu. Mapa boji teren po klasi udobnosti, od zelene (**sedenje**) preko **stajanja**, **šetanja** i **hodanja** do crvene (**neudobno**): aktivnost čija granična brzina (4, 6, 8 i 10 m/s) biva prekoračena u najviše 5 % sati. Druga tabela daje ocenu NEN 8100 (A do E) prema udelu sati u kojima vetar prelazi 5 m/s. Faktor udara množi satni prosek da bi dao efektivni udar.

Kako radi, prostim rečima: lattice-Boltzmann rešavač strujanja sa velikim vrtlozima (sopstveni, u biblioteci `lib/wind`) u kutiji oko zgrada, profil brzine vetra koji raste sa visinom za izabranu hrapavost, i brzina oko 1.5 m iznad terena poređena sa brzinom uzvodno na 10 m. **Orijentacioni** režim je brz i grub; **Standardni** koristi više ćelija i radi mnogo duže. Ako panel kaže da je mreža gruba (manje od 10 ćelija preko najviše zgrade) ili da se strujanje još menjalo, manje verujte mapi.

**Šta ovo nije.** Rešavač je proveren na udžbeničkim strujanjima (kanal, kavitet pokretan poklopcem) i pušten na kocki da se vidi da trag iza tela i ubrzanje na uglovima izgledaju ispravno. **Nije** potvrđen merenjima u aerotunelu na zgradama, zato je svaki rezultat označen kao nepotvrđen. Ne koristite ga za projektnu vrednost, opterećenje vetrom ili planski sertifikat: inženjer za vetar mora da sprovede i potvrdi pravu studiju. Ravan teren, glatki zidovi zgrada, prečica hrapavosti sa meteorološke stanice i tabela graničnih vrednosti su pojednostavljenja; granične vrednosti mogu se razlikovati od kriterijuma koje koristi vaša nadležna služba.

## Vetar sa OpenFOAM-om (dodatak)

Ugrađeni motor za vetar iznad je eksperimentalan. Za pravi rešavač strujanja uključite dodatak **Vetar za pešake (OpenFOAM)** u **Podešavanja > Dodaci** (isključen je dok ga ne uključite). To je softver sa sopstvenom GPL licencom, odvojen od ostatka CadCraft-a, i ne sadrži OpenFOAM: njega sami instalirate. Zatim **Motor** u bloku za vetar nabraja OpenFOAM.

Šta podešavate, jednom:
1. **Instalirajte OpenFOAM** (ESI v-serija sa openfoam.com; dodatak je testiran sa v2512). Na Ubuntu ili Debian (i u WSL-u na Windows-u): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, pa `sudo apt install openfoam2512-default`. Instalira se u `/usr/lib/openfoam/openfoam2512`. CadCraft-u za rad treba `blockMesh`, `snappyHexMesh` i `simpleFoam`. (Stariji paket `openfoam` 1912 iz Ubuntu arhive takođe radi, ali njegove funkcije objekta padaju; tada dodatak sam čita datoteke rezultata.)
2. **Pokrenite pomoćnika** iz fascikle `runner` dodatka pomoću Node.js-a: `node cc-openfoam-runner.mjs serve`. Ako OpenFOAM nije na putanji pretrage, dajte mu malu `runner.json` datoteku sa putanjom do OpenFOAM-ovog `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) i pokrenite ga sa `--config runner.json`. Pomoćnik sluša samo na ovom računaru i ispisuje token.
3. **Nalepite token** u polja dodatka u bloku za vetar (adresa ostaje `http://127.0.0.1:8765`) i pritisnite **Proveri pomoćnika**.

Zatim **Pokreni studiju vetra** radi jedan slučaj po smeru vetra u datoteci vremena: vaše mase postaju površ (STL) u kutiji veličine prema uobičajenom pravilu (5 visina zgrada u krug i više, 10 iza), mrežu prave blockMesh i snappyHexMesh, pokreće se kao stacionarni k-epsilon RANS sa ulazom atmosferskog graničnog sloja nad izabranom hrapavošću, a brzina na 1.5 m se čita nazad i pretvara u iste Lawson i NEN 8100 klase. Ništa ne napušta vaš računar.

**Šta je proveravano.** Tekst iznad rezultata to kaže otvoreno i deo je svake sačuvane CSV datoteke. Pisanje slučajeva dodatka, čitanje rezultata i ceo tok proveravani su bez OpenFOAM-a, a jedna kocka je pokrenuta kroz pravi OpenFOAM na tri veličine mreže (brojevi su u beleškama projekta). Nije potvrđen merenjima u aerotunelu na zgradama. To je orijentaciono čitanje, a ne projektna vrednost i ne sertifikat. Standardni k-epsilon previše procenjuje turbulenciju ispred zgrada, teren je ravan, zidovi su glatki i nema reljefa ni vegetacije.
