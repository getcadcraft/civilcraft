---
title: Torpaq sahələrini çəkin və hüquqi təsvirlərini yazın
summary: Torpaq sahəsini küncləri ilə çəkin və ya mülkiyyət sənədindən və ya plandan istiqamətləri daxil edin, istiqamətlərin necə bağlandığını yoxlayın, planda istiqamət və məsafələri yazın, hər hansı istiqaməti əyriyə çevirin və hüquqi təsvirin layihəsini kopyalayın.
keywords: torpaq sahələri, parsellər, mülkiyyət sərhədləri, sərhəd, mülkiyyət sənədi, plan, ölçü və sərhəd təsviri, istiqamət, məsafə, bağlanma, uyğunsuzluq, dəqiqlik, hüquqi təsvir, başlanğıc nöqtə, əyri, radius, sahə, akr
from: 6793d6ce
---

Torpaq sahələri planda hər düz hissə üzrə istiqamət və məsafə ilə (əyri radiusu, uzunluğu və mərkəzi bucağı ilə göstərilir), mərkəzdə isə adı və sahəsi ilə durur. Onlar PDF çapına və DWG və DXF ixraclarına `V-PROP` (xətlər) və `V-PROP-TEXT` (yazılar) qatlarında daxil olur. Heç nə seçilmədikdə, hamısı sağ paneldə **Torpaq sahələri** altındadır.

## Torpaq sahəsi çəkin

1. **Torpaq sahəsi çək** düyməsinə klikləyin.
2. Başlanğıc nöqtədən başlayaraq küncləri göstərin. Istənilən sorğu nöqtəsinin yaxınlığında klik onun dəqiq yerini alır.
3. Bitirmək üçün birinci küncə yenidən klikləyin və ya {{key:Enter}} basın. {{key:Backspace}} sonuncu küncü geri alır; {{key:Esc}} indiyə qədərki küncləri atır; alətdən çıxmaq üçün yenidən basın.

## Mülkiyyət sənədindən istiqamətləri daxil edin

1. **Sənəd istiqamətlərini daxil et** düyməsinə klikləyin.
2. İstiqamətlərin harada başladığını deyin: sorğu nöqtəsinin nömrəsini, ya da şimal və şərq koordinatlarını.
3. İstiqamətləri hər sətirdə bir olmaqla yazın və ya yapışdırın:
   - xətt: istiqamət və məsafə, məsələn `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` və azimutlar (`AZ 45°30'15"`) da işləyir; "thence", vergüllər və "feet" sözləri nəzərə alınmır.
   - əyri: `C R 300 L 52.36 right` (radius və qövs uzunluğu) və ya `C R 300 D 10°00'00" left` (radius və mərkəzi bucaq). Əyri özündən əvvəlki hissədən davam edir; etmirsə, onun vətər istiqamətini əlavə edin: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` şərh sətrini başladır.
4. Yazdıqca dialoqda istiqamətlərin uzunluğu, **uyğunsuzluq** (başlanğıcdan nə qədər uzaqda bitdikləri və hansı istiqamətdə), **dəqiqlik** (uzunluğun uyğunsuzluğa bölünməsi, 1 : 10,000 və s.) və sahə göstərilir. Oxuna bilməyən sətirlər sətir nömrələri ilə siyahılanır.
5. **Torpaq sahəsini əlavə et**. İstiqamətlər bağlanmırsa, sahə boşluq boyunca düz hissə ilə bağlanır: istiqamətləri sənədlə yoxlayın. Sahə yürüşünün xətasını onun hissələrinə bölmək üçün əvvəlcə onu tənzimləyin.

## Əyrilər

Torpaq sahəsinin **Xüsusiyyətləri** bölməsində hər hissənin **Radiusu** var. Həmin iki künc arasında əyri etmək üçün radius yazın (iki künc arasındakı məsafənin yarısından kiçik radius çatmır və rədd edilir), **Əyrilər** bölməsində isə **Sağ** və ya **Sol** seçin: sağa əyri hərəkət istiqamətinə görə sağda mərkəzə malikdir, sənəddə olduğu kimi. Düz etmək üçün radiusu təmizləyin. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri alır.

## Hüquqi təsvir

Torpaq sahəsinin Xüsusiyyətləri bölməsi onun hüquqi təsviri ilə bitir; bu, çertyojdan yazılır:

- "Başlanğıc" yazdığınız **Başlanğıc nöqtə** (məsələn "4 nömrəli sahənin şimal-şərq küncü"), əks halda birinci künc nöqtəsinin şimal və şərq koordinatları və ya istiqamətlərin başladığı sorğu nöqtəsi.
- "thence" hər istiqamət: istiqamət və məsafə, ya da radius, qövs uzunluğu, mərkəzi bucaq və vətər istiqaməti və məsafəsi ilə əyri.
- "Ehtiva edir" onun sahəsi kvadrat fut və akr ilə (metrik layihədə kvadrat metr və hektar ilə).

**Kopyala** onu mübadilə buferinə qoyur; **Mətn kimi yüklə** onu `.txt` faylı kimi saxlayır.

:::warning
Hüquqi təsvir çertyojdan hazırlanmış layihədir, sənəd deyil. Ona etibar etməzdən əvvəl lisenziyalı surveyor onu qeydlərlə yoxlamalı və imzalamalıdır.
:::

Planda torpaq sahəsini seçmək üçün onun içinə klikləyin; {{key:Delete}} onu silir. Torpaq sahələri layihə faylında saxlanılır.
