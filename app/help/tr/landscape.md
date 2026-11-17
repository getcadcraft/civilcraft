---
title: Peyzaj çalışma alanı
summary: Dikim planları, tesviye, kaplama, duvarlar, basamaklar, sulama ve peyzaj sayfaları; inşaat işinizle aynı sahada, aynı yüzeylerde ve aynı dosyada.
keywords: peyzaj, peyzaj mimarlığı, bahçe, bitkilendirme, bitkiler, ağaçlar, tesviye, sert zemin, kaplama, sulama, sprink, çalışma alanı, saha tasarımı, peyzaj planı
from: eea929d1
---

Peyzaj çalışma alanı, zaten sahip olduğunuz CivilCraft sahasına peyzaj tasarım araçlarını ekler: aynı ölçüm noktaları, aynı mevcut zemin, aynı önerilen yüzey ve aynı proje dosyası.

## Açın

{{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Peyzaj çalışma alanı}} seçin. Araç çubuğunda o zaman bir **Çalışma alanı** seçimi ve bir **Peyzaj** grubu görünür; Yüzey, Tasarım ve {{ui:CBS}} grupları yer açmak için kenara çekilir. Çalışma alanı altında **İnşaat**'ı seçerek geri dönün. CivilCraft, bu bilgisayarda en son kullandığınız çalışma alanını hatırlar.

Sol panelin üstünde üç bölüm eklenir:

- **Bitkiler**: bitki listesi; aramak ve yerleştireceğinizi seçmek için. Bkz. [Bitki listesi](topic:plant-list).
- **Tesviye denetimleri**: eğim analizi, akış okları ve su birikmesi. Bkz. [Tesviye](topic:landscape-grading).
- **{{ui:Sulama}}**: bir sonra yerleştireceğiniz başlıklar ve borular, su kaynağının ayarları. Bkz. [Sulama](topic:irrigation).

## Peyzaj grubunda neler var

| Araç | Ne yapar | Konu |
|---|---|---|
| **Bitki**, **Yatak**, **Çit** | Tek bitkiler, bitki aralığında doldurulmuş ekim yatakları, bir çizgi boyunca çitler | [Bitkilendirme](topic:planting) |
| **Tesviye** | Platformlar, bermler, çukur hendekler, nokta kotları ve eşyükselti eğrili tesviye alanları; eğim ve akış denetimleri | [Tesviye](topic:landscape-grading) |
| **Sert zemin** | Zemini izleyen kaplama, yollar, duvarlar, bordürler, rampalar ve basamaklar | [Sert zemin](topic:hardscape) |
| **Alanlar** | Ekili alanlar: çimler, yataklar, çayırlar ve örtü bitkileri; katmanlı, sert zemin çevresinde kırpılmış | [Ekili alanlar](topic:planted-areas) |
| **Kotlar** | Kesme ve dolguyla sıralı zemin düzenleyicileri, nokta kotları, eğim okları, kesit çizgileri | [Zemin düzenleyicileri](topic:ground-modifiers), [Kesitler](topic:landscape-sections) |
| **{{ui:Sulama}}** | Başlıklar, borular, vanalar, damla hatları, su kaynağı, kapsama ve hidrolik denetim | [Sulama](topic:irrigation) |
| **Daha fazla** | Çizgiden (nesneler çizgi işine bağlı kalır), bitki listesi, bitki tablosu, çalışma sayfaları, bitki grafikleri, serbest nesneler, peyzaj sayfaları ve yayım takımı, IFC dışa aktarımı, bitki boyutu ve etiketleri | [Çizgi işinden nesneler](topic:objects-from-lines), [Bitki kayıtları](topic:plant-records), [Çalışma sayfaları](topic:worksheets), [Peyzaj sayfaları](topic:landscape-sheets), [Serbest nesneler](topic:freeform-objects) |

Eklediğiniz her şey tek bir geri al adımıdır, proje dosyasında saklanır ve planda `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` ve `L-IRRG-…` adlı katmanlarda çizilir; böylece DXF, DWG ve PDF dışa aktarımları da bunları taşır.

## Her şey için tek yüzey

Platformlar, bermler, çukur hendekler, tesviye alanları, kaplama ve yollar **önerilen yüzeye** tesviye edilir; koridorlar ve platformların kullandığı aynı yüzey budur. **Mevcut zemin** asla değişmez. Bitkiler altlarındaki zemin üzerinde durur; dolayısıyla tesviye değiştikçe yer değiştirirler. Toprak işleri, peyzaj tesviyesini diğer her şeyle birlikte sayar.

:::tip
Yeni misiniz? [Bir bahçeyi baştan sona tasarlayın](topic:landscape-walkthrough) çalışma alanının tamamını örnek sahada gözden geçirir.
:::
