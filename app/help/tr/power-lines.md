---
title: Enerji hatları çalışma alanı
summary: Sahanızdaki havai hatlar ve yeraltı kabloları; kendi kütüphaneleriniz, yük durumlarınız altında sarkma ve çekme, açıklık ve dayanım denetimleri, çekme tabloları, metrajlar, sayfalar ve GIS dışa aktarımı.
keywords: enerji hattı, havai hat, elektrik, dağıtım, direkler, destekler, iletken, sarkma, çekme, çekme tablosu, açıklık, yeraltı kablosu, hendek, çalışma alanı, şebeke
from: 638dd856
---

Enerji hatları çalışma alanı, havai hatları ve yeraltı kablolarını zaten sahip olduğunuz CivilCraft sahasına yerleştirir: aynı ölçme noktaları, aynı zemin, aynı proje dosyası.

:::warning
Bir tasarım yardımcısıdır. Çalışma alanı sarkmayı, çekmeyi, açıklıkları ve yükleri **sizin** yük durumlarınızdan ve sınırlarınızdan hesaplar; hiçbir ülkenin standardı yerleşik değildir. Bir mühendis, bir şey inşa edilmeden önce her sonucu geçerli standarda göre denetler.
:::

## Açın

{{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Enerji hatları çalışma alanı}} seçin ya da Çalışma alanı altındaki **Enerji hatları**'nı seçin. Araç çubuğunda o zaman bir **Enerji hatları** grubu görünür; Tasarım ve GIS grupları kenara çekilir. Geri dönmek için Çalışma alanı altında **İnşaat**'ı seçin. CivilCraft, bu bilgisayarda en son kullandığınız çalışma alanını hatırlar.

Sol panelin en üstüne iki bölüm eklenir:

- **Enerji hatları**: yük durumlarınız ve sınırlarınız, projedeki hatlar ve kablolar ve her zaman güncel olan **Denetimler**. Bir denetime tıklayarak ilgili şeyi seçin.
- **Kütüphane**: kendi iletkenleriniz, kablolarınız, direkleriniz, ekipmanlarınız ve hendek türleriniz. Bkz. [Enerji hattı kütüphaneniz](topic:power-line-library).

## Enerji hatları grubunda neler var

| Araç | Ne yapar | Konu |
|---|---|---|
| **Hat** | Bir havai hat: her direğe tıklayın | [Havai hat çizin](topic:overhead-line) |
| **Direk** | Bir aralığa direk ekleyin | [Havai hat çizin](topic:overhead-line) |
| **Kablo** | Bir hendekte yeraltı kablosu güzergâhı | [Yeraltı kabloları](topic:underground-cables) |
| **Ekipman** | Bir dolap, bir trafo, bir ek ya da şebekeyi besleyen kaynak | [Yeraltı kabloları](topic:underground-cables) |
| **Engel** | Bir hattın kestiği bir şey: bir yol, bir bina, başka bir hat | [Denetimler](topic:power-line-checks) |
| **Boy kesiti** | Hat boy kesiti: zemin, direkler ve her yük durumunda iletken | [Havai hat çizin](topic:overhead-line#the-line-profile) |
| **Daha fazla** | Yük durumları ve sınırlar, çekme tabloları, metrajlar, sayfalar ve rapor, GIS, etüt dosyaları | [Sarkma ve çekme](topic:sag-and-tension), [Çıktılar](topic:power-line-outputs), [Etüt dosyaları](topic:power-line-study-file) |

Eklediğiniz her şey tek bir geri alma adımıdır, proje dosyasında kaydedilir ve planda `C-POWR-…` adlı katmanlara çizilir; böylece DXF, DWG ve PDF dışa aktarımları da onu taşır.
