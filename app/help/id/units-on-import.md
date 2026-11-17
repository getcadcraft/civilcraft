---
title: Satuan saat impor: file menyatakan satuannya, atau Anda ditanya dulu
summary: Saat gambar atau mesh yang Anda bawa ke proyek menyatakan satuannya, CivilCraft mengonversinya dan memberi tahu Anda. Jika tidak, CivilCraft bertanya sebelum membacanya dan mengingat jawaban Anda untuk file itu.
keywords: satuan, impor, DWG, DXF, STL, OBJ, survei, kaki, kaki survei AS, meter, milimeter, skala, ukuran salah, terlalu besar, terlalu kecil, tanya, diingat, INSUNITS, satuan gambar
from: 60921963
---

## Yang akan Anda lakukan

Membawa file ke dalam proyek dan memastikan file itu masuk dengan ukuran yang benar.

## Langkah

1. Buka file seperti biasa: {{ui:Buka}}, seret ke denah, atau perintah gambar CAD.
2. Jika file menyatakan satuannya, tidak ada yang ditanyakan: dialog impor menampilkannya sebagai **Sesuai gambar**.
3. Jika tidak, dialog bertanya **Satuan dari** file sebelum dialog impor terbuka. Pilih apa yang dimaksud satu satuan di file itu, lalu klik {{ui:Gunakan satuan ini}}.
4. {{ui:Batal}} (atau {{key:Esc}}) melewati file. Tidak ada isinya yang dibaca ke dalam proyek.

## File mana yang menyatakan satuannya

- **DWG dan DXF**: satuan sisipan gambar (`$INSUNITS`). File tanpa itu akan ditanyakan. Daftar **Satuan gambar** di dialog impor dimulai dari jawaban Anda dan tetap dapat diubah.
- **STL dan OBJ** (bentuk bebas lanskap): tidak pernah menyatakan satuan. Anda akan ditanya.
- **Daftar titik** (CSV, TXT) dan daftar survei progres: daftar yang menyatakan satuannya di baris-baris pertamanya dikonversi, dan baris status menyebutkannya. Daftar yang tidak menyatakan apa pun akan ditanyakan saat Anda menekan {{ui:Impor}}, sebelum titik-titiknya masuk. Kolom lintang dan bujur melewati sistem koordinat sebagai gantinya.
- **Add-on Point clouds**: bertanya saat Anda membangun awan yang file-nya tidak menyatakan satuan, dan memberi label pada angka awan dalam satuan yang dibawanya.
- **IFC dan LandXML**: menyatakan satuannya; keduanya dikonversi ke satuan proyek.
- **LAS, LAZ, dan raster elevasi**: diletakkan sesuai sistem koordinatnya; dialog terrain menanyakan satuan elevasi jika file tidak menyebutkannya.

## Perlu diketahui

- Jawaban diingat untuk file itu di komputer ini, di setiap aplikasi CadCraft. Saat file itu masuk berikutnya, Anda tidak akan ditanya lagi.
- Untuk ditanya lagi: palet perintah ({{key:Mod+K}}) › **Tanya lagi satuan file yang diimpor**.
- Satuan yang dinyatakan sebuah daftar dibaca dari delapan baris pertamanya: misalnya baris seperti `units: ft`, atau judul kolom yang semuanya membawa satuan yang sama dalam tanda kurung, seperti `Elevation (m)`.
