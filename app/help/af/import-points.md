---
title: Voer opmetingspunte in
summary: Maak 'n CSV- of tekspuntlêer oop, kontroleer die kolomvolgorde in die dialoog Voer punte in, regstel rye wat nie gelees kan word nie, en sorteer die punte in groepe.
keywords: voer punte in, csv, txt, pnezd, penzd, puntlêer, opmeting, cogo-punte, puntgroepe, kolomme, noordwaarde, oostwaarde
from: ad33d88a
---

'n Puntlêer is 'n tekslêer met een punt per lyn: puntnommer, noordwaarde, oostwaarde, hoogte en beskrywing in een of ander volgorde, geskei deur kommas, tabs, kommapunte of spasies. CivilCraft lees dit in die blaaier en bou dadelik 'n oppervlak daaruit.

## Voor jy begin

- Ken die lêer se kolomvolgorde as jy kan (PNEZD en PENZD lyk dieselfde vir 'n rekenaar).
- Ken sy eenhede. CivilCraft skakel nie om nie: stel **Eenhede** in die linkerpaneel om by die lêer te pas (sien [Eenhede, stasies en getalformate](topic:units-and-stations)).
- Koördinate kan groot wees (staatsvlak-noordwaardes en oostwaardes in die miljoene is in orde).

## Voer die lêer in

1. Klik {{ui:Maak oop}} in die nutsbalk, of druk {{key:Mod+O}}, en kies die lêer. Jy kan dit ook op die plan sleep.
   Die dialoog **Voer punte in** maak oop met die lêernaam, 'n **Kolomme**-lys wat op {{ui:Herken}} gestel is, 'n opsommingslyn en die eerste ses punte.
2. Lees die opsommingslyn. Dit sê hoeveel punte gelees is, in watter kolomvolgorde, hoe daardie volgorde gevind is, en wat die kolomme skei. Die drie maniere waarop die volgorde gevind word:
   - "uit die kopry": die eerste lyn noem sy kolomme (Punt, Noordwaarde, Oostwaarde, Hoogte, Beskrywing, of X, Y, Z …). Dit is die veiligste.
   - "soos gekies": jy het 'n volgorde in **Kolomme** gekies.
   - "geraai uit die kolomtal en jou puntry-instelling (PNEZD), kontroleer dat noord- en oostwaarde nie omgeruil is nie": daar was geen bruikbare kopry nie. As jou lêers gewoonlik oostwaarde eerste het, stel **Puntrye** na P, E, N, Z, D in [CivilCraft-instellings](topic:settings).
3. Kontroleer die voorbeeldtabel. Die kolomme is altyd **Punt**, **Noordwaarde**, **Oostwaarde**, **Hoogte**, **Beskrywing**, ongeag watter volgorde die lêer gebruik. Noord- en oostwaardes van 'n regte terrein is gewoonlik duidelik verskillende groottes: as hulle omgeruil lyk, was die raaiwerk verkeerd.
4. As die volgorde verkeerd is, kies die regte een in **Kolomme** (byvoorbeeld {{ui:PENZD — punt, oos, noord, hoogte, beskrywing}}). Die opsomming en voorbeeld werk dadelik by.
5. Kyk onder die voorbeeld vir **Rye nie gelees nie**. Elke lyn noem die lêer se lynnommer, die rede en die begin van die ry. Sien [Rye wat nie gelees word nie](topic:import-points#rows-that-are-not-read).
6. Klik {{ui:Voer in}}.
   Die punte verskyn op die plan, die aansig zoom na hulle, en die oppervlak word gebou. Die statusbalk sê byvoorbeeld "Ingevoer: 276 punte uit site.csv; oppervlak: 546 driehoeke."

As die projek nog geen naam gehad het nie, neem dit die lêer se naam.

## Kontroleer die groepe

Elke punt behoort aan 'n groep wat genoem word na die **eerste woord van sy beskrywing**, in hoofletters: "GRD", "FL 12" en "fl" is groepe GRD, FL en FL. Punte sonder 'n beskrywing gaan in "(geen beskrywing)".

1. Kyk na die tabel onder **Punte** in die linkerpaneel: groep, aantal punte en 'n **Oppervlak**-keuse.
2. Elke groep begin as {{ui:Punte}}. Verander vloeilyne, rande van plaveisel, bo- en voetpunte van helling, rante en soortgelyke gekodeerde lyne na {{ui:Breeklyn}}. Stel groepe wat nie die grond moet vorm nie (beheerpunte, boomtoppe, nutspale wat by die bokant gemeet is) na {{ui:Uitgelaat}}.
3. Klik 'n punt op die plan (met {{ui:Kies}}) om sy nommer, koördinate, hoogte, beskrywing en groep in die regterpaneel te sien.

:::warning
'n Breeklyn-groep voeg **al** sy punte in **een** lyn saam, in puntnommervolgorde. Dit werk wanneer elke gekodeerde lyn in volgorde met sy eie kode gemeet is. Twee afsonderlike vloeilyne wat albei as "FL" gekodeer is, word een lyn wat heen en weer tussen hulle sigsag. As jou kodes gedeel word, gebruik eerder die {{ui:Breeklyn}}-gereedskap om die punte van elke lyn te klik (sien [Bou en verfyn die oppervlak](topic:build-surface)).
:::

## Rye wat nie gelees word nie

| Rede wat gewys word | Wat dit beteken | Wat om te doen |
|---|---|---|
| "noord- of oostwaarde is nie 'n getal nie" | 'n Koördinaatkolom hou teks | Kontroleer die kolomvolgorde, of 'n los tekslyn in die middel van die lêer |
| "hoogte is nie 'n getal nie" | Die hoogtekolom hou teks | Verkeerde kolomvolgorde, of 'n beskrywing in die hoogtekolom |
| "geen puntnommer nie" | Die puntkolom is leeg | Nommer die punt, of kies 'n volgorde sonder P (NEZD, NEZ …): punte word dan genommer 1, 2, 3 … |
| "punt 12 verskyn twee keer (die eerste een word behou)" | Twee rye deel 'n nommer | Hernommer een van hulle in die lêer as albei regte meetings is |
| "3 kolomme, 5 verwag (PNEZD)" | Die ry is kort | 'n Gebroke lyn, of die verkeerde kolomvolgorde |

'n Punt met 'n leë hoogte word behou, maar dit word nie in die oppervlak gebruik nie. Die **Punte**-feite wys hoeveel punte 'n hoogte het.

Lyne wat met `#`, `;` of `//` begin, is kommentaar en word oorgeslaan. Leë lyne word oorgeslaan.

## Vervang of voeg punte by

Om weer in te voer, **vervang** al die punte; dit voeg nie by hulle nie. Jou belynings, plataforms, pype, getekende breeklyne en grens bly. Die ontdoen-geskiedenis word skoongemaak, so stoor die projek eerste as jy die ou punte dalk terug wil hê. Om twee lêers te kombineer, voeg hulle in 'n teksredigeerder of sigblad saam voordat jy invoer (let op herhaalde puntnommers).

Punte kan nog nie binne CivilCraft verskuif, geredigeer of uitgevee word nie. Herstel hulle in die lêer en voer weer in.

## Verwant

- [Puntlêerformate](topic:point-file-formats): elke kolomvolgorde en hoe kopry herken word.
- [Bou en verfyn die oppervlak](topic:build-surface).
