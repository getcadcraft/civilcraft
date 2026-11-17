---
title: Eksportēt teritoriju 3D
summary: Saglabāt to, ko rāda 3D skats, kā GLB vai OBJ failu citām 3D programmām, metros, ar Y uz augšu, ap lokālu sākumpunktu, ko fails ieraksta.
keywords: glb, gltf, obj, 3D eksports, eksportēt 3D, modeļa eksports, spēļu dzinējs, vizualizācija, 3D skatītājs, metri, Y uz augšu, sākumpunkts, lokālais sākumpunkts, valsts plakne
from: 07d23992
---

3D skats eksportē to, ko rāda, kā 3D modeli, ko var atvērt cita programma: 3D skatītājs, modelētājs, spēļu dzinējs vai vizualizācijas rīks.

## Eksportēt

1. Atveriet 3D skatu ({{key:D}}) un izvēlieties, kas tiek rādīts ar {{ui:Rādīt}}. Tas, kas ir paslēpts, netiek eksportēts.
2. Noklikšķiniet uz {{ui:GLB}} vai {{ui:OBJ}} joslā.
   Fails tiek lejupielādēts kā "*projekta nosaukums*-3d.glb" vai "-3d.obj", un statusa joslā parādās sākumpunkts.

## Ko failos

| | GLB | OBJ |
|---|---|---|
| Virsmas | Režģi ar normālēm un joslu vai virsmu krāsām | Režģi ar normālēm (bez krāsām) |
| Caurules un konstrukcijas | Apaļi režģi, tie, kuriem ir problēmas, sarkanā krāsā | Apaļi režģi |
| Horizontāles, lūzumlīnijas, trases, atzīmes, koridora un laukumu līnijas | Līnijas, katrs kopums savā krāsā | Līniju ieraksti (`l`) |
| Uzmērījuma punkti | Punkti | Punktu ieraksti (`p`) |

Katrs kopums saglabā savu nosaukumu ("Esošā zeme", "Caurules", "Galvenās horizontāles" un tā tālāk), tāpēc citā programmā to var paslēpt vai noformēt.

## Mērvienības, asis un sākumpunkts

- **Metri.** Pēdu projekts tiek pārvērsts no ASV uzmērījuma pēdām (1 ft = 1200/3937 m).
- **Y uz augšu**, parastā šo formātu konvencija: austrumi kļūst par +X, augstums par +Y un ziemeļi par −Z.
- **Patiess mērogs.** Skata vertikālais pārspīlējums netiek piemērots.
- **Lokāls sākumpunkts.** Valsts plaknes koordinātas ir miljoniem pēdu, kas ir par lielu šiem formātiem, jo tie glabā vienas precizitātes skaitļus. Tāpēc fails tiek ierakstīts attiecībā pret tuvu sākumpunktu: esošās zemes pašas sākumpunktu austrumiem un ziemeļiem un tās zemāko augstumu, noapaļotu uz leju. Sākumpunkts projekta mērvienībās tiek ierakstīts failā: GLB failā kā `extras` uz skatu un tā augšējo mezglu, OBJ failā kā komentāra rinda faila augšdaļā (`# origin easting … northing … elevation …`). Lai modeli atkal novietotu projekta koordinātās, pieskaitiet sākumpunktu (pēc metru pārvēršanas atpakaļ pēdās pēdu projektā).

## Vēl nav izveidots

- Pārspīlētā skata eksportēšana vai eksportēšana projekta mērvienībās metru vietā.
- Tekstūras, materiālu fails OBJ formātam (.mtl) un katra objekta īpašības (cauruļu un konstrukciju nosaukumi ir tikai CivilCraft).
- Koridora eksportēšana kā atsevišķi cieti ķermeņi vai garenprofila skats 3D.
