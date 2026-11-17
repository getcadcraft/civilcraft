---
title: Hasarlar
summary: Xətt, torpaq sahəsi və ya altlıq boyunca hasar: dirəklər, çubuqlar, panellər və ya pikətlər, darvazalar, relyefə görə meylli və ya pilləli, cədvəl, plan simvolları və IFC elementləri. Köməkçi üçün də mövcuddur.
keywords: hasar, dirəklər, çubuqlar, panellər, pikətlər, darvaza, meylli, pilləli, relyef, cədvəl, ifc, bərkitmə, sərhəd
from: c0e7b84a
---

Xarakterik xətt, trassa, torpaq sahəsi və ya altlıq boyunca hasar qurun; dirəkləri və darvazaları sizin üçün yerləşdirilir.

## Hasar qurun

1. Planda xətt, torpaq sahəsi və ya altlıq seçin.
2. **Səth, Daha çox, Hasarlar...** bölməsini açın.
3. Üslubu (panellər, çubuqlar və ya pikətlər), meylli və ya pilləli olduğunu, hündürlüyü, dirəklər arasındakı məsafəni və darvaza enini seçin, sonra **Seçim üzrə hasar qur** düyməsinə klikləyin, ya da ən uzun düz hissənin ortasına darvaza qoymaq üçün **Darvaza ilə** seçin.

Dirəklər uclarda, hər künc nöqtəsində (20 dərəcə və ya daha çox dönən təpə), hər darvazanın hər kənarında və aralarında bərabər bölmələrdə qoyulur; heç biri aralıqdan uzun olmur. **Meylli** panellər dirəkləri arasında relyefi izləyir. **Pilləli** panellər səviyyədə qalır və dirəklərdə pillə yaradır; panelin altındakı boşluq ən aşağı dirəyində ən genişdir, və pəncərə boşluq limitdən böyük olduqda və ya relyef panelin içindən yuxarı qalxdıqda xəbərdarlıq edir. 6 fut (1.8 m) və daha geniş darvazalar iki qanadlı olur; plan qanadları açıq, fırlanma istiqaməti ilə göstərir.

## Cədvəl və çıxışlar

Hər hasar öz uzunluğunu, növə görə dirəkləri, panelləri, darvazaları və pillələri göstərir; dirəklər, panellər, çubuqlar, pikətlər və darvazaların **CSV** cədvəli də var. Planda PDF, DXF və DWG üçün hasar qatları var (C-FENC, C-FENC-POST, C-FENC-GATE). IFC ixracı dirəkləri (IfcMember, post), panelləri (IfcRailing, user defined fence panel), çubukları (IfcMember) və darvazaları (IfcDoor, gate) saxlayır; hər hasar üçün bir sistem.

## Köməkçidən

`fence_build` hasar qurur (nöqtələr və ya adlı xətt, torpaq sahəsi və ya altlıq, darvazalar stansiya üzrə) və `fence_list` hasarları cədvəli ilə siyahılayır.

## Nə edilməyib

Başlanğıc ölçüləri adi seçimlərdir, norma deyil. Kitabxanadan olan növlər yalnız ad kimi daşınır. Darvazalar bir düz hissədə yerləşməlidir. BimCraft-da bu alət hələ yoxdur.
