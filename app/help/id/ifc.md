---
title: Ekspor dan impor IFC
summary: Simpan seluruh proyek sebagai satu file IFC dalam IFC 4.3, IFC4, atau IFC2x3 (alinyemen, jalan, pekerjaan tanah, permukaan, dinding, pipa), dan buka file IFC untuk alinyemen dan permukaannya.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alinyemen, alignment, ifcalignment, jalan, road, ifcroad, pekerjaan tanah, earthworks, tin, hasil kerja, deliverable, pengadaan, procurement, ekspor ifc, export ifc, impor ifc, import ifc
from: 6b998bcf
---

IFC adalah format pertukaran terbuka yang banyak diminta klien publik sebagai hasil kerja. CivilCraft menulis seluruh proyek ke dalam satu file IFC dan membaca alinyemen serta permukaan kembali dari file IFC.

## Ekspor

1. Klik {{ui:IFC}} di grup **Ekspor** (dalam gaya pita: {{ui:Keluaran}} › {{ui:Ekspor}} › {{ui:IFC}}).
2. Pilih skema. **IFC 4.3 ADD2** adalah yang pertama dan bawaan: edisi yang memuat alinyemen, jalan, dan pekerjaan tanah. Pilih IFC4 atau IFC2x3 hanya ketika perangkat lunak penerima tidak dapat membaca 4.3.
3. Dialog menyatakan apa yang akan dimuat file dan apa yang tidak disertakan oleh skema yang dipilih. Klik {{ui:Ekspor IFC}}.
   File diunduh sebagai "*nama proyek*-ifc4x3.ifc", "-ifc4.ifc", atau "-ifc2x3.ifc". CivilCraft mengingat skema yang terakhir Anda pilih.

## Isi setiap skema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alinyemen | IfcAlignment dengan tata letak horizontalnya (garis, busur lingkaran, spiral klotoid) dan vertikalnya (kelandaian, kurva parabola), kurvanya (IfcCompositeCurve, IfcGradientCurve), stasiun awal, dan kejadian superelevasi | Polyline 3D pada elemen sipil | Polyline 3D pada proxy |
| Koridor | IfcRoad dengan bagian jalan; lajur, bahu, selokan, dan trotoar sebagai IfcPavement, kerb sebagai IfcKerb, jalur tanam; setiap lapisan perkerasan sebagai IfcCourse dengan tebal, material, dan volumenya; lereng sisi sebagai IfcEarthworksCut dan IfcEarthworksFill dengan volume galian dan timbunan; kecepatan rencana dan kelasnya | Elemen sipil dinamai sesuai jenisnya, dikelompokkan per jalan | Proxy, dikelompokkan per jalan |
| Permukaan | IfcGeographicElement TERRAIN dengan jaringan segitiga tidak beraturan (TIN) | Himpunan muka segitiga | Model permukaan berbasis muka (file lebih besar) |
| Pad dan dinding | Puncak pad, lerengnya sebagai pekerjaan tanah, dinding penahan sebagai IfcWall RETAININGWALL | Sama, dinding sebagai tipe dinding yang ditentukan pengguna | Sama, tipe dinding dalam ObjectType |
| Jaringan pipa | IfcPipeSegment dan IfcDistributionChamberElement dalam IfcDistributionSystem | Sama | IfcFlowSegment dan bak dalam IfcSystem |
| Georeferensi | IfcProjectedCRS dan IfcMapConversion | Sama | ePSet_ProjectedCRS dan ePSet_MapConversion pada tapak |

**Jalur kereta api** (alinyemen dengan Railway aktif) masuk ke IFC 4.3 sebagai IfcRailway: transisinya sebagai tipe tersendiri (klotoid, parabola kubik, Bloss, Helmert, sinus setengah gelombang sebagai kurva kosinus, sinus), kemiringan rel (cant) sebagai IfcAlignmentCant, dan jalurnya sebagai rel, bantalan, dan lapisan balast, dengan sub-balast di bawahnya. IFC4 dan IFC2x3 mendapat bagian yang sama sebagai elemen sipil atau proxy. Membuka railway IFC 4.3 mengembalikan transisi dan cant-nya.

Setiap file juga memuat persil (jejak), tanaman dan hardscape dari ruang kerja Lanskap, serta massa bangunan (masing-masing sebuah IfcBuilding dengan lantainya), semuanya dalam satu tapak. Himpunan properti memuat apa yang Anda rancang: stasiun, assembly, lereng galian dan timbunan, lebar dan jumlah lajur, invert, rim, tinggi dinding; kuantitas (panjang, luas, volume) adalah himpunan IfcElementQuantity.

## Satuan dan koordinat

File memakai satuan panjang proyek (meter, atau US survey feet); luas dan volume dalam meter persegi dan meter kubik. Dengan sistem koordinat (GIS › Koordinat) file ditempatkan pada peta: easting dan northing titik asalnya, serta rotasi dan skala sistem lokal, berada dalam konversi peta. Tanpa itu, file mencatat titik asal lokalnya dalam himpunan properti dan tidak ditempatkan pada peta.

## Impor

Buka file .ifc dengan {{ui:Buka}} atau letakkan di denah. Dialog impor menyatakan apa yang dimuat file:

- **Alinyemen** dari IFC 4.3 (tata letak horizontal dan vertikal) dan kurva alinyemen IFC 4x1 menjadi alinyemen CivilCraft dengan PI, jari-jari, panjang spiral, dan PVI-nya. Alinyemen yang tidak dapat ditampung model PI CivilCraft (kurva majemuk, spiral di antara dua kurva, atau alinyemen yang dimulai atau diakhiri di dalam kurva) tidak diimpor, dan dialog menyatakan alasannya.
- **Permukaan**: pilih yang akan menjadi tanah yang ada, atau pertahankan milik proyek.
- **Semua yang lain** (dan permukaan lainnya) dapat ditampilkan di tampilan 3D sebagai referensi. Elemen referensi tetap ada selama proyek terbuka; elemen tersebut tidak disimpan dalam file proyek.

File yang ditulis CivilCraft dalam IFC4 atau IFC2x3 mengembalikan alinyemennya secara tepat dari himpunan propertinya.

## Belum dibuat

- Superelevasi jalan ditulis sebagai kejadian superelevasi dan pada permukaan jalan (cant untuk jalur kereta api).
- Menyimpan elemen referensi dalam file proyek, dan mengimpor jaringan pipa atau pad dari IFC sebagai objek yang dapat disunting.
