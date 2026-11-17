---
title: Izvoz lokacije u 3D
summary: Spremite ono što 3D prikaz pokazuje kao GLB ili OBJ datoteku za druge 3D programe, u metrima s Y prema gore, oko lokalnog ishodišta koje datoteka bilježi.
keywords: glb, gltf, obj, 3D izvoz, izvoz 3D, izvoz modela, pogon za igre, vizualizacija, 3D preglednik, metri, y prema gore, ishodište, lokalno ishodište, državna ravnina
from: 07d23992
---

3D prikaz izvozi ono što prikazuje kao 3D model koji drugi program može otvoriti: 3D preglednik, modelator, pogon za igre ili alat za vizualizaciju.

## Izvoz

1. Otvorite 3D prikaz ({{key:D}}) i odaberite što se prikazuje pomoću {{ui:Prikaži}}. Ono što je skriveno ne izvozi se.
2. Kliknite {{ui:GLB}} ili {{ui:OBJ}} na traci.
   Datoteka se preuzima kao „*naziv projekta*-3d.glb“ ili „-3d.obj“, a statusna traka navodi ishodište.

## Što datoteke sadrže

| | GLB | OBJ |
|---|---|---|
| Tereni | Mreže s normalama i bojama pojaseva ili terena | Mreže s normalama (bez boja) |
| Cijevi i građevine | Okrugle mreže, problematične u crvenoj | Okrugle mreže |
| Izohipse, prijelomnice, osi trasa, oznake, linije koridora i platoa | Linije, svaki skup u svojoj boji | Zapisi linija (`l`) |
| Geodetske točke | Točke | Zapisi točaka (`p`) |

Svaki skup zadržava svoj naziv („Postojeći teren“, „Cijevi“, „Glavne izohipse“ i tako dalje), pa ga u drugom programu možete sakriti ili oblikovati.

## Jedinice, osi i ishodište

- **Metri.** Projekt u stopama pretvara se iz američkih geodetskih stopa (1 ft = 1200/3937 m).
- **Y prema gore**, uobičajena konvencija za ove formate: istok postaje +X, visina +Y, a sjever −Z.
- **Pravo mjerilo.** Vertikalno pretjerivanje prikaza se ne primjenjuje.
- **Lokalno ishodište.** Koordinate državne ravnine su milijuni stopa, prevelike za brojeve jednostruke preciznosti koje ovi formati pohranjuju, pa se datoteka zapisuje relativno prema obližnjem ishodištu: ishodište samog postojećeg terena za istok i sjever te njegova najniža visina zaokružena naniže. Ishodište, u jedinicama projekta, zapisano je u datoteci: u GLB-u kao `extras` na sceni i njezinom vršnom čvoru, u OBJ-u kao redak komentara pri vrhu (`# origin easting … northing … elevation …`). Da model vratite u koordinate projekta, dodajte ishodište (nakon pretvaranja metara natrag u stope u projektu u stopama).

## Još nije izrađeno

- Izvoz pretjeranog prikaza ili izvoz u jedinicama projekta umjesto metara.
- Teksture, datoteka materijala za OBJ (.mtl) i svojstva po objektu (nazivi cijevi i građevina postoje samo u CivilCraftu).
- Izvoz koridora kao zasebnih tijela ili uzdužnog profila u 3D.
