---
title: Ngenisa amaphoyinti okuhlola
summary: Vula ifayela lamaphoyinti elingu-CSV noma elombhalo, hlola ukuhleleka kwamakholomu kwingxoxo ethi Ngenisa amaphoyinti, lungisa imigqa engafundeki, bese uhlela amaphoyinti abe amaqembu.
keywords: ngenisa amaphoyinti, csv, txt, pnezd, penzd, ifayela lephoyinti, ukuhlola, amaphoyinti e-cogo, amaqembu wamaphoyinti, amakholomu, i-northing, i-easting
from: ad33d88a
---

Ifayela lamaphoyinti liyifayela lombhalo elinephoyinti elilodwa emgqeni ngalinye: inombolo yephoyinti, northing, easting, ukuphakama nencazelo, noma ngayiphi indlela, zihlukaniswe ngamakhoma, ama-tab, amasemikholoni noma izikhala. I-CivilCraft iyilanda esiphequluleni futhi yakha ubuso kuyo ngokushesha.

## Ngaphambi kokuqala

- Yazi ukuhleleka kwamakholomu uma ungakwazi (i-PNEZD ne-PENZD zifana kukhompyutha).
- Yazi amayunithi awo. I-CivilCraft ayiguquli: setha **Amayunithi** ohlangothini lwesokunxele ukuze afane nefayela (bona [Amayunithi, iziteshi nezindlela zamanani](topic:units-and-stations)).
- Ama-coordinates angaba makhulu (ama-northing nama-easting esisekelo sesifunda ezigidini kulungile).

## Ngenisa ifayela

1. Chofoza {{ui:Open}} kwithuluzi, noma cindezela {{key:Mod+O}}, bese ukhetha ifayela. Ungaliwisa nasepulanini.
   Ingxoxo **Ngenisa amaphoyinti** ivula ngegama lefayela, uhlu **Amakholomu** oluthi {{ui:Detect}}, umugqa wesifinyezo kanye namaphoyinti ayisithupha okuqala.
2. Funda umugqa wesifinyezo. Ushoma ukuthi amaphoyinti angaki afundwa, ngasiphi isimo samakholomu, ukuthi lolu hlelo lutholakale kanjani, nokuthi yiziphi izinhlukanisi zamakholomu. Izindlela ezintathu zokuthola ukuhleleka:
   - "kusuka emgqeni wekhanda": umugqa wokuqala uqamba amakholomu awo (Point, Northing, Easting, Elevation, Description, noma X, Y, Z …). Lena iyeyona ephephile.
   - "njengoba kukhethiwe": ukhethe ukuhleleka ku-**Amakholomu**.
   - "kuqagelwe kusuka ekubalweni kwamakholomu nesethingi somugqa wephoyinti (PNEZD) — hlola ukuthi northing ne-easting azishintshiwe": kwakungekho khanda elisebenzayo. Uma amafayela akho ngokuvamile enama-easting kuqala, setha **Imigqa yamaphoyinti** ku-P, E, N, Z, D kwi[Izilungiselelo ze-CivilCraft](topic:settings).
3. Hlola ithebula lokubuka. Amakholomu alo ngaso sonke isikhathi ayi **Point**, **Northing**, **Easting**, **Elevation**, **Description**, nanoma yisiphi isimo ifayela lisebenzisa. Ama-northing nama-easting esayithi yangempela ngokuvamile amakhulu ahlukile: uma ebonakala eshintshiwe, ukuqagela kwakungalungile.
4. Uma ukuhleleka kungalungile, khetha okulungile ku-**Amakholomu** (isibonelo {{ui:PENZD — point, easting, northing, elevation, description}}). Umugqa wesifinyezo nokubuka kuyabuyekezwa ngokushesha.
5. Bheka ngaphansi kokubuka ku-**Imigqa engafundwanga**. Umugqa ngamunye ukhomba inombolo yomugqa wefayela, isizathu nokuqala komugqa. Bona [Imigqa engafundwanga](topic:import-points#rows-that-are-not-read).
6. Chofoza {{ui:Import}}.
   Amaphoyinti avela epulanini, umbono usondela kuwo, futhi ubuso buyakhiwa. Umugqa wesimo ukhombisa, isibonelo, "Kungenisiwe amaphoyinti angu-276 kusuka ku-site.csv; ubuso: ama-triangle angu-546."

Uma iphrojekthi ingakabi nagama, ithatha igama lefayela.

## Hlola amaqembu

Iphoyinti ngalinye lisemqembwini ogama lawo liyinhlamvu yokuqala yencazelo yalo, ngamakhamandla: "GRD", "FL 12" kanye "fl" yizinhlobo GRD, FL no-FL. Amaphoyinti angenancazelo angena "(akukho ncazelo)".

1. Bheka ithebula ngaphansi kwe-**Amaphoyinti** ohlangothini lwesokunxele: iqembu, inani lamaphoyinti kanye nokukhetha **Ubuso**.
2. Wonke amaqembu aqala njenge-{{ui:Points}}. Shintsha imigqa yokugeleza, imiphetho yomgwaqo, izindawo eziphezulu nezinyawo zethambeka, imigqa yocingo nemigqa efanayo ibe {{ui:Breakline}}. Setha amaqembu okungafanele akhe umhlaba (amaphoyinti okulawula, izindawo eziphezulu zezihlahla, amapholo kagesi ahlolwa phezulu) abe {{ui:Left out}}.
3. Chofoza iphoyinti epulanini (nge-{{ui:Select}}) ukuze ubone inombolo yalo, izixhumanisi, ukuphakama, incazelo nequembu ohlangothini lwesokudla.

:::warning
Iqembu le-breakline lihlanganisa **wonke** amaphoyinti alo ibe **umugqa munye**, ngokuhleleka kwenombolo yephoyinti. Lokhu kuyasebenza uma umugqa ngamunye uhlolwe ngokulandelana nekhodi yawo. Imigqa emibili yokugeleza ekhodwe ngokuthi "FL" ibe umugqa munye oshukuzelayo phakathi kwawo. Uma amakhodi ehlanganyelwa, sebenzisa ithuluzi le-{{ui:Breakline}} ukuchofoza amaphoyinti womugqa ngamunye (bona [Yakha futhi ulungise ubuso](topic:build-surface)).
:::

## Imigqa engafundwanga

| Isizathu esikhonjisiwe | Lokho kusho | Yini okufanele uyenze |
|---|---|---|
| northing noma easting akuyona inombolo | Ikholomu lokuxhumanisa liqukethe umbhalo | Hlola ukuhleleka kwamakholomu, noma umugqa wombhalo ongavamile phakathi kwefayela |
| ukuphakama akuyona inombolo | Ikholomu lokuphakama liqukethe umbhalo | Ukuhleleka okungalungile kwamakholomu, noma incazelo ekholomini lokuphakama |
| akukho inombolo yephoyinti | Ikholomu yephoyinti ayinalutho | Nika iphoyinti inombolo, noma khetha ukuhleleka okungenaP (NEZD, NEZ …): amaphoyinti azobe enikezwa izinombolo 1, 2, 3 … |
| iphoyinti 12 likhona kabili (eyokuqala iyagcinwa) | Imigqa emibili yabelana ngenombolo | Shintsha inombolo yomunye wawo ku-file uma womabili ayiphoyinti langempela |
| amakholomu angu-3, kulindeleke angu-5 (PNEZD) | Umugqa umfushane | Umugqa ophukile, noma ukuhleleka okungalungile kwamakholomu |

Iphoyinti elinokuphakama okungenalutho ligcinwa, kodwa alisetshenziswa ebusweni. Ukukhombisa **Amaphoyinti** kutshela ukuthi amaphoyinti amangaki anokuphakama.

Imigqa eqala nge-`#`, `;` noma `//` ingamazwana futhi iyadlulwa. Imigqa engenalutho iyadlulwa.

## Faka esikhundleni noma engeza amaphoyinti

Ukungenisa futhi **kuyashintsha** wonke amaphoyinti; akuwengezi kwawo. Ama-alignment, amapedi, amapayipi, imigqa yokuphula edwetshiwe nomkhawulo wakho kuyahlala. Umlando wokuhlehlisa uyasulwa, ngakho londoloza iphrojekthi kuqala uma ungase udinge amaphoyinti amadala. Ukuhlanganisa amafayela amabili, yihlanganise kumhleli wombhalo noma kumshidi ngaphambi kokungenisa (qaphela izinombolo zamaphoyinti aphindwayo).

Amaphoyinti awakwazi ukuhanjiswa, ahlelwe noma asuswe ngaphakathi kwe-CivilCraft okwamanje. Lungisa kufayela bese ungenisa futhi.

## Okuhlobene

- [Izinhlobo zamafayela amaphoyinti](topic:point-file-formats): zonke izinhlelo zamakholomu nokuthi amakhanda abonwa kanjani.
- [Yakha futhi ulungise ubuso](topic:build-surface).
