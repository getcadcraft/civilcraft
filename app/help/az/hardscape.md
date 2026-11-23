---
title: Döşəmə, divarlar və addımlar
summary: Drenaja və ya eninə meylə döşəmə, naxış və onun təbəqələri; zəmini izləyən cığırlar; dayaq və azad divarlar, pilləli təməllər; bordürlər; limitlərə görə yoxlanılan rampalar və addımlar; IFC ixracı.
keywords: bərk örtük, döşəmə, daşlar, həyət, teras, meyl, drenaj, eninə meyl, balıq sümüyü naxışı, düz bağlama, cığır, piyada yolu, dayaq divarı, bağ divarı, təməl, divar örtüyü, bordür, kənar, ramp, əlçatanlıq, addımlar, pillə, pillə hündürlüyü, basma səthi, meydança
from: d34b4466
---

Bərk örtük hər dəfə zəmindən yenidən hesablanır, buna görə zəmini izləyir və zəmin və ya onun xətti hərəkət etdikdə yenidən qurulur. Planda künclərini hər xətt kimi sürükləyin. Onu Abadlaşdırma qrupunda {{ui:Bərk örtük}} düyməsindən açın.

## Döşəmə

Künclərə klikləyin və {{key:Enter}} basın. Xüsusiyyətlərdə:

- **Səviyyə**: boş = altındakı zəminin orta səviyyəsi.
- **Meyllər**: səviyyəli, **eninə meyl** (bir istiqamətə doğru faiz) və ya **drenaja**: CivilCraft drenajın harada olacağını göstərməyinizi istəyir, sonra hər künc drenajdan meylə görə yüksəlir. Planda oxlar meylləri göstərir.
- **Naxış** (şəbəkə, düz bağlama, balıq sümüyü) vahid ölçüsü, birləşmə və bucaqla; **Kənar** eni. Vərəqdə bir millimetrdən yaxın birləşmələr buraxılır.
- Döşəmə layihə səthinin bir hissəsidir. Onun təbəqələri (daşlar, altlıq, baza) IFC-yə və kəmiyyətlərə daxil olur.

## Cığırlar

Cığır boyunca klikləyin və {{key:Enter}} basın. Zəmini izləyir, **Eninə meyl** sağ tərəfinə doğrudur. **İcazə verilən ən dik**dən dik olan cığır planda orada `!` ilə işarələnir və Xüsusiyyətlər onun nə qədər dik olduğunu göstərir.

Cığır korridorla qurulmuş yola çatdıqda yolun xarici kənarında dayanır, orada səki və ya çiyin səviyyəsində, layihə səthində və 3D görünüşdə. Yolu kəsən cığır hamarlanır və iki hissə kimi göstərilir; yoldan bir az qısa çəkilmiş son (cığır eninin iki mislindən az) öz kənarına qədər davam etdirilir. Planda cığır çəkdiyiniz kimi qalır, onun uzunluğu və sahəsi bütün xətti sayır. Bax: [Yol korridorunun yaradılması](topic:corridor).

## Divarlar

Divar boyunca klikləyin və {{key:Enter}} basın. Divar **dayaq** və ya **azad** olur. **Yuxarı** verilmədikdə o, bütün uzunluğu boyunca zəmindən **Hündürlük** qədər qalxır; səviyyəli saxlamaq üçün yuxarını yazın. **Təməli** zəminin altında təyin olunmuş dərinlikdə oturur və tam pillələrlə aşağı enir, beləliklə aralarında səviyyəli qalır. Xüsusiyyətlər onun uzunluğunu, hündürlüklərini, üz sahəsini və təməl pillələrini verir; plan hər ucunda divarın yuxarısını və aşağısını (TW / BW) yazır.

:::warning
1.2 m (4 ft)-dən yüksək dayaq divarı işarələnir: onu mühəndis layihələndirir.
:::

## Bordürlər

Bordür boyunca klikləyin və {{key:Enter}} basın; enini və çıxıntısını təyin edin.

## Rampalar

Aşağıdan yuxarıya klikləyin və {{key:Enter}} basın. Səviyyələr hər ucdakı zəmindən gəlir, siz yazmasanız. Rampaya hər 750 mm (2.5 ft) qalxmada bir meydança verilir və **İcazə verilən ən dik** (başlanğıc 1:12) və minimal en ilə yoxlanılır; Xüsusiyyətlər onun nə qədər uzun olmalı olacağını göstərir.

## Addımlar

Aşağı pillənin ön kənarına, sonra pillələrin yuxarıya çatdığı yerə klikləyin və {{key:Enter}} basın. Pillə hündürlükləri sayı hündürlükdən və **Ən böyük pillə hündürlüyü**ndən gəlir; pillə dərinliyi rahatlıq qaydası 2R + G ≈ 630 mm-dən, heç vaxt **Ən kiçik pillə dərinliyi**dən az olmadan; hər **Bir uçuşda ən çox pillə** üçün meydança. Xüsusiyyətlər onların iki nöqtə arasına sığıb-sığmadığını və ya nə qədər uzun olmalı olduqlarını göstərir.

:::note
Rampa və addımlar üçün limitlər etiketli standart dəyərlərdir. Bina məcəlləniz tələb etdiyini təyin edin.
:::

## CivilCraft-dan kənarda

- Daha çox › {{ui:Abadlaşdırma IFC-ni ixrac et}}: döşəmə və cığırlar `IfcPavement` kimi, divarlar `IfcWall` kimi (dayaq divarları RETAININGWALL kimi) təbəqələri ilə, bordürlər `IfcKerb` kimi, rampalar `IfcRamp` kimi, addımlar `IfcStair` kimi pillə hündürlükləri və basma səthləri ilə.
- Bitki cədvəlinin **TakeoffCraft-a göndər** düyməsi döşəmə sahələrini və təbəqə həcmlərini, divar üz sahələrini və uzunluqlarını, bordür uzunluqlarını və pillə saylarını daşıyır.
- Detal vərəqi hər divarın kəsiyini, hər döşəmənin təbəqə quruluşunu və hər pillə uçuşunu çəkir. Bax: [Abadlaşdırma vərəqləri](topic:landscape-sheets).
