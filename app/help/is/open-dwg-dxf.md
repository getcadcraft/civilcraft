---
title: Opna DWG eða DXF sem línur
summary: Opnaðu línur teikningar á grunnmynd, lag fyrir lag, notaðu hæðarlínur, þrívíddar-fjöllínur og lokaðar útlínur fyrir yfirborðið, og breyttu punktablokkum hennar í mælipunkta.
keywords: mælieftirlit, textakótar, dwg, dxf, cad, teikning, línur, hæðarlínur, brotlínur, jaðar, fjöllína, þrívíddar-fjöllína, lög, grunnkort, topo, mæliteikning, blokkir, blokkatilvísanir, mælipunktar úr blokkum, eigindi, punktablokkir, innsetningarpunktur
from: da0f4c58
---

Landmælingateikning kemur oft sem teikning: hæðarlínur sem fjöllínur í sinni hæð, brotlínur sem þrívíddar-fjöllínur, og útlína svæðisins sem lokuð fjöllína. CivilCraft opnar **líkanrými** teikningarinnar sem lög á grunnmynd, og getur breytt þessum línum beint í yfirborðið.

## Opna teikninguna

1. Smelltu á {{ui:Línur}} í hópnum **Yfirborð** (eða {{ui:Opna}}, eða slepptu skránni á grunnmyndina) og veldu `.dwg`- eða `.dxf`-skrá. Teikningin er lesin á þessari tölvu; ekkert er sent. DWG frá 2000 til 2018 og ASCII DXF eru lesin.
2. Glugginn **Línur** sýnir lög teikningarinnar sem innihalda línur, lokuð form eða punkta, og hvort þau hafa **hæðir**. Lög sem eru slökkt á í teikningunni byrja ómerkt. Texti, skygging, málsetningar og annað sem er ekki línur er talið og sleppt (glugginn segir hvað).
3. Athugaðu **Einingar teikningar**. Þegar teikningin segir til um einingar breytir CivilCraft þeim í einingar verkefnisins (millimetrar í metra, metrar í fet, tommur í fet). Teikning í fetum er lesin sem bandarísk mæli-fet án skölunar: munurinn er 2 hlutar á milljón, og skölun á hnitum í state plane myndi færa þau um fet. Þegar teikningin segir ekki til um einingar eru tölurnar lesnar í einingum verkefnisins; veldu réttu einingarnar á listanum ef þær eru ekki réttar.
4. Undir **Nota fyrir yfirborðið** velurðu hvað hvert lag gefur yfirborðinu (eða skilur eftir **Aðeins sýna það**). Lög sem heita eins og hæðarlínur (TOPO, CONT, CNTR) sem hafa hæðir byrja sem brotlínur.
5. Smelltu á {{ui:Bæta við}}. Lögin birtast undir **GIS-lögum** í vinstra spjaldinu; hver notkun er sett í yfirborðið. Hver hluti er sérstakt skref: {{key:Mod+Z}} tekur þá til baka einn í einu.

## Hvað hver tegund lags getur gefið

| Lagið inniheldur | {{ui:Nota fyrir yfirborðið}} |
|---|---|
| Hæðarlínur (fjöllínur í hæð) | Brotlínur í eigin hæð línanna, eða í ELEV-reitnum |
| Þrívíddar-fjöllínur | Brotlínur í eigin hæðum |
| Lokuð útlína | Jaðar yfirborðsins (stærsta lokaða formið, eða það sem þú valdir) |
| Punktar með hæð | Mælipunktar, lýstir með heiti lagsins |
| Línur í hæð 0 (línur á grunnmynd) | Ekkert: þær eru áfram á grunnmynd sem grunnteikning |

Teikning sem CivilCraft skrifaði geymir einkennalínur sínar sem þrívíddar-fjöllínur sem muna boga sína. Glugginn sýnir þá **Einkennalínur**: hafðu hakað til að fá þær aftur sem einkennalínur með bogum og notkun sinni (eitt afturköllunarskref), eða afhakaðu til að lesa þær sem línur eins og hvert annað lag.

Síðar notarðu {{ui:Nota fyrir yfirborðið}} í valmynd lagsins undir **GIS-lögum** til að gera það sama fyrir lag sem þú sýndir aðeins.

## Mælipunktar úr blokkum

Mæliteikningar bera oft punkta sína sem blokkir: lítið tákn á hverri mælingu, með eigindum fyrir punktanúmer, lýsingu og hæð. Þegar teikningin hefur blokkatilvísanir hefur glugginn hlutann **Mælipunktar úr blokkum**:

1. Hakaðu við blokkirnar sem á að taka (taflan segir hversu margar tilvísanir hver hefur, á hvaða lögum og með hvaða eigindum), eða hakaðu við lög til að taka hverja blokkatilvísun á þeim.
2. Veldu hvaðan **númer**, **lýsing** og **hæð** hvers punkts koma: úr eigind, nafni blokkarinnar eða lagsins, næstu lausu númerum, eða Z-hnitinu á innsetningarpunktinum. CivilCraft byrjar á líklegu eigindunum (PT, DESC, ELEV og álíka), og tekur hæðina úr eigind aðeins þegar blokkirnar standa í núlli.
3. Afhakaðu línulögin ef þú vilt aðeins punktana, smelltu síðan á {{ui:Bæta við}}.

Hver tilvísun verður einn mælipunktur á innsetningarpunkti sínum. Aðeins tilvísanir sem eru settar í líkanrými telja; blokkir sem eru inni í öðrum blokkum gera það ekki. Númer sem eru þegar í verkefninu, eða notuð tvisvar í teikningunni, fá ný númer á eftir þeim hæsta, og hæðareigind sem er ekki tala skilur þann punkt eftir án hæðar; stöðustikan telur hvort tveggja. Teikningin er aldrei breytt, og hver punktur man sína blokk: Eiginleikar hans sýna **Frá blokk** með blokkinni, laginu og auðkenninu. Að bæta punktunum við er eitt skref, svo {{key:Mod+Z}} tekur þá alla í burtu.

## Hæðir skrifaðar sem texti, og athugunin

Staðkótur skrifaðar sem texti (eða í blokkareigind sem er ekki mælipunktablokk) teljast ekki línur. Hlutinn **Mælihæðir og athugun** getur tekið þær sem mælipunkta, og listar það sem lítur illa út í teikningunni: einingar, hnitakerfi, fjarlægð frá núlli, flatar hæðarlínur, undarlegar hæðir, tvöfalda punkta. Sjá [Athugun mæliteikningar við innflutning](topic:survey-check).

## Hvernig teikningin er lesin

- Bogar, hringir, sporbaugar, bungandi fjöllínubútar og splænur verða að stuttum beinum bútum (á mest 5° fresti).
- Blokkatilvísanir eru teiknaðar þar sem þær eru settar, líka blokkir í blokkum; það sem blokk geymir á lagi 0 tekur lag tilvísunarinnar.
- Hlutir sem eru teiknaðir í öðru plani (önnur útdráttarstefna) eru settir í heimshnit.
- Hver hlutur fær þrjá reiti: LAYER, TYPE (gerð hlutarins) og ELEV (hæð hans þegar allir punktar hans deila einni).
- Hnitin eru tekin eins og þau eru: teikningin verður að nota sömu hnit og verkefnið (til dæmis sama state plane svæði). Tengdar teikningar (xrefs) eru ekki opnaðar: opnaðu þær sér.

:::tip
Hæðarlínu-teikning gefur besta yfirborðið með nokkrum staðkótum á hæðartoppum og í dældum, þar sem hæðarlínur einar skilja eftir flata þríhyrninga. Bættu þeim við sem mælipunktum, eða úr punktalagi í teikningunni.
:::
