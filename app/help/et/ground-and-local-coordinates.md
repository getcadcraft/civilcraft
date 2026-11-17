---
title: Maapinna ja kohalikud koordinaadid
summary: Tööta maapinna (pinna) koordinaatidega, mis on ruudustikust skaleeritud kombineeritud mõõtkavateguri järgi, mille sisestad või arvutad punktis, või eeldatud saidi ruudustikus, mis seotakse süsteemiga kahe juhtpunkti kaudu.
keywords: maapinna koordinaadid, pinna koordinaadid, ruudustikust maapinnale, kombineeritud mõõtkavatee, csf, kombineeritud tegur, ruudustiku tegur, kõrguse tegur, merepinna tegur, konvergents, kaardistusnurk, mõõtkavatee, eeldatud koordinaadid, kohalikud koordinaadid, saidi ruudustik, 5000 5000, juhtpunktid, lokaliseerimine, kalibreerimine, kahe punkti, sulgemisviga
from: 3d7453de
---

Riigi tasandikukoordinaadid (state plane) ja UTM-koordinaadid on **ruudustiku** koordinaadid: kaardiprojektsioon venitab või kahandab vahemaid veidi (kümnetes miljonikosades), ja mida kõrgemal asub koht, seda rohkem erineb mõõdetud maapinnakaugus ruudustiku omast. Paljud mõõdistused annavad seetõttu üle **maapinna** koordinaadid, skaleeritud nii, et joonise vahemaad võrduvad maapinnal mõõdetud vahemaadega, või **eeldatud** saidi ruudustiku (5000, 5000 juhtpunktil). CivilCraft hoiab sinu arve nii, nagu need on, ja salvestab, kuidas need on seotud ruudustikuga, nii et laiuskraad ja pikkuskraad, GIS-failid ja kaardikihid jõuavad ikka õigesse kohta.

Ava {{ui:Koordinaadid}} {{ui:GIS}}-rühmas, vali (või jäta alles) süsteem ning vali jaotises **Ruudustiku, maapinna või kohalikud koordinaadid**:

| Valik | Sinu koordinaadid on | Kuidas need on seotud ruudustikuga |
|---|---|---|
| {{ui:Ruudustik}} | Süsteemi enda (algus) | Samad arvud |
| {{ui:Maapind}} | Skaleeritud maapinnakaugusteks | ruudustik = baas + kombineeritud tegur × (maapind − baas) |
| {{ui:Kohalik}} | Eeldatud saidi ruudustik | Nihutatud, pööratud ja skaleeritud ruudustikule kahe juhtpunkti järgi |

Mida iganes valid, salvestatakse see projektiga ja see on üks tagasivõtmise samm; midagi ei liigu.

## Maapinna koordinaadid

1. Vali {{ui:Maapind}}.
2. Sisesta mõõdistusest **Kombineeritud mõõtkavatee** (näiteks `0.99987`) või arvuta see:
   1. Jaotises **Arvuta tegur punktis** on punkt alguses projekti keskel. Vali {{ui:Vali punkt plaanilt}} ja klõpsa kohta (klõps punkti lähedal võtab selle punkti), või sisesta E ja N.
   2. Kõrgus tuleb sealsest pinnast; sisesta teine, kui vajad.
   3. Vali {{ui:Arvuta}}. CivilCraft näitab:
      - **Ruudustiku mõõtkavatee k**: kui palju kaardiprojektsioon seal vahemaid venitab.
      - **Kõrguse tegur**: kui palju lühemad on vahemaad elliptoidil kui sellel kõrgusel.
      - **Kombineeritud tegur** = k × kõrguse tegur: ruudustikukaugus = maapinnakaugus × see.
      - **Konvergents**: nurk ruudustiku põhjast tõelise põhjani seal (geodeetiline asimut = ruudustiku asimut + konvergents).
   4. Vali arvude all nupp {{ui:Kasutus}}, et panna kombineeritud tegur kasti.
3. Määra **Baaspunkt**, kus maapinna ja ruudustiku koordinaadid on samad. See algab 0, 0-st: enamik omavalitsusi, kes avaldavad maapinna koordinaadid, skaleerivad ümber nullpunkti, nii et maapinna koordinaadid jäävad äratuntavalt lähedale ruudustiku omadele. Mõned mõõdistused skaleerivad ümber projekti juhtpunkti: kasuta seda, mida mõõdistus ütleb.
4. Vali {{ui:Rakenda}}.

:::warning
Kõrgus võetakse kõrgusena elliptoidist. CivilCraftil pole geoidi mudelit, nii et kohtades, kus geoid on elliptoidist 30 m (100 ft) madalamal või kõrgemal, on kõrguse tegur umbes 5 ppm võrra vale. Kui mõõdistus avaldab oma kombineeritud teguri, sisesta see.
:::

## Kohalikud (eeldatud) koordinaadid

1. Vali {{ui:Kohalik}}.
2. **Juhtpunkti 1** jaoks sisesta mõõdistuspunkti number (või vali {{ui:Vali}} ja klõpsa seda plaanil). Selle kohalikud koordinaadid kuvatakse kõrval.
3. Sisesta selle **ruudustiku** E ja N või selle laiuskraad ja pikkuskraad kolmandasse kasti (näiteks `30.2672, -97.7431`).
4. Tee sama **Juhtpunkt 2** jaoks, võimalikult kaugel esimesest.
5. CivilCraft näitab leitud **Mõõtkava** ja **Pööret** ning tuletab meelde: **Kaks punkti sobivad alati täpselt — kontrolli kolmandat.**
6. Anna **Kontrollpunkt** samal viisil. CivilCraft näitab, kui kaugele sobitus paneb selle sinu sisestatud ruudustiku koordinaatidest (selle sulgemisviga, projekti ühikutes ja miljonikosades). Suur sulgemisviga tähendab valet punkti, kirjavea või koordinaate teises ühikus.
7. Vali {{ui:Rakenda}}.

Mõõtkava, mis on kaugel 1-st (väljaspool 0.5 kuni 2), lükatakse tagasi: kontrolli punkte ja nende ühikuid.

## Mida kontrolliti

- Mõõtkavatee ja konvergents ühtivad PROJ-iga (pyproj 3.7.1 koos PROJ 9.5.1-ga), koordinaatide raamatukoguga, mida enamik GIS-programme kasutab, täpsusega 1 miljardik osa üle 300 süsteemi konformsete projektsioonidega (riigi tasandik, UTM, põikimerkator, Lambert conformal conic), ja brauseris plaanil valitud punktis.
- Maapinna- ja kohalikud sammud teisenduvad edasi-tagasi täpsusega 1 miljardik osa; kaks juhtpunkti annavad tagasi mõõtkava ja pöörde, millega need tehti; kontrollpunkt 0.05 ft kaugusel näitab sulgemisviga 0.05 ft.
