---
title: Izvoz 3D lokacije u USD
summary: Upisuje 3D prikaz lokacije (površi, linije, osovine trase, cevi i geodetske tačke) kao USD u pravoj razmeri i pravim koordinatama.
keywords: usd, usda, usdc, usdz, openusd, izvoz, 3d, lokacija, površ, osovina trase, geodetske tačke, koordinate, sastavljanje scene
from: e7be08ec
---

U 3D prikazu, {{ui:USD}} pored {{ui:GLB}} i {{ui:OBJ}} upisuje ono što prikaz pokazuje kao USD.

1. Otvorite 3D prikaz i izaberite šta da prikazuje.
2. Otvorite {{ui:USD}} i izaberite {{ui:Tekst (.usda)}}, {{ui:Binarni (.usdc)}} ili {{ui:Paket (.usdz)}}.

Datoteka je u pravoj razmeri (vertikalno uvećanje je vraćeno na pravu vrednost), u metrima, sa Z osom nagore. Lokacija je na svojim projektnim istočnim i severnim koordinatama i kotama, i navodi svoj koordinatni sistem kada ga projekat ima. Površi, cevi i objekti su mreže sa svojim bojama; izohipse, linije loma i linije koridora su linije; svaka osovina trase je sopstvena linija pod svojim nazivom; geodetske tačke zadržavaju svoje brojeve.
