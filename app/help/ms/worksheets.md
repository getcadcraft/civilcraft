---
title: Lembaran kerja: jadual yang dipautkan kepada objek
summary: Lembaran kerja tersimpan dengan baris daripada tumbuhan, kawasan tanaman, turapan, dinding, tangga, pengubah suai tanah atau semua kuantiti; lajur dan formula anda sendiri, kumpulan dan jumlah; CSV, XLSX dan jadual pada helaian, sentiasa terkini.
keywords: lembaran kerja, jadual, jadual tumbuhan, jadual landskap keras, kuantiti, lajur, formula, jumlah, hasil tambah, kira, kumpulan, tapis, csv, xlsx, hamparan, jadual pada helaian
from: 11bc1bac
---

{{ui:Lembaran kerja}} (Landskap › Lagi) membuka lembaran kerja projek ini. Kali pertama, **jadual tumbuhan** dan **jadual landskap keras dan kawasan** dibuat untuk anda. Lembaran kerja dikira daripada objek setiap kali ia dipaparkan, ditulis keluar atau diletakkan pada helaian: ubah katil dan kiraannya berubah di mana-mana.

- **Baris daripada**: tumbuhan (satu baris bagi setiap spesies, kultivar dan saiz), kawasan tanaman, turapan, dinding, tangga, pengubah suai tanah (potongan dan tambakan) atau semua kuantiti.
- **Lajur**: medan (`qty`, `area`, `botanical`, atau nama dalam kurungan seperti `[Net area]`) atau formula: `+ - * / ^ %`, `&` untuk menggabungkan teks, `= <> < <= > >=`, dan `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula yang tidak dapat dikira menunjukkan `#ERR` (atau `#DIV/0`) dalam selnya. Formula dibaca oleh penghurai CadCraft sendiri; tiada apa-apa dalamnya dijalankan sebagai kod.
- **Jumlah** bagi setiap lajur (hasil tambah, kiraan, purata, terkecil, terbesar), **Kumpulkan mengikut** (subjumlah bagi setiap kumpulan) dan **Hanya baris di mana**.
- {{ui:Simpan sebagai CSV}}, {{ui:Simpan sebagai XLSX}}, dan **Letakkan lembaran kerja ini pada helaian** (Helaian › Lembaran kerja melukisnya sebagai jadual, merentasi seberapa banyak helaian yang diperlukan).

Label pada tumbuhan dan kawasan membaca nama medan yang sama (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
