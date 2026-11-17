---
title: Exportul sitului 3D în USD
summary: Scrie vizualizarea 3D a sitului (suprafețe, linii, aliniamente, conducte și puncte topografice) în USD, la scară reală și în coordonate reale.
keywords: usd, usda, usdc, usdz, openusd, export, 3d, sit, suprafață, aliniament, puncte topografice, coordonate, asamblare scenă
from: e7be08ec
---

În vizualizarea 3D, {{ui:USD}} alături de {{ui:GLB}} și {{ui:OBJ}} scrie ce arată vizualizarea în format USD.

1. Deschideți vizualizarea 3D și alegeți ce să afișeze.
2. Deschideți {{ui:USD}} și alegeți {{ui:Text (.usda)}}, {{ui:Binary (.usdc)}} sau {{ui:Package (.usdz)}}.

Fișierul este la scară reală (exagerarea verticală este scoasă), în metri, cu Z în sus. Situl se află la coordonatele de est, de nord și la cotele sale din proiect și își indică sistemul de coordonate atunci când proiectul are unul. Suprafețele, conductele și structurile sunt plase cu culorile lor; curbele de nivel, liniile de rupere și liniile de coridor sunt linii; fiecare aliniament este propria linie, sub numele său; punctele topografice își păstrează numerele.
