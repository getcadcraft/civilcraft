---
title: Senca, sončni donos in udobje na prostem
summary: Preučite senco, ki jo vaše mase metajo čez dan ali sezono, si oglejte njeno animacijo, izračunajte, koliko električne energije bi sončne plošče na strehah in stenah naredile v tipičnem letu, preverite, kako udobna je ulica ob stavbi (UTCI), in dobite orientacijsko oceno udobja vetra za pešce.
keywords: študija sence, senca, sončne ure, animacija, sončna energija, PV, fotonapetostni, plošče, donos, kWh, EPW, vremenska datoteka, UTCI, toplotno udobje, udobje na prostem, toplotna obremenitev, veter
from: 96e7af4d
---

Razdelek **Okolje** je pod **Sončne ure** v **Lastnostih** mase. Kot stavbe uporablja mase, ki ste jih narisali.

## Naložite vremensko datoteko

Izberite vremensko datoteko za tipično leto (**.epw**) za vaše mesto. Brezplačne so na spletnem mestu EnergyPlus Weather in na climate.onebuilding.org. Datoteka ostane v vašem brskalniku za ta obisk. Sončni donos in študija udobja jo potrebujeta; študija sence brez nje deluje, kadar ima projekt koordinatni sistem.

## Študija sence

Izberite datum (ali označite **Sezona** ter zadnji datum in korak v dnevih) in časovni pas, nato **Zaženi študijo sence**. Dobite zemljevid ur sonca ali sence na tleh okoli mas; tabelo, kako velik delež tal je v senci čez dan; in animacijo dneva, ki jo lahko predvajate ali korak za korakom pregledujete. **Shrani zemljevid**, **Shrani sličice animacije** (vse sličice na eni sliki) in **Shrani ure** (CSV) hranijo rezultate.

Tla so obravnavana kot ravna na višini najnižje mase. Za senco na nagnjenem terenu uporabite **Sončne ure**, ki prebere teren.

## Sončni donos

Nastavite učinkovitost plošč, koliko vsake strehe in stene je pokrito, in izgube sistema, nato **Zaženi sončni donos**. Za vsako streho in steno dobite električno energijo, ki bi jo en kvadratni meter plošče naredil v tipičnem letu, koliko je odvzamejo sosednje mase, in skupno vrednost za vsako maso. Model je z navadnimi besedami zapisan ob gumbu: gre za načrtovalno oceno iz tipičnega leta, ne za zagotovilo.

## Udobje na prostem

**Zaženi študijo udobja** izračuna Univerzalni toplotno-klimatski indeks (UTCI) za stoječo osebo na odprtem terenu in ob prvi masi (južna, severna, vzhodna in zahodna stran), s senco vsake mase. Prikaže, kako veliko neba je vidno, povprečni dnevni UTCI ter ure nad 32 (toplotna obremenitev) in pod 0 (mrazna obremenitev).

## Veter (orientacijsko)

**Zaženi študijo vetra** reši tok zraka okoli vaših mas enkrat za vsako smer vetra, ki piha v vaši vremenski datoteki (4, 8, 12 ali 16 smeri), v okolici, ki jo izberete (odprta pokrajina, predmestje ali središče mesta), nato sešteje urni veter celega leta. Zemljevid barva tla po razredu udobja, od zelene (**sedenje**) prek **stoje**, **sprehajanje** in **hoja** do rdeče (**neudobno**): dejavnost, katere mejna hitrost (4, 6, 8 in 10 m/s) je presežena največ pri 5 % ur. Druga tabela poda razred NEN 8100 (A do E) iz deleža ur, ko veter preseže 5 m/s. Faktor sunkov pomnoži urno povprečje, da dobimo učinkovit sunek.

Kako deluje, z navadnimi besedami: reševalnik tokov z metodo mreže Boltzmann in velikimi vrtinci (naš lasten, v knjižnici `lib/wind`) v škatli okoli stavb, profil hitrosti vetra, ki z višino raste glede na izbrano hrapavost, in hitrost približno 1.5 m nad tlemi v primerjavi s hitrostjo navzgor pri 10 m. **Orientacijsko** je hitro in grobo; **Standardno** uporablja več celic in traja veliko dlje. Če plošča pove, da je mreža groba (manj kot 10 celic čez najvišjo stavbo) ali da se je tok še spreminjal, zemljevidu manj verjemite.

**Česa to ni.** Reševalnik je bil preverjen na učbeniških tokovih (kanal, zaprta votlina, gnana s pokrovom) in zagnan na kocki, da se je videlo, da sled in pospešitev hitrosti v vogalih izgledata pravilno. **Ni** bil potrjen z meritvami stavb v vetrovnem tunelu, zato je vsak rezultat označen kot nepotrjen. Ne uporabljajte ga za projektno vrednost, obremenitev vetra ali načrtovalno potrdilo: ustrezno študijo mora izvesti in potrditi inženir za veter. Ravna tla, gladke stene stavb, bližnjica hrapavosti vremenske postaje in tabela pragov so poenostavitve; pragovi se lahko razlikujejo od meril, ki jih uporablja vaš pristojni organ.

## Veter z OpenFOAM (dodatek)

Zgoraj opisani vgrajeni motor za veter je eksperimentalen. Za pravi reševalnik tokov vklopite dodatek **Veter za pešce (OpenFOAM)** v **Nastavitve > Dodatki** (dokler ga ne vklopite, je izklopljen). Gre za programsko opremo z lastno licenco GPL, ločeno od preostalega dela CadCraft, in ne vključuje programa OpenFOAM: tega namestite sami. Nato **Motor** v bloku za veter našteje OpenFOAM.

Kar nastavite enkrat:
1. **Namestite OpenFOAM** (serija ESI v, z openfoam.com; dodatek je preizkušen z v2512). Na Ubuntu ali Debianu (tudi v WSL v sistemu Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, nato `sudo apt install openfoam2512-default`. Namesti se v `/usr/lib/openfoam/openfoam2512`. CadCraft za delovanje potrebuje `blockMesh`, `snappyHexMesh` in `simpleFoam`. (Starejši paket `openfoam` 1912 v lastnem arhivu Ubuntu deluje prav tako, vendar se njegovi funkcijski objekti zrušijo; dodatek potem sam bere datoteke z rezultati.)
2. **Zaženite pomočnika** iz mape `runner` dodatka z Node.js: `node cc-openfoam-runner.mjs serve`. Če OpenFOAM ni v iskalni poti, mu dajte majhno datoteko `runner.json` s potjo do `etc/bashrc` programa OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) in ga zaženite z `--config runner.json`. Pomočnik posluša samo na tem računalniku in izpiše žeton.
3. **Prilepite žeton** v polja dodatka v bloku za veter (naslov ostane `http://127.0.0.1:8765`) in pritisnite **Preveri pomočnika**.

Nato **Zaženi študijo vetra** izdela en primer za vsako smer vetra v vremenski datoteki: vaše mase postanejo površje (STL) v škatli, velikosti po običajnem vodilu (5 višin stavb naokoli in nad, 10 za njo), mreženo z blockMesh in snappyHexMesh, zagnano kot stacionarni RANS k-epsilon z vstopom v atmosfersko mejno plast nad izbrano hrapavostjo; hitrost pri 1.5 m se prebere nazaj in pretvori v enake razrede Lawson in NEN 8100. Nič ne zapusti vašega računalnika.

**Kaj je bilo preverjeno.** Besedilo nad rezultati to pove jasno in je del vsaka shranjene datoteke CSV. Zapisovanje primerov dodatka, branje rezultatov in celoten potek so preizkušeni brez programa OpenFOAM, ena kocka pa je bila zagnana z dejanskim programom OpenFOAM pri treh velikostih mreže (številke so v projektnih opombah). **Ni** bil potrjen z meritvami stavb v vetrovnem tunelu. Gre za orientacijsko oceno, ne za projektno vrednost in ne za potrdilo. Standardni k-epsilon preceni turbulenco pred stavbami, tla so ravna, stene gladke in ni reliefa ali rastlinja.
