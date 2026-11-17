---
title: Proovijooned ja ristlõiked
summary: Lõika lõiked trassiga risti, vaata maapinda, projekti ning kaevamist ja täidet igal pikketil ning saa mahud keskmiste otsapindade meetodil.
keywords: massiskeem, tasakaalupunkt, kahanemine, paisumine, veodistants, laen, ülejääk, lõikude lehed, ristlõigete lehed, põikprofiilide lehed, lõiked, ristlõiked, proovijooned, lõikevaade, kaevamine, täide, pindalad, keskmise otsapinna meetod, pinnase mahud, pikett, nihe, CSV
from: 5060173c
---

Ristlõige näitab teed sellisena, nagu see ehitatakse: trassiga risti ühel pikketil olemasolev maapind, projekt (koridor või plats profileeritud) ning kaevamine ja täide nende vahel.

## Lisa proovijooned

1. Vali trass. Jaotises **Proovijooned** (**Omadustes**) klõpsa {{ui:Add sample lines}}.
2. Määra **Iga** (vahe; algul 50 ft või 20 m), **Vasak laius** ja **Parem laius** (kui kaugele iga lõige keskjoonest ulatub).
3. Et lõigata lõige kindlal pikketil, sisesta see väljale **Lisa pikett** (näiteks `2+35`) ja vajuta {{key:Enter}}.

Lõiked lõigatakse iga terve kordse järel, trassi mõlemas otsas, iga kõvera alguses ja lõpus (PC ja PT) ning lisatud piketil. Proovijooned kuvatakse plaanil hallide joontena trassi üle; need lähevad ka DXF-, DWG- ja PDF-faili kihile C-ROAD-SCTN. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Lõikevaade

Ava see {{ui:Section view}} trassi **Omadustest**, {{ui:Sections}} jaotisest **Pind** › {{ui:More}} või klahviga {{key:X}}. See asendab plaani all oleva pikiprofiili vaate.

- Liigu lõigete vahel nooltega tema ribal, pikettide loendiga või klahvidega {{key:Left}} ja {{key:Right}}, kui lõikevaade on fookuses ({{key:Home}} ja {{key:End}} esimese ja viimase jaoks).
- Hall joon on olemasolev maapind, punane joon projekt. Kaevamine on oranžilt, täide roheliselt varjutatud. Koridori punktid on märgitud: CL (keskjoon), EOP (kattekihi serv), SH (õlaala) ja DL (nõlvajoon).
- Päis näitab pikketti, selle lõike kaevamis- ja täidepindalu ning vertikaalset liialdust. **Sobita** täidab paneeli; vali 1×, et näha lõiku tõelises mõõtkavas.
- Plaanil olev paks joon näitab, milline lõige on ekraanil.

## Lõikelehed

{{ui:Section sheets (PDF)}} jaotises **Proovijooned** paneb iga lõike PDF-lehtedele, ridades vasakult paremale ja ülevalt alla pikettide järjekorras. Vali **Paber**, **Plaani mõõtkava** (lõigete horisontaalne mõõtkava) ja **Profiili liialdus** (1×, 2×, 5× või 10×); dialoog ütleb, mitu lõiget mahub lehele ja mitu lehte sellest tuleb.

Iga lõige näitab ruudustikku nihete ja kõrgustega, maapinda (katkendjoon), projekti, kaevamist ja täidet (oranž ja roheline varjutus), koridori punkte ning all oma pikketti ja kaevamis- ja täitepindalu. Kõik lehtede lõiked on joonistatud samas suuruses, piisavalt kõrged suurimale; kui see ei mahu lehele sinu liialduse juures, kasutab CivilCraft suurimat, mis mahub, ja ütleb seda. Tiitelriba nimetab trassi, lehel olevad pikketid, mõõtkavad ja „Leht 1 / 3“.

## Mahud keskmiste otsapindade meetodil

Kahe naaberlõike vahel on maht nende kahe pindala keskmine korda nende pikettide vahe. Riba näitab trassi koguväärtusi ja {{ui:CSV}} laadib alla iga lõike pindalad ja mahud jooksvate summadega (kuupjardid jala-projektides, kuupmeetrid meetri-projektides).

**Omadused** näitavad samu summasid kõrvuti ruudustikumeetodi mahtudega jaotisest [Pinnasetööde mahud](topic:volumes). Need on kaks erinevat lähendust: lähedamad lõiked toovad need lähemale ning sirgel teel tasasel maal on need samad.

:::note
Kaevamine ja täide arvestatakse ainult profileeritud aladel (koridori või platsi nõlvajoonte sees), nagu ruudustikumeetodgi. Ilma koridori või platsita on projekt maapind, nii et lõige ei näita kaevamist ega täidet.
:::

## Massiskeem

**Massiskeem** jaotises **Proovijooned** joonistab massiskeemi samadest keskmiste otsapindade mahtudest: pikettide järgi jooksev summa kaevamine miinus täide.

- **Kahanemine (−) või paisumine (+) kaevamisel** ütleb, mida üks kuupjard kaevamist annab pärast täitena paigaldamist: −10 % (algväärtus, kohatäide) tähendab, et see kahaneb 0.9-ni; paisuv kivi võib olla +5 %. Kasuta oma geotehnilise aruande arvu.
- Kus joon tõuseb, on tee kaevamises; kus langeb, täites. Nullist kõrgemal (oranž varjutus) liigub muld pikketi suunas üles; nullist madalamal (roheline) allapoole.
- **Tasakaalupunktid** on kohad, kus joon ületab nulli: kahe nende vahel kaevamine ja täide tasakaalustuvad. Tabel loetleb iga tasakaalustatud lõigu, liigutatud mahu (selle kõrgeima või madalaima punkti) ja keskmise veodistants (varjutatud pindala jagatud selle mahuga).
- Kus joon lõpeb nullist eemal, on see, mis järele jääb, **ülejääk** (üleval) või **laen** (all). Selles viimases lõigus loetakse liigutatuks ainult muld sellest tasemest kaugemal, millel joon lõpeb.

**CSV** salvestab massiordinaadi igal lõikel, lõigud ja teguri.
