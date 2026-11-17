---
title: Qravitasiya boru şəbəkəsini yerləşdirin
summary: Yağış və ya məişət boru xətlərini strukturla struktur çəkin, yamacınızı, örtük və enmə qaydalarınızı təyin edin, CivilCraft-ın invertləri təyin etməsinə icazə verin və siyahıya alınmış problemləri düzəldin.
keywords: struktur qurucu, struktur növü, düzbucaqlı struktur, tutma quyusu, çərçivə, örtük, divar qalınlığı, kitabxana elementi, boru şəbəkəsi, yağış, məişət, kanalizasiya, strukturlar, lyuklar, daxilolmalar, invertlər, meyl, düşmə, kənar, çökək, qravitasiya boruları
from: 10a3c14d
---

Layihədə bir qravitasiya boru şəbəkəsi var, yağış və ya məişət. O, strukturlardan (lyuklar, daxilolmalar) və onlar arasında düz borulardan ibarətdir. Axın çəkdiyiniz istiqamətdə gedir. CivilCraft hər boru və strukturu sizin təyin etdiyiniz üç qaydaya görə yoxlayır və invertləri həmin qaydalardan təyin edə bilər.

## Xətt çəkin

Borunu səthsiz də çəkə bilərsiniz, lakin kənarlar, örtük və avtomatik invertlər səth tələb edir.

1. {{key:P}} basın, ya da **Layihələndirmə** qrupunda {{ui:Borular}} klikləyin.
   Hint deyir: "Borular: strukturları xəttin yuxarısından aşağıya doğru klikləyin (mövcud birinə qoşulmaq üçün ona klikləyin). Enter bitirir."
2. Yuxarı axın strukturunun getdiyi yerə klikləyin. Struktur yerləşdirilir.
3. Hər növbəti strukturu aşağı axına doğru klikləyin. Mövcud strukturla birləşmək üçün ona klikləyin: status sətri "S3 birləşdi." deyir.
4. {{key:Enter}} basın.
   Borular çəkilir, invertləri qaydalardan təyin olunur və status sətri məsələn, "3 boru çəkildi, 12 invert qaydalardan təyin edildi; bütün yoxlamalar keçdi." deyir.

Yeni strukturlar S1, S2 … adları ilə 48 in (1200 mm) diametrlə adlanır. Yeni borular P1, P2 … adları ilə 12 in (300 mm) diametrlə adlanır. Diametrlər ft layihəsində düymlə, m layihəsində millimetrlə verilir.

Axını {{key:Enter}} ilə bitirin. İkiqat klik də işləyir, lakin mövcud strukturda ikiqat klik edib axını orada bitirdikdə birləşmə itir: onu bir dəfə klikləyin, sonra {{key:Enter}} basın.

## Qaydalarınızı təyin edin

Heç nə seçilmədikdə sağ paneldə (**Layihə**) **Boru şəbəkəsi** bloku var:

| Parametr | Başlanğıc dəyər | Mənası |
|---|---|---|
| Növ | {{ui:Yağış suyu}} | {{ui:Yağış suyu}} və ya {{ui:Məişət}}; LandXML-ə yazılır |
| Ən az meyl | 0.50% | Hər boru ən azı bu qədər düşməlidir |
| Ən az örtük | 2 ft (0.6 m) | Yerdən boru tacına qədər, boru boyunca |
| Strukturlarda düşmə | 0.10 ft (0.03 m) | Çıxış invertinin hər daxilolma invertindən ən azı bu qədər aşağıda olması |

**Bu başlanğıc dəyərlər yer tutucudur, standart deyil.** Agentliyinizin və ya layihənizin tələb etdiyi dəyərləri təyin edin. Örtük yerdən tacına (invert plus daxili diametr) ölçülür; divar qalınlığı sayılmır. Planlaşdırılmış koridor və ya platforma olan yerdə planlaşdırılmış səth yerdir.

## CivilCraft invertləri təyin etsin

- {{ui:Bütün invertləri qaydalara görə təyin et}} (**Boru şəbəkəsi** bloku) bütün boruları təyin edir.
- {{ui:İnvertlərini qaydalara görə təyin et}} (bir boru seçilmiş halda) yalnız o borunu təyin edir.

Aşağı axına işləyərək hər axın yuxarı strukturda ən azı örtük ilə başlayır, ən az meyl qədər düşür, hər strukturdan keçən düşmə qədər düşür və boru boyunca yer ən az örtüyə çatmazsa daha dərinə gedir. İnvertlər 0.01-ə qədər aşağı yuvarlaqlaşdırılır, heç vaxt yuxarı yox. Status sətri deyir: "İnvertlər təyin edildi: hər axının yuxarısında ən az örtük, ən az meyl və hər strukturda ən az düşmə." və ya nə edə bilmədiyini adlandırır.

## Strukturları və boruları redaktə edin

{{ui:Seç}} ilə strukturu və ya borunu klikləyin ki, sağ paneldə görünsün.

**Struktur**: **Ad**, **Kənar**, **Çökək dərinliyi**, **Diametr**, sonra **İstifadə olunan kənar**, **Çökək**, **Şərq** və **Şimal**, içəri və çıxan borular invertləri ilə.

- **Kənar** boş qoyulsa, səthdən götürülür; qutu səth dəyərini boz rəngdə göstərir. Kənarı sabitləmək üçün dəyər yazın.
- Planda strukturun tutacağını sürükləyərək onu köçürün. Onun boruları izləyir; invertləri olduğu kimi qalır, ona görə sonra problemləri yoxlayın.

**Növ**: şəbəkənin struktur növlərindən birini seçin (aşağıda), ya da öz diametri ilə dairəvi struktur üçün heç nə.

**Boru**: **Ad**, arasında işləyən strukturlar, **Diametr**, **Yuxarı invert**, **Aşağı invert**, sonra **Uzunluq**, **Meyl** və **Ən az örtük**.

Hər dəyərdən sonra {{key:Enter}} basın.

## Problemləri oxuyun və düzəldin

**Boru şəbəkəsi** bloku hər problemi sadalayır (40-a qədər); birinə klikləyin ki, boru və ya struktur seçilsin. Seçilmiş boru və ya struktur öz problemlərini sadalayır. Heç biri seçilməyibsə deyir: "Hər boru və struktur qaydalara uyğundur."

| Mesaj (nümunələr) | Nə etmək lazımdır |
|---|---|
| "P2 yuxarı axır (-0.40%)." və ya "… düzdür …" | İnvertləri dəyişin, ya da qaydalardan təyin edin. |
| "P2 0.30%-də minimum 0.50%-dən yastıdır." | Aşağı axın invertini aşağı salın və ya yuxarı axını qaldırın. |
| "P3 boyunca 35 örtüyün 1.40-ı var, minimum 2-dən azdır." | Borunu aşağı salın; invertlərini qaydalardan təyin edin. |
| "S3-də P4 245.20-də çıxır, P3-ün 245.25-də daxil olmasından 0.1 aşağı." | Çıxış borusunun yuxarı invertini aşağı salın. |
| "P1-in tacı S1-in kənarından yuxarıdır." | Boru struktur üçün çox yüksəkdir. |
| "S2-dən 2 boru çıxır; qravitasiya şəbəkəsində hər struktur üçün bir çıxış olmalıdır." | Bir çıxan borunu silin, ya da düzgün istiqamətdə yenidən çəkin. |
| "Borular döngə əmələ gətirir; axın çıxışda bitməlidir." | Bir borunu silin: axın özünə qayıdıb. |
| "S5 səthdən kənardadır və kənar kotası yoxdur." | Kənar yazın, ya da strukturu səthə köçürün. |
| "P6 qismən səthdən kənardadır; orada örtük məlum deyil." | Səthi genişləndirin, ya da orada örtüyün yoxlanmadığını qəbul edin. |
| "P7-nin hələ invertləri yoxdur." | Onları yazın, ya da qaydalardan təyin edin. |

Problemli borular və strukturlar planda qırmızı ilə də qeyd olunur.

## Struktur növləri

Struktur növü parametrlərindən qurulmuş struktur deməkdir: lyuk, daxilolma, birləşmə qutusu və ya çıxış, **dairəvi** (daxili diametr) və ya **düzbucaqlı** (daxili en və uzunluq), **divar qalınlığı**, **döşəmə plitəsi**, ən aşağı borunun altında **çökək** və **çərçivə və örtük** (dairəvi və ya düzbucaqlı açılış, çərçivə hündürlüyü) ilə. Növlər şəbəkəyə aiddir, layihənin Xassələrində **Struktur növləri** altında.

1. {{ui:Yeni struktur növü}} klikləyin. Dialoq yazdıqca strukturu planda və kəsikdə çəkir.
2. {{ui:Növü əlavə et}} klikləyin.
3. Strukturu seçin və **Növ** altında növü seçin. O, növün ölçüsünü və çökəyini götürür; öz çökəyi hələ də dəyişdirilə bilər.

Növü redaktə edin və həmin növün hər strukturu ölçülərini izləyir. Növü silin, strukturları eyni enli dairəvi strukturlar kimi qalır. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri alır.

Düzbucaqlı struktur planda, DXF, DWG və PDF-də və 3D-də uzunluğu çıxış borusu boyunca düzbucaqlı kimi çəkilir; borular onun divarından başlayır. LandXML onu divar qalınlığı ilə düzbucaqlı struktur (`RectStruct`) kimi yazır və belə strukturları növ kimi geri oxuyur.

### Növü kitabxana vasitəsilə paylaşın

{{ui:Kitabxana elementi kimi saxla}} növü CadCraft kitabxana elementi kimi (`.json` faylı) yazır: onun plan simvolu, təxmini dərinliyə qədər 3D gövdə və bütün ölçülər. Paylaşmaq üçün kitabxanaya yükləyin. {{ui:Kitabxana elementini aç}} bu şəkildə saxlanılmış strukturu şəbəkəyə geri oxuyur, layihənin vahidlərinə çevrilir. CivilCraft-da hazırlanmamış strukturlar olmayan kitabxana elementləri səbəbi ilə rədd edilir.

## Silmək

Borunu seçin və silmək üçün {{key:Delete}} basın. Strukturu silmək ona bağlı boruları da silir. Mac-də Fn və delete basın, ya da {{ui:Sil}} klikləyin.

## Hələ hazır deyil

Axınlar, boru ölçüləri və hidravlik qradiyent xətti [Yağış drenajı](topic:storm-drainage)-dadır. Boru kataloqları, dairəvi olmayan borular, profil görünüşündə borular, əyilmiş borular və layihə üzrə birdən çox şəbəkə hələ mövcud deyil. Bax [Hələ hazır deyil](topic:not-built-yet).
