---
title: Yol korridorunu qurun
summary: Trassa üçün korridor yandırın, zolaq, çiyin və yan meyl qiymətlərini təyin edin və onun yaratdığı kəsikləri, günəş işığı xətlərini və torpaq işlərini oxuyun.
keywords: yan meyl, üstün yan meyl, yan meyl bucağı, runoff, runout, meyl cədvəli, eninə meyl, fırlanma, korridor, yığım, alt yığım, tipik kəsik, yol, zolaq, çiyin, eninə meyl, yan meyl, günəş işığı, kəsim, doldurma, kəsiklər, hədəf, hədəflər, en hədəfi, yüksəklik hədəfi, ofset hədəfi, genişlənmə, yol kənarı, başqa korridoru izləmək
from: 91303189
---

Korridor trassa və onun layihə profili boyunca bir sadə tipik kəsiyi (yığım) süpürür, onu mövcud zəmində grade edir və nəticəni bitmiş səthə əlavə edir. Trassada müxtəlif piket aralıqlarında bir neçə korridor ola bilər və korridor hazır şablonlardan piketə görə qurula bilər ([Korridor şablonları](topic:corridor-templates)). Aşağıdakı sadə yığım hər iki tərəfdə eynidir; hər tərəfə öz hissələrini vermək üçün bax [Hər tərəfi hissələrdən qurun](topic:corridor#build-each-side-from-parts).

## Yığım

Mərkəz xəttindən xaricə, hər tərəfdə:

1. verilmiş enində **zolaq**, **zolaq meyli** ilə tacdan aşağı enən
2. verilmiş enində **çiyin**, **çiyin meyli** ilə
3. çiyin kənarından zəminə çatana qədər **yan meyl**: zəmin yuxarıda olan yerdə **kəsim meyli**, aşağıda olan yerdə **doldurma meyli**

Başlanğıc qiymətlər yer tutucudur, layihə standartı deyil:

| Qiymət | US feet | Metrlə |
|---|---|---|
| Zolaq eni | 12 ft | 3.6 m |
| Zolaq meyli | 2% | 2% |
| Çiyin eni | 4 ft | 1.2 m |
| Çiyin meyli | 4% | 4% |
| Kəsim meyli | 2 : 1 | 2 : 1 |
| Doldurma meyli | 3 : 1 | 3 : 1 |
| Kəsik hər | 10 ft | 5 m |

Yan meyllərin nisbəti üfüqi ilə şaquli (H:V) kimidir: 3 : 1 o deməkdir ki, 1 aşağı düşəndə 3 yan keçir.

## Korridoru qurun

Xətası olmayan trassa və ən azı iki PVI olan, xətası olmayan layihə profili lazımdır.

1. Trassanı seçin.
2. Sağ paneldə **Korridor** altında **Yığımı layihə profili boyunca süpürün** qutusunu işarələyin.
   Sahələr görünür və korridor dərhal qurulur. Planda zolaq və çiyin kənarları və günəş işığı xətləri göstərilir; **Göstərmə** altında {{ui:Proposed (graded)}} seçildikdə horizontallar yeni zəmini göstərir.
3. İstənilən qiyməti dəyişin: **Zolaq eni**, **Zolaq meyli**, **Çiyin eni**, **Çiyin meyli**, **Kəsim meyli**, **Doldurma meyli**, **Kəsik hər**. Hər birindən sonra {{key:Enter}} basın. Kəsim, doldurma və kəsik aralığı 0-dan böyük olmalıdır.
4. Sahələrin altındakı sətri oxuyun, məsələn "0+00.00-dan 3+86.36-ya qədər 39 kəsik; kəsim 240.2 kub yard, doldurma 556.0 kub yard."

Kəsiklər hər **Kəsik hər** addımında, uclarda və hər üfüqi və şaquli əyrinin başlanğıc və son nöqtəsində kəsilir. Hər kəsik və onun keçdiyi xətlər (mərkəz xətti, zolaq və çiyin kənarları, günəş işığı) bitmiş səthin sınma xətlərinə çevrilir.

Korridoru söndürmək üçün qutunu işarəsiz qoyun. Qiymətləri növbəti dəfə üçün saxlanılır.

## Qurulmadıqda

Sahələrin altındakı qırmızı qutu səbəbi deyir:

| Mesaj | Nə etmək lazımdır |
|---|---|
| "Korridor xətası olmayan layihə profili tələb edir." | PVI-lar əlavə edin və ya üst-üstə düşən şaquli əyriləri düzəldin (bax [Şaquli profili layihələndirin](topic:profile)). |
| "Layihə profili trassa ilə üst-üstə düşmür." | PVI-ları trassanın piket aralığına köçürün. |
| "Korridor səthdə ən azı iki kəsik tələb edir." | Korridorun böyük hissəsi mövcud zəmindən kənardadır. |
| "Səthin kənarında 4 yan meyl zəminə çatmadan kənara çıxır." | Səthin kənarında meyl zəmini çata bilmir. Yolu səthin kənarından uzaq saxlayın və ya orada doldurma və ya kəsim hündürlüyünü azaldın. |
| "Korridorun günəş işığı xətləri kəsişir (məsələn sıx əyrinin daxili tərəfində kəsiklər üst-üstə düşür). Daha böyük radius və ya daha dar yığım istifadə edin." | Kəskin əyrinin daxili tərəfində kəsiklər üst-üstə düşür. Radiusu artırın və ya yığımı daraldın. |

Problemi olan korridor bitmiş səthə daxil edilmir və torpaq işlərində hesaba düşmür.

## Korridorlar və platformalar birlikdə

Bitmiş səth sıra ilə qurulur: əvvəl bütün korridorlar, sonra bütün platformalar. Platformanın grading-i korridorla üst-üstə düşdükdə platforma üstünlük alır. Həcmlər bütün günəş işığı xətləri daxilində birlikdə hesablanır; bax [Torpaq işləri həcmləri](topic:volumes).

## Yan meyl

Əyri boyunca yol içəri tərəfə doğru əyilə bilər, beləliklə hərəkət xaricə az itələnir. Trassanın **Xüsusiyyətlər**inin **Yan meyl** bölməsində **Dönmələri yan meyl ilə qaldır** qutusunu işarələyin:

- Hər dairəvi əyri cədvəldən bir **e** dərəcəsi alır: əyrinin radiusuna çatdığı ilk sətir (dərəcəsi boş olan sətir normal tacı saxlayır). Cədvəl və **Maksimum nisbi meyl** (başlanğıc 0.5%) yer tutucudur, standart deyil: onları öz layihə meyarlarınızdan təyin edin. Lazım olduqca sətir əlavə və ya silin.
- Zolaqlar mərkəz xəttinin ətrafında fırlanır. Əyridən əvvəl xarici zolaq **runout** üzərində (normal tac ÷ e × runoff) düzləşir, sonra **runoff** üzərində (zolaq eni × e ÷ meyl) xarici zolaq bütün yol içəriyə e meyli ilə enənə qədər fırlanmağa davam edir; runoff-un üç ikisi əyridən əvvəl, üçdə biri onun üzərindədir. Əyridən sonra eyni şey tərsinə baş verir.
- Aşağı tərəfdəki çiyin heç vaxt öz zolağından düz deyil; yüksək tərəfdə öz meylini saxlayır (o, yuvarlanır).
- Altındakı cədvəl hər əyrinin radiusunu, dərəcəsini, runoff-unu və runout-unu və tam yan meylin harada başlayıb bitdiyini sadalayır. **Yan meyl diaqramı** hər iki zolağın eninə meylini piketlər boyunca çəkir (sol zolaq düz, sağ zolaq kəsikli).
- Tam yan meyl üçün çox qısa olan əyri və ya keçidləri üst-üstə düşən iki əyri cədvəlin üstündəki qutuda deyilir.

Kəsiklər, torpaq işləri, 3D görünüş və vərəqlər hamısı əyilmiş yolu göstərir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

## Hədəflər

Hədəf yolun bir tərəfinin bir nöqtəsini bir xəttə köçürür: **Düz tərəf** və ya **Çiyin kənarı**, **Sol** və ya **Sağ**. Hər kəsik xəttə mərkəz xəttinə perpendikulyar gedir və yalnız o tərəfə çıxır, buna görə də sağdakı hədəf heç vaxt sol tərəfi köçürmür.

| Təyin edir | Kəsik xətti kəsdiyi yerdə nə baş verir |
|---|---|
| **En** | Nöqtə xəttin üzərində oturur: zolaq (və ya çiyin) ona qədər genişlənir və ya daralır, öz eninəsi meylini saxlayaraq. |
| **Yüksəklik** | Nöqtə orada xəttin yüksəkliyini öz ofsetində alır: zolağın (və ya çiyinin) eninə meyli bunu izləyir. |

Xətt layihə xətti (onun **İstifadəsindən** asılı olmayaraq) və ya başqa korridorun xətti ola bilər: onun mərkəz xətti, düz tərəf kənarları, çiyin kənarları və ya günəş işığı xətləri. Korridorun xətti o korridoru izləyir: o biri yolu dəyişin, bu yol da onu izləyir. CivilCraft əvvəl o biri korridoru qurur; bir-birini dövrədə hədəf alan iki korridor bir tərəfdə rədd olunur və cədvəl hansının olduğunu deyir.

1. Trassanı seçin və onun korridorunu yandırın.
2. **Hədəflər** altında {{ui:Add a target}} klikləyin.
3. **Tərəf**, **Nöqtə**, nəyi **Təyin edir** və **Xəttə** seçin. Hər dəyişiklik bir geri qaytarma addımıdır.

**Nəticə** neçə kəsikdə xəttə çatıldığını deyir. Xəttə çatmayan kəsiklər (onun ucundan kənarda və ya mərkəz xəttinin arxasında olanlar) yığımın qiymətlərini saxlayır. Silinmiş xətt korridoru hədəfdən əvvəlki vəziyyətdə buraxır və cədvəl bunu deyir. Bir tərəfdə hər nöqtə üçün bir en və bir yüksəklik hədəfi ola bilər.

## Hər tərəfi hissələrdən qurun

Korridorun parametrləri altında **Hər tərəfi hissələrdən qurun** seçimini yandırın. Hər tərəfin sonra öz siyahısı olur, mərkəz xəttindən xaricə: zolaqlar, çiyin, oluq, bordür, əkin zolağı, səki və sonuncu, zəmini ilə yan meyl (öz kəsim və doldurma nisbətləri ilə). {{ui:Rural road}} və ya {{ui:Urban street}} ilə başlayın, hissələr əlavə edin və silin, oxlarla yerini dəyişin və {{ui:Copy}} ilə bir tərəfi o biri tərəfə kopyalayın. Hər dəyişiklik bir geri qaytarma addımıdır.

Eninə meyl yoldan uzaqlaşan düşmədir, buna görə də yoldan axan səki mənfi olur. Bordür verdiyiniz hündürlüyün üzü, verdiyiniz enin üstü və arxada istəyə görə düşmədir. Yan meyl birinci sətirdəki bütün zolaqları fırladır; oluq, bordür, zolaq və səki qurulmuş zolaqların kənarından asılıdır. Hədəflər hələ də zolaqların ucunu və son hissəni köçürür. Kəsiklər oluq axın xəttini, bordürün üstünü və arxasını və qalanını göstərir. Spiralı olan əyridə runoff spiraldir: TS-də səviyyəli tac, SC-də tam yan meyl.

## Yol örtüyü təbəqələri

Zolaq, çiyin, oluq, əkin zolağı və ya səki öz qurulma təbəqələrini daşıya bilər: hissənin altında **Təbəqə əlavə et** yuxarıdan aşağıya doğru ad, material, qalınlıq və növü (səth, bağlayıcı, baza, alt baza, örtük və ya digər) olan təbəqə əlavə edir. Təbəqələr yolun səthini (onun üstü layihə səthidir) hərəkət etdirmir; hər biri öz hissəsinin altındadır, dərinliyi düz aşağıya ölçülür. Eninə kəsiklər hər təbəqənin altını kəsikli xətt kimi çəkir və **Yol örtüyü təbəqələri: kəmiyyətlər** hər təbəqənin plan sahəsini və həcmini sadalayır (sahə kəsiklərdən korridor boyunca, həcm = sahə × qalınlıq). IFC ixracı hər təbəqəni öz qalınlığı və materialı ilə ayrı element kimi yazır ([IFC ixracı və idxalı](topic:ifc)). Yazdığınız qalınlıq sizindir: CivilCraft yol örtüklərinin ölçüsünü təyin etmir.

## Hələ qurulmayanlar

Günəş işığı meyli üçün hədəflər hələ mövcud deyil. Yol boyunca dəyişən və sol və sağı ayrı olan korridor üçün [Korridor şablonlarından](topic:corridor-templates) istifadə edin. Bax [Hələ qurulmayanlar](topic:not-built-yet).
