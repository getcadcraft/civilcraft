---
title: Təsvir açarları və xətt kodları
summary: Sahə kodlarını təsvirli nöqtə qruplarına çevirin və kodlanmış nöqtələri xətlərə birləşdirin (başla, son, bağla), bu xətlər sınma xəttinə çevrilir.
keywords: təsvir açarları, sahə kodları, xətt kodları, fiqurlar, xətt işi, başla, son, bağla, nöqtə qrupları, kodlar, geodezik kodlar, məlumat toplayıcı, sınma xətləri, bordür, yol örtüyünün kənarı
from: b3d1af8d
---

Geodeziya qrupları sahədə hər ölçünü kodlaşdırır: `EP` yol örtüyünün kənarı üçün, `TC` bordürün üstü üçün, `BLDG` bina küncü üçün. Kod nöqtənin təsvirinin ilk sözüdür. CivilCraft nöqtələri ona görə qruplaşdırır və ondan sonrakı xətt kodlarını xəttə çevirir.

## Xətt kodları

Xətt kodu sahə kodundan dərhal sonrakı sözdür:

| Təsvir | Mənası |
|---|---|
| `EP B` | Bu nöqtədə yeni yol örtüyü kənarı xəttini başladır |
| `EP` | Cari EP xəttini davam etdirir |
| `EP E` | Cari EP xəttini bu nöqtədə bitirir |
| `BLDG C` | Binanı bağlayır: bu nöqtəni xəttin ilk nöqtəsinə birləşdirir |

Eyni kodlu nöqtələr nöqtə nömrəsi ardıcıllığı ilə birləşdirilir. Müxtəlif kodlar eyni qrupda olsa belə fərqli xətlərdir, buna görə `EP1` və `EP2` eyni anda iki kənar verir. Xətt kodu istifadə etməyən kod bütün nöqtələri ilə birləşdirilir, köhnə versiyalarda olduğu kimi.

**Sınma xətti** kimi istifadə olunan qrupdakı xətlər hər xətt üçün bir sınma xəttinə çevrilir, buna görə boşluqlu bordür boşluğu keçərək uzadılmır. Digər qruplardakı xətlər planda çəkilir (V-NODE-LINE qatında) və DXF, DWG və PDF-ə gedir.

Başla, son və bağla sözləri `B`, `BEG`, `START`; `E`, `END`; və `C`, `CLO`, `CLOSE`-dir. Onları dəyişdirin və ya xətt kodlarını aşağıdakı dialoqda söndürün.

## Təsvir açarları

Təsvir açarı kodu nöqtə qrupuna, istifadəyə və uzun təsvirə çevirir.

1. **Nöqtələr** altında {{ui:Description keys and line codes}} klikləyin.
2. {{ui:Add a key}} klikləyin və sətiri doldurun:
   - **Kod**: uyğunlaşdırılacaq sahə kodu. `*` istənilən simvolları, `?` isə bir simvolu bildirir, buna görə `EP*` EP, EP1 və EP12-ni tutur.
   - **Qrup**: bu nöqtələrin qoşulduğu nöqtə qrupu (boş = kodun özü). `EP*` qrupu `EP` olan EP1 və EP2-ni bir qrupda qoyur, lakin onlar ayrı xətt olaraq qalır.
   - **İstifadə**: Nöqtələr, Sınma xətti və ya Kənarda qalır, qrup ilk dəfə göründükdə (və ya **Nöqtələr** cədvəlinə buraxın).
   - **Təsvir**: uzun ad, nöqtənin **Xüsusiyyətlərində** göstərilir.
3. **Nöqtələr** sütunu yazdıqca hər açarın tutduğu nöqtələrin sayını hesablayır. Koda uyğun gələn ilk açar qalib gəlir.
4. {{ui:Apply}} klikləyin. Qruplar, səth və plan bir addımda izləyir: {{key:Mod+Z}} onu geri qaytarır.

Qrup **Nöqtələr** cədvəlində verdiyiniz istifadəni saxlayır; açarın istifadəsi yalnız yeni olan qrup üçün onu təyin edir. Açarlar və xətt kodları layihə faylında saxlanılır.
