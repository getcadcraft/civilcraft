---
title: Tukar LandXML
summary: Buka LandXML dari perangkat lunak sipil lain sebagai proyek baru, ekspor titik, permukaan, alinyemen, profil, dan jaringan pipa sebagai LandXML 1.2, serta ketahui apa yang tidak ikut.
keywords: landxml, xml, impor, ekspor, tukar, tin, permukaan, alinyemen, profil, jaringan pipa, interoperabilitas, pertukaran data
from: 870d5ece
---

LandXML adalah format pertukaran terbuka yang paling banyak dibaca dan ditulis program sipil. CivilCraft membaca dan menulis LandXML 1.2. Jika Anda pernah memakai Civil 3D, dialog impor dan ekspor LandXML-nya adalah yang paling mirip; di sini tidak ada pilihan yang harus dibuat, dan catatan memberi tahu apa yang tertinggal.

## Membuka file LandXML

1. Klik {{ui:Open}} (atau tekan {{key:Mod+O}}) dan pilih file `.xml` atau `.landxml`, atau letakkan di denah.
2. Jika proyek saat ini memiliki perubahan yang belum disimpan, CivilCraft bertanya dulu. Pilih {{ui:Save a copy}}, {{ui:Don’t save}}, atau {{ui:Cancel}}.
3. **Proyek baru** dibuat. Bilah status menyebutkan apa yang dibaca, misalnya "Dibuka site.xml: 412 titik, 2 permukaan, 3 alinyemen."
4. Lihat kotak di bawah fakta **Permukaan**. Kotak itu mendaftar semua yang dilewati atau diubah, misalnya:
   - "Hanya permukaan pertama ("EG") yang dibuka; file memiliki 1 lagi."
   - "Alinyemen "Ramp A" memiliki elemen yang belum dapat digambar CivilCraft (bukan garis, busur, atau spiral clothoid); alinyemen itu dilewati."
   - "Aturan jaringan pipa tidak ada dalam file; placeholder yang dipakai — atur aturan Anda di bawah Proyek."

Yang menjadi apa:

| Dalam file | Di CivilCraft |
|---|---|
| Satuan (Imperial atau Metric) | **Satuan** proyek (kaki atau meter) |
| Nama proyek | **Nama** proyek |
| CgPoints | titik proyek; deskripsi (atau code) menentukan grupnya |
| Permukaan TIN pertama | tanah eksisting, dipakai apa adanya ("Permukaan (dari LandXML)") |
| Setiap alinyemen garis, busur, dan spiral clothoid | alinyemen dengan PI, radius, dan panjang spiral yang dibangun ulang dari kurva |
| Profil rencana pertama tiap alinyemen | profil rencananya, dengan kurva vertikal parabola |
| Jaringan pipa pertama | jaringan pipa, dengan rim, sump, dan invert-nya |
| Fitur denah berupa garis dan busur | garis fitur, busur dipertahankan; dari program lain mereka mulai sebagai **Hanya digambar** |

Daftar lengkap elemen dan atribut ada di [LandXML: yang dibaca dan ditulis](topic:landxml-reference).

:::note
Permukaan yang dibaca dari LandXML tidak dibangun ulang saat Anda mengubah grup titik atau menggambar breakline. Klik {{ui:Rebuild the surface from the points}} di bagian **Permukaan** untuk membangunnya dari titik sebagai gantinya ({{key:Mod+Z}} mengembalikan permukaan LandXML).
:::

## Ekspor LandXML

1. Klik {{ui:LandXML}} di grup **Export**.
2. Browser mengunduh `<name>.xml`. Bilah status menyebutkan apa yang masuk, misalnya "Diekspor LandXML 1.2: 276 titik, 2 permukaan, 1 alinyemen, jaringan pipa. Pad tidak termasuk dalam LandXML di sini; permukaan yang di-grading termasuk."

File berisi:

- **Satuan**: US survey feet atau meter.
- **CgPoints**: setiap titik dengan nomornya sebagai nama, deskripsinya, dan grupnya sebagai code.
- **Surfaces**: tanah eksisting sebagai TIN, dengan breakline dan batas luarnya sebagai data sumber; dan, saat pad atau koridor di-grading, permukaan TIN kedua bernama "Proposed".
- **Alignments**: garis, busur, dan spiral clothoid dengan stasiunnya, masing-masing dengan profil yang memuat tanah eksisting yang diambil sampelnya sepanjang alinyemen dan profil rencana (PVI dan kurva parabola) saat memiliki setidaknya dua PVI.
- **PipeNetworks**: struktur dengan rim, sump, dan invert per pipa, serta pipa dengan diameter, panjang, dan kemiringan.
- **PlanFeatures**: setiap garis fitur sebagai garis dan busur dengan elevasi di setiap ujung, serta untuk apa ia digunakan.

## Yang tidak ikut

- Pad dan koridor sebagai objek. Hasilnya ada di permukaan "Proposed".
- Alinyemen dengan kesalahan (misalnya kurva yang tumpang tindih): tidak disertakan, dan dihitung di pesan status.
- Pipa tanpa kedua invert, dan jaringan dengan kurang dari dua struktur.
- Rim yang diambil dari permukaan ditulis sebagai rim tetap. Saat dibuka kembali, struktur mempertahankan angka itu meskipun permukaannya berubah.
- Aturan jaringan (kemiringan terkecil, penutup, penurunan): LandXML tidak memiliki tempat untuknya.
- Pengaturan tampilan dan pilihan permukaan grup titik: simpan proyek CivilCraft untuk itu.

Saat membuka, CivilCraft tidak membaca spiral selain clothoid, permukaan grid, titik yang hanya merujuk ke titik lain, parcel, spiral dalam garis fitur, roadway, atau data survei. Setiap hal itu disebutkan dalam catatan, tidak ditebak.

## Putaran bolak-balik

Untuk menyerahkan pekerjaan kepada seseorang yang memakai perangkat lunak sipil lain dan mendapatkannya kembali, ekspor LandXML, biarkan mereka menyuntingnya, dan buka LandXML mereka sebagai proyek baru. Simpan juga `.civilcraft.json` Anda sendiri: itulah satu-satunya file yang menyimpan semua yang diketahui CivilCraft.
