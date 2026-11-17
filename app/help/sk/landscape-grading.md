---
title: Úprava terénu pre krajinu
summary: Plošiny, valy, vsakovacie priekopy a voľné úpravy terénu s bodovými výškami a vrstevnicami, ktoré ťaháte, s výkopom a násypom počítaným naživo, analýzou sklonov, šípkami toku a zátopami, to všetko v navrhovanom povrchu CivilCraft.
keywords: oporný múr, oporné múry, zvislá strana, múr namiesto svahu, sklon strany, násyp, úprava terénu, úprava terénu pre krajinu, plošina, terasa, val, vsakovacia priekopa, bodová výška, bodová úroveň, vrstevnice, upraviť vrstevnice, výkop a násyp, zemné práce, analýza sklonov, prístupnosť, strmé svahy, šípky toku, odvodnenie, zátopy, mláky
from: e1559eb9
---

Všetko tu sa upraví do **navrhovaného povrchu** rovnakou úpravou, akou sa upravujú plošiny a koridory. **Jestvujúci terén** sa nikdy nemení a zemné práce ho počítajú celý. Ponuka {{ui:Úpravy terénu}} je v skupine Krajina.

## Plošiny

{{ui:Úpravy terénu}} › {{ui:Plošina}}, potom kliknite na rohy a stlačte {{key:Enter}}. Plošina sa začína na priemernej výške terénu pod ňou; zadajte **Výšku**, aby ste ju nastavili, alebo pole vyprázdnite, aby znova nasledovala terén. **Spád** v % a **Spád smerom** v stupňoch (0 = východ, 90 = sever) ju naklonia. Jej strany sa upravia do terénu pri **Svahu výkopu** a **Svahu násypu** (vodorovne k 1).

## Strany a oporné múry

V časti **Strany a oporné múry** v paneli Vlastnosti pozemku, plošiny alebo valu sa každá strana môže upraviť vlastným spôsobom. Strana 1 beží od prvého kliknutého rohu k druhému, strana 2 od druhého k tretiemu a tak ďalej.

- **Všetky strany**: **Svahované** používa vyššie uvedené svahy výkopu a násypu na každej strane; **Zvislé: oporné múry** dá múr na každú stranu.
- Pre každú stranu: **Svahy vyššie**, **Vlastné svahy** (zadajte svah výkopu a násypu pre túto stranu) alebo **Zvislá (oporný múr)**.
- Svah zadajte ako `3` alebo `3:1` (vodorovne k 1 zvisle), `33%` alebo `18.4°`; zobrazí sa ako H:1. Vlastný **Svah výkopu** a **Svah násypu** plošiny prijímajú to isté.
- Zvislá strana nemá násyp: oporný múr beží pozdĺž hrany, od plošiny dole k jestvujúcemu terénu (v násype), alebo od terénu dole k plošine (vo výkope). **Hrúbka múra** (na začiatku 0.3 m alebo 1 ft) je, o koľko terén stúpa od hrany plošiny k jestvujúcemu terénu. Objemy výkopu a násypu nezahŕňajú násyp, ktorý na tej strane už nie je.
- Kde múr stretá šikmú stranu, svah sa obtočí okolo konca múra; dva múry sa stretnú v zrezanom spoji.
- Pod poľami: dĺžka múrov, odkrytá plocha (výška × dĺžka), najvyššia a priemerná výška.

Pôdorys nakreslí vonkajšiu líc každého múra krátkymi značkami napriečne cez ňu a jeho výšku na oboch koncoch a v najvyššom bode (na vrstve oporných múrov, ktorá sa dostane aj do DXF a DWG). 3D zobrazenie zobrazuje múry ako telesá (**Zobraziť** › Oporné múry) a exporty GLB, OBJ a USD ich obsahujú. Rezy cez hranu ukazujú schod.

**Upozornenia** (v paneli Vlastnosti a v paneli Problémy): múr vyšší než **Upozorniť pri výške múra nad** (na začiatku 1.0 m alebo 3.3 ft) — „môže potrebovať inžinierom navrhnutý múr alebo povolenie; skontrolujte miestne predpisy“ — a, keď zadáte **Najstrmší sklon, ktorý zemina drží**, každá strana, ktorej svah výkopu alebo násypu je strmší než to. Sú to iba upozornenia: úprava sa aj tak postaví. Každá zmena je jeden krok pre {{key:Mod+Z}}.

## Valy

{{ui:Úpravy terénu}} › {{ui:Val}}: navŕšenie, ktorého vrch je vo **Výške** nad priemerným terénom pod ním, s jeho stranami upravenými do terénu.

## Vsakovacie priekopy

{{ui:Úpravy terénu}} › {{ui:Vsakovacia priekopa}}, potom kliknite pozdĺž priekopy **v smere, ktorým tečie voda**, a stlačte {{key:Enter}}. Nastavte jej **Hĺbku**, **Šírku dna** (0 pre V) a **Sklon strany**. Bez **Spádu** jej dno nasleduje terén, o svoju hĺbku pod ním, a nikdy nestúpa do kopca; zadajte spád, aby mala od svojho začiatku rovnomerný spád.

## Bodové výšky a vrstevnice

1. {{ui:Úpravy terénu}} › {{ui:Plocha úprav}}: kliknite na obrys plochy, ktorú chcete tvarovať.
2. {{ui:Úpravy terénu}} › {{ui:Výškový bod}}: kliknite dovnútra plochy. Zadajte jeho výšku v paneli Vlastnosti, alebo použite tlačidlá ▲ ▼.
3. {{ui:Úpravy terénu}} › {{ui:Upraviť vrstevnicu}}: kliknite na vrstevnicu vnútri plochy, aby sa vzala ako čiara, ktorú môžete preformovať.

Vyberte bod alebo vrstevnicu a **ťahajte** ho (alebo jeho body) na pôdoryse: povrch sa prispôsobí, keď pustíte, ako jeden krok späť. Vnútri plochy sa terén znovu zostaví z jej hrany (kde sa stretá s jestvujúcim terénom), z bodových výšok a z upravených vrstevníc.

## Výkop a násyp naživo

Vlastnosti každého objektu úprav ukazujú jeho **Výkop** a **Násyp** a celého pozemku, metódou mriežky, ktorú používajú Zemné práce, a to hneď, ako ich meníte. Problémy (mimo povrchu, obrys, ktorý sa sám križuje) sú tam vypísané.

## Kontroly úprav

V sekcii **Kontroly úprav** na ľavej strane:

- **Analýza sklonov** farbí povrch podľa spádu: do miernej hranice, medzi nimi a strmšie než strmá hranica (na začiatku 5 % a 33.3 %: obvyklých 1:20 pre bezbariérové trasy a 1:3 pre kosenie). Legenda uvádza, aká časť plochy patrí do každej skupiny. Strmé plochy sa vytlačia aj na listoch.
- **Šípky toku a zátopy** nakreslia, ktorým smerom tečie voda, a označia každé miesto, kde by sa zadržiavala, s jeho hĺbkou; sekcia uvedie, koľko takých miest je, najhlbšie z nich a koľko vody zadržiavajú.

Kontroly čítajú navrhovaný povrch, keď sa niečo upraví; inak čítajú jestvujúci terén.
