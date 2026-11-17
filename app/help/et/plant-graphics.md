---
title: Taimede graafika mõõtkava järgi, oma sümbolid ja 3D-taimed
summary: Kuidas taimi joonistatakse plaanil igal joonistusmõõtkaval ja detailsusastmel ning kuidas taimekirjel võib olla oma sümbol (SVG või DXF/DWG plokk) ja oma 3D-mudel (OBJ, STL või GLB).
keywords: taimede graafika, taimesümbol, sümbol mõõtkava järgi, detailsusaste, lihtne ring, kontuur, detailne sümbol, oma sümbol, plokk, svg, dxf, dwg, 3D-taim, oma 3D-mudel, obj, stl, glb, gltf, puumudel, taimed 3D-s
from: 875837d9
---

## Plaani sümbolid mõõtkava järgi

Haljastus › {{ui:More}} › {{ui:Plant graphics}} määrab, kuidas taimi plaanil joonistatakse. **Automaatne mõõtkava järgi** valib joonistusmõõtkava põhjal ühe kolmest tasemest:

- **Lihtne ring** (jämedam kui 1:500): ring taime laiuse ulatuses.
- **Kontuur keskpunktiga** (1:500 kuni 1:200): ring ja väike keskristi.
- **Detailne sümbol** (peenem kui 1:200): kirje enda sümbol, kui sellel on, muidu sisseehitatud sümbol.

Kahte mõõtkava saab muuta väljadega **Lihtne alates 1:** ja **Kontuur alates 1:**, või valida ühe taseme kõigile mõõtkavadele. Igal lehtede dialoogis oleval lehekomplektil on oma **Taim detailsus plaanil**, nii et 1:500 asukohaplaan ja 1:100 istutusplaan võivad erineda. Seaded salvestatakse projektiga.

## Oma sümbol

Vali taim jaotises Taimed ja vajuta {{ui:Own symbol…}}. See loeb SVG-faili või DXF- või DWG-joonise ploki (kui joonisel on mitu plokki, valid ühe). Sümbol sobitatakse taime laiusega ja joonistatakse detailsel tasemel. See hoitakse projektis, nii et fail liigub koos sellega.

- SVG-st loetakse jooni, polüjooni, hulknurki, ristkülikuid, ringe, ellipse ja teekondi. Skripte, stiile, linke ja pilte ei vaadata kunagi. Teisendusi ei rakendata: sind teavitatakse, kui fail neid sisaldab, seega lameda need enne oma joonistusprogrammis.
- Piirangud: 512 KB SVG-d ja 2000 kujundit. Suurem fail lükatakse tagasi koos põhjusega.

## Oma 3D-taim

{{ui:Own 3D model…}} samal kirjel loeb **OBJ**-, **STL**- või **GLB**-faili. Seejärel määra taimede graafikas **Taimed 3D-s** väärtuseks **Iga kirje oma mudel**: selle kirje iga taim näitab sinu mudelit, mis on skaleeritud oma kõrguse ja laiuse järgi. Kirjed ilma oma mudelita jäävad sisseehitatud kujude juurde. Suurte alade kiireks vaateks vali **Lihtsad massid**.

GLB loetakse ainult kuju järgi:

- Kõik, mida mudel vajab, peab olema .glb-failis. Mudel, mis viitab teistele failidele (eraldi .bin või aadressi järgi pildid), lükatakse tagasi: midagi ei laadita alla.
- Pakitud või tihendatud geomeetriat (Draco, meshopt, kvantitud asukohad) ei loeta. Ekspordi ilma tihenduseta.
- Failis olevaid tekstuure ja värve ei kasutata: mudel joonistatakse taime enda värviga. Tekstuure siiski kontrollitakse ja tekstuur, mis on suurem kui 4096 pikslit külje kohta, lükatakse tagasi.
- Piirangud: 32 MB fail, 50 000 kolmnurka (arvestades iga kohta, mis on paigutatud rohkem kui üks kord), 64 pilti ja 16 MB pilte.

Iga piirang lükkab faili tagasi koos põhjusega; pooleldi loetut ei hoita alles. Üks tagasivõtu samm annab kirjele sümboli või mudeli ning {{ui:Remove own symbol}} või {{ui:Remove own 3D model}} eemaldab selle uuesti.

Vt [Taimekirjed](topic:plant-records) kirje enda kohta ning [Saidi vaatamine 3D-s](topic:site-3d).
