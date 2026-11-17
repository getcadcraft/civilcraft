---
title: Sõiduki sõidutrajektoorid
summary: Sõida sõidukiga kuni kolme haagisega mööda joont või trassi, edasi või tagurpidi, ning vaata, millist ala see läbib, selle rattarada, roolimist ja kohta, kus see lõigub kokku.
keywords: sõidutrajektoor, pöörde trajektoor, sõiduki jälgimine, pöörde šabloon, projekteerimissõiduk, veoauto, buss, haagis, poolhaagis, tagurpidi sõit, tagurdamine, kokkulõikumine, liigendus, roolilukk, tagumise ratta nihe, rattarada, laadimisrampi, pöörderaadius
from: 8caafb8a
---

Sõidutrajektoor sõidutab sõidukit mööda joont ja näitab maapinda, mida selle keha läbib. Kasuta seda, et kontrollida, kas veoauto saab nurga, jõuab laadimisrampi või saab haagise tagurdada kohale, ilma et sõiduk katendilt välja läheks.

## Sõida sõidukiga mööda joont

1. Joonista joon, mida sõiduk järgib, sõidusuunas: tunnusjoon (kaared on lubatud: joonistamise ajal vajuta {{key:C}}, vt [Tunnusjooned](topic:feature-lines)) või trass.
2. Vali see ja klõpsa selle **Omadustes** nupul {{ui:Sõidutrajektoor…}}.
3. Jaotises **Alusta sõidukist** vali sõiduk ning määra selle mõõdud oma projekteerimissõidukilt: laius, esiülejääk, teljevahe, tagumine ülejääk, rööpmelaius ja **Roolilukk**. Lisa kuni kolm haagist; igaühe kohta märgi, kus see on haakes, pikkus haagise haakekohast teljeni, ülejäägid ja **Suurim liigendus**.
4. Vali **Sõit**: edasi või tagurpidi. Klõpsa {{ui:Sõida see läbi}}.

:::warning
Sõidukid, millest alustada, on kohatäiteks, mitte standard. Määra mõõdud sõidukilt, mida sinu projekt kasutab.
:::

## Edasi ja tagurpidi

| Sõit | Mida joon järgib | Mida CivilCraft arvutab |
|---|---|---|
| **Edasi** | Esiteljede keskpunkt | Kuhu lähevad tagumine telg ja iga haagis, roolinurk ja liigendus |
| **Tagurpidi** | Viimase telje keskpunkt (haagise tagakülg) | Kuhu läheb iga ees olev üksus ja roolimine, mida veokabiin vajab haagise sinna viimiseks |

Tagurdamist kontrollitakse nii: ütle, kuhu haager peaks minema, ja CivilCraft ütleb, kas veokabiin selle teha saab.

## Loe tulemust

Sõidutrajektoor joonistatakse plaanile oranžina: selle kontuur ja katkendjoonena äärmiste rataste rajad. Vali see (klõpsa selle sees), et näha **Omadustes**:

- **Läbitud pikkus**, suurim **Roolimise** nurk ja **Liigendus** nende piirangute suhtes ning **Läbisõidetud ala**.
- Joone mis tahes probleem koos kaugusega: roolimine üle lukustuse või haager pöördub üle liigenduse piiri (see lõigub kokku).
- **Sõiduk joonel**: liiguta liugurit, et näha sõidukit mis tahes punktis koos roolimise ja liigendusega seal.

Muuda joont ja sõidutrajektoor järgib. {{ui:Muuda sõidukit…}} muudab mõõtmeid; **Sõit** lülitab edasi ja tagurpidi vahel. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi. {{key:Delete}} kustutab valitud sõidutrajektoori (joon jääb alles).

Kontuur ja rattarajad lähevad PDF-i, DXF-i ja DWG-sse kihile C-ROAD-SWPT.

## Kuidas see arvutatakse

Iga üksus pöörleb ümber oma tagumise telje joone ja seda lohistab ees olev punkt (esiteljed või haakekoht), madala kiiruse ja libisemiseta mudel, mida sõidutrajektooride kontrollid kasutavad. Läbisõidetud ala on kõigi asendite kerekontuuride kokkupanek. Seda ei mudelda kiirust, rehvi libisemist, roolimise pööramise aega, juhitavaid haagiseid ega keha alla jäävat vaba ruumi.
