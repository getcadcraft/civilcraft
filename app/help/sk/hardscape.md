---
title: Dlažba, múry a schody
summary: Dlažba so spádom k odtoku alebo priečnym spádom, vzor a jej skladba; chodníky, ktoré kopírujú terén; oporné a voľne stojace múry so stupňovitými základmi; obrubníky; rampy a schody kontrolované voči ich limitom; výstup do IFC.
keywords: spevnené plochy, dlažba, dlažobné prvky, terasa, spády, odtok, priečny spád, rybia kosť, bežná väzba, chodník, cesta pre peších, oporný múr, záhradný múr, základ, korunová rímsa, obrubník, lemovanie, rampa, prístupnosť, schody, stupne, podesta
from: 51475877
---

Spevnené plochy sa znovu počítajú zo terénu zakaždým, takže nasledujú reliéf a obnovia sa, keď sa terén alebo jeho čiara pohne. Rohy ťahajte na pôdoryse ako ktorúkoľvek čiaru. Otvoríte ich cez {{ui:Spevnené plochy}} v skupine Krajina.

## Dlažba

Kliknite na rohy a stlačte {{key:Enter}}. V paneli Vlastnosti:

- **Úroveň**: prázdne = priemerná úroveň terénu pod ňou.
- **Spády**: úroveň, **priečny spád** (% smerom v určitom smere) alebo **do odtoku**: CivilCraft vás vyzve, aby ste kliknutím určili, kam odtok patrí; potom každý roh stúpa od odtoku so spádom. Šípky na pôdoryse ukazujú spády.
- **Vzor** (mriežka, bežná väzba, rybia kosť) s veľkosťou jednotky, škárou a uhlom; **Lemovanie** šírka. Na liste sa škáry užšie než jeden milimeter vynechajú.
- Dlažba je súčasťou navrhovaného povrchu. Jej vrstvy (dlažobné prvky, lôžko, podklad) sa dostanú do IFC a do množstiev.

## Chodníky

Kliknite pozdĺž chodníka a stlačte {{key:Enter}}. Chodník nasleduje terén, s **priečnym spádom** na jeho pravej strane. Chodník strmší než **Najstrmší povolený** sa na pôdoryse označí `!` tam, kde je, a v paneli Vlastnosti sa uvedie, ako strmý je.

## Múry

Kliknite pozdĺž múra a stlačte {{key:Enter}}. Múr je **oporný** alebo **voľne stojaci**. Bez **Hornej** úrovne stojí jeho **výška** nad terénom po celej dĺžke; zadajte hornú úroveň, aby bol vodorovný. Jeho **základ** sa nachádza v nastavenej hĺbke pod terénom a schodovite sa znižuje po celých stupňoch, takže medzi nimi zostáva vodorovný. V paneli Vlastnosti sú dĺžka, výšky, plocha lícovej strany a stupne základu múra; na pôdoryse sú pri každom konci označené horná a spodná hrana múra (TW / BW).

:::warning
Oporný múr vyšší než 1.2 m (4 ft) je označený: navrhuje ho inžinier.
:::

## Obrubníky

Kliknite pozdĺž obrubníka a stlačte {{key:Enter}}; nastavte jeho šírku a výšku výčnevu.

## Rampy

Kliknite od spodku po vrch a stlačte {{key:Enter}}. Úrovne sa berú z terénu na každom konci, pokiaľ ich nezadáte. Rampa dostane podestu na každých 750 mm (2.5 ft) výšky a kontroluje sa voči **Najstrmšiemu povolenému** (na začiatku 1:12) a minimálnej šírke. V paneli Vlastnosti sa uvedie, aká dlhá by musela byť.

## Schody

Kliknite na prednú hranu spodného stupňa, potom na miesto, kde schody dosiahnu vrch, a stlačte {{key:Enter}}. Počet stupňov vyplynie z výšky a **Najvyššieho stupňa**; šírka stupňa z pravidla pohodlia 2R + G ≈ 630 mm, nikdy menej než **Najmenšia šírka stupňa**; podesta sa nachádza po každých **Najviac stupňoch v rameni**. V paneli Vlastnosti sa uvedie, či sa zmestia medzi dva body, alebo koľko dlhšie potrebujú.

:::note
Limity pre rampy a schody sú označené ako predvolené hodnoty. Nastavte tie, ktoré vyžaduje váš stavebný predpis.
:::

## Mimo CivilCraft

- Viac › {{ui:Exportovať IFC krajiny}}: dlažba a chodníky ako `IfcPavement`, múry ako `IfcWall` (oporné múry ako RETAININGWALL) s ich vrstvami, obrubníky ako `IfcKerb`, rampy ako `IfcRamp`, schody ako `IfcStair` s ich stupňami a nášľapmi.
- **Odoslať do TakeoffCraft** v tabuľke rastlín prenesie plochy dlažby a objemy vrstiev, lícové plochy múrov a ich dĺžky, dĺžky obrubníkov a počty schodov.
- List detailov nakreslí rez každého múra, skladbu každej dlažby a každé rameno schodov. Pozri [Krajinné listy](topic:landscape-sheets).
