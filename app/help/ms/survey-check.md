---
title: Semak lukisan ukur semasa import
summary: Baca aras yang ditulis sebagai teks atau dalam atribut blok sebagai titik ukur, dan semak DWG atau DXF untuk unit yang salah, tiada sistem koordinat, asalan yang jauh, kontur rata, aras yang ganjil dan titik berganda sebelum anda membina tanah daripadanya.
keywords: semakan ukur, semakan import, aras ukur, aras titik, aras teks, aras sebagai teks, atribut, unit, sistem koordinat, jauh dari asalan, kontur pada sifar, titik terpencil, titik berganda, masalah, arkitek landskap, lukisan ukur
from: d46acd24
---

Lukisan ukur boleh kelihatan betul tetapi salah untuk sebuah tanah: unitnya mungkin ditebak, konturnya mungkin rata pada ketinggian 0, atau arasnya mungkin ditulis sebagai teks yang bukan geometri sama sekali. Bahagian **Aras ukur dan semakan** dalam dialog {{ui:Garisan}} (lihat [Buka DWG atau DXF sebagai garisan](topic:open-dwg-dxf)) membaca aras tersebut dan memberitahu anda apa yang kelihatan salah sebelum apa-apa ditambah.

## Aras ditulis sebagai teks atau dalam atribut

Banyak lukisan ukur memberi aras titik sebagai teks kecil di sebelah silang, seperti `104.37` atau `EL 104.37`, atau sebagai atribut bagi blok titik. Ini bukan garisan, maka pembaca garisan meninggalkannya. Bahagian ini menyenaraikan berapa banyak yang ditemui dan membenarkan anda mengambilnya sebagai **titik ukur**:

1. Tandakan **Ambil … aras sebagai titik ukur**. Ia tidak ditandakan pada mulanya, kerana tidak setiap nombor dalam lukisan ialah ketinggian.
2. Teks dibaca apabila ia ialah aras dengan sendirinya: nombor dengan bahagian perpuluhan (`104.37`, `+104,37`, `-3.50`), atau nombor selepas `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` atau `LEVEL`, dengan pilihan `m`, `ft` atau `'` selepasnya. Nombor bulat sahaja (`12`) dibaca sebagai nombor lot atau helaian, bukan aras; teks seperti `GATE 3` atau tarikh tidak pernah dibaca. Kod pemformatan teks diabaikan.
3. Bagi atribut blok, pilih **Atribut blok yang menyimpan aras**. CivilCraft mencari tag bernama ELEV, Z, LEVEL, RL atau yang serupa dengan sendirinya; pilih yang lain dari senarai jika lukisan menggunakan tag sendiri. Pilihan itu diingati untuk nama fail tersebut pada komputer ini, maka membukanya semula bermula dengan tag yang sama. Tag yang anda pilih menerima nombor bulat sebagai aras juga.
4. Klik {{ui:Tambah}}. Titik dinomborkan selepas nombor tertinggi dalam projek, setiap titik diterangkan dengan lapisannya (atau bloknya), dan ketinggian ditukar kepada unit projek seperti bahagian lain lukisan. Semua itu ialah satu langkah: {{key:Mod+Z}} mengalih titik-titik itu keluar.

Teks berada di titik sisipannya sendiri (atau titik penjajarannya apabila ada). Teks di dalam blok tidak dibaca, dan lukisan tidak pernah diubah.

## Semakan

Semakan berjalan pada apa yang anda akan bawa masuk dan menyenaraikan apa yang ditemuinya, satu baris untuk setiap jenis masalah:

| Ia berkata | Maksudnya |
|---|---|
| **Unit tidak dinyatakan** | Lukisan tidak menyatakan unitnya, maka nombornya dibaca sebagai unit projek. Semak satu jarak yang anda tahu. |
| **Unit ditukar** | Unit lukisan berbeza daripada projek dan diskala (nota, bukan kesalahan). |
| **Data merentang … km** atau **… m** | Lanjutannya lebih besar daripada 200 km atau lebih kecil daripada setengah meter, yang biasanya bermaksud unit yang salah (milimeter dibaca sebagai meter, atau sebaliknya). |
| **Tiada sistem koordinat** | Projek tiada. Ia ialah amaran apabila data terletak jauh dari sifar, seperti koordinat state plane atau grid kebangsaan. Lihat [Sistem koordinat](topic:coordinate-systems). |
| **Jauh dari asalan** | Data terletak lebih daripada 100 km dari sifar. Jauh dari sifar, paparan dan eksport 3D kehilangan ketepatan dan bergegar. |
| **Lapisan kontur … tiada ketinggian** | Lapisan yang dinamakan seperti kontur (TOPO, CONT, CNTR, CONTOUR) mengandungi garisan pada ketinggian 0, maka tanah yang dibina daripadanya akan rata. |
| **Aras tepat 0** | Sesetengah aras ialah 0 sedangkan aras biasa jauh daripadanya: mungkin ketinggian yang hilang. |
| **Aras jauh daripada yang lain** | Beberapa aras terletak jauh di luar yang lain (dikira terhadap tengah semua aras, maka tapak curam dengan julat lebar tidak ditandakan), atau melebihi 9,000 m atau kurang daripada -11,000 m. |
| **Titik di atas titik lain** | Dua titik di tempat yang sama dengan aras yang sama, atau dengan aras yang berbeza. |

Selepas anda klik {{ui:Tambah}}, baris yang sama dihantar ke **Masalah**, satu untuk setiap jenis, dengan nama fail, supaya anda boleh kembali kepadanya. Semakan menilai lukisan; ia tidak mengubah apa-apa di dalamnya, dan ia tidak menghalang anda daripada menggunakan lukisan itu.

:::tip
Apabila semakan berkata kontur rata pada 0 dan terdapat aras yang ditulis sebagai teks, ambil aras itu sebagai titik ukur: ia selalunya membawa ketinggian sebenar yang tiada pada garisan kontur.
:::

## Apa yang tidak disemak

Semakan tidak membandingkan lukisan dengan ukur kedua, dan ia tidak dapat mengenal pasti sistem koordinat lukisan itu: ia hanya memberitahu anda bahawa tiada yang ditetapkan.
