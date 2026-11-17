---
title: Enerji hattı kütüphaneniz
summary: Kendi iletkenlerinizi, yeraltı kablolarınızı, direklerinizi, ekipmanlarınızı ve hendek türlerinizi, adlandırdığınız kategorilerde yapın ve dosya olarak paylaşın.
keywords: kütüphane, iletken, kablo, direk, destek, traversi, izolatör, armatür, gergi, çekme teli, trafo, dolap, ek, hendek, kategori, csv, içe aktar, dışa aktar
from: 88733744
---

Enerji hatları çalışma alanının **Kütüphane** bölümü, bir hattın ya da kablonun kullanabileceği her öğeyi tutar. Hiçbiri bir ülkeye ya da üreticiye bağlı değildir: çalıştığınız öğeleri siz oluşturursunuz.

## Üç tür öğe

| Tür | Nerede durur | Değiştirebilir misiniz? |
|---|---|---|
| **Örnekler** | CivilCraft ile birlikte gelir; malzeme özelliklerinden hesapladığımız genel sayılarla | Hayır: önce {{ui:Kütüphaneme kopyala}} |
| **Projede** | Açtığınız proje dosyasıyla geldi | Hayır: önce {{ui:Kütüphaneme kopyala}} |
| **Kendi öğelerim** | Kendi öğeleriniz, bu tarayıcıda tutulur | Evet; değişiklikler hemen kaydedilir |

Her proje kullandığı her öğenin bir kopyasını tutar; böylece bir proje, kendi iletkenleri ve direkleriyle herhangi bir bilgisayarda açılır.

:::warning
Örnek öğeler birer örnektir: her sayıyı tedarikçinizin verileriyle denetleyin. Yeraltı kablolarının bilerek bir akım değeri yoktur, çünkü kablonun nasıl döşendiğine bağlıdır.
:::

## Öğe oluşturun

1. **Kütüphane** içinde **Tür** seçin (havai iletkenler, yeraltı kabloları, direkler, ekipmanlar ya da hendek türleri).
2. {{ui:Yeni öğe}} düğmesine tıklayın ya da bir örnek seçip {{ui:Kütüphaneme kopyala}} ya da {{ui:Çoğalt}} düğmesine tıklayın.
3. Alanlarını doldurun. `*` ile işaretli alanlar denetimlerin ihtiyaç duyduğu alanlardır; bunlardan biri eksik olan bir öğe `!` ile işaretlenir ve bir hat onu kullandığında **Denetimler** altında listelenir.
4. Ona bir **Kategori** verin; düzeyler arasında `/` kullanın: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Ağaç kategorilerinizi izler.

Her türün gerekenleri:

| Tür | Denetimler için gerekenler |
|---|---|
| Havai iletken | kesit, çap, metre başına kütle, kopma dayanımı, elastik modül, ısıl genleşme |
| Yeraltı kablosu | damarlar, kesit, gerilim, çap, direnç, akım değeri |
| Direk | toplam uzunluk, nominal yük (tepenin biraz altındaki bir noktada alınır), zemindeki derinlik |
| Ekipman | türü; traversler, armatürler ve gergiler için anma yükü; traverslerde faz aralığı ve düşüm; izolatörlerde uzunluk; gergilerde açı |
| Hendek türü | derinlik, genişlik, kablolar üzerindeki örtü |

## Paylaşın

- {{ui:Kütüphanemi kaydet}}, sizin her öğenizi tek bir `.cclines.json` dosyasına kaydeder; {{ui:Kütüphane aç…}} bunlardan birini geri okur (aynı anahtara sahip öğeler değiştirilir).
- {{ui:CSV olarak kaydet}}, baktığınız türü bir elektronik tablo olarak kaydeder; {{ui:Kütüphane aç…}} o türün bir CSV dosyasını geri okur. Sütunlar herhangi bir sırada gelebilir; noktalı virgülle ayrılmış bir dosya ondalık için virgül kullanabilir.
