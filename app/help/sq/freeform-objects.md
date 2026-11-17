---
title: Objekte me formë të lirë
summary: Sillni në vend një formë të bërë në një aplikacion tjetër (STL, OBJ ose një element biblioteke); qëndron mbi tokë ose pritet në të, dhe vëllimi, sipërfaqja dhe gjurma e saj numërohen si gjithçka tjetër.
keywords: formë e lirë, objekt me porosi, skulpturë, vazo bimësh, ulëse, rrjetë, stl, obj, element biblioteke, ndjek terrenin, pritet në terren, sasi, vëllim, ifc
from: ec835f33
---

Një veçori e vetme (një vazo bimësh, një mur ulëse, një skulpturë, një kodër lojërash) mund të bëhet në ModelCraft ose PartCraft dhe të vendoset këtu, që të jetë në të njëjtin model dhe tabela si gjithçka tjetër.

1. Peizazh › Më shumë › {{ui:Freeform object…}} dhe zgjidhni një skedar **STL** ose **OBJ** (në njësitë e projektit: këmbë në një projekt në këmbë, metra në një projekt në metra) ose një **element biblioteke** CadCraft (`.json`) me trup rrjeti.
2. Klikoni ku shkon.

## Baza e tij

- **Ndjek terrenin**: pika e tij më e ulët qëndron mbi terrenin më të ulët nën gjurmën e tij, kështu që asgjë nuk fluturon. Vetitë vlerësojnë sa prej tij është nën tokë.
- **Pret terrenin**: baza e tij vendoset në një kotë dhe terreni brenda gjurmës së tij niveluhet deri atje me pjerrësi dritë dite, dhe numërohet te **Punimet e dheut** si një platformë.

Rrotullojeni me **Rrotullo** dhe tërhiqeni në planimetri për ta zhvendosur.

## Numërohet

Vetitë i japin **vëllimin** (për një trup të mbyllur), **sipërfaqen**, **gjurmën** dhe **lartësinë**, të matura nga rrjeti. Eksportimi IFC e shkruan me **klasën IFC** që zgjidhni dhe ato sasi.

:::note
Gjurma është mbështjella konvekse e konturit: një formë konkave (një vazo bimësh në formë L) niveluhet sikur të ishte e mbushur.
:::
