---
title: Çayda su səthi profilləri
summary: Çayı mövcud yer səthindən modelləşdirin və standart addım üsulu ilə stasionar su səthi profillərini hesablayın: su səviyyələri, enerji, sürətlər, Frud ədədləri və planda daşqın sahəsi. Laboratoriya funksiyası; hər nəticə mühəndisin yoxlamasını tələb edir.
keywords: sahil bəndi, səmərəsiz axın sahəsi, kəsik redaktoru, çay, hidravlika, su səthi profili, geri su, standart addım, stasionar axın, 1D, eninə kəsiklər, Manninq, pürüzlülük, daşıma qabiliyyəti, kritik dərinlik, normal dərinlik, Frud, enerji xətti, daşqın sahəsi, daşqın, su basması, sahil xətləri, çay hissəsi uzunluqları, daralma, genişlənmə, subkritik, superkritik, qarışıq rejim, hidravlik sıçrayış
from: fb8bf425
---

CivilCraft verdiyiniz hər axın üçün çay boyunca stasionar, bir ölçülü su səthi profillərini hesablayır: hər eninə kəsikdə su səviyyəsi, qonşu kəsiklər arasında enerji balansından (standart addım üsulu). Yoxlanıldığı müddətdə laboratoriyadadır.

**Yalnız layihə köməyi.** Su səviyyələri, hər hansı kəs onlara arxalanmazdan əvvəl ixtisaslı mühəndisin nəzərdən keçirməsini tələb edir: 1D model yalnız kəsikləri, pürüzlülük qiymətləri, çay hissəsi uzunluqları və sərhədləri qədər yaxşıdır və körpüləri, su keçidlərini və çaydan kənara çıxan axını bilmir.

## Çayı çəkin

1. Əvvəlcə mövcud yer səthini qurun (nöqtələr, qırılma xətləri və ya açdığınız TIN).
2. **Səth** › {{ui:More}} altında {{ui:River}} seçin.
3. Çayın mərkəz xətti boyunca **yuxarı axındakından aşağı axına doğru** klikləyin, sonra {{key:Enter}} basın və ya ikiqat klikləyin.

CivilCraft yer səthindən hər 50 m (200 ft) mərkəz xəttinə düz, hər tərəfə 100 m (300 ft) kəsik kəsir. Çay pikitləri aşağı ucdan ölçülür, buna görə yuxarıya doğru artır. Sahillər hər kəsiyin ən aşağı nöqtəsinin hər iki tərəfində 10 m (30 ft) təxmin kimi başlayır.

Çayın daraldığı və ya qurğunun yerləşdiyi yerə kəsik əlavə etmək üçün çayı seçin, {{ui:Add a section}} klikləyin və onun üzərində kəsik xətti çəkin (hər iki istiqamətdə: aşağı axına baxanda soldan sağa işləməsi üçün döndərilir).

## Çayı qurun

Çayı **Xüsusiyyətlər**də görmək üçün seçin:

- **Axın rejimi**: subkritik (adi hal: aşağı sərhəddən yuxarıya doğru hesablanır), superkritik (yuxarı sərhəddən aşağıya doğru hesablanır) və ya qarışıq (hər ikisi, hər kəsikdə böyük xüsusi qüvvəli olan; önizləmə).
- **Axın profilləri**: hər biri üçün ad və axın (məsələn, 10 illik və 100 illik axın) və aşağı ucdakı sərhəd (və rejim subkritik olmadıqda yuxarı ucdakı): enerji meyli ilə **Normal dərinlik** (yataq meyli ilkin təxmindir), **Məlum su səthi** yüksəkliyi, ya da **Kritik dərinlik**.
- **Yer səthindən kəsiklər**: addım, sağa və sola nə qədər, sahil təxmini və iki Manninq n qiyməti; {{ui:Cut sections again}} kəsikləri əvəz edir (bir geri qaytarma addımı).
- **Kəsiklər cədvəli**: hər kəsik üçün sol və sağ sahil sürüşmələri, kanal n və sahil üstü n, aşağı axındakı növbəti kəsiyə çay hissəsi uzunluqları (sol sahil üstü, kanal, sağ sahil üstü; hesablamanın başlanğıcı planda ölçülür) və daralma və genişlənmə əmsalları (başlanğıc üçün 0.1 və 0.3: tədricən keçidlər). {{ui:Edit}} kəsik redaktorunu açır (növbəti bölmə); onun yanındakı nöqtə kəsikdə sahil bəndi və ya səmərəsiz sahə olduğunu göstərir.

Hər dəyişiklik bir geri qaytarma addımıdır ({{key:Mod+Z}}).

## Kəsiyi redaktə edin: sahillər, sahil bəndləri və səmərəsiz sahələr

Kəsikdə {{ui:Edit}} onun yer səthini çəkir və həll edənin oxuduqlarını sürüşdürməyə imkan verir: **sol və sağ sahil** (kəsiyi sol sahil üstünə, əsas kanala və sağ sahil üstünə bölürlər), hər iki tərəfdə **sahil bəndi** və **səmərəsiz axın sahələri**. Hər tutacağı ox düymələri ilə də yerini dəyişmək olar, hər rəqəm isə qrafikin yanında yazıla bilər. {{ui:Apply}} bir geri qaytarma addımıdır.

- **Sahil bəndi** yerə (sürüşmə) və tac yüksəkliyinə malikdir. Çaydan uzaqda olan yer, su səthi tacın altında olduğu müddətdə çaydan ayrılır: sahəsi, islanmış perimetri və daşıma qabiliyyəti hesaba qatılmır. Tacdan yuxarıda bütün kəsik yenidən sayılır. Sahil bəndi qoruduğu sahildən kənarda durur; sahillərin içərisindəki bənd işarələnir.
- **Səmərəsiz axın sahəsi** su saxlayır, lakin axın daşımır (bənd arxasında çuxur, körpü yaxınlığında ölü su). İki sürüşməsini verin və istəsəniz, altında sahənin səmərəsiz olduğu su səviyyəsini ({{ui:always}} boş olduqda) verin: bu səviyyədən yuxarıda o, qalanları kimi axır. Əsas kanalın bir hissəsini əhatə edən işarələnir.
- İki kəsik arasında daşqın sahəsi, hər iki kəsikdə olan sahil bəndinin arxasındakı yeri quru buraxır, su səthi orada tacın altında olduqda (iki tac arasındakı xətt düzdür).

## Hesablayın və nəticələri oxuyun

{{ui:Water surface profiles}} klikləyin. Seçdiyiniz profil üçün əldə edirsiniz:

- çay boyunca **qrafik** (axın soldan sağa): kanal yatağı, sahillər, su səthi, enerji xətti və kritik su səthi; kritik dərinlikdə saxlanılan kəsiklər dairəyə alınır;
- hər kəsik üçün **cədvəl**: çay pikiti, axın, kanal yatağı, su səthi, kritik su səthi, enerji xətti, dərinlik, kanalda və ümumi sürət, kanal Frud ədədi, axın sahəsi, yuxarı en, hər sahil üstündə və kanalda axın, enerji meyli və xəbərdarlıqlar;
- **xəbərdarlıqlar** sadə sözlərlə, məsələn, kəsiyin kritik dərinliyə təyin edilməsi, kəsik uclarından yuxarı su və ya iki kəsik arasında daşıma qabiliyyətində böyük dəyişiklik (aralarına kəsiklər əlavə edin).

{{ui:Table (CSV)}}, {{ui:Report}} (üsul, sərhədlər və hər cədvəl ilə düz mətn) və {{ui:Plot (SVG)}} yüklənmələrinizə saxlanılır. Hər biri yoxlama sətrini daşıyır.

**Xüsusiyyətlər**də {{ui:Show the flood extent}} işarələyin ki, seçilmiş profil üçün planda islaq sahə kölgələnsin, suyun dərinliyi sıfır olan yerdə isə su xətti çəkilsin. Kəsiklər arasında su səthi çay boyunca səviyyəlidir və çay pikiti ilə xətti dəyişir. Su tacın altında olduqda bənd arxasındakı yer quru qalır. Çayın dəhlizi daxilində suyun çatmadığı digər aşağı yer (məsələn, yol bəndinin arxasında) yenə kölgələnir: yoxlayın.

## Çertyojda və Problemlər panelində

Çayın xətləri planda, PDF-də və DWG-də öz təbəqələrində çıxır: **C-WATR-CNTR** (mərkəz xətti), **C-WATR-SCTN** (hər kəsik xətti, çay pikiti ilə) və **C-WATR-FLOD** (daşqın sahəsinin su xətti, profil üçün {{ui:Show the flood extent}} işarələnəndə). Çayın xəbərdarlıqları (kritik dərinliyə təyin edilmiş kəsik, kəsik uclarından yuxarı su, daha çox kəsik tələb edən daşıma qabiliyyətində dəyişiklik, bağlanmamış enerji balansı, sahillər içərisində bənd) **Problemlər** panelinə də gedir; onlar çaya aiddir və yarandıqları kəsikdə yerləşdirilir.

## Hesablama üsulu

- İki kəsik arasında enerji: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Daşıma qabiliyyəti hissələrə bölünməklə: hər sahil üstü n-in dəyişdiyi yerdə bölünür, K = Σ (1/n)·A·R^(2/3) (ABŞ vahidlərində 1.486/n); kanal bir parçadır, n dəyişdikdə kompozit n ilə. α daşıma qabiliyyətinin necə bölünməsindən gəlir.
- Sürtünmə meyli orta daşıma qabiliyyəti ilə, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², axının çəkisi ilə çay hissəsi uzunluğu üzərində.
- Axın aşağı axında sürətlənəndə daralma əmsalı, yavaşlayanda genişlənmə.
- Kritik dərinlik = minimal xüsusi enerji. Hər su səviyyəsi qapalı intervalda həll olunur, buna görə heç vaxt kritikin səhv tərəfinə keçmir; cavab olmadıqda o, kritik dərinliyə təyin edilir və işarələnir.

Proqram Manninq normal dərinliyi, düzbucaqlı kanalda kritik dərinlik və Çounun geri su misalı (*Open-Channel Hydraulics*, 1959, 10-cu fəsil) ilə müstəqil inteqrasiya edilərək yoxlanılıb. Eyni üsul ümumi 1D çay proqramlarında istifadə olunur, buna görə əl hesablaması və tələbə qeydləri uyğun gəlir.

## Su keçidləri və körpülər

Çayın **Xüsusiyyətlər**ində, **Su keçidləri və körpülər** altında {{ui:Add a culvert}} və ya {{ui:Add a bridge}} iki kəsik arasına bir qurğu qoyur (hər hissə ən azı iki kəsiyi saxlayır). Onun altındakı profil dəyişməz qalır; dərhal yuxarısındakı su səthi qurğudan gəlir və profil ondan yuxarıya davam edir. **Nəticələr** hər qurğunun cədvəlini əlavə edir: quyruq suyu, baş su səviyyəsi, hansı nəzarətin idarə etdiyi, açılışdan keçən axın və yol və ya göyərtə üzərindən axın. Yalnız subkritik axın.

- **Su keçidi** (qutu və ya dairəvi, bir və ya daha çox bərabər lüləli). Giriş nəzarəti giriş açıq olduqda çəpər axını, boğulduqda isə diafraqma axınıdır, yüksəkliyin bir və bir yarım qatı arasında qarışdırılır. Çıxış nəzarəti enerji balansıdır: giriş itkisi, sürtünmə və çıxış sürət başı, quyruq suyu ilə kritik dərinliyin orta hündürlüyündən və tacdan yuxarı, lülə boyunca düşmə çıxılır. Baş su səviyyəsi ikisindən böyüyüdür. **Su yol üzərindən keçə bilər** işarələyin, yolun çəpər axını isə lülələrlə axını bölüşür.
- **Körpü.** Açılış körpünün altındakı kəsikdir, dayaqlarda kəsilir, hər dayaq axın daşımayan sahə kimi. Açılışdakı su səthi aşağıdakı kəsikdən gəlir (genişlənmə əmsalı), yuxarıdakı kəsik isə açılışdan (daralma əmsalı). Açılış o quyruq suyunda axını keçirə bilmirsə, kritik dərinlikdə işləyir və körpü tıxanma kimi işarələnir. Su aşağı akkorda çatarsa, axın təzyiqli axındır (quyruq suyu aşağı akkordun altında olduqda şlüz tipli, üstündə olduqda boğulmuş), göyərtə üzərindəki su isə çəpər axını əlavə edir; yuxarı səviyyə onların cəminin axına bərabər olduğu səviyyədir.

Əmsallar (axın, giriş itkisi, çəpər) yuvarlaq rəqəmlərlə yazılmış standart qiymətlərdir. Onları öz layihəniz üçün dəyişin. Onlar su keçidi layihə təlimatlarında çap olunan uyğunlaşdırılmış qrafiklər deyil, buna görə su keçidinin həddinə yaxın baş su səviyyəsini təxmin kimi qəbul edin. Yol və ya göyərtə üzərindəki su, boğulmuş giriş, tıxanmış açılış və lülədə sürətli axın **Problemlər**də göstərilir.

## Qeyri-stasionar axın

Çayın **Xüsusiyyətlər**ində {{ui:Unsteady flow…}} daşqın hidroqrafını kəsiklər boyunca yönləndirir. Daxil olan axını saat və axın cütləri şəklində, hər sətirdə bir cüt yazın, aşağı axın meylini (normal dərinlik) və neçə saat işləməli olduğunu. Birinci axındakı stasionar su səthindən başlayır və tam bir ölçülü tənlikləri həll edir (dörd nöqtəli implisit sxem, zamanda 0.6 çəki ilə). Hər kəsikdə, baş verən saatla birlikdə, pik su səviyyəsi və axın, iki ucdakı axının qrafiki və həcm yoxlanışı (daxil olan, çıxan və saxlanılan dəyişiklik) alırsınız. Yoxlanılır: stasionar axının stasionar qalması, daxil olan axında pilləli dəyişikliyin yeni axının stasionar profilində bitməsi, həcmin bağlanması və daşqın dalğasının sürətinin kinematik dalğa ilə müqayisəsi. Subkritik axın, bir çay hissəsi, yan daxil olma yoxdur və işləmə daxilində su keçidi və körpü yoxdur.

## Qovşaqlar

Bir çıxışa birləşən çaylar: axınlar toplanır və aşağı çay hissəsinin başındakı su səthi birləşən çay hissələrinin uclarına qədər daşınır (qovşaqda eyni su səthi, sadə üsul: bucaq yoxdur, impuls yoxdur, buna görə aşağı Frud ədədləri üçün uyğundur). Model və testlər `river-structures.js` faylındadır; planda iki çayı birləşdirmək üçün panel hələ qurulmayıb.

## Hələ qurulmayıb

Müstəqil quruluşlar kimi bəndlər və qapılar, qovşaqlar üçün panel, qeyri-stasionar işləmə daxilində quruluşlar və superkritik qeyri-stasionar axın. Qarışıq rejim işləməsi iki kəsik arasında hidravlik sıçrayışı işarələyir, lakin onu yerləşdirmir.

**Çayların birləşdiyi yer.** Çayın Xüsusiyyətlərində **Tökülür** hansı çaya birləşdiyini göstərir. Birləşən çaylar birlikdə həll olunur: onların töküldüyü çay onların axınlarının cəmini daşıyır, və hər biri həmin çayın birinci kəsiyinin su səthində bitir (bərabər su səthi üsulu; axınların bucağını və impulsunu buraxır). Əsas çayı və çayı birləşdirmək üçün qovşağın altında qısa çay çəkin və hər ikisinin ora axmasına icazə verin. Nəticələrdə qovşaq cədvəli göstərilir. Bu nəticələrdə defolt qiymətlər (daralma 0.1, genişlənmə 0.3, kompozit pürüzlülüklü bir parça kanal, xüsusi qüvvə ilə qarışıq rejim) mühəndis yoxlayana qədər qalır və Nəticələr bunu bildirir.
