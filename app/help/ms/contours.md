---
title: Baca kontur, aras dan cerun
summary: Tetapkan sela kontur dan kontur utama, tunjukkan jalur aras, anak panah cerun dan segi tiga, serta baca aras tanah di bawah penunjuk.
keywords: kontur, sela kontur, kontur utama, label, jalur aras, anak panah cerun, segi tiga, aras titik, analisis permukaan, analisis aras, analisis cerun
from: 585e500a
---

Permukaan ditunjukkan dengan kontur sebaik sahaja ia wujud. Semua yang terkandung dalam topik ini ditetapkan di bawah **Paparan** dalam panel kiri. Tetapan paparan hanya mengubah apa yang anda lihat (dan apa yang anda eksport); ia bukan langkah buat asal.

## Tetapkan sela kontur

1. Di bawah **Paparan**, pilih nilai dalam **Kontur setiap**.
   - Dalam kaki: 0.25, 0.5, 1, 2, 5, 10 atau 20 ft.
   - Dalam meter: 0.1, 0.25, 0.5, 1, 2, 5 atau 10 m.
2. Pilih **Utama setiap**: kontur ke-2, ke-4, ke-5 atau ke-10.
   Kontur utama dilukis lebih tebal dan dilabel dengan arasnya. Ia jatuh pada gandaan penuh jarak utama (dengan kontur 1 ft dan setiap kontur utama ke-5: 245, 250, 255 …).
3. Matikan {{ui:Label kontur}} jika label menyesakkan pelan yang kecil.

Projek baharu bermula pada 1 unit dengan setiap kontur ke-5 sebagai kontur utama. Kontur melengkung pada garis putus; jika ia memotong lurus merentasi garisan aliran atau rabung, garisan itu belum menjadi garis putus (lihat [Bina dan perhalusi permukaan](topic:build-surface)).

:::note
Kontur hanya dilukis apabila tidak lebih daripada 2,000 aras antara titik terendah dan tertinggi. Pada tapak yang mempunyai beza ketinggian yang besar dan sela yang sangat kecil, pelan tidak menunjukkan sebarang kontur: pilih sela yang lebih besar.
:::

## Lancarkan kontur

Kontur dikesan sebagai bahagian lurus, satu merentasi setiap segi tiga permukaan, jadi ia membelok sedikit pada setiap tepi segi tiga. **Pelicinan kontur** di bawah **Paparan** membundarkan selekoh ini:

- **Tiada (bahagian lurus)**: garisan yang dikesan seperti sedia ada. Ini yang ditunjukkan oleh lukisan baharu atau lama.
- **Ringan**: selekoh dibundarkan sedikit. Garisan tidak pernah bergerak lebih daripada 10% ke arah kontur seterusnya, dan tidak pernah lebih jauh daripada bahagian lurusnya sejauh satu perenam panjang bahagian itu.
- **Kuat**: lengkung mengalir. Garisan tidak pernah bergerak lebih daripada 25% ke arah kontur seterusnya, dan tidak pernah lebih jauh daripada bahagian lurusnya sejauh satu pertiga panjang bahagian itu.

Dengan mana-mana pilihan, kontur yang dilicinkan masih merentasi setiap tepi segi tiga pada titik yang sama seperti kontur yang dikesan, kekal di dalam segi tiga yang direntasi oleh setiap bahagian, dan oleh itu tidak akan pernah bersilang atau menyentuh kontur lain. Di tempat kontur merentasi garis putus atau sempadan, ia mengekalkan selekohnya yang tajam. Garisan yang dilicinkan ialah garisan yang diplot dan dieksport (DXF, DWG, PDF, GIS dan 3D), dengan lebih banyak bucu berbanding garisan yang dikesan.

Pelicinan hanya mengubah garisan yang dilukis. Aras, isipadu, profil dan keratan masih dibaca daripada permukaan itu sendiri. Kontur yang melalui tepat titik ukur (titik pada 250.00 pada kontur 250) mengekalkan selekoh kecil pada setiap titik sedemikian.

## Cara permukaan di sebalik kontur dibuat

Kontur mengikut permukaan, dan permukaan mengikut **Kaedah kontur** di bawah **Permukaan** dalam panel kiri. Lalai, **Triangulasi dengan interpolasi linear**, menyambungkan titik anda menjadi segi tiga dan mengekalkan setiap titik dan garis putus dengan tepat. Kaedah lain memasang grid sekata pada titik dahulu (kriging, minimum curvature, natural neighbor, inverse distance dan lain-lain), yang memberi kontur yang lebih bulat antara titik tetapi tidak melalui setiap titik dengan tepat; laporan permukaan di bawah **Permukaan** menyatakan sejauh mana hasilnya menyimpang pada titik anda.

**ABOS (anggaran berasaskan pelicinan)** ialah salah satu kaedah berasaskan grid. Ia mempunyai dua tetapan sendiri: **Kelicinan** (0.5 untuk bermula; semakin rendah semakin licin) dan **Ketepatan** (1 untuk bermula: permukaan dibawa ke dalam lingkungan 1% daripada julat ketinggian tapak pada titik anda; taip nombor yang lebih kecil untuk padanan yang lebih rapat). Jika ia tidak dapat mencapai ketepatan pada grid yang ada, laporan permukaan menyatakannya: taip **Jarak grid** yang lebih kecil.

## Baca aras di mana-mana

Gerakkan penunjuk ke atas pelan. Bar status menunjukkan:

- **E** dan **N** di bawah penunjuk
- **Tanah** dan aras tanah sedia ada di situ, diinterpolasi pada segi tiga di bawah penunjuk
- **Diratakan** dan aras yang dicadangkan, di tempat pelantar atau koridor telah mengubah tanah
- "Off the surface" di luar permukaan

Untuk membaca titik ukur dengan tepat, pilih {{ui:Pilih}} dan klik titik itu: panel kanan menunjukkan nombornya, easting, northing, aras, huraian dan kumpulannya.

## Tunjukkan jalur aras

1. Tandakan {{ui:Jalur aras}}.
   Permukaan diisi dengan warna dari rendah (biru-hijau) ke tinggi (oker-perang). Petunjuk di bawah kotak semak menyenaraikan julat aras setiap jalur.
2. Pilih berapa banyak jalur dalam **Jalur**: 5, 8, 10 atau 12. Jalur membahagikan julat dari aras terendah ke aras tertinggi kepada langkah yang sama.

Jalur hanya untuk tontonan. Ia tidak dieksport ke DXF atau diplot ke PDF.

## Tunjukkan anak panah cerun

Tandakan {{ui:Anak panah cerun}}. Anak panah pendek pada setiap segi tiga yang cukup besar untuk memuatnya menunjuk ke bawah bukit. Segi tiga rata tidak mendapat anak panah. Anak panah ialah semakan pantas untuk arah saliran; nilai cerun itu sendiri belum dilabel.

## Tunjukkan segi tiga, titik dan tepi

- {{ui:Segi tiga}} melukis tepi TIN. Hidupkannya untuk menyemak cara permukaan menyambung titik, terutamanya sepanjang garis putus dan di bahagian luar.
- {{ui:Titik}} melukis setiap titik ukur; {{ui:Label titik}} menambah nombor, aras dan huraiannya (atau kurang: lihat **Label titik** dalam [Tetapan CivilCraft](topic:settings)).
- {{ui:Garis putus}} melukis garis putus (dan sempadan) dalam warna jingga.
- {{ui:Tepi permukaan}} melukis garis luar permukaan.

## Sedia ada atau dicadangkan

Sebaik sahaja pelantar atau koridor meratakan tanpa masalah, **Permukaan** di bawah **Paparan** menawarkan {{ui:Dicadangkan (diratakan)}}. Kontur, jalur dan anak panah kemudian menunjukkan permukaan yang telah diratakan, supaya anda dapat melihat tanah baharu dan persilangan cerun di sekelilingnya. Tukar kembali kepada {{ui:Tanah sedia ada}} untuk melihat tinjauan.

## Apa yang dieksport

Output DXF dan PDF mengikut tetapan ini: apa yang anda matikan tidak ditulis, dan kontur ialah kontur permukaan yang ditunjukkan. Jalur aras tidak pernah dieksport.
