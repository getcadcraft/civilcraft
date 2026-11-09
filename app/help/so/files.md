---
title: Faylasha aad furi, kaydi iyo dhoofin karto
summary: Faylalka barooyinka, LandXML iyo mashaariicda CivilCraft ku soo gali; mashaariicda, LandXML, DXF iyo PDF ka soo dhoofi; wixii mid kasta hayo, meesha faylalku tagaan, iyo wixii isbeddelaya marka khadka ka baxsan.
keywords: fur, kaydi, dhoofi, soo dhoofi, qaababka faylka, csv, txt, landxml, xml, dxf, pdf, json, soo dejin, fayl mashruuc
from: a7debb61
---

CivilCraft wuxuu furaa faylal ka kooban kombiyuutarkaaga, wuxuuna kaydiyaa isagoo faylalka dib ugu soo dejinaya kombiyuutarkaaga. Wax lagu soo rarin, wixii lagu kaydiyo server ma jiro. Sidoo kale eeg [Faylalkaaga](common:your-files).

## Waxa uu furo

Guji {{ui:Fur}} (ama riix {{key:Mod+O}}) oo dooro fayl, ama jiid faylka {{pick:mac=Finder|windows=File Explorer|linux=maareeyaha faylalkaaga}} ku rid qorshaha. Hal fayl mar; faylal ka weyn 200 MB waa la diidaa.

| Nooca | Magacyada faylalka | Waxa dhaca |
|---|---|---|
| Fayl barood | `.csv`, `.txt`, `.pnt`, `.xyz` (fayl qoraal kasta) | Wada-hadalka **Soo dhoofi barood** ayaa furmaa. Barooyinka ayaa beddelaya barooyinka mashruuca; jid-hagayaasha, padyada iyo tuubooyinka way joogaan. |
| LandXML | `.xml`, `.landxml` | **Mashruuc cusub** ayaa laga sameeyaa faylka (waa la weydiin doonaa marka hore haddii mashruuca hadda jira uu leeyahay isbeddel aan la kaydin). |
| Mashruuca CivilCraft | `.civilcraft.json` (ama `.json` kasta) | Mashruuca ayaa furmaa sida loo kaydiyay (waa la weydiin doonaa marka hore haddii mashruuca hadda jira uu leeyahay isbeddel aan la kaydin). |

CivilCraft wuxuu go'aamiyaa nooca faylka iyadoo laga eegayo dhamaadka magaca, kadibna xarfaha ugu horreeya: qoraal ka bilaabma `{` waxaa loo akhriyaa sida mashruuc, qoraal ka bilaabma `<` sida LandXML, wixii kale sida fayl barood. Fayl ay sanduuqa furitaanku diidayo ayaa weli lagu ridi karaa qorshaha.

:::note
Soo dhoofinta fayl barood mashruuc ay horey barooyin u lahayd ayaa barooyinka beddelaysa iyadoo aan la weydiin, waxayna nadiifinaysaa taariikhda ka noqoshada (fur wax kasta waa bilow cusub oo ka noqosho). Haddii dusha uu ka yimid LandXML, soo dhoofinta barooyinka waxay dusha ku celinaysaa dusha laga dhisay barooyinka. Marka hore kaydi haddii aad rabto barooyinkii hore inaad dib u hesho.
:::

Faahfaahin: [Qaababka faylka barooyinka](topic:point-file-formats), [LandXML: waxa la akhriyo iyo la qoro](topic:landxml-reference).

## Waxa uu kaydiyaa

{{ui:Kaydi}} ({{key:Mod+S}}) wuxuu qoraa laba fayl oo dhinac-dhinac ah, oo loogu magac daray **Magaca** panelka bidix: `<magaca>.civilcraft.json`, mashruuca aad sii wadi doonto tafatirka, iyo `<magaca>.ifc`, isla naqshadda oo ah IFC 4.3 dadka kale (eeg [IFC dhoofin iyo soo dhoofin](topic:ifc)). Fayl kasta wuxuu xusaa kan kale, IFC-na wuxuu sidoo kale qaadaa nuqul la yareeyay oo mashruuca ah, sidaas darteed IFC la kaligiis loo diro weli wuu furmi karaa oo wax lagu bedeli karo oo dhan.

- **Studio-da** labada fayl waxa lagu qoraa meel ay isku dhinac yihiin, meeshooda.
- **Chrome iyo Edge** kaydinta ugu horreysa waxay weydiisaa folder, waxayna labadaba ku qorataa; kaydinta dambe waxay tagaan isla folder-kaas. Ka jawaab weydiinta folder-ka si aad labada u soo dejiso halkii.
- **Browsers kale** labada fayl way soo degaan, mashruuca fayl ka horreeya.

Furidda midkood ayaa doonta kan kale. Labadaba isku wada fur (ama isku jiid), ama midka keliya fur: Studio-da kan kale waxa laga helaa isla folder-ka; browser-ka CivilCraft wuxuu kugu weydiinayaa inaad ku darto, ama inaad ku sii socoto midka haysta. Haddii IFC-ga barnaamij kale beddelay kadib markii CivilCraft kaydiyay, ama midkood uu ka duwan yahay kan kale, mashruuca waxa laga furaa naqshadda cusub, panelka **Dhibaatooyinka** wuxuu sheegayaa waxa dhacay, oo leh **Kaydi hadda** (wuxuu mar kale qorayaa labada fayl) iyo **Muuji joomitriga IFC-ga tixraac ahaan**. IFC keliya oo barnaamij kale beddelay wuxuu ka furmaa nuqulkiisa mashruuca oo wax walba oo is waafaqa: jid-hagayaasha uu beddelay waxay qaataan joomitriggooda, walxaha uu tirtiray waa la reebaa, isbeddelada kale waa la liistaa oo ma qaadan. Fayl mashruuc ka horreeya 0.7.1 wuxuu furmaa sida hore.

Faylka mashruucu wuxuu hayaa:

- barooyin kasta (lambar, isku-xirka, sare-taagga, sharaxaadda) iyo magaca faylka barooyinka ay ka yimaadeen
- dejinta dusha: doorashooyinka kooxda, khadadka jebinta la sawiray, xuduudka, geerida ugu dheer ee dibadda, iyo TIN laga akhriyay LandXML
- dejinta bandhigga
- jid-hagayaasha, PI-yadooda, radius-kooda iyo station-ka bilowga, naqshadaha dhererka (PVI-yada iyo dhererka qallooca) iyo dejinta korridorka
- padyada iyo shabakadda tuubooyinka iyo xeerarkeeda

Ma kaydiyo taariikhda ka noqoshada. Dusha, kontuurrada, khadadka iftiinka (daylight) iyo mugga lama kaydiyo; waxaa dib loo dhisaa xogta la kaydiyay marka mashruuca la furo. Fayl mashruuc oo ka cusub CivilCraft ayaa la diidaa, fariin ayaa magaca nooca sheegaysa.

## Waxa uu dhoofiyaa

| Badhanka | Faylka | Waxa ku jira |
|---|---|---|
| {{ui:LandXML}} | `<magaca>.xml` | LandXML 1.2: barooyinka, dhulka jira (iyo dusha la sameeyay marka uu jiro) sida dusha TIN, jid-hagayaasha, joomitriga dhulka iyo naqshadaha, shabakadda tuubooyinka |
| {{ui:DXF}} | `<magaca>.dxf` | DXF R12 ee khadadka qorshaha sida loo muujiyay, layer-yo magacaabay ah |
| {{ui:DWG}} | `<magaca>.dwg` | Isla khadadkaas sida sawir DWG ah, qaabka aad dooratid (2000 ilaa 2018) |
| {{ui:PDF}} | `<magaca>.pdf` | Qorshaha oo ah vector ah ee xaashi, miisaan aad dooratid |
| {{ui:GLB}} ama {{ui:OBJ}} (bar-ka muuqaalka 3D) | `<magaca>-3d.glb`, `<magaca>-3d.obj` | Waxa muuqaalka 3D muujiyo sida moodeel 3D ah: mitir, Y oo sare, miisaan run ah, oo ku wareegsan meel asal ah oo la duubay |

Waxa midkiiba ka reebo: [LandXML isweydaarsi](topic:landxml), [Dhoofi qorshaha DXF](topic:dxf-export) (DWG sidoo kale), [Qorshaha ku daabac PDF](topic:plot-pdf), [Dhoofi goobta 3D](topic:export-3d).

## Halka faylalku tagaan

Faylalka la kaydiyay iyo kuwa la dhoofiyay waxay tagaan meesha browser-kaagu soo dejinta ku keydiyo, badanaa folder-ka Downloads. Si aad folder kasta mar kasta u dooratid:

:::chromium
Fur **Dejinta** browser-ka, kadibna **Soo dejinta**, oo shid **Weydii meesha loo kaydinayo fayl kasta ka hor soo dejinta**.
:::

:::firefox
Fur **Dejinta**, kadibna **Guud**, oo hoosta **Faylal iyo barnaamijyo** dooro **Had iyo jeer weydii meesha aad faylalka ku kaydinayso**.
:::

:::safari
Fur **Safari > Dejinta > Guud** oo deji **Meesha soo dejinta faylka** ** Weydii soo dejinta kasta**.
:::

Haddii aad labo jeer kaydiso magac isku mid ah, browser-ku wuxuu ku dari karaa lambar labaad, tusaale `Goob (1).civilcraft.json`. Marka xigta fur kan ugu dambeeya.

## Khadka ku jira iyo khadka ka baxsan

CivilCraft wuxuu shaqeeyaa kombiyuutarkaaga keliya labada xaaladood: furidda waxay akhrisaa faylka browser-ka, kaydinta waxay soo dejisaa. Si aad CivilCraft u furto iyada oo aan xidhiidh jirin, marka hore u kaydi khadka ka baxsan:

1. Markaad online tahay, guji {{ui:Kaydi khadka ka baxsan}} bar-ka sare ee app-ka.
2. Badhanku wuxuu tiriyaa ("Kaydinta 12 ka 30") kadibna wuxuu muujinayaa {{ui:Khadka ka baxsan diyaar}}. CivilCraft waa yar yahay (qiyaastii 0.6 MB), sidaas darteed waxay qaadataa wakhti yar. Nuqulka la kaydiyay wuxuu ku jiraa caawimaadan iyo goobta tusaalaha.
3. Xidhiidh la'aan, fur isla cinwaankaas (ama calaamad ku qoran). Wax walba way shaqeeyaan, oo ay ku jiraan {{ui:Fur goobta tusaalaha}}.

Badhanka gobolladiisa kale:

- {{ui:Lama kaydin karin}}: qaar ka mid ah faylalka lama soo dejin. Hubi xidhiidhka oo guji si aad mar kale u isku daydo.
- {{ui:Khadka ka baxsan lama heli karo}}: daaqaddan browser-ku ma kaydin karto nuqul khadka ka baxsan (daaqadaha gaarka ah iyo kombiyuutarrada maamulka qaarkood way xannibaan). Isticmaal daaqad caadi ah.

Guji {{ui:Khadka ka baxsan diyaar}} si aad u aragto waqtigii nuqulka la kaydiyay, oo leh laba doorasho: {{ui:Mar kale kaydi (hel nooca ugu dambeeya)}} iyo {{ui:Ka saar nuqulka khadka ka baxsan}}. Mar kale kaydi ka hor booqasho goobeed si nuqulku u waafaqo dhismaha ugu dambeeya. Dheeraad ah: [Khadka ka baxsan](common:offline).

:::offline
Hadda waad ka baxsan tahay khadka. Haddii CivilCraft loo kaydiyay isticmaalka khadka ka baxsan, wax walba way shaqeeyaan, oo ay ku jiraan goobta tusaalaha. Haddii aan la kaydin, ku sii wad shaqada tabkan, laakiin ha dib u cusboonaysiin ilaa aad ku xirnaato khadka; ma jiro nuqul la kaydiyay, {{ui:Fur goobta tusaalaha}} wuxuu fashilmaa "Tusaalaha lama soo rari karin".
:::

:::tip
Shaqada goobta, kaydi CivilCraft khadka ka baxsan isticmaalka, oo qaado faylalkaaga barooyinka kombiyuutarka laptop-ka laftiisa. Mashruucyada iyo dhoofinta waxay u kaydiyaan sida soo dejin xidhiidh la'aan, sidaas darteed waxaad soo dhoofin kartaa akhrinta sahanka maalinta, hubin kartaa dusha, oo kaydin kartaa mashruuca goobta.
:::

Kaydinta gacan-ka-geynta (cloud) weli ma diyaar aha, dhismayaasha desktop-ka weli ma soo baxin. Hadda, faylalka aad kaydiso ayaa ah nuqulka keliya: ku hay meel la badbaadiyo.

## Kordhinta ay faylku isticmaalo

Marka aad kaydiso mashruuc ku jira xog ka timid kordhin (tiksiyada Xeerarka dhismaha, ama isha Cinwaanka ilaa goobta), faylku wuxuu xusaa kordhinnada iyo noocyadooda. Haddii aad furto kombiyuutar uusan lahayn mid ka mid ah, bar ka sare qorshaha ayaa sheegaya oo wuxuu kugu soo bandhigayaa inaad ku darto liiska akoonkaaga. Xusidda waa fiiro keliya: faylku wuxuu furmaa labadaba.

## Ka noqo Studio-ga

Gudaha CadCraft Studio, talaabo kasta oo aad ku dhamayso CivilCraft waxaa loo sheegaa Studio, si ka noqoshada heerka mashruuca ay u qaadi karto talaabada ugu dambeysay app-yada dhexdooda. Studio wuxuu ka noqdaa talaabo kaliya marka kaydka ka noqoshada CivilCraft uu yahay sida talaabadaas ay ka tagtay; markaad furto fayl kale, wuu ka boodaa daaqaddan.

## Xidhista isbeddel aan la kaydin

Marka mashruucu leeyahay isbeddel aan la kaydin oo aad xirto tab-ka, dib u rarto, ama ka baxdo bogga, browser-ku wuxuu weydiinayaa inaad rabto inaad baxdo. Qoraalka iyo qaabkiisa waxay ku xiran yihiin browser-ka, CivilCraft ma beddeli karo. {{ui:Cusub}}, iyo furidda mashruuc ama fayl LandXML, waxay weydiiyaan sanduuq **Isbeddel aan la kaydin** oo CivilCraft gudahiisa ah, leh {{ui:Jooji}}, {{ui:Ha kaydin}} iyo {{ui:Kaydi nuqul}}.
