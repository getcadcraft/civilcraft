---
title: Rozmiestniť solárne polia na teréne
summary: Umiestnite pozemné solárne stoly v parcele alebo plošine, s radmi rozmiestnenými podľa terénu, na ktorom každý stôl skutočne stojí, strmý terén nechajte prázdny, vypočítajte ročnú energiu a zobrazte stoly na pôdoryse a v 3D.
keywords: solárne, PV, fotovoltika, pole, pozemná montáž, stoly, rady, rozstup radov, tieň, terén, sklon, piloty, výnos, kWp, energia, horizont
from: 95593fd6
---

## Čo sa naučíte

Ako rozmiestniť pole solárnych stolov na lokalite, ktorá nie je rovná, a čo znamenajú čísla. Otvorte to cez Povrch › Viac › Solárne polia.

## Rozmiestnenie stolov

1. Vyberte **Kde**: parcelu alebo plošinu projektu, alebo napíšte rohy oblasti. Označte všetky plošiny alebo parcely, ktoré musia zostať **prázdne** (budova, jazierko).
2. Napíšte **zemepisnú šírku a dĺžku** lokality. Slnko od nich závisí; nič sa neodhaduje. Ak projekt má súradnicový systém, **Umiestniť zo súradnicového systému** ich doplní.
3. Nastavte sklon, orientáciu (prázdne znamená smerom k rovníku), koľko modulov tvorí jeden stôl, a výkon a veľkosť modulu. Číselné hodnoty modulu sú najprv všeobecné a takto aj označené; zadajte vlastné.
4. Stlačte **Rozmiestniť stoly**. Okno zobrazí počet stolov a modulov, veľkosť v kWp a vzdialenosť medzi radmi.

Každý stôl je stĺpec v oblasti, umiestnený spredu a posúvaný dozadu. Stôl sa umiestni iba tam, kde je terén pod ním v rámci limitu sklonu, vnútri oblasti a odstupu od hranice a kde piloty, ktoré potrebuje, nie sú vyššie ako nastavený limit. Miesta, ktoré neprejdú, zostanú prázdne a okno uvedie, koľko ich je a prečo.

## Rady sú rozmiestnené podľa terénu

Na rovnom teréne sú rady od seba vzdialené podľa obvyklého pravidla bez tieňa: tieň radu na poludnie na zimný slnovrat nesmie dosiahnuť spodnú hranu radu za ním. Na svahu CivilCraft uplatní to isté pravidlo na terén, na ktorom skutočne stojí nasledujúci rad. Tam, kde terén za stolom stúpa, môžu rady stáť bližšie; kde klesá, stoja ďalej od seba. Okno zobrazí najmenší, najväčší a priemerný rozstup vedľa rozstupu na rovnom teréne, aby ste videli, čo terén urobil.

Rovina stola je zdvihnutá na pilotách, kým každý vzorkovací bod pod ňou nie je nad terénom o nastavenú svetlú výšku. Najvyššia pilota sa zobrazí vo výsledku.

## Ročná energia

**Ročná energia** vypočíta osvetlenie naklonenej roviny pre reprezentatívny deň každého mesiaca, teplotu článku, zadané straty, vzájomné tienenie stolov a kopce na horizonte, ktoré odoberajú slnko, ktoré inak zakrývajú. Obloha je jasná, takže výsledok je horná hranica; skutočné počasie dá menej. Je to odhad v ranej fáze návrhu, nie hlásenie o výnose.

## Uchovanie

**Uložiť do projektu** uchová vstupy a čísla v súbore projektu; stoly sa pri otvorení súboru znova vypočítajú z terénu, takže zmenený povrch ich posunie. Zobrazia sa v pôdoryse a v 3D (Zobraziť › Solárne polia). Zoznam stolov sa stiahne ako CSV. Jeden krok späť odstráni alebo obnoví pole.

## Ešte nie je hotové

Údaje o počasí namiesto jasnej oblohy, stoly, ktoré sledujú terén v smere východ–západ, sledovače a elektrický návrh (reťazce, vodiče, meniče) v CivilCraft. Panel Solar PV v BimCraft má reťazce a jednopólovú schému pre strechy.
