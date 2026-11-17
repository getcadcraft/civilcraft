---
title: Ověřte hmoty proti limitům územního plánu, které zadáte
summary: Zadejte ústupy pozemku řádek po řádku, limit výšky, rovinu volného výhledu na oblohu, koeficient podlažních ploch a zastavěnost, na plánu si prohlédněte stavební obálku a přečtěte si, které hmoty který limit porušují.
keywords: územní plán, zoning, ústup, ústupy, přední, boční, zadní, obálka, stavební pole, limit výšky, rovina volného výhledu na oblohu, koeficient podlažních ploch, FAR, zastavěnost, parcela, předpis, kontrola předpisů
from: 3e267b31
---

**CivilCraft nemá v sobě žádný stavební předpis.** Nezná pravidla žádného města a nedodává jejich knihovnu. Každé číslo na této stránce zadáváte vy, převzaté z vaší vlastní vyhlášky, a každý výsledek říká, že je měřen proti limitům, které jste zadali. Je to způsob, jak vidět, jak limity pozemku tvarují budovu, a ne rozhodnutí o tom, zda je návrh přípustný.

## Zadejte limity

V **Vlastnostech**, pod **Hmoty budov**, zvolte **Parcelu** (nebo vyberte hmotu: limity její parcely se zobrazí pod ní). Potom vyplňte, co platí; prázdné pole znamená „bez limitu“:

- **Uliční čára**: hranice pozemku u ulice. **Přední ústup** se vztahuje k ní, **zadní ústup** k čáře nejvzdálenější od ní a **boční ústup** ke zbytku.
- **Limit výšky**.
- **Rovina oblohy**: začíná ve výšce na hranici pozemku a stoupá o hodnotu, kterou zadáte, na každou jednotku vodorovné vzdálenosti dovnitř, měřeno od uliční čáry nebo od každé hranice pozemku (2 znamená 2 ku 1). Výška povolená nad bodem je nejnižší z roviny a limitu výšky.
- **Koeficient podlažních ploch** (hrubá podlahová plocha hmot na pozemku dělená plochou pozemku) a **Zastavěnost** (jejich půdorysy dělené plochou pozemku, zadané v procentech).

## Obálka

Zaškrtněte **Zobrazit obálku na plánu**, aby se nakreslila na vrstvu `A-MASS-ENVL`. Obálka je pozemek zmenšený od každé hranice o ústup té čáry, přičemž odsazené čáry se stýkají ve zkosených rozích. Křivková hranice pozemku se bere jako krátké tětivy v toleranci 0.01 od křivky. Fungují konvexní i konkávní pozemky. Pokud se ústupy přeloží samy přes sebe (hluboký ústup na úzkém nebo velmi konkávním pozemku), obálka neexistuje a Vlastnosti to uvedou; zkuste menší vzdálenosti.

## Výsledek

Pod poli dostane každá hmota a každý limit řádek s fajfkou nebo křížkem:

- **ústupy**: plocha hmoty ležící mimo obálku;
- **výška**: výška hmoty proti nejvyšší povolené hodnotě nad jejím půdorysem (hranol jedné výšky je omezen nejnižší povolenou výškou v kterémkoli jeho rohu);
- **koeficient podlažních ploch** a **zastavěnost**: všechny hmoty na parcele sečtené dohromady.
