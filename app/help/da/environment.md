---
title: Skygge, solenergiudbytte og udendørs komfort
summary: Undersøg den skygge, dine bygningsmasser kaster over en dag eller en sæson, se en animation af den, beregn hvor meget strøm solpaneler på tage og facader ville producere i et typisk år, se hvor komfortabel gaden ved en bygning er (UTCI), og få en screeningsvurdering af fodgængernes vindkomfort.
keywords: skyggeundersøgelse, skygge, soltimer, animation, sol, PV, fotovoltaisk, paneler, udbytte, kWh, EPW, vejrfil, UTCI, termisk komfort, udendørs komfort, varmestress, vind
from: 96e7af4d
---

Afsnittet **Miljø** ligger under **Soltimer** i en masses **Egenskaber**. Det bruger de masser, du har tegnet, som bygninger.

## Indlæs en vejrfil

Vælg en vejrfil for et typisk år (**.epw**) for din by. De er gratis fra EnergyPlus' vejrside og fra climate.onebuilding.org. Filen forbliver i din browser under dette besøg. Solenergiudbyttet og komfortundersøgelsen kræver den; skyggeundersøgelsen virker uden den, når projektet har et koordinatsystem.

## Skyggeundersøgelse

Vælg en dato (eller markér **Sæson** og en sidste dato og et trin i dage) og en tidszone, og klik derefter på **Kør skyggeundersøgelse**. Du får et kort over soltimerne, eller skyggetimerne, på terrænet rundt om masserne; en tabel over, hvor stor en del af terrænet der er i skygge i løbet af dagen; og en animation af dagen, som du kan afspille eller gennemgå trin for trin. **Gem kort**, **Gem animationsbilleder** (alle billederne på ét billede) og **Gem timer** (CSV) gemmer resultaterne.

Terrænet regnes for fladt i niveau med den laveste masse. For skygge på skrånende terræn skal du bruge **Soltimer**, som læser terrænet.

## Solenergiudbytte

Angiv panelets virkningsgrad, hvor stor en del af hvert tag og hver væg der er dækket, og systemtabene, og klik derefter på **Kør solenergiudbytte**. For hvert tag og hver væg får du den elektricitet, en kvadratmeter panel ville producere i et typisk år, hvor meget af den de nabomasser tager fra, og en total for hver masse. Modellen er skrevet ud med almindelige ord ved siden af knappen: det er et planlægningsestimat baseret på et typisk år, ikke en garanti.

## Udendørs komfort

**Kør komfort** beregner det universelle termiske klimaindeks (UTCI) for en stående person på åbent terræn og ved siden af den første masse (sydsiden, nordsiden, østsiden og vestsiden), med skyggen fra hver masse. Den viser, hvor meget himmel der ses, den gennemsnitlige UTCI i dagtimerne og timerne over 32 (varmestress) og under 0 (kuldestress).

## Vind (screening)

**Kør vindundersøgelse** løser luftstrømmen rundt om dine masser én gang for hver vindretning, der blæser i din vejrfil (4, 8, 12 eller 16 retninger), over de omgivelser, du vælger (åbent land, forstad eller bymidte), og lægger derefter hele årets timevind sammen. Kortet farver terrænet efter komfortklasse, fra grøn (**siddende**) over **stående**, **slentrende** og **gående** til rød (**ubehagelig**): den aktivitet, hvis grænsehastighed (4, 6, 8 og 10 m/s) overskrides i højst 5 % af timerne. En anden tabel giver NEN 8100-karakteren (A til E) ud fra andelen af timer, hvor vinden passerer 5 m/s. Byeftaktoren ganges på timegennemsnittet for at give en effektiv vindstød.

Sådan virker det med almindelige ord: en lattice-Boltzmann-løser for store hvirvler (large-eddy; vores egen, i biblioteket `lib/wind`) i en boks rundt om bygningerne, en vindhastighedsprofil, der stiger med højden over den valgte ruhed, og hastigheden ca. 1.5 m over terrænet sammenlignet med hastigheden opstrøms i 10 m. **Screening** er hurtig og grov; **Standard** bruger flere celler og kører meget længere. Hvis panelet siger, at gitteret er grovt (under 10 celler over den højeste bygning), eller at strømningen stadig ændrede sig, skal du tro mindre på kortet.

**Hvad dette ikke er.** Løseren er kontrolleret på lærebogsstrømninger (en kanal, en lid-driven cavity) og kørt på en kube for at se, at vagen og hastighedsforøgelsen i hjørnerne ser rigtige ud. Den er **ikke** valideret mod vindtunnelmålinger af bygninger, så alle resultater er mærket som ikke-validerede. Brug den ikke til en designværdi, en vindlast eller et planlægningscertifikat: en vindingeniør skal køre og bekræfte en ordentlig undersøgelse. Det flade terræn, glatte bygningsvægge, genvejen med ruhed fra vejrstationen og grænsetabellen er forenklinger; grænseværdierne kan afvige fra de kriterier, din myndighed bruger.

## Vind med OpenFOAM (add-on)

Den indbyggede vindmotor ovenfor er eksperimentel. Til en ordentlig strømningsløser skal du slå add-on'et **Fodgængervind (OpenFOAM)** til under **Indstillinger > Add-ons** (det er slået fra, indtil du gør det). Det er software under GPL-licens i sin egen ret, holdt adskilt fra resten af CadCraft, og det inkluderer ikke OpenFOAM: det installerer du selv. Derefter viser **Motor** i vindblokken OpenFOAM.

Det opsætter du én gang:
1. **Installér OpenFOAM** (ESI v-serien fra openfoam.com; add-on'et er testet med v2512). På Ubuntu eller Debian (også inde i WSL på Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, derefter `sudo apt install openfoam2512-default`. Den installeres under `/usr/lib/openfoam/openfoam2512`. CadCraft kræver `blockMesh`, `snappyHexMesh` og `simpleFoam` for at køre. (Den ældre `openfoam` 1912-pakke i Ubuntus eget arkiv virker også, men dens funktionsobjekter går ned; add-on'et læser så selv resultatfilerne.)
2. **Start hjælperen** fra add-on'ets mappe `runner` med Node.js: `node cc-openfoam-runner.mjs serve`. Hvis OpenFOAM ikke er på søgestien, så giv den en lille `runner.json` med stien til OpenFOAMs `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) og start den med `--config runner.json`. Hjælperen lytter kun på denne computer og udskriver et token.
3. **Indsæt tokenet** i add-on'ets felter i vindblokken (adressen forbliver `http://127.0.0.1:8765`) og tryk på **Tjek hjælperen**.

Derefter virker **Kør vindundersøgelse** med én case pr. vindretning i vejrfilen: dine masser bliver til en overflade (STL) i en boks dimensioneret efter den sædvanlige vejledning (5 bygningshøjder rundt og over, 10 bag ved), med mesh i blockMesh og snappyHexMesh, køres som stationær k-epsilon RANS med en atmosfærisk grænselagsindgang over den ruhed, du vælger, og hastigheden i 1.5 m læses tilbage og omsættes til de samme Lawson- og NEN 8100-klasser. Intet forlader din computer.

**Hvad der er kontrolleret.** Teksten over resultaterne siger det klart og er en del af hver gemt CSV. Add-on'ets skrivning af cases, læsning af resultater og hele forløbet er testet uden OpenFOAM, og en enkelt kube er kørt gennem rigtig OpenFOAM i tre mesh-størrelser (tallene findes i projektnoterne). Den er **ikke** valideret mod vindtunnelmålinger af bygninger. Det er en screeningsaflæsning, ikke en designværdi og ikke et certifikat. Standard k-epsilon overvurderer turbulensen foran bygninger, terrænet er fladt, vægge er glatte, og der er ingen terræn- eller vegetationsmodel.
