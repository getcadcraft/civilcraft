---
title: Bëj një raport kunjash
summary: Listo kunjat përgjatë një boshti në stacione dhe devijime, ose pikat e rilevimit afër tij, me stacionin, devijimin, veriun, lindjen, kotat e projektit dhe të terrenit dhe gërmimin ose mbushjen, dhe ruaje raportin si CSV ose PDF.
keywords: kunja, vendosje kunjash, raport kunjash, fletë gërmimi, fletë kotash, stacion, devijim, gërmim, mbushje, vendosje, vendosje kunjash në ndërtim, siç u ndërtua
from: d8a4e9f1
---

Zgjidh një bosht dhe kliko **Raport kunjash** te **Vetitë** e tij.

## Kunjat në stacione dhe devijime

1. **Nga** dhe **deri**: stacionet për t'i kunjëzuar (1+50 ose 150).
2. **çdo**: intervali. Kunjat vendosen në çdo shumëfish të tij, në të dy skajet, dhe (me kutinë e shënuar) aty ku kthesat e boshtit fillojnë dhe mbarojnë.
3. **Devijimet**: majtas dhe djathtas të boshtit, duke parë drejt stacionit në rritje: `12 L, 0, 12 R`, `L12 CL R12` ose `-12, 0, 12` (majtas është minus). Një bosht me koridor fillon me skajet e asfaltit dhe të bankinave.
4. **Numëro nga** dhe **me parashtesë** i emërtojnë kunjat: 1, 2, 3, ose S101, S102.

## Pikat e rilevimit afër boshtit

Zgjidh **pikat e rilevimit afër boshtit** dhe sa afër. Çdo pikë brenda kësaj largësie merr stacionin dhe devijimin e vet, projektin aty, dhe kotën e vet si terren: një kontroll i pikave të kunjëzuara ose të matura siç u ndërtuan.

## Çfarë thotë raporti

| Kolona | Çfarë është |
|---|---|
| Pika | Emri i kunjit, ose numri i pikës së rilevimit |
| Stacioni, Devijimi | Ku ndodhet përgjatë boshtit: L majtas, R djathtas |
| Veriu, Lindja | Koordinatat e saj |
| Kota e projektit | Sipërfaqja e koridorit të nivelizuar aty (nga vija daylight te vija daylight), përndryshe profili i projektit në boshtin qendror |
| Kota e terrenit | Sipërfaqja ekzistuese aty, ose kota e vetë pikës së rilevimit |
| Gërmim/Mbushje | C kur toka është mbi projektin (gërmo), F kur është nën (mbush), me saktësi të qindtës |

Një kunj pa kotë projekti (jashtë koridorit, ose në një bosht pa kotë projekti larg vijës qendrore) nuk ka gërmim ose mbushje; dialogu thotë sa janë.

## Ruaje

- **CSV**: një rresht titulli, pastaj kolonat e mësipërme, plus gërmimi ose mbushja si numër me shenjë (terreni minus projekti), për fletët e llogaritjes dhe pajisjet e mbledhjes së të dhënave.
- **PDF**: faqe tabele në letrën që zgjedh, një kunj për rresht, gërmimet me portokalli dhe mbushjet me jeshile, me shiritin e titullit të fletëve të tjera.

:::note
Kunjat llogariten nga projekti brenda projektit. Kontrolloji me planet e miratuara përpara se të ndërtohet diçka.
:::
