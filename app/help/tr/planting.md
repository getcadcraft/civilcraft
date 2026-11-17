---
title: Dikim planları ve listeleri
summary: Tek bitkileri yerleştirin; bitkilerin aralığında doldurulan dikim yatakları (yüzdeye göre karışık bitkilerle) ve çitler oluşturun; bunları etiketleyin; bir elektronik tablo ya da TakeoffCraft için bir bitki listesinde sayın.
keywords: dikim planı, bitki listesi, dikim yatağı, toplu dikim, çit, ağaç, çalı, yer örtücü, aralık, üçgen aralık, bitki sayısı, miktarlar, etiketler, taç, bitki sembolleri, ifc, metraj
from: ab49eab5
---

## Bitki yerleştirin

1. Soldaki **Bitkiler** bölümünde bir bitki seçin.
2. {{ui:Bitki}} düğmesine tıklayın, sonra plana tıklayın: her tıklama bir bitki yerleştirir. Durdurmak için {{key:Esc}} tuşuna basın.

Bir bitkinin sembolü olgunluktaki yayılımında çizilir; Daha fazla › {{ui:Dikim boyutunda göster}} her bitkiyi dikildiği boyutta çizer. Ağaçlar altlarındaki zemin üzerinde durur: sahayı daha sonra tesviye ederseniz, ağaçlar zemini izler. Bunun yerine bir bitkiyi belirli bir kotta sabitlemek için, **Özellikler** içindeki **Kot** alanına yazın.

## Bitki yatakları

1. Ana bitkiyi seçin, {{ui:Yatak}} düğmesine tıklayın ve yatağın köşelerine tıklayın. Kapatmak için {{key:Enter}} tuşuna basın (ya da ilk köşeye yeniden tıklayın).
2. Yatak, o bitkiyle aralığında, **üçgen** desende doldurulur (olağan olan: her bitki altı diğerinden eşit uzaklıktadır); kenardan yarım aralık içeride.
3. Özellikler bölümünde **Bitki ekle**, soldan seçilen bitkiyi karışıma ekler. Her bitkinin **Pay %** değerini ayarlayın: yatak tam olarak o kadarını alır ve alan boyunca dağıtır. **Yeniden karıştır** bitkilerin yerlerini yeniden dağıtır.

**Aralık** boş bırakılırsa bitkilerin kendi aralığı kullanılır (paylarıyla ağırlıklandırılmış); her bitki için bunu kullanmak üzere bir değer yazın. **Desen** kare olabilir ve **Sıra açısı** sıraları çevirir.

## Çitler

Çit bitkisini seçin, {{ui:Çit}} düğmesine tıklayın, çit boyunca tıklayın ve {{key:Enter}} tuşuna basın. Bitkiler çizgi boyunca aralıklarında yerleşir ve her iki ucun aynı payı olacak şekilde ortalanır. Bir çit, belirli bir mesafeyle ayrılmış **iki sıralı, şaşırtmalı** olabilir.

## Etiketler

Tek bitkiler etiket ayarıyla etiketlenir (varsayılan olarak `{name}`); tek bir bitki için kendi etiketinizi Özellikler bölümünde yazın. Yataklar her bitkinin sayısıyla, çitler de kendi sayılarıyla etiketlenir. Daha fazla › {{ui:Bitki etiketleri}} etiketleri açıp kapatır. Etiket alanları: `{name}`, `{botanical}`, `{size}` (kap), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Bitki listesi

Daha fazla › {{ui:Bitki listesi…}} her bitkiyi tür bazında sayar; tek bitkileri, yatakları ve çitleri birlikte, dikim boyutuyla. **CSV** ya da **XLSX** olarak kaydedin ya da **TakeoffCraft'a gönderin**: TakeoffCraft'ın bitkileri fiyatlandırmak için açtığı bir miktar dosyasıdır (sert zemin ve sulama miktarlarıyla birlikte).

## IFC

Daha fazla › {{ui:Peyzaj IFC'sini dışa aktar}} peyzajı, bir BIM modelinin tutabileceği bir IFC dosyası (IFC 4.3) olarak kaydeder: her bitki, VEGETATION türünde bir `IfcGeographicElement` olur; tür adına göre tiplenir ve bitkinin özelliklerini (botanik adı, boyutlar, dayanıklılık, su, ışık) taşır. Her yatak ve çit, sayılarıyla birlikte sahada tek bir öğe olarak yer alır. BimCraft bunu binanın yanında açar.
