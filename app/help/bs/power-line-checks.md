---
title: Provjere dalekovoda
summary: Šta CivilCraft provjerava na svakom vodu i kablu, uvijek ažurno: slobodne visine, razmake, ljuljanje, podizanje, opterećenja stubova i dimenzioniranje, pribor, zatege, temelje, nedostajuće podatke, veze, preopterećenja i pad napona.
keywords: provjere, slobodna visina, prepreka, ukrštanje, razmak faza, ljuljanje izolatora, podizanje, opterećenje stuba, nazivno opterećenje, dimenzioniranje, temelj, zatega, pribor, poprečna traverza, pad napona, preopterećenje, nedostajući podaci, nepovezano
from: e6a0da47
---

**Provjere** u odjeljku Dalekovodi navode svaki problem: crveno za ono što ne zadovoljava, žuto za upozorenja. Kliknite na jedan da odaberete vod, stub, kabl ili opremu na koju se odnosi; stubovi i rasponi koji ne zadovoljavaju kriterij označeni su crvenim krugom u planu dok je radni prostor otvoren.

:::warning
Pomoćno sredstvo za projektovanje: ovo su provjere vašeg projekta prema vašim pravilima, a ne certifikacija.
:::

## Slobodne visine

Najniža faza provodnika prati se duž svakog raspona pri svakom slučaju opterećenja. Njena najniža slobodna visina iznad terena mora dostići **pravilo slobodne visine** voda. Gdje raspon prelazi preko **prepreke** (nacrtane pomoću {{ui:Prepreka}}: tačka ili linija, s njenom visinom iznad terena i vlastitim pravilom slobodne visine), slobodna visina iznad vrha prepreke provjerava se na isti način.

**Ono što radni prostor Landscape stavlja iznad terena također se računa.** Pojedinačne biljke (njihova krošnja pri punom razvoju i visini), živice i sadnice (najviša vrsta u njima) te zidovi (njihov vrh) su prepreke ispod voda, bez ponovnog crtanja. Zadržavaju pravila postavljena u {{ui:Slučajevi opterećenja i ograničenja…}}: **Biljke iz Landscape ispod voda** (primjeri koriste *Drveće i biljke*, 3 m) i **Zidovi iz Landscape ispod voda** (*Zgrada*); odaberite **Ne provjerava se** da ih izostavite. Slobodna visina mjeri se pravo nagore od vrha biljke ili zida do vodiča tamo gdje raspon prelazi preko njih; udaljenost u stranu do krošnje pored voda se ne provjerava. Pomicanje drveta ili podizanje zida odmah mijenja provjere.

Vaša pravila slobodnih visina su vaša: otvorite ih preko **Pravila…** pored bilo kojeg **pravila slobodne visine** (ili {{ui:Slučajevi opterećenja i ograničenja…}}) da dodate, preimenujete, promijenite ili uklonite.

## Razmak i ljuljanje

- **Potreban razmak faza**: k·√(ugib + dužina izolatora) + U/150, s ugibom vrućeg slučaja i naponom U u kV (uobičajen oblik; k je iz vašeg skupa pravila). Upoređuje se s razmakom faza poprečne traverze.
- **Ljuljanje izolatora** na nosećim stubovima, pod slučajem vjetra: atan(poprečno opterećenje ÷ vertikalno opterećenje), upoređeno s najvećim ljuljanjem iz skupa pravila.
- **Podizanje**: nosivi stub niži od susjednih može biti podignut po hladnoći; označava se.

## Opterećenja stubova i dimenzioniranje

Za svaki stub i slučaj opterećenja, sa svim vodičima voda:

- **Poprečno**: vjetar po metru × raspon vjetra (polovina dva raspona), plus 2·H·sin(skretanje ÷ 2) na skretanju.
- **Duž voda**: razlika napetosti dviju strana na krajnjem ili uglovnom stubu; na nosećem stubu samo pod ledom s jedne strane (svaki raspon se računa zasebno, što ide na sigurnu stranu).
- **Vertikalno**: vertikalno opterećenje po metru × raspon težine (između najnižih tačaka s obje strane) plus oprema.

Horizontalno opterećenje prenosi se na nazivnu tačku stuba (ekvivalentno opterećenje = opterećenje × visina vezivanja ÷ visina nazivne tačke) i upoređuje se s njegovim **nazivnim opterećenjem** × faktor iz skupa pravila. Kad je preslabo, predlaže se najmanji stub istog materijala u vašoj biblioteci koji ga nosi. Stub sa **zategom** prenosi horizontalno opterećenje na zategu, koja nosi opterećenje ÷ sin(ugao zatege) i provjerava se prema vlastitoj nosivosti.

Pribor (stezaljke, izolatori, poprečne traverze) provjerava se prema nazivnom opterećenju: sidreni pribor nosi napetost vodiča, a noseći pribor svoj dio vertikalnog i poprečnog opterećenja. **Temelj** prikazan je dubina stuba u zemlji i rupa nešto šira od njegovog stopala.

## Podaci, veze i struja

- Stavka kojoj nedostaje obavezno polje, ili ključ koji nije u biblioteci.
- Kraj trase kabla ili oprema koja nije povezana ni s čim.
- **Pad napona** i **struja** od svakog izvora (oprema označena kao izvor) do opterećenja (kW i faktor snage na opremi), duž nadzemnih raspona i kablova: √3·I·L·(R cos φ + X sin φ), s R na 20 °C. Ako je više od nazivne struje kabla ili više pada nego što skup pravila dozvoljava, označava se.
