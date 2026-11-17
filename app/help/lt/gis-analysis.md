---
title: Analizuoti GIS sluoksnius
summary: Buferis, persidengimas (sankirta, sąjunga, pašalinimas, sujungimas), erdvinis susiejimas, pasirinkimas pagal atributą ir GIS sluoksnių matavimas projekte. Kiekvienas rezultatas tampa nauju sluoksniu, kurį galima anuliuoti.
keywords: gis, analizė, buferis, persidengimas, sankirta, sąjunga, pašalinimas, iškirpimas, sujungimas, erdvinis susiejimas, susiejimas, pasirinkimas pagal atributą, užklausa, sąlyga, išraiška, statistika, plotas, ilgis, perimetras, matavimas, sklypai, servitutas, atitraukimas, shapefile, geopackage, atributų lentelė
from: a6b2d3f9
---

Kai projekte yra GIS sluoksnių (žr. [Importuoti GIS duomenis](topic:gis-import)), mygtukas **Analizuoti** GIS grupėje (įvedamas kaip `GISANALYSIS`, `ANALYZE` arba `BUFFER`) atveria skydelį su penkiais skirtukais. Jis lieka atidarytas šalia plano, todėl tai, ką pasirenkate, rodoma plane jums dirbant.

Kiekvienas įrankis, kuris ką nors sukuria, **prideda naują sluoksnį**, o sluoksnius, iš kurių skaitė, palieka visiškai nepakeistus. Kiekvienas rezultatas yra vienas anuliavimo žingsnis: {{ui:Anuliuoti}} skydelyje (arba Ctrl+Z) pašalina naują sluoksnį. Rezultatą eksportuokite kaip bet kurį sluoksnį naudodami [Faktinių (as-built) duomenų eksportas į GIS](topic:gis-export) kaip shapefile, GeoJSON arba GeoPackage.

Pilna sluoksnio lentelė su rikiavimu, redagavimu ir lauko skaičiuokle aprašyta [Darbas su sluoksnio atributų lentele](topic:gis-table). Spalvinimas pagal lauką aprašytas [Sluoksnio stilius pagal atributą](topic:gis-symbology).

Viskas atliekama plane, projekto vienetais (pėdomis arba metrais). Projektas visada yra projekcijos arba vietinėje sistemoje, todėl atstumas 50 reiškia 50 pėdų arba 50 metrų, niekada laipsnius. Aukščiai (z) rezultatuose nelaikomi.

## Buferis

Nubrėžia zoną nustatytu atstumu aplink kiekvieną objektą kaip naują poligonų sluoksnį. Taškai tampa apskritimais, linijos – koridoriais su apvaliais galais, poligonai išsiplečia. **Neigiamas** atstumas susiaurina poligonus (100 × 100 kvadratas, susiaurintas per 5, tampa 90 × 90; susiaurintas per 60, nieko nelieka, ir skydelis apie tai praneša). Atstumą galite imti iš skaitinio lauko, kad kiekvienas objektas turėtų savo, arba pažymėti **Sujungti visus buferius į vieną figūrą**, kad jie būtų sujungti.

Apvalios dalys sudarytos iš tiesių atkarpų, nubrėžtų vidine kreive, todėl buferis yra truputį mažesnis nei tikslus apskritimas: maždaug 0.6 % pagal plotą įprastu nustatymu ir 0.16 % nustatymu „Smulkus“. Nustatymą „Smulkus“ naudokite viskam, ką matuosite.

## Persidengimas

| Įrankis | Ką gausite |
|---|---|
| Sankirta | Dalys, kur įvesties sluoksnis susikerta su persidengimo poligonais, kiekviena su abiejų sluoksnių laukais. Linijos ir taškai iškerpami pagal poligonus. |
| Sąjunga | Abu poligonų sluoksniai supjaustyti pagal vienas kito kraštines: bendros dalys turi abiejų sluoksnių laukus, likusios – vieno sluoksnio laukus (kito sluoksnio laukai tušti). |
| Pašalinimas | Įvesties poligonai, iš kurių pašalinti persidengimo poligonai. Laukai lieka su įvesties sluoksniu. Visiškai pašalintas objektas išmetamas (skydelis juos suskaičiuoja). |
| Sujungimas | Sujungia poligonus, kurie liečiasi arba persidengia, visus arba po vieną figūrą kiekvienai lauko reikšmei. Prideda `COUNT` ir `AREA`. |

Lauko pavadinimas, kurį turi abu sluoksniai, išsaugomas pirmajam sluoksniui, o antrojo sluoksnio – su `_2`. Objektai viename sluoksnyje neturėtų persidengti tarpusavyje: jei taip yra, sąjunga persidengimą skaičiuoja abiejuose.

## Susiejimas

Erdvinis susiejimas nukopijuoja atributus iš **šaltinio** sluoksnio į kiekvieną **tikslinį** objektą, kuris su juo liečiasi, ir sukuria naują sluoksnį su tikslinio objekto figūromis. Pasirinkite, kada jie laikomi susietais: liečiasi arba persidengia, tikslinis objektas yra šaltinio poligono viduje, tikslinis objektas apima šaltinio objektą, artimiausias šaltinio objektas (su neprivaloma riba) arba bet koks šaltinio objektas nustatytu atstumu.

Kai atitinka keli šaltinio objektai, imami pirmojo objekto atributai (artimiausio, jei susiejimas artimiausio arba atstumo; pridedamas `DISTANCE`), arba **jie suskaičiuojami ir jų skaitiniai laukai susumuojami**: `COUNT`, o kiekvienam skaitiniam laukui – `SUM_`, `MEAN_`, `MIN_`, `MAX_`. Nuimkite žymę nuo **Palikti tikslinius objektus, kuriems neatitiko šaltinio objektų**, kad jie būtų išmesti. Susietieji laukai tušti, kur nieko neatitiko, o skydelis suskaičiuoja neatitikusius.

## Pasirinkimas

Įveskite klausimą apie atributus ar figūrą, spustelėkite **Pasirinkti**, ir objektai bus parodyti plane su savo skaičiumi, lentele ir bendru plotu, ilgiu ar skaičiumi. Tada galite iš jų sukurti atskirą sluoksnį, priartinti prie jų arba panaikinti pasirinkimą.

| Galite rašyti | Pavyzdys |
|---|---|
| Lauko pavadinimą; jei pavadinime yra tarpų, naudokite "kabutes" arba [laužtinius skliaustus] | `VALUE`, `"Lot Number"` |
| Skaičius, 'tekstą', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekstas nepaisa raidžių dydžio; `like` atveju `%` reiškia bet kokią seką, o `_` – vieną raidę) | `Notes contains 'corner'` |
| `is null`, `is not null` (tuščia reikšmė laikoma null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` ir skliaustai | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Figūros reikšmės `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Klausimas, kuris neužbaigtas arba nurodo lauką, kurio sluoksnyje nėra, atmetamas su sakiniu, kuriame nurodoma, kur problema.

## Matavimas

Parodo bendrą sluoksnio plotą ir perimetrą, ilgį arba skaičių ir **prideda laukus**: `AREA` ir `PERIMETER` poligonams, `LENGTH` linijoms (plano ilgis), `X` ir `Y` taškams. Jau esantis laukas niekada nepakeičiamas: naujas pavadinamas `AREA_2`. Tai yra vienas anuliavimo žingsnis. **Statistika** pateikia skaitinio lauko skaičių, sumą, vidurkį, mažiausią ir didžiausią reikšmę, neprivalomai kiekvienai kito lauko reikšmei atskirai.

:::note
Šių įrankių patikrinimai atliekami rankiniu būdu testuose (`node bin/test-civilcraft-gisanalysis.mjs`): pavyzdžiui, 100 × 100 sklypai po 100 × 80 zona susikerta 3,000 + 3,000, o 100 ilgio linija, buferizuota per 10, yra 2,000 + apskritimas.
:::
