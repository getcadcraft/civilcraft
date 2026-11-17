---
title: Referencë e shiritit të veglave
summary: Çdo buton i shiritit të veglave në CivilCraft, çfarë bën, tasti i tij, dhe kur është i çaktivizuar ose refuzon.
keywords: shiriti i veglave, butona, komanda, vegla, skedar, eksport, sipërfaqe, projektim, redaktim, pamje, meny
from: 4c4352bc
---

Shiriti i veglave shtrihet në krye të aplikacionit në shtatë grupe. Çdo buton shfaq përshkrimin dhe tastin kur e kalon miun sipër.

## Skedar

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:E re}} | asnjë | Nis një projekt bosh. Pyet së pari nëse ka ndryshime të pa ruajtura. |
| {{ui:Hap}} | {{key:Mod+O}} | Hap një skedar pikash (CSV, TXT), LandXML ose një projekt CivilCraft. |
| {{ui:Ruaj}} | {{key:Mod+S}} | Shkarkon projektin si `<emri>.civilcraft.json`. |

## Eksporto

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:LandXML}} | asnjë | Shkarkon `<emri>.xml`: pikat, sipërfaqet, aksët rrugorë, profilet dhe rrjetin e tubave si LandXML 1.2. "Asgjë për të eksportuar ende." kur projekti është bosh. |
| {{ui:DXF}} | asnjë | Shkarkon `<emri>.dxf`: vijat e planimetrisë si DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Hap **Printo planimetrinë në PDF**. "Asgjë për të printuar ende." kur projekti është bosh. |

## Sipërfaqe

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Vijë thyerjeje}} | {{key:B}} | Kliko pikat e rilevimit me radhë, {{key:Enter}} për të përfunduar. Vija e thyerjes merr lartësitë e pikave. |
| {{ui:Kufi}} | {{key:O}} | Kliko kulmet e kufirit të jashtëm, {{key:Enter}} për të përfunduar. Zëvendëson çdo kufi. |

Të dyja thonë "Nuk ka ende sipërfaqe: hap fillimisht pikat e rilevimit." kur nuk ka sipërfaqe.

## Projektim

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Aksi rrugor}} | {{key:A}} | Kliko PI-të me radhë, {{key:Enter}} për të përfunduar. |
| {{ui:Platformë}} | {{key:G}} | Kliko kulmet e platformës, {{key:Enter}} për të përfunduar. Si veglat e sipërfaqes, paralajmëron kur nuk ka sipërfaqe; një platformë nivelohet vetëm mbi një të tillë. |
| {{ui:Tubat}} | {{key:P}} | Kliko strukturat nga lart poshtë (kliko një ekzistuese për t'u bashkuar), {{key:Enter}} për të përfunduar. |
| {{ui:Profil gjatësor}} | {{key:R}} | Shfaq ose fsheh pamjen e profilit nën planimetri. |

## Redaktim

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Zhbëj}} | {{key:Mod+Z}} | Zhbën ndryshimin e fundit (deri në 200). E çaktivizuar kur nuk ka çfarë të zhbëhet. |
| {{ui:Ribëj}} | {{key:Mod+Y}} | Ribën atë që u zhbë. E çaktivizuar kur nuk ka çfarë të ribëhet. |
| {{ui:Kopjo}} | {{key:Mod+C}} | Kopjon pikat e zgjedhura të rilevimit dhe i vendos në kujtesën e kopjimit si rreshta pikash që një fletë llogaritëse mund t'i marrë. E çaktivizuar deri sa zgjidhen pika. |
| {{ui:Ngjit}} | {{key:Mod+V}} | Ngjit pikat: ndjekin treguesin, dhe një klik i vendos me numra që asnjë pikë tjetër nuk ka. Rreshtat e pikave të kopjuara në një fletë llogaritëse ngjiten gjithashtu. |
| {{ui:Më shumë}} | asnjë | Hap menynë më poshtë. |

Meny {{ui:Më shumë}}:

| Artikulli | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Prit}} | {{key:Mod+X}} | Kopjon pikat e zgjedhura dhe i fshin (një hap zhbërjeje). |
| {{ui:Kopjo}} | {{key:Mod+C}} | Si butoni {{ui:Kopjo}}. |
| {{ui:Ngjit}} | {{key:Mod+V}} | Si butoni {{ui:Ngjit}}. |
| {{ui:Ngjit në vend}} | {{key:Mod+Shift+V}} | Ngjit pikat me koordinatat e tyre, me numra që asnjë pikë tjetër nuk ka. |
| {{ui:Dublo}} | {{key:Mod+D}} | Një kopje e pikave të zgjedhura ndjek treguesin; kliko aty ku shkon. Kujtesa e kopjimit lihet e paprekur. |
| {{ui:Fshi}} | {{key:Delete}} | Fshin pikat e zgjedhura të rilevimit, ose boshtin, platformën, strukturën e zgjedhur (me tubat e saj), tubin ose PVI-n e zgjedhur. |
| {{ui:Përzgjidh të gjitha pikat}} | {{key:Mod+A}} | Zgjedh çdo pikë rilevimi. |
| {{ui:Mos përzgjidh asnjë}} | {{key:Esc}} | Pastron zgjedhjen. |

Një artikull që nuk mund të veprojë tani është i çaktivizuar, dhe përshkrimi i tij thotë pse. Detaje: [Zgjidh, kopjo dhe ngjit pikat e rilevimit](topic:copy-paste-points).

Zhbërja mbulon ndryshimet në projektim, cilësimet e sipërfaqes dhe pikat e rilevimit (ngjitje, prerje, dublim, fshirje). Nuk mbulon cilësimet e shfaqjes, dhe hapja ose importimi i çdo skedari e pastron.

## GIS

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Koordinatat}} | asnjë | Hap dialogun **Sistemi i koordinatave**: thuaj në cilin sistem është projekti, ose përdor koordinata tokësore ose lokale. Shih [Vendos sistemin e koordinatave të projektit](topic:coordinate-systems) dhe [Koordinatat tokësore dhe lokale](topic:ground-and-local-coordinates). |
| {{ui:Importo}} | asnjë | Importon të dhëna GIS: shapefile, GeoJSON, GeoPackage, rrjete lartësish dhe LiDAR. Shih [Importo të dhënat GIS](topic:gis-import). |
| {{ui:Eksporto}} | asnjë | Eksporton të dhëna të ndërtuara për departamentin GIS. Shih [Eksporto të dhënat e ndërtuara për GIS](topic:gis-export). |
| {{ui:Analizo}} | asnjë | Hap panelin e analizës GIS: buffer, mbivendosje, lidhje hapësinore, zgjedhje sipas atributit, matje. Shih [Analizo shtresat GIS](topic:gis-analysis). |
| {{ui:Tabela e atributeve}} | asnjë | Te Sipërfaqe › Më shumë. Hap tabelën e atributeve të një shtrese GIS: renditje, filtrim, zgjedhje, redaktim, shtim fushash, llogaritje, ruajtje si CSV. Shih [Puno me tabelën e atributeve të shtresës](topic:gis-table). |
| {{ui:Harta}} | asnjë | Hap dialogun **Shtresat e hartës**: një figurë me gjeoreferencë, ose serverë hartash që shton, të vizatuar nën planimetri. Shih [Shfaq shtresat e hartës nën planimetri](topic:map-layers). |

Mjetet GIS ngarkohen herën e parë që përdor një nga këta butona, hap një skedar GIS, ose hap një projekt që ka sistem koordinatash ose shtresa GIS.

## Pamje

| Buton | Tasti | Çfarë bën |
|---|---|---|
| {{ui:Përzgjidh}} | {{key:V}} ose {{key:Esc}} | Kliko për të zgjedhur boshte, platforma, struktura, tuba dhe pika ({{key:Shift}} dhe një klik ose tërheqje shton pika); tërhiq dorezat për të lëvizur PI-të, kulmet e platformës dhe strukturat. |
| {{ui:Përshtat}} | {{key:F}} | Zmadhon planimetrinë për të shfaqur sipërfaqen, pikat, boshtet dhe platformat (në pamjen 3D: shfaq gjithçka). |
| {{ui:3D}} | {{key:D}} | Shfaq vendin në 3D mbi planimetri, ose kthehet te planimetria. Shiriti mbi pamjen 3D cakton pamjen, ekzagjerimin, ngjyrosjen dhe çfarë shfaqet, dhe eksporton GLB ose OBJ. Shih [Shiko vendin në 3D](topic:site-3d). |

## Butona në panele

| Buton | Ku | Çfarë bën |
|---|---|---|
| {{ui:Hap vendin e mostrës}} | Kutia mbi një planimetri bosh | Ngarkon rilevimin e mostrës (kërkon lidhje, përveç nëse CivilCraft është ruajtur për përdorim offline) |
| {{ui:Hiq kufirin}} | Paneli majtas, Sipërfaqe | Heq kufirin e jashtëm |
| {{ui:Hiq vijat e thyerjes të vizatuara}} | Paneli majtas, Sipërfaqe | Heq çdo vijë thyerjeje të vizatuar me veglën (jo grupet e vijave thyerëse) |
| {{ui:Ndërto përsëri sipërfaqen nga pikat}} | Paneli majtas, Sipërfaqe (vetëm sipërfaqja LandXML) | Heq TIN-in LandXML dhe ndërton nga pikat; nuk mund të zhbëhet |
| {{ui:Nis nga terreni}} | Paneli djathtas, Aksi rrugor | Fillon një profil projektimi me një PVI në terren në çdo skaj |
| {{ui:Hap pamjen e profilit}} | Paneli djathtas, Aksi rrugor | Hap pamjen e profilit për këtë bosht |
| {{ui:Shto PVI-të}} | Shiriti i profilit | Ndërsa është shtypur, një klik në profil shton një PVI |
| {{ui:Cakto çdo kotë fundi sipas rregullave}} | Paneli djathtas, Rrjeti i tubave | Cakton kotat e fundit të çdo tubi sipas rregullave |
| {{ui:Cakto kotat e tij sipas rregullave}} | Paneli djathtas, Tub | Cakton kotat e fundit të këtij tubi sipas rregullave |
