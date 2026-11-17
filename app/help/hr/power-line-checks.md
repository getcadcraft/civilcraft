---
title: Provjere dalekovoda
summary: Što CivilCraft provjerava na svakom vodu i kabelu, uvijek ažurno: slobodne visine, razmake, otklone, podizanje, opterećenja stupova i dimenzioniranje, pribor, zatege, temelje, nedostajuće podatke, spojeve, preopterećenja i pad napona.
keywords: provjere, slobodna visina, prepreka, križanje, razmak faza, otklon izolatora, podizanje, opterećenje stupa, nazivno opterećenje, dimenzioniranje, temelj, zatega, pribor, traverza, pad napona, preopterećenje, nedostajući podaci, nespojeno
from: e6a0da47
---

**Provjere** u odjeljku Dalekovodi navodi svaki problem: crveno za ono što ne prolazi, a žuto za upozorenja. Kliknite jednu da odaberete vod, stup, kabel ili opremu na koje se odnosi; neuspjeli stupovi i rasponi zaokruženi su crveno na tlocrtu dok je radni prostor otvoren.

:::warning
Pomoćno sredstvo za projektiranje: ovo su provjere vašeg projekta prema vlastitim pravilima, a ne certifikacija.
:::

## Slobodne visine

Najniža fazna žica vodiča prati se duž svakog raspona pri svakom slučaju opterećenja. Njezina najmanja slobodna visina iznad terena mora dostići **Pravilo slobodne visine** voda. Gdje raspon siječe **prepreku** (nacrtanu s {{ui:Prepreka}}: točka ili linija, s njezinom visinom iznad terena i vlastitim pravilom slobodne visine), slobodna visina iznad vrha prepreke provjerava se na isti način.

**Ono što radni prostor Krajolik stavlja iznad terena također se računa.** Pojedine biljke (njihova krošnja pri zrelom rasponu i visini), živice i sadnje (najviša vrsta u njima) te zidovi (njihov vrh) su prepreke ispod voda, bez ponovnog crtanja. Zadržavaju pravila postavljena u {{ui:Slučajevi opterećenja i granice…}}: **Biljke iz krajolika ispod voda** (primjer skupova koristi *Drveće i biljke*, 3 m) i **Zidovi iz krajolika ispod voda** (*Zgrada*); odaberite **Ne provjerava se** da ih izostavite. Slobodna visina mjeri se ravno gore od vrha biljke ili zida do vodiča tamo gdje raspon prelazi preko njih; udaljenost u stranu do krošnje uz vod se ne provjerava. Pomicanje drveta ili podizanje zida odmah mijenja provjere.

Vaša pravila slobodne visine su vaša vlastita: otvorite ih pomoću **Pravila…** pokraj bilo kojeg **Pravila slobodne visine** (ili {{ui:Slučajevi opterećenja i granice…}}) za dodavanje, preimenovanje, promjenu ili uklanjanje.

## Razmak i otklon

- **Potrebni razmak faza**: k·√(progib + duljina izolatora) + U/150, uz progib pri vrućem slučaju i napon U u kV (uobičajen oblik; k je iz vašeg skupa pravila). Uspoređuje se s razmakom faza na traverzi.
- **Otklon izolatora** na ovjesnim stupovima, pri slučaju vjetra: atan(poprečno opterećenje ÷ vertikalno opterećenje), u odnosu na najveći otklon iz skupa pravila.
- **Podizanje**: ovjesni stup niži od susjednih može se pri hladnoći podići; označava se.

## Opterećenja stupova i dimenzioniranje

Za svaki stup i slučaj opterećenja, sa svim vodičima voda:

- **Poprečno**: vjetar po metru × raspon vjetra (polovica dvaju raspona), uz 2·H·sin(skretanje ÷ 2) na zavoju.
- **Uzduž voda**: razlika napetosti dviju strana na kraju ili kutu; na ovjesnom stupu samo pod ledom na jednoj strani (svaki raspon zasebno, što je na strani sigurnosti).
- **Vertikalno**: vertikalno opterećenje po metru × raspon težine (između najnižih točaka s obje strane) uz opremu.

Vodoravno opterećenje prenosi se na nazivnu točku stupa (ekvivalentno opterećenje = opterećenje × visina vezanja ÷ visina nazivne točke) i uspoređuje s njegovim **nazivnim opterećenjem** × faktor skupa pravila. Kad je preslabo, predlaže se najmanji stup istog materijala u vašoj knjižnici koji ga nosi. Stup sa **zategom** prenosi vodoravno opterećenje na zategu, koja nosi opterećenje ÷ sin(kut zatege) i provjerava se prema vlastitoj nosivosti.

Pribor (stezaljke, izolatori, traverze) provjerava se prema nazivnom opterećenju: sidreni pribor nosi napetost vodiča, ovjesni svoj dio vertikalnog i poprečnog opterećenja. Prikazani **temelj** je dubina stupa u tlu i rupa nešto šira od njegove stope.

## Podaci, spojevi i struja

- Stavka kojoj je potrebno polje prazno ili ključ koji nije u knjižnici.
- Kraj kabelske trase ili oprema nisu spojeni ni na što.
- **Pad napona** i **struja** od svakog izvora (oprema označena kao izvor) do opterećenja (kW i faktor snage na opremi), duž nadzemnih raspona i kabela: √3·I·L·(R cos φ + X sin φ), s R pri 20 °C. Više od nazivne struje kabela ili više pada nego što skup pravila dopušta označava se.
