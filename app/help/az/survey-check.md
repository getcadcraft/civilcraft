---
title: İdxal zamanı planalma çertyojunu yoxlayın
summary: Mətn və ya blok atributlarında yazılmış hündürlükləri planalma nöqtələri kimi oxuyun, DWG və ya DXF-i səhv vahidlər, koordinat sistemi olmaması, başlanğıcdan uzaqlıq, düz horizontallar, qəribə hündürlüklər və ikiqat nöqtələr üçün yoxlayın, sonra ondan relyef qurmazdan əvvəl.
keywords: planalma yoxlaması, idxal yoxlaması, planalma hündürlükləri, nöqtə hündürlükləri, mətn hündürlükləri, hündürlüklər mətn kimi, atributlar, vahidlər, koordinat sistemi, başlanğıcdan uzaq, sıfırda horizontallar, kənar qiymətlər, təkrar nöqtələr, problemlər, landşaft memarı, planalma çertyoju
from: d46acd24
---

Planalma çertyoju düzgün görünə bilər, amma relyef üçün səhv ola bilər: vahidləri təxmin olunmuş ola bilər, horizontalları 0 hündürlükdə düz ola bilər, ya da hündürlükləri heç bir həndəsə olmayan mətn kimi yazılmış ola bilər. {{ui:Linework}} dialoqunun **Planalma hündürlükləri və yoxlama** bölməsi (bax [DWG və ya DXF-i xətt kimi açmaq](topic:open-dwg-dxf)) həmin hündürlükləri oxuyur və heç nə əlavə edilməzdən əvvəl nəyin səhv göründüyünü deyir.

## Mətn və ya atribut şəklində yazılmış hündürlüklər

Bir çox planalma çertyojları nöqtə hündürlüyünü xaçın yanında kiçik mətn kimi verir, məsələn `104.37` və ya `EL 104.37`, ya da nöqtə blokunun atributu kimi. Bunlar xətt deyil, buna görə xətt oxuyucusu onları buraxır. Bölmə neçə belə tapıldığını siyahıya salır və onları **planalma nöqtələri** kimi götürməyə imkan verir:

1. **… hündürlüyü planalma nöqtəsi kimi götür** qutusunu işarələyin. Başlanğıcda işarəsizdirlər, çünki çertyojdakı hər rəqəm hündürlük deyil.
2. Mətn yalnız öz-özlüyünə hündürlük olduqda oxunur: onluq hissəsi olan ədəd (`104.37`, `+104,37`, `-3.50`), ya da `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` və ya `LEVEL`-dən sonra gələn ədəd, sonunda istəyə görə `m`, `ft` və ya `'` ilə. Tək tam ədəd (`12`) hündürlük yox, sahə və ya vərəq nömrəsi kimi oxunur; `GATE 3` kimi mətn və ya tarix heç vaxt oxunmur. Mətn formatlama kodları nəzərə alınmır.
3. Blok atributları üçün **Hündürlüyü saxlayan blok atributu** seçin. CivilCraft ELEV, Z, LEVEL, RL və ya oxşar adlı etiketi özü tapır; çertyoj öz etiketini istifadə edirsə, siyahıdan başqasını seçin. Seçim bu kompüterdə həmin fayl adı üçün yadda saxlanılır, buna görə onu yenidən açanda eyni etiketdən başlayır. Seçdiyiniz etiket tam ədədləri də hündürlük kimi qəbul edir.
4. {{ui:Add}} düyməsinə basın. Nöqtələr layihədəki ən böyük nömrədən sonra nömrələnir, hər nöqtə öz qatı (və ya blokunun) ilə təsvir olunur, hündürlüklər çertyojun qalan hissəsi kimi layihənin vahidlərinə çevrilir. Bütün bunlar bir addımdır: {{key:Mod+Z}} nöqtələri silir.

Mətn öz daxiletmə nöqtəsində (və ya varsa, düzləmə nöqtəsində) yerləşir. Blokların içindəki mətn oxunmur və çertyoj heç vaxt dəyişdirilmir.

## Yoxlama

Yoxlama idxal etmək üzrə olduğunuz şey üzərində işləyir və tapdığını siyahıya salır, hər problem növü üçün bir sətir:

| Deyir | Nə demək olduğu |
|---|---|
| **Vahidlər göstərilməyib** | Çertyoj vahidlərinin nə olduğunu demir, buna görə onun ədədləri layihənin vahidləri kimi oxunur. Bildiyiniz bir məsafəni yoxlayın. |
| **Vahidlər çevrilib** | Çertyojun vahidləri layihənin vahidlərindən fərqlənir və miqyaslanır (qeyd, nöqsan deyil). |
| **Məlumat … km** və ya **… m** əhatə edir | Əhatə 200 km-dən böyük və ya yarım metrdən kiçikdir, bu adətən səhv vahid deməkdir (millimetrlər metr kimi oxunub, ya da əksinə). |
| **Koordinat sistemi yoxdur** | Layihədə heç biri yoxdur. Məlumat sıfırdan uzaqda olanda xəbərdarlıqdır, dövlət müstəvi və ya milli şəbəkə koordinatlarında olduğu kimi. Bax [Koordinat sistemləri](topic:coordinate-systems). |
| **Başlanğıcdan uzaqdır** | Məlumat sıfırdan 100 km-dən çox uzaqdadır. Sıfırdan uzaqda 3D görünüşlər və ixrac dəqiqliyi itirir və titrəyir. |
| **Horizontal qatı … hündürlüyə malik deyil** | Horizontallara oxşar adlı qat (TOPO, CONT, CNTR, CONTOUR) 0 hündürlükdə xətləri saxlayır, buna görə onlardan qurulan relyef düz olardı. |
| **Hündürlüklər dəqiq 0-dır** | Bəzi hündürlüklər 0-dır, halbuki adi hündürlük ondan uzaqdır: ehtimal ki, hündürlüklər itib. |
| **Hündürlüklər qalanlardan uzaqdır** | Bir neçə hündürlük digərlərindən çox kənardadır (bütün hündürlüklərin ortasına görə tapılır, buna görə geniş diapazonlu dik sahə işarələnmir), ya da 9,000 m-dən yuxarı və ya -11,000 m-dən aşağı. |
| **Nöqtə başqa nöqtənin üstündədir** | Eyni yerdə olan iki nöqtə, eyni və ya fərqli hündürlüklə. |

{{ui:Add}} basdıqdan sonra eyni sətirlər **Problemlər**ə göndərilir, hər növ üçün bir, fayl adı ilə, ki, onlara qayıdasınız. Yoxlama çertyoju qiymətləndirir; onda heç nəyi dəyişmir və çertyojdan istifadə etməyinizə mane olmur.

:::tip
Yoxlama horizontalların 0-da düz olduğunu və mətn kimi yazılmış hündürlüklər olduğunu deyəndə, hündürlükləri planalma nöqtələri kimi götürün: onlar çox vaxt horizontal xətlərin olmadığı real hündürlükləri daşıyır.
:::

## Nə yoxlanmır

Yoxlama çertyoju ikinci planalma ilə müqayisə etmir və çertyojun hansı koordinat sistemində olduğunu deyə bilmir: yalnız heç birinin təyin olunmadığını deyir.
