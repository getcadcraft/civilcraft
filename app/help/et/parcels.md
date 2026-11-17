---
title: Kinnistute joonistamine ja nende õiguslike kirjelduste koostamine
summary: Joonista kinnistu nurkade järgi või sisesta omandikirja või plaadi mõõdud, kontrolli, kui hästi mõõdud sulguvad, märgi plaanile suunanurgad ja kaugused, muuda mis tahes lõik kõveraks ning kopeeri mustandina õiguslik kirjeldus.
keywords: kinnistud, krundid, kinnistupiirid, piir, omandikiri, plaan, mõõtmised ja piirid, suunanurk, kaugus, sulgemine, sulgemisviga, täpsus, õiguslik kirjeldus, algpunkt, kõver, raadius, pindala, acres
from: 6793d6ce
---

Kinnistud asuvad plaanil koos suunanurga ja kaugusega igal sirgel lõigul (kõver näitab oma raadiust, pikkust ja keskmist nurka) ning nime ja pindalaga keskel. Need lähevad PDF-plotti ning DWG- ja DXF-eksporti kihtidel `V-PROP` (jooned) ja `V-PROP-TEXT` (sildid). Kui midagi pole valitud, on kõik paremal paneelil jaotises **Kinnistud**.

## Kinnistu joonistamine

1. Klõpsa **Joonista kinnistu**.
2. Klõpsa nurgad, alustades algpunktist. Klõps mõõdistuspunkti lähedal võtab selle punkti täpse koha.
3. Klõpsa esimene nurk uuesti või vajuta {{key:Enter}}, et lõpetada. {{key:Backspace}} võtab viimase nurga tagasi; {{key:Esc}} eemaldab seni tehtud nurgad; vajuta uuesti, et tööriistast väljuda.

## Mõõtude sisestamine omandikirjast

1. Klõpsa **Sisesta omandikirja mõõdud**.
2. Märgi, kust mõõdud algavad: mõõdistuspunkti number või põhja- ja idakoordinaat.
3. Kirjuta või kleebi mõõdud, üks rida kohta:
   - joon: suunanurk ja kaugus, näiteks `N 45°30'15" E 125.50`. Töötavad ka `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` ja asimuudid (`AZ 45°30'15"`). Sõnad „thence“ ja „feet“, komad ning sõnad „thence“ ja „feet“ jäetakse arvestamata.
   - kõver: `C R 300 L 52.36 right` (raadius ja kaareklahv) või `C R 300 D 10°00'00" left` (raadius ja keskmine nurk). Kõver järgneb eelnevale lõigule; kui ei järgne, lisa selle kõõlu suund: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` alustab kommentaarirea.
4. Kui kirjutad, näitab dialoog mõõtude pikkust, **sulgemisviga** (kui kaugele nad algusest lõpevad ja mis suunas), **täpsust** (pikkus jagatud sulgemisveaga, 1 : 10,000 jne) ja pindala. Read, mida ta lugeda ei oska, luetletakse oma reanumbritega.
5. **Lisa kinnistu**. Kui mõõdud ei sulgu, sulgub kinnistu lõhe ületava sirge lõiguga: kontrolli mõõte omandikirjaga. Välimõõdistuse vea jaotamiseks selle lõikude vahel reguleeri seda enne.

## Kõverad

Kinnistu **Omadustes** on igal lõigul **Raadius**. Sisesta raadius, et lõik muutuks kõveraks läbi samade kahe nurga (raadius, mis on väiksem kui pool nurkade vahelisest kaugusest, ei ulatu sinna ja seda ei võeta vastu), ning vali jaotises **Kõverad** **Paremale** või **Vasakule**: paremale kõverduv kõver on keskpunktiga liikumissuunast paremal, nagu omandikirjas. Raadiuse tühjendamine muudab lõigu jälle sirgeks. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Õiguslik kirjeldus

Kinnistu omaduste lõpus on selle õiguslik kirjeldus, mis on kirjutatud joonise järgi:

- „Algab“ sisestatud **Algpunktist** (näiteks „Lot 4 kirdenurk“), muidu esimese nurga põhja- ja idakoordinaadist või mõõdistuspunktist, millest mõõdud algasid.
- „seejärel“ iga lõik: suunanurk ja kaugus või kõver oma raadiuse, kaareklahvi, keskmise nurga ning kõõlu suuna ja kaugusega.
- „Sisaldab“ oma pindala square feet ja acres (square meters ja hectares meetrilises projektis).

**Kopeeri** paneb selle lõikepuhvrisse; **Laadi alla tekstina** salvestab selle `.txt`-failina.

:::warning
Õiguslik kirjeldus on joonisest koostatud mustand, mitte mõõdistus. Litsentseeritud mõõdistaja peab selle kontrollima registriandmetega ja allkirjastama enne, kui keegi sellele toetub.
:::

Kinnistu valimiseks klõpsa plaanil selle sees; {{key:Delete}} eemaldab selle. Kinnistud salvestatakse projektifaili.
