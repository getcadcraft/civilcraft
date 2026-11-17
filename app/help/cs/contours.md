---
title: Čtení vrstevnic, výšek a sklonů
summary: Nastavte interval vrstevnic a hlavní vrstevnice, zobrazte pásma výšek, šipky sklonu a trojúhelníky a čtěte výšky terénu pod kurzorem.
keywords: vrstevnice, interval vrstevnic, hlavní vrstevnice, popisky, pásma výšek, šipky sklonu, trojúhelníky, bodová výška, analýza povrchu, analýza výšek, analýza sklonu
from: 585e500a
---

Povrch se zobrazí s vrstevnicemi hned, jak existuje. Vše v tomto tématu se nastavuje v části **Zobrazení** v levém panelu. Nastavení zobrazení mění jen to, co vidíte (a co exportujete); nejsou to kroky zpět.

## Nastavte interval vrstevnic

1. V části **Zobrazení** vyberte hodnotu v poli **Vrstevnice po**.
   - Ve stopách: 0.25, 0.5, 1, 2, 5, 10 nebo 20 ft.
   - V metrech: 0.1, 0.25, 0.5, 1, 2, 5 nebo 10 m.
2. Vyberte **Hlavní po**: každou 2., 4., 5. nebo 10. vrstevnici.
   Hlavní vrstevnice se kreslí silněji a popisují se svou výškou. Leží na celistvých násobcích hlavního rozestupu (u vrstevnic po 1 ft a každé 5. hlavní: 245, 250, 255 …).
3. Vypněte {{ui:Contour labels}}, pokud se popisky na malém výkresu tísní.

Nový projekt začíná s intervalem 1 jednotka a každou 5. vrstevnicí hlavní. Vrstevnice se ohýbají na lomových hranách; pokud procházejí přes průtočnou čáru nebo hřbet přímo, ta čára ještě není lomovou hranou (viz [Sestavení a úprava povrchu](topic:build-surface)).

:::note
Vrstevnice se kreslí jen tehdy, když je mezi nejnižším a nejvyšším bodem nejvýše 2 000 úrovní. Na staveništi s velkým výškovým rozdílem a velmi malým intervalem se na plánu nezobrazí žádné vrstevnice: zvolte větší interval.
:::

## Vyhlaďte vrstevnice

Vrstevnice se trasují jako přímé úseky, jeden přes každý trojúhelník povrchu, takže se na každé hraně trojúhelníku mírně zalomí. **Vyhlazení vrstevnic** v části **Zobrazení** tyto rohy zaoblí:

- **Žádné (přímé úseky)**: trasované čáry tak, jak jsou. Tak se zobrazují nové nebo starší výkresy.
- **Slabé**: rohy jsou mírně zaoblené. Čára se nikdy nepřesune o více než 10 % cesty k další vrstevnici a nikdy se nevzdálí od svého přímého úseku o více než šestinu jeho délky.
- **Silné**: plynulá křivka. Čára se nikdy nepřesune o více než 25 % cesty k další vrstevnici a nikdy se nevzdálí od svého přímého úseku o více než třetinu jeho délky.

Při obou volbách vyhlazená vrstevnice stále protíná každou hranu trojúhelníku ve stejném bodě jako trasovaná, zůstává uvnitř trojúhelníku, který každý úsek protíná, a proto nemůže protnout ani se dotknout jiné vrstevnice. Tam, kde vrstevnice protíná lomovou hranu nebo hranici, si zachová ostrý zlom. Vykreslují a exportují se vyhlazené čáry (DXF, DWG, PDF, GIS a 3D) a mají více vrcholů než trasované čáry.

Vyhlazení mění jen kreslené čáry. Výšky, objemy, profily a řezy se stále čtou z povrchu samotného. Vrstevnice, která prochází přesně průzkumnými body (bod ve výšce 250,00 na vrstevnici 250), si v každém takovém bodě zachová malý roh.

## Jak vzniká povrch za vrstevnicemi

Vrstevnice sledují povrch a povrch sleduje **Metodu tvorby vrstevnic** v části **Povrch** v levém panelu. Výchozí, **Triangulace s lineární interpolací**, spojí vaše body do trojúhelníků a zachová každý bod a lomovou hranu přesně. Ostatní metody nejprve přizpůsobí body pravidelné mřížce (kriging, minimální křivost, přirozený soused, inverzní vzdálenost a další). To dává zaoblenější vrstevnice mezi body, ale neprochází to přesně každým bodem; zpráva o povrchu v části **Povrch** ukazuje, jak daleko je výsledek od vašich bodů.

**ABOS (aproximace založená na vyhlazování)** je jedna z metod s mřížkou. Má dvě vlastní nastavení: **Hladkost** (0.5 na začátku; nižší je hladší) a **Přesnost** (1 na začátku: povrch se přiblíží na 1 % výškového rozsahu lokality u vašich bodů; zadejte menší číslo pro těsnější shodu). Pokud na dané mřížce nedosáhne přesnosti, zpráva o povrchu to řekne: zadejte menší **Rozteč mřížky**.

## Přečtěte výšku kdekoli

Pohybujte kurzorem nad plánem. Stavový řádek ukazuje:

- **X** a **Y** pod kurzorem
- **Terén** a výšku stávajícího terénu v tomto místě, interpolovanou na trojúhelníku pod kurzorem
- **Upraveno** a navrhovanou výšku, kde plošina nebo koridor změnil terén
- „Mimo povrch“ mimo povrch

Pro přesné přečtení průzkumného bodu zvolte {{ui:Select}} a klikněte na bod: pravý panel ukáže jeho číslo, X, Y, výšku, popis a skupinu.

## Zobrazte pásma výšek

1. Zaškrtněte {{ui:Elevation bands}}.
   Povrch se vybarví od nízké (modrozelená) po vysokou (okrově hnědá) výšku. Legenda pod zaškrtávacími políčky uvádí výškový rozsah každého pásma.
2. Zvolte počet pásem v **Pásma**: 5, 8, 10 nebo 12. Pásma rozdělí rozsah od nejnižší po nejvyšší výšku na stejné kroky.

Pásma slouží jen k prohlížení. Nejsou exportována do DXF ani vykreslována do PDF.

## Zobrazte šipky sklonu

Zaškrtněte {{ui:Slope arrows}}. Krátká šipka na každém trojúhelníku, který je dost velký, ukazuje z kopce. Ploché trojúhelníky šipku nemají. Šipky slouží k rychlé kontrole směru odvodnění; hodnota sklonu zatím popisek nemá.

## Zobrazte trojúhelníky, body a hrany

- {{ui:Triangles}} vykreslí hrany TIN. Zapněte je, když chcete zkontrolovat, jak povrch spojuje body, zejména podél lomových hran a na okraji.
- {{ui:Points}} vykreslí každý průzkumný bod; {{ui:Point labels}} přidá jeho číslo, výšku a popis (nebo méně: viz **Popisky bodů** v [nastavení CivilCraftu](topic:settings)).
- {{ui:Breaklines}} vykreslí lomové hrany (a hranici) oranžově.
- {{ui:Surface edge}} vykreslí obrys povrchu.

## Stávající nebo navrhovaný

Jakmile plošina nebo koridor upraví terén bez potíží, nabídne část **Zobrazení** v **Povrch** volbu {{ui:Proposed (graded)}}. Vrstevnice, pásma a šipky pak ukazují upravený povrch, takže vidíte nový terén a jeho napojení kolem něj. Přepněte zpět na {{ui:Existing ground}}, abyste viděli průzkum.

## Co se exportuje

Výstup DXF a PDF se řídí těmito nastaveními: co jste vypnuli, se nezapíše, a vrstevnice jsou ty z právě zobrazeného povrchu. Pásma výšek se nikdy neexportují.
