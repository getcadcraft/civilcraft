---
title: Augalų grafika pagal mastelį, savi simboliai ir 3D augalai
summary: Kaip augalai braižomi plane kiekviename braižymo mastelyje ir detalumo lygyje, o kaip augalo įrašas gauna savo simbolį (SVG arba DXF/DWG bloką) ir savo 3D modelį (OBJ, STL arba GLB).
keywords: augalų grafika, augalo simbolis, simbolis pagal mastelį, detalumo lygis, paprastas apskritimas, kontūras, detalus simbolis, savas simbolis, blokas, svg, dxf, dwg, 3D augalas, savas 3D modelis, obj, stl, glb, gltf, medžio modelis, augalai 3D
from: 875837d9
---

## Simboliai plane pagal mastelį

Kraštovaizdis › {{ui:Daugiau}} › {{ui:Augalų grafika}} nustato, kaip augalai braižomi plane. **Automatiškai pagal mastelį** pasirenka vieną iš trijų lygių pagal braižymo mastelį:

- **Paprastas apskritimas** (stambesnis nei 1:500): apskritimas augalo plotyje.
- **Kontūras su centru** (nuo 1:500 iki 1:200): apskritimas ir mažas centrinis kryžius.
- **Detalus simbolis** (smulkesnis nei 1:200): įrašo savas simbolis, jei jis yra, kitaip įmontuotas simbolis.

Abu mastelius keičiate laukeliais **Paprastas nuo 1:** ir **Kontūras nuo 1:**, arba pasirinkite vieną lygį visiems mastelims. Kiekvienas lapų rinkinys lapų dialoge turi savo **Augalo detalumas plane**, todėl 1:500 situacijos planas ir 1:100 sodinimo planas gali skirtis. Nustatymai įrašomi kartu su projektu.

## Savas simbolis

Augalų skiltyje pasirinkite augalą ir paspauskite {{ui:Savas simbolis…}}. Programa nuskaito SVG failą arba DXF ar DWG brėžinio bloką (jei brėžinyje yra keli blokai, pasirenkate vieną). Simbolis pritaikomas prie augalo ploto ir braižomas detaliu lygiu. Jis saugomas projekte, todėl failas keliauja kartu su juo.

- SVG nuskaitomos linijos, polilinijos, daugiakampiai, stačiakampiai, apskritimai, elipsės ir kontūrai. Skriptai, stiliai, nuorodos ir paveikslėliai juose niekada nenagrinėjami. Transformacijos netaikomos: jums pranešama, kai failas jas turi, todėl pirmiausia jas išlyginkite savo braižymo programoje.
- Ribos: 512 KB SVG ir 2000 figūrų. Per didelis failas atmetamas, nurodant priežastį.

## Savas 3D augalas

{{ui:Savas 3D modelis…}} tame pačiame įraše nuskaito **OBJ**, **STL** arba **GLB** failą. Tada augalų grafikoje nustatykite **Augalai 3D** į **Kiekvieno įrašo savas modelis**: kiekvienas to įrašo augalas rodo jūsų modelį, pamatuotą pagal jo aukštį ir plotį. Įrašai be savo modelio lieka su įmontuotomis formomis. Greitiems didelių sklypų vaizdams pasirinkite **Paprastos masės**.

GLB nuskaitoma tik dėl formos:

- Viskas, ko modeliui reikia, turi būti .glb faile. Modelis, nukreiptas į kitus failus (atskirą .bin ar paveikslėlius pagal adresą), atmetamas: nieko neatsisiunčiama.
- Suspaustos ar supakuotos geometrijos (Draco, meshopt, kvantuotos pozicijos) nenuskaitomos. Eksportuokite be suspaudimo.
- Failo tekstūros ir spalvos nenaudojamos: modelis piešiamas augalo spalva. Tekstūros vis tiek tikrinamos, o tekstūra, didesnė nei 4096 pikseliai iš kraštinės, atmetama.
- Ribos: 32 MB failas, 50 000 trikampių (skaičiuojant kiekvieną dalies kopiją, jei ji įdėta daugiau nei kartą), 64 paveikslėliai ir 16 MB paveikslėlių.

Kiekviena riba atmeta failą ir nurodo priežastį; nieko iš dalies nuskaityto neišsaugoma. Vienas anuliavimo žingsnis suteikia įrašui simbolį ar modelį, o {{ui:Pašalinti savą simbolį}} arba {{ui:Pašalinti savą 3D modelį}} jį pašalina.

Žr. [Augalų įrašai](topic:plant-records) apie patį įrašą ir [Sklypo vaizdas 3D](topic:site-3d).
