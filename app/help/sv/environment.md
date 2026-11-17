---
title: Skugga, solenergi och utomhuskomfort
summary: Studera skuggan dina volymer kastar över en dag eller en säsong, se en animation av den, räkna ut hur mycket el solpaneler på taken och väggarna skulle ge under ett typiskt år, se hur bekväm gatan bredvid en byggnad är (UTCI) och få en översiktlig avläsning av vindkomforten för fotgängare.
keywords: skuggstudie, skugga, soltimmar, animation, solenergi, PV, solcell, paneler, avkastning, kWh, EPW, väderfil, UTCI, termisk komfort, utomhuskomfort, värmestress, vind
from: 96e7af4d
---

Avsnittet **Miljö** ligger under **Soltimmar** i en volyms **Egenskaper**. Det använder de volymer du har ritat som byggnader.

## Läs in en väderfil

Välj en väderfil för ett typiskt år (**.epw**) för din ort. De är gratis från EnergyPlus väderwebbplats och från climate.onebuilding.org. Filen stannar i din webbläsare under detta besök. Solenergiavkastningen och komfortstudien behöver den; skuggstudien fungerar utan den när projektet har ett koordinatsystem.

## Skuggstudie

Välj ett datum (eller kryssa i **Säsong** och ett sista datum och ett steg i dagar) och en tidszon, och klicka sedan på **Kör skuggstudie**. Du får en karta över solens timmar, eller över skuggan, på marken runt volymerna; en tabell över hur stor del av marken som är skuggad under dagen; och en animation av dagen som du kan spela upp eller stega igenom. **Spara karta**, **Spara animationens bildrutor** (alla bildrutor på en bild) och **Spara timmar** (CSV) sparar resultaten.

Marken antas vara plan på nivån för den lägsta volymen. För skugga på sluttande mark använder du **Soltimmar**, som läser terrängen.

## Solenergiavkastning

Ställ in panelens verkningsgrad, hur stor del av varje tak och vägg som är täckt och systemförlusterna, och klicka sedan på **Kör solenergiavkastning**. För varje tak och vägg får du den el som en kvadratmeter panel skulle ge under ett typiskt år, hur mycket av den som grannvolymerna tar bort, och en summa för varje volym. Modellen är skriven med vanliga ord bredvid knappen: den är en planeringsuppskattning från ett typiskt år, inte en garanti.

## Utomhuskomfort

**Kör komfort** beräknar det universella termiska klimatindexet (UTCI) för en stående person på öppen mark och bredvid den första volymen (sydsidan, nordsidan, östsidan och västsidan), med skuggan från varje volym. Den visar hur mycket himmel som syns, det genomsnittliga UTCI-värdet under dagen och timmarna över 32 (värmestress) och under 0 (kallstress).

## Vind (översiktlig)

**Kör vindstudie** löser luftflödet runt dina volymer en gång för varje vindriktning som blåser i din väderfil (4, 8, 12 eller 16 riktningar), över omgivningen du väljer (öppet land, förort eller stadskärna), och lägger sedan ihop hela årets timvind. Kartan färgar marken efter komfortklass, från grönt (**sittande**) via **stående**, **promenerande** och **gående** till rött (**obekvämt**): den aktivitet vars gränshastighet (4, 6, 8 och 10 m/s) överskrids under högst 5 % av timmarna. En andra tabell ger NEN 8100-klassen (A till E) utifrån andelen timmar då vinden passerar 5 m/s. Byfaktorn multipliceras med timmedelvärdet för att ge en effektiv byvind.

Så här fungerar det, med enkla ord: en lattice-Boltzmann-lösare för large-eddy-strömning (vår egen, i biblioteket `lib/wind`) i en låda runt byggnaderna, en vindhastighetsprofil som stiger med höjden över den valda ojämnheten, och hastigheten cirka 1.5 m över marken jämfört med hastigheten uppströms vid 10 m. **Översiktlig** är snabb och grov; **Standard** använder fler celler och körs mycket längre. Om panelen säger att rutnätet är grovt (under 10 celler över den högsta byggnaden), eller att flödet fortfarande förändrades, ska du lita mindre på kartan.

**Vad detta inte är.** Lösaren har kontrollerats mot läroboksflöden (en kanal, en lockdriven kavitet) och körts på en kub för att se att vaken och hastighetsökningen vid hörnen ser rimliga ut. Den har **inte** validerats mot vindtunnelmätningar av byggnader, så varje resultat är märkt som ovaliderat. Använd den inte för ett dimensionerande värde, en vindlast eller ett planeringsintyg: en vindingenjör måste köra och bekräfta en riktig studie. Den platta marken, släta byggnadsväggar, genvägen för ojämnhet från väderstationen och tröskeltabellen är förenklingar; tröskelvärdena kan skilja sig från de kriterier din myndighet använder.

## Vind med OpenFOAM (tillägg)

Den inbyggda vindmotorn ovan är experimentell. För en riktig flödeslösare slår du på tillägget **Vind för fotgängare (OpenFOAM)** under **Inställningar > Tillägg** (det är av tills du gör det). Det är programvara under GPL i egen rätt, hållen åtskild från resten av CadCraft, och den innehåller inte OpenFOAM: det installerar du själv. Sedan listar **Motor** i vindblocket OpenFOAM som alternativ.

Det du ställer in en gång:
1. **Installera OpenFOAM** (ESI:s v-serie från openfoam.com; tillägget är testat med v2512). På Ubuntu eller Debian (även i WSL på Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, och sedan `sudo apt install openfoam2512-default`. Det installeras under `/usr/lib/openfoam/openfoam2512`. CadCraft behöver `blockMesh`, `snappyHexMesh` och `simpleFoam` för att köras. (Det äldre paketet `openfoam` 1912 i Ubuntus eget arkiv fungerar också, men dess funktionsobjekt kraschar; tillägget läser då själv resultatfilerna.)
2. **Starta hjälpprogrammet** från tilläggets mapp `runner` med Node.js: `node cc-openfoam-runner.mjs serve`. Om OpenFOAM inte finns på sökvägen ger du det en liten `runner.json` med sökvägen till OpenFOAM:s `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) och startar det med `--config runner.json`. Hjälpprogrammet lyssnar bara på den här datorn och skriver ut en token.
3. **Klistra in token** i tilläggets fält i vindblocket (adressen förblir `http://127.0.0.1:8765`) och tryck på **Kontrollera hjälpprogrammet**.

Sedan fungerar **Kör vindstudie** med ett fall per vindriktning i väderfilen: dina volymer blir en yta (STL) i en låda som dimensioneras enligt den vanliga riktlinjen (5 byggnadshöjder runt och över, 10 bakom), nätet byggs med blockMesh och snappyHexMesh, körs som stationär k-epsilon RANS med ett inlopp för atmosfärisk gränsskikt över den ojämnhet du väljer, och hastigheten vid 1.5 m läses av och omvandlas till samma Lawson- och NEN 8100-klasser. Inget lämnar din dator.

**Vad som har kontrollerats.** Texten ovanför resultaten säger det rakt ut och ingår i varje sparad CSV. Tilläggets skrivning av fall, avläsning av resultat och hela kedjan är testade utan OpenFOAM, och en enda kub har körts genom riktig OpenFOAM vid tre nätstorlekar (siffrorna finns i projektanteckningarna). Den har **inte** validerats mot vindtunnelmätningar av byggnader. Det är en översiktlig avläsning, inte ett dimensionerande värde och inget intyg. Standard k-epsilon överskattar turbulensen framför byggnader, marken är plan, väggarna släta och det finns ingen terräng eller vegetation.
