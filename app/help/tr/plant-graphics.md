---
title: Ölçeğe göre bitki grafikleri, kendi sembolleriniz ve 3B bitkiler
summary: Bitkilerin her çizim ölçeğinde ve ayrıntı düzeyinde planda nasıl çizildiği ve bir bitki kaydına kendi sembolünüzün (SVG veya DXF/DWG bloğu) ile kendi 3B modelinizin (OBJ, STL veya GLB) nasıl ekleneceği.
keywords: bitki grafikleri, bitki sembolü, ölçeğe göre sembol, ayrıntı düzeyi, detay düzeyi, basit daire, ana hat, ayrıntılı sembol, kendi sembolünüz, blok, svg, dxf, dwg, 3B bitki, kendi 3B modeliniz, obj, stl, glb, gltf, ağaç modeli, 3B'de bitkiler
from: 875837d9
---

## Ölçeğe göre planda semboller

Peyzaj › {{ui:Daha fazla}} › {{ui:Bitki grafikleri}} bitkilerin planda nasıl çizileceğini belirler. **Ölçeğe göre otomatik** çizim ölçeğine bakarak üç düzeyden birini seçer:

- **Basit daire** (1:500'den kaba): bitkinin yayılımında bir daire.
- **Merkezli ana hat** (1:500 ile 1:200 arası): daire ve küçük bir merkez artısı.
- **Ayrıntılı sembol** (1:200'den ince): kaydın kendi sembolü varsa o, yoksa yerleşik sembol.

İki ölçeği **Basit, 1:'den itibaren** ve **Ana hat, 1:'den itibaren** ile değiştirebilir ya da her ölçek için tek bir düzey seçebilirsiniz. Sayfalar iletişim kutusundaki her sayfa takımının kendi **Planda bitki ayrıntısı** ayarı vardır; böylece 1:500 ölçekli bir saha planı ile 1:100 ölçekli bir dikim planı farklı olabilir. Ayarlar proje ile birlikte kaydedilir.

## Kendi sembolünüz

Bitkiler bölümünde bir bitki seçin ve {{ui:Kendi sembolü…}} düğmesine tıklayın. Bu düğme bir SVG dosyasını ya da bir DXF veya DWG çizimindeki bloğu okur (çizimde birden fazla blok varsa birini seçersiniz). Sembol bitkinin yayılımına sığdırılır ve ayrıntılı düzeyde çizilir. Proje içinde saklanır; dosya onunla birlikte taşınır.

- Bir SVG'nin çizgileri, çoklu çizgileri, çokgenleri, dikdörtgenleri, daireleri, elipsleri ve yolları okunur. İçindeki betikler, stiller, bağlantılar ve resimler hiçbir zaman incelenmez. Dönüşümler uygulanmaz: dosyada dönüşüm varsa bu size bildirilir; bu nedenle önce çizim programınızda bunları düzleştirin.
- Sınırlar: 512 KB SVG ve 2000 şekil. Daha büyük bir dosya nedeniyle reddedilir ve neden gösterilir.

## Kendi 3B bitkiniz

Aynı kayıt üzerindeki {{ui:Kendi 3B modeli…}} bir **OBJ**, **STL** veya **GLB** dosyası okur. Ardından Bitki grafiklerinde **3B bitkiler** ayarını **Her kaydın kendi modeli** olarak seçin: o kayda ait her bitki, modelinizi yüksekliğine ve yayılımına göre ölçeklenmiş olarak gösterir. Kendi modeli olmayan kayıtlar yerleşik biçimleri korur. Büyük sahaların hızlı görünümleri için **Basit kütleler** seçin.

Bir GLB yalnızca şekli için okunur:

- Modelin ihtiyaç duyduğu her şey .glb dosyasının içinde olmalıdır. Başka dosyalara işaret eden bir model (ayrı bir .bin dosyası ya da adresle belirtilen resimler) reddedilir: hiçbir şey indirilmez.
- Sıkıştırılmış ya da paketlenmiş geometri (Draco, meshopt, nicelenmiş konumlar) okunmaz. Sıkıştırmadan dışa aktarın.
- Dosyadaki dokular ve renkler kullanılmaz: model bitkinin kendi renginde çizilir. Dokular yine de denetlenir; bir kenarı 4096 pikselden büyük bir doku reddedilir.
- Sınırlar: 32 MB dosya, 50 000 üçgen (birden fazla yerleştirilen her parça kopyası dahil), 64 resim ve 16 MB resim.

Her sınır, dosyayı nedeniyle birlikte reddeder; yarım okunan hiçbir şey tutulmaz. Kayda sembol ya da model eklemek tek bir geri al adımıdır; {{ui:Kendi sembolünü kaldır}} ya da {{ui:Kendi 3B modelini kaldır}} ile bunları geri alırsınız.

Kaydın kendisi için [Bitki kayıtları](topic:plant-records) ve [Sahayı 3B'de görüntüleme](topic:site-3d) konularına bakın.
