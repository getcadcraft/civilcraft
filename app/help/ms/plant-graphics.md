---
title: Grafik tumbuhan mengikut skala, simbol sendiri anda dan tumbuhan 3D
summary: Cara tumbuhan dilukis dalam pelan pada setiap skala lukisan dan tahap perincian, serta cara rekod tumbuhan mendapat simbol sendiri anda (SVG, atau blok DXF/DWG) dan model 3D sendiri anda (OBJ, STL atau GLB).
keywords: grafik tumbuhan, simbol tumbuhan, simbol mengikut skala, tahap perincian, tahap butiran, bulatan ringkas, lakaran, simbol terperinci, simbol sendiri, blok, svg, dxf, dwg, tumbuhan 3d, model 3d sendiri, obj, stl, glb, gltf, model pokok, tumbuhan dalam 3d
from: 875837d9
---

## Simbol pelan mengikut skala

Landskap › {{ui:More}} › {{ui:Plant graphics}} menetapkan cara tumbuhan dilukis dalam pelan. **Automatik, mengikut skala** memilih salah satu daripada tiga tahap berdasarkan skala lukisan:

- **Bulatan ringkas** (lebih kasar daripada 1:500): satu bulatan pada lebar tumbuhan.
- **Lakaran dengan pusat** (dari 1:500 hingga 1:200): bulatan dan satu silang kecil di pusat.
- **Simbol terperinci** (lebih halus daripada 1:200): simbol sendiri rekod itu jika ada, jika tidak simbol terbina dalam.

Tukar kedua-dua skala dengan **Ringkas dari 1:** dan **Lakaran dari 1:**, atau pilih satu tahap untuk setiap skala. Setiap set helaian dalam kotak dialog Helaian mempunyai **Butiran tumbuhan dalam pelan** sendiri, jadi pelan tapak 1:500 dan pelan penanaman 1:100 boleh berbeza. Tetapan disimpan bersama projek.

## Simbol sendiri anda

Pilih satu tumbuhan dalam bahagian Tumbuhan dan tekan {{ui:Own symbol…}}. Ia membaca fail SVG, atau satu blok lukisan DXF atau DWG (apabila lukisan mempunyai beberapa blok, anda memilih satu). Simbol itu dipadankan dengan lebar tumbuhan dan dilukis pada tahap terperinci. Ia disimpan dalam projek, jadi fail itu ikut bersamanya.

- Fail SVG dibaca untuk garisan, polygaris, poligon, segi empat tepat, bulatan, elips dan laluan. Skrip, gaya, pautan dan imej di dalamnya tidak sekali-kali diperiksa. Transformasi tidak digunakan: anda akan dimaklumkan apabila fail mempunyainya, jadi ratakannya dahulu dalam program lukisan anda.
- Had: 512 KB SVG dan 2000 bentuk. Fail yang lebih besar ditolak dengan sebab dinyatakan.

## Tumbuhan 3D sendiri anda

{{ui:Own 3D model…}} pada rekod yang sama membaca fail **OBJ**, **STL** atau **GLB**. Kemudian, dalam Grafik tumbuhan, tetapkan **Tumbuhan dalam 3D** kepada **Model sendiri bagi setiap rekod**: setiap tumbuhan bagi rekod itu menunjukkan model anda, diskalakan mengikut ketinggian dan lebarnya. Rekod tanpa model sendiri kekal dengan bentuk terbina dalam. Pilih **Jisim ringkas** untuk paparan pantas bagi tapak yang besar.

GLB dibaca untuk bentuknya sahaja:

- Semua yang diperlukan model mesti berada di dalam fail .glb. Model yang merujuk kepada fail lain (fail .bin berasingan, atau imej mengikut alamat) ditolak: tiada apa-apa dimuat turun.
- Geometri yang dimampatkan atau dibungkus (Draco, meshopt, kedudukan terkuantisasi) tidak dibaca. Eksport tanpa pemampatan.
- Tekstur dan warna dalam fail tidak digunakan: model dilukis dengan warna tumbuhan itu sendiri. Tekstur tetap diperiksa, dan tekstur melebihi 4096 piksel setiap sisi ditolak.
- Had: fail 32 MB, 50 000 segi tiga (termasuk setiap salinan bahagian yang diletakkan lebih daripada sekali), 64 imej dan 16 MB imej.

Setiap had menolak fail dengan sebab dinyatakan; tiada apa yang dibaca separuh jalan disimpan. Satu langkah buat asal memberikan rekod simbol atau modelnya, dan {{ui:Remove own symbol}} atau {{ui:Remove own 3D model}} mengalih keluarnya semula.

Lihat [Rekod tumbuhan](topic:plant-records) untuk rekod itu sendiri, dan [Lihat tapak dalam 3D](topic:site-3d).
