---
title: Digər mülki proqramlardan keçid
summary: Tanış mülki layihələndirmə iş axınlarının CivilCraft-a necə uyğunlaşdığı və təcrübəli istifadəçilərin ilk saatda çaşdıran fərqləri.
keywords: keçid, köçürmə, tanış, fərqlər, iş axını, əmrlər, uyğunlaşdırma, cogo, koridor, planlaşdırma, boru şəbəkəsi, üslublar, komanda sətri
from: feae37d6
---

Civil 3D istifadə etmisinizsə, CivilCraft-dakı ideyaları artıq bilirsiniz: nöqtələr və nöqtə qrupları, sınma xətləri və sərhədləri olan TIN səthləri, PI ilə trassalar, PVI ilə profillər, koridorlara süpürülən assemblilər, yerə çatdırmaq üçün planlaşdırma, cazibə ilə boru şəbəkələri, LandXML. Fərqli olan onların ətrafında demək olar hər şeydir: çertyoj faylı yoxdur, komanda sətri yoxdur (yalnız {{ui:Klassik çertyoj}} menyu üslubunu seçməsəniz), üslublar yoxdur, Prospector yoxdur və parametr dialoqları yoxdur. CivilCraft brauzerdə kiçik, diqqətli bir alətdir və bu versiyada tam mülki paketin işinin bir hissəsini görür. Bu səhifə bildiklərinizi burada olanlarla uyğunlaşdırır.

:::tip
Civil 3D-nin ribbon-unu bəyənirsinizsə, **Parametrlər** › {{ui:CivilCraft}} › {{ui:Menyular, düymələr və siçan}} bölməsində {{ui:Mülki lent}} menyu üslubunu seçin: Əsas, Səthlər, Dəyişdirmə, Coğrafi mövqe, Görünüş və Çıxış nişanları, orta düymə planı sürüşdürür, və orta düymə ilə {{key:Shift}} 3D görünüşü fırladır. Əmrləri yazırsınızsa, {{ui:Klassik çertyoj}} komanda sətri əlavə edir (ALIGNMENT, PAD, PROFILE, ZOOM …). Bax [Menyular, düymələr və siçan](topic:menus-keys-and-mouse).
:::

## İş axını xəritəsi

| Nə etmək istəyirsiniz | Tanış yol | CivilCraft-da |
|---|---|---|
| Geodeziya nöqtələrini gətirin | Nöqtə faylı formatı ilə nöqtələri idxal edin | {{ui:Aç}}, sonra **Nöqtələri idxal et** bölməsində sütun sırasını yoxlayın ([Geodeziya nöqtələrini idxal edin](topic:import-points)) |
| Nöqtələri sıralayın | Nöqtə qrupları, təsvir açarları | Təsvirin ilk sözünə görə avtomatik qruplar; təsvir açarı yoxdur |
| Nöqtəni redaktə edin | Nöqtə redaktoru, tutacaqlar | Ona klikləyin və Xassələrdə yazın, ya da sürükləyin ([Geodeziya nöqtəsini redaktə edin](topic:edit-points)) |
| Mövcud zəmini qurun | Səth yaradın, nöqtə qruplarını məlumat kimi əlavə edin | Avtomatik: səth girişləri dəyişdikdə yenidən qurulur |
| Sınma xətləri əlavə edin | Polixətlərdən və ya xüsusiyyət xətlərindən sınma xətləri əlavə edin | Nöqtə qrupunu {{ui:Sınma xətti}} edin, ya da {{ui:Sınma xətti}} aləti ilə nöqtələrə klikləyin ({{key:B}}) |
| Səthi kəsin | Xarici sərhəd, gizli sərhəd, maksimum üçbucaq uzunluğu | {{ui:Sərhəd}} ({{key:O}}, yalnız xarici) və **Ən uzun xarici kənar** |
| Konturları göstərin | Səth üslubu | Sol paneldə **Göstər**: interval, hər böyük, etiketlər, zolaqlar, meyl oxları |
| Mərkəz xəttini planlaşdırın | Trassa yaratma alətləri, əyri və spiral parametrləri | {{ui:Trassa}} ({{key:A}}): PI-lərə klikləyin, {{key:Enter}}; radiuslar və spiral uzunluqları PI cədvəlində |
| Profil görünüşü yaradın | Profil görünüşü sihirbazı, zolaqlar | {{ui:Profil}} ({{key:R}}): planın altında bir profil görünüşü, həmişə sığdırılmış |
| Meyli layihələndirin | Profil planlaşdırma alətləri | {{ui:Təbii zəmindən başla}}, {{ui:PVI əlavə et}} ({{key:I}}), PVI-ləri sürükləyin, **Əyri L** yazın |
| Yol qurun | Assembly, alt-assemblilər, koridor, hədəflər, bölgələr | **Assemblini layihə profili boyunca süpür** qutusunu trassanın altında işarələyin; hər tərəfdə zolaq, çiyin və yan meyl, ya da hissələrdən (oluk, bordür, səki …) qurulan hər tərəf |
| Platforma tənzimləyin | Xüsusiyyət xətləri, tənzimləmə qrupları, tənzimləmə meyarları | {{ui:Platforma}} ({{key:G}}): kəsmə və doldurma meyilləri ilə zəminə çatan düz platforma |
| Həcmləri hesablayın | Həcm səthləri, həcm paneli | Sağ paneldə **Torpaq işləri**, şəbəkə metodu, canlı yenilənir |
| Yağış və ya kanalizasiya planlaşdırın | Hissə siyahısı və qaydaları olan boru şəbəkəsi | {{ui:Borular}} ({{key:P}}): aşağı axına doğru strukturlara klikləyin; sizin təyin etdiyiniz üç qayda; avtomatik invertlər |
| Başqaları ilə mübadilə | LandXML idxalı və ixracı | {{ui:Aç}} LandXML faylı; ixrac üçün {{ui:LandXML}} ([LandXML mübadiləsi](topic:landxml)) |
| Xətti işi CAD-ə göndərin | DWG-yə ixrac | {{ui:DWG}} (2000-dən 2018-ə format) və ya {{ui:DXF}} (R12) |
| Çap | Layoutlar, viewportlar, vərəq dəstləri | {{ui:PDF}}: seçilmiş miqyasda planın bir üfüqi vərəqi; plan və profil vərəqləri və kəsik vərəqləri PDF kimi |
| Fayllar arasında iş paylaşın | Məlumat qısayolları, istinadlar | Mövcud deyil: hər fayl üçün bir layihə |
| Geri alın | Geri al | {{key:Mod+Z}} və {{key:Mod+Y}}, 200 addım; görünüş parametrləri geri alma addımı deyil |

## Insanları çaşdıran fərqlər

**Komanda sətri yoxdur**, {{ui:Klassik çertyoj}} menyu üslubunu seçməsəniz. Alətlər alət paneli düymələri və tək hərflərdir: {{key:A}} trassa, {{key:G}} platforma, {{key:P}} borular, {{key:B}} sınma xətti, {{key:O}} sərhəd, {{key:R}} profil, {{key:I}} PVI əlavə et, {{key:V}} seçmə, {{key:F}} sığdır. Digər menyu üslublarında əmr adı yazmaq heç nə etmir. Bax [Klavişlər və siçan](topic:keyboard).

**Enter bitirir; ikiqat klik riskli.** Son nöqtəyə bir dəfə klikləyin, sonra {{key:Enter}} basın. Bu versiyada ikiqat klik də bitirir, lakin ikiqat klik etdiyiniz nöqtəni silir. Sağ klik bitirmir və ya təkrarlamır; yalnız onunla sürükləyəndə planı sürüşdürür.

**Hər şey dinamikdir, hər zaman.** Nöqtə qrupunu, radiusu, PVI-ni və ya platforma meylini dəyişdirin, səth, konturlar, koridor, daylight xətləri və həcmlər dərhal yenilənir. Yenidən qurulası heç nə yoxdur və köhnəlmiş heç nə yoxdur.

**Heç nə çertyoj obyekti deyil.** Plan dizaynın görünüşüdür, CAD əmrləri ilə redaktə edə biləcəyiniz çertyoj deyil. Öz xətlərinizi və ya mətninizi əlavə edə, qatın rəngini dəyişə və ya heç nəyi parçalaya bilməzsiniz. DXF-ə ixrac edin və çertyoju CAD proqramında bitirin.

**Üslub yoxdur.** Rənglər, xətt qalınlıqları, etiket ölçüləri və qat adları sabitdir (bax [Plan qatları](topic:plan-layers)). Tətbiq panelindəki **Kağız** və **Model** açıq və tünd ekran arasında keçid edir.

**Hər birindən biri.** Bir layihə üçün bir mövcud zəmin səthi, bir tənzimlənmiş nəticə, bir boru şəbəkəsi. Çoxlu trassa və platforma olması normaldır.

**Vahidlər etiketlərdir.** {{ui:ABŞ futu}} və ya {{ui:Metr}} seçmək heç nəyi çevirmir. Çertyoj miqyası yoxdur. Koordinat sistemi isteğe bağlıdır: onu {{ui:Koordinatlar}} altında təyin edin və heç nə yerini dəyişmir, yalnız rəqəmlərin nə demək olduğunu bildirir (bax [Layihənin koordinat sistemini təyin edin](topic:coordinate-systems)). LandXML-ə yazılanda futlar ABŞ geodeziya futu kimi qəbul olunur.

**Sınma xətti qrupları nöqtə nömrəsi sırası ilə birləşir.** {{ui:Sınma xətti}} olaraq təyin olunmuş qrup bütün nöqtələrindən keçən bir xətt olur, nömrə sırası ilə. Eyni kodu paylaşan xətlər (iki axın xətti hər ikisi "FL" kodlu) bir zığzaq xətt olur; onları əl ilə çəkin.

**Piketlər eynidir, metrlər fərqlidir.** Futlar 100 ft piket istifadə edir (12+34.56); metrlər 1000 m piket istifadə edir (1+234.567).

**Mac-da silmə.** Mac-da delete yazılmış düymə brauzerdə Backspace-dir. Seçimi silmək üçün Fn və delete, ya da {{ui:Delete}} düyməsini istifadə edin.

**Fayllar yükləmədir.** {{ui:Save}} hər dəfə `.civilcraft.json` faylını yükləyir; "açıq faylın üzərinə saxla" yoxdur. Saxlanılmamış işin bərpa nüsxəsi bu brauzerdə saxlanılır ([Saxlanılmamış işi bərpa edin](common:recover)). Nöqtə faylı açmaq nöqtələri soruşmadan əvəz edir. Bax [Açıb saxlaya və ixrac edə biləcəyiniz fayllar](topic:files).

**Qaydalar sizindir.** Boru şəbəkəsi qaydaları və koridor assemblisi standart olmayan yer tutucu dəyərlərlə başlayır. Hər hansı yoxlamaya inanmazdan əvvəl öz dəyərlərinizi təyin edin.

**Həcmlər şəbəkə əsaslıdır.** Kəsmə və doldurma iki səth arasında, daylight xətləri daxilində, incə şəbəkədən gəlir, şişmə və ya sıxılma olmadan. Onlar TIN-dən TIN-ə həcmə yaxındır, lakin eyni deyil.

## Nə çatışmır

Klotoiddən başqa spirallar, yol boyu dəyişən assemblilər, meyilli platformalar, axın tutumu və saxlama, hissə kataloqları, profildə borular, parsel layoutları və parsel ölçüləndirmə, ən kiçik kvadratlar tənzimlənməsi və geodeziya bazaları, DWG açmaq və daha çox. Tam siyahı, bu gün nə etmək üçün, [Hələ hazır deyil](topic:not-built-yet) səhifəsindədir.
