---
title: Rozmístit solární pole na terénu
summary: Umístěte solární stoly montované na zem uvnitř parcely nebo plošiny, s řadami rozestavenými podle terénu, pod nímž každá skutečně stojí, prázdným strmým terénem, vypočtenou roční výrobou energie a stoly zobrazenými v půdorysu i ve 3D.
keywords: solární, pv, fotovoltaika, pole, montáž na terén, stoly, řady, rozestup řad, stín, terén, sklon, piloty, výnos, kWp, energie, horizont
from: 95593fd6
---

## Co se naučíte

Jak rozmístit pole solárních stolů na lokalitě, která není rovná, a co čísla znamenají. Otevřete to přes Povrch › Více › Solární pole.

## Rozmístění stolů

1. Zvolte **Kde**: parcelu nebo plošinu projektu, nebo zadejte rohy oblasti. Zaškrtněte všechny plošiny nebo parcely, které mají zůstat **prázdné** (budova, rybník).
2. Zadejte **zeměpisnou šířku a délku** lokality. Na nich závisí poloha Slunce; nic se nedomýšlí. Pokud má projekt souřadnicový systém, **Určit ze souřadnicového systému** je doplní.
3. Nastavte sklon, orientaci (prázdné pole znamená směr k rovníku), počet modulů v jednom stolu a výkon a rozměr modulu. Čísla modulů jsou zpočátku obecné hodnoty a jsou tak označena; zadejte vlastní.
4. Stiskněte **Rozmístit stoly**. Okno uvede počet stolů a modulů, velikost v kWp a vzdálenost řada od řady.

Každý stůl je sloupec v oblasti, umístěný od přední strany a postupně směrem dozadu. Stůl se umístí jen tam, kde je terén pod ním v limitu sklonu, uvnitř oblasti a odstupu a kde piloty, které potřebuje, nejsou vyšší než limit, který jste nastavili. Místa, která nevyhovují, zůstanou prázdná a okno uvede, kolik jich je a proč.

## Řady jsou rozestaveny podle terénu

Na rovině stojí řady od sebe podle obvyklého pravidla bez stínu: stín řady v poledne při zimním slunovratu nesmí dosáhnout dolní hrany řady za ní. Na svahu CivilCraft použije stejné pravidlo na terén, na kterém skutečně stojí následující řada. Kde terén za stolem stoupá, mohou řady stát blíž; kde klesá, stojí dál od sebe. Okno vedle rozestupu na rovině ukazuje nejmenší, největší a průměrný rozestup, takže vidíte, co terén udělal.

Rovina stolu je zvednuta na pilotách tak, aby každý vzorek pod ní byl nad terénem o nastavenou světlou výšku. Nejvyšší pilota se ukáže ve výsledku.

## Roční výroba energie

**Roční výroba energie** počítá světlo na nakloněné rovině pro reprezentativní den každého měsíce, teplotu článků, zadané ztráty, vzájemné zastínění stolů a kopce na horizontu, které zakrývají slunce. Obloha je jasná, takže výsledek je horní odhad; skutečné počasí dá méně. Jde o předběžný odhad pro rané návrhy, ne o zprávu o výnosu.

## Uložení

**Uložit do projektu** uchová vstupy a čísla v souboru projektu; stoly se znovu spočítají z terénu při otevření souboru, takže změněný povrch je přesune. Zobrazují se v půdorysu a ve 3D (Zobrazit › Solární pole). Seznam stolů se stáhne jako CSV. Jeden krok zpět pole odstraní nebo obnoví.

## Ještě není hotovo

Údaje o počasí místo jasné oblohy, stoly, které sledují terén ve směru východ–západ, sledovače a elektrický návrh (řetězce, vodiče, střídače) v CivilCraft. Panel Solar PV v BimCraft má řetězce a jednopólové schéma pro střechy.
