---
title: Faylalka aad furi, kaydin iyo dhoofin karto
summary: Faylalka barta ku soo geli, LandXML iyo mashruucyada CivilCraft; mashruucyada, LandXML, DXF iyo PDF u dhoofi; waxa mid kasta hayo, meesha faylalku tagaan, iyo waxa isbedela marka offline.
keywords: fur, kaydi, dhoofin, soo geli, qaababka faylalka, csv, txt, landxml, xml, dxf, pdf, json, soo degso, faylka mashruuca
from: 82bff559
---

CivilCraft wuxuu ka furaa faylal kombiyuutarkaaga ku jira wuxuuna kaydiyaa iyagoo ku soo degsanaya kombiyuutarka. Waxba lama soo rarin, waxna server-ka lama kaydiyo. Eeg sidoo kale [Faylalkaaga](common:your-files).

## Waxa uu furayo

Guji {{ui:Fur}} (ama riix {{key:Mod+O}}) oo dooro fayl, ama jiidi faylka {{pick:mac=Finder|windows=File Explorer|linux=maamulaha faylalkaaga}} oo keen saxanka. Hal fayl mar; faylalka ka weyn 200 MB waa la diidaa. LandXML ama fayl mashruuc oo ka weyn 32 MB waxa la akhriyaa qaybo ku dhow 4 MB, weligood qoraal hal jeex ah ma aha; intii LandXML la furayo, filo inuu xusuusta isticmaalo qiyaastii 13 jeer cabbirka faylka (fayl 69 MB ah wuxuu isticmaalay qiyaastii 0.9 GB tijaabadeenna).

| Nooca | Magacyada faylalka | Waxa dhaca |
|---|---|---|
| Fayl barta | `.csv`, `.txt`, `.pnt`, `.xyz` (fayl qoraal kasta) | Daaqadda **Soo geli barta** ayaa furmaysa. Barta ayaa beddelaysa barta mashruuca; khadadka waddada, saldhigyada iyo tuubooyinka way sii joogaan. |
| LandXML | `.xml`, `.landxml` | **Mashruuc cusub** ayaa laga sameeyaa faylka (waa la weydiin doonaa marka hore haddii mashruuca hadda jira uu leeyahay isbedello aan la kaydin). |
| Mashruuca CivilCraft | `.civilcraft.json` (wixii `.json` ah) | Mashruucu wuxuu furmaa sida loo kaydiyay (waa la weydiin doonaa marka hore haddii mashruuca hadda jira uu leeyahay isbedello aan la kaydin). |

CivilCraft wuxuu go'aan ka gaadhaa dhamaadka magaca faylka, kadibna xarfaha ugu horreeya: qoraal ku bilaabma `{` waa la akhriyaa mashruuc, qoraal ku bilaabma `<` waa LandXML, wixii kale waa fayl barta. Fayl uu sanduuqa furista ku madoobeeyo ayaa weli lagu tuuri karaa saxanka.

:::note
Soo gelinta fayl barta mashruuc leh barta horey u jirta waxay beddeshaa barta jirta si aan la weydiin, waxayna tirtirtaa taariikhda ka noqoshada (furidda wax kasta waa bilow cusub oo ka noqoshada). Haddii dusha laga keenay LandXML, soo gelinta barta waxay dib ugu beddeshaa dusha loo sameeyay barta. Marka hore kaydi haddii aad rabto barta hore dib u soo celin karto.
:::

Faahfaahin dheeraad ah: [Qaababka faylalka barta](topic:point-file-formats), [LandXML: waxa la akhriyo iyo la qoro](topic:landxml-reference).

## Waxa uu kaydiyo

{{ui:Kaydi}} ({{key:Mod+S}}) wuxuu qoraa laba fayl oo ku dhinac-dhinac ah, oo magacooda laga qaatay **Magaca** ku jira xagga bidix: `<name>.civilcraft.json`, mashruuca aad sii wadid tafatirka, iyo `<name>.ifc`, isla naqshadda oo IFC 4.3 ah oo dadka kale loogu talagalay (eeg [dhoofinta iyo soo gelinta IFC](topic:ifc)). Fayl kasta wuxuu diiwaangeliyaa kan kale, IFC-na wuxuu sidoo kale qaadaa nuqul la kaabay oo mashruuca ah, sidaas darteed IFC keligeed loo diro weli si buuxda ayuu tafatir ugu furmaa.

- **Studio gudahiisa** labada fayl waa la qoraa dhinac-dhinac, meeshii ay joogeen.
- **Chrome iyo Edge gudahooda** kaydinta ugu horreysa waxay weydiisaa folder, waxayna labadooda ku qortaa; kaydinta dambe waxay tagaan isla folderkaas. Ka jawaab folder-ka weydiinta si labadooda loogu soo dego.
- **Browser-ada kale gudahooda** labada fayl way soo degaan, mashruucuna marka hore.

Furidda fayl kasta waxay raadisaa kan kale. Labadooda isku mar fur (ama jiid labadooda), ama mid keliya fur: Studio gudahiisa kan kale isla folderkaas ayay ka helaysaa; browser gudahiisa CivilCraft wuxuu weydiinayaa inaad ku darto, ama inaad ku sii wadato midka aad haysato. Haddii IFC-ga barnaamij kale beddelay ka dib markii CivilCraft kaydiyay, ama mid ka mid ah labada fayl ayaa ka hor yimid kan kale, mashruucu wuxuu ka furmaa naqshadda cusub, garoonka Dhibaatooyinka ayaa sheegaa waxa dhacay, oo leh **Kaydi hadda** (labada fayl mar kale qoraa) iyo **Tus joometriga IFC ahaan tixraac**. IFC keligiis oo uu barnaamij kale beddelay wuxuu ka furmaa nuqulkiisa mashruuca oo wuxuu qaadaa wixii weli isku mid ah: waxyaabaha wax-ka-beddelkooda leh waxay qaadaan joometriga IFC-ga, shayada uu tirtiray way ka maqnaadaan, isbeddellada kale waa la liistaa, ma aha la qaadan. Fayl mashruuc ka hor nooca 0.7.1 wuxuu furmaa sidii hore.

Faylka mashruucu wuxuu hayaa:

- barta kasta (lambarka, koordinaadyada, sare-u-kac, sharraxaadda) iyo magaca faylka barta ay ka timaadeen
- dejinta dusha: doorashooyinka kooxda, khadadka jajabka ee la sawiray, xadka, cirifka dibedda ee ugu dheer, iyo TIN laga akhriyay LandXML
- dejinta muuqaalka
- khadadka waddada oo leh PI-kooda, radiyadooda iyo station-ka bilowga, naqshadaha dhulka (PVI-yada iyo dhererka qallooyinka) iyo dejinta koridorka
- saldhigyada iyo shabakada tuubooyinka oo leh qawaaniinteeda

Ma hayo taariikhda ka noqoshada. Dusha, konturada, khadadka dhulka ee daylight iyo mugga lama kaydiyo; waxa dib loo dhisaa xogta la kaydiyay marka mashruucu furmo. Fayl mashruuc oo ka cusub CivilCraft cusub waa la diidaa, fariin magaciisa nooca ku jirtaa ayaa tusaysa.

## Waxa uu dhoofiyo

| Badhanka | Faylka | Waxa ku jira |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: barta, dhulka jira (iyo dusha la dhisay haddii ay jirto) oo ah dusha TIN, khadadka waddada, naqshadaha dhulka iyo kuwa naqshadda, shabakada tuubooyinka |
| {{ui:DXF}} | `<name>.dxf` | Khadadka sawirka sida loo muujiyay DXF R12 oo leh lakabyo magacaabani |
| {{ui:DWG}} | `<name>.dwg` | Isla khadadka sawir DWG ah, qaabka aad doorato (2000 ilaa 2018) |
| {{ui:PDF}} | `<name>.pdf` | Sawirka dhulka oo vector ah oo ku taal warqad, miisaan aad doorato |
| {{ui:GLB}} ama {{ui:OBJ}} (qaybta ku taal muuqaalka 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Waxa muuqaalka 3D uu muujiyo oo ah moodeel 3D: meter, Y sare, cabbir run ah, oo ku wareegsan meel asal ah oo la duubay |

Waxa mid kasta ka reebo: [LandXML dhoofin](topic:landxml), [Dhoofi sawirka DXF](topic:dxf-export) (DWG sidoo kale), [Daabac sawirka PDF](topic:plot-pdf), [Dhoofi goobta 3D](topic:export-3d).

## Faylalku halkay ku tagaan

Faylalka la kaydiyay iyo kuwa la dhoofiyay waxay aadayaan meesha browser-ku ku soo dego, badanaaba folderka Soo degidda. Si aad folder u dooratid mar kasta:

:::chromium
Fur **Dejinta** browser-ka, kadibna **Soo degidda**, oo shid **Weydii halka faylka kasta ka hor soo degidda loo kaydinayo**.
:::

:::firefox
Fur **Dejinta**, kadibna **Guud**, oo hoos **Faylal iyo Barnaamijyo** dooro **Weydii had iyo jeer halka faylalka loo kaydinayo**.
:::

:::safari
Fur **Safari > Dejinta > Guud** oo deji **Goobta soo dejinta faylka** **Weydii soo dejin kasta**.
:::

Haddii aad labo jeer kaydiso isla magac, browser-ku wuxuu ku dari karaa lambar fayl labaad, tusaale ahaan `Site (1).civilcraft.json`. Mar xiga fayl ugu cusub fur.

## Online iyo offline

CivilCraft wuxuu shaqeeyaa kombiyuutarkaaga keliya, online ama offline kasta: furidda waxay akhrisaa faylka browser-ka, kaydinta waxay soo dejisaa. Si aad CivilCraft ugu furto iyada oo aan xiriir lahayn, marka hore u kaydi offline:

1. Markaad online tahay, guji {{ui:Kaydi khadka ka baxsan}} ee bar-ka sare.
2. Badhanku wuxuu tiriyaa ("Saving 12 of 30") kadibna wuxuu muujinayaa {{ui:Khadka ka baxsan diyaar}}. CivilCraft waa yar yahay (qiyaastii 0.6 MB), sidaas darteed waqti yar ayuu qaadanayaa. Nuqulka la kaydiyay wuxuu ku jiraa caawinta iyo goobta tusaalaha.
3. Xiriir la'aan, fur isla cinwaanka (ama bookmark-ka); wax kasta waa shaqeeyaa, oo ay ku jiraan {{ui:Fur goobta tusaalaha}}.

Gudbinta kale ee badhanka:

- {{ui:Lama kaydin karin}}: qaar ka mid ah faylalka lama soo dejin. Hubi xiriirka oo guji si aad mar kale u isku daydo.
- {{ui:Khadka ka baxsan lama heli karo}}: daaqaddan browser-ka ma kari karto nuqul offline ah (daaqadaha gaarka ah iyo kombiyuutarada maamulka qaarkood way xannibaan). Isticmaal daaqad caadi ah.

Guji {{ui:Khadka ka baxsan diyaar}} si aad u aragto goorta la kaydiyay nuqulka, oo leh laba ikhtiyaar: {{ui:Mar kale kaydi (hel nooca ugu dambeeya)}} iyo {{ui:Ka saar nuqulka khadka ka baxsan}}. Mar kale kaydi ka hor booqashada goobta si nuqulku ula mid noqdo dhismaha ugu dambeeya. Wax dheeraad ah: [Offline](common:offline).

:::offline
Hadda offline ayaad tahay. Haddii CivilCraft loo kaydiyay isticmaalka offline, wax kasta waa shaqeeyaa, oo ay ku jiraan goobta tusaalaha. Haddii aysan ahayn, ku sii wad shaqada tabkan, laakiin ha dib u soo rarin ilaa aad online ku noqoto; haddii aanu jirin nuqul la kaydiyay, {{ui:Fur goobta tusaalaha}} wuxuu fashilmaa oo wuxuu sheegaa "The sample could not be loaded".
:::

:::tip
Shaqada beerta, kaydi CivilCraft isticmaalka offline oo keen faylalka barta kombiyuutarka laftiisa. Mashruucyada iyo dhoofinta waxay u kaydiyaan sida soo degitaanno iyada oo aan xiriir jirin, sidaas darteed waxaad soo gelin kartaa tirooyinka maalinta, hubin kartaa dusha, oo kaydin kartaa mashruuca goobta.
:::

Kaydinta sixaabka weli lama heli karo, qalabka desktop-kana weli lama soo saarin. Hadda faylalka aad kaydiso ayaa nuqulka keliya ah: ku hay meel la kaabay.

## Kordhinta uu faylku isticmaalo

Marka aad kaydiso mashruuc ku jira xog ka timid kordhin (xulashooyinka Building regulations, ama Address to site source), faylku wuxuu diiwaangeliyaa kordhinnada iyo noocyadooda. Haddii laga furo kombiyuutar uusan lahayn mid ka mid ah, garoonka sare ee sawirka ayaa sheegaa oo waxay ku bixisaa in laga soo daro liiska akoonkaaga. Diiwaanku waa fiiro keliya; faylku wuu furmaa si kastaba ha ahaatee.

## Ka noqo Studio-ga

Gudaha CadCraft Studio, talaabo kasta oo aad ku dhamaysid CivilCraft waxaa loo sheegaa Studio, sidaas darteed ka noqoshadeeda heerka mashruucu waxay ka noqon kartaa talaabada ugu dambeysay dhammaan barnaamijyada. Studio wuxuu ka noqdaa talaabo kaliya marka xidhmada ka noqoshada CivilCraft ay tahay sidii talaabadaas ka tagtay; markaad fayl kale furto, wuu ka tallaabsadaa daaqaddan.

## Xidhista isbedello aan la kaydin

Marka mashruucu leeyahay isbedello aan la kaydin oo aad xirto tab-ka, dib u soo rarto, ama aad bogga ka baxdo, browser-ku wuxuu weydiin doonaa inaad rabto inaad baxdo. Hadalkiisa iyo muuqiisa waa kan browser-ka, CivilCraft ma beddeli karo. {{ui:Cusub}}, iyo furidda mashruuc ama fayl LandXML, waxay weydiiyaan sanduuqa CivilCraft ee **Isbedello aan la kaydin**, oo leh {{ui:Jooji}}, {{ui:Ha kaydin}} iyo {{ui:Kaydi nuqul}}.
