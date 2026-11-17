---
title: IFC ixracını müştərinin IDS-inə görə yoxlayın
summary: Müştəri və ya yol orqanının verdiyi .ids faylını yükləyin və Problemlər-də ona uyğun gəlməyən hər ixrac elementini görün.
keywords: ids, məlumat çatdırılma spesifikasiyası, buildingsmart, tələblər, çatdırılma, yoxlama, keyfiyyət, qa, ifc ixracı, ifc 4.3, trassa, yol, satınalma
from: 183d9a0e
---

## Nə edəcəksiniz

IDS (Information Delivery Specification, buildingSMART standartı) IFC-nin nələri ehtiva etməli olduğunun siyahısıdır. Dövlət satınalmaları çox vaxt işlə birlikdə onu göndərir. CivilCraft bu layihənin ixrac etdiyi IFC-ni, ixrac üçün seçdiyiniz IFC versiyasında, ona görə yoxlayır və ona uyğun gəlməyən hər elementi siyahılayır.

## Addımlar

1. Layihənizi açın.
2. Alət panelinin **İxrac** qrupunda {{ui:IFC}} klikləyin. Dialoqda təhvil verəcəyiniz IFC versiyasını seçin.
3. {{ui:IDS-ə görə yoxla…}} klikləyin.
4. {{ui:.ids faylı yükləyin…}} klikləyin və faylı seçin. Heç nə yüklənmir.
5. Nəticəni oxuyun: hər spesifikasiya {{ui:Keçdi}} və ya {{ui:Uğursuz}} ilə və neçə elementə tətbiq olunduğu göstərilir.
6. Problemlər panelini açın ({{key:Ctrl+Shift+M}}) və uğursuzluğa klikləyib onun gəldiyi trassanı, platformanı, borunu, quruluşu və ya bina kütləsini seçin.

## Nəyi görəcəksiniz

- Hər ixrac edilmiş element və çatışmayan tələb üçün bir xəbərdarlıq: spesifikasiyanın adı, IDS-in nə tələb etdiyi və ixracda nə olduğu ilə.
- Yoxlama hesabatı (Problemlər-də) IDS ilə başlayır: onun başlığı, versiyası, müəllifi və hər spesifikasiyanın saylarıyla.

## Bilmək yaxşıdır

- IDS layihə faylında saxlanılır, buna görə layihəni açdığınızda yenidən yoxlanılır. Onu yükləmək və ya unutmaq geri alına bilən bir addımdır.
- Hər dəyişiklik bir az sonra yenidən yoxlanılır. Böyük səthlər yazılması daha uzun çəkir, buna görə yoxlama işləmələr arasında bir az daha uzun gözləyir.
- Yoxlama {{ui:IFC}} ixracının yazdığı eyni faylı istifadə edir, orada seçilən son versiyada (seçməmisinizsə, IFC 4.3).
- Rəqəmlər SI vahidlərində müqayisə olunur: futla ölçülən layihə əvvəlcə metrə çevrilir.
- IDS-dəki şablonlar bütöv dəyər kimi oxunur. Başlanğıcdakı `^` və sonundakı `$` də "bütöv dəyər" kimi qəbul olunur, əksər IDS faylları onları belə nəzərdə tutur.

## Növbəti

- [IFC ixrac edin](topic:ifc)
