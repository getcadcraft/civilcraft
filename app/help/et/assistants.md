---
title: Lase AI-assistendil töötada sinu alaga
summary: Lülita assistendid Sätetes sisse, et sinu arvutis olev assistent saaks lugeda avatud ala (punkte, pindu, mahte, profiile, krundeid), lisada mõõdistuspunkte, salvestada ja eksportida LandXML-i või DWG-d CadCraft Studio kaudu. Kuni sa seda ei lülita sisse, on see väljas.
keywords: ai, assistent, mcp, skript, automatiseerimine, studio, punktid, kõrgus, pikett, nihe, trass, maht, väljakaevamine, pealekanne, profiil, krunt, landxml, dwg, usd, kaustad, load, ühenduse katkestamine, tegevus
from: d0356582
---

## Mida õpid

Kuidas lasta AI-assistendil (mis tahes assistendil, mis räägib MCP-d) töötada sinu avatud alaga, mida ta teha saab ja mida mitte ning kuidas teda peatada.

## Mida assistent CivilCraftis teha saab

| Mida ta küsib | Mida ta saab | Vajab |
|---|---|---|
| Ala | Nimi, ühikud, koordinaatsüsteem, punktirühmad, trassid, pinnad, platsid, krundid ja torud | Lugemine |
| Mõõdistuspunktid | Number, idakoordinaat, põhjakoordinaat, kõrgus ja kirjeldus, rühma järgi, kirjelduse järgi või kasti sees | Lugemine |
| Pinna kõrgused | Olemasolev maapind (või planeeritud pind) igas punktis, mille ta nimetab | Lugemine |
| Pikketid ja nihked | Punktide pikett ja nihe trassi suhtes või pikettide koordinaadid ja maapinna kõrgus | Lugemine |
| Profiil | Maapinna, projekteeritud profiili ja planeeritud pinna kõrgused mööda trassi, iga mitme jala või meetri järel | Lugemine |
| Väljakaevamine ja pealekanne | Mahud olemasoleva maapinna ja planeeritud pinna vahel (ka iga plats ja koridor) või maapinna ja tasapinna vahel | Lugemine |
| Krundid | Nurgad, pindala (aakrites või hektarites), ümbermõõt ja õiguslik kirjeldus | Lugemine |
| Valik | Punktid, mille ta nimetab, valitakse plaanil, nagu oleksid need sina valinud | Muutmine |
| Uued mõõdistuspunktid | Lisatud punktid numbritega, mille ta annab, või järgmiste vabade numbritega. Iga päring on üks tagasivõetav samm | Muutmine |
| Salvestamine | CivilCraftis oma {{ui:Salvesta}} | Salvestamine |
| LandXML või DWG | Samad failid, mis nuppudega {{ui:LandXML}} ja {{ui:DWG}} | Eksport |
| Ala 3D-s | OpenUSD (.usdz, .usda või .usdc) maapinnast, planeeritud pinnast, platsidest ja torudest, nii nagu 3D-vaade seda eksportib | Eksport |
| Taimed ja taimeloend | Taimed, mis leitakse taimenimekirjast mis tahes nime järgi, ja taimeloendi arvud | Lugemine |
| Istutamine ja planeerimine | Lisatud taimed, peenar või hekk, või platvorm, pervel, kraav või planeerimisala; iga üks on tagasivõetav samm, koos väljakaevamise ja pealekandega | Muutmine |
| Niisutuse kontroll | Iga tsooni vool, rõhk, mida on vaja tema ventiilis ja toites, halvima juhu survekõrgus, töötamisajad, probleemid ja materjaliloend, arvutusabivahendina, mille niisutusprojekteerija kontrollib | Lugemine |

See töötab avatud alaga. Studios saab ta salvestada ja eksportida ka sinu valitud kaustadesse (allpool); kui kausta pole, laaditakse failid alla nii nagu nuppude puhul.

## Lülita sisse

Assistendid pääsevad CivilCraftini läbi CadCraft Studio sinu arvutis; tavaline brauser sellele ligi ei pääse.

1. Ava {{ui:Sätted}} ja vali vahekaart **CivilCraft**.
2. Rubriigis **Assistendid** märgi **Luba AI-assistentidel ja skriptidel kasutada CivilCraftit**.
3. **Lugemine** on sinu jaoks märgitud. Märgi **Muutmine**, **Salvestamine** või **Eksport** ainult siis, kui assistent neid vajab.
4. Et lasta sel salvestada ja eksportida kausta, vali rubriigis **Kaustad, mida ta võib kasutada** nupp {{ui:Lisa kaust…}} ja vali kaust Studio dialoogis. {{ui:Eemalda}} võtab selle kohe tagasi; mis tahes muu tee lükatakse tagasi.
5. Ühenda assistent Studios (Studio näitab aadressi ja seadeid, mis tuleb sinna kleepida).

## Kui assistent on ühendatud

Parema paneeli ülaosas olev märkus ütleb, milline assistent on ühendatud ja mida ta teha saab. Klõpsa {{ui:Katkesta ühendus}}, et lõpetada tema seanss kohe; jätkamiseks peab ta uuesti ühenduma.

**Tegevus** Sätete rubriigis **Assistendid** all loetleb iga kõne, mille assistent tegi, uuemad ees, koos sellega, kas see õnnestus.

:::tip
Küsi lihtsates sõnades, näiteks „mis on maapinna kõrgus iga 50 jala järel mööda Main Streeti?“, „kui palju väljakaevamist ja pealekannet platsid vajavad?“ või „lisa juhtpunkt neile koordinaatidele“. Assistent loeb ala ja vastab või teeb muudatuse ühe tagasivõetava sammuna.
:::

## Ilma CivilCrafti avamata

CadCraft failiserver assistentidele (`npx @getcadcraft/mcp`) ja `cadcraft` käsurida avavad salvestatud CivilCrafti projekte (`.civilcraft.json`) ja punktifaile CivilCrafti enda koodiga, ilma aknata: samad lugemistööriistad, punktide lisamine, projekti salvestamine, LandXML ning ala 3D-s OpenUSD-na. `cadcraft convert site.civilcraft.json site.xml` kirjutab LandXML-i käsurealt. LandXML-i avamine, DWG eksport ja Maastiku töökeskkonna tööriistad vajavad ikka CivilCrafti akent.

## Lülita välja

Eemalda märge **Luba AI-assistentidel ja skriptidel kasutada CivilCraftit**. Iga assistent katkestatakse kohe ning seade jääb järgmiseks korraks alles.

## Vaata ka

- [Retseptid AI-assistentidele](common:assistants-recipes): töötatud näited, igaühel tööriistad, mida see kutsub.
- [Horisontaaltrassi koostamine](topic:alignment)
- [Pinna koostamine ja täpsustamine](topic:build-surface)
- [Mõõdistuspunktide valimine, kopeerimine ja kleepimine](topic:copy-paste-points)
- [CivilCrafti sätted](topic:settings)
