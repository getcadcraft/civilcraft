---
title: Analizēt GIS slāņus
summary: Bufers, pārklāšana (krustošana, apvienošana, izgriešana, izšķīdināšana), telpiskā savienošana, atlase pēc atribūta un GIS slāņu mērīšana projektā; katrs rezultāts ir jauns slānis, ko var atsaukt.
keywords: gis, analīze, bufers, pārklāšana, krustošana, apvienošana, izgriešana, apgriešana, izšķīdināšana, telpiskā savienošana, savienošana, atlase pēc atribūta, vaicājums, kur, izteiksme, statistika, laukums, garums, perimetrs, mērīšana, zemesgabali, servitūts, atkāpe, shapefile, geopackage, atribūtu tabula
from: a6b2d3f9
---

Kad projektam ir GIS slāņi (skatiet [Importēt GIS datus](topic:gis-import)), poga **Analīzēt** grupā GIS (ierakstot `GISANALYSIS`, `ANALYZE` vai `BUFFER`) atver paneli ar pieciem cilnēm. Tas paliek atvērts blakus plānam, tāpēc to, ko atlasāt, plānā zīmē, kamēr strādājat.

Katrs rīks, kas kaut ko izveido, **pievieno jaunu slāni** un atstāj slāņus, no kuriem tas nolasīja datus, tieši tādus, kādi tie bija. Katrs ir viens atsaucams solis: {{ui:Atsaukt}} panelī (vai Ctrl+Z) noņem jauno slāni. Rezultātu var eksportēt kā jebkuru slāni ar [Eksportēt izbūves datus GIS](topic:gis-export) kā shapefile, GeoJSON vai GeoPackage.

Pilnu slāņa tabulu ar kārtošanu, rediģēšanu un lauku kalkulatoru skatiet [Darbs ar slāņa atribūtu tabulu](topic:gis-table); krāsošanu pēc lauka skatiet [Stila piešķiršana slānim pēc atribūta](topic:gis-symbology).

Viss tiek veikts plānā projekta vienībās (pēdās vai metros). Projekts vienmēr atrodas projicētā vai lokālā sistēmā, tāpēc attālums 50 nozīmē 50 pēdas vai 50 metrus, nekad grādus. Augstumi (z) rezultātos netiek saglabāti.

## Bufers

Zīmē noteiktas distances zonu ap katru objektu kā jaunu poligonu slāni. Punkti kļūst par riņķiem, līnijas par koridoriem ar noapaļotiem galiem, poligoni palielinās. **Negatīva** distance sašaurina poligonus (kvadrāts 100 x 100, sašaurināts par 5, kļūst par 90 x 90; sašaurināts par 60 nekas nepaliek, un panelis to norāda). Attālumu var ņemt no skaitliska lauka, lai katram objektam būtu sava distance, vai atzīmēt **Apvienot visus buferus vienā formā**, lai tos izšķīdinātu.

Noapaļotās daļas ir taisnas līnijas, kas novietotas iekšpus patiesās līknes, tāpēc bufers ir nedaudz mazāks par precīzo riņķi: aptuveni par 0.6 % laukumā parastajā iestatījumā un par 0.16 % iestatījumā Smalks. Izmantojiet Smalks visam, ko plānosiet mērīt.

## Pārklāšana

| Rīks | Ko iegūstat |
|---|---|
| Krustošana | Daļas, kur ievades slānis saskaras ar pārklājuma poligoniem, katra ar abu slāņu laukiem. Līnijas un punkti tiek apgriezti pēc poligoniem. |
| Apvienošana | Abi poligonu slāņi sagriezti pa otra malām: kopīgās daļas satur abu slāņu laukus, pārējās tikai viena slāņa laukus (otra lauki ir tukši). |
| Izgriešana | Ievades poligoni bez pārklājuma poligoniem. Lauki paliek no ievades. Objekts, kas izgriezts pilnībā, tiek izlaists (panelis tos saskaita). |
| Izšķīdināšana | Apvieno poligonus, kas saskaras vai pārklājas, visus vai vienu formu katrai lauka vērtībai. Pievieno `COUNT` un `AREA`. |

Lauka nosaukums, kas abiem slāņiem ir, tiek saglabāts pirmajam slānim, bet otrā slāņa lauks tiek rakstīts ar `_2`. Objektiem vienā slānī nevajadzētu pārklāties: ja pārklājas, Apvienošana pārklāšanos saskaita abos slāņos.

## Savienošana

Telpiskā savienošana kopē atribūtus no **avota** slāņa uz katru **mērķa** objektu, kas ar to saskaras, un iegūst jaunu slāni ar mērķa formām. Izvēlieties, kad tie saskaras: pieskaroties vai pārklājoties, mērķim atrodoties avota poligonā, mērķim ietverot avota objektu, tuvāko avota objektu (ar pēc izvēles ierobežojumu) vai jebkuru avota objektu noteiktā attālumā.

Ja atbilst vairāki avota objekti, tiek ņemti pirmā objekta atribūti (tuvākā objekta tuvākās un attāluma savienošanā; pievieno `DISTANCE`), vai arī tie tiek **saskaitīti un to skaitļu lauki summēti**: `COUNT` un katram skaitliskajam laukam `SUM_`, `MEAN_`, `MIN_`, `MAX_`. Noņemiet atzīmi no **Saglabāt mērķa objektus, kuriem nav atbilstības**, lai tos izlaistu. Pievienotie lauki ir tukši, kur nekas neatbilda, un panelis saskaita neatbilstošos.

## Atlase

Ierakstiet jautājumu par atribūtiem vai formu, nospiediet **Atlasīt**, un objekti tiek attēloti plānā kopā ar to skaitu, tabulu un kopējo laukumu, garumu vai skaitli. Pēc tam tos var padarīt par atsevišķu slāni, pietuvināt tiem vai notīrīt atlasi.

| Ko var rakstīt | Piemērs |
|---|---|
| Lauku pēc nosaukuma; izmantojiet "pēdiņas" vai [kvadrātiekavas], ja nosaukumā ir atstarpes | `VALUE`, `"Lot Number"` |
| Skaitļi, 'teksts', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teksts neņem vērā reģistru; `like` gadījumā `%` ir jebkura rakstzīmju virkne un `_` viens burts) | `Notes contains 'corner'` |
| `is null`, `is not null` (tukša vērtība skaitās kā null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` un iekavas | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Formu vērtības `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Jautājums, kas nav pilnīgs vai nosauc lauku, kura slānim nav, tiek noraidīts ar teikumu, kas norāda, kur tieši.

## Mērīšana

Parāda slāņa kopējo laukumu un perimetru, garumu vai skaitu un **pievieno laukus**: `AREA` un `PERIMETER` poligoniem, `LENGTH` līnijām (plāna garums), `X` un `Y` punktiem. Esošs lauks nekad netiek pārrakstīts: jaunais tiek saukts `AREA_2`. Tas ir viens atsaucams solis. **Statistika** dod skaitu, summu, vidējo, minimumu un maksimumu skaitliskam laukam, pēc izvēles katrai citas lauka vērtībai.

:::note
Šo rīku pārbaudes tiek veiktas ar roku testā (`node bin/test-civilcraft-gisanalysis.mjs`): piemēram, zemesgabali 100 by 100 zonā 100 by 80 krustojas 3,000 plus 3,000, un līnija 100 garumā, buferēta ar 10, ir 2,000 plus riņķis.
:::
