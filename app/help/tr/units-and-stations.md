---
title: Birimler, istasyonlar ve sayı biçimleri
summary: Feet ve metre projeleri; istasyonların, eğimlerin, yan şevlerin, yön açılarının, alanların, hacimlerin ve boru ölçülerinin nasıl yazılıp girildiği; birimleri değiştirmenin ne yaptığı.
keywords: uzunluk yazma, aritmetik, hesap makinesi, toplam, kesir, feet ve inç, 4+7/16, birimler, feet, US survey feet, metre, metrik, emperyal, istasyon biçimi, istasyonlama, eğim, yüzde, yan şev, h:v, yön açısı, cu yd, çap
from: 0b9b5b6b
---

## Proje birimleri

Bir proje **US feet** ya da **metre** cinsindedir (sol paneldeki **Birimler**). Projedeki her koordinat, kot, uzunluk ve istasyon bu birimdedir.

:::warning
**Birimler** değiştirildiğinde etiketler, istasyon biçimi, varsayılanlar ve dosyaların nasıl yazıldığı değişir. Hiçbir sayıyı **dönüştürmez**. Feet ile ölçülmüş bir saha metreye çevrilirse aynı sayılar kalır, şimdi metre olarak okunur. Durum çubuğu "Birimler artık metre. Koordinatlar dönüştürülmedi." der. Tasarıma başlamadan önce birimleri verilerinize uyacak şekilde ayarlayın.
:::

Birimlere bağlı olanlar:

| | US feet | Metre |
|---|---|---|
| İstasyon biçimi | `12+34.56` (100 ft'lik istasyonlar) | `1+234.567` (1000 m'lik istasyonlar) |
| Sunulan kontur aralıkları | 0.25 ila 20 ft | 0.1 ila 10 m |
| Alan | sq ft | sq m |
| Hacim | cu yd | cu m |
| Boru ve yapı çapı | inç | milimetre |
| Varsayılan eğri yarıçapı | 100 ft | 30 m |
| Planda istasyonlama işaretleri | her 50 ft, etiketler her 100 ft | her 20 m, etiketler her 100 m |
| Çıktı ölçekleri | 1" = 5' ila 1" = 1000' | 1:50 ila 1:10000 |
| LandXML doğrusal birimi | USSurveyFoot | meter |

Yeni bir proje feet ile başlar; ya da {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Birimler}} altında yıldızlanmış uzunluk birimi metrikse metre ile başlar. **Birimler** listesi orada açık olan birimleri ve her zaman projenin kendi birimini gösterir. Orada yıldızlanmış bir alan ya da hacim birimi (acre, hektar, acre-feet …) varsa, alanlar ve hacimler yukarıdaki sütun yerine o birimde raporlanır. Bkz. [Birimler, yazılan değerler ve birim listeleri](common:unit-lists).

LandXML açtığınızda proje dosyanın birimlerini alır. Uluslararası feet'te bir dosya feet projesi olarak açılır; sayılar değiştirilmez.

## Uzunluk ve toplam yazma

Uzunluk ya da kot isteyen her kutu düz bir sayıdan fazlasını okur: {{key:Enter}} tuşuna basın, kutu sonucu projenin birimlerinde gösterir.

| Yazdığınız | Feet projesinde | Metre projesinde |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | aynı uzunluklar metre cinsinden |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | feet cinsinden | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, diğerleri US survey feet cinsinden | aynı uzunluklar metre cinsinden |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | toplam, feet cinsinden | toplam, metre cinsinden |

Her uzunluk işareti, ortak birim tablosundaki tam değeriyle çalışır: bir projenin feet'i US survey feet'tir, bu yüzden `10 US ft` 10'dur ve `3 ch` (uluslararası feet zinciri) 197.9996'dır. `+ - * /` işaretlerini, parantezleri ve ayrıca `abs`, `round`, `ceil` ve `floor` işlevlerini kullanın. Bir uzunluğun içine yazılan tire o uzunluğun parçasıdır (`24'-6"`, `6-1/2`); aralarında boşluk varsa çıkarma yapar (`24' - 6"` = 23.5 ft). Düz bir sayı bir uzunluğu çarpar ya da böler; bir uzunluğa eklendiğinde projenin birimlerinde bir uzunluk olur. CivilCraft yazdığınızı okuyamazsa kutu işaretlenir ve durum çubuğu nerede olduğunu söyler.

İstasyonlar toplam değildir: bir istasyon kutusuna `10+00` yazarsanız istasyon 10+00 olur. Yüzde olarak eğimler, nokta numaraları ve açıklamalar olduğu gibi okunur.

## İstasyonlar

İstasyon, bir eksen boyunca artı işaretiyle yazılan bir mesafedir:

- Feet: artıdan önceki kısım yüzlerce feet'tir. `12+34.56`, 1,234.56 ft'tir.
- Metre: artıdan önceki kısım binlerce metredir. `1+234.567`, 1,234.567 m'dir.
- Negatif istasyonlar işaretini başında tutar: `-0+50.00`.

İstasyon yazdığınız her yerde (**Başlangıç istasyonu**, bir PVI'ın **İstasyonu**), artılı yazabilirsiniz (`12+34.56`) ya da düz bir sayı olarak (`1234.56`). Boşluklar yok sayılır.

## Eğimler ve şevler

- **Eğimler** (profiller, borular, şerit ve bankuet eğimleri) yüzde cinsindendir: `+1.25%` istasyon yönünde yükselir, `-0.50%` alçalır.
- **Yan şevler** (platform kazı ve dolgusu, koridor kazı ve dolgusu) yatay:düşeydir: `3`, 3 : 1 demektir; bir birim yukarı ya da aşağı için üç birim yatay.
- Düşey bir eğri için **K**, eğri uzunluğunun yüzde cinsinden eğim değişimine bölümüdür.

## Yön açıları ve açılar

Yön açıları, derece, dakika ve saniye cinsinden çeyrek yön açılarıdır: `N 63°12'05" E`. Eğri sapmaları (Δ) aynı derece, dakika ve saniyeyi kullanır; "sol" ya da "sağ" ile.

## Ofsetler

Bir eksenden ofsetler, eksene dik mesafelerdir; istasyon yönüne bakılarak **L** (sol) ya da **R** (sağ) ile işaretlenir.

## Sayı gösterimi

- Koordinatlar ve kotlar panellerde ve durum çubuğunda 2 ondalıkla gösterilir (seçili bir ölçüm noktası için 3).
- Alanlar ve hacimler binlikler halinde gruplanır: `128,250 sq ft`, `454.9 cu yd`.
- Koordinatlar hiçbir zaman gruplanmaz; böylece olduğu gibi kopyalanabilirler.

## Koordinatlar

CivilCraft düz bir düzlemde çalışır: doğu sağa, kuzey yukarıya. Tasarım çalışması her zaman projeksiyonlu koordinatlarda yapılır (state plane, UTM ya da yerel bir ızgara). CivilCraft'a bu koordinatların hangi koordinat sisteminde olduğunu ve ızgara, zemin ya da yerel koordinat olup olmadığını söyleyebilirsiniz; o zaman enlem ve boylamı gösterir ve CBS dosyalarını ile harita katmanlarını yerleştirir, ama birimleri asla değiştirmez ve koordinatlarınızı kendiliğinden taşımaz. Bkz. [Projenin koordinat sistemini ayarlama](topic:coordinate-systems) ve [Zemin ve yerel koordinatlar](topic:ground-and-local-coordinates). Büyük state plane değerleri (milyonlarca feet) sorun değildir; CivilCraft hassasiyeti korumak için iç olarak saha ile göreli çalışır.
