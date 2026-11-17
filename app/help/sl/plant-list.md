---
title: Seznam rastlin
summary: Približno 420 pogostih rastlin zmernega in sredozemskega pasu z velikostmi, odpornostjo, svetlobo in vodo, iskanje v poljubnem jeziku ter lasten seznam, shranjen s projektom.
keywords: seznam rastlin, zbirka rastlin, vrste, botanično ime, splošno ime, paleta rastlin, seznam drevesnice, pas odpornosti, csv, uvoz rastlin, izvoz rastlin, moje rastline, seznam dreves, seznam grmovnic, knjižnica rastlin
from: 7ed09e7e
---

Razdelek **Rastline** na levi plošči navaja vsako rastlino, ki jo lahko postavite. Kliknite eno, da vidite njene velikosti in da postane rastlina, ki jo uporabljata {{ui:Plant}}, {{ui:Bed}} in {{ui:Hedge}}.

## Iskanje in filtriranje

V **Iskanje** vnesite katero koli besedo iz imena rastline v katerem koli jeziku (angleščina, španščina, portugalščina), njeno botanično ime, njeno vrsto ali besedo v njenih opombah. Vsaka vnesena beseda se mora ujemati, zato `quercus evergreen` najde zimzelene hrasti. Naglasna znamenja niso pomembna.

Seznam zožite z **Vrsta**, **Svetloba**, **Voda** in **Pas odpornosti** (pas USDA, v katerem je vaše mesto: rastlina je navedena, kadar je pas znotraj njenega obsega).

## Kaj nosi rastlina

| Polje | Pomen |
|---|---|
| Vrsta | Drevo, grm, živa meja, trava (vključno s travniki), trajnica, pokrovnica ali plezalka |
| Pri zrelosti | Višina in širina rastline, gojene v vrtu ali na ulici, v metrih |
| Pri sajenju | Velikost, v kateri se posadi, in njena posoda |
| Razmik | Od središča do središča v gredici ali vzdolž žive meje |
| Pas odpornosti | Pasovi USDA, v katerih je običajno odporna |
| Svetloba, voda, tla | Kaj potrebuje |
| Opombe | Uporabe in previdnosti, na primer strupeni deli ali rastlina, ki se širi |

:::note
Vgrajeni seznam je bil za CadCraft napisan iz splošnega hortikulturnega znanja: tipične velikosti, zaokrožene. Ni katalog nobene drevesnice. Velikosti in odpornost preverite pri lokalni drevesnici. Najbolj znane invazivne rastline Iberskega polotoka in velikega dela zmernega sveta so namenoma izpuščene, nekatere, ki so invazivne drugje, pa imajo opombo.
:::

## Lastne rastline

- **Dodaj na seznam projekta** kopira rastlino v lasten seznam projekta, kjer se shrani s projektom. Rastlina na vašem seznamu nadomesti vgrajeno z istim ključem, zato lahko spremenite njene velikosti za svojo regijo.
- **Uvozi seznam rastlin…** prebere CSV (ali datoteko rastlin). CSV potrebuje stolpec z botaničnim imenom in, po možnosti, vrsto, višino in širino; imena stolpcev v vaših besedah delujejo (Botanično ime, Splošno ime, Višina, Širina, Premer, Pas). Prebirajo se vejice, podpičja ali tabulatorji ter decimalne vejice. Prazne velikosti sajenja, razmiki in posode dobijo smiselne privzete vrednosti za vrsto.
- **Izvozi kot CSV** shrani vaš seznam (ali, če ga ni, rastline, ki jih prikaže iskanje), da ga odprete v preglednici.

Seznam rastlin se prebere kot vsaka datoteka od zunaj: karkoli ne more uporabiti, se izpusti in šteje.

## Rastline v drugih aplikacijah

Seznam rastlin je ena knjižnica za vse aplikacije CadCraft: BimCraft in ModelCraft imata isti seznam, njuna lastna Postavi iz knjižnice pa rastlin še ne ponuja. Danes rastline pridejo v BIM model prek krajinskega IFC iz CivilCraft (vsaka rastlina kot `IfcGeographicElement`). Glejte [Sajenje](topic:planting#ifc).
