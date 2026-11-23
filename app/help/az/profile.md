---
title: Şaquli profilin layihələndirilməsi
summary: Profil görünüşünü açın, zəmindən layihə profili başladın, PVI-ləri əlavə edib sürüşdürün, şaquli əyri uzunluqlarını təyin edin və meylləri, K dəyərlərini və yüksək və alçaq nöqtələri oxuyun.
keywords: profil, şaquli trassa, pvi, şaquli əyri, meyl, k dəyəri, təpə, çökəklik, bvc, evc, profil görünüşü, son meyl, fg, mövcud zəmin profili, profildə xüsusiyyət xətləri, kəsişmələr, proyeksiya, bordür, xəndək, etiketlər
from: dbb1f32d
---

Hər trassanın bir layihə profili var: düz meyllərlə birləşdirilmiş PVI-lərin (piket və hündürlük) siyahısı; uzunluğu olan hər daxili PVI-də simmetrik parabolik şaquli əyri var. Mövcud zəmin profili səthdən sizin üçün nümunə götürülür.

## Profil görünüşünü açın

1. Trassanı seçin (onu {{ui:Seç}} ilə klikləyin).
2. {{key:R}} basın, və ya alət panelində {{ui:Profil}} düyməsini, və ya sağ panelin aşağısında {{ui:Profil görünüşü}} klikləyin.
   Profil görünüşü plan altında açılır, trassa boyunca mövcud zəmin ilə. İki və ya daha çox trassa olduqda, profil panelinin solundakı siyahıdan birini seçin.

Görünüş əvvəlcə bütün trassanı göstərir və hündürlükləri panelə uyğunlaşdırır; böyütmə aşağı-sol künjdə yazılır, məsələn "Şaquli böyütmə 10×".

## Profili böyüdün və sürüşdürün

- **Böyütmə:** siçan təkərini çevirin (və ya trackpad-də sıxın) və görünüş göstəricinin ətrafında böyüyür. Yalnız piketləri böyütmək üçün {{key:Shift}} saxlayın, yalnız hündürlükləri böyütmək üçün {{key:Alt}} (bu böyütməni dəyişir). Profil görünüşü fokusda olduqda artı və mənfi düymələr ortanın ətrafında böyüdür.
- **Sürüşdürmə:** sağ və ya orta siçan düyməsi ilə sürükləyin, və ya trackpad-də iki barmaqla sürüşdürün.
- **Uyğunlaşdır:** profilə iki dəfə klikləyin və ya bütün trassanı yenidən göstərmək üçün {{key:F}} basın.

PVI redaktə etmək seçdiyiniz böyütməni saxlayır; uyğunlaşdırmaya qayıtmır.

Siçanı profil boyunca hərəkət etdirin: panel piketi, mövcud və layihə hündürlüklərini, meyli və orada kəsmə və ya doldurmanı göstərir, nöqtə isə planda trassada izləyir.

## Layihə profilinə başlayın

1. Sağ paneldə **Layihə profili** altında {{ui:Təbii zəmindən başla}} klikləyin.
   İki PVI trassanın iki ucunda zəminə qoyulur və bir düz meyllə birləşdirilir. Status çubuğu deyir: "Layihə profili hər iki ucda zəmindən başladı. Meyl dəyişikliklərini əlavə etmək üçün **PVI əlavə et**i açın və klikləyin; cədvəldə onlara əyri uzunluğu verin."

Trassa səthi kəsmirsə, "Bu trassanın altında başlamaq üçün zəmin yoxdur" mesajı görünür. Bu halda PVI-ləri klikləməklə əlavə edin (növbəti bölmə).

## PVI əlavə edin

1. {{key:I}} basın, və ya profil panelində {{ui:PVI əlavə et}} klikləyin. O, basılı qalır.
2. Meyl dəyişikliyi istədiyiniz yerdə profilə klikləyin. PVI o piket və hündürlükdə, 0.01-ə yuvarlaqlaşdırılmış və seçilmiş halda əlavə olunur.
3. Lazım olan qədər əlavə edin, sonra əlavə etməyi dayandırmaq üçün {{key:I}} yenidən basın.

Artıq PVI olan yerə klik rədd olunur ("… nöqtəsində artıq PVI var"). PVI-lər həmişə piket sırası ilə qalır.

## Əlavə edərkən və sürüklərkən yapışma

Profil panelindəki **Yapışma** düyməsi başlanğıcda açıqdır. Açıq olduqda əlavə etdiyiniz və ya sürüklədiyiniz PVI ən yaxın PVI-yə, zəmin nöqtəsinə, PVI piketinə və ya zəmin xəttinə düşür və markerin yanında etiket hansının olduğunu deyir. Hər yerdə sərbəst nöqtə üçün {{key:Alt}} saxlayın.

## PVI-ləri tənzimləyin

- Profildə PVI-ni **sürükləyin**. Qonşularını keçə bilmir. Hərəkət bir geri alma addımıdır.
- Sağ paneldəki PVI cədvəlində dəqiq dəyərləri **yazın**: **Piket**, **Hündürlük**, **Meyl %** və **Əyri L** (şaquli əyrinin uzunluğu). Hər birindən sonra {{key:Enter}} basın.
- Profildən dəyər **seçin**: PVI-nin pikətinin və ya hündürlüyünün yanındakı kiçik düymə profil görünüşündə bir klik gözləyir və dəyəri doldurur. Klik PVI əlavə et kimi yapışır; sərbəst nöqtə üçün {{key:Alt}} saxlayın; {{key:Esc}} ləğv edir.
- **Meyl %** PVI-dən başlayıb növbətiyə gedən tangensin meylidir. Onu yazmaq **növbəti** PVI-nin hündürlüyünü hərəkət etdirir (onun piketi heç vaxt dəyişmir). Növbəti PVI kilidlidirsə, əvvəlki PVI-nin hündürlüyü hərəkət edir.
- PVI-ni sətirinin sonundakı qıfılla **kilidləyin**. Kilidli PVI sürüklənmir və meyl redaktəsi onu hərəkət etdirmir. Tangensin hər iki ucu kilidlidirsə, onun meyli dəyişə bilməz: status çubuğu bunu deyir və əvvəl bir ucu açmalısınız. Kilid faylda saxlanılır.
- PVI-ni sətirinin sonundakı **x** ilə **silin**, və ya onu seçin (klikləyin) və {{key:Delete}} basın. Profil görünüşü fokusda olduqda {{key:Backspace}} də silir.

Birinci və son PVI heç vaxt əyri almır.

## Şaquli əyrilər

1. Daxili PVI üçün **Əyri L**-də uzunluq yazın, məsələn 200.
2. Əyri PVI-nin üzərində mərkəzləşdirilmiş çəkilir. Profil və sağ panel onun növünü (təpə və ya çökəklik), L və K-nı, BVC və EVC piketlərini və hündürlüklərini və əyrinin içində olduqda yüksək və ya alçaq nöqtəsini göstərir.

K L-dən hesablanır (K = L bölünür meyllərin cəbri fərqinə, faizlə). Siz L yazırsınız; K-nı birbaşa yazmaq hələ mövcud deyil.

Şaquli əyri yerə düşmürsə, qırmızı qutu səbəbi deyir: ondan əvvəlki PVI və ya əyriyə geri girir, ya da növbəti PVI-dən keçir, və hər tərəfdə nə qədər yer olduğunu (əyri PVI-nin hər tərəfində uzunluğunun yarısını tələb edir). Onun düyməsi **sığan ən uzun əyri**ni, K ilə birlikdə, bir addım kimi təyin edir ({{key:Mod+Z}} geri qaytarır). Və ya PVI-ləri bir-birindən uzaqlaşdırın.

## Faktları oxuyun

PVI cədvəlinin altında siyahı hər meyli faizlə verir ("Meyl 1: +1.25%") və hər əyrini, məsələn "Təpə 2+00.00-da: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", sonra "Yüksək nöqtə 1+62.40, 254.12".

PVI-lər trassanın hər iki ucuna çatmırsa, qeyd bunu deyir. Korridor yalnız profil və trassa üst-üstə düşdükdə qurulur.

## Profildə xüsusiyyət xətləri

Xüsusiyyət xətləri profil görünüşündə də göstərilir, buna görə yolun profilinə qarşı bordürü, xəndəyi və ya divar yuxarısını görə bilərsiniz.

- Xüsusiyyət xətti trassanı **kəsdikdə** profil həmin piket və hündürlükdə kiçik romb göstərir, xəttin adı və orada hündürlüyü ilə etiketlənmiş (xəttin öz hündürlüyü, kəsişən seqment boyunca hesablanmış).
- {{ui:Yanında, məsafə daxilində}} sahəsinə məsafə yazın ki, həmin məsafə daxilində trassanın **yanından keçən** xüsusiyyət xətlərini də kəsikli xətt kimi öz hündürlüklərində çəkin. Boş və ya 0 yalnız kəsişmələri göstərir.
- İşarələr və etiketlər hər dəyişikliyi izləyir: təpəni hərəkət etdirin, meyl yazın və ya xətti qaldırın, profil yeni hündürlükləri dərhal göstərir.
- Kəsişmənin rombuna klikləyin ki, o xüsusiyyət xəttini seçəsiniz; seçilmiş xətt vurğu rəngi ilə çəkilir.
- Profil panelindəki {{ui:Xüsusiyyət xətləri}} onların hamısını gizlədir və ya göstərir. Hər iki parametr layihə ilə birlikdə saxlanılır.

Bax: [Xüsusiyyət xətləri](topic:feature-lines).

## Növbəti

- Trassa və bu profil boyunca [Yol korridorunun yaradılması](topic:corridor).
- Profil trassa ilə birlikdə LandXML-ə yazılır; bax: [LandXML mübadiləsi](topic:landxml).
