---
title: Varjud, päikeseenergia saagis ja välismugavus
summary: Uuri, milline vari su hoonemahud heidavad päeva või hooaja jooksul, vaata selle animatsiooni, arvuta, kui palju elektrit päikesepaneelid katustel ja seintel tüüpilisel aastal teeksid, vaata, kui mugav on hoone kõrval olev tänav (UTCI), ning saa tuule mugavuse orienteeruv hinnang jalakäijatele.
keywords: varjustuudium, vari, päikesetunnid, animatsioon, päike, PV, fotogalvaanika, paneelid, saagis, kWh, EPW, ilmafail, UTCI, soojusmugavus, välismugavus, kuumastress, tuul
from: 96e7af4d
---

Jaotis **Keskkond** asub mahu **Omaduste** all, **Päikesetundide** all. See kasutab hoonetena sinu joonistatud mahte.

## Laadi ilmafail

Vali oma linna jaoks tüüpilise aasta ilmafail (**.epw**). Need on tasuta EnergyPlus’i ilmalehelt ja climate.onebuilding.org-ilt. Fail jääb selle külastuse ajaks sinu brauserisse. Päikeseenergia saagis ja mugavusuuring vajavad seda; varjustuudium töötab ilma selleta, kui projektil on koordinaatsüsteem.

## Varjustuudium

Vali kuupäev (või märgi **Hooaeg** ning viimane kuupäev ja samm päevades) ja ajavöönd ning seejärel **Käivita varjustuudium**. Saad kaardi päikese- või varjutundidest maapinnal hoonemahtude ümber, tabeli, kui suur osa maapinnast on päeva jooksul varjus, ja päeva animatsiooni, mida saad mängida või samm-sammult läbi käia. **Salvesta kaart**, **Salvesta animatsiooni kaadrid** (kõik kaadrid ühel pildil) ja **Salvesta tunnid** (CSV) hoiavad tulemused alles.

Maapinda loetakse tasaseks madalaima mahu tasemel. Kaldus maapinna varju jaoks kasuta **Päikesetunde**, mis loeb maastikku.

## Päikeseenergia saagis

Sea paneeli kasutegur, kui suur osa igast katusest ja seinast on kaetud ning süsteemi kaod, seejärel **Käivita päikeseenergia saagis**. Iga katuse ja seina kohta saad elektrienergia, mida ruutmeeter paneeli teeks tüüpilisel aastal, kui palju seda võtavad ära naaberhooned ning kogusumma iga mahu kohta. Mudel on nupu kõrval selges keeles kirjeldatud: see on planeerimishinnang tüüpilisest aastast, mitte garantii.

## Välismugavus

**Käivita mugavus** arvutab universaalse termilise kliimaindeksi (UTCI) seisvale inimesele avatud maal ja esimese mahu kõrval (lõuna-, põhja-, ida- ja läänepoolsel küljel), arvestades iga mahu varju. Näidatakse, kui palju taevast on näha, päevane keskmine UTCI ning tundide arv, kui see on üle 32 (kuumastress) ja alla 0 (külmastress).

## Tuul (orienteeruv)

**Käivita tuuleuuring** arvutab õhuvoo su mahtude ümber ühe korra iga tuulesuuna jaoks, mis puhub su ilmafailis (4, 8, 12 või 16 suunda), valitud ümbruse jaoks (avamaa, eeslinn või kesklinn), ning liidab kokku terve aasta tunnipõhise tuule. Kaart värvib maapinna mugavusklassi järgi rohelisest (**istumine**) läbi **seismise**, **jalutamise** ja **kõndimise** punaseni (**ebamugav**): tegevus, mille piirkiirust (4, 6, 8 ja 10 m/s) ületatakse kuni 5 % tundidest. Teine tabel annab NEN 8100 klassi (A kuni E) selle järgi, kui suur osa tundidest tuul ületab 5 m/s. Puhangutegur korrutab tunnikeskmise, et saada efektiivne puhang.

Lihtsalt öeldes: lattice-Boltzmanni suurte pöörisevoogude lahendaja (meie oma, teegis `lib/wind`) hoonete ümbritsevas kastis, tuulekiiruse profiil, mis tõuseb kõrgusega valitud karedusel, ning kiirus umbes 1.5 m kõrgusel maapinnast võrreldes kiirusega 10 m kõrgusel ülesvoolu. **Orienteeruv** on kiire ja jäme; **Standardne** kasutab rohkem lahtreid ja töötab palju kauem. Kui paneel ütleb, et ruudustik on jäme (alla 10 lahtri kõige kõrgema hoone kohta) või et voog veel muutus, usu kaarti vähem.

**Mis see ei ole.** Lahendaja on kontrollitud õpikuvoogudel (kanal, kaanega õõnsus) ja käivitatud kuubil, et näha, kas järelvool ja nurkade kiirenemine on õiged. Seda **ei ole** valideeritud hoonete tuulekanali mõõtmistega, seega on iga tulemus märgitud valideerimata. Ära kasuta seda projekteerimisväärtusena, tuulekoormusena ega planeerimisloana: tuuleinsener peab korraliku uuringu läbi viima ja kinnitama. Tasane maapind, siledad hoonete seinad, ilmajaama karedusõige ja läviväärtuste tabel on lihtsustused; läved võivad sinu asutuse kriteeriumides erineda.

## Tuul OpenFOAM-iga (lisandmoodul)

Eespool kirjeldatud sisseehitatud tuulemootor on katseline. Korraliku voolulahendaja jaoks lülita sisse lisandmoodul **Jalakäijate tuul (OpenFOAM)** jaotises **Sätted > Lisandmoodulid** (see on väljas, kuni sa seda sisse ei lülita). See on oma GPL-litsentsiga tarkvara, hoitud CadCrafti ülejäänust eraldi, ega sisalda OpenFOAM-i: selle paigaldad ise. Seejärel loetleb tuuleplokis **Mootor** OpenFOAM-i.

Ühekordselt seadistad:
1. **Paigalda OpenFOAM** (ESI v-seeria openfoam.com-ist; lisandmoodul on testitud versiooniga v2512). Ubuntu või Debian (ka Windowsi WSL-is): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, seejärel `sudo apt install openfoam2512-default`. See paigaldub kausta `/usr/lib/openfoam/openfoam2512`. CadCraft vajab töötamiseks `blockMesh`, `snappyHexMesh` ja `simpleFoam`-i. (Vanem `openfoam` 1912 pakk Ubuntu enda arhiivis töötab samuti, kuid selle funktsiooniobjektid kukuvad kokku; siis loeb lisandmoodul tulemusfailid ise.)
2. **Käivita abiline** lisandmooduli kaustast `runner` Node.js-iga: `node cc-openfoam-runner.mjs serve`. Kui OpenFOAM pole otsingutees, anna väike `runner.json` koos tee OpenFOAM-i `etc/bashrc`-ni (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) ja käivita see valikuga `--config runner.json`. Abiline kuulab ainult seda arvutit ja prindib žetooni.
3. **Kleebi žetoon** lisandmooduli väljadesse tuuleplokis (aadress jääb `http://127.0.0.1:8765`) ja vajuta **Kontrolli abilist**.

Seejärel töötab **Käivita tuuleuuring** ühe juhuna iga tuulesuuna kohta ilmafailis: su mahud muutuvad pinnaks (STL) kastis, mille suurus on tavapärase juhise järgi (5 hoone kõrgust ümber ja üle, 10 taga), võrgustatakse blockMeshi ja snappyHexMeshiga, käitatakse püsiva k-epsilon RANS-ina atmosfäärse piirkihi sisendiga valitud karedusel ning kiirus 1.5 m kõrgusel loetakse tagasi ja muudetakse samadeks Lawsoni ja NEN 8100 klassideks. Midagi ei lahku sinu arvutist.

**Mida on kontrollitud.** Eespool olev tekst tulemuste kohal ütleb seda selgelt ja on osa igast salvestatud CSV-st. Lisandmooduli juhtumi kirjutamine, tulemuste lugemine ja terve ahel on testitud ilma OpenFOAM-ita ning üks kuup on jooksutatud päris OpenFOAM-iga kolmel võrgusuurusel (arvud on projekti märkmetes). Seda **ei ole** valideeritud hoonete tuulekanali mõõtmistega. See on orienteeruv hinnang, mitte projekteerimisväärtus ega sertifikaat. Standardne k-epsilon ülehindab turbulentsi hoonete ees, maapind on tasane, seinad on siledad ning maastikku ega taimestikku ei ole.
