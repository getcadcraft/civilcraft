---
title: CivilCraft-a başlanğıc
summary: CivilCraft nə edir, necə açılır və nümunə sahə ilə ilk on dəqiqə: nöqtələrdən horizontallara, yoldan və saxlanmış layihəyə qədər.
keywords: başlanğıc, ilk işə salma, nümunə sahə, giriş, sürətli başlanğıc, dərslik, başlamaq, yeni layihə
from: c9b6dd8e
---

CivilCraft CadCraft ailəsinin sivil mühəndislik və sahə layihələndirmə tətbiqidir. Planalma nöqtələrini götürür və onları horizontallarla birlikdə səthə (TIN) çevirir, sonra dizayn profilləri ilə trassaları qurmağa, sadə yol dəhlizi çəkməyə, binaların platformalarını günəş işığına qədər planlaşdırmağa, boru şəbəkəsini qaydalarınıza görə yoxlamağa və kəsim və doldurma həcmlərinə baxmağa imkan verir. LandXML-i oxuyur və yazır, planı DXF kimi ixrac edir və PDF-ə çap edir.

Civil 3D-dən istifadə etmisinizsə, ideyalar tanış görünəcək: nöqtələr, nöqtə qrupları, sınma xətləri, PI-lərə görə trassalar, PVI-lərə görə profillər, dəhliz, planlaşdırma, boru şəbəkələri. İşləmə üsulu fərqlidir və daha sadədir: əmr sətri, üslublar və çertyoj faylı yoxdur. Əsl işə başlamadan əvvəl [Digər sivil proqramlardan gələnlər](topic:coming-from) bölməsini bir dəfə oxuyun.

## Nə lazımdır

- Son versiyalı masaüstü brauzer: Chrome, Edge, Firefox və ya Safari. Bax: [Brauzerlər](common:browsers).
- Siçan və ya tachpad və klaviatura, ya da toxunma ekranı: çəkmə işində ekranda {{ui:Bitir}}, {{ui:Nöqtəni geri al}} və {{ui:Ləğv et}} düymələri var (bax: [Siçan, tachpad və toxunma](topic:keyboard#mouse-trackpad-and-touch)).
- Plan brauzerin kanvasında 2D çəkilir. [3D görünüş](topic:site-3d) brauzerin WebGL qrafikasından istifadə edir; işə düşməsə, status paneli səbəbini göstərir və plan yenə işləyir.
- Hesab və yükləmə yoxdur. Fayllar kompüterinizdə açılır və endirmə kimi saxlanılır. Bax: [Fayllarınız](common:your-files).

:::note
CivilCraft hal-hazırda hələ hazırlanmaqda olan erkən brauzer quruluşu kimi işləyir. Masaüstü quruluşları hələ yoxdur və buludda saxlama hələ mövcud deyil. Hazırladığınız hər şey saxlayana və ya ixrac edənə qədər kompüterinizdə qalır.
:::

## CivilCraft-ı açın

1. CivilCraft-ı brauzerinizdə açın.
2. Ekranın dolmasını gözləyin: yuxarıda alət paneli, solda panel, ortada plan və sağda **Xüsusiyyətlər** paneli.
3. Boş planda **Planalma nöqtələri ilə başlayın** adlı qutu görürsünüz. Orada ilk addımlar və {{ui:Nümunə sahəni aç}} keçidi var.

CivilCraft-ı sonra bağlantı olmadan istifadə etmək üçün tətbiq panelində {{ui:Oflayn üçün saxla}} klikləyin və {{ui:Oflayn hazırdır}} yazısını gözləyin. Buraya bu kömək, nümunə sahə və 3D və GIS kitabxanaları daxildir. Bax: [Oflayn](common:offline). İstənilən vaxt {{key:F1}} basın və ya {{ui:Kömək}} klikləyin ki, bu kömək tətbiqin yanında açılsın.

## İlk on dəqiqəniz: nümunə sahə

Nümunə sahə ABŞ futlarında kiçik bir planalmadır: dövlət müstəvi koordinatlarında 276 nöqtə, bir silsilə, axını olan bir oyuq və iki sahil üstü. Tətbiqlə gəlir, ona görə öz faylınız olmadan izləyə bilərsiniz.

1. Planda qutuda {{ui:Nümunə sahəni aç}} klikləyin.
   **Nöqtələri idxal et** dialoqu açılır. Orada "276 nöqtə PNEZD kimi oxundu (başlıq sətirindən), vergüllə ayrılıb." yazılır və ilk sətirlər göstərilir.
2. {{ui:İdxal}} klikləyin.
   Plan nöqtələrlə, horizontallarla və səthin kənarı ilə dolur. Aşağıdakı status paneli nöqtələrin idxal olunduğunu və səthin neçə üçbucağının olduğunu (546) yazır.
3. Sol paneldə **Nöqtələr** altına baxın. Nöqtələr təsvirinin ilk sözünə görə qruplaşdırılıb: CP, FL, GRD, RIDGE, TBN, TBS və TREE.
4. Həmin cədvəlin **Səth** sütununda **FL**, **RIDGE**, **TBN** və **TBS** üçün {{ui:Sınma xətti}} seçin.
   Səth dərhal yenidən qurulur. **Səth** faktlarında indi "Sınma xətləri: 4" yazılır və horizontallar axın xətti və silsilə boyunca kəskin əyilir, onları kəsmək əvəzinə.
5. Siçanı planın üzərinə gətirin. Status paneli siçanın altında şərq və şimal koordinatlarını və həmin yerdə təbii zəmin hündürlüyünü göstərir.
6. **Göstərmə** altında {{ui:Horizontallar hər}} üçün 0.5 ft təyin edin və {{ui:Hündürlük zolaqları}} aktiv edin. Qutuların altında legenda ilə rəng şkalası görünür. İşiniz bitdikdə zolaqları yenidən söndürün.

İndi mövcud təbii zəmin səthiniz var. Növbəti, yol.

## Qısa yol çəkin

1. {{key:A}} basın (və ya **Layihə** qrupunda {{ui:Trassa}} klikləyin).
2. Sahə boyunca bir-birinin ardınca üç nöqtə klikləyin. Qırmızı xətt siçanı izləyir və növbəti toxunanın uzunluğunu və istiqamətini göstərir.
3. Bitirmək üçün {{key:Enter}} basın.
   Trassa stansiyalama ilə görünür. Sağ paneldə **Trassa** göstərilir: uzunluğu, PI cədvəli və orta PI-də əyri (100 ft radius, və ya 100 ft yerə sığmırsa daha kiçik).
4. Sağ paneldə **Layihə profili** altında {{ui:Təbii zəmindən başla}} klikləyin.
   Profil görünüşü plandan aşağıda mövcud zəmin və başdan sona düz layihə meyli ilə açılır.
5. {{key:I}} basın ki, {{ui:PVI əlavə et}} aktiv olsun, sonra profil görünüşündə ortaya yaxın bir dəfə klikləyin. PVI görünür.
6. Sağdakı PVI cədvəlində orta PVI-nin **Əyri L** qutusuna əyri uzunluğu yazın (məsələn 100) və {{key:Enter}} basın. Profildə K dəyəri ilə etiketlənmiş şaquli əyri olacaq.
7. **Dəhliz** altında **Yığımı layihə profili boyunca sürüşdür** qutusunu işarələyin.
   Yol zəmin içinə planlaşdırılır: zolaqlar, çiyinlər və yan meyllər günəş işığına qədər. **Torpaq işləri** bloku kəsimi və doldurmanı göstərir.

Dəqiq dəyərlər barədə narahat olmayın. Hər rəqəm sağ paneldə dəyişdirilə bilər və {{key:Mod+Z}} son dəyişikliyi geri qaytarır.

## İşinizi saxlayın

1. Sol panelin yuxarısında **Ad** sahəsinə ad yazın.
2. {{key:Mod+S}} basın (və ya {{ui:Saxla}} klikləyin).
   Brauzer sayta görə adlandırılmış və `.civilcraft.json` ilə bitən fayl endirir. Nöqtələri, səth parametrlərini, trassaları, profilləri, dəhlizləri, platformaları və boruları saxlayır.
3. Sonra davam etmək üçün {{ui:Aç}} klikləyin (və ya {{key:Mod+O}} basın), həmin faylı seçin və ya planın üzərinə buraxın.

:::warning
Avtomatik saxlama yoxdur. Saxlanılmamış dəyişikliklərlə sekmənizi bağlasanız, brauzer çıxmağı soruşur; çıxsanız, dəyişikliklər itir. Tez-tez saxlayın.
:::

## Növbəti addımlar

- Öz fayllarınızla [Planalma nöqtələrini idxal edin](topic:import-points).
- [Səthi sınma xətləri və sərhədlə qurun və təkmilləşdirin](topic:build-surface).
- [Ekran, hissə-hissə](topic:workspace).
- [Düymələr və siçan](topic:keyboard).
