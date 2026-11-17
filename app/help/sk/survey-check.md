---
title: Skontrolovať geodetický výkres pri importe
summary: Načítajte výšky zapísané ako text alebo v atribútoch blokov ako geodetické body a skontrolujte DWG alebo DXF na chybné jednotky, chýbajúci súradnicový systém, vzdialený počiatok, ploché vrstevnice, podivné výšky a zdvojené body, skôr než z neho vytvoríte terén.
keywords: geodetické meranie, kontrola importu, výšky z merania, bodové výšky, výšky ako text, atribúty, jednotky, súradnicový systém, ďaleko od počiatku, vrstevnice na nule, odľahlé hodnoty, zdvojené body, problémy, krajinný architekt, geodetický výkres
from: d46acd24
---

Geodetický výkres môže vyzerať správne a byť pre terén chybný: jeho jednotky môžu byť len odhadnuté, jeho vrstevnice môžu ležať ploché na výške 0, alebo jeho výšky môžu byť zapísané ako text, ktorý vôbec nie je geometria. Sekcia **Geodetické výšky a kontrola** v dialógu {{ui:Čiary}} (pozri [Otvoriť DWG alebo DXF ako čiary](topic:open-dwg-dxf)) načíta tieto výšky a povie vám, čo vyzerá zle, skôr než sa čokoľvek pridá.

## Výšky zapísané ako text alebo v atribútoch

Mnohé geodetické výkresy dávajú bodovú výšku ako malý text vedľa krížika, napríklad `104.37` alebo `EL 104.37`, alebo ako atribút bodového bloku. Nie sú to čiary, takže čítač čiar ich vynechá. Sekcia uvedie, koľko ich našla, a umožní vám vziať ich ako **geodetické body**:

1. Zaškrtnite **Vziať … výšok ako geodetické body**. Sú na začiatku nezaškrtnuté, pretože nie každé číslo vo výkrese je výška.
2. Text sa načíta, keď je výška sama osebe: číslo s desatinnou časťou (`104.37`, `+104,37`, `-3.50`), alebo číslo za EL, ELEV, RL, FFL, GL, TW, BW, INV, Z alebo LEVEL, s voliteľným `m`, `ft` alebo `'` za ním. Samotné celé číslo (`12`) sa berie ako číslo parcely alebo listu, nie ako výška; text ako `GATE 3` alebo dátum sa nikdy nenačíta. Formátovacie kódy textu sa ignorujú.
3. Pri atribútoch blokov vyberte **Atribút bloku, ktorý obsahuje výšku**. CivilCraft nájde sám značku ELEV, Z, LEVEL, RL alebo podobnú; ak výkres používa vlastnú, vyberte inú zo zoznamu. Voľba sa pamätá pre tento názov súboru na tomto počítači, takže pri ďalšom otvorení začne na tej istej značke. Značka, ktorú vyberiete, berie aj celé čísla ako výšky.
4. Kliknite na {{ui:Pridať}}. Body sa očíslujú za najvyššie číslo v projekte, každý bod sa opíše svojou vrstvou (alebo blokom) a výšky sa prevedú na jednotky projektu ako zvyšok výkresu. Všetko je jeden krok: {{key:Mod+Z}} body odstráni.

Text sa nachádza v svojom vkladacom bode (alebo v bode zarovnania, ak ho má). Text vnútri blokov sa nenačíta a výkres sa nikdy nemení.

## Kontrola

Kontrola beží na tom, čo sa chystáte priniesť, a vypíše, čo nájde, jeden riadok pre každý druh problému:

| Hlási | Čo to znamená |
|---|---|
| **Jednotky nie sú uvedené** | Výkres neuvádza svoje jednotky, takže jeho čísla sa čítajú ako jednotky projektu. Overte jednu vzdialenosť, ktorú poznáte. |
| **Jednotky prevedené** | Jednotky výkresu sa líšia od jednotiek projektu a sú prepočítané (poznámka, nie chyba). |
| **Údaje zaberajú … km** alebo **… m** | Rozsah je väčší ako 200 km alebo menší ako pol metra, čo zvyčajne znamená zlú jednotku (milimetre čítané ako metre, alebo naopak). |
| **Nie je súradnicový systém** | Projekt ho nemá. Je to varovanie, keď údaje ležia ďaleko od nuly, ako súradnice štátnej roviny alebo národnej siete. Pozri [Súradnicové systémy](topic:coordinate-systems). |
| **Ďaleko od počiatku** | Údaje ležia viac ako 100 km od nuly. Ďaleko od nuly 3D zobrazenia a exporty strácajú presnosť a trasú sa. |
| **Vrstva vrstevníc … nemá výšku** | Vrstva pomenovaná ako vrstevnice (TOPO, CONT, CNTR, CONTOUR) obsahuje čiary vo výške 0, takže terén z nich vytvorený by bol plochý. |
| **Výšky presne 0** | Niektoré výšky sú 0, hoci typická výška je ďaleko od nej: pravdepodobne chýbajú výšky. |
| **Výšky ďaleko od ostatných** | Niekoľko výšok leží ďaleko mimo ostatných (zistené voči stredu všetkých výšok, takže strmá lokalita so širokým rozsahom sa neoznačí), alebo nad 9,000 m či pod -11,000 m. |
| **Body na inom bode** | Dva body na tom istom mieste s rovnakou výškou, alebo s rôznymi výškami. |

Po kliknutí na {{ui:Pridať}} sa tie isté riadky pošlú do **Problémy**, jeden pre každý druh, s názvom súboru, aby ste sa k nim mohli vrátiť. Kontrola posudzuje výkres; nič v ňom nemení a nebráni vám výkres použiť.

:::tip
Keď kontrola hlási, že vrstevnice sú ploché na 0 a sú tu výšky zapísané ako text, vezmite výšky ako geodetické body: často nesú skutočné výšky, ktoré vrstevniciam chýbajú.
:::

## Čo sa nekontroluje

Kontrola neporovnáva výkres s druhým zameraním a nedokáže zistiť, v akom súradnicovom systéme je výkres: hovorí len to, že žiadny nie je nastavený.
