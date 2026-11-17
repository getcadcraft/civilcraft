---
title: Klíče popisů a kódy čar
summary: Převádějte kódy v terénu na skupiny bodů s popisy a spojujte kódované body do čar (začátek, konec, uzavření), které se stanou lomovými hranami.
keywords: klíče popisů, kódy v terénu, kódy čar, obrazce, linie, začátek, konec, uzavřít, skupiny bodů, kódy, průzkumné kódy, sběrné zařízení, lomové hrany, obrubník, hrana vozovky
from: b3d1af8d
---

Zaměřovací čety kóduje každé měření v terénu: `EP` pro hranu vozovky, `TC` pro horní hranu obrubníku, `BLDG` pro roh budovy. Kód je první slovo popisu bodu. CivilCraft podle něj seskupuje body a kódy čar za ním převádí na čáry.

## Kódy čar

Kód čáry je slovo hned za kódem v terénu:

| Popis | Význam |
|---|---|
| `EP B` | Začne novou čáru hrany vozovky v tomto bodě |
| `EP` | Pokračuje aktuální čára EP |
| `EP E` | Ukončí aktuální čáru EP v tomto bodě |
| `BLDG C` | Uzavře budovu: spojí tento bod zpět s prvním bodem čáry |

Body se stejným kódem se spojují v pořadí čísel bodů. Různé kódy jsou různé čáry, i když sdílejí skupinu, takže `EP1` a `EP2` dají dvě hrany najednou. Kód, který nikdy nepoužívá kód čáry, se spojí přes všechny své body, jako ve starších verzích.

Čáry ve skupině použité jako **Lomová hrana** se stanou lomovými hranami, jednou pro každou čáru, takže obrubník s mezerou se nenatáhne přes tu mezeru. Čáry v jiných skupinách se kreslí na plán (vrstva V-NODE-LINE) a jdou do DXF, DWG a PDF.

Slova pro začátek, konec a uzavření jsou `B`, `BEG`, `START`; `E`, `END`; a `C`, `CLO`, `CLOSE`. Změňte je nebo vypněte kódy čar v dialogu níže.

## Klíče popisů

Klíč popisu převede kód na skupinu bodů, použití a dlouhý popis.

1. Pod **Body** klikněte na {{ui:Description keys and line codes}}.
2. Klikněte na {{ui:Add a key}} a vyplňte řádek:
   - **Kód**: kód v terénu, který se má shodovat. `*` znamená libovolné znaky a `?` jeden znak, takže `EP*` zachytí EP, EP1 i EP12.
   - **Skupina**: skupina bodů, do které tyto body patří (prázdné = samotný kód). `EP*` se skupinou `EP` dá EP1 a EP2 do jedné skupiny, zatímco zůstávají oddělené čáry.
   - **Použití**: Body, Lomová hrana nebo Vynechat, pro případ, kdy se skupina poprvé objeví (nebo ponechte na tabulce **Body**).
   - **Popis**: dlouhý název, zobrazený ve **Vlastnostech** bodu.
3. Sloupec **Body** počítá body, které každý klíč zachytí, jak píšete. Vyhrává první klíč, který se shoduje s kódem.
4. Klikněte na {{ui:Apply}}. Skupiny, povrch a plán se řídí v jednom kroku: {{key:Mod+Z}} to vrátí zpět.

Skupina si ponechá použití, které jste jí dali v tabulce **Body**; použití klíče ho nastaví jen pro skupinu, která je nová. Klíče a kódy čar se ukládají do souboru projektu.
