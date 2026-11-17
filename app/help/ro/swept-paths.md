---
title: Traseele de giraj ale vehiculelor
summary: Conduceți un vehicul cu până la trei remorci de-a lungul unei linii de caracteristică sau al unui ax de traseu, înainte sau în marșarier, și vedeți suprafața măturată, traseele roților, virajul și unde se blochează în unghi.
keywords: traseu de giraj, traseu de viraj, urmărirea vehiculului, șablon de viraj, vehicul de proiectare, camion, autobuz, remorcă, semiremorcă, marșarier, cuplare înapoi, jackknife, articulație, blocaj de direcție, decalare la viraj, traseu al roții, rampă de încărcare, rază de viraj
from: 8caafb8a
---

Un traseu de giraj conduce un vehicul de-a lungul unei linii și arată terenul peste care trece caroseria sa. Folosiți-l ca să verificați că un camion poate face un colț, ajunge la o rampă de încărcare sau poate introduce o remorcă în marșarier fără să iasă de pe pavaj.

## Conducerea unui vehicul de-a lungul unei linii

1. Desenați linia pe care o urmează vehiculul, în sensul de mers: o linie de caracteristică (arcele sunt în regulă: apăsați {{key:C}} în timp ce o desenați, vezi [Liniile caracteristice](topic:feature-lines)) sau un ax de traseu.
2. Selectați-o și faceți clic pe {{ui:Traseu de giraj…}} în proprietățile ei.
3. Sub **Pornire de la**, alegeți un vehicul, apoi stabiliți dimensiunile din vehiculul de proiectare propriu: lățimea, consola din față, ampatamentul, consola din spate, ecartamentul și **Blocaj de direcție**. Adăugați până la trei remorci, fiecare cu locul în care este cuplată, lungimea de la cuplaj până la axul ei, consolele și **Articulația maximă**.
4. Alegeți **Deplasarea**: înainte sau în marșarier. Faceți clic pe {{ui:Condu}}.

:::warning
Vehiculele de pornire sunt valori provizorii, nu un standard. Stabiliți dimensiunile din vehiculul de proiectare folosit de proiect.
:::

## Înainte și în marșarier

| Deplasarea | Ce urmează linia | Ce calculează CivilCraft |
|---|---|---|
| **Înainte** | Centrul axului din față | Unde ajung axul din spate și fiecare remorcă, unghiul de direcție și articulația |
| **Marșarier** | Centrul ultimului ax (spatele remorcii) | Unde ajunge fiecare unitate din față și virajul pe care trebuie să îl facă cabina ca să pună remorca acolo |

Marșarierea este modul în care se verifică o manevră de cuplare înapoi: spuneți unde trebuie să ajungă remorca, iar CivilCraft spune dacă cabina poate face asta.

## Citirea rezultatului

Traseul de giraj este desenat pe plan în portocaliu: conturul său și, punctat, traseele roților cele mai exterioare. Selectați-l (faceți clic în interiorul lui) ca să vedeți în proprietăți:

- **Lungimea parcursă**, cel mai mare unghi de **Virare** și **Articulația** față de limitele lor, și **Aria măturată**.
- Orice problemă de-a lungul liniei, cu distanța ei: virajul peste blocaj sau o remorcă ce virează peste limita de articulație (se blochează în unghi).
- **Vehiculul de-a lungul liniei**: mutați cursorul ca să vedeți vehiculul în orice punct, cu virajul și articulația de acolo.

Modificați linia și traseul de giraj o urmează. {{ui:Editare vehicul…}} modifică dimensiunile; **Deplasarea** comută între înainte și marșarier. Fiecare modificare este un pas: {{key:Mod+Z}} o anulează. {{key:Delete}} șterge traseul de giraj selectat (linia rămâne).

Conturul și traseele roților merg în PDF, DXF și DWG, pe stratul C-ROAD-SWPT.

## Cum se calculează

Fiecare unitate se rotește în jurul liniei axului său spate și este trasă de punctul din față (axul din față sau cuplajul), modelul fără alunecare, la viteză mică, folosit la verificările traseelor de giraj. Aria măturată este reuniunea conturului caroseriei din fiecare poziție. Nu modelează viteza, alunecarea pneurilor, timpul în care direcția se rotește, remorcile directoare sau garda la sol sub caroserie.
