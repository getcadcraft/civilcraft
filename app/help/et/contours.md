---
title: Samakõrgusjoonte, kõrguste ja nõlvade lugemine
summary: Määra samakõrgusjoonte vahe ja põhijooned, näita kõrgusvööndeid, nõlvanooli ja kolmnurki ning loe kursori all olevaid maapinna kõrguseid.
keywords: samakõrgusjooned, samakõrgusjoonte vahe, põhijooned, sildid, kõrgusvööndid, nõlvanooled, kolmnurgad, punktikõrgus, pinna analüüs, kõrguste analüüs, nõlvade analüüs
from: 585e500a
---

Pind kuvatakse samakõrgusjoontega kohe, kui see on olemas. Kõik selles teemas kirjeldatud seaded tehakse vasakpoolses paneelis jaotises **Kuva**. Kuvaseaded muudavad ainult seda, mida näed (ja mida eksporditakse); need ei ole võtmistagasi samme.

## Samakõrgusjoonte vahe määramine

1. Jaotises **Kuva** vali väärtus väljal **Samakõrgusjooni iga**.
   - Jalgades: 0.25, 0.5, 1, 2, 5, 10 või 20 ft.
   - Meetrites: 0.1, 0.25, 0.5, 1, 2, 5 või 10 m.
2. Vali **Põhijooni iga**: iga 2., 4., 5. või 10. samakõrgusjoon.
   Põhijooned joonistatakse paksemalt ja neil on märgistatud kõrgus. Need asuvad põhivahe täiskordsetel (1 ft samakõrgusjoontega ja iga 5. põhijoonega: 245, 250, 255 …).
3. Lülita {{ui:Samakõrgusjoonte sildid}} välja, kui sildid kattuvad väikesel alal.

Uus projekt algab 1 ühiku vahega ja igast 5. samakõrgusjoonest on põhijoon. Samakõrgusjooned painduvad murdejoontel; kui need lõikavad otse üle voolujoone või harja, ei ole see joon veel murdejoon (vaata [Pinna koostamine ja täpsustamine](topic:build-surface)).

:::note
Samakõrgusjooni joonistatakse ainult siis, kui madalaima ja kõrgeima punkti vahel on kuni 2000 taset. Maastikul, kus on suured kõrguserinevused ja väga väike vahe, ei näita plaan ühtegi samakõrgusjoont: vali suurem vahe.
:::

## Samakõrgusjoonte silumine

Samakõrgusjooned joonistatakse sirgete lõikudena, ühe igast pinna kolmnurgast, nii et need pööravad väikese nurga igal kolmnurga servas. **Samakõrgusjoonte silumine** jaotises **Kuva** ümardab need nurgad:

- **Puudub (sirged lõigud)**: joonistatud jooned sellisena, nagu nad on. Nii näeb uus või vanem joonis.
- **Kerge**: nurgad on veidi ümardatud. Joon ei nihku rohkem kui 10% teekonnast järgmise samakõrgusjoone suunas ega kaugemale oma sirgest lõigust kui üks kuues selle lõigu pikkusest.
- **Tugev**: voolav kõver. Joon ei nihku rohkem kui 25% teekonnast järgmise samakõrgusjoone suunas ega kaugemale oma sirgest lõigust kui üks kolmandik selle lõigu pikkusest.

Kummagi valiku korral lõikab silutud samakõrgusjoon iga kolmnurga serva samas punktis, kus seda teeb joonistatud joon, jääb iga lõigu läbitavasse kolmnurka ja seetõttu ei saa see kunagi teist samakõrgusjoont lõigata ega puudutada. Kus samakõrgusjoon lõikab murdejoont või piiri, säilitab see oma terava nurga. Joonistatud ja eksporditud on silutud jooned (DXF, DWG, PDF, GIS ja 3D), neil on rohkem tippe kui sirgetel joontel.

Silumine muudab ainult joonistatud jooni. Kõrgused, mahud, profiilid ja lõiked loetakse ikka pinnast endast. Samakõrgusjoon, mis läbib täpselt mõõdistuspunkte (punkt kõrgusel 250.00 250. samakõrgusjoonel), jätab igasse sellisesse punkti väikese nurga.

## Samakõrgusjoonte taga olev pind

Samakõrgusjooned järgivad pinda ja pind järgib jaotises **Pind** valitud **Joonestamise meetodit**. Vaikimisi on **Kolmnurgastamine lineaarse interpolatsiooniga**, mis ühendab punktid kolmnurkadeks ja säilitab iga punkti ja murdejoone täpselt. Teised meetodid sobitavad enne punktidele ruudustiku (kriging, minimaalne kõverus, lähim naaber, pöördkaugus ja teised), mis annab punktide vahel ümaramad samakõrgusjooned, kuid ei lähe täpselt läbi iga punkti; pinna aruanne jaotises **Pind** ütleb, kui palju tulemus teie punktides kõrvale kaldub.

**ABOS (silumisel põhinev lähendus)** on üks ruudustikupõhistest meetoditest. Sellel on kaks oma seadet: **Silussus** (algväärtus 0.5; madalam on siledam) ja **Täpsus** (algväärtus 1: pind viiakse teie punktides 1% piires saidi kõrgusvahemikust; sobivuse tihendamiseks sisesta väiksem arv). Kui see ei jõua olemasoleval ruudustikul täpsuseni, ütleb pinna aruanne seda: sisesta väiksem **Ruudustiku samm**.

## Kõrguse lugemine suvalisest kohast

Liiguta kursor üle plaani. Olekuriba näitab:

- **E** ja **N** kursori all
- **Maapind** ja olemasolev maapinna kõrgus seal, interpoleeritud kursori all olevas kolmnurgas
- **Projekteeritud** ja projekteeritud kõrgus, kui täidis või koridor on maapinda muutnud
- „Pinnast väljas“ väljaspool pinda

Mõõdistuspunkti täpseks lugemiseks vali {{ui:Vali}} ja klõpsa punktil: parem paneel näitab selle numbrit, idakoordinaati, põhjakoordinaati, kõrgust, kirjeldust ja gruppi.

## Kõrgusvööndite näitamine

1. Märgi {{ui:Kõrgusvööndid}} ära.
   Pind täidetakse värviga madalast (sinakasroheline) kõrgeni (oker-pruun). Märkeruutude all olev legend loetleb iga vööndi kõrgusvahemiku.
2. Vali **Vööndid** arv: 5, 8, 10 või 12. Vööndid jagavad madalaimast kõrgeimani ulatuva vahemiku võrdseteks sammudeks.

Vööndid on ainult vaatamiseks. Neid ei eksportita DXF-i ega joonistata PDF-i.

## Nõlvanoolte näitamine

Märgi {{ui:Nõlvanooled}} ära. Igal piisavalt suurel kolmnurgal on lühike nool, mis osutab allapoole. Tasased kolmnurgad noolt ei saa. Nooled on kiire kontroll drenaažisuuna jaoks; nõlva väärtust ennast ei märgistata veel.

## Kolmnurkade, punktide ja servade näitamine

- {{ui:Kolmnurgad}} joonistab TIN-i servad. Lülita sisse, et kontrollida, kuidas pind punkte ühendab, eriti murdejoonte ääres ja välispiiril.
- {{ui:Punktid}} joonistab iga mõõdistuspunkti; {{ui:Punktide sildid}} lisab selle numbri, kõrguse ja kirjelduse (või vähem: vaata jaotist **Punktide sildid** teemas [CivilCrafti sätted](topic:settings)).
- {{ui:Murdejooned}} joonistab murdejooned (ja piiri) oranžina.
- {{ui:Pinna serv}} joonistab pinna ääriku.

## Olemasolev või projekteeritud

Kui täidis või koridor on maapinda probleemideta muutnud, pakub jaotis **Kuva** jaotises **Pind** valikut {{ui:Projekteeritud (planeeritud)}}. Samakõrgusjooned, vööndid ja nooled näitavad siis planeeritud pinda, nii et näed uut maapinda ja seda ümbritsevat piirijoont. Mõõdistuse vaatamiseks lülita tagasi {{ui:Olemasolev maapind}}.

## Mida eksporditakse

DXF- ja PDF-väljund järgib neid seadeid: välja lülitatut ei kirjutata ning samakõrgusjooned on need, mis on hetkel näidatud pinnast. Kõrgusvööndeid ei eksportita kunagi.
