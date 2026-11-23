---
title: Yol korridorunun yaradılması
summary: Trassa üçün korridoru işə salın, zolaq, çiyin və yan yamac qiymətlərini təyin edin və onun yaratdığı kəsikləri, daylight xətlərini və torpaq işlərini oxuyun.
keywords: qovşaq, kəsişmə, yol yolla görüşür, yan yol, T qovşaq, keçid, platforma səviyyəsi, birləşmə, bağlama, virajın yüksəldilməsi, super, əyilmə, dönmə zonası, runout, dərəcə cədvəli, eninə yamac, fırlanma, korridor, yığım, alt yığım, tipik kəsik, yol, zolaq, çiyin, yan yamac, daylight, kəsmə, doldurma, kəsiklər, hədəf, hədəflər, en hədəfi, hündürlük hədəfi, ofset hədəfi, genişlənmə, örtük kənarı, başqa korridoru izləmək
from: 6dcb92b3
---

Korridor bir sadə tipik kəsiyi (yığımı) trassa və onun layihə profili boyunca süpürür, onu mövcud zəmini əhatə edən yamaclarla birləşdirir və nəticəni layihə səthinə əlavə edir. Bir trassada müxtəlif piket aralıqlarında bir neçə korridor ola bilər və korridor piketə görə təkrar istifadə olunan şablonlardan qurula bilər ([Korridor şablonları](topic:corridor-templates)). Aşağıdakı sadə yığım hər iki tərəfdə eynidir; hər tərəfə öz hissələrini vermək üçün bax: [Hər tərəfi hissələrdən qurun](topic:corridor#build-each-side-from-parts).

## Yığım

Mərkəz xəttindən xaricə doğru, hər tərəfdə:

1. verilmiş enli **zolaq**, tağdan **zolaq yamacı** ilə aşağı enən
2. verilmiş enli **çiyin**, **çiyin yamacı** ilə
3. çiyin kənarından zəminlə görüşənə qədər **yan yamac**: zəmin yuxarıdadırsa **kəsmə yamacı**, aşağıdadırsa **doldurma yamacı**

Başlanğıc dəyərlər yer tutucudur, layihə standartı deyil:

| Dəyər | ABŞ futu | Metr |
|---|---|---|
| Zolaq eni | 12 ft | 3.6 m |
| Zolaq yamacı | 2% | 2% |
| Çiyin eni | 4 ft | 1.2 m |
| Çiyin yamacı | 4% | 4% |
| Kəsmə yamacı | 2 : 1 | 2 : 1 |
| Doldurma yamacı | 3 : 1 | 3 : 1 |
| Kəsik aralığı | 10 ft | 5 m |

Yan yamacların nisbətləri üfüqinin şaquliyə nisbətidir (H:V): 3 : 1 o deməkdir ki, 1 aşağı üçün 3 yana.

## Korridoru qurun

Lazımdır: səhvsiz trassa və ən azı iki PVI olan, səhvsiz layihə profili.

1. Trassanı seçin.
2. Sağ paneldə **Korridor** altında **Layihə profili boyunca yığımı süpürün** qutusunu işarələyin.
   Sahələr görünür və korridor dərhal qurulur. Planda zolaq və çiyin kənarları və daylight xətləri göstərilir; **Göstərmə** altında {{ui:Layihə (planlaşdırılmış)}} seçildikdə horizontallar yeni zəmini göstərir.
3. Istənilən dəyəri dəyişin: **Zolaq eni**, **Zolaq yamacı**, **Çiyin eni**, **Çiyin yamacı**, **Kəsmə yamacı**, **Doldurma yamacı**, **Kəsik aralığı**. Hər birindən sonra {{key:Enter}} basın. Kəsmə, doldurma və kəsik aralığı 0-dan böyük olmalıdır.
4. Sahələrin altındakı sətri oxuyun, məsələn "0+00.00-dan 3+86.36-a qədər 39 kəsik; kəsmə 240.2 cu yd, doldurma 556.0 cu yd."

Kəsiklər hər **Kəsik aralığı** addımında, uclarda və hər üfüqi və şaquli əyrinin başlanğıc və sonunda kəsilir. Hər kəsik və onlardan keçən xətlər (mərkəz xətti, zolaq və çiyin kənarları, daylight) layihə səthinin sərhəd xətlərinə çevrilir.

Korridoru söndürmək üçün qutunu açın. Dəyərləri növbəti dəfə üçün saxlanılır.

## Qurulmadıqda

Sahələrin altında qırmızı qutu səbəbi göstərir:

| Mesaj | Nə etmək lazımdır |
|---|---|
| "Korridorun səhvsiz layihə profilinə ehtiyacı var." | PVI əlavə edin və ya üst-üstə düşən şaquli əyriləri düzəldin (bax: [Şaquli profilin layihələndirilməsi](topic:profile)). |
| "Layihə profili trassa ilə üst-üstə düşmür." | PVI-ləri trassanın piket aralığına köçürün. |
| "Korridorun səthdə ən azı iki kəsiyə ehtiyacı var." | Korridorun böyük hissəsi mövcud zəmindən kənardadır. |
| "4 yan yamac zəmini çatmazdan əvvəl səthdən kənara çıxır." | Səthin kənarına yaxın yamac zəmini çata bilmir. Yolu kənardan uzaqlaşdırın və ya orada doldurma və ya kəsmə hündürlüyünü azaldın. |
| "Korridorun daylight xətləri kəsişir (məsələn, sıx əyrinin daxili tərəfində kəsiklər üst-üstə düşür). Daha böyük radius və ya daha dar yığım istifadə edin." | Sərt əyrinin daxili tərəfində kəsiklər üst-üstə düşür. Radiusu artırın və ya yığımı daraldın. |

Problemi olan korridor zəminə salınmır və torpaq işlərinə daxil edilmir.

## Korridorlar və platformalar birlikdə

Layihə səthi ardıcıl qurulur: əvvəl bütün korridorlar, sonra bütün platformalar. Platformanın planlaşdırılması korridorla üst-üstə düşdükdə platforma üstün gəlir. Sonrakı element yolla üst-üstə düşdükdə yalnız yolun sonrakı elementin daylight xətti daxilində olan hissəsi əvəz olunur; qalan yol və yolun kəsdiyi hər zəmin sərhəd xətti öz formasını saxlayır. Həcmlər bütün daylight xətləri daxilində birlikdə hesablanır; bax: [Torpaq işlərinin həcmləri](topic:volumes).

## Virajın yüksəldilməsi

Əyrinin içinə doğru yol əyilə bilər, beləliklə nəqliyyat xaricə az itələnir. Trassanın **Xüsusiyyətləri**ndə **Virajın yüksəldilməsi** altında **Əyriləri yüksəldin** qutusunu işarələyin:

- Hər dairəvi əyri dərəcə cədvəlindən **e** dərəcəsini alır: əyrinin radiusunun çatdığı ilk sətir (boş dərəcəsi olan sətir normal tağı saxlayır). Cədvəl və **Maks. nisbi meyl** (başlanğıc 0.5%) yer tutucudur, standart deyil: onları öz layihə meyarlarınızdan təyin edin. Lazım olduqca sətir əlavə edin və ya silin.
- Zolaqlar mərkəz xətti ətrafında fırlanır. Əyridən əvvəl xaricdəki zolaq **runout** (normal tağ ÷ e × runoff) boyunca düzəlir, sonra **runoff** (zolaq eni × e ÷ meyl) boyunca xaricdəki zolaq bütün yol e ilə içəriyə doğru meyllənənə qədər fırlanmağa davam edir; runoff-un üçdə ikisi əyridən əvvəl, üçdə biri əyrinin üzərindədir. Əyridən sonra eyni şey tərs qaydada baş verir.
- Aşağı tərəfdəki çiyin heç vaxt öz zolağından düz olmur; yuxarı tərəfdə öz yamacını saxlayır (yuvarlanır).
- Altındakı cədvəl hər əyrinin radiusunu, dərəcəsini, runoff və runout-unu və tam yüksəltmənin başladığı və bitdiyi yerləri göstərir. **Yüksəltmə diaqramı** hər iki zolağın eninə yamaclarını piketlər boyunca çəkir (sol zolaq düz, sağ zolaq kəsikli).
- Tam yüksəltməyə çatmaq üçün çox qısa əyri və ya keçidləri üst-üstə düşən iki əyri cədvəlin üstündəki qutuda bildirilir.

Kəsiklər, həcmlər, 3D görünüş və vərəqlər hamısı əyilmiş yolu göstərir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

## Hədəflər

Hədəf yolun bir tərəfinin bir nöqtəsini bir xəttə çəkir: **Örtük kənarı** və ya **Çiyin kənarı**, **Sol** və ya **Sağ** tərəfdə. Hər kəsik xətti mərkəz xəttinə perpendikulyar kəsir və yalnız həmin tərəfə gedir, buna görə sağdakı hədəf heç vaxt sol tərəfi hərəkət etdirmir.

| Təyin edir | Xəttə çatdıqda nə baş verir |
|---|---|
| **En** | Nöqtə xəttin üzərində olur: zolaq (və ya çiyin) ona qədər genişlənir və ya daralır, eninə yamacını saxlayaraq. |
| **Hündürlük** | Nöqtə orada xəttin hündürlüyünü alır, öz ofsetində: zolağın (və ya çiyinin) eninə yamacı buna uyğunlaşır. |

Xətt xüsusiyyət xətti (**İstifadə**sindən asılı olmayaraq) və ya başqa korridorun xətti ola bilər: onun mərkəz xətti, örtük kənarları, çiyin kənarları və ya daylight xətləri. Korridorun xətti həmin korridoru izləyir: digər yolu dəyişdirsəniz, bu yol da izləyəcək. CivilCraft əvvəl digər korridoru qurur; bir-birini dövrədə hədəfə alan iki korridor bir tərəfdə rədd edilir və cədvəl bunu göstərir.

1. Trassanı seçin və onun korridorunu işə salın.
2. **Hədəflər** altında {{ui:Hədəf əlavə et}} klikləyin.
3. **Tərəf**, **Nöqtə**, nəyi **Təyin edir** və **Xəttə** seçin. Hər dəyişiklik ayrıca geri alına bilən addımdır.

**Nəticə** neçə kəsikdə xəttə çatıldığını göstərir. Xəttə çatmayan kəsiklər (onun uclarından kənarda və ya mərkəz xəttinin arxasında olduqda) yığımın dəyərlərini saxlayır. Silinmiş xətt korridoru hədəfdən əvvəlki vəziyyətdə qoyur və cədvəl bunu bildirir. Bir tərəfdə hər nöqtə üçün bir en və bir hündürlük hədəfi ola bilər.

## Hər tərəfi hissələrdən qurun

Korridorun parametrləri altında **Hər tərəfi hissələrdən qurun** seçimini açın. Hər tərəfin öz siyahısı olur, mərkəz xəttindən xaricə doğru: zolaqlar, çiyin, lotok, bordür, ağacəkmə zolağı, səki və sonda yan yamac zəmini ilə (öz kəsmə və doldurma nisbətləri ilə). Başlamaq üçün {{ui:Kənd yolu}} və ya {{ui:Şəhər küçəsi}} seçin, hissələr əlavə edin və ya silin, oxlarla yerini dəyişin və bir tərəfi digərinə {{ui:Kopyala}}. Hər dəyişiklik bir geri alma addımıdır.

Eninə yamac yoldan uzaqlaşan düşmədir, buna görə yola doğru axan səki mənfi olur. Bordür verdiyiniz hündürlükdə üz, verdiyiniz enində üst hissə və arxada istəyə görə aşağı düşmə kimi təyin olunur. Virajın yüksəldilməsi birinci sətirdəki bütün zolaqları çevirir; lotok, bordür, ağacəkmə zolağı və səki qurulmuş zolaqların kənarından asılıdır. Hədəflər hələ də zolaqların sonunu və son hissəni hərəkət etdirir. Eninə kəsiklər lotokun axın xəttini, bordürün üstünü və arxasını və qalanlarını qeyd edir. Spiralları olan əyridə runoff spiraldır: TS-də səviyyəli tağ, SC-də tam yüksəltmə.

## Örtük təbəqələri

Zolaq, çiyin, lotok, ağacəkmə zolağı və ya səki öz təbəqə quruluşunu daşıya bilər: hissənin altında {{ui:Təbəqə əlavə et}} ad, material, qalınlıq və növ (səth, bağlayıcı, baza, altbaza, örtük və ya digər) ilə təbəqə əlavə edir, yuxarıdan aşağıya. Təbəqələr yolun səth xəttini (onun üstü layihə səthidir) dəyişmir; hər biri öz hissəsinin altında yerləşir, dərinliyi düz aşağı ölçülür. Eninə kəsiklər hər təbəqənin aşağı sərhədini kəsikli xətt kimi çəkir və {{ui:Yol örtüyü təbəqələri: miqdarlar}} hər təbəqənin plan sahəsini və həcmini sadalayır (sahə korridor boyunca kəsiklərdən, həcm = sahə × qalınlıq). IFC ixracı hər təbəqəni qalınlığı və materialı ilə öz elementi kimi yazır (bax: [IFC ixracı və idxalı](topic:ifc)). Yazdığınız qalınlıq sizindir: CivilCraft yol örtüyünün ölçüsünü təyin etmir.

## Yolların qovşaqlarda, platformalarda və cığırlarda birləşməsi

{{ui:Qarşılaşdığı yolları və platformaları birləşdir}} açıq olduqda (hər korridor üçün açıqdır), CivilCraft korridoru planda qarşılaşdığı şeyə birləşdirir:

- **Başqa yolda bitən yol** (trassasının sonu digər yolun üzərindədir və ya həmin yolun kənarından öz yol eninin təxminən yarısı daxilindədir) qovşağın yan yoludur. Qarşılaşdığı yol yan yolun ağzı üçün öz kənarını açır: ağızda çiyin, bordür, ağacəkmə zolağı və səki zolağın eninə yamacında qurulur və yol kimi çəkilir. Yan yol üst-üstə düşdüyü yerdə əsas yolun səthində qurulur və yaxınlaşma boyunca ona qədər yüksəldilir və ya aşağı salınır.
- **Kəsişən iki yol** hər iki tərəfdə eyni qaydada birləşir. Trassalar siyahısında birinci olan yol keçən yoldur; digəri onun səthini kəsişmə boyunca izləyir.
- **Platformada bitən yol** (içində və ya kənarından yol eninin təxminən iki misli daxilində) platformanın səviyyəsinə çatır və yaxınlaşma boyunca ona hamarlanır.
- **Cığır** (Abadlaşdırma › Bərk örtük) yolun xarici kənarında, orada səki və ya çiyin səviyyəsində dayanır, yolun üzərində uzanmır. Yolu kəsən cığır iki hissəyə bölünür. Yoldan bir az qısa çəkilmiş son (cığır eninin iki mislindən az məsafədə) öz kənarına qədər davam etdirilir.

Xüsusiyyətlərdə hər korridorun nəyi birləşdirdiyi, orada nə qədər yüksəldildiyi və ya aşağı salındığı və hansı uzunluq üzərində göstərilir. Bu uzunluq 10 m (30 ft) ilə korridor dəyişikliyinin iyirmi mislinin böyüyüdür və korridorun 45%-indən artıq olmur. **Layihə profili dəyişmir**: profil görünüşü hələ də çəkdiyiniz meyl xəttini göstərir, kəsiklər, layihə səthi, həcmlər və 3D görünüş isə yolu birləşmiş kimi göstərir. Birləşməni layihə üzrə dəqiq etmək üçün son PVI-ni Xüsusiyyətlərin göstərdiyi səviyyəyə köçürün.

Korridorda bu açarı söndürsəniz, o, profil və yığımın dediyi kimi qalır; bu halda heç bir qovşaqda iştirak etmir, nə yan yol, nə də keçən yol kimi. Təxminən 20°-dən az bucaqla demək olar ki, düz birləşən yollara toxunulmur, izlərə də.

Qovşaq hələ bunları etmir: künc dönmələri yoxdur (künclər düzdür), dönmə zolaqları və adacıqlar yoxdur, yan yolun sonu öz trassasına görə düz kəsilir və şablonlardan qurulan korridor kənarını eyni sadə qaydada açır (son vəziyyətində arx və ya divar ağızda səviyyələndirilir, keçid borusu olmadan). Planda bordür dönmələri, görmə üçbucaqları və nişanlama üçün bax: [Torpaq, yollar, ölçmə, mədənlər və əlaqələr](topic:soils-roads-survey-mines-links).

## Hələ qurulmayanlar

Daylight yamacı üçün hədəflər hələ mövcud deyil. Yol boyunca dəyişən, sol və sağı ayrı olan korridor üçün [Korridor şablonlarından](topic:corridor-templates) istifadə edin. Bax: [Hələ qurulmayıb](topic:not-built-yet).
