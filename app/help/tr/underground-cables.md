---
title: Yeraltı kabloları
summary: Hendeklerde destekler ve ekipman arasındaki kablo güzergâhları, örtü ve kesişimler, tambur uzunluğuna göre ekler ile hendek ve kablo miktarları.
keywords: yeraltı kablosu, kablo güzergâhı, hendek, kanal, örtü, kesişim, boru kesişimi, ek, tambur, dolap, transformatör, kaynak, gerilim düşümü
from: adfd2717
---

## Kablo güzergâhı çizin

1. Kablo bir dolapta, bir transformatörde ya da bir ekte bitiyorsa önce ekipmanı yerleştirin: {{ui:Ekipman}}, sonra tıklayın.
2. {{ui:Kablo}} tıklayın ve güzergâhı çizin; başlangıç ve bitişin bağlanması için bir destek ya da ekipman üzerinde olsun. {{key:Enter}} çizimi bitirir.

Özellikler'de **Kablo**, **Hendek türü**, **yan yana kablo sayısı** ve **gevşeklik** (%) seçin. Güzergâh uzunluğunu, nerede başlayıp bittiğini ve taşıdığı akımı gösterir.

## Denetlenenler

- **Örtü**: güzergâh boyunca kablonun üst kısmının zeminin altında kalması, hendek türünün örtüsüne (ya da kural kümesinin en az örtüsüne) karşı.
- **Kesişimler**: güzergâhın bir CivilCraft borusu ya da başka bir kabloyla kesiştiği yerlerde, aralarındaki boşluk bir açıklık kuralına karşı denetlenir: güzergâhın kendi **Kesişim açıklığı** (Özellikler'de) seçildiyse o; aksi halde kural kümesinin **Yeraltı kesişimleri** kuralı (örnek kümeler *Yeraltı kesişimi*, 0.3 m kullanır); aksi halde hendek türünün diğer hizmetlerle arasındaki boşluk. İki kablo kesiştiğinde ikisinden büyük olan açıklık uygulanır. Kesişen bir havai hat bilgi amaçlı listelenir ve kablo o hattın profilinde görünür.
- **Ekler**: kablo öğesi bir tambur uzunluğu veriyorsa, kablonun her tambur uzunluğunda (gevşeklikle birlikte) bir ek.

## Ekipman

Ekipmanın bir kütüphane öğesi, bir **yük** (kW) ve **güç faktörü** vardır; bir **kaynak** de olabilir: ağ oradan beslenir. Kaynağın gerilimi kütüphane öğesinden ya da beslediği hat ya da kablodan gelir.

## Miktarlar

{{ui:Daha fazla}} › {{ui:Metrajlar…}} kabloyu (güzergâh uzunluğu × (1 + gevşeklik) × yan yana kablo sayısı + her iki uçtaki yükselme), hendeği türüne göre, kazı, yatak ve geri dolgu hacimlerini, kanalları ve ekleri, havai hatların iletkeni, destekleri ve ekipmanıyla birlikte sayar.
