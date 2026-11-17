---
title: Beskrywingssleutels en lynkodes
summary: Draai veldkodes om in puntgroepe met beskrywings, en verbind gekodeerde punte in lyne (begin, einde, sluit) wat breeklyne word.
keywords: beskrywingssleutels, veldkodes, lynkodes, figure, lynwerk, begin, einde, sluit, puntgroepe, kodes, opmetingskodes, dataversamelaar, breeklyne, randsteen, rand van plaveisel
from: b3d1af8d
---

Opmetingspanne kodeer elke skoot in die veld: `EP` vir rand van plaveisel, `TC` vir bo van randsteen, `BLDG` vir 'n gebouhoek. Die kode is die eerste woord van die punt se beskrywing. CivilCraft groepeer punte daarvolgens, en draai lynkodes daarna in lyne om.

## Lynkodes

'n Lynkode is die woord net ná die veldkode:

| Beskrywing | Betekenis |
|---|---|
| `EP B` | Begin 'n nuwe rand-van-plaveisellyn by hierdie punt |
| `EP` | Gaan voort met die huidige EP-lyn |
| `EP E` | Beëindig die huidige EP-lyn by hierdie punt |
| `BLDG C` | Sluit die gebou: verbind hierdie punt terug aan die lyn se eerste punt |

Punte met dieselfde kode word in puntnommervolgorde verbind. Verskillende kodes is verskillende lyne, selfs as hulle 'n groep deel, so `EP1` en `EP2` gee twee rande op een slag. 'n Kode wat nooit 'n lynkode gebruik nie, word deur al sy punte verbind, soos in vroeëre weergawes.

Lyne in 'n groep wat as **Breeklyn** gebruik word, word breeklyne, een per lyn, sodat 'n randsteen met 'n opening nie oor die opening uitgerek word nie. Lyne in ander groepe word op die plan geteken (laag V-NODE-LINE) en gaan in DXF, DWG en PDF uit.

Die woorde vir begin, einde en sluit is `B`, `BEG`, `START`; `E`, `END`; en `C`, `CLO`, `CLOSE`. Verander hulle, of skakel lynkodes af, in die dialoog hieronder.

## Beskrywingssleutels

'n Beskrywingssleutel draai 'n kode om in 'n puntgroep, 'n gebruik en 'n lang beskrywing.

1. Onder **Punte**, klik {{ui:Beskrywingssleutels en lynkodes}}.
2. Klik {{ui:Voeg 'n sleutel by}} en vul die ry in:
   - **Kode**: die veldkode om mee te pas. `*` staan vir enige karakters en `?` vir een, so `EP*` vang EP, EP1 en EP12.
   - **Groep**: die puntgroep waarby hierdie punte aansluit (leeg = die kode self). `EP*` met groep `EP` plaas EP1 en EP2 in een groep terwyl hulle aparte lyne bly.
   - **Gebruik**: Punte, Breeklyn of Weggelaat, vir wanneer die groep die eerste keer verskyn (of laat dit aan die **Punte**-tabel oor).
   - **Beskrywing**: die lang naam, wat in 'n punt se **Eienskappe** gewys word.
3. Die **Punte**-kolom tel die punte wat elke sleutel vang terwyl jy tik. Die eerste sleutel wat by 'n kode pas, wen.
4. Klik {{ui:Pas toe}}. Die groepe, die oppervlak en die plan volg in een stap: {{key:Mod+Z}} ontdoen dit.

'n Groep behou die gebruik wat jy hom in die **Punte**-tabel gegee het; 'n sleutel se gebruik stel dit net vir 'n groep wat nuut is. Die sleutels en lynkodes word in die projeklêer gestoor.
