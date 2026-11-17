---
title: Aça, saxlaya və ixrac edə biləcəyiniz fayllar
summary: Kompüterdən nöqtə fayllarını, LandXML və CivilCraft layihələrini idxal edin; layihələri, LandXML-i, DXF və PDF-i ixrac edin; hər birinin nəyi saxladığını, fayllərin haraya getdiyini və oflayn rejimdə nələrin dəyişdiyini öyrənin.
keywords: aç, saxla, ixrac, idxal, fayl formatları, csv, txt, landxml, xml, dxf, pdf, json, yüklə, layihə faylı
from: 82bff559
---

CivilCraft faylları kompüterinizdən açır və faylları yükləməklə kompüterinizə geri saxlayır. Heç nə yüklənmir və serverdə heç nə saxlanılmır. Həmçinin bax: [Sizin fayllarınız](common:your-files).

## Nəyi açır

{{ui:Open}} düyməsinə klikləyin (və ya {{key:Mod+O}} basın) və fayl seçin, ya da faylı {{pick:mac=Finder|windows=File Explorer|linux=fayl meneceriniz}}dən plana sürükləyin. Eyni anda bir fayl; 200 MB-dan böyük fayllar qəbul edilmir. 32 MB-dan böyük LandXML və ya layihə faylı mətnin bir bloku kimi deyil, təxminən 4 MB-lıq hissələrlə oxunur; LandXML açılarkən yaddaşda faylın ölçüsünün təxminən 13 mislindən istifadə olunacağını nəzərə alın (bizim sınaqda 69 MB-lıq fayl təxminən 0,9 GB istifadə etdi).

| Növ | Fayl adları | Nə baş verir |
|---|---|---|
| Nöqtə faylı | `.csv`, `.txt`, `.pnt`, `.xyz` (istənilən mətn faylı) | **Nöqtələri idxal et** dialoqu açılır. Nöqtələr layihənin nöqtələrini əvəz edir; trassalar, altlıqlar və borular qalır. |
| LandXML | `.xml`, `.landxml` | Fayldan **yeni layihə** yaradılır (cari layihədə saxlanmamış dəyişikliklər varsa, əvvəlcə soruşulur). |
| CivilCraft layihəsi | `.civilcraft.json` (istənilən `.json`) | Layihə saxlanıldığı kimi açılır (cari layihədə saxlanmamış dəyişikliklər varsa, əvvəlcə soruşulur). |

CivilCraft qərarı faylın sonluğuna, sonra isə ilk simvollarına görə verir: `{` ilə başlayan mətn layihə kimi, `<` ilə başlayan mətn LandXML kimi, qalanları isə nöqtə faylı kimi oxunur. Açma qutusunda boz görünən fayl yenə də plana atıla bilər.

:::note
Nöqtələri olan layihəyə nöqtə faylı idxal etsəniz, onlar soruşmadan əvəz olunur və geri alma tarixçəsi silinir (istənilən faylın açılması geri alma üçün təzə başlanğıcdır). Səth LandXML-dən gəlibsə, nöqtələrin idxalı onu nöqtələrdən qurulmuş səthə qaytarır. Köhnə nöqtələri geri almaq istəyə bilərsiniz ehtimalı varsa, əvvəlcə saxlayın.
:::

Ətraflı: [Nöqtə faylı formatları](topic:point-file-formats), [LandXML: nə oxunur və yazılır](topic:landxml-reference).

## Nəyi saxlayır

{{ui:Save}} ({{key:Mod+S}}) sol paneldə **Ad** üzrə adlandırılmış iki faylı yan-yana yazır: `<ad>.civilcraft.json`, redaktə etməyə davam etdiyiniz layihə, və `<ad>.ifc`, eyni dizaynın digər istifadəçilər üçün IFC 4.3 variantı (bax: [IFC ixracı və idxalı](topic:ifc)). Hər fayl digərini qeyd edir, IFC isə layihənin sıxılmış nüsxəsini də daşıyır, buna görə tək göndərilən IFC də tam redaktə oluna bilən şəkildə yenidən açılır.

- **Studio-da** hər iki fayl yanaşı, yerində yazılır.
- **Chrome və Edge-də** ilk saxlamada qovluq soruşulur və hər ikisi oraya yazılır; sonrakı saxlamalar eyni qovluğa gedir. Qovluq sualını ləğv etsəniz, hər ikisi yüklənir.
- **Digər brauzerlərdə** hər iki fayl yüklənir, əvvəlcə layihə faylı.

Hər hansı bir fayl açanda digərini axtarılır. Hər ikisini birlikdə açın (və ya hər ikisini atın) ya da birini açın: Studio-da digəri eyni qovluqda tapılır; brauzerdə CivilCraft onu əlavə etməyinizi və ya yalnız sahib olduğunuz faylla davam etməyinizi soruşur. CivilCraft saxladıqdan sonra IFC başqa proqram tərəfindən dəyişdirilibsə və ya fayllardan biri digərindən köhnədirsə, layihə daha yeni dizayndan açılır və Problemlər paneli nə baş verdiyini bildirir, **İndi saxla** (hər iki faylı yenidən yazır) və **IFC-nin həndəsəsini istinad kimi göstər** seçimləri ilə. Başqa proqram tərəfindən dəyişdirilmiş tək IFC öz layihə nüsxəsindən, uyğun qalan məzmunla açılır: dəyişdirdiyi trassalar öz həndəsəsini alır, sildiyi obyektlər çıxarılır, qalan dəyişikliklər siyahılanır, lakin tətbiq olunmur. 0.7.1-dən əvvəlki layihə faylı əvvəlki kimi açılır.

Layihə faylında saxlanılır:

- hər nöqtə (nömrə, koordinatlar, yüksəklik, təsvir) və onların gəldiyi nöqtə faylının adı
- səth parametrləri: qrup seçimləri, çəkilmiş sərhəd xətləri, sərhəd, ən uzun xarici kənar və LandXML-dən oxunan TIN
- ekran parametrləri
- trassalar PI-ləri, radiusları və başlanğıc stansiyası ilə, onların layihə profilləri (PVI-lər və əyri uzunluqları) və dəhliz parametrləri ilə
- altlıqlar və qaydaları ilə boru şəbəkəsi

Geri alma tarixçəsi saxlanılmır. Səthlər, konturlar, gündüz xətləri və həcmlər saxlanılmır; layihə açılanda saxlanılmış girişlərdən yenidən qurulur. Daha yeni CivilCraft-dan olan layihə faylı, versiyasını göstərən mesajla rədd edilir.

## Nəyi ixrac edir

| Düymə | Fayl | Məzmun |
|---|---|---|
| {{ui:LandXML}} | `<ad>.xml` | LandXML 1.2: nöqtələr, mövcud relyef (və varsa, hamarlanmış səth) TIN səthləri kimi, trassalar, relyef və layihə profilləri, boru şəbəkəsi |
| {{ui:DXF}} | `<ad>.dxf` | Planın xətt işinin R12 DXF-i, göstərildiyi kimi, adlandırılmış qatlarda |
| {{ui:DWG}} | `<ad>.dwg` | Eyni xətt işi DWG çertyojunda, sizin seçdiyiniz formatda (2000-dən 2018-ə qədər) |
| {{ui:PDF}} | `<ad>.pdf` | Planın vektor çapı vərəqdə, seçdiyiniz miqyasda |
| {{ui:GLB}} və ya {{ui:OBJ}} (3D görünüşün panelində) | `<ad>-3d.glb`, `<ad>-3d.obj` | 3D görünüşün göstərdiyi 3D model: metrlərdə, Y yuxarı, həqiqi miqyasda, qeyd olunmuş yerli başlanğıc nöqtəsi ətrafında |

Hər birinin nəyi buraxdığı: [LandXML mübadiləsi](topic:landxml), [Planı DXF-ə ixrac et](topic:dxf-export) (DWG də), [Planı PDF-ə çap et](topic:plot-pdf), [Sahəni 3D-də ixrac et](topic:export-3d).

## Fayllar haraya gedir

Saxlanılmış və ixrac olunmuş fayllar brauzerinizin yükləmələri yerləşdirdiyi yerə gedir, adətən Yüklənmələr qovluğuna. Hər dəfə qovluq seçmək üçün:

:::chromium
Brauzerin **Parametrlər** bölməsini açın, sonra **Yükləmələr** və **Hər yükləmədən əvvəl faylın harada saxlanacağını soruş** seçimini aktiv edin.
:::

:::firefox
**Parametrlər** bölməsini açın, sonra **Ümumi** və **Fayllar və tətbiqlər** altında **Fayllar üçün həmişə harada saxlanacağını soruş** seçin.
:::

:::safari
**Safari > Parametrlər > Ümumi** bölməsini açın və **Fayl yükləmə yeri** seçimini **Hər yükləmə üçün soruş** olaraq təyin edin.
:::

Eyni adla iki dəfə saxlasanız, brauzer ikinci fayla nömrə əlavə edə bilər, məsələn `Sahə (1).civilcraft.json`. Növbəti dəfə ən yenisini açın.

## Onlayn və oflayn

CivilCraft hər halda yalnız kompüterinizdə işləyir: açmaq faylı brauzerdə oxuyur, saxlamaq isə onu yükləyir. CivilCraft-ı heç bir bağlantı olmadan açmaq üçün, əvvəlcə oflayn istifadə üçün saxlayın:

1. Onlayn olarkən yuxarıdakı proqram panelində {{ui:Oflayn üçün saxla}} düyməsinə klikləyin.
2. Düymə sayır ("12 / 30 saxlanılır") və sonra {{ui:Oflayn hazırdır}} göstərir. CivilCraft kiçikdir (təxminən 0,6 MB), buna görə bir az vaxt aparır. Saxlanılmış nüsxəyə bu yardım və nümunə sahə daxildir.
3. Bağlantı olmadan eyni ünvanı (və ya onun əlfəcinini) açın. Hər şey işləyir, o cümlədən {{ui:Nümunə saytı aç}}.

Düymənin digər vəziyyətləri:

- {{ui:Saxlamaq alınmadı}}: bəzi fayllar yüklənmədi. Bağlantını yoxlayın və yenidən cəhd etmək üçün klikləyin.
- {{ui:Oflayn mövcud deyil}}: bu brauzer pəncərəsi oflayn nüsxə saxlaya bilmir (şəxsi pəncərələr və bəzi idarə olunan kompüterlər bunu bloklayır). Normal pəncərədən istifadə edin.

Nüsxənin nə vaxt saxlanıldığını görmək üçün {{ui:Oflayn hazırdır}} düyməsinə klikləyin; iki seçim var: {{ui:Yenidən saxla (ən yeni versiyanı al)}} və {{ui:Oflayn nüsxəni sil}}. Nüsxə ən son quruluşa uyğun olsun deyə, sahə ziyarətindən əvvəl yenidən saxlayın. Ətraflı: [Oflayn](common:offline).

:::offline
İndi oflayn rejimdəsiniz. Əgər CivilCraft oflayn istifadə üçün saxlanılıbsa, hər şey işləyir, o cümlədən nümunə sahə. Əks halda, bu səhifədə işləməyə davam edə bilərsiniz, lakin bağlantı bərpa olunana qədər yenidən yükləməyin; saxlanılmış nüsxə olmadan {{ui:Nümunə saytı aç}} "Nümunə yüklənə bilmədi" xətası ilə uğursuz olur.
:::

:::tip
Səhra işi üçün CivilCraft-ı oflayn istifadə üçün saxlayın və nöqtə fayllarınızı məhz laptopa gətirin. Layihələr və ixraclar bağlantı olmadan yükləmə kimi saxlanılır, beləliklə gündəki ölçüləri idxal edə, səthi yoxlaya və layihəni sahədə saxlaya bilərsiniz.
:::

Bulud saxlanması hələ mövcud deyil və masaüstü versiyalar hələ çıxmayıb. Hal-hazırda saxladığınız fayllar yeganə nüsxədir: onları ehtiyat nüsxəsi götürülən yerdə saxlayın.

## Fayllar hansı əlavələrdən istifadə edir

Əlavədən gələn məlumatları olan layihəni saxlayanda (Binaların tənzimləmələri qutuları və ya Ünvandan sahəyə mənbə), fayl hansı əlavələrin və hansı versiyaların olduğunu qeyd edir. Onu əlavəsi olmayan kompüterdə açanda planın üstündə bir panel bunu bildirir və onu hesabınızın siyahısından əlavə etməyi təklif edir. Qeyd yalnız məlumat xarakterlidir: fayl hər halda açılır.

## Studio-dan geri alma

CadCraft Studio daxilində, CivilCraft-da bitirdiyiniz hər addım Studio-ya bildirilir, beləliklə onun layihə səviyyəli geri alması son addımı tətbiqlər arasında geri ala bilər. Studio yalnız CivilCraft-ın öz geri alma yığını həmin addımın qoyduğu vəziyyətdə olduqda addımı geri alır; başqa fayl açdıqdan sonra bu pəncərəni ötür.

## Saxlanmamış dəyişikliklərlə bağlamaq

Layihədə saxlanmamış dəyişikliklər varkən sekmə bağlandıqda, yenidən yükləndikdə və ya səhifədən çıxdıqda, brauzer çıxmaq istədiyinizi soruşur. Bu mətn və görünüş brauzerə aiddir və CivilCraft tərəfindən dəyişdirilə bilməz. {{ui:Yeni}}, eləcə də layihə və ya LandXML faylının açılması isə CivilCraft-ın öz **Saxlanmamış dəyişikliklər** qutusunu soruşur, bu qutuda {{ui:Ləğv et}}, {{ui:Saxlama}} və {{ui:Surətini saxla}} seçimləri var.
