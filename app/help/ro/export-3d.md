---
title: Exportul sitului în 3D
summary: Salvați ce arată vizualizarea 3D ca fișier GLB sau OBJ pentru alte programe 3D, în metri, cu Y în sus, în jurul unei origini locale pe care fișierul o înregistrează.
keywords: glb, gltf, obj, export 3d, export model, motor de joc, vizualizare, vizualizator 3D, metri, Y în sus, origine, origine locală, state plane
from: 07d23992
---

Vizualizarea 3D exportă ce afișează ca model 3D pe care îl poate deschide un alt program: un vizualizator 3D, un program de modelare, un motor de joc sau un instrument de vizualizare.

## Export

1. Deschideți vizualizarea 3D ({{key:D}}) și alegeți ce se afișează cu {{ui:Afișare}}. Ce este ascuns nu este exportat.
2. Faceți clic pe {{ui:GLB}} sau {{ui:OBJ}} din bară.
   Fișierul se descarcă drept „*nume proiect*-3d.glb” sau „-3d.obj”, iar bara de stare arată originea.

## Ce conțin fișierele

| | GLB | OBJ |
|---|---|---|
| Modele de teren | Rețele cu normale și culorile benzilor sau ale suprafețelor | Rețele cu normale (fără culori) |
| Conducte și structuri | Rețele rotunde, cele cu probleme în roșu | Rețele rotunde |
| Curbe de nivel, linii de rupere, axe de traseu, repere, linii de coridor și de platformă | Linii, fiecare set în culoarea sa | Înregistrări de linie (`l`) |
| Puncte topografice | Puncte | Înregistrări de punct (`p`) |

Fiecare set își păstrează numele („Teren existent”, „Conducte”, „Curbe de nivel principale” și așa mai departe), astfel încât îl puteți ascunde sau stiliza în celălalt program.

## Unități, axe și origine

- **Metri.** Un proiect în feet este convertit din US survey feet (1 ft = 1200/3937 m).
- **Y în sus**, convenția obișnuită pentru aceste formate: Y (est) devine +X, cota devine +Y, iar X (nord) devine −Z.
- **Scară reală.** Exagerarea verticală a vizualizării nu este aplicată.
- **O origine locală.** Coordonatele state plane sunt de milioane de feet, prea mari pentru numerele în virgulă mobilă de precizie simplă pe care le stochează aceste formate, așa că fișierul este scris față de o origine apropiată: originea proprie a terenului existent pentru Y (est) și X (nord) și cota sa cea mai joasă, rotunjită în jos. Originea, în unitățile proiectului, este înregistrată în fișier: într-un GLB ca `extras` pe scenă și pe nodul său de sus, într-un OBJ ca linie de comentariu aproape de început (`# origin easting … northing … elevation …`). Pentru a pune modelul înapoi în coordonatele proiectului, adăugați originea (după ce convertiți metrii înapoi în feet pentru un proiect în feet).

## Încă nerealizat

- Exportul vizualizării exagerate sau exportul în unitățile proiectului în locul metrilor.
- Texturi, un fișier de materiale pentru OBJ (.mtl) și proprietăți pe obiect (numele conductelor și structurilor există doar în CivilCraft).
- Exportul coridorului ca solide separate sau al vizualizării profilului în 3D.
