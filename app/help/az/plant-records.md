---
title: Bitki qeydləri, sortlar və təmin olunan ölçülər
summary: Layihənin öz bitki siyahısı cədvəl kimi: sortlar, təmin olunan ölçülər (qab, kök kürəsi, gövdə ətrafı, təmiz gövdə), sıxlıq, spesifikasiya qeydləri, CSV girişi və çıxışı; hər yerləşdirilmiş bitki ölçü seçir; miqyasa görə bitki simvolları və öz simvollarınız və 3D modelləriniz.
keywords: bitki cədvəli, bitki bazası, sort, müxtəliflik, təmin olunan ölçü, qab, kök kürəsi, çılpaq kök, gövdə ətrafı, təmiz gövdə, sıxlıq, kvadrat metrə bitki, spesifikasiya, spesifikasiya qeydləri, bitki simvolu, blok, öz simvolu, 3D bitki, təfərrüat səviyyəsi, miqyas
from: 12251beb
---

Landscape qrupunun {{ui:Daha çox}} menyusundan və ya Bitkilər bölməsindən {{ui:Bitki cədvəli}} pəncərəsini açın. Hər sətir bu layihənin öz siyahısındakı bitki qeydidir (siyahıdan qeyd əlavə etdiyiniz zaman kopyalanır). Hər redaktə fayl idxal olunan kimi yoxlanılır və bir geri qaytarma addımıdır.

## Sütunlar

- **Botaniki ad**, **Adi ad**, **Növ**, **Hündürlük** və **Yayılma** yetkinlikdə (metrlə).
- **Məsafə** (mərkəzdən mərkəzə) və ya **Sıxlıq** (m²-yə bitki). Sıxlığı olan, lakin məsafəsi olmayan qeydin yatağı öz şablonuna (üçbucaq və ya kvadrat) uyğun həmin sıxlıqla doldurulur.
- **Təmin olunan ölçülər**: hər ölçü üçün bir yazı, `;` ilə ayrılmış. Hər yazı id-dir, növ (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) və sonra bunların hər hansı biri: həcm `10L`, hündürlük `h0.6`, yayılma `s0.4`, gövdə ətrafı `g14-16` (sm), təmiz gövdə `st1.8`. Nümunə: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sortlar**: adlar `;` ilə ayrılır. İdxal etdiyiniz faylda ölçüləri və qeydləri varsa, sort öz ölçülərini və qeydlərini saxlayır.
- **Spesifikasiya qeydləri**.

{{ui:Dublikat yarat}} sətri yeni açarla kopyalayır; {{ui:CSV kimi saxla}} və {{ui:Bitki faylı kimi saxla}} siyahını yazır (sortların CSV sətirləri `cultivar_of` ilə növün altında yerləşir). CSV və ya bitki faylının idxalı onu birləşdirir.

## Öz Kitabxana bitki siyahınız

CadCraft hesabınıza daxil olun (**Parametrlər**, **Əlavələriniz**, **Daxil ol**) və bitki cədvəli Kitabxanada saxladığınız siyahıdan istifadə edə bilsin:

- {{ui:Kitabxana siyahımdan}} öz bitki elementlərinizi gətirir (hələ nəzərdən keçirilməyənləri də daxil olmaqla). Bu yerdə artıq olan bitki Kitabxanadan yenilənir; buraya əlavə etdiyiniz sortlar, təmin olunan ölçülər, sıxlıq və spesifikasiya saxlanılır.
- {{ui:Bitki siyahısı kimi saxla}} hər sətri öz Kitabxana bitki elementiniz kimi saxlayır, növ başına bir element: yeni bitki yeni elementdir, dəyişdirilmiş bitki yeni versiyadır, dəyişməyən isə toxunulmaz qalır. Əvvəlcə qutucuğu işarələyin: saxlamaq bitkiləri CC0 altında ictimaiyyətə verir. Hələ etibar edilməyən şəxsin ilk ictimai yüklənməsi, hər yükləmə kimi, görünməzdən əvvəl bir nəfər tərəfindən yoxlanılır.

Kitabxana əsas bitki qeydini saxlayır. Sortlar, təmin olunan ölçülər, sıxlıq və spesifikasiya qeydləri layihədə və bitki faylında ({{ui:Bitki faylı kimi saxla}}) qalır; dialoq hər saxlamada bunun neçə sətri təsir etdiyini göstərir.

## Yerləşdirilmiş bitki ölçü seçir

Bitki, hasar və ya yataq və ya əkilmiş sahənin qarışıq sətrini seçin: qeydin sortları və ya təmin olunan ölçüləri olduqda {{ui:Sort və ölçü}} birini seçir. Bitki cədvəli növ, sort və ölçü üzrə sayır və yazı bunları göstərə bilər: `{botanical} '{cultivar}' {size}` və ya `{full}`.

## Miqyasa görə bitki simvolları

{{ui:Bitki qrafikası}} (Abadlaşdırma › Daha çox) bitkilərin planda necə çəkildiyini təyin edir: **avtomatik** (1:500-dən kobud olduqda yayılmada dairə, 1:200 ilə 1:500 arasında mərkəzi konturlu, daha incə olduqda ətraflı simvol; hər iki miqyas dəyişdirilə bilər) və ya hər miqyas üçün bir səviyyə. Vərəqlər dialoqunda həmin dəst üçün öz **Planda bitki təfərrüatı** var.

Bitkilər bölməsindəki qeyddə {{ui:Öz simvolu…}} SVG və ya DXF/DWG çertyojunun bloku oxuyur və simvolu bitkinin yayılmasında ətraflı səviyyədə çəkir. {{ui:Öz 3D modeli…}} OBJ, STL və ya GLB oxuyur; 3D-də görmək üçün Bitki qrafikasında **Hər qeydin öz modeli** seçin. Fayllar məhdudlaşdırılıb (512 KB SVG, 2000 forma, 50 000 üçbucaq) və layihədə saxlanılır. SVG çevirmələri tətbiq olunmur (fayl onları ehtiva etdikdə sizə bildirilir). Səviyyələr, limitlər və GLB-nin nə ehtiva edə biləcəyi üçün bax: [Miqyasa görə bitki qrafikası, öz simvollarınız və 3D bitkilər](topic:plant-graphics).
