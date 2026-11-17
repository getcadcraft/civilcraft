---
title: Terénne a miestne súradnice
summary: Pracujte v terénnych (povrchových) súradniciach odvodených z mriežky kombinovaným mierkovým faktorom, ktorý zadáte alebo vypočítate v bode, alebo v predpokladanej mriežke lokality naviazanej na systém dvoma riadiacimi bodmi.
keywords: terénne súradnice, povrchové súradnice, mriežka na terén, kombinovaný mierkový faktor, csf, kombinovaný faktor, mriežkový faktor, faktor výšky, faktor hladiny mora, konvergencia, uhol zobrazenia, mierkový faktor, predpokladané súradnice, miestne súradnice, mriežka lokality, 5000 5000, riadiace body, lokalizácia, kalibrácia, dva body, nesúhlas
from: 3d7453de
---

Súradnice štátnej roviny a UTM sú **mriežkové** súradnice: zobrazenie mapy trochu roztiahne alebo zmenší vzdialenosti (desiatky ppm) a čím vyššie leží lokalita, tým viac sa namerané terénne vzdialenosti líšia od mriežkových. Mnohé merania preto odovzdávajú **terénne** súradnice, upravené tak, aby vzdialenosti v pôdoryse boli rovnaké ako vzdialenosti nameraté v teréne, alebo **predpokladanú** mriežku lokality (5000, 5000 v riadiacom bode). CivilCraft zachová vaše čísla tak, ako sú, a zaznamená, ako súvisia s mriežkou, takže zemepisná šírka a dĺžka, súbory GIS a mapové hladiny stále pristanú na správnom mieste.

Otvorte {{ui:Coordinates}} v skupine {{ui:GIS}}, vyberte (alebo ponechajte) systém a potom pod **Mriežka, terén alebo miestne súradnice** zvoľte:

| Voľba | Vaše súradnice sú | Vzťah k mriežke |
|---|---|---|
| {{ui:Grid}} | Vlastné súradnice systému (začiatok) | Tie isté čísla |
| {{ui:Ground}} | Upravené na terénne vzdialenosti | mriežka = základ + kombinovaný faktor × (terén − základ) |
| {{ui:Local}} | Predpokladaná mriežka lokality | Posunutá, otočená a upravená na mriežku dvoma riadiacimi bodmi |

Čokoľvek zvolíte, sa uloží s projektom a je to jeden krok späť; nič sa nehýbe.

## Terénne súradnice

1. Zvoľte {{ui:Ground}}.
2. Zadajte **Kombinovaný mierkový faktor** z merania (napríklad `0.99987`), alebo ho vypočítajte:
   1. Pod **Vypočítať faktor v bode** je bod na začiatku v strede projektu. Zvoľte {{ui:Pick a point on the plan}} a kliknite na miesto (kliknutie blízko bodu merania vezme tento bod), alebo zadajte E a N.
   2. Výška sa berie z povrchu v tom bode; ak potrebujete inú, zadajte ju.
   3. Zvoľte {{ui:Compute}}. CivilCraft zobrazí:
      - **Mriežkový mierkový faktor k**: koľko zobrazenie mapy tam roztiahne vzdialenosti.
      - **Faktor výšky**: o koľko sú vzdialenosti kratšie na elipsoide než vo výške lokality.
      - **Kombinovaný faktor** = k × faktor výšky: mriežková vzdialenosť = terénna vzdialenosť × tento faktor.
      - **Konvergencia**: uhol od mriežkového severu k pravému severu v tom mieste (geodetický azimut = mriežkový azimut + konvergencia).
   4. Zvoľte tlačidlo {{ui:Use}} pod číslami, aby sa kombinovaný faktor vložil do políčka.
3. Nastavte **Základný bod**, kde sú terénne a mriežkové súradnice rovnaké. Začína na 0, 0: väčšina jurisdikcií, ktoré zverejňujú terénne súradnice, upravuje mierku okolo začiatku, takže terénne súradnice zostávajú rozpoznateľne blízko mriežkových. Niektoré merania upravujú mierku okolo riadiaceho bodu projektu: použite to, čo hovorí merianie.
4. Zvoľte {{ui:Apply}}.

:::warning
Výška sa berie ako výška nad elipsoidom. CivilCraft nemá model geoidu, takže tam, kde je geoid 30 m (100 ft) pod alebo nad elipsoidom, je faktor výšky mimo približne o 5 ppm. Keď merianie uvádza svoj kombinovaný faktor, zadajte ten.
:::

## Miestne (predpokladané) súradnice

1. Zvoľte {{ui:Local}}.
2. Pre **Riadiaci bod 1** zadajte číslo bodu merania (alebo zvoľte {{ui:Pick}} a kliknite naň v pôdoryse). Jeho miestne súradnice sa zobrazia vedľa.
3. Zadajte jeho **mriežkové** E a N, alebo jeho zemepisnú šírku a dĺžku v treťom políčku (napríklad `30.2672, -97.7431`).
4. To isté urobte pre **Riadiaci bod 2**, čo najďalej od prvého.
5. CivilCraft zobrazí nájdenú **Mierku** a **Otočenie** a pripomenie: **Dva body sa vždy prispôsobia presne – skontrolujte tretí.**
6. Zadajte **Kontrolný bod** rovnako. CivilCraft ukáže, ako ďaleko ho prispôsobenie dá od mriežkových súradníc, ktoré ste zadali (jeho nesúhlas, v jednotkách projektu a v ppm). Veľký nesúhlas znamená chybný bod, preklep alebo súradnice v inej jednotke.
7. Zvoľte {{ui:Apply}}.

Mierka ďaleko od 1 (mimo rozsahu 0.5 až 2) sa odmietne: skontrolujte body a ich jednotky.

## Čo bolo overené

- Mierkový faktor a konvergencia sa zhodujú s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knižnicou súradníc, ktorú používa väčšina programov GIS, na 1 diel v miliarde na viac ako 300 systémoch s konformnými zobrazeniami (štátna rovina, UTM, priečne Mercatorovo, Lambertovo kužeľové) a v prehliadači v bode zvolenom v pôdoryse.
- Terénne a miestne kroky sa prevádzajú tam a späť na 1 diel v miliarde; dva riadiace body vrátia mierku a otočenie, s ktorými vznikli; kontrolný bod 0.05 ft mimo ukáže nesúhlas 0.05 ft.
