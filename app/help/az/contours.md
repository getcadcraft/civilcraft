---
title: Horizontalları, yüksəklikləri və meylləri oxuyun
summary: Horizontal intervalını və əsas horizontalları təyin edin, yüksəklik zolaqlarını, meyl oxlarını və üçbucaqları göstərin və göstəricinin altındakı zəmin yüksəkliklərini oxuyun.
keywords: horizontallar, horizontal intervalı, əsas horizontallar, yazılar, yüksəklik zolaqları, meyl oxları, üçbucaqlar, nöqtə yüksəkliyi, səth analizi, yüksəklik analizi, meyl analizi
from: 585e500a
---

Səth mövcud olan kimi horizontallarla göstərilir. Bu mövzudakı hər şey sol paneldə **Göstərmə** altında təyin olunur. Göstərmə parametrləri yalnız gördüklərinizi (və ixrac etdiklərinizi) dəyişir; onlar geri qaytarma addımı deyil.

## Horizontal intervalını təyin edin

1. **Göstərmə** altında **Horizontal hər** sahəsində bir qiymət seçin.
   - Futla: 0.25, 0.5, 1, 2, 5, 10 və ya 20 ft.
   - Metrlə: 0.1, 0.25, 0.5, 1, 2, 5 və ya 10 m.
2. **Əsas horizontal hər** sahəsində seçin: 2-ci, 4-cü, 5-ci və ya 10-cu horizontal.
   Əsas horizontallar daha qalın çəkilir və yüksəkliyi ilə yazılır. Onlar əsas intervalın tam mərtəbələrinə düşür (1 ft horizontallar və hər 5-ci əsas horizontal ilə: 245, 250, 255 …).
3. Yazılar kiçik sahəni sıxışdırırsa, {{ui:Contour labels}} seçimini söndürün.

Yeni layihə 1 vahiddən başlayır və hər 5-ci horizontal əsas olur. Horizontallar sınma xətlərində əyilir; əgər onlar axın xəttini və ya silsiləni düz kəsirsə, həmin xətt hələ sınma xətti deyil (bax: [Səthi qurun və dəqiqləşdirin](topic:build-surface)).

:::note
Horizontallar yalnız ən alçaq və ən yüksək nöqtə arasında ən çox 2000 səviyyə olduqda çəkilir. Çox relyefli və çox kiçik intervallı sahədə plan heç bir horizontal göstərmir: daha böyük interval seçin.
:::

## Horizontalları hamarlayın

Horizontallar hər üçbucaq üzrə bir düz parça kimi çəkilir, buna görə də hər üçbucaq kənarında kiçik bucaq əmələ gəlir. **Göstərmə** altında **Horizontal hamarlaşdırılması** bu bucaqları yumşaldır:

- **Yox (düz parçalar)**: izlənmiş xətlər olduğu kimi. Yeni və ya köhnə çertyoj belə göstərir.
- **Yüngül**: bucaqlar bir az yumşaldılır. Xətt heç vaxt növbəti horizontala doğru yolun 10%-indən çox hərəkət etmir və düz parçasından o parçanın uzunluğunun altıda birindən çox uzaqlaşmır.
- **Güclü**: axan əyri. Xətt heç vaxt növbəti horizontala doğru yolun 25%-indən çox hərəkət etmir və düz parçasından o parçanın uzunluğunun üçdə birindən çox uzaqlaşmır.

Hər iki seçimlə hamarlanmış horizontal da izlənmiş horizontal kimi hər üçbucaq kənarını eyni nöqtədə kəsir, hər parçanın kəsdiyi üçbucağın daxilində qalır və buna görə heç vaxt başqa horizontalı kəsə və ya ona toxuna bilməz. Horizontal sınma xəttini və ya sərhədi kəsdikdə öz kəskin bucağını saxlayır. Hamarlanmış xətlər çəkilir və ixrac olunur (DXF, DWG, PDF, GIS və 3D), izlənmiş xətlərdən daha çox təpə nöqtəsi ilə.

Hamarlama yalnız çəkilən xətləri dəyişir. Yüksəkliklər, həcmlər, profillər və kəsiklər hələ də səthin özündən oxunur. Sorğu nöqtələrindən dəqiq keçən horizontal (250 horizontalında 250.00 nöqtəsi) hər belə nöqtədə kiçik bucaq saxlayır.

## Horizontalların arxasındakı səth necə yaradılır

Horizontallar səthi izləyir, səth isə sol paneldə **Səth** altındakı **Horizontal hesablama üsulu** ilə qurulur. Standart **Xətti interpolyasiya ilə üçbucaqlama** nöqtələrinizi üçbucaqlara birləşdirir və hər nöqtəni və sınma xəttini dəqiq saxlayır. Digər üsullar əvvəlcə nöqtələrə şəbəkə tətbiq edir (kriqinq, minimum əyrilik, təbii qonşu, tərs məsafə və digərləri). Bu, nöqtələr arasında daha yumru horizontallar verir, lakin hər nöqtədən dəqiq keçmir. **Səth** altındakı səth hesabatı nəticənin nöqtələrinizdə nə qədər kənarda olduğunu göstərir.

**ABOS (hamarlamaya əsaslanan yaxınlaşma)** şəbəkəli üsullardan biridir. Onun öz iki parametri var: **Hamarlıq** (başlanğıc 0.5; kiçik olduqca hamar) və **Dəqiqlik** (başlanğıc 1: səth nöqtələrinizdə sahənin hündürlük diapazonunun 1%-i daxilinə gətirilir; daha yaxın uyğunluq üçün kiçik ədəd yazın). Əgər mövcud şəbəkədə dəqiqliyə çatmaq mümkün deyilsə, səth hesabatı bunu deyir: daha kiçik **Şəbəkə addımı** yazın.

## İstənilən yerdə yüksəklik oxuyun

Göstəricini planın üzərinə aparın. Status paneli göstərir:

- Göstəricinin altında **E** və **N**
- **Zəmin** və orada mövcud zəmin yüksəkliyi, göstəricinin altındakı üçbucaqda interpolyasiya olunmuş
- **Planlaşdırılmış** və təklif olunan yüksəklik, platforma və ya korridor zəminini dəyişdirdiyi yerdə
- Səthdən kənarda isə "Səthdən kənarda"

Sorğu nöqtəsini dəqiq oxumaq üçün {{ui:Select}} seçin və nöqtəyə klikləyin: sağ paneldə onun nömrəsi, şərqi, şimalı, yüksəkliyi, təsviri və qrupu göstərilir.

## Hündürlük zolaqlarını göstərin

1. {{ui:Elevation bands}} qutusunu işarələyin.
   Səth aşağıdan (mavi-yaşıl) yuxarıya (xardal-qəhvəyi) rənglə doldurulur. Qutucuqların altındakı legenda hər zolağın hündürlük diapazonunu sadalayır.
2. **Zolaqlar** sahəsində neçə zolaq olduğunu seçin: 5, 8, 10 və ya 12. Zolaqlar ən aşağı yüksəklikdən ən yuxarıya qədər diapazonu bərabər addımlara bölür.

Zolaqlar yalnız baxış üçündür. Onlar DXF-ə ixrac olunmur və PDF-ə çəkilmir.

## Meyl oxlarını göstərin

{{ui:Slope arrows}} qutusunu işarələyin. Bir oxu tutacaq qədər böyük hər üçbucaqda qısa ox aşağıya doğru göstərir. Düz üçbucaqlarda ox olmur. Oxlar drenaj istiqamətinin tez yoxlanması üçündür; meylin dəyəri hələ yazılmır.

## Üçbucaqları, nöqtələri və kənarları göstərin

- {{ui:Triangles}} TIN-in kənarlarını çəkir. Səthin nöqtələri necə birləşdirdiyini, xüsusən sınma xətləri boyunca və kənarda yoxlamaq üçün onu yandırın.
- {{ui:Points}} hər geodezik nöqtəni çəkir; {{ui:Point labels}} onun nömrəsini, yüksəkliyini və təsvirini əlavə edir (və ya daha az: bax [CivilCraft parametrləri](topic:settings) daxilində **Nöqtə yazıları**).
- {{ui:Breaklines}} sınma xətlərini (və sərhədi) narıncı rənglə çəkir.
- {{ui:Surface edge}} səthin konturunu çəkir.

## Mövcud və ya layihə

Platforma və ya korridor problemsiz zəmin yaratdıqdan sonra **Göstərmə** altındakı **Səth** {{ui:Proposed (graded)}} seçimini təklif edir. Horizontallar, zolaqlar və oxlar onda planlaşdırılmış səthi göstərir, beləliklə yeni zəmini və onun ətrafındakı günəş işığını görə bilərsiniz. Geodeziyanı yenidən görmək üçün {{ui:Existing ground}} seçiminə qayıdın.

## Nə ixrac olunur

DXF və PDF çıxışı bu parametrləri izləyir: söndürdüyünüz şey yazılmır, horizontallar isə göstərilən səthin horizontallarıdır. Hündürlük zolaqları heç vaxt ixrac olunmur.
