---
title: Döşeme, duvarlar ve basamaklar
summary: Bir drenaja veya enine eğime doğru eğimli döşeme, desen ve katman yapısı; zemini izleyen patikalar; basamaklı temelli istinat ve serbest duvarlar; bordürler; sınırlarına göre kontrol edilen rampalar ve basamaklar; IFC dışa aktarımı.
keywords: sert zemin, döşeme, parke, teras, avlu, eğimler, drenaj, enine eğim, balık sırtı, yatay örgü, patika, yürüyüş yolu, istinat duvarı, bahçe duvarı, temel, duvar başlığı, bordür, kenar, rampa, erişilebilirlik, merdiven, basamaklar, basamak yüksekliği, basamak, sahanlık
from: d34b4466
---

Sert zemin her seferinde zeminden yeniden hesaplanır; bu nedenle araziyi izler ve zemin ya da çizgisi değiştiğinde yeniden oluşur. Köşelerini planda herhangi bir çizgi gibi sürükleyin. Peyzaj grubunda {{ui:Sert zemin}} ile açın.

## Döşeme

Köşelere tıklayın ve {{key:Enter}}'a basın. Özellikler'de:

- **Kot**: boş = altındaki zeminin ortalaması.
- **Eğimler**: düz, bir **enine eğim** (bir yöne doğru yüzde) ya da **drenaja doğru**: CivilCraft drenajın nereye gideceğine tıklamanızı ister; sonra her köşe, drenajdan itibaren eğimle yükselir. Planda oklar eğimleri gösterir.
- **Desen** (ızgara, yatay örgü, balık sırtı) birim boyutu, derz ve açıyla; **Kenar** genişliği. Bir sayfada, bir milimetreden yakın derzler dışarıda bırakılır.
- Döşeme, önerilen yüzeyin bir parçasıdır. Katmanları (parke taşları, yatak, temel) IFC'ye ve metrajlara girer.

## Patikalar

Patika boyunca tıklayın ve {{key:Enter}}'a basın. Zemini izler; **Enine eğimi** sağ tarafına doğrudur. **En dik izin verilen** değerinden daha dik olan bir patika, bulunduğu yerde planda `!` ile işaretlenir ve Özellikler ne kadar dik olduğunu söyler.

Bir patika, bir koridorun oluşturduğu bir yolla karşılaştığında, önerilen yüzeyde ve 3B görünümde, oradaki yürüme yolu veya bankuet kotunda yolun dış kenarında biter. Bir yolu kesen patika tesviye edilir ve iki parça olarak gösterilir; yoldan kısa çizilmiş bir uç (patika genişliğinin iki katına kadar) kenarına kadar uzatılır. Plan, patikayı çizdiğiniz gibi göstermeye devam eder; uzunluğu ve alanı tüm çizgiyi sayar. Bkz. [Yol koridorunu süpürün](topic:corridor).

## Duvarlar

Duvar boyunca tıklayın ve {{key:Enter}}'a basın. Duvar **istinat** veya **serbest** olabilir. **Üst** girilmezse, baştan sona zeminin üstünde **Yükseklik** kadar durur; üstünü yatay tutmak için bir üst değeri girin. **Temeli** zeminin altında ayarlanmış bir derinliğe oturur ve tam adımlarla basamaklanır, böylece aralarında yatay kalır. Özellikler uzunluğunu, yüksekliklerini, yüz alanını ve temel basamaklarını verir; plan her uçta duvarın üst ve alt kotlarını (TW / BW) etiketler.

:::warning
1.2 m (4 ft) değerinden yüksek bir istinat duvarı işaretlenir: bir mühendis tarafından tasarlanması gerekir.
:::

## Bordürler

Bordür boyunca tıklayın ve {{key:Enter}}'a basın; genişliğini ve yükselme miktarını ayarlayın.

## Rampalar

Alttan üste doğru tıklayın ve {{key:Enter}}'a basın. Siz yazmadığınız sürece kotlar her iki uçtaki zeminden alınır. Bir rampaya her 750 mm (2.5 ft) yükselişte bir sahanlık konur ve **En dik izin verilen** (başlangıçta 1:12) ile asgari genişliğe göre kontrol edilir; Özellikler ne kadar uzun olması gerektiğini söyler.

## Basamaklar

En alt basamağın ön kenarına, ardından basamakların üste ulaştığı yere tıklayın ve {{key:Enter}}'a basın. Basamak yüksekliği sayısı, yükseklikten ve **En büyük basamak yüksekliği**nden gelir; basamak genişliği konfor kuralı 2R + G ≈ 630 mm'den gelir, asla **En küçük basamak genişliği**nin altına düşmez; **Bir kolda en fazla basamak** başına bir sahanlık. Özellikler, basamakların iki nokta arasına sığıp sığmadığını ya da ne kadar daha uzun olmaları gerektiğini söyler.

:::note
Rampalar ve basamaklar için sınırlar etiketli varsayılan değerlerdir. Yapı yönetmeliğinizin gerektirdiklerini ayarlayın.
:::

## CivilCraft dışına

- Daha fazla › {{ui:Peyzaj IFC'sini dışa aktar}}: döşemeler ve patikalar `IfcPavement` olarak, duvarlar `IfcWall` olarak (istinat duvarları RETAININGWALL olarak) katmanlarıyla, bordürler `IfcKerb` olarak, rampalar `IfcRamp` olarak, basamaklar ise basamak yükseklikleri ve basamak genişlikleriyle birlikte `IfcStair` olarak.
- Bitki listesinin **TakeoffCraft'a gönder** komutu, döşeme alanlarını ve katman hacimlerini, duvar yüz alanlarını ve uzunluklarını, bordür uzunluklarını ve basamak sayılarını taşır.
- Ayrıntı sayfası her duvarın kesitini, her döşemenin katman yapısını ve her basamak kolunu çizer. Bkz. [Peyzaj sayfaları](topic:landscape-sheets).
