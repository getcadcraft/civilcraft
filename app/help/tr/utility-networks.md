---
title: Altyapı ağları ve OpenStreetMap
summary: Malzeme, boyut, üst derinlik ve sahibiyle su, kanalizasyon, yağmur suyu, gaz, güç ve telekom hatları; Overpass JSON dosyasından OpenStreetMap verileri; kesişimler, hendek kesitleri ve hacimler; DWG, DXF ve PDF'de hizmet katmanları; IFC boru ve kablo segmentleri.
keywords: altyapı, altyapılar, ağ, osm, openstreetmap, overpass, boru, kablo, gaz, kanalizasyon, yağmur suyu, telekom, güç, su, yangın musluğu, rögar, hendek, kesişim, açıklık, üst derinlik, derinlik, dwg, ifc, koordinatlı, katmanlar
from: 8a85dace
---

Arazinin gömülü hizmetlerini hizmet başına bir ağ olarak çizin, nerede kesiştiklerini denetleyin ve bunları çizim katmanları ve IFC olarak dışa aktarın.

## Hat oluşturma

**Yüzey, Diğer, Altyapı ağları...** öğesini açın.

- **Seçimden hat oluştur** seçili eksen, özellik çizgisi veya boruyu seçtiğiniz hizmetin hattına dönüştürür. Ardından tabloda malzemeyi, boyutu (mm), üst derinliği (borunun veya kablonun üstüne kadar olan derinlik) ve sahibini doldurun.
- **OpenStreetMap verilerini oku** kaydettiğiniz bir Overpass JSON dosyasını okur (`out geom;` içeren bir sorgu). OpenStreetMap konumları enlem ve boylam olduğu için projenin önce bir koordinat sistemine sahip olması gerekir. Boru hatları (maddeye göre), yeraltı güç ve telekom kabloları, yangın musluklarını, rögarları ve yağmur suyu borularını okur; diğer her şey dışarıda bırakılmış sayılır ve bu, iletide belirtilir. Havai hatlar dışarıda bırakılır.
- **OpenStreetMap haritasını ekle** planın altına OpenStreetMap haritasını ekler. Yalnızca Ayarlar'da internetten gelen harita katmanları açıkken çizilir.

## Denetimler ve çıktılar

- **Kesişimler**: planda kesişen farklı hizmetlerin hatları, bir arazi yüzeyi olduğunda aralarındaki net yükseklikle listelenir; minimum değer, bir standardın değeri değil, sizin ayarladığınız bir yer tutucudur.
- **Hendek**: her hat için bir hendek oluşturulur (boru boyutu artı her iki yanda boşluk, yan şev, yatak) ve bir hacim hesaplanır. Toplam, pencerede ve CSV'de görünür.
- **Çizim**: hatlar ve noktalar hizmet katmanlarında yer alır (örneğin U-WATR-RUN, U-POWR-RUN), böylece PDF, DXF ve DWG'ye aktarılır.
- **IFC**: hatlar IFC dışa aktarımına boru segmentleri ve kablo segmentleri olarak girer; yangın musluklarıyla, vanalar ve odalarla birlikte, her hizmet için bir sistem olacak şekilde, projenin koordinat sisteminde.

## OpenStreetMap verileri

OpenStreetMap verileri OpenStreetMap katkıda bulunanlarına aittir ve ODbL lisansı altında lisanslanmıştır. Atıf çizime, CSV'ye ve IFC'ye eklenir. OpenStreetMap verisi içeren bir dosyayı paylaşırsanız atfı koruyun ve lisansın aynı koşullarla paylaşma kurallarını okuyun.

## Henüz yapılmayanlar

Hatlar planda henüz bir araçla nokta nokta çizilmiyor ve kesişimler profil görünümünde henüz çizilmiyor (hesaplama hazır). Derinlikler, boyutlar ve boşluklar yer tutucu olarak başlar: kendi standardınızın değerlerini kullanın.
