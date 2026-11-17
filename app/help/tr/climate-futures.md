---
title: "İklim gelecekleri: 2050 ve 2080 taşkın, sıcaklık ve orman yangını"
summary: Adresten arsaya bölümünde, gelecek bir iklim için arsanın taşkın seviyesini yükseltin, orman yangını maruziyetini eleyin ve bir hava durumu dosyasını dönüştürüp mevcut ile geleceği yan yana sunun; iklim veri paketinden (SSP2-4.5 ve SSP5-8.5, 2050 ve 2080).
keywords: iklim, iklim değişikliği, gelecek, 2050, 2080, ssp, cmip6, senaryo, deniz seviyesi, taşkın, taban taşkın yüksekliği, bfe, fema, sıcaklık, hava durumu dosyası, epw, dönüştürme, orman yangını, çalı yangını
from: b0d2ee38
---

İklim rakamları bir **veri paketinden** gelir, uygulamadan değil. Ayarlar › Eklentiler içinde {{ui:Climate futures}} eklentisini açın ya da {{ui:Climate future}} bloğunda kendi paket dosyanızı yükleyin.

:::warning
Eklentiyle gelen paket bir **örnektir**: üç yer (Denver, Miami, Johannesburg), bir iklim modeli ve her 20 yıllık dönemde beş yıl. Araçları denemek için vardır, **tasarım için değildir**. Tam bir paket, NASA'nın NEX-GDDP-CMIP6 verisinden `tools/climate/build-pack.mjs` ile oluşturulur.
:::

## Nerede

Yüzey › Diğer › Adresten arsaya. Noktayı ayarlayın, katmanları ekleyin (bir FEMA taşkın katmanı taban taşkın yüksekliğini verir) ve arsayı okuyan düğmeye basın. Arsanın satırlarının altında {{ui:Climate future}} bloğu vardır: bir **Senaryo** (SSP2-4.5 ya da SSP5-8.5) ve bir **Yıl** seçin (2050 = 2041-2060, 2080 = 2071-2090; ikisi de 1995-2014'e göre). Noktaya en yakın paket yeri kullanılır ya da sizin seçtiğiniz; her yerden uzaksa küresel ortalama değişimler kullanılır ve panel bunu söyler.

## Tasarım taşkın seviyesi

Taşkın katmanında varsa mevcut seviye FEMA'nın taban taşkın yüksekliğidir (ft, NAVD 88); yoksa kendinizinkini yazın. Taşkın türünü seçin (kıyı, nehir ya da şiddetli yağış ya da ikisi), yağış kısmı için arsadaki taşkın derinliğini ve isterseniz bir emniyet payını. {{ui:Raise the flood level}} mevcut ve gelecek seviyeyi yan yana, deniz seviyesi ve yağış kısımlarıyla birlikte ve varsayımları gösterir: tüm deniz seviyesi yükselmesi kıyı seviyesine eklenir; nehir akışı, en ıslak gündeki yağışla bire bir yükselir ve derinlik akışın 0.6 kuvvetini izler (Manning, geniş kanal); kısımlar toplanır.

:::warning
Değişimin bir taraması, bir taşkın çalışması değildir. Tasarım taşkın seviyesi ilgili otoritenin ya da mühendisinizindir.
:::

## Orman yangını maruziyeti (yalnızca tarama)

En yakın bitki örtüsü, ondan yukarı eğim ve uzaklık; çok düşükten aşırıya kadar bir bant verir, mevcut ve gelecek için (gelecek, paketin yangın hava durumu indeksindeki değişimle çarpılır). **Yalnızca tarama:** bir sitenin uygun bir orman yangını değerlendirmesine ihtiyacı olup olmadığını anlamak için kendi göreli ölçeğimiz; bir yönetmelik derecelendirmesi değil.

## Sıcaklık: gelecek bir hava durumu dosyası

Bugünkü bir `.epw` dosyası seçin ve {{ui:Make the future weather file}} düğmesine basın: yayımlanmış kayma ve gerdirme yöntemiyle (Belcher, Hacker ve Powell 2005) dönüştürülür ve sıcaklık karşılaştırılır (ortalama ve en sıcak sıcaklık, tasarım sıcaklıkları, 30 °C ve 35 °C'nin üzerindeki saatler, derece-gün). {{ui:Save the future weather file}} onu Çevre paneli, BimCraft'ın enerji denetimi ya da kendi araçlarınız için kaydeder.

## Sayılar nereden gelir

NASA NEX-GDDP-CMIP6 (CMIP6 model çıktılarının küçültülmüş hâli, model başına CC BY 4.0) sıcaklık, nem, güneşlenme, yağış ve yangın hava durumu için; deniz seviyesi yükselmesi için IPCC AR6 küresel ortalaması, paket yerel rakamlar taşımadıkça. Panel paketin kaynağını, lisansını ve tarihini gösterir.
