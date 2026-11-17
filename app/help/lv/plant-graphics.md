---
title: Augu grafika pēc mēroga, jūsu simboli un 3D augi
summary: Kā augi tiek zīmēti plānā katrā zīmējuma mērogā un detalizācijas līmenī un kā augu ierakstam var piešķirt jūsu simbolu (SVG vai DXF/DWG bloku) un jūsu 3D modeli (OBJ, STL vai GLB).
keywords: augu grafika, augu simbols, simbols pēc mēroga, detalizācijas līmenis, vienkāršs riņķis, kontūra, detalizēts simbols, savs simbols, bloks, svg, dxf, dwg, 3d augs, savs 3d modelis, obj, stl, glb, gltf, koka modelis, augi 3D
from: 875837d9
---

## Plāna simboli pēc mēroga

Ainava › {{ui:Vairāk}} › {{ui:Augu grafika}} nosaka, kā augi tiek zīmēti plānā. **Automātiski pēc mēroga** izvēlas vienu no trim līmeņiem pēc zīmējuma mēroga:

- **Vienkāršs riņķis** (rupjāks par 1:500): riņķis auga izplatībā.
- **Kontūra ar centru** (no 1:500 līdz 1:200): riņķis un neliels centra krustiņš.
- **Detalizēts simbols** (smalkāks par 1:200): ieraksta savs simbols, ja tāds ir, citādi iebūvētais simbols.

Abus mērogus mainiet ar **Vienkāršs no 1:** un **Kontūra no 1:**, vai izvēlieties vienu līmeni visiem mērogiem. Katram lapu komplektam lapu dialogā ir savs **Augu detalizācija plānā**, tādēļ 1:500 situācijas plāns un 1:100 stādījumu plāns var atšķirties. Iestatījumi tiek saglabāti kopā ar projektu.

## Jūsu simbols

Atlasiet augu sadaļā Augi un nospiediet {{ui:Savs simbols…}}. Tiek nolasīts SVG fails vai DXF vai DWG zīmējuma bloks (ja zīmējumā ir vairāki bloki, izvēlaties vienu). Simbols tiek pielāgots auga izplatībai un zīmēts detalizētajā līmenī. Tas tiek glabāts projektā, tādēļ fails pārvietojas kopā ar to.

- SVG failā tiek nolasītas līnijas, polilīnijas, daudzstūri, taisnstūri, riņķi, elipses un ceļi. Skripti, stili, saites un attēli tajā nekad netiek apskatīti. Pārveidojumi netiek lietoti: jūs tiek informēts, ja failā tie ir, tādēļ vispirms tos izlīdziniet savā zīmēšanas programmā.
- Ierobežojumi: 512 KB SVG un 2000 formu. Lielāks fails tiek noraidīts, norādot iemeslu.

## Jūsu 3D augs

{{ui:Savs 3D modelis…}} tajā pašā ierakstā nolasa **OBJ**, **STL** vai **GLB** failu. Pēc tam augu grafikā iestatiet **Augi 3D** uz **Katra ieraksta savs modelis**: katrs šī ieraksta augs rāda jūsu modeli, mērogotu pēc tā augstuma un izplatības. Ierakstos bez sava modeļa paliek iebūvētās formas. Lielu objektu ātrai apskatei izvēlieties **Vienkāršas masas**.

GLB failā tiek nolasīta tikai forma:

- Viss, kas modelim nepieciešams, jābūt .glb failā. Modelis, kas norāda uz citiem failiem (atsevišķs .bin vai attēli pēc adreses), tiek noraidīts: nekas netiek lejupielādēts.
- Saspiesta vai iepakota ģeometrija (Draco, meshopt, kvantētas pozīcijas) netiek nolasīta. Eksportējiet bez saspiešanas.
- Faila tekstūras un krāsas netiek izmantotas: modelis tiek zīmēts auga pašā krāsā. Tekstūras tomēr tiek pārbaudītas, un tekstūra, kas lielāka par 4096 pikseļiem malā, tiek noraidīta.
- Ierobežojumi: 32 MB fails, 50 000 trijstūru (ieskaitot katru detaļas kopiju, ja tā ievietota vairāk nekā vienreiz), 64 attēli un 16 MB attēlu.

Katrs ierobežojums noraida failu, norādot iemeslu; daļēji nolasīts nekas netiek saglabāts. Viens atsaukšanas solis ierakstam piešķir simbolu vai modeli, un {{ui:Noņemt savu simbolu}} vai {{ui:Noņemt savu 3D modeli}} to atkal noņem.

Skat. [Augu ieraksti](topic:plant-records) par pašu ierakstu un [Objekta skatīšana 3D](topic:site-3d).
