---
title: Kľúče popisu a kódy čiar
summary: Premeňte terénne kódy na skupiny bodov s popismi a spájajte kódované body do čiar (začiatok, koniec, uzavretie), ktoré sa stanú hranami zlomu.
keywords: kľúče popisu, terénne kódy, kódy čiar, obrazce, čiarovanie, začiatok, koniec, uzavrieť, skupiny bodov, kódy, merané kódy, zberače údajov, hrany zlomu, obrubník, hrana vozovky
from: b3d1af8d
---

Merací tímy kódujú každé meranie v teréne: `EP` pre hranu vozovky, `TC` pre hornú hranu obrubníka, `BLDG` pre roh budovy. Kód je prvé slovo popisu bodu. CivilCraft podľa neho zoskupuje body a kódy čiar za ním premieňa na čiary.

## Kódy čiar

Kód čiary je slovo hneď za terénnym kódom:

| Popis | Význam |
|---|---|
| `EP B` | Začína novú čiaru hrany vozovky v tomto bode |
| `EP` | Pokračuje v aktuálnej čiare EP |
| `EP E` | Ukončí aktuálnu čiaru EP v tomto bode |
| `BLDG C` | Uzavrie budovu: tento bod spojí späť s prvým bodom čiary |

Body s rovnakým kódom sa spájajú v poradí čísel bodov. Rôzne kódy sú rôzne čiary, aj keď zdieľajú skupinu, takže `EP1` a `EP2` dajú naraz dve hrany. Kód, ktorý nikdy nepoužíva kód čiary, sa spája cez všetky svoje body, ako v predchádzajúcich verziách.

Čiary v skupine použitej ako **Hrana zlomu** sa stanú hranami zlomu, jedna na čiaru, takže obrubník s medzerou sa neroztiahne cez medzeru. Čiary v iných skupinách sa kreslia v pôdoryse (hladina V-NODE-LINE) a idú do DXF, DWG a PDF.

Slová pre začiatok, koniec a uzavretie sú `B`, `BEG`, `START`; `E`, `END`; a `C`, `CLO`, `CLOSE`. Zmeňte ich alebo vypnite kódy čiar v dialógovom okne nižšie.

## Kľúče popisu

Kľúč popisu premení kód na skupinu bodov, použitie a dlhý popis.

1. Pod **Body** kliknite na {{ui:Kľúče popisu a kódy čiar}}.
2. Kliknite na {{ui:Pridať kľúč}} a vyplňte riadok:
   - **Kód**: terénny kód, ktorý sa má porovnať. `*` znamená ľubovoľné znaky a `?` jeden znak, takže `EP*` zachytí EP, EP1 a EP12.
   - **Skupina**: skupina bodov, do ktorej tieto body patria (prázdne = samotný kód). `EP*` so skupinou `EP` dá EP1 a EP2 do jednej skupiny, hoci zostávajú samostatnými čiarami.
   - **Použitie**: Body, Hrana zlomu alebo Vynechať, pre prípad, keď sa skupina objaví prvýkrát (alebo to nechajte na tabuľku **Body**).
   - **Popis**: dlhý názov, zobrazený vo **Vlastnostiach** bodu.
3. Stĺpec **Body** počíta body, ktoré každý kľúč zachytí, počas písania. Prvý kľúč, ktorý sa zhoduje s kódom, vyhráva.
4. Kliknite na {{ui:Použiť}}. Skupiny, povrch a pôdorys sa podľa toho zmenia v jednom kroku: {{key:Mod+Z}} to vráti späť.

Skupina si ponechá použitie, ktoré jej dáte v tabuľke **Body**; použitie kľúča ho nastaví iba pre novú skupinu. Kľúče a kódy čiar sa ukladajú do súboru projektu.
