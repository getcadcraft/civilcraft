---
title: Apskaičiuoti saulės valandas vietoje
summary: Pasirinkti dieną (ar sezoną) ir laiko juostą bei matyti tiesioginės saulės valandas ant kiekvienos pastato masės sienos ir aplink jas esančios žemės, žemė nubraižyta plane, o skaičiai – CSV formatu.
keywords: saulė, saulės valandos, šešėlis, pavėsis, saulės prieinamumas, dienos šviesos valandos, fasadas, siena, sezonas, saulėgrįža, lygiadienis, laiko juosta, vasaros laikas, platuma, ilguma, CSV, rastras
from: 4e32a314
---

**Saulės valandos** skaičiuoja tiesioginės saulės valandas, pasiekiančias kiekvieną pastato masės sieną ir aplink jas esančią žemę, dieną, kurią pasirenkate, arba vidurkintas per sezoną. Masės ir pati žemė meta šešėlį; nieko kito – ne (jokių medžių, jokių kaimynų, kurių nenubrėžėte). Dangaus šviesa, kuri nėra tiesioginė saulė, neskaičiuojama.

## Prieš pradedant

Saulės padėtis gaunama iš vietos platumos ir ilgumos, kurios paimamos iš projekto **koordinačių sistemos**. Projektas be jos atmetamas su pranešimu: pirmiausia ją nustatykite (**Koordinatės** GIS grupėje). Platuma ir ilguma, įvesti ranka, būtų spėjimas, todėl laukelių jiems nėra.

## Apskaičiuoti

**Savybėse**, po **Pastatų masės**, **Saulės valandos**:

1. Pasirinkite **Diena**. Ji pradedama nuo dienos, kai saulė jūsų vietoje žemiausia (gruodžio 21 d. arba birželio 21 d. pietiniame pusrutulyje). Sezonui pažymėkite **Per sezoną**, pasirinkite **Paskutinė diena** ir kiek dienų tarp imčių.
2. Įveskite **Laiko juosta**: pavadinimą, pavyzdžiui, `America/Mexico_City`, arba poslinkį nuo UTC, pavyzdžiui, `-6`. Pavadinimas seka tos juostos vasaros laiko taisykles tai dienai; jūsų įvestas poslinkis naudojamas tiksliai, kaip įvestas, todėl naudokite tą, kuris galioja tą dieną. Eilutė po laukeliu parodo, kokį poslinkį ji rado.
3. Pasirinkite, kaip dažnai dėti saulę (kas 5, 10, 15 arba 30 minučių), tada **Apskaičiuoti saulės valandas**. Sezonas vykdomas fone; **Sustabdyti** nutraukia jį.

## Ką gausite

- Lentelė pagal masę: **blogiausia siena**, **vidutinė** ir **geriausia siena** valandomis per dieną, ir lentelė kiekvienai sienai su tuo, kaip ji orientuota, ir valandomis aukštas po aukšto.
- Žemė aplink mases nubraižyta plane nuo tamsios (be saulės) iki geltonos (daugiausia, kiek gauna bet kuri ląstelė), su legenda. Ląstelės po mase paliekamos tuščios. **Rodyti žemę plane** ją išjungia.
- **Sienos CSV** ir **Žemė CSV** išsaugo skaičius.

Sezonui rodikliai yra vidutinė per dieną iš imtų dienų. Projekte nieko neišsaugoma: rezultatas skirtas peržiūrai, o paleidus iš naujo jis pergeneruojamas.

## Verta žinoti

- Siena momentą skaičiuoja kaip saulėtą tik tada, kai ji atsisuka į saulę ir nieko nekliudo. Siena, atsisukusi į kitą pusę, nieko negauna.
- Žemė imama tinklelyje, kurio tankis priklauso nuo vietos dydžio, o saulės padėtis – kiekvieno laiko žingsnio viduryje, todėl valandos yra tikslios iki pasirinkto žingsnio.
- Saulės padėtis yra paskelbta astronominė formulė, tiksli iki maždaug vienos lanko minutės.
