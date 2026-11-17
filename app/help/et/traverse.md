---
title: Polügoonikäigu sisestamine ja korrigeerimine kompassireegli järgi
summary: Sisesta välja nurgad või suunanurgad ja kaugused, kontrolli nurgalist ja lineaarset sulgumisviga ning täpsust, korrigeeri kompassireegli järgi ning lisa punktid mõõdistuspunktidena või ring katastriüksusena.
keywords: polügoonikäik, suletud polügoonikäik, ring, paremad nurgad, tagasivaade, suunanurgad, kaugused, sulgumisviga, täpsus, kompassireegel, bowditch, korrigeerimine, mõõdistus
from: 56ce5a8c
---

Polügoonikäik on mõõdetud lõikude jada: igas punktis nurk (või suunanurk) ja kaugus järgmiseni. Kui midagi pole valitud, klõpsa paremal paneelil jaotises **Polügoonikäik** nuppu **Sisesta polügoonikäik**.

## Kust see algab ja lõpeb

1. **Algus mõõdistuspunktil**: selle number. Või sisesta põhjakoordinaat ja idakoordinaat.
2. **Lõigud kujul**: **Paremad nurgad ja kaugused** või **Suunanurgad ja kaugused**.
3. Nurkade korral märgi, kust need algavad: **Tagasivaate mõõdistuspunkt** või **selle asimuut** (esimesest punktist tagasivaate suunas, päripäeva põhjast).
4. **Lõpp**: **tagasi alguses (ring)** või **mõõdistuspunktil** ja selle number (avatud polügoonikäik teadaolevate punktide vahel).

## Sisesta lõigud

Üks lõik real: kõigepealt nurk, siis kaugus ja soovi korral järgmise punkti nimi:

- Paremad nurgad, pööratud päripäeva punktis, kust lõik lahkub, tagumisest punktist järgmiseni: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` ja `270.0028` töötavad samuti.
- Suunanurgad: `N 45°30'15" E 125.50 B`, või asimuut ühe sõnana: `AZ 45-30-15 125.50 B`.
- Nurkadega ringi lõpus kirjuta `close` ja alguspunkti nurk veel kord, pööratuna viimasest punktist teiseni: `close 270°00'05"`. Just see kontrollib nurki.

Loetamatud read on loetletud koos rea numbritega. „feet“, komad ja `#` kommentaarireaga read on lubatud.

## Sulgumisvea lugemine

Kui sisestad, näitab dialoog:

- **Nurgaline sulgumisviga**: kui kaugel nurgad sulgumisest on ja kui suure osa igale nurgale langeb. Ilma sulgeva nurgata nurki ei kontrollita ja nende viga ilmneb lineaarses sulgumisvigas.
- **Lineaarne sulgumisviga**: kui kaugel polügoonikäik lõpeb sellest kohast, kus peaks, ja mis suunas.
- **Täpsus**: polügoonikäigu pikkus jagatud lineaarse sulgumisveaga: 1 : 10,000 tähendab 1 ft 10,000 ft kohta.
- Punktid pärast korrigeerimist ja see, kui kaugele iga punkt liikus.

## Korrigeerimine

Esmalt jaotatakse nurgaline sulgumisviga võrdselt nurkade vahel. Seejärel jaotatakse lineaarne sulgumisviga lõikude vahel kompassireegli (Bowditch) järgi: iga punkt liigub sulgumisvea vastu võrdeliselt selle punktini jõudmiseks läbitud pikkusega, nii et polügoonikäik lõpeb täpselt õiges kohas.

:::note
Kompassireegel on standardne korrigeerimine, mitte vähimruutude meetod, ega kaalu nurki kauguste vastu. Kas täpsus on piisav, otsustavad sinu enda standardid ja sinu piirkonna nõuded.
:::

## Tulemuse kasutamine

- **Lisa mõõdistuspunktidena**: korrigeeritud punktid saavad mõõdistuspunktideks sinu antud nimed (muidu järgmised vabad numbrid), kirjelduseks `TRAV` ja ilma kõrgusmärgita. Ringi viimane punkt on alguspunkt, seetõttu ei lisata seda kaks korda. Üks samm: {{key:Mod+Z}} võtab selle tagasi.
- **Lisa katastriüksusena** (ringid): korrigeeritud punktid saavad [katastriüksuseks](topic:parcels), koos siltide ja õigusliku kirjeldusega.
- **Aruanne (CSV)**: sulgumisvea read ning iga punkti suund, kaugus, korrigeerimata ja korrigeeritud koordinaadid ning parandused.
