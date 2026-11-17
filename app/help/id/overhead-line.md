---
title: Gambar saluran udara
summary: Tempatkan penyangga di denah, biarkan CivilCraft menentukan peran tiap penyangga dan bagian di antara ujung mati, serta pindahkan penyangga di denah atau di profil saluran.
keywords: saluran udara, penyangga, tiang, bentang, bagian, ujung mati, sudut, suspensi, profil, tinggi, crossarm, stay, kabel penahan, guy
from: b8e5e272
---

## Gambar

1. Miliki permukaan: tanah di bawah saluran berasal darinya ([Bangun permukaan](topic:build-surface)). Penyangga tanpa tanah di bawahnya tercantum di bawah **Pemeriksaan**; ketik **Elevasi tanah** di Properti sebagai gantinya.
2. Klik {{ui:Saluran}} di grup Saluran listrik dan klik tiap penyangga di denah.
3. Klik ganda penyangga terakhir, atau tekan Enter.

Saluran mendapat konduktor, penyangga, dan peralatan yang terakhir Anda gunakan di komputer ini (pertama kali: contoh dari pustaka). Ubah di Properti.

## Saluran di Properti

Pilih saluran (klik satu bentang) untuk mengatur **Konduktor**, **Konduktor per sirkuit**, **Sirkuit**, **Tegangan**, **Aturan jarak bebas** yang harus dipertahankannya di atas tanah, dan peralatan **Pada setiap penyangga** (crossarm, isolator, aksesori). Tabel mencantumkan **bagian**-nya dengan bentang acuan masing-masing, tegangan harian, dan kasus beban yang mengaturnya.

## Penyangga

Klik penyangga untuk memilihnya. Di Properti:

- **Penyangga**: item pustakanya. Bila terlalu lemah, {{ui:Gunakan …}} memasang penyangga terkecil dengan bahan yang sama dari pustaka Anda yang mampu menahan beban.
- **Peran**: Otomatis, Suspensi, Sudut, atau Ujung mati. Otomatis berarti: penyangga pertama dan terakhir adalah ujung mati; belokan melebihi sudut aturan menjadikan penyangga sudut; belokan yang lebih besar menjadikannya ujung mati.
- **Tinggi di atas tanah**: kosong mengambilnya dari item pustaka (panjangnya dikurangi kedalaman di dalam tanah).
- **Pada penyangga ini juga**: peralatan tambahan, seperti **stay** (kabel penahan). Penyangga yang diberi stay meneruskan tarikan saluran ke stay-nya.
- **Penyangga yang ada**: diperiksa seperti yang lain, tetapi tidak dihitung dalam kuantitas.

{{ui:Penyangga}} menambahkan penyangga pada bentang terdekat dari klik Anda. Seret penyangga di denah untuk memindahkannya. Delete menghapusnya (saluran menyimpan minimal dua).

Bagian berjalan di antara ujung mati: di dalam bagian, konduktor bergerak bebas melalui klem suspensi, sehingga satu tegangan berlaku untuk seluruh bagian.

## Profil saluran

Klik {{ui:Profil}} (atau **Profil** di Properti saluran). Panel di bawah denah menampilkan tanah sepanjang saluran, tiap penyangga dari tanah hingga puncaknya, fase terendah konduktor pada **Kasus beban** yang Anda pilih, dan jarak bebas yang harus dipertahankan saluran sebagai garis putus-putus. Bentang yang gagal berwarna merah; angka di bawah tiap bentang adalah jarak bebas terendahnya.

- **Saluran** memilih saluran yang ditampilkan. Memilih saluran lain, atau salah satu penyangganya, di denah akan mengalihkan profil ke sana.
- Arahkan penunjuk ke profil: garis panduan mengikutinya, dan label membaca jarak sepanjang saluran, tanah, konduktor, serta jarak bebas di titik itu (dan memberi tahu jika jarak bebasnya di bawah aturan saluran).
- {{ui:Ukur}} di bilah profil: klik dua titik untuk mendapatkan jarak mendatar, selisih tinggi, jarak lurus, dan kemiringan di antaranya. Klik di dekat tanah, konduktor, atau puncak penyangga akan menempel padanya. Klik {{ui:Ukur}} lagi untuk berhenti.
- Rintangan yang dilintasi saluran berdiri dari tanah: yang digambar sebagai batang, tanaman Lanskap sebagai tajuknya, dan dinding sebagai batang (lihat [Pemeriksaan saluran listrik](topic:power-line-checks#clearances)). Rute kabel dan pipa yang dilintasi saluran ditandai di bawah tanah pada puncaknya, beserta namanya.

- Seret penyangga ke samping untuk memindahkannya sepanjang saluran.
- Seret puncaknya ke atas atau ke bawah untuk mengatur tingginya di atas tanah.
