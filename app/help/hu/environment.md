---
title: Árnyék, napenergia-hozam és szabadtéri komfort
summary: Vizsgálja meg, milyen árnyékot vetnek a tömegei egy napon vagy egy szezonon át, nézze meg az árnyékmozgás animációját, számolja ki, mennyi áramot termelnének a tetőkön és falakon lévő napelemek egy tipikus évben, nézze meg, mennyire kellemes az épület melletti utca (UTCI), és kapjon becslést a gyalogosok szélkomfortjáról.
keywords: árnyékvizsgálat, árnyék, napórák, animáció, nap, PV, fotovoltaikus, panelek, hozam, kWh, EPW, időjárási fájl, UTCI, hőérzeti komfort, szabadtéri komfort, hőstressz, szél
from: 96e7af4d
---

A **Környezet** szakasz a tömeg **Tulajdonságok** paneljén a **Napórák** alatt található. Az Ön által rajzolt tömegeket használja épületként.

## Időjárási fájl betöltése

Válasszon egy tipikus éves időjárási fájlt (**.epw**) a városához. Ezek ingyenesen letölthetők az EnergyPlus időjárási oldaláról és a climate.onebuilding.org oldalról. A fájl a látogatás idejére a böngészőben marad. A napenergia-hozamhoz és a komfortvizsgálathoz szükséges; az árnyékvizsgálat fájl nélkül is működik, ha a projektnek van koordinátarendszere.

## Árnyékvizsgálat

Válasszon dátumot (vagy jelölje be a **Szezon** opciót, és adjon meg egy utolsó dátumot és lépésközt napokban), majd egy időzónát, és kattintson az **Árnyékvizsgálat futtatása** gombra. Kap egy térképet a napos vagy árnyékos órákról a tömegek körüli talajon; táblázatot arról, hogy a talaj mekkora része árnyékolt a nap folyamán; és a napról készült animációt, amelyet lejátszhat vagy képkockánként léptethet. A **Térkép mentése**, az **Animációs képkockák mentése** (az összes képkocka egy képen) és az **Órák mentése** (CSV) megőrzi az eredményeket.

A talajt vízszintesnek vesszük, a legalacsonyabb tömeg szintjén. Lejtős terepen az árnyékhoz használja a **Napórák** funkciót, amely a terepet is beolvassa.

## Napenergia-hozam

Állítsa be a panelek hatásfokát, azt, hogy az egyes tetők és falak mekkora része van fedve, és a rendszer veszteségeit, majd kattintson a **Napenergia-hozam futtatása** gombra. Minden tetőre és falra megkapja, mennyi áramot termelne egy négyzetméternyi panel egy tipikus évben, azt, hogy a szomszédos tömegek mennyit vesznek el ebből, valamint az egyes tömegek összesítését. A modell egyszerű szavakkal, a gomb mellett van leírva: ez tervezési becslés egy tipikus évből, nem garancia.

## Szabadtéri komfort

A **Komfort futtatása** kiszámítja az egyetemes hőérzeti indexet (UTCI) egy álló személy számára nyílt terepen és az első tömeg mellett (déli, északi, keleti és nyugati oldalon), minden tömeg árnyékával együtt. Megmutatja, mennyi égboltot látni, a nappali átlagos UTCI-t, valamint azoknak az óráknak a számát, amikor az érték 32 fölött (hőstressz), illetve 0 alatt (hidegstressz) van.

## Szél (becslés)

A **Szélvizsgálat futtatása** egyszer megoldja a levegő áramlását a tömegei körül, minden olyan szélirányra, amely az időjárási fájlban fúj (4, 8, 12 vagy 16 irány), a kiválasztott környezetre (nyílt terep, külváros vagy belváros), majd összegzi az egész év óránkénti szelét. A térkép a talajt komfortosztály szerint színezi: a zöldtől (**ülés**) indulva az **állás**, a **sétálás** és a **gyaloglás** szintjein át a pirosig (**kényelmetlen**): az a tevékenység, amelynek határsebességét (4, 6, 8 és 10 m/s) az órák legfeljebb 5%-ában haladja meg a szél. Egy második táblázat a NEN 8100 osztályt (A–E) adja meg aszerint, hogy az órák hány százalékában haladja meg a szél az 5 m/s-ot. A lökésfaktor az óránkénti átlagot szorozza meg, hogy hatásos lökést kapjunk.

Egyszerű szavakkal így működik: egy rácsos, Boltzmann-módszerű, nagy örvényű (LES) áramlási megoldó (saját fejlesztés, a `lib/wind` könyvtárban) fut az épületek körüli dobozban, a szélsebesség-profil a kiválasztott érdesség szerint nő a magassággal, és a talaj fölött kb. 1,5 m-en mért szélsebességet az áramlás előtti, 10 m-es szélsebességgel hasonlítjuk össze. A **Becslés** gyors és durva; a **Szabvány** több cellát használ, és sokkal tovább fut. Ha a panel azt mondja, hogy a rács durva (a legmagasabb épület fölött 10-nél kevesebb cella), vagy az áramlás még változott, kevésbé higgyen a térképnek.

**Mi ez nem.** A megoldót ismert példaáramlásokon (csatorna, fedett üreg) ellenőrizték, és egy kockán futtatták, hogy a mögötte kialakuló örvény és a sarkoknál fellépő gyorsulás helyesnek tűnjön. Épületekre vonatkozó szélcsatorna-mérésekkel **nem** lett validálva, ezért minden eredmény validálatlanként van feltüntetve. Ne használja tervezési értékként, szélterhelésként vagy engedélyezési tanúsítványként: a megfelelő vizsgálatot szélmérnöknek kell elvégeznie és megerősítenie. A sík talaj, a sima épületfalak, az időjárásállomás érdességének egyszerűsített használata és a küszöbértékek táblázata egyszerűsítések; a küszöbértékek eltérhetnek az Ön hatóságának kritériumaitól.

## Szél OpenFOAM-mal (bővítmény)

A beépített szélmotor, amelyről fent szó volt, kísérleti. Egy megfelelő áramlási megoldóhoz kapcsolja be a **Gyalogos szél (OpenFOAM)** bővítményt a **Beállítások > Bővítmények** alatt (amíg nem kapcsolja be, ki van kapcsolva). Ez saját, GPL-licencű szoftver, amely el van választva a CadCraft többi részétől, és nem tartalmazza az OpenFOAM-ot: azt Önnek kell telepítenie. Ezután a szélblokk **Motor** lehetősége az OpenFOAM-ot listázza.

Egyszer kell beállítani:

1. **OpenFOAM telepítése** (az openfoam.com-ról származó ESI v-sorozat; a bővítményt a v2512-vel teszteltük). Ubuntun vagy Debianon (a Windows alatti WSL-ben is): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, majd `sudo apt install openfoam2512-default`. Ez a `/usr/lib/openfoam/openfoam2512` alá települ. A CadCraftnak a futtatáshoz a `blockMesh`, a `snappyHexMesh` és a `simpleFoam` szükséges. (Az Ubuntu saját archívumában lévő, régebbi `openfoam` 1912 csomag is működik, de a függvényobjektumai összeomlanak; ilyenkor a bővítmény maga olvassa be az eredményfájlokat.)
2. **A segédprogram indítása** a bővítmény `runner` mappájából Node.js-szel: `node cc-openfoam-runner.mjs serve`. Ha az OpenFOAM nincs a keresési útvonalon, adjon meg egy kis `runner.json` fájlt az OpenFOAM `etc/bashrc` elérési útjával (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`), és indítsa `--config runner.json` kapcsolóval. A segédprogram csak ezen a számítógépen figyel, és kiír egy tokent.
3. **Illessze be a tokent** a bővítmény mezőibe a szélblokkban (a cím marad `http://127.0.0.1:8765`), majd nyomja meg a **Segédprogram ellenőrzése** gombot.

Ezután a **Szélvizsgálat futtatása** szélirányonként egy esetet futtat az időjárási fájlban szereplő szelekre. Az épületei felületként (STL) egy dobozba kerülnek, amelynek méretét a szokásos irányelv adja meg (5 épületmagasságnyi távolság körben és fölötte, 10 mögötte), blockMesh és snappyHexMesh hálóval, állandósult k-epsilon RANS-modellként futtatva, légköri határrétegű bemenettel, az Ön által választott érdességgel. Az 1,5 m-es szélsebességet visszaolvassa, és ugyanazokba a Lawson- és NEN 8100-osztályokba sorolja. Semmi nem hagyja el a számítógépet.

**Mi lett ellenőrizve.** A fenti szöveg ezt az eredmények fölött egyenesen kimondja, és minden mentett CSV része. A bővítmény esetleírása, az eredmények olvasása és a teljes folyamat OpenFOAM nélkül is tesztelve van; egy kockát pedig valódi OpenFOAM-mal három hálóméreten futtattunk (a számok a projektjegyzetekben vannak). Épületekre vonatkozó szélcsatorna-mérésekkel **nem** lett validálva. Becslés, nem tervezési érték és nem tanúsítvány. A standard k-epsilon túlbecsüli a turbulenciát az épületek előtt, a talaj sík, a falak simák, és nincs terep vagy növényzet.
