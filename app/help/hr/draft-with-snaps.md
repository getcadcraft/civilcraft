---
title: Crtanje s hvatanjima, odabranim kutovima te pomakom, kopiranjem i zakretanjem
summary: Postavite osi, platoe, čestice i linije značajki točno na točke i kutove koje već imate, upišite ili odaberite istočnu i sjevernu koordinatu kuta, okrenite tangentu prema dvjema točkama te pomaknite, kopirajte ili zakrenite objekt za udaljenost ili kut.
keywords: hvatanje, hvatanja, osnap, hvatanje na točku, hvatanje na kut, PI, vrh, kut, odabir, nišan, istok, sjever, koordinate, upisane koordinate, tangenta, smjer, smjerni kut, pomakni, kopiraj, zakreni, transformiraj, kopiraj zakrenuto, dupliciraj, alt, slobodna točka, crtanje
from: 49864dda
---

Novo u 0.9: kad crtate, kursor pada na točke i kutove koji su već u planu, a kut platoa, čestice ili linije značajke može se upisati ili odabrati. Ova tema prolazi kroz tri alata.

## Što ćete raditi

- Crtati s hvatanjima, tako da nova os, plato, čestica ili linija počinju i završavaju točno na nečemu što postoji.
- Postaviti istočnu i sjevernu koordinatu kuta tako da je upišete ili odaberete mjesto u planu.
- Okrenuti tangentu osi prema dvjema odabranim točkama.
- Pomaknuti, kopirati ili zakrenuti cijeli objekt.

## Koraci

1. Odaberite alat za crtanje, na primjer {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} ili {{ui:Feature line}}. Pomaknite pokazivač blizu geodetske točke, PI-točke osi, platoa, kuta čestice ili mase, vrha linije značajke ili građevine oborinske mreže. Pojavi se oznaka s natpisom (PI, Kut, Vrh, Građevina ili Točka i njezin broj) te istočna i sjeverna koordinata na koju će pasti. Kliknite da tamo postavite točku.
2. Da postavite točku slobodno, držite {{key:Alt}} dok kliknete. Hvatanje se isključuje.
3. Odaberite plato, česticu ili liniju značajke. U **Svojstvima** blok {{ui:Corners}} navodi svaki kut s poljem Istok i poljem Sjever. Upišite nove brojeve ili pritisnite gumb nišana pored kuta i kliknite mjesto u planu. Kut poprima tu istočnu i sjevernu koordinatu. Pritisnite {{key:Esc}} za odustajanje od odabira. Nišan radi samo u planu: prvo zatvorite 3D prikaz.
4. Da okrenete tangentu, odaberite os. U **Svojstvima**, pod {{ui:Tangent from two points}}, odaberite tangentu, pritisnite {{ui:First point}} i kliknite u planu, pritisnite {{ui:Second point}} i kliknite ponovno, zatim pritisnite {{ui:Set direction}}. Tangenta se okreće da ide od prve točke prema drugoj i zadržava svoju duljinu.
5. Da pomaknete, kopirate ili zakrenete, odaberite os, plato, česticu ili liniju značajke. U **Svojstvima**, pod {{ui:Move, copy and rotate}}, upišite {{ui:Move east}} i {{ui:Move north}} (negativni brojevi idu na zapad i jug) i pritisnite {{ui:Move}} ili {{ui:Copy}}. Ili pritisnite {{ui:Distance from two points}} i kliknite točku s koje se miče i točku na koju se miče.
6. Da zakrenete, upišite kut u {{ui:Rotate counter-clockwise}} (stupnjevi), zatim pritisnite {{ui:Rotate}} ili {{ui:Copy rotated}}. Zakreće se oko sredine svojih kutova, osim ako odaberete točku oko koje se zakreće nišanom pored kuta.

## Napomene

- Kopija ostavlja original tamo gdje je i nakon toga je odabrana.
- Svako pomicanje, kopiranje, zakretanje, odabrani kut i okrenuta tangenta jedan su korak poništavanja.
- Hvatanja dosežu 10 piksela zaslona od kursora. Oznaka hvatanja samo nudi mjesto; ništa se ne mijenja dok ne kliknete.
- Isti nišan nalazi se u recima PI-točaka osi. Vidi [Osi trase](topic:alignment), [Čestice](topic:parcels) i [Linije značajki](topic:feature-lines).
