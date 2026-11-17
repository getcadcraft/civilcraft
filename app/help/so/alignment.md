---
title: Qorso jid-hagaha toosan
summary: Ka sawir jid-hagaha iyadoo lagu xidhayo PI-yada, deji radius-yada wareegga iyo station-ka bilowga, u dhaqaaq PI-yada, oo akhri xogta wareegga iyo station-ka iyo offset-ka.
keywords: jid-hagaha, ma jiro xal, wareeg ma ku habboonaan, radius ugu weyn, radius ugu yar, radius ugu yar ee la oggol yahay, xawaaraha naqshadeynta, isku dhac, centerline, pi, wareeg toosan, radius, stationing, tangent, abuur jid-hagaha, qorsha jid-hagaha, pc, pt, station offset
from: 8c5df4aa
---

Jid-hagaha ku jira CivilCraft waa silsiladda tangent-yada oo ku xiran barta isgoysyada (PI), oo leh wareeg goobo ah PI kasta oo gudaha ah oo leh radius. Waxaa lagu station-gareeyaa station bilow ah oo aad doorato. Mashruuc wuxuu hayn karaa jid-hagyo badan.

## Ka sawir jid-hagaha

1. Riix {{key:A}}, ama guji {{ui:Alignment}} kooxda **Design**.
   Calaamadda hagista ayaa sheegaysa in aad guujiso PI-yada siday u kala horreeyaan. {{key:Enter}} ama laba jeer guji ayaa dhammaysta, {{key:Backspace}} wuxuu tirtiraa kii ugu dambeeyay, {{key:Esc}} wuu joojiyaa.
2. Guji PI-ga koowaad (bilowga jid-hagaha).
3. Guji PI-yada soo socda siday u kala horreeyaan. Xariiq cas ayaa raacda mu'ashirka oo muujinaysa dhererka iyo jihada tangent-ka aad sawirayso, tusaale ahaan "212.40 ft  N 63°12'05" E".
4. Guji PI-ga ugu dambeeya (dhammaadka jid-hagaha).
5. Riix {{key:Enter}}.
   Jid-hagaha waa la sawiray oo leh station-yada, waana la doortay. Bar-xaaladda waxay sheegaysaa, tusaale ahaan, "Alignment 1: 386.36 ft, curves of 100 ft radius where they fit. Edit radii in Properties; Profile (R) to design its grade." (Jid-hagaha 1: 386.36 ft, wareegyo radius 100 ft ah meelaha ku habboon. Wax ka beddel radius-yada Sifooyinka; Muuqaal dherer (R) si aad u naqshadeyso heerkiisa.)

Intii aad sawirayso: {{key:Backspace}} wuxuu tirtiraa PI-ga ugu dambeeya, {{key:Esc}} wuu joojiyaa, jiidista meel bannaan ayaa keliya dhaqaajisa muuqaalka iyada oo aan PI lagu darin.

:::warning
Dhammaystir {{key:Enter}}. Laba jeer guji ayaa sidoo kale dhammaysta, laakiin dhismahan wuxuu tirtiraa PI-ga aad laba jeer ku gujisay. Guji PI-ga ugu dambeeya hal mar, ka dibna riix {{key:Enter}}.
:::

PI kasta oo gudaha ah wuxuu helaa wareeg 100 ft ah (30 m mashruuca mitirka), ama radius-ka ugu weyn ee tiro dhan ee ku habboon badh tangent kasta haddii 100 ft aanu ku habboonayn. PI-yada aad u foorar ama toos ah ma helaan wareeg.

## Deji radius-yada iyo isku-xirka

Marka jid-hagaha la doortay, dhinaca midig wuxuu muujinayaa **Jid-hagaha**:

1. **Magaca** iyo **Station-ka bilowga**. Station-ka qor sida `10+00` (feet) ama `0+500` (mitir), ama lambar caadi ah. Eeg [Halbeegyada, stationyada iyo qaabka lambarada](topic:units-and-stations).
2. **Dherer** iyo **Station-ka dhammaadka** waa la xisaabiyay adiga oo aan qorin.
3. Miiska **PIs** wuxuu liistaa **Easting** iyo **Northing** PI kasta, iyo **Radius** PI kasta oo gudaha ah. Qor qiime cusub oo riix {{key:Enter}}.
   - Radius 0 wuxuu sameeyaa barta xagasha oo aan wareeg lahayn.
   - PI-ga koowaad iyo kii ugu dambeeyay mar waligood ma lahaan radius.
   - Calaamadda x ee yar ee dhamaadka safka ayaa tirtirta PI-gaas (jid-hagaha wuxuu haysaa ugu yaraan laba PI).
4. Akhri liiska **Curves**: wareeg kasta, station-yada PC iyo PT, radius R, deflection Δ iyo jihadda (bidix ama midig), dhererka L, tangent T, masaafada dibadda E iyo chord.
5. Xariiqa hoosta wareegyada wuxuu bixiyaa jihada (bearing) tangent-ka koowaad.

## Marka wareeg aanu ku habboonayn

Haddii wareegyadu u baahan yihiin tangent ka badan kan u dhexeeya PI-yadooda, jid-hagaha ma leh xal: lama sawirin si sax ah ilaa aad hagaajiso, waana laga saaraa dhoofinta LandXML. Sanduuq cas ayaa sababta ku sheegta lambarro, wuxuuna soo jeedinayaa waxa ku habboon:

- Wareegyada PI 2 iyo PI 3 waxay u baahan yihiin 240.00 ft oo tangent ah dhexdooda (130.00 + 110.00), laakiin PI-yadu waxay ka fog yihiin 180.00 ft. Haddii mid kaliya uu leeyahay wareeg, fariintu waxay tahay wareegga PI 2 wuxuu u baahan yahay 240.00 ft oo tangent ah dhinaca PI 1.
- Badhan kasta oo PI ah wuxuu dejiyaa **radius-ka ugu weyn ee ku habboon** meeshaas, iyada oo wareegga kale sida uu yahay loo ilaaliyo (waxayna sidoo kale u baahan tahay inuu ku habboonaado tangent-ka kale ee PI-ga). Halka labada PI ay leeyihiin wareeg, **Labaduba** wuxuu labadooda radius-kooda ku yareeyaa isbarbardhig ahaan si ay u kulmaan.
- Marka wareeg keliya uu ka dheer yahay tangent-ka, sanduuqu wuxuu sheegayaa in ma jiro wareeg PI kale oo ku habboonaan kara inta uu yahay weyn sidaas.
- PI oo si toos ah dib ugu jeesta ma qaadan karo wareeg; sanduuqu wuxuu soo jeedinayaa **No curve at PI n** (Ma jiro wareeg PI n).

Badhan kasta waa hal tallaabo: {{key:Mod+Z}} wuxuu soo celinayaa radius-yadii hore. Radius-yada la soo jeediyay waxaa lagu wareejiyaa 0.01 hoose si ay had iyo jeer ku habboonaadaan.

### Radius naqshadeyn oo ugu yar

Qor **Design minimum radius** (tusaale ahaan ka xisaabi xawaaraha naqshadeynta) si wareeg kasta loo hubiyo; ka tag madhan haddii aadan doonayn. Wareeg ka hooseeya ayaa la liisanayaa badhan **radius-ka ugu yar ee buuxinaya ugu yarta**, marka radius-kaasi ku habboon yahay. Marka aanu ku habboonayn, sanduuqu wuu sheegaa oo wuxuu siinayaa radius-ka ugu weyn ee tangent-yadu oggol yihiin, si aad u ogaato inaad u dhaqaaqdo PI ama aad hoosaysiiso ugu yarta.

## Dhaqaaq PI-yada qorshaha

1. Marka {{ui:Select}} la shido, guji jid-hagaha si aad u doorato. Gacmo-qabasho afar-geesle ah ayaa ka soo muuqata PI-yadiisa.
2. Jiid gacmo-qabashada. Jid-hagaha, stationing-keeda, muuqaalka dherer iyo corridor-ka way raacaan.
3. Sii daa. Dhaqdhaqaaqa waa hal tallaabo oo ka noqon karta.

Hadda ma suurtogasho inaad ku darto PI ka dhex jirta laba jira: tirtir jid-hagaha oo mar kale sawir, ama qor isku-xirka cusub ee PI-yada aad haysid.

## Akhri station iyo offset

Mu'ashirka dul mari qorshaha. Bar-xaaladdu wuxuu muujinayaa jid-hagaha ugu dhow (ama kan la doortay) oo leh station-ka iyo offset-ka, **L** ama **R** marka la eego station-ka hore, tusaale ahaan "Alignment 1: Sta 2+15.30, offset 18.42 R". Dhinac kasta oo ka baxsan dhammaadka, waxay ku darta "(beyond the end)" (ka baxsan dhammaadka).

## Waxa la sawiray

Qorshaha, DXF iyo PDF: centerline-ka (tangent-yada sida xariiqyo, wareegyada sida qaansooyin dhab ah), calaamad kasta 50 ft (20 m) oo calaamad dheer leh iyo sumad station ah kasta 100 unit, iyo calaamadaha PC iyo PT oo lagu sumeeyay station-kooda.

## Tirtir jid-hagaha

Dooro oo riix {{key:Delete}}, ama guji {{ui:Delete}} qalabka ama hoosta dhinaca midig. Muuqaalkiisa iyo corridor-kiisa way raacaan. {{key:Mod+Z}} ayaa soo celinaya.

:::mac
Kiiboodhka Mac-ka, furaha lagu sheegay **delete** waa {{key:Backspace}} brawsarka dhexdiisa, oo ma tirtirto wax la doortay. Riix {{key:Delete}} (Fn iyo delete), ama isticmaal badhanka {{ui:Delete}}.
:::

## Xiga

- [Naqshadee muuqaal dherer toosan](topic:profile).
## Xawaaraha naqshadeynta iyo fasalka

Hoosta Sifooyinka jid-hagaha, **Design speed** (km/h ama mph) iyo **Design class** waxay la socdaan jid-hagaha, waxaana lagu kaydiyaa mashruuca, waxaana lagu qoraa IFC (Pset_RoadDesignCriteriaCommon). CivilCraft ma leh miis xidhiidhinaysa xawaare iyo radius ugu yar, markaa waxba lagama hubinayo iyaga: deji **Minimum radius** iyadoo laga raacayo heerkaaga naqshadeynta.

## Spiraalyo

Wareeg wuxuu leeyahay spiraal clothoid ah oo ku yaal labada dhinac: tangent, spiraal, wareeg, spiraal, tangent. Miiska PI, qor dherer ku jira **Spiral in** iyo **Spiral out** PI-ga leh radius. PI-gu meeshiisa ayuu ku sii jiraa; wareegga ayaa u soo dhowaada si uu meel u sameeyo, sidaas darteed masaafada tangent-ka ayaa kordhaysa offset-ka spiraalka. Labada dherer way kala duwan yihiin karaan; PI-ga leh hal dherer oo keliya wuxuu helaa spiraal dhinaca keliya.

Liiska wareegga markaas wuxuu akhrinayaa TS, SC, CS iyo ST (tangent ilaa spiraal, spiraal ilaa wareeg, wareeg ilaa spiraal, spiraal ilaa tangent) oo leh xagasha spiraalka θs, masaafooyinka tangent-ka iyo masaafada dibadda. Stations-ka waxay socdaan dhinacyada spiraalyada sida meelkasta kale. Spiraalyada oo wadar ahaan leh xagal ka weyn tan wareegga waa la diidaa, iyada oo PI-ga la magacaabo; spiraal ka dheer tangent-ka oo ay u oggolaatay waa isku dhac, sida wareeg kasta. Superelevation wuxuu isticmaalaa spiraalka sida runoff-kiisa (eeg [Corridor](topic:corridor)).
