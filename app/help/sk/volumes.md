---
title: Objemy zemných prác
summary: Čítajte objemy výkopu, násypu a čisté objemy medzi existujúcim terénom a navrhovaným povrchom, pre každú plošinu a koridor aj celkom, a pochopte mriežkovú metódu, ktorá za nimi stojí.
keywords: objemy, zemné práce, výkop, násyp, čistý, výkop a násyp, množstvá, mriežková metóda, porovnanie povrchov, objemový povrch, kubické yardy, kubické metre
from: 299d7bc7
---

Ak plošina alebo koridor upravuje terén bez problémov, CivilCraft porovná navrhovaný povrch s existujúcim terénom a uvedie výkop a násyp. Čísla sa aktualizujú pri každej zmene.

## Kde ich čítať

- **Zemné práce** na pravom paneli, keď nič nie je vybrané (pohľad **Projekt**), keď je aspoň jedna plošina alebo jeden koridor.
- **Zemné práce** na pravom paneli, keď je vybraná plošina (tie isté súčty pre celý projekt).
- Riadok pod nastaveniami koridora, s jeho vlastným výkopom a násypom.

Blok **Zemné práce** zobrazuje:

- **Výkop**, **Násyp** a **Čisté** (s "násyp" alebo "výkop" za ním, podľa toho, čo je väčšie)
- riadok na každú položku, keď je ich viac, napríklad "Plošina 1: výkop 120.4 cu yd, násyp 310.2 cu yd"
- riadok metódy: "Mriežková metóda: existujúci terén a upravený povrch vzorkované každých 0.5 ft vnútri čiar odkrytia (92,891 buniek). Nie je uplatnené žiadne nabývanie ani zmršťovanie."

Objemy sú v kubických yardoch v projekte v stopách a v kubických metroch v projekte v metroch.

## Odoslať do TakeoffCraft

Ak chcete zemné práce ocenit, zvoľte {{ui:Poslať do TakeoffCraft}} na spodku bloku **Zemné práce**. CivilCraft uloží súbor množstiev (`<site>.quantities.json`) s dvomi množstvami: výkop a násyp, v kubických yardoch (projekt v stopách) alebo v kubických metroch (projekt v metroch), tie isté čísla ako v bloku, na dve desatinné miesta. Otvorte ho v TakeoffCraft pomocou **Otvoriť výkaz výmer**, alebo ho sem presuňte: stanú sa z nich dve položky, ktoré môžete ocenit ([Výkop a násyp z CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Po zmene odošlite znova a otvorte nový súbor: tie isté položky dostanú nové čísla.

Odosielajú sa len celkové súčty, takže nič sa nepočíta dvakrát; poznámka v súbore uvádza výkop a násyp každej plošiny a koridora.

## Ako sa počítajú

CivilCraft používa **mriežkovú metódu**:

1. Nad oblasťou vnútri každej čiary odkrytia sa položí mriežka štvorcových buniek.
2. V strede každej bunky sa vzorkujú obidva povrchy.
3. Každá bunka sa počíta ako hranol: rozdiel výšok krát plocha bunky. Kde je navrhovaný povrch nižšie, ide o výkop; kde vyššie, o násyp.
4. Bunky sa spočítajú.

Veľkosť bunky sa zvolí za vás tak, aby obdĺžnik okolo upravených plôch obsahoval asi 250,000 buniek, zaokrúhlený na úhľadnú hodnotu (1, 2 alebo 5-násobok mocniny desiatich). Zatiaľ ju nemôžete nastaviť sami. Riadok metódy vám povie veľkosť a počet buniek. Menšie bunky sú presnejšie pozdĺž okrajov; na celých bunkách medzi rovnými rovinami je výsledok presný.

## Čo treba vedieť

- Počíta sa len plocha vnútri čiar odkrytia. Terén mimo nich sa nemení.
- Plošina alebo koridor s problémom sa neupravuje a nič nepridá. Ak blok hovorí "Zatiaľ žiadne objemy: plošina sa musí upraviť bez problémov.", hľadajte červený box nad ním.
- Kde sa položky prekrývajú, neskoršia nahradila skoršiu vnútri jej čiary odkrytia a prekrytie sa počíta raz.
- Nepoužíva sa žiadny koeficient nabývania ani zmršťovania. Ak potrebujete objemy v nerozrušenom, rozrušenom alebo zhutnenom stave, výsledky vynásobte sami.
- Odstránenie ornice, hĺbky vozovky a podložia a objemy hranolov TIN-na-TIN zatiaľ nie sú k dispozícii.

## Kontrola výsledku

- Zapnite {{ui:Navrhovaný (upravený)}} v časti **Zobrazenie** a pozrite sa na vrstevnice vnútri čiar odkrytia.
- Presuňte ukazovateľ nad upravenú plochu: stavový riadok zobrazí **Terén** a **Upravené**. Rozdiel je hĺbka výkopu alebo násypu na tom mieste.
- Pri koridore zobrazuje odčítanie pohľadu na profile výkop alebo násyp na stredovej osi pri každom staničení.
