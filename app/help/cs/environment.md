---
title: Stín, solární výnos a venkovní komfort
summary: Studujte stín, který vaše hmoty budov vrhají během dne nebo roční doby, sledujte jeho animaci, spočítejte, kolik elektřiny by solární panely na střechách a stěnách vyrobily za typický rok, zjistěte, jak komfortní je ulice vedle budovy (UTCI), a získejte orientační údaj o komfortu pěšího větru.
keywords: studie stínu, stín, hodiny slunce, animace, solární, PV, fotovoltaika, panely, výnos, kWh, EPW, soubor počasí, UTCI, tepelný komfort, venkovní komfort, tepelná zátěž, vítr
from: 96e7af4d
---

Sekce **Prostředí** sídlí pod **Hodiny slunce** ve **Vlastnostech** hmoty. Používá hmoty, které jste nakreslili, jako budovy.

## Načtení souboru počasí

Vyberte soubor počasí pro typický rok (**.epw**) pro vaše město. Jsou zdarma na webu EnergyPlus a na climate.onebuilding.org. Soubor zůstává ve vašem prohlížeči pro tuto návštěvu. Studie solárního výnosu a komfortu jej potřebují; studie stínu funguje bez něj, pokud má projekt souřadnicový systém.

## Studie stínu

Vyberte datum (nebo zaškrtněte **Sezóna** a poslední datum a krok ve dnech) a časové pásmo, potom klikněte na **Spustit studii stínu**. Dostanete mapu hodin slunce nebo stínu na zemi kolem hmot; tabulku, jak velká část země je během dne ve stínu; a animaci dne, kterou můžete přehrát nebo procházet krok za krokem. **Uložit mapu**, **Uložit snímky animace** (všechny snímky na jednom obrázku) a **Uložit hodiny** (CSV) výsledky uchovají.

Země se bere jako rovná na úrovni nejnižší hmoty. Pro stín na svažitém terénu použijte **Hodiny slunce**, které terén čte.

## Solární výnos

Nastavte účinnost panelů, jaká část každé střechy a stěny je pokryta, a ztráty systému, potom klikněte na **Spustit solární výnos**. Pro každou střechu a stěnu dostanete elektřinu, kterou by vyrobil čtvereční metr panelu za typický rok, kolik z ní odeberou sousední hmoty, a součet pro každou hmotu. Model je vysvětlen prostými slovy vedle tlačítka: je to plánovací odhad z typického roku, ne záruka.

## Venkovní komfort

**Spustit komfort** spočítá Universal Thermal Climate Index (UTCI) pro stojícího člověka na volném prostranství a vedle první hmoty (strany jih, sever, východ a západ), se stínem každé hmoty. Ukáže, kolik oblohy je vidět, průměrné denní UTCI a hodiny nad 32 (tepelná zátěž) a pod 0 (chladová zátěž).

## Vítr (orientační)

**Spustit studii větru** vyřeší proudění vzduchu kolem vašich hmot jednou pro každý směr větru, který fouká ve vašem souboru počasí (4, 8, 12 nebo 16 směrů), nad okolím, které vyberete (otevřená krajina, předměstí nebo centrum města), a potom sečte celoroční hodinový vítr. Mapa obarvuje zem podle třídy komfortu, od zelené (**sezení**) přes **stání**, **procházku** a **chůzi** k červené (**nepříjemné**): aktivita, jejíž limitní rychlost (4, 6, 8 a 10 m/s) je překročena nejvýš v 5 % hodin. Druhá tabulka uvádí stupeň NEN 8100 (A až E) podle podílu hodin, kdy vítr překročí 5 m/s. Součinitel poryvů násobí hodinový průměr, aby vznikl účinný poryv.

Jak to funguje, prostými slovy: řešič proudění lattice-Boltzmann large-eddy (vlastní, v knihovně `lib/wind`) v krabici kolem budov, profil rychlosti větru, který s výškou roste podle zvolené drsnosti, a rychlost přibližně 1,5 m nad zemí ve srovnání s rychlostí proti proudu v 10 m. **Orientační** výpočet je rychlý a hrubý; **Standardní** používá více buněk a běží mnohem déle. Pokud panel říká, že mřížka je hrubá (méně než 10 buněk nad nejvyšší budovou), nebo se proudění ještě měnilo, mapě věřte méně.

**Co to není.** Řešič byl ověřen na učebnicových prouděních (kanál, uzavřená dutina s pohyblivým víkem) a spuštěn na krychli, aby se ověřilo, že úplav a zrychlení v rozích vypadají správně. **Nebyl** ověřen proti měřením v aerodynamickém tunelu na budovách, proto je každý výsledek označen jako neověřený. Nepoužívejte jej pro návrhovou hodnotu, zatížení větrem nebo povolení: musí spustit a potvrdit řádnou studii větrný inženýr. Rovný terén, hladké stěny budov, zkratka drsnosti podle meteorologické stanice a tabulka mezních hodnot jsou zjednodušení; mezní hodnoty se mohou v kritériích vašeho úřadu lišit.

## Vítr s OpenFOAM (doplněk)

Vestavěný větrný výpočet výše je experimentální. Pro řádný řešič proudění zapněte doplněk **Pedestrian wind (OpenFOAM)** v **Nastavení > Doplňky** (je vypnutý, dokud to neuděláte). Je to software pod licencí GPL, vlastní, oddělený od zbytku CadCraftu, a neobsahuje OpenFOAM: ten nainstalujete sami. Potom **Motor** ve větrném bloku nabídne OpenFOAM.

Co nastavíte, jednou:
1. **Nainstalujte OpenFOAM** (řada ESI v-series z openfoam.com; doplněk je testován s v2512). Na Ubuntu nebo Debianu (také ve WSL na Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, potom `sudo apt install openfoam2512-default`. Instaluje se do `/usr/lib/openfoam/openfoam2512`. CadCraft pro běh potřebuje `blockMesh`, `snappyHexMesh` a `simpleFoam`. (Starší balíček `openfoam` 1912 z vlastního archivu Ubuntu také funguje, ale jeho function objects padají; doplněk pak čte výsledkové soubory sám.)
2. **Spusťte pomocníka** ze složky `runner` doplňku pomocí Node.js: `node cc-openfoam-runner.mjs serve`. Pokud OpenFOAM není ve vyhledávací cestě, dejte mu malý `runner.json` s cestou k `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) a spusťte jej s `--config runner.json`. Pomocník naslouchá jen na tomto počítači a vypíše token.
3. **Vložte token** do polí doplňku ve větrném bloku (adresa zůstává `http://127.0.0.1:8765`) a klikněte na **Zkontrolovat pomocníka**.

Potom **Spustit studii větru** funguje s jedním případem pro každý směr větru v souboru počasí: vaše hmoty se stanou povrchem (STL) v krabici dimenzované podle obvyklého pravidla (5 výšek budov kolem a nad, 10 za), zesítěné pomocí blockMesh a snappyHexMesh, spuštěné jako ustálené RANS k-epsilon s atmosférickým vstupem mezní vrstvy nad zvolenou drsností, a rychlost v 1,5 m se přečte zpět a převede na stejné třídy Lawson a NEN 8100. Nic neopouští váš počítač.

**Co bylo ověřeno.** Text nad výsledky to říká přímo a je součástí každého uloženého CSV. Zápis případů doplňku, čtení výsledků a celý postup jsou testovány bez OpenFOAM, a jedna krychle byla spuštěna přes skutečný OpenFOAM na třech velikostech sítě (čísla jsou v poznámkách k projektu). **Nebyl** ověřen proti měřením v aerodynamickém tunelu na budovách. Je to orientační údaj, ne návrhová hodnota ani certifikát. Standardní k-epsilon nadhodnocuje turbulenci před budovami, země je rovná, stěny hladké a neexistuje žádný terén ani vegetace.
