---
title: Tööriistariba viide
summary: Iga CivilCraft'i tööriistariba nupp, mida see teeb, selle klahv ning millal see on hall või keeldub tegutsemast.
keywords: tööriistariba, nupud, käsud, tööriistad, fail, eksport, pind, projekt, muutmine, vaade, menüü
from: 4c4352bc
---

Tööriistariba kulgeb rakenduse ülaosas seitsme rühmana. Iga nupp näitab hiire kohale viimisel vihjet ja klahvi.

## Fail

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Uus}} | puudub | Alustab tühja projekti. Küsib enne, kui on salvestamata muudatusi. |
| {{ui:Ava}} | {{key:Mod+O}} | Avab punktifaili (CSV, TXT), LandXML-faili või CivilCraft'i projekti. |
| {{ui:Salvesta}} | {{key:Mod+S}} | Laadib projekti alla failina `<name>.civilcraft.json`. |

## Eksport

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:LandXML}} | puudub | Laadib alla `<name>.xml`: punktid, pinnad, trassid, profiilid ja torustik LandXML 1.2 formaadis. „Eksportida pole veel midagi.“, kui projekt on tühi. |
| {{ui:DXF}} | puudub | Laadib alla `<name>.dxf`: plaani joonestik R12 DXF-ina. |
| {{ui:PDF}} | {{key:Mod+P}} | Avab dialoogi **Joonista plaan PDF-ina**. „Joonistada pole veel midagi.“, kui projekt on tühi. |

## Pind

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Murdejoon}} | {{key:B}} | Klõpsa mõõdistuspunkte järjekorras, lõpetamiseks {{key:Enter}}. Murdejoon võtab punktide kõrgused. |
| {{ui:Piirjoon}} | {{key:O}} | Klõpsa välispiiri nurkadele, lõpetamiseks {{key:Enter}}. Asendab mis tahes piirjoone. |

Mõlemad ütlevad „Pinda veel pole: ava kõigepealt mõõdistuspunktid.“, kui pind puudub.

## Projekt

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Trass}} | {{key:A}} | Klõpsa PI-sid järjekorras, lõpetamiseks {{key:Enter}}. |
| {{ui:Plats}} | {{key:G}} | Klõpsa platsi nurkadele, lõpetamiseks {{key:Enter}}. Nagu pinnatööriistad, hoiatab see, kui pinda pole; plats planeeritakse ainult pinnale. |
| {{ui:Torud}} | {{key:P}} | Klõpsa kaevusid ülesvoolust allavoolu (olemasolevale klõpsates lisad selle), lõpetamiseks {{key:Enter}}. |
| {{ui:Pikiprofiil}} | {{key:R}} | Kuvab või peidab plaani all oleva profiilivaate. |

## Muuda

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Võta tagasi}} | {{key:Mod+Z}} | Võtab viimase muudatuse tagasi (kuni 200). On hall, kui tagasivõetavat pole. |
| {{ui:Tee uuesti}} | {{key:Mod+Y}} | Teeb uuesti, mis võeti tagasi. On hall, kui uuesti tehtavat pole. |
| {{ui:Kopeeri}} | {{key:Mod+C}} | Kopeerib valitud mõõdistuspunktid ja paneb need lõikelauale punktiridadena, mida tabelarvutus võib vastu võtta. On hall, kuni punktid on valitud. |
| {{ui:Kleebi}} | {{key:Mod+V}} | Kleebib punkte: need järgivad kursorit ning klõps paneb need maha numbritega, mida ei ole ühelgi teisel punktil. Tabelarvutusest kopeeritud punktiread kleepuvad samuti. |
| {{ui:Veel}} | puudub | Avab allpool oleva menüü. |

Menüü {{ui:Veel}}:

| Üksus | Klahv | Mida teeb |
|---|---|---|
| {{ui:Lõika}} | {{key:Mod+X}} | Kopeerib valitud punktid ja kustutab need (üks tagasivõtmise samm). |
| {{ui:Kopeeri}} | {{key:Mod+C}} | Nagu nupp {{ui:Kopeeri}}. |
| {{ui:Kleebi}} | {{key:Mod+V}} | Nagu nupp {{ui:Kleebi}}. |
| {{ui:Kleebi samasse kohta}} | {{key:Mod+Shift+V}} | Kleebib punktid nende enda koordinaatidesse, numbritega, mida ei ole ühelgi teisel punktil. |
| {{ui:Dubleeri}} | {{key:Mod+D}} | Valitud punktide koopia järgib kursorit; klõpsa kohta, kuhu see läheb. Lõikelauda ei puudutata. |
| {{ui:Kustuta}} | {{key:Delete}} | Kustutab valitud mõõdistuspunktid või valitud trassi, platsi, kaevu (koos selle torudega), toru või PVI. |
| {{ui:Vali kõik punktid}} | {{key:Mod+A}} | Valib kõik mõõdistuspunktid. |
| {{ui:Tühista valik}} | {{key:Esc}} | Tühjendab valiku. |

Üksus, mis ei saa praegu tegutseda, on hall ja selle vihje ütleb, miks. Üksikasjad: [Mõõdistuspunktide valimine, kopeerimine ja kleepimine](topic:copy-paste-points).

Tagasivõtmine hõlmab muudatusi projektis, pinna sätetes ja mõõdistuspunktides (kleepimine, lõikamine, dubleerimine, kustutamine). See ei hõlma kuvasätteid ning mis tahes faili avamine või importimine tühjendab selle.

## GIS

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Koordinaadid}} | puudub | Avab dialoogi **Koordinaatsüsteem**: ütle, millises süsteemis projekt on, või kasuta maa- ja kohalikke koordinaate. Vt [Määra projekti koordinaatsüsteem](topic:coordinate-systems) ja [Maa- ja kohalikud koordinaadid](topic:ground-and-local-coordinates). |
| {{ui:Impordi}} | puudub | Impordib GIS-andmeid: shapefile'id, GeoJSON, GeoPackage, kõrgusvõrgud ja LiDAR. Vt [Impordi GIS-andmed](topic:gis-import). |
| {{ui:Ekspordi}} | puudub | Ekspordib tegelikult teostatud andmed GIS-osakonnale. Vt [Ekspordi tegelik teostus GIS-i jaoks](topic:gis-export). |
| {{ui:Analüüs}} | puudub | Avab GIS-analüüsi paneeli: puhver, kattumine, ruumiline ühendamine, valik atribuudi järgi, mõõtmine. Vt [Analüüsi GIS-kihte](topic:gis-analysis). |
| {{ui:Atribuuditabel}} | puudub | Jaotises Pind › Veel. Avab GIS-kihi atribuuditabeli: sorteerimine, filtreerimine, valimine, muutmine, väljade lisamine, arvutamine, salvestamine CSV-na. Vt [Töö kihi atribuuditabeliga](topic:gis-table). |
| {{ui:Kaart}} | puudub | Avab dialoogi **Kaardikihid**: geoviidatud pilt või lisatud kaardiserverid, mis joonistatakse plaani alla. Vt [Kuva kaardikihid plaani all](topic:map-layers). |

GIS-tööriistad laaditakse esimesel kasutuskorral ühe neist nupu, GIS-faili avamisel või projekti avamisel, millel on koordinaatsüsteem või GIS-kihid.

## Vaade

| Nupp | Klahv | Mida teeb |
|---|---|---|
| {{ui:Vali}} | {{key:V}} või {{key:Esc}} | Klõpsa trasside, platside, kaevude, torude ja punktide valimiseks ({{key:Shift}} ning klõps või lohistus lisab punkte); lohista käepidemeid, et liigutada PI-sid, platsi nurki ja kaevusid. |
| {{ui:Sobita}} | {{key:F}} | Suumib plaani nii, et näha pinda, punkte, trasse ja platse (3D-vaates: näitab kõike). |
| {{ui:3D}} | {{key:D}} | Kuvab ala 3D-na plaani kohal või läheb tagasi plaanile. 3D-vaate kohal olev riba määrab vaate, võimenduse, värvuse ja selle, mida kuvada, ning eksportib GLB või OBJ. Vt [Vaata ala 3D-na](topic:site-3d). |

## Paneelide nupud

| Nupp | Kus | Mida teeb |
|---|---|---|
| {{ui:Ava näidisala}} | Tühja plaani kast | Laadib näidismõõdistuse (vajab ühendust, välja arvatud juhul, kui CivilCraft on salvestatud võrguta kasutamiseks) |
| {{ui:Eemalda piir}} | Vasakpoolne paneel, Pind | Eemaldab välispiiri |
| {{ui:Eemalda joonistatud murdejooned}} | Vasakpoolne paneel, Pind | Eemaldab kõik tööriistaga joonistatud murdejooned (mitte murdejoonte rühmi) |
| {{ui:Koosta pind uuesti punktidest}} | Vasakpoolne paneel, Pind (ainult LandXML-pind) | Eemaldab LandXML TIN-i ja ehitab punktidest; seda ei saa tagasi võtta |
| {{ui:Alusta maapinnast}} | Parempoolne paneel, Trass | Alustab projektiprofiili, millel on PVI maapinnal mõlemas otsas |
| {{ui:Profiilivaade}} | Parempoolne paneel, Trass | Avab selle trassi profiilivaate |
| {{ui:Lisa PVI-d}} | Profiiliriba | Kui see on vajutatud, lisab klõps profiilis PVI |
| {{ui:Sea kõik sisepõhjad reeglite järgi}} | Parempoolne paneel, Torustik | Seab kõigi torude sisepõhjad reeglite järgi |
| {{ui:Sea selle sisepõhjad reeglite järgi}} | Parempoolne paneel, Toru | Seab selle toru sisepõhjad reeglite järgi |
