---
title: Sjena, solarni prinos i udobnost na otvorenom
summary: Proučite sjenu koju vaše mase bacaju tokom dana ili sezone, pogledajte njenu animaciju, izračunajte koliko električne energije bi solarni paneli na krovovima i zidovima proizveli u tipičnoj godini, pogledajte koliko je ulica pored zgrade ugodna (UTCI) i dobijte orijentacioni podatak o udobnosti vjetra za pješake.
keywords: studija sjene, sjena, sunčani sati, animacija, solar, PV, fotonaponski, paneli, prinos, kWh, EPW, meteo datoteka, UTCI, toplinska udobnost, udobnost na otvorenom, toplotni stres, vjetar
from: 96e7af4d
---

Odjeljak **Okolina** nalazi se ispod **Sunčani sati** u **Svojstvima** mase. Koristi mase koje ste nacrtali kao zgrade.

## Učitavanje meteo datoteke

Odaberite meteo datoteku tipične godine (**.epw**) za vaš grad. Besplatne su na sajtu EnergyPlus-a s meteo podacima i na climate.onebuilding.org. Datoteka ostaje u vašem pregledaču za ovu posjetu. Solarni prinos i studija udobnosti je trebaju; studija sjene radi i bez nje kad projekat ima koordinatni sistem.

## Studija sjene

Odaberite datum (ili označite **Sezona** i posljednji datum i korak u danima) i vremensku zonu, zatim **Pokreni studiju sjene**. Dobijate kartu sati sunca, odnosno sjene, na tlu oko masa; tabelu koliko je tla zasjenjeno tokom dana; i animaciju dana koju možete pustiti ili pregledati korak po korak. **Spasi kartu**, **Spasi kadrove animacije** (svi kadrovi na jednoj slici) i **Spasi sate** (CSV) čuvaju rezultate.

Teren se uzima kao ravan, na nivou najniže mase. Za sjenu na nagnutom terenu koristite **Sunčani sati**, koji čita teren.

## Solarni prinos

Postavite efikasnost panela, koliki dio svakog krova i zida je pokriven i gubitke sistema, zatim **Pokreni solarni prinos**. Za svaki krov i zid dobijate električnu energiju koju bi kvadratni metar panela proizveo u tipičnoj godini, koliko od toga oduzimaju susjedne mase i ukupan zbir za svaku masu. Model je opisan običnim riječima pored dugmeta: to je planska procjena iz tipične godine, a ne garancija.

## Udobnost na otvorenom

**Pokreni udobnost** računa Univerzalni termalni klimatski indeks (UTCI) za stojeću osobu na otvorenom terenu i pored prve mase (južna, sjeverna, istočna i zapadna strana), uz sjenu svake mase. Prikazuje koliko neba se vidi, prosječni dnevni UTCI i sate iznad 32 (toplotni stres) i ispod 0 (hladni stres).

## Vjetar (orijentaciono)

**Pokreni studiju vjetra** rješava strujanje zraka oko vaših masa jednom za svaki smjer vjetra koji duva u vašoj meteo datoteci (4, 8, 12 ili 16 smjerova), nad okolinom koju birate (otvoreni teren, predgrađe ili centar grada), zatim zbraja satni vjetar cijele godine. Karta boji tlo prema klasi udobnosti, od zelene (**sjedenje**) preko **stajanja**, **šetnje** i **hodanja** do crvene (**neudobno**): aktivnost čija granična brzina (4, 6, 8 i 10 m/s) je prekoračena najviše 5 % sati. Druga tabela daje NEN 8100 razred (A do E) prema udjelu sati u kojima vjetar prelazi 5 m/s. Faktor udara množi satni prosjek da dâ efektivni udar.

Kako radi, običnim riječima: solver strujanja velikih vrtloga zasnovan na mrežnoj Boltzmannovoj (lattice-Boltzmann) metodi (naš vlastiti, u biblioteci `lib/wind`) u kutiji oko zgrada, profil brzine vjetra koji raste s visinom preko odabrane hrapavosti, i brzina oko 1.5 m iznad tla poređena s brzinom uzvodno na 10 m. **Orijentaciona** provjera je brza i gruba; **Standardna** koristi više ćelija i radi mnogo duže. Ako panel kaže da je mreža gruba (manje od 10 ćelija preko najviše zgrade), ili da se strujanje još mijenjalo, manje vjerujte karti.

**Šta ovo nije.** Solver je provjeren na udžbeničkim strujanjima (kanal, zatvorena kutija s pomičnim poklopcem) i pokrenut na kocki da se vidi da su trag iza i ubrzanje na uglovima ispravni. **Nije** provjeren u odnosu na mjerenja u aerotunelu na zgradama, pa je svaki rezultat označen kao nepotvrđen. Nemojte ga koristiti za projektnu vrijednost, opterećenje od vjetra ili dozvolu za izgradnju: inženjer za vjetar mora pokrenuti i potvrditi pravu studiju. Ravan teren, glatki zidovi zgrada, prečica hrapavosti meteo stanice i tabela pragova su pojednostavljenja; pragovi se mogu razlikovati u kriterijumima vaše nadležne službe.

## Vjetar s OpenFOAM-om (dodatak)

Ugrađeni motor za vjetar iznad je eksperimentalan. Za pravi solver strujanja uključite dodatak **Pješački vjetar (OpenFOAM)** u **Postavke > Dodaci** (isključen je dok ga ne uključite). To je softver pod GPL licencom, zaseban od ostatka CadCraft-a, i ne uključuje OpenFOAM: njega sami instalirate. Zatim **Motor** u bloku vjetra navodi OpenFOAM.

Šta podešavate, jednom:
1. **Instalirajte OpenFOAM** (ESI v-serija s openfoam.com; dodatak je testiran s v2512). Na Ubuntu ili Debian (također unutar WSL-a na Windowsu): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, zatim `sudo apt install openfoam2512-default`. Instalira se pod `/usr/lib/openfoam/openfoam2512`. CadCraft treba `blockMesh`, `snappyHexMesh` i `simpleFoam` da bi radio. (Stariji paket `openfoam` 1912 iz Ubuntu arhive također radi, ali njegove funkcijske objekte ruše; tada dodatak sam čita datoteke rezultata.)
2. **Pokrenite pomoćnika** iz fascikle `runner` dodatka pomoću Node.js: `node cc-openfoam-runner.mjs serve`. Ako OpenFOAM nije na putanji za pretragu, dajte mu mali `runner.json` s putanjom do OpenFOAM-ove `etc/bashrc` datoteke (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) i pokrenite ga s `--config runner.json`. Pomoćnik sluša samo na ovom računaru i ispisuje token.
3. **Nalijepite token** u polja dodatka u bloku vjetra (adresa ostaje `http://127.0.0.1:8765`) i pritisnite **Provjeri pomoćnika**.

Zatim **Pokreni studiju vjetra** radi jedan slučaj po smjeru vjetra u meteo datoteci: vaše mase postaju površina (STL) u kutiji veličine prema uobičajenoj smjernici (5 visina zgrada unaokolo i naviše, 10 iza), mreži blockMesh i snappyHexMesh, pokreće se kao stacionarni k-epsilon RANS s ulazom atmosferskog graničnog sloja preko odabrane hrapavosti, a brzina na 1.5 m se čita i pretvara u iste Lawson i NEN 8100 klase. Ništa ne napušta vaš računar.

**Šta je provjereno.** Tekst iznad rezultata to kaže otvoreno i dio je svakog sačuvanog CSV-a. Pisanje slučaja dodatka, čitanje rezultata i cijeli tok testirani su bez OpenFOAM-a, a jedna kocka je pokrenuta kroz pravi OpenFOAM na tri veličine mreže (brojevi su u bilješkama projekta). Nije provjereno u odnosu na mjerenja u aerotunelu na zgradama. To je orijentaciono očitavanje, a ne projektna vrijednost niti potvrda. Standardni k-epsilon previsoko procjenjuje turbulenciju ispred zgrada, teren je ravan, zidovi glatki i nema terena ni vegetacije.
