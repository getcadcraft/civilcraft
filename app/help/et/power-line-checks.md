---
title: Elektriliinide kontrollid
summary: Mida CivilCraft iga liini ja kaabli kohta kontrollib, alati ajakohasena: vabaruumid, vahed, kõikumine, üleslükkamine, toetuskoormused ja mõõtmine, kinnitusdetailid, tõmbetrossid, vundamendid, puuduvad andmed, ühendused, ülekoormused ja pingelang.
keywords: kontrollid, vabaruum, maapinna vabaruum, takistus, ristumine, faasivahe, isolaatori kõikumine, üleslükkamine, toetuskoormus, nimikoormus, mõõtmine, vundament, tõmbetross, post, kinnitusdetail, traavers, pingelang, ülekoormus, puuduvad andmed, lahti ühendatud
from: e6a0da47
---

**Kontrollid** jaotises Elektriliinid loetleb iga probleemi: punane tähistab ebaõnnestumist, kollane hoiatust. Kliki ühel, et valida liin, toeta, kaabel või seade, millest see räägib; ebaõnnestunud toed ja vahemikud on plaanil punase ringiga, kui tööruum on avatud.

:::warning
Kujundusabi: need on sinu kujunduse kontrollid sinu enda reeglite järgi, mitte sertifikaat.
:::

## Vabaruumid

Juhi madalamat faasi jälgitakse igal vahemikul igas koormusjuhus. Selle madalaim vaba ruum maapinnast peab vastama liini **Vabaruumi reeglile**. Kus vahemik ristub **takistusega** (joonistatud nupuga {{ui:Takistus}}: punkt või joon, koos selle kõrgusega maapinnast ja oma vabaruumi reegliga), kontrollitakse vaba ruumi takistuse tipust samamoodi.

**Ka see, mida Maastiku tööruum maapinna kohale paneb, loeb.** Üksikud taimed (nende võra täiskasvanud laiuses ja kõrguses), hekid ja istutusalad (nende kõrgeimad liigid) ning seinad (nende ülaosa) on liini all takistused, ilma et neid peaks uuesti joonistama. Need säilitavad reeglid, mis on seatud {{ui:Koormusjuhud ja piirangud…}}: **Maastiku taimed liini all** (näidiskomplektides on kasutusel *Puud ja taimed*, 3 m) ja **Maastiku seinad liini all** (*Hoone*); vali **Ei kontrollita**, et need välja jätta. Vaba ruum mõõdetakse otse üles taime või seina ülaosast juhini kohas, kus vahemik seda ristub; külgsuunaline kaugus liini kõrval olevast võrast ei ole kontrollitud. Puu liigutamine või seina tõstmine muudab kontrolle kohe.

Sinu vabaruumi reeglid on sinu enda: ava need nupuga **Reeglid…** mis tahes **Vabaruumi reegli** kõrval (või {{ui:Koormusjuhud ja piirangud…}}), et neid lisada, ümber nimetada, muuta või eemaldada.

## Vahed ja kõikumine

- **Vajalik faasivahe**: k·√(rippe + isolaatori pikkus) + U/150, kuuma koormusjuhu rippe ja pingega U kV-des (levinud kuju; k tuleneb sinu reeglistikust). Võrreldakse traaversi faasivahega.
- **Isolaatori kõikumine** rippetugedel tuulekoormuse juhul: atan(põikkoormus ÷ vertikaalkoormus), võrreldes reeglistiku suurima kõikumisega.
- **Üleslükkamine**: rippetugi, mis on madalam kui naabrid, võib külmas üles tõmbuda; see märgitakse.

## Toetuskoormused ja mõõtmine

Igale toele ja koormusjuhule koos kõigi liini juhtmetega:

- **Põikkoormus**: tuul meetri kohta × tuulevahemik (kahe vahemiku pool), pluss 2·H·sin(pööre ÷ 2) pöördel.
- **Mööda liini**: kahe poole pingete vahe lõpp- või nurgatoel; rippetoel ainult jääst ühel pool (iga vahemik eraldi arvestatud, mis on turvalises suunas).
- **Vertikaalne**: vertikaalkoormus meetri kohta × kaaluvahemik (kahe poole madalaimate punktide vahel) pluss seadmed.

Horisontaalkoormus viiakse toe nimipunkti (ekvivalentkoormus = koormus × kinnituskõrgus ÷ nimipunkti kõrgus) ja võrreldakse selle **nimikoormusega** × reeglistiku tegur. Kui see on liiga nõrk, soovitatakse teegist väikseimat sama materjali toed, mis selle kannab. Toes, millel on **tõmbetross**, annab horisontaalkoormuse tõmbetrossile, mis kannab koormust ÷ sin(tõmbetrossi nurk), ja seda kontrollitakse oma nimiväärtuse järgi.

Kinnitusdetailid (klambrid, isolaatorid, traaversid) kontrollitakse nimikoormuse järgi: ankurdav detail kannab juhi pinget, rippetoe detail oma osa vertikaal- ja põikkoormusest. Näidatud **vundament** on toe sügavus maapinnas ja auk, mis on veidi laiem kui selle jalg.

## Andmed, ühendused ja vool

- Kirje, millel on nõutav väli tühi, või võti, mida teegis pole.
- Kaabli marsruudi ots või seade, mis pole ühendatud millegagi.
- **Pingelang** ja **vool** igast allikast (seade, mis on märgitud allikana) koormusteni (kW ja võimsustegur seadmel) mööda õhuvahemikke ja kaableid: √3·I·L·(R cos φ + X sin φ), R 20 °C juures. Rohkem kui kaabli nimivool või rohkem pingelangu, kui reeglistik lubab, märgitakse.
