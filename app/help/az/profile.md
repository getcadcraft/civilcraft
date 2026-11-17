---
title: Şaquli profilin layihələndirilməsi
summary: Profil görünüşünü açın, təbii zəmindən layihə profili başladın, PVI-ləri əlavə edib sürükləyin, şaquli əyri uzunluqlarını təyin edin və meylləri, K qiymətlərini və yüksək və alçaq nöqtələri oxuyun.
keywords: profil, şaquli trassa, pvi, şaquli əyri, meyl, k qiyməti, təpə, çökəklik, bvc, evc, profil görünüşü, layihə meyli, fg, mövcud zəmin profili, xüsusiyyət xətləri profildə, kəsişmələr, proyeksiya, bordür, xəndək, etiketlər
from: e9182bfa
---

Hər trassanın bir layihə profili var: düz meyllərlə birləşdirilmiş PVI-lərin (kilometraj və hündürlük) siyahısı, uzunluğu olan hər daxili PVI-də simmetrik parabolik şaquli əyri. Mövcud zəmin profili səthdən sizin üçün götürülür.

## Profil görünüşünü açın

1. Trassanı seçin ({{ui:Seç}} ilə üzərinə klikləyin).
2. {{key:R}} düyməsinə basın, və ya alətlər panelində {{ui:Profil}} klikləyin, və ya sağ panelin altında {{ui:Profil görünüşü}}.
   Profil görünüşü planın altında, trassa boyunca mövcud zəmini göstərərək açılır. İki və ya daha çox trassa olduqda, profil panelinin solundakı siyahıdan birini seçin.

Görünüş həmişə bütün trassanı göstərir və hündürlükləri panelə uyğunlaşdırmaq üçün uzadır; şaquli şişirmə aşağı-sol küncdə yazılır, məsələn "Şaquli şişirmə 10×". Zoom və sürüşdürmə yoxdur.

Profil boyunca siçanı hərəkət etdirin: panel kilometrajı, zəmin və layihə hündürlüklərini, meyli və orada kəsim və ya doldurmanı göstərir, planda isə trassa üzərində nöqtə izləyir.

## Layihə profilini başladın

1. Sağ paneldə **Layihə profili** altında {{ui:Təbii zəmindən başla}} klikləyin.
   Trassanın iki ucunda zəmində iki PVI yerləşdirilir və bir düz meylə birləşdirilir. Status paneli yazır: "Layihə profili hər iki ucda zəmindən başladı. PVI əlavə et-i yandırın və meyl dəyişikliklərini əlavə etmək üçün klikləyin; cədvəldə onlara əyri uzunluğu verin."

Trassa səthi kəsmirsə, "Bu trassanın altında başlanğıc üçün zəmin yoxdur." mesajını alırsınız. Bu halda klikləməklə PVI əlavə edin (növbəti bölmə).

## PVI əlavə edin

1. {{key:I}} düyməsinə basın, və ya profil panelində {{ui:PVI əlavə et}} klikləyin. O, basılmış qalır.
2. Meyl dəyişikliyi istədiyiniz yerdə profilə klikləyin. PVI həmin kilometrajda və hündürlükdə, 0.01-ə yuvarlaqlaşdırılmış şəkildə əlavə olunur və seçilir.
3. Lazım olduqda əlavə edin, sonra əlavə etməyi dayandırmaq üçün {{key:I}} düyməsinə yenidən basın.

Artıq PVI olan yerə klik rədd edilir ("Bu yerdə artıq PVI var …"). PVI-lər həmişə kilometraj sırası ilə qalır.

## PVI-ləri tənzimləyin

- Profildə PVI-ni **sürükləyin** onu köçürmək üçün. Qonşularından keçə bilməz. Köçürmə bir geri qaytarma addımıdır.
- Sağ paneldəki PVI cədvəlində dəqiq dəyərləri **yazın**: **Kilometraj**, **Hündürlük** və **Əyri L** (şaquli əyri uzunluğu). Hər birindən sonra {{key:Enter}} basın.
- PVI-ni sətrinin sonundakı x ilə **silin**, və ya onu seçib {{key:Delete}} basın. Profil görünüşü fokusda olduqda {{key:Backspace}} də silir.

Birinci və son PVI heç vaxt əyri almır.

## Şaquli əyrilər

1. Daxili PVI üçün **Əyri L**-ə uzunluq yazın, məsələn 200.
2. Əyri PVI-nin mərkəzində çəkilir. Profil və sağ panel onun növünü (təpə və ya çökəklik), L və K-nı, BVC və EVC kilometrajlarını və hündürlüklərini və əyrinin içində olduqda yüksək və ya alçaq nöqtəsini göstərir.

K L-dən hesablanır (K = L bölünür meyllərin cəbri fərqinə, faizlə). Siz L yazırsınız; K-nı birbaşa yazmaq hələ mövcud deyil.

Şaquli əyri yerə sığmırsa, qırmızı qutu səbəbi göstərir: ondan əvvəlki PVI və ya əyrinin üzərinə və ya növbəti PVI-nin o tayına qaçır, və həmin tərəfdə nə qədər yer olduğunu (əyri hər tərəfdə öz PVI-sindən uzunluğunun yarısını tələb edir). Onun düyməsi **sığan ən uzun əyrini** K ilə birlikdə bir addımda təyin edir ({{key:Mod+Z}} ilə geri qaytarılır). Və ya PVI-ləri bir-birindən uzaqlaşdırın.

## Faktları oxuyun

PVI cədvəlinin altında siyahı hər meyli faizlə verir ("Meyl 1: +1.25%") və hər əyrini, məsələn "Təpə 2+00.00-da: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", sonra "Yüksək nöqtə 1+62.40, 254.12".

PVI-lər trassanın hər iki ucuna çatmırsa, qeyd bunu deyir. Koridor yalnız profil və trassa üst-üstə düşdüyü yerdə qurulur.

## Profildə xüsusiyyət xətləri

Xüsusiyyət xətləri profil görünüşündə də göstərilir, ona görə bordürü, xəndəyi və ya divar üstünü yolun profilinə qarşı görə bilərsiniz.

- Xüsusiyyət xətti trassanı **kəsdikdə**, profil həmin kilometraj və hündürlükdə kiçik romb göstərir, xəttin adı və orada hündürlüyü ilə etiketlənmiş (xəttin öz hündürlüyü, kəsişən seqment boyunca hesablanmış).
- Yanında məsafə yazın, {{ui:Yanında, məsafə daxilində}} sahəsinə, o məsafə daxilində trassanın **yanında keçən** xüsusiyyət xətlərini də öz hündürlüklərində kəsikli xətlərlə çəkmək üçün. Boş və ya 0 yalnız kəsişmələri göstərir.
- Hər dəyişiklik işarələri və etiketləri izləyir: təpəni köçürün, meyl yazın və ya xətti qaldırın, profil yeni hündürlükləri dərhal göstərir.
- Kəsişmənin romb işarəsinə klikləyin, həmin xüsusiyyət xəttini seçmək üçün; seçilmiş xətt vurğu rəngi ilə çəkilir.
- Profil panelində {{ui:Xüsusiyyət xətləri}} hamısını gizlədir və ya göstərir. Hər iki parametr layihə ilə birlikdə saxlanılır.

Bax [Xüsusiyyət xətləri](topic:feature-lines).

## Növbəti

- [Yol koridorunu yaradın](topic:corridor) bu trassa və bu profil boyunca.
- Profil trassa ilə birlikdə LandXML-ə yazılır; bax [LandXML mübadiləsi](topic:landxml).
