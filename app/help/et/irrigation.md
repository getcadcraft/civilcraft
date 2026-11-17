---
title: Niisutuse projekteerimine
summary: Arvutusabi, mitte kinnitatud projekt: pihustid, harutorud, peatoru, ventiilid ja tilkjuhtmed objektil; tsoonid, mis leitakse torudest; survekadu Hazen–Williamsi järgi, halvima juhtumi pihusti, vool ja surve võrreldes veevarustusega, sademe kiirused, töötunnid, katvus ja materjalide loend.
keywords: niisutus, pihusti, pihustid, pritsmed, rootor, pöörlev düüs, mullijaja, tilk, tilkjuhe, emitter, ventiil, tsoon, jaam, kontroller, peatoru, harutoru, ühenduspunkt, veevarustus, surve, psi, kpa, vool, gpm, hõõrdekadu, hazen williams, sademe kiirus, töötund, katvus, pea-pea, materjalide loend
from: 7d6342c1
---

:::warning
See on arvutusabi, mitte kinnitatud projekt: niisutuse projekteerija kontrollib iga tulemust, enne kui midagi ehitatakse.
:::

## Süsteemi paigutamine

1. Vasakul paneelis jaotises **Niisutus** vali **Pihusti**, selle **Kaar** ja kaare algus ning harutorude ja peatoru torude suurused.
2. {{ui:Niisutus}} › {{ui:Ühenduspunkt}}: klõpsa kohta, kus veevarustus ühineb. Määra selle **surve**, **saadaolev vool** ning omadustes arvesti ja tagasivooluklapi kadu.
3. {{ui:Niisutus}} › {{ui:Ventiil}}: klõpsa kohta, kuhu iga tsooni ventiil läheb. Ventiil algatab tsooni.
4. {{ui:Niisutus}} › {{ui:Pihusti}}: klõpsa pihustite paigutamiseks; iga klõps paigutab ühe.
5. {{ui:Niisutus}} › {{ui:Harutoru}}: klõpsa ventiilist läbi selle pihustite ja vajuta {{key:Enter}}. {{ui:Peatoru}}: ühenduspunktist igale ventiilile.

Torude otsad kinnituvad pihustite, ventiilide, veevarustuse ja teiste torude otstega, nii et võrk ühineb. Tsoon on kõik, mis ulatub tema ventiilist harutorude kaudu; peatoru kannab korraga ainult ühte tsooni.

## Tilkumine

{{ui:Niisutus}} › {{ui:Tilkjuhe}}: klõpsa mööda joont, alustades kohast, kust see toidetakse (harutoru ots või ventiil). Määra omadustes **emitteri vool** ja **vahe**; selle vool on selle emitterite summa.

## Kontroll

{{ui:Niisutus}} › {{ui:Kontrolli süsteemi…}} loetleb iga tsooni:

| Veerg | Kuidas see arvutatakse |
|---|---|
| Vool | Pihustite (ja tilkjuhtmete) voolud kokku |
| Ventiilis | Halvima juhtumi pihusti töösurve pluss sinna viivad torukaod (Hazen–Williams, toru siseläbimõõt, kõrguse muutus) ja kadu läbi ventiili |
| Veevarustuses | Sama pluss selle tsooni kandva peatoru kadu ning arvesti ja tagasivooluklapi kadu |
| Sademed | Pihustite vool jagatud alaga, mida nad niisutavad pea-pea vahega |
| Minutit nädalas | Rakendamiseks seadistust **Vett nädalas** |
| Probleemid | Kiirus üle piiri, pihusti üle oma survevahemiku, pihustid ja rootorid ühel ventiilil, liiga vähe survet või voolu veevarustuses, pihustid ilma tsoonita, silmused |

Vali ventiil, et näha tema tsooni näitajaid ja tema halvima juhtumi pihustit, mis on plaanil ringiga märgitud. Materjalide loend loeb pihusteid liigi ja kaare järgi, torusid suuruse järgi, ventiile, tilkjuhet ja emittereid ning kontrolleri jaamu. **Salvesta CSV-na** salvestab mõlemad.

Niisutuse jaotise seaded: **Hazen–Williamsi C** (150 uuele plastikust torule), **kiireim vool** torus (1.5 m/s), **kadu läbi ventiili** ja **Vett nädalas**. Need on märgitud vaikeväärtused.

## Katvus

{{ui:Niisutus}} › {{ui:Näita katvust}} ütleb, kui suure osa alast pihustid kuivaks jätavad, kui suure osa kaks või enam pihustit kastavad ja millised pihustid ei ulatu naabrini (pea-pea vahe).

## Pihustid

Loetletud pihustid on CadCrafti kirjutatud **üldised** tüübid projekteerimise sademekiirustest (fikseeritud pihustid, pöörlevad düüsid, hammasrootorid, mullijajad, mikropihustid, emitterid), mitte ühegi tootja tooted. **Lisa pihustid failist…** loeb sinu enda pihusteid (JSON-loend, kus on iga pihusti ulatus, vool või sademekiirus ja survevahemik); need salvestatakse koos projektiga. Tootja avaldatud andmed lisatakse ainult selle tootja salvestatud loal.

Üldiste pihustite all on loendis **tüüpilised pihustid** (nende nimed lõpevad „tüüpilised väärtused“): fikseeritud pihustite, pöörlevate düüside ja hammasrootorite düüsisuurused, mikropihustid, mullijajad ja emitterid, koos raadiuse, voolu ja survevahemikuga. CadCraft arvutab need avaldatud matemaatika põhjal (vooluks avaava valem, raadiuseks pihu ulatuse skaleerimine) ja nimivoolu klassidest, ainult avatud allikatest; ühegi tootja tabelit ei ole kopeeritud. Vali üks ja valija näitab selle alust ning litsentsi. Projekt, mis kasutab ühte neist, hoiab pihusti ja selle allika projektifailis. Need on mõeldud planeerimiseks: kontrolli enne ehitamist tegeliku pihusti enda andmeid.
