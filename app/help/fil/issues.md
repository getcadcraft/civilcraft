---
title: Mga isyu at BCF
summary: I-pin ang isang problema sa plano, sa station ng alignment, sa surface point o sa pipe, bigyan ito ng status at mga komento, at ipagpalitan ang mga isyu bilang BCF 2.1 file kasama ng LandXML file.
keywords: isyu, isyu, bcf, komento, markup, snag, defect, site, pin, status, bukas, resolved, sarado, bim collaboration format, landxml, problema
from: e44153b1
---

Ang isyu ay isang tala na naka-pin sa isang lugar sa iyong CivilCraft drawing, na may title, status at mga komento. Gamitin ito para sabihin sa site staff o sa ibang program kung ano ang titingnan, at para mabasa ang kanilang mga sagot.

## Magdagdag ng isyu

1. Buksan ang **Surface, Higit pa, Mga Isyu (BCF)...**
2. Mag-type ng title at ilarawan kung ano ang mali.
3. Piliin kung saan ito ipi-pin: ang gitna ng plan view, ang surface point sa gitna, isang station ng piniling alignment (i-type ang station at offset, positibo ang kanan), o ang piniling pipe, structure o feature line.
4. Pindutin ang **Idagdag ang isyu**. Lalabas sa plano ang pin bilang maliit na diamond na may numero nito.

I-click ang title ng isyu para mag-zoom dito, baguhin ang status nito sa listahan (Bukas, Aktibo, Resolved, Sarado) at magdagdag ng mga komento. Ang bawat pagbabago ay isang hakbang ng I-undo, at naka-save ang mga isyu sa project file.

## Ipagpalitan ang mga ito bilang BCF

- **I-export ang BCF** ay sumusulat ng BCF 2.1 file na may isang topic bawat isyu: title, status, mga komento, at isang viewpoint na may orthogonal plan camera at ang pin.
- **I-import ang BCF** ay nagbabasa ng BCF file (nababasa ang 2.0 at 3.0 na file hangga't tugma sa 2.1). Ang topic na may guid na mayroon ka na ay nag-a-update ng isyung iyon (status, bagong komento) sa halip na magdagdag ng pangalawa.
- **Mula sa Problema** ay gumagawa ng isyu mula sa bawat bukas na entry sa panel ng Problema na nagsasabi kung nasaan ito.

Dinadala ng BCF ang mga metro sa sariling coordinates ng project na ito, walang shift. Dapat nasa parehong coordinate system ng iyong LandXML file ang ibang program para tama ang kinalalagyan ng mga pin. Ang elementong tinuturuan ng pin (alignment, station, offset, pipe) ay dinadala bilang mga label na nagsisimula sa "cc:", na binabasa pabalik ng CivilCraft.

## Ano ang hindi sinuri

Nasubukan lang ang mga pin at viewpoint sa pamamagitan ng pagsulat ng file at pagbasa nito pabalik sa CivilCraft. Wala pang ibang BIM program ang nakabuksan ang mga ito, at nag-iiba sa bawat program kung ang BCF na "view to world scale" ay nangangahulugang buong o kalahating taas ng view: isinusulat ng CivilCraft ang buong taas.
