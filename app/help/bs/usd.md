---
title: Izvoz 3D lokacije kao USD
summary: Zapiši 3D prikaz lokacije (površine, linije, ose trase, cijevi i geodetske tačke) kao USD u stvarnoj razmjeri i stvarnim koordinatama.
keywords: usd, usda, usdc, usdz, openusd, izvoz, 3d, lokacija, površina, osa trase, geodetske tačke, koordinate, sastavljanje scene
from: e7be08ec
---

U 3D prikazu, {{ui:USD}} pored {{ui:GLB}} i {{ui:OBJ}} zapisuje ono što prikaz pokazuje kao USD.

1. Otvori 3D prikaz i izaberi šta da se prikazuje.
2. Otvori {{ui:USD}} i izaberi {{ui:Tekst (.usda)}}, {{ui:Binarni (.usdc)}} ili {{ui:Paket (.usdz)}}.

Datoteka je u stvarnoj razmjeri (vertikalno preuveličavanje je uklonjeno), u metrima, sa Z osom prema gore. Lokacija se nalazi na svojim projektnim istočnim i sjevernim koordinatama i kotama, i navodi svoj koordinatni sistem kad ga projekat ima. Površine, cijevi i konstrukcije su mreže sa svojim bojama; izohipse, prelomne linije i linije koridora su linije; svaka osa trase je svoja linija pod svojim nazivom; geodetske tačke zadržavaju svoje brojeve.
