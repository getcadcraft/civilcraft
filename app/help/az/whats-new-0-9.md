---
title: 0.9-da yeniliklər (əvvəlki)
summary: Korridor və relyef şablonları, çəkərkən yapışmalar və Seç düymələri, atributlu GIS analizi, sahə üçün kölgə, günəş enerjisi, rahatlıq və külək tədqiqatları, 3D Render görünüşü və Nöqtə buludları və WaterCraft əlavələri.
keywords: 0.9-da yeniliklər, əvvəlki buraxılış, yeniliklər, 0.9, buraxılış qeydləri, korridor şablonları, relyef şablonları, şablon redaktoru, tipik kəsik, bir neçə korridor, yapışma, yapışmalar, seç, köçür, kopyala, fırlat, tangens, render, 3D render, gis analizi, buffer, overlay, məkan birləşməsi, atribut cədvəli, atributa görə üslub, kölgə tədqiqatı, günəş enerjisi, utci, açıq hava rahatlığı, külək tədqiqatı, openfoam, nöqtə buludları, las, laz, watercraft, yanğın axını, hidrant, su yaşı, xlor, tələbatlar, ipucu, layout, buraxılış qeydləri, dəyişikliklər, 0.8, 0.8.1, versiya, yeni xüsusiyyətlər, yağış, qasırğa, su toplanması, torpaq işləri, balans, kəsmə və doldurma, daşınma, ən yaxşı marşrut, ən az xərc, trassa, gölməçə, çıxış, geri çəkilmə, sərbəstlik, irəliləyiş, survey, dron, anbar, ünvana sahə, parsel, torpaq, daşqın, yamac dayanıqlığı, bishop, oturma, qovşaq, nişanlama, işarələr, görmə məsafəsi, tənzimləmə, ən kiçik kvadratlar, açıq karxana, blok modeli, radio əlaqəsi, fresnel, strelka, keçid, dil, problemlər, canlı, dwg
from: 4664522c
---

Bu, CivilCraft 0.9-un 0.8.1-lə müqayisədə nəyi dəyişdiyidir. CivilCraft 0.9 CadCraft Studio 0.9-un və onun səkkiz tətbiqinin bir hissəsidir. Əsas hissələr korridor və relyef şablonları, çəkərkən yapışmalar, GIS analizi, sahənin günəşi, günəş enerjisi, rahatlıq və küləyi üzrə tədqiqatlar və iki əlavə: Nöqtə buludları və WaterCraft-dır.

## Yeni

### Korridor və relyef şablonları

- **Korridor şablonları.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Korridor şablonları…}} açın (və ya {{cmd:TEMPLATES}} yazın). Şablon komponentləri, ofsetləri, yamacları, materialları və nöqtə kodları olan kiçik eninə kəsikdir. Onları layihədə, {{ui:Mənim kitabxanam}}-da və ya `.cctemplates.json` faylı kimi saxlayın. Şablon redaktoru həqiqi miqyasda çertyoj göstərir və yazdıqca problemləri sadalayır.
- **Piketə görə şablonlardan qurma.** Trassanı seçin və onun Xüsusiyyətlərində {{ui:Piketə görə şablonlardan qur}} açın. Hər regionun hər tərəfinin öz yol örtüyü siyahısı və öz son vəziyyəti var. {{ui:Bu trassadakı korridorlar}} altında {{ui:Korridor əlavə et}} bir trassada bir neçə korridor qoyur.
- **Relyef şablonları.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Relyef şablonları…}} (və ya {{cmd:TERRAINTEMPLATES}} yazın) relyefə torpaq üst təbəqəsi və ya asfalt və baza kimi təbəqəli materialları yerləşdirir, hər təbəqə üçün sahə və həcm ilə. Bax: [Korridor şablonları və relyef şablonları](topic:corridor-templates).

### Layihələndirmə

- **Yapışmalar.** Trassa, Platforma, Parsel, Kütlə, Xüsusiyyət xətti, Ölç, Sərhəd və Su hövzəsi alətləri survey nöqtələrinə, PI-lərə, künclərə, təpələrə və strukturlara yapışır, markerin yanında etiketlə. Sərbəst nöqtə üçün {{key:Alt}} saxlayın.
- **Seç düymələri, tangens və köçürmə, kopyalama, fırlatma.** Platforma, parsel və xüsusiyyət xətti künclərinin Şərq (E) və Şimal (N) yazılan qutuları və çarpaz Seç düyməsi var. Xüsusiyyətlərdə trassalar üçün {{ui:İki nöqtədən tangens}} və trassalar, platformalar, parsellər və xüsusiyyət xətləri üçün {{ui:Köçür, kopyala və fırlat}} da var. Bax: [Yapışmalar, seçilmiş künclər və köçür, kopyala, fırlat ilə layihələndirin](topic:draft-with-snaps).
- **3D-də Render görünüşü.** 3D panelində {{ui:Render}} düyməsi torpağı təbii rənglərlə, səma, duman və yumşaq kölgələrlə çəkir. Modeli dəyişmir. {{ui:Günəş}} menyusunda indi {{ui:Tətbiq et}} və {{ui:Bağla}} düymələri var. Bax: [Sahəni 3D-də görün](topic:site-3d).
- **Panellər bir vaxtda bir bölmə açılır.** Sol panel və Xüsusiyyətlər paneli bir bölməni açır və digərlərini bağlayır; Abadlaşdırma lentindəki bir neçə aləti tutan elementlər bölünmüş düymələrdir.

### GIS analizi

- **Analiz.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Təhlil}} buffer, overlay, məkan birləşməsi, atributa və ya formaya görə seçmə və ölçmə təklif edir. Hər alət bir geri alma addımında yeni qat yaradır.
- **Atribut cədvəli.** Qatın üç nöqtəli menyusunda {{ui:Atribut cədvəli…}} və Atributa görə üslub… var. Bax: [GIS qatlarını analiz edin](topic:gis-analysis) və [Qatın atribut cədvəli ilə işləyin](topic:gis-table).

### Sahə: günəş, enerji, rahatlıq və külək

- **Ətraf mühit bölməsi.** Kütlə seçin: {{ui:Günəş saatları}} altında Ətraf mühit bölməsi var. Kölgə tədqiqatı (xəritə, cədvəl, animasiya, CSV), tipik il hava faylından (.epw) günəş enerjisi məhsuldarlığı və açıq hava rahatlığı (UTCI) var.
- **Külək, yalnız ekran üçün.** {{ui:Külək tədqiqatı keçir}} hava faylındakı hər külək istiqaməti üçün zəmini oturmaqdan narahatlığa qədər rənglədir. Təsdiqlənməyib və panel bunu deyir.
- **Piyada küləyi (OpenFOAM) əlavəsi.** {{ui:Parametrlər}} › {{ui:Əlavələr}}-də açana qədər söndürülüb. OpenFOAM sizin quraşdırdığınız proqramdır. Bax: [Kölgə, günəş enerjisi məhsuldarlığı və açıq hava rahatlığı](topic:environment).

### Nöqtə buludları (əlavə)

- {{ui:Parametrlər}} › {{ui:Əlavələr}}-də {{ui:Nöqtə buludları}} açın; sağ paneldə Nöqtə buludları sekmesi görünür. LAS və ya LAZ faylı açın, təmizləyin, yerə, bitkilərə və binalara ayırın, zəmini, horizontalları və həcmləri qurun və LAS və ya LAZ ixrac edin. Bax: [Dron və ya skanerdən nöqtə buludları](topic:point-clouds).

### WaterCraft (əlavə)

- {{ui:Parametrlər}} › {{ui:Əlavələr}}-də {{ui:WaterCraft (su paylanması)}} açın; WaterCraft sekmesi görünür. Müştərilərdən tələbatlar, hər hidrantda yanğın axını, hansı magistral kəsintisinin önəmli olduğu və su yaşı və xlor var, hər biri CSV kimi saxlanılır. Bax: [WaterCraft: tələbatlar, yanğın axını, kəsintilər və su yaşı](topic:watercraft).

### Birlikdə işləmək

- Canlı sessiyada planda bir-birinizin kursorlarını və adlarını görürsünüz. Kitabxana bitkiləri: CivilCraft abadlaşdırması standart Kitabxana kolleksiyasından başlayır, {{ui:CivilCraft landscape}}.

## Hər tətbiqdə

- Göstərişlər Bootstrap alətipləri kimi göstərilir və başlanğıc ipucu bağlana bilər.
- Panelin sekme zolağı sığmadıqda kəsilmək əvəzinə sürüşür.
- Brauzer sekme başlıqları `<sənəd> - CivilCraft | CadCraft` formatındadır.
- {{ui:Parametrlər}}-də Layout bölməsi var; düzümlər iki sətirli seçimlərin açılan siyahısıdır.
- Çəki və temperatur vahidləri {{ui:Parametrlər}} › {{ui:Qlobal}} › {{ui:Vahidlər}}-dədir.
- Dil siyahısı quruluşun fayllarının olduğu dilləri göstərir. İngilis dilindən başqa dillər maşın qaralamalarıdır.

## Düzəldilmişlər

- Ünvan axtarışı və EnergyPlus yoxlaması əlavələri açıla bilmirdi; indi açıla bilir.
- Kömək indi deyir ki, Nöqtə buludları əlavəsi təmizlənmiş buludu LAS 1.4 və ya LAZ kimi yazır.
- Seçilmiş obyektin öz tutacağına klik etmək artıq gözləyən Pick-i dayandıran tutacaq sürüşdürməsini başlatmır.

## Məhdudiyyətlər

- Nümunə korridor şablonları heç bir standartdan götürülməmiş yer tutucudur; mühəndis onları yoxlamalıdır. Relyef şablonları səth əlavə etmir və 3D-də və ya kəsik görünüşündə çəkilmir. Trassada ikinci korridor IFC ixracında yoxdur. İki şablon arasında piketə görə keçid yoxdur.
- Nöqtə buludları uydurma fayllarda sınaqdan keçirilib, real dron survey-də yox. Yalnız LAS və LAZ oxunur.
- GIS analizi uydurma qatlarda sınaqdan keçirilib.
- Kölgə, günəş enerjisi və rahatlıq planlama təxminləridir; külək təsdiqlənməmiş ekran üçündür. Heç biri layihə dəyəri deyil.
- WaterCraft uydurma şəbəkələrdə yoxlanmış hesablama köməkçisidir. Nəticələrin nəyə dəyərdiyini su mühəndisi qərar verir.
- İngilis dilindən başqa dillər maşın qaralamalarıdır.
- Windows quraşdırıcıları kodla imzalanmayıb, macOS disk şəkli notarizasiya olunmayıb.

## Əvvəlki: 0.8 və 0.8.1

Bu, CivilCraft 0.8 (2026-11-01) və 0.8.1 (2026-11-02) versiyalarında 0.7-yə nəzərən nəyin dəyişdiyidir. Böyük yeni hissələr zəmini və sahəni (yağış, torpaq işləri, marşrutlar, gölməçələr, irəliləyiş) yoxlayan alətlər və zəmin, yollar, survey, mədənlər, əlaqələr və dəmiryol üçün altı hesablama pəncərəsidir.

### Yeni

**Zəminizi yoxlayın**

- **Yağış yağdırın.** {{ui:Yağış yağdırmaq…}} ({{ui:Səth}} altında) şaquli planlaşdırılmış zəmində fırtına buraxır. Suyun platformalardan axmasını, aşağı künclərdə yığılmasını və çox kiçik gölməçələrin daşmasını izləyirsiniz. Qaçış animasiyalıdır və həcmləri, pik çıxışı və hər gölməçənin CSV-sini verir. Standart hüceyrə kobuddur ki, ilk baxış tez olsun; incə hüceyrə yavaşdır. Daşan gölməçələr Problemlər panelində də görünür.
- **Torpaq işləri balanslaşdırıcısı.** {{ui:Torpaq işləri balanslaşdırıcısı…}} kəsmə doldurmaya bərabər olana qədər platformanı qaldırır və ya aşağı salır və aralarında daşınma cədvəlini göstərir.
- **Ən yaxşı marşrut.** {{ui:Ən yaxşı marşrut…}}: başlanğıc və son seçin, CivilCraft meyl və əyilmə limitlərinizə riayət edən relyef üzrə ən ucuz yolu tapır və ondan trassa yaradır.
- **Gölməçələr.** {{ui:Gölməçələr…}} zəmininizdən pillə və saxlama hesablayır, çıxış qurğularını (diyafraqma, sədd, V-çentik, daşqın keçidi) qəbul edir, fırtınanı gölməçədən marşrutlaşdırır və tutulan pik axını, boşalma vaxtını və azad hündürlüyü yoxlayır.
- **Survey-lərdən irəliləyiş.** {{ui:Survey-lərdən irəliləyiş…}} müxtəlif tarixlərdən dron və ya skan səthlərini onların olduğu zəmin və layihə ilə müqayisə edir: həcmə görə faizlə tamamlanma, həddindən artıq qazılmış və doldurulmuş sahələr, yığınlar və bu sürətlə iş nə vaxt bitəcək (təxmin kimi işarələnir).

**Sahəni tanıyın**

- **Ünvana sahə.** {{ui:Ünvana sahə…}} açıq parsel, bina, zoninq, torpaq, daşqın və relyef məlumatlarını bir sahədə düzür. Sahəni layihə faylında saxlaya bilərsiniz: yazılmış ünvan, hər mənbə və onu götürdüyünüz gün və lisenziyası, geri gələnlər. Layihəni yenidən açsanız və ya paylaşsanız, sahə yenə də orada qalır, heç nə yenidən gətirilmir. Onu sahə faylı kimi də saxlaya və ya BimCraft-a göndərə bilərsiniz. Bax: [Ünvana sahə](topic:address-to-site).

**Zəmin, yollar, survey, mədənlər, əlaqələr və dəmiryol**

- **Torpaqlar və yamaclar.** {{ui:Torpaqlar və yamaclar…}} yazdığınız bürğülər arasında torpaq profilini çəkir. Bişopun üsulu zəminizdə, su səviyyəsi, əlavə yük və zəlzələ əmsalı ilə kritik dairəni axtarır; bünövrənin oturması konsolidasiya, dərhal oturma və zamanı alır.
- **Qovşaqlar və nişanlama.** {{ui:Qovşaqlar və nişanlama…}} qolları birlikdə bir-birinə yığır: künc radiusları (hər qol üçün bir radius və ya üç-mərkəzli dönmələr), layihə sürəti üçün görmə məsafəsi, görmə üçbucaqlarının yoxlanması, keçid yerləri, dayanma xətləri, nişanlar və işarələr işarə cədvəli ilə. Onlar planda çəkilir və adlandırılmış qatlarla .dxf kimi saxlanılır.
- **Survey tənzimləməsi.** {{ui:Survey tənzimləməsi…}} trassa və ya şəbəkənin ən kiçik kvadratlar tənzimləməsini aparır: tənzimlənmiş koordinatlar, xəta elipsləri, xi-kvadrat testi və uyğun gəlməyən ölçmədə bayraq. Sərbəst şəbəkələr, RW5 ilə kompas qaydası ilə trassanın bağlanması, GSI, JobXML və ya CSV sahə faylları daxildir və tənzimlənmiş nöqtələr CSV kimi saxlanılır.
- **Açıq karxanalar.** {{ui:Açıq karxanalar…}} qazma nümunələrini blok modelinə və yamacınızın bucağı daxilində son karxanaya çevirir, boş nisbəti, pilləyə görə cədvəl, yüksəklik və tonaj əyrisi ilə. Gəlir amili ilə iç-içə karxanalar və diskont edilmiş pul axını ilə istehsal cədvəli də var.
- **Radio əlaqələri.** {{ui:Radio əlaqələri…}} yerin qabarması, birinci Fresnel zonası, keçid büdcəsi, zəifləmə marjası və çoxyollu kəsinti ilə zəmininiz üzərində görmə xəttini yoxlayır və yolu təmizləyəcək dirək hündürlüyünü verir. Həmçinin lif itki büdcələri, marşrut kəmiyyətləri və qüllədə külək də var.
- **Dəmiryol strelkaları.** {{ui:Dəmiryol strelkaları…}} onu keçid nömrəsindən, paralel yollar arasında keçidlərdən və əyridə maillə əyilib genişlənən struktur ölçüsündən strelka yaradır. Strelka trassanın pikətində yerləşə bilər.

Bax: [Torpaqlar, qovşaqlar, survey tənzimləməsi, karxanalar, radio əlaqələri və strelkalar](topic:soils-roads-survey-mines-links).

### Hər tətbiqdə

- **Dillər.** 54 dil, onlardan on yenidir. İngilis dilindən başqa dillər ana dilində danışan oxuyana qədər maşın qaralamalarıdır. Kömək mövzularının çoxu hələ də ingiliscədir.
- **Alət paneli sətirləri.** {{ui:Parametrlər}} › {{ui:Ümumi}} › {{ui:Alət paneli sətirləri}}: Sarmal (əvvəlki kimi), 2 sətir və ya 1 sətir. CivilCraft-ın lenti ən çox istifadə olunan aləti böyük, sonrakıları kiçik, qalanlarını qrup adının oxunun arxasında göstərir.
- **Giriş cihazları.** Trackpad, qələm, 3D siçan, kontroller və MIDI tətbiqləri idarə edə bilər.
- **Problemlər.** Hər tətbiqdə xəbərdarlıq edən Problemlər paneli, tənzimləmə paketlərini oxuyan yoxlamalarla.
- **Canlı.** Canlı sessiyada kimin harada olduğunun görünüşü.
- **Əlavələr.** İşıqlandırma əlavələri ilə əlavələr siyahısı.
- **AI-nizi qoşun.** Qoşduğunuz hər köməkçi CivilCraft alətlərini idarə edə bilər. CadCraft Studio daxilində bir kliklə qoşulma və hosted connector hələ hazır deyil deyə qeyd ilə gəlir. Bax: [Süni intellekt köməkçisi ilə işləyin](topic:assistants).

### 0.8.1-də düzəldilənlər

- **DWG siniflər bölməsi.** Səhv tipdə oxunurdu (GitHub cadcraft#5). CivilCraft-da CadCraft, BimCraft, ModelCraft və TakeoffCraft ilə birlikdə düzəldildi.
- **İş vaxtı dilin dəyişməsi.** CadCraft Studio və paketlənmiş nəşrlər iş vaxtında dili dəyişə bilər. Əvvəlcə yalnız ingilis dili idi. Hər platformada hələ sınaqdan keçməyib: dil dəyişməsə bizə deyin.

### Bu versiyada hələ yoxdur

- **Bunlar hesablama köməkçiləridir.** Yeni pəncərələrdəki hər nəticə mühəndisin yoxlamasını tələb edir. Torpaq möhkəmlikləri torpaq qrupu üçün tipik dəyərlərdən başlayır və pəncərə bunu deyir.
- **Yağış yağdırmaq.** Nümunə sahədə incə hüceyrədə brauzerdə iki dəqiqədən çox çəkə bilər. Əl halları və V-şəkilli su toplama sahəsi ilə yoxlanılıb, hələ real işlənmiş sahədə deyil.
- **Ünvana sahə.** Gətirdiyiniz açıq məlumat fayllarını oxuyur və yalnız öz fayllarımızda sınaqdan keçirilib. Ağaclar mənbə deyil. Sizin üçün mənbələri gətirmək məxfilik mətninə görə gözləyir.
- **Survey-lərdən irəliləyiş.** Yalnız uydurma survey-lərdə sınaqdan keçirilib. Vərəqlərdə və işarələrdə irəliləyiş (MarkupCraft) və skanın modellə müqayisəsi (BimCraft) qurulmayıb.
- **Torpaqlar və yamaclar.** Yalnız dairəvi səthlər: pazlı və ya blok axtarışı yoxdur, gərginlik çatı yoxdur.
- **Qovşaqlar.** Hər qol üçün bir radius, yük maşını hərəkət yolları yoxdur və hələ korridora daxil olmurlar.
- **Sahə faylları.** Oxuyucular ictimai format təsvirlərindən yazılıb və bizim yaratdığımız fayllarda sınaqdan keçirilib. Real cihaz faylları lazımdır.
- **Əlaqələr və dəmiryol.** Radio əlaqələri: yalnız boş məkan itkisi və çoxyollu (yağış zəifləməsi və ya anten diaqramları yoxdur), və dəmiryol standartı yoxdur: hər dəmiryol limiti yer tutucudur, heç bir dəmiryol mühəndisinin yoxlamadığı qaralama rəqəmlərlə.
- **Windows və macOS.** 0.8 kodla imzalanmayıb. Windows xəbərdarlıq edə bilər, macOS sağ klik sonra Aç tələb edir.

Hər şey qalanı üçün [Hələ qurulmayıb](topic:not-built-yet) səhifəsindədir. Əvvəlki buraxılış üçün bax: [0.7-də yeniliklər](topic:whats-new-0-7).
