---
title: Jednotky pri importe: súbor uvádza svoje jednotky, alebo sa najskôr opýtame
summary: Keď výkres alebo sieť, ktorú privediete do projektu, uvádza svoje jednotky, CivilCraft ich prevedie a oznámi to. Keď ich neuvádza, CivilCraft sa pred načítaním opýta a zapamätá si vašu odpoveď pre tento súbor.
keywords: jednotky, import, DWG, DXF, STL, OBJ, prieskum, stopy, US survey feet, metre, milimetre, mierka, zlá veľkosť, príliš veľký, príliš malý, opýtať sa, zapamätané, INSUNITS, jednotky výkresu
from: 60921963
---

## Čo urobíte

Privediete súbor do projektu a overíte, že sa načíta v správnej veľkosti.

## Kroky

1. Otvorte súbor obvyklým spôsobom: {{ui:Otvoriť}}, presuňte ho na plán, alebo použite príkaz pre CAD výkres.
2. Ak súbor uvádza svoje jednotky, nič sa nepýta: dialóg importu ich zobrazí ako **Podľa výkresu**.
3. Ak ich neuvádza, dialóg sa pred otvorením dialógu importu opýta na **Jednotky** súboru. Zvoľte, čo je jedna jednotka v súbore, a kliknite na {{ui:Použiť tieto jednotky}}.
4. {{ui:Zrušiť}} (alebo {{key:Esc}}) preskočí súbor. Nič z neho sa do projektu nenačíta.

## Ktoré súbory uvádzajú svoje jednotky

- **DWG a DXF**: jednotky vloženia výkresu (`$INSUNITS`). Súbor bez nich sa pýta. Zoznam **Jednotky výkresu** v dialógu importu začína vašou odpoveďou a dá sa ešte zmeniť.
- **STL a OBJ** (voľné tvary terénu): nikdy neuvádzajú jednotky. Pýtame sa.
- **Zoznamy bodov** (CSV, TXT) a priebežné zoznamy merania: zoznam, ktorý uvádza svoju jednotku v prvých riadkoch, sa prevedie a stavový riadok to oznámi. Zoznam, ktorý nijakú neuvádza, sa opýta po stlačení {{ui:Importovať}}, skôr než sa body načítajú. Stĺpce zemepisnej šírky a dĺžky namiesto toho idú cez súradnicový systém.
- **Doplnok Point clouds**: pýta sa, keď vytvárate mrak, ktorého súbor neuvádza jednotku, a čísla mraku označí jednotkou, ktorú nesie.
- **IFC a LandXML**: uvádzajú svoje jednotky; prevedú sa na jednotky projektu.
- **LAS, LAZ a výškové rastre**: umiestnia sa podľa súradnicového systému; dialóg terénu sa pýta na výškovú jednotku, keď súbor nehovorí.

## Dobré vedieť

- Odpoveď sa pre tento súbor zapamätá na tomto počítači, vo všetkých aplikáciách CadCraft. Pri ďalšom importe sa nepýtame.
- Ak sa chcete opýtať znova: paleta príkazov ({{key:Mod+K}}) › **Znova sa opýtať na jednotky importovaných súborov**.
- Jednotka, ktorú zoznam uvádza, sa číta z jeho prvých ôsmich riadkov: napríklad riadok `units: ft`, alebo nadpisy stĺpcov, ktoré všetky nesú rovnakú jednotku v zátvorkách, napríklad `Elevation (m)`.
