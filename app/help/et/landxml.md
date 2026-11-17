---
title: LandXML-i vahetamine
summary: Ava teiste tsiviiltarkvarade LandXML uue projektina, ekspordi punktid, pinnad, trassid, profiilid ja torustik LandXML 1.2 formaadis ning tea, mis ei sisaldu.
keywords: landxml, xml, import, eksport, vahetamine, tin, pind, trass, profiil, torustik, koostalitlusvõime, andmevahetus
from: 870d5ece
---

LandXML on avatud vahetusvorming, mida enamik tsiviiltarkvarasid loeb ja kirjutab. CivilCraft loeb ja kirjutab LandXML 1.2. Kui oled kasutanud Civil 3D-d, on selle LandXML-i impordi- ja eksportdialoogid kõige lähedasem vaste; siin ei ole valida midagi, ja märkmed ütlevad, mis jäeti välja.

## Ava LandXML-fail

1. Klõpsa {{ui:Ava}} (või vajuta {{key:Mod+O}}) ja vali `.xml`- või `.landxml`-fail või lohista see plaanile.
2. Kui praegusel projektil on salvestamata muudatusi, küsib CivilCraft enne. Vali {{ui:Salvesta koopia}}, {{ui:Ära salvesta}} või {{ui:Loobu}}.
3. Tehakse **uus projekt**. Olekuriba ütleb, mis loeti, näiteks „Avatud site.xml: 412 punkti, 2 pinda, 3 trassi.“
4. Vaata kasti pinna andmete all. See loetleb kõik, mis jäeti välja või muudeti, näiteks:
   - „Avati ainult esimene pind („EG“); failis on veel 1.“
   - „Trassil „Ramp A“ on elemente, mida CivilCraft veel ei oska joonistada (need pole jooned, kaared ega klotoidsed spiraalid); see jäeti vahele.“
   - „Torustiku reegleid ei olnud failis; kasutusel on kohatäitjad — määra oma jaotises Projekt.“

Mis saab millest:

| Failis | CivilCraftis |
|---|---|
| Ühikud (Imperial või Metric) | Projekti **Ühikud** (jalad või meetrid) |
| Projekti nimi | Projekti **Nimi** |
| CgPoints | Projekti punktid; kirjeldus (või kood) annab rühma |
| Esimene TIN-pind | Olemasolev maapind, kasutatud sellisena („Pind (LandXML-ist)“) |
| Iga trass joontest, kaartest ja klotoidsetest spiraalidest | Trass koos PI-de, raadiuste ja spiraalide pikkustega, mis on kõveratest taastatud |
| Iga trassi esimene projekteeritud profiil | Selle projekteeritud profiil paraboolsete vertikaalkõveratega |
| Esimene torustik | Torustik oma äärte, sumpide ja sisepõhjadega |
| Tunnusjooned joontest ja kaartest | Tunnusjooned, kaared säilivad; teisest programmist tulles algavad need **Ainult joonistatud** |

Täielik loetelu elementidest ja atribuutidest on jaotises [LandXML: mida loetakse ja kirjutatakse](topic:landxml-reference).

:::note
LandXML-ist loetud pinda ei koostata uuesti, kui muudad punktigruppe või joonistad murdejooni. Klõpsa jaotises **Pind** nupule {{ui:Koosta pind uuesti punktidest}}, et see koostataks punktidest ({{key:Mod+Z}} toob LandXML-i pinna tagasi).
:::

## Ekspordi LandXML

1. Klõpsa rühmas **Eksport** nupule {{ui:LandXML}}.
2. Brauser laeb alla `<name>.xml`. Olekuriba ütleb, mis sisse läks, näiteks „Eksporditud LandXML 1.2: 276 punkti, 2 pinda, 1 trass, torustik. Platvormid ei kuulu siin LandXML-i; kuulub vertikaalplaneeritud pind.“

Fail sisaldab:

- **Ühikud**: USA mõõdistusjalad või meetrid.
- **CgPoints**: iga punkt, mille number on nimena, kirjeldus ja rühm koodina.
- **Pinnad**: olemasolev maapind TIN-ina koos oma murdejoonte ja välispiiriga lähteandmetena; ja kui platvormid või koridorid vertikaalplaneeritakse, teine TIN-pind nimega „Proposed“.
- **Trassid**: jooned, kaared ja klotoidsed spiraalid oma jaamadega, igaühel profiil, mis hoiab trassi ääres proovitud olemasolevat maapinda ja projekteeritud profiili (PVI-d ja paraboolsed kõverad), kui neid on vähemalt kaks.
- **PipeNetworks**: rajatised oma äärte, sumpide ja toru sisepõhjadega ning torud läbimõõdu, pikkuse ja kaldega.
- **PlanFeatures**: iga tunnusjoon joontena ja kaartena, iga otsa kõrgusega ning sellega, milleks see on kasutusel.

## Mis ei sisaldu

- Platvormid ja koridorid objektidena. Nende tulemus on pinnas „Proposed“.
- Vigadega trassid (näiteks kattuvad kõverad): jäetakse välja ja loetakse olekusõnumis.
- Torud ilma mõlema sisepõhjata ja võrgud, millel on vähem kui kaks rajatist.
- Pinnalt võetud äär kirjutatakse fikseeritud äärena. Kui fail avatakse uuesti, säilitab rajatis selle numbri isegi siis, kui pind muutub.
- Võrgureeglid (vähim kalle, katvus, langus): LandXML-il ei ole nende jaoks kohta.
- Kuvaseaded ja punktirühmade pinnavalikud: nende jaoks salvesta CivilCrafti projekt.

Avamisel CivilCraft ei loe klotoidist erinevaid spiraale, ruudustikupindu, punkte, mis viitavad ainult teistele punktidele, kinnistuid, tunnusjoonte spiraale, teid ega mõõdistusandmeid. Iga neist nimetatakse märkmes, mitte ei oletata.

## Edasi-tagasi vahetus

Et anda töö üle kellelegi, kes kasutab teist tsiviiltarkvara, ja saada see tagasi, ekspordi LandXML, lase neil muuta ja ava nende LandXML uue projektina. Hoia ka enda `.civilcraft.json`: see on ainus fail, mis hoiab kõike, mida CivilCraft teab.
