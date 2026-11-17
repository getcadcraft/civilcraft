---
title: Terén z vrstevníc
summary: Vytvorte povrch terénu z vrstevnicovej mapy: vyberte vrstvy čiar, určte, odkiaľ pochádza výška každej čiary, skontrolujte križovania a duplikáty a vytvorte ho. Vrstevnice sa stanú hranami zlomu, s opravenými plochými trojuholníkmi na hrebeňoch a v údoliach. Mapu prenesenú z obrázka alebo PDF možno zmerať a umiestniť podľa dvoch známych bodov.
keywords: vrstevnice, terén z vrstevníc, povrch z vrstevníc, topografická mapa, geodetická mapa, bez súradníc, hrany zlomu, ploché trojuholníky, hrebeň, údolie, vrchol kopca, križujúce sa vrstevnice, duplicitné vrstevnice, interval vrstevníc, mierka mapy, dva body, umiestnenie mapy, DXF, DWG, shapefile
from: e6161653
---

Geodetická firma niekedy pošle vrstevnicovú mapu: čiary s výškami, ale bez bodov. CivilCraft z tých čiar vytvorí jestvujúci terén.

## Priniesť vrstevnice

Otvorte mapu ako čiary: výkres DXF alebo DWG, shapefile alebo GeoJSON (**GIS** › {{ui:Importovať}}, alebo pretiahnite súbor do pôdorysu). Čiary sa načítajú ako **vrstvy mapy**. Pod **Povrch** › {{ui:Viac}} vyberte {{ui:Terén z vrstevníc}}.

## Určite, odkiaľ pochádza každá výška

Zaškrtnite vrstvy, ktoré obsahujú vrstevnice, potom vyberte **Výška z**:

- {{ui:Vlastné výšky čiar}}: čiara, ktorej všetky vrcholy majú rovnakú výšku (3D polyčiara, alebo polyčiara s výškou). Čiara na 0 je plošná čiara bez výšky.
- **Číselné pole** vrstvy (napríklad ELEV), ak mapa prišla s ním.
- {{ui:Začiatok a interval, v poradí, v akom sú čiary uvedené}}: pre čiary bez akejkoľvek výšky. Prvá uvedená čiara dostane **Výšku prvej čiary**, ďalšia tú istú plus **Interval vrstevníc**, a tak ďalej. Uveďte čiary od najnižšej po najvyššiu (alebo ich preusporiadajte vo vrstve).

## Skontrolujte a potom vytvorte

{{ui:Skontrolovať}} vypíše v slovách, čo je chybné, skôr než sa čokoľvek zmení:

- čiara **bez výšky** alebo s menej ako dvoma bodmi;
- **duplicitná** čiara (rovnaký tvar dvakrát, aj nakreslený opačne);
- dve čiary, ktoré sa **križujú**, pri rôznych výškach alebo pri rovnakej (aj čiara, ktorá križuje sama seba), s miestom;
- výška, ktorá **nie je na intervale** (preklep, napríklad 105.5 na mape s intervalom 1 m).

Zaškrtnite {{ui:Vynechať čiary, ktoré sa s inou križujú}}, aby sa vypustila čiara, ktorá križuje najviac iných (potom ďalšia, kým sa nekrižuje nič). Náhodná čiara, ktorá preťína každú vrstevnicu, je tá, ktorá odpadne, nie vrstevnice. **Zjednodušiť čiary v rámci** zredukuje vrcholy, ktoré sú bližšie k rovnej priamke než zadaná vzdialenosť.

{{ui:Vytvoriť terén}} pridá čiary k jestvujúcemu terénu ako hrany zlomu (jeden krok späť), takže povrch prechádza presne každou vrstevnicou. Keď je zaškrtnuté {{ui:Opraviť ploché trojuholníky na hrebeňoch, v údoliach a na vrcholoch}} a je zadaný interval, CivilCraft tiež pridá bod do každého plochého trojuholníka (trojuholník, ktorého všetky rohy ležia na jednej vrstevnici), vo výške, v ktorej pokračuje susedný svah, nikdy nie viac než pol intervalu od vrstevnice. Bez toho vyjdú hrebene, dná údolí a vrcholy kopcov ako ploché dosky. Na testovacom kopci sa chyba voči skutočnému povrchu znížila o štvrtinu; na hrebeni o 40 %.

## Mapa bez súradníc

Pre vrstevnicovú mapu prenesenú z obrázka alebo PDF otvorte **Zmerať a umiestniť vrstvy podľa dvoch známych bodov**. Zadajte dva body na mape a kde sú v skutočnosti; zaškrtnuté vrstvy sa zmerajú, otočia a posunú, aby sedeli (jeden krok späť; výšky sa nemenia). Tie isté dva body dajú mierku (zobrazená v správe) a otočenie.

Povrch je taký dobrý, ako je mapa: medzi dvoma vrstevnicami je rovina, takže skutočný terén medzi nimi nie je známy. Pred spoliehaním sa na výsledok ho skontrolujte voči bodovým výškam.
