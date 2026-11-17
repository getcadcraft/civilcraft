---
title: Pikiprofiili kujundamine
summary: Ava profiilivaade, alusta kujundusprofiili maapinnast, lisa ja lohista PVI-sid, sea vertikaalkõverate pikkused ning loe kaldeid, K-väärtusi ning kõrgeid ja madalaid punkte.
keywords: profiil, vertikaalne joondus, pvi, vertikaalkõver, kalle, k-väärtus, hari, org, bvc, evc, profiilivaade, valmiskõrgus, fg, olemasoleva maapinna profiil, tunnusjooned profiilis, ristumised, projitseeritud, äärekivi, kraav, sildid
from: e9182bfa
---

Igal joondusel on üks kujundusprofiil: loend PVI-dest (pikkuskoordinaat ja kõrgus), mis on ühendatud sirgete kallakutega, ning sümmeetriline parabooli kujuline vertikaalkõver igal sisemisel PVI-l, millel on pikkus. Olemasoleva maapinna profiil võetakse pinnast sinu eest.

## Ava profiilivaade

1. Vali joondus (kliki sellel valikuvahendiga {{ui:Vali}}).
2. Vajuta {{key:R}} või kliki tööriistaribal {{ui:Pikiprofiil}} või {{ui:Profiilivaade}} parempoolse paneeli all.
   Profiilivaade avaneb plaani all, kus olemasolev maapind on joondusel. Kui joondusi on kaks või rohkem, vali üks profiiliriba vasakul pool olevast loendist.

Vaade näitab alati kogu joondust ja venitab kõrgused paneeli täitmiseks; liialdus on kirjas vasakus alanurgas, näiteks „Vertikaalne liialdus 10×“. Suumi ega nihutamist ei ole.

Liiguta kursorit mööda profiili: riba näitab pikkuskoordinaati, maapinna ja kujunduse kõrgusi, kallakut ning seal olevat kaevet või täidet, ning punkt liigub plaanil joondusel.

## Alusta kujundusprofiili

1. Paremas paneelis jaotises **Kujundusprofiil** kliki {{ui:Alusta maapinnast}}.
   Kaks PVI-d asetatakse maapinnale joonduse kahte otsa, ühendatud ühe sirge kaldega. Olekuriba ütleb „Kujundusprofiil alustatud maapinnast mõlemas otsas. Lülita sisse Lisa PVI-d ja kliki, et lisada kaldemurdeid; anna neile kõverapikkus tabelis.“

Kui joondus ei ristu pinnaga, saad teate „Sellel joondusel pole maad, millest alustada.“ Siis lisa PVI-d klõpsates (järgmine jaotis).

## Lisa PVI-d

1. Vajuta {{key:I}} või kliki profiiliribal {{ui:Lisa PVI-d}}. See jääb vajutatuks.
2. Kliki profiilis kohta, kus soovid kaldemurdet. PVI lisatakse sellele pikkuskoordinaadile ja kõrgusele, ümardatuna 0.01-ni, ja valitakse.
3. Lisa neid, kui vaja, seejärel vajuta {{key:I}} uuesti, et lisamine lõpetada.

Klõps kohas, kus on juba PVI, lükatakse tagasi („Kohas … on juba PVI“). PVI-d jäävad alati pikkuskoordinaatide järjekorda.

## Kohenda PVI-sid

- **Lohista** PVI-d profiilis, et seda liigutada. See ei saa üle naabritest minna. Liigutus on üks tagasivõtmise samm.
- **Sisesta** täpsed väärtused paremas paneelis asuvas PVI-tabelis: **Station** (pikkuskoordinaat), **Elevation** (kõrgus) ja **Curve L** (vertikaalkõvera pikkus). Vajuta igale järel {{key:Enter}}.
- **Eemalda** PVI, kasutades rea lõpus olevat x-i, või vali see (kliki sellel) ja vajuta {{key:Delete}}. Kui profiilivaatel on fookus, eemaldab selle ka {{key:Backspace}}.

Esimene ja viimane PVI ei saa kunagi kõverat.

## Vertikaalkõverad

1. Sisesta pikkus väljale **Curve L** sisemisele PVI-le, näiteks 200.
2. Kõver joonistatakse PVI keskele. Profiil ja parem paneel näitavad selle liiki (hari või org), L ja K, BVC ja EVC pikkuskoordinaate ja kõrgusi ning selle kõrget või madalat punkti, kui see asub kõvera sees.

K arvutatakse L-ist (K = L jagatud kallakute algebralise vahega protsentides). Sisestad L; K-d otse sisestada ei saa veel.

Kui vertikaalkõver ei mahu, ütleb punane kast põhjuse: see läheb tagasi eelmisesse PVI-sse või kõverasse või üle järgmise PVI, ja kui palju ruumi on sellel pool (kõver vajab poole oma pikkusest igal pool oma PVI-st). Selle nupp seab **sobiva pikima kõvera** koos oma K-ga ühe sammuna ({{key:Mod+Z}} võtab selle tagasi). Või liiguta PVI-sid kaugemale.

## Loe fakte

Tabeli all olev loend annab iga kalde protsentides („Grade 1: +1.25%“) ja iga kõvera, näiteks „Hari pikkuskoordinaadil 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, seejärel „Kõrge punkt 1+62.40, 254.12“.

Kui PVI-d ei ulatu joonduse mõlema otsani, ütleb sellest märkus. Koridor ehitatakse ainult sinna, kus profiil ja joondus kattuvad.

## Tunnusjooned profiilis

Tunnusjooned näevad ka profiilivaates, nii et näed äärekivi, kraavi või seina ülaosa teeprofiili kõrval.

- Kus tunnusjoon **ristub** joondusega, näitab profiil väikest rombi sellel pikkuskoordinaadil ja kõrgusel, sildiga joone nimi ja selle kõrgus seal (joone enda kõrgus, arvutatud ristuva lõigu järgi).
- Sisesta kaugus väljale {{ui:Trassi kõrval kuni}}, et joonistada ka tunnusjooned, mis **kulgevad** joonduse kõrval selle kauguse piires, katkendjoontena nende enda kõrgustel. Tühi või 0 näitab ainult ristumisi.
- Märgid ja sildid järgivad iga muudatust: liiguta tippu, sisesta kalle või tõsta joont, ja profiil näitab kohe uusi kõrgusi.
- Kliki ristumise rombile, et valida see tunnusjoon; valitud joon joonistatakse esiletõstmisvärviga.
- {{ui:Tunnusjooned}} profiliribal peidab või näitab neid kõiki. Mõlemad seaded salvestatakse projektiga.

Vaata [Tunnusjooned](topic:feature-lines).

## Järgmised

- [Loo teekoridor](topic:corridor) mööda joondust ja seda profiili.
- Profiil kirjutatakse LandXML-i koos joondusega; vaata [LandXML-i vahetus](topic:landxml).
