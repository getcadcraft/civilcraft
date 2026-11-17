---
title: IFC ixrac və idxal
summary: Bütün layihəni IFC 4.3, IFC4 və ya IFC2x3-də bir IFC faylı kimi saxlayın (trassalar, yollar, torpaq işləri, səthlər, divarlar, borular) və trassaları və səthləri üçün IFC fayllarını açın.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trassa, ifcalignment, yol, ifcroad, torpaq işləri, tin, təhvil, satınalma, ifc ixrac et, ifc idxal et
from: 6b998bcf
---

IFC layihə təhvili kimi bir çox dövlət müştərisinin tələb etdiyi açıq mübadilə formatıdır. CivilCraft bütün layihəni bir IFC faylına yazır və trassaları və səthləri IFC fayllarından geri oxuyur.

## İxrac

1. **İxrac** qrupunda {{ui:IFC}} düyməsinə klik edin (lent variantında: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Sxemi seçin. **IFC 4.3 ADD2** birinci və defoltdur: trassalar, yollar və torpaq işləri olan nəşrdir. IFC4 və ya IFC2x3-ü yalnız qəbul edənin proqramı 4.3-ü oxuya bilmədikdə seçin.
3. Dialoq faylın nəyi saxlayacağını və seçilmiş sxemin nəyi buraxdığını göstərir. {{ui:Export IFC}} düyməsinə klik edin.
   Fayl "*layihə adı*-ifc4x3.ifc", "-ifc4.ifc" və ya "-ifc2x3.ifc" adı ilə yüklənir. CivilCraft sonuncu seçdiyiniz sxemi yadda saxlayır.

## Hər sxemdə nə var

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trassalar | IfcAlignment üfüqi (düz xətlər, dairəvi qövslər, klotoid spirallar) və şaquli (meyllər, parabolik əyrilər) layihələri ilə, onların əyriləri (IfcCompositeCurve, IfcGradientCurve), başlanğıc pikketi və superelevasiya hadisələri | Mülki elementdə 3D polixətt | Proksidə 3D polixətt |
| Dəhlizlər | IfcRoad yol hissələri ilə; zolaqlar, çiyinlər, tullantı arxları və səkilər IfcPavement kimi, bordürlər IfcKerb kimi, əkin zolaqları; hər örtük qatı qalınlığı, materialı və həcmi ilə IfcCourse kimi; yan yamaclar kəsim və doldurma həcmləri ilə IfcEarthworksCut və IfcEarthworksFill kimi; layihə sürəti və sinfi | Mənası üzrə adlandırılmış mülki elementlər, hər yol üzrə qruplaşdırılmış | Proksilər, hər yol üzrə qruplaşdırılmış |
| Səthlər | Üçbucaqlaşdırılmış qeyri-düzgün şəbəkəli IfcGeographicElement TERRAIN | Üçbucaqlı üz çoxluqları | Üz əsaslı səth modelləri (daha böyük fayllar) |
| Platformalar və divarlar | Platformanın üstü, onun yamacları torpaq işləri kimi, dayaq divarları IfcWall RETAININGWALL kimi | Eyni, divar istifadəçi tərəfindən təyin edilən divar tipi kimi | Eyni, divarın tipi ObjectType-da |
| Boru şəbəkələri | IfcDistributionSystem-də IfcPipeSegment və IfcDistributionChamberElement | Eyni | IfcSystem-də IfcFlowSegment və kameralar |
| Coğrafi istinad | IfcProjectedCRS və IfcMapConversion | Eyni | Sahədə ePSet_ProjectedCRS və ePSet_MapConversion |

**Dəmir yolu** (Railway açıq olan trassa) IFC 4.3-ə IfcRailway kimi düşür: keçidləri öz tipləri ilə (klotoid, kub parabolası, Bloss, Helmert, sinus yarım dalğası kosinus əyrisi kimi, sinus), kantı IfcAlignmentCant kimi, yolu isə relslər, şpallar və balast yatağı kimi, altında alt balast ilə. IFC4 və IFC2x3 eyni hissələri mülki elementlər və ya proksilər kimi alır. IFC 4.3 dəmir yolunu açanda keçidləri və kantı geri gətirir.

Hər fayl həm də sahələri (izləri), Landscape iş sahəsinin bitkilərini və hardscape-ni, və bina kütlələrini (hər biri mərtəbələri ilə IfcBuilding) bir sahə altında saxlayır. Xüsusiyyət dəstləri sizin layihələndirdiyinizi saxlayır: stansiyalar, qurğu, kəsim və doldurma yamacları, zolağın eni və sayı, lağım dibləri və lük kənarları, divar hündürlükləri; miqdarlar (uzunluqlar, sahələr, həcmlər) IfcElementQuantity dəstləridir.

## Vahidlər və koordinatlar

Fayl layihənin uzunluq vahidindədir (metr və ya ABŞ geodeziya futu); sahələr və həcmlər kvadrat və kub metrlərdədir. Koordinatlar (GIS › Koordinatlar) təyin olunduqda fayl xəritədə yerləşdirilir: onun başlanğıcının şərq və şimal koordinatları və yerli sistemin fırlanması və miqyası xəritə çevrilməsindədir. Onsuz fayl öz yerli başlanğıcını xüsusiyyət dəstində qeyd edir və xəritədə yerləşdirilmir.

## İdxal

.ifc faylını {{ui:Open}} ilə açın və ya planın üzərinə atın. İdxal dialoqu faylın nəyi saxladığını göstərir:

- IFC 4.3-dən **Trassalar** (üfüqi və şaquli layihələr) və IFC 4x1 trassa əyriləri CivilCraft trassalarına çevrilir, onların PI-ləri, radiusları, spiral uzunluqları və PVI-ləri ilə. CivilCraft-ın PI modelinin saxlaya bilmədiyi trassa (mürəkkəb əyrilər, iki əyri arasında spirallar, əyridə başlayan və ya bitən) idxal olunmur və dialoq səbəbini göstərir.
- **Səthlər**: mövcud yer olacaq birini seçin və ya layihənin saxladığını saxlayın.
- **Digər hər şey** (və digər səthlər) istinad kimi 3D görünüşdə göstərilə bilər. İstinad elementləri layihə açıq olduqda qalır; layihə faylında saxlanmırlar.

CivilCraft-ın IFC4 və ya IFC2x3-də yazdığı fayl trassalarını xüsusiyyət dəstlərindən dəqiq geri qaytarır.

## Hələ hazırlanmayıb

- Yolun superelevasiyası superelevasiya hadisələri və yol səthlərində yazılır (kant dəmir yolları üçündür).
- İstinad elementlərinin layihə faylında saxlanması, və IFC-dən boru şəbəkələrinin və ya platformaların redaktə oluna bilən obyektlər kimi idxal edilməsi.
