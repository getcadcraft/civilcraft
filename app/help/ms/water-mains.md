---
title: Paip utama air: tekanan, aliran dan aliran kebakaran
summary: Lukis rangkaian tekanan simpang, takungan, tangki, paip, pam dan injap kawal tekanan pada pelan; CivilCraft mengira ketinggian, tekanan dan aliran (Hazen–Williams, rangkaian gelung), aliran yang tersedia untuk kebakaran, dan satu hari permintaan. Ciri makmal; setiap hasil memerlukan semakan jurutera.
keywords: air, paip utama air, pengagihan air, rangkaian tekanan, paip tekanan, rangkaian gelung, hazen-williams, faktor C, kehilangan ketinggian, tekanan baki, aliran kebakaran, hidran, permintaan, simpang, takungan, tangki, pam, lengkung pam, injap kawal tekanan, prv, injap semak, tempoh lanjutan, epanet, inp, halaju
from: df46bf6d
---

Paip utama air ialah bahagian tekanan sesebuah tapak: paip yang sentiasa penuh, dengan air ditolak oleh takungan, tangki atau pam. CivilCraft mengira ketinggian dan tekanan di setiap simpang serta aliran dalam setiap paip, termasuk rangkaian gelung di mana air mempunyai lebih daripada satu laluan. Ia berada dalam makmal semasa ia disemak.

**Alat bantuan pengiraan sahaja.** Setiap nombor memerlukan semakan jurutera bertauliah: jawapannya hanya sebaik permintaan, ketinggian, saiz paip dan nilai kekasaran yang anda berikan, dan model keadaan mantap tidak tahu apa-apa tentang tukul air, kualiti air atau kelakuan sebenar pam kebakaran.

## Lukis rangkaian

1. Di bawah **Permukaan** › {{ui:Lagi}}, pilih {{ui:Paip utama air…}}. Tetingkap kekal terbuka semasa anda bekerja pada pelan.
2. Pilih {{ui:Takungan}} dan klik pada pelan di tempat bekalan. Ketinggiannya bermula 100 ft (30 m) di atas tanah; tukarkannya dalam Sifat.
3. Pilih {{ui:Simpang}} dan klik setiap tempat air ditarik atau paip bertemu. Simpang mengambil ketinggiannya daripada tanah; taip ketinggian lain dalam Sifat untuk menggantikannya.
4. Pilih {{ui:Paip}}, klik satu nod, kemudian nod yang disambungnya. Alat kekal aktif untuk paip seterusnya. {{ui:Pam}} dan {{ui:Injap kawal tekanan}} dilukis dengan cara yang sama, dari nod sedutan (atau hulu) ke nod hantaran (atau hilir). {{ui:Tangki}} diletakkan seperti simpang.
5. Pilih simpang dan taip {{ui:Permintaan}} (gpm, atau L/s dalam projek meter). Pilih paip dan tetapkan {{ui:Diameter}} (in, atau mm) dan, jika anda tahu, Hazen–Williams C-nya.

Setiap perubahan ialah satu langkah buat asal. Padam membuang nod dan paip yang berakhir padanya.

## Maksud setiap bahagian

- **Paip.** Panjangnya diukur sepanjang pelan melainkan anda menaipnya. C ialah kekasaran Hazen–Williams (130 sebagai permulaan, tukar nilai lalai dalam tetingkap). Pekali kehilangan kecil K menambah kehilangan lengkungan dan kelengkapan. Tanda **Injap semak** untuk paip yang tidak boleh membawa air ke belakang; paip **Ditutup** tidak membawa apa-apa.
- **Takungan.** Sumber pada ketinggian tetap, aras air yang dipegangnya di atas datum. Ia memberi atau mengambil apa sahaja yang diperlukan rangkaian.
- **Tangki.** Aras yang berubah sepanjang sehari. Dalam keputusan keadaan mantap ia ialah sumber pada aras semasanya.
- **Pam.** Satu titik reka bentuk (aliran dan ketinggian) memberikan lengkung biasa melaluinya: ketinggian pada aliran sifar ialah 133 % daripada ketinggian reka bentuk, dan ketinggian ialah sifar pada dua kali aliran reka bentuk. Pam tidak pernah menolak air ke belakang.
- **Injap kawal tekanan.** Mengekalkan tekanan yang anda tetapkan di hilir apabila bekalan lebih tinggi. Apabila bekalan lebih rendah ia terbuka dan tidak mengekalkan apa-apa; jika air akan mengalir ke belakang, ia tertutup.

## Baca hasil

Tetingkap memaparkan ketinggian dan tekanan setiap nod serta aliran, halaju dan kehilangan ketinggian setiap pautan bagi setiap 1,000 ft (atau setiap km), dengan simpang diwarnakan pada pelan: hijau ialah antara tekanan terendah dan tertinggi anda, merah di bawahnya, oren di atasnya. Anak panah aliran menunjukkan arah. Pilih nod atau paip untuk membaca nombornya dalam Sifat.

Di bawah jadual ialah senarai perkara yang perlu diperiksa: tekanan rendah atau tinggi, paip yang lebih laju daripada had anda, simpang yang terputus daripada semua sumber, atau penyelesai yang tidak menumpu. Penemuan yang sama terdapat dalam panel Masalah. Tetapkan had dalam tetingkap (20 psi, 100 psi dan 10 ft/s sebagai permulaan; 140 kPa, 700 kPa dan 3 m/s dalam projek meter).

## Aliran kebakaran

{{ui:Aliran kebakaran…}} melukis satu aliran pada satu simpang dan menunjukkan tekanan di sana serta tekanan terendah di mana-mana dalam rangkaian. Ia juga mencari aliran yang tersedia di simpang itu sementara nod terlemah dalam rangkaian mengekalkan tekanan baki yang anda berikan. Permintaan lain kekal seperti sediakala.

## Satu hari permintaan

{{ui:Satu hari permintaan…}} menjalankan rangkaian jam demi jam. Berikan corak permintaan dalam tetapan fail (senarai pengganda yang berulang); tangki diisi dan dikosongkan mengikut aliran masuk dan keluar, dan pam boleh mengikut corak hidup/mati. Tangki yang mencapai aras tertinggi atau terendahnya dinamakan dalam senarai: CivilCraft tidak menutup saluran masuk atau keluarnya untuk anda, jadi baca ia sebagai "tangki ini terlalu kecil atau pam terlalu besar".

## Teks EPANET

{{ui:Simpan sebagai teks EPANET (.inp)}} menulis rangkaian dalam format teks biasa yang dibaca oleh banyak program air, dan {{ui:Buka teks EPANET (.inp)…}} membaca satu fail. Hanya apa yang dimodelkan CivilCraft yang dibawa: simpang, takungan, tangki, paip, pam dengan lengkung ketinggian, injap kawal tekanan, corak permintaan dan masa. Jenis injap lain, pam yang diberikan mengikut kuasa, dan formula kehilangan ketinggian lain dinamakan dan ditinggalkan. Fail mesti menggunakan unit yang sama dengan projek.

## Hidran, injap dan kelengkapan

Pilih simpang dan tanda **Hidran** untuk meletakkan satu di situ; pilih paip utama dan tekan **Tambah di tengah** untuk meletakkan injap, injap udara, injap buang atau meter padanya. Ia adalah objek rangkaian: ia bergerak bersama rangkaian dan satu langkah buat asal membuangnya.

Susun atur itu juga membayangkan kelengkapan, dan CivilCraft menyenaraikannya tanpa diminta: **tee** di mana tiga paip utama bertemu, **silang** di mana empat bertemu, **lengkungan** (dengan sudutnya) di mana dua paip utama berpusing 5° atau lebih, **pengurang** di mana dua saiz bertemu, dan **penutup** di hujung buntu. {{ui:Jadual kelengkapan (CSV)}} mengira mereka dan paip utama mengikut saiz. Ini ialah apa yang tersirat oleh susun atur, satu pengambilan kuantiti untuk disemak dengan butiran anda sendiri, bukan senarai untuk dipesan.

Paip utama diletakkan pada tanah tolak penutup (4 ft atau 1.2 m) supaya ia boleh dilukis dan dimodelkan dalam 3D; tekanan di atas tidak bergantung padanya.

## Pada pelan dan dalam fail

Pelan, PDF dan DWG atau DXF membawa paip utama pada **C-WATR-MAIN** dengan saiznya pada **C-WATR-TEXT**, hidran pada **C-WATR-HYDR**, injap pada **C-WATR-VALV** dan kelengkapan pada **C-WATR-FITT**. LandXML keluar menulis rangkaian paip air (struktur untuk setiap nod, paip untuk setiap paip utama, hidran dinamakan); LandXML masuk membacanya semula sebagai paip utama air, tanpa permintaan, pam atau injap, yang tidak dibawa oleh LandXML. Eksport IFC menulis paip utama sebagai segmen paip, hidran, injap dan kelengkapan dalam satu sistem air. Fail ini telah disemak dengan pembaca dan penulis kami sendiri; cubalah dalam program lain anda dan beritahu kami apa yang dikatakannya.

## Apa yang belum ada lagi

Kualiti dan umur air, kawalan dan peraturan melangkaui corak hidup/mati pam, jenis injap lain, permintaan mengikut tekanan, paip dengan diameter yang berubah, dan aliran kumbahan dari semasa ke semasa. Lihat [Belum dibina](topic:not-built-yet). Aliran reka bentuk saniter, yang merupakan pengiraan yang berbeza, terdapat dalam [Aliran reka bentuk saniter](topic:sanitary-design).
