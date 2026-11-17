---
title: Grafika e bimëve sipas shkallës, simbolet e tua dhe bimët 3D
summary: Si vizatohen bimët në plan sipas çdo shkalle vizatimi dhe nivelit të detajit, dhe si një regjistrim bime merr simbolin tuaj (SVG, ose një bllok DXF/DWG) dhe modelin tuaj 3D (OBJ, STL ose GLB).
keywords: grafika e bimëve, simboli i bimës, simbol sipas shkallës, nivel detaji, nivel i detajit, rreth i thjeshtë, kontur, simbol i detajuar, simboli im, bllok, svg, dxf, dwg, bimë 3d, modeli im 3d, obj, stl, glb, gltf, model peme, bimë në 3d
from: 875837d9
---

## Simbolet në plan sipas shkallës

Peizazh › {{ui:Më shumë}} › {{ui:Grafika e bimëve}} cakton si vizatohen bimët në plan. **Automatike, sipas shkallës** zgjedh një nga tre nivelet nga shkalla e vizatimit:

- **Rreth i thjeshtë** (më i trashë se 1:500): një rreth me përhapjen e bimës.
- **Kontur me qendër** (nga 1:500 deri 1:200): rrethi dhe një kryq i vogël në qendër.
- **Simbol i detajuar** (më i hollë se 1:200): simboli i vetë regjistrimit, nëse ka një, përndryshe simboli i integruar.

Ndryshoni dy shkallët me **Thjeshtë nga 1:** dhe **Kontur nga 1:**, ose zgjidhni një nivel për çdo shkallë. Çdo grup fletësh në dialogun e Fletëve ka **Detajin e bimës në plan** të vet, kështu që një plan lokacioni 1:500 dhe një plan mbjelljeje 1:100 mund të ndryshojnë. Cilësimet ruhen me projektin.

## Simboli yt

Përzgjidh një bimë në seksionin Bimët dhe shtyp {{ui:Simboli i vet…}}. Lexon një SVG, ose një bllok të një vizatimi DXF ose DWG (kur vizatimi ka disa blloqe, zgjidh një). Simboli përshtatet me përhapjen e bimës dhe vizatohet në nivelin e detajuar. Ruhet në projekt, kështu që skedari udhëton me të.

- Një SVG lexohet për vijat, polivijat, shumëkëndëshat, drejtkëndëshat, rrethet, elipset dhe shtigjet. Skriptet, stilet, lidhjet dhe imazhet në të nuk shqyrtohen kurrë. Transformimet nuk aplikohen: lajmëroheni kur skedari i ka, kështu që shpërbini ato në programin tuaj të vizatimit më parë.
- Kufijtë: 512 KB SVG dhe 2000 forma. Një skedar më i madh refuzohet, me arsyen.

## Modeli yt 3D i bimës

{{ui:Modeli i vet 3D…}} te i njëjti regjistrim lexon një skedar **OBJ**, **STL** ose **GLB**. Pastaj, te Grafika e bimëve, vendos **Bimët në 3D** te **Modeli i secilit regjistrim**: çdo bimë e atij regjistrimi shfaq modelin tuaj, i shkallëzuar sipas lartësisë dhe përhapjes së saj. Regjistrimet pa model të vetin mbajnë format e integruara. Zgjidhni **Masa të thjeshta** për pamje të shpejta të siteve të mëdha.

Një GLB lexohet vetëm për formën e vet:

- Gjithçka që modeli ka nevojë duhet të jetë brenda skedarit .glb. Një model që tregon te skedarë të tjerë (një .bin i veçantë, ose imazhe me adresë) refuzohet: asgjë nuk shkarkohet.
- Gjeometria e ngjeshur ose e paketuar (Draco, meshopt, pozicione të kuantizuara) nuk lexohet. Eksportoni pa ngjeshje.
- Teksturat dhe ngjyrat në skedar nuk përdoren: modeli vizatohet me ngjyrën e vetë bimës. Teksturat kontrollohen përsëri, dhe një tekstur mbi 4096 piksel në një anë refuzohet.
- Kufijtë: një skedar 32 MB, 50 000 trekëndësha (duke numëruar çdo kopje të një pjese të vendosur më shumë se një herë), 64 imazhe dhe 16 MB imazhe.

Çdo kufi refuzon skedarin, me arsyen; asgjë e lexuar pjesërisht nuk mbahet. Një hap zhbërjeje i jep regjistrimit simbolin ose modelin, dhe {{ui:Hiq simbolin e vet}} ose {{ui:Hiq modelin e vet 3D}} e heq përsëri.

Shih [Regjistrimet e bimëve](topic:plant-records) për vetë regjistrimin, dhe [Shiko vendin në 3D](topic:site-3d).
