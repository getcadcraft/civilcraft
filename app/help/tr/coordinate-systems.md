---
title: Projenin koordinat sistemini belirleyin
summary: Ölçümün hangi koordinat sisteminde olduğunu söyleyin; böylece CivilCraft enlem ve boylamı gösterir, CBS dosyalarını ve harita katmanlarını yerleştirir ve .prj dosyaları yazar. Koda, ada, koordinatların kendisine göre ya da bir .prj dosyasından seçin.
keywords: koordinat sistemi, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, izdüşüm, prj, wkt, datum, enlem, boylam, enlem boylam, coğrafi, ızgara, coğrafi referanslama, koordinat sistemi atama
from: 964250e2
---

Proje koordinatları, ne anlama geldiklerini söyleyene kadar yalnızca sayılardır. Koordinat sistemini ayarlamak **hiçbir şeyi taşımaz**: CivilCraft'a örneğin E 6,150,000 N 2,080,000 değerlerinin ABD ölçü ayağı cinsinden Kaliforniya 6. bölge state plane koordinatları olduğunu söyler. Bunu bildiğinde:

- durum çubuğu imlecin enlemini ve boylamını gösterir,
- diğer sistemlerdeki CBS dosyaları (shapefile, GeoJSON, GeoPackage, yükseklik ızgaraları, LiDAR) açılırken projeye dönüştürülür,
- harita katmanları plan altına çizilebilir ([Harita katmanlarını plan altında gösterin](topic:map-layers)),
- CBS formatlarına aktarımlar sistemi taşır (shapefile için `.prj`, GeoPackage ve GeoTIFF için EPSG kodu).

## Sistemi seçin

1. Araç çubuğunun {{ui:CBS}} grubunda {{ui:Koordinatlar}} seçeneğini seçin. **Koordinat sistemi** iletişim kutusu açılır. En üstte projenin şu an hangi sistemde olduğu yazar veya **Yok — koordinatlar yalnızca sayılardır** yazar.
2. Sistemi şu yollardan biriyle bulun:
   - **Ara**: EPSG kodunu (`2277`, `EPSG:2277`) veya adındaki kelimeleri (`texas central`, `utm 14n`, `lambert-93`) yazın. Kodlar, yazdığınızdan başlayarak listelenir; kelimeler, adında bütün kelimeleri bulunan sistemleri listeler.
   - {{ui:Bu koordinatlara uyan sistemler}} (proje noktalara veya yüzeye sahip olduğunda): CivilCraft, projenin birim ailesindeki her sistemde projenizin ortasını okur ve alanı bu noktayı içeren sistemleri listeler. State plane koordinatları genellikle yalnızca birkaç bölgeye uyar: ABD ölçü ayağı cinsinden E 3,115,000 N 10,070,000 değerindeki bir Teksas projesi, dört Teksas Central varyantına uyar (NAD83, NAD83(2011), HARN, NSRS2007). Her giriş, projenizin ortasının o sistemde nerede düşeceğini gösterir.
   - **Yakın (enlem, boylam)** ve {{ui:Öner}}: sahanın nerede olduğunu yazın, örneğin `30.27, -97.74` veya `30°16′N 97°44′W`; CivilCraft bu konumu içeren izdüşümlü sistemleri listeler; önce ulusal ve eyalet ızgaraları gelir.
   - {{ui:Bir .prj dosyası oku…}}: bir shapefile veya çizimle gelen `.prj` dosyasını açın. CivilCraft dosyayı kendi listesiyle izdüşüm matematiğine göre eşleştirir (bu yüzden bir `.prj` veriyi farklı adlandırsa bile doğru sistemi bulur) ve hangisi olduğunu söyler; hiçbir şey tam eşleşmezse dosyanın kendi açıklaması kullanılır. Bir `.prj` dosyasını iletişim kutusuna da bırakabilir ya da plana tek başına açabilirsiniz.
3. Listede bir sisteme tıklayın. **Seçilen** altında adı, EPSG kodu, birimi, datumunun WGS 84'e ne kadar iyi bağlandığı, enlem ve boylamdaki kullanım alanı ve projenizin ortasının o sistemde nerede düştüğü gösterilir.
4. **Izgara** seçili kalsın (çoğu proje için; diğerleri için bkz. [Zemin ve yerel koordinatlar](topic:ground-and-local-coordinates)) ve {{ui:Uygula}} seçeneğini seçin.

Durum çubuğu artık imlecin enlemini ve boylamını E ve N'nin yanında gösterir. Sistemi ayarlamak tek bir geri alma adımıdır: {{key:Mod+Z}} onu geri alır.

:::note
Birimler eşleşmelidir: feet ile çalışan bir proje, ABD ölçü ayağı veya uluslararası feet sistemlerini; metre ile çalışan bir proje metre sistemlerini alır. CivilCraft bir reddi açıklar ("Proje feet cinsinde ama bu sistem metre cinsinde…"). ABD ölçü ayağı sistemi olan bir feet projesi ölçü ayağını kullanır: projenin "ft" değeri sistemin ayağı anlamına gelir. Coğrafi sistemler (enlem ve boylam, WGS 84'ün kendisi gibi) bir projenin sistemi olamaz: çizimler doğu ve kuzey koordinatlarına ihtiyaç duyar.
:::

## Sistemi değiştirin veya kaldırın

{{ui:Koordinatlar}} seçeneğini yeniden açın, başka bir sistem seçin ve {{ui:Uygula}} seçeneğini seçin. Proje noktalara veya tasarıma sahipse, CivilCraft **Koordinatlar zaten … sisteminde mi?** diye sorar.

- {{ui:Evet — hiçbir şey taşınmaz}}: sayılar olduğu gibi kalır ve yalnızca anlamları değişir. Eski sistem yanlışlıkla seçildiyse bunu kullanın.
- {{ui:Hayır — dönüştür}}: her ölçü noktası, kırılma çizgisi, sınır, eksen PI'si, platform köşesi ve yapı eski sistemden yeni sisteme dönüştürülür; tek bir geri alma adımında. LandXML'den üçgenler olarak okunmuş bir yüzey dönüştürülemez; önce noktalardan yeniden oluşturun.

{{ui:Sistemi kaldır}} sistemi kaldırır (hiçbir şey taşınmaz). Projede zaten bulunan CBS katmanları olduğu yerde kalır.

## Durum çubuğunda enlem ve boylam

Proje bir sisteme sahip olduğu sürece, durum çubuğu imlecin WGS 84 üzerindeki enlemini ve boylamını gösterir; örneğin `30°18′00.00″ N  97°42′00.00″ W`. Bunun yerine ondalık derece seçmek için {{ui:Ayarlar}}, {{ui:CivilCraft}} altındaki **Enlem ve boylam** seçeneğini seçin ([CivilCraft ayarları](topic:settings)). Zemin veya yerel koordinatlarla okuma önce bu adımdan geçer; böylece imlecin altındaki nokta doğru olur.

## Datum kaymasının ne kadar iyi olduğu

Enlem, boylam, GeoJSON ve harita katmanlarının hepsi WGS 84 üzerindedir. Her sistemin WGS 84 ile bağlantısı iletişim kutusunda gösterilir:

| İletişim kutusunun dediği | Anlamı |
|---|---|
| WGS 84 kendisi | Hiç kayma yok. |
| NAD83, WGS 84 olarak alınır | İkisi Kuzey Amerika'nın çoğunda bir veya iki metre, en fazla birkaç metre farklıdır. Harita katmanları ve saha bağlamı için iyi; arazi kontrolü için değil. |
| Yaklaşık *n* m bilinir (EPSG'nin değeri) | Yayımlanmış bir kayma; harita katmanları ve GeoJSON bu kadar yanılabilir. |
| Bu datum için bilinmiyor | Bir ızgara dosyası olmadan yayımlanmış bir kayma yoktur: harita katmanları ve GeoJSON yüzlerce metre yanılabilir. |
| Izgara kayma dosyasından … | Bir ızgara kayma dosyası kullanılıyor (aşağıda): ızgara içinde NAD83'e yaklaşık 10 cm içinde. |

Projenizin kendi koordinatları asla bir datum kaymasından geçmez: yalnızca enlem ve boylama dönüştürülen ya da dönüştürülenler geçer. Düşey datumlar ve geoid modelleri işlenmez (kotlar asla dönüştürülmez). En iyi kaymanın bir ızgara dosyasına ihtiyaç duyduğu yerlerde liste daha kaba yayımlanmış bir kayma verir ve iletişim kutusu doğruluğunu gösterir (örneğin NAD27 sistemlerinde yaklaşık 20 m); siz ızgarayı ekleyinceye kadar.

## Izgara kayma dosyaları

NAD27 sistemi için, koordinat sistemi iletişim kutusundaki **Izgara kayma dosyası**, enlem, boylam, CBS dosyalarını ve harita katmanlarını yaklaşık 20 m yerine NAD83'e yaklaşık 10 cm içinde tutar:

- Sistemin alanı için önerdiği ızgarayı **İndirin** (bitişik Birleşik Devletler için NADCON5, Alaska için NADCON, Kanada için NTv2) cdn.proj.org'dan, PROJ'un genel ızgara sunucusundan. Yalnızca ızgaranın dosya adı gönderilir.
- Ya da zaten sahip olduğunuz bir ızgara dosyasını **Izgara dosyası ekleyin…** ile ekleyin: NTv2 (`.gsb`) veya PROJ GeoTIFF ızgarası (`.tif`), en fazla 20 MB.

Izgara projeye kaydedilir, dolayısıyla proje dosyasıyla birlikte taşınır. Bölüm, projenin ortasının ızgara içinde olup olmadığını söyler: dışındaysa hiçbir kayma uygulanmaz, bu yüzden sahayı kapsayan bir ızgara kullanın. **Izgarayı kullanmayı bırakın** kaba kaymaya geri döner. Her değişiklik bir adımdır: {{key:Mod+Z}} onu geri alır.

Izgara değiştiğinde projede zaten bulunan CBS katmanları olduğu yerde kalır; onları ızgaradan geçirerek yerleştirmek için yeniden içe aktarın. Projenin kendi koordinatları asla taşınmaz.

## Ne kontrol edildi

- Her dönüşüm, çoğu GIS programının kullandığı koordinat kütüphanesi PROJ ile karşılaştırıldı (PROJ 9.5.1 ile pyproj 3.7.1); 330'dan fazla sistemde: ABD ölçü ayağı ve feet cinsinden state plane, kuzey ve güney UTM, Lambert-93, British National Grid, GDA2020 MGA, Yeni Zelanda Transverse Mercator ve web Mercator bunların arasında. Doğu ve kuzey değerleri aynı datum kaymasıyla 1 cm içinde uyuşur (çoğu milimetrenin altında), izdüşüm matematiği ise PROJ'un kendi tanımlarıyla 1 cm içinde uyuşur.
- PROJ'un yazdığı iki yaygın biçimdeki (ESRI ve OGC) `.prj` dosyaları 105 sistem için geri okundu: 210'un 208'i tam EPSG kodlarıyla eşleşti, diğer ikisi aynı elipsoid üzerinde aynı matematiğe sahip bir sistemle eşleşti. CivilCraft'ın yazdığı `.prj` dosyaları PROJ tarafından aynı sistem olarak okunur. Kutupsal stereografik sistemler (UPS, Alaska kutupsal) için ESRI `.prj` dosyaları okunamaz; bu sistemleri koda göre seçin.
- Durum çubuğundaki enlem ve boylam, tarayıcıda PROJ ile 0.01″ içinde eşleşti.
