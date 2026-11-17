---
title: Ruhusu msaidizi wa AI afanye kazi na eneo lako
summary: "Washa wasaidizi katika Mipangilio ili msaidizi kwenye kompyuta yako asome eneo lililo wazi (nukta, nyuso, ujazo, wasifu, viwanja), aongeze nukta za upimaji, ahifadhi na asafirishe LandXML au DWG, kupitia CadCraft Studio. Umezimwa hadi uuwashe."
keywords: ai, msaidizi, mcp, script, otomatiki, studio, nukta, mwinuko, kituo, mkengeuko, mpangilio, ujazo, kuchimba, kujaza, wasifu, kiwanja, landxml, dwg, usd, folda, ruhusa, kukatisha, shughuli
from: d0356582
---

## Utajifunza nini

Jinsi ya kumruhusu msaidizi wa AI (msaidizi yeyote anayezungumza MCP) afanye kazi na eneo ulilolifungua, kile anachoweza na asichoweza kufanya, na jinsi ya kumzuia.

## Msaidizi anachoweza kufanya katika CivilCraft

| Anaomba | Anachopata | Anahitaji |
|---|---|---|
| Eneo | Jina, vipimo, mfumo wa kuratibu, makundi ya nukta, mipangilio ya njia, nyuso, majukwaa, viwanja na mabomba | Soma |
| Nukta za upimaji | Namba, mashariki, kaskazini, mwinuko na maelezo, kwa kundi, kwa maelezo au ndani ya kisanduku | Soma |
| Miinuko ya uso | Ardhi iliyopo (au uso uliosawazishwa) kwenye pointi zozote anazozitaja | Soma |
| Vituo na mikengeuko | Kituo na mkengeuko wa nukta kando ya mpangilio, au kuratibu na mwinuko wa ardhi wa vituo | Soma |
| Wasifu | Miinuko ya ardhi, wasifu wa usanifu na uso uliosawazishwa kando ya mpangilio, kila idadi ya futi au mita | Soma |
| Kuchimba na kujaza | Ujazo kati ya ardhi iliyopo na uso uliosawazishwa (kila jukwaa na ukanda pia), au kati ya ardhi na kiwango | Soma |
| Viwanja | Pembe, eneo (kwa ekari au hekta), mzingo na maelezo ya kisheria | Soma |
| Uteuzi | Nukta anazozitaja zinachaguliwa kwenye mpango, kama ulivyozichagua mwenyewe | Hariri |
| Nukta mpya za upimaji | Nukta zinazoongezwa kwa namba anazotoa, au namba zilizo wazi zinazofuata. Kila ombi ni hatua moja unayoweza kutendua | Hariri |
| Hifadhi | {{ui:Hifadhi}} ya CivilCraft yenyewe | Hifadhi |
| LandXML au DWG | Faili zilezile kama vitufe vya {{ui:LandXML}} na {{ui:DWG}} | Hamisha nje |
| Eneo kwa 3D | OpenUSD (.usdz, .usda au .usdc) ya ardhi, uso uliosawazishwa, majukwaa na mabomba, kama mwonekano wa 3D unavyohamisha | Hamisha nje |
| Mimea na ratiba ya mimea | Mimea iliyopatikana kwenye orodha ya mimea kwa jina lolote, na hesabu za ratiba ya mimea | Soma |
| Upandaji na usawazishaji | Mimea, kitanda au ua vilivyowekwa, au jukwaa, tuta, mfereji wa mteremko au eneo la usawazishaji lililoongezwa; kila moja ni hatua moja unayoweza kutendua, pamoja na kuchimba na kujaza kwake | Hariri |
| Ukaguzi wa umwagiliaji | Mtiririko wa kila eneo, shinikizo linalohitajika kwenye vali yake na kwenye usambazaji, kichwa cha hali mbaya zaidi, muda wa kuendesha, matatizo na orodha ya vifaa; ni msaada wa hesabu ambao mbunifu wa umwagiliaji hukagua | Soma |

Inafanya kazi na eneo lililo wazi. Katika Studio pia inaweza kuhifadhi na kusafirisha kwenye folda unazochagua (hapa chini); bila folda, faili zake hupakuliwa kwa njia ile ile ya vitufe.

## Iwashe

Wasaidizi hufikia CivilCraft kupitia CadCraft Studio kwenye kompyuta yako; kivinjari cha kawaida hakina njia ya kuingia.

1. Fungua {{ui:Mipangilio}} kisha uchague kichupo cha **CivilCraft**.
2. Chini ya **Wasaidizi**, weka alama kwenye **Ruhusu wasaidizi wa AI na hati kutumia CivilCraft**.
3. **Soma** imewekwa alama kwa ajili yako. Weka alama kwenye **Hariri**, **Hifadhi** au **Hamisha nje** pale tu msaidizi anapozihitaji.
4. Ili aweze kuhifadhi na kusafirisha kwenye folda, chagua {{ui:Ongeza folda…}} chini ya **Folda inazoruhusiwa kutumia** kisha uchague folda kwenye kisanduku cha Studio. {{ui:Ondoa}} huiondoa mara moja; njia nyingine yoyote inakataliwa.
5. Unganisha msaidizi katika Studio (Studio inaonyesha anwani na mipangilio ya kubandika ndani yake).

## Msaidizi akiwa ameunganishwa

Kidokezo juu ya paneli ya kulia kinasema ni msaidizi gani ameunganishwa na anachoweza kufanya. Bofya {{ui:Kata muunganisho}} ili kumaliza kipindi chake mara moja; ni lazima aunganishe tena ili aendelee.

**Shughuli**, chini ya **Wasaidizi** katika Mipangilio, inaorodhesha kila ombi alilotoa msaidizi, la karibuni kwanza, pamoja na kama lilifanikiwa.

:::tip
Uliza kwa maneno ya kawaida, kwa mfano "mwinuko wa ardhi kila futi 50 kando ya Main Street ni upi?", "majukwaa yanahitaji kuchimba na kujaza kiasi gani?" au "ongeza nukta ya udhibiti kwenye kuratibu hizi". Msaidizi husoma eneo na kujibu, au hufanya mabadiliko kama hatua moja unayoweza kutendua.
:::

## Bila kufungua CivilCraft

Seva ya faili ya CadCraft kwa wasaidizi (`npx @getcadcraft/mcp`) na amri ya `cadcraft` hufungua miradi ya CivilCraft iliyohifadhiwa (`.civilcraft.json`) na faili za nukta kwa msimbo wa CivilCraft wenyewe, bila dirisha: zana zilezile za kusoma, kuongeza nukta, kuhifadhi mradi, LandXML na eneo kwa 3D kama OpenUSD. `cadcraft convert site.civilcraft.json site.xml` huandika LandXML kutoka mstari wa amri. Kufungua LandXML, kusafirisha DWG na zana za nafasi ya kazi ya Landscape bado zinahitaji dirisha la CivilCraft.

## Izime

Ondoa alama kwenye **Ruhusu wasaidizi wa AI na hati kutumia CivilCraft**. Kila msaidizi anakatwa mara moja, na mpangilio huu unahifadhiwa kwa wakati ujao.

## Tazama pia

- [Mapishi kwa wasaidizi wa AI](common:assistants-recipes): mifano iliyofanyiwa kazi, kila moja na zana inazoita.
- [Panga mpangilio wa mlalo wa njia](topic:alignment)
- [Jenga na boresha uso](topic:build-surface)
- [Chagua, nakili na bandika nukta za upimaji](topic:copy-paste-points)
- [Mipangilio ya CivilCraft](topic:settings)
