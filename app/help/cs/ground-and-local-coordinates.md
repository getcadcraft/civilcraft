---
title: Terénní a místní souřadnice
summary: Pracujte v terénních (povrchových) souřadnicích přepočtených z mřížky pomocí kombinovaného měřítkového faktoru, který zadáte nebo spočítáte v bodě, nebo v předpokládané místní síti navázané na systém dvěma řídicími body.
keywords: terénní souřadnice, povrchové souřadnice, mřížka na terén, kombinovaný měřítkový faktor, csf, kombinovaný faktor, faktor mřížky, faktor výšky, faktor hladiny moře, konvergence, úhel zobrazení, měřítkový faktor, předpokládané souřadnice, místní souřadnice, místní síť, 5000 5000, řídicí body, lokalizace, kalibrace, dvoubodová, uzávěrová chyba
from: 3d7453de
---

Souřadnice státní roviny a UTM jsou **mřížkové** souřadnice: zobrazení mapy mírně protahuje nebo zkracuje vzdálenosti (desítky ppm) a čím výše leží místo, tím víc se měřená terénní vzdálenost liší od mřížkové. Mnohé zaměření proto předává **terénní** souřadnice, přepočtené tak, aby vzdálenosti v půdorysu odpovídaly vzdálenostem měřeným v terénu, nebo **předpokládanou** místní síť (5000, 5000 v řídicím bodě). CivilCraft ponechá vaše čísla beze změny a zaznamená, jak souvisejí s mřížkou, takže zeměpisná šířka a délka, soubory GIS i mapové vrstvy stále skončí na správném místě.

Otevřete {{ui:Coordinates}} ve skupině {{ui:GIS}}, zvolte (nebo ponechte) systém a pak pod **Mřížkové, terénní nebo místní souřadnice** vyberte:

| Volba | Vaše souřadnice jsou | Jak souvisejí s mřížkou |
|---|---|---|
| {{ui:Grid}} | Vlastní souřadnice systému (výchozí) | Stejná čísla |
| {{ui:Ground}} | Přepočteny na terénní vzdálenosti | mřížka = základ + kombinovaný faktor × (terén − základ) |
| {{ui:Local}} | Předpokládaná místní síť | Posunuty, otočeny a přepočteny na mřížku dvěma řídicími body |

Cokoli zvolíte, se uloží s projektem a je to jeden krok zpět; nic se nepřesune.

## Terénní souřadnice

1. Zvolte {{ui:Ground}}.
2. Napište **Kombinovaný měřítkový faktor** ze zaměření (například `0.99987`), nebo ho spočtěte:
   1. Pod **Spočítat faktor v bodě** začíná bod uprostřed projektu. Zvolte {{ui:Pick a point on the plan}} a klikněte na místo (kliknutí blízko bodu zaměření vezme tento bod), nebo napište E a N.
   2. Výška se získá z povrchu v tom místě; pokud potřebujete jinou, napište ji.
   3. Zvolte {{ui:Compute}}. CivilCraft zobrazí:
      - **Měřítkový faktor mřížky k**: jak moc zobrazení mapy tam protahuje vzdálenosti.
      - **Faktor výšky**: o kolik jsou vzdálenosti na elipsoidu kratší než v dané výšce.
      - **Kombinovaný faktor** = k × faktor výšky: vzdálenost v mřížce = terénní vzdálenost × tento faktor.
      - **Konvergence**: úhel od severu mřížky k pravému severu v tom místě (geodetický azimut = azimut mřížky + konvergence).
   4. Zvolte tlačítko {{ui:Use}} pod čísly, aby se kombinovaný faktor vložil do pole.
3. Nastavte **Základní bod**, kde jsou terénní a mřížkové souřadnice shodné. Začíná na 0, 0: většina jurisdikcí, které publikují terénní souřadnice, měří od počátku, takže terénní souřadnice zůstávají poznatelně blízko mřížkovým. Některá zaměření měří od řídicího bodu projektu: použijte to, co říká zaměření.
4. Zvolte {{ui:Apply}}.

:::warning
Výška se bere jako výška nad elipsoidem. CivilCraft nemá model geoidu, takže tam, kde je geoid 30 m (100 ft) pod nebo nad elipsoidem, je faktor výšky mimo zhruba o 5 ppm. Pokud zaměření uvádí svůj kombinovaný faktor, napište ten.
:::

## Místní (předpokládané) souřadnice

1. Zvolte {{ui:Local}}.
2. Pro **Řídicí bod 1** napište číslo bodu zaměření (nebo zvolte {{ui:Pick}} a klikněte na něj v půdorysu). Jeho místní souřadnice se zobrazí vedle něj.
3. Napište jeho **mřížkové** E a N, nebo jeho zeměpisnou šířku a délku do třetího pole (například `30.2672, -97.7431`).
4. Totéž pro **Řídicí bod 2**, co nejdál od prvního.
5. CivilCraft zobrazí nalezené **Měřítko** a **Natočení** a připomene: **Dva body vždy sedí přesně – zkontrolujte třetí.**
6. Zadejte **Kontrolní bod** stejným způsobem. CivilCraft ukáže, jak daleko ho dané přizpůsobení odsune od mřížkových souřadnic, které jste zadali (jeho uzávěrová chyba, v jednotkách projektu a v ppm). Velká uzávěrová chyba znamená špatný bod, překlep, nebo souřadnice v jiné jednotce.
7. Zvolte {{ui:Apply}}.

Měřítko daleko od 1 (za hranicí 0.5 až 2) se odmítne: zkontrolujte body a jejich jednotky.

## Co bylo ověřeno

- Měřítkový faktor a konvergence se shodují s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knihovnou souřadnic, kterou používá většina GIS programů, na 1 část z miliardy u více než 300 systémů s konformními zobrazeními (státní rovina, UTM, příčné Mercatorovo, Lambertovo kuželové), a v prohlížeči u bodu zvoleného v půdorysu.
- Kroky terénu a místních souřadnic se převádějí tam i zpět na 1 část z miliardy; dva řídicí body vrátí měřítko a natočení, ze kterých vznikly; kontrolní bod vzdálený 0.05 ft ukáže uzávěrovou chybu 0.05 ft.
