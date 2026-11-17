---
title: Kommunal şəbəkələr və OpenStreetMap
summary: Su, kanalizasiya, yağış suyu, qaz, enerji və telekommunikasiya xətləri; material, ölçü, örtük dərinliyi və sahibi ilə; Overpass JSON faylından OpenStreetMap məlumatları; kəsişmələr, xəndək kəsikləri və həcmlər; DWG, DXF və PDF-də xidmət qatları; IFC boru və kabel seqmentləri.
keywords: kommunal, xidmət, şəbəkə, osm, openstreetmap, overpass, boru, kabel, qaz, kanalizasiya, yağış, telekommunikasiya, enerji, su, yanğın kranı, lyuk, xəndək, kəsişmə, təmizlik məsafəsi, örtük, dərinlik, dwg, ifc, koordinatlı, qatlar
from: 8a85dace
---

Sahənin yeraltı xidmətlərini hər xidmət üçün ayrıca şəbəkə kimi çəkin, onların harada kəsişdiyini yoxlayın və qat kimi çertyoj formatlarına və IFC-yə göndərin.

## Xətlər yaradın

Açın **Səth, Daha çox, Kommunal şəbəkələr...**

- **Seçimdən xətt yaradın** seçilmiş trassanı, xarakterik xətti və ya borunu seçdiyiniz xidmətin xəttinə çevirir. Sonra cədvəldə material, ölçü (mm), örtük dərinliyi (boru və ya kabelin üstünə qədər dərinlik) və sahibi doldurun.
- **OpenStreetMap məlumatlarını oxuyun** saxladığınız Overpass JSON faylını oxuyur (`out geom;` sorğusu ilə). Əvvəlcə layihənin koordinat sistemi olmalıdır, çünki OpenStreetMap mövqeləri enlik və uzunluqdur. Boru kəmərləri (maddəyə görə), yeraltı enerji və telekommunikasiya kabelləri, yanğın kranları, lyuklar və yağış kanalizasiyası oxunur; qalan hər şey kənarda qalmış sayılır və mesajda bildirilir. Hava xətləri kənarda qalır.
- **OpenStreetMap xəritəsini əlavə edin** planın altına OpenStreetMap xəritəsini əlavə edir. Yalnız Parametrlərdə internetdən gələn xəritə qatları aktiv olduqda çəkilir.

## Yoxlamalar və çıxışlar

- **Kəsişmələr**: planda kəsişən müxtəlif xidmətlərin xətləri siyahıya alınır, yer səthi olduqda aralarındakı təmiz hündürlük göstərilir; minimum sizin təyin etdiyiniz yer tutucudur, standartın rəqəmi deyil.
- **Xəndək**: hər xətt üçün xəndək yaradılır (boru ölçüsü və hər tərəfdə təmizlik məsafəsi, yan meyl, yastıqlama) və həcm göstərilir. Cəmi pəncərədə və CSV-də görünür.
- **Çertyoj**: xətlər və nöqtələr xidmət qatlarındadır (məsələn, U-WATR-RUN, U-POWR-RUN), buna görə PDF, DXF və DWG-yə çatır.
- **IFC**: xətlər IFC ixracına boru seqmentləri və kabel seqmentləri kimi daxil olur, yanğın kranları, klapanlar və kameralarla birlikdə, hər xidmət üçün bir sistem, layihənin koordinat sistemində.

## OpenStreetMap məlumatları

OpenStreetMap məlumatlarının müəllif hüququ OpenStreetMap töhfə verənlərinə məxsusdur və ODbL altında lisenziyalaşdırılıb. Müəllif qeydi çertyoja, CSV-yə və IFC-yə əlavə olunur. OpenStreetMap məlumatı olan faylı paylaşsanız, müəllif qeydini saxlayın və lisenziyanın paylaşma şərtlərini oxuyun.

## Hələ edilməyənlər

Xətlər hələ alətlə planda nöqtə-nöqtə çəkilmir, kəsişmələr isə hələ profil görünüşündə çəkilmir (hesablama hazırdır). Dərinliklər, ölçülər və təmizlik məsafələri yer tutucu kimi başlayır: öz standartınızın rəqəmlərindən istifadə edin.
