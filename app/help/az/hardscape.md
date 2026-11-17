---
title: Daş döşəmə, divarlar və pilləkənlər
summary: Drenaja və ya eninə meylə doğru meylli döşəmə, naxış və onun qatları; yerin izlədiyi cığırlar; dayaq və sərbəst divarlar pilləli təməllərlə; bordürlər; limitlərlə yoxlanılan rampalar və pilləkənlər; IFC ixracı.
keywords: bərk örtük, daş döşəmə, döşəmə, daş plitələr, həyət, teras, meyl, drenaj, eninə meyl, balıqqulağı, yan-yana, cığır, keçid yolu, dayaq divarı, bağ divarı, təməl, örtük, bordür, kənarlama, pandus, əlçatanlıq, pilləkənlər, pillə hündürlükləri, pillə səthləri, meydança
from: 51475877
---

Bərk örtük hər dəfə yerdən yenidən hesablanır, buna görə yerin və onun xəttinin dəyişməsi ilə izləyir və yenidən yaranır. Künclərini planda istənilən xətt kimi sürükləyin. Açmaq üçün **Abadlaşdırma qrupu**nda {{ui:Hardscape}} düyməsindən istifadə edin.

## Daş döşəmə

Künclərə klik edin və {{key:Enter}} basın. **Xüsusiyyətlər**-də:

- **Səviyyə**: boş = altındakı yerin orta səviyyəsi.
- **Meyl**: səviyyə, **eninə meyl** (müəyyən istiqamətə doğru faiz) və ya **drenaja doğru**: CivilCraft drenajın harada olacağını göstərməyinizi istəyir, sonra hər künc drenajdan verilən meyllə yüksəlir. Planda oxlar meyli göstərir.
- **Naxış** (şəbəkə, yan-yana, balıqqulağı) vahid ölçüsü, dərzi və bucağı ilə; **Kənarlama** eni. Vərəqdə bir millimetrdən yaxın dərzlər çıxarılır.
- Döşəmə layihəli səthin hissəsidir. Onun qatları (plitələr, yataq, əsas) IFC-yə və miqdarlara daxil olur.

## Cığırlar

Cığır boyunca klik edin və {{key:Enter}} basın. Cığır yeri izləyir; sağ tərəfinə **eninə meyl** ilə. **İcazə verilən ən dik** həddindən dik olan cığır planda olduğu yerdə `!` ilə işarələnir, və Xüsusiyyətlər onun nə qədər dik olduğunu göstərir.

## Divarlar

Divar boyunca klik edin və {{key:Enter}} basın. Divar **dayaq** və ya **sərbəst** olur. **Üst** yazılmadıqda o, bütün uzunluğu boyunca yerin üstündə **Hündürlük** qədər durur; üstü yazsanız, onu səviyyədə saxlayır. Onun **təməli** yerin altında müəyyən dərinlikdə yerləşir və tam pillələrlə aşağı enir, beləliklə aralarında səviyyəli qalır. Xüsusiyyətlər onun uzunluğunu, hündürlüklərini, üz sahəsini və təməl pillələrini verir; plan hər ucunda divarın yuxarı və aşağı səviyyəsini (TW / BW) yazır.

:::warning
1.2 m (4 ft)-dən hündür dayaq divarı işarələnir: onu mühəndis layihələndirir.
:::

## Bordürlər

Bordür boyunca klik edin və {{key:Enter}} basın; enini və yuxarı çıxıntısını təyin edin.

## Rampalar

Aşağıdan yuxarıya klik edin və {{key:Enter}} basın. Səviyyələr siz yazmasanız, hər ucda yerdən gəlir. Ramp hər 750 mm (2.5 ft) qalxmada bir meydança alır və **İcazə verilən ən dik** (başlanğıcda 1:12) və minimum en ilə yoxlanılır; Xüsusiyyətlər onun nə qədər uzun olmalı olduğunu göstərir.

## Pilləkənlər

Aşağı pillənin ön kənarına, sonra pilləkənlərin yuxarıya çatdığı yerə klik edin və {{key:Enter}} basın. Pillələrin sayı hündürlükdən və **Ən böyük pillə hündürlüyü**ndən gəlir; pillə eni 2R + G ≈ 630 mm rahatlıq qaydasından gəlir və heç vaxt **Ən kiçik pillə eni**-dən az olmur; hər **Bir pilləkən ardıcıllığında ən çox pillə**də bir meydança. Xüsusiyyətlər onların iki nöqtə arasına sığıb-sığmadığını və ya nə qədər uzun olmalı olduğunu göstərir.

:::note
Rampalar və pilləkənlər üçün limitlər etiketlənmiş standart dəyərlərdir. Bina normativinizin tələb etdiyi limitləri təyin edin.
:::

## CivilCraft-dan kənarda

- {{ui:More}} › {{ui:Export landscape IFC}}: döşəmə və cığırlar `IfcPavement` kimi, divarlar `IfcWall` kimi (dayaq divarları RETAININGWALL ilə) öz qatları ilə, bordürlər `IfcKerb` kimi, rampalar `IfcRamp` kimi, pilləkənlər öz pillə hündürlükləri və səthləri ilə `IfcStair` kimi.
- Bitki siyahısındakı **TakeoffCraft-a göndər** döşəmə sahələrini və qat həcmlərini, divar üz sahələrini və uzunluqlarını, bordür uzunluqlarını və pillə saylarını ötürür.
- Təfsilat vərəqi hər divarın kəsiyini, hər döşəmənin qurulmasını və hər pilləkən ardıcıllığını çəkir. Bax: [Abadlaşdırma vərəqləri](topic:landscape-sheets).
