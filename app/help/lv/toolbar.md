---
title: Rīkjoslas uzziņa
summary: Katra CivilCraft rīkjoslas poga, ko tā dara, tās taustiņš un kad tā ir pelēka vai atsakās.
keywords: rīkjosla, pogas, komandas, rīki, fails, eksports, virsma, projektēšana, rediģēšana, skats, izvēlne, GIS
from: 4c4352bc
---

Rīkjosla iet pāri lietotnes augšdaļai septiņās grupās. Katra poga, uzvedot kursoru virs tās, parāda savu padomu un taustiņu.

## Fails

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Jauns}} | nav | Sāk tukšu projektu. Vispirms jautā, ja ir nesaglabātas izmaiņas. |
| {{ui:Atvērt}} | {{key:Mod+O}} | Atver punktu failu (CSV, TXT), LandXML vai CivilCraft projektu. |
| {{ui:Saglabāt}} | {{key:Mod+S}} | Lejupielādē projektu kā `<name>.civilcraft.json`. |

## Eksportēt

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:LandXML}} | nav | Lejupielādē `<name>.xml`: punktus, virsmas, trases, profilus un cauruļu tīklu kā LandXML 1.2. "Vēl nav ko eksportēt." kad projekts ir tukšs. |
| {{ui:DXF}} | nav | Lejupielādē `<name>.dxf`: plāna līnijzīmējumu kā R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Atver **Plānu drukāt PDF**. "Vēl nav ko drukāt." kad projekts ir tukšs. |

## Virsma

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Lūzumlīnija}} | {{key:B}} | Noklikšķiniet uzmērīšanas punktos secībā, {{key:Enter}} pabeidz. Lūzumlīnija pārņem punktu augstumus. |
| {{ui:Robeža}} | {{key:O}} | Noklikšķiniet ārējās robežas stūros, {{key:Enter}} pabeidz. Aizstāj jebkuru robežu. |

Abi rāda ziņojumu "Vēl nav virsmas: vispirms atveriet uzmērīšanas punktus.", ja virsmas nav.

## Projektēšana

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Trase}} | {{key:A}} | Noklikšķiniet PI secībā, {{key:Enter}} pabeidz. |
| {{ui:Platforma}} | {{key:G}} | Noklikšķiniet platformas stūros, {{key:Enter}} pabeidz. Tāpat kā virsmas rīki, tas brīdina, ja virsmas nav; platforma tiek izlīdzināta tikai uz virsmas. |
| {{ui:Caurules}} | {{key:P}} | Noklikšķiniet konstrukcijas no augšpuses uz leju (noklikšķiniet uz esošas, lai pievienotos), {{key:Enter}} pabeidz. |
| {{ui:Garenprofils}} | {{key:R}} | Rāda vai slēpj garenprofila skatu zem plāna. |

## Rediģēšana

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Atsaukt}} | {{key:Mod+Z}} | Atsauc pēdējo izmaiņu (līdz 200). Pelēks, ja nav ko atsaukt. |
| {{ui:Atkārtot}} | {{key:Mod+Y}} | Atkārto atsaukto. Pelēks, ja nav ko atkārtot. |
| {{ui:Kopēt}} | {{key:Mod+C}} | Kopē atlasītos uzmērīšanas punktus un ieliek tos starpliktuvē kā punktu rindas, ko var ņemt izklājlapa. Pelēks, līdz punkti ir atlasīti. |
| {{ui:Ielīmēt}} | {{key:Mod+V}} | Ielīmē punktus: tie seko rādītājam, un klikšķis tos nolika ar numuriem, kādu nav neviens cits punkts. Izklājlapā kopētas punktu rindas arī tiek ielīmētas. |
| {{ui:Vairāk}} | nav | Atver zemāk esošo izvēlni. |

{{ui:Vairāk}} izvēlne:

| Vienums | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Izgriezt}} | {{key:Mod+X}} | Kopē atlasītos punktus un tos dzēš (viens atsaukšanas solis). |
| {{ui:Kopēt}} | {{key:Mod+C}} | Kā poga {{ui:Kopēt}}. |
| {{ui:Ielīmēt}} | {{key:Mod+V}} | Kā poga {{ui:Ielīmēt}}. |
| {{ui:Ielīmēt vietā}} | {{key:Mod+Shift+V}} | Ielīmē punktus pašu koordinātēs, ar numuriem, kādu nav neviens cits punkts. |
| {{ui:Dublēt}} | {{key:Mod+D}} | Atlasīto punktu kopija seko rādītājam; noklikšķiniet, kur tai jāiet. Starpliktuve paliek neskarta. |
| {{ui:Dzēst}} | {{key:Delete}} | Dzēš atlasītos uzmērīšanas punktus vai atlasīto trasi, platformu, konstrukciju (kopā ar tās caurulēm), cauruli vai PVI. |
| {{ui:Atlasīt visus punktus}} | {{key:Mod+A}} | Atlasa visus uzmērīšanas punktus. |
| {{ui:Noņemt atlasi}} | {{key:Esc}} | Noņem atlasi. |

Vienums, kas šobrīd nevar darboties, ir pelēks, un tā padoms pasaka, kāpēc. Sīkāk: [Atlasīt, kopēt un ielīmēt uzmērīšanas punktus](topic:copy-paste-points).

Atsaukšana attiecas uz projektēšanas, virsmas iestatījumu un uzmērīšanas punktu rediģēšanu (ielīmēšana, izgriešana, dublēšana, dzēšana). Tā neattiecas uz attēlošanas iestatījumiem, un jebkura faila atvēršana vai importēšana to notīra.

## GIS

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Koordinātes}} | nav | Atver dialogu **Koordinātu sistēma**: norādiet, kurā sistēmā atrodas projekts, vai izmantojiet zemes vai vietējās koordinātes. Skatiet [Projekta koordinātu sistēmas iestatīšana](topic:coordinate-systems) un [Zemes un vietējās koordinātes](topic:ground-and-local-coordinates). |
| {{ui:Importēt}} | nav | Importē GIS datus: shapefile, GeoJSON, GeoPackage, augstumu režģus un LiDAR. Skatiet [GIS datu importēšana](topic:gis-import). |
| {{ui:Eksportēt}} | nav | Eksportē izpildmērījumu datus GIS nodaļai. Skatiet [Izpildmērījumu datu eksportēšana GIS](topic:gis-export). |
| {{ui:Analizēt}} | nav | Atver GIS analīzes paneli: buferis, pārklāšana, telpiskā savienošana, atlasīšana pēc atribūta, mērīšana. Skatiet [GIS slāņu analīze](topic:gis-analysis). |
| {{ui:Atribūtu tabula}} | nav | Virsma › Vairāk. Atver GIS slāņa atribūtu tabulu: kārtot, filtrēt, atlasīt, rediģēt, pievienot laukus, aprēķināt, saglabāt kā CSV. Skatiet [Darbs ar slāņa atribūtu tabulu](topic:gis-table). |
| {{ui:Karte}} | nav | Atver dialogu **Kartes slāņi**: georeferencētu attēlu vai kartu serverus, ko pievienojat, zīmētus zem plāna. Skatiet [Kartes slāņu rādīšana zem plāna](topic:map-layers). |

GIS rīki ielādējas pirmo reizi, kad izmantojat kādu no šīm pogām, atverat GIS failu vai atverat projektu, kuram ir koordinātu sistēma vai GIS slāņi.

## Skats

| Poga | Taustiņš | Ko tā dara |
|---|---|---|
| {{ui:Atlasīt}} | {{key:V}} vai {{key:Esc}} | Noklikšķiniet, lai atlasītu trases, platformas, konstrukcijas, caurules un punktus ({{key:Shift}} un klikšķis vai vilkšana pievieno punktus); velciet rokturus, lai pārvietotu PI, platformas stūrus un konstrukcijas. |
| {{ui:Pielāgot}} | {{key:F}} | Tuvina plānu, lai rādītu virsmu, punktus, trases un platformas (3D skatā: rāda visu). |
| {{ui:3D}} | {{key:D}} | Rāda objektu 3D virs plāna vai atgriežas pie plāna. Josla virs 3D skata nosaka skatu, pārspīlējumu, krāsošanu un to, kas tiek rādīts, un eksportē GLB vai OBJ. Skatiet [Objekta skatīšana 3D](topic:site-3d). |

## Pogas paneļos

| Poga | Vieta | Ko tā dara |
|---|---|---|
| {{ui:Atvērt parauga vietu}} | Lodziņš tukšā plānā | Ielādē parauga uzmērījumu (nepieciešams savienojums, ja vien CivilCraft nav saglabāts darbam bezsaistē) |
| {{ui:Noņemt robežu}} | Kreisais panelis, Virsma | Noņem ārējo robežu |
| {{ui:Noņemt zīmētās lūzumlīnijas}} | Kreisais panelis, Virsma | Noņem katru ar rīku zīmēto lūzumlīniju (ne lūzumlīniju grupas) |
| {{ui:Pārbūvēt virsmu no punktiem}} | Kreisais panelis, Virsma (tikai LandXML virsma) | Noņem LandXML TIN un veido no punktiem; to nevar atsaukt |
| {{ui:Sākt no terēna}} | Labais panelis, Trase | Sāk projektēto profilu ar PVI uz zemes katrā galā |
| {{ui:Garenprofila skats}} | Labais panelis, Trase | Atver šīs trases garenprofila skatu |
| {{ui:Pievienot PVI}} | Profila josla | Kamēr nospiests, klikšķis profilā pievieno PVI |
| {{ui:Iestatīt visas atzīmes pēc noteikumiem}} | Labais panelis, Cauruļu tīkls | Iestata katras caurules dibena atzīmes pēc noteikumiem |
| {{ui:Iestatīt tās atzīmes pēc noteikumiem}} | Labais panelis, Caurule | Iestata šīs caurules dibena atzīmes pēc noteikumiem |
