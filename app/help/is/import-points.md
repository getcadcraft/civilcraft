---
title: Flytja inn mælipunkta
summary: Opnaðu CSV- eða textaskrá með punktum, athugaðu röð dálka í glugganum Flytja inn punkta, lagfærðu línur sem ekki er hægt að lesa og raðaðu punktunum í hópa.
keywords: flytja inn punkta, csv, txt, pnezd, penzd, punktaskrá, mæling, cogo-punktar, punktahópar, dálkar, norður austur
from: ad33d88a
---

Punktaskrá er textaskrá með einum punkti í línu: punktanúmer, norður, austur, hæð og lýsing í einhverri röð, aðskilin með kommum, tabbum, semíkommum eða bilum. CivilCraft les hana í vafranum og byggir yfirborð úr henni strax.

## Áður en þú byrjar

- Vittu röð dálka skrárinnar ef þú getur (PNEZD og PENZD líta eins út fyrir tölvu).
- Vittu einingarnar. CivilCraft breytir þeim ekki: stilltu **Einingar** í vinstra spjaldinu þannig að þær passi við skrána (sjá [Einingar, stöðvar og talnasnið](topic:units-and-stations)).
- Hnit geta verið stór (norður- og austurhnit í ríkjaplani í milljónum eru í lagi).

## Flytja inn skrána

1. Smelltu á {{ui:Opna}} á tækjastikunni, eða ýttu á {{key:Mod+O}}, og veldu skrána. Þú getur einnig dregið hana á teikninguna.
   Glugginn **Flytja inn punkta** opnast með heiti skrárinnar, **Dálkar**-lista stilltum á {{ui:Greina}}, samantektarlínu og fyrstu sex punktunum.
2. Lestu samantektarlínuna. Hún segir hversu margir punktar voru lesnir, í hvaða dálkaröð, hvernig þessi röð fannst og hvað aðskilur dálkana. Þrjár leiðir eru til að finna röðina:
   - "úr hausröðinni": fyrsta línan nefnir dálka sína (Point, Northing, Easting, Elevation, Description, eða X, Y, Z …). Þetta er öruggast.
   - "eins og valið": þú valdir röð í **Dálkar**.
   - "giskað út frá fjölda dálka og stillingu á punktalínum (PNEZD) — athugaðu að norður og austur séu ekki víxluð": enginn nothæfur haus var til staðar. Ef skrárnar þínar eru venjulega með austur fyrst, stilltu **Punktalínur** á P, E, N, Z, D í [stillingum CivilCraft](topic:settings).
3. Athugaðu forskoðunartöfluna. Dálkar hennar eru alltaf **Point**, **Northing**, **Easting**, **Elevation**, **Description**, hvaða röð sem skráin notar. Norður- og austurhnit raunverulegs svæðis eru yfirleitt greinilega ólík að stærð: ef þau virðast víxluð var giskið rangt.
4. Ef röðin er röng, veldu rétta í **Dálkar** (til dæmis {{ui:PENZD — punktur, austur, norður, hæð, lýsing}}). Samantektin og forskoðunin uppfærast strax.
5. Líttu undir forskoðuninni eftir **Línur sem ekki voru lesnar**. Hver lína nefnir línunúmer skrárinnar, ástæðuna og upphaf línunnar. Sjá [Línur sem ekki eru lesnar](topic:import-points#rows-that-are-not-read).
6. Smelltu á {{ui:Flytja inn}}.
   Punktarnir birtast á teikningunni, sýnin þysjar að þeim og yfirborðið er byggt. Stöðustikan segir til dæmis: "Flutti inn 276 punkta úr site.csv; yfirborð: 546 þríhyrningar."

Ef verkefnið hafði ekkert heiti ennþá, fær það heiti skrárinnar.

## Athugaðu hópana

Sérhver punktur tilheyrir hópi sem heitir eftir **fyrsta orði lýsingar sinnar**, með hástöfum: "GRD", "FL 12" og "fl" eru hóparnir GRD, FL og FL. Punktar án lýsingar fara í "(engin lýsing)".

1. Líttu á töfluna undir **Punktar** í vinstra spjaldinu: hópur, fjöldi punkta og val á **Yfirborði**.
2. Sérhver hópur byrjar sem {{ui:Punktar}}. Breyttu rennslislínum, kantum á yfirborði, efri og neðri brún hallar, hryggjum og svipuðum kóðuðum línum í {{ui:Brotalína}}. Stilltu hópa sem ættu ekki að móta landið (stjórnpunkta, trjátoppa, rafmagnsstaura mældir efst) á {{ui:Sleppt}}.
3. Smelltu á punkt á teikningunni (með {{ui:Velja}}) til að sjá númer hans, hnit, hæð, lýsingu og hóp í hægra spjaldinu.

:::warning
Brotalínuhópur tengir **alla** punkta sína í **eina** línu, í röð punktanúmera. Það gengur upp þegar hver kóðuð lína var mæld í röð með eigin kóða. Tvær aðskildar rennslislínur sem báðar eru kóðaðar "FL" verða að einni línu sem sikksakkar á milli þeirra. Ef kóðar þínir eru sameiginlegir skaltu nota {{ui:Brotalína}}-tólið og smella á punkta hverrar línu í staðinn (sjá [Byggja og fínstilla yfirborðið](topic:build-surface)).
:::

## Línur sem ekki eru lesnar

| Ástæða sem birt er | Hvað það merkir | Hvað á að gera |
|---|---|---|
| "norður- eða austurhnit er ekki tala" | Hnitadálkur inniheldur texta | Athugaðu röð dálka, eða stakri textalínu í miðri skránni |
| "hæð er ekki tala" | Hæðardálkurinn inniheldur texta | Röng röð dálka, eða lýsing í hæðardálkinum |
| "ekkert punktanúmer" | Punktadálkurinn er tómur | Gefðu punktinum númer, eða veldu röð án P (NEZD, NEZ …): punktar fá þá númerin 1, 2, 3 … |
| "punktur 12 kemur fyrir tvisvar (sá fyrsti er geymdur)" | Tvær línur deila númeri | Endurnúmeraðu aðra þeirra í skránni ef báðar eru raunverulegar mælingar |
| "3 dálkar, 5 áttu að vera (PNEZD)" | Línan er stutt | Brotin lína, eða röng röð dálka |

Punktur án hæðar er geymdur, en er ekki notaður í yfirborðinu. Staðreyndir **Punkta** sýna hversu margir punktar hafa hæð.

Línur sem byrja á `#`, `;` eða `//` eru athugasemdir og er sleppt. Auðum línum er sleppt.

## Skipta út eða bæta við punktum

Innflutningur aftur **skiptir út** öllum punktunum; hann bætir þeim ekki við. Veglínur þínar, pallar, lagnir, teiknaðar brotalínur og mörk haldast. Afturköllunarsagan er hreinsuð, þannig að vistaðu verkefnið fyrst ef þú gætir viljað fá gömlu punktana aftur. Til að sameina tvær skrár skaltu tengja þær saman í textaritli eða töflureikni áður en þú flytur inn (passaðu þig á endurteknum punktanúmerum).

Ekki er hægt að færa, breyta eða eyða punktum innan CivilCraft ennþá. Lagfærðu þá í skránni og fluttu inn aftur.

## Tengt

- [Snið punktaskráa](topic:point-file-formats): sérhver röð dálka og hvernig hausar eru þekktir.
- [Byggja og fínstilla yfirborðið](topic:build-surface).
