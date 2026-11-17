---
title: Izvoz 3D lokacije u USD
summary: Zapišite 3D prikaz lokacije (teren, linije, osi, cijevi i geodetske točke) kao USD u točnom mjerilu i točnim koordinatama.
keywords: usd, usda, usdc, usdz, openusd, izvoz, 3d, lokacija, teren, os, geodetske točke, koordinate, sastavljanje scene
from: e7be08ec
---

U 3D prikazu, {{ui:USD}} pored {{ui:GLB}} i {{ui:OBJ}} zapisuje ono što prikaz prikazuje kao USD.

1. Otvorite 3D prikaz i odaberite što prikazati.
2. Otvorite {{ui:USD}} i odaberite {{ui:Tekst (.usda)}}, {{ui:Binarni (.usdc)}} ili {{ui:Paket (.usdz)}}.

Datoteka je u točnom mjerilu (vertikalno pretjerivanje se uklanja), u metrima s Z prema gore. Lokacija se nalazi na svojim projektnim istočnim i sjevernim koordinatama i kotama te navodi svoj koordinatni sustav ako ga projekt ima. Tereni, cijevi i građevine su mreže sa svojim bojama; izohipse, prijelomnice i linije koridora su linije; svaka os je vlastita linija pod svojim nazivom; geodetske točke zadržavaju svoje brojeve.
