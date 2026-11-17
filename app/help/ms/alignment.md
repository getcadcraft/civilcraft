---
title: Reka penjajaran mengufuk
summary: Lukis penjajaran mengikut PI-nya, tetapkan jejari lengkung dan stesen permulaan, alihkan PI, dan baca data lengkung serta stesen dan ofset.
keywords: penjajaran, tiada penyelesaian, lengkung tidak muat, jejari terbesar, jejari terkecil, jejari minimum, kelajuan reka bentuk, pertindihan, garis tengah, pi, lengkung mengufuk, jejari, penomboran stesen, tangen, cipta penjajaran, susun atur penjajaran, pc, pt, ofset stesen
from: 8c5df4aa
---

Penjajaran dalam CivilCraft ialah rantaian tangen melalui titik persilangan (PI), dengan lengkung bulat di mana-mana PI dalaman yang mempunyai jejari. Ia dinomborkan stesen dari stesen permulaan yang anda pilih. Satu projek boleh memegang banyak penjajaran.

## Lukis penjajaran

1. Tekan {{key:A}}, atau klik {{ui:Penjajaran}} dalam kumpulan **Reka bentuk**.
   Petunjuk berbunyi "Penjajaran: klik PI mengikut urutan. Enter atau klik dua kali untuk selesai, Backspace buang yang terakhir, Esc batal."
2. Klik PI pertama (permulaan penjajaran).
3. Klik setiap PI berikutnya mengikut urutan. Garis merah mengikut penunjuk dan menunjukkan panjang dan bearing tangen yang sedang anda lukis, contohnya "212.40 ft  N 63°12'05" E".
4. Klik PI terakhir (penghujung penjajaran).
5. Tekan {{key:Enter}}.
   Penjajaran dilukis dengan penomboran stesen dan dipilih. Bar status berbunyi, contohnya, "Penjajaran 1: 386.36 ft, lengkung berjejari 100 ft di tempat yang muat. Sunting jejari dalam Sifat; Profil (R) untuk mereka bentuk cerunnya."

Semasa melukis: {{key:Backspace}} membuang PI terakhir, {{key:Esc}} membatalkan, dan menyeret pada ruang kosong menggerakkan paparan tanpa menambah PI.

:::warning
Selesaikan dengan {{key:Enter}}. Klik dua kali juga menyelesaikan, tetapi dalam binaan ini ia menggugurkan PI yang anda klik dua kali. Klik PI terakhir sekali, kemudian tekan {{key:Enter}}.
:::

Setiap PI dalaman mendapat lengkung 100 ft (30 m dalam projek meter), atau jejari bulat terbesar yang muat dalam separuh setiap tangen jika 100 ft tidak muat. PI yang sangat tajam atau lurus terus tidak mendapat lengkung.

## Tetapkan jejari dan koordinat

Dengan penjajaran dipilih, panel kanan menunjukkan **Penjajaran**:

1. **Nama** dan **Stesen permulaan**. Taip stesen sebagai `10+00` (kaki) atau `0+500` (meter), atau sebagai nombor biasa. Lihat [Unit, stesen dan format nombor](topic:units-and-stations).
2. **Panjang** dan **Stesen akhir** dikira untuk anda.
3. Jadual **PI** menyenaraikan **Easting** dan **Northing** bagi setiap PI, dan **Jejari** bagi setiap PI dalaman. Taip nilai baharu dan tekan {{key:Enter}}.
   - Jejari 0 menjadikannya titik sudut tanpa lengkung.
   - PI pertama dan terakhir tidak pernah mempunyai jejari.
   - Huruf x kecil di hujung baris mengalih keluar PI itu (penjajaran mengekalkan sekurang-kurangnya dua).
4. Baca senarai **Lengkung**: bagi setiap lengkung, stesen PC dan PT, jejari R, sisihan Δ dan arah (kiri atau kanan), panjang L, tangen T, luaran E dan korda.
5. Garis di bawah lengkung memberi bearing tangen pertama.

## Apabila lengkung tidak muat

Jika lengkung memerlukan lebih banyak tangen daripada yang ada antara PI mereka, penjajaran tiada penyelesaian: ia tidak dilukis dengan betul sehingga anda membetulkannya, dan ia ditinggalkan daripada eksport LandXML. Kotak merah menerangkan sebabnya dengan nombor, dan menawarkan apa yang akan muat:

- "Lengkung di PI 2 dan PI 3 memerlukan 240.00 ft tangen antara keduanya (130.00 + 110.00), tetapi PI berjarak 180.00 ft." — atau, apabila hanya satu daripadanya mempunyai lengkung, "Lengkung di PI 2 memerlukan 240.00 ft tangen ke arah PI 1 …".
- Butang bagi setiap PI menetapkan **jejari terbesar yang muat** di sana dengan lengkung yang satu lagi dikekalkan seperti sedia ada (ia juga mesti muat dengan tangen PI yang satu lagi). Apabila kedua-dua PI mempunyai lengkung, **Kedua-duanya** mengecilkan kedua-dua jejari mengikut nisbah supaya bertemu tepat.
- Apabila satu lengkung sahaja lebih panjang daripada tangen, kotak menyatakan tiada lengkung di PI lain boleh muat selagi ia sebesar itu.
- PI yang berpatah balik lurus tidak boleh menerima lengkung; kotak menawarkan **Tiada lengkung di PI n**.

Setiap butang ialah satu langkah: {{key:Mod+Z}} mengembalikan jejari. Jejari yang ditawarkan dibundarkan ke bawah kepada 0.01 supaya sentiasa muat.

### Jejari minimum reka bentuk

Taip **Jejari minimum reka bentuk** (contohnya daripada kelajuan reka bentuk anda) untuk menyemak setiap lengkung terhadapnya; biarkan kosong jika tiada. Lengkung di bawahnya disenaraikan dengan butang untuk **jejari terkecil yang memenuhi minimum**, apabila jejari itu muat. Apabila ia tidak muat, kotak menyatakannya dan memberi jejari terbesar yang dibenarkan oleh tangen, supaya anda tahu untuk mengalihkan PI atau menurunkan minimum.

## Alihkan PI pada pelan

1. Dengan {{ui:Pilih}} aktif, klik penjajaran untuk memilihnya. Pemegang segi empat sama muncul pada PInya.
2. Seret satu pemegang. Penjajaran, penomborannya, profil dan koridor mengikutinya.
3. Lepaskan. Pergerakan itu ialah satu langkah buat asal.

Menambah PI di antara dua yang sedia ada belum tersedia: buang penjajaran dan lukis semula, atau taip koordinat baharu bagi PI yang anda ada.

## Baca stesen dan ofset

Gerakkan penunjuk ke atas pelan. Bar status menunjukkan penjajaran terdekat (atau yang dipilih) dengan stesen dan ofset, **L** atau **R** dilihat ke arah stesen, contohnya "Penjajaran 1: Sta 2+15.30, ofset 18.42 R". Di luar mana-mana hujung, ia menambah "(di luar hujung)".

## Apa yang dilukis

Pada pelan, dalam DXF dan dalam PDF: garis tengah (tangen sebagai garisan, lengkung sebagai lengkok sebenar), satu tanda setiap 50 ft (20 m) dengan tanda yang lebih panjang dan label stesen setiap 100 unit, serta tanda PC dan PT dilabel dengan stesen mereka.

## Padam penjajaran

Pilih penjajaran dan tekan {{key:Delete}}, atau klik {{ui:Padam}} dalam bar alat atau di bahagian bawah panel kanan. Profil dan koridornya turut dipadam. {{key:Mod+Z}} mengembalikannya.

:::mac
Pada papan kekunci Mac, kekunci yang berlabel **delete** ialah {{key:Backspace}} kepada pelayar dan tidak memadam pilihan. Tekan {{key:Delete}} (Fn dan delete), atau gunakan butang {{ui:Padam}}.
:::

## Seterusnya

- [Reka bentuk profil menegak](topic:profile).
## Kelajuan dan kelas reka bentuk

Di bawah Sifat penjajaran, **Kelajuan reka bentuk** (km/h atau mph) dan **Kelas reka bentuk** disimpan bersama penjajaran, disimpan dalam projek dan ditulis ke IFC (Pset_RoadDesignCriteriaCommon). CivilCraft tiada jadual yang mengaitkan kelajuan dengan jejari minimum, jadi tiada apa yang disemak daripadanya: tetapkan **Jejari minimum** daripada piawaian reka bentuk anda sendiri.

## Spiral

Lengkung boleh mempunyai spiral klotoid di mana-mana hujung: tangen, spiral, lengkung, spiral, tangen. Dalam jadual PI, taip panjang dalam **Spiral masuk** dan **Spiral keluar** bagi PI yang mempunyai jejari. PI kekal di tempatnya; lengkung bergerak masuk untuk memberi ruang, jadi jarak tangen bertambah dengan ofset spiral. Kedua-dua panjang boleh berbeza, dan PI dengan hanya satu panjang mendapat spiral di hujung itu sahaja.

Senarai lengkung kemudian membaca TS, SC, CS dan ST (tangen ke spiral, spiral ke lengkung, lengkung ke spiral, spiral ke tangen) dengan sudut spiral θs, jarak tangen dan jarak luaran. Stesen berjalan sepanjang spiral seperti di tempat lain. Spiral yang bersama-sama memusingkan lebih daripada lengkung ditolak dengan PI dinamakan; spiral yang lebih panjang daripada yang dibenarkan oleh tangen ialah pertindihan, sama seperti mana-mana lengkung. Superelevasi menggunakan spiral sebagai larian keluarnya (lihat [Koridor](topic:corridor)).
