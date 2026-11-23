---
title: Hələ qurulmayıb
summary: Bu CivilCraft versiyasının hələ nə etmədiyi və bu gün onun əvəzinə nə etmək lazım olduğu.
keywords: çatışmayan, məhdudiyyətlər, yol xəritəsi, mövcud deyil, spirallar, genişlənmələr, dwg, dxf, qəbul ağızları, saxlayıcı, kəsiklər, gələcəkdə gələn, limitlər
from: b91588d4
---

CivilCraft erkəndir. Bu səhifə cari versiyanın nə etmədiyini sadalayır ki, onu axtarmayasınız. Burada heç nə tarix üçün vəd edilmir.

## Nöqtələr

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| İlk nöqtə faylına ikinci nöqtə faylı əlavə etmək | Əvvəlcə faylları mətn redaktorunda və ya cədvəldə birləşdirin |
| Nöqtə mətn faylı ixrac etmək | LandXML ixrac edin (nöqtələr CgPoints kimi gedir), GIS {{ui:İxrac}} istifadə edin (P, N, E, Z və D sahələri olan nöqtələr) və ya nöqtələri cədvələ {{ui:Kopyala}} edin |
| Nöqtə etiketi üslubları, təsvir açarına görə simvollar, xətt kodlarından əyrilər (qövslər), layihələr arasında paylaşmaq üçün təsvir açar faylı | Etiketlər nömrəni, hündürlüyü və təsviri və ya daha azını göstərir ([CivilCraft parametrləri](topic:settings)); açarlar layihə faylında saxlanılır |
| Vahid çevrilməsi | İdxaldan əvvəl faylı çevirin; **Vahidlər** yalnız etiketi dəyişir |

## Səthlər

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Nöqtələrdən qurulan birdən çox səth | Hər səth üçün bir layihə |
| Daxili sərhədləri gizlətmək | **Ən uzun xarici kənar** və ya xarici sərhəd istifadə edin |
| Çəkilmiş sərhəd xəttindən birini seçmək və ya redaktə etmək | {{key:Mod+Z}}, və ya {{ui:Çəkilmiş xətti sərhədləri sil}} və yenidən çəkin |
| LandXML-dən oxunmuş səthi redaktə etmək (sərhəd xətləri, sərhəd) | {{ui:Səthi nöqtələrdən yenidən qur}} |
| Hündürlük şəbəkəsindən qurulmuş səthi redaktə etmək | Şəbəkəni başqa seçimlərlə yenidən idxal edin |
| Koordinat sistemi dəyişəndə LandXML-dən oxunmuş səthi çevirmək | Əvvəl {{ui:Səthi nöqtələrdən yenidən qur}} |
| Etiketli nöqtə hündürlükləri və meyl dəyərləri | Onları status çubuğunda oxuyun və ya Abadlaşdırma iş sahəsində **Meyl analizi** ilə səthi meyllə rəngləyin ([Abadlaşdırma üçün şaquli planlaşdırma](topic:landscape-grading#grading-checks)) |

## Trassalar və profillər

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Klotoiddən başqa spirallar; iki əyri arasında spiral (mürəkkəb keçidlər) | Əyrinin uclarında klotoid spirallar mövcuddur; digərləri adlandırılır və LandXML idxalında keçilir |
| İki başqa PI arasında PI əlavə etmək | Trassanı yenidən çəkin və ya PI koordinatlarını yenidən yazın |
| Obyektlərdən, ofsetlərdən və genişlənmələrdən trassalar | PI-lərlə çəkin |
| Şaquli əyri üçün K yazmaq | L yazın (K göstərilir) |
| Dairəvi və assimmetrik şaquli əyrilər | Yalnız simmetrik parabolik şaquli əyrilər |
| Trassaya birdən çox layihə profili | Hər variant üçün bir trassa |
| Profil görünüşünü böyütmək, profilin altında profil zolaqları | Profil görünüşü bütün trassaya uyğunlaşır; onu [plan və profil vərəqlərində](topic:plan-profile-sheets) çap edin |
| Kəsiklər DWG və ya LandXML-də | PDF-də kəsik vərəqləri; sahə və həcmlərin {{ui:CSV}}-si |
| Bucaqla nümunə xətləri və ya yol boyunca fərqli enli nümunə xətləri | Trassanın bütün uzunluğu üçün hər tərəfdə bir en |

## Korridorlar

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Orta xətlər, maneələr və şablonları fırladan yüksəltmə | Onları şablon kimi çəkin ([Korridor şablonları](topic:corridor-templates)); piketə görə şablonlar hələ yüksəltməni qəbul etmir |
| İki regionun şablonları arasında tədricən dəyişiklik (keçidlər, daralmalar) | Piketdə şablonu dəyişin və ya nöqtəyə daralma kimi çəkilmiş xəttə en hədəfi verin |
| Kənar ətrafında fırlanma, LandXML-də yüksəltmə | Dairəvi əyrilərdə yüksəltmə mərkəz xətti ətrafında fırlanır; zolağı xüsusiyyət xəttinə en hədəfi ilə genişləndirin |
| Yan yamaclar üçün hədəflər (daylight xətti və ya səthə), korridorların öz səthləri | Hədəflər örtük kənarlarını və çiyinləri hərəkət etdirir ([Korridorlar](topic:corridor)); korridor layihə səthinə salınır |
| Qovşaqda bordür dönmələri, dönmə zolaqları və adacıqlar zəmini; yan yolun sonu əsas yolun kənarına əyri bucaqda kəsilir; birləşən yol planda, uzunluqda və sahədə; cığır planda birləşdirilmiş yol kimi | Birləşən yollar düz birləşdirilir, əsas yolun kənarı açılır və yan yol ona hamarlanır ([Yollar birləşdikdə](topic:corridor#where-roads-meet-roads-pads-and-paths)); cığır layihə səthində və 3D-də yolun kənarında dayanır |
| Korridorlar LandXML yol kimi ixrac; IFC ixracında trassada ikinci korridor | Layihə səthi ixrac olunur |
| Layihə səthini dəyişən relyef şablonları, 3D və ya kəsiklərdə | Hər təbəqənin sahə və həcmlərini verirlər ([Relyef şablonları](topic:corridor-templates#terrain-templates)) |
| Sürət, təkər sürüşməsi, sükan vaxtı, qoşqu sükanı və ya gövdə təmizliyi ilə hərəkət yolları; standart layihə nəqliyyat vasitələri kitabxanası; sürüklənərək çəkilmiş nəqliyyat vasitəsi | Aşağı sürətli hərəkət yolları xüsusiyyət xətti və ya trassa boyunca, öz nəqliyyat ölçüləriniz ilə ([Nəqliyyat vasitəsi hərəkət yolları](topic:swept-paths)) |

## Torpaq işləri və həcmlər

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Səkilər, layihəyə salınmış açıq xüsusiyyət xətləri, başqa yerdən xüsusiyyət xəttinə şaquli planlaşdırma | Xüsusiyyət xəttini bağlayın ([Xüsusiyyət xətləri](topic:feature-lines)) və ya mövcud zəminin sərhəd xətti kimi istifadə edin |
| Xüsusiyyət xəttinin təpəsini əlavə etmək və ya silmək | Xətti yenidən çəkin və ya onun pilləli ofsetini edin |
| Çəkilmiş sərhəd xətlərində qövslər (survey nöqtələrindən keçən), xüsusiyyət xətlərində spirallar | Qövslü xüsusiyyət xətti çəkin və onu mövcud zəminin sərhəd xətti kimi istifadə edin |
| Məsafəyə, hündürlüyə və ya başqa səthə şaquli planlaşdırma | Yalnız mövcud zəmin üzərinə daylight |
| Platforma künci əlavə etmək və ya silmək | Platformanı silin və yenidən çəkin |
| TIN–TIN (prizma) həcmləri, şəbəkə xanasının ölçüsünü seçmək | Şəbəkə üsulu, xana ölçüsü sizin üçün seçilir |
| Şişmə və sıxılma, torpaq üst təbəqəsi, örtük dərinlikləri | Hesabatlanmış rəqəmlərə amilləri özünüz tətbiq edin |
| Pulsuz daşınma və yenidən daşınma xərcləri, fərqli trassalar arasında daşınma, planda yerləşdirilmiş götürmə çalaları və tullantı sahələri | Balans nöqtələri, köçürülmüş həcmlər və orta daşınma məsafələri ilə kütlə daşınma diaqramı |

## Boru şəbəkələri

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Layihədə birdən çox şəbəkə | Yağış və məişət kanalizasiyası üçün ayrı layihələr |
| Su magistralları: su keyfiyyəti və yaşı, qaydaya əsaslanan idarəetmə, digər klapan növləri (axın tənzimləyici, drossel, saxlayıcı), gücə görə verilən nasoslar, təzyiqdən asılı tələbat, Darcy–Weisbach seçimi, divar qalınlıqları və təzyiq sinifləri ilə boru kataloqu. Təzyiq şəbəkələrinin qalan hissəsi laboratoriyadadır: [Su magistralları](topic:water-mains) | Bunları su paylama proqramında yoxlayın; məişət axınları [Məişət kanalizasiyası axınları](topic:sanitary-design)-dadır |
| Zaman ərzində kanalizasiya axınları (hidrogrəflər, dinamik marşrutlaşdırma, saxlama, nasoslar, daşmalar) | [Məişət kanalizasiyası axınları](topic:sanitary-design) layihə vərəqinin istifadə etdiyi sabit pik axını verir |
| Qəbul ağzının tutumu, küçə suyunun yayılması, saxlayıcı marşrutlaşdırma, hidrogrəflər, bir birləşmə əmsalından başqa enerji itkiləri | Onları başqa proqramlarda yoxlayın; axınlar, ölçülər və qradiyent xətləri [Yağış drenajı](topic:storm-drainage)-dadır |
| PDF çapında, DWG, DXF və ya LandXML-də su hövzələri; səthdən hövzələr (su bölücüləri) | Su hövzələrini əl ilə çəkin; layihə faylında saxlanılır |
| Boru kataloqları, dairəvi olmayan borular, şaquli qutu və ya silindr olmayan strukturlar (konuslar, pillələr, skamyalar), kitabxanada drenaj kateqoriyası | Parametrlərdən struktur növləri ([Boru şəbəkəsi](topic:pipe-network)); diametri olan borular |
| Profil görünüşündə borular, əyri borular | Sağ paneldə girişləri və örtüyü oxuyun |

## Sahələr

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Sahələrin ölçüyə və ya cəbhəyə görə planlaşdırılması, ətrafdakı xətlərdən sahələr, sahənin hüquqi zolağı | Hər sahəni künclərilə çəkin və ya onun istiqamətlərini daxil edin |
| Plan üzərində əyri cədvəlləri və xətt cədvəlləri; əl ilə köçürülmüş etiketlər | Hər kurs boyu özü ilə etiketlənir |
| LandXML-də sahələr | Sahələr layihə faylında saxlanılır və PDF, DWG və DXF-ə gedir |

## Poliqonlar

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Ən kiçik kvadratlar tənzimlənməsi, nəqliyyat qaydası, bucaqların məsafələrə görə çəkilməsi | Kompas qaydası |
| Sapma bucaqları, zenit bucaqları və maillik məsafələri, triqonometrik nivelirləmə ilə hündürlüklər | Üfüqi məsafələri və bucaqları düzgün azaldın, və ya istiqamətlər |
| Yan nöqtələr, məlumat toplayıcılardan xam məlumat faylları | Nöqtələri nöqtə faylı kimi idxal edin |

## Tirələmə

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Ofset tirələri (tirənin arxasına qoyulmuş istinad nöqtələri), tutma nöqtəsində yamac tirələri | Lazım olan ofsetlərdə tirə qoyun, çiyindən kənara da daxil olmaqla |
| Tirələri birbaşa məlumat toplayıcısının öz formatına göndərmək | CSV əksər məlumat toplayıcılarının ofis proqramında açılır |
| Boruları, platformaları və sahələri tirələmək | Trassa yaxınlığında survey nöqtələrindən və ya sahənin kurslarından istifadə edin |

## Fayllar və çıxış

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| DWG və ya DXF-dən mətn, şrixlamalar və ölçülər; kağız sahəsi; bağlı çertyojlar (xref); ikili DXF | Model sahəsindən xətt işləri açılır ([DWG və ya DXF-i xətt işi kimi açın](topic:open-dwg-dxf)); bağlı çertyojları ayrıca açın |
| Sürüklənərək bir neçə nöqtəni eyni anda köçürmək | Kəsin və yapışdırın, və ya hər birini ayrı-ayrılıqda redaktə edin |
| Portret vərəqlər, öz ştamp blokları, yerləşdirdiyiniz viewport-lar, DWG-də plan və profil vərəqləri | Hər PDF üçün bir landşaft plan vərəqi, və ya trassa boyunca plan və profil vərəqləri (PDF) |
| Yüksəklik zolaqlarının və profillərin çapı | Zolaqlar yalnız ekrandadır; lazım olsa ekran şəkli çəkin |
| Qat adlarını, rənglərini və ya etiket üslublarını dəyişmək | DXF ixracından sonra CAD proqramında dəyişdirin |
| Bulud saxlanması və versiya tarixçəsi | `.civilcraft.json` fayllarını saxlayın və ehtiyat nüsxəsini götürün; bir layihə üzərində birlikdə işləmək üçün CadCraft Studio-da canlı sessiyadan istifadə edin ([Bir sahə üzərində birlikdə canlı işləyin](topic:work-live)) |
| CadCraft Studio iPad və iPhone üçün, və Google Play-dən | Cihazda brauzerdə CivilCraft istifadə edin; Android-də CadCraft Studio getcadcraft.com/download-dan APK ilə quraşdırılır |
| Eyni anda bir neçə nöqtə və ya layihə faylı açmaq | Hər dəfə bir fayl açılır (bir-birinə aid GIS faylları, məsələn shapefile-ın hissələri, birlikdə açılır) |

## Abadlaşdırma

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| İstehsalçıların başlıqları və sprinkler ağızları | Ümumi başlıqlar, və ya öz başlıqlarınızı fayldan əlavə edin; istehsalçı məlumatları icazə verdikcə daxil olur |
| Damcı xətləri üçün maksimum yan uzunluqlar, zaman ərzində axınlar, nasoslar, döngəli boru şəbəkələri | Damcı xətlərini istehsalçının dərc etdiyi uzunluqda saxlayın; yoxlama budaqlanan şəbəkə tələb edir |
| Konkav sərbəst formalı obyektin dəqiq konturu; onun yer altı həcminin dəqiq ölçülməsi | Qabarıq örtük hamarlanır və yer altı həcmi təxminidir (Xüsusiyyətlərdə deyilir) |
| BimCraft-ın və ModelCraft-ın öz kitabxanasından Yerləşdir ilə bitkilər | Abadlaşdırma IFC-ni ixrac edin və binanın yanında BimCraft-da açın |
| 3D görünüşdə ətraflı bitki modelləri (yarpaqlar, budaqlar, fəsillər); sərbəst formalı obyektlər və suvarma | Bitkilər 3D-də bitki siyahısından ölçülmüş sadə formalar kimi göstərilir ([Sahəni 3D-də görün](topic:site-3d)); ModelCraft-ın səpələnməsi bitki şəkilləri yaradır |
| Səthdə arxasında hamarlanmış səviyyəni saxlayan Bərk örtük divarları | Platformaya və ya meydançaya şaquli kənarlar verin: onlar səthdə dayaq divarlarıdır ([Şaquli planlaşdırma](topic:grading)) |
| Öz simvollarınızda SVG çevrilmələri; öz GLB bitki modellərinizin teksturaları və rəngləri; sıxılmış GLB həndəsəsi | Əvvəlcə rəsm proqramınızda çevrilmələri düzləşdirin; modellər bitkinin rəngi ilə çəkilir; GLB-ni sıxılmadan ixrac edin ([Bitki qrafikası](topic:plant-graphics)) |
| Kitabxana hesabınızda saxlanılan öz bitki siyahınız (tətbiqdə redaktə olunur) | Layihənin öz siyahısını Bitki cədvəlində redaktə edin və bitki faylı kimi saxlayın |
| Pəncərəsiz köməkçilər üçün landşaft alətləri (fayl serveri və komanda sətri) | Onlar CivilCraft pəncərəsi açıq olduqda işləyir ([Süni intellekt köməkçisi ilə işləyin](topic:assistants)) |

## Elektrik xətləri

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Ölkənin standartı daxili olaraq (yük halları, təmizliklər, əmsallar) | Standartınızın dəyərlərini {{ui:Yük halları və həddlər…}} bölməsində təyin edin və kitabxananızla birlikdə paket kimi saxlayın ([Paketlər](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Naqildən ağac tacına və ya xətt yanındakı divara yan məsafə | Xəttin keçdiyi bitkilər və divarlar üzərində şaquli təmizlik ([Elektrik xətti yoxlamaları](topic:power-line-checks#clearances)) |
| Naqil sürünməsi və yeni naqilin uzanması | Onları naqil cədvəlindəki temperaturlar vasitəsilə nəzərə alın |
| Torpağa basdırılmış kabellərin istilik qiyməti (döşənmə üsulundan cərəyan qiyməti) | Kabel elementində təchizatçınızın cərəyan qiymətini daxil edin |
| Qısa qapanma, mühafizə və torpaqlama tədqiqatları | Xüsusi elektrik proqramından istifadə edin; CivilCraft şəbəkənin uzunluqlarını və kabelləri verir |
| Üzv-üzv layihələndirilmiş qəfəs qüllələri və torpaqda ankerlər | Dayaqlar nominal yükü ilə, ankerlər isə nominal yükü ilə yoxlanılır |
| `.DON` tədqiqat faylı onu oxuyan proqramda yoxlanılır | Faylı orada yoxlayın; real birini sınamaq üçün bizə nümunə göndərin |
| Elektrik xətləri 3D görünüşdə və IFC-də | Plan, xəttin profili, vərəqlər və GIS qatları |
| Pəncərəsiz köməkçilər üçün elektrik xətti alətləri | Onlar CivilCraft pəncərəsi açıq olduqda işləyir ([Süni intellekt köməkçisi ilə işləyin](topic:assistants)) |

## Bina kütlələri

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Zoninq kodlarının kitabxanası və ya istənilən şəhərin qaydaları | Öz normativinizdən limitləri yazın ([Zoninq limitləri](topic:zoning-limits)) |
| Divarlarda işıq (fasad işığı), külək | [Günəş saatları](topic:sun-hours) yalnız birbaşa günəşi sayır |
| Ağaclardan, bitkilərdən və ya kütlə kimi çəkilməyən hər şeydən kölgə | Qonşu binaları kütlə kimi çəkin |
| Kütlələrdə dam formaları | Düz üstlü kütlələr |
| Kütlə BimCraft-da işlənəndə açılışlar, damlar və divar növləri | BimCraft hər mərtəbədə və döşəmədə sadə xarici divarlar yaradır; qalanını orada əlavə edin |

## GIS və koordinat sistemləri

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| File Geodatabase; KML üslubları, ikonlar, yer üstü qatları və şəbəkə linkləri | GeoPackage, shapefile və ya GeoJSON-a çevirin; KML yer işarələri üslubları olmadan oxunur |
| GIS obyektlərini və ya onların atributlarını redaktə etmək | GIS proqramında redaktə edib yenidən idxal edin. Analiz paneli yeni qatlar yaradır (buffer, overlay, birləşmə, seçmə) və sahə və uzunluq sahələri əlavə edir, lakin obyekti yerində redaktə etmir |
| Şəbəkə və raster analizi, düz və ya kvadrat ucları olan və bir tərəfli buferlər, atribut cədvəlində sətir əlavə və ya silmək və sahənin tipini dəyişmək, əl ilə sinif rəngləri, çaplarda üslub legendası | Obyekt seçmək üçün Seç istifadə edin və ondan qat yaradın; düz uclar təklif olunmur. Atributa görə rənglənmə və atribut cədvəli hazırdır: bax [Qatı atributa görə üslublaşdırın](topic:gis-symbology) və [Qatın atribut cədvəli ilə işləyin](topic:gis-table) |
| Etiket üslubları (ölçü, yerləşmə) və bir-birindən qaçan etiketlər | Etiketlər bir ölçüdədir və obyektlər sıx olduqda üst-üstə düşə bilər |
| Şaquli datumlar və geoid modelləri | Hündürlüklər faylın verdiyi kimi istifadə olunur; şaquli datumu özünüz yoxlayın |
| NAD27-dən NAD83-ə sahəyə görə təklif olunandan başqa şəbəkə sürüşmələri (OSTN15; digər datumlar üçün NTv2 faylı əlavə etdikdə işləyir), bir neçə şəbəkə eyni anda, şaquli şəbəkələr | Öz datumunuz üçün şəbəkə faylını özünüz əlavə edin; layihəyə bir şəbəkə |
| DXF və ya 3D ixraclarında xəritə qatları | Xəritə qatları PDF çapına gedir və DWG yanında şəkil kimi |
| Giriş tələb edən xəritə serverləri, açar və ya token | Açıq xidmətlərdən və ya coğrafi istinadlı şəkil faylından istifadə edin |
| Səthdən, zəmin modelindən və ya yüksəklik şəbəkəsi və LiDAR alətlərindən LAS və ya LAZ fayllarının yazılması | Səthləri GeoTIFF yüksəklik şəbəkəsi kimi ixrac edin. [Nöqtə buludları](topic:point-clouds) əlavəsi təmizlənmiş buludu LAS 1.4 və ya LAZ kimi yazır |
| LiDAR intensivliyi, rəng və qaytarmalar; bir neçə zolağı olan yüksəklik şəbəkələri; 200 MB-dan böyük şəbəkə və ya LiDAR faylları | LiDAR yalnız sinif üzrə filtrlənir, şəbəkələr birinci zolağı istifadə edir; böyük faylları əvvəl parçalara kəsin |

## Giriş

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| Toxunuşla qutu seçimi ({{key:Shift}} tələb edir) | Hər survey nöqtəsini uzun basaraq əlavə edin |
| Çəkərkən yazılmış koordinatlar və ya məsafələr | Təqribən çəkin, sonra PI cədvəlində dəqiq PI koordinatlarını yazın |
| Platforma künclərinin və strukturların koordinatlarını yazmaq | Tutacaqlarını sürükləyin; dəqiqlik üçün yaxınlaşdırın və status çubuğunda E və N-ə baxın |
| Obyektlərə yapışma (survey nöqtələrindən başqa sərhəd xətləri üçün) | Yaxınlaşdırın və status çubuğuna baxın |

## 3D görünüş

| Hələ qurulmayıb | Bu gün əvəzinə |
|---|---|
| 3D görünüşdə çəkmək və ya redaktə etmək | Planda çəkin və redaktə edin; 3D görünüş hər redaktəni izləyir |
| 3D-də klikləməklə korridor xüsusiyyət xətlərini və ya GIS obyektlərini seçmək | Onları planda klikləyin |
| Həddindən artıq böyüdülmüş görünüşü və ya futda ixrac | İxraclar metrdə real miqyasdadır; bax: [Sahəni 3D-də ixrac edin](topic:export-3d) |
| GLB və ya OBJ ixraclarında etiketlər, 3D-də etiket ölçüləri və üslubları | Etiketlər yalnız 3D görünüşdə, bir ölçüdə göstərilir; bax: [Sahəni 3D-də görün](topic:site-3d) |
| Fotolardan teksturalar, sürüşün videoya yazılması, sahədən kənar kölgələr, 3D görünüşdə günəş saatları | Səthlərin üzərində xəritə qatları; bir zamanda sürücülük və günəşin mövqeyi; planda bir gün və ya fəsil üçün [günəş saatları](topic:sun-hours) |
