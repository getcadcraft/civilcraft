---
title: Tukar LandXML
summary: Buka LandXML daripada perisian awam lain sebagai projek baharu, eksport titik, permukaan, penjajaran, profil dan rangkaian paip sebagai LandXML 1.2, dan ketahui apa yang tidak ikut serta.
keywords: landxml, xml, import, eksport, pertukaran, tin, permukaan, penjajaran, profil, rangkaian paip, kesalingoperasian, pertukaran data
from: 870d5ece
---

LandXML ialah format pertukaran terbuka yang kebanyakan program awam baca dan tulis. CivilCraft membaca dan menulis LandXML 1.2. Jika anda pernah menggunakan Civil 3D, kotak dialog import dan eksport LandXML-nya ialah padanan yang paling hampir; di sini tiada pilihan untuk dibuat, dan nota memberitahu anda apa yang ditinggalkan.

## Buka fail LandXML

1. Klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) dan pilih fail `.xml` atau `.landxml`, atau lepaskannya pada pelan.
2. Jika projek semasa mempunyai perubahan yang belum disimpan, CivilCraft bertanya dahulu. Pilih {{ui:Simpan salinan}}, {{ui:Jangan simpan}} atau {{ui:Batal}}.
3. Projek baharu dibuat. Bar status menyatakan apa yang dibaca, contohnya "Dibuka site.xml: 412 titik, 2 permukaan, 3 penjajaran."
4. Lihat kotak di bawah fakta **Permukaan**. Ia menyenaraikan semua yang dilangkau atau diubah, contohnya:
   - "Hanya permukaan pertama ("EG") dibuka; fail itu mempunyai 1 lagi."
   - "Penjajaran "Ramp A" mempunyai elemen yang CivilCraft belum boleh lukis (bukan garisan, lengkok atau spiral klotoid); ia dilangkau."
   - "Peraturan rangkaian paip tidak ada dalam fail; pemegang tempat sedang digunakan — tetapkan peraturan anda di bawah Projek."

Apa menjadi apa:

| Dalam fail | Dalam CivilCraft |
|---|---|
| Units (Imperial atau Metric) | **Unit** projek (kaki atau meter) |
| Project name | **Nama** projek |
| CgPoints | Titik projek; huraian (atau kod) memberikan kumpulan |
| Permukaan TIN pertama | Tanah sedia ada, digunakan seperti sedia ada ("Surface (from LandXML)") |
| Setiap penjajaran garisan, lengkok dan spiral klotoid | Penjajaran dengan PI, jejari dan panjang spiralnya dibina semula daripada lengkung |
| Profil reka bentuk pertama bagi setiap penjajaran | Profil reka bentuknya, dengan lengkung menegak parabola |
| Rangkaian paip pertama | Rangkaian paip, dengan pinggir, sump dan invert |
| Garisan ciri bagi garisan dan lengkok | Garisan ciri, lengkok dikekalkan; daripada program lain ia bermula sebagai **Hanya dilukis** |

Senarai penuh elemen dan atribut ada dalam [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

:::note
Permukaan yang dibaca daripada LandXML tidak dibina semula apabila anda menukar kumpulan titik atau melukis garisan putus. Klik {{ui:Bina semula permukaan daripada titik}} dalam bahagian **Permukaan** untuk membinanya daripada titik sebaliknya ({{key:Mod+Z}} mengembalikan permukaan LandXML).
:::

## Eksport LandXML

1. Klik {{ui:LandXML}} dalam kumpulan **Eksport**.
2. Pelayar memuat turun `<name>.xml`. Bar status menyatakan apa yang dimasukkan, contohnya "Dieksport LandXML 1.2: 276 titik, 2 permukaan, 1 penjajaran, rangkaian paip. Pad bukan sebahagian daripada LandXML di sini; permukaan yang digred ialah."

Fail itu mengandungi:

- **Unit**: kaki survei US atau meter.
- **CgPoints**: setiap titik dengan nombornya sebagai nama, huraiannya dan kumpulannya sebagai kod.
- **Permukaan**: tanah sedia ada sebagai TIN, dengan garisan putus dan sempadan luarnya sebagai data sumber; dan, apabila pad atau koridor digred, permukaan TIN kedua bernama "Proposed".
- **Penjajaran**: garisan, lengkok dan spiral klotoid dengan stesennya, setiap satu dengan profil yang memegang tanah sedia ada yang disampel sepanjangnya dan profil reka bentuk (PVI dan lengkung parabola) apabila ia mempunyai sekurang-kurangnya dua PVI.
- **PipeNetworks**: struktur dengan pinggir, sump dan invert bagi setiap paip, dan paip dengan diameter, panjang dan kecerunan.
- **PlanFeatures**: setiap garisan ciri sebagai garisan dan lengkok dengan aras di setiap hujung, dan kegunaannya.

## Apa yang tidak ikut serta

- Pad dan koridor sebagai objek. Hasilnya ada dalam permukaan "Proposed".
- Penjajaran dengan ralat (contohnya lengkung bertindih): ditinggalkan, dan dikira dalam mesej status.
- Paip tanpa kedua-dua invert, dan rangkaian dengan kurang daripada dua struktur.
- Pinggir yang diambil daripada permukaan ditulis sebagai pinggir tetap. Apabila dibuka semula, struktur itu mengekalkan nombor tersebut walaupun permukaan berubah.
- Peraturan rangkaian (kecerunan terkecil, penutup, penurunan): LandXML tiada tempat untuknya.
- Tetapan paparan dan pilihan permukaan kumpulan titik: simpan projek CivilCraft untuk itu.

Apabila membuka, CivilCraft tidak membaca spiral selain klotoid, permukaan grid, titik yang hanya merujuk titik lain, lot, spiral dalam garisan ciri, jalan atau data tinjauan. Setiap satu dinyatakan dalam nota, tidak sekali-kali diagak.

## Pusingan penuh

Untuk menyerahkan kerja kepada seseorang yang menggunakan perisian awam lain dan mendapatkannya semula, eksport LandXML, biarkan mereka menyunting, dan buka LandXML mereka sebagai projek baharu. Simpan juga `.civilcraft.json` anda sendiri: ia satu-satunya fail yang menyimpan semua yang CivilCraft tahu.
