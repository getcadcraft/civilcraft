---
title: IFC dışa aktarma ve içe aktarma
summary: Tüm projeyi IFC 4.3, IFC4 veya IFC2x3 olarak tek bir IFC dosyası olarak kaydedin (eksenler, yollar, toprak işleri, yüzeyler, duvarlar, borular); IFC dosyalarını eksenleri ve yüzeyleri için açın.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, eksen, ifcalignment, yol, ifcroad, toprak işleri, tin, teslim edilebilir, tedarik, ifc dışa aktar, ifc içe aktar
from: 6b998bcf
---

IFC, birçok kamu müşterisinin teslimat olarak istediği açık değişim biçimidir. CivilCraft tüm projeyi tek bir IFC dosyasına yazar ve eksenleri ile yüzeyleri IFC dosyalarından geri okur.

## Dışa aktarma

1. **Dışa aktar** grubunda {{ui:IFC}} tıklayın (şerit stillerinde: {{ui:Çıktı}} › {{ui:Dışa aktar}} › {{ui:IFC}}).
2. Şemayı seçin. **IFC 4.3 ADD2** ilk ve varsayılandır: eksenler, yollar ve toprak işleri içeren sürümdür. IFC4 veya IFC2x3'ü yalnızca alıcının yazılımı 4.3'ü okuyamadığında seçin.
3. İletişim kutusu dosyanın neleri içereceğini ve seçilen şemanın neleri dışarıda bıraktığını söyler. {{ui:IFC'yi dışa aktar}} tıklayın.
   Dosya "*proje adı*-ifc4x3.ifc", "-ifc4.ifc" veya "-ifc2x3.ifc" olarak indirilir. CivilCraft en son seçtiğiniz şemayı hatırlar.

## Her şemanın içerdikleri

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Eksenler | IfcAlignment; yatay (çizgiler, dairesel yaylar, klotoid spiraller) ve dikey (eğimler, parabolik eğriler) düzenleri, eğrileri (IfcCompositeCurve, IfcGradientCurve), başlangıç istasyonunu ve süperelevasyon olaylarını | Bir sivil öğe üzerinde 3B çoklu çizgi | Bir vekil üzerinde 3B çoklu çizgi |
| Koridorlar | IfcRoad ile yol parçaları; şeritler, omuzlar, oluklar ve kaldırımlar IfcPavement olarak, bordürler IfcKerb olarak, bitki şeritleri; her kaplama tabakası kalınlığı, malzemesi ve hacmiyle bir IfcCourse olarak; yan yamaçlar kazı ve dolgu hacimleriyle IfcEarthworksCut ve IfcEarthworksFill olarak; tasarım hızı ve sınıfı | Ne oldukları adıyla anılan, yol başına gruplanmış sivil öğeler | Yol başına gruplanmış vekiller |
| Yüzeyler | Üçgenlenmiş düzensiz ağ ile IfcGeographicElement TERRAIN | Üçgenlenmiş yüz kümeleri | Yüz tabanlı yüzey modelleri (daha büyük dosyalar) |
| Platformlar ve duvarlar | Platform üstü, yamaçları toprak işleri olarak, istinat duvarları IfcWall RETAININGWALL olarak | Aynısı, duvar kullanıcı tanımlı bir duvar tipi olarak | Aynısı, duvarın tipi ObjectType içinde |
| Boru ağları | IfcDistributionSystem içinde IfcPipeSegment ve IfcDistributionChamberElement | Aynısı | IfcSystem içinde IfcFlowSegment ve odalar |
| Coğrafi referans | IfcProjectedCRS ve IfcMapConversion | Aynısı | Sahada ePSet_ProjectedCRS ve ePSet_MapConversion |

Bir **demiryolu** (Demiryolu açıkken bir eksen) IFC 4.3'e IfcRailway olarak girer: geçişleri kendi tipleriyle (klotoid, kübik parabol, Bloss, Helmert, kosinüs eğrisi olarak sinüs yarım dalgası, sinüs), yol eğimi (cant) IfcAlignmentCant olarak ve hattı raylar, travers ve balast yatağı olarak, altında alt balastla birlikte. IFC4 ve IFC2x3 aynı parçaları sivil öğeler veya vekiller olarak alır. IFC 4.3 demiryolunu açmak geçişlerini ve yol eğimini geri getirir.

Her dosya ayrıca parselleri (ayak izleri), Peyzaj çalışma alanının bitkilerini ve kaplamasını ile bina kütlelerini (her biri katlarıyla bir IfcBuilding) tek bir sahada taşır. Özellik kümeleri tasarladığınız şeyi taşır: istasyonlar, kompozisyon, kazı ve dolgu yamaçları, şerit genişliği ve sayısı, dip ve ağız kotları, duvar yükseklikleri; miktarlar (uzunluklar, alanlar, hacimler) IfcElementQuantity kümeleridir.

## Birimler ve koordinatlar

Dosya projenin uzunluk biriminde (metre veya ABD araştırma feet'i) yazılır; alanlar ve hacimler metrekare ve metreküp olarak yazılır. Bir koordinat sistemi varsa (GIS › Koordinatlar) dosya haritaya yerleştirilir: başlangıç noktasının doğu ve kuzey değerleri ile bir yerel (zemin) sistemin dönüşü ve ölçeği harita dönüşümünde yer alır. Hiçbiri yoksa dosya yerel başlangıcını bir özellik kümesinde kaydeder ve bir haritaya yerleştirilmez.

## İçe aktarma

Bir .ifc dosyasını {{ui:Aç}} ile açın veya planın üzerine bırakın. İçe aktarma iletişim kutusu dosyanın ne içerdiğini söyler:

- IFC 4.3'ten **eksenler** (yatay ve dikey düzenler) ile IFC 4x1 eksen eğrileri CivilCraft eksenlerine dönüşür; PI'ları, yarıçapları, spiral uzunlukları ve PVI'lariyle birlikte. CivilCraft'ın PI modelinin tutamayacağı bir eksen (bileşik eğriler, iki eğri arasındaki spiraller, bir eğride başlayan veya biten eksen) içe aktarılmaz ve iletişim kutusu nedenini söyler.
- **Yüzeyler**: mevcut zemin olacak olanı seçin veya projenin kendisini koruyun.
- **Diğer her şey** (ve diğer yüzeyler) referans olarak 3B görünümde gösterilebilir. Referans öğeler proje açık kaldıkça kalır; proje dosyasına kaydedilmezler.

CivilCraft'ın IFC4 veya IFC2x3 olarak yazdığı bir dosya, eksenlerini özellik kümelerinden tam olarak geri getirir.

## Henüz yapılmadı

- Bir yolun süperelevasyonu süperelevasyon olayları ve yol yüzeylerine yazılır (yol eğimi demiryollar içindir).
- Referans öğelerini proje dosyasına kaydetme; boru ağlarını veya platformları IFC'den düzenlenebilir nesneler olarak içe aktarma.
