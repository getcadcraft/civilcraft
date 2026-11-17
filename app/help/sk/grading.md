---
title: Upraviť stavebnú plošinu
summary: Nakreslite rovnú plošinu, nastavte jej výšku a rezné a násypové sklony a nechajte CivilCraft napojiť ju na jestvujúci terén a pridať do navrhovaného povrchu.
keywords: oporný múr, oporné múry, zvislá strana, múr namiesto svahu, sklon strany pre každú stranu, násyp, úprava terénu, plošina, stavebná plošina, denné svetlo, čiara prvku, skupina úprav, rezný sklon, násypový sklon, konečný terén, navrhovaný povrch, úprava lokality
from: 482319a6
---

Plošina je rovná plocha v jednej výške. Od jej hrany CivilCraft upravuje terén smerom von vo vašom reznom sklone tam, kde je terén vyšší ako plošina, a vo vašom násypovom sklone tam, kde je nižší, až kým sklon nenarazí na jestvujúci terén. Táto čiara stretnutia je čiara denného svetla. Plošina a jej sklony nahradia jestvujúci terén vnútri čiary denného svetla a vytvoria navrhovaný povrch.

## Nakreslenie plošiny

Najprv potrebujete jestvujúci povrch terénu.

1. Stlačte {{key:G}} alebo kliknite na {{ui:Pad}} v skupine **Návrh**.
   Nápoveda hovorí: "Plošina: kliknite na jej rohy. Enter alebo dvojklik dokončí, Backspace odstráni posledný, Esc zruší."
2. Kliknite na rohy plošiny v poradí, ľubovoľným smerom. Modrý obrys sleduje ukazovateľ.
3. Po poslednom rohu stlačte {{key:Enter}} (aspoň tri).
   Plošina sa nakreslí a vyberie. Začína na výške terénu v jej strede, zaokrúhlenej na 0.1, s reznym sklonom 2 : 1 a násypovým sklonom 3 : 1. Stavový riadok hovorí napríklad: "Plošina 1 vo výške 254.3 (terén v jej strede), rez 2:1, násyp 3:1. Zmeňte ich vo Vlastnostiach."

:::warning
Dokončite stlačením {{key:Enter}}. Dvojklik tiež dokončí, ale v tejto verzii zruší roh, na ktorý ste dvakrát klikli. Kliknite na posledný roh raz a potom stlačte {{key:Enter}}.
:::

Obrys plošiny sa nesmie pretínať sám so sebou ("Obrys plošiny sa pretína sám so sebou.").

## Nastavenie výšky a sklonov

Pri vybranej plošine pravý panel zobrazuje **Plošina**:

1. **Názov**.
2. **Výška**: rovná výška plošiny.
3. **Rezný sklon** a **Násypový sklon**, ako V:Z (2 znamená 2 : 1). Oba musia byť väčšie ako 0.
4. **Plocha plošiny** a **Rohy** sa zobrazujú pre informáciu.

Po každej hodnote stlačte {{key:Enter}}. Čiara denného svetla, navrhovaný povrch a objemy sa hneď aktualizujú.

Pod poľami riadok číta napríklad: "Čiara denného svetla: 48 sklonových čiar (20 v reze, 28 v násype), najvzdialenejšia 31.20 ft od okraja." Pôdorys zobrazuje čiaru denného svetla a sklonové čiary purpurovou farbou.

## Ako sa nájde denné svetlo

- Sklonové čiary vychádzajú z každej hrany kolmo na ňu, približne každú dvadsiatinu veľkosti plošiny.
- Na vonkajších rohoch sa rozbiehajú každých 10°, takže sklon obíde roh.
- Na vnútorných rohoch jedna čiara beží po osi uhla, kde sa stretnú sklony z dvoch hrán.
- Každá čiara stúpa v reznom sklone alebo klesá v násypovom sklone, kým nedosiahne terén.

## Sklony podľa strany a oporné múry

Pod **Strany a oporné múry** vo Vlastnostiach plošiny, plošiny alebo násypu možno každú stranu upraviť vlastným spôsobom. Strana 1 beží od prvého rohu, ktorý ste klikli, k druhému, strana 2 od druhého k tretiemu, a tak ďalej.

- **Všetky strany**: **Sklonené** používa vyššie uvedené rezné a násypové sklony na každej strane; **Zvislé: oporné múry** dá múr na každú stranu.
- Pre každú stranu: **Sklony hore**, **Vlastné sklony** (zadajte rezný a násypový sklon pre túto stranu) alebo **Zvislé (oporný múr)**.
- Sklon zadajte ako `3` alebo `3:1` (vodorovne ku 1 zvisle), `33%` alebo `18.4°`; zobrazí sa ako H:1. Vlastný **Rezný sklon** a **Násypový sklon** plošiny berú to isté.
- Zvislá strana nemá násyp: oporný múr beží pozdĺž hrany, od plošiny dolu k jestvujúcemu terénu (v násype) alebo od terénu dolu k plošine (v reze). **Hrúbka múra** (na začiatku 0.3 m alebo 1 ft) je, ako ďaleko terén stupňuje od hrany plošiny k jestvujúcemu terénu. Objemy reza a násypu vynechajú násyp, ktorý táto strana už nemá.
- Kde múr stretne sklonenú stranu, sklon sa obíde okolo konca múra; dva múry sa stretnú v zkosenom spoji.
- Pod poľami: dĺžka múrov, odhalená plocha (výška × dĺžka), najvyššia a priemerná výška.

Plán kreslí vonkajšiu stenu každého múra krátkymi značkami napríč a jeho výšku na oboch koncoch a v najvyššom bode (na vrstve oporných múrov, ktorá ide aj do DXF a DWG). 3D zobrazenie ukazuje múry ako telesá (Zobraziť › Oporné múry) a exporty GLB, OBJ a USD ich zahŕňajú. Rezy cez hranu ukazujú stupeň.

**Upozornenia** (vo Vlastnostiach a v paneli Problémy): múr vyšší ako **Upozorniť pri výške múra** (na začiatku 1.0 m alebo 3.3 ft) „môže potrebovať projektovaný múr alebo povolenie; skontrolujte miestne predpisy“, a keď zadáte **Najstrmší sklon, ktorý zemina drží**, každá strana, ktorej rezný alebo násypový sklon je strmší ako to. Sú to upozornenia: úprava sa stále vytvorí. Každá zmena je jeden krok pre {{key:Mod+Z}}.

## Presun rohov

Vyberte plošinu a potom potiahnite štvorcový úchyt v rohu. Každé potiahnutie je jeden krok späť. Pridanie alebo odobratie rohu zatiaľ nie je k dispozícii: plošinu zmažte a nakreslite znova.

## Keď sa úprava nevykoná

Červený rámik pod **Zemné práce** pomenuje plošinu a problém:

| Hlásenie | Čo urobiť |
|---|---|
| "3 slope lines run off the surface before meeting it: the pad is too close to the surface's edge or too high/low." › „3 sklonové čiary bežia mimo povrchu skôr, než ho stretnú: plošina je príliš blízko okraja povrchu alebo príliš vysoko/nízko.“ | Presuňte plošinu od okraja povrchu alebo priblížte jej výšku k terénu. |
| "The daylight line crosses itself (slopes from different sides of the pad run into each other). Reshape the pad or change the slopes." › „Čiara denného svetla sa pretína sama so sebou (sklony z rôznych strán plošiny sa do seba zarážajú). Upravte tvar plošiny alebo zmeňte sklony.“ | Typické pre úzke alebo L-tvarové plošiny pri hlbokom reze alebo vysokom násype. Rozšírte plošinu, zmenšite rozdiel alebo zostrite sklony. |
| "The pad outline crosses itself." › „Obrys plošiny sa pretína sám so sebou.“ | Prekreslite rohy v poradí okolo plošiny. |

Plošina s problémom sa vynechá z navrhovaného povrchu a objemov, kým sa neopraví.

## Pozrieť výsledok

1. V časti **Zobrazenie** nastavte **Povrch** na {{ui:Proposed (graded)}}.
   Vrstevnice teraz idú napríč cez plošinu rovno a nasledujú sklony von k čiare denného svetla.
2. Presuňte ukazovateľ nad plošinu: stavový riadok zobrazí výšky **Terén** a **Upravený**.
3. Prečítajte rez a násyp v časti **Zemné práce**; pozri [Objemy zemných prác](topic:volumes).

Plošiny sa upravujú po koridoroch, v poradí, v akom boli nakreslené. Neskoršia plošina nahradí čokoľvek skôr vnútri svojej vlastnej čiary denného svetla.

## Zmazanie plošiny

Vyberte ju a stlačte {{key:Delete}} (na Macu Fn a delete), alebo kliknite na {{ui:Delete}}.

## Ešte nie je hotové

Plošiny sú rovné: šikmé plošiny, zlomové čiary s premenlivým sklonom, terasy a úprava na vzdialenosť alebo cieľovú výšku zatiaľ nie sú k dispozícii. Pozri [Ešte nie je hotové](topic:not-built-yet).
