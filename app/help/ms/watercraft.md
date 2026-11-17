---
title: WaterCraft: permintaan, aliran kebakaran, gangguan dan umur air
summary: Dengan add-on WaterCraft, tukar pelanggan kepada permintaan pada paip utama air anda, semak aliran yang ada di setiap hidran, lihat gangguan paip utama mana yang paling memberi kesan, dan ikuti umur air dan klorin sepanjang hari.
keywords: watercraft, pengagihan air, permintaan, pelanggan, faktor puncak, corak permintaan, aliran kebakaran, hidran, tekanan baki, kekritikalan, gangguan, seksyen berinjap, umur air, klorin, baki, pengesanan sumber, hujung buntu, csv, add-on
from: 76809f01
---

WaterCraft ialah add-on yang berfungsi pada rangkaian air yang anda sudah lukis dengan alatan Paip utama air. Ia menambah satu tab pada panel sebelah kanan dengan empat bahagian.

:::warning
Alat bantu pengiraan sahaja. Ia disemak dengan jawapan manual pada rangkaian rekaan, bukan pada model utiliti sebenar. Seorang jurutera air mesti menyemak setiap keputusan. Tiada stesen penguat, tiada reputan tertib kedua dan belum ada senario.
:::

## Apa yang anda akan lakukan

- Letakkan pelanggan pada rangkaian sebagai permintaan.
- Cari hidran yang tidak mencapai aliran yang anda perlukan.
- Cari paip utama yang kehilangannya paling penting.
- Cari air lama dan klorin rendah.

## Langkah

1. Buka {{ui:Tetapan}} › {{ui:Add-on}} dan hidupkan {{ui:WaterCraft (pengagihan air)}}. Tab {{ui:WaterCraft}} muncul dalam panel sebelah kanan.
2. Lukis takungan, simpang dan paip dengan alatan Paip utama air dahulu (lihat [Paip utama air](topic:water-mains)). Tanpa rangkaian, tab akan memberitahu anda untuk berbuat demikian.
3. Di bawah {{ui:Permintaan}}, tampal satu pelanggan setiap baris: id, x, y, jenis, amaun. Pilih {{ui:Faktor puncak}} dan {{ui:Corak setiap jam}} (hari kediaman, hari komersial, rata, atau kekalkan corak seperti sedia ada). Tekan {{ui:Semak}} untuk melihat di mana setiap pelanggan jatuh (simpang terdekat), kemudian {{ui:Masukkan ke dalam rangkaian}}. Buat asal mengembalikan permintaan.
4. Di bawah {{ui:Aliran kebakaran}}, tetapkan aliran yang diperlukan dan tekanan baki, pilih sama ada baki dikekalkan {{ui:Pada hidran sahaja}} atau {{ui:Di mana-mana dalam sistem (lebih ketat)}}, dan tekan {{ui:Larian}}. Setiap hidran disenaraikan dengan yang paling teruk dahulu, sebagai memenuhi atau kurang.
5. Di bawah {{ui:Paip utama mana yang paling penting}}, pilih {{ui:satu paip pada satu masa}} atau {{ui:satu seksyen berinjap pada satu masa}} dan tekan {{ui:Larian}}. Setiap gangguan menunjukkan permintaan yang terputus, simpang yang terputus, simpang yang baru berada di bawah tekanan minimum dan tekanan terendah yang tinggal.
6. Di bawah {{ui:Umur air dan klorin}}, pilih apa yang hendak diikuti (umur air, klorin atau pengesanan sumber), tetapkan bilangan jam untuk dijalankan dan had yang anda mahu, dan tekan {{ui:Larian}}. Simpang di luar had anda disenaraikan.
7. Tekan {{ui:Simpan sebagai CSV}} di bawah mana-mana jadual untuk menyimpannya.

## Nota

- Aliran kebakaran yang diperlukan dan penggunaan setiap rumah atau setiap acre ialah nilai permulaan, bukan piawaian. Gunakan angka utiliti anda sendiri.
- Paip yang dipotong sebahagiannya oleh injap ditutup sepenuhnya, jadi gangguan yang ditunjukkan sedikit lebih teruk daripada yang sebenar.
- Jalankan bahagian kualiti air cukup lama supaya corak harian berulang sebelum anda membaca hari terakhir.
- {{ui:Henti}} menamatkan larian panjang lebih awal; senarai kemudian hanya menunjukkan apa yang sempat dilakukan.
- Rangkaian anda kekal dalam projek ini dan pada komputer ini. Tiada apa-apa dihantar ke mana-mana.
