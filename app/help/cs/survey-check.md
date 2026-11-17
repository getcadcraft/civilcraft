---
title: Zkontrolovat zaměřovací výkres při importu
summary: Načtěte výšky zapsané jako text nebo v atributech bloků jako zaměřené body a zkontrolujte DWG nebo DXF na chybné jednotky, chybějící souřadnicový systém, počátek daleko od dat, ploché vrstevnice, podivné výšky a zdvojené body, než z něj vytvoříte terén.
keywords: kontrola zaměření, kontrola importu, zaměřené výšky, bodové výšky, výšky jako text, atributy, jednotky, souřadnicový systém, daleko od počátku, vrstevnice na nule, odlehlé hodnoty, duplicitní body, problémy, krajinný architekt, zaměřovací výkres
from: d46acd24
---

Zaměřovací výkres může vypadat správně a přitom být pro terén špatný: jeho jednotky mohou být odhadnuty, vrstevnice mohou ležet placatě ve výšce 0, nebo jeho výšky mohou být zapsány jako text, který vůbec není geometrie. Sekce **Zaměřené výšky a kontrola** v dialogu {{ui:Čáry}} (viz [Otevřít DWG nebo DXF jako čáry](topic:open-dwg-dxf)) načte tyto výšky a řekne, co vypadá špatně, dříve než se cokoli přidá.

## Výšky zapsané jako text nebo v atributech

Mnoho zaměřovacích výkresů uvádí bodovou výšku jako malý text vedle křížku, například `104.37` nebo `EL 104.37`, nebo jako atribut bodového bloku. Nejsou to čáry, takže čtečka čar je vynechá. Sekce uvede, kolik jich našla, a můžete je vzít jako **zaměřené body**:

1. Zaškrtněte **Vzít … výšek jako zaměřené body**. Zpočátku jsou nezaškrtnuté, protože ne každé číslo ve výkresu je výška.
2. Text se načte, když je výškou samostatně: číslo s desetinnou částí (`104.37`, `+104,37`, `-3.50`), nebo číslo za `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` nebo `LEVEL`, s volitelným `m`, `ft` nebo `'` za ním. Samotné celé číslo (`12`) se čte jako číslo parcely nebo listu, ne jako výška; text jako `GATE 3` nebo datum se nikdy nečte. Kódy formátování textu se ignorují.
3. U atributů bloku zvolte **Atribut bloku, který drží výšku**. CivilCraft najde štítek ELEV, Z, LEVEL, RL nebo podobný sám; jiný zvolte ze seznamu, pokud výkres používá vlastní. Volba se pamatuje pro daný název souboru na tomto počítači, takže jeho opětovné otevření začne na stejném štítku. Štítek, který zvolíte, bere i celá čísla jako výšky.
4. Klikněte na {{ui:Přidat}}. Body se očíslují za nejvyšším číslem v projektu, každý bod se popíše svou vrstvou (nebo svým blokem) a výšky se převedou na jednotky projektu jako zbytek výkresu. Vše je jeden krok: {{key:Mod+Z}} body odebere.

Text sedí ve svém vkládacím bodu (nebo v bodu zarovnání, je-li jeden). Text uvnitř bloků se nečte a výkres se nikdy nemění.

## Kontrola

Kontrola běží na tom, co se chystáte přinést, a vypíše, co najde, po jednom řádku pro každý druh problému:

| Hlásí | Co to znamená |
|---|---|
| **Jednotky neuvedeny** | Výkres neříká, jaké má jednotky, takže jeho čísla se čtou jako jednotky projektu. Zkontrolujte jednu vzdálenost, kterou znáte. |
| **Jednotky převedeny** | Jednotky výkresu se liší od jednotek projektu a jsou přepočítány (poznámka, ne chyba). |
| **Data zabírají … km** nebo **… m** | Rozsah je větší než 200 km nebo menší než půl metru, což obvykle znamená špatnou jednotku (milimetry načtené jako metry, nebo naopak). |
| **Žádný souřadnicový systém** | Projekt žádný nemá. Je to varování, když data leží daleko od nuly, jako souřadnice státní rovinné nebo národní sítě. Viz [Souřadnicové systémy](topic:coordinate-systems). |
| **Daleko od počátku** | Data leží více než 100 km od nuly. Daleko od nuly 3D pohledy a exporty ztrácejí přesnost a třesou se. |
| **Vrstva vrstevnic … nemá výšku** | Vrstva pojmenovaná jako vrstevnice (TOPO, CONT, CNTR, CONTOUR) obsahuje čáry ve výšce 0, takže terén z nich vytvořený by byl placatý. |
| **Výšky přesně 0** | Některé výšky jsou 0, zatímco typická výška je od ní daleko: pravděpodobně chybějí výšky. |
| **Výšky daleko od ostatních** | Několik výšek leží daleko mimo ostatní (porovnáno proti střední hodnotě všech výšek, takže strmá lokalita s širokým rozsahem se neoznačí), nebo nad 9,000 m či pod -11,000 m. |
| **Body na jiném bodě** | Dva body na stejném místě se stejnou výškou, nebo s různými výškami. |

Po kliknutí na {{ui:Přidat}} jdou stejné řádky do **Problémy**, jeden pro každý druh, se jménem souboru, abyste se k nim mohli vrátit. Kontrola posuzuje výkres; nic v něm nemění a nebrání vám výkres použít.

:::tip
Když kontrola hlásí vrstevnice placaté na 0 a jsou tu výšky zapsané jako text, vezměte výšky jako zaměřené body: často nesou skutečné výšky, které vrstevnicím chybí.
:::

## Co se nekontroluje

Kontrola neporovnává výkres s druhým zaměřením a nedokáže rozpoznat, v jakém souřadnicovém systému je výkres: jen řekne, že žádný není nastaven.
