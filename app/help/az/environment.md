---
title: Kölgə, günəş enerjisi və açıq hava rahatlığı
summary: Kütlələrin bir gün və ya mövsüm ərzində saldığı kölgəni öyrənin, onun animasiyasını görün, damlardakı və divarlardakı panellərin tipik ildə nə qədər elektrik verəcəyini hesablayın, binanın yanındakı küçənin nə qədər rahat olduğunu görün (UTCI) və ilkin piyada küləyi rahatlığı qiymətləndirməsini alın.
keywords: kölgə tədqiqi, kölgə, günəş saatları, animasiya, günəş, PV, fotovoltaik, panellər, məhsuldarlıq, kWh, EPW, hava faylı, UTCI, istilik rahatlığı, açıq hava rahatlığı, istilik stressi, külək
from: 96e7af4d
---

**Ətraf mühit** bölməsi kütlənin **Xassələr**ində **Günəş saatları**nın altındadır. O, binalar kimi çəkdiyiniz kütlələrdən istifadə edir.

## Hava faylını yükləmək

Şəhərinizin tipik il üzrə hava faylını (**.epw**) seçin. Onlar EnergyPlus hava saytından və climate.onebuilding.org-dan pulsuzdur. Fayl bu ziyarət üçün brauzerinizdə qalır. Günəş məhsuldarlığı və rahatlıq tədqiqi ona ehtiyac duyur; kölgə tədqiqi layihənin koordinat sistemi olduqda onsuz da işləyir.

## Kölgə tədqiqi

Tarix seçin (və ya **Mövsüm**ü və son tarixi, gün ilə addımı işarələyin) və saat qurşağını seçin, sonra **Kölgə tədqiqini işə sal** düyməsini basın. Kütlələrin ətrafındakı torpaqda günəşli və ya kölgəli saatların xəritəsini; gün ərzində torpağın nə qədərinin kölgədə olduğunu göstərən cədvəli və oynada və ya addım-addım izləyə biləcəyiniz günün animasiyasını alırsınız. **Xəritəni saxla**, **Animasiya kadrlarını saxla** (bütün kadrlar bir şəkildə) və **Saatları saxla** (CSV) nəticələri saxlayır.

Torpaq ən aşağı kütlənin səviyyəsində düz qəbul olunur. Yamaclı torpaqda kölgə üçün relyefi oxuyan **Günəş saatları** istifadə edin.

## Günəş məhsuldarlığı

Panelin səmərəliliyini, hər dam və divarın nə qədərinin örtüldüyünü və sistem itkilərini təyin edin, sonra **Günəş məhsuldarlığını işə sal** düyməsini basın. Hər dam və divar üçün tipik ildə bir kvadrat metr panelin verəcəyi elektriki, qonşu kütlələrin ondan nə qədərini aldığını və hər kütlə üçün ümumi məbləği alırsınız. Model düymənin yanında sadə sözlərlə yazılır: bu tipik ildən planlaşdırma qiymətləndirməsidir, zəmanət deyil.

## Açıq hava rahatlığı

**Rahatlığı işə sal** açıq torpaqda və birinci kütlənin yanında (cənub, şimal, şərq və qərb tərəfləri) dayanan adam üçün Universal Termal İqlim İndeksini (UTCI) hesablayır, hər kütlənin kölgəsi ilə birlikdə. Nə qədər səma görünməsini, gündüz orta UTCI-ni və 32-dən yuxarı (istilik stressi) və 0-dan aşağı (soyuq stressi) saatları göstərir.

## Külək (ilkin qiymətləndirmə)

**Külək tədqiqini işə sal** hava faylınızdakı hər külək istiqaməti üçün (4, 8, 12 və ya 16 istiqamət) havanın axınını bir dəfə həll edir, seçdiyiniz ətraf mühit üzərində (açıq ərazi, şəhərətrafı və ya şəhər mərkəzi), sonra bütün ilin saatlıq küləyini toplayır. Xəritə torpağı rahatlıq sinfinə görə rəngləyir: yaşıldan (**oturmaq**) **dayanmaq**, **gəzmək** və **yeriməkdən** keçərək qırmızıya (**narahat**) qədər — bu, həd sürəti (4, 6, 8 və 10 m/s) saatların ən çox 5 %-də aşılan fəaliyyətdir. İkinci cədvəl küləyin 5 m/s-i keçdiyi saatların payından NEN 8100 dərəcəsini (A-dan E-yə) verir. Qəfil külək əmsalı saatlıq orta dəyəri vurub effektiv qəfil külək verir.

Sadə sözlərlə necə işləyir: binaların ətrafındakı qutuda lattice-Boltzmann böyük burulğan (large-eddy) axın həlledicisi (öz həlledicimiz, `lib/wind` kitabxanasında), seçilmiş pürüzlülük üzərində hündürlüklə artan külək sürəti profili və 10 m-də axın istiqamətindəki sürətlə müqayisədə torpaqdan təxminən 1.5 m yüksəklikdə sürət. **İlkin** qiymətləndirmə sürətli və kobuddur; **Standart** daha çox xana istifadə edir və daha uzun işləyir. Panel şəbəkənin kobud olduğunu bildirirsə (ən hündür binanın üstündə 10 xanadan az), və ya axın hələ dəyişirdisə, xəritəyə daha az inanın.

**Bu nə deyil.** Həlledici dərslik axınlarında (kanal, qapaqdan hərəkət edən kavitə) yoxlanılıb və kubda işlədilib ki, arxa iz və künclərdə sürət artımının düzgün göründüyü təsdiqlənsin. O, binaların külək tunelində ölçmələri ilə **yoxlanılmayıb**, buna görə hər nəticə təsdiqlənməmiş kimi etiketlənir. Onu layihə dəyəri, külək yükü və ya planlaşdırma sertifikatı üçün istifadə etməyin: külək mühəndisi düzgün tədqiqatı işə salmalı və təsdiq etməlidir. Düz torpaq, hamar bina divarları, hava stansiyasının pürüzlülük qısayolu və hədd cədvəli sadələşdirmələrdir; hədlər sizin orqanın istifadə etdiyi meyarlardan fərqli ola bilər.

## OpenFOAM ilə külək (əlavə)

Yuxarıdakı daxili külək mühərriki sınaqdır. Düzgün axın həlledicisi üçün **Parametrlər > Əlavələr** bölməsində **Piyada küləyi (OpenFOAM)** əlavəsini açın (siz açana qədər söndürülüdür). Bu, öz GPL lisenziyalı proqramıdır, CadCraft-ın qalan hissəsindən ayrı saxlanılır və OpenFOAM-ı özündə daşımır: onu özünüz quraşdırırsınız. Sonra külək blokunda **Mühərrik** OpenFOAM-ı siyahıya salır.

Bir dəfə quraşdırılanlar:

1. **OpenFOAM-ı quraşdırın** (openfoam.com-dan ESI v-seriyası; əlavə v2512 ilə sınaqdan keçirilib). Ubuntu və ya Debian-da (Windows-da WSL daxilində də): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, sonra `sudo apt install openfoam2512-default`. O, `/usr/lib/openfoam/openfoam2512` altında quraşdırılır. CadCraft işləmək üçün `blockMesh`, `snappyHexMesh` və `simpleFoam` tələb edir. (Ubuntu-nun öz arxivindəki köhnə `openfoam` 1912 paketi də işləyir, lakin onun funksiya obyektləri çökür; bu halda əlavə nəticə fayllarını özü oxuyur.)
2. **Köməkçini başladın** əlavənin `runner` qovluğundan Node.js ilə: `node cc-openfoam-runner.mjs serve`. Əgər OpenFOAM axtarış yolunda deyilsə, OpenFOAM-ın `etc/bashrc` yoluna işarə edən kiçik `runner.json` faylı verin (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) və onu `--config runner.json` ilə başladın. Köməkçi yalnız bu kompüterdə dinləyir və bir token çap edir.
3. **Tokeni yapışdırın** əlavənin sahələrinə külək blokunda (ünvan `http://127.0.0.1:8765` olaraq qalır) və **Köməkçini yoxlayın** düyməsini basın.

Sonra **Külək tədqiqini işə sal** hava faylındakı hər külək istiqaməti üçün bir hal üzərində işləyir: kütlələriniz səthə (STL) çevrilir, adi qaydaya görə ölçülmüş qutuda (ətrafda və yuxarıda 5 bina hündürlüyü, arxada 10), blockMesh və snappyHexMesh ilə toru qurulur, seçdiyiniz pürüzlülük üzərində atmosfer sərhəd təbəqəsi girişi ilə sabit k-epsilon RANS kimi işlədilir və 1.5 m-də sürət oxunur və eyni Lawson və NEN 8100 siniflərinə çevrilir. Heç nə kompüterinizdən çıxmır.

**Nə yoxlanılıb.** Nəticələrin üstündəki mətn bunu açıq deyir və hər saxlanılan CSV-nin bir hissəsidir. Əlavənin hal yazılması, nəticə oxunması və bütün boru kəməri OpenFOAM olmadan sınaqdan keçirilib; bir kub isə üç tor ölçüsündə həqiqi OpenFOAM ilə işlədilib (rəqəmlər layihə qeydlərindədir). O, binaların külək tunelində ölçmələri ilə **yoxlanılmayıb**. Bu ilkin oxunuşdur, layihə dəyəri və ya sertifikat deyil. Standart k-epsilon binaların qarşısında turbulentliyi çox qiymətləndirir, torpaq düzdür, divarlar hamardır və relyef və ya bitki örtüyü yoxdur.
