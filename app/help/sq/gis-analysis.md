---
title: Analizo shtresat GIS
summary: Buffer, mbivendosje (kryqëzim, bashkim, fshirje, shkrirje), lidhje hapësinore, përzgjedhje sipas atributit dhe matja e shtresave GIS në një projekt, secila si shtresë e re që mund ta zhbësh.
keywords: gis, analizë, analiza, buffer, mbivendosje, kryqëzim, bashkim, fshirje, prerje, shkrirje, lidhje hapësinore, lidhje, përzgjidh sipas atributit, pyetje, ku, shprehje, statistika, sipërfaqe, gjatësi, perimetër, matje, parcela, servitut, kufi ndërtimi, shapefile, geopackage, tabela e atributeve
from: a6b2d3f9
---

Kur një projekt ka shtresa GIS (shih [Importo të dhënat GIS](topic:gis-import)), butoni **Analizo** në grupin GIS (shkruhet `GISANALYSIS`, `ANALYZE` ose `BUFFER`) hap një panel me pesë skeda. Ai mbetet i hapur pranë planimetrisë, kështu që ajo që përzgjidhni vizatohet në planimetri ndërsa punoni.

Çdo mjet që krijon diçka **shton një shtresë të re** dhe i lë shtresat që lexoi saktësisht ashtu si ishin. Secili është një hap zhbërjeje: {{ui:Zhbëj}} në panel (ose Ctrl+Z) e heq shtresën e re. Eksportoje rezultatin si çdo shtresë me [Eksporto të dhënat as-built për GIS](topic:gis-export) si shapefile, GeoJSON ose GeoPackage.

Tabela e plotë e një shtrese, me renditje, redaktim dhe një llogaritës fushash, është te [Punoni me tabelën e atributeve të një shtrese](topic:gis-table); ngjyrosja sipas një fushe është te [Stilo një shtresë sipas një atributi](topic:gis-symbology).

Gjithçka punohet në planimetri, në njësitë e projektit (këmbë ose metra). Një projekt është gjithmonë në një sistem të projektuar ose lokal, kështu që një distancë 50 do të thotë 50 këmbë ose 50 metra, kurrë gradë. Lartësitë (z) nuk ruhen në rezultate.

## Buffer

Vizaton një zonë me distancë të caktuar rreth çdo elementi, si shtresë e re poligonale. Pikat bëhen rrathë, vijat bëhen koridore me skaje të rrumbullakosura, poligonet zgjerohen. Një distancë **negative** zvogëlon poligonet (një katror 100 me 100 i zvogëluar me 5 bëhet 90 me 90; i zvogëluar me 60 nuk mbetet asgjë, dhe paneli e thotë këtë). Merrni distancën nga një fushë numrore për t'i dhënë çdo elementi distancën e vet, ose shënoni **Bashko të gjitha buffer-at në një formë** për t'i shkrirë.

Pjesët e rrumbullakosura janë copa të drejta të vizatuara brenda kurbës së vërtetë, kështu që një buffer është pak më i vogël se rrethi i saktë: rreth 0.6 % në sipërfaqe me cilësimin normal, 0.16 % me cilësimin E hollë. Përdorni E hollë për çdo gjë që do ta matni.

## Mbivendosje

| Mjeti | Çfarë merrni |
|---|---|
| Kryqëzim | Copat ku shtresa hyrëse takon poligonet e mbivendosjes, secila me fushat e të dyjave. Vijat dhe pikat priten sipas poligoneve. |
| Bashkim | Të dy shtresat poligonale prera sipas skajeve të njëra-tjetrës: copat e përbashkëta mbajnë fushat e të dyjave, pjesa tjetër mban fushat e një shtrese (fushat e tjetrës janë bosh). |
| Fshirje | Poligonet hyrëse me poligonet e mbivendosjes të hequra. Fushat mbeten te hyrja. Një element i fshirë plotësisht lihet jashtë (paneli i numëron). |
| Shkrirje | Bashkon poligonet që prekin ose mbivihen, të gjitha ose një formë për çdo vlerë të një fushe. Shton `COUNT` dhe `AREA`. |

Një emër fushe që e kanë të dyja shtresat mbahet për shtresën e parë, dhe ai i shtresës së dytë shkruhet me `_2`. Elementët brenda një shtrese nuk duhet të mbivihen me njëri-tjetrin: aty ku mbivihen, një Bashkim e numëron mbivendosjen në të dyja anët.

## Lidhje

Një lidhje hapësinore kopjon atributet nga një shtresë **burim** mbi çdo element **objektiv** që e takon, dhe jep një shtresë të re me format e objektivit. Zgjidhni kur takohen: duke prekur ose mbivendosur, objektivi të shtrihet brenda një poligoni burimi, objektivi të mbajë elementin burim, elementi më i afërt burim (me një kufi opsional), ose çdo element burim brenda një distance.

Kur përputhen disa elementë burim, merrni atributet e të parit (më të afërmit, për lidhjet më të afërta dhe ato sipas distancës; shtohet `DISTANCE`), ose **i numëroni dhe i mblidhni fushat e tyre numerike**: `COUNT`, dhe `SUM_`, `MEAN_`, `MIN_`, `MAX_` për çdo fushë numerike. Hiqni shenjën te **Mbaj elementët objektiv që nuk gjejnë përputhje** për t'i lënë jashtë. Fushat e lidhura janë bosh aty ku nuk u përputh asgjë, dhe paneli numëron ato që nuk u përputhën.

## Përzgjidh

Shkruani një pyetje për atributet ose formën, shtypni **Përzgjidh**, dhe elementët vizatohen në planimetri me numrin e tyre, një tabelë dhe sipërfaqen, gjatësinë ose numrin total. Pastaj bëni prej tyre një shtresë të veçantë, zmadhoni te ta ose pastroni përzgjedhjen.

| Mund të shkruani | Shembull |
|---|---|
| Një fushë me emër; përdor "thonjëza" ose [kllapa katrore] nëse emri ka hapësira | `VALUE`, `"Lot Number"` |
| Numra, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teksti nuk dallon shkronjat; në `like`, `%` është çdo varg dhe `_` një shkronjë) | `Notes contains 'corner'` |
| `is null`, `is not null` (një vlerë boshe numërohet si null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` dhe kllapa | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vlera të formës `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Një pyetje e paplotë ose që emëron një fushë që shtresa nuk e ka refuzohet me një fjali që thotë ku.

## Matje

Shfaq sipërfaqen dhe perimetrin, gjatësinë ose numrin total të shtresës, dhe **shton fusha** në të: `AREA` dhe `PERIMETER` për poligonet, `LENGTH` për vijat (gjatësia në planimetri), `X` dhe `Y` për pikat. Një fushë që ekziston tashmë nuk shkruhet kurrë mbi: e reja quhet `AREA_2`. Ky është një hap zhbërjeje. **Statistika** jep numrin, shumën, mesataren, minimumin dhe maksimumin e një fushe numerike, opsionalisht për çdo vlerë të një fushe tjetër.

:::note
Kontrollet pas këtyre mjeteve bëhen me dorë në test (`node bin/test-civilcraft-gisanalysis.mjs`): për shembull parcela 100 me 100 nën një zonë 100 me 80 kryqëzohen në 3,000 plus 3,000, dhe një vijë 100 e gjatë e zgjeruar me buffer 10 është 2,000 plus një rreth.
:::
