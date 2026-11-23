---
title: Nümunə xətləri və eninə kəsiklər
summary: Trassaya düz kəsiklər kəsin, hər pikətdə zəmini, layihəni, kəsmə və doldurmanı görün və orta uc sahələri ilə həcmləri alın.
keywords: kütlə daşınması, kütlə diaqramı, balans nöqtəsi, sıxılma, şişmə, daşınma məsafəsi, götürmə, tullantı, kəsik vərəqləri, eninə kəsik vərəqləri, kəsiklər pdf, kəsiklər, eninə kəsiklər, nümunə xətləri, kəsik görünüşü, kəsmə, doldurma, sahələr, orta uc sahəsi, uc sahəsi həcmləri, torpaq işləri, piket, ofset, csv
from: 09639ce2
---

Eninə kəsik yolu tikiləcəyi kimi göstərir: trassanı bir pikətdə kəsən, mövcud zəmini, layihəni (korridor və ya platforma salınmış) və aralarındakı kəsmə və doldurmanı.

## Nümunə xətləri əlavə edin

1. Trassa seçin. **Xüsusiyyətlər**də, **Nümunə xətləri** altında {{ui:Nümunə xətləri əlavə et}} klikləyin.
2. **Aralıq** (başlanğıc: 50 ft və ya 20 m), **Sol en** və **Sağ en** təyin edin (hər kəsik mərkəz xəttindən nə qədər uzanır).
3. Müəyyən pikətdə kəsik üçün **Pikət əlavə et** sahəsinə yazın (məsələn `2+35`) və {{key:Enter}} basın.

Kəsiklər aralığın hər tam misli ilə, trassanın hər iki ucunda, hər əyrinin başlanğıcında və sonunda (PC və PT) və əlavə etdiyiniz piketlərdə kəsilir. Nümunə xətləri planda trassanı kəsən boz xətlər kimi göstərilir; onlar həmçinin DXF, DWG və PDF-ə C-ROAD-SCTN qatında gedir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} geri qaytarır.

## Kəsik görünüşü

Onu açmaq üçün trassanın **Xüsusiyyətləri**ndə {{ui:Kəsik görünüşü}}, **Səth** › {{ui:Daha çox}} altında {{ui:Kəsiklər}}, və ya {{key:X}}. O, plan altında profil görünüşünün yerini tutur.

- Kəsiklər arasında panelin oxları, stansiya siyahısı və ya kəsik görünüşü fokusda ikən {{key:Left}} və {{key:Right}} ilə addımlayın ({{key:Home}} və {{key:End}} birinci və son üçün).
- Boz xətt mövcud zəmin, qırmızı xətt layihədir. Kəsmə narıncı, doldurma yaşıl kölgəlidir. Korridor nöqtələri işarələnir: CL (mərkəz xətti), EOP (örtük kənarı), SH (çiyin) və DL (daylight).
- Başlıq piketi, bu kəsiyin kəsmə və doldurma sahələrini və şaquli böyütməni göstərir. **Sığdır** paneli doldurur; 1× seçin ki, kəsiyi miqyasda görəsiniz.
- Planda qalın xətt ekranda hansı kəsiyin olduğunu göstərir.
- **Böyütmə və sürüşdürmə:** təkər göstəricinin ətrafında böyüdür, sürükləmək görünüşü hərəkət etdirir. {{ui:Sığdır}} (və ya {{key:F}}, və ya iki klik) bütün kəsiyi yenidən sığdırır.

## Kəsikdə ölçmə

1. Kəsik panelində {{ui:Ölç}} klikləyin, və ya {{key:M}} basın. İşarə deyir: "Birinci nöqtəyə, sonra ikinciyə klikləyin."
2. İki nöqtəyə klikləyin. Hər biri xəttin ucuna və ya korridor nöqtəsinə (CL, EOP, SH, DL) yapışır; sərbəst nöqtə üçün {{key:Alt}} saxlayın.
3. Oxunuş üfüqi məsafəni (ΔH), şaquli məsafəni (ΔV), faiz meylini nisbəti ilə və düz uzunluğunu layihənin vahidlərində verir.

Yenidən başlamaq üçün yenə klikləyin. {{key:Esc}} onu təmizləyir, {{key:M}} Ölçməni söndürür.

## Kəsik vərəqləri

{{ui:Kəsik vərəqləri (PDF)}} **Nümunə xətləri** altında hər kəsiyi PDF səhifələrinə qoyur, sətir-sətir soldan sağa və yuxarıdan aşağıya piket sırası ilə. **Kağız**, **Plan miqyası** (kəsiklərin üfüqi miqyası) və **Profil böyütməsi** (1×, 2×, 5× və ya 10×) seçin; dialoq hər səhifədə neçə kəsiyin sığdığını və neçə səhifə alındığını deyir.

Hər kəsik ofsetləri və hündürlükləri olan şəbəkəni, zəmini (kəsikli), layihəni, kəsmə və doldurmanı (narıncı və yaşıl) korridor nöqtələri ilə göstərir və altında onun pikətini və kəsmə-doldurma sahələrini. Vərəqlərdəki bütün kəsiklər eyni ölçüdə çəkilir, ən böyük üçün kifayət qədər hündür; bu sizin böyütmənizdə səhifəyə sığmadıqda, CivilCraft sığan ən böyüyünü götürür və bunu deyir. Başlıq zolağı trassanı, həmin səhifədəki piketləri, miqyasları və "Vərəq 1 / 3"-ü göstərir.

## Kəsmə və doldurma nəyə ölçülür

Korridorun asfaltın altında təbəqələri ola bilər: yol örtüyü təbəqələri, şablon komponentləri, yol. **Kəsik panelində** **Həcmlər nəyə ölçülür** seçin ki, kəsmə və doldurma nəyə qədər getsin:

- **Aşağı səth** (başlanğıc): bu komponentlərin aşağısına, buna görə kəsmə yol örtüyünün dərinliyini də əhatə edir.
- **Yuxarı səth**: yalnız layihənin yuxarısına, komponentlər əvvəllər sayıldığı kimi.

Başlıqdakı sahələr, aşağıdakı həcmlər, CSV və kütlə daşınması hamısı bu seçimi izləyir və layihə ilə birlikdə saxlanılır.

## Orta uc sahələri ilə həcmlər

İki qonşu kəsik arasında həcm iki sahənin ortasıdır, pikətləri arasındakı məsafə ilə vurulmuş. Panel trassa üzrə cəmləri göstərir və {{ui:CSV}} hər kəsiyin sahələrini və həcmlərini qaçan cəmlərlə yükləyir (fut layihələri üçün kubik yard, metrik layihələr üçün kubik metr).

**Xüsusiyyətlər** eyni cəmləri [Torpaq işlərinin həcmləri](topic:volumes)-dəki şəbəkə üsulu həcmlərinin yanında göstərir. İkisi müxtəlif təxminlərdir: kəsiklər yaxınlaşdıqca yaxınlaşırlar, düz yolda və düz zəmində isə eynidirlər.

:::note
Kəsmə və doldurma yalnız işlənmiş sahələrin daxilində sayılır (korridorun və ya platformanın daylight xətləri), şəbəkə üsulunda olduğu kimi. Korridor və ya platforma olmadan layihə zəminin özüdür, buna görə kəsik kəsmə və ya doldurma göstərmir.
:::

## Kütlə daşınması

**Nümunə xətləri** altında **Kütlə daşınması** eyni orta uc həcmlərindən kütlə diaqramını çəkir: piketlər boyunca, kəsmənin cəmi doldurmadan çıxılması.

- **Kəsmənin sıxılması (−) və ya şişməsi (+)** bir kubik yard kəsmənin doldurma olaraq yerləşdirildikdə nə etdiyini deyir: −10 % (başlanğıc dəyər, yer tutucu) 0.9-a sıxıldığını bildirir; şişən qaya +5 % ola bilər. Geotexniki hesabatınızın rəqəmini istifadə edin.
- Xətt qalxdıqda yol kəsmədədir; düşdükdə doldurmadadır. Sıfırdan yuxarı (narıncı kölgə) torpaq piketə doğru hərəkət edir; sıfırdan aşağı (yaşıl), aşağı piketə doğru.
- **Balans nöqtələri** xəttin sıfırı kəsdiyi yerlərdir: onların iki arasında kəsmə və doldurma balanslaşır. Cədvəl hər balanslı hissəni, köçürülmüş həcmi (onun ən yüksək və ya ən aşağı nöqtəsi) və orta daşınma məsafəsini (kölgəli sahənin həmin həcmə bölünməsi) sadalayır.
- Xəttin sıfırdan kənar bitdiyi yerdə qalan **tullantı** (yuxarıda) və ya **götürmə** (aşağıda) olur. Bu son hissədə yalnız bitdiyi səviyyədən kənardakı torpaq köçürülmüş sayılır.

**CSV** hər kəsikdə kütlə ordinatını, hissələri və amili saxlayır.
