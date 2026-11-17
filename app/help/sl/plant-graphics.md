---
title: Grafika rastlin glede na merilo, lastni simboli in rastline v 3D
summary: Kako so rastline narisane v tlorisu pri vsakem merilu risbe in stopnji podrobnosti ter kako zapis rastline dobi lasten simbol (SVG ali blok DXF/DWG) in lasten 3D model (OBJ, STL ali GLB).
keywords: grafika rastlin, simbol rastline, simbol glede na merilo, stopnja podrobnosti, podrobnost, preprost krog, obris, podroben simbol, lasten simbol, blok, svg, dxf, dwg, 3d rastlina, lasten 3d model, obj, stl, glb, gltf, model drevesa, rastline v 3d
from: 875837d9
---

## Simboli v tlorisu glede na merilo

Krajinska ureditev › {{ui:More}} › {{ui:Plant graphics}} določa, kako so rastline narisane v tlorisu. **Samodejno, glede na merilo** izbere eno od treh stopenj glede na merilo risbe:

- **Preprost krog** (grobleje od 1:500): krog v širini rastline.
- **Obris s središčem** (od 1:500 do 1:200): krog in majhen križec v središču.
- **Podroben simbol** (natančneje od 1:200): lastni simbol zapisa, če ga ima, sicer vgrajeni simbol.

Meji obeh meril spremenite z **Preprosto od 1:** in **Obris od 1:**, ali izberite eno stopnjo za vsa merila. Vsak komplet listov v pogovornem oknu Listi ima svojo **Podrobnost rastlin v tlorisu**, zato se lahko načrt mesta pri 1:500 in načrt sajenja pri 1:100 razlikujeta. Nastavitve se shranijo s projektom.

## Lastni simbol

V razdelku Rastline izberite rastlino in pritisnite {{ui:Own symbol…}}. Program prebere SVG ali blok risbe DXF ali DWG (če risba vsebuje več blokov, izberete enega). Simbol se prilagodi širini rastline in nariše na podrobni stopnji. Shranjen je v projektu, zato datoteka potuje z njim.

- SVG se prebere za črte, polilinije, poligone, pravokotnike, kroge, elipse in poti. Skripti, slogi, povezave in slike v njem se nikoli ne preverjajo. Transformacije se ne uporabijo: obveščeni boste, če datoteka jih ima, zato jih najprej poenostavite v svojem risalnem programu.
- Omejitve: 512 KB SVG in 2000 oblik. Večja datoteka se zavrne z razlogom.

## Lastna 3D rastlina

{{ui:Own 3D model…}} na istem zapisu prebere datoteko **OBJ**, **STL** ali **GLB**. Nato v {{ui:Plant graphics}} nastavite **Rastline v 3D** na **Lastni model vsakega zapisa**: vsaka rastlina tega zapisa prikazuje vaš model, prilagojen njeni višini in širini. Zapisi brez lastnega modela ohranijo vgrajene oblike. Za hitre preglede velikih mest izberite **Preprosti volumni**.

GLB se prebere samo za obliko:

- Vse, kar model potrebuje, mora biti znotraj datoteke .glb. Model, ki kaže na druge datoteke (ločen .bin ali slike po naslovu), se zavrne: nič se ne prenese.
- Stisnjena ali pakirana geometrija (Draco, meshopt, kvantizirane pozicije) se ne prebere. Izvozite brez stiskanja.
- Teksture in barve v datoteki se ne uporabijo: model se riše v barvi rastline. Teksture se še vedno preverijo, tekstura, večja od 4096 pikslov na stran, pa se zavrne.
- Omejitve: datoteka 32 MB, 50 000 trikotnikov (šteje se vsaka kopija dela, postavljenega večkrat), 64 slik in 16 MB slik.

Vsaka omejitev zavrne datoteko z razlogom; nič delno prebranega se ne shrani. En korak razveljavitve zapisu da simbol ali model, {{ui:Remove own symbol}} ali {{ui:Remove own 3D model}} pa ga odstranita.

Glejte [Zapisi rastlin](topic:plant-records) za sam zapis in [Ogled mesta v 3D](topic:site-3d).
