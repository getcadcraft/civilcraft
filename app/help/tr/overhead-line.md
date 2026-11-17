---
title: Havai hat çizin
summary: Planda direkler yerleştirin, CivilCraft'ın her direğin rolünü ve ölü uçlar arasındaki bölümleri belirlemesine izin verin, direkleri planda ya da hat profilinde taşıyın.
keywords: havai hat, direk, açıklık, bölüm, ölü uç, açı, askı, profil, yükseklik, traversa, gergi, dayanak
from: b8e5e272
---

## Çizin

1. Bir yüzeyiniz olsun: hattın altındaki zemin ondan gelir ([Yüzey oluşturun](topic:build-surface)). Altında zemin olmayan bir direk **Denetimler** altında listelenir; bunun yerine Özellikler'de **Zemin kotu**nu yazın.
2. **Enerji hatları** grubundaki {{ui:Hat}} tıklayın ve planda her direğe tıklayın.
3. Sonuncuya çift tıklayın ya da {{key:Enter}} tuşuna basın.

Hat, bu bilgisayarda en son kullandığınız iletkeni, direği ve ekipmanı alır (ilk kez: kütüphaneden örnekler). Bunları Özellikler'de değiştirin.

## Özelliklerde hat

Hattı seçin (bir açıklığa tıklayın) ve **İletken**, **Devre başına iletken**, **Devre**, **Gerilim**, hattın yere göre koruması gereken **Güvenlik mesafesi kuralı**'nı ve **Her direkte** ekipmanı (bir traversa, izolatörler, bağlantı parçaları) ayarlayın. Tablo her birinin **bölümlerini** yönlendirme açıklığı, günlük gerilim ve onu yöneten yük durumu ile listeler.

## Direkler

Bir direğe tıklayarak seçin. Özellikler'de:

- **Direk**: kütüphane öğesi. Çok zayıfsa, {{ui:Kullan …}} yükü taşıyan, kütüphanenizdeki aynı malzemeden en küçük direği koyar.
- **Rol**: Otomatik, Askı, Açı ya da Ölü uç. Otomatik şu anlama gelir: ilk ve son direkler ölü uçtur; kural kümesinin açısını aşan bir dönüş açı direği yapar, daha büyük bir dönüş ölü uç yapar.
- **Zeminden yükseklik**: boş bırakılırsa kütüphane öğesinden alınır (uzunluk eksi zemin içindeki derinlik).
- **Bu direkte ayrıca**: ekstra ekipman, örneğin bir **gergi** (dayanak). Gergili bir direk, hattın çekişini gergisine aktarır.
- **Mevcut direk**: diğerleri gibi denetlenir ama miktarların dışında bırakılır.

{{ui:Direk}} tıkladığınıza en yakın açıklığa bir direk ekler. Planda bir direği sürükleyerek taşıyın. {{key:Delete}} onu kaldırır (bir hat en az ikisini tutar).

Bölümler ölü uçlar arasında çalışır: bir bölümün içinde iletken askı kelepçelerinden serbestçe geçer, bu nedenle tüm bölüm için tek bir gerilim geçerlidir.

## Hat profili

{{ui:Boy kesiti}} tıklayın (ya da hattın Özelliklerindeki **Boy kesiti**). Planın altındaki panel, hat boyunca zemini, her direği zeminden tepesine kadar, seçtiğiniz **Yük durumu**'nda iletkenin en alt fazını ve hattın kesikli bir çizgi olarak tutması gereken güvenlik mesafesini gösterir. Başarısız olan bir açıklık kırmızıdır; her açıklığın altındaki sayı, o açıklığın en düşük güvenlik mesafesidir.

- **Hat** hangi enerji hattının gösterileceğini seçer. Planda başka bir hattı ya da bir direğini seçmek profili ona geçirir.
- Profilin üzerine imleci getirin: bir kılavuz çizgi onu izler, etiket hat boyunca mesafeyi, zemini, iletkeni ve oradaki güvenlik mesafesini okur (ve güvenlik mesafesinin hattın kuralının altında olduğunu söyler).
- Profil çubuğundaki {{ui:Ölç}}: iki nokta tıklayarak aradaki yatay mesafeyi, yükseklik farkını, düz mesafeyi ve eğimi alın. Zemine, iletkene ya da bir direğin tepesine yakın bir tıklama onu yakalar. Durdurmak için {{ui:Ölç}} öğesine yeniden tıklayın.
- Hattın geçtiği engeller zeminden yükselir: çizilmiş olanlar çubuk olarak, Peyzaj bitkileri tepeleri olarak, duvarlar çubuk olarak (bkz. [Enerji hattı kontrolleri](topic:power-line-checks#clearances)). Hattın geçtiği kablo güzergâhları ve borular, adlarıyla birlikte üst kısımlarında zeminin altında işaretlenir.

- Bir direği yana sürükleyerek hat boyunca taşıyın.
- Tepesini yukarı ya da aşağı sürükleyerek zeminden yüksekliğini ayarlayın.
