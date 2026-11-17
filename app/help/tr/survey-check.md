---
title: İçe aktarırken ölçü çizimini denetleme
summary: Metin olarak veya blok özniteliklerinde yazılı kotları nokta olarak okuyun; bir DWG veya DXF'i, bundan zemin oluşturmadan önce yanlış birimler, koordinat sistemi olmaması, uzak bir başlangıç noktası, düz kot eğrileri, tuhaf kotlar ve çift noktalar için denetleyin.
keywords: ölçü denetimi, içe aktarma denetimi, ölçü kotları, nokta kotları, metin kotları, metin olarak kotlar, öznitelikler, birimler, koordinat sistemi, başlangıç noktasından uzak, sıfırdaki kot eğrileri, uç değerler, çift noktalar, sorunlar, peyzaj mimarı, ölçü çizimi
from: d46acd24
---

Bir ölçü çizimi doğru görünüp yine de bir zemin için yanlış olabilir: birimleri tahmin edilmiş olabilir, kot eğrileri 0 yükseklikte düz duruyor olabilir ya da kotları hiç geometri olmayan metin olarak yazılmış olabilir. {{ui:Çizgi işi}} iletişim kutusunun **Ölçü kotları ve denetim** bölümü (bkz. [DWG veya DXF'i çizgi işi olarak aç](topic:open-dwg-dxf)) bu kotları okur ve bir şey eklenmeden önce neyin yanlış göründüğünü size bildirir.

## Metin veya öznitelik olarak yazılmış kotlar

Birçok ölçü çizimi, bir artının yanında küçük bir metin olarak, `104.37` veya `EL 104.37` gibi, ya da bir nokta bloğunun özniteliği olarak nokta kotu verir. Bunlar çizgi değildir, bu yüzden çizgi işi okuyucusu bunları dışarıda bırakır. Bölüm, kaç tane bulduğunu listeler ve bunları **nokta** olarak almanıza izin verir:

1. **… kotu nokta olarak al** seçeneğini işaretleyin. Başta işaretli değildirler, çünkü bir çizimdeki her sayı bir yükseklik değildir.
2. Metin, tek başına bir kot olduğunda okunur: ondalık kısmı olan bir sayı (`104.37`, `+104,37`, `-3.50`) veya `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ya da `LEVEL` sözcüklerinden sonra gelen bir sayı; sonrasında isteğe bağlı `m`, `ft` veya `'` olabilir. Tek başına tam bir sayı (`12`) bir kot değil, parsel veya sayfa numarası olarak okunur; `GATE 3` gibi metinler veya bir tarih hiçbir zaman okunmaz. Metin biçimlendirme kodları yok sayılır.
3. Blok öznitelikleri için **Kotu tutan blok özniteliği**ni seçin. CivilCraft, ELEV, Z, LEVEL, RL veya benzeri bir etiketi kendiliğinden bulur; çizim kendi etiketini kullanıyorsa listeden başka birini seçin. Seçim, bu bilgisayarda o dosya adı için hatırlanır, bu yüzden dosyayı yeniden açtığınızda aynı etiketle başlar. Seçtiğiniz bir etiket, tam sayıları da kot olarak alır.
4. {{ui:Ekle}}'ye tıklayın. Noktalar, projedeki en yüksek numaradan sonra numaralandırılır, her nokta katmanı (veya bloğu) ile tanımlanır ve kotlar, çizimin geri kalanı gibi projenin birimlerine dönüştürülür. Hepsi tek bir adımdır: {{key:Mod+Z}} noktaları kaldırır.

Metin kendi ekleme noktasında (ya da varsa hizalama noktasında) durur. Bloklardaki metinler okunmaz ve çizim hiçbir zaman değiştirilmez.

## Denetim

Denetim, içe almak üzere olduğunuz veriler üzerinde çalışır ve bulduklarını her sorun türü için bir satırla listeler:

| Ne diyor | Anlamı |
|---|---|
| **Birimler belirtilmemiş** | Çizim birimlerinin ne olduğunu belirtmiyor, bu yüzden sayıları projenin birimleri olarak okunur. Bildiğiniz bir mesafeyi kontrol edin. |
| **Birimler dönüştürüldü** | Çizimin birimleri projeninkinden farklı ve ölçeklendirilir (bir not, bir hata değil). |
| **Veriler … km** veya **… m** kapsıyor | Kapsam 200 km'den büyük veya yarım metreden küçük; bu genellikle yanlış birim anlamına gelir (milimetrenin metre olarak okunması veya tersi). |
| **Koordinat sistemi yok** | Projede hiçbiri yok. Veriler, devlet düzlem veya ulusal grid koordinatlarında olduğu gibi sıfırdan uzakta yer aldığında bir uyarıdır. Bkz. [Koordinat sistemleri](topic:coordinate-systems). |
| **Başlangıç noktasından uzak** | Veriler sıfırdan 100 km'den fazla uzakta. Sıfırdan uzakta 3B görünümler ve dışa aktarmalar hassasiyetini kaybeder ve titrer. |
| **Kot eğrisi katmanı … yükseklik içermiyor** | Kot eğrisi gibi adlandırılmış bir katman (TOPO, CONT, CNTR, CONTOUR) 0 yükseklikte çizgiler içeriyor; bunlardan oluşturulan bir zemin düz olurdu. |
| **Kotlar tam 0** | Bazı kotlar 0, oysa tipik kot bundan çok uzak: muhtemelen eksik yükseklikler. |
| **Kotlar diğerlerinden uzak** | Birkaç kot diğerlerinin çok dışında (tüm kotların ortasına göre bulunur, bu nedenle geniş aralıklı dik bir saha işaretlenmez) ya da 9,000 m üstünde veya -11,000 m altında. |
| **Noktalar başka bir noktanın üstünde** | Aynı yerde, aynı kota sahip ya da farklı kotlara sahip iki nokta. |

{{ui:Ekle}}'ye tıkladıktan sonra aynı satırlar, her tür için bir tane olmak üzere dosya adıyla birlikte **Sorunlar** listesine gider; böylece sonra geri dönebilirsiniz. Denetim çizimi değerlendirir; içinde hiçbir şeyi değiştirmez ve çizimi kullanmanızı engellemez.

:::tip
Denetim, kot eğrilerinin 0'da düz olduğunu ve metin olarak yazılmış kotlar olduğunu söylediğinde, bu kotları nokta olarak alın: çoğu zaman kot eğrilerinde eksik olan gerçek yükseklikleri taşırlar.
:::

## Denetlenmeyenler

Denetim, çizimi ikinci bir ölçüyle karşılaştırmaz ve çizimin hangi koordinat sisteminde olduğunu söyleyemez: yalnızca hiçbirinin ayarlanmadığını bildirir.
