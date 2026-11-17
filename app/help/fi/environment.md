---
title: Varjo, aurinkotuotto ja ulkoilman mukavuus
summary: Tutki rakennusmassojesi heittämää varjoa päivän tai kauden yli, katso sen animaatio, laske kuinka paljon sähköä talojen katoille ja seinille asennetut aurinkopaneelit tuottaisivat tyypillisenä vuotena, katso kuinka mukava rakennuksen vieressä oleva katu on (UTCI) ja saa karkea arvio jalankulkijoiden tuulimukavuudesta.
keywords: varjotutkimus, varjo, auringon tunnit, animaatio, aurinko, PV, aurinkosähkö, paneelit, tuotto, kWh, EPW, säätiedosto, UTCI, lämpömukavuus, ulkomukavuus, lämpörasitus, tuuli
from: 96e7af4d
---

**Ympäristö**-osio on massan **Ominaisuudet**-paneelissa kohdan **Auringon tunnit** alla. Se käyttää piirtämiäsi massoja rakennuksina.

## Lataa säätiedosto

Valitse kaupunkisi tyypillisen vuoden säätiedosto (**.epw**). Niitä saa ilmaiseksi EnergyPlus-säätietopalvelusta ja sivustolta climate.onebuilding.org. Tiedosto pysyy selaimessasi tämän käynnin ajan. Aurinkotuotto ja mukavuustutkimus tarvitsevat sen; varjotutkimus toimii ilman sitä, kun projektilla on koordinaattijärjestelmä.

## Varjotutkimus

Valitse päivä (tai ruksi **Kausi** sekä viimeinen päivä ja askel päivinä) ja aikavyöhyke, sitten napsauta **Suorita varjotutkimus**. Saat kartan auringon tai varjon tunneista massojen ympärillä olevalla maalla; taulukon siitä, kuinka suuri osa maasta on varjossa päivän aikana; ja päivän animaation, jota voit toistaa tai selata askel kerrallaan. **Tallenna kartta**, **Tallenna animaation kehykset** (kaikki kehykset yhdessä kuvassa) ja **Tallenna tunnit** (CSV) säilyttävät tulokset.

Maa oletetaan tasaiseksi matalimman massan tasolla. Rinteisen maan varjoa varten käytä **Auringon tunnit** -toimintoa, joka lukee maaston.

## Aurinkotuotto

Aseta paneelin hyötysuhde, kuinka suuri osa kustakin katosta ja seinästä on peitetty, ja järjestelmän häviöt, sitten napsauta **Suorita aurinkotuotto**. Jokaiselle katolle ja seinälle saat sähkön, jonka neliömetri paneelia tuottaisi tyypillisenä vuotena, kuinka paljon siitä naapurimassat vievät, ja kokonaissumman kullekin massalle. Malli on kirjoitettu selkokielellä painikkeen viereen: se on suunnittelun arvio tyypillisestä vuodesta, ei takuu.

## Ulkoilman mukavuus

**Suorita mukavuus** laskee universaalin lämpöilmastoindeksin (UTCI) seisovalle ihmiselle avoimella maalla ja ensimmäisen massan vieressä (etelä-, pohjois-, itä- ja länsipuolella), kunkin massan varjon kanssa. Se näyttää, kuinka paljon taivasta näkyy, päiväajan keskimääräisen UTCI:n sekä tunnit yli 32 (lämpörasitus) ja alle 0 (kylmärasitus).

## Tuuli (seulonta)

**Suorita tuulitutkimus** ratkaisee ilmavirran massojesi ympärillä kerran jokaiselle tuulensuunnalle, joka puhaltaa säätiedostossasi (4, 8, 12 tai 16 suuntaa), valitsemiesi ympäristöjen (avoin maa, lähiö tai kaupungin keskusta) ympärillä, ja laskee yhteen koko vuoden tuntikohtaisen tuulen. Kartta värittää maan mukavuusluokan mukaan, vihreästä (**istuminen**) kautta **seisominen**, **kävely** ja **nopea kävely** punaiseen (**epämukava**): aktiviteetti, jonka raja-nopeus (4, 6, 8 ja 10 m/s) ylittyy enintään 5 %:ssa tunneista. Toinen taulukko antaa NEN 8100 -luokan (A–E) sen mukaan, kuinka suuren osan tunneista tuuli ylittää 5 m/s. Puuskakerroin kertoo tuntikeskiarvon tehollisen puuskan saamiseksi.

Miten se toimii, selkokielellä: hila-Boltzmann-suurten pyörteiden virtausratkaisija (oma, kirjastossa `lib/wind`) massojen ympärillä olevassa laatikossa, tuulennopeusprofiili, joka kasvaa korkeuden mukana valitun karheuden mukaan, ja nopeus noin 1.5 m maanpinnan yläpuolella verrattuna virtausnopeuteen 10 m:ssä. **Seulonta** on nopea ja karkea; **Standardi** käyttää enemmän soluja ja kestää paljon kauemmin. Jos paneeli sanoo ruudukon olevan karkea (alle 10 solua korkeimman rakennuksen yllä) tai virtauksen yhä muuttuvan, luota karttaan vähemmän.

**Tämä ei ole.** Ratkaisija on tarkistettu oppikirjavirtauksilla (kanava, kansikaviteetti) ja ajettu kuutiolla, jotta nähdään, että perä ja nopeuden kiihtyminen kulmissa näyttävät oikeilta. Sitä **ei** ole validoitu rakennusten tuulitunnelimittauksia vasten, joten jokainen tulos on merkitty validoimattomaksi. Älä käytä sitä suunnitteluarvona, tuulikuormana tai kaavalupatodistuksena: tuulitekniikan asiantuntijan on ajettava ja vahvistettava kunnollinen tutkimus. Tasainen maa, sileät rakennusseinät, sääaseman karheusoikotie ja kynnysarvotaulukko ovat yksinkertaistuksia; kynnysarvot voivat erota viranomaisesi käyttämistä kriteereistä.

## Tuuli OpenFOAMilla (lisäosa)

Yllä oleva sisäänrakennettu tuulimoottori on kokeellinen. Kunnollista virtausratkaisijaa varten kytke päälle **Jalankulkijatuuli (OpenFOAM)** -lisäosa kohdassa **Asetukset > Lisäosat** (se on pois päältä, kunnes teet niin). Se on oma GPL-lisensoitu ohjelmistonsa, pidetty erillään CadCraftin muusta osasta, eikä se sisällä OpenFOAMia: asennat sen itse. Sitten tuulilohkon **Moottori** listaa OpenFOAMin.

Mitä asetat kerran:
1. **Asenna OpenFOAM** (ESI:n v-sarja osoitteesta openfoam.com; lisäosa on testattu versiolla v2512). Ubuntulla tai Debianilla (myös WSL:ssä Windowsilla): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, sitten `sudo apt install openfoam2512-default`. Se asentuu polkuun `/usr/lib/openfoam/openfoam2512`. CadCraft tarvitsee `blockMesh`-, `snappyHexMesh`- ja `simpleFoam`-ohjelmat toimiakseen. (Vanhempi `openfoam` 1912 -paketti Ubuntun omasta arkistosta toimii myös, mutta sen funktio-oliot kaatuvat; lisäosa lukee silloin tulostiedostot itse.)
2. **Käynnistä apuohjelma** lisäosan `runner`-kansiosta Node.js:llä: `node cc-openfoam-runner.mjs serve`. Jos OpenFOAM ei ole hakupolulla, anna pieni `runner.json` polulla OpenFOAMin `etc/bashrc`-tiedostoon (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) ja käynnistä se komennolla `--config runner.json`. Apuohjelma kuuntelee vain tällä tietokoneella ja tulostaa tunnuksen.
3. **Liitä tunnus** lisäosan kenttiin tuulilohkossa (osoite pysyy `http://127.0.0.1:8765`) ja napsauta **Tarkista apuohjelma**.

Sitten **Suorita tuulitutkimus** tekee yhden tapauksen tuulensuuntaa kohden säätiedostossa: massasi muuttuvat pinnaksi (STL) laatikkoon, jonka koko on tavallisen ohjeen mukainen (5 rakennuskorkeutta ympäri ja ylöspäin, 10 taakse), verkotetaan blockMeshillä ja snappyHexMeshillä, ajetaan stationäärisenä k-epsilon RANS:ina ilmakehän rajakerrossyötöllä valitsemasi karheuden yli, ja nopeus 1.5 m:n korkeudella luetaan takaisin ja muunnetaan samoiksi Lawsonin ja NEN 8100 -luokiksi. Mitään ei lähde tietokoneeltasi.

**Mitä on tarkistettu.** Tulosten yllä oleva teksti sanoo sen suoraan ja on osa jokaista tallennettua CSV-tiedostoa. Lisäosan tapauksen kirjoitus, tulosten luku ja koko putki on testattu ilman OpenFOAMia, ja yksi kuutio on ajettu oikealla OpenFOAMilla kolmella verkon koolla (luvut ovat projektin muistiinpanoissa). Sitä **ei** ole validoitu rakennusten tuulitunnelimittauksia vasten. Se on seulontalukema, ei suunnitteluarvo eikä todistus. Vakio k-epsilon yliarvioi turbulenssin rakennusten edessä, maa on tasainen, seinät ovat sileitä, eikä maastoa tai kasvillisuutta ole.
