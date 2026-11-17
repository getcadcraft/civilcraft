---
title: Návrh vodorovnej osi trasy
summary: Nakreslite os trasy podľa jej PI, nastavte polomery oblúkov a začiatočné staničenie, presúvajte PI a čítajte údaje oblúkov, staničenie a odsadenie.
keywords: os trasy, žiadne riešenie, oblúk sa nezmestí, najväčší polomer, najmenší polomer, minimálny polomer, návrhová rýchlosť, prekrytie, os, PI, vodorovný oblúk, polomer, staničenie, dotyčnica, vytvoriť os trasy, návrh osi trasy, PC, PT, odsadenie od osi
from: 8c5df4aa
---

Os trasy v CivilCraft je reťaz dotyčníc cez body priesečníkov (PI), pričom na každom vnútornom PI s polomerom je kruhový oblúk. Má staničenie od začiatočnej stanice, ktorú zvolíte. Projekt môže obsahovať veľa osí trasy.

## Nakreslenie osi trasy

1. Stlačte {{key:A}}, alebo kliknite na {{ui:Os trasy}} v skupine **Návrh**.
   Nápoveda hovorí "Os trasy: klikajte na PI v poradí. Enter alebo dvojklik dokončí, Backspace odstráni posledný, Esc zruší."
2. Kliknite na prvý PI (začiatok osi trasy).
3. Kliknite na každý ďalší PI v poradí. Červená čiara sleduje ukazovateľ a zobrazuje dĺžku a azimut dotyčnice, ktorú kreslíte, napríklad "212.40 ft  N 63°12'05" E".
4. Kliknite na posledný PI (koniec osi trasy).
5. Stlačte {{key:Enter}}.
   Os trasy sa nakreslí so staničením a je označená. Stavový riadok hovorí napríklad "Os trasy 1: 386.36 ft, oblúky s polomerom 100 ft tam, kde sa zmestia. Polomery upravte vo Vlastnostiach; Pozdĺžny profil (R) na návrh jej sklonu."

Počas kreslenia: {{key:Backspace}} odstráni posledný PI, {{key:Esc}} zruší kreslenie a potiahnutie po prázdnom priestore posúva pohľad bez pridania PI.

:::warning
Dokončite stlačením {{key:Enter}}. Dvojklik tiež dokončí, ale v tejto verzii odstráni PI, na ktorý ste dvakrát klikli. Raz kliknite na posledný PI a potom stlačte {{key:Enter}}.
:::

Každý vnútorný PI dostane oblúk s polomerom 100 ft (30 m v projekte v metroch), alebo najväčší celý polomer, ktorý sa zmestí do polovice každej dotyčnice, ak 100 ft sa nezmestí. Veľmi ostré alebo priamo prechádzajúce PI oblúk nedostanú.

## Nastavenie polomerov a súradníc

Keď je os trasy označená, v pravom paneli sa zobrazí **Os trasy**:

1. **Názov** a **Začiatočné staničenie**. Staničenie zadajte ako `10+00` (stopy) alebo `0+500` (metre), alebo ako obyčajné číslo. Pozri [Jednotky, staničenie a formáty čísel](topic:units-and-stations).
2. **Dĺžka** a **Koncové staničenie** sa vypočítajú za vás.
3. Tabuľka **PI** uvádza pre každý PI jeho **Y** a **X** a pre každý vnútorný PI **Polomer**. Zadajte novú hodnotu a stlačte {{key:Enter}}.
   - Polomer 0 vytvorí uhlový bod bez oblúka.
   - Prvý a posledný PI nikdy nemajú polomer.
   - Malé x na konci riadka odstráni daný PI (os trasy zachová aspoň dva).
4. Prečítajte si zoznam **Oblúky**: pre každý oblúk jeho staničenia PC a PT, polomer R, uhol zakrivenia Δ a smer (vľavo alebo vpravo), dĺžku L, dotyčnicu T, vonkajšiu vzdialenosť E a tetivu.
5. Riadok pod oblúkmi udáva azimut prvej dotyčnice.

## Keď sa oblúk nezmestí

Ak oblúky potrebujú viac dotyčnice, než je medzi ich PI, os trasy nemá riešenie: kým ju neopravíte, nie je nakreslená správne a pri exporte LandXML sa vynechá. Červené pole vysvetlí dôvod číslami a ponúkne, čo by sa zmestilo:

- "Oblúky pri PI 2 a PI 3 potrebujú medzi sebou 240.00 ft dotyčnice (130.00 + 110.00), ale PI sú od seba vzdialené 180.00 ft." — alebo, keď má oblúk iba jeden z nich, "Oblúk pri PI 2 potrebuje 240.00 ft dotyčnice smerom k PI 1 …".
- Tlačidlo pre každý PI nastaví **najväčší polomer, ktorý sa tam zmestí**, pričom ostatný oblúk ostane nezmenený (musí sa zmestiť aj do druhej dotyčnice daného PI). Ak majú oba PI oblúky, **Obe** zmenší oba polomery pomerne tak, aby sa práve stretli.
- Ak je sám jeden oblúk dlhší než dotyčnica, pole povie, že pri tak veľkom polomeri sa pri druhom PI nezmestí žiadny oblúk.
- PI, ktorý sa vracia späť v priamke, nemôže mať oblúk; pole ponúkne **Bez oblúka pri PI n**.

Každé tlačidlo je jeden krok: {{key:Mod+Z}} vráti polomery späť. Ponúkané polomery sú zaokrúhlené nadol na 0.01, aby sa vždy zmestili.

### Návrhový minimálny polomer

Zadajte **Návrhový minimálny polomer** (napríklad podľa návrhovej rýchlosti), aby sa každý oblúk skontroloval voči nemu; ak ho necháte prázdny, kontrola sa nevykoná. Oblúk pod ním je uvedený s tlačidlom pre **najmenší polomer, ktorý spĺňa minimum**, ak sa tento polomer zmestí. Ak sa nezmestí, pole to povie a uvedie najväčší polomer, ktorý dotyčnice dovoľujú, aby ste vedeli, že treba presunúť PI alebo znížiť minimum.

## Presúvanie PI v pôdoryse

1. Pri aktívnom {{ui:Výber}} kliknite na os trasy, aby sa označila. Na jej PI sa zobrazia štvorcové úchyty.
2. Potiahnite úchyt. Os trasy, jej staničenie, profil a koridor sledujú pohyb.
3. Uvoľnite. Presun je jeden krok späť.

Pridanie PI medzi dva existujúce zatiaľ nie je dostupné: odstráňte os trasy a nakreslite ju znova, alebo zadajte nové súradnice pre existujúce PI.

## Čítanie staničenia a odsadenia

Presuňte ukazovateľ nad pôdorys. Stavový riadok ukáže najbližšiu os trasy (alebo označenú) so staničením a odsadením, **L** alebo **R** pri pohľade v smere staničenia, napríklad "Os trasy 1: Sta 2+15.30, odsadenie 18.42 R". Za oboma koncami pridá "(za koncom)".

## Čo sa kreslí

V pôdoryse, v DXF a v PDF: os (dotyčnice ako čiary, oblúky ako skutočné kružnicové oblúky), značka každých 50 ft (20 m) s dlhšou značkou a popisom staničenia každých 100 jednotiek, a značky PC a PT s ich staničeniami.

## Odstránenie osi trasy

Označte ju a stlačte {{key:Delete}}, alebo kliknite na {{ui:Zmazať}} na paneli nástrojov alebo na spodku pravého panela. Jej profil a koridor sa zmažú spolu s ňou. {{key:Mod+Z}} ju obnoví.

:::mac
Na klávesnici Mac kláves označený **delete** je v prehliadači {{key:Backspace}} a nemaže označenie. Stlačte {{key:Delete}} (Fn a delete), alebo použite tlačidlo {{ui:Zmazať}}.
:::

## Ďalej

- [Navrhnite vertikálny profil](topic:profile).

## Návrhová rýchlosť a trieda

Pod Vlastnosťami osi trasy sa **Návrhová rýchlosť** (km/h alebo mph) a **Návrhová trieda** uchovávajú pri osi trasy, ukladajú sa do projektu a zapisujú do IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nemá tabuľku, ktorá by spájala rýchlosť s minimálnym polomerom, takže z nich nič nekontroluje: **Návrhový minimálny polomer** nastavte podľa vlastnej projektovej normy.

## Prechodnice

Oblúk môže mať na každom konci klotoidnú prechodnicu: dotyčnica, prechodnica, oblúk, prechodnica, dotyčnica. V tabuľke PI zadajte dĺžku do **Prechodnica vstup** a **Prechodnica výstup** pre PI, ktorý má polomer. PI zostane na mieste; oblúk sa posunie dovnútra, aby urobil miesto, takže vzdialenosť dotyčnice vzrastie o odsadenie prechodnice. Dĺžky môžu byť rôzne a PI s jednou dĺžkou dostane prechodnicu iba na tom konci.

Zoznam oblúkov potom uvádza TS, SC, CS a ST (dotyčnica na prechodnicu, prechodnica na oblúk, oblúk na prechodnicu, prechodnica na dotyčnicu) s uhlom prechodnice θs, vzdialenosťami dotyčníc a vonkajšou vzdialenosťou. Staničenie beží pozdĺž prechodníc ako všade inde. Prechodnice, ktoré spolu otočia viac než oblúk, sa odmietnu s uvedením PI; prechodnica dlhšia, než dovoľuje dotyčnica, je prekrytie, ako pri každom oblúku. Prevýšenie v oblúku používa prechodnicu ako svoj nábeh (pozri [Koridor](topic:corridor)).
