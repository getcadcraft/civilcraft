---
title: Rupa bumi daripada garisan kontur
summary: Bina permukaan tanah daripada peta kontur: pilih lapisan garisan, nyatakan dari mana ketinggian setiap garisan datang, semak silang dan pendua, dan bina. Garisan kontur menjadi garisan putus, dengan segi tiga rata pada rabung dan lembah dibetulkan. Peta yang disalin daripada gambar atau PDF boleh diskala dan diletakkan melalui dua titik yang diketahui.
keywords: kontur, garisan kontur, rupa bumi daripada kontur, permukaan daripada kontur, peta topografi, peta ukur, tiada koordinat, garisan putus, segi tiga rata, rabung, lembah, puncak bukit, silang kontur, kontur pendua, sela kontur, skala peta, dua titik, letak peta, DXF, DWG, shapefile
from: e6161653
---

Juruukur kadangkala menghantar peta kontur: garisan dengan ketinggian, tetapi tiada titik. CivilCraft membina tanah sedia ada daripada garisan tersebut.

## Bawa masuk kontur

Buka peta sebagai garisan: lukisan DXF atau DWG, shapefile atau GeoJSON (**GIS** › {{ui:Import}}, atau lepaskan fail pada pelan). Garisan masuk sebagai **lapisan peta**. Di bawah **Permukaan** › {{ui:Lagi}}, pilih {{ui:Rupa bumi daripada kontur}}.

## Nyatakan dari mana setiap ketinggian datang

Tandakan lapisan yang memegang kontur, kemudian pilih **Ketinggian daripada**:

- {{ui:Aras garisan itu sendiri}}: garisan yang setiap verteksnya mempunyai ketinggian yang sama (poligaris 3D, atau poligaris dengan ketinggian). Garisan pada 0 ialah garisan pelan dan tiada aras.
- Medan nombor lapisan (contohnya ELEV), apabila peta datang dengan satu.
- {{ui:Aras mula dan sela, mengikut susunan garisan disenaraikan}}: untuk garisan yang tiada ketinggian langsung. Garisan pertama yang disenaraikan mendapat **Ketinggian garisan pertama**, yang seterusnya ialah itu tambah **Sela kontur**, dan seterusnya. Senaraikan garisan dari yang terendah ke atas (atau susun semula dalam lapisan).

## Semak, kemudian bina

{{ui:Semak}} menyenaraikan apa yang salah, dalam perkataan, sebelum apa-apa berubah:

- garisan **tanpa ketinggian** atau kurang daripada dua titik;
- garisan **pendua** (bentuk yang sama dua kali, walaupun dilukis secara terbalik);
- dua garisan yang **bersilang**, pada ketinggian yang berbeza atau sama (garisan yang bersilang dengan dirinya sendiri juga), dengan tempatnya;
- ketinggian yang **tidak pada sela** (kesilapan menaip seperti 105.5 pada peta 1 m).

Tandakan {{ui:Tinggalkan garisan yang bersilang dengan garisan lain}} untuk menggugurkan garisan yang bersilang dengan paling banyak garisan lain (kemudian yang seterusnya, sehingga tiada yang bersilang): garisan sesat yang memotong setiap kontur ialah yang dibuang, bukan konturnya. **Permudahkan garisan dalam** menipiskan verteks yang lebih dekat kepada larian lurus daripada jarak itu.

{{ui:Bina tanah}} menambah garisan ke tanah sedia ada sebagai garisan putus (satu langkah buat asal), supaya permukaan melalui setiap kontur dengan tepat. Dengan {{ui:Betulkan segi tiga rata pada rabung, lembah dan puncak bukit}} ditandakan dan sela diberi, CivilCraft juga menambah satu titik di dalam setiap segi tiga rata (segi tiga yang semua bucunya terletak pada satu kontur) pada ketinggian yang diteruskan oleh cerun di sebelahnya, dan tidak lebih daripada setengah sela dari kontur. Tanpa itu, puncak rabung, dasar lembah dan puncak bukit keluar sebagai plat rata. Pada bukit ujian, ralat berbanding permukaan sebenar turun sebanyak satu perempat; pada rabung sebanyak 40 %.

## Peta tanpa koordinat

Untuk peta kontur yang disalin daripada gambar atau PDF, buka **Skala dan letakkan lapisan melalui dua titik diketahui**. Berikan dua titik pada peta dan lokasi sebenarnya; lapisan yang ditandakan diskala, dipusingkan dan dialihkan supaya padan (satu langkah buat asal; ketinggian tidak diubah). Dua titik yang sama memberikan skala (ditunjukkan dalam mesej) dan putaran.

Permukaan adalah sebaik peta: antara dua kontur ia ialah satah, maka tanah sebenar di antaranya tidak diketahui. Semak hasilnya dengan titik ketinggian sebelum bergantung padanya.
