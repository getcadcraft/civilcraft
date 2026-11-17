---
title: Izvoz lokacije v 3D
summary: Shranite, kar prikazuje 3D pogled, kot datoteko GLB ali OBJ za druge 3D programe, v metrih z Y navzgor, okoli lokalnega izhodišča, ki ga datoteka zabeleži.
keywords: glb, gltf, obj, 3d izvoz, izvoz 3d, izvoz modela, igralni pogon, vizualizacija, 3D pregledovalnik, metri, y navzgor, izhodišče, lokalno izhodišče, državna ravninska projekcija
from: 07d23992
---

3D pogled izvozi, kar prikazuje, kot 3D model, ki ga lahko odpre drug program: 3D pregledovalnik, modelirnik, igralni pogon ali orodje za vizualizacijo.

## Izvoz

1. Odprite 3D pogled ({{key:D}}) in izberite, kaj se prikazuje z {{ui:Pokaži}}. Kar je skrito, ni izvoženo.
2. Kliknite {{ui:GLB}} ali {{ui:OBJ}} na vrstici.
   Datoteka se prenese kot „*ime projekta*-3d.glb“ ali „-3d.obj“, vrstica stanja pa pove izhodišče.

## Kaj vsebujejo datoteke

| | GLB | OBJ |
|---|---|---|
| Površja | Mreže z normalami in barvami pasov ali površij | Mreže z normalami (brez barv) |
| Cevi in objekti | Okrogle mreže, problematične v rdeči | Okrogle mreže |
| Plastnice, prelomnice, trase, oznake, črte koridorja in platojev | Črte, vsak niz v svoji barvi | Zapisi črt (`l`) |
| Geodetske točke | Točke | Zapisi točk (`p`) |

Vsak niz ohrani svoje ime („Obstoječi teren“, „Cevi“, „Glavne plastnice“ itd.), zato ga lahko v drugem programu skrijete ali oblikujete.

## Enote, osi in izhodišče

- **Metri.** Projekt v čevljih se pretvori iz ameriških geodetskih čevljev (1 ft = 1200/3937 m).
- **Y navzgor**, običajna konvencija za te formate: vzhodna koordinata postane +X, kota +Y, severna koordinata −Z.
- **Pravo merilo.** Navpično pretiravanje pogleda se ne uporabi.
- **Lokalno izhodišče.** Koordinate državne ravninske projekcije so milijoni čevljev, prevelike za števila enojne natančnosti, ki jih ti formati shranjujejo, zato se datoteka zapiše glede na bližnje izhodišče: lastno izhodišče obstoječega terena za vzhodno in severno koordinato ter njegovo najnižjo koto, zaokroženo navzdol. Izhodišče v enotah projekta je zabeleženo v datoteki: v GLB kot `extras` na sceni in njenem vrhnjem vozlišču, v OBJ kot komentarna vrstica blizu vrha (`# origin easting … northing … elevation …`). Če želite model postaviti nazaj v koordinate projekta, dodajte izhodišče (pri projektu v čevljih pa metre spet pretvorite v čevlje).

## Še ni izdelano

- Izvoz pretiranega pogleda ali izvoz v enotah projekta namesto v metrih.
- Teksture, datoteka materialov za OBJ (.mtl) in lastnosti posameznih objektov (imena cevi in objektov so samo v programu CivilCraft).
- Izvoz koridorja kot ločenih teles ali pogleda profila v 3D.
