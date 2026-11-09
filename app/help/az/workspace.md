---
title: Ekran, hissə-hissə
summary: CivilCraft-ın hər panelini və barını ekranda göstərilən adı ilə təsvir edir, alət panelindən status panelinə qədər.
keywords: interfeys, ekran, alət paneli, panellər, xüsusiyyətlər, status paneli, profil görünüşü, tərtibat, tur, ui
from: 76272010
---

CivilCraft-ın bir ekranı var. Tablar və tərtibatlar yoxdur. Yan panellər yerini dəyişə, üzə bilər və ya öz pəncərəsinə keçə bilər: bax [Panelləri düzənləyin və ikinci monitordan istifadə edin](common:arrange-panels). Yuxarıdan aşağı və soldan sağa:

- **tətbiq paneli** (CadCraft nişanı, tətbiqin adı, versiya, Haqqında, ekran rejimi, Kömək, Oflayn üçün saxla, Kağız və Model)
- **alət paneli** yeddi düymə qrupu ilə
- **sol panel**: Sayt, Nöqtələr, Səth, Göstərmə və bir neçə nöqtə idxal etdikdən sonra GIS qatları
- **plan** ortada, açıq olduqda altında **profil görünüşü** ilə
- **sağ panel**: seçilmişlərin Xüsusiyyətləri
- **status paneli** aşağıda

## Tətbiq paneli

Ən üstdəki nazik panel CivilCraft-ın özünə deyil, CadCraft saytına aiddir.

- Versiya menyusu işlətdiyiniz quruluşu göstərir.
- {{ui:CivilCraft haqqında}} tətbiqin saytdakı səhifəsini açır.
- {{ui:Tam ekran}} ekran rejimlərini dəyişir: tam ekran, sonra panellər gizlədilmiş tam ekran, sonra normal rejimə qayıdış. {{key:Ctrl+Shift+F}} hər platformada, o cümlədən Mac-də eyni işi görür (Mac-də Command deyil, Control düyməsidir). Panellər gizlənəndə onları geri çağırmaq üçün siçanı yuxarı kənara aparın.
- {{ui:Kömək}} (və ya {{key:F1}}) bu köməyi yan paneldə açır; {{key:F1}} və ya {{key:Esc}} onu bağlayır.
- {{ui:Oflayn üçün saxla}} CivilCraft-ı bu brauzerdə saxlayır ki, bağlantı olmadan açılsın; sonra {{ui:Oflayn hazırdır}} göstərir. Bax: [Fayllar: açmaq, saxlamaq və ixrac etmək](topic:files#online-and-offline).
- {{ui:Kağız}} və {{ui:Model}} açıq və tünd mövzu arasında keçir. Plan və profil mövzunu izləyir; PDF-lər həmişə ağ çap olunur.

## Alət paneli

Hər qrupun düymələrinin üstündə kiçik etiketi var. Düyməni göstərmək üçün üzərinə gətirin, onun tooltip-i və qısayolu görünsün.

| Qrup | Düymələr | Nə edir |
|---|---|---|
| Fayl | {{ui:Yeni}}, {{ui:Aç}}, {{ui:Saxla}} | Yenidən başlayın, nöqtə faylı, LandXML və ya layihə açın, layihəni endirmə kimi saxlayın |
| İxrac | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, R12 DXF və ya planın DWG-sini yazın, ya da planı PDF-ə çap edin |
| Səth | {{ui:Sınma xətti}}, {{ui:Sərhəd}} | Planalma nöqtələri vasitəsilə sınma xətti çəkin; xarici sərhədi çəkin |
| Layihə | {{ui:Trassa}}, {{ui:Platforma}}, {{ui:Borular}}, {{ui:Profil}} | Trassa, platforma, boru xətti çəkin; profil görünüşünü göstərin və ya gizlədin |
| Redaktə | {{ui:Geri qaytar}}, {{ui:Təkrarla}}, {{ui:Kopyala}}, {{ui:Yapışdır}}, {{ui:Daha çox}} | Planalma nöqtələrini geri qaytarın, təkrarlayın, kopyalayın və yapışdırın; {{ui:Daha çox}} Kəs, Yerində yapışdır, Dublikat, Sil, Hamısını seç və Heç nəyi seçmə əmrlərini saxlayır |
| GIS | {{ui:Koordinatlar}}, {{ui:İdxal}}, {{ui:İxrac}}, {{ui:Xəritə}} | Koordinat sistemini təyin edin, GIS faylları idxal və ixrac edin, planın altında xəritə qatlarını göstərin |
| Görünüş | {{ui:Seç}}, {{ui:Sığdır}}, {{ui:3D}} | Şeyləri seçin və hərəkət etdirin; hər şeyi göstərmək üçün yaxınlaşdırın; saytı 3D-də göstərin ([Saytı 3D-də görün](topic:site-3d)) |

Çəkmə aləti aktiv olduğu müddətdə basılı qalır. Ona yenidən klikləsəniz, {{key:Esc}} bassanız və ya {{key:V}} bassanız, {{ui:Seç}} rejiminə qayıdırsınız. {{ui:Geri qaytar}}, {{ui:Təkrarla}}, {{ui:Kopyala}} və {{ui:Daha çox}} daxilindəki elementlər hərəkət edə bilmədikdə boz görünür; ipucu səbəbi göstərir (məsələn "Əvvəlcə planalma nöqtələrini seçin"). Hər düymə [Alət paneli arayışı](topic:toolbar) bölməsində sadalanır.

Dar pəncərədə alət paneli yana sürüşür.

## Sol panel

### Sayt

- **Ad**: layihənin adı. Saxladığınız və ya ixrac etdiyiniz hər faylın adını verir və PDF başlıq zolağında çap olunur.
- **Vahidlər**: {{ui:ABŞ futu}} və ya {{ui:Metr}}. Rəqəmlərin nə mənasını verdiyini göstərir. Dəyişmək koordinatları **çevirmir**; bax: [Vahidlər, stansiyalar və rəqəm formatları](topic:units-and-stations).

### Nöqtələr

Boş olanda planalma faylının necə açılacağını göstərir. Nöqtələr olanda faylın adını, nöqtələrin sayını və neçəsinin hündürlüyü olduğunu, sonra **nöqtə qrupları** cədvəlini göstərir: təsvirin ilk sözünə görə bir sətir (GRD, FL, TBS …), sayı və **Səth** seçimi ilə:

- {{ui:Nöqtələr}}: nöqtələr səthə gedir (hər qrup üçün standart).
- {{ui:Sınma xətti}}: qrupun nöqtələri nöqtə nömrəsi sırası ilə bir sınma xəttinə birləşdirilir.
- {{ui:Kənarda qalır}}: qrup səthə toxunmur.

### Səth

Mövcud zəmin haqqında faktlar: nöqtələr, üçbucaqlar, ən aşağı və ən yüksək hündürlük, orta hündürlük, 2D və 3D sahə, sınma xətləri və sərhədin olub-olmaması. Faktların altındakı qutu səth quruculuğunun düzəltməli olduğu və ya edə bilmədiyi hər şeyi sadalayır. Sonra:

- **Ən uzun xarici kənar**: 0 bütün xarici üçbucaqları saxlayır; rəqəm uzun nazik üçbucaqları xarici tərəfdən kəsir.
- Tətbiq olunduqda görünən keçidlər: {{ui:Sərhədi silin}}, {{ui:Çəkilmiş xətti sərhədləri sil}} və LandXML-dən oxunan səth üçün {{ui:Səthi nöqtələrdən yenidən qur}}.

### Göstərmə

- **Səth**: {{ui:Mövcud zəmin}} və ya {{ui:Layihə (planlaşdırılmış)}}. İkincisi platforma və ya dəhliz problemsiz planlaşdırdıqdan sonra mövcud olur.
- **Horizontallar hər**, **Əsas hər** və **Zolaqlar** (rəng zolaqlarının sayı).
- Onay qutuları: {{ui:Horizontallar}}, {{ui:Horizontal yazıları}}, {{ui:Üçbucaqlar}}, {{ui:Hündürlük zolaqları}}, {{ui:Meyl oxları}}, {{ui:Nöqtələr}}, {{ui:Nöqtə yazıları}}, {{ui:Sınma xətləri}}, {{ui:Səthin kənarı}}, {{ui:Borular}}.
- Zolaqlar açıq olanda zolaq hündürlüklərinin legendası görünür.

Göstərmə parametrləri layihə ilə saxlanılır, lakin geri alma addımı deyil: {{key:Mod+Z}} heç vaxt qutunu geri qaytarmır.

## Plan

Plan nöqtələri, səthi və dizayn etdiyiniz hər şeyi şimal yuxarıda plan görünüşündə göstərir. Təkərlə yaxınlaşdırın, boş sahəni sürüşdürmək üçün sürükləyin. Tam siyahı [Düymələr və siçan](topic:keyboard) bölməsindədir.

- Boş layihədə **Planalma nöqtələri ilə başlayın** adlı qutu ilk addımları sadalayır və {{ui:Nümunə sahəni aç}} təklif edir.
- Çəkmə aləti aktiv olduqda, planın yuxarısında nəyə klikləmək və necə bitirmək barədə ipucu göstərilir.
- Planın üzərinə fayl sürüşdürəndə "Nöqtə faylı, LandXML və ya layihə buraxın" yazılır.
- Seçilmiş şeylər vurğulanır. Seçilmiş trassa və ya platforma PI-lərində və ya künclərində kvadrat tutacaqlar göstərir; seçilmiş quruluş bir tutacaq göstərir. Yerini dəyişmək üçün tutacağı sürükləyin.
- Seçilmiş planalma nöqtələrinin halqası var. {{key:Shift}} və klik nöqtə əlavə edir və ya çıxarır; {{key:Shift}} və sürükləmə qutu çəkir (ya da ətrafında dövrə çəkilirsə, lasso), içərisindəki nöqtələri əlavə edir. Bax: [Planalma nöqtələrini seçin, kopyalayın və yapışdırın](topic:copy-paste-points).

## Profil görünüşü

{{key:R}} basın və ya {{ui:Profil}} klikləyin ki, plan altında açılsın. Onun paneli var:

- trassa siyahısı (iki və ya daha çox trassa olanda aktiv olur)
- {{ui:PVI əlavə et}}: basılı olduqda profildə klik PVI əlavə edir ({{key:I}} onu dəyişir)
- göstəricinin altında stansiya, zəmin, layihə hündürlüyü, meyl və kəsim və ya doldurma göstəricisi
- bağlama düyməsi

Profil mövcud zəmini, layihə profilini, hər toxunanın meylini, hər PVI-nin stansiyasını və hündürlüyünü, hər şaquli əyrinin L və K dəyərini BVC və EVC ilə, yüksək və alçaq nöqtələri və şaquli şişirtməni göstərir. Həmişə bütün trassaya sığdırılır: yaxınlaşdırmır və sürüşdürmür. Göstəricini boyunca hərəkət etdirdikdə planda trassa üzərində nöqtə görünür.

## Sağ panel: Xüsusiyyətlər

Başlığı nəyi göstərdiyini bildirir.

- **Layihə** (heç nə seçilməyib): trassalar və platformalar keçid kimi, **Torpaq işləri** bloku və qaydaları və problemləri olan **Boru şəbəkəsi** bloku.
- **Trassa**: ad, başlanğıc stansiya, uzunluq, PI cədvəli, əyrilər, layihə profilinin PVI cədvəli və faktları və **Dəhliz** parametrləri.
- **Platforma**: ad, hündürlük, kəsim və doldurma meylləri, sahə, günəş işığı faktları və torpaq işləri.
- **Quruluş** və ya **Boru**: ölçülər, kənarlar, invertlər, meyl, örtük və hər hansı problem.
- **Nöqtə** və onun nömrəsi: nöqtənin koordinatları, hündürlük, təsvir və qrup (yalnız oxunur).

Sahələr {{key:Enter}} basdıqda və ya sahədən çıxdıqda qüvvəyə minir. Qəbul olunmayan dəyər yanlış kimi işarələnir və heç nə dəyişmir.

## Status paneli

- **E** və **N**: göstəricinin altında şərq və şimal.
- **Yer** hündürlüyü orada (və platforma və ya dəhliz onu dəyişdiyi yerdə **Planlaşdırılmış**), ya da "Səthdən kənarda".
- Ən yaxın trassa (və ya seçilmiş olan) göstəricinin altında **Sta** və ofset (**L** və ya **R**) ilə.
- Sağda mesajlar: indicə nə baş verdi və ya nəyə görə nəsə rədd edildi. Mesaj bir neçə saniyədən sonra özü silinir.

## Dialoqlar

- **Nöqtələri idxal et**: hər nöqtə faylı ilə açılır. Bax: [Planalma nöqtələrini idxal edin](topic:import-points).
- **Planı PDF-ə çap et**: bax [Planı PDF-ə çap edin](topic:plot-pdf).
- **Saxlanılmamış dəyişikliklər**: {{ui:Yeni}} və ya layihə və ya LandXML faylı açmazdan əvvəl saxlanılmamış işin itəcəyini soruşur. {{ui:Surətini saxla}} əvvəlcə layihəni endirir.

## Kiçik ekranlar

760 pikseldən dar olan ekranlarda, məsələn telefonda, plan ekranı saxlayır: alət paneli yana sürüşən bir sətirdir və panellər aşağıdakı paneldən vərəq kimi açılır. {{ui:Alətlər}} alət panelini gizlədir, {{ui:Köçürmək}} onu aşağıya qoyur.
