---
title: Problemlərin həlli
summary: CivilCraft-da rast gəlinən problemlərin əlamətləri, səbəbləri və həlləri, tətbiqin göstərdiyi dəqiq mesajlarla.
keywords: problemlər, xətalar, işləmir, düzəlt, kömək, mesajlar, həll et, rədd edildi, çatışmır, səhv, yerləri dəyişib, horizontallar yoxdur
from: a9f7dedc
---

Mesajlar aşağı sağdakı status panelində, sol və sağ panellərdəki qutularda və dialoqlarda çıxır. Burada tətbiqin göstərdiyi kimi sitat gətirilir.

## Faylların açılması

**"Bu fayl 200 MB-dan böyükdür; CivilCraft hələlik belə böyük faylları açmır."**
Nöqtə faylını bölün, ya da açmazdan əvvəl məlumatları azaldın.

**"site.json açmaq alınmadı: Bu CivilCraft layihə faylı deyil."**
Fayl `.json` ilə bitir və ya `{` ilə başlayır, amma CivilCraft layihəsi deyil. Nöqtə faylları `{` ilə başlamamalıdır.

**"Açmaq alınmadı … Bu layihə faylı daha yeni CivilCraft-dan (versiya 2) gəlir."**
Layihə daha yeni versiya ilə saxlanılıb. Onu orada açın, ya da ondan LandXML ixrac edin.

**"Açmaq alınmadı … Bu XML-dir, amma LandXML deyil (kök elementi <…>)."**
Fayl başqa növ XML-dir. LandXML-i digər proqramdan ixrac edin.

**"… CivilCraft-ın oxuya biləcəyi nöqtə, TIN səth və ya trassa yoxdur."**
Faylda olan hər şey CivilCraft-ın atladığı şeydir (məsələn, yalnız şəbəkə səthləri və ya yalnız spiral trassalar). Mesajın qalan hissəsi orada nə olduğunu deyir. Bax: [LandXML: nə oxunur və nə yazılır](topic:landxml-reference).

**"Nümunə yüklənmədi: …"**
{{ui:Nümunə saytı aç}} CadCraft saytından fayl oxuyur. Əlaqə olmadıqda, yalnız CivilCraft oflayn istifadə üçün saxlanılıbsa işləyir (tətbiq panelindəki düymə {{ui:Oflayn hazırdır}} göstərir). Onlayn olun, {{ui:Oflayn üçün saxla}} düyməsini basın və bundan sonra oflayn işləyir. Bax: [Oflayn](common:offline).

**{{ui:Oflayn üçün saxla}} göstərir {{ui:Saxlamaq alınmadı}}.**
Bəzi fayllar yüklənmədi. Əlaqəni yoxlayın və düyməni yenidən basın.

**{{ui:Oflayn üçün saxla}} göstərir {{ui:Oflayn mövcud deyil}}.**
Bu brauzer pəncərəsi oflayn nüsxə saxlaya bilmir, adətən gizli pəncərə olduğu və ya kompüter idarə olunduğu üçün. CivilCraft-ı adi pəncərədə açın.

**Oflayn tətbiq heç açılmır.**
Bu brauzerdə oflayn istifadə üçün saxlanılmayıb, ya da brauzer saytın məlumatlarını təmizləyib (Safari bir neçə həftə ziyarət edilməyən saytlarda belə edir). Onlayn olun, CivilCraft-ı açın və {{ui:Oflayn üçün saxla}} düyməsini basın.

**Oflayn nüsxə köhnə versiyadır.**
{{ui:Oflayn hazırdır}} düyməsini basın, sonra onlayn ikən {{ui:Yenidən saxla (ən yeni versiyanı al)}} düyməsini basın.

**Açma pəncərəsində fayl boz görünür.**
Pəncərə yalnız nöqtə fayllarını, LandXML və layihə fayllarını sonluqlarına görə siyahıya salır. Faylı əvəzinə planın üzərinə sürükləyin, ya da adını `.txt` edin.

## Nöqtələrin idxalı

**"Bu fayldan heç bir nöqtə oxunmadı."**
**Sütunlar** bölməsində sütun ardıcıllığını əl ilə seçin. Heç nə işləmirsə, faylı mətn redaktorunda açın və hər sətirdə bir nöqtə, içində rəqəmlər olduğunu yoxlayın.

**Sahə güzgü təsviri, fırlanmış və ya xəttə uzanmış kimi görünür.**
Şimal və şərq koordinatları yer dəyişib. Xülasədə "sütun sayına görə təxmin edildi" yazılıb. **Sütunlar** bölməsində PNEZD əvəzinə PENZD seçin (ya da əksinə), ya da yenidən idxal edin.

**Digərlərindən uzaq nöqtələr, plan isə bir nöqtəyə qədər uzaqlaşıb.**
Bir sətirdə koordinatda səhv yazılıb, ya da fayl koordinat sistemlərini qarışdırır. Nöqtəni tapın (nömrəsini görmək üçün üzərinə basın) və faylı düzəldin.

**"Oxunmayan sətirlər" altında siyahıya salınmış sətirlər.**
Bax: [Planalma nöqtələrini idxal et](topic:import-points#rows-that-are-not-read) cədvəlinə.

**Köhnə nöqtələrim itib.**
Nöqtə faylını idxal etmək bütün nöqtələri əvəz edir və geri qaytarmağı təmizləyir. Onları geri almaq üçün saxlanılmış layihənizi açın.

## Səth

**Qırmızı qutuda "Səth: Qurulmayıb".**
Qutu səbəbi göstərir: "Səth üçün hündürlüyü olan ən azı üç nöqtə lazımdır.", "Nöqtələrin hamısı bir xəttdədir: üçbucaq yoxdur.", "Hündürlüyü olan nöqtə yoxdur.", "Sərhəd nöqtələrlə üst-üstə düşmür." və ya "Sərhədin içində heç bir üçbucaq qalmayıb." Sütun ardıcıllığını, nöqtə qruplarını ({{ui:Kənarda qalır}}?) və sərhədi yoxlayın.

**Horizontallar arxın və ya silsilənin üzərindən düz kəsir.**
Həmin xətt sınma xətti deyil. Onun qrupunu {{ui:Sınma xətti}} təyin edin, ya da {{ui:Sınma xətti}} alətilə çəkin. Bax: [Səthi qurun və dəqiqləşdirin](topic:build-surface).

**Sınma xətti qrupu zıqzaq çəkir.**
Qrupda birdən çox xətt var, ya da onun nöqtələri xətt boyunca nömrələnməyib. Qrupu yenidən {{ui:Nöqtələr}} təyin edin və hər xətti {{ui:Sınma xətti}} alətilə çəkin.

**Xarici kənar boyunca uzun, nazik üçbucaqlar.**
Sərhəd çəkin ({{key:O}}) və ya **Ən uzun xarici kənar** təyin edin.

**Səth qurulsa da, heç bir horizontal yoxdur.**
Ya **Göstər** altında {{ui:Horizontallar}} söndürülüb, ya da interval o qədər kiçikdir ki, 2,000-dən çox horizontal səviyyə olardı. Daha böyük interval seçin.

**Sınma xətləri və ya sərhəd heç nəyi dəyişmir.**
Səth LandXML-dən gəlib ("Səth (LandXML-dən)"). O, olduğu kimi istifadə olunur. Bunun əvəzinə nöqtələrdən qurmaq üçün {{ui:Səthi nöqtələrdən yenidən qur}} düyməsini basın.

**"Hələ səth yoxdur: əvvəlcə planalma nöqtələrini açın."**
Sınma xətti, sərhəd və platforma mövcud təbii səth tələb edir. Əvvəlcə nöqtələri idxal edin.

**"Hündürlüyü olan planalma nöqtəsinə basın: sınma xətti nöqtələrin hündürlüklərini götürür."**
{{ui:Sınma xətti}} aləti yalnız planalma nöqtələrini seçir. Miqyası böyüdün və nöqtəyə basın (narıncı kvadrat götürəcəyi nöqtəni göstərir).

## Çəkiliş

**Bitirmək üçün iki dəfə basanda son nöqtəm itdi.**
Bu versiyada iki dəfə basmaq trassanı, platformanı, sınma xəttini və ya sərhədi bitirir, amma iki dəfə bastığınız nöqtəni atır. Son nöqtəyə bir dəfə basın və {{key:Enter}} düyməsini basın. Artıq baş veribsə, {{key:Mod+Z}} istifadə edin, sonra yenidən çəkin.

**Planşetdə çəkilişi bitirə bilmirəm.**
Bitirmək üçün {{key:Enter}} lazımdır; hələ ekranda düymə yoxdur. Klaviatura qoşun. Bax: [Siçan, sensor panel və toxunma](topic:keyboard#mouse-trackpad-and-touch).

**Nöqtə yerləşdirmək üçün sürükləmək əvəzinə plan sürüşür.**
Bir neçə piksseldən çox sürükləmə bütün alətlərdə planı sürüşdürür. Yerini dəyişmədən basın.

**"Trassa üçün ən azı iki nöqtə lazımdır." / "Platforma üçün ən azı üç künc lazımdır." / "Boru xətti üçün ən azı iki quruluş lazımdır."**
{{key:Enter}} düyməsini tez basdınız. Çəkiliş atılır; yenidən başlayın.

**A və ya G kimi düymələr heç nə etmir.**
Mətn qutusu və ya paneldə siyahı hələ fokusdadır, ona görə hərflər ora gedir. Planın üzərinə bir dəfə basın, sonra düyməyə basın. Mac-də silmə düyməsi brauzerdə Backspace-dir: seçimi silmək üçün Fn və delete istifadə edin.

## Trassalar və profillər

**"PI 2 və PI 3-dəki əyrilər üst-üstə düşür: … Daha kiçik radiuslar istifadə edin."**
İki əyri onların PI-ləri arasında olandan daha çox toxunan tələb edir. PI cədvəlində bir və ya hər iki radiusu azaldın, ya da PI-ləri bir-birindən uzaqlaşdırın.

**"PI 3 birbaşa geri dönür; əyri ala bilmir."**
Trassa həmin PI-də öz üzərinə qayıdır. PI-ni köçürün və ya silin.

**"Bu trassanın başlamaq üçün altında təbii zəmin yoxdur."**
Trassa səthdən kənardadır. Onu səthin üzərinə köçürün, ya da {{ui:PVI əlavə et}} açıq ikən basaraq PVI əlavə edin.

**"PVI 3-dəki şaquli əyri (L = …) əvvəlki əyri və ya PVI bitməzdən əvvəl başlayır." / "… növbəti PVI-ni keçir."**
Əyrinin uzunluğunu qısaldın və ya PVI-ləri bir-birindən uzaqlaşdırın.

**"… stansiyasında artıq PVI var"**
Həmin stansiyada PVI var. Başqa yerə basın, ya da mövcud olanı sürükləyin.

**Profil görünüşü boşdur: "Profilini görmək üçün trassa çəkin."**
Trassa yoxdur, ya da seçilmiş trassada xətalar var.

## Dəhlizlər və platformalar

**"Dəhliz xətasız layihə profili tələb edir."**
Layihə profilini başladın ({{ui:Təbii zəmindən başla}}) və əyrilərin üst-üstə düşməsini düzəldin.

**"… yan yamaclar təbii zəminə çatmazdan əvvəl səthdən kənara çıxır." / "… yamac xətləri ona çatmazdan əvvəl səthdən kənara çıxır …"**
Planlaşdırma təbii zəminə çatmazdan əvvəl səthin kənarına çatır. Layihəni kənardan içəri köçürün, ya da təbii zəminə yaxınlaşdırın. Səthdən qismən kənarda çəkilən yeni platforma 0 hündürlükdən başlaya bilər: real hündürlük yazın.

**"Dəhlizin günışığı xətləri … kəsişir …" / "Günışığı xətti özü ilə kəsişir …"**
Müxtəlif tərəflərdən olan yamaclar bir-birinə çatır: sıx əyrilər, dar platformalar, dərin kəsimlər və ya yüksək doldurmalar. Daha böyük radius, daha dar kəsik quruluşu, daha geniş platforma və ya daha dik yamaclar istifadə edin.

**"Hələ həcm yoxdur: platforma problemsiz planlaşdırılmalıdır."**
Onun üstündəki qırmızı qutuda sadalanan problemləri düzəldin.

**{{ui:Layihə (planlaşdırılmış)}} boz görünür.**
Hələ heç bir platforma və ya dəhliz planlaşdırılmayıb.

## Borular

**"P2-nin hələ invertləri yoxdur."**
{{ui:Invertləri qaydalara görə təyin et}} düyməsini basın və ya invertləri yazın.

**"P1: başlamaq üçün S1-də təbii zəmin yoxdur."**
Yuxarı axın quruluşu səthdən kənardadır və kənarı yoxdur. Onun üçün kənar yazın.

**Quruluşu köçürdükdən sonra hər boru işarələnir.**
Quruluşu köçürmək invertləri dəyişmir. {{ui:Bütün invertləri qaydalara görə təyin et}} düyməsini basın.

Bütün şəbəkə mesajları [Ağırlıq boru şəbəkəsini planlaşdırın](topic:pipe-network#read-and-fix-problems) bölməsində izah olunub.

## Saxlama və ixrac

**"Hələ ixrac ediləcək heç nə yoxdur." / "Hələ çap ediləcək heç nə yoxdur."**
Layihə boşdur. Əvvəlcə nöqtələri idxal edin.

**Saxlanılmış faylı tapa bilmirəm.**
O, brauzerin yükləmələrindədir (adətən Yükləmələr qovluğu). Bax: [Aça, saxlaya və ixrac edə biləcəyiniz fayllar](topic:files#where-the-files-go).

**Kağızda PDF miqyası səhvdir.**
100% və ya real ölçüdə çap edin, "səhifəyə sığdır" yox.

**PDF mətnində sual işarələri.**
Adlarda və ya təsvirlərdə Qərbi Avropa dəstindən kənar simvollar var. Status mesajı onları sayır. Sadə simvollarla adını dəyişin.

**Çap kənarlardan kəsilir.**
Miqyas vərəq üçün çox böyükdür. "(sığır)" işarəli miqyası, daha böyük vərəq, ya da {{ui:Ekranda olanlar}} seçin.

**{{key:Mod+P}} brauzerin çap dialoqunu açdı.**
Səhifə fokusda deyildi. Dialoqu bağlayın, planın üzərinə basın və {{key:Mod+P}} düyməsini yenidən basın, ya da {{ui:PDF}} düyməsini basın.

## Tətbiqin özü

**Ekran boşdur və ya alətlər paneli heç nə etmir.**
Chrome, Edge, Firefox və ya Safari-nin cari versiyasından istifadə edin və səhifəni yeniləyin. Bax: [Brauzerlər](common:browsers).

**Böyük nöqtə faylı ilə tətbiq yavaşdır.**
{{ui:Üçbucaqlar}}, {{ui:Nöqtə yazıları}} və {{ui:Hündürlük zolaqları}} söndürün və daha böyük horizontal intervalından istifadə edin. Çox böyük səthlər hər dəyişiklikdən sonra yenidən qurulmaq üçün bir az vaxt aparır.

**Brauzer "Saytdan çıxılsın?" soruşur.**
Layihədə saxlanılmamış dəyişikliklər var. Qalın, {{key:Mod+S}} ilə saxlayın, sonra çıxın.
