---
title: Süni intellekt köməkçisinin saytınızla işləməsinə icazə verin
summary: Parametrlərdə köməkçiləri açın ki, kompüterinizdəki köməkçi açıq saytı oxuya bilsin (nöqtələr, səthlər, həcmlər, profillər, parsellər), geodeziya nöqtələri əlavə edə bilsin, CadCraft Studio vasitəsilə LandXML və ya DWG saxlaya və ixrac edə bilsin. Siz açana qədər söndürülüb.
keywords: süni intellekt, köməkçi, mcp, skript, avtomatlaşdırma, studio, nöqtələr, yüksəklik, piket, ofset, trassa, həcm, kəsmə, doldurma, profil, parsel, landxml, dwg, usd, qovluqlar, icazələr, ayırmaq, fəaliyyət
from: d0356582
---

## Nə öyrənəcəksiniz

Süni intellekt köməkçisinin (MCP-ni dəstəkləyən istənilən köməkçi) açıq saytınızla işləməsinə necə icazə verilir, nə edə bilər və nə edə bilməz, və onu necə dayandırmaq olar.

## Köməkçi CivilCraft-da nə edə bilər

| Nə istəyir | Nə alır | Lazımdır |
|---|---|---|
| Sayt | Ad, vahidlər, koordinat sistemi, nöqtə qrupları, trassalar, səthlər, platformalar, parsellər və borular | Oxuma |
| Geodeziya nöqtələri | Nömrə, şərq, şimal, yüksəklik və təsvir; qrupa görə, təsvirə görə və ya qutunun içində | Oxuma |
| Səth yüksəklikləri | İstənilən adlandırdığı nöqtələrdə mövcud zəmin (və ya tənzimlənmiş səth) | Oxuma |
| Piketlər və ofsetlər | Nöqtələrin trassa boyunca piketi və ofseti, və ya piketlərin koordinatları və zəmin yüksəkliyi | Oxuma |
| Profil | Trassa boyunca zəmin, layihə profili və tənzimlənmiş səth yüksəklikləri, hər neçə fut və ya metrdən bir | Oxuma |
| Kəsmə və doldurma | Mövcud zəmin ilə tənzimlənmiş səth arasında həcmlər (hər platforma və koridor da), və ya zəmin ilə səviyyə arasında | Oxuma |
| Parsellər | Künclər, sahə (akr və ya hektarla), perimetr və hüquqi təsvir | Oxuma |
| Seçim | Köməkçinin adını çəkdiyi nöqtələr planda seçilir, sanki siz onları seçmisiniz | Redaktə |
| Yeni geodeziya nöqtələri | Verdiyi nömrələrlə və ya növbəti boş nömrələrlə əlavə olunan nöqtələr. Hər çağırış geri alına bilən bir addımdır | Redaktə |
| Saxla | CivilCraft-ın öz {{ui:Saxla}} | Saxla |
| LandXML və ya DWG | {{ui:LandXML}} və {{ui:DWG}} düymələri ilə eyni fayllar | İxrac |
| Sayt 3D-də | Zəminin, tənzimlənmiş səthin, platformaların və boruların OpenUSD (.usdz, .usda və ya .usdc) faylı, 3D görünüşün ixrac etdiyi kimi | İxrac |
| Bitkilər və bitki cədvəli | Bitki siyahısında istənilən adla tapılan bitkilər və bitki cədvəlinin saylar | Oxuma |
| Əkin və tənzimləmə | Bitkilər, yataq və ya hasar yerləşdirilmiş, ya da platforma, berma, çökək və ya tənzimləmə sahəsi əlavə edilmiş, hər biri geri alına bilən bir addım, öz kəsmə və doldurması ilə | Redaktə |
| Suvarma yoxlanışı | Hər zonanın axını, klapanında və təchizatda lazım olan təzyiq, ən pis hal başı, iş müddətləri, problemlər və material siyahısı; suvarma layihəçisinin yoxladığı hesablama köməyi kimi | Oxuma |

Açıq saytla işləyir. Studio-da o, seçdiyiniz qovluqlara saxlaya və ixrac edə bilər (aşağıya bax); qovluq olmadan faylları düymələrin etdiyi kimi yüklənir.

## Onu açın

Köməkçilər CivilCraft-a kompüterinizdəki CadCraft Studio vasitəsilə çatır; sadə brauzerdə giriş yoxdur.

1. {{ui:Parametrlər}} açın və **CivilCraft** nişanını seçin.
2. **Köməkçilər** altında **Süni intellekt köməkçilərinin və skriptlərin CivilCraft-dan istifadə etməsinə icazə ver** qutusunu işarələyin.
3. **Oxuma** sizin üçün işarələnib. **Redaktə**, **Saxla** və ya **İxrac**-ı yalnız köməkçi onlara ehtiyac duyduqda işarələyin.
4. Köməkçinin qovluğa saxlamasına və ixrac etməsinə icazə vermək üçün **İstifadə edə biləcəyi qovluqlar** altında {{ui:Qovluq əlavə et…}} seçin və Studio dialoqunda qovluğu seçin. {{ui:Sil}} onu dərhal geri alır; hər başqa yol rədd edilir.
5. Studio-da köməkçini qoşun (Studio ünvanı və yapışdırılacaq parametrləri göstərir).

## Köməkçi qoşulu olduqda

Sağ panelin yuxarısındakı qeyd hansı köməkçinin qoşulu olduğunu və nə edə biləcəyini göstərir. Sessiyanı dərhal bitirmək üçün {{ui:Əlaqəni kəs}} klikləyin; davam etmək üçün köməkçi yenidən qoşulmalıdır.

**Fəaliyyət**, Parametrlərdə **Köməkçilər** altında, köməkçinin etdiyi hər çağırışı, ən yenisi əvvəldə, işləyib-işləmədiyi ilə birlikdə siyahılayır.

:::tip
Sadə sözlərlə soruşun, məsələn "Main Street boyunca hər 50 futda zəmin yüksəkliyi nədir?", "platformalara nə qədər kəsmə və doldurma lazımdır?" və ya "bu koordinatlarda nəzarət nöqtəsi əlavə et". Köməkçi sayta baxır və cavab verir, ya da dəyişikliyi geri alına bilən bir addım kimi edir.
:::

## CivilCraft-ı açmadan

CadCraft fayl serveri köməkçilər üçün (`npx @getcadcraft/mcp`) və `cadcraft` komanda sətri saxlanılmış CivilCraft layihələrini (`.civilcraft.json`) və nöqtə fayllarını pəncərə açmadan, CivilCraft-ın öz kodu ilə açır: eyni oxuma alətləri, nöqtə əlavə etmək, layihəni saxlamaq, LandXML və sayt 3D-də OpenUSD olaraq. `cadcraft convert site.civilcraft.json site.xml` komanda sətrindən LandXML yazır. LandXML açmaq, DWG ixracı və Landşaft iş sahəsinin alətləri hələ də CivilCraft pəncərəsi tələb edir.

## Onu söndürün

**Süni intellekt köməkçilərinin və skriptlərin CivilCraft-dan istifadə etməsinə icazə ver** qutusunu çıxarın. Hər köməkçi dərhal ayrılır və parametr növbəti dəfə üçün saxlanılır.

## Həmçinin bax

- [Süni intellekt köməkçiləri üçün reseptlər](common:assistants-recipes): hər biri istifadə etdiyi alətlərlə işlənmiş nümunələr.
- [Üfüqi trassa planlayın](topic:alignment)
- [Səthi qurun və təkmilləşdirin](topic:build-surface)
- [Geodeziya nöqtələrini seçin, kopyalayın və yapışdırın](topic:copy-paste-points)
- [CivilCraft parametrləri](topic:settings)
