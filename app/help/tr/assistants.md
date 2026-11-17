---
title: Bir yapay zeka asistanının arsanızla çalışmasına izin verin
summary: Ayarlar'da asistanları açın; bilgisayarınızdaki bir asistan, CadCraft Studio üzerinden açık arsayı (noktalar, yüzeyler, hacimler, boy kesitleri, parseller) okuyabilsin, arazi noktaları ekleyebilsin, LandXML ya da DWG kaydedip dışa aktarabilsin. Siz açana kadar kapalıdır.
keywords: yapay zeka, asistan, mcp, betik, otomasyon, studio, noktalar, kot, istasyon, ofset, eksen, hacim, kazı, dolgu, boy kesiti, parsel, landxml, dwg, usd, klasörler, izinler, bağlantıyı kes, etkinlik
from: d0356582
---

## Ne öğreneceksiniz

Bir yapay zeka asistanının (MCP konuşan herhangi bir asistan) açık olan arsanızla nasıl çalışmasına izin vereceğinizi, neler yapıp neler yapamayacağını ve onu nasıl durduracağınızı.

## Bir asistan CivilCraft'ta ne yapabilir

| İstediği | Aldığı | Gereken |
|---|---|---|
| Arsa | Adı, birimleri, koordinat sistemi, nokta grupları, eksenler, yüzeyler, platformlar, parseller ve borular | Okuma |
| Arazi noktaları | Numara, doğu, kuzey, kot ve tanım; gruba, tanıma ya da bir kutunun içine göre | Okuma |
| Yüzey kotları | Adını verdiği herhangi noktalarda mevcut zemin (ya da tesviye edilmiş yüzey) | Okuma |
| İstasyonlar ve ofsetler | Bir eksen boyunca noktaların istasyonu ve ofseti ya da istasyonların koordinatları ve zemin kotu | Okuma |
| Bir boy kesiti | Bir eksen boyunca zemin, tasarım boy kesiti ve tesviye yüzeyi kotları; her birkaç ft ya da metrede | Okuma |
| Kazı ve dolgu | Mevcut zemin ile tesviye yüzeyi arasındaki hacimler (her platform ve koridor dahil) ya da zemin ile bir seviye arasında | Okuma |
| Parseller | Köşeler, alan (dönüm ya da hektarla), çevre ve yasal tanım | Okuma |
| Bir seçim | Adını verdiği noktalar planda seçilir, sanki siz seçmişsiniz gibi | Düzenleme |
| Yeni arazi noktaları | Verdiği numaralarla ya da bir sonraki boş numaralarla eklenen noktalar. Her çağrı geri alabileceğiniz tek bir adımdır | Düzenleme |
| Kaydet | CivilCraft'ın kendi {{ui:Save}} düğmesi | Kaydet |
| LandXML ya da DWG | {{ui:LandXML}} ve {{ui:DWG}} düğmeleriyle aynı dosyalar | Dışa aktarma |
| Arsa 3D'de | Zemin, tesviye yüzeyi, platformlar ve boruların OpenUSD (.usdz, .usda ya da .usdc) hâli; 3D görünümün dışa aktardığı gibi | Dışa aktarma |
| Bitkiler ve bitki listesi | Bitki listesinde her adla bulunan bitkiler ve bitki listesinin sayıları | Okuma |
| Bitkilendirme ve tesviye | Yerleştirilen bitkiler, bir yatak ya da çit; ya da eklenen bir platform, set, oluk ya da tesviye alanı. Her biri geri alınabilir bir adım, kendi kazı ve dolgusuyla | Düzenleme |
| Sulama kontrolü | Her bölgenin debisi, vanasında ve kaynağında gereken basınç, en kötü durum yükü, çalışma süreleri, sorunlar ve malzeme listesi; bir sulama tasarımcısının denetlediği bir hesap yardımcısı olarak | Okuma |

Açık olan arsa üzerinde çalışır. Studio'da, aşağıda seçtiğiniz klasörlere de kaydedip dışa aktarabilir; klasör yoksa dosyaları düğmelerin yaptığı gibi indirilir.

## Açın

Asistanlar CivilCraft'a bilgisayarınızdaki CadCraft Studio üzerinden ulaşır; düz tarayıcının bir girişi yoktur.

1. {{ui:Settings}} öğesini açın ve **CivilCraft** sekmesini seçin.
2. **Asistanlar** altında **Yapay zeka asistanlarının ve betiklerin CivilCraft'ı kullanmasına izin ver** kutusunu işaretleyin.
3. **Okuma** sizin için işaretlidir. **Düzenleme**, **Kaydet** ya da **Dışa aktarma** yalnızca asistanın bunlara ihtiyacı olduğunda işaretlenir.
4. Asistanın bir klasöre kaydetmesine ve dışa aktarmasına izin vermek için **Kullanabileceği klasörler** altında {{ui:Add a folder…}} öğesini seçin ve Studio'nun iletişim kutusunda klasörü seçin. {{ui:Remove}} onu hemen geri alır; başka her yol reddedilir.
5. Asistanı Studio'da bağlayın (Studio adresi ve yapıştırılacak ayarları gösterir).

## Asistan bağlıyken

Sağ panelin üstündeki bir not, hangi asistanın bağlı olduğunu ve neler yapabildiğini söyler. Oturumunu hemen sonlandırmak için {{ui:Disconnect}} düğmesine tıklayın; devam etmek için yeniden bağlanması gerekir.

**Etkinlik**, Ayarlar'da **Asistanlar** altında, asistanın yaptığı her çağrıyı, en yenisi önce, çalışıp çalışmadığıyla birlikte listeler.

:::tip
Düz kelimelerle sorun, örneğin "Ana Cadde boyunca her 50 ft'te zemin kotu nedir?", "Platformlar için ne kadar kazı ve dolgu gerekir?" ya da "bu koordinatlara bir kontrol noktası ekle". Asistan arsayı okur ve yanıtlar ya da geri alabileceğiniz tek bir adım olarak değişikliği yapar.
:::

## CivilCraft'ı açmadan

CadCraft dosya sunucusu (`npx @getcadcraft/mcp`) ve `cadcraft` komut satırı, kaydedilmiş CivilCraft projelerini (`.civilcraft.json`) ve nokta dosyalarını CivilCraft'ın kendi koduyla, pencere açmadan açar: aynı okuma araçları, nokta ekleme, projeyi kaydetme, LandXML ve arsanın OpenUSD olarak 3D hâli. `cadcraft convert site.civilcraft.json site.xml` komut satırından LandXML yazar. LandXML açma, DWG dışa aktarma ve Peyzaj çalışma alanının araçları hâlâ CivilCraft penceresini gerektirir.

## Kapatın

**Yapay zeka asistanlarının ve betiklerin CivilCraft'ı kullanmasına izin ver** kutusunun işaretini kaldırın. Her asistanın bağlantısı hemen kesilir; ayar bir sonraki kullanım için saklanır.

## Ayrıca bakın

- [Yapay zeka asistanları için tarifler](common:assistants-recipes): her biri çağırdığı araçlarla birlikte çalışılmış örnekler.
- [Yatay eksen oluşturma](topic:alignment)
- [Yüzeyi oluşturma ve düzeltme](topic:build-surface)
- [Arazi noktalarını seçme, kopyalama ve yapıştırma](topic:copy-paste-points)
- [CivilCraft ayarları](topic:settings)
