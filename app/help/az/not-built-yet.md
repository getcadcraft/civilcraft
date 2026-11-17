---
title: Hələ hazır deyil
summary: Bu CivilCraft versiyasının hələ nə etmədiyi və bu gün əvəzinə nə etmək lazım olduğu.
keywords: çatışmayan, məhdudiyyətlər, yol xəritəsi, mövcud deyil, spirallar, genişlənmə, dwg, dxf, daxilolma, saxlama, eninə kəsiklər, sonra gələcək, limitlər
from: a2d970ef
---

CivilCraft erkən mərhələdədir. Bu səhifə cari versiyanın nə etmədiyini sadalayır ki, onu axtarmayasınız. Burada heç nə bir tarix üçün vəd edilmir.

## Nöqtələr

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| İkinci nöqtə faylını birincisinə əlavə etmək | Əvvəlcə faylları mətn redaktorunda və ya cədvəldə birləşdirin |
| Nöqtə mətn faylını ixrac etmək | LandXML ixrac edin (nöqtələr CgPoints kimi gedir), GIS {{ui:İxrac}} istifadə edin (P, N, E, Z və D sahələri ilə nöqtələr) və ya nöqtələri cədvələ {{ui:Kopyala}} edin |
| Nöqtə etiketi üslubları, təsvir açarına görə simvollar, xətt kodlarından əyrilər (qövslər), layihələr arasında paylaşılan təsvir açarı faylı | Etiketlər nömrəni, kotanı və təsviri göstərir, ya da daha azını ([CivilCraft parametrləri](topic:settings)); açarlar layihə faylında saxlanılır |
| Vahid çevrilməsi | İdxal etməzdən əvvəl faylı çevirin; **Vahidlər** yalnız etiketi dəyişir |

## Səthlər

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Nöqtələrdən qurulmuş birdən çox səth | Hər səth üçün bir layihə |
| (Daxili) sərhədləri gizlətmək | **Ən uzun xarici kənar** və ya xarici sərhəd istifadə edin |
| Çəkilmiş bir qırılma xəttini seçmək və ya redaktə etmək | {{key:Mod+Z}}, ya da {{ui:Çəkilmiş xətti sərhədləri sil}} və yenidən çəkin |
| LandXML-dən oxunan səthi redaktə etmək (qırılma xətləri, sərhəd) | {{ui:Səthi nöqtələrdən yenidən qur}} |
| Hündürlük şəbəkəsindən yaradılmış səthi redaktə etmək | Şəbəkəni başqa seçimlərlə yenidən idxal edin |
| Koordinat sistemi dəyişdikdə LandXML-dən oxunan səthi çevirmək | Əvvəlcə {{ui:Səthi nöqtələrdən yenidən qur}} |
| Etiketli nöqtə kotaları və meyl qiymətləri | Onları status sətrində oxuyun, ya da Landşaft iş sahəsində **Meyl analizi** ilə səthi meylə görə rəngləndirin ([Landşaft üçün planlaşdırma](topic:landscape-grading#grading-checks)) |

## Trassalar və profillər

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Klotoiddən başqa spirallar; iki əyri arasında spiral (mürəkkəb keçidlər) | Əyrilərin uclarında klotoid spirallar mövcuddur; digərləri adlandırılır və LandXML idxalında keçilir |
| İki digəri arasına PI daxil etmək | Trassanı yenidən çəkin, ya da PI koordinatlarını yenidən yazın |
| Obyektlərdən trassalar, ofsetlər, genişləndirmələr | PI-lərlə çəkin |
| Şaquli əyri üçün K yazmaq | L yazın (K göstərilir) |
| Dairəvi və qeyri-simmetrik şaquli əyrilər | Yalnız simmetrik parabolik əyrilər |
| Hər trassa üçün birdən çox layihə profili | Hər variant üçün bir trassa |
| Profil görünüşünün miqyasını dəyişmək, profilin altında profil zolaqları | Profil görünüşü bütün trassaya sığır; onu [plan və profil vərəqlərində](topic:plan-profile-sheets) çap edin |
| DWG və ya LandXML-də kəsiklər | PDF kimi kəsik vərəqləri; sahə və həcmlərin {{ui:CSV}} faylı |
| Bucaq altında nümunə xətləri, ya da yol boyunca müxtəlif enlərdə | Bütün trassa üçün hər tərəfdə bir en |

## Koridorlar

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Medianlar, maneələr və şablonları fırladan superelevasiya | Onları şablon kimi çəkin ([Koridor şablonları](topic:corridor-templates)); stansiyaya görə şablonlar hələ superelevasiyanı qəbul etmir |
| İki bölgənin şablonları arasında tədrici dəyişiklik (keçidlər, konuslar) | Stansiyada şablonu dəyişin, ya da konus kimi çəkilmiş xəttə nöqtəyə en hədəfi verin |
| Kənar ətrafında fırlanma, LandXML-də superelevasiya | Superelevasiya dairəvi əyrilərdə mərkəz xətti ətrafında fırlanır; zolağı en hədəfi ilə xarakterik xəttə genişləndirin |
| Yan meyllər üçün hədəflər (xəttə və ya səthə açıq hava), koridorun öz səthləri | Hədəflər səkinin və çiyinlərin kənarlarını hərəkət etdirir ([Koridorlar](topic:corridor)); koridor layihə səthinə planlaşdırılır |
| Koridorlar LandXML yolu kimi ixrac olunur; IFC ixracında trassada ikinci koridor | Layihə səthi ixrac olunur |
| Layihə səthini dəyişən relyef şablonları, 3D-də və ya kəsiklərdə | Onlar hər təbəqənin sahə və həcmlərini verirlər ([Relyef şablonları](topic:corridor-templates#terrain-templates)) |
| Sürət, təkər sürüşməsi, sükan vaxtı, sükan qoşquları və ya gövdə təmizliyi ilə sürüşmə yolları; standart layihə nəqliyyat vasitələrinin kitabxanası; nəqliyyat vasitəsini sürükləməklə çəkilən sürüşmə yolu | Xarakterik xətt və ya trassa boyunca aşağı sürətli sürüşmə yolları, öz nəqliyyat vasitəsi ölçülərinizlə ([Nəqliyyat vasitəsi sürüşmə yolları](topic:swept-paths)) |

## Planlaşdırma və həcmlər

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Pilləkənlər, layihəyə planlaşdırılan açıq xarakterik xətlər, başqa yerdən xarakterik xəttə planlaşdırma | Xarakterik xətti bağlayın ([Xarakterik xətlər](topic:feature-lines)), ya da onu mövcud yerin qırılma xətti kimi istifadə edin |
| Xarakterik xəttin təpə nöqtəsini əlavə etmək və ya silmək | Xətti yenidən çəkin, ya da onun pilləli ofsetini edin |
| Çəkilmiş qırılma xətlərində qövslər (planalma nöqtələrindən keçən), xarakterik xətlərdə spirallar | Qövslərlə xarakterik xətt çəkin və onu mövcud yerin qırılma xətti kimi istifadə edin |
| Məsafəyə, kotaya və ya başqa səthə planlaşdırma | Yalnız mövcud yerə açıq hava |
| Platforma küncü əlavə etmək və ya silmək | Platformanı silin və yenidən çəkin |
| TIN-dən TIN-ə (prizma) həcmləri, şəbəkə xanasının ölçüsünü seçmək | Şəbəkə üsulu, xana ölçüsü sizin üçün seçilir |
| Şişmə və büzülmə, bitki torpağı, yol örtüyünün dərinlikləri | Hesabat olunan rəqəmlərə əmsalları özünüz tətbiq edin |
| Sərbəst daşınma və əlavə daşınma xərcləri, müxtəlif trassalar arasında daşınma, planda yerləşdirilmiş borc çuxurları və tullantı sahələri | Tarazlıq nöqtələri, köçürülmüş həcmlər və orta daşınma məsafələri ilə kütlə daşınma diaqramı |

## Boru şəbəkələri

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Layihə üzrə birdən çox şəbəkə | Yağış suyu və məişət üçün ayrı layihələr |
| Su magistralları: suyun keyfiyyəti və yaşı, qaydaya əsaslanan idarəetmə, digər klapan növləri (axın tənzimləyici, drossel, saxlayıcı), gücə görə verilmiş nasoslar, təzyiqdən asılı tələbat, Darcy–Weisbach seçimi, divar qalınlığı və təzyiq sinifləri ilə boru kataloqu. Təzyiq şəbəkələrinin qalan hissəsi laboratoriyadadır: [Su magistralları](topic:water-mains) | Bunları su paylama proqramında yoxlayın; məişət dizayn axınları [Məişət dizayn axınları](topic:sanitary-design)-dadır |
| Zamanla kanalizasiya axınları (hidroqraflar, dinamik marşrutlaşdırma, saxlama, nasoslar, daşmalar) | [Məişət dizayn axınları](topic:sanitary-design) dizayn vərəqinin istifadə etdiyi sabit pik axını verir |
| Daxilolma tutumu, arx yayılması, saxlama marşrutlaşdırması, hidroqraflar, bir qovşaq əmsalından başqa enerji itkiləri | Onları başqa proqramda yoxlayın; axınlar, ölçülər və qradiyent xətləri [Yağış drenajı](topic:storm-drainage)-dadır |
| PDF çapında, DWG, DXF və ya LandXML-də su toplama sahələri; səthdən su toplama sahələri (su bölgüsü) | Su toplama sahələrini əl ilə çəkin; layihə faylında saxlanılır |
| Boru kataloqları, dairəvi olmayan borular, şaquli qutu və ya silindr olmayan strukturlar (konuslar, pillələr, skamyalar), kitabxanada drenaj kateqoriyası | Parametrlərdən struktur növləri ([Boru şəbəkəsi](topic:pipe-network)); diametrli borular |
| Profil görünüşündə borular, əyilmiş borular | Sağ paneldə daxilolma və örtük oxuyun |

## Parsellər

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Sahəyə və ya cəbhəyə görə lotların yerləşdirilməsi, ətrafdakı xətlərdən parsellər, keçid zolağı | Hər parseli küncləri ilə çəkin, ya da onun kurslarını daxil edin |
| Planda əyri cədvəlləri və xətt cədvəlləri; etiketlər əl ilə köçürülür | Hər kurs öz boyunca etiketlənir |
| LandXML-də parsellər | Parsellər layihə faylında saxlanılır və PDF, DWG və DXF-ə göndərilir |

## Poliqonlar

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Ən kiçik kvadratlar üsulu ilə tənzimləmə, tranzit qaydası, bucaqların məsafələrə görə çəkisi | Kompas qaydası |
| Meyl bucaqları, zenit bucaqları və meyl məsafələri, triqonometrik nivelirləmə ilə kotalar | Üfüqi məsafələrə və bucaqlara düzgün çevirin, ya da istiqamətlər |
| Yan atışlar, data kollektorlarından xam məlumat faylları | Nöqtələri nöqtə faylı kimi idxal edin |

## Qazıqlama

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Ofset qazıqlar (qazıqdan geri qoyulan istinad nöqtələri), tutma nöqtəsində meyl qazıqları | Lazım olan ofsetlərdə qazıqlayın, o cümlədən çiyindən kənarda |
| Qazıqları birbaşa data kollektorunun öz formatına göndərmək | CSV faylı əksər data kollektorlarının ofis proqramlarında açılır |
| Borular, platformalar və parseller üçün qazıqlama | Trassanın yaxınlığındakı planalma nöqtələrindən və ya parselin kurslarından istifadə edin |

## Fayllar və çıxış

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| DWG və ya DXF-dən mətn, ştrixlamalar və ölçülər; kağız məkanı; əlaqəli çertyojlar (xref); ikili DXF | Model məkanından xətt işi açılır ([DWG və ya DXF-i xətt kimi açın](topic:open-dwg-dxf)); əlaqəli çertyojları ayrıca açın |
| Bir neçə nöqtəni eyni anda sürükləməklə köçürmək | Onları kəsib yapışdırın, ya da birər-birər redaktə edin |
| Portret vərəqləri, öz ştamp blokları, təşkil etdiyiniz görünüş pəncərələri, DWG-də plan və profil vərəqləri | PDF başına bir üfüqi plan vərəqi, ya da trassa boyunca plan və profil vərəqləri (PDF) |
| Kota zolaqlarının və profillərin çapı | Zolaqlar yalnız ekranda; lazım olsa ekran görüntüsü alın |
| Qat adlarını, rəngləri və etiket üslublarını dəyişmək | DXF ixracından sonra CAD proqramında dəyişin |
| Bulud saxlanması və versiya tarixi | `.civilcraft.json` fayllarını saxlayın və ehtiyat nüsxəsi götürün; bir layihə üzərində birgə işləmək üçün CadCraft Studio-da canlı sessiya istifadə edin ([Saytı birlikdə canlı işləyin](topic:work-live)) |
| iPad və iPhone üçün CadCraft Studio, və Google Play-dən | Cihazda brauzerdə CivilCraft istifadə edin; Android-də CadCraft Studio getcadcraft.com/download-dan APK ilə quraşdırılır |
| Eyni anda bir neçə nöqtə və ya layihə faylı açmaq | Hər dəfə bir fayl açın (bir-birinə aid GIS faylları, məsələn, shapefile hissələri, birlikdə açılır) |

## Landşaft

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| İstehsalçıların başlıqları və nozzle-ları | Ümumi başlıqlar, ya da fayldan öz başlıqlarınızı əlavə edin; istehsalçı məlumatları icazə verdikdə gəlir |
| Damcı xətləri üçün maksimal yan uzunluqlar, zamanla axınlar, nasoslar, dövrəli boru şəbəkələri | Damcı xətlərini istehsalçının dərc etdiyi uzunluqda saxlayın; yoxlama budaqlanan şəbəkə tələb edir |
| Konkav sərbəst formalı obyektin dəqiq konturu; onun yerin altındakı həcminin dəqiq ölçülməsi | Qabarıq örtük planlaşdırılır, yerin altındakı həcm təxminidir (Xassələrdə deyilir) |
| BimCraft və ModelCraft-ın öz kitabxanadan Yerləşdir əməliyyatında bitkilər | Landşaft IFC-ni ixrac edin və onu binanın yanında BimCraft-da açın |
| 3D görünüşdə ətraflı bitki modelləri (yarpaqlar, budaqlar, fəsillər); 3D görünüşdə sərbəst formalı obyektlər və suvarma | Bitkilər 3D-də bitki siyahısından ölçülmüş sadə formalar kimi göstərilir ([Saytı 3D-də görün](topic:site-3d)); ModelCraft-ın səpələməsi bitki təsvirləri yaradır |
| Səthdə planlaşdırılmış səviyyəni arxasında saxlayan sərt landşaft divarları | Platformaya və ya altlığa şaquli kənarlar verin: onlar səthdə dayaq divarlarıdır ([Planlaşdırma](topic:grading)) |
| Öz simvollarınızda SVG çevrilmələri; öz GLB bitki modellərinizin teksturaları və rəngləri; sıxılmış GLB həndəsəsi | Əvvəlcə çertyoj proqramınızda çevrilmələri düzləşdirin; modellər bitkinin rəngində çəkilir; GLB-ni sıxılmadan ixrac edin ([Bitki qrafikası](topic:plant-graphics)) |
| Kitabxana hesabınızda saxlanılan öz bitki siyahınız (tətbiqdə redaktə olunur) | Layihənin öz siyahısını Bitki cədvəlində redaktə edin və bitki faylı kimi saxlayın |
| Pəncərəsiz köməkçilər üçün landşaft alətləri (fayl serveri və əmr sətri) | CivilCraft pəncərəsi açıq olduqda işləyirlər ([Saytınızla AI köməkçisi işləsin](topic:assistants)) |

## Elektrik xətləri

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Ölkənin standartı daxili (yük halları, təmizliklər, əmsallar) | Standartınızın dəyərlərini {{ui:Yük halları və həddlər…}} daxilində təyin edin və saxlayın; kitabxananızla birlikdə paket kimi təkrar istifadə və paylaşmaq üçün ([Paketlər](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Naqildən ağac tacına və ya xəttin yanındakı divara yan məsafə | Xəttin kəsdiyi bitkilər və divarların üzərindəki şaquli təmizlik ([Elektrik xətti yoxlamaları](topic:power-line-checks#clearances)) |
| Naqil sürünməsi və yeni naqilin uzanması | Onlara çəkim cədvəlindəki temperaturlar vasitəsilə icazə verin |
| Torpağa basdırılmış kabellərin istilik göstəricisi (döşənmə üsulundan asılı cərəyan göstəricisi) | Kabel elementində təchizatçınızın cərəyan göstəricisini daxil edin |
| Qısa qapanma, mühafizə və torpaqlama tədqiqatları | Xüsusi elektrik proqramından istifadə edin; CivilCraft şəbəkənin uzunluqlarını və kabelləri verir |
| Üzv-üzv layihələndirilmiş qəfəs dirəkləri və torpaqdakı dartma dayaqları | Dayaqlar nominal yükə görə, dartmalar isə nominal yüklərinə görə yoxlanılır |
| `.DON` tədqiqat faylının onu oxuyan proqramda yoxlanılması | Faylı orada yoxlayın; bizə nümunə göndərin ki, real faylla test edək |
| 3D görünüşdə və IFC-də elektrik xətləri | Plan, xəttin profili, vərəqlər və GIS qatları |
| Pəncərəsiz köməkçilər üçün elektrik xətti alətləri | CivilCraft pəncərəsi açıq olduqda işləyirlər ([Saytınızla AI köməkçisi işləsin](topic:assistants)) |

## Bina kütlələri

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Zonalaşdırma kodlarının və ya istənilən şəhərin qaydalarının kitabxanası | Öz qanununuzdan limitləri daxil edin ([Zonalaşdırma limitləri](topic:zoning-limits)) |
| Divarlarda səma işığı (fasad günəş işığı), külək | [Günəş saatları](topic:sun-hours) yalnız birbaşa günəşi sayır |
| Ağaclardan, bitkilərdən və ya kütlə kimi çəkilməyən hər şeydən kölgə | Qonşu binaları kütlə kimi çəkin |
| Kütlələr üzərində dam formaları | Düz üstlü kütlələr |
| Kütlə BimCraft-da işlənəndə açılışlar, damlar və divar növləri | BimCraft hər mərtəbədə və döşəmədə sadə xarici divarlar qurur; qalanını orada əlavə edin |

## GIS və koordinat sistemləri

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| File Geodatabase; KML üslubları, işarələr, yer örtükləri və şəbəkə keçidləri | Əvvəlcə GeoPackage, shapefile və ya GeoJSON-a çevirin; KML yer işarələri üslubsuz oxunur |
| GIS obyektlərini və ya onların atributlarını redaktə etmək | GIS proqramında redaktə edin və yenidən idxal edin. Analiz paneli yeni qatlar yaradır (bufer, üst-üstə, birləşmə, seçim) və sahə və uzunluq sahələri əlavə edir, lakin obyekti yerində redaktə etmir |
| Şəbəkə və rastr analizi, düz və ya kvadrat ucluqlu buferlər və birtərəfli buferlər, atribut cədvəlində sətir əlavə və ya silmək və sahə növünü dəyişmək, əl ilə sinif rəngləri, çaplarda üslub legendası | Obyektləri seçmək üçün **Seç** istifadə edin və onlardan qat yaradın; düz uclar təklif olunmur. Atributa görə rənglənmə və atribut cədvəli hazırdır: [Qatı atributa görə üslublaşdırın](topic:gis-symbology) və [Qatın atribut cədvəli ilə işləyin](topic:gis-table) |
| Etiket üslubları (ölçü, yerləşmə) və bir-birindən qaçan etiketlər | Etiketlər bir ölçüdədir və obyektlər sıx olduqda üst-üstə düşə bilər |
| Şaquli datumlar və geoid modelləri | Kotalar faylın verdiyi kimi istifadə olunur; şaquli datumu özünüz yoxlayın |
| NAD27-dən NAD83-ə ərazi üzrə təklif olunan şəbəkə sürüşmələrindən başqa (OSTN15; digər datumlar üçün NTv2 faylı əlavə etdikdə işləyir), eyni anda bir neçə şəbəkə, şaquli şəbəkələr | Datumunuz üçün şəbəkə faylını özünüz əlavə edin; layihə üzrə bir şəbəkə |
| DXF-də və ya 3D ixraclarda xəritə qatları | Xəritə qatları PDF çapına gedir, DWG yanında şəkil kimi |
| Daxil olmaq, açar və ya token tələb edən xəritə serverləri | Açıq xidmətlərdən və ya koordinatlanmış şəkil faylından istifadə edin |
| Səthdən, yer modelindən və ya hündürlük şəbəkəsi və LiDAR alətlərindən LAS və ya LAZ faylları yazmaq | Səthləri GeoTIFF hündürlük şəbəkəsi kimi ixrac edin. [Nöqtə buludları](topic:point-clouds) əlavəsi təmizlənmiş buludu LAS 1.4 və ya LAZ kimi yazır |
| LiDAR intensivliyi, rəngi və qayıdışları; bir neçə zolaqlı hündürlük şəbəkələri; 200 MB-dən böyük şəbəkə və ya LiDAR faylları | LiDAR yalnız sinifə görə süzülür, şəbəkələr ilk zolağını istifadə edir; böyük faylları əvvəlcə kəsin |

## Daxiletmə

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| Toxunmaqla qutu ilə seçim ({{key:Shift}} tələb edir) | Hər planalma nöqtəsini əlavə etmək üçün uzun basın |
| Çəkərkən yazılmış koordinatlar və ya məsafələr | Təxmini çəkin, sonra trassanın PI cədvəlində dəqiq PI koordinatlarını yazın |
| Platforma küncləri və strukturlar üçün koordinatları yazmaq | Tutacaqlarını sürükləyin; dəqiqlik üçün yaxınlaşdırın və status sətrində E və N-ə baxın |
| Obyektlərə yapışma (qırılma xətləri üçün planalma nöqtələrindən başqa) | Yaxınlaşdırın və status sətrinə baxın |

## 3D görünüş

| Hələ hazır deyil | Bu gün əvəzinə |
|---|---|
| 3D görünüşdə çəkmək və ya redaktə etmək | Planda çəkin və redaktə edin; 3D görünüş hər redaktəni izləyir |
| 3D-də klik etməklə koridor xarakterik xətlərini və ya GIS obyektlərini seçmək | Onları planda klik edin |
| Şaquli artırılmış görünüşü ixrac etmək və ya futla ixrac | İxraclar metrlə real miqyasda olur; bax [Saytı 3D-də ixrac edin](topic:export-3d) |
| GLB və ya OBJ ixraclarında etiketlər, 3D-də etiket ölçüləri və üslubları | Etiketlər yalnız 3D görünüşdə, bir ölçüdə göstərilir; bax [Saytı 3D-də görün](topic:site-3d) |
| Fotolardan teksturalar, sürüşün videoya yazılması, sahədən kənardan kölgələr, 3D görünüşdə göstərilən günəş saatları | Səthlərə asılmış xəritə qatları; sürüş və günəşin bir vaxtdakı mövqeyi; bir gün və ya fəsil üçün planda [günəş saatları](topic:sun-hours) |
