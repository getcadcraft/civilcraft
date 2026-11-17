---
title: Çitler
summary: Bir doğru, parsel ya da platform boyunca çit: direkler, yatay bağlantılar, paneller ya da parmaklıklar, kapılar, eğimli ya da basamaklı zemin üzerinde; bir liste, plan sembolleri ve IFC öğeleri. Bir asistan da kullanabilir.
keywords: çit, direkler, yatay bağlantılar, paneller, parmaklıklar, kapı, eğimli, basamaklı, arazi, liste, ifc, korkuluk, sınır
from: c0e7b84a
---

Bir özellik çizgisi, eksen, parsel veya platform boyunca bir çit yapın; direkleri ve kapıları sizin için yerleştirilir.

## Çit yapma

1. Bir çizgi, parsel veya platform seçin.
2. **Yüzey, Diğer, Çitler...** seçeneğini açın.
3. Stili (paneller, yatay bağlantılar ya da parmaklıklar), eğimli ya da basamaklı olmasını, yüksekliği, direk aralığını ve kapı genişliğini seçin; ardından **Seçim boyunca çit**'i veya en uzun düz kesimin ortasına kapı koymak için **Kapılı çit**'i seçin.

Direkler uçlara, her köşeye (20 derece veya daha fazla dönen bir köşe noktasına), her kapının iki kenarına ve aralarında eşit bölmelere konur; hiçbiri aralıktan uzun olmaz. **Eğimli** paneller, direkleri arasındaki zemini izler. **Basamaklı** paneller düz kalır ve direklerde basamak yapar; bir panelin altındaki boşluk en çok, eğimin aşağı yönündeki direğinde olur ve iletişim kutusu bu boşluk sınırı aştığında ya da zemin bir panelin içinden yükseldiğinde uyarır. 6 feet (1.8 m) ve daha geniş kapılarda iki kanat olur; planda kanatlar açılma yönleriyle birlikte gösterilir.

## Liste ve çıktılar

Her çit; uzunluğunu, türlerine göre direkleri, panelleri, kapıları ve basamakları gösterir; direklerin, panellerin, yatay bağlantıların, parmaklıkların ve kapıların bulunduğu bir **CSV** listesiyle birlikte. Planda PDF, DXF ve DWG için çit katmanları (C-FENC, C-FENC-POST, C-FENC-GATE) bulunur. IFC dışa aktarımı direkleri (IfcMember, post), panelleri (IfcRailing, user defined fence panel), yatay bağlantıları (IfcMember) ve kapıları (IfcDoor, gate) içerir; her çit için bir sistem.

## Bir asistandan

`fence_build` bir çit yapar (noktalar ya da adlandırılmış bir çizgi, parsel veya platform; kapılar istasyona göre) ve `fence_list` çitleri, listeleriyle birlikte listeler.

## Henüz yapılmayanlar

Başlangıç ölçüleri kod değil, olağan seçimlerdir. Kütüphaneden gelen türler yalnızca bir ad olarak taşınır. Kapılar tek bir düz kesimde olmalıdır. BimCraft'ın bu aracı henüz yok.
