---
title: Elektros linijų darbo sritis
summary: Oro linijos ir požeminiai kabeliai jūsų vietovėje su jūsų pačių bibliotekomis, įtempimu ir įlinkiu pagal jūsų apkrovos atvejus, atstumų ir stiprumo patikromis, montavimo lentelėmis, kiekiais, lapais ir GIS eksportu.
keywords: elektros linija, oro linija, elektros, paskirstymas, stulpai, atramos, laidininkas, įlinkis, įtempimas, montavimas, atstumas, požeminis kabelis, tranšėja, darbo sritis, komunalinė
from: 638dd856
---

Elektros linijų darbo sritis perkelia oro linijas ir požeminius kabelius į jau turimą CivilCraft vietovę: tie patys matavimo taškai, ta pati žemė, tas pats projekto failas.

:::warning
Projektavimo pagalba. Darbo sritis skaičiuoja įlinkį, įtempimą, atstumus ir apkrovas pagal **jūsų** apkrovos atvejus ir ribas; jokio šalies standarto į ją neįdėta. Prieš ką nors statant, inžinierius patikrina kiekvieną rezultatą pagal taikomą standartą.
:::

## Atidarymas

Pasirinkite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Elektros linijų darbo sritis}} arba **Elektros linijos** skiltyje Darbo sritis. Įrankių juostoje tuomet rodoma grupė **Elektros linijos**; grupės Projektavimas ir GIS pasitraukia į šalį. Norėdami grįžti, skiltyje Darbo sritis pasirinkite **Civilinė**. CivilCraft prisimena darbo sritį, kurią paskutinį kartą naudojote šiame kompiuteryje.

Kairysis skydelis viršuje gauna dvi naujas skiltis:

- **Elektros linijos**: jūsų apkrovos atvejai ir ribos, projekte esančios linijos ir kabeliai bei visada atnaujinamos **Patikros**. Spustelėkite patikrą, kad pasirinktumėte, kas su ja susiję.
- **Biblioteka**: jūsų pačių laidininkai, kabeliai, atramos, įranga ir tranšėjų tipai. Žr. [Jūsų elektros linijų biblioteka](topic:power-line-library).

## Kas yra Elektros linijų grupėje

| Įrankis | Ką daro | Tema |
|---|---|---|
| **Linija** | Oro linija: spustelėkite kiekvieną atramą | [Oro linijos braižymas](topic:overhead-line) |
| **Atrama** | Pridėti atramą tarpe | [Oro linijos braižymas](topic:overhead-line) |
| **Kabelis** | Požeminio kabelio trasa tranšėjoje | [Požeminiai kabeliai](topic:underground-cables) |
| **Įranga** | Spintelė, transformatorius, jungė ar šaltinis, iš kurio maitinamas tinklas | [Požeminiai kabeliai](topic:underground-cables) |
| **Kliūtis** | Kažkas, ką linija kerta: kelias, pastatas, kita linija | [Patikros](topic:power-line-checks) |
| **Profilis** | Linijos profilis: žemė, atramos ir laidininkas kiekvienu apkrovos atveju | [Oro linijos braižymas](topic:overhead-line#the-line-profile) |
| **Daugiau** | Apkrovos atvejai ir ribos, montavimo lentelės, kiekiai, lapai ir ataskaita, GIS, tyrimo failai | [Įlinkis ir įtempimas](topic:sag-and-tension), [Išvestys](topic:power-line-outputs), [Tyrimo failai](topic:power-line-study-file) |

Viskas, ką pridedate, yra vienas anuliavimo žingsnis, įrašoma projekto faile ir braižoma plane sluoksniuose, pavadintuose `C-POWR-…`, todėl DXF, DWG ir PDF eksportai jį taip pat perneša.
