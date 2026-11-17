---
title: Eksport dan import IFC
summary: Simpan keseluruhan projek sebagai satu fail IFC dalam IFC 4.3, IFC4 atau IFC2x3 (penjajaran, jalan, kerja tanah, permukaan, dinding, paip), dan buka fail IFC untuk penjajaran serta permukaannya.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, penjajaran, ifcalignment, jalan, ifcroad, kerja tanah, tin, hasil serahan, perolehan, eksport ifc, import ifc
from: 6b998bcf
---

IFC ialah format pertukaran terbuka yang diminta oleh ramai pelanggan awam sebagai hasil serahan. CivilCraft menulis keseluruhan projek ke dalam satu fail IFC dan membaca penjajaran serta permukaan semula daripada fail IFC.

## Eksport

1. Klik {{ui:IFC}} dalam kumpulan **Eksport** (dalam gaya reben: {{ui:Output}} › {{ui:Eksport}} › {{ui:IFC}}).
2. Pilih skema. **IFC 4.3 ADD2** ialah yang pertama dan lalai: ia edisi dengan penjajaran, jalan dan kerja tanah. Pilih IFC4 atau IFC2x3 hanya apabila perisian penerima tidak dapat membaca 4.3.
3. Kotak dialog memberitahu apa yang fail itu akan kandungi dan apa yang skema terpilih tinggalkan. Klik {{ui:Eksport IFC}}.
   Fail dimuat turun sebagai "*nama projek*-ifc4x3.ifc", "-ifc4.ifc" atau "-ifc2x3.ifc". CivilCraft mengingati skema yang anda pilih terakhir.

## Isi setiap skema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Penjajaran | IfcAlignment dengan susun atur mengufuk (garisan, lengkok bulatan, spiral klotoid) dan menegak (kecerunan, lengkung parabola), lengkungnya (IfcCompositeCurve, IfcGradientCurve), stesen permulaan dan peristiwa superelevasi | Polilgaris 3D pada elemen sivil | Polilgaris 3D pada proksi |
| Koridor | IfcRoad dengan bahagian jalan; lorong, bahu, parit tepi dan kaki lima sebagai IfcPavement, kerb sebagai IfcKerb, jalur tanaman; setiap lapisan turapan sebagai IfcCourse dengan ketebalan, bahan dan isipadunya; cerun sisi sebagai IfcEarthworksCut dan IfcEarthworksFill dengan isipadu korek dan timbus; kelajuan reka bentuk dan kelasnya | Elemen sivil dinamakan mengikut jenisnya, dikumpulkan setiap jalan | Proksi, dikumpulkan setiap jalan |
| Permukaan | IfcGeographicElement TERRAIN dengan rangkaian tak sekata bersegi tiga | Set muka bersegi tiga | Model permukaan berasaskan muka (fail lebih besar) |
| Pad dan dinding | Bahagian atas pad, cerunnya sebagai kerja tanah, dinding penahan sebagai IfcWall RETAININGWALL | Sama, dinding sebagai jenis dinding tersuai | Sama, jenis dinding dalam ObjectType |
| Rangkaian paip | IfcPipeSegment dan IfcDistributionChamberElement dalam IfcDistributionSystem | Sama | IfcFlowSegment dan kebuk dalam IfcSystem |
| Georujukan | IfcProjectedCRS dan IfcMapConversion | Sama | ePSet_ProjectedCRS dan ePSet_MapConversion pada tapak |

Satu **landasan kereta api** (penjajaran dengan Landasan kereta api dihidupkan) masuk ke dalam IFC 4.3 sebagai IfcRailway: peralihannya sebagai jenis tersendiri (klotoid, parabola kubik, Bloss, Helmert, separuh gelombang sinus sebagai lengkung kosinus, sinus), kantnya sebagai IfcAlignmentCant, dan landasnya sebagai rel, rasuk melintang dan katil balast, dengan sub-balast di bawahnya. IFC4 dan IFC2x3 mendapat bahagian yang sama sebagai elemen sivil atau proksi. Membuka landasan kereta api IFC 4.3 membawa kembali peralihan dan kantnya.

Setiap fail juga membawa parsel (jejak tapak), tanaman dan landskap keras ruang kerja Landskap, serta jisim bangunan (setiap satu IfcBuilding dengan tingkatnya), semuanya dalam satu tapak. Set sifat membawa apa yang anda reka: stesen, himpunan, cerun korek dan timbus, lebar dan bilangan lorong, aras inver, bibir, ketinggian dinding; kuantiti (panjang, luas, isipadu) ialah set IfcElementQuantity.

## Unit dan koordinat

Fail berada dalam unit panjang projek (meter, atau kaki survei AS); luas dan isipadu dalam meter persegi dan padu. Dengan sistem koordinat (GIS › Koordinat) fail diletakkan pada peta: easting dan northing asalnya, serta putaran dan skala sistem tempatan (tanah), berada dalam penukaran peta. Tanpa satu, fail merekodkan asal tempatannya dalam set sifat dan tidak diletakkan pada peta.

## Import

Buka fail .ifc dengan {{ui:Import}} atau lepaskannya pada pelan. Kotak dialog import memberitahu apa yang fail itu kandungi:

- **Penjajaran** daripada IFC 4.3 (susun atur mengufuk dan menegak) dan lengkung penjajaran IFC 4x1 menjadi penjajaran CivilCraft dengan PI, jejari, panjang spiral dan PVI. Penjajaran yang model PI CivilCraft tidak dapat tampung (lengkung majmuk, spiral antara dua lengkung, satu yang bermula atau berakhir dalam lengkung) tidak diimport, dan kotak dialog memberitahu sebabnya.
- **Permukaan**: pilih yang menjadi tanah sedia ada, atau kekalkan milik projek.
- **Semua yang lain** (dan permukaan lain) boleh dipaparkan dalam paparan 3D sebagai rujukan. Elemen rujukan kekal selagi projek dibuka; ia tidak disimpan dalam fail projek.

Fail yang ditulis CivilCraft dalam IFC4 atau IFC2x3 membawa penjajarannya kembali dengan tepat daripada set sifatnya.

## Belum dibina

- Superelevasi jalan ditulis sebagai peristiwa superelevasi dan dalam permukaan jalan (kant ialah untuk landasan kereta api).
- Menyimpan elemen rujukan dalam fail projek, dan mengimport rangkaian paip atau pad daripada IFC sebagai objek yang boleh disunting.
