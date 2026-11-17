---
title: Eksporto planimetrinë në DXF
summary: Shkruan vijat e planimetrisë si DXF R12 në shtresa me emër, me izoipsat në kotat e tyre dhe vijat e thyerjes në 3D, për çdo program CAD.
keywords: dxf, dwg, cad, eksport, vija, r12, 2000, 2004, 2007, 2010, 2013, 2018, shtresa, izoipsa, shkëmbim vizatimi, hartë bazë, sfond
from: f2d8ede9
---

{{ui:DXF}} shkruan atë që shfaq planimetria si skedar DXF në formatin R12, versionin që hapet nga çdo program CAD. Nëse keni përdorur AutoCAD ose Civil 3D, hapeni ose futeni si çdo skedar DXF tjetër.

## Eksporto

1. Përgatiteni planimetrinë siç e dëshironi vizatimin: te **Shfaqja**, zgjidhni sipërfaqen (ekzistuese ose e propozuar), intervalin e izoipsave dhe cilat gjëra janë të ndezura (izoipsat, etiketat, pikat, etiketat e pikave, trekëndëshat, vijat e thyerjes, kufiri i sipërfaqes, tubat, shigjetat e pjerrësisë).
2. Klikoni {{ui:DWG/DXF}} te grupi **Eksporto** dhe zgjidhni {{ui:DXF (R12, text) — the plain exchange file}}, pastaj {{ui:Download}}.
3. Shfletuesi shkarkon `<name>.dxf`. Shiriti i statusit thotë, për shembull, "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Koordinatat shkruhen në njësitë e projektit, me vlerat e tyre reale (koordinatat e sistemit shtetëror mbeten siç janë). Asgjë nuk shkallëzohet dhe nuk zhvendoset.

## Çfarë ka në skedar

| Gjëja | Entiteti DXF | Shtresa |
|---|---|---|
| Izoipsat e vogla dhe të mëdha | Polivijat 2D në kotën e tyre | C-TOPO-MINR, C-TOPO-MAJR |
| Etiketat e izoipsave | Tekst | C-TOPO-TEXT |
| Trekëndëshat | Polivijat | C-TOPO-TINN |
| Vijat e thyerjes dhe kufiri | Polivijat 3D | C-TOPO-BRKL |
| Kufiri i sipërfaqes | Polivijat | C-TOPO-BNDY |
| Shigjetat e pjerrësisë | Polivijat | C-TOPO-SLOP |
| Pikat e rilevimit dhe etiketat e tyre | Pika (me kotë), tekst | V-NODE, V-NODE-TEXT |
| Vijat nga kodet e vijave | Polivijat 3D | V-NODE-LINE |
| Qendrat e aksit rrugor | Vija dhe harqe | C-ROAD-CNTR |
| Shenjat dhe etiketat e stacionimit | Polivijat, tekst | C-ROAD-STAN |
| Kufijtë e korridorit | Polivijat | C-ROAD-CORR |
| Vijat mostër | Polivijat | C-ROAD-SCTN |
| Platformat, vijat e dritës së ditës, vijat e pjerrësisë | Polivijat | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Vijat karakteristike | Polivijat 3D (harqet si copa brenda 0.01; shih [Vijat karakteristike](topic:feature-lines)) | C-GRAD-FEAT |
| Gjurmët e rrotullimit | Polivijat, tekst | C-ROAD-SWPT |
| Tubat, strukturat dhe etiketat e tyre | Polivijat, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tubat dhe strukturat me probleme | Polivijat | C-STRM-PROB |

Çdo shtresë ka një ngjyrë. Lista e plotë është te [Shtresat e planimetrisë](topic:plan-layers).

## Madhësia e etiketave

Teksti duhet të ketë një madhësi në njësi vizatimi. CivilCraft i përshtat etiketat për shkallën ku e gjithë planimetria futet në një fletë Tabloid (këmbë) ose një fletë A3 (metra), dhe e thotë shkallën në mesazhin e statusit. Nëse e printoni me një shkallë tjetër në programin tuaj CAD, përshtateni tekstin aty.

## Çfarë nuk eksportohet

- Brezat e kotave (vetëm në ekran).
- Pamja e profilit. Profilet dalin si LandXML, jo si vizatim.
- Vetë sipërfaqja si objekt 3D. Përdorni LandXML për TIN, ose aktivizoni {{ui:Triangles}} për të marrë kufijtë e saj si vija.
- Çdo gjë që keni fikur te **Shfaqja**.

## DWG

{{ui:DWG/DXF}} shkruan të njëjtat vija edhe si vizatim DWG. Dialogu i tij pyet për formatin: DXF, ose një DWG 2000, 2004, 2007, 2010, 2013 ose 2018. 2000 hapet në pothuajse çdo program CAD, të vjetër dhe të rinj; zgjidhni një version më të ri kur personi që merr vizatimin e kërkon. Zgjedhja juaj mbahet mend në këtë shfletues.

1. Klikoni {{ui:DWG}} te grupi **Eksporto**.
2. Zgjidhni **Formatin** dhe klikoni **Shkarko DWG**.
3. Shfletuesi shkarkon `<name>.dwg`. Shiriti i statusit thotë çfarë u fut, për shembull "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers".

DWG-ja ka të njëjtat shtresa, ngjyra, izoipsa (si polivija në kotën e tyre), vija 3D të thyerjes, etiketa dhe pika si DXF, në të njëjtat koordinata. Emrat e shtresave që DWG nuk i mban ndryshohen, dhe mesazhi i statusit e thotë këtë. CivilCraft shkruan DWG me kodin e vet, kështu që asgjë nuk del nga kompjuteri juaj.

### Shtresat e hartës në DWG

Një vizatim DWG nuk mund të mbajë brenda vetes një figurë: programet CAD shfaqin një figurë që qëndron pranë vizatimit. Kur shtresat e hartës janë të dukshme, dialogu ofron **Shtresat e hartës si figurë pranë vizatimit**. Me të zgjedhur, shkarkimi është një `.zip` që mban `<name>.dwg`, `<name>-map.png` (shtresat e hartës mbi gjithë vizatimin, deri në 4,096 piksel gjerësi) dhe `<name>-map.pgw` (skedari i botës, për programet GIS). Vizatimi e shfaq figurën si imazh në shtresën G-MAP-IMAG, në vendin e vet. Nxirrni skedarët nga arkivi në një dosje të vetme dhe mbajini bashkë.
