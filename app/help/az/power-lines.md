---
title: Elektrik xətləri iş sahəsi
summary: Sahənizdə hava xətləri və yeraltı kabellər, öz kitabxanalarınız, yük halları altında əyilmə və gərginlik, təmizlik və möhkəmlik yoxlamaları, naqil çəkmə cədvəlləri, miqdarlar, vərəqlər və GIS ixracı.
keywords: elektrik xətti, hava xətti, elektrik, paylama, dirəklər, dayaqlar, naqil, əyilmə, gərginlik, naqil çəkmə, təmizlik, yeraltı kabel, xəndək, iş sahəsi, kommunal
from: 638dd856
---

Elektrik xətləri iş sahəsi mövcud CivilCraft sahənizdə hava xətləri və yeraltı kabelləri yerləşdirir: eyni planalma nöqtələri, eyni zəmin, eyni layihə faylı.

:::warning
Layihələndirmə köməkçisi. İş sahəsi əyilməni, gərginliyi, təmizlikləri və yükləri **sizin** yük hallarınız və həddləriniz əsasında hesablayır; heç bir ölkənin standartı daxil edilməyib. Mühəndis tikintidən əvvəl hər nəticəni tətbiq olunan standartla yoxlayır.
:::

## Açın

{{ui:Səth}} › {{ui:Daha çox}} › {{ui:Elektrik xətləri iş sahəsi}} seçin və ya İş sahəsi altında **Elektrik xətləri**. Alətlər panelində sonra **Elektrik xətləri** qrupu görünür; Dizayn və GIS qrupları kənara çəkilir. Geri qayıtmaq üçün İş sahəsi altında **Civil** seçin. CivilCraft bu kompüterdə sonuncu istifadə etdiyiniz iş sahəsini yadda saxlayır.

Sol paneldə yuxarıda iki bölmə əlavə olunur:

- **Elektrik xətləri**: yük halları və həddləriniz, layihədəki xətlər və kabellər və **Yoxlamalar**, həmişə yenilənmiş. Yoxlamanın üzərinə klikləyin, nəyə aid olduğunu seçmək üçün.
- **Kitabxana**: öz naqilləriniz, kabelləriniz, dayaqlarınız, avadanlığınız və xəndək növləriniz. Bax [Elektrik xətti kitabxananız](topic:power-line-library).

## Elektrik xətləri qrupunda nə var

| Alət | Nə edir | Mövzu |
|---|---|---|
| **Xətt** | Hava xətti: hər dayağa klikləyin | [Hava xəttinin çəkilməsi](topic:overhead-line) |
| **Dayaq** | Açıqlığa dayaq əlavə edin | [Hava xəttinin çəkilməsi](topic:overhead-line) |
| **Kabel** | Xəndəkdə yeraltı kabel marşrutu | [Yeraltı kabellər](topic:underground-cables) |
| **Avadanlıq** | Şkaf, transformator, birləşmə və ya şəbəkənin qidalandığı mənbə | [Yeraltı kabellər](topic:underground-cables) |
| **Maneə** | Xəttin kəsdiyi şey: yol, bina, başqa xətt | [Yoxlamalar](topic:power-line-checks) |
| **Profil** | Xətt profili: zəmin, dayaqlar və hər yük halında naqil | [Hava xəttinin çəkilməsi](topic:overhead-line#the-line-profile) |
| **Daha çox** | Yük halları və həddlər, naqil çəkmə cədvəlləri, miqdarlar, vərəqlər və hesabat, GIS, tədqiqat faylları | [Əyilmə və gərginlik](topic:sag-and-tension), [Çıxışlar](topic:power-line-outputs), [Tədqiqat faylları](topic:power-line-study-file) |

Əlavə etdiyiniz hər şey bir geri qaytarma addımıdır, layihə faylında saxlanılır və planda `C-POWR-…` adlı qatlarda çəkilir, ona görə DXF, DWG və PDF ixracları da onu daşıyır.
