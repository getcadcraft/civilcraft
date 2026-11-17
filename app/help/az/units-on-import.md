---
title: İdxalda vahidlər: fayl öz vahidlərini bildirir, yoxsa əvvəlcə soruşulursunuz
summary: Layihəyə gətirdiyiniz çertyoj və ya mesh öz vahidlərini bildirəndə CivilCraft onu çevirir və bunu deyir. Bildirmədikdə isə oxumadan əvvəl soruşur və faylın cavabını xatırlayır.
keywords: vahidlər, idxal, DWG, DXF, STL, OBJ, planalma, fut, ABŞ planalma futu, metrlər, millimetrlər, miqyas, səhv ölçü, çox böyük, çox kiçik, soruş, xatırlanan, INSUNITS, çertyoj vahidləri
from: 60921963
---

## Nə edəcəksiniz

Faylı layihəyə gətirin və düzgün ölçüdə gəldiyinə əmin olun.

## Addımlar

1. Faylı adi üsulla açın: {{ui:Aç}}, planın üzərinə buraxın, ya da CAD çertyoj əmri ilə.
2. Fayl öz vahidlərini bildirirsə, heç nə soruşulmur: idxal dialoqu onları **Çertyojda göstərildiyi kimi** kimi göstərir.
3. Bildirmirsə, idxal dialoqu açılmazdan əvvəl dialoq faylın **vahidlərini** soruşur. Faylda bir vahidin nə olduğunu seçin və {{ui:Bu vahidlərdən istifadə et}} düyməsini basın.
4. {{ui:Ləğv et}} (ya da {{key:Esc}}) faylı ötürür. Onun heç nəsi layihəyə oxunmur.

## Hansı fayllar öz vahidlərini bildirir

- **DWG və DXF**: çertyojun əlavə etmə vahidləri (`$INSUNITS`). Onları olmayan fayl üçün soruşulur. İdxal dialoqunda **Çertyoj vahidləri** siyahısı sizin cavabınızla başlayır və yenə dəyişdirilə bilər.
- **STL və OBJ** (landşaft sərbəst formaları): heç vaxt vahid bildirmir. Sizdən soruşulur.
- **Nöqtə siyahıları** (CSV, TXT) və irəliləyiş planalma siyahıları: ilk sətirlərində vahidini bildirən siyahı çevrilir və status xətti bunu deyir. Heç bir vahid bildirməyən siyahı {{ui:İdxal}} basanda, nöqtələr daxil olmazdan əvvəl soruşulur. Enlik və uzunluq sütunları isə koordinat sistemindən keçir.
- **Nöqtə buludları əlavəsi**: faylı vahid bildirməyən bulud yaradanda soruşur və buludun rəqəmlərini onun daşıdığı vahidlə etiketləyir.
- **IFC və LandXML**: öz vahidlərini bildirir; layihənin vahidlərinə çevrilirlər.
- **LAS, LAZ və yüksəklik rasterləri**: koordinat sistemi ilə yerləşdirilir; fayl bildirmədikdə relyef dialoqu hündürlük vahidini soruşur.

## Yaxşı bilmək lazımdır

- Cavab bu kompüterdə həmin fayl üçün xatırlanır, bütün CadCraft tətbiqlərində. Növbəti dəfə gələndə soruşulmursunuz.
- Yenidən soruşulmaq üçün: əmr palitrası ({{key:Mod+K}}) › **İdxal olunan faylların vahidlərini yenidən soruş**.
- Siyahı bildirdiyi vahid ilk səkkiz sətirdən oxunur: `units: ft` kimi sətir, ya da hamısı eyni vahidi mötərizədə daşıyan sütun başlıqları, məsələn `Elevation (m)`.
