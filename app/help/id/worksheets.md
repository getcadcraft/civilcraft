---
title: Lembar kerja: jadwal yang terhubung dengan objek
summary: Lembar kerja tersimpan dengan baris dari tanaman, area tanam, perkerasan, dinding, tangga, pengubah tanah, atau semua kuantitas; kolom dan rumus Anda sendiri, kelompok dan total; CSV, XLSX, dan tabel pada lembar, selalu terbaru.
keywords: lembar kerja, jadwal, jadwal tanaman, jadwal hardscape, kuantitas, kolom, rumus, total, jumlah, cacah, kelompok, filter, csv, xlsx, spreadsheet, tabel pada lembar
from: 11bc1bac
---

{{ui:Lembar kerja}} (Lanskap › {{ui:Lainnya}}) membuka lembar kerja proyek ini. Pertama kali, **daftar tanaman** dan **daftar hardscape dan area** dibuat untuk Anda. Lembar kerja dihitung dari objek setiap kali ditampilkan, ditulis keluar, atau ditempatkan pada lembar: ubah sebuah {{ui:Bedengan}} dan jumlahnya ikut berubah di mana-mana.

- **Baris dari**: tanaman (satu baris per spesies, kultivar, dan ukuran), area tanam, perkerasan, dinding, tangga, pengubah tanah (galian dan timbunan), atau semua kuantitas.
- **Kolom**: sebuah bidang (`qty`, `area`, `botanical`, atau nama dalam tanda kurung seperti `[Net area]`) atau rumus: `+ - * / ^ %`, `&` untuk menggabungkan teks, `= <> < <= > >=`, dan `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Rumus yang tidak dapat dihitung menampilkan `#ERR` (atau `#DIV/0`) di selnya. Rumus dibaca oleh parser CadCraft sendiri; tidak ada isinya yang dijalankan sebagai kode.
- **Total** per kolom (jumlah, cacah, rerata, terkecil, terbesar), **Kelompokkan menurut** (subtotal per kelompok), dan **Hanya baris jika**.
- {{ui:Simpan sebagai CSV}}, {{ui:Simpan sebagai XLSX}}, dan **Tempatkan lembar kerja ini pada lembar** (Lembar › {{ui:Lembar kerja}} menggambarnya sebagai tabel, di atas sebanyak lembar yang dibutuhkan).

Label pada tanaman dan area membaca nama bidang yang sama (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
