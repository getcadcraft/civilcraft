---
title: Semak eksport IFC terhadap IDS pelanggan
summary: Muatkan fail .ids yang diberikan oleh pelanggan atau pihak berkuasa jalan kepada anda dan lihat setiap elemen yang dieksport yang tidak memenuhinya dalam Masalah.
keywords: ids, spesifikasi penyampaian maklumat, buildingsmart, keperluan, penyerahan, semakan, pengesahan, qa, eksport ifc, ifc 4.3, penjajaran, jalan, perolehan
from: 183d9a0e
---

## Apa yang akan anda lakukan

IDS (Information Delivery Specification, piawaian buildingSMART) ialah senarai apa yang mesti ada dalam IFC. Perolehan awam selalunya menghantar satu bersama kerja. CivilCraft menyemak IFC yang projek ini eksport, dalam versi IFC yang anda pilih untuk eksport, terhadapnya dan menyenaraikan setiap elemen yang tidak mencukupi.

## Langkah

1. Buka projek anda.
2. Klik {{ui:IFC}} dalam kumpulan Eksport pada bar alat. Dalam kotak dialog, pilih versi IFC yang akan anda serahkan.
3. Klik {{ui:Semak dengan IDS…}}.
4. Klik {{ui:Muatkan fail .ids…}} dan pilih fail. Tiada apa dimuat naik.
5. Baca hasilnya: setiap spesifikasi dengan {{ui:Lulus}} atau {{ui:Gagal}} dan berapa banyak elemen ia terpakai.
6. Buka Masalah ({{key:Ctrl+Shift+M}}) dan klik satu kegagalan untuk memilih penjajaran, pelantar, paip, struktur atau jisim bangunan yang menjadi asalnya.

## Apa yang sepatutnya anda lihat

- Satu amaran bagi setiap elemen yang dieksport dan keperluan yang dilanggarnya, dengan nama spesifikasi, apa yang diminta oleh IDS dan apa yang ada dalam eksport.
- Laporan semakan (dalam Masalah) bermula dengan IDS: tajuk, versi, pengarang dan bilangan setiap spesifikasi.

## Perkara yang baik untuk diketahui

- IDS disimpan dalam fail projek, jadi ia disemak semula apabila anda membuka projek. Memuatkan atau melupakannya ialah satu langkah yang boleh anda buat asal.
- Setiap perubahan disemak semula sebentar kemudian. Permukaan besar mengambil masa lebih lama untuk ditulis, jadi semakan itu menunggu sedikit lebih lama antara setiap larian.
- Semakan menggunakan fail yang sama dengan yang ditulis oleh eksport {{ui:IFC}}, dalam versi yang terakhir dipilih di sana (IFC 4.3 jika anda belum memilih).
- Nombor dibandingkan dalam unit SI: projek dalam kaki ditukar kepada meter dahulu.
- Corak dalam IDS dibaca sebagai keseluruhan nilai. `^` di permulaan dan `$` di hujung juga diambil sebagai "keseluruhan nilai", seperti yang dimaksudkan oleh kebanyakan fail IDS.

## Seterusnya

- [Eksport IFC](topic:ifc)
