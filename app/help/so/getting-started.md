---
title: Bilow CivilCraft
summary: Waxa CivilCraft qabato, sida loo furo, iyo daqiiqadaha ugu horreeya ee goobta tusaalaha: barooyinka ilaa kontuurrada, waddo, iyo mashruuc la kaydiyay.
keywords: bilow, socodsiinta koowaad, goobta tusaalaha, hordhac, bilow degdeg ah, casharka, mashruuc cusub
from: c9b6dd8e
---

CivilCraft waa app-ka naqshadaynta dhulka iyo goobta ee qoyska CadCraft. Wuxuu qaadaa barooyinka sahanka wuxuuna u beddelaa dusha (TIN) oo leh kontuurro, kadibna wuxuu kuu ogolaanayaa inaad habeysid jid-hagayaasha iyo naqshadaha dhererka, aad jid korridor fudud ku dhaqaaqdo, aad padyada dhismaha u dhigtid si ay u gaaraan iftiinka (daylight), aad shabakadda tuubooyinka ee cuf-dhacaadka ku hubiso xeerarkaaga, iyo aad aragto mugga jarista iyo buuxinta. Wuxuu akhriyaa oo qoraa LandXML, wuxuu dhoofiyaa qorshaha sida DXF, wuxuuna ku plot-iyaa PDF.

Haddii aad isticmaashay Civil 3D, fikradaha way kuu caadi noqon doonaan: barooyin, kooxo barooyin, khadadka jebinta, jid-hagayaasha iyadoo lagu saleeyay PI, naqshadaha iyadoo lagu saleeyay PVI, korridoro, dhulka la sameeyay, shabakadda tuubooyinka. Habka aad u shaqeyso waa kala duwan, waana mid aad uga yar: ma jiro safka amarka, ma jiro qaabab (styles) iyo ma jiro fayl naqshad. Akhri [Software-ka dhulka ee kale](topic:coming-from) hal mar ka hor shaqadaada dhabta ah ee ugu horreysa.

## Waxa aad u baahan tahay

- Browser desktop oo casri ah: Chrome, Edge, Firefox ama Safari. Eeg [Browsers](common:browsers).
- Mouse ama trackpad iyo kiiboodh, ama shaashad taabasho: naqshaddu waxay leedahay badhamada shaashadda ah {{ui:Dhammee}}, {{ui:Ka noqo dhibicda}} iyo {{ui:Jooji}} (eeg [Mouse, trackpad iyo taabasho](topic:keyboard#mouse-trackpad-and-touch)).
- Qorshuhu wuxuu ku qoran yahay 2D canvas-ka browser-ka. [Muuqaalka 3D](topic:site-3d) wuxuu isticmaalaa grafikada WebGL ee browser-ka; haddii aanu bilaabi karin, bar-ka xaaladda ayaa sheegaya sababta oo qorshuhu wuu shaqeynayaa weli.
- Ma jiro akoon iyo ma jiro upload. Faylalku waxay furmaan kombiyuutarkaaga oo waxay kaydiyaan sida soo dejin. Eeg [Faylalkaaga](common:your-files).

:::note
CivilCraft maanta wuxuu ku shaqeeyaa sida browser dhismo horeyn ah oo weli la sameynayo. Dhismayaasha desktop-ka weli ma diyaar aha, kaydinta gacan-ka-geynta (cloud) weli ma diyaar aha. Wax kasta oo aad samayso wuxuu ku sii jiraa kombiyuutarkaaga ilaa aad kaydiso ama dhoofiso.
:::

## Fur CivilCraft

1. Fur CivilCraft browser-kaaga.
2. Sug shaashaddu inay buuxso: qalab bar ah oo sare, panel bidix, qorshaha dhexe iyo panel midig oo leh **Sifooyinka**.
3. Qorshe madhan dhexdiisa waxaad aragtaa sanduuq magacaaban **Ku bilow barooyinka sahanka**. Wuxuu liistaa tillaabooyinka ugu horreeya wuxuuna leeyahay xiriir, {{ui:Fur goobta tusaalaha}}.

Haddii aad rabto inaad CivilCraft ku isticmaasho markii aadan xidhiidh lahayn, guji {{ui:Kaydi khadka ka baxsan}} bar-ka app-ka oo sug {{ui:Khadka ka baxsan diyaar}}. Wuxuu ku jiraa caawimaadan, goobta tusaalaha, iyo maktabadaha 3D iyo GIS. Eeg [Khadka ka baxsan](common:offline). Riix {{key:F1}} ama guji {{ui:Caawimaad}} waqti kasta si aad caawimaadan ugu furto dhinac app-ka.

## Daqiiqadaha ugu horreeya: goobta tusaalaha

Goobta tusaalaha waa sahan yar oo feet-ka Maraykanka ah: 276 barood oo ku saabsan isku-xirka state plane, buur, jeexjeexyo (swale) leh khad qulqulka ah iyo laba sare-xeed oo dhulka ah. Waxay ku timaadaa app-ka, sidaas darteed waad raaci kartaa iyada oo aan fayl gaar ah lahayn.

1. Guji {{ui:Fur goobta tusaalaha}} sanduuqa qorshaha ku jira.
   Wada-hadalka **Soo dhoofi barood** ayaa furmaa. Wuxuu leeyahay "276 barood ayaa la akhriyay sida PNEZD (safka madhan ee madaxa), oo kala saaran kooma." wuxuuna muujinayaa safafka ugu horreeya.
2. Guji {{ui:Soo dhoofi}}.
   Qorshaha wuxuu buuxmaa barooyin, kontuurro iyo xuduudka dusha. Bar-ka hoose ee xaaladda wuxuu sheegayaa in barooyinka la soo dhoofiyay iyo inta saddexagal ee dusha ay leedahay (546).
3. Eeg panelka bidix hoosta **Barood**. Barooyinka waxa loo kooxeeyay ereyga koowaad ee sharaxaadda: CP, FL, GRD, RIDGE, TBN, TBS iyo TREE.
4. Tiirka **Dusha** ee miiskaas, deji **FL**, **RIDGE**, **TBN** iyo **TBS** sida {{ui:Xarriiqa jabinta}}.
   Dusha ayaa isla markiiba dib loo dhisaa. Xogta **Dusha** hadda waxay leedahay "Khadadka jebinta: 4", kontuurrada waxay si xad-dhaaf ah ugu qawsaan khadka qulqulka iyo ridge-ka halkii ay ku gudbi lahaayeen.
5. Dhaq pointer-ka qorshaha. Bar-ka xaaladda wuxuu muujinayaa cirifka (easting) iyo waqooyiga (northing) hoosta pointer-ka, iyo sare-taagga dhulka halkaas.
6. Hoosta **Bandhig**, deji {{ui:Kontuur kasta}} 0.5 ft oo shid {{ui:Xagaaga heerarka}}. Xagaaga midabka ayaa soo muuqda oo leh sharaxaad hoosta sanduuqyada hubinta. Demi xagaagii marka aad dhammayso.

Hadda waxaad leedahay dusha dhulka jira. Xiga, waddo.

## Waddo gaaban dhis

1. Riix {{key:A}} (ama guji {{ui:Jid-hagaha}} kooxda **Naqshadda**).
2. Guji saddex barood oo isku xiga goobta, mid mid. Khad casaan ah ayaa raacaya pointer-ka oo muujinaya dherer iyo jihada tangent-ka soo socda.
3. Riix {{key:Enter}} si aad u dhammayso.
   Jid-hagaha ayaa soo muuqda oo leh station. Panelka midig wuxuu muujinayaa **Jid-hagaha**: dherereedka, miiska PI, iyo qallooca PI-ga dhexe (radius 100 ft, ama ka yar haddii 100 ft aanu ku habboonayn).
4. Panelka midig, hoosta **Naqshadda dhererka**, guji {{ui:Ka bilow dhulka}}.
   Muuqaalka dherer ayaa ka furmaa qorshaha hoosteeda, oo leh dhulka jira iyo heer naqshad oo toos ah oo ka socda dhamaadka ilaa dhamaadka.
5. Riix {{key:I}} si aad u shido {{ui:Ku dar PVI-yo}}, kadibna mar guji muuqaalka dherer meel u dhow dhexda. PVI ayaa soo muuqda.
6. Miiska PVI ee midig, ku qor dherer qallooc (tusaale 100) sanduuqa **Qallooca L** ee PVI-ga dhexe, kadibna riix {{key:Enter}}. Naqshaddu hadda waxay leedahay qallooc toosan, K-kiisa oo calaamadaysan.
7. Hoosta **Korridorka**, shid **Qaab-dhismeed ku dhex mari naqshadda dhererka**.
   Waddadu waxay ku dhejisan tahay dhulka: waddooyinka, garabyada iyo jeexjeexyada dhinacyada ilaa iftiinka. **Shaqada dhulka** wuxuu muujinayaa jarista iyo buuxinta.

Ha ka walaacin tirooyinka saxda ah. Qiime kasta waa la beddeli karaa panelka midig, {{key:Mod+Z}} wuxuu ka noqdaa isbeddelka ugu dambeeya.

## Kaydi shaqadaada

1. Ku qor magac sanduuqa **Magaca** sare panelka bidix.
2. Riix {{key:Mod+S}} (ama guji {{ui:Kaydi}}).
   Browser-ku wuxuu soo dejiyaa fayl magaciisu yahay magaca goobta, oo dhammaadkiisu yahay `.civilcraft.json`. Wuxuu ku hayaa barooyinka, dejinta dusha, jid-hagayaasha, naqshadaha, korridoroyinka, padyada iyo tuubooyinka.
3. Si aad dib u sii wadato, guji {{ui:Fur}} (ama riix {{key:Mod+O}}) oo dooro faylkaas, ama jiid qorshaha.

:::warning
Ma jiro kaydin toos ah. Haddii aad xidho tab-ka isbeddel aan la kaydin, browser-ku wuxuu weydiinayaa inaad rabto inaad baxdo; haddii aad baxdo, isbeddelada way luntaan. Badanaa kaydi.
:::

## Halka aad u aadi karto xiga

- [Soo dhoofi barooyinka sahanka](topic:import-points) faylalkaaga.
- [Dhis oo hagaaji dusha](topic:build-surface) khadadka jebinta iyo xuduudka.
- [Shaashadda, qayb qayb](topic:workspace).
- [Furayaasha iyo mouse-ka](topic:keyboard).
