---
title: Gardhet
summary: Një gardh përgjatë një vije, parcele ose platforme: shtylla, rrasa, panele ose shkopa, porta, të pjerrëta ose të shkallëzuara mbi terren, një tabelë, simbole planimetrie dhe elemente IFC. Gjithashtu i disponueshëm për një asistent.
keywords: gardh, shtylla, rrasa, panele, shkopa, portë, e pjerrët, e shkallëzuar, terren, tabelë, ifc, parmak, kufi
from: c0e7b84a
---

Bëni një gardh përgjatë një vije karakteristike, një aksi rrugor, një parcele ose një platforme, me shtyllat dhe portat e vendosura për ju.

## Bëni një gardh

1. Përzgjidhni një vijë, një parcelë ose një platformë.
2. Hapni **Sipërfaqe, Më shumë, Gardhe...**
3. Zgjidhni stilin (panele, rrasa ose shkopa), të pjerrët ose të shkallëzuar, lartësinë, distancën mes shtyllave dhe gjerësinë e portës, pastaj **Gardh përgjatë përzgjedhjes**, ose **Me portë** për të vendosur një portë në mes të segmentit të drejtë më të gjatë.

Shtyllat vendosen në skaje, në çdo kthesë (një kulm që kthehet me 20 gradë ose më shumë), në të dy anët e çdo porte dhe në hapësira të barabarta ndërmjet tyre, asnjëra më e gjatë se distanca e caktuar. Panelet **të pjerrëta** ndjekin terrenin mes shtyllave të tyre. Panelet **të shkallëzuara** mbeten horizontale dhe hapen shkallë te shtyllat; hapësira nën një panel është më e gjerë te shtylla e poshtme, dhe dritarja paralajmëron kur ajo hapësirë kalon kufirin, ose kur terreni ngrihet përmes një paneli. Portat 6 feet (1.8 m) e më të gjera kanë dy krahë; planimetria i tregon krahët e hapur me lëvizjen e tyre.

## Tabela dhe daljet

Çdo gardh tregon gjatësinë e vet, shtyllat sipas llojit, panelet, portat dhe shkallët, me një tabelë **CSV** të shtyllave, paneleve, rrasave, shkopave dhe portave. Planimetria ka shtresa gardhi (C-FENC, C-FENC-POST, C-FENC-GATE) për PDF, DXF dhe DWG. Eksportimi IFC përmban shtyllat (IfcMember, post), panelet (IfcRailing, user defined fence panel), rrasat (IfcMember) dhe portat (IfcDoor, gate), një sistem për çdo gardh.

## Nga një asistent

`fence_build` krijon një gardh (pika, ose një vijë, parcelë ose platformë me emër, portat sipas stacionit) dhe `fence_list` liston gardhet me tabelën e tyre.

## Çfarë nuk bëhet

Madhësitë fillestare janë zgjedhje të zakonshme, jo një kod. Llojet nga Biblioteka mbartin vetëm një emër. Portat duhet të shtrihen në një segment të vetëm të drejtë. BimCraft nuk ka ende këtë mjet.
