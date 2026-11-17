---
title: Kaplama, duvarlar ve basamaklar
summary: Bir drenaja veya enine eğime eğimli kaplama, desen ve yapısı; zemini izleyen yaya yolları; temelleri basamaklı istinat ve serbest duvarlar; bordürler; sınırlarına göre denetlenen rampalar ve basamaklar; IFC dışa aktarımı.
keywords: sert zemin, kaplama, kaplama taşları, teras, avlu, eğim, drenaj, enine eğim, balık sırtı, yatık örgü, yaya yolu, yürüyüş yolu, istinat duvarı, bahçe duvarı, temel, kapak taşı, bordür, kenar, rampa, erişilebilirlik, basamaklar, merdivenler, basamak yüksekliği, basamak, sahanlık
from: 51475877
---

Sert zemin her seferinde zeminden yeniden hesaplanır; bu yüzden araziyi izler ve zemin ya da çizgisi değiştiğinde yeniden oluşur. Köşelerini planda herhangi bir çizgi gibi sürükleyin. Peyzaj grubundaki {{ui:Sert zemin}} ile açın.

## Kaplama

Köşeleri tıklayın ve {{key:Enter}} tuşuna basın. Özellikler'de:

- **Kot**: boş = altındaki zeminin ortalaması.
- **Eğim**: kot, bir **enine eğim** (bir yöne doğru yüzde) veya **bir drenaja**: CivilCraft drenajın nereye gideceğini tıklamanızı ister, sonra her köşe drenajdan eğimle yükselir. Planda oklar eğimleri gösterir.
- **Desen** (ızgara, yatık örgü, balık sırtı) birim boyutu, derz ve açı ile; **Kenar** genişliği. Bir sayfada bir milimetreden yakın derzler dışarıda bırakılır.
- Kaplama önerilen yüzeyin parçasıdır. Katmanları (kaplama taşları, yatak, temel) IFC'ye ve miktarlara girer.

## Yaya yolları

Yol boyunca tıklayın ve {{key:Enter}} tuşuna basın. Zemini izler; **Enine eğim** sağ tarafına doğru uygulanır. **En dik izin verilen** değerinden daha dik olan bir yol, bulunduğu yerde planda `!` ile işaretlenir ve Özellikler en çok ne kadar dik olduğunu söyler.

## Duvarlar

Duvar boyunca tıklayın ve {{key:Enter}} tuşuna basın. Bir duvar **istinat** veya **serbest** olur. **Üst** yoksa, tüm boyunca zeminin üstünde **Yükseklik** kadar durur; düzgün kalması için bir üst kotu yazın. **Temeli**, zeminin altında belirli bir derinlikte oturur ve tam basamaklarla aşağı iner; böylece aralarında düz kalır. Özellikler uzunluğunu, yüksekliklerini, yüz alanını ve temel basamaklarını verir; planda her uçta duvarın üst ve alt kotları (TW / BW) etiketlenir.

:::warning
1,2 m (4 ft) üzerindeki bir istinat duvarı işaretlenir: bir mühendis tasarlar.
:::

## Bordürler

Bordür boyunca tıklayın ve {{key:Enter}} tuşuna basın; genişliğini ve yükseltisini ayarlayın.

## Rampalar

Alttan üste tıklayın ve {{key:Enter}} tuşuna basın. Kotlar, siz yazmadığınız sürece her iki uçtaki zeminden gelir. Rampa her 750 mm (2.5 ft) yükselişte bir sahanlık alır ve **En dik izin verilen** (başlangıçta 1:12) ile en az genişliğe göre denetlenir; Özellikler ne kadar uzun olması gerektiğini söyler.

## Basamaklar

Alt basamağın ön kenarını, sonra basamakların üste ulaştığı yeri tıklayın ve {{key:Enter}} tuşuna basın. Basamak sayısı yükseklikten ve **En büyük basamak yüksekliği**'nden gelir; basamak genişliği 2R + G ≈ 630 mm konfor kuralından gelir, asla **En küçük basamak genişliği**'nin altına inmez; her **Kolda en fazla basamak** için bir sahanlık yapılır. Özellikler, basamakların iki nokta arasına sığıp sığmadığını veya ne kadar uzun olmaları gerektiğini söyler.

:::note
Rampalar ve basamaklar için sınırlar etiketli varsayılanlardır. Yapı yönetmeliğinizin gerektirdiği değerleri ayarlayın.
:::

## CivilCraft dışında

- Daha fazla › {{ui:Peyzaj IFC'sini dışa aktar}}: kaplama ve yollar `IfcPavement` olarak, duvarlar `IfcWall` olarak (istinat duvarları RETAININGWALL ile) katmanlarıyla, bordürler `IfcKerb` olarak, rampalar `IfcRamp` olarak, basamaklar `IfcStair` olarak basamakları ve basamak yüzeyleriyle birlikte.
- Bitki listesinin **TakeoffCraft'a gönder** komutu kaplama alanlarını ve katman hacimlerini, duvar yüz alanlarını ve uzunluklarını, bordür uzunluklarını ve basamak sayılarını taşır.
- Detay sayfası her duvarın kesitini, her kaplamanın yapısını ve her basamak merdivenini çizer. Bkz. [Peyzaj sayfaları](topic:landscape-sheets).
