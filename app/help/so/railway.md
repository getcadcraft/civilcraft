---
title: Naqshadaynta waddada tareenka
summary: Ka dhig jid-hagaha waddo tareen: isbedelka dhamaadka (kolotoid, parabolad saddex-geesood, Bloss, Helmert, nuska-mawjadka sine, sine), kaadhka qalooca kasta oo leh kaadhkeeda isla-miisaanka, dhaawaca iyo xadka, xadadka qaabka waddada oo digniin ah, shaqaaqyada iyo isgoysyada saldhigyada, muuqaal ballaaran oo tareenka ku dhex socda, iyo waddo leh rails, sleepers iyo sariir ballast oo loo dhisay sida koridor, qorshe, goyn, qorshe-dhererka, 3D iyo tirooyinka.
keywords: tareen, rail, railroad, waddo, qatar, metro, tram, kaadh, superelevation, dhaawaca kaadhka, kaadh xad-dhaaf ah, kaadh isla-miisaan, isbedel, isbedelka dhamaadka, kolotoid, parabolad saddex-geesood, bloss, helmert, nuska-mawjadka sine, cosine, balac, balaca caadiga ah, balaca ballaaran, balaca mitir, balaca yar, sleeper, tie, crosstie, ballast, sub-ballast, formation, cess, masaafada waddooyinka, 60E1, 54E1, UIC60, 115RE, 136RE, gradient kaadhka, xawaaraha isbedelka kaadhka, shaqaaq, lambarka shaqaaqa, frog, lambarka frog, lead, khadka xidhitaanka, xawaaraha kala firdhiska, cilad, cilad-koobaad, koobaadka cilada, balaca dhismaha, balaca culeyska, kinematic envelope, saldhig, balaca saldhigga, masaafada waddooyinka, gradient, vertical curve, radius ugu yar, LandXML cant
from: 99de9745
---

Jid-hagaha kasta wuxuu noqon karaa waddo tareen. Markaas qalooca wuxuu helaa isbedelo tareen iyo kaadh (kor-u-kaca rails-ka), koridorkiisana waxaa loo dhisaa sida waddo: rails oo ku taal sleepers, oo ku taal sariir ballast, oo lagu dhejiyay dhulka sida waddo. Shaqaaqyada iyo isgoysyada waxaa lagu daraa saldhigyada, waxaana la rari karaa muuqaal xad ah oo jid-hagaha ku dhex socda, kana hubi karaa waxa ku taagan dhinaca waddada.

Tirooyinka hoose oo dhan waa **meel-hayn** (placeholder), ma aha heer caadi ah. Tareenadu xadadkooda waxay ku dejiyaan xawaaraha khadka, nooca waddada iyo dalka; dejinta ka soo qaado heerka tareenkaaga. CivilCraft ma leh miis qaran.

## Jid-hagaha ka dhig tareen

1. Dooro jid-hagaha oo ka hel **Tareen** sifooyinka (Properties).
2. Calaamadi **Jid-hagahani waa waddo tareen**. Isbedel kasta waa hal tallaabo oo laga noqon karo.
3. Dejiso **Xawaaraha naqshadda** sifooyinka sare ee jid-hagaha: waa xawaaraha khadka oo kaadhka lagu hubiyo. **Tareennada ugu gaabsan** (qaybta Tareenka) waa xawaaraha ay kaadhka xad-dhaafka lagu hubiyo.

## Isbedelka

Qalooca kasta u dhig dherer spiral labada dhinac ee miiska PI (**Spiral in**, **Spiral out**), kadibna dooro nooceeda miiska qalooca qaybta Tareenka, ama **Isbedel qalooca kasta**:

| Nooca | Curvature-ka isbedelka dhexdiisa |
|---|---|
| Clothoid | wuxuu kordhaa si siman (sida jidka spiral-ka) |
| Parabolad saddex-geesood | y = x³ / (6·R·L), iyada oo L la cabbiray tangent-ka; qalooca laftiisa wuu ka dheer yahay yar |
| Bloss | 3u² − 2u³ ee curvature-ka oo dhan (u = qaybta dhererka): wuu bilaabaa oo wuu dhamaadaa si tartiib ah |
| Helmert | laba parabolad, 2u² ka dibna 1 − 2(1 − u)² |
| Nuska-mawjad sine | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Dhammaan marka laga reebo parabolad saddex-geesood waxay u leexdaan L / 2R, sida clothoid. Saldhigyadu waxay socdaan dhererka dhabta ah. LandXML wuxuu hayaa nooca (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Kaadhka

Qalooca kasta **Cant** qor millimitir. Miiska wuxuu muujinayaa qalooca kasta:

- **Equilibrium** cant = G·v² / (g·R), G oo ah masaafada u dhexaysa dhexdhexaadka rails-ka (**Rail centres**, balaca iyo ballaca madaxa rail-ka haddii aadan qorin). Marka G = 1500 mm, tani waa qaabka caanka ah 11.8·V² / R (V km/h, R m).
- **Deficiency** = equilibrium xawaaraha khadka − kaadhka la codsaday.
- **Excess** = kaadhka la codsaday − equilibrium xawaaraha tareennada ugu gaabsan.
- **Ramp**: gradient-ka kaadhka ugu jaban rambooyinkiisa, mm kasta mitir.

Kaadhku wuxuu kor u kacaa isbedel kasta oo ka dhex jira, wuxuuna raacaa curvature-kiisa: toos ah clothoid ama parabolad saddex-geesood, Bloss-shaped Bloss, iwm. Dhamaadka qalooca oo aan isbedel lahayn wuxuu kor u kacaa jidka ka hor, sida dheer ee xadka gradient-ka kaadhku u baahan yahay, wuxuuna sheegaa taas: markaas kaadhku wuu isbedelaa meesha curvature-ku aanu isbedelin.

**Cant turns about** wuxuu sheegaa rail-ka ku haya qorshaha naqshadda: **rail-ka hoose** (caadiga), **rail-ka gudaha**, ama **dhexdhexaadka waddada** (rail kasta wuxuu dhaqaaqaa badhka kaadhka). Qorshaha naqshaddu waa sare ee rail-ka halkaas.

**Cant diagram** wuxuu sawiraa dhererka rail kasta ka sarreeya qorshaha dhinaca saldhigyada; muuqaalka qorshaha iyo xaashiyada qorshe-dhererka waxay siiyaan isla waxaas sida bar hoose qorshaha.

## Xadadka kaadhka iyo digniinta

**Kaadhka ugu badan ee la codsaday**, **Deficiency-ga ugu badan**, **Excess-ka ugu badan**, **Gradient-ka kaadhka ugu sarreeya** iyo **Isbedelka kaadhka ugu dhakhsaha badan** (gradient-ka xawaaraha khadka, mm/s) waa la hubiyaa qalooca kasta. Qiimaha ka sarreeya xadka waa digniin qaybta Tareenka iyo guddiga Dhibaatooyinka, oo leh xadka iyo qiimaha la helay. Haddii aanu xawaaraha naqshadda lahayn, deficiency iyo isbedelka xawaaraha lama hubiyo (fiiro ayaa sheegaya).

## Waddada

Dejiso **Gauge** (balaca caadiga ah 1435 mm, ama preset-yada balaca ballaaran, mitir ama yar, ama mid kaaga), **Rail section** (60E1, 54E1, 49E1, 115RE, 136RE: cabbirradooda la daabacay oo keliya), tirada **Tracks** iyo **Track centres**, kadibna **Sleepers and ballast**: walxaha sleepers-ka, dherer, ballac, qoto-dheer iyo masaafo; qoto-dheer ballast-ka hoosta sleepers-ka (rail-ka hoose), garabka, jiifka, inta ka sarreysa sleepers-ka iyo ka hoosaysa; qoto-dheer sub-ballast-ka, cess-ka ka dhaadheer ballast toe-ka, iyo jiifka dhinacyada dhismaha.

Riix **Dhis waddada**. Waxay shaqaysaa koridorka jid-hagaha, oo loo dhisay sida waddo qorshaha naqshadda ku dhex socda: rails iyo sleepers waxay u janjeeraan kaadhka, dhismuhuna ma janjeero. Jiifka iftiinka ayaa ka bilaabmaa xadka cess-ka ee goynta iyo buuxinta koridorka, waddadu waxay ku dhex socotaa dusha la soo jeediyay sida waddo.

- **Qorshe**: labada rail ee waddo kasta (layer C-RAIL-TRAK) iyo, marka waddooyin ka badan yihiin, dhexdhexaadka waddo kasta (C-RAIL-CNTR), shaashadda, DXF, DWG, PDF iyo xaashiyada qorshe-dhererka.
- **Qaybaha**: sleepers, rails, hoosta ballast-ka iyo sub-ballast-ka qayb kasta.
- **3D**: rails, sleeper kasta iyo sariirta ballast (**Muuji** › Waddada), iyo sidoo kale GLB, OBJ iyo USD.
- **Tirooyinka**: dhererka waddada, rail (labada rail ee waddo kasta, dhex jid kasta), sleepers, sariirta ballast iyo ballast-ka ka dhimma sleepers-ka, iyo sub-ballast, iyadoo celceliska aagga dhamaadyada u dhexeeya qaybaha.

## Hubinta joomatriga waddada

Dhinaca kaadhka, qaybta Tareenka waxay hubisaa khadka laftiisa xadadka lix oo kale (dhammaantood meel-hayn, dhammaantood adiga ayaa dejinaya):

- **Gradient-ka ugu sarreeya** ee qorshaha naqshadda, mm kasta mitir.
- **Radius-ka ugu yar ee qalooca toosan**, oo ah tiro k sida R ≥ k·V² (R m, V km/h). Qalooca toosan ee dherer L oo u dhexeeya laba gradient wuxuu leeyahay radius L oo loo qaybiyay isbedelka gradient-ka.
- **Qalooca toosan ee ugu gaaban**.
- **Radius-ka qalooca ugu yar** qorshaha (0 wuxuu damiyaa hubinta).
- **Qaws ama toos ugu gaaban**, sida ilbiriqsi safarka xawaaraha khadka: qaws wareeg ah, ama toosaha u dhexeeya laba qalooc, oo ka gaaban masaafadaas waa la digayaa. 1.8 s waa "badhka xawaaraha km/h, mitir" caanka ah.
- **Isbedelka deficiency-ga kaadhka** dhererka isbedel kasta, mm/s xawaaraha khadka.

**Track geometry** wuxuu soo bandhigaa gradient-ka ugu sarreeya ee la helay iyo qalooca toosan kasta leh radius-kiisa iyo radius-ka uu xawaaraha khadka u baahan yahay. Qalooca toosan ee ku yaal isbedel ama kaadh-rambo wuxuu helaa qoraal. Haddii aanu qorshaha naqshadda ama xawaaraha naqshadda jirin, hubinta u baahan kuwaas waa la dhaafaa, fiiro ayaana sheegaya.

## Shaqaaqyada iyo isgoysyada

Hoosta **Turnouts and crossovers**, riix **Add a turnout**. Waxaa lagu dhejiyaa toosaha ugu dheer; ku dejiso miiska:

- **Switch toe station**: halka shaqaaqu ka bilaabmo jid-hagahan.
- **Frog**: tirada frog N (1:N). Xagasha frog-ka waa 2·atan(1 / 2N).
- **Side**: bidix ama midig, marka laga eego u socda saldhigga sare.
- **Crossover spacing** mitir: ka weyn 0, shaqaaqu wuxuu noqdaa isgoys waddo isbarbar socota oo masaafadaas ka fog (laba shaqaaq iyo toosaha u dhexeeya).

Miiska wuxuu muujinayaa **Lead** (switch toe ilaa frog), **Radius**-ka qalooca xidhitaanka iyo **Xawaaraha kala firdhiska** oo radiusku u oggolaado xadka deficiency-ga kaagu iyo kaadh la'aan. **Make its track** wuxuu jidka kala firdhiska u beddelaa jid-hagaha keligii (switch, qalooca xidhitaanka, ka dibna toos ah xagasha frog-ka) oo leh dejinta tareenka ee isku mid, si loo dheereyn karo.

Qorshuhu wuxuu sawiraa labada rail ee kala firdhiska ah ee shaqaaq kasta, xarriiqda dhexe, calaamad ku taal switch toe iyo frog, iyo "1:N" (layer C-RAIL-TURN), shaashadda iyo DXF, DWG, PDF iyo xaashiyada. Muuqaalka 3D wuxuu sawiraa rails-ka kala firdhiska ah heerka waddada weyn.

Qaabku waa **meel-hayn**: shaqaaq toosan iyo hal qalooc xidhitaan oo ka soo kacda tirada frog. Shaqaaq la dhisay waxay raacaa heerka tareenka iyo sawirka soo saaraha. Digniinaha: shaqaaq ka baxa jid-hagaha, ku yaal qalooc, isbedel, kaadh ama qalooca toosan, ama isku dhaafa kan kale; iyo fiiro marka xawaaraha khadku ka sarreeyo xawaaraha kala firdhiskiisa.

## Envelope-ka beerta

Calaamadi **Sweep a clearance envelope along this track**. Dooro **Outline** (laba qaab meel-hayn, ama **Your own outline** oo lagu qoro hal barta mid kasta: fogaanshaha dhexdhexaadka waddada, ka dibna dherer ka sarreeya saldhigga rail-ka sare, mitir), **Vehicle length** iyo **Bogie centres**, iyo, haddii uu jiro, **Platform edge** (dhinaca, masaafada dhexdhexaadka, dherer ka sarreeya rail-ka).

Saldhig kasta, outline-ka waa la janjeeyaa kaadhka oo ku wareegaya rail-ka hoose, waana la ballaariyaa qalooca: badhka dhexe ee gaadhiga wuxuu u dhaqaaqaa gudaha b² / 8R, dhamaadyadiisuna dibadda (L² − b²) / 8R (b waa bogie centres, L dherer gaadhiga, R radius-ka meesha, oo raacaa isbedelka).

Qaybtu wuxuu sawiraa qaybta toosan iyo meesha ugu ballaaran, wuxuuna liistaa:

- **envelope-ka ugu ballaaran** iyo meesha,
- **dhexdhexaadka waddooyinka** oo la barbardhigay dhexdhexaadka laba envelope oo deriska ah u baahan yihiin,
- **meesha ka hadhay xaddiga madbaxa**, ama sida uu u galay gudaha,
- **khad kasta oo muuqaal, tuubo iyo jid-hagaha tareen kale** oo ku jira **gudaha envelope-ka**.

Khadka muuqaalka leh sare-dhaadheerka waa la xukumaa outline-ka heerkiisa ka sarreeya rail-ka; haddii aanu qorshaha naqshadda jirin, ama barta aanay sare-dhaadheer lahayn, waa la xukumaa qorshaha oo keliya, liistuna way sheegtaa. Qorshuhu wuxuu muujinayaa labada geesood ee envelope-ka (layer C-RAIL-CLRN) oo leh calaamad xagga shay kasta oo ku jira.

Outline-yada la siiyo waa **meel-hayn**, ma aha balaca tareen kasta. Ku qor balaca dhismaha tareenkaaga ka hor intaadan ku tiirsanaan natiijada.

## Barnaamijyada kale

- **LandXML**: jid-hagaha tareenka waxaa loo qoraa isbedelkiisa (spiType) iyo block `Cant`: balaca, barta jeedsashada, xawaaraha khadka, iyo saldhig kasta oo kaadh-rambo uu ka bilaabmo iyo ku dhammaado, leh kaadhka la codsaday, kaadhka isla-miisaanka iyo deficiency. Furitaanka faylka LandXML oo leh block `Cant` wuxuu jid-hagaha ka dhigaa tareen leh kaadhadaas.
- **IFC**: jid-hagaha oo leh qaybaha kaadhka, rails, sleepers, ballast iyo sub-ballast.

## Wali lama dhisin

Shaqaaqyada IFC export-ka, qoysaska shaqaaqyada ka baxsan qalooca xidhitaanka kaliya (shaqaaqyada gooni ah, frog-yada swing-nose, slips, diamonds), xeerarka balaca kinematic (envelope-ku waa outline go'an oo leh curve throw), xariiqyada xagga sare ah iyo signalling.

**Heerka la tixraaco.** Qaybta Tareenka, "Standard to cite" wuxuu qaadan karaa None ama European (UIC iyo EN). Dooro European waxay magacaabaa dokumentiyada mashruuca Yurub ay tixraacaan (EN 13803 cabbirrada jid-hagaha, EN 13232 shaqaaqyada iyo isgoysyada, EN 15273 balacyada, EN 13848 tayada joomatriga waddada), oo xad kasta wuxuu leeyahay sanduuq loo qoro qodobka uu ka yimid. Ma jiro tiro ka timid heer kasta oo lagu dhex jiro: kaadhka, deficiency-ga, excess-ka, gradient-ka iyo xadadka isbedelka, joomatriga shaqaaqa iyo balaca dhismaha wali waa meel-hayn, daaqaddu way sheegtaa. Injineer tareen ayaa hubiya qiime kasta qoraalka heerkiisa, oo ku qora qodobka ag dhinaceeda, ka hor intaan wax la dhisin. Koonfur Afrika iyo miisaska AREMA **kuma jiraan** sii-deyntan.
