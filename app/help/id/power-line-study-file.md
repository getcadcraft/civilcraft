---
title: File kajian untuk program saluran lain (.DON)
summary: Simpan satu saluran udara sebagai file kajian .DON, atau baca tiang dari satu file ke saluran baru. Belum diuji dengan program yang membacanya.
keywords: don, .don, file kajian, xml, ekspor, impor, program saluran udara, penarikan, canton
from: 1abc4d07
---

Beberapa program saluran udara menyimpan kajian dalam file `.DON` (teks XML). CivilCraft dapat menulis satu saluran sebagai file seperti itu dan membaca tiang dari satu file.

:::warning
**Belum diuji.** Kami membangunnya dari daftar nama field format yang dibagikan seorang pengguna, bukan dari file sungguhan, dan kami belum membuka file kami di program yang membacanya. Buka file di sana dan periksa setiap nilai sebelum Anda mengandalkannya. Jika Anda dapat membagikan file `.DON` (dengan detail klien dihapus), itu membantu kami membuatnya benar.
:::

## Simpan file kajian

1. Beri saluran sebuah konduktor dan pastikan ia memiliki hasil (tidak ada "belum dihitung" di Properti-nya).
2. {{ui:Lainnya}} › {{ui:Simpan file kajian (.DON)…}}, pilih saluran, tambahkan deskripsi dan nomor pekerjaan.
3. {{ui:Simpan file kajian}}.

File memuat tiang saluran (koordinat, tanah, tinggi, peran, travers, tiang yang dipertahankan atau disarankan, beban per kasus beban, pondasi), satu bagian untuk setiap ruas di antara ujung mati (konduktor, tegangan, bentang acuan (ruling span), bentang, tegangan dan parameter katenari, tegangan terbesar per kasus beban), serta tabel penarikan. Panjang dalam meter dan gaya dalam daN; teks ditulis dalam Latin-1, sehingga karakter di luarnya menjadi `?`.

## Baca file kajian

{{ui:Lainnya}} › {{ui:Buka file kajian (.DON)…}} membaca tiang ke saluran baru. Konduktor, tiang, dan travers dicocokkan dengan pustaka Anda berdasarkan nama; apa pun yang tidak ditemukan dibiarkan untuk Anda pilih di Properti.
