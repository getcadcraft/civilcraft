---
title: Nümunə xətləri və eninə kəsiklər
summary: Trassaya düz kəsiklər kəsin, hər pikitdə yer səthini, layihəni və kəsim/doldurmanı görün və orta son sahələrlə həcmləri alın.
keywords: kütlə daşınması, kütlə diaqramı, balans nöqtəsi, sıxılma, şişmə, daşıma məsafəsi, gətirmə, tullantı, kəsik vərəqləri, eninə kəsik vərəqləri, kəsiklər pdf, kəsiklər, eninə kəsiklər, nümunə xətləri, kəsik görünüşü, kəsim, doldurma, sahələr, orta son sahə, son sahə həcmləri, torpaq işləri, pikit, ofset, csv
from: 5060173c
---

Eninə kəsik yolun trassaya düz, bir pikitdə necə qurulacağını göstərir: mövcud yer səthi, layihə (dəhliz və ya platforma daxil edilmiş) və aralarındakı kəsim və doldurma.

## Nümunə xətləri əlavə edin

1. Trassa seçin. **Xüsusiyyətlər**də, **Nümunə xətləri** altında {{ui:Add sample lines}} klikləyin.
2. **Hər** (aralıq: başlanğıcda 50 ft və ya 20 m), **Sol en** və **Sağ en** təyin edin (hər kəsik mərkəz xəttindən nə qədər uzanır).
3. Müəyyən pikitdə kəsik üçün **Pikit əlavə et** sahəsinə yazın (məsələn `2+35`) və {{key:Enter}} basın.

Kəsiklər aralığın hər tam qatında, trassanın hər iki ucunda, hər əyrinin başlanğıcında və sonunda (PC və PT) və əlavə etdiyiniz pikitlərdə kəsilir. Nümunə xətləri planda trassanın üzərindən keçən boz xətlər kimi göstərilir; onlar həmçinin DXF, DWG və PDF-də C-ROAD-SCTN təbəqəsində çıxır. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

## Kəsik görünüşü

{{ui:Section view}} ilə açın: trassanın **Xüsusiyyətlər**ində, **Səth** › {{ui:More}} altında {{ui:Sections}}, ya da {{key:X}}. O, planın altındakı profil görünüşünün yerini tutur.

- Onun panelindəki oxlarla, pikit siyahısı ilə və ya kəsik görünüşü fokusda ikən {{key:Left}} və {{key:Right}} ilə kəsikləri irəli-geri keçin ({{key:Home}} və {{key:End}} ilk və son üçün).
- Boz xətt mövcud yer səthi, qırmızı xətt layihədir. Kəsim narıncı, doldurma yaşıl kölgələnir. Dəhliz nöqtələri işarələnir: CL (mərkəz xətti), EOP (asfalt kənarı), SH (çiyin) və DL (təmas).
- Başlıqda pikit, bu kəsiyin kəsim və doldurma sahələri və şaquli şişirtmə göstərilir. **Sığdır** paneli doldurur; həqiqi miqyasda görmək üçün 1× seçin.
- Planda qalın xətt ekranda hansı kəsiyin olduğunu göstərir.

## Kəsik vərəqləri

{{ui:Section sheets (PDF)}} **Nümunə xətləri** altında hər kəsiyi PDF səhifələrində, pikit sırası ilə soldan sağa və yuxarıdan aşağıya sıralar şəklində qoyur. **Kağız**, **Plan miqyası** (kəsiklərin üfüqi miqyası) və **Profil şişirtməsi** (1×, 2×, 5× və ya 10×) seçin; dialoq səhifəyə neçə kəsiyin sığdığını və neçə səhifə alınacağını göstərir.

Hər kəsik ölçü şəbəkəsi, ofsetlər və yüksəkliklərlə göstərilir; yer (xətli), layihə, kəsim və doldurma (narıncı və yaşıl kölgə), dəhliz nöqtələri, altında isə pikit və kəsim və doldurma sahələri. Vərəqlərdəki hər kəsik ən böyüyünə uyğun eyni ölçüdə çəkilir; bu sizin şişirtmənizlə səhifəyə sığmadıqda CivilCraft ən böyük sığan ölçünü seçir və bunu bildirir. Başlıq zolağı trassanın adını, həmin səhifədəki pikitləri, miqyasları və "Vərəq 1 / 3" yazır.

## Orta son sahələrlə həcmlər

İki qonşu kəsik arasında həcm, onların iki sahəsinin ortası ilə pikitləri arasındakı məsafənin hasilidir. Zolaq trassa üçün cəmləri göstərir və {{ui:CSV}} hər kəsiyin sahələrini və həcmlərini işləyən cəmlərlə yükləyir (fut layihələri üçün kubik yard, metrik olanlar üçün kubik metr).

**Xüsusiyyətlər** eyni cəmləri [Torpaq həcmləri](topic:volumes) bölməsindən şəbəkə üsulu həcmləri ilə yanında göstərir. İkisi fərqli yaxınlaşmalardır: daha sıx kəsiklər onları yaxınlaşdırır, düz yolda və düz yerdə isə eynidirlər.

:::note
Kəsim və doldurma yalnız işlənmiş sahələrdə (dəhlizin və ya platformanın təmas xətləri daxilində) sayılır, şəbəkə üsulu kimi. Dəhliz və ya platforma olmadan layihə yerin özüdür, buna görə kəsik heç bir kəsim və ya doldurma göstərmir.
:::

## Kütlə daşınması

**Nümunə xətləri** altında **Kütlə daşınması** eyni son sahə həcmlərindən kütlə daşınma diaqramını çəkir: pikitlər boyunca kəsimin işləyən cəmi, doldurmadan çıxılmış.

- **Kəsimin sıxılması (−) və ya şişməsi (+)** kəsimin bir kubik yardının doldurma olaraq nə verdiyini bildirir: −10 % (başlanğıc qiymət, yer tutucu) onun 0.9-a sıxılması deməkdir; şişən qaya +5 % ola bilər. Geotexniki hesabatınızın rəqəmini istifadə edin.
- Xəttin yüksəldiyi yerdə yol kəsimdədir; düşdüyü yerdə doldurmadadır. Sıfırın üstündə (narıncı kölgəli) torpaq pikit üzrə yuxarı, altında (yaşıl) aşağı daşınır.
- **Balans nöqtələri** xəttin sıfırı kəsdiyi yerlərdir: onların iki arasındakı hissədə kəsim və doldurma tarazlaşır. Cədvəl hər balanslı hissəni, daşınan həcmi (onun ən yüksək və ya ən aşağı nöqtəsi) və orta daşıma məsafəsini (kölgəli sahə bu həcmə bölünür) sadalayır.
- Xətt sıfırdan kənarda bitdikdə, qalan hissə **tullantı** (yuxarıda) və ya **gətirmə** (aşağıda) olur. Həmin son hissədə yalnız bitdiyi səviyyədən kənardakı torpaq daşınmış sayılır.

**CSV** hər kəsikdə kütlə ordinatını, hissələri və əmsalı saxlayır.
