---
title: Bina platformasını planlaşdır
summary: Düz platforma çəkin, onun hündürlüyünü və kəsmə-doldurma yamaclarını təyin edin, CivilCraft-ın onu mövcud zəmin ilə gün işığına çıxarıb layihə səthinə əlavə etməsinə icazə verin.
keywords: dayaq divarı, dayaq divarları, şaquli tərəf, divar yamac əvəzinə, tərəfə görə yamac, bənd, yamac, planlaşdırma, platforma, bina platforması, gün işığı, xarakterik xətt, planlaşdırma qrupu, kəsmə yamacı, doldurma yamacı, son səviyyə, layihə səthi, sayt planlaşdırması
from: 482319a6
---

Platforma bir hündürlükdə olan düz sahədir. Kənarından CivilCraft, zəmin platformadan yüksək olduqda kəsmə yamacınızla, aşağı olduqda isə doldurma yamacınızla xaricə doğru gedir, yamac mövcud zəmini kəsənə qədər. Həmin birləşmə xətti **gün işığı xəttidir**. Platforma və onun yamacları gün işığı xəttinin içindəki mövcud zəminin yerini tutaraq layihə səthini yaradır.

## Platformanı çəkin

Əvvəlcə mövcud zəmin səthiniz olmalıdır.

1. {{key:G}} basın, və ya **Dizayn** qrupunda {{ui:Pad}} klikləyin.
   Göstəriş belədir: "Platforma: künclərinə klikləyin. Enter və ya ikiqat klik bitirir, Backspace sonuncunu silir, Esc ləğv edir."
2. Platformanın künclərinə sırası ilə klikləyin, hansı istiqamətdə olsa da. Göstərici ilə mavi kontur hərəkət edir.
3. Son künctən sonra {{key:Enter}} basın (ən azı üç).
   Platforma çəkilir və seçilir. Orta nöqtədəki zəmin hündürlüyündə başlayır, 0.1-ə yuvarlaqlaşdırılmış, 2 : 1 kəsmə yamacı və 3 : 1 doldurma yamacı ilə. Status sətiri məsələn belə deyir: "Platforma 1, hündürlük 254.3 (ortada zəmin), kəsmə 2:1, doldurma 3:1. Dəyişmək üçün Xüsusiyyətlər-ə baxın."

:::warning
Enter ilə bitirin. İkiqat klik də bitirir, lakin bu versiyada ikiqat klik etdiyiniz künci atır. Son künci bir dəfə klikləyin, sonra {{key:Enter}} basın.
:::

Platformanın konturu özünü kəsməməlidir ("Platformanın konturu özünü kəsir.").

## Hündürlüyü və yamacları təyin edin

Platforma seçildikdə sağ paneldə **Platforma** görünür:

1. **Ad**.
2. **Hündürlük**: platformanın düz hündürlüyü.
3. **Kəsmə yamacı** və **Doldurma yamacı**, H:V kimi (2 yəni 2 : 1). İkisi də 0-dan böyük olmalıdır.
4. **Platforma sahəsi** və **Künclər** məlumat üçün göstərilir.

Hər dəyərdən sonra {{key:Enter}} basın. Gün işığı xətti, layihə səthi və həcmlər dərhal yenilənir.

Sahələrin altında belə bir sətir oxunur, məsələn: "Gün işığı xətti: 48 yamac xətti (20 kəsmədə, 28 doldurmada), ən uzaq nöqtə 31.20 ft." Plan gün işığı xəttini və yamac xətlərini magenta rənglə göstərir.

## Gün işığı necə tapılır

- Yamac xətləri hər kənardan ona perpendikulyar çıxır, təxminən platformanın ölçüsünün hər iyirmidə birində.
- Xarici künclərdə hər 10°-dən bir yayılırlar, beləliklə yamac künc ətrafında sarınır.
- Daxili künclərdə bir xətt bissektrisa boyunca gedir, iki kənardan olan yamacların görüşdüyü yerdə.
- Hər xətt zəmini tapana qədər kəsmə yamacı ilə qalxır və ya doldurma yamacı ilə enir.

## Tərəfə görə yamaclar və dayaq divarları

Platforma, bənd və ya tümsəyin Xüsusiyyətlərində **Tərəflər və dayaq divarları** altında hər tərəf öz üsulu ilə planlaşdırıla bilər. Tərəf 1 birinci klik etdiyiniz küncdən ikinciyə, tərəf 2 ikincidən üçüncüyə və s. gedir.

- **Bütün tərəflər**: **Yamaclı** hər tərəfdə yuxarıdakı kəsmə və doldurma yamaclarını istifadə edir; **Şaquli: dayaq divarları** hər tərəfə divar qoyur.
- Hər tərəf üçün: **Yuxarıdakı yamaclar**, **Öz yamacları** (həmin tərəf üçün kəsmə və doldurma yamacı yazın) və ya **Şaquli (dayaq divarı)**.
- Yamacı `3` və ya `3:1` (üfüqi 1 şaquliyə), `33%` və ya `18.4°` kimi yazın; H:1 kimi göstərilir. Platformanın öz **Kəsmə yamacı** və **Doldurma yamacı** eyni cür qəbul edir.
- Şaquli tərəfin yamac torpağı (embankment) yoxdur: dayaq divarı kənar boyunca gedir, platformadan aşağı mövcud zəmininə (doldurmada) və ya zəmindən aşağı platformaya (kəsmədə). **Divarın qalınlığı** (başlanğıcda 0.3 m və ya 1 ft) zəminin platforma kənarından mövcud zəmini tapana qədər nə qədər addım atdığıdır. Həmin tərəfin artıq olmayan yamac torpağının kəsmə və doldurma həcmləri çıxılır.
- Divar yamaclı tərəflə birləşdikdə yamac divarın ucunu sarır; iki divar mitrə ilə birləşir.
- Sahələrin altında: divarların uzunluğu, açıq üz (hündürlük × uzunluq), ən hündür və orta hündürlük.

Plan hər divarın xarici üzünü qısa ticklərlə və hündürlüyünü uclarında və ən hündür yerində göstərir (dayaq divarları qatında, DXF və DWG-yə də daxil olur). 3D görünüş divarları bərk cisim kimi göstərir (Göstər › Dayaq divarları), GLB, OBJ və USD ixracları isə onları daxil edir. Kənar boyunca kəsiklər pilləni göstərir.

**Xəbərdarlıqlar** (Xüsusiyyətlərdə və Problemlər panelində): hündürlüyü **Bu hündürlükdən yuxarı divar** (başlanğıcda 1.0 m və ya 3.3 ft) olan divar "mühəndis divarı və ya icazə tələb oluna bilər; yerli qaydaları yoxlayın" deyir və **Torpağın dura biləcəyi ən dik yamac** yazdığınızda, kəsmə və ya doldurma yamacı ondan dik olan istənilən tərəf. Bunlar xəbərdarlıqdır: planlaşdırma yenə də qurulur. Hər dəyişiklik {{key:Mod+Z}} üçün bir addımdır.

## Künclərin yerini dəyişin

Platformanı seçin, sonra künclərdən birində kvadrat tutacağı dartın. Hər dartma bir geri qaytarma addımıdır. Künc əlavə etmək və ya silmək hələ mövcud deyil: platformanı silin və yenidən çəkin.

## Planlaşdırılmadıqda

**Torpaq işləri** altında qırmızı qutu platformanı və problemi adlandırır:

| Mesaj | Nə etməli |
|---|---|
| "3 yamac xətti səthə çatmazdan əvvəl səthdən kənara çıxır: platforma səthin kənarına çox yaxındır və ya çox yüksək/alçaqdır." | Platformanı səthin kənarından içəri çəkin, və ya hündürlüyünü zəminə yaxınlaşdırın. |
| "Gün işığı xətti özünü kəsir (platformanın fərqli tərəflərindən olan yamaclar bir-birinə girir). Platformanın formasını dəyişin və ya yamacları dəyişin." | Adətən dar və ya L formalı platformalarda dərin kəsmədə və ya yüksək doldurmada olur. Platformanı genişləndirin, fərqi hamarlayın və ya yamacları dikləşdirin. |
| "Platformanın konturu özünü kəsir." | Künclərini platformanın ətrafında sıra ilə yenidən çəkin. |

Problemi olan platforma düzəldilənə qədər layihə səthindən və həcmlərdən çıxarılır.

## Nəticəyə baxın

1. **Göstəriş** altında **Səth** {{ui:Proposed (graded)}} olaraq təyin edin. Horizontallar indi platforma boyunca düz gedir və yamacları gün işığı xəttinə qədər izləyir.
2. Göstəricini platformanın üzərinə gətirin: status sətiri **Zəmin** və **Planlaşdırılmış** hündürlüklərini göstərir.
3. Kəsmə və doldurmanı **Torpaq işləri** altında oxuyun; bax: [Torpaq həcmləri](topic:volumes).

Platformalar çəkildikləri sıra ilə, koridorlardan sonra planlaşdırılır. Sonrakı platforma öz gün işığı xətti daxilində əvvəlkini əvəz edir.

## Platformanı silin

Seçin və {{key:Delete}} basın (Mac-də Fn və delete), və ya {{ui:Delete}} klikləyin.

## Hələ hazır deyil

Platformalar düzdür: meylli platformalar, dəyişən yamaclı xarakterik xətlər, pillələr (benches) və məsafə və ya hündürlük hədəfinə planlaşdırma hələ mövcud deyil. Bax: [Hələ hazır deyil](topic:not-built-yet).
