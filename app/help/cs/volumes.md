---
title: Objemy zemních prací
summary: Čtěte objemy výkopu, násypu a čisté objemy mezi stávajícím terénem a navrhovaným povrchem, po plošinách a koridorech i celkem, a porozumějte metodě mřížky, na které jsou založeny.
keywords: objemy, zemní práce, výkop, násyp, čisté, výkop a násyp, množství, metoda mřížky, porovnání povrchů, objemový povrch, krychlové yardy, krychlové metry
from: 299d7bc7
---

Jakmile plošina nebo koridor urovnávají bez problémů, CivilCraft porovná navrhovaný povrch se stávajícím terénem a ohlásí výkop a násyp. Čísla se aktualizují s každou změnou.

## Kde je číst

- **Zemní práce** v pravém panelu, když nic není vybráno (pohled **Projekt**), pokud existuje alespoň jedna plošina nebo koridor.
- **Zemní práce** v pravém panelu, když je vybrána plošina (stejné součty za celý projekt).
- Řádek pod nastavením koridoru s jeho vlastním výkopem a násypem.

Blok **Zemní práce** ukazuje:

- **Výkop**, **Násyp** a **Čistě** (s "násyp" nebo "výkop" za ním, podle toho, která hodnota je větší)
- řádek pro každou položku, pokud je jich víc, například "Plošina 1: výkop 120.4 cu yd, násyp 310.2 cu yd"
- řádek metody: "Metoda mřížky: stávající terén a urovnaný povrch vzorkované každých 0.5 ft uvnitř čar denního světla (92,891 buněk). Nebyl použit žádný koeficient nakypření ani zhutnění."

Objemy jsou v krychlových yardech v projektu ve stopách a v krychlových metrech v projektu v metrech.

## Odeslání do TakeoffCraftu

Chcete-li ocenit zemní práce, zvolte {{ui:Odeslat do TakeoffCraftu}} na konci bloku **Zemní práce**. CivilCraft uloží soubor množství (`<site>.quantities.json`) se dvěma množstvími: výkop a násyp, v krychlových yardech (projekt ve stopách) nebo krychlových metrech (projekt v metrech), stejná čísla jako v bloku, na setiny. Otevřete jej v TakeoffCraftu tlačítkem **Otevřít výkaz výměr**, nebo jej tam přetáhněte: stanou se dvěma položkami, které lze ocenit ([Výkop a násyp z CivilCraftu](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Po změně odešlete znovu a otevřete nový soubor: stejné položky převezmou nová čísla.

Odesílají se jen součty, takže se nic nepočítá dvakrát; poznámka souboru uvádí výkop a násyp každé plošiny a koridoru.

## Jak se počítají

CivilCraft používá **metodu mřížky**:

1. Přes oblast uvnitř každé čáry denního světla se položí mřížka čtvercových buněk.
2. Ve středu každé buňky se vzorkují oba povrchy.
3. Každá buňka se počítá jako hranol: rozdíl výšek krát plocha buňky. Kde je navrhovaný povrch níž, je to výkop; výš, je to násyp.
4. Buňky se sečtou.

Velikost buňky se volí za vás tak, aby obdélník kolem urovnaných oblastí držel asi 250 000 buněk, zaokrouhlená na úhledou hodnotu (1, 2 nebo 5násobek mocniny deseti). Sami ji zatím nemůžete nastavit. Řádek metody říká velikost a počet buněk. Menší buňky jsou přesnější podél hran; u celých buněk mezi rovnými plochami je výsledek přesný.

## Co je dobré vědět

- Počítá se jen plocha uvnitř čar denního světla. Terén mimo ně se nemění.
- Plošina nebo koridor s problémem se nezapočítá a nic nepřidá. Pokud blok říká "Zatím žádné objemy: plošina se musí urovnat bez problémů.", hledejte červený rámeček nad ním.
- Kde se položky překrývají, pozdější nahradila dřívější uvnitř své čáry denního světla a překryv se počítá jednou.
- Nepoužívá se žádný koeficient nakypření ani zhutnění. Pokud potřebujete objemy v rozrušeném, sypkém nebo zhutněném stavu, výsledky vynásobte sami.
- Odtěžení ornice, hloubky vozovky a podloží a objemy hranolů TIN-na-TIN zatím nejsou k dispozici.

## Kontrola výsledku

- Zapněte {{ui:Navrhovaný (urovnaný)}} v **Zobrazení** a podívejte se na vrstevnice uvnitř čar denního světla.
- Najeďte ukazatelem nad urovnanou oblast: stavový řádek ukáže **Terén** a **Urovnaný**. Rozdíl je hloubka výkopu nebo násypu v tom místě.
- U koridoru ukazuje údaj v pohledu na profil výkop nebo násyp na ose v každém staničení.
