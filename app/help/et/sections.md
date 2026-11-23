---
title: Proovijooned ja ristlõiked
summary: Lõika lõiked trassi suhtes ristkülikuna, vaata maapinda, projekti ning kaevandit ja täidet igal jaamal ning saa mahud keskmiste otsapindade järgi.
keywords: massi ülekandmine, massi diagramm, tasakaalupunkt, kahanemine, paisumine, veokaugus, laen, jäätmed, lõigete lehed, ristlõigete lehed, lõigete PDF, lõiked, ristlõiked, proovijooned, lõikevaade, kaevand, täide, pinnad, mõõtmine, keskmise otsapinna meetod, otsapinna mahud, pinnasetööd, jaam, nihe, CSV
from: 09639ce2
---

Ristlõige näitab teed nii, nagu see ehitatakse: trassi ristsuunas ühes jaamas on olemasolev maapind, projekt (koridor või platvorm sisse planeeritud) ning kaevand ja täide nende vahel.

## Proovijoonte lisamine

1. Vali trass. Atribuutides jaotises **Proovijooned** klõpsa {{ui:Lisa proovijooned}}.
2. Määra **Iga** (vahe: algselt 50 ft või 20 m), **Vasak laius** ja **Parem laius** (kui kaugele iga lõige ulatub keskjoonest).
3. Et lõigata lõige kindlas jaamas, kirjuta see kasti **Lisa jaam** (näiteks `2+35`) ja vajuta {{key:Enter}}.

Lõiked lõigatakse igal kordsel vahemiku täisarvul, mõlemal trassi otsal, iga kõvera alguses ja lõpus (PC ja PT) ning jaamades, mille lisad. Proovijooned on plaanil hallid jooned üle trassi; need lähevad ka DXF-, DWG- ja PDF-i kihile C-ROAD-SCTN. Iga muudatus on üks samm: {{key:Mod+Z}} võtab tagasi.

## Lõikevaade

Ava see nupuga {{ui:Lõike vaade}} trassi atribuutidest, {{ui:Lõiked}} jaotises **Pind** › {{ui:Veel}}, või {{key:X}}. See asendab pikiprofiilivaate plaani all.

- Liigu lõigete vahel noolte abil vaate ribal, jaamade loendiga või klahvidega {{key:Left}} ja {{key:Right}}, kui lõikevaade on fookuses ({{key:Home}} ja {{key:End}} esimese ja viimase jaoks).
- Hall joon on olemasolev maapind, punane joon projekt. Kaevand on oranžiga varjutatud, täide roheliga. Koridori punktid on märgitud: CL (keskjoon), EOP (sõiduteekatte serv), SH (ääriala) ja DL (päevavalgus).
- Päis näitab jaama, selle lõike kaevandi ja täite pindu ning vertikaalset liialdust. {{ui:Sobita}} täidab paneeli; vali 1×, et näha lõiget tõelises mõõtkavas.
- Plaanil näitab paks joon, milline lõige on ekraanil.
- **Suum ja nihe:** ratas suumib osuti kohal ja lohistamine liigutab vaadet. {{ui:Sobita}} (või {{key:F}}, või topeltklõps) sobitab kogu lõike uuesti.

## Mõõtmine lõikes

1. Klõpsa {{ui:Mõõda}} lõikeribal või vajuta {{key:M}}. Vihje ütleb: „Klõpsa esimest punkti, seejärel teist.“
2. Klõpsa kahte punkti. Igaüks haakub joone otsa või koridori punkti (CL, EOP, SH, DL) külge; hoia {{key:Alt}} vaba punkti jaoks.
3. Näit annab horisontaalkauguse (ΔH), vertikaalkauguse (ΔV), kalde protsendina koos suhtega ja sirge pikkuse projekti ühikutes.

Klõpsa uuesti, et alustada uut mõõtmist. {{key:Esc}} tühjendab mõõtmise ja {{key:M}} lülitab mõõtmise välja.

## Põikprofiilide lehed

{{ui:Põikprofiilide lehed (PDF)}} jaotises **Proovijooned** paneb iga lõike PDF-lehtedele, ridades vasakult paremale ja ülevalt alla jaama järjekorras. Vali **Paber**, **Plaani mõõtkava** (lõigete horisontaalne mõõtkava) ja **Profiili liialdus** (1×, 2×, 5× või 10×); dialoog ütleb, mitu lõiget mahub lehele ja mitu lehte sellest tuleb.

Iga lõige näitab ruudustikku nihkete ja kõrgustega, maapinda (katkendjoon), projekti, kaevandit ja täidet varjutatuna (oranž ja roheline), koridori punkte ning all oma jaama ja kaevandi ning täite pindu. Kõik lehe lõiked on joonistatud ühesuurused, piisavalt kõrged suurimale neist; kui see ei mahu lehele sinu liialdusega, kasutab CivilCraft suurimat, mis mahub, ja ütleb seda. Pealkirjariba nimetab trassi, lehel olevad jaamad, mõõtkavad ja „Leht 1 / 3“.

## Mida kaevand ja täide mõõdetakse

Koridoril võib olla kihte katte all: katendikihid, malli komponendid, rada. Valik **Mahud mõõdetakse** lõikeribal määrab, kuni kuhu kaevand ja täide ulatuvad:

- **Alumine pind** (algväärtus): kuni nende komponentide alumise servani, nii et kaevand sisaldab katte sügavust.
- **Ülemine pind**: ainult projekti ülemise pinnani, nagu varem, kui komponente ei arvestatud.

Päise pindalad, allolevad mahud, CSV ja massi ülekandmine järgivad seda valikut ning see salvestatakse projektiga.

## Mahud keskmiste otsapindade järgi

Kahe naabruses oleva lõike vahel on maht nende kahe pindala keskmine korrutatuna nende jaamade vahekaugusega. Riba näitab trassi kogusummasid ja {{ui:CSV}} laeb alla iga lõike pindalad ja mahud jooksvate summadega (kuupjardid jalgade projektidel, kuupmeetrid meetrilistel).

Atribuutides on samad summad kõrvuti ruudustiku meetodi mahtudega [Pinnasetöömahtudest](topic:volumes). Need on kaks erinevat ligikaudset väärtust: lähemad lõiked viivad need lähemale, ja sirgel teel tasasel maal on need samad.

:::note
Kaevand ja täide arvestatakse ainult planeeritud aladel (koridori või platvormi päevavalguse joontes), nagu ruudustiku meetod teeb. Ilma koridori või platvormita on projekt maapind, nii et lõige ei näita kaevandit ega täidet.
:::

## Massi ülekandmine

**Massi ülekandmine** jaotises **Proovijooned** joonistab massi ülekandmise diagrammi samadest keskmise otsapinna mahtudest: jaamade kaupa jooksev summa kaevandist miinus täide.

- **Kaevandi kahanemine (−) või paisumine (+)** ütleb, mida kuupjard kaevandit teeb, kui see on laotud täiteks: −10 % (algväärtus, kohatäide) tähendab, et see kahaneb 0.9-ni; paisuv kivi võib olla +5 %. Kasuta oma geotehnilise aruande arvu.
- Kus joon tõuseb, on tee kaevandis; kus langeb, on täitel. Nulli kohal (oranž varjutus) liigub muld jaama suunas üles; nulli all (roheline) alla.
- **Tasakaalupunktid** on kohad, kus joon lõikab nulli: kahe sellise vahel kaevand ja täide on tasakaalus. Tabel loetleb iga tasakaalustatud lõigu, liigutatud mahu (tema kõrgeim või madalaim punkt) ja keskmise veokauguse (varjutatud pindala jagatud selle mahuga).
- Kus joon lõpeb nullist eemal, on järele jääv **jäätmed** (üle nulli) või **laen** (alla nulli). Selles viimases lõigus loetakse liigutatuks ainult muld sellest tasemest kaugemal, kus see lõpeb.

**CSV** salvestab massi ordinaadi igal lõikel, lõigud ja teguri.
