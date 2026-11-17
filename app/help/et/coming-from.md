---
title: Tulek muust tsiviiltarkvarast
summary: Kuidas tuttavad tsiviiltööde töövood vastavad CivilCraftile ja erinevused, mis panevad kogenud kasutajad esimese tunni jooksul komistama.
keywords: üleminek, migreerimine, tuttav, erinevused, töövoog, käsud, vastendamine, cogo, koridor, planeerimine, torustik, stiilid, käsurida
from: feae37d6
---

Kui oled kasutanud Civil 3D-d, tunned juba CivilCrafti mõtteid: punktid ja punktirühmad, TIN-pinnad koos murdejoonte ja piiridega, trassid PI kaupa, profiilid PVI kaupa, koostud, mis pühitakse koridoriks, planeerimine päevavalguseni ja gravitatsioonilised torustikud, LandXML. Erinev on peaaegu kõik nende ümber: joonisfaili pole, käsurida pole (kui ei vali menüüstiili {{ui:Klassikaline joonestus}}), stiile pole, Prospectorit pole ega sätete dialooge. CivilCraft on väike ja kitsas tööriist brauseris ning selles versioonis teeb ta murdosa sellest, mida täielik tsiviilpakett. See leht seob sinu teadmised sellega, mis siin on.

:::tip
Kui meeldib Civil 3D lint, vali menüüstiil {{ui:Tsiviiltööde riba}} rubriigis {{ui:Sätted}} › {{ui:CivilCraft}} › {{ui:Menüüd, klahvid ja hiir}}: vahelehed Avaleht, Pinnad, Muuda, Geolokatsioon, Vaade ja Väljund, keskmine nupp nihutab vaadet ning {{key:Shift}} koos keskmise nupuga pöörleb 3D-vaadet. Kui sisestad käske, lisab {{ui:Klassikaline joonestus}} käsurea (ALIGNMENT, PAD, PROFILE, ZOOM …). Vaata [Menüüd, klahvid ja hiir](topic:menus-keys-and-mouse).
:::

## Töövoo kaart

| Mida soovid teha | Tuttav viis | CivilCraftis |
|---|---|---|
| Mõõdistuspunktide sisseviimine | Punktide import punktifailivormingus | {{ui:Ava}}, siis kontrolli veergude järjekorda jaotises **Impordi punktid** ([Impordi mõõdistuspunkte](topic:import-points)) |
| Punktide sortimine | Punktirühmad, kirjelduse võtmed | Automaatsed rühmad kirjelduse esimese sõna järgi; kirjelduse võtmeid pole |
| Punkti muutmine | Punktiredaktor, käepidemed | Klõpsa sellel ja sisesta atribuutides või lohista ([Muuda mõõdistuspunkti](topic:edit-points)) |
| Olemasoleva maapinna koostamine | Pinna loomine, punktirühmade lisamine andmetena | Automaatne: pind koostatakse uuesti alati, kui sisendid muutuvad |
| Murdejoonte lisamine | Murdejoonte lisamine murdjoontest või tunnusjoontest | Sea punktirühm väärtusele {{ui:Murdejoon}} või klõpsa punkte tööriistaga {{ui:Murdejoon}} ({{key:B}}) |
| Pinna lõikamine | Väline piir, varjatud piir, maksimaalne kolmnurga pikkus | {{ui:Piirjoon}} ({{key:O}}, ainult väline) ja **Pikima välisserva pikkus** |
| Kontuuride kuvamine | Pinnastiil | **Kuva** vasakpoolses paneelis: intervall, põhiintervall, sildid, ribad, kalde nooled |
| Telgjoone koostamine | Trassi loomise tööriistad, kõvera ja spiraali sätted | {{ui:Trass}} ({{key:A}}): klõpsa PI-d, {{key:Enter}}; raadiused ja spiraalide pikkused PI-tabelis |
| Profiilivaate loomine | Profiilivaate nõustaja, ribad | {{ui:Pikiprofiil}} ({{key:R}}): üks profiilivaade plaani all, alati sobitatud |
| Kalde kujundamine | Profiili paigutamise tööriistad | {{ui:Alusta maapinnast}}, {{ui:Lisa PVI-d}} ({{key:I}}), lohista PVI-sid, sisesta **Kõvera L** |
| Tee ehitamine | Koost, alamkoostud, koridor, sihtmärgid, piirkonnad | Märgi trassi all **Pühi koost mööda projekteerimisprofiili**; igal pool sõidurada, ääris ja külgnõlv või iga külg osadest (kraav, äärekivi, kõnnitee …) |
| Planeeri plats | Tunnusjooned, planeerimisrühmad, planeerimiskriteeriumid | {{ui:Plats}} ({{key:G}}): tasane plats väljakaevamise ja pealekande kallakutega päevavalguseni |
| Mullatööde arvutamine | Mahupinnad, mahunäidikud | **Mullatööd** parempoolses paneelis, ruudustikumeetod, uueneb kohe |
| Sademe- või kanalisatsioonitorustiku koostamine | Torustik osade loendi ja reeglitega | {{ui:Torud}} ({{key:P}}): klõpsa rajatistel allavoolu; kolm reeglit, mille sina määrad; automaatsed sisepõhjad |
| Vahetus teistega | LandXML-i import ja eksport | {{ui:Ava}} LandXML-fail; {{ui:LandXML}} eksportimiseks ([Vaheta LandXML-i](topic:landxml)) |
| Joonte saatmine CAD-i | Eksport DWG-sse | {{ui:DWG}} (2000 kuni 2018 vorming) või {{ui:DXF}} (R12) |
| Plotimine | Paigutused, vaateaknad, lehekomplektid | {{ui:PDF}}: üks rõhtne plaanileht valitud mõõtkavas; plaani- ja profiililehed ning lõikelehed PDF-ina |
| Töö jagamine failide vahel | Andmelühendid, viited | Pole saadaval: üks projekt faili kohta |
| Tagasivõtmine | Võta tagasi | {{key:Mod+Z}} ja {{key:Mod+Y}}, 200 sammu; kuvaseaded ei ole tagasivõetavad sammud |

## Erinevused, mis panevad inimesi komistama

**Käsurida pole**, kui ei vali menüüstiili {{ui:Klassikaline joonestus}}. Tööriistad on tööriistariba nupud ja üksikud tähed: {{key:A}} trass, {{key:G}} plats, {{key:P}} torud, {{key:B}} murdejoon, {{key:O}} piirjoon, {{key:R}} profiil, {{key:I}} lisa PVI-d, {{key:V}} vali, {{key:F}} sobita. Teistes menüüstiilides käsu nime sisestamine ei tee midagi. Vaata [Klahvid ja hiir](topic:keyboard).

**Enter lõpetab; topeltklõps on riskantne.** Klõpsa viimasel punktil üks kord ja vajuta seejärel {{key:Enter}}. Selles versioonis lõpetab topeltklõps ka, kuid eemaldab topeltklõpsatud punkti. Parem klõps ei lõpeta ega korda; see ainult nihutab vaadet, kui lohistad sellega.

**Kõik on pidevalt dünaamiline.** Muuda punktirühma, raadiust, PVI-d või platsi kallet ja pind, kontuurid, koridor, päevavalguse jooned ja mahud uuenevad kohe. Midagi pole koostada ega vananenud.

**Miski pole joonisobjekt.** Plaan on vaade projekteerimisele, mitte joonis, mida saaksid muuta CAD-käskudega. Sa ei saa lisada oma jooni ega teksti, muuta kihi värvi ega miski osadeks jaotada. Ekspordi DXF-i ja lõpeta joonis CAD-programmis.

**Stiile pole.** Värvid, joonelaiused, sildisuurused ja kihinimed on fikseeritud (vt [Plaani kihid](topic:plan-layers)). Rakenduse ribal Paper ja Model vahetavad heleda ja tumeda ekraani vahel.

**Igast ühe.** Üks olemasolev maapinna pind, üks planeeritud tulemus, üks torustik projekti kohta. Palju trasse ja platse on lubatud.

**Ühikud on ainult sildid.** Valiku {{ui:US feet}} või {{ui:Metres}} ei teisenda midagi. Joonismõõtkava pole. Koordinaatsüsteem on valikuline: sea see {{ui:Coordinates}} all ja midagi ei liigu, see ütleb ainult, mida numbrid tähendavad (vt [Projekti koordinaatsüsteemi seadmine](topic:coordinate-systems)). Jalgu käsitletakse LandXML-i kirjutamisel USA mõõdistusjalgadena.

**Murdejoonte rühmad liituvad punktinumbri järjekorras.** Rühm, mis on seatud {{ui:Murdejoon}}-iks, muutub üheks joonteks läbi kõigi oma punktide numbrijärjekorras. Jagatud koodid (kaks voolujoont koodiga „FL“) teevad ühe siksakilise joone; joonista need käsitsi.

**Pikketid näevad sama välja, meetrid erinevad.** Jalgadel on 100 ft pikketid (12+34.56); meetritel 1000 m pikketid (1+234.567).

**Kustutamine Macis.** Mac-klahv märgistusega delete on brauseris Backspace. Kasuta Fn ja delete või nuppu {{ui:Kustuta}}, et kustutada valik.

**Failid on allalaadimised.** {{ui:Salvesta}} laeb iga kord alla `.civilcraft.json`-faili; salvestamist olemasolevale avatud failile pole. Taastamiskoopia salvestamata tööst hoitakse selles brauseris ([Taasta salvestamata töö](common:recover)). Punktifaili avamine asendab punktid küsimata. Vt [Failid, mida saad avada, salvestada ja eksportida](topic:files).

**Reeglid on sinu.** Torustiku reeglid ja koridori koost algavad kohahoidjate väärtustega, mis pole standard. Sea oma enne, kui usaldad mõnda kontrolli.

**Mahud on ruudustikupõhised.** Väljakaevamine ja pealekanne tulevad peenest ruudustikust kahe pinna vahel, päevavalguse joonte sees, ilma paisumise ja kahanemiseta. Need on TIN-TIN mahule lähedal, kuid mitte samad.

## Mida veel pole

Klotoidist erinevad spiraalid, teedel muutuvad koostud, kaldega platsid, sissevoolu ja hoidmise võimsus, detailide kataloogid, torud profiilis, krundi paigutused ja krundi suuruse määramine, vähimruutude korrigeerimine ja mõõdistusandmebaasid, DWG avamine ning muu. Täielik nimekiri koos sellega, mida praegu selle asemel teha, on [Veel pole valmis](topic:not-built-yet).
