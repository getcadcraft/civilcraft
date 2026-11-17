---
title: Impordi mõõdistuspunktid
summary: Ava CSV- või tekstipunktifail, kontrolli veergude järjekorda dialoogis Impordi punktid, paranda read, mida ei saa lugeda, ja jaota punktid gruppidesse.
keywords: impordi punktid, csv, txt, pnezd, penzd, punktifail, mõõdistus, cogo punktid, punktigrupid, veerud, põhjakoordinaat, idakoordinaat
from: ad33d88a
---

Punktifail on tekstifail, kus on üks punkt rea kohta: punkti number, põhjakoordinaat, idakoordinaat, kõrgus ja kirjeldus mingis järjekorras, eraldatud komade, tabulaatorite, semikoolonite või tühikutega. CivilCraft loeb selle brauseris ja koostab sellest kohe pinna.

## Enne alustamist

- Tea faili veergude järjekorda, kui saad (PNEZD ja PENZD näevad arvuti jaoks ühesugused välja).
- Tea selle ühikuid. CivilCraft ei teisenda: määra vasakul paneelis **Ühikud** vastama failile (vaata [Ühikud, jaamad ja numbriformaadid](topic:units-and-stations)).
- Koordinaadid võivad olla suured (riigi tasandusvõrgu põhja- ja idakoordinaadid miljonites on korras).

## Impordi fail

1. Klõpsa tööriistaribal {{ui:Ava}} või vajuta {{key:Mod+O}} ja vali fail. Võid selle lohistada ka plaanile.
   Avaneb dialoog **Impordi punktid** koos failinimega, loendiga **Veerud** seatuna väärtusele {{ui:Tuvasta}}, kokkuvõtliku reaga ja esimeste kuue punktiga.
2. Loe kokkuvõtlikku rida. See ütleb, mitu punkti loeti, mis veergude järjekorras, kuidas see järjekord leiti ja mis veerge eraldab. Järjekord leitakse kolmel viisil:
   - „päisereaga“: esimene rida nimetab oma veerud (Punkt, Põhjakoordinaat, Idakoordinaat, Kõrgus, Kirjeldus või X, Y, Z …). See on kõige turvalisem.
   - „nagu valitud“: valisid järjekorra loendist **Veerud**.
   - „arvatud veergude arvust ja sinu punktirea seadistusest (PNEZD) — kontrolli, et põhja- ja idakoordinaat pole vahetatud“: kasutatavat päist ei olnud. Kui su failid on tavaliselt esmalt idakoordinaadiga, määra [CivilCraft'i sätetes](topic:settings) **Punktiread** väärtuseks P, E, N, Z, D.
3. Kontrolli eelvaate tabelit. Selle veerud on alati **Punkt**, **Põhjakoordinaat**, **Idakoordinaat**, **Kõrgus** ja **Kirjeldus**, olenemata sellest, mis järjekorda fail kasutab. Tegeliku asukoha põhja- ja idakoordinaadid on tavaliselt selgelt eri suurusega: kui need tunduvad vahetatud, oli arvamine vale.
4. Kui järjekord on vale, vali õige loendist **Veerud** (näiteks {{ui:PENZD — punkt, idakoordinaat, põhjakoordinaat, kõrgus, kirjeldus}}). Kokkuvõte ja eelvaade uuenevad kohe.
5. Vaata eelvaate all **Ridu ei loetud**. Iga rida nimetab faili reanumbri, põhjuse ja rea alguse. Vaata [Read, mida ei loeta](topic:import-points#rows-that-are-not-read).
6. Klõpsa {{ui:Impordi}}.
   Punktid ilmuvad plaanile, vaade suumib nende peale ja pind ehitatakse. Olekuriba ütleb näiteks „Imporditud 276 punkti failist site.csv; pind: 546 kolmnurka.“

Kui projektil veel nime ei olnud, võtab see faili nime.

## Kontrolli gruppe

Iga punkt kuulub grupile, mille nimi tuleb **kirjelduse esimesest sõnast**, suurtähtedega: "GRD", "FL 12" ja "fl" on grupid GRD, FL ja FL. Punktid ilma kirjelduseta lähevad rühma „(kirjeldus puudub)“.

1. Vaata vasakul paneelil tabelit **Punktid**: grupp, punktide arv ja valik **Pind**.
2. Iga grupp algab valikuga {{ui:Punktid}}. Muuda voolujooned, sillutise servad, nõlvade ülemised ja alumised servad, harjad ning muud sarnased koodiga jooned valikuks {{ui:Murdejoon}}. Grupid, mis ei peaks maapinda kujundama (kontrollpunktid, puuladvad, tippu mõõdetud elektriposti), määra valikuks {{ui:Jäetakse välja}}.
3. Klõpsa plaanil punkti (valikuga {{ui:Vali}}), et näha selle numbrit, koordinaate, kõrgust, kirjeldust ja gruppi parempoolsel paneelil.

:::warning
Murdejoone grupp ühendab **kõik** oma punktid **üheks** joonteks punktinumbrite järjekorras. See toimib siis, kui iga märgistatud joon on mõõdetud järjekorras oma koodiga. Kaks eraldi voolujoont, mõlemad koodiga "FL", muutuvad üheks joonteks, mis siksakitab nende vahel. Kui su koodid on jagatud, kasuta hoopis tööriista {{ui:Murdejoon}}, et klõpsata iga joone punktid (vaata [Pinna koostamine ja täpsustamine](topic:build-surface)).
:::

## Read, mida ei loeta

| Näidatud põhjus | Mida see tähendab | Mida teha |
|---|---|---|
| „põhjakoordinaat või idakoordinaat ei ole number“ | Koordinaadiveerus on tekst | Kontrolli veergude järjekorda või faili keskel olevat tekstirida |
| „kõrgus ei ole number“ | Kõrguseveerus on tekst | Vale veergude järjekord või kirjeldus kõrguseveerus |
| „punktinumbrit ei ole“ | Punktiveerg on tühi | Nummerda punkt või vali järjekord ilma P-ta (NEZD, NEZ …): siis nummerdatakse punktid 1, 2, 3 … |
| „punkt 12 esineb kaks korda (esimene jäetakse alles)“ | Kaks rida jagavad numbrit | Nummerda üks neist ümber, kui mõlemad on päris mõõtmised |
| „3 veergu, oodatud 5 (PNEZD)“ | Rida on lühike | Katkine rida või vale veergude järjekord |

Punkt tühja kõrgusega jääb alles, aga pinna koostamisel ei kasutata. Faktid **Punktid** all näitavad, mitmel punktil on kõrgus.

Read, mis algavad märgiga `#`, `;` või `//`, on kommentaarid ja neid vahele jäetakse. Tühjad read jäetakse vahele.

## Punktide asendamine või lisamine

Uuesti importimine **asendab** kõik punktid; see ei lisa neile midagi. Sinu joondused, platsid, torustikud, joonistatud murdejooned ja piir jäävad alles. Tagasivõtmise ajalugu kustutatakse, nii et salvesta projekt enne, kui vanad punktid võivad vaja minna. Kahe faili ühendamiseks ühenda need tekstiredaktoris või tabelarvutuses enne importi (jälgi korduvaid punktinumbreid).

Punkte ei saa veel CivilCraft'i sees liigutada, muuta ega kustutada. Paranda need failis ja impordi uuesti.

## Seotud

- [Punktifailide formaadid](topic:point-file-formats): iga veergude järjekord ja kuidas päised tuvastatakse.
- [Pinna koostamine ja täpsustamine](topic:build-surface).
