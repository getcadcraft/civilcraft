---
title: Sərbəst obyektlər
summary: Başqa proqramda hazırlanmış formanı (STL, OBJ və ya kitabxana elementi) sahəyə gətirin; o, relyefin üstündə durur və ya ona kəsilir, həcmi, sahəsi və əsası digərləri kimi hesablanır.
keywords: sərbəst, xüsusi obyekt, heykəl, əkin qutusu, oturacaq, şəbəkə, stl, obj, kitabxana elementi, relyefə uyğun, relyefi izləyir, relyefə kəsilir, kəmiyyətlər, həcm, ifc
from: ec835f33
---

Bir dəfəlik element (əkin qutusu, oturacaq divarı, heykəl, oyun təpəsi) ModelCraft və ya PartCraft-da hazırlana və burada yerləşdirilə bilər ki, digər hər şeylə eyni modeldə və cədvəllərdə olsun.

1. Peyzaj › More › {{ui:Freeform object…}} seçin və **STL** və ya **OBJ** faylı seçin (layihənin vahidlərində: fut layihəsində futla, metr layihəsində metrlə) və ya şəbəkə gövdəsi olan CadCraft **kitabxana elementi** (`.json`) seçin.
2. Yerləşəcəyi yerə klikləyin.

## Əsası

- **Relyefi izləyir**: onun ən aşağı nöqtəsi əsas sahəsinin altındakı ən aşağı relyef üzərində durur, buna görə heç nə havada qalmır. Xassələr onun nə qədərinin relyefin altında olduğunu təxmin edir.
- **Relyefə kəsilir**: onun əsası müəyyən hündürlükdə qurulur və əsas sahəsi daxilindəki relyef relyefə çıxış meyilləri ilə ona şaquli planlaşdırılır; Torpaq işlərində platforma kimi sayılır.

Onu **Döndər** seçimi ilə fırladın, planda sürükləyərək köçürün.

## Sayılır

Xassələr onun **həcmini** (qapalı cisim üçün), **səth sahəsini**, **əsas sahəsini** və **hündürlüyünü** verir; şəbəkədən ölçülür. IFC ixracı onu seçdiyiniz **IFC sinfi** və bu kəmiyyətlərlə yazır.

:::note
Əsas sahəsi konturun qabarıq örtüyüdür: çökük forma (L formalı əkin qutusu) sanki doldurulmuş kimi şaquli planlaşdırılır.
:::
