---
title: WaterCraft: permintaan, aliran kebakaran, gangguan dan usia air
summary: Dengan add-on WaterCraft, tukar pelanggan kepada permintaan pada paip utama air anda, semak aliran yang ada di setiap hidran, lihat gangguan paip utama mana yang paling memudaratkan, dan ikuti usia air serta klorin sepanjang sehari.
keywords: watercraft, pengagihan air, permintaan, pelanggan, faktor puncak, corak permintaan, aliran kebakaran, hidran, tekanan baki, kekritikalan, gangguan, seksyen berinjap, usia air, klorin, baki, jejak sumber, hujung buntu, csv, add-on
from: 066fb17a
---

WaterCraft ialah add-on yang berfungsi pada rangkaian air yang telah anda lukis dengan alatan Paip utama air. Ia menambah satu tab pada panel kanan dengan empat bahagian.

:::warning
Alat pengiraan semata-mata. Ia disemak dengan jawapan tangan pada rangkaian rekaan, bukan pada model utiliti sebenar. Seorang jurutera air mesti menyemak setiap keputusan. Senario, peraturan kawalan, injap dan bacaan lapangan mempunyai topiknya sendiri, "Senario" dan "Kajian", dalam bantuan add-on WaterCraft.
:::

## Apa yang akan anda lakukan

- Letakkan pelanggan pada rangkaian sebagai permintaan.
- Cari hidran yang kekurangan aliran yang anda perlukan.
- Cari paip utama yang kehilangannya paling penting.
- Cari air lama dan klorin rendah.

## Langkah

1. Buka {{ui:Tetapan}} › {{ui:Add-on}} dan hidupkan {{ui:WaterCraft (pengagihan air)}}. Tab {{ui:WaterCraft}} muncul dalam panel kanan.
2. Lukis takungan, nod dan paip dengan alatan Paip utama air dahulu (lihat [Paip utama air](topic:water-mains)). Tanpa rangkaian, tab memberitahu anda untuk berbuat demikian.
3. Di bawah {{ui:Permintaan}}, tampal satu pelanggan setiap baris: id, x, y, jenis, jumlah. Pilih {{ui:Faktor puncak}} dan {{ui:Corak setiap jam}} (hari kediaman, hari komersial, rata, atau kekalkan corak seperti sedia ada). Tekan {{ui:Semak}} untuk melihat di mana setiap pelanggan jatuh (nod terdekat), kemudian {{ui:Masukkan ke dalam rangkaian}}. Buat asal menarik balik permintaan.
4. Di bawah {{ui:Aliran kebakaran}}, tetapkan aliran yang diperlukan dan tekanan baki, pilih sama ada baki dikekalkan {{ui:Pada hidran sahaja}} atau {{ui:Di seluruh sistem (lebih ketat)}}, dan tekan {{ui:Larian}}. Setiap hidran disenaraikan paling teruk dahulu, sebagai memenuhi atau kurang.
5. Di bawah {{ui:Paip utama yang paling penting}}, pilih {{ui:satu paip pada satu masa}} atau {{ui:satu seksyen berinjap pada satu masa}} dan tekan {{ui:Larian}}. Setiap gangguan menunjukkan permintaan yang terputus, nod yang terputus, nod yang baharu berada di bawah tekanan minimum dan tekanan terendah yang tinggal.
6. Di bawah {{ui:Usia air dan klorin}}, pilih apa yang hendak diikuti (usia air, klorin atau jejak sumber), tetapkan jam untuk dijalankan dan had yang anda mahu, dan tekan {{ui:Larian}}. Nod di luar had anda disenaraikan.
7. Tekan {{ui:Simpan sebagai CSV}} di bawah mana-mana jadual untuk menyimpannya.

## Nota

- Aliran kebakaran yang diperlukan dan penggunaan setiap rumah atau setiap ekar ialah nilai permulaan, bukan piawaian. Gunakan angka utiliti anda sendiri.
- Paip yang dipotong sebahagiannya oleh injap ditutup sepenuhnya, jadi gangguan yang ditunjukkan sedikit lebih teruk daripada yang sebenar.
- Jalankan bahagian kualiti air cukup lama supaya corak harian berulang sebelum anda membaca hari terakhir.
- {{ui:Henti}} menamatkan larian panjang lebih awal; senarai kemudian hanya menunjukkan apa yang telah dilakukan.
- Rangkaian anda kekal dalam projek ini dan pada komputer ini. Tiada apa-apa dihantar ke mana-mana.
