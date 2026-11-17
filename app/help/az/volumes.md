---
title: Torpaq işləri həcmləri
summary: Mövcud təbii zəmin ilə layihə səthi arasında kəsim, doldurma və xalis həcmləri hər platforma və dəhliz üzrə və ümumi oxuyun, onların arxasındakı şəbəkə üsulunu anlayın.
keywords: həcmlər, torpaq işləri, kəsim, doldurma, xalis, kəsim və doldurma, miqdarlar, şəbəkə üsulu, səth müqayisəsi, həcm səthi, kub yard, kub metr
from: 299d7bc7
---

Platforma və ya dəhliz problemsiz planlaşdırılan kimi CivilCraft layihə səthini mövcud təbii zəminlə müqayisə edir və kəsim və doldurmanı hesabat verir. Rəqəmlər hər dəyişiklikdə yenilənir.

## Harada oxumaq

- **Torpaq işləri** sağ paneldə heç nə seçilmədikdə (**Layihə** görünüşü), ən azı bir platforma və ya dəhliz olduqda.
- **Torpaq işləri** sağ paneldə platforma seçildikdə (layihənin eyni ümumi nəticələri).
- Dəhliz parametrlərinin altındakı sətir, o dəhlizin öz kəsimi və doldurması ilə.

**Torpaq işləri** bloku göstərir:

- **Kəsim**, **Doldurma** və **Xalis** (ardınca "doldurma" və ya "kəsim" ilə, hansı böyükdürsə)
- bir elementdən çox olanda hər element üçün sətir, məsələn "Platforma 1: kəsim 120.4 kub yd, doldurma 310.2 kub yd"
- üsul sətri: "Şəbəkə üsulu: mövcud təbii zemin və planlaşdırılmış səth günışığı xətləri daxilində hər 0.5 ft-də nümunə götürülür (92,891 hüceyrə). Şişmə və ya büzülmə tətbiq edilməyib."

Həcmlər fut layihəsində kub yardla, metr layihəsində kub metrlə verilir.

## TakeoffCraft-a göndərin

Torpaq işlərinin qiymətini vermək üçün **Torpaq işləri** blokunun altında {{ui:TakeoffCraft-a göndər}} seçin. CivilCraft miqdar faylı (`<site>.quantities.json`) saxlayır, iki miqdarla: kəsim və doldurma, kub yardla (fut layihəsi) və ya kub metrlə (metr layihəsi), blokdakı eyni rəqəmlər, yüzdə birinə qədər. TakeoffCraft-da **Həcmlərin hesablanmasını aç** ilə açın, ya da oraya buraxın: onlar qiymətləndirə biləcəyiniz iki element olur ([CivilCraft-dan kəsim və doldurma](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Dəyişiklikdən sonra yenidən göndərin və yeni faylı açın: eyni elementlər yeni rəqəmləri alır.

Yalnız cəmlər göndərilir, buna görə heç nə iki dəfə sayılmır; faylın qeydi hər platformanın və dəhlizin öz kəsimini və doldurmasını sadalayır.

## Necə hesablanır

CivilCraft **şəbəkə üsulundan** istifadə edir:

1. Günışığı xətləri daxilindəki sahənin üzərinə kvadrat hüceyrələrdən ibarət şəbəkə qoyulur.
2. Hər hüceyrənin mərkəzində hər iki səth nümunə götürülür.
3. Hər hüceyrə prizma kimi sayılır: hündürlük fərqi hüceyrənin sahəsinə vurulur. Layihə səthi aşağı olan yerdə kəsim, yüksək olan yerdə doldurma olur.
4. Hüceyrələr toplanır.

Hüceyrə ölçüsü sizin üçün seçilir ki, planlaşdırılmış sahələri əhatə edən düzbucaqlıda təxminən 250,000 hüceyrə olsun; səliqəli dəyərə yuvarlaqlaşdırılır (10-un qüvvəti ilə 1, 2 və ya 5 çarpanı). Hələlik özünüz təyin edə bilməzsiniz. Üsul sətri ölçünü və hüceyrə sayını deyir. Kiçik hüceyrələr kənarlar boyunca daha dəqiqdir; düz müstəvilər arasında tam hüceyrələrdə nəticə dəqiqdir.

## Bilmək lazım olanlar

- Yalnız günışığı xətləri daxilindəki sahə sayılır. Onlardan kənar təbii zemin dəyişmir.
- Problemi olan platforma və ya dəhliz daxil edilmir və heç nə əlavə etmir. Blok "Hələ həcm yoxdur: platforma problemsiz planlaşdırılmalıdır." deyirsə, onun üstündəki qırmızı qutuya baxın.
- Elementlər üst-üstə düşəndə, sonrakı element günışığı xətti daxilində əvvəlkini əvəz edir və üst-üstə düşən hissə bir dəfə sayılır.
- Şişmə və ya büzülmə əmsalı tətbiq edilmir. Yerində, boş və ya sıxılmış həcmlər lazımdırsa, nəticələri özünüz vurun.
- Üst torpağın sıyrılması, örtük və əsas təbəqə dərinlikləri və TIN-dən TIN-ə prizma həcmləri hələ mövcud deyil.

## Nəticəni yoxlamaq

- **Göstər** altında {{ui:Layihə (planlaşdırılmış)}} açın və günışığı xətləri daxilində horizontallara baxın.
- Planlaşdırılmış sahənin üzərinə gətirin: status paneli **Təbii zemin** və **Planlaşdırılmış** göstərir. Fərq həmin nöqtədə kəsim və ya doldurmanın dərinliyidir.
- Dəhliz üçün profil görünüşünün göstəricisi hər stansiyada mərkəz xətti üzrə kəsim və ya doldurmanı göstərir.
