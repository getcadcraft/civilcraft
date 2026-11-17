---
title: Fail kajian untuk program talian lain (.DON)
summary: Simpan satu talian atas sebagai fail kajian .DON, atau baca penyokong satu talian ke dalam talian baharu. Belum diuji dengan program yang membacanya.
keywords: don, .don, fail kajian, xml, eksport, import, program talian atas, penarikan, canton
from: 1abc4d07
---

Sesetengah program talian atas menyimpan kajian dalam fail `.DON` (teks XML). CivilCraft boleh menulis satu talian sebagai fail sedemikian dan membaca penyokong satu fail.

:::warning
**Belum diuji.** Kami membinanya daripada senarai nama medan format yang dikongsi oleh pengguna, bukan daripada fail sebenar, dan kami belum membuka fail kami dalam program yang membacanya. Buka fail di sana dan semak setiap nilai sebelum anda bergantung padanya. Jika anda boleh berkongsi fail `.DON` (dengan butiran pelanggan dibuang), ia membantu kami membetulkannya.
:::

## Simpan fail kajian

1. Berikan talian konduktor dan pastikan ia mempunyai keputusan (tiada "tidak dikira" dalam Sifatnya).
2. {{ui:Lagi}} › {{ui:Simpan fail kajian (.DON)…}}, pilih talian, tambah huraian dan nombor kerja.
3. {{ui:Simpan fail kajian}}.

Fail itu menyimpan penyokong talian (koordinat, tanah, ketinggian, peranan, rasuk silang, penyokong yang disimpan atau dicadangkan, beban setiap kes beban, asas), satu seksyen bagi setiap bahagian antara hujung mati (konduktor, voltan, rentang peraturan, rentang, tegangan dan parameter lengkung rantai, tegangan terbesar setiap kes beban) dan jadual penarikan. Panjang dalam meter dan daya dalam daN; teks ditulis dalam Latin-1, jadi aksara di luarnya menjadi `?`.

## Baca fail kajian

{{ui:Lagi}} › {{ui:Buka fail kajian (.DON)…}} membaca penyokong ke dalam talian baharu. Konduktor, penyokong dan rasuk silang dipadankan dengan pustaka anda mengikut nama; apa-apa yang tidak ditemui dibiarkan untuk anda pilih dalam Sifat.
