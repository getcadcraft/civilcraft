---
title: Augalų įrašai, veislės ir tiekiami dydžiai
summary: Projekto augalų sąrašas lentelės pavidalu: veislės, tiekiami dydžiai (talpa, šaknų kamuolys, apimtis, švarus kamienas), tankis, specifikacijos pastabos, CSV įkėlimas ir eksportas; kiekvienas įdėtas augalas nurodo dydį; augalų simboliai pagal mastelį ir jūsų savi simboliai bei 3D modeliai.
keywords: augalų lentelė, augalų duomenų bazė, veislė, įvairovė, tiekiamas dydis, talpa, šaknų kamuolys, nuoga šaknis, apimtis, švarus kamienas, tankis, augalų kiekis kvadratiniame metre, specifikacija, specifikacijos pastabos, augalo simbolis, blokas, savas simbolis, 3D augalas, detalumo lygis, mastelis
from: 12251beb
---

Atidarykite {{ui:Augalų lentelė}} iš Kraštovaizdžio grupės meniu {{ui:Daugiau}} arba iš skilties Augalai. Kiekviena eilutė yra augalo įrašas šio projekto sąraše (įrašas iš augalų sąrašo nukopijuojamas, kai jį pridedate). Kiekvienas pakeitimas tikrinamas taip, kaip tikrinamas importuotas failas, ir yra vienas anuliavimo žingsnis.

## Stulpeliai

- **Botaninis pavadinimas**, **Bendras pavadinimas**, **Tipas**, **Aukštis** ir **Plotis** užaugus (metrais).
- **Atstumas** (tarp centrų) arba **Tankis** (augalų kiekis m²). Lysvė su įrašu, turinčiu tankį ir neturinčiu atstumo, užpildoma tuo tankiu pagal savo išdėstymą (trikampį ar kvadratinį).
- **Tiekiami dydžiai**: vienas įrašas kiekvienam dydžiui, atskirtas `;`. Kiekvienas įrašas yra id, rūšis (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) ir bet kuris iš: tūris `10L`, aukštis `h0.6`, plotis `s0.4`, apimtis `g14-16` (cm), švarus kamienas `st1.8`. Pavyzdys: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Veislės**: pavadinimai, atskirti `;`. Veislė išlaiko savo dydžius ir pastabas, jei importuotas failas jų turėjo.
- **Specifikacijos pastabos**.

{{ui:Dubliuoti}} nukopijuoja eilutę po nauju raktu; {{ui:Įrašyti kaip CSV}} ir {{ui:Įrašyti kaip augalų failą}} įrašo sąrašą (veislių CSV eilutės yra po jų rūšimi, su `cultivar_of`). Importuojant CSV ar augalų failą, jis sujungiamas su esamu sąrašu.

## Jūsų bibliotekos augalų sąrašas

Prisijunkite prie savo CadCraft paskyros (Parametrai, Jūsų priedai, Prisijungti), tada augalų lentelėje galite naudoti sąrašą, kurį laikote Bibliotekoje:

- {{ui:Iš mano bibliotekos sąrašo}} įkelia jūsų augalų elementus (įskaitant tuos, kurie dar laukia peržiūros). Augalas, kurį jau turite čia, atnaujinamas iš Bibliotekos; veislės, tiekiami dydžiai, tankis ir specifikacija, kuriuos pridėjote čia, išsaugomi.
- {{ui:Įrašyti kaip augalų sąrašą}} įrašo kiekvieną eilutę kaip jūsų bibliotekos augalo elementą, po vieną elementą kiekvienai rūšiai: naujas augalas tampa nauju elementu, pakeistas augalas – nauja versija, nepakeistas paliekamas nepaliestas. Pirmiausia pažymėkite langelį: įrašymas augalus padaro viešus pagal CC0. Pirmą viešą įkėlimą asmens, kuriuo dar nepasitikima, prieš pasirodant patikrina žmogus, kaip ir kiekvieną įkėlimą.

Biblioteka saugo pagrindinį augalo įrašą. Veislės, tiekiami dydžiai, tankis ir specifikacijos pastabos lieka projekte ir augalų faile ({{ui:Įrašyti kaip augalų failą}}); dialogo lange kiekvieną kartą nurodoma, kiek eilučių tai paveikia.

## Įdėtas augalas nurodo dydį

Pasirinkite augalą, gyvatvorę arba mišinio eilutę lysvėje ar apželdintame plote: kai įrašas turi veislių ar tiekiamų dydžių, {{ui:Veislė ir dydis}} parenka vieną. Augalų žiniaraštis tuomet skaičiuoja pagal rūšį, veislę ir dydį, o žymoje gali būti rodomi jie: `{botanical} '{cultivar}' {size}` arba `{full}`.

## Augalų simboliai pagal mastelį

{{ui:Augalų grafika}} (Kraštovaizdis › Daugiau) nustato, kaip augalai braižomi plane: **automatiškai** (stambesnis nei 1:500 – apskritimas augalo plotyje, tarp 1:200 ir 1:500 – kontūras su centru, smulkesnis – detalus simbolis; abu mastelius galima keisti) arba vienas lygis visiems mastelims. Lapų dialoge yra savas **Augalo detalumas plane** tam rinkiniui.

Augalų skiltyje, ant įrašo, {{ui:Savas simbolis…}} nuskaito SVG arba DXF/DWG brėžinio bloką ir braižo jį augalo plote detaliu lygiu. {{ui:Savas 3D modelis…}} nuskaito OBJ, STL arba GLB; augalų grafikoje pasirinkite **Kiekvieno įrašo savas modelis**, kad jį pamatytumėte 3D. Failai ribojami (512 KB SVG, 2000 figūrų, 50 000 trikampių) ir saugomi projekte. SVG transformacijos netaikomos (jums pranešama, kai failas jas turi). Žr. [Augalų grafika, savi simboliai ir 3D augalai](topic:plant-graphics) apie lygius, ribas ir tai, ką gali turėti GLB.
