---
title: Skygge, solenergi og utendørs komfort
summary: Studer skyggen massene dine kaster over en dag eller en sesong, se en animasjon av den, beregn hvor mye strøm solcellepaneler på tak og vegger ville gi i et typisk år, se hvor komfortabel gaten ved siden av en bygning er (UTCI), og få en veiledende avlesning av vindkomfort for fotgjengere.
keywords: skyggestudie, skygge, soltimer, animasjon, sol, PV, solceller, paneler, avkastning, kWh, EPW, værfil, UTCI, termisk komfort, utendørs komfort, varmestress, vind
from: 96e7af4d
---

Seksjonen **Miljø** ligger under **Soltimer** i en masses **Egenskaper**. Den bruker massene som er tegnet som bygninger.

## Last inn en værfil

Velg en værfil for et typisk år (**.epw**) for stedet. De fås gratis fra EnergyPlus-nettstedet og fra climate.onebuilding.org. Filen blir i nettleseren for dette besøket. Studien av solenergi og komfort trenger den; skyggestudien fungerer uten den når prosjektet har et koordinatsystem.

## Skyggestudie

Velg en dato (eller kryss av **Sesong** og en siste dato og et steg i dager) og en tidssone, og klikk **Kjør skyggestudie**. Resultatet er et kart over soltimene, eller skyggetimene, på bakken rundt massene; en tabell over hvor mye av bakken som er i skygge gjennom dagen; og en animasjon av dagen som kan spilles av eller gjennomgås steg for steg. **Lagre kart**, **Lagre animasjonsbilder** (alle bildene på ett bilde) og **Lagre timer** (CSV) tar vare på resultatene.

Bakken regnes som flat på nivå med den laveste massen. For skygge på skrånende terreng brukes **Soltimer**, som leser terrenget.

## Solenergi

Angi panelets virkningsgrad, hvor mye av hvert tak og hver vegg som dekkes, og systemtapene, og klikk **Kjør solenergi**. For hvert tak og hver vegg vises strømmen én kvadratmeter panel ville gi i et typisk år, hvor mye av den som tas bort av nabomassene, og en totalsum for hver masse. Modellen er forklart med vanlige ord ved siden av knappen: den er et planleggingsestimat basert på et typisk år, ikke en garanti.

## Utendørs komfort

**Kjør komfort** beregner Universal Thermal Climate Index (UTCI) for en stående person på åpen grunn og ved siden av den første massen (sørsiden, nordsiden, østsiden og vestsiden), med skyggen fra alle massene. Den viser hvor mye himmel som sees, gjennomsnittlig UTCI på dagtid, og timene over 32 (varmestress) og under 0 (kuldestress).

## Vind (veiledende)

**Kjør vindstudie** løser luftstrømmen rundt massene én gang for hver vindretning som blåser i værfilen (4, 8, 12 eller 16 retninger), over omgivelsene som velges (åpent land, forstad eller bykjerne), og legger så sammen hele årets timevind. Kartet farger bakken etter komfortklasse, fra grønt (**sitte**) gjennom **stå**, **spasere** og **gå** til rødt (**ukomfortabelt**): den aktiviteten hvis grensehastighet (4, 6, 8 og 10 m/s) overskrides i høyst 5 % av timene. En annen tabell gir NEN 8100-klassen (A til E) ut fra andelen timer vinden passerer 5 m/s. Vindkastfaktoren ganger timemiddelet for å gi et effektivt vindkast.

Med enkle ord: en lattice-Boltzmann large-eddy-strømløser (vår egen, i biblioteket `lib/wind`) i en boks rundt bygningene, en vindhastighetsprofil som stiger med høyden over den valgte ruheten, og hastigheten ca. 1.5 m over bakken sammenlignet med hastigheten oppstrøms på 10 m. **Veiledende** er raskt og grovt; **Standard** bruker flere celler og kjører mye lenger. Hvis panelet sier at gridet er grovt (under 10 celler over den høyeste bygningen), eller at strømmen fortsatt endret seg, bør man tro mindre på kartet.

**Dette er ikke.** Løseren er kontrollert på lærebokstrømninger (en kanal, en lokkdrevet kavitet) og kjørt på en kube for å se at vaken og akselerasjonen i hjørnene ser riktige ut. Den er **ikke** validert mot vindtunnelmålinger av bygninger, så alle resultater er merket som ikke-validerte. Ikke bruk den til en dimensjonerende verdi, en vindlast eller et plansertifikat: en vindingeniør må kjøre og bekrefte en skikkelig studie. Flatt terreng, glatte bygningsvegger, snarveien med ruhet fra værstasjonen og grensetabellen er forenklinger; grensene kan avvike fra kriteriene som myndigheten bruker.

## Vind med OpenFOAM (tillegg)

Den innebygde vindmotoren over er eksperimentell. For en skikkelig strømningsløser slås tillegget **Fotgjengervind (OpenFOAM)** på under **Innstillinger > Tillegg** (det er av til det slås på). Det er programvare med egen GPL-lisens, holdt adskilt fra resten av CadCraft, og det inkluderer ikke OpenFOAM: OpenFOAM installeres selv. Deretter lister **Motor** i vindblokken opp OpenFOAM.

Dette settes opp én gang:
1. **Installer OpenFOAM** (ESI v-serien fra openfoam.com; tillegget er testet med v2512). På Ubuntu eller Debian (også i WSL på Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, deretter `sudo apt install openfoam2512-default`. Det installeres under `/usr/lib/openfoam/openfoam2512`. CadCraft trenger `blockMesh`, `snappyHexMesh` og `simpleFoam` for å kjøre. (Den eldre `openfoam` 1912-pakken i Ubuntus eget arkiv fungerer også, men funksjonsobjektene i den krasjer; tillegget leser da resultatfilene selv.)
2. **Start hjelperen** fra tilleggets `runner`-mappe med Node.js: `node cc-openfoam-runner.mjs serve`. Hvis OpenFOAM ikke er på søkestien, gi den en liten `runner.json` med stien til OpenFOAMs `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`), og start den med `--config runner.json`. Hjelperen lytter kun på denne datamaskinen og skriver ut et token.
3. **Lim inn tokenet** i tilleggets felt i vindblokken (adressen forblir `http://127.0.0.1:8765`) og trykk **Sjekk hjelperen**.

Deretter gir **Kjør vindstudie** én case per vindretning i værfilen: massene blir en overflate (STL) i en boks dimensjonert etter den vanlige retningslinjen (5 bygningshøyder rundt og over, 10 bak), meshet med blockMesh og snappyHexMesh, og kjørt som stasjonær k-epsilon RANS med en atmosfærisk grenselagsinnløp over den valgte ruheten. Hastigheten på 1.5 m leses tilbake og gjøres om til de samme Lawson- og NEN 8100-klassene. Ingenting forlater datamaskinen.

**Hva som er kontrollert.** Teksten over resultatene sier det rett ut og er en del av hver lagret CSV. Tilleggets skriving av case, lesing av resultater og hele kjeden er testet uten OpenFOAM, og én kube er kjørt gjennom ekte OpenFOAM med tre meshstørrelser (tallene står i prosjektnotatene). Den er **ikke** validert mot vindtunnelmålinger av bygninger. Den er en veiledende avlesning, ikke en dimensjonerende verdi og ikke et sertifikat. Standard k-epsilon overpredikerer turbulens foran bygninger, terrenget er flatt, veggene er glatte, og det finnes ikke terreng eller vegetasjon.
