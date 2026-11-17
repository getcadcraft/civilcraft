---
title: Sahəyə 3D-də baxın
summary: 3D görünüşü açın, fırladın, sürüşdürün və miqyaslandırın, şaquli şişirtməni və rənglənməni təyin edin, nələrin göstərildiyini seçin və trassaları, platformaları, xətləri, qırılma xətlərini, boruları, qurğuları və nöqtələri klikləyərək seçin.
keywords: yazılar, 3d yazılar, həmişə üzünüzə baxan yazılar, pikit yazıları, horizontal yazıları, nöqtə yazıları, sürüşmə, havadan görüntü, xəritə təbəqələri səthdə, 3d, üç ölçü, 3d görünüş, baxış kubu, kompas, orbit, perspektiv, paralel, izometrik, iz, relyef, model, sahə modeli, ətrafında uçuş, vizuallaşdırma, render, 3D-də borular, qurğular, dəhliz 3D, yol 3D, yol səthi, zolaqlar, bordürlər, səkilər, 3D-də bitkilər, 3D-də ağaclar, kolalar, hasarlar, landşaft 3D, 3D-də rampalar, pillələr, divarlar, döşəmə örtüyü, hardscape 3D
from: a16bafe1
---

3D görünüş sahəni bir model kimi göstərir: mövcud yer və layihə səthi, səthdə çəkilmiş horizontallar, qırılma xətləri və səth kənarı, hər trassa öz layihə profilində pikit işarələri ilə, dəhliz xətləri və yolun özü (zolaqlar, çiyinlər, lotoklar, bordürlər, zolaqlar və səkilər öz rənglərində), platformalar təmas xətləri ilə, boru şəbəkəsi borular və qurğular həqiqi yüksəkliklərində, və Landşaft iş sahəsindən bitkilər, döşəmə, yollar, divarlar, bordürlər, rampalar və pillələr. Planla eyni layihəni oxuyur, buna görə hər redaktə hər ikisində görünür.

## 3D görünüşü açın

1. Səth olması üçün planalma nöqtələri (və ya LandXML və ya layihə faylı) açın. Yalnız bitkilər, döşəmə və ya rampalar da görünüşü açmaq üçün kifayətdir.
2. {{key:D}} basın, ya da alətlər panelinin {{ui:View}} qrupunda {{ui:3D}} klikləyin.
   3D görünüş planın üzərində açılır, bütün sahəyə cənub-şərqdən baxır. İlk dəfə yüklənməsi bir az vaxt aparır.
3. Planə qayıtmaq üçün {{key:D}} yenidən basın, ya da {{ui:3D}} yenidən klikləyin. {{ui:Alignment}} və ya {{ui:Pad}} kimi çertyoj alətini seçmək də planə qaytarır, çünki çəkmə orada baş verir.

## Hərəkət

| Məqsəd | Bunu edin |
|---|---|
| Fırlatmaq (orbit) | Sol və ya orta düymə ilə sürükləyin |
| Sürüşdürmək | Sağ düymə ilə sürükləyin, ya da {{key:Shift}} basıb sürükləyin |
| Miqyas | Təkərlə fırladın; göstəricinin tərəfinə miqyaslanır |
| Trekpadda fırlatmaq | İki barmaqla sürüşdürün ({{key:Shift}} və sürüşdürmə sürüşdürür) |
| Trekpadda miqyas | Sıxın (pinch) |
| Toxunma | Bir barmaq fırladır; iki barmaqla sıxın miqyas üçün, hərəkət üçün sürüşdürün |
| Düymələr (görünüşün fokusu var) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} fırladır, {{key:Shift}} ilə sürüşdürür; {{key:Plus}} və {{key:Minus}} miqyas |

Görünüşün üzərindəki panel qalanını verir:

- Görünüş siyahısı: **İzo**, **Üst**, **Alt**, **Ön** (şimala baxır), **Arxa**, **Sol**, **Sağ**.
- {{ui:Perspective}}: basılı olduqda perspektiv görünüş; paralel proyeksiya üçün (qısaldılmadan) klikləyin.
- {{ui:Extents}}: hər şeyi yenidən göstərir. 3D görünüş açıq olduqda {{key:F}} eyni işi görür.

## Baxış kubu

Yuxarı sağ küncdəki baxış kubu görünüşlə birlikdə dönür. Oradan sahəyə baxmaq üçün tərəfə, kənara və ya künca klikləyin (kamera hamar dönür, sistem azaldılmış hərəkət istəmədikdə istisna). Kubu sürükləyərək orbitlə fırladın. Altındakı kompas halqası şimalı (şəbəkə şimalı, +Y) göstərir: sahəni şaquli ətrafında döndərmək üçün halqanı sürükləyin, ya da o tərəfdən baxmaq üçün N, E, S və ya W klikləyin. Yuxarı solda kiçik ev şəklində olan {{ui:Home}} bütün sahənin izo görünüşünə qaytarır. Klaviaturadan: kuba keçmək üçün {{key:Tab}}, oxlar tərəf, kənar və ya küncü seçir, {{key:Enter}} oradan baxır.

Planda eyni kub üst görünüşü göstərir. Hər hansı digər tərəfə, kənara və ya künca klikləyin (və ya sürükləyin) ki, 3D görünüş oradan baxmaq üçün açılsın: verilmiş istiqamətdən 3D-ə ən sürətli yol budur. Kubu kiçik ox işarəsi ilə əvəz etmək və ya gizlətmək üçün [CivilCraft parametrləri](topic:settings) bölməsində **Künc göstəricisi**nə baxın.

## Yüksəklikləri şişirdin

Sahələr adətən hündürlükdən daha genişdir, buna görə yüksəklik başlanğıcda **2×** uzadılır. Bardakı siyahıdan **1×**, **2×**, **3×**, **5×** və ya **10×** seçin, ya da [CivilCraft parametrləri](topic:settings) bölməsində **3D şaquli şişirtmə** altında (ikisi bir parametrdir). Yalnız görünüş dəyişir: həcmlər, profillər və ixraclar həqiqi miqyasda qalır.

## Səthləri rəngləyin

- **Yüksəklik zolaqları**: planın yüksəklik zolaqları ilə eyni zolaqlar və rənglər (zolaqların sayı sol paneldə **Görüntü** altında təyin olunur). Hər zolaq kənarı öz yüksəkliyində dəqiq kəsilir.
- **Bir rəng**: mövcud yer və layihə səthi hər biri sadə rənglə.
- **Xəritə təbəqələri**: plan altında göstərilən xəritə təbəqələri (georeferanslı şəkil, xəritə kafelləri və ya xəritə xidməti; bax: [Xəritə təbəqələri](topic:map-layers)) səthlərin üzərinə vərəq kimi qoyulur, beləliklə hava fotoşəkili təpələrdə görünür. Hələ gələn şəkillər gəldikcə doldurulur. Heç bir xəritə təbəqəsi göstərilmədikdə səthlər yüksəklik zolaqlarını saxlayır və görünüş bunu bildirir. Şəkil ekran üçündür: GLB və OBJ ixracları onu daşımır.

Hər iki səth göstərildikdə mövcud yer layihə səthinin üzərində şəffaf olur, beləliklə kəsimi (layihənin üstündə olan yer) və doldurmanı görə bilərsiniz.

## Nələrin göstərildiyini seçin

Bardakı {{ui:Show}} klikləyin və işarələyin və ya təmizləyin:

| Element | Nədir |
|---|---|
| Mövcud yer | Planalma nöqtələrindən qurulmuş səth (və ya LandXML-dən oxunmuş) |
| Layihə səthi | Dəhliz və platformalar daxil edilmiş mövcud yer (yalnız onlar olduqda) |
| Üçbucaq kənarları | Hər TIN kənarı, xətt kimi |
| Horizontallar | Hər səthin kiçik və böyük horizontalları, planın intervalında |
| Səth kənarı | Hər səthin xarici kənarı, öz yüksəkliklərində |
| Qırılma xətləri | Hər qırılma xətti, öz yüksəkliklərində |
| Trassalar və pikitlər | Hər trassa öz layihə profilində (profil yoxdursa yer üzərində), hər 50 ft və ya 20 m-də işarələrlə |
| Dəhliz xətləri | Hər iki tərəfdə asfalt kənarı, çiyin və təmas |
| Yol səthləri | Hər dəhlizin tikdiyi yol, onun yığımından: zolaqlar, çiyinlər, lotoklar, bordürlər, zolaqlar və səkilər, hər biri öz rəngində, layihə səthi üzərində |
| Bitkilər | Hər bitki, və hovuzlarda və hasarlarda olan bitkilər, bitki siyahısından ölçülmüş sadə formalar kimi: ağac gövdə və dairəvi tacdır (konifer üçün konus, uzun gövdədə palma üçün tuft), kolalar, hasar bitkiləri, çoxillik və yerörtükçü bitkilər günbəzdir, otlar tuftdur, dırmaşanlar nazik sütunlardır. Plan göstərən ölçüdə layihə səthində (və ya mövcud yerdə) dururlar: yetişmiş və ya əkilmiş halda |
| Döşəmə | Döşəmə və yollar onların düşmələri ilə, divarlar, bordürlər, pillələr və aralarında üfüqi meydançalarla pilləli qalxan rampalar |
| Platformalar və təmas | Hər platforma konturu öz yüksəkliyində və onun təmas xətti |
| Borular və qurğular | Borular öz daxil səviyyələri arasında dairəvi borular, qurğular lyukdan çalaya qədər |
| Planalma nöqtələri | Hər nöqtədə yüksəkliyi olan nöqtə (əvvəlcə söndür) |
| GIS təbəqələri | Planda göstərilən GIS təbəqələri öz rənglərində: xətlər və konturlar öz yüksəklikləri ilə, digərləri mövcud yer üzərində (onu dəqiq izləyir); nöqtələr kiçik xaçlar kimi. Səthdən kənarda yüksəkliyi olmayan fiqurlar çıxarılır və görünüş neçə ədəd olduğunu bildirir |
| Yazılar | Həmişə üzünüzə baxan adlar və dəyərlər: hər trassanın adı başlanğıcında və pikitləri hər 100 ft (və ya 100 m), hər əsas horizontalın yüksəkliyi, platformalar, xətlər və qurğular adı ilə, **Planalma nöqtələri** işarələnəndə hər nöqtənin nömrəsi və yüksəkliyi |

Yazılar necə döndərdiyiniz və miqyasladığınız zaman eyni ölçüdə və dik qalır, və yazının önündəki təpə onu gizlədir. Sıxlaşdıqda ən vacibi göstərilir, qalanları daha yaxına miqyaslandığınız qədər gözləyir: əvvəl trassalar, sonra qurğular, platformalar, xətlər, pikitlər, horizontallar və nöqtələr, yaxınlar əvvəl. Yalnız ekranda olurlar; ixraclar və çaplar onları buraxır.

Seçimləriniz, şişirtmə və rənglənmə bu brauzerdə yadda qalır.

Yol mövcud yer üzərində qurulur. Trassa və dəhlizlə, lakin hələ planalma nöqtələri və ya səth olmadan, yol müvəqqəti düz yer üzərində çəkilir: layihə profilinin orta yüksəkliyində, profil yoxdursa, yüksəklik 0-da səviyyə. 3D görünüşün altında və dəhlizin xassələrində xəbərdarlıq bunu deyir. Bu yalnız şəkildir: ondan həcmlər və ya kəsiklər çıxmır. Planalma nöqtələrini və ya səthi açın, yol özü həqiqi yerə keçir.

Şaquli şişirtmə yer üzünü uzadır, bitkiləri yox: onlar şişirdilmiş yer üzərində həqiqi hündürlüklərində və yayılmalarında durur, buna görə ağac hər parametrdə ağac kimi görünür. Bitkilər sadə formalardır, ətraflı modellər deyil: minlərlə belə fırlatmaq və miqyaslamaq üçün sürətli qalır.

## Borular və qurğular

- Boru daxil dibini təyin etdiyiniz daxil səviyyələrində və daxili diametr qədər yuxarıda tacında (crown) çəkilir. Diametrlər fut layihəsində düymlə, metrik layihədə millimetrlə, sağ paneldəki kimi.
- Qurğu lyukdan (yazılmış və ya səthdən) çalaya (ən aşağı daxil səviyyəsi minus çala dərinliyi) qədər gedir. Heç bir daxil səviyyəsi olmadan 5 ft (1.5 m) dərinlikdə çəkilir.
- Problemi olan borular və qurğular (sağ paneldə şəbəkə yoxlamasına bax) qırmızı çəkilir.
- Daxil səviyyəsi olmayan boru çəkilmir; görünüşün altındakı qeyd neçə ədəd olduğunu bildirir.

## 3D görünüşdən seçin

Trassanı (və ya onun yolunu), platformanı, xətti, boru, qurğu, planalma nöqtəsini, bitkini, rampanı və ya digər döşəməni klikləyin. Planda klikləmiş kimi seçilir: onun xüsusiyyətləri sağ paneldə açılır, orada redaktə edə bilərsiniz, və 3D-də hər şeyin üstündə seçim rəngində çəkilir. Planda seçdiyiniz hər şey 3D-də də vurğulanır. Göstəricinin yanındakı ipucu klikləndiyinizi şərq, şimal və yüksəklik ilə adlandırır. Boru və qurğular yerin altında olduqda belə klikləyə bilərsiniz; təpənin arxasında gizlənən xətt ondan keçilmir.

Qırılma xəttini klikləyərək hansı olduğunu görün: vurğulanır və status paneli onun adını yazır (qırılma xətlərinin öz xüsusiyyətləri yoxdur).

Yerə klikləyərək ipucunda orada şərq, şimal və yüksəkliyi oxuyun.

## Trassa boyunca sürün

3D panelində **Sürüş**ə klikləyin və trassa seçin. Görünüş sürücü oturacağına keçir: yoldan 3.5 ft (1.07 m) yuxarıda, onun layihə profilində (hələ profili yoxdursa, mərkəz xətti boyunca mövcud yerdə), onun boyunca irəliyə baxır.

- **Oynat** və ya {{key:Space}} seçdiyiniz sürətlə sürür (10-dan 65 mil/saat, ya 15-dən 100 km/saat); {{key:Space}} yenidən fasilə verir. Sonda dayanır; **Oynat** sonra əvvəldən başlayır.
- Sürüşdürücü hər hansı pikitə keçir; {{key:Left}} və {{key:Right}} geri və irəli 10 ft (5 m) addımlayır.
- Görünüşdə sürükləmək fasilə verir və ətrafa baxmağa imkan verir.
- **Dayandır** və ya {{key:Esc}} görünüşü əvvəlki yerinə qaytarır.

Şaquli şişirtmə sürərkən də tətbiq olunur: yolu olacağı kimi görmək üçün 1× təyin edin.

## Günəş işığı

3D panelində **Günəş**i açın və **Günəş işığı**nı işarələyin. Tarix, saat və onun saat qurşağını (UTC-dən fərq: yayda yay vaxtı) və sahənin en və uzunluğunu verin. Layihənin koordinat sistemi olduqda, onlar ondan doldurulur.

Sahə sonra günəşin olduğu yerdən işıqlanır, yer, dəhliz və platformalar üzərində **Kölgələr**lə; menyu günəşin azimutunu və hündürlüyünü və ya üfüqün altında olduğunu göstərir. Mövqelər NOAA-nın günəş tənliklərindən gəlir. Kölgələr şişirtmədən asılı olmayaraq düzgün düşür, lakin sahənin kənarında dayanır: ondan kənardakı təpələr və binalar kölgə salmır.

## 3D görünüşü ixrac edin

Bardakı {{ui:GLB}} və ya {{ui:OBJ}} klikləyin. Görünüşdə nə varsa həqiqi miqyasda (şişirtmə yoxdur), metrlərlə, Y yuxarı ilə saxlanılır. Ətraflı: [Sahəni 3D-də ixrac edin](topic:export-3d).
