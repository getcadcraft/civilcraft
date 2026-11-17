---
title: Planı DXF kimi ixrac et
summary: Planın xətlərini adlandırılmış qatlarda R12 DXF kimi yazır; horizontallar öz hündürlükləri ilə, sınma xətləri isə 3D-də, istənilən CAD proqramı üçün.
keywords: dxf, dwg, cad, ixrac, xətlər, r12, 2000, 2004, 2007, 2010, 2013, 2018, qatlar, horizontallar, çertyoj mübadiləsi, əsas xəritə, fon
from: f2d8ede9
---

{{ui:DXF}} planda göstərilənləri R12 formatında DXF faylı kimi yazır — hər CAD proqramının aça biləcəyi versiya. AutoCAD və ya Civil 3D istifadə etmisinizsə, onu hər hansı digər DXF kimi açın və ya daxil edin.

## İxrac

1. Planı çertyojun istədiyiniz kimi qurun: **Görünüş** altında səthi (mövcud və ya layihə), horizontal intervalını və nələrin açıq olduğunu seçin (horizontallar, yazılar, nöqtələr, nöqtə yazıları, üçbucaqlar, sınma xətləri, səthin kənarı, borular, meyl oxları).
2. **İxrac** qrupunda {{ui:DWG/DXF}} düyməsini basın, {{ui:DXF (R12, text) — the plain exchange file}} seçin, sonra {{ui:Download}} düyməsini basın.
3. Brauzer `<name>.dxf` faylını yükləyir. Status panelində məsələn yazılır: "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Koordinatlar layihə vahidləri ilə, real qiymətlərində yazılır (dövlət müstəvi koordinatları olduğu kimi qalır). Heç nə miqyaslanmır və yerindən tərpənmir.

## Faylda nə var

| Element | DXF obyekti | Qat |
|---|---|---|
| Kiçik və böyük horizontallar | Hündürlüyündə 2D polixətlər | C-TOPO-MINR, C-TOPO-MAJR |
| Horizontal yazıları | Mətn | C-TOPO-TEXT |
| Üçbucaqlar | Polixətlər | C-TOPO-TINN |
| Sınma xətləri və sərhəd | 3D polixətlər | C-TOPO-BRKL |
| Səthin kənarı | Polixətlər | C-TOPO-BNDY |
| Meyl oxları | Polixətlər | C-TOPO-SLOP |
| Planalma nöqtələri və onların yazıları | Nöqtələr (hündürlüklə), mətn | V-NODE, V-NODE-TEXT |
| Xətt kodlarından xətlər | 3D polixətlər | V-NODE-LINE |
| Trassa oxları | Xətlər və qövslər | C-ROAD-CNTR |
| Pikyetaj işarələri və yazıları | Polixətlər, mətn | C-ROAD-STAN |
| Koridor kənarları | Polixətlər | C-ROAD-CORR |
| Nümunə xətləri | Polixətlər | C-ROAD-SCTN |
| Platformalar, relyefə çıxış xətləri, meyl xətləri | Polixətlər | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Xüsusiyyət xətləri | 3D polixətlər (qövslər 0.01 daxilində parçalar kimi; bax: [Xüsusiyyət xətləri](topic:feature-lines)) | C-GRAD-FEAT |
| Dönmə trayektoriyaları | Polixətlər, mətn | C-ROAD-SWPT |
| Borular, konstruksiyalar, yazılar | Polixətlər, mətn | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Problemli borular və konstruksiyalar | Polixətlər | C-STRM-PROB |

Hər qatın öz rəngi var. Tam siyahı [Plan qatları](topic:plan-layers) bölməsindədir.

## Yazı ölçüsü

Mətnin çertyoj vahidlərində ölçüsü olmalıdır. CivilCraft yazıları bütün planın Tabloid vərəqinə (fut) və ya A3 vərəqinə (metr) sığdığı miqyas üçün ölçüləndirir və status mesajında hansı miqyas olduğunu bildirir. Planı CAD proqramınızda başqa miqyasda çap etsəniz, mətni orada miqyaslandırın.

## Nə ixrac edilmir

- Hündürlük zolaqları (yalnız ekranda).
- Profil görünüşü. Profillər çertyoj kimi yox, LandXML ilə göndərilir.
- Səthin özü 3D obyekt kimi. TIN üçün LandXML istifadə edin, və ya kənarlarını xətt kimi almaq üçün {{ui:Triangles}} seçimini açın.
- **Görünüş** altında söndürdüyünüz hər şey.

## DWG

{{ui:DWG/DXF}} eyni xətləri DWG çertyoju kimi də yazır. Onun dialoqu formatı soruşur: DXF, və ya 2000, 2004, 2007, 2010, 2013 və ya 2018 DWG. 2000 demək olar ki, hər CAD proqramında, həm köhnə, həm yeni, açılır; çertyoju alan tərəf tələb edəndə daha yenisini seçin. Seçiminiz bu brauzerdə yadda qalır.

1. **İxrac** qrupunda {{ui:DWG}} düyməsini basın.
2. **Format**-ı seçin və **DWG-ni yüklə** düyməsini basın.
3. Brauzer `<name>.dwg` faylını yükləyir. Status panelində nə daxil edildiyi yazılır, məsələn "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers" — yəni "DWG ixrac edildi (2018 formatı): 12 polixətt, 40 yazı, 9 qatda".

DWG DXF ilə eyni qatları, rəngləri, horizontalları (öz hündürlüklərində polixətlər kimi), 3D sınma xətlərini, yazıları və nöqtələri eyni koordinatlarda saxlayır. DWG-nin saxlaya bilmədiyi qat adları dəyişdirilir və status mesajı bunu bildirir. CivilCraft DWG-ni öz kodu ilə yazır, buna görə heç nə kompüterinizdən çıxmır.

### DWG-də xəritə qatları

DWG çertyoj daxilində şəkil saxlaya bilmir: CAD proqramları şəkli çertyojun yanında yerləşən kimi göstərir. Xəritə qatları göstərilirkən dialoqda **Xəritə qatları çertyojun yanında şəkil kimi** seçimi təklif olunur. Bu seçilədikdə yükləmə `<name>.dwg`, `<name>-map.png` (bütün çertyoj üzərində xəritə qatları, 4096 piksela qədər enində) və `<name>-map.pgw` (onun dünya faylı, GIS proqramları üçün) saxlayan `.zip` olur. Çertyoj şəkli G-MAP-IMAG qatında, yerində şəkil kimi göstərir. Faylları bir qovluğa açın və birlikdə saxlayın.
