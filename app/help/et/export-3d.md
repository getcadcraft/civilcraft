---
title: Eksport 3D-s
summary: Salvesta, mida 3D-vaade näitab, GLB- või OBJ-failina teistele 3D-programmidele, meetrites, Y-suunaga üles ja kohaliku alguspunkti ümber, mille fail salvestab.
keywords: glb, gltf, obj, 3D-eksport, eksport 3d, mudeli eksport, mängumootor, visualiseerimine, 3D-vaataja, meetrid, y üles, alguspunkt, kohalik alguspunkt, riigi koordinaatsüsteem
from: 07d23992
---

3D-vaade eksportib selle, mida ta näitab, 3D-mudelina, mida saab avada teine programm: 3D-vaataja, modelleerija, mängumootor või visualiseerimistööriist.

## Eksport

1. Ava 3D-vaade ({{key:D}}) ja vali, mis kuvatakse nupuga {{ui:Näita}}. Mis on peidetud, seda ei eksportita.
2. Klõpsa ribal {{ui:GLB}} või {{ui:OBJ}}.
   Fail laaditakse alla nimega „*projekti nimi*-3d.glb“ või „-3d.obj“ ning olekuriba ütleb alguspunkti.

## Mida failid sisaldavad

| | GLB | OBJ |
|---|---|---|
| Pinnad | Võrgud normaalidega ning vööndi- või pinnavärvidega | Võrgud normaalidega (ilma värvideta) |
| Torud ja rajatised | Ümarad võrgud, probleemsed punases | Ümarad võrgud |
| Samakõrgusjooned, murdejooned, trassid, pikettimärgid, koridori- ja platvormijooned | Jooned, igaüks oma värvis | Joonekirjed (`l`) |
| Mõõdistuspunktid | Punktid | Punktikirjed (`p`) |

Iga hulk säilitab oma nime („Olemasolev maapind“, „Torud“, „Põhilised samakõrgusjooned“ jne), nii et saad seda teises programmis peita või kujundada.

## Ühikud, teljed ja alguspunkt

- **Meetrid.** Jalgade projekt teisendatakse USA mõõdistusjalgadest (1 ft = 1200/3937 m).
- **Y üles**, nende vormingute tavaline kokkulepe: idakoordinaat saab +X, kõrgusmärk +Y ja põhjakoordinaat −Z.
- **Tõene mõõtkava.** Vaate vertikaalset liialdust ei rakendata.
- **Kohalik alguspunkt.** Riigi koordinaatsüsteemi koordinaadid on miljonid jalad, liiga suured nende vormingute ühekordse täpsuse arvudele, seega kirjutatakse fail lähedase alguspunkti suhtes: olemasoleva maapinna enda alguspunkt idakoordinaadi ja põhjakoordinaadi jaoks ning selle madalaim kõrgus, ümardatud allapoole. Alguspunkt projekti ühikutes salvestatakse faili: GLB-s `extras`-ina stseenil ja selle ülemisel sõlmel, OBJ-s kommentaaririgana faili alguses (`# origin easting … northing … elevation …`). Mudeli panemiseks tagasi projekti koordinaatidesse lisa alguspunkt (pärast meetrite teisendamist tagasi jalgadeks jalgade projektil).

## Veel tegemata

- Eksportida võimendatud vaadet või eksportida projekti ühikutes meetrite asemel.
- Tekstuure, OBJ materjalifaili (.mtl) ja objekti omadusi (torude ja rajatiste nimed on ainult CivilCraftis).
- Koridori eksportimine eraldi tahkisteks või profiilivaade 3D-s.
