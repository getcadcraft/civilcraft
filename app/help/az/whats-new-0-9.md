---
title: 0.9-da yeniliklər
summary: Korridor və relyef şablonları, çəkərkən tutmalar və Seç düymələri, atribut cədvəli ilə GIS təhlili, sahə üçün kölgə, günəş gəlirliliyi, rahatlıq və külək tədqiqatları, 3D Render görünüşü və Nöqtə buludları və WaterCraft əlavələri.
keywords: yeniliklər, 0.9, buraxılış qeydləri, korridor şablonları, relyef şablonları, şablon redaktoru, tipik kəsik, bir neçə korridor, tutma, tutmalar, seç, köçür, kopyala, fırlat, tangens, render, 3d render, gis təhlili, bufer, örtük, məkan birləşməsi, atribut cədvəli, atributa görə üslub, kölgə tədqiqatı, günəş gəlirliliyi, utci, açıq hava rahatlığı, külək tədqiqatı, openfoam, nöqtə buludları, las, laz, watercraft, yanğın axını, hidrant, suyun yaşı, xlor, tələbatlar, alət ipucları, yerləşdirmə, yeniliklər, buraxılış qeydləri, dəyişiklik jurnalı, dəyişikliklər, 0.8, 0.8.1, versiya, yeni xüsusiyyətlər, yağış, yağış suyu, yığılma, daşqın, torpaq işləri, balans, kəsmə və doldurma, daşıma, ən yaxşı marşrut, ən az xərc, trassa, saxlayıcı gölməçə, çıxış, boşalma, azad hündürlük, irəliləyiş, ölçmə, dron, ehtiyat yığını, ünvandan sahəyə, torpaq sahəsi, torpaq, daşqın, yamacın dayanıqlığı, bişop, oturma, qovşaq, nişanlama, işarələr, görünmə məsafəsi, tənzimləmə, ən kiçik kvadratlar, poliqonometriya, açıq karyer, blok modeli, radio əlaqəsi, freşel, strelka, keçid, dillər, problemlər, live, dwg
from: d7ac5b14
---

Bu, CivilCraft 0.8.1-ə nisbətən 0.9-da nəyin dəyişdiyini göstərir. CivilCraft 0.9 CadCraft Studio 0.9-un və onun səkkiz tətbiqinin bir hissəsidir. Əsas hissələr korridor və relyef şablonları, çəkərkən tutmalar, GIS təhlili, sahənin günəşi, günəş gəlirliliyi, rahatlığı və küləyi üzrə tədqiqatlar və iki əlavədir: Nöqtə buludları və WaterCraft.

## Yeni

### Korridor və relyef şablonları

- **Korridor şablonları.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Korridor şablonları…}} açın (və ya {{cmd:TEMPLATES}} yazın). Şablon komponentləri, ofsetləri, meylləri, materialları və nöqtə kodları olan kiçik köndələn kəsikdir. Onları layihədə, {{ui:Mənim kitabxanam}} daxilində və ya `.cctemplates.json` faylı kimi saxlayın. Şablon redaktoru həqiqi ölçüdə çertyoj göstərir və yazdıqca problemləri siyahılayır.
- **Pikətlərə görə şablonlardan qurun.** Trassanı seçin və onun Xüsusiyyətlərində {{ui:Pikətlərə görə şablonlardan qur}} seçimini aktivləşdirin. Hər bölgənin hər tərəfinin öz döşəmə siyahısı və öz son şərti var. {{ui:Bu trassadakı korridorlar}} altında {{ui:Korridor əlavə et}} bir trassada bir neçə korridor qoyur.
- **Relyef şablonları.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Relyef şablonları…}} (və ya {{cmd:TERRAINTEMPLATES}} yazın) torpaq və ya döşəmə kimi təbəqəli materialları relyefə yerləşdirir, hər təbəqə üzrə sahə və həcmlə. Bax: [Korridor şablonları və relyef şablonları](topic:corridor-templates).

### Çəkmə

- **Tutmalar.** Trassa, Pad, Sahə, Kütlə, Xüsusiyyət xətti, Ölçmə, Sərhəd və Su toplama sahəsi alətləri geodezik nöqtələrə, PI-lərə, künclərə, təpələrə və strukturlara tutulur, işarənin yanında etiketlə. Sərbəst nöqtə üçün {{key:Alt}} basın saxlayın.
- **Seç düymələri, tangens və köçür, kopyala, fırlat.** Pad, sahə və xüsusiyyət xətti künclərinin yazıla bilən Şərq və Şimal qutuları və çarpaz nişanlı Seç düyməsi var. Xüsusiyyətlərdə trassalar üçün {{ui:İki nöqtədən tangens}} və trassalar, padlar, sahələr və xüsusiyyət xətləri üçün {{ui:Köçür, kopyala və fırlat}} da var. Bax: [Tutmalarla, seçilmiş künclərlə və köçür, kopyala, fırlat ilə çəkin](topic:draft-with-snaps).
- **3D-də render görünüşü.** 3D panelindəki {{ui:Render}} düyməsi torpağı təbii rənglərlə, səma, dumanlılıq və yumşaq kölgələrlə çəkir. Modeli dəyişmir. {{ui:Günəş}} menyusunda indi {{ui:Tətbiq et}} və {{ui:Bağla}} düymələri var. Bax: [Sahəyə 3D-də baxın](topic:site-3d).
- **Panellər bir bölmə-bir bölmə açılır.** Sol panel və Xüsusiyyətlər paneli bir bölmə açır və digərlərini bağlayır; bir neçə aləti olan Abadlaşdırma lentinin plitələri ayrılmış düymələrdir.

### GIS təhlili

- **Təhlil.** {{ui:Səth}} › {{ui:Daha çox}} › {{ui:Təhlil}} bufer, örtük, məkan birləşməsi, atributa və ya formaya görə seçim və ölçmə təklif edir. Hər alət bir geri alma addımında yeni qat yaradır.
- **Atribut cədvəli.** Qatın üç nöqtəli menyusunda {{ui:Atribut cədvəli…}} və {{ui:Atributa görə üslub…}} var. Bax: [GIS qatlarının təhlili](topic:gis-analysis) və [Qatın atribut cədvəli ilə işləmək](topic:gis-table).

### Sahə: günəş, günəş gəlirliliyi, rahatlıq və külək

- **Ətraf mühit bölməsi.** Kütlə seçin: {{ui:Ətraf mühit}} bölməsi Xüsusiyyətlərində {{ui:Günəş saatları}} altındadır. Kölgə tədqiqatı (xəritə, cədvəl, animasiya, CSV), tipik il hava faylından (.epw) günəş gəlirliliyi və açıq hava rahatlığı (UTCI) var.
- **Külək, yalnız ilkin yoxlama.** {{ui:Külək tədqiqatını işlət}} hava faylındakı hər külək istiqaməti üçün torpağı oturmaqdan narahatlığa qədər rənglədir. Təsdiqlənməyib və panel bunu deyir.
- **Piyada küləyi (OpenFOAM) əlavəsi.** {{ui:Parametrlər}} › {{ui:Əlavələr}} bölməsində aktivləşdirənə qədər söndür. OpenFOAM özünüz quraşdırdığınız proqram təminatıdır. Bax: [Kölgə, günəş gəlirliliyi və açıq hava rahatlığı](topic:environment).

### Nöqtə buludları (əlavə)

- {{ui:Parametrlər}} › {{ui:Əlavələr}} bölməsində {{ui:Nöqtə buludları}} aktivləşdirin; sağ paneldə Nöqtə buludları nişanı görünür. LAS və ya LAZ faylı açın, təmizləyin, yer, bitki örtüyü və binalara ayırın, yer, horizontallar və həcmlər qurun və LAS və ya LAZ ixrac edin. Bax: [Dron və ya skanerdən nöqtə buludları](topic:point-clouds).

### WaterCraft (əlavə)

- {{ui:Parametrlər}} › {{ui:Əlavələr}} bölməsində {{ui:WaterCraft (su paylanması)}} aktivləşdirin; WaterCraft nişanı görünür. Müştərilərdən tələbatlar, hər hidrantda yanğın axını, hansı magistral dayanmasının vacib olduğu və suyun yaşı və xlor var, hər biri CSV kimi saxlanılır. Bax: [WaterCraft: tələbatlar, yanğın axını, dayanmalar və suyun yaşı](topic:watercraft).

### Birlikdə iş

- Live sessiyasında planda bir-birinizin kursorlarını və adlarını görürsünüz. Kitabxana bitkiləri: CivilCraft Abadlaşdırma standart Kitabxana kolleksiyasından başlayır, {{ui:CivilCraft abadlaşdırması}}.

## Bütün tətbiqlərdə

- Məsləhətlər Bootstrap alət ipucları kimi göstərilir və başlanğıc ipucu bağlana bilər.
- Sığmayan panel sekmələri kəsilmək əvəzinə sürüşür.
- Brauzer nişanlarının başlıqları belə oxunur: `<sənəd> - CivilCraft | CadCraft`.
- {{ui:Parametrlər}} bölməsində Tərtibat bölməsi var, tərtibatlar iki sətirli seçimlərin açılan siyahısıdır.
- Çəki və temperatur vahidləri {{ui:Parametrlər}} › {{ui:Qlobal}} › {{ui:Vahidlər}} bölməsindədir.
- Dil siyahısında quruluşun fayllarının olduğu dillər göstərilir. İngilis dilindən başqa dillər maşın qaralamalarıdır.

## Düzəldilmişlər

- Ünvan axtarışı və EnergyPlus yoxlaması əlavələri aktivləşdirilə bilmirdi; indi bilir.
- Yardımda indi deyilir ki, Nöqtə buludları əlavəsi təmizlənmiş buludu LAS 1.4 və ya LAZ kimi yazır.
- Seçilmiş obyektin öz tutacağına klik etmək gözləyən Seçimi dayandıran tutacaq sürüşməsini artıq başlatmır.

## Dürüst məhdudiyyətlər

- Korridor şablonları yaranmış nümunə yer tutucudur, heç bir standartdan deyil; mühəndis yoxlamalıdır. Relyef şablonları səth əlavə etmir və 3D-də və ya kəsik görünüşündə çəkilmir. Trassadakı ikinci korridor IFC ixracında yoxdur. İki şablon arasında pikətlərə görə daralma yoxdur.
- Nöqtə buludları uydurma fayllar üzərində test olunub, real dron tədqiqatı üzərində yox. Yalnız LAS və LAZ oxunur.
- GIS təhlili uydurma qatlar üzərində test olunub.
- Kölgə, günəş və rahatlıq planlaşdırma təxminləridir; külək isə təsdiqlənməmiş ilkin yoxlamadır. Bunların heç biri dizayn dəyəri deyil.
- WaterCraft uydurma şəbəkələr üzərində yoxlanılmış hesablama köməkçisidir. Su mühəndisi rəqəmlərin dəyərini özü müəyyən edir.
- İngilis dilindən başqa dillər maşın qaralamalarıdır.
- Windows quraşdırıcıları kod imzası ilə imzalanmayıb, macOS disk şəkli isə notarizasiya olunmayıb.

## Əvvəlki: 0.8 və 0.8.1

Bu, CivilCraft 0.8 (2026-11-01) və 0.8.1 (2026-11-02) versiyalarında 0.7-yə nisbətən nəyin dəyişdiyini göstərir. Əsas yeni hissələr yerin və yolların, sahənin yoxlanılması üçün alətlərdir (yağış, torpaq işləri, marşrutlar, gölməçələr, irəliləyiş) və torpaq, yollar, ölçmə, mədənlər, əlaqələr və dəmir yolu üçün altı hesablama pəncərəsi.

### Yeni

**Relyefinizi yoxlayın**

- **Yağış yağdırmaq.** {{ui:Yağış yağdırmaq…}} ({{ui:Səth}} altında) quraşdırılmış torpağa yağış tökür. Suyun pad-lardan axdığını, aşağı künclərdə yığıldığını və çox kiçik olan gölməçələrdən daşdığını görürsünüz. Hesablama animasiya olunur və həcmləri, pik çıxışı və hər gölməçənin CSV-sini verir. Standart hüceyrə ilk baxış üçün kobuddur; incə hüceyrə daha yavaşdır. Daşan gölməçələr Problemlər panelində də görünür.
- **Torpaq işləri balanslaşdırıcısı.** {{ui:Torpaq işləri balanslaşdırıcısı…}} kəsmə doldurmaya bərabər olana qədər padı qaldırır və ya endirir və aralarındakı daşıma cədvəlini göstərir.
- **Ən yaxşı marşrut.** {{ui:Ən yaxşı marşrut…}}: başlanğıc və son seçin, CivilCraft sizin meyl və əyrilik limitlərinizə riayət edən relyef üzrə ən ucuz yolu tapır, sonra ondan trassa yaradır.
- **Saxlayıcı gölməçələr.** {{ui:Saxlayıcı gölməçələr…}} mərhələni və saxlamanı sizin torpağınızdan hesablayır, çıxış qurğularını (diyafraqma, sədd, V-çentik, su boşaltma) qəbul edir, gölməçə vasitəsilə fırtınanı yönləndirir və saxlanılan pik, boşalma müddəti və azad hündürlüyü yoxlayır.
- **Tədqiqatlardan irəliləyiş.** {{ui:Tədqiqatlardan irəliləyiş…}} müxtəlif tarixlərdəki dron və ya skan səthlərini, torpağın o vaxtkı vəziyyəti və layihə ilə müqayisə edir: həcmə görə faizlə tamamlanma, həddən artıq qazılmış və doldurulmuş sahələr, ehtiyat yığınları və bu tempdə işin nə zaman bitəcəyi (təxmin kimi işarələnir).

**Sahəni tanıyın**

- **Ünvandan sahəyə.** {{ui:Ünvandan sahəyə…}} açıq parsel, bina, zoninq, torpaq, daşqın və relyef məlumatlarını bir sahədə birləşdirir. Sahəni layihə faylında saxlaya bilərsiniz: yazılmış ünvan, hər mənbə onu gətirdiyiniz gün və lisenziyası ilə və nə gəldiyi. Layihəni yenidən açın və ya paylaşın, sahə yerindədir, heç nə yenidən gətirilmir. Onu sahə faylı kimi də saxlaya və ya BimCraft-a göndərə bilərsiniz. Bax: [Ünvandan sahəyə](topic:address-to-site).

**Torpaq, yollar, ölçmə, mədənlər, əlaqələr və dəmir yolu**

- **Torpaqlar və yamaclar.** {{ui:Torpaqlar və yamaclar…}} yazdığınız quyular arasında torpaq profilini çəkir. Bişop metodu sonra su səviyyəsi, əlavə yük və zəlzələ əmsalı ilə sizin relyefinizdə kritik dairəni axtarır; təməlin oturması konsolidasiya, dərhal oturma və zaman hesablayır.
- **Qovşaqlar və nişanlama.** {{ui:Qovşaqlar və nişanlama…}} budaqları bordür qövsləri ilə birləşdirir (hər budaq üçün bir radius və ya üç mərkəzli qövslər), layihə sürəti üçün görünmə məsafəsini, görünmə üçbucaqlarının yoxlanışını, keçidləri, dayanma xəttlərini, nişanları və işarə cədvəli ilə işarələri. Planda çəkilir və adlandırılmış qatlarla .dxf kimi saxlanılır.
- **Ölçmənin tənzimlənməsi.** {{ui:Ölçmənin tənzimlənməsi…}} poliqonun və ya şəbəkənin ən kiçik kvadratlar tənzimlənməsini aparır: tənzimlənmiş koordinatlar, səhv elipsləri, xi-kvadrat testi və uyğun gəlməyən ölçüdəki bayraq. Sərbəst şəbəkələr, pusula qaydası ilə poliqonun bağlanması, RW5, GSI, JobXML və ya CSV sahə faylları daxildir, tənzimlənmiş nöqtələr CSV kimi saxlanılır.
- **Açıq karyerlər.** {{ui:Açıq karyerlər…}} qazma nümunələrini blok modelinə və sizin yamac bucağınız daxilində son karyerə çevirir; örtük nisbəti, pilləyə görə cədvəl və tənəzzül və tonaj əyrisi ilə. Gəlir əmsalına görə iç-içə karyerlər və diskontlaşdırılmış pul axını ilə istehsal cədvəli də var.
- **Radio əlaqələri.** {{ui:Radio əlaqələri…}} yerin qabarması, birinci Freşel zonası, əlaqə büdcəsi, zəifləmə ehtiyatı və çoxyollu kəsilmə ilə torpağınız üzərində görmə xəttini yoxlayır və yolu təmizləyəcək dirəyin hündürlüyünü verir. Fiber itki büdcələri, marşrut miqdarları və qülləyə külək də var.
- **Dəmir yolu strelkaları.** {{ui:Dəmir yolu strelkaları…}} öz tıxac nömrəsindən strelka, paralel relslər arasında keçidlər və əyrilikdə yan meylə görə əyilən və genişlənən struktur ölçüsü yaradır. Strelka trassanın pikətində yerləşə bilər.

Bax: [Torpaq, yollar, tədqiqat, mədənlər, əlaqələr və strelkalar](topic:soils-roads-survey-mines-links).

### Bütün tətbiqlərdə

- **Dillər.** 54 dil, onlardan on biri yeni. İngilis dilindən başqa dillər ana dili danışan tərəfindən oxunana qədər maşın qaralamalarıdır. Yardım mövzuları hələ əsasən ingilis dilindədir.
- **Alət paneli sətirləri.** {{ui:Parametrlər}} › {{ui:Ümumi}} › {{ui:Alət paneli sətirləri}}: Sarğı (əvvəlki kimi), 2 sətir və ya 1 sətir. CivilCraft-ın Lenti ən çox istifadə olunan aləti böyük, növbətiləri kiçik, qalanlarını qrup adının oxunun arxasında göstərir.
- **Giriş cihazları.** Touchpad, qələm, 3D siçan, kontroller və MIDI tətbiqləri idarə edə bilər.
- **Problemlər.** Hər tətbiqdə xəbərdarlıq edən Problemlər paneli; tənzimləmə paketlərini oxuyan yoxlamalarla.
- **Live.** Live sessiyasında kimin harada olduğunun görünüşü.
- **Əlavələr.** İşıqlandırma əlavələri ilə əlavələr siyahısı.
- **AI-nizi qoşun.** Qoşduğunuz hər köməkçi CivilCraft-ın alətlərini idarə edə bilər. Onunla gəlir bir qeyd var: CadCraft Studio daxilində bir kliklə qoşulma və hostinq olunan konnektor hələ hazır deyil. Bax: [AI köməkçisinin sahənizdə işləməsi](topic:assistants).

### 0.8.1-də düzəldilmişlər

- **DWG sinifləri bölməsi.** Səhv tip kimi oxunurdu (GitHub cadcraft#5). CivilCraft-da CadCraft, BimCraft, ModelCraft və TakeoffCraft ilə birlikdə düzəldildi.
- **İş zamanı dil dəyişmək.** CadCraft Studio və paketli nəşrlər işləyərkən dili dəyişə bilir. Əvvəllər yalnız ingilis dilində idi. Hər platformada hələ test olunmayıb: dil dəyişmirsə bizə deyin.

### Bu versiyada hələ yoxdur

- **Bunlar hesablama köməkçiləridir.** Yeni pəncərələrdəki hər nəticə mühəndisin yoxlamasını tələb edir. Torpaq möhkəmlikləri torpaq qrupu üçün tipik dəyərlərdən başlayır və pəncərə bunu deyir.
- **Yağış yağdırmaq.** Nümunə sahədə işləmə brauzerdə incə hüceyrədə iki dəqiqədən çox çəkə bilər. Əl hallarına və V formalı su toplama sahəsinə görə yoxlanılıb, hələ real tənzimlənmiş sahədə yox.
- **Ünvandan sahəyə.** Sizin gətirdiyiniz açıq məlumat fayllarını oxuyur və yalnız öz fayllarımız üzərində test olunub. Ağaclar mənbə deyil. Mənbələri sizin üçün gətirmək məxfilik mətnini gözləyir.
- **Tədqiqatlardan irəliləyiş.** Yalnız uydurma tədqiqatlar üzərində test olunub. Vərəqlərdə və işarələrdə (MarkupCraft) irəliləyiş və skan ilə model (BimCraft) müqayisəsi qurulmayıb.
- **Torpaqlar və yamaclar.** Yalnız dairəvi səthlər: pazvari və ya blok axtarışı və gərginlik çatı yoxdur.
- **Qovşaqlar.** Budaq başına bir radius, yük maşınının fırlanma yolları yoxdur və hələ korridora daxil olmur.
- **Sahə faylları.** Oxuyucular açıq format təsvirlərindən yazılıb və bizim yaratdığımız fayllar üzərində sınanıb. Real cihaz faylları lazımdır.
- **Əlaqələr və dəmir yolu.** Radio əlaqələri: yalnız boş fəza itkisi və çoxyollu (yağış zəifləməsi və ya anten diaqramları yoxdur) və heç bir dəmir yolu standartı yoxdur: hər dəmir yolu limiti yer tutucudur, heç bir dəmir yolu mühəndisinin yoxlamadığı qaralama rəqəmləri ilə.
- **Windows və macOS.** 0.8 kod imzası ilə imzalanmayıb. Windows xəbərdarlıq edə bilər, macOS isə sağ klik və sonra Aç tələb edir.

Qalan hər şey [Hələ qurulmayıb](topic:not-built-yet) səhifəsindədir. Əvvəlki buraxılış üçün bax: [0.7-də yeniliklər](topic:whats-new-0-7).
