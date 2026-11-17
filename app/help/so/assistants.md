---
title: Ka dhig caawiye AI inuu kaalmeeyo goobtaada
summary: Hirgeli caawiyeyaasha Dejinta si caawiye ku yaal kombiyuutarkaaga u akhrin karo goobta furan (dhibcaha, dusha, mugyada, muuqaalada dherer, qeybaha dhulka), u ku dari karo dhibcaha sahanka, u kaydin karo oo u dhoofin karo LandXML ama DWG, iyada oo loo marayo CadCraft Studio. Waa la damiyaa ilaa aad shido.
keywords: ai, caawiye, mcp, script, automation, studio, dhibcaha, kor u kac, station, offset, jid-hagaha, mug, goyn, buuxin, muuqaal dherer, qeybta dhulka, landxml, dwg, usd, galleyda, ogolaansho, ka jaree, dhaqdhaqaaq
from: d0356582
---

## Waxa aad baran doontaa

Sida loo oggolaado caawiye AI (caawiye kasta oo ku hadla MCP) inuu ka shaqeeyo goobta aad furtay, waxa uu samayn karo iyo waxa aanu samayn karin, iyo sida loo joojiyo.

## Waxa caawiyuhu samayn karo CivilCraft

| Wuxuu weydiiyaa | Waxa uu helayaa | Wuxuu u baahan yahay |
|---|---|---|
| Goobta | Magaca, unit-yada, nidaamka isku-xirka, kooxaha dhibcaha, jid-hagayaasha, dusha, pad-yada, qeybaha dhulka iyo tuubooyinka | Akhri |
| Dhibcaha sahanka | Lambarka, easting, northing, kor u kac iyo sharaxaad, kooxda, sharaxaadda ama gudaha sanduuq | Akhri |
| Kor u kaca dusha | Dhulka jira (ama dusha la simay) meelaha uu magacaabo | Akhri |
| Stations iyo offsets | Station-ka iyo offset-ka dhibcaha jid-hagaha dhexdiisa, ama isku-xirka iyo kor u kaca dhulka ee stations-ka | Akhri |
| Muuqaal dherer | Dhulka jira, naqshadda naqshadeynta iyo dusha la simay kor u kaca jid-hagaha dhexdiisa, masaafo kasta oo feet ama mitir ah | Akhri |
| Goyn iyo buuxin | Mugga u dhexeeya dhulka jira iyo dusha la simay (pad kasta iyo corridor kasta sidoo kale), ama u dhexeeya dhulka iyo heer | Akhri |
| Qeybaha dhulka | Geeska, aagga (acres ama hectares), perimeter iyo sharaxaadda sharciga | Akhri |
| Doorasho | Dhibcaha la doortay ayaa lagu calaamadiyaa qorshaha, sida haddii aad doorato | Wax ka beddel |
| Dhibcaha cusub ee sahanka | Dhibcaha lagu daray lambarrada uu bixiyo, ama kuwa xiga ee bannaan. Wac kasta waa hal tallaabo oo aad ka noqon karto | Wax ka beddel |
| Kaydi | Badhanka {{ui:Save}} ee CivilCraft-ka laftiisa | Kaydi |
| LandXML ama DWG | Faylalka isku mid ah ee badhamada {{ui:LandXML}} iyo {{ui:DWG}} | Dhoofin |
| Goobta 3D | OpenUSD (.usdz, .usda ama .usdc) ee dhulka jira, dusha la simay, pad-yada iyo tuubooyinka, sida muuqaalka 3D u dhoofiyo | Dhoofin |
| Dhirta iyo jadwalka dhirta | Dhirta laga helo liiska dhirta magac kasta, iyo tirinta jadwalka dhirta | Akhri |
| Beerta iyo simaynta dhulka | Dhir, beer ama xayd la geliyay, ama platform, berm, swale ama aag simaynta lagu daray, mid kasta oo hal tallaabo ah oo aad ka noqon karto, oo ay weheliso goyntiisa iyo buuxinteeda | Wax ka beddel |
| Hubinta biyo-qulqulka | Qulqulka aag kasta, cadaadiska loo baahan yahay valve-kiisa iyo bixinta, madaxa xaaladda ugu xun, waqtiyada socodka, dhibaatooyinka iyo liiska alaabta, oo ah caawin xisaabeed oo naqshadeeyaha biyo-qulqulku hubiyo | Akhri |

Wuxuu ka shaqeeyaa goobta furan. Studio-da wuxuu sidoo kale ku kaydin karaa oo dhoofin karaa galleyda aad doorato (hoose); galla la'aanteed faylashiisu waxay soo dejin doonaan sida badhamadu soo dejiyaan.

## Shid

Caawiyeyaasha waxay gaadhaan CivilCraft iyada oo loo marayo CadCraft Studio kombiyuutarkaaga; brawsarka caadiga ah ma leh hab uu ku galo.

1. Furo {{ui:Settings}} oo dooro tab-ka **CivilCraft**.
2. Hoosta **Assistants**, calaamadi "Oggolow caawiyeyaasha AI iyo script-yada inay isticmaalaan CivilCraft".
3. **Read** (Akhri) waa la calaamadiyay adiga. Calaamadi **Edit** (Wax ka beddel), **Save** (Kaydi) ama **Export** (Dhoofin) kaliya marka caawiyuhu u baahdo.
4. Si uu u kaydiyo oo u dhoofiyo galka, dooro {{ui:Add a folder…}} hoosta **Folders it may use** (Galleyda uu isticmaali karo) oo dooro galka dialogka Studio. {{ui:Remove}} wuu soo celinayaa isla markiiba; jid kasta oo kale waa la diidaa.
5. Ku xidh caawiyaha Studio (Studio wuxuu muujinayaa cinwaanka iyo dejinta lagu dhejiyo).

## Intii caawiyuhu xiran yahay

Qoraal ku yaal qeybta sare ee dhinaca midig wuxuu sheegayaa caawiyaha xiran iyo waxa uu samayn karo. Guji {{ui:Disconnect}} si aad isla markiiba u dhammaysato fadhigiisa; wuxuu u baahan yahay inuu mar kale xirmo si uu u sii wado.

**Activity** (Dhaqdhaqaaqa), hoosta **Assistants** ee Settings, wuxuu liistaa wac kasta oo caawiyuhu sameeyay, kan ugu dambeeyay marka hore, iyo in uu shaqeeyay ama uusan shaqeynin.

:::tip
Ku weydii erayo fudud, tusaale ahaan "waa maxay kor u kaca dhulka 50 feet kasta oo ku dhex jira Main Street?", "goyn iyo buuxin intee in leh ayey pad-yadu u baahan yihiin?" ama "ku dar dhibic kontaroolka ah iyadoo laga raacayo isku-xirkan". Caawiyuhu wuu akhrin doonaa goobta oo jawaab bixin doonaa, ama wuxuu samayn doonaa isbeddelka hal tallaabo oo aad ka noqon karto.
:::

## Iyada oo aan CivilCraft la furin

Server-ka faylalka ee caawiyeyaasha (`npx @getcadcraft/mcp`) iyo amarka `cadcraft` command line waxay furaan mashaariicda la kaydiyay (`.civilcraft.json`) iyo faylalka dhibcaha, iyagoo isticmaalaya koodka CivilCraft-ka, aan daaqad lahayn: isla qalabyada akhrinta, ku darista dhibcaha, kaydinta mashruuca, LandXML iyo goobta 3D sida OpenUSD. `cadcraft convert site.civilcraft.json site.xml` wuxuu qoraa LandXML amarka command line-ka. Furidda LandXML, dhoofinta DWG iyo qalabyada meesha shaqada Landscape wali waxay u baahan yihiin daaqadda CivilCraft.

## Demi

Ka saar calaamadda "Oggolow caawiyeyaasha AI iyo script-yada inay isticmaalaan CivilCraft". Caawiye kasta waa la xiriiriyaa isla markiiba, dejintuna waa la kaydiyaa xilli kale.

## Eeg sidoo kale

- [Cuntooyinka caawiyeyaasha AI](common:assistants-recipes): tusaalooyin, mid kasta oo leh qalabka uu wacayo.
- [Qorso jid-hagaha toosan](topic:alignment)
- [Dhis oo hagaaji dusha](topic:build-surface)
- [Dooro, koobiyee oo dhaji dhibcaha sahanka](topic:copy-paste-points)
- [Dejinta CivilCraft](topic:settings)
