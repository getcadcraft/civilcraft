---
title: Izvoz lokacije u 3D
summary: Sačuvajte ono što 3D prikaz pokazuje kao GLB ili OBJ datoteku za druge 3D programe, u metrima s Y osom prema gore, oko lokalnog ishodišta koje datoteka bilježi.
keywords: glb, gltf, obj, 3D izvoz, izvoz 3D, izvoz modela, igraći pogon, vizualizacija, 3D pregledač, metri, y gore, ishodište, lokalno ishodište, državna projekcija
from: 07d23992
---

3D prikaz izvozi ono što prikazuje kao 3D model koji može otvoriti drugi program: 3D pregledač, modelar, igraći pogon ili alat za vizualizaciju.

## Izvoz

1. Otvorite 3D prikaz ({{key:D}}) i odaberite šta se prikazuje pomoću {{ui:Prikaži}}. Ono što je skriveno se ne izvozi.
2. Kliknite {{ui:GLB}} ili {{ui:OBJ}} na traci.
   Datoteka se preuzima kao "*naziv projekta*-3d.glb" ili "-3d.obj", a statusna traka kaže ishodište.

## Šta datoteke sadrže

| | GLB | OBJ |
|---|---|---|
| Površine | Mreže s normalama i bojama pojasa ili površine | Mreže s normalama (bez boja) |
| Cijevi i objekti | Okrugle mreže, problematične u crvenoj | Okrugle mreže |
| Izohipse, prelomne linije, trase, oznake, linije koridora i platoa | Linije, svaki skup u svojoj boji | Zapisi linija (`l`) |
| Tačke snimanja | Tačke | Zapisi tačaka (`p`) |

Svaki skup zadržava svoj naziv ("Postojeći teren", "Cijevi", "Glavne izohipse" i tako dalje), tako da ga možete sakriti ili stilizovati u drugom programu.

## Jedinice, ose i ishodište

- **Metri.** Projekat u stopama se pretvara iz američkih geodetskih stopa (1 ft = 1200/3937 m).
- **Y gore**, uobičajena konvencija za ove formate: istok postaje +X, kota +Y, a sjever −Z.
- **Prava razmjera.** Vertikalno preuveličavanje prikaza se ne primjenjuje.
- **Lokalno ishodište.** Koordinate državne projekcije su milioni stopa, previše velike za jednostruke brojeve koje ovi formati čuvaju, pa se datoteka zapisuje relativno u odnosu na obližnje ishodište: vlastito ishodište postojećeg terena za istok i sjever, i njegovu najnižu kotu zaokruženu naniže. Ishodište, u jedinicama projekta, bilježi se u datoteci: u GLB-u kao `extras` na sceni i njenom najvišem čvoru, u OBJ-u kao linija komentara blizu vrha (`# origin easting … northing … elevation …`). Da biste model vratili u koordinate projekta, dodajte ishodište (nakon pretvaranja metara nazad u stope za projekat u stopama).

## Još nije napravljeno

- Izvoz preuveličanog prikaza ili izvoz u jedinicama projekta umjesto metara.
- Teksture, datoteka materijala za OBJ (.mtl) i svojstva po objektu (nazivi cijevi i objekata postoje samo u CivilCraft-u).
- Izvoz koridora kao zasebnih tijela, ili pogleda profila u 3D.
