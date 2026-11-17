---
title: Objektai iš linijų, išlaikant susietus
summary: Sukurkite grindinį, apsodintą plotą, lysvę, gyvatvorę, taką, sieną, bordiūrą, laiptus, nuožulnią, aikštelę, griovį ar charakteringą liniją iš linijos; objektas seka linijos pokyčius, kol nenutraukiate ryšio.
keywords: iš linijos, linijų grafika, DWG, DXF, ryšys, susietas, sekti, atkurti, nutraukti ryšį, charakteringa linija, importuotas sluoksnis, kontūras, supercad studio, brėžinio linija
from: eb67a0c6
---

{{ui:Iš linijos}} (Kraštovaizdis › {{ui:Daugiau}}): spustelėkite charakteringą liniją arba importuoto DWG/DXF sluoksnio liniją ar kontūrą. Uždara linija gali sukurti grindinį, veją, apsodintą lysvę, pievą, žemės dangą, lysvę ar aikštelę; atvira – taką, sieną, bordiūrą, laiptus (pirmas ir paskutinis taškas), nuožulnią, gyvatvorę ar griovį. Abiejų rūšių linija gali sukurti **charakteringą liniją**, išskyrus pačią charakteringą liniją.

## Charakteringa linija iš linijos

Charakteringa linija, sukurta iš linijos, perima jos taškus, uždara, jei linija buvo uždara. Jos aukščiai nustatomi esamame grunte (0, jei dar nėra), o jos naudojimas yra **Išjungta**: ji nieko neformuoja, kol nepasirinksite naudojimo ir nenustatysite aukščių jos Ypatybėse. Kai linija pasislenka, charakteringa linija su tuo pačiu taškų skaičiumi išlaiko kiekvieną jūsų nustatytą aukštį; kai linija įgyja ar praranda taškų, aukščiai iš naujo nustatomi pagal gruntą. Žr. [Charakteringos linijos](topic:feature-lines).

Naujas objektas išlaiko **ryšį** su savo linija. Kai linija pasislenka (vilkite jos taškus arba brėžinys perkeliamas ar perskaitomas iš naujo), objektas įgyja naują formą tuo pačiu atšaukimo žingsniu, o per grunto modifikatorius projektinis gruntas seka. Ypatybėse nurodoma, prie ko jis susietas; {{ui:Nutraukti ryšį}} padaro jį laisvą.

Linijos tikrinamos pirmiausia: linijai reikia bent 2 taškų (3 kontūrui), daugiausia 5000, realių skaičių, kontūras turi būti uždaras ir nekirsti savęs. Linija, kuri neatitinka reikalavimų, nenaudojama: objektas lieka toks, koks buvo, o Problemų skydelis nurodo priežastį. Jei linija ištrinama, objektas lieka, o Problemų skydelis tai pažymi.

## SuperCad Studio

Atidarykite vietą ir 2D brėžinį tame pačiame projekte. Pasirinkite vieną liniją ar polilinija 2D brėžinyje, paspauskite Ctrl+K ir paleiskite {{ui:Kraštovaizdžio objektas iš pažymėtos brėžinio linijos}}: CivilCraft paklaus, ką sukurti, kaip aukščiau, ir objektas lieka susietas su ta brėžinio linija. Pakeitus linijas brėžinyje, Ctrl+K {{ui:Atnaujinti kraštovaizdį iš brėžinio}} priverčia objektus sekti, po vieną atšaukimo žingsnį kiekvienai linijai. Projekto ryšių failas įrašo, kuris objektas seka kurią liniją. SuperCad Studio savo žinyne yra kraštovaizdžio tema.
