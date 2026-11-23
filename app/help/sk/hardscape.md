---
title: Dlažba, múry a schody
summary: Dlažba so spádom k odvodneniu alebo s priečnym spádom, vzor a jej skladba; chodníky, ktoré sledujú terén; oporné a voľne stojace múry so stupňovitými základmi; obrubníky; rampy a schody overené voči ich limitom; export IFC.
keywords: spevnené plochy, dláždenie, dlažobné kocky, terasa, spády, odvodnenie, priečny spád, rybia kosť, bežiaca väzba, chodník, cesta pre peších, oporný múr, záhradný múr, základ, koruna múra, obrubník, lemovanie, rampa, bezbariérovosť, schody, výšky stupňov, nástupnice, podesta
from: d34b4466
---

Spevnené plochy sa znova vypočítajú zakaždým z terénu, takže sledujú reliéf a obnovia sa pri každom posune terénu alebo jeho čiary. Uchopte ich rohy na pôdoryse ako ktorúkoľvek čiaru. Otvorte ich cez {{ui:Spevnené plochy}} v skupine Krajina.

## Dláždenie

Kliknite na rohy a stlačte {{key:Enter}}. V **Vlastnostiach**:

- **Úroveň**: prázdne = priemerná úroveň terénu pod ňou.
- **Spády**: vodorovné, **priečny spád** (% v danom smere) alebo **k odvodneniu**: CivilCraft vás vyzve, aby ste klikli, kam odvodnenie patrí, a potom každý roh stúpa od odvodnenia so spádom. Šípky na pôdoryse ukazujú spády.
- **Vzor** (mriežka, bežiaca väzba, rybia kosť) s veľkosťou jednotky, špárou a uhlom; **Lemovanie** so šírkou. Na liste sa špáry užšie ako milimeter vynechajú.
- Dlažba je súčasťou navrhovaného povrchu. Jej vrstvy (dlaždice, lôžko, podklad) sa dostanú do IFC a do množstiev.

## Chodníky

Kliknite pozdĺž chodníka a stlačte {{key:Enter}}. Sleduje terén, so svojím **priečnym spádom** na pravej strane. Chodník strmší ako **Najstrmší povolený sklon** je na pôdoryse označený `!` na mieste, kde je, a Vlastnosti uvádzajú, ako strmý je.

Kde chodník stretne cestu vytvorenú koridorom, zastaví sa na vonkajšej hrane cesty, na úrovni chodníka alebo krajnice tam, v navrhovanom povrchu a v 3D pohľade. Chodník, ktorý križuje cestu, sa vypočíta a zobrazí ako dve časti a koniec nakreslený až do dvojnásobku šírky chodníka od cesty sa predĺži až k jej hrane. Pôdorys stále zobrazuje chodník tak, ako ste ho nakreslili, a jeho dĺžka a plocha počítajú celú čiaru. Pozri [Cestný koridor ťahaním po dráhe](topic:corridor).

## Múry

Kliknite pozdĺž múra a stlačte {{key:Enter}}. Múr je **oporný** alebo **voľne stojaci**. Bez **Hornej hrany** stojí jeho **výška** nad terénom po celej dĺžke; zadajte hornú hranu, aby ju držal vo vodorovnej úrovni. Jeho **základ** sídli v nastavenej hĺbke pod terénom a schodovito klesá v celých krokoch, takže medzi nimi zostáva vodorovný. Vlastnosti uvádzajú jeho dĺžku, výšky, plochu čela a kroky základu; pôdorys označí hornú a spodnú hranu múra (TW / BW) na každom konci.

:::warning
Oporný múr vyšší ako 1.2 m (4 ft) je označený: navrhuje ho inžinier.
:::

## Obrubníky

Kliknite pozdĺž obrubníka a stlačte {{key:Enter}}; nastavte jeho šírku a výšku nad povrchom.

## Rampy

Kliknite od spodku po vrch a stlačte {{key:Enter}}. Úrovne sa prevezmú z terénu na každom konci, ak ich nezadáte. Rampa dostane podestu na každých 750 mm (2.5 ft) výškového rozdielu a je overená voči **Najstrmšiemu povolenému sklonu** (1:12 na začiatku) a minimálnej šírke; Vlastnosti uvádzajú, akú dĺžku by potrebovala.

## Schody

Kliknite na prednú hranu spodného schodu, potom tam, kde schody dosiahnu vrch, a stlačte {{key:Enter}}. Počet výšok stupňov sa odvodí z výšky a **Najväčšej výšky stupňa**; nášľap z pravidla pohodlia 2R + G ≈ 630 mm, nikdy menej ako **Najmenší nášľap**; podesta po najviac **Najviac výškach stupňov v rame**. Vlastnosti uvádzajú, či sa schody zmestia medzi oba body, alebo koľko dlhšie potrebujú.

:::note
Limity pre rampy a schody sú označené ako predvolené hodnoty. Nastavte tie, ktoré vyžaduje váš stavebný predpis.
:::

## Mimo CivilCraft

- Viac › {{ui:Exportovať IFC krajiny}}: dlažba a chodníky ako `IfcPavement`, múry ako `IfcWall` (oporné múry ako RETAININGWALL) s ich vrstvami, obrubníky ako `IfcKerb`, rampy ako `IfcRamp`, schody ako `IfcStair` s ich výškami stupňov a nástupnicami.
- **Odoslať do TakeoffCraft** v zozname rastlín prenesie plochy dlažby a objemy vrstiev, plochy čiel múrov a ich dĺžky, dĺžky obrubníkov a počty schodov.
- List detailov nakreslí rez každého múra, skladbu každej dlažby a každé rameno schodov. Pozri [Listy krajiny](topic:landscape-sheets).
