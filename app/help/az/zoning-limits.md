---
title: Kütlələri daxil etdiyiniz zoninq limitləri ilə yoxlayın
summary: Torpaq sahəsinin geri çəkilmələrini sətir-sətir, hündürlük limitini, səma açıqlığı müstəvisini, mərtəbə sahəsi nisbətini və örtülməni daxil edin, planda tikilə bilən zərfə baxın və hansı kütlənin hansı limiti pozduğunu oxuyun.
keywords: zoninq, geri çəkilmə, geri çəkilmələr, ön, yan, arxa, zərf, tikilə bilən sahə, hündürlük limiti, səma açıqlığı müstəvisi, mərtəbə sahəsi nisbəti, MSN, örtülmə, sahə, parsel, normativ, əsasnamə, məcəllə yoxlanışı
from: 3e267b31
---

**CivilCraft-ın içində heç bir zoninq məcəlləsi yoxdur.** O, heç bir şəhərin qaydalarını bilmir və onların kitabxanasını təqdim etmir. Bu səhifədəki hər rəqəm sizin daxil etdiyiniz, öz normativinizdən götürdüyünüz rəqəmdir və hər nəticə daxil etdiyiniz limitlərə görə ölçüldüyünü deyir. Bu, sahənin limitlərinin binanı necə formalaşdırdığını görmək üçün bir yoldur, dizaynın icazə verilib-verilmədiyinə dair qərar deyil.

## Limitləri daxil edin

**Xüsusiyyətlər** panelində, **Tikinti kütlələri** altında bir **Parsel** seçin (və ya kütlə seçin: onun parselinin limitləri altında göstərilir). Sonra tətbiq olunanları doldurun; "limit yoxdur" üçün qutunu boş buraxın:

- **Küçə xətti**: küçədəki torpaq xətti. **Ön geri çəkilmə** ona tətbiq olunur, **Arxa geri çəkilmə** ona ən əks olan xəttə, **Yan geri çəkilmə** qalanlara.
- **Hündürlük limiti**.
- **Səma müstəvisi**: torpaq xəttində bir hündürlükdən başlayır və içəriyə doğru hər 1 məsafə üçün yazdığınız qədər qalxır, küçə xəttindən və ya hər torpaq xəttindən ölçülür (2 yazsanız 2-yə 1 deməkdir). Nöqtənin üzərində icazə verilən hündürlük müstəvi ilə hündürlük limitinin ən aşağısıdır.
- **Mərtəbə sahəsi nisbəti** (parseldəki kütlələrin ümumi mərtəbə sahəsi bölünmüş parselin sahəsinə) və **Örtülmə** (onların əsasları bölünmüş parselin sahəsinə, faizlə yazılır).

## Zərf

Planda çəkmək üçün **Zərfi planda göstər** seçin; o, `A-MASS-ENVL` qatında çəkilir. Zərf hər torpaq xəttindən həmin xəttin öz geri çəkilməsi qədər içəri alınmış torpaqdır, ofset xətləri kəsişən künclərdə birləşir. Əyri ilə təşkil olunmuş torpaq xətti 0,01 dəqiqliklə qısa vətərlərlə alınır. Qabarıq və içəri çəkilmiş torpaqların hər ikisi işləyir. Geri çəkilmələr özlərini qatlayırsa (dar və ya çox içəri çəkilmiş torpaqda dərin geri çəkilmə), zərf yoxdur və Xüsusiyyətlər bunu deyir; daha kiçik məsafələr sınayın.

## Nəticə

Qutuların altında hər kütlə və hər limit üçün bir sətir alınır, işarə və ya xaçla:

- **geri çəkilmələr**: kütlənin zərfin xaricində qalan sahəsi;
- **hündürlük**: kütlənin hündürlüyü əsasının üzərində icazə verilən ən çox hündürlüyə qarşı (bir hündürlüklü prizma künclərinin hər birində icazə verilən ən aşağı hündürlüklə məhdudlaşır);
- **mərtəbə sahəsi nisbəti** və **örtülmə**: parseldəki bütün kütlələr toplanmış halda.
