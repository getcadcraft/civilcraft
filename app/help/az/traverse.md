---
title: Poliqon daxil et və kompas qaydası ilə tənzimlə
summary: Sahə bucaqlarını və ya istiqamətləri və məsafələri yazın, bucaq və xətti bağlanmanı və dəqiqliyi yoxlayın, kompas qaydası ilə tənzimləyin və stansiyaları planalma nöqtələri kimi, döngəni isə parsel kimi əlavə edin.
keywords: poliqon, qapalı poliqon, döngə, sağ bucaqlar, arxa baxış, istiqamətlər, məsafələr, bağlanma, bağlanma xətası, dəqiqlik, kompas qaydası, bowditch, tənzimləmə, planalma
from: 56ce5a8c
---

Poliqon ölçülmüş xətlər silsiləsidir: hər stansiyada bir bucaq (və ya istiqamət) və növbəti stansiyaya bir məsafə. Heç nə seçilmədikdə sağ paneldə **Poliqon** altında **Poliqon daxil et** düyməsini basın.

## Harada başlayır və bitir

1. **Başlanğıc planalma nöqtəsi**: onun nömrəsi. Və ya şimal və şərq koordinatlarını yazın.
2. **Xətlər kimi**: **Sağ bucaqlar və məsafələr** və ya **İstiqamətlər və məsafələr**.
3. Bucaqlarla: onların haradan başladığını deyin: **Arxa baxış planalma nöqtəsi** və ya **onun azimutu** (birinci stansiyadan arxa baxış nöqtəsinə doğru, şimaldan saat əqrabı istiqamətində).
4. **Son**: **başlanğıca qayıt (döngə)** və ya **planalma nöqtəsi** və onun nömrəsi (məlum nöqtələr arasında açıq poliqon).

## Xətləri yazın

Hər xət bir sətirdir: əvvəl bucaq (və ya istiqamət), sonra məsafə, istəsəniz ona çatdığı stansiyanın adı:

- Sağ bucaqlar, xətt tərk etdiyi stansiyada saat əqrabı istiqamətində dönmüş, arxadakı stansiyadan növbətiyə: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` və `270.0028` də işləyir.
- İstiqamətlər: `N 45°30'15" E 125.50 B`, və ya bir söz kimi azimut: `AZ 45-30-15 125.50 B`.
- Bucaqlı döngədə sonda `close` yazın və başlanğıc bucağı yenidən, son stansiyadan ikinciyə doğru dönmüş şəkildə: `close 270°00'05"`. Bucaqları yoxlayan budur.

Oxunmayan sətirlər sətir nömrələri ilə göstərilir. "feet", vergüllər və `#` ilə şərh sətirləri məqbuldur.

## Bağlanmanı oxuyun

Yazdıqca dialoq göstərir:

- **Bucaq bağlanma xətası**: bucaqların bağlanmasından nə qədər uzaq olduqları və hər bucağın payı. Bağlayıcı bucaq olmadan bucaqlar yoxlanmır və onlardakı hər xəta xətti bağlanma xətasında görünür.
- **Xətti bağlanma xətası**: poliqonun bitməli olduğu yerdən nə qədər uzaqda bitdiyi və hansı istiqamətdə.
- **Dəqiqlik**: poliqonun uzunluğunun xətti bağlanma xətasına bölünməsi: 1 : 10,000 o deməkdir ki, 10,000 ft-də 1 ft.
- Tənzimlədikdən sonra stansiyalar və hər birinin nə qədər yerini dəyişdiyi.

## Tənzimləmə

Əvvəlcə bucaq bağlanma xətası bucaqlar arasında bərabər bölünür. Sonra xətti bağlanma xətası kompas qaydası (Bowditch) ilə xətlər üzrə bölünür: hər stansiya ona çatmaq üçün keçilmiş uzunluğun nisbətində bağlanma xətasına qarşı yerini dəyişir, beləliklə poliqon tam olmalı olduğu yerdə bitir.

:::note
Kompas qaydası standart tənzimləmədir, ən kiçik kvadratlar üsulu deyil və bucaqları məsafələrlə tutuşdurmur. Dəqiqliyin kifayət edib-etmədiyini öz standartlarınız və ölkənizin qaydaları müəyyən edir.
:::

## Nəticədən istifadə

- **Planalma nöqtələri kimi əlavə et**: tənzimlənmiş stansiyalar sizin verdiyiniz adlarla planalma nöqtəsinə çevrilir (əks halda növbəti boş nömrələrlə), təsvir `TRAV`, hündürlük yoxdur. Döngənin son stansiyası onun başlanğıcıdır, ona görə iki dəfə əlavə olunmur. Bir addım: {{key:Mod+Z}} onu geri qaytarır.
- **Parsel kimi əlavə et** (döngələr): tənzimlənmiş stansiyalar öz yazıları və hüquqi təsviri ilə [parsel](topic:parcels) olur.
- **Hesabat (CSV)**: bağlanma sətirləri, sonra hər stansiyanın istiqaməti, məsafəsi, tənzimlənməmiş və tənzimlənmiş koordinatları və düzəlişləri.
