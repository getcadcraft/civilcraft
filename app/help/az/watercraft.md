---
title: WaterCraft: tələbatlar, yanğın axını, dayanmalar və suyun yaşı
summary: WaterCraft əlavəsi ilə istehlakçıları su magistrallarındakı tələbatlara çevirin, hər hidrantda mövcud axını yoxlayın, hansı magistral dayanmasının ən çox zərər verdiyini görün və bir gün ərzində suyun yaşını və xlorun miqdarını izləyin.
keywords: watercraft, su paylanması, tələbatlar, istehlakçılar, zirvə əmsalı, tələbat rejimi, yanğın axını, hidrant, qalıq təzyiq, kritiklik, dayanma, klapanlı hissə, suyun yaşı, xlor, qalıq, mənbənin izlənməsi, çıxılmaz son, csv, əlavə
from: 76809f01
---

WaterCraft əlavədir və artıq Su magistralları alətləri ilə çəkdiyiniz su şəbəkəsi üzərində işləyir. Sağ paneldə dörd bölməli bir nişan əlavə edir.

:::warning
Yalnız hesablama köməkçisidir. Uydurma şəbəkələr üzərində əl ilə alınmış cavablarla yoxlanılıb, real su təchizatı modeli üzərində yox. Hər nəticəni su mühəndisi yoxlamalıdır. Hələlik nasos stansiyaları, ikinci dərəcəli parçalanma və ssenarilər yoxdur.
:::

## Nə edəcəksiniz

- Müştariləri şəbəkədə tələbat kimi yerləşdirin.
- Tələb olunan axına çatmayan hidrantları tapın.
- İtkisi ən çox əhəmiyyət kəsb edən magistralları tapın.
- Köhnə suyu və aşağı xlor səviyyəsini tapın.

## Addımlar

1. {{ui:Parametrlər}} › {{ui:Əlavələr}} bölməsini açın və {{ui:WaterCraft (su paylanması)}} seçimini aktivləşdirin. Sağ paneldə {{ui:WaterCraft}} nişanı görünəcək.
2. Əvvəlcə Su magistralları alətləri ilə bir rezervuar, qovşaqlar və borular çəkin (bax: [Su magistralları](topic:water-mains)). Şəbəkə olmadan nişan bunun lazım olduğunu sizə bildirir.
3. {{ui:Tələbatlar}} altında hər sətirə bir müştəri yapışdırın: id, x, y, növ, miqdar. {{ui:Zirvə əmsalı}} və {{ui:Saatlıq rejim}} seçin (yaşayış günü, ticarət günü, sabit və ya rejimin olduğu kimi saxlanılması). Hər müştərinin harada yerləşdiyini görmək üçün {{ui:Yoxla}} düyməsini basın (ən yaxın qovşaq), sonra {{ui:Şəbəkəyə qoy}}. {{ui:Geri qaytar}} tələbatları geri götürür.
4. {{ui:Yanğın axını}} altında tələb olunan axını və qalıq təzyiqi təyin edin, qalıq təzyiqin {{ui:Yalnız hidrantda}} saxlanılmasını və ya {{ui:Sistemin hər yerində (daha ciddi)}} saxlanılmasını seçin və {{ui:Uzanma}} düyməsini basın. Hər hidrant ən pisdən başlayaraq, uyğun və ya çatmır kimi siyahılanır.
5. {{ui:Hansı magistral daha vacibdir}} altında {{ui:bir-bir boru}} və ya {{ui:bir-bir klapanlı hissə}} seçin və {{ui:Uzanma}} düyməsini basın. Hər dayanma kəsilmiş tələbatı, kəsilmiş qovşaqları, minimum təzyiqin altına yeni düşən qovşaqları və qalan ən aşağı təzyiqi göstərir.
6. {{ui:Suyun yaşı və xlor}} altında nəyi izləmək istədiyinizi seçin (suyun yaşı, xlor və ya mənbənin izlənməsi), işləmə saatlarını və istədiyiniz limitləri təyin edin və {{ui:Uzanma}} düyməsini basın. Limitlərinizin xaricində olan qovşaqlar siyahılanır.
7. Hər hansı cədvəli saxlamaq üçün onun altında {{ui:CSV kimi saxla}} düyməsini basın.

## Qeydlər

- Tələb olunan yanğın axını və evə və ya acre başına istifadə başlanğıc dəyərlərdir, standart deyil. Öz su təchizatı şirkətinizin rəqəmlərindən istifadə edin.
- Klapanla qismən kəsilən boru tam bağlı sayılır, buna görə göstərilən dayanma real olanından bir qədər ciddidir.
- Su keyfiyyəti bölməsini günlük rejim təkrarlanana qədər kifayət qədər işlədin, sonra son günü oxuyun.
- {{ui:Dayandır}} uzun işi tez bitirir; siyahıda yalnız görülən işlər göstərilir.
- Şəbəkəniz bu layihədə və bu kompüterdə qalır. Heç yerə göndərilmir.
