---
title: Plantsymbolen per schaal, eigen symbolen en 3D-planten
summary: Hoe planten in plan per tekenschaal en detailniveau worden getekend, en hoe een plantrecord een eigen symbool (SVG, of een DXF/DWG-blok) en een eigen 3D-model (OBJ, STL of GLB) krijgt.
keywords: plantsymbolen, plantsymbool, symbool per schaal, detailniveau, eenvoudige cirkel, omtrek, gedetailleerd symbool, eigen symbool, blok, svg, dxf, dwg, 3D-plant, eigen 3D-model, obj, stl, glb, gltf, boommodel, planten in 3D
from: 875837d9
---

## Plansymbolen per schaal

Landschap › {{ui:More}} › {{ui:Plant graphics}} bepaalt hoe planten in plan worden getekend. **Automatisch, per schaal** kiest een van drie niveaus op basis van de tekenschaal:

- **Eenvoudige cirkel** (grover dan 1:500): een cirkel op de breedte van de plant.
- **Omtrek met middelpunt** (van 1:500 tot 1:200): de cirkel en een klein middelkruis.
- **Gedetailleerd symbool** (fijner dan 1:200): het eigen symbool van het record als het er een heeft, anders het ingebouwde symbool.

Wijzig de twee schalen met **Eenvoudig vanaf 1:** en **Omtrek vanaf 1:**, of kies één niveau voor elke schaal. Elke bladenset in het dialoogvenster Bladen heeft een eigen **Plantdetail in plan**, zodat een terreinplan van 1:500 en een beplantingsplan van 1:100 kunnen verschillen. De instellingen worden met het project opgeslagen.

## Eigen symbool

Kies een plant in het deel Planten en druk op {{ui:Own symbol…}}. Het leest een SVG, of een blok uit een DXF- of DWG-tekening (heeft de tekening meerdere blokken, dan kiest u er één). Het symbool wordt op de breedte van de plant ingepast en op het gedetailleerde niveau getekend. Het wordt in het project bewaard, zodat het bestand meereist.

- Een SVG wordt gelezen op zijn lijnen, polylijnen, veelhoeken, rechthoeken, cirkels, ellipsen en paden. Scripts, stijlen, links en afbeeldingen erin worden nooit bekeken. Transformaties worden niet toegepast: u krijgt een melding wanneer het bestand die heeft, dus vlak ze eerst af in uw tekenprogramma.
- Grenzen: 512 KB SVG en 2000 vormen. Een groter bestand wordt geweigerd, met de reden.

## Eigen 3D-plant

{{ui:Own 3D model…}} op hetzelfde record leest een **OBJ**-, **STL**- of **GLB**-bestand. Stel daarna in Plantsymbolen **Planten in 3D** in op **Eigen model van elk record**: elke plant van dat record toont uw model, geschaald naar zijn hoogte en breedte. Records zonder eigen model houden de ingebouwde vormen. Kies **Eenvoudige massa's** voor snelle beelden van grote terreinen.

Een GLB wordt alleen op zijn vorm gelezen:

- Alles wat het model nodig heeft, moet in het .glb-bestand staan. Een model dat naar andere bestanden verwijst (een apart .bin, of afbeeldingen via een adres) wordt geweigerd: er wordt niets gedownload.
- Gecomprimeerde of gepakte geometrie (Draco, meshopt, gekwantiseerde posities) wordt niet gelezen. Exporteer zonder compressie.
- Texturen en kleuren in het bestand worden niet gebruikt: het model wordt in de eigen kleur van de plant getekend. Texturen worden wel gecontroleerd, en een textuur van meer dan 4096 pixels per zijde wordt geweigerd.
- Grenzen: een bestand van 32 MB, 50 000 driehoeken (elke kopie van een onderdeel dat meer dan eens is geplaatst, telt mee), 64 afbeeldingen en 16 MB aan afbeeldingen.

Elke grens weigert het bestand met de reden; niets half gelezen wordt bewaard. Het toekennen van een symbool of model is één stap die u ongedaan kunt maken, en {{ui:Remove own symbol}} of {{ui:Remove own 3D model}} verwijdert het weer.

Zie [Plantrecords](topic:plant-records) voor het record zelf, en [Het terrein in 3D bekijken](topic:site-3d).
