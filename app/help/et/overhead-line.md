---
title: Joonista õhuliin
summary: Aseta plaanile mastid, lase CivilCraft'il välja selgitada iga masti roll ja lõigud lõppmastide vahel ning liiguta masti plaanil või liini profiilil.
keywords: õhuliin, mast, post, vahemik, lõik, lõppmast, nurk, kandev, profiil, kõrgus, traaver, tõmmis, ankur
from: b8e5e272
---

## Joonista see

1. Ole pinna kallal: liini all olev maapind tuleb sealt ([Koosta pind](topic:build-surface)). Mast, mille all maad pole, on loetletud jaotises **Checks**; sisesta selle asemel **Ground level** Omadustes.
2. Klõpsa {{ui:Line}} grupis Power lines ja klõpsa plaanil iga masti.
3. Topeltklõpsa viimasele või vajuta Enter.

Liin saab juhtme, masti ja varustuse, mida sa viimati sellel arvutil kasutasid (esimest korda: teegi näited). Muuda neid Omadustes.

## Liin Omadustes

Vali liin (klõpsa vahemikul), et määrata selle **Conductor**, **Conductors per circuit**, **Circuits**, **Voltage**, **Clearance rule**, mida ta peab maapinnast hoidma, ja varustus **On every support** (traaver, isolaatorid, kinnitusdetailid). Tabel loetleb selle **sections** koos iga lõigu ulatusvahemiku, igapäevase pingega ja koormusjuhuga, mis seda juhib.

## Mastid

Klõpsa masti, et see valida. Omadustes:

- **Support**: selle teegiüksus. Kui see on liiga nõrk, paneb {{ui:Use …}} sisse väikseima sama materjali masti sinu teegist, mis kannab koormust.
- **Role**: Automatic, Suspension, Angle või Dead-end. Automatic tähendab: esimene ja viimane mast on lõppmastid; pööre üle reegelikomplekti nurga teeb nurgamasti; suurem pööre teeb lõppmasti.
- **Height above ground**: tühi võtab selle teegiüksusest (selle pikkus miinus maasse ulatuva osa sügavus).
- **On this support too**: lisavarustus, näiteks **stay** (tõmmis). Tõmmisega mast annab liini tõmbe oma tõmmisele.
- **Existing support**: seda kontrollitakse nagu teisi, kuid see jäetakse kogustest välja.

{{ui:Support}} lisab masti lähimale vahemikule sinu klõpsust. Lohista mast plaanil, et seda liigutada. Delete eemaldab selle (liinil on alles vähemalt kaks masti).

Lõigud ulatuvad lõppmastide vahel: lõigu sees jookseb juhe vabalt läbi kandeklambrite, nii et üks pinge hoiab kogu lõiku.

## Liini profiil

Klõpsa {{ui:Profile}} (või **Profile** liini Omadustes). Plaani all olev paneel näitab maapinda mööda liini, iga masti maapinnast kuni selle tipuni, juhtme madalaimat faasi valitud **Load case** juures ning ruumivaru, mida liin peab hoidma, katkendjoonena. Ebaõnnestunud vahemik on punane; iga vahemiku all olev number on selle madalaim ruumivaru.

- **Line** valib näidatava õhuliini. Teise liini või selle masti valimine plaanil lülitab profiili sellele.
- Liiguta kursor profiili peale: juhikujoon järgib seda ja silt loeb kauguse mööda liini, maapinna, juhtme ja ruumivaru seal (ning ütleb, kui ruumivaru on liini reegli alla).
- {{ui:Measure}} profiili ribal: klõpsa kahel punktil, et saada nendevaheline vahekaugus, kõrgusvahe, sirgjooneline kaugus ja kalle. Klõps maapinna, juhtme või masti tipu lähedal haakub sellega. Peatamiseks klõpsa uuesti {{ui:Measure}}.
- Liin ületavad takistused tõusevad maapinnast: joonistatud takistused baaridena, Maastiku taimed nende võrana, seinad baaridena (vaata [Elektriliinide kontrollid](topic:power-line-checks#clearances)). Kaablitrassid ja torud, mida liin ületab, on maapinnast allpool märgistatud oma tipust, koos nimega.

- Lohista mast külgsuunas, et liigutada seda mööda liini.
- Lohista selle tippu üles või alla, et määrata kõrgus maapinnast.
