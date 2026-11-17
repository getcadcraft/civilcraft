---
title: Tieň, solárny výnos a vonkajšia pohoda
summary: Preštudujte tieň, ktorý vaše hmoty vrhajú počas dňa alebo sezóny, pozrite si jeho animáciu, zistite, koľko elektriny by solárne panely na strechách a stenách vyrobili za typický rok, ako pohodlná je ulica pri budove (UTCI), a získajte orientačný údaj o pohode pešieho vetra.
keywords: štúdia tieňa, tieň, hodiny slnka, animácia, solárne, PV, fotovoltický, panely, výnos, kWh, EPW, súbor počasia, UTCI, tepelná pohoda, vonkajšia pohoda, tepelná záťaž, vietor
from: 96e7af4d
---

Časť **Prostredie** sa nachádza pod **Hodiny slnka** vo **Vlastnostiach** hmoty. Využíva hmoty, ktoré ste nakreslili, ako budovy.

## Načítanie súboru počasia

Vyberte súbor počasia (**.epw**) pre typický rok vášho mesta. Sú zadarmo na webe EnergyPlus weather a na climate.onebuilding.org. Súbor zostane v prehliadači počas tejto návštevy. Solárny výnos a štúdia pohody ho potrebujú; štúdia tieňa funguje aj bez neho, keď má projekt súradnicový systém.

## Štúdia tieňa

Vyberte dátum (alebo zaškrtnite **Sezóna** a posledný dátum a krok v dňoch) a časové pásmo, potom kliknite na **Spustiť štúdiu tieňa**. Dostanete mapu hodín slnka alebo tieňa na zemi okolo hmôt; tabuľku, aká časť zeme je cez deň v tieni; a animáciu dňa, ktorú môžete prehrať alebo prechádzať krok za krokom. **Uložiť mapu**, **Uložiť snímky animácie** (všetky snímky na jednom obrázku) a **Uložiť hodiny** (CSV) uchovajú výsledky.

Zem sa berie ako rovná na úrovni najnižšej hmoty. Pre tieň na svahovanom teréne použite **Hodiny slnka**, ktoré čítajú terén.

## Solárny výnos

Nastavte účinnosť panelu, aký podiel každej strechy a steny pokrýva a straty systému, potom kliknite na **Spustiť solárny výnos**. Pre každú strechu a stenu dostanete elektrinu, ktorú by vyrobil štvorcový meter panelu za typický rok, koľko z nej odoberajú susedné hmoty, a súčet pre každú hmotu. Model je vysvetlený slovami vedľa tlačidla: je to plánovací odhad z typického roka, nie záruka.

## Vonkajšia pohoda

**Spustiť pohodu** vypočíta Univerzálny tepelný klimatický index (UTCI) pre stojacu osobu na voľnom priestranstve a vedľa prvej hmoty (južná, severná, východná a západná strana), s tieňom každej hmoty. Ukáže, koľko oblohy je vidieť, priemerné denné UTCI a hodiny nad 32 (tepelná záťaž) a pod 0 (chladová záťaž).

## Vietor (orientačný)

**Spustiť štúdiu vetra** vyrieši prúdenie vzduchu okolo vašich hmôt raz pre každý smer vetra, ktorý fúka vo vašom súbore počasia (4, 8, 12 alebo 16 smerov), nad okolím, ktoré vyberiete (otvorený terén, predmestie alebo centrum mesta), a potom sčíta celoročný hodinový vietor. Mapa farbí zem podľa triedy pohody od zelenej (**sedenie**) cez **státie**, **prechádzanie** a **chôdzu** po červenú (**nepríjemné**): je to aktivita, ktorej limitná rýchlosť (4, 6, 8 a 10 m/s) je prekročená najviac v 5 % hodín. Druhá tabuľka uvádza stupeň NEN 8100 (A až E) podľa podielu hodín, keď vietor prekročí 5 m/s. Faktor poryvu násobí hodinový priemer, aby dal účinný poryv.

Ako to funguje, jednoducho povedané: riešiteľ prúdenia typu lattice-Boltzmann s veľkými vírmi (vlastný, v knižnici `lib/wind`) v kvádri okolo budov, profil rýchlosti vetra, ktorý stúpa s výškou podľa zvolenej drsnosti, a rýchlosť asi 1.5 m nad zemou porovnaná s rýchlosťou pred budovami vo výške 10 m. **Orientačný** výpočet je rýchly a hrubý; **Štandardný** používa viac buniek a beží oveľa dlhšie. Ak panel uvádza, že mriežka je hrubá (menej ako 10 buniek nad najvyššou budovou), alebo sa prúdenie ešte menilo, dôverujte mape menej.

**Čím to nie je.** Riešiteľ bol overený na učebnicových prúdeniach (kanál, uzavretá dutina s poháňanou horou stenou) a spustený na kocke, aby sa overilo, že úplav a zrýchlenie rýchlosti v rohoch vyzerajú správne. **Nebol** overený proti meraniam budov v aerodynamickom tuneli, preto je každý výsledok označený ako neoverený. Nepoužívajte ho na návrhovú hodnotu, zaťaženie vetrom ani povoľovací certifikát: riadnu štúdiu musí spustiť a potvrdiť vetrový inžinier. Rovný terén, hladké steny budov, skratka drsnosti podľa meteostanice a tabuľka prahov sú zjednodušenia; prahy sa môžu líšiť od kritérií vášho úradu.

## Vietor s OpenFOAM (doplnok)

Vstavaný výpočtový modul vetra vyššie je experimentálny. Na riadny riešiteľ prúdenia zapnite doplnok **Pešie vetro (OpenFOAM)** v **Nastavenia > Doplnky** (je vypnutý, kým ho nezapnete). Je to softvér pod licenciou GPL, oddelený od zvyšku CadCraft, a neobsahuje OpenFOAM: ten nainštalujete sami. Potom **Výpočtový motor** v bloku vetra uvedie OpenFOAM.

Čo nastavíte raz:
1. **Nainštalujte OpenFOAM** (ESI v-series z openfoam.com; doplnok je testovaný s v2512). Na Ubuntu alebo Debian (aj vo WSL v systéme Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, potom `sudo apt install openfoam2512-default`. Nainštaluje sa do `/usr/lib/openfoam/openfoam2512`. CadCraft na beh potrebuje `blockMesh`, `snappyHexMesh` a `simpleFoam`. (Staršie balíček `openfoam` 1912 z vlastného archívu Ubuntu tiež funguje, ale jeho function objects padajú; doplnok potom sám číta výsledkové súbory.)
2. **Spustite pomocníka** z priečinka `runner` doplnku pomocou Node.js: `node cc-openfoam-runner.mjs serve`. Ak OpenFOAM nie je v ceste pre vyhľadávanie, dajte mu malý `runner.json` s cestou k `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) a spustite ho s `--config runner.json`. Pomocník počúva len na tomto počítači a vypíše token.
3. **Vložte token** do polí doplnku v bloku vetra (adresa zostane `http://127.0.0.1:8765`) a kliknite na **Skontrolovať pomocníka**.

Potom **Spustiť štúdiu vetra** spustí jeden prípad pre každý smer vetra v súbore počasia: vaše hmoty sa stanú povrchom (STL) v kvádri veľkosti podľa obvyklého pravidla (5 výšok budov dookola a nad nimi, 10 za nimi), zosieťovaným pomocou blockMesh a snappyHexMesh, spusteným ako ustálený k-epsilon RANS s hraničnou vrstvou atmosféry na vstupe nad drsnosťou, ktorú zvolíte. Rýchlosť vo výške 1.5 m sa načíta späť a prevedie na rovnaké triedy Lawsona a NEN 8100. Nič neopustí váš počítač.

**Čo bolo overené.** Text nad výsledkami to hovorí otvorene a je súčasťou každého uloženého CSV. Zápis prípadov doplnku, čítanie výsledkov a celý postup sú otestované bez OpenFOAM a jedna kocka bola spustená cez skutočný OpenFOAM pri troch veľkostiach siete (čísla sú v projektových poznámkach). **Nebol** overený proti meraniam budov v aerodynamickom tuneli. Je to orientačný údaj, nie návrhová hodnota ani certifikát. Štandardný k-epsilon nadhodnocuje turbulenciu pred budovami, terén je rovný, steny sú hladké a nie sú tu žiadny terén ani vegetácia.
