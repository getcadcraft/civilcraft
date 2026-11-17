---
title: Xüsusiyyət xətləri
summary: Hər təpə nöqtəsini hündürlüyünə görə tənzimlədiyiniz 3D xətlər çəkin, onların pilləli ofsetlərini yaradın və onları relyefin sınma xətləri kimi və ya layihədə meyilli platformalar kimi istifadə edin.
keywords: qövs, əyri, radius, 3D qövs, spiral, əyri bordür, meyl örtüyü, hündürlük örtüyü, meyl oxları, xüsusiyyət xətti, meyl, hündürlük, pilləli ofset, ofset, sınma xətti, bordür, xəndək, bərm, meyilli platforma, relyefə çıxış, şaquli planlaşdırma, relyef, 3D polixətt
from: d55b25fb
---

Xüsusiyyət xətti hər təpə nöqtəsində hündürlüyü olan xəttdir: bordür, xəndək axın xətti, bərmin üstü, meyilli platformanın kənarı. Hündürlüklərini ədəd ilə və ya meyl ilə təyin edirsiniz, onu yana yuxarı və ya aşağı addımla köçürürsünüz və səthlərin onunla nə etdiyini seçirsiniz.

## Bir xətt çəkmək

1. **Səth** › {{ui:More}} › {{ui:Feature line}} seçin və ya {{key:L}} basın.
2. Planda təpə nöqtələrinə klikləyin. Planalma nöqtəsinə klik onun yerini və hündürlüyünü götürür; başqa yerdə təpə oradakı mövcud relyefin hündürlüyünü götürür.
3. Açıq xətti bitirmək üçün {{key:Enter}} basın, və ya qapatmaq üçün birinci təpəyə yenidən klikləyin.

Yeni xətt seçilir və mövcud relyefin sınma xətti kimi başlayır, relyefin üstündə uzanır.

## Qövslər

Seqment planda qövs ola bilər, uclarının hündürlükləri fərqli olur: bordür dönməsi, əyri xəndək, dönən rampa. Onun meyli qövs boyunca bərabər dəyişir, uzunluğu isə əyri boyunca ölçülür.

- **Çəkərkən:** qövsləri aktiv etmək üçün {{key:C}} basın (toxunma ekranında, planın üstündəki çubuqda {{ui:Arc}}). Təpədən sonra əyri üzərində bir nöqtəyə, sonra qövsün bitdiyi yerə klikləyin. Düz seqmentlər üçün yenidən {{key:C}} basın. {{key:Backspace}} əvvəl əyri üzərindəki nöqtəni silir.
- **Sonra:** **Xassələr**də təpənin **Qövs** xanasına radius və dönmə istiqamətini yazın, məsələn `50 L` və ya `50 R` (xətt boyunca gedərkən sol və ya sağ), sonra {{key:Enter}} basın. Seqmenti yenidən düz etmək üçün xananı boşaldın. Seqmentin yarısından kiçik radius rədd edilir.

Seçilmiş xətt hər qövsün radiusunu meylinin yanında göstərir. **Uzunluq** planda qövslər boyunca; **3D uzunluq** qalxma və enmələri də sayır. Pilləli ofsetlər qövsləri saxlayır: dönmənin xarici tərəfindəki qövs böyüyür, daxili tərəfdəki kiçilir və qövsün mərkəzini keçən ofset rədd edilir.

Səthlər, 3D görünüş, DXF və DWG hər qövsü əyridən 0.01 daxilində qalan qısa düz parçalar kimi qəbul edir. LandXML onları qövs kimi saxlayır (bax: aşağıda **Digər fayllarda qövslər**).

## Hündürlükləri və meyilləri təyin etmək

**Xassələr** xətt boyunca məsafələri ilə təpələri, onların **Hündürlük** və **Növbətiyə meyl** (faizlə) göstərir. Onlardan birini yazın və {{key:Enter}} basın:

- Hündürlük yalnız həmin təpəni hərəkət etdirir.
- Meyl seqmentinin uzaq ucundakı hündürlüyü təyin edir; ondan sonrakı təpələr öz yerində qalır, buna görə növbəti seqmentin meyli dəyişir.

Həmçinin **Xassələr**də:

| Əməliyyat | Nə edir |
|---|---|
| **Hamısını bu qədər qaldır və ya endir** | Yazdığınız hündürlüyü hər təpəyə əlavə edir. |
| {{ui:Elevations from the ground}} | Hər təpəni yenidən mövcud relyefə qaytarır (səthdən kənar təpələr öz hündürlüklərini saxlayır və siyahıya salınır). |
| {{ui:One grade, first to last}} | İlk və son hündürlükləri saxlayır və aralarındakı təpələri bir bərabər meylə düzləşdirir. |

Seçilmiş xətt planda təpələrdə hündürlüklərini və seqmentlər boyunca meyllərini göstərir. Təpəni köçürmək üçün {{ui:Select}} ilə sürükləyin; hündürlüyü qalır.

## Pilləli ofsetlər

**Pilləli ofset** altında **Məsafə** yazın (xəttin istiqamətinə görə sağa müsbət, sola mənfi), sonra hündürlük (qədər yuxarı və ya aşağı) və ya faizlə meyl yazın və {{ui:Make the offset line}} düyməsini basın. Surət yeni xüsusiyyət xəttidir: məsələn, bordürün arxası yana 0.5 ft və 0.5 ft yuxarıda, və ya xəndək kənarı 6 ft kənarda 2 % ilə. Sıx dönmədə surətin özü üzərinə qatlanacaq məsafə rədd edilir.

## Ekranda meyllər və hündürlüklər

Hər xüsusiyyət xəttinin hər seqment boyunca meylini (aşağıya işarə edən kiçik ox ilə) və təpələrdə hündürlüyünü görmək üçün {{key:E}} basın və ya **Görünüş** altında **Xüsusiyyət xətlərində meyl və hündürlüklər**i işarələyin. Onlar yalnız ekranda göstərilir: çertyoja heç nə əlavə olunmur, PDF, DXF və DWG olduğu kimi qalır. Qısa seqmentlər və sıx təpələr yaxınlaşdırana qədər etiketsiz qalır. Seçilmiş xətt həmişə öz meyllərini və hündürlüklərini göstərir.

## Profil görünüşündə

Trassanı kəsən xüsusiyyət xətti həmin trassanın profil görünüşündə, kəsişmədə adı və hündürlüyü ilə göstərilir; yanındakı xətlər də göstərilə bilər. Bax: [Şaquli profil layihələndirmək](topic:profile).

## Səthlər onunla nə edir

**İstifadə**ni seçin:

| İstifadə | Nə baş verir |
|---|---|
| Mövcud relyefin sınma xətti | Mövcud relyef xətdən onun hündürlükləri ilə keçir, çəkilmiş sınma xətti kimi. |
| Layihəyə şaquli planlaşdırılmış | **Qapalı** xətt meyilli platformaya çevrilir: içindəki layihə səthi kənarına qədər şaquli planlaşdırılır. Platforma kimi, kəsmə və doldurma meyllərini (üfüqi 1, şaquli 1) kənardan relyefə qədər işə salmaq üçün **Relyefə çıxış** seçimini açın; hər meyl orada kənarın öz hündürlüyündən başlayır. |
| Yalnız çəkilmiş | Planda qalır və DXF, DWG və PDF-də çıxır (qat C-GRAD-FEAT, 3D polixətlər), lakin səthlər onu nəzərə almır. |

Həcmlər, kəsiklər və 3D görünüş layihəyə şaquli planlaşdırılmış xüsusiyyət xətlərini platformalar kimi daxil edir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

## Xətləri komanda ilə bölüşmək

CadCraft Studio-da, komanda planında, bulud fayllarınızdan açılmış çertyojda layihənin **Xassələr**ində (heç nə seçilməmişkən) {{ui:Team lines…}} ilə **Komanda** bölməsi var: komandanızın paylaşdığı xətlər, hər biri öz versiyası ilə, xüsusiyyət xəttini əvvəlcə seçmədən. Xətti paylaşmaq üçün onu seçin, yeni versiya göndərin, komandanınkını çəkin və ya paylaşmağı dayandırın. Həmin parametrdən kənarda bölmə nə lazım olduğunu deyir.

## Digər fayllarda qövslər

| Fayl | Qövsləri olan xüsusiyyət xəttinə nə olur |
|---|---|
| CivilCraft layihəsi | Dəqiq saxlanılır. |
| LandXML | Hündürlükləri ilə xətt və qövslərdən ibarət plan xüsusiyyəti kimi yazılır və qövsləri ilə geri oxunur. Başqa proqramdan gələn xüsusiyyət xətti **Yalnız çəkilmiş** kimi gəlir: onu səthə qoymaq üçün **İstifadə**sini seçin. |
| DWG və DXF | 3D polixətt qövsü saxlaya bilmir, buna görə xətt hər qövsdən 0.01 daxilində qısa parçalar kimi yazılır. CivilCraft həmçinin çertyojda hansı parçaların qövs olduğunu qeyd edir: çertyoju xətt kimi açanda {{ui:Feature lines}} xətləri qövsləri ilə birlikdə xüsusiyyət xətləri kimi geri qaytarır. Digər proqramlar adi 3D polixətt görür. |
