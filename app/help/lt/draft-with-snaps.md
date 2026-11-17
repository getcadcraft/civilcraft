---
title: Piešimas su prisegimais, pasirinkti kampai ir perkėlimas, kopijavimas, sukimas
summary: Padėkite trasas, aikšteles, sklypus ir charakteristines linijas tiksliai ant jau turimų taškų ir kampų, įveskite arba pasirinkite kampo rytinę ir šiaurinę koordinatę, nukreipkite liestinę į du taškus ir perkelkite, nukopijuokite ar pasukite objektą atstumu arba kampu.
keywords: prisegimas, prisegimai, osnap, prisegti prie taško, prisegti prie kampo, PI, viršūnė, kampas, pasirinkimas, kryžiukas, rytai, šiaurė, koordinatės, įvestos koordinatės, liestinė, kryptis, azimutas, perkelti, kopijuoti, sukti, transformacija, kopijuoti pasukus, dubliuoti, Alt, laisvas taškas, braižymas
from: 49864dda
---

Nauja 0.9 versijoje piešdami žymeklis prisiliečia prie jau esančių plano taškų ir kampų, o aikštelės, sklypo ar charakteristinės linijos kampą galima įvesti arba pasirinkti. Ši tema aprašo tris įrankius.

## Ką darysite

- Piešite su prisegimais, kad nauja trasa, aikštelė, sklypas ar linija prasidėtų ir baigtųsi tiksliai ant jau esančio objekto.
- Nustatysite kampo rytinę ir šiaurinę koordinatę įvesdami ją arba pasirinkdami vietą plane.
- Nukreipsite trasos liestinę į du pasirinktus taškus.
- Perkelsite, nukopijuosite ar pasuksite visą objektą.

## Žingsniai

1. Pasirinkite braižymo įrankį, pavyzdžiui {{ui:Trasa}}, {{ui:Aikštelė}}, {{ui:Sklypas}} arba {{ui:Charakteristinė linija}}. Perkelkite žymeklį arti topografinio taško, trasos PI, aikštelės ar sklypo kampo, charakteristinės linijos viršūnės arba lietaus nuotekų šachtos. Atsiranda žymė su etikete (PI, Kampas, Viršūnė, Šachta arba Taškas ir jo numeris) ir rytine bei šiaurine koordinate, į kurią ji nukris. Spustelėkite, kad padėtumėte tašką ten.
2. Norėdami padėti tašką laisvai, spustelėdami laikykite {{key:Alt}}. Prisegimas išsijungia.
3. Pasirinkite aikštelę, sklypą arba charakteristinę liniją. Ypatybėse blokas {{ui:Kampai}} išvardija kiekvieną kampą su Rytų koordinatės laukeliu ir Šiaurės koordinatės laukeliu. Įveskite naujus skaičius arba paspauskite kryžiuko mygtuką šalia kampo ir spustelėkite vietą plane. Kampas įgauna tą rytinę ir šiaurinę koordinatę. Paspauskite {{key:Esc}}, kad atšauktumėte pasirinkimą. Kryžiukas veikia tik plane: pirmiausia uždarykite 3D vaizdą.
4. Norėdami nukreipti liestinę, pasirinkite trasą. Ypatybėse, skiltyje {{ui:Liestinė pagal du taškus}}, pasirinkite liestinę, paspauskite {{ui:Pirmasis taškas}} ir spustelėkite plane, paspauskite {{ui:Antrasis taškas}} ir spustelėkite dar kartą, tada paspauskite {{ui:Nustatyti kryptį}}. Liestinė pasisuka taip, kad eitų nuo pirmojo taško link antrojo, išlaikydama savo ilgį.
5. Norėdami perkelti, nukopijuoti ar pasukti, pasirinkite trasą, aikštelę, sklypą arba charakteristinę liniją. Ypatybėse, skiltyje {{ui:Perkelti, kopijuoti ir sukti}}, įveskite {{ui:Perkelti į rytus}} ir {{ui:Perkelti į šiaurę}} (neigiami skaičiai eina į vakarus ir pietus) ir paspauskite {{ui:Perkelti}} arba {{ui:Kopijuoti}}. Arba paspauskite {{ui:Atstumas pagal du taškus}} ir spustelėkite tašką, iš kurio perkelti, ir tašką, į kurį perkelti.
6. Norėdami pasukti, įveskite kampą laukelyje {{ui:Sukti prieš laikrodžio rodyklę}} (laipsniais), tada paspauskite {{ui:Sukti}} arba {{ui:Kopijuoti pasukus}}. Objektas sukasi apie savo kampų vidurį, nebent pasirinksite tašką, apie kurį suktis, kryžiuku šalia kampo.

## Pastabos

- Kopija palieka originalą savo vietoje ir po to yra pasirinkta.
- Kiekvienas perkėlimas, kopijavimas, sukimas, pasirinktas kampas ir pasukta liestinė – vienas anuliavimo žingsnis.
- Prisegimai pasiekia 10 ekrano taškų nuo žymeklio. Prisegimo žymė tik siūlo vietą; nieko nepakeičiama, kol nespustelėsite.
- Tas pats kryžiukas yra ant trasos PI eilučių. Žr. [Trasos](topic:alignment), [Sklypai](topic:parcels) ir [Charakteristinės linijos](topic:feature-lines).
