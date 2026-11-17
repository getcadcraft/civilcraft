---
title: Izvoz lokacije u 3D
summary: Sačuvajte ono što 3D prikaz pokazuje kao GLB ili OBJ datoteku za druge 3D programe, u metrima sa Y osom naviše, oko lokalnog početka koji datoteka beleži.
keywords: glb, gltf, obj, 3d izvoz, izvoz 3d, izvoz modela, pogon za igre, vizualizacija, 3d pregledač, metri, y osa naviše, početak, lokalni početak, state plane
from: 07d23992
---

3D prikaz izvozi ono što prikazuje kao 3D model koji drugi program može da otvori: 3D pregledač, modelar, pogon za igre ili alat za vizualizaciju.

## Izvoz

1. Otvorite 3D prikaz ({{key:D}}) i izaberite šta se prikazuje pomoću {{ui:Prikaz}}. Ono što je sakriveno se ne izvozi.
2. Kliknite {{ui:GLB}} ili {{ui:OBJ}} na traci.
   Datoteka se preuzima kao „*naziv projekta*-3d.glb“ ili „-3d.obj“, a statusna traka kaže početak.

## Šta datoteke sadrže

| | GLB | OBJ |
|---|---|---|
| Površi | Mreže sa normalama i bojama pojasa ili površi | Mreže sa normalama (bez boja) |
| Cevi i objekti | Okrugle mreže, oni sa problemima su crveni | Okrugle mreže |
| Izohipse, linije loma, trase, podeoci, linije koridora i platoa | Linije, svaki skup u svojoj boji | Zapisi linija (`l`) |
| Tačke snimanja | Tačke | Zapisi tačaka (`p`) |

Svaki skup zadržava svoj naziv („Postojeći teren“, „Cevi“, „Glavne izohipse“ i tako dalje), pa ga u drugom programu možete sakriti ili stilizovati.

## Jedinice, ose i početak

- **Metri.** Projekat u stopama se pretvara iz američkih geodetskih stopa (1 ft = 1200/3937 m).
- **Y naviše**, uobičajena konvencija za ove formate: istočna koordinata postaje +X, kota +Y, a severna −Z.
- **Prava razmera.** Vertikalno preterivanje prikaza se ne primenjuje.
- **Lokalni početak.** Koordinate ravnog državnog sistema (State plane) su milioni stopa, previše za jednostruku preciznost koju ovi formati čuvaju, pa se datoteka piše u odnosu na obližnji početak: sopstveni početak postojećeg terena za istočnu i severnu koordinatu, i njegova najniža kota zaokružena naniže. Početak, u jedinicama projekta, beleži se u datoteci: u GLB-u kao `extras` na sceni i njenom vršnom čvoru, u OBJ-u kao linija komentara blizu vrha (`# origin easting … northing … elevation …`). Da biste model vratili u koordinate projekta, dodajte početak (posle pretvaranja metara nazad u stope za projekat u stopama).

## Nije još napravljeno

- Izvoz preuveličanog prikaza, ili izvoz u jedinicama projekta umesto u metrima.
- Teksture, datoteka materijala za OBJ (.mtl) i svojstva po objektu (nazivi cevi i objekata postoje samo u CivilCraft-u).
- Izvoz koridora kao zasebnih tela, ili pogleda profila u 3D.
