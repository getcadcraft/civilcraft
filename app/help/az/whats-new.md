---
title: 0.8 və 0.8.1 versiyalarında yeniliklər
summary: CivilCraft 0.8 yağış (planlaşdırmanızın üzərində fırtına axını), torpaq balanslaşdırıcısı, ən yaxşı marşrut tapıcısı, saxlayıcı gölməçələr, planalmalardan irəliləyiş, saytı layihədə saxlayan ünvandan sahəyə idxalçısı və torpaqlar və yamaclar, qovşaqlar və nişanlama, planalmanın tənzimlənməsi, açıq karyerlər, radio əlaqələri və dəmiryol strelkaları pəncərələrini əlavə edir. 0.8.1 DWG fayllarının oxunuşunu düzəldir.
keywords: yeniliklər, nə yenidir, buraxılış qeydləri, dəyişikliklər jurnalı, dəyişikliklər, 0.8, 0.8.1, versiya, yeni xüsusiyyətlər, yağış, fırtına, göllənmə, daşma, torpaq işləri, balans, kəsim və doldurma, daşıma, ən yaxşı marşrut, ən az xərc, trassa, saxlayıcı gölməçə, çıxış, boşalma, azad hündürlük, irəliləyiş, planalma, dron, ehtiyat yığını, ünvandan sahəyə, parsel, torpaq, daşqın, yamac dayanıqlığı, bishop, oturma, qovşaq, nişanlama, işarələr, görüş məsafəsi, tənzimləmə, ən kiçik kvadratlar, poliqon, açıq karyer, blok modeli, radio əlaqəsi, fresnel, strelka, keçid, dillər, problemlər, canlı, dwg
from: b0932cf0
---

Bu, CivilCraft 0.8 (2026-11-01) və 0.8.1 (2026-11-02) versiyalarında 0.7 ilə müqayisədə dəyişənlərdir. Əsas yeni hissələr planlaşdırmanızı və saytınızı sınayan alətlərdir (yağış, torpaq işləri, marşrutlar, gölməçələr, irəliləyiş) və zəmin, yollar, planalma, mədənlər, əlaqələr və dəmiryol üçün altı hesablama pəncərəsi.

## Yeni

### Planlaşdırmanızı sınayın

- **Yağış yağdırın.** {{ui:Yağış yağdırmaq…}} ({{ui:Səth}} altında) planlaşdırılmış zəmin üzərinə fırtına buraxır. Suyun platformalardan axdığını, aşağı küncələrdə göllənməsini və çox kiçik olan gölməçələrdən daşmasını izləyirsiniz. Axın animasiya olunur və həcmləri, pik çıxışı və hər gölməçənin CSV-sini verir. Standart xana kobudur ki, ilk baxış tez olsun; daha incə xana daha yavaşdır. Daşan gölməçələr Problemlər panelində də görünür.
- **Torpaq balanslaşdırıcısı.** {{ui:Torpaq balanslaşdırıcısı…}} kəsim doldurmaya bərabər olana qədər platformanı qaldırır və ya endirir və aralarında daşıma cədvəlini göstərir.
- **Ən yaxşı marşrut.** {{ui:Ən yaxşı marşrut…}}: başlanğıc və son nöqtə seçin, CivilCraft relyef üzərindən meyl və əyri limitlərinizə uyğun ən ucuz yolu tapır və ondan trassa yaradır.
- **Saxlayıcı gölməçələr.** {{ui:Saxlayıcı gölməçələr…}} zəmininizdən pilləni və saxlama həcmini hesablayır, çıxış qurğularını (diafraqma, sədd, V-çentik, tökülmə) qəbul edir, fırtınanı gölməçədən keçirir və saxlanılan pik axını, boşalma müddətini və azad hündürlüyü yoxlayır.
- **Planalmalardan irəliləyiş.** {{ui:Planalmalardan irəliləyiş…}} müxtəlif tarixli dron və ya skan səthlərini müqayisə edir: keçmiş zəmin və layihə ilə. Həcmə görə tamamlanma faizini, həddən artıq qazılmış və həddən artıq doldurulmuş sahələri, ehtiyat yığınlarını və bu templə işin nə vaxt bitəcəyini göstərir (təxmini kimi işarələnmiş).

### Saytı tanıyın

- **Ünvandan sahəyə.** {{ui:Ünvandan sahəyə…}} açıq parsel, bina, zonalaşdırma, torpaq, daşqın və relyef məlumatlarını bir sahədə düzür. Sahəni layihə faylında saxlaya bilərsiniz: yazdığınız ünvanı, hər mənbəni gətirdiyiniz gün və lisenziyası ilə, və gələn nəticəni. Layihəni yenidən açsanız və ya paylaşsanız, sayt hələ də oradadır və heç nə yenidən gətirilmir. Onu sahə faylı kimi də saxlaya və ya BimCraft-a göndərə bilərsiniz. Bax: [Ünvandan sahəyə](topic:address-to-site).

### Zəmin, yollar, planalma, mədənlər, əlaqələr və dəmiryol

- **Torpaqlar və yamaclar.** {{ui:Torpaqlar və yamaclar…}} yazdığınız qazmalar arasında torpaq profilini çəkir. Bişop metodu sonra zəmininiz üzərində, su səviyyəsi, əlavə yük və zəlzələ əmsalı ilə kritik dairəni axtarır. Təməlin oturması konsolidasiyanı, dərhal oturmanı və vaxtı əldə edir.
- **Qovşaqlar və nişanlama.** {{ui:Qovşaqlar və nişanlama…}} qolları küncə qalxma qövsləri ilə birləşdirir (hər qol üçün bir radius, ya da üç mərkəzli qövslər), layihə sürəti üçün görüş məsafəsini, görüş üçbucaqlarının yoxlanışını, keçidləri, dayanma xətlərini, işarələmələri və işarə cədvəli ilə işarələri hesablayır. Onlar planda çəkilir və adlandırılmış qatlarla .dxf kimi saxlanılır.
- **Planalmanın tənzimlənməsi.** {{ui:Planalmanın tənzimlənməsi…}} poliqon və ya şəbəkənin ən kiçik kvadratlar tənzimləməsini aparır: tənzimlənmiş koordinatlar, xəta ellipsləri, xi-kvadrat testi və uyğun gəlməyən ölçüdə bayraq. Sərbəst şəbəkələr, poliqonun kompas qaydası ilə bağlanması və RW5, GSI, JobXML və ya CSV sahə faylları daxildir; tənzimlənmiş nöqtələr CSV kimi saxlanılır.
- **Açıq karyerlər.** {{ui:Açıq karyerlər…}} qazma nümunələrini blok modelinə və yamac bucağınız daxilində son karyerə çevirir, sıyrılma nisbəti, pilləyə görə cədvəl və tərkib və tonaj əyrisi ilə. Gəlir əmsalına görə iç-içə karyerlər və diskontlaşdırılmış pul axını ilə istehsal cədvəli də var.
- **Radio əlaqələri.** {{ui:Radio əlaqələri…}} zəmininiz üzərində yerin şişkinliyi, birinci Fresnel zonası, əlaqə büdcəsi, solma marjası və çoxyollu kəsilmə ilə görmə xəttini yoxlayır və yolu təmizləyəcək dirəyin hündürlüyünü verir. Həmçinin lif itki büdcələri, marşrut miqdarları və qülləyə külək təsirini hesablayır.
- **Dəmiryol strelkaları.** {{ui:Dəmiryol strelkaları…}} keçid nömrəsinə görə strelka yaradır, paralel yollar arasında keçidlər və əyri üzərində genişlənən və kənara meylə əyilən quruluş ölçüsü. Strelka trassanın stansiyasında yerləşə bilər.

Bax: [Torpaqlar, qovşaqlar, planalmanın tənzimlənməsi, açıq karyerlər, radio əlaqələri və strelkalar](topic:soils-roads-survey-mines-links).

## Bütün tətbiqlərdə

- **Dillər.** 54 dil, onlardan on yeni. İngilis dilindən başqa dillər ana dili danışan oxuyana qədər maşın qaralamalarıdır. Kömək mövzularının çoxu hələ də ingilis dilindədir.
- **Alət paneli sətirləri.** {{ui:Parametrlər}} › {{ui:Ümumi}} › {{ui:Alət paneli sətirləri}}: Sarma (əvvəlki kimi), 2 sətir və ya 1 sətir. CivilCraft-ın Lenti ən çox istifadə olunan aləti böyük, sonrakıları kiçik, qalanlarını isə qrup adının oxunun arxasında göstərir.
- **Giriş qurğuları.** Tachpad, qələm, 3D siçan, idarəedici və MIDI tətbiqləri idarə edə bilər.
- **Problemlər.** Hər tətbiqdə xəbərdarlıq edən Problemlər paneli, tənzimləmə paketlərini oxuyan yoxlamalarla.
- **Canlı.** Canlı sessiyada kimin harada olduğunu göstərən görünüş.
- **Əlavələr.** İşıqlandırma əlavələri ilə əlavə siyahısı.
- **AI-nizi qoşun.** Qoşduğunuz hər köməkçi CivilCraft alətlərini idarə edə bilər. Onunla gəlir ki, CadCraft Studio daxilində bir kliklə qoşulma və yerləşdirilmiş konnektor hələ hazır deyil. Bax: [Köməkçi AI ilə saytınız üzərində işləyin](topic:assistants).

## 0.8.1-də düzəlişlər

- **DWG sinifləri bölməsi.** Səhv tip kimi oxunurdu (GitHub cadcraft#5). CivilCraft-da CadCraft, BimCraft, ModelCraft və TakeoffCraft ilə birlikdə düzəldildi.
- **İşləyərkən dil dəyişdirmək.** CadCraft Studio və paketlənmiş nəşrlər iş vaxtında dili dəyişə bilər. Əvvəllər yalnız ingilis dilində idi. Hər platformada hələ sınaqdan keçməyib: dil dəyişməsə, bizə bildirin.

## Bu versiyada hələ yoxdur

- **Bunlar hesablama köməkçiləridir.** Yeni pəncərələrdəki hər nəticə mühəndis yoxlamasına ehtiyac duyur. Torpaq möhkəmlikləri torpaq qrupunun tipik dəyərlərindən başlayır və pəncərə bunu bildirir.
- **Yağış yağdırmaq.** Sahə saytında incə xanada brauzerdə iki dəqiqədən çox çəkə bilər. Əl hallarında və V-şəkilli su toplama sahəsində yoxlanılıb, hələ real planlaşdırılmış sahədə deyil.
- **Ünvandan sahəyə.** Sizin gətirdiyiniz açıq məlumat fayllarını oxuyur və yalnız öz fayllarımızda sınaqdan keçirilib. Ağaclar mənbə deyil. Sizin üçün mənbələrin gətirilməsi məxfilik mətni gözləyir.
- **Planalmalardan irəliləyiş.** Yalnız uydurma planalmalarda sınaqdan keçirilib. Vərəqlərdə və qeydlərdə irəliləyiş (MarkupCraft) və model ilə skan (BimCraft) hələ qurulmayıb.
- **Torpaqlar və yamaclar.** Yalnız dairəvi səthlər: pazın və ya blokun axtarışı və gərginlik çatı yoxdur.
- **Qovşaqlar.** Hər qol üçün bir radius, yük maşınının sürülmə yolları yoxdur və hələ dəhlizə daxil olmurlar.
- **Sahə faylları.** Oxucular ictimai format təsvirlərindən yazılıb və bizim yaratdığımız fayllarda sınaqdan keçirilib. Real cihaz faylları lazımdır.
- **Əlaqələr və dəmiryol.** Radio əlaqələri: yalnız boş fəza itkisi və çoxyollu kəsilmə (yağış solması və ya antenna diaqramları yoxdur). Dəmiryol standartı yoxdur: hər dəmiryol limiti yer tutan dəyərdir, dəmiryol mühəndisinin yoxlamadığı qaralama rəqəmlərlə.
- **Windows və macOS.** 0.8 kodla imzalanmayıb. Windows xəbərdarlıq edə bilər, macOS isə sağ klik və sonra Aç istəyir.

Hər şey [Hələ qurulmayanlar](topic:not-built-yet) bölməsindədir. Əvvəlki buraxılış üçün bax: [0.7-də yeniliklər](topic:whats-new-0-7).
