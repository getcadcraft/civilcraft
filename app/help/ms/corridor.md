---
title: Sapu koridor jalan
summary: Hidupkan koridor untuk penjajaran, tetapkan nilai lorong, bahu dan cerun sisi, dan baca keratan, garisan persilangan cerun serta kerja tanah yang dihasilkannya.
keywords: superelevasi, super, pengecondongan, runoff, runout, jadual kadar, cerun silang, putaran, koridor, himpunan, subhimpunan, keratan jenis, jalan, lorong, bahu, cerun silang, cerun sisi, persilangan cerun, potongan, tambakan, keratan, sasaran, sasaran lebar, sasaran aras, sasaran ofset, pelebaran, tepi turapan, ikut koridor lain
from: 91303189
---

Koridor menyapu satu keratan jenis yang ringkas (himpunan) sepanjang penjajaran dan profil reka bentuknya, meratakannya ke dalam tanah sedia ada dan menambahkan hasilnya pada permukaan yang dicadangkan. Satu penjajaran boleh membawa beberapa koridor pada julat stesen yang berbeza, dan koridor boleh dibina daripada templat yang boleh digunakan semula mengikut stesen ([Templat koridor](topic:corridor-templates)). Himpunan ringkas di bawah adalah sama pada kedua-dua sisi; untuk memberi setiap sisi bahagiannya sendiri, lihat [Bina setiap sisi daripada bahagian](topic:corridor#build-each-side-from-parts).

## Himpunan

Dari paksi tengah ke luar, pada setiap sisi:

1. **lorong** dengan lebar tertentu, menurun dari mahkota pada **cerun lorong**
2. **bahu** dengan lebar tertentu pada **cerun bahu**
3. **cerun sisi** dari tepi bahu hingga ia bertemu tanah: **cerun potongan** di mana tanah berada di atas, dan **cerun tambakan** di mana ia berada di bawah

Nilai permulaan ialah tempat letak, bukan piawaian reka bentuk:

| Nilai | Kaki AS | Meter |
|---|---|---|
| Lebar lorong | 12 ft | 3.6 m |
| Cerun lorong | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Cerun bahu | 4% | 4% |
| Cerun potongan | 2 : 1 | 2 : 1 |
| Cerun tambakan | 3 : 1 | 3 : 1 |
| Keratan setiap | 10 ft | 5 m |

Cerun untuk cerun sisi ialah mendatar kepada menegak (H:V): 3 : 1 bermaksud 3 merentas untuk 1 menurun.

## Bina koridor

Anda memerlukan penjajaran tanpa ralat dan profil reka bentuk dengan sekurang-kurangnya dua PVI dan tanpa ralat.

1. Pilih penjajaran.
2. Di panel kanan, di bawah **Koridor**, tandakan **Sapu himpunan sepanjang profil reka bentuk**.
   Medan muncul dan koridor dibina serta-merta. Pelan menunjukkan tepi lorong dan bahu serta garisan persilangan cerun; dengan {{ui:Dicadangkan (diratakan)}} dipilih di bawah **Paparan**, kontur menunjukkan tanah baharu.
3. Tukar mana-mana nilai: **Lebar lorong**, **Cerun lorong**, **Lebar bahu**, **Cerun bahu**, **Cerun potongan**, **Cerun tambakan**, **Keratan setiap**. Tekan {{key:Enter}} selepas setiap satu. Potongan, tambakan dan jarak keratan mesti lebih daripada 0.
4. Baca baris di bawah medan, contohnya "39 sections from 0+00.00 to 3+86.36; cut 240.2 cu yd, fill 556.0 cu yd." (39 keratan dari 0+00.00 hingga 3+86.36; potongan 240.2 cu yd, tambakan 556.0 cu yd.)

Keratan dipotong pada setiap langkah **Keratan setiap**, pada hujung, dan pada permulaan serta penghujung setiap lengkung mengufuk dan menegak. Setiap keratan dan garisan melaluinya (paksi tengah, tepi lorong dan bahu, persilangan cerun) menjadi garis putus bagi permukaan yang dicadangkan.

Untuk mematikan koridor, nyahtanda kotak. Nilainya disimpan untuk kali seterusnya.

## Apabila ia tidak dibina

Kotak merah di bawah medan menyatakan sebabnya:

| Mesej | Apa yang perlu dibuat |
|---|---|
| "Koridor memerlukan profil reka bentuk tanpa ralat." | Tambah PVI, atau betulkan lengkung menegak yang bertindih (lihat [Reka bentuk profil menegak](topic:profile)). |
| "Profil reka bentuk tidak bertindih dengan penjajaran." | Alih PVI ke julat stesen penjajaran. |
| "Koridor memerlukan sekurang-kurangnya dua keratan pada permukaan." | Kebanyakan koridor berada di luar tanah sedia ada. |
| "4 cerun sisi terkeluar dari permukaan sebelum bertemu tanah." | Berhampiran tepi permukaan, cerun tidak dapat mencapai tanah. Jauhkan jalan dari tepi, atau rendahkan ketinggian tambakan atau potongan di situ. |
| "Garisan persilangan cerun koridor bersilang (keratan bertindih, sebagai contoh di bahagian dalam lengkung yang ketat). Gunakan jejari yang lebih besar atau himpunan yang lebih sempit." | Keratan di bahagian dalam lengkung tajam bertindih. Tingkatkan jejari atau sempitkan himpunan. |

Koridor yang bermasalah tidak diratakan ke dalam dan tidak dikira dalam kerja tanah.

## Koridor dan pelantar bersama

Permukaan yang dicadangkan dibina mengikut tertib: setiap koridor dahulu, kemudian setiap pelantar. Di mana perataan pelantar bertindih dengan koridor, pelantar menang. Isipadu dikira di dalam semua garisan persilangan cerun bersama; lihat [Isipadu kerja tanah](topic:volumes).

## Superelevasi

Melalui lengkung, jalan boleh condong ke arah dalam, supaya trafik ditolak kurang ke luar. Tandakan **Superelevasikan lengkung** di bawah **Superelevasi** dalam **Sifat** penjajaran:

- Setiap lengkung bulatan mengambil kadar **e** daripada jadual kadar: baris pertama yang jejarinya dicapai lengkung (baris dengan kadar kosong mengekalkan mahkota normal). Jadual dan **Kecerunan relatif maksimum** (0.5% untuk bermula) ialah tempat letak, bukan piawaian: tetapkan daripada kriteria reka bentuk anda sendiri. Tambah atau alih baris mengikut keperluan.
- Lorong berputar tentang paksi tengah. Sebelum lengkung, lorong luar rata melalui **runout** (mahkota normal ÷ e × runoff), kemudian melalui **runoff** (lebar lorong × e ÷ kecerunan) lorong luar terus berputar sehingga seluruh jalan condong pada e ke arah dalam; dua pertiga daripada runoff terletak sebelum lengkung dan satu pertiga padanya. Selepas lengkung, perkara yang sama berlaku secara terbalik.
- Bahu di sisi rendah tidak pernah lebih rata daripada lorongnya; di sisi tinggi ia mengekalkan cerunnya sendiri (ia bergulung).
- Jadual di bawahnya menyenaraikan jejari, kadar, runoff dan runout setiap lengkung dan di mana superelevasi penuh bermula dan berakhir. **Rajah superelevasi** melukis cerun silang kedua-dua lorong sepanjang stesen (lorong kiri pepejal, lorong kanan putus-putus).
- Lengkung yang terlalu pendek untuk mencapai superelevasi penuh, atau dua lengkung yang peralihannya bertindih, dinyatakan dalam kotak di atas jadual.

Keratan, isipadu, pandangan 3D dan helaian semuanya menunjukkan jalan yang condong. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membatalkannya.

## Sasaran

Sasaran mengalihkan satu titik pada satu sisi jalan ke garisan: **Tepi turapan** atau **Tepi bahu**, pada **Kiri** atau **Kanan**. Setiap keratan bertemu garisan itu tegak lurus kepada paksi tengah, hanya keluar pada sisi itu, jadi sasaran di sebelah kanan tidak pernah mengalihkan sisi kiri.

| Menetapkan | Apa yang berlaku di tempat keratan bertemu garisan |
|---|---|
| **Lebar** | Titik terletak pada garisan: lorong (atau bahu) melebar atau menyempit ke situ, dengan mengekalkan cerun silangnya. |
| **Aras** | Titik mengambil aras garisan di situ, pada ofsetnya sendiri: cerun silang lorong (atau bahu) mengikutinya. |

Garisan itu boleh menjadi garisan ciri (apa jua **Guna**nya) atau garisan koridor lain: paksi tengahnya, tepi turapan, tepi bahu atau garisan persilangan cerun. Garisan koridor mengikut koridor itu: ubah jalan yang lain dan yang ini mengikut. CivilCraft membina koridor lain dahulu; dua koridor yang akan menyasarkan satu sama lain dalam gelung ditolak di satu pihak, dan jadual menyatakan yang mana.

1. Pilih penjajaran dan hidupkan koridornya.
2. Di bawah **Sasaran**, klik {{ui:Tambah sasaran}}.
3. Pilih **Sisi**, **Titik**, apa yang **Ditetapkan** dan **Ke garisan**. Setiap perubahan ialah satu langkah buat asal.

**Hasil** menyatakan pada berapa banyak keratan garisan itu dicapai. Keratan yang tidak mencapainya (melepasi hujungnya, atau di tempat ia berada di belakang paksi tengah) mengekalkan nilai himpunan. Garisan yang dipadam meninggalkan koridor seperti sebelum sasaran, dan jadual menyatakannya. Satu sisi boleh mempunyai satu sasaran lebar dan satu sasaran aras bagi setiap titik.

## Bina setiap sisi daripada bahagian

Hidupkan **Bina setiap sisi daripada bahagian** di bawah tetapan koridor. Setiap sisi kemudian mempunyai senarainya sendiri, dari paksi tengah ke luar: lorong, bahu, longkang, kerb, jalur tanaman, kaki lima dan, akhir sekali, cerun sisi ke tanah (dengan nisbah potongan dan tambakannya sendiri). Mulakan dari {{ui:Jalan luar bandar}} atau {{ui:Jalan bandar}}, tambah dan buang bahagian, alihkannya dengan anak panah, dan {{ui:Salin}} satu sisi ke sisi yang lain. Setiap perubahan ialah satu langkah buat asal.

Cerun silang ialah kejatuhan menjauhi jalan, jadi kaki lima yang mengalir ke arah jalan adalah negatif. Kerb ialah muka dengan ketinggian yang anda beri, bahagian atas dengan lebar yang anda beri dan titisan pilihan di belakang. Superelevasi memutar setiap lorong dalam baris pertama; longkang, kerb, jalur dan kaki lima tergantung dari tepi lorong seperti yang dibina. Sasaran masih menggerakkan hujung lorong dan bahagian terakhir. Keratan rentas menanda garis aliran longkang, bahagian atas dan belakang kerb, dan selebihnya. Pada lengkung dengan spiral, runoff ialah spiral: mahkota rata pada TS, superelevasi penuh pada SC.

## Lapisan turapan

Lorong, bahu, longkang, jalur tanaman atau kaki lima boleh membawa binaannya: di bawah bahagian, {{ui:Tambah lapisan}} menambah lapisan dengan nama, bahan, ketebalan dan jenisnya (permukaan, pengikat, asas, subasas, penutup atau lain-lain), dari atas ke bawah. Lapisan tidak mengalihkan permukaan jalan (atasnya ialah permukaan reka bentuk); setiap satu terletak di bawah bahagiannya, kedalamannya diukur lurus ke bawah. Keratan rentas melukis dasar setiap lapisan sebagai garis putus-putus, dan {{ui:Lapisan turapan: kuantiti}} menyenaraikan luas pelan dan isipadu setiap lapisan (luas sepanjang koridor dari keratannya, isipadu = luas × ketebalan). Eksport IFC menulis setiap lapisan sebagai elemennya sendiri dengan ketebalan dan bahannya (lihat [Eksport dan import IFC](topic:ifc)). Ketebalan yang anda taip ialah pilihan anda: CivilCraft tidak menentukan saiz turapan.

## Apa yang belum dibina

Sasaran untuk cerun persilangan belum tersedia. Untuk koridor yang berubah sepanjang jalan, dengan kiri dan kanan diasingkan, gunakan [Templat koridor](topic:corridor-templates). Lihat [Belum dibina](topic:not-built-yet).
