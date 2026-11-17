---
title: Qazıqlama hesabatı hazırlayın
summary: Trassa boyunca pikətləri stansiyalarda və ofsetlərdə, ya da yaxınlıqdakı planalma nöqtələrini siyahıya alın: stansiya, ofset, şimal və şərq koordinatları, layihə və torpaq hündürlükləri, kəsim və ya dolgu ilə; hesabatı CSV və ya PDF kimi saxlayın.
keywords: qazıqlama, pikətləmə, qazıq hesabatı, kəsim vərəqi, dərəcə vərəqi, stansiya, ofset, kəsim, dolgu, planlaşdırma, tikinti qazıqlaması, icra sənədi, as-built
from: d8a4e9f1
---

Trassanı seçin və onun **Xüsusiyyətlər** bölməsində **Qazıq hesabatı** düyməsini basın.

## Stansiyalarda və ofsetlərdə pikətlər

1. **Haradan** və **hara**: pikətlənəcək stansiyalar (1+50 və ya 150).
2. **hər**: interval. Pikətlər onun hər bölünəninə, hər iki ucda və (qutu işarələnibsə) trassanın əyrilərinin başladığı və bitdiyi yerdə qoyulur.
3. **Ofsetlər**: trassanın solunda və sağında, stansiyaya baxaraq: `12 L, 0, 12 R`, `L12 CL R12` və ya `-12, 0, 12` (sol mənfi ilə). Koridorlu trassa yol örtüyünün kənarları və çiyinləri ilə başlayır.
4. **Nömrə başlanğıcı** və **prefiks** pikətləri adlandırır: 1, 2, 3 və ya S101, S102.

## Trassaya yaxın planalma nöqtələri

**Trassaya yaxın planalma nöqtələrini** və nə qədər yaxın olduğunu seçin. Həmin məsafədə olan hər nöqtə öz stansiyasını və ofsetini, oradakı layihəni və özünün hündürlüyünü torpaq kimi alır: pikətlənmiş və ya icra olunmuş kimi çəkilmiş nöqtələrin yoxlanması.

## Hesabatda nə var

| Sütun | Nə olduğu |
|---|---|
| Nöqtə | Pikətin adı və ya planalma nöqtəsinin nömrəsi |
| Stansiya, Ofset | Trassa boyunca yeri: L sol, R sağ |
| Şimal, Şərq | Onun koordinatları |
| Layihə hündürlüyü | Orada layihə koridorunun səthi (açıq hava xəttindən açıq hava xəttinə), əks halda mərkəz xətti üzrə layihə profili |
| Torpaq hündürlüyü | Oradakı mövcud səth və ya planalma nöqtəsinin öz hündürlüyü |
| Kəsim/dolgu | C torpaq layihədən yuxarı olanda (aşağı kəsilir), F aşağı olanda (doldurulur), yüzdə birinə qədər |

Layihə hündürlüyü olmayan pikətin (koridordan kənarda və ya mərkəz xəttindən uzaqda layihəsi olmayan trassada) kəsimi və ya dolgusu yoxdur; dialoq neçə belə pikət olduğunu deyir.

## Saxlayın

- **CSV**: başlıq sətri, sonra yuxarıdakı sütunlar, üstəgəl kəsim və ya dolgu işarəli ədəd kimi (torpaq minus layihə) — cədvəl proqramları və məlumat toplayıcıları üçün.
- **PDF**: seçdiyiniz kağızda cədvəl səhifələri, hər sətirdə bir piket, kəsimlər narıncı, dolgular yaşıl rəngdə, digər vərəqlərin başlıq zolağı ilə.

:::note
Pikətlər layihədəki layihədən hesablanır. Heç nə tikilməzdən əvvəl onları təsdiq edilmiş planlarla yoxlayın.
:::
