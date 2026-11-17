---
title: Problémy a BCF
summary: Připněte problém k výkresu, ke staničení osy, k bodu povrchu nebo k potrubí, přiřaďte mu stav a komentáře a vyměňujte problémy jako soubory BCF 2.1 vedle souboru LandXML.
keywords: problém, problémy, bcf, komentář, poznámka, závada, vada, staveniště, špendlík, stav, otevřeno, vyřešeno, uzavřeno, formát pro spolupráci BIM, landxml, problémy
from: e44153b1
---

Problém je poznámka připnutá k místu ve vašem výkresu CivilCraft, s názvem, stavem a komentáři. Použijte ji, abyste řekli pracovníkům na stavbě nebo jinému programu, na co se mají podívat, a abyste si přečetli jejich odpovědi.

## Přidání problému

1. Otevřete **Povrch, Více, Problémy (BCF)...**
2. Zadejte název a popis toho, co je špatně.
3. Vyberte, kam problém připnout: střed půdorysu, bod povrchu uprostřed, staničení vybrané osy trasy (zadejte staničení a odsazení; vpravo je kladné), nebo vybrané potrubí, stavbu nebo hranovou čáru.
4. Stiskněte **Přidat problém**. Připnutí se zobrazí na výkresu jako malý kosočtverec s číslem.

Klikněte na název problému, abyste na něj přiblížili, změňte jeho stav v seznamu (Otevřeno, Aktivní, Vyřešeno, Uzavřeno) a přidejte komentáře. Každou změnu lze vrátit jedním krokem zpět a problémy se ukládají do souboru projektu.

## Výměna jako BCF

- **Exportovat BCF** zapíše soubor BCF 2.1 s jedním tématem na každý problém: název, stav, komentáře a jeden pohled s ortogonální kamerou půdorysu a připnutím.
- **Importovat BCF** načte soubor BCF (soubory 2.0 a 3.0 se čtou, pokud odpovídají verzi 2.1). Téma s guid, které už máte, aktualizuje tento problém (stav, nové komentáře), místo aby přidalo druhý.
- **Z problémů** vytvoří problém z každé otevřené položky v panelu Problémy, která uvádí, kde se nachází.

BCF nese metry v souřadnicích tohoto projektu bez posunu. Druhý program musí být ve stejném souřadnicovém systému jako váš soubor LandXML, aby připnutí skončila na správném místě. Prvek, na který připnutí ukazuje (osa, staničení, odsazení, potrubí), se přenáší jako štítky začínající „cc:“, které CivilCraft čte zpět.

## Co není ověřeno

Připnutí a pohledy jsme ověřili jen zápisem souboru a jeho čtením zpět v CivilCraftu. Zatím je neotevřel žádný jiný BIM program. Zda BCF „view to world scale“ znamená celou nebo polovinu výšky pohledu, se mezi programy liší: CivilCraft zapisuje celou výšku.
