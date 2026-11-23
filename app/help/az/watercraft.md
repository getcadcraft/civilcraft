---
title: WaterCraft: tələbatlar, yanğın axını, kəsintilər və su yaşı
summary: WaterCraft əlavəsi ilə müştəriləri su magistrallarınızda tələbata çevirin, hər hidrantda mövcud axını yoxlayın, hansı magistral kəsintisinin ən çox zərər verdiyini görün və gün ərzində su yaşını və xlorunu izləyin.
keywords: watercraft, su paylanması, tələbatlar, müştərilər, pik əmsalı, tələbat nümunəsi, yanğın axını, hidrant, qalıq təzyiq, kritiklik, kəsinti, klapan bölməsi, su yaşı, xlor, qalıq, mənbə izləmə, kor son, csv, əlavə
from: 066fb17a
---

WaterCraft Su magistralları alətləri ilə artıq çəkdiyiniz su şəbəkəsi üzərində işləyən əlavədir. Sağ paneldə dörd bölmə ilə bir sekmə əlavə edir.

:::warning
Yalnız hesablama köməkçisidir. Uydurma şəbəkələrdə əl hesablamaları ilə yoxlanılıb, real kommunal modeldə yox. Su mühəndisi hər nəticəni yoxlamalıdır. Ssenarilər, nəzarət qaydaları, klapanlar və sahə göstəriciləri WaterCraft əlavəsinin yardımında öz mövzularına malikdir: "Ssenarilər" və "Tədqiqatlar".
:::

## Nə edəcəksiniz

- Şəbəkədə müştəriləri tələbat kimi yerləşdirin.
- Lazım olan axından az olan hidrantları tapın.
- İtkisi ən çox əhəmiyyət kəsb edən magistralları tapın.
- Köhnə su və aşağı xlor tapın.

## Addımlar

1. {{ui:Parametrlər}} › {{ui:Əlavələr}} açın və {{ui:WaterCraft (su paylanması)}} açın. Sağ paneldə {{ui:WaterCraft}} sekmesi görünür.
2. Əvvəlcə Su magistralları alətləri ilə rezervuar, qovşaqlar və borular çəkin (bax: [Su magistralları](topic:water-mains)). Şəbəkə olmadan sekme bunu sizə deyir.
3. **{{ui:Tələbatlar}}** altında hər sətirə bir müştəri yapışdırın: id, x, y, növ, miqdar. {{ui:Zirvə əmsalı}} və {{ui:Saatlıq nümunə}} seçin (yaşayış günü, ticarət günü, düz və ya nümunəni olduğu kimi saxlayın). {{ui:Yoxla}} basın ki, hər müştərinin harada düşdüyünü görəsiniz (ən yaxın qovşaq), sonra {{ui:Şəbəkəyə yerləşdir}}. {{ui:Geri qaytar}} tələbatları geri götürür.
4. **{{ui:Yanğın axını}}** altında tələb olunan axını və qalıq təzyiqi təyin edin, qalığın {{ui:Yalnız hidrantda}} saxlanılmasını və ya {{ui:Sistemdə hər yerdə (daha sərt)}} seçin və {{ui:Uzanma}} basın. Hər hidrant ən pisdən başlayaraq "uyğun" və ya "çatmır" kimi siyahılanır.
5. **{{ui:Hansı magistral ən vacibdir}}** altında {{ui:bir boru bir dəfəyə}} və ya {{ui:bir klapanlı hissə bir dəfəyə}} seçin və {{ui:Uzanma}} basın. Hər kəsinti kəsilmiş tələbatı, kəsilmiş qovşaqları, minimum təzyiqin altına yeni düşən qovşaqları və qalan ən aşağı təzyiqi göstərir.
6. **{{ui:Su yaşı və xlor}}** altında nəyi izləmək istədiyinizi seçin (su yaşı, xlor və ya mənbə izləmə), işləmə saatlarını və istədiyiniz limitləri təyin edin və {{ui:Uzanma}} basın. Limitlərinizdən kənar qovşaqlar sadalanır.
7. Saxlamaq üçün istənilən cədvəlin altında {{ui:CSV kimi saxla}} basın.

## Qeydlər

- Lazım olan yanğın axını və hər evə və ya hər akra istifadə olunan su başlanğıc dəyərlərdir, standart deyil. Öz kommunalınızın rəqəmlərini istifadə edin.
- Klapanla qismən kəsilmiş boru tam bağlanmış sayılır, buna görə göstərilən kəsinti real olandan bir az pisdir.
- Son günü oxumazdan əvvəl su keyfiyyəti bölməsini gündəlik nümunə təkrarlanana qədər işlədin.
- {{ui:Dayandır}} uzun işi tez bitirir; siyahı yalnız görülənləri göstərir.
- Şəbəkəniz bu layihədə və bu kompüterdə qalır. Heç nə hardasa göndərilmir.
