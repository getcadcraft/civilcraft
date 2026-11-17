---
title: GIS qatlarını təhlil et
summary: Bufer, üst-üstə düşmə (kəsişmə, birləşmə, silmə, birləşdirmə), məkan birləşdirməsi, atributa görə seçmə və layihədəki GIS qatlarını ölçmə; hər nəticə geri qaytarıla bilən yeni qat kimi yaranır.
keywords: gis, təhlil, bufer, üst-üstə düşmə, kəsişmə, birləşmə, silmə, kəsmə, birləşdirmə, məkan birləşdirməsi, birləşdir, atributa görə seç, sorğu, şərt, ifadə, statistika, sahə, uzunluq, perimetr, ölçmə, parsellər, servitut, geri çəkilmə, shapefile, geopackage, atribut cədvəli
from: a6b2d3f9
---

Layihədə GIS qatları olduqdan sonra (bax: [GIS məlumatlarını idxal et](topic:gis-import)), GIS qrupundakı **Təhlil** düyməsi (yazılır: `GISANALYSIS`, `ANALYZE` və ya `BUFFER`) beş sekmeli panel açır. Panel plan yanında açıq qalır, buna görə işlədiyiniz zaman seçdiyiniz şey planda çəkilir.

Nəticə yaradan hər alət **yeni qat əlavə edir** və oxuduğu qatları olduğu kimi qoyur. Hər biri bir geri qaytarma addımıdır: paneldə {{ui:Undo}} (və ya Ctrl+Z) yeni qatı silir. Nəticəni hər hansı digər qat kimi [GIS üçün as-built məlumatlarını ixrac et](topic:gis-export) bölməsindəki kimi shapefile, GeoJSON və ya GeoPackage formatında ixrac edin.

Qatın tam cədvəli, çeşidləmə, redaktə və sütun kalkulyatoru ilə, [Qatın atribut cədvəli ilə iş](topic:gis-table) bölməsindədir; sütuna görə rənglənmə isə [Qatı atributa görə üslublaşdır](topic:gis-symbology) bölməsindədir.

Hər şey planda, layihənin vahidlərində (fut və ya metr) işlənir. Layihə həmişə proyeksiya və ya lokal sistemdədir, buna görə 50 məsafəsi 50 fut və ya 50 metr deməkdir, heç vaxt dərəcə deyil. Nəticələrdə hündürlüklər (z) saxlanılmır.

## Bufer

Hər obyektin ətrafında verilmiş məsafədə zona çəkir və bunu yeni poliqon qatı kimi verir. Nöqtələr dairəyə, xətlər ucları yuvarlaq dəhlizlərə, poliqonlar böyüyür. **Mənfi** məsafə poliqonları kiçildir (5 ilə kiçildilmiş 100 × 100 kvadrat 90 × 90 olur; 60 ilə kiçildilmişdə heç nə qalmır və panel bunu bildirir). Məsafəni rəqəm sütunundan götürərək hər obyekt üçün fərqli edə bilərsiniz, və ya bütün buferləri bir fiqura birləşdirmək üçün **Bütün buferləri bir fiqura birləşdir** qutusunu işarələyin.

Yuvarlaq hissələr həqiqi əyrinin içərisindən çəkilmiş düz parçalardır, buna görə bufer dəqiq dairədən bir az kiçikdir: normal parametrdə sahədə təxminən 0.6 %, İncə parametrdə 0.16 %. Ölçəcəyiniz hər şey üçün İncə istifadə edin.

## Üst-üstə düşmə

| Alət | Nə alırsınız |
|---|---|
| Kəsişmə (Intersect) | Giriş qatının üst poliqonlara çatdığı hissələr, hər birində hər iki qatın sütunları. Xətlər və nöqtələr poliqonlara görə kəsilir. |
| Birləşmə (Union) | İki poliqon qatı bir-birinin kənarları boyunca kəsilir: ortaq hissələr hər iki qatın sütunlarını daşıyır, qalanlar yalnız bir qatın (digərinin sütunları boşdur). |
| Silmə (Erase) | Giriş poliqonları, üst poliqonlar çıxarılmış halda. Sütunlar girişdə qalır. Tamamilə silinmiş obyekt çıxarılır (panel onları sayır). |
| Birləşdirmə (Dissolve) | Bir-birinə toxunan və ya üst-üstə düşən poliqonları birləşdirir: hamısını və ya sütunun hər dəyəri üçün bir fiqur. `COUNT` və `AREA` əlavə edir. |

Hər iki qatda olan sütun adı birinci qat üçün saxlanılır, ikinci qatın sütunu `_2` ilə yazılır. Eyni qatın obyektləri bir-biri ilə üst-üstə düşməməlidir: düşdükdə Birləşmə üst-üstə düşməni hər iki tərəfdə sayır.

## Məkan birləşdirməsi

Məkan birləşdirməsi **mənbə** qatından atributları ona toxunan hər **hədəf** obyektinə köçürür və hədəfin fiqurları ilə yeni qat verir. Nə zaman görüşdüklərini seçin: toxunma və ya üst-üstə düşmə, hədəfin mənbə poliqonunun içində olması, hədəfin mənbə obyektini əhatə etməsi, ən yaxın mənbə obyekti (istəyə görə limitlə) və ya verilmiş məsafədə olan istənilən mənbə obyekti.

Bir neçə mənbə obyekti uyğun gəldikdə birinci obyektin atributlarını götürürsünüz (ən yaxın birləşmələr üçün ən yaxın; `DISTANCE` əlavə olunur) və ya **onları sayır və rəqəm sütunlarının cəmini alırsınız**: `COUNT`, və hər rəqəm sütunu üçün `SUM_`, `MEAN_`, `MIN_`, `MAX_`. **Uyğunluq tapmayan hədəf obyektlərini saxla** qutusunun işarəsini çıxarsanız, onlar çıxarılır. Uyğunluq olmayan yerlərdə birləşdirilmiş sütunlar boş qalır və panel uyğunlaşmayanları sayır.

## Seç

Atributlar və ya fiqur haqqında sual yazın, **Seç** düyməsinə basın və obyektlər planda, sayı, cədvəli və ümumi sahə, uzunluq və ya rəqəmi ilə göstərilir. Sonra onları ayrıca qat edə, onlara yaxınlaşdıra və ya seçimi təmizləyə bilərsiniz.

| Yaza bilərsiniz | Nümunə |
|---|---|
| Sütunun adı; ad boşluq daxil edirsə "dırnaq" və ya [mötərizə] istifadə edin | `VALUE`, `"Lot Number"` |
| Rəqəmlər, 'mətn', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (mətn böyük-kiçik hərfi nəzərə almır; `like`-da `%` istənilən simvol ardıcıllığı, `_` isə bir hərfdir) | `Notes contains 'corner'` |
| `is null`, `is not null` (boş dəyər null sayılır) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` və mötərizələr | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Fiqur dəyərləri `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Natamam olan və ya qatda olmayan sütunu göstərən sual, harada səhv olduğunu bildirən cümlə ilə rədd edilir.

## Ölçmə

Qatın ümumi sahəsini və perimetrini, uzunluğunu və ya sayını göstərir və ona **sütunlar əlavə edir**: poliqonlar üçün `AREA` və `PERIMETER`, xətlər üçün `LENGTH` (plan uzunluğu), nöqtələr üçün `X` və `Y`. Mövcud sütun heç vaxt üzərinə yazılmır: yeni sütun `AREA_2` adlanır. Bu bir geri qaytarma addımıdır. **Statistika** rəqəm sütununun sayını, cəmini, ortasını, minimumunu və maksimumunu verir, istəyə görə başqa sütunun hər dəyəri üçün.

:::note
Bu alətlərin arxasındakı yoxlamalar testdə əl ilə işlənir (`node bin/test-civilcraft-gisanalysis.mjs`): məsələn, 100 × 100 parsellər 100 × 80 zonası altında 3,000 artı 3,000 kəsişir, və 10 ilə bufer edilmiş 100 uzunluqlu xətt 2,000 artı bir dairədir.
:::
