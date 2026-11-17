---
title: Aprašymo raktai ir linijų kodai
summary: Paverskite lauko kodus taškų grupėmis su aprašymais ir sujunkite kodais pažymėtus taškus į linijas (pradžia, pabaiga, uždarymas), kurios tampa lūžio linijomis.
keywords: aprašymo raktai, lauko kodai, linijų kodai, figūros, linijų braižymas, pradžia, pabaiga, uždaryti, taškų grupės, kodai, topografiniai kodai, duomenų rinkiklis, lūžio linijos, bordiūras, važiuojamosios dalies kraštas
from: b3d1af8d
---

Topografai lauke pažymi kiekvieną matavimą kodu: `EP` – važiuojamosios dalies kraštas, `TC` – bordiūro viršus, `BLDG` – pastato kampas. Kodas yra pirmas taško aprašymo žodis. CivilCraft grupuoja taškus pagal jį ir paverčia linijų kodus po jo linijomis.

## Linijų kodai

Linijų kodas yra žodis iš karto po lauko kodo:

| Aprašymas | Reiškia |
|---|---|
| `EP B` | Pradėti naują važiuojamosios dalies krašto liniją šiame taške |
| `EP` | Tęsti dabartinę EP liniją |
| `EP E` | Užbaigti dabartinę EP liniją šiame taške |
| `BLDG C` | Uždaryti pastatą: sujungti šį tašką su pirmuoju linijos tašku |

Taškai su tuo pačiu kodu jungiami pagal taško numerių eilę. Skirtingi kodai yra skirtingos linijos, net jei jos bendrauja grupe, todėl `EP1` ir `EP2` duoda du kraštus vienu metu. Kodas, kuris niekada nenaudoja linijų kodo, jungiamas per visus savo taškus, kaip ankstesnėse versijose.

Grupėse, naudojamose kaip **Lūžio linija**, linijos tampa lūžio linijomis, po vieną kiekvienai linijai, todėl bordiūras su tarpu nėra tempiamas per tarpą. Kitų grupių linijos nubraižomos plane (sluoksnis V-NODE-LINE) ir išeina į DXF, DWG ir PDF.

Pradžios, pabaigos ir uždarymo žodžiai yra `B`, `BEG`, `START`; `E`, `END`; ir `C`, `CLO`, `CLOSE`. Pakeiskite juos arba išjunkite linijų kodus žemiau esančiame dialoge.

## Aprašymo raktai

Aprašymo raktas paverčia kodą taškų grupe, naudojimu ir ilgu aprašymu.

1. Skiltyje **Taškai** spustelėkite {{ui:Aprašymo raktai ir linijų kodai}}.
2. Spustelėkite {{ui:Pridėti raktą}} ir užpildykite eilutę:
   - **Kodas**: lauko kodas, kurį atitikti. `*` reiškia bet kokius simbolius, o `?` – vieną simbolį, todėl `EP*` pagauna EP, EP1 ir EP12.
   - **Grupė**: taškų grupė, į kurią jungiami šie taškai (tuščia = pats kodas). `EP*` su grupe `EP` įdeda EP1 ir EP2 į vieną grupę, nors jie lieka atskiromis linijomis.
   - **Naudojimas**: Taškai, Lūžio linija arba Praleisti, kai grupė pirmą kartą atsiranda (arba palikite tai lentelei **Taškai**).
   - **Aprašymas**: ilgas pavadinimas, rodomas taško **Ypatybėse**.
3. Stulpelis **Taškai** skaičiuoja taškus, kuriuos kiekvienas raktas pagauna, kol rašote. Pirmasis raktas, kuris atitinka kodą, laimi.
4. Spustelėkite {{ui:Taikyti}}. Grupės, paviršius ir planas seka vienu žingsniu: {{key:Mod+Z}} jį anuliuoja.

Grupė išlaiko naudojimą, kurį jai suteikėte lentelėje **Taškai**; raktas nustato naudojimą tik grupei, kuri nauja. Raktai ir linijų kodai išsaugomi projekto faile.
