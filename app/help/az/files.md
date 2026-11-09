---
title: Aça, saxlaya və ixrac edə biləcəyiniz fayllar
summary: Nöqtə fayllarını, LandXML və CivilCraft layihələrini açın; layihələri, LandXML, DXF və PDF-i ixrac edin. Hər faylın nəyi saxladığı, fayllarin hara getdiyi və oflayn rejimdə nə dəyişdiyi.
keywords: aç, saxla, ixrac, idxal, fayl formatları, csv, txt, landxml, xml, dxf, pdf, json, endirmə, layihə faylı
from: a7debb61
---

CivilCraft kompüterinizdəki faylları açır və faylları kompüterinizə endirməklə saxlayır. Heç nə yüklənmir və heç nə serverdə saxlanmır. Həmçinin bax: [Fayllarınız](common:your-files).

## Nəyi açır

Klikləyin {{ui:Aç}} (və ya {{key:Mod+O}} basın) və fayl seçin, ya da faylı {{pick:mac=Finder|windows=File Explorer|linux=fayl menecerinizdən}} planın üzərinə sürüşdürün. Eyni vaxtda bir fayl; 200 MB-dan böyük fayllar qəbul edilmir.

| Növ | Fayl adları | Nə baş verir |
|---|---|---|
| Nöqtə faylı | `.csv`, `.txt`, `.pnt`, `.xyz` (istənilən mətn faylı) | **Nöqtələri idxal et** dialoqu açılır. Nöqtələr layihənin nöqtələrini əvəz edir; trassalar, platformalar və borular qalır. |
| LandXML | `.xml`, `.landxml` | Fayldan **yeni layihə** yaradılır (cari layihədə saxlanılmamış dəyişikliklər varsa, əvvəlcə soruşulur). |
| CivilCraft layihəsi | `.civilcraft.json` (istənilən `.json`) | Layihə saxlanıldığı kimi açılır (cari layihədə saxlanılmamış dəyişikliklər varsa, əvvəlcə soruşulur). |

CivilCraft qərarı əvvəlcə faylın sonluğuna, sonra isə ilk simvollarına görə verir: `{` ilə başlayan mətn layihə kimi, `<` ilə başlayan LandXML kimi, qalan hər şey nöqtə faylı kimi oxunur. Açma pəncərəsində boz görünən fayl da yenə planın üzərinə buraxıla bilər.

:::note
Nöqtələri olan layihəyə nöqtə faylı idxal etsəniz, onlar soruşmadan əvəz olunur və geri alma tarixçəsi təmizlənir (istənilən faylı açmaq geri alma üçün təmiz başlanğıcdır). Səth LandXML-dən gəlibsə, nöqtələri idxal etmək səthi nöqtələrdən qurulmuş səthə çevirir. Köhnə nöqtələri qaytarmaq ehtimalınız varsa, əvvəlcə saxlayın.
:::

Ətraflı: [Nöqtə faylı formatları](topic:point-file-formats), [LandXML: nə oxunur və yazılır](topic:landxml-reference).

## Nəyi saxlayır

{{ui:Saxla}} ({{key:Mod+S}}) yan-yana iki fayl yazır: sol paneldə **Ad**-a görə adlandırılmış `<name>.civilcraft.json` — redaktə etməyə davam etdiyiniz layihə, və `<name>.ifc` — eyni dizaynın IFC 4.3 formatında digər proqramlar üçün versiyası (bax: [IFC ixracı və idxalı](topic:ifc)). Hər fayl digərini qeyd edir. IFC-də layihənin sıxılmış nüsxəsi də var, ona görə tək göndərilən IFC də tam redaktə oluna bilən halda açılır.

- **Studio-da** hər iki fayl yanaşı, yerində yazılır.
- **Chrome və Edge-də** ilk saxlamada qovluq soruşulur və hər ikisi oraya yazılır; sonrakı saxlamalar eyni qovluğa gedir. Qovluq sualını ləğv etsəniz, hər ikisi endirilir.
- **Digər brauzerlərdə** hər iki fayl endirilir, əvvəl layihə faylı.

Hər hansı bir fayl açılanda digərini axtarır. Hər ikisini birlikdə açın (və ya birlikdə buraxın), ya da birini açın: Studio-da digəri eyni qovluqda tapılır; brauzerdə CivilCraft onu əlavə etməyi təklif edir, ya da yalnız var olanla davam etməyə icazə verir. Əgər IFC CivilCraft saxladıqdan sonra başqa proqram tərəfindən dəyişdirilibsə, ya da fayllardan biri digərindən köhnədirsə, layihə yeni dizayndan açılır və Problemlər paneli nə baş verdiyini göstərir, **İndi saxla** (hər iki faylı yenidən yazır) və **IFC-nin həndəsəsini istinad kimi göstər** seçimləri ilə. Başqa proqram tərəfindən dəyişdirilmiş tək IFC öz layihə nüsxəsindən, hələ uyğun gələn hissələrlə açılır: dəyişdirdiyi trassalar öz həndəsəsini alır, sildiyi obyektlər çıxarılır, qalan dəyişikliklər siyahılanır, lakin qəbul edilmir. 0.7.1-dən əvvəlki layihə faylı əvvəlki kimi açılır.

Layihə faylı saxlayır:

- hər nöqtəni (nömrə, koordinatlar, hündürlük, təsvir) və onların gəldiyi nöqtə faylının adını
- səthin parametrlərini: qrup seçimləri, çəkilmiş sınma xətləri, sərhəd, ən uzun xarici kənar və LandXML-dən oxunan TIN
- ekran parametrlərini
- PI-ləri, radiusları və başlanğıc stansiyası ilə trassaları, layihə profillərini (PVI-lər və əyri uzunluqları) və dəhliz parametrlərini
- platformaları və qaydaları ilə boru şəbəkəsini

Geri alma tarixçəsini saxlamır. Səthlər, horizontallar, günəş işığı xətləri və həcmlər saxlanmır; layihə açılanda saxlanmış girişlərdən yenidən qurulur. Yeni CivilCraft versiyasının layihə faylı, versiyasını göstərən mesajla rədd edilir.

## Nəyi ixrac edir

| Düymə | Fayl | Məzmun |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: nöqtələr, mövcud zəmin (və varsa layihələşdirilmiş səth) TIN səthləri kimi, trassalar, zəmin və layihə profilləri, boru şəbəkəsi |
| {{ui:DXF}} | `<name>.dxf` | Planın göstərilən xətləri, adlandırılmış qatlarda, R12 DXF |
| {{ui:DWG}} | `<name>.dwg` | Eyni xətlər DWG çertyoju kimi, seçdiyiniz formatda (2000-dən 2018-ə) |
| {{ui:PDF}} | `<name>.pdf` | Planın vərəqdə vektor çapı, seçdiyiniz miqyasda |
| {{ui:GLB}} və ya {{ui:OBJ}} (3D görünüşün panelində) | `<name>-3d.glb`, `<name>-3d.obj` | 3D görünüşün göstərdiyi 3D model: metrlərlə, Y yuxarıda, həqiqi miqyas, qeyd olunmuş yerli başlanğıc nöqtəsi ətrafında |

Hər birinin nəyi buraxdığı: [LandXML mübadiləsi](topic:landxml), [Planı DXF-ə ixrac edin](topic:dxf-export) (DWG də), [Planı PDF-ə çap edin](topic:plot-pdf), [Sahəni 3D-də ixrac edin](topic:export-3d).

## Fayllar harada olur

Saxlanmış və ixrac olunmuş fayllar brauzerinizin endirmələr üçün seçdiyi yerə gedir, adətən Endirilmələr qovluğuna. Hər dəfə qovluq seçmək üçün:

:::chromium
Brauzerin **Parametrləri**ni açın, sonra **Endirmələr**i, və **Hər faylı endirməzdən əvvəl harada saxlanılacağını soruşun** seçimini aktiv edin.
:::

:::firefox
**Parametrləri** açın, sonra **Ümumi**ni, və **Fayllar və tətbiqlər** altında **Faylları harada saxlayacağımı həmişə soruşun** seçin.
:::

:::safari
**Safari > Parametrlər > Ümumi** açın və **Fayl endirmə yeri** seçimini **Hər endirmə üçün soruşun** olaraq təyin edin.
:::

Eyni adla iki dəfə saxlasanız, brauzer ikinci fayla rəqəm əlavə edə bilər, məsələn `Site (1).civilcraft.json`. Növbəti dəfə ən yenisini açın.

## Onlayn və oflayn

CivilCraft hər halda yalnız kompüterinizdə işləyir: açmaq faylı brauzerdə oxuyur, saxlamaq isə onu endirir. CivilCraft-ı heç bir bağlantı olmadan açmaq üçün əvvəlcə oflayn istifadə üçün saxlayın:

1. Onlayn olarkən yuxarıdakı tətbiq panelində {{ui:Oflayn üçün saxla}} klikləyin.
2. Düymə sayır ("Saxlanılır: 12 / 30") və sonra {{ui:Oflayn hazırdır}} göstərir. CivilCraft kiçikdir (təxminən 0.6 MB), ona görə bu bir az vaxt aparır. Saxlanmış nüsxəyə bu kömək və nümunə sahə daxildir.
3. Bağlantı olmadan eyni ünvanı (və ya onun əlfəcini) açın. Hər şey işləyir, o cümlədən {{ui:Nümunə sahəni aç}}.

Düymənin digər halları:

- {{ui:Saxlamaq alınmadı}}: bəzi fayllar endirilmədi. Bağlantını yoxlayın və yenidən cəhd etmək üçün klikləyin.
- {{ui:Oflayn mövcud deyil}}: bu brauzer pəncərəsi oflayn nüsxə saxlaya bilmir (məxfi pəncərələr və bəzi idarə olunan kompüterlər bunu blok edir). Normal pəncərədən istifadə edin.

{{ui:Oflayn hazırdır}} klikləyin ki, nüsxənin nə vaxt saxlandığını görün, iki seçimlə: {{ui:Yenidən saxla (ən yeni versiyanı al)}} və {{ui:Oflayn nüsxəni sil}}. Sahə ziyarətindən əvvəl yenidən saxlayın ki, nüsxə ən son quruluşla uyğun olsun. Ətraflı: [Oflayn](common:offline).

:::offline
Hal-hazırda oflaynsınız. CivilCraft oflayn istifadə üçün saxlanıbsa, hər şey işləyir, o cümlədən nümunə sahə. Yoxdursa, bu sekmədə işləməyə davam edin, lakin bağlantı bərpa olunana qədər onu yenidən yükləməyin; saxlanmış nüsxə olmadan {{ui:Nümunə sahəni aç}} "Nümunə yüklənə bilmədi" xətası ilə uğursuz olur.
:::

:::tip
Səhra işi üçün CivilCraft-ı oflayn istifadə üçün saxlayın və nöqtə fayllarınızı birbaşa noutbukda saxlayın. Layihələr və ixrac faylları bağlantısız endirmə kimi saxlanılır, ona görə bir günün ölçmələrini idxal edə, səthi yoxlaya və layihəni sahədə saxlaya bilərsiniz.
:::

Buludda saxlama hələ mövcud deyil, masaüstü quruluşları da hələ çıxmayıb. Hal-hazırda saxladığınız fayllar yeganə nüsxədir: onları ehtiyat nüsxəsi götürülən yerdə saxlayın.

## Faylın istifadə etdiyi əlavələr

Layihəni əlavədən məlumat (Bina qaydaları qutuları və ya Ünvandan sahəyə mənbəyi) ilə saxladıqda, fayl hansı əlavələrin və hansı versiyaların olduğunu qeyd edir. Onu əlavə olmayan kompüterdə açsanız, plan üzərində panel bunu bildirir və hesabınızın siyahısından əlavə etməyi təklif edir. Qeyd yalnız qeyddir: fayl hər halda açılır.

## Studio-dan geri alma

CadCraft Studio daxilində CivilCraft-da bitirdiyiniz hər addım Studio-ya bildirilir, ona görə onun layihə səviyyəli geri alması son addımı tətbiqlər arasında geri ala bilər. Studio addımı yalnız CivilCraft-ın öz geri alma yığını həmin addımdan qalan vəziyyətdə olduqda geri alır; başqa fayl açdıqdan sonra bu pəncərəni ötür.

## Saxlanılmamış dəyişikliklərlə bağlamaq

Layihədə saxlanılmamış dəyişikliklər olduqda və sekmə bağladıqda, yenidən yüklədikdə və ya səhifədən çıxdıqda, brauzer çıxmaq istədiyinizi soruşur. Onun mətni və görünüşü brauzerə aiddir və CivilCraft tərəfindən dəyişdirilə bilməz. {{ui:Yeni}}, layihə və ya LandXML faylı açmaq isə CivilCraft-ın öz **Saxlanılmamış dəyişikliklər** qutusunda soruşur; bu qutuda {{ui:Ləğv et}}, {{ui:Saxlama}} və {{ui:Surətini saxla}} seçimləri var.
