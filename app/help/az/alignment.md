---
title: Üfüqi trassa planlayın
summary: Trassanı PI-lər ilə çəkin, əyri radiuslarını və başlanğıc piketi təyin edin, PI-ləri köçürün və əyri məlumatlarını, piketi və ofseti oxuyun.
keywords: trassa, həll yoxdur, əyri sığmır, ən böyük radius, ən kiçik radius, minimum radius, layihə sürəti, üst-üstə düşmə, mərkəz xətti, pi, üfüqi əyri, radius, piketləmə, tangens, trassa yaratmaq, trassa planlaması, pc, pt, piket ofset
from: 8c5df4aa
---

CivilCraft-da trassa PI-lər (kəsişmə nöqtələri) vasitəsilə tangenslər zənciridir; radiusu olan istənilən daxili PI-də dairəvi əyri var. O, seçdiyiniz başlanğıc piketdən hesablanır. Layihədə bir neçə trassa ola bilər.

## Trassanı çəkin

1. {{key:A}} basın və ya **Layihə** qrupunda {{ui:Trassa}} klikləyin.
   İpucu deyir: "Trassa: PI-ləri ardıcıl klikləyin. Enter və ya ikiqat klik bitirir, Backspace sonuncunu silir, Esc ləğv edir."
2. İlk PI-ə klikləyin (trassanın başlanğıcı).
3. Hər sonrakı PI-ə ardıcıl klikləyin. Qırmızı xətt göstəricini izləyir və çəkdiyiniz tangensin uzunluğunu və istiqamətini göstərir, məsələn "212.40 ft  N 63°12'05" E".
4. Son PI-ə klikləyin (trassanın sonu).
5. {{key:Enter}} basın.
   Trassa piketləri ilə çəkilir və seçilir. Status sətri məsələn deyir: "Trassa 1: 386.36 ft, uyğun gələn yerlərdə 100 ft radiuslu əyrilər. Radiusları Xassələrdə redaktə edin; Profil (R) ilə onun meylini layihələndirin."

Çəkərkən: {{key:Backspace}} son PI-ni silir, {{key:Esc}} ləğv edir, boş yerdə sürükləmək PI əlavə etmədən planı sürüşdürür.

:::warning
{{key:Enter}} ilə bitirin. İkiqat klik də bitirir, lakin bu versiyada ikiqat klik etdiyiniz PI-ni silir. Son PI-ə bir dəfə klikləyin, sonra {{key:Enter}} basın.
:::

Hər daxili PI 100 ft əyri alır (metrik layihədə 30 m), və ya 100 ft sığmırsa, hər tangensin yarısına sığan ən böyük tam radius. Çox kəskin və ya düz keçən PI-lər əyri almır.

## Radiusları və koordinatları təyin edin

Trassa seçili olduqda sağ panel **Trassa** göstərir:

1. **Ad** və **Başlanğıc piket**. Pikedi `10+00` (fut) və ya `0+500` (metr) kimi, ya da sadə rəqəm kimi yazın. Bax [Vahidlər, piketlər və rəqəm formatları](topic:units-and-stations).
2. **Uzunluq** və **Son piket** sizin üçün hesablanır.
3. **PI-lər** cədvəli hər PI-nin **Şərq** və **Şimal** koordinatlarını və hər daxili PI üçün **Radius**-u göstərir. Yeni dəyər yazın və {{key:Enter}} basın.
   - Radius 0 olduqda əyrisiz bucaq nöqtəsi olur.
   - İlk və son PI-lərin heç vaxt radiusu olmur.
   - Sətrin sonundakı kiçik x həmin PI-ni silir (trassada ən azı iki PI qalır).
4. **Əyrilər** siyahısına baxın: hər əyri üçün PC və PT piketləri, R radiusu, Δ meyl bucağı və istiqamət (sol və ya sağ), L uzunluq, T tangens, E xarici məsafə və xord.
5. Əyrilərin altındakı xətt birinci tangensin istiqamətini verir.

## Əyri sığmadıqda

Əyrilər PI-lər arasında olandan çox tangens tələb etdikdə trassanın həlli yoxdur: düzəltənə qədər düzgün çəkilmir və LandXML ixracından kənarda qalır. Qırmızı qutu səbəbi rəqəmlərlə deyir və nəyin sığacağını təklif edir:

- "PI 2 və PI 3-dəki əyrilər aralarında 240.00 ft tangens tələb edir (130.00 + 110.00), lakin PI-lər 180.00 ft məsafədədir." — və ya yalnız biri əyriyə malikdirsə, "PI 2-dəki əyri PI 1-ə doğru 240.00 ft tangens tələb edir …".
- Hər PI üçün düymə, digər əyri olduğu kimi qaldıqda, o yerə sığan **ən böyük radiusu** təyin edir (PI-nin digər tangensinə də sığmalıdır). Hər iki PI-də əyri varsa, **Hər ikisi** iki radiusu mütənasib olaraq kiçildir ki, tam birləşsin.
- Tək bir əyri tangensdən uzun olduqda qutu deyir ki, o qədər böyük olduqda digər PI-də heç bir əyri sığmır.
- Geriyə dönən PI əyri ala bilməz; qutu **PI n-də əyri yoxdur** təklif edir.

Hər düymə bir addımdır: {{key:Mod+Z}} radiusları geri qaytarır. Təklif olunan radiuslar həmişə sığsın deyə 0.01-ə aşağı yuvarlaqlaşdırılır.

### Layihə minimum radiusu

**Layihə minimum radiusu** yazın (məsələn layihə sürətinizdən), ki, hər əyri ona görə yoxlansın; boş qoysanız heç nə yoxlanmır. Ondan kiçik əyri siyahıda **minimumu ödəyən ən kiçik radius** düyməsi ilə göstərilir, o radius sığdıqda. Sığmadıqda qutu bunu deyir və tangenslərə icazə verilən ən böyük radiusu göstərir ki, PI-ni köçürməyi və ya minimumu aşağı salmağı biləsiniz.

## PI-ləri planda köçürün

1. **Seç** aktiv olduqda trassaya klikləyib onu seçin. PI-lərində kvadrat tutacaqlar görünür.
2. Tutacağı sürükləyin. Trassa, piketləri, profili və koridoru ardınca gəlir.
3. Buraxın. Köçürmə bir geri alma addımıdır.

İki mövcud PI arasında yeni PI əlavə etmək hələ mümkün deyil: trassanı silin və yenidən çəkin, ya da sahib olduğunuz PI-lər üçün yeni koordinatlar yazın.

## Piketi və ofseti oxuyun

Göstəricini planın üzərinə aparın. Status sətri ən yaxın trassanı (və ya seçiliyi) piket və ofset ilə göstərir, **L** və ya **R** piketə doğru baxarkən, məsələn "Trassa 1: Piket 2+15.30, ofset 18.42 R". Hər iki ucdan kənarda "(uc nöqtədən kənarda)" əlavə olunur.

## Nə çəkilir

Planda, DXF-də və PDF-də: mərkəz xətti (tangenslər xətt kimi, əyrilər həqiqi qövs kimi), hər 50 ft (20 m) bir işarə, hər 100 vahiddən bir uzun işarə və piket etiketi, PC və PT işarələri öz piketləri ilə etiketlənmiş.

## Trassanı silin

Onu seçin və {{key:Delete}} basın, ya da alətlər panelində və ya sağ panelin altında {{ui:Delete}} klikləyin. Onun profili və koridoru ilə birlikdə gedir. {{key:Mod+Z}} onu geri qaytarır.

:::mac
Mac klaviaturasında **delete** yazılmış düymə brauzerdə {{key:Backspace}}-dir və seçimi silmir. {{key:Delete}} (Fn və delete) basın və ya {{ui:Delete}} düyməsindən istifadə edin.
:::

## Növbəti

- [Şaquli profili layihələndirin](topic:profile).

## Layihə sürəti və sinfi

Trassanın Xassələri altında **Layihə sürəti** (km/h və ya mph) və **Layihə sinfi** trassa ilə saxlanılır, layihədə yadda qalır və IFC-yə yazılır (Pset_RoadDesignCriteriaCommon). CivilCraft-da sürəti minimum radiusa bağlayan cədvəl yoxdur, buna görə onlardan heç nə yoxlanmır: **Minimum radius**u öz layihə standartınızdan təyin edin.

## Spirallar

Əyrinin hər iki ucunda klotoid spiral ola bilər: tangens, spiral, əyri, spiral, tangens. PI cədvəlində radiusu olan PI üçün **Spiral girişi** və **Spiral çıxışı** sahələrinə uzunluq yazın. PI yerində qalır; əyri yer açmaq üçün içəri hərəkət edir, belə ki tangens məsafəsi spiralin ofseti qədər artır. İki uzunluq fərqli ola bilər, yalnız bir uzunluq yazılmış PI-də spiral yalnız həmin ucda olur.

Əyrilər siyahısı spiralli hissələri TS, SC, CS və ST kimi göstərir (tangensdən spiralə, spiraldan əyriyə, əyridən spiralə, spiraldan tangensə) spiral bucağı θs, tangens məsafələri və xarici məsafə ilə. Piketlər spirallar boyunca hər yerdə olduğu kimi gedir. Birlikdə əyrinin döndərdiyindən çox dönən spirallar rədd edilir və PI adı göstərilir; tangensə icazə verilən həddən uzun spiral, hər hansı əyri kimi, üst-üstə düşmədir. Superelevasiya spiraldan runoff kimi istifadə edir (bax [Koridor](topic:corridor)).
