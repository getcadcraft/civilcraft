---
title: Vypočítať hodiny slnka na lokalite
summary: Vyberte deň (alebo ročné obdobie) a časové pásmo a zobrazte hodiny priameho slnka na každej stene každej hmoty a na teréne okolo nich, s terénom nakresleným v pôdoryse a číslami ako CSV.
keywords: slnko, hodiny slnka, tieň, tieňovanie, solárny prístup, denné hodiny, fasáda, stena, ročné obdobie, slnovrat, rovnodennosť, časové pásmo, letný čas, zemepisná šírka, zemepisná dĺžka, CSV, rastrový
from: 4e32a314
---

**Hodiny slnka** počíta hodiny priameho slnka, ktoré dopadajú na každú stenu každej hmoty budovy a na terén okolo nich, v deň, ktorý vyberiete, alebo spriemerované za ročné obdobie. Hmoty a terén sami vrhajú tieň; nič iné nie (žiadne stromy, žiadni susedia, ktorých ste nenakreslili). Rozptýlené svetlo oblohy, ktoré nie je priame slnko, sa nepočíta.

## Pred začatím

Poloha slnka vychádza zo zemepisnej šírky a dĺžky lokality, ktoré pochádzajú zo **súradnicového systému** projektu. Projekt bez neho sa odmietne so správou: najprv ho nastavte (**Súradnice** v skupine GIS). Zemepisná šírka a dĺžka zadaná ručne by bola odhad, preto pre ne nie je žiadne pole.

## Výpočet

V **Vlastnostiach**, pod **Hmoty budovy**, **Hodiny slnka**:

1. Vyberte **Deň**. Začína dňom, keď je slnko na vašom mieste najnižšie (21. december, alebo 21. jún na južnej pologuli). Pre ročné obdobie zaškrtnite **Počas ročného obdobia**, vyberte **Posledný deň** a koľko dní má byť medzi vzorkami.
2. Napíšte **Časové pásmo**: názov ako `America/Mexico_City`, alebo posun od UTC ako `-6`. Názov sa riadi pravidlami letného času tohto pásma pre daný deň; posun, ktorý napíšete, sa použije presne tak, ako je napísaný, preto použite ten, ktorý v daný deň platí. Riadok pod poľom ukáže, aký posun našiel.
3. Vyberte, ako často umiestňovať slnko (každých 5, 10, 15 alebo 30 minút), potom **Vypočítať hodiny slnka**. Ročné obdobie beží na pozadí; **Zastaviť** ho zruší.

## Čo dostanete

- Tabuľku podľa hmoty: **najhoršia stena**, **priemer** a **najlepšia stena** v hodinách za deň, a tabuľku každej steny s jej orientáciou a hodinami po podlažiach.
- Terén okolo hmôt, nakreslený v pôdoryse od tmavej (bez slnka) po žltú (najviac, koľko dostane ktorá bunka), s legendou. Bunky pod hmotou zostanú prázdne. **Zobraziť terén v pôdoryse** ho vypne.
- **Steny ako CSV** a **Terén ako CSV** uložia čísla.

Pri ročnom období sú údaje priemerom za deň zo vzorkovaných dní. Nič sa neukladá do projektu: výsledok je na pozeranie a opätovný výpočet ho vytvorí znova.

## Dobre vedieť

- Stena počíta okamih ako slnečný iba vtedy, keď je otočená k slnku a nič mu nestojí v ceste. Stena otočená od slnka nedostane nič.
- Terén sa vzorkuje na mriežke, ktorá závisí od veľkosti lokality, a poloha slnka sa berie v strede každého časového kroku, takže hodiny sú správne s presnosťou na zvolený krok.
- Poloha slnka je uverejnený astronomický vzorec, presný asi na oblúkovú minútu.
