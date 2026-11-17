---
title: Provere dalekovoda
summary: Šta CivilCraft proverava na svakom vodu i kablu, uvek ažurno: razmaci, rastojanja, zanjihavanje, uzgon, opterećenja stubova i dimenzionisanje, spojnice, zatege, temelji, nedostajući podaci, veze, preopterećenja i pad napona.
keywords: provere, razmak, razmak od tla, prepreka, ukrštanje, razmak faza, zanjihavanje izolatora, uzgon, opterećenje stuba, nominalno opterećenje, dimenzionisanje, temelj, zatega, zatezna žica, spojnica, traverza, pad napona, preopterećenje, nedostajući podaci, nepovezano
from: e6a0da47
---

**Provere** u odeljku Dalekovodi navode svaki problem: crveno za ono što ne prolazi, a žuto za upozorenja. Klikni jednu da izabereš vod, stub, kabl ili opremu na koju se odnosi; stubovi i rasponi koji ne prolaze obeleženi su crveno na osnovi dok je radni prostor otvoren.

:::warning
Pomoćno sredstvo za projektovanje: ovo su provere tvog projekta prema tvojim pravilima, a ne sertifikat.
:::

## Razmaci

Najniža faza provodnika prati se duž svakog raspona pri svakom slučaju opterećenja. Njen najniži razmak iznad tla mora dostići **Pravilo razmaka** voda. Gde raspon prelazi preko **prepreke** (crta se alatom {{ui:Prepreka}}: tačka ili linija, sa svojom visinom iznad tla i sopstvenim pravilom razmaka), razmak iznad vrha prepreke proverava se na isti način.

**Ono što radni prostor Pejzaž stavlja iznad tla takođe se računa.** Pojedinačne biljke (njihova krošnja pri zreloj širini i visini), živice i sadne gredice (najviša vrsta u njima) i zidovi (njihov vrh) su prepreke ispod voda, bez ponovnog crtanja. Zadržavaju pravila postavljena u {{ui:Slučajevi opterećenja i ograničenja…}}: **Biljke pejzaža ispod voda** (primer skupova koristi *Drveće i biljke*, 3 m) i **Zidovi pejzaža ispod voda** (*Zgrada*); izaberi **Ne proverava se** da ih izostaviš. Razmak se meri pravo nagore od vrha biljke ili zida do provodnika na mestu gde raspon prelazi preko njega; rastojanje u stranu do krošnje pored voda se ne proverava. Pomeranje drveta ili podizanje zida odmah menja provere.

Tvoja pravila razmaka su tvoja: otvori ih sa **Pravila…** pored bilo kog **Pravilo razmaka** (ili preko {{ui:Slučajevi opterećenja i ograničenja…}}) da dodaš, preimenuješ, promeniš ili ukloniš.

## Razmak i zanjihavanje

- **Potreban razmak faza**: k·√(ugib + dužina izolatora) + U/150, sa ugibom u vrućem slučaju i naponom U u kV (uobičajen oblik; k je iz tvog skupa pravila). Upoređuje se sa razmakom faza na traverzi.
- **Zanjihavanje izolatora** na nosivim stubovima, u slučaju vetra: atan(poprečno opterećenje ÷ vertikalno opterećenje), u poređenju sa najvećim zanjihavanjem iz skupa pravila.
- **Uzgon**: nosivi stub niži od svojih suseda može se povući nagore po hladnoći; označava se.

## Opterećenja stubova i dimenzionisanje

Za svaki stub i svaki slučaj opterećenja, sa svim provodnicima voda:

- **Poprečno**: vetar po metru × raspon vetra (polovina dva raspona), plus 2·H·sin(skretanje ÷ 2) na skretanju.
- **Duž voda**: razlika zatezanja dve strane na zateznom stubu ili na uglu; na nosivom stubu samo pod ledom sa jedne strane (svaki raspon se računa posebno, što greši na sigurnoj strani).
- **Vertikalno**: vertikalno opterećenje po metru × raspon težine (između najnižih tačaka sa obe strane) plus oprema.

Horizontalno opterećenje se prenosi na nominalnu tačku stuba (ekvivalentno opterećenje = opterećenje × visina vezivanja ÷ visina nominalne tačke) i poredi se sa njegovim **nominalnim opterećenjem** × faktor iz skupa pravila. Kad je preslabo, predlaže se najmanji stub istog materijala iz tvoje biblioteke koji ga nosi. Stub sa **zategom** prenosi horizontalno opterećenje na zategu, koja nosi opterećenje ÷ sin(ugao zatege) i proverava se prema sopstvenoj nosivosti.

Spojnice (stezaljke, izolatori, traverze) proveravaju se prema svom nazivnom opterećenju: sidrena spojnica nosi zatezanje provodnika, a nosiva spojnica svoj deo vertikalnog i poprečnog opterećenja. Prikazani **temelj** je dubina stuba u tlu i rupa malo šira od njegovog stopala.

## Podaci, veze i struja

- Stavka sa praznim obaveznim poljem, ili ključ koji nije u biblioteci.
- Kraj trase kabla ili oprema povezani sa ničim.
- **Pad napona** i **struja** od svakog izvora (oprema označena kao izvor) do potrošača (kW i faktor snage na opremi), duž nadzemnih raspona i kablova: √3·I·L·(R cos φ + X sin φ), sa R na 20 °C. Više od nazivne struje kabla, ili više pada od onog koji dozvoljava skup pravila, označava se.
