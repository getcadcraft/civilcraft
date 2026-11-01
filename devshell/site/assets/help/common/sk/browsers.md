---
title: Prehliadače a počítače
summary: V ktorých prehliadačoch aplikácie bežia, v čom sa líšia a čo potrebuje Váš počítač.
keywords: chrome, edge, firefox, safari, brave, prehliadač, mac, windows, linux, ipad, tablet, webgl, požiadavky, pamäť
from: a11b09b1
---

Aplikácie bežia vo webovom prehliadači. Prácu robia na Vašom vlastnom počítači: Vaše súbory sa tam otvárajú a nikdy sa nám neposielajú (pozrite si [Kam idú Vaše súbory](common:your-files)).

## Ktorý prehliadač

Použite aktuálnu verziu jedného z týchto:

| Prehliadač | Engine | Poznámky |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najúplnejšie: výber priečinka, ukladanie na offline použitie, spracovanie súborov. |
| Firefox | Gecko | Funguje. Otvorenie celého priečinka používa jednoduchší výber. Offline ukladanie nemusí fungovať v súkromných oknách. |
| Safari | WebKit | Funguje na Macu a iPade. Otvorenie celého priečinka používa jednoduchší výber. Safari môže odstrániť offline kópiu, ktorú ste niekoľko týždňov nepoužili. |

Všetky tri enginy sú na bežnú prácu v poriadku. Ak aplikácia robí niečo v niektorom z nich inak, jej pomocník ukazuje kroky pre Váš prehliadač.

## V čom sa prehliadače líšia

- **Otvorenie priečinka.** Prehliadače Chromium zobrazujú skutočný výber priečinka a vedia priečinok čítať priamo. Firefox a Safari Vás požiadajú o výber priečinka a potom prečítajú každý súbor v ňom, čo trvá dlhšie pri veľkých projektových priečinkoch; potiahnutie priečinka na aplikáciu funguje vo všetkých troch.
- **Ukladanie.** Aplikácie ukladajú stiahnutím súboru. Prehliadač rozhoduje, kam sa stiahnuté súbory ukladajú a či sa najprv opýta.

:::chromium
V Chrome alebo Edge zapnite "Pred prevzatím sa opýtať, kam sa má každý súbor uložiť" (v Nastaveniach, v časti Prevzaté súbory), aby ste si priečinok vyberali zakaždým.
:::

:::firefox
Vo Firefoxe otvorte Nastavenia, potom Všeobecné, potom Súbory a aplikácie a zvoľte "Vždy sa opýtať, kam sa majú súbory uložiť", aby ste si priečinok vyberali zakaždým.
:::

:::safari
V Safari otvorte Nastavenia, potom Všeobecné a nastavte "Umiestnenie stiahnutých súborov" na "Pýtať sa pri každom stiahnutí", aby ste si priečinok vyberali zakaždým.
:::

## Mac, Windows a Linux

Aplikácie sú na každom počítači rovnaké. Mení sa klávesnica: skratky sa zapisujú pre Váš počítač automaticky. Pozrite si [Klávesy, myši a trackpady](common:keys).

## Tablety a dotykové obrazovky

Niektoré aplikácie akceptujú dotyk (jeden prst kreslí alebo vyberá, dva prsty štipnutím zväčšujú a posúvajú). Pomocník každej aplikácie uvádza, či to podporuje. Na iPade použite Safari alebo Chrome. Klávesnica pomáha pri aplikáciách, ktoré používajú písané príkazy.

## Najstarší prehliadač a systém

Tieto údaje sme zistili z kódu aplikácií 0.7, nie odhadom: každý súbor sa spracoval a každá použitá jazyková funkcia sa vyhľadala vo zverejnených údajoch o kompatibilite prehliadačov. Pod týmito verziami sa aplikácie nedajú ani spustiť, pretože prehliadač kódu nerozumie.

| | Najstaršia verzia, ktorá vie aplikácie spustiť |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS a iOS 16.4) |

CadCraft Studio nesie vlastný webový engine vo Windowse, takže potrebuje Windows 10 alebo 11; na Macu používa systémový, takže potrebuje macOS 13.3 alebo novší. Položka Nastavenia › Aktualizácie v Studiu ukazuje, na čom Vaša kópia beží.

Toto je najstaršia verzia, ktorá sa *spustí*, zistená z kódu. Nie je to zoznam starých prehliadačov, v ktorých sme aplikácie vyskúšali, takže starší prehliadač, ktorý sa spustí, môže stále chýbať niektorá funkcia.

## Čo potrebuje Váš počítač

Ide o plánované minimá pre aplikácie, nie o zmerané požiadavky:

- 8 GB pamäte (pre veľké federované modely sa odporúča 16 GB).
- Grafický čip s WebGL 2 pre 3D aplikácie. Ak 3D pohľad zostane prázdny, skontrolujte, či je v nastaveniach prehliadača zapnuté hardvérové zrýchlenie.
- Obrazovka široká aspoň 1280 pixelov pre úplné panely nástrojov; menšie obrazovky ich zalomia.

Veľmi veľké súbory (veľké súbory listov, veľké modely) používajú v karte prehliadača veľa pamäte. Ak sa aplikácia spomalí, zatvorte ostatné náročné karty.
