---
title: Rangkaian utiliti dan OpenStreetMap
summary: Laluan air, pembetung, saliran ribut, gas, kuasa dan telekomunikasi dengan bahan, saiz, penutup dan pemilik; data OpenStreetMap daripada fail JSON Overpass; persilangan, keratan parit dan isipadu; lapisan perkhidmatan dalam DWG, DXF dan PDF; segmen paip dan kabel IFC.
keywords: utiliti, utiliti, rangkaian, osm, openstreetmap, overpass, paip, kabel, gas, pembetung, saliran ribut, telekomunikasi, kuasa, air, hidran, lubang periksa, parit, persilangan, kelegaan, penutup, kedalaman, dwg, ifc, georujukan, lapisan
from: 8a85dace
---

Lukis perkhidmatan terbenam di tapak sebagai satu rangkaian bagi setiap perkhidmatan, semak tempat ia bersilang, dan hantar keluar sebagai lapisan lukisan dan sebagai IFC.

## Buat larian

Buka **Permukaan, Lagi, Rangkaian utiliti...**

- **Buat larian daripada pilihan** menukar penjajaran, garis ciri atau paip yang dipilih kepada larian bagi perkhidmatan yang anda pilih. Kemudian isikan bahan, saiz (mm), penutup (kedalaman ke bahagian atas paip atau kabel) dan pemilik dalam jadual.
- **Baca data OpenStreetMap** membaca fail JSON Overpass yang anda simpan (pertanyaan dengan `out geom;`). Projek perlu mempunyai sistem koordinat dahulu, kerana kedudukan OpenStreetMap ialah latitud dan longitud. Saluran paip (mengikut bahan), kabel kuasa dan telekomunikasi bawah tanah, hidran, lubang periksa dan saliran ribut dibaca; apa-apa lain dikira sebagai ditinggalkan dan dinyatakan dalam mesej. Talian atas ditinggalkan.
- **Tambah peta OpenStreetMap** menambah peta OpenStreetMap di bawah pelan. Ia hanya dilukis semasa lapisan peta dari internet dihidupkan dalam Tetapan.

## Semakan dan output

- **Persilangan**: larian perkhidmatan berbeza yang bersilang dalam pelan disenaraikan bersama ketinggian kelegaan antaranya di tempat terdapat permukaan tanah; minimum ialah tempat letak yang anda tetapkan, bukan nombor piawaian.
- **Parit**: setiap larian mendapat parit (saiz paip ditambah kelegaan di setiap sisi, kecerunan sisi, alas) dengan isipadu. Jumlah dipaparkan dalam tetingkap dan dalam CSV.
- **Lukisan**: larian dan titik berada pada lapisan perkhidmatan (contohnya U-WATR-RUN, U-POWR-RUN), jadi ia sampai ke PDF, DXF dan DWG.
- **IFC**: larian dimasukkan ke dalam eksport IFC sebagai segmen paip dan segmen kabel, dengan hidran, injap dan kebuk, satu sistem bagi setiap perkhidmatan, dalam sistem koordinat projek.

## Data OpenStreetMap

Data OpenStreetMap ialah hak cipta penyumbang OpenStreetMap dan dilesenkan di bawah ODbL. Atribusi ditambah pada lukisan, CSV dan IFC. Jika anda berkongsi fail yang mengandungi data OpenStreetMap, kekalkan atribusi dan baca terma perkongsian serupa lesen tersebut.

## Perkara yang belum dibuat

Larian belum dilukis titik demi titik pada pelan dengan alat, dan persilangan belum dilukis dalam paparan profil (pengiraannya sudah dibina). Kedalaman, saiz dan kelegaan bermula sebagai tempat letak: gunakan nombor piawaian anda sendiri.
