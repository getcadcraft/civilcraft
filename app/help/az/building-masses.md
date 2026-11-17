---
title: Sahədə bina kütlələrini çəkin
summary: Parsel üzərində bina kütləsi çəkin, ona mərtəbələr və mərtəbə hündürlüyü verin, ümumi mərtəbə sahəsini görün, meylli zəmində necə oturduğunu seçin, 3D-də hündürlüyünü itələyib çəkin, sonra BimCraft-a göndərin və ya IFC faylı kimi saxlayın.
keywords: kütlə, kütlə modelləşdirmə, bina kütləsi, həcm, ayaq izi, mərtəbələr, mərtəbə hündürlüyü, ümumi mərtəbə sahəsi, GFA, meyl, podium, kəsmə və doldurma, itələmə çəkmə, 3D, sahə tədqiqatı, erkən layihə, IFC, inkişaf etdirmə, BimCraft, A-MASS
from: e5a67c16
---

Bina kütləsi ayaq izi, mərtəbə sayı və mərtəbə hündürlüyüdür: erkən sual "burada nə qədər bina sığır və bu zəmin üçün nə edir". Kütlələr planda adları, mərtəbə sayı və ümumi mərtəbə sahəsi ilə durur, PDF çapına və DWG və DXF ixraclarına `A-MASS` və `A-MASS-TEXT` qatlarında daxil olur və layihə faylında saxlanılır.

## Kütlə çəkin

1. **Xassələr** altında, **Bina kütlələri** bölməsində **Kütlə çək** klikləyin. (O, alətlər panelinin **Səth** yanındakı **Digər** menyusundadır.)
2. Ayaq izinin künclərinə klikləyin. Parsel küncünə və ya geodeziya nöqtəsinə yaxın klik həmin nöqtənin dəqiq yerini alır.
3. Bitirmək üçün birinci künclə yenidən klikləyin və ya {{key:Enter}} basın. {{key:Backspace}} son künci geri alır; {{key:Esc}} dayandırır.

Yeni kütlənin üç mərtəbəsi və 12 ft (3.6 m) mərtəbə hündürlüyü var və ortası düşdüyü parsələ aiddir.

## Mərtəbələr, hündürlük və sahə

Kütləyə klikləyib **Ad**, **İstifadə**, **Mərtəbələr**, **Mərtəbə hündürlüyü** və **Parsel**-i dəyişin. **Hündürlük** mərtəbə sayının mərtəbə hündürlüyünə hasilidir: hündürlük yazsanız, mərtəbə sayı ən yaxın tam ədədə çevrilir (heç vaxt birdən az deyil). **Ayaq izi** və **Ümumi mərtəbə sahəsi** (ayaq izi mərtəbə sayına vurulur) sizin üçün hesablanır.

## Meylli zəmində

Kütlənin altındakı zəmin səthdən oxunur: mövcud zəmin, və ya **Layihələndirilmiş zəmin (tənzimlənmiş)** seçdiyiniz yerdə tənzimlənmiş zəmin. **Meylli zəmində** yerüstü mərtəbənin harada olacağını deyir:

- **Pilləli**: ayaq izi altındakı orta zəmində. Aşağı tərəf ona qədər doldurulur, yüksək tərəf kəsilir və ikisi təxminən tarazlaşır.
- **Podium**: ən yüksək zəmində. Möhkəm baza aşağı tərəfi doldurur.
- **Kəsmə**: ən aşağı zəmində. Yüksək tərəf təpəyə doğru kəsilib çıxarılır.

Xassələr kütlə altındakı zəmin diapazonunu, **Yerüstü mərtəbə səviyyəsini** və zəmin ilə həmin səviyyə arasındakı doldurma və kəsmə həcmini göstərir. Səthdən kənarda olan ayaq izi nöqtəsi kənarda qalır və Xassələr neçə olduğunu deyir.

## 3D görünüşdə

Kütlələr 3D sayt görünüşündə çəkilir, hər mərtəbə ətrafında xətt və damın üzərində adları ilə. **Göstər** bölməsində **Bina kütlələri** üçün qutu var. Birini seçmək üçün klikləyin. Kütlə seçili olduqda:

- Damını yuxarı və ya aşağı sürükləyərək bir mərtəbə-mərtəbə itələyin və ya çəkin, və ya {{key:PageUp}} və {{key:PageDown}} basın;
- bütün hərəkət bir geri alma addımıdır.

**Sürüş** küçə görünüşü də kütlələri görür və **Günəş** onların kölgəsini yerə salır.

## Göndərin

- **Kütlələri IFC kimi** hər kütləni IFC4 faylı kimi saxlayır: sayt, mərtəbələri ilə bina və kütlə "CadCraft_SiteMass" xassə dəstində rəqəmləri ilə bina elementi olaraq. Layihədə koordinat sistemi təyin olunduqda fayl xəritədə yerləşdirilir və saytın enlik və boylamını daşıyır; olmadıqda harada olduğu barədə heç nə demir.
- **BimCraft-da inkişaf etdirin** BimCraft-ı kütlələrlə yeni nişanda açır. Orada kütləni seçmək onun rəqəmlərini və **Bu kütləni inkişaf etdir** düyməsini göstərir; bu, ayaq izindən hər mərtəbədə divarlar və binanın altında döşəmə qurur, bir geri alma addımında. Heç nə yüklənmir: fayl bu brauzerin iki nişanı arasında keçir.

Həmçinin bax **Zonalaşdırma limitləri** və **Günəş saatları**.
