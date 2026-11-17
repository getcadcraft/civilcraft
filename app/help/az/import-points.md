---
title: Planalma nöqtələrini idxal et
summary: CSV və ya mətn nöqtə faylı açın, Nöqtələri idxal et dialoqunda sütun ardıcıllığını yoxlayın, oxuna bilməyən sətirləri düzəldin və nöqtələri qruplara ayırın.
keywords: nöqtələri idxal et, csv, txt, pnezd, penzd, nöqtə faylı, planalma, cogo nöqtələri, nöqtə qrupları, sütunlar, şimal, şərq
from: ad33d88a
---

Nöqtə faylı hər sətirdə bir nöqtəli mətn faylıdır: nöqtə nömrəsi, şimal, şərq, hündürlük və təsvir hər hansı sırada, vergül, tabulyasiya, nöqtəli vergül və ya boşluqla ayrılmış. CivilCraft onu brauzerdə oxuyur və dərhal ondan səth qurur.

## Başlamazdan əvvəl

- Mümkünsə faylın sütun ardıcıllığını bilin (PNEZD və PENZD kompüter üçün eynidir).
- Vahidlərini bilin. CivilCraft çevirmir: sol paneldə **Vahidlər**i fayla uyğun təyin edin (bax: [Vahidlər, stansiyalar və ədəd formatları](topic:units-and-stations)).
- Koordinatlar böyük ola bilər (dövlət müstəvi şimal və şərqləri milyonlarla olsa da normaldır).

## Faylı idxal edin

1. Alətlər panelində {{ui:Open}} düyməsinə klik edin və ya {{key:Mod+O}} basın və faylı seçin. Onu planın üzərinə də sürükləyə bilərsiniz.
   **Nöqtələri idxal et** dialoqu fayl adı, defoltda {{ui:Detect}} olan **Sütunlar** siyahısı, xülasə sətiri və ilk altı nöqtə ilə açılır.
2. Xülasə sətirini oxuyun. Neçə nöqtənin oxunduğunu, hansı sütun ardıcıllığında, bu ardıcıllığın necə tapıldığını və sütunları nəyin ayırdığını göstərir. Ardıcıllığın tapılma üç yolu var:
   - "başlıq sətirindən": ilk sətir sütunlarını adlandırır (Point, Northing, Easting, Elevation, Description, və ya X, Y, Z …). Bu ən təhlükəsizdir.
   - "seçilmiş kimi": **Sütunlar**-da ardıcıllığı özünüz seçmisiniz.
   - "sütun sayından və nöqtə sətri parametrindən (PNEZD) təxmin edilib — şimal və şərqin yerdəyişmədiyini yoxlayın": istifadə oluna bilən başlıq yox idi. Fayllarınız adətən əvvəl şərqlə başlayırsa, [CivilCraft parametrləri](topic:settings)-də **Nöqtə sətirləri**ni P, E, N, Z, D təyin edin.
3. Önizləmə cədvəlini yoxlayın. Sütunları həmişə **Nöqtə**, **Şimal**, **Şərq**, **Hündürlük**, **Təsvir** olur, fayl hansı ardıcıllıqda olmasından asılı olmayaraq. Real sahənin şimal və şərqləri adətən aydın fərqli ölçüdədir: yerdəyişmiş görünürsə, təxmin yanlış olub.
4. Sıra səhvdirsə, **Sütunlar**-da düzgününü seçin (məsələn {{ui:PENZD — point, easting, northing, elevation, description}}). Xülasə və önizləmə dərhal yenilənir.
5. Önizləmənin altında **Oxunmayan sətirlər**ə baxın. Hər sətir fayl sətir nömrəsini, səbəbi və sətirin başlanğıcını göstərir. Bax: [Oxunmayan sətirlər](topic:import-points#rows-that-are-not-read).
6. {{ui:Import}} düyməsinə klik edin.
   Nöqtələr planda görünür, görünüş onlara yaxınlaşır və səth qurulur. Status paneli, məsələn, deyir: "276 nöqtə site.csv faylından idxal edildi; səth: 546 üçbucaq."

Layihənin adı yoxdursa, fayl adını alır.

## Qrupları yoxlayın

Hər nöqtə təsvirinin **birinci sözü** ilə adlandırılmış qrupa aiddir, böyük hərflərlə: "GRD", "FL 12" və "fl" qrupları GRD, FL və FL-dir. Təsviri olmayan nöqtələr "(təsvir yoxdur)" qrupuna düşür.

1. Sol paneldə **Nöqtələr** altındakı cədvələ baxın: qrup, nöqtələrin sayı və **Səth** seçimi.
2. Hər qrup {{ui:Points}} kimi başlayır. Axın xətlərini, döşəmə kənarlarını, yamacın üstünü və altını, silsilələri və oxşar kodlaşdırılmış xətləri {{ui:Breakline}} edin. Yeri formalaşdırmamalı olan qrupları (nəzarət nöqtələri, ağac təpələri, üstdən ölçülmüş kommunal dirəklər) {{ui:Left out}} edin.
3. Planda nöqtəyə ({{ui:Select}} ilə) klik edin ki, sağ paneldə onun nömrəsini, koordinatlarını, hündürlüyünü, təsvirini və qrupunu görün.

:::warning
Sınma xətti qrupu **bütün** nöqtələrini nöqtə nömrəsi sırası ilə **bir** xəttə birləşdirir. Hər kodlaşdırılmış xətt öz kodu ilə sıra ilə ölçüldükdə bu işləyir. İki ayrı axın xətti hər ikisi "FL" kodu ilə olarsa, onlar arasında zikzak edən bir xətt olur. Kodlarınız paylaşılırsa, hər xəttin nöqtələrinə klik etmək üçün {{ui:Breakline}} alətindən istifadə edin (bax: [Səthi qurun və təkmilləşdirin](topic:build-surface)).
:::

## Oxunmayan sətirlər

| Göstərilən səbəb | Bu nə deməkdir | Nə etmək |
|---|---|---|
| "şimal və ya şərq ədəd deyil" | Koordinat sütununda mətn var | Sütun ardıcıllığını yoxlayın və ya faylın ortasında yersiz mətn sətri |
| "hündürlük ədəd deyil" | Hündürlük sütununda mətn var | Yanlış sütun ardıcıllığı və ya hündürlük sütununda təsvir |
| "nöqtə nömrəsi yoxdur" | Nöqtə sütunu boşdur | Nöqtəyə nömrə verin, və ya P olmayan ardıcıllıq seçin (NEZD, NEZ …): nöqtələr onda 1, 2, 3 … ilə nömrələnir |
| "nöqtə 12 iki dəfə görünür (birinci saxlanılır)" | İki sətir eyni nömrəni paylaşır | Hər ikisi real ölçü olsa, faylda birini yenidən nömrələyin |
| "3 sütun, 5 gözlənilir (PNEZD)" | Sətir qısadır | Pozulmuş xətt və ya yanlış sütun ardıcıllığı |

Hündürlüyü boş olan nöqtə saxlanılır, lakin səthdə istifadə olunmur. **Nöqtələr** göstəriciləri hündürlüyü olan nöqtələrin sayını göstərir.

`#`, `;` və ya `//` ilə başlayan sətirlər şərhdir və keçilir. Boş sətirlər keçilir.

## Nöqtələri əvəz edin və ya əlavə edin

Yenidən idxal bütün nöqtələri **əvəz edir**; onlara əlavə etmir. Trassalarınız, platformalarınız, borularınız, çəkdiyiniz sınma xətləriniz və sərhədiniz qalır. Geri alma tarixçəsi təmizlənir, buna görə köhnə nöqtələri geri istəyə bilərsinizsə əvvəlcə layihəni saxlayın. İki faylı birləşdirmək üçün idxal etməzdən əvvəl mətn redaktorunda və ya cədvəldə birləşdirin (təkrarlanan nöqtə nömrələrinə diqqət edin).

Nöqtələri CivilCraft daxilində hələ köçürmək, redaktə etmək və ya silmək olmur. Onları faylda düzəldin və yenidən idxal edin.

## Əlaqəli

- [Nöqtə faylı formatları](topic:point-file-formats): hər sütun ardıcıllığı və başlıqların necə tanındığı.
- [Səthi qurun və təkmilləşdirin](topic:build-surface).
