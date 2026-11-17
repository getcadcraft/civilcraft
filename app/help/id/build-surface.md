---
title: Bangun dan sempurnakan permukaan
summary: Cara CivilCraft melakukan triangulasi pada tanah eksisting, dan cara membentuknya dengan grup breakline, breakline yang digambar, batas luar, serta sisi luar terpanjang.
keywords: tin, permukaan, triangulasi, breakline, batas, tanah eksisting, eg, buat permukaan, delaunay, segitiga, sisi maks, batas luar
from: b9eea3f3
---

CivilCraft memiliki satu permukaan tanah eksisting per proyek. Itu adalah TIN (triangulated irregular network) yang dibangun dari titik Anda, dan dibangun ulang secara otomatis setiap kali sebuah input berubah. Tidak ada perintah "bangun ulang" dan tidak ada permukaan yang kedaluwarsa.

## Yang masuk ke permukaan

- Setiap titik dengan elevasi dalam grup yang diatur ke {{ui:Titik}}.
- Setiap grup yang diatur ke {{ui:Breakline}}, digabungkan menurut urutan nomor titik.
- Setiap breakline yang Anda gambar dengan alat {{ui:Breakline}}.
- Batas luar, jika Anda menggambarnya.
- Pengaturan **Sisi luar terpanjang**.

Segitiga tidak pernah memotong breakline: permukaan dipaksa mengikutinya, lalu dibuat serata mungkin di sekelilingnya (Delaunay di tempat lain).

## Jadikan garis berkode sebagai breakline

1. Di panel kiri, di bawah **Titik**, cari grupnya (misalnya FL).
2. Atur pilihan **Permukaan** ke {{ui:Breakline}}.
   Permukaan dibangun ulang, garis digambar dengan warna oranye (dengan {{ui:Breakline}} aktif di bawah **Tampilan**), dan **Breakline** pada fakta permukaan bertambah satu.
3. Periksa garis di denah. Garis harus berjalan titik ke titik sesuai urutan garis itu diukur. Jika zig-zag, grup berisi lebih dari satu garis, atau titiknya tidak bernomor berurutan: atur grup kembali ke {{ui:Titik}} dan gambar garisnya dengan tangan (bagian berikutnya).

## Gambar breakline melalui titik

1. Tekan {{key:B}}, atau klik {{ui:Breakline}} di grup **Permukaan**.
   Petunjuknya berbunyi "Breakline: klik titik survei berurutan (mengambil elevasinya). Enter menyelesaikan."
2. Gerakkan penunjuk dekat sebuah titik. Kotak kecil oranye menandai titik yang akan diambilnya.
3. Klik titik-titik garis satu per satu. Setiap klik menyebut titik dan elevasinya di bilah status.
4. Tekan {{key:Enter}} untuk menyelesaikan.
   Bilah status menyatakan "Breakline 1 ditambahkan; permukaan dibangun ulang."

Klik harus mengenai titik survei yang memiliki elevasi; klik di tempat lain ditolak dengan "Klik titik survei dengan elevasi: breakline mengambil elevasi titik-titik tersebut." {{key:Backspace}} menjatuhkan titik terakhir; {{key:Esc}} membatalkan seluruh garis.

:::warning
Selesaikan dengan {{key:Enter}}. Klik ganda juga menyelesaikan, tetapi di build ini menjatuhkan titik yang Anda klik ganda. Klik titik terakhir sekali, lalu tekan {{key:Enter}}.
:::

Untuk menghapus semua breakline yang digambar sekaligus, klik {{ui:Buang breakline gambar}} di bagian **Permukaan**. Untuk menghapus hanya yang terakhir, gunakan {{key:Mod+Z}}. Breakline yang digambar belum dapat dipilih atau diubah satu per satu.

## Gambar batas luar

Batas memangkas permukaan ke area yang Anda percayai, misalnya batas survei, sehingga segitiga panjang yang melintasi sudut tak tersurvei hilang.

1. Tekan {{key:O}}, atau klik {{ui:Batas}}.
2. Klik sudut-sudut berurutan di sekeliling area. Garis putus-putus menampilkan bentuknya.
3. Tekan {{key:Enter}}.
   Bilah status menyatakan "Batas diatur; segitiga di luarnya dihapus." **Batas** pada fakta permukaan menampilkan "Ya" dan jumlah sudutnya.

Hal yang perlu diketahui:

- Hanya ada satu batas. Menggambar yang lain menggantikannya. {{ui:Buang batas}} menghapusnya.
- Batas hanya dapat memotong: batas yang melewati titik dipotong kembali ke garis luar titik-titik itu, dengan catatan "Batas melewati titik; batas dipotong kembali ke garis luarnya."
- Sudut-sudutnya mengambil elevasi dari permukaan, sehingga tepinya mengikuti tanah dengan tepat.
- Batas sembunyikan (dalam) belum tersedia.

## Pangkas segitiga luar yang panjang

Tanpa batas, permukaan mengisi seluruh garis luar titik, termasuk segitiga tipis panjang di sepanjang tepi cekung.

1. Di **Permukaan**, ketik panjang di **Sisi luar terpanjang** dan tekan {{key:Enter}}. Mulailah dengan sekitar dua atau tiga kali jarak bidik biasa Anda.
2. Segitiga luar yang sisi luarnya lebih panjang dari itu dihapus, bergerak ke dalam sampai setiap sisi luar cukup pendek. Sisi yang merupakan breakline tidak pernah dikupas.
3. Ketik 0 untuk menyimpan kembali setiap segitiga.

## Baca laporan permukaan

Di bawah fakta permukaan, sebuah kotak mencantumkan apa yang dilakukan pembangun. Dengan batang oker di sisi kirinya, itu informasi; dengan batang merah, ia memuat kesalahan dan tidak ada permukaan.

| Pesan | Arti |
|---|---|
| "3 titik berada di tempat yang sama dengan titik lain dan bergabung dengannya." | Titik yang lebih dekat dari 0.0001 pada denah menjadi satu simpul (yang pertama dipertahankan). |
| "2 tempat memiliki dua elevasi berbeda …" | Titik yang saling menumpuk, atau breakline yang berpotongan, berbeda tinggi. Elevasi breakline yang menang, lalu yang pertama. |
| "1 potongan breakline tidak dapat dipaksa masuk ke permukaan." | Potongan breakline yang sangat pendek atau hampir tumpang tindih tidak muat; periksa titik itu. |
| "Permukaan memerlukan setidaknya tiga titik dengan elevasi." | Titik terlalu sedikit: periksa urutan kolom dan grupnya. |
| "Titik semuanya berada pada satu garis: tidak ada segitiga." | Titik tidak memiliki lebar, misalnya satu garis poligon. |
| "Batas tidak tumpang tindih dengan titik." | Batas berada di tempat lain, sering kali karena tertukar satuan atau koordinat. |
| "Tidak ada segitiga yang tersisa di dalam batas." | Batas terlalu kecil atau salah tempat. |

## Permukaan yang dibaca dari LandXML

Saat Anda membuka LandXML, permukaan TIN pertamanya digunakan apa adanya: judul **Permukaan** berbunyi "Permukaan (dari LandXML)" dan **Sisi luar terpanjang** dibuat abu-abu. Selama permukaan itu digunakan, grup breakline, breakline yang digambar, dan batas baru tidak mengubahnya. Untuk membangun permukaan dari titik-titik file sebagai gantinya, klik {{ui:Bangun ulang permukaan dari titik}}. {{key:Mod+Z}} mengembalikan permukaan LandXML.

## Terkait

- [Baca kontur, elevasi, dan kemiringan](topic:contours).
- [Impor titik survei](topic:import-points).
