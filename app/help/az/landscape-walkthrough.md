---
title: Bağ layihələndirilməsi: başlanğıcdan sona
summary: Landşaft memarının on addımı — planalmadan dərc edilmiş dəstə qədər — hər addım üçün Abadlaşdırma iş sahəsinin bu gün nə etdiyi və hələ nə etmədiyi ilə.
keywords: təlimat, keçid, necə etmək, landşaft layihələndirilməsi, bağ layihələndirilməsi, başlanğıc, nümunə, addım-addım, planalma, xətt, relyef, əkin, cədvəl, vərəqlər, nəşr, bir layihə
from: 87900bf5
---

Landşaft layihəsi dövrə gedir: planalma, eskiz, xətlər, relyef, sahələr, səviyyələr, əkin, cədvəllər, vərəqlər və yenidən geri. Bunlar on addımdır və hər biri üçün mövcud olanı göstərir. Addımda boşluq varsa, o, sonda **Hələ qurulmayıb** bölməsində adlanır, addımın içində gizlədilmir.

Nümunə saytında və ya öz planalma çertyojunuzda izləyə bilərsiniz. Öz çertyojunuzla birinci addımdan başlayın.

## 1. Planalmanı daxil edin

{{ui:Səth}} › {{ui:Çertyojdan xətlər…}}, planalma çertyojunu seçin (DWG 2000–2018 və ya DXF). Vahidləri yoxlayın, səth üçün horizontalları, 3D polixətləri və sərhədi, nöqtə bloklarını isə planalma nöqtələri kimi götürün. **Planalma səviyyələri və yoxlama** bölməsi mətn və ya atribut kimi yazılmış səviyyələri oxuyur və heç nə əlavə etməzdən əvvəl səhv görünənləri sadalayır (vahidlər, koordinat sistemi, sıfırdan məsafə, düz horizontallar, qəribə səviyyələr, ikiqat nöqtələr). Bax: [İdxal zamanı planalma çertyojunun yoxlanması](topic:survey-check) və [DWG və ya DXF-i xətt kimi açmaq](topic:open-dwg-dxf). Koordinat sistemini {{ui:Koordinat sistemi…}} ilə təyin edin.

## 2. Əl eskizləri

Kağız üzərində olan vərəq — məsələn köhnə planalma və ya işarələnmiş çap — {{ui:Skan…}} ilə daxil olur (Skandan başla): miqyasa uyğun və ya məlum koordinatlara görə planın altına yerləşdirilir və xətlərə köçürülə bilər. ModelCraft əl eskizinin fotoşəklini oxuyur (Fayl › Eskiz fotoşəklini idxal et…). CivilCraft-ın özündə əl eskizi üçün alət yoxdur: vərəqi planın altına qoyun və üzərindən çəkin.

## 3. Eskizdən xəttə

CivilCraft-da planalmanın üzərində xüsusiyyət xətləri və konturlar çəkin, və ya 2D çertyojda çəkin. Abadlaşdırma › {{ui:Daha çox}} › {{ui:Xəttdən}} xətti döşənməyə, əkilmiş sahəyə, divara, pilləkənə, xüsusiyyət xəttinə və s. çevirir, əlaqəli saxlanılaraq: xətti köçürün, obyekt onu izləyir. Bax: [Xətlərdən obyektlər](topic:objects-from-lines). **SuperCad Studio**-da saytı, çertyojı və bina modelini bir layihədə açın: **Abadlaşdırma** iş sahəsi hamısının alətlərinə malikdir, 2D çertyojda seçilmiş xətt isə onu izləyən landşaft obyektinə çevrilə bilər (Ctrl+K, {{ui:Seçilmiş çertyoj xəttindən landşaft obyekti}}).

## 4. Layihə relyefi

Açın {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Abadlaşdırma iş sahəsi}}. Layihə relyefini {{ui:Platforma}}, {{ui:Torpaq sipər}} və {{ui:Drenaj çökəkliyi}} ilə, sahələri isə nöqtə səviyyələri və horizontallarla qurun; əlavə etdiyiniz döşənmə, cığırlar, divarlar, rampalar və pilləkənlər eyni layihə səthinə düşür. Mövcud relyef heç vaxt dəyişmir. {{ui:Səviyyələr}} › {{ui:Yer modifikatorları…}} relyefi formalaşdıran hər şeyi bir sırada, hər birinin kəsim və doldurması ilə sadalayır. Bax: [Şaquli planlaşdırma](topic:landscape-grading) və [Yer modifikatorları və canlı səviyyələr](topic:ground-modifiers).

## 5. Döşənmə və əkilmiş sahələr

{{ui:Bərk örtük}} › {{ui:Döşənmə}}, {{ui:Cığır}}, {{ui:Divar}}, {{ui:Bordür}}, {{ui:Rampa}} və {{ui:Pilləkən}}. {{ui:Sahələr}} çəmənlik, yataq, çəmənzar və ya örtücü bitki sahəsini onun qat quruluşu ilə çəkir; döşənmə, divar və pilləkənlər ətrafında özü kəsilir. {{ui:Yataq}} sahəni bitkilərin məsafəsi ilə, bitki qarışığından doldurur. Bax: [Bərk örtük](topic:hardscape), [Əkilmiş sahələr](topic:planted-areas) və [Əkin](topic:planting).

## 6. Səviyyələr, meyllər və birləşmələr

**Şaquli planlaşdırma yoxlamaları** altında **Meyl təhlili** və **Axın oxları və suyun toplanması** qutularını işarələyin. Su terrasın qarşısında toplanırsa, ətrafına {{ui:Drenaj çökəkliyi}} əlavə edin. Xüsusiyyətlər pilləkənlərə neçə pillə lazım olduğunu və uyğun gəlib-gəlmədiyini, hansı cığırın limitindən dik olduğunu göstərir. Problemlər paneli obyektlərin pis birləşdiyi yerləri sadalayır: həddindən artıq hündür divar, döşənmənin üstündə yataq, meydançasına çatmayan pilləkənlər. {{ui:Nöqtə səviyyəsi}} və {{ui:Meyl oxu}} relyefi etiketləyir və özlərini yeniləyir.

## 7. Əkin

**Bitkilər** bölməsində bitki siyahısında axtarın (bir neçə yüz növ, və ya öz siyahınız), birini seçin və {{ui:Bitki}}, {{ui:Yataq}} və ya {{ui:Hasar}} ilə yerləşdirin. Bitkinin ölçüsünü və etiketlərini Daha çox-dan təyin edin. Daha çox › {{ui:Bitki cədvəli}} öz qeydlərinizi redaktə edir: sortlar, verilən ölçülər, sıxlıq, spesifikasiya qeydləri. Hər qeyd öz işarəsini və 3D modelini (OBJ, STL və ya GLB) daşıya bilər; Daha çox › {{ui:Bitki qrafikası}} isə kiçik miqyasda bitkiləri sadələşdirilmiş çəkir. Bax: [Bitki siyahısı](topic:plant-list), [Bitki qeydləri](topic:plant-records) və [Bitki qrafikası](topic:plant-graphics).

## 8. Miqdarlar və cədvəllər

Daha çox › {{ui:İş cədvəlləri}}: bitki və bərk örtük cədvəlləri və öz cədvəlləriniz obyektlərə bağlı qalır; onları CSV və ya XLSX kimi saxlayın və ya vərəqlərə qoyun (bax: [İş cədvəlləri](topic:worksheets)). Daha çox › {{ui:Bitki cədvəli…}} sayları TakeoffCraft-a göndərir. Bərk örtük miqdarları döşənmə, divar və pilləkənlərin Xüsusiyyətlərindədir. Suvarmanın öz material siyahısı var: {{ui:Suvarma}} › **Sistemi yoxla…**. Bax: [Suvarma](topic:irrigation).

## 9. Çertyojlar və vərəqlər

Daha çox › {{ui:Landşaft vərəqləri…}}: əkin, şaquli planlaşdırma və suvarma planları, detallarla birlikdə. {{ui:Səviyyələr}} › {{ui:Kəsik xətti}} torpaq, divarlar, qat quruluşları, pilləkənlər və bitkilər boyunca kəsik çəkir. Bax: [Landşaft vərəqləri](topic:landscape-sheets) və [Kəsiklər və nəşr dəsti](topic:landscape-sections).

## 10. Dərc et

Vərəqlər dialoqunda {{ui:Nəşr dəsti (.zip)}} vərəqlərin siyahısı ilə bir PDF və hər vərəq üçün bir DWG yaradır. Daha çox › {{ui:Abadlaşdırma IFC-ni ixrac et}} BimCraft-a bitkiləri və bərk örtüyü verir. Layihəni saxlayın: hər şey bir faylda olur.

## Bir şeyi dəyişin: pilləkən

Hər şeyi bir layihədə saxlamağın məqsədi budur ki, dəyişiklik bütün layihəyə yayılır. Bunu iki terras arasında pilləkən marşı ilə sınayın:

1. Marşın xəttini xüsusiyyət xətti kimi çəkin (və ya çertyojda xətt), sonra Abadlaşdırma › {{ui:Daha çox}} › {{ui:Xəttdən}} › {{ui:Pilləkən}}. Pilləkənin Xüsusiyyətlərində **Relyefi formalaşdırır** qutusunu işarələyin və aşağı və yuxarı səviyyələri iki terrasa təyin edin.
2. Marşın yanında və altında {{ui:Sahələr}} ilə əkilmiş yataq çəkin, terraslarda isə döşənmə. Yataq özünü pilləkən və döşənmə ətrafında kəsir, bitki cədvəli isə yalnız əkilmiş olanları sayır.
3. Xüsusiyyətlərdə marşın yuxarı səviyyəsini qaldırın. Layihə relyefi, nöqtə səviyyələri, meyl oxları və kəsim və doldurma dərhal dəyişir. Əgər marş yuxarı terrasa artıq çatmırsa, Problemlər paneli nə qədər olduğunu deyir.
4. Marşın xəttini köçürün. Pilləkənlər eyni geri alma addımında öz xəttini izləyir; yataq yenidən kəsilir və yenidən sayılır, iş cədvəlləri və cədvəllər yeni rəqəmləri göstərir.
5. Ctrl+Z bir dəfə basın: xətt, pilləkənlər, relyef və yataq birlikdə geri qayıdır.

Bax: [Yer modifikatorları və canlı səviyyələr](topic:ground-modifiers), [Əkilmiş sahələr](topic:planted-areas) və [İş cədvəlləri](topic:worksheets).

## Hələ qurulmayıb

Bunlar istənilir, lakin bu buraxılışda yoxdur:

- Relyefi formalaşdıran divarlar (harada görüşdüklərini bildirirlər və üstləri onu izləyə bilər).
- Tətbiqdə öz Kitabxana bitki siyahınızı redaktə etmək (layihənin siyahısını redaktə edin və bitki faylı kimi saxlayın).
- Öz GLB bitki modellərinizin teksturaları və rəngləri (forma oxunur; bitkinin rəngi istifadə olunur).

Bütün alətlər üçün [Abadlaşdırma iş sahəsi](topic:landscape) bölməsinə baxın.
