---
title: Postavitev sončnih nizov na tla
summary: Postavite sončne mize na tla znotraj parcele ali ploščadi, z vrstami, razmaknjenimi glede na teren, na katerem vsaka dejansko stoji, strmo tlo pustite prazno, izračunajte letno energijo in prikažite mize v tlorisu in v 3D.
keywords: sončno, pv, fotovoltaika, niz, montaža na tla, mize, vrste, razmik vrst, senca, teren, naklon, piloti, pridelek, kWp, energija, obzorje
from: 95593fd6
---

## Kaj se boste naučili

Kako postaviti polje sončnih miz na lokacijo, ki ni ravna, in kaj pomenijo številke. Odprete ga prek Površje › Več › Sončni nizi.

## Razporeditev miz

1. Izberite **Kje**: parcelo ali ploščad projekta ali vnesite oglišča območja. Označite vse ploščadi ali parcele, ki morajo ostati **prazne** (stavba, ribnik).
2. Vnesite **zemljepisno širino in dolžino** lokacije. Od njiju je odvisno sonce; ničesar se ne ugiba. Če ima projekt koordinatni sistem, **Postavi iz koordinatnega sistema** ju vnese sam.
3. Nastavite nagib, obrnjenost (prazno pomeni proti ekvatorju), koliko modulov tvori eno mizo ter moč in velikost modula. Številke modula so na začetku splošne vrednosti in so tako označene; vpišite svoje.
4. Pritisnite **Razporedi mize**. Okno prikaže število miz in modulov, velikost v kWp in razdaljo od vrste do vrste.

Vsaka miza je postavljena na območje; začne se spredaj in se pomika nazaj. Miza se postavi le tam, kjer teren pod njo ne presega mejnega naklona, je znotraj območja in odmika od meje ter kjer piloti, ki jih potrebuje, niso višji od mejne vrednosti, ki ste jo nastavili. Neprimerna mesta ostanejo prazna, okno pa pove, koliko jih je in zakaj.

## Vrste so razmaknjene glede na teren

Na ravnem terenu so vrste razmaknjene po običajnem pravilu brez zasenčenja: senca vrste opoldne na zimski solsticij ne sme segati do spodnjega roba vrste za njo. Na nagibu CivilCraft uporabi isto pravilo za teren, na katerem dejansko stoji naslednja vrsta. Kjer se teren za mizo dviga, so vrste lahko bližje skupaj; kjer se odmika, so razmaknjene bolj. Okno poleg razmika na ravnem terenu prikaže najmanjši, največji in povprečni razmik, da vidite, kaj je naredil teren.

Ploskev mize se dvigne na pilote, dokler je vsak vzorec pod njo vsaj za nastavljeni odmik nad terenom. Najvišji pilot je prikazan v rezultatu.

## Letna energija

**Letna energija** izračuna svetlobo na nagnjeni ploskvi za reprezentativen dan vsakega meseca, temperaturo celic, vnesene izgube, medsebojno zasenčenje miz in hribe na obzorju, ki odvzamejo sonce, ki ga skrivajo. Nebo je jasno, zato je odgovor zgornja meja; dejanske vremenske razmere dajo manj. Gre za oceno v zgodnji fazi načrtovanja, ne za poročilo o pridelku.

## Shranjevanje

**Shrani v projekt** shrani vnose in številke v datoteko projekta; mize se ob odprtju datoteke znova izračunajo iz terena, zato jih spremenjeno površje premakne. Prikažejo se v tlorisu in v 3D (Prikaži › Sončni nizi). Seznam miz se prenese kot CSV. En korak razveljavitve odstrani ali obnovi niz.

## Še ni izdelano

Vremenski podatki namesto jasnega neba, mize, ki sledijo terenu v smeri vzhod–zahod, sledilniki ter električna zasnova (nizi, vodniki, pretvorniki) v CivilCraftu. Podokno Solar PV v BimCraftu ima nize in enočrtno shemo za strehe.
