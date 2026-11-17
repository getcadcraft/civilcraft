---
title: Planı PDF-ə çap et
summary: Hamısını və ya cari görünüşü standart vərəqdə mühəndis və ya metrik miqyasda vektor PDF-ə çap edin; qat rəngləri və ya qara ilə.
keywords: çap, çıxarış, pdf, vərəq, miqyas, kağız ölçüsü, plan vərəqi, nəşr, başlıq bloku, şimal oxu, miqyas çubuğu
from: 9af396ca
---

{{ui:PDF}} planı bir vərəqdə başlıq zolağı, şimal oxu və miqyas çubuğu ilə vektor PDF-ə çıxarır. PDF brauzerdə yaradılır və yüklənir; brauzerin çap pəncərəsindən keçmir.

## Çap

1. **Göstərmə** altında planı qurun: göstərilən səth, horizontal intervalı və hansı şeylərin açıq olduğunu. Çap bu parametrləri izləyir.
2. Saytın yalnız bir hissəsini istəyirsinizsə, planı həmin hissəyə yaxınlaşdırın və sürüşdürün.
3. **İxrac** qrupunda {{ui:PDF}} düyməsini basın və ya {{key:Mod+P}} basın.
   **Planı PDF-ə çap et** dialoqu açılır.
4. **Sahə** seçin: {{ui:Hamısı}} və ya {{ui:Ekranda olanlar}}.
5. **Kağız** seçin: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 və ya A1. Fut ölçülü layihə Tabloid ilə, metr layihəsi A3 ilə başlayır. Vərəqlər həmişə üfüqidir.
6. **Miqyas** seçin. Siyahı sığan ən böyük miqyası "(uyğun)" ilə qeyd edir və onu seçir.
   - Fut: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metr: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. **Rəng** seçin: {{ui:Qat rəngləri}} və ya {{ui:Qara}}.
8. Seçimlərin altındakı sətri oxuyun. Orada sahənin kağızda ölçüsü və vərəq ölçüsü göstərilir, məsələn: "Sahə 1" = 40' miqyasında 297 × 222 mm-dir, vərəq ölçüsü 432 × 279 mm (üfüqi)."
9. {{ui:Download PDF}} düyməsini basın.
   Brauzer `<name>.pdf` faylını yükləyir. Status paneli "<name>.pdf çap edildi, 1" = 40' miqyasında." yazır.

Seçdiyiniz miqyasda sahə vərəqdən böyükdürsə, çap mərkəzləşdirilir və kənarlar kəsilir. "(uyğun)" ilə qeyd olunan miqyası və ya daha böyük vərəq seçin.

## Vərəqdə nə var

- Plan, çəkiliş sahəsinin mərkəzində, həqiqi vektorlar kimi: horizontallar, yazılar, pikketaj ilə trassalar, koridorlar, platformalar və kəsişmə xətləri, borular, nöqtələr.
- Qat üzrə xətt qalınlıqları: trassalar, platformalar və borular qalın; üçbucaqlar və köməkçi horizontallar incə.
- Aşağıda başlıq zolağı: layihənin **Adı**, miqyas, horizontal intervalın qeydi və hansı səthin (mövcud və ya planlaşdırılmış) istifadə olunduğu, sağda isə tarix və quruluş nömrəsi.
- Şimal oxu yuxarı sağ künjdə (plan şimalı yuxarıdır) və miqyas çubuğu başlıq zolağında.
- **Planın altındakı xəritə qatları** işarələndikdə planın altında göstərilən xəritə qatları (şəkil, xəritə kafelləri və ya xəritə xidməti): bütün çəkiliş sahəsinin tək şəkli kimi, 150 dpi ilə, xətlərin altında çəkilir və xəritənin mənbə qeydi başlıq zolağına yazılır. CivilCraft hələ gəlməkdə olan xəritə şəkilləri üçün 8 saniyə gözləyir; bəziləri hələ də çatmırsa, status paneli bunu bildirir.

Mətn PDF-in daxili Helvetica şriftindən istifadə edir. Qərbi Avropa dəstindən (Windows-1252) kənar simvollar "?" kimi çap olunur, status mesajı onları sayır.

## Nə çap olunmur

- Hündürlük zonaları.
- Profil görünüşü. Profillərin çapı hələ mövcud deyil.
- Birdən çox vərəq (trassa üçün [plan və profil vərəqlərindən](topic:plan-profile-sheets) istifadə edin), viewport-lar, xüsusi başlıq bloku və ya portret vərəqləri.

:::note
Dialoqda qeyd olunur ki, meyl oxları yalnız ekranda görünür. Bu versiyada **Göstərmə** altında açılmış meyl oxları çap olunur (və DXF-ə ixrac olunur). İstəmirsinizsə, çapdan əvvəl onları bağlayın.
:::

## Kağızda çap

Yüklədiyiniz PDF-i istənilən PDF oxuyucuda açın və miqyası dəqiq saxlamaq üçün 100% (həqiqi ölçü) çap edin. "Fit to page" (səhifəyə sığdır) miqyası dəyişir.
