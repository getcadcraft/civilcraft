---
title: Pagar
summary: Pagar di sepanjang garisan, lot atau pelantar: tiang, rel, panel atau pikat, pintu pagar, condong atau berperingkat di atas tanah, jadual, simbol pelan dan elemen IFC. Turut tersedia untuk pembantu.
keywords: pagar, tiang, rel, panel, pikat, pintu pagar, condong, berperingkat, rupa bumi, jadual, ifc, susur, sempadan
from: c0e7b84a
---

Buat pagar di sepanjang garisan ciri, penjajaran, lot atau pelantar, dengan tiang dan pintu pagarnya diletakkan untuk anda.

## Buat pagar

1. Pilih garisan, lot atau pelantar.
2. Buka **Permukaan, Lagi, Pagar...**
3. Pilih gaya (panel, rel atau pikat), condong atau berperingkat, ketinggian, jarak tiang dan lebar pintu pagar, kemudian **Pagar sepanjang pilihan**, atau **Dengan pintu pagar** untuk meletakkan pintu pagar di tengah lintasan lurus terpanjang.

Tiang diletakkan di hujung, di setiap sudut (bucu yang berpaling sebanyak 20 degrees atau lebih), di kedua-dua tepi setiap pintu pagar dan pada bay sama jarak di antaranya, tidak satu pun lebih panjang daripada jarak tersebut. Panel **condong** mengikut tanah di antara tiangnya. Panel **berperingkat** kekal mendatar dan melangkah pada tiang; jurang di bawah panel paling lebar pada tiang bahagian bawah cerun, dan tetingkap memberi amaran apabila jurang itu melebihi had, atau apabila tanah naik melalui panel. Pintu pagar 6 feet (1.8 m) dan lebih lebar mendapat dua daun; pelan menunjukkan daun terbuka dengan ayunannya.

## Jadual dan output

Setiap pagar menunjukkan panjangnya, tiang mengikut jenis, panel, pintu pagar dan langkah, dengan jadual **CSV** bagi tiang, panel, rel, pikat dan pintu pagar. Pelan mempunyai lapisan pagar (C-FENC, C-FENC-POST, C-FENC-GATE) untuk PDF, DXF dan DWG. Eksport IFC mengandungi tiang (IfcMember, post), panel (IfcRailing, user defined fence panel), rel (IfcMember) dan pintu pagar (IfcDoor, gate), satu sistem bagi setiap pagar.

## Daripada pembantu

`fence_build` membuat pagar (titik atau garisan, lot atau pelantar yang dinamakan, pintu pagar mengikut stesen) dan `fence_list` menyenaraikan pagar bersama jadualnya.

## Yang belum dibina

Saiz permulaan ialah pilihan lazim, bukan kod. Jenis dari Pustaka hanya dibawa sebagai nama. Pintu pagar mesti berada dalam satu lintasan lurus. BimCraft belum mempunyai alat ini lagi.
