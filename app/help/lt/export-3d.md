---
title: Eksportuoti aikštelę 3D
summary: Įrašykite tai, ką rodo 3D vaizdas, kaip GLB arba OBJ failą kitoms 3D programoms: metrais, su Y ašimi aukštyn, aplink vietinį pradžios tašką, kurį failas įrašo.
keywords: glb, gltf, obj, 3d eksportas, eksportuoti 3d, modelio eksportas, žaidimų variklis, vizualizacija, 3d peržiūros programa, metrai, y aukštyn, pradžios taškas, vietinis pradžios taškas, valstybinė plokštuma
from: 07d23992
---

3D vaizdas eksportuoja tai, ką rodo, kaip 3D modelį, kurį gali atidaryti kita programa: 3D peržiūros programa, modeliavimo programa, žaidimų variklis ar vizualizacijos įrankis.

## Eksportavimas

1. Atidarykite 3D vaizdą ({{key:D}}) ir pasirinkite, kas rodoma, su {{ui:Rodyti}}. Kas paslėpta, neeksportuojama.
2. Spustelėkite {{ui:GLB}} arba {{ui:OBJ}} juostoje.
   Failas atsisiunčiamas kaip „*projekto pavadinimas*-3d.glb“ arba „-3d.obj“, o būsenos juosta nurodo pradžios tašką.

## Ką talpina failai

| | GLB | OBJ |
|---|---|---|
| Paviršiai | Tinkleliai su normalėmis ir juostų ar paviršių spalvomis | Tinkleliai su normalėmis (be spalvų) |
| Vamzdžiai ir konstrukcijos | Apvalūs tinkleliai, su problemomis – raudoni | Apvalūs tinkleliai |
| Horizontalės, lūžio linijos, trasos, brūkšneliai, koridoriaus ir aikštelių linijos | Linijos, kiekvienas rinkinys savo spalva | Linijų įrašai (`l`) |
| Geodeziniai taškai | Taškai | Taškų įrašai (`p`) |

Kiekvienas rinkinys išlaiko savo pavadinimą („Esamas paviršius“, „Vamzdžiai“, „Pagrindinės horizontalės“ ir t. t.), todėl kitoje programoje galite jį paslėpti ar stilizuoti.

## Vienetai, ašys ir pradžios taškas

- **Metrai.** Pėdų projektas konvertuojamas iš JAV geodezinių pėdų (1 ft = 1200/3937 m).
- **Y aukštyn** – įprasta šiems formatams konvencija: rytų koordinatė tampa +X, kota +Y, o šiaurės koordinatė −Z.
- **Tikras mastelis.** Vaizdo vertikalus perdėjimas netaikomas.
- **Vietinis pradžios taškas.** Valstybinės plokštumos koordinatės yra milijonai pėdų, per didelės vienatiksliams skaičiams, kuriuos šie formatai saugo, todėl failas įrašomas santykiu su artimu pradžios tašku: esamo paviršiaus savo pradžios tašku rytų ir šiaurės koordinatėms bei jo žemiausia kota, suapvalinta žemyn. Pradžios taškas projekto vienetais įrašomas faile: GLB – kaip `extras` scenoje ir jos viršutiniame mazge, OBJ – kaip komentaro eilutė netoli failo viršaus (`# origin easting … northing … elevation …`). Kad modelį grąžintumėte į projekto koordinates, pridėkite pradžios tašką (po to, kai metrai konvertuojami atgal į pėdas pėdų projekte).

## Dar nepadaryta

- Perdėto vaizdo eksportas arba eksportas projekto vienetais, o ne metrais.
- Tekstūros, OBJ medžiagų failas (.mtl) ir kiekvieno objekto savybės (vamzdžių ir konstrukcijų pavadinimai yra tik CivilCraft).
- Koridoriaus eksportas kaip atskiri kūnai arba profilio vaizdas 3D.
