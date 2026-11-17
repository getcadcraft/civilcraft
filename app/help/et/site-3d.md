---
title: Ala vaatamine 3D-s
summary: Ava 3D-vaade, liigu ringi, sea ruum ja värvid, vali, mis näidatakse, ning klõpsa trasse, platse, joonelemente, murdejooni, torusid, rajatisi ja punkte, et neid valida.
keywords: sildid, 3D-sildid, sildid kaamera poole, jaamasildid, kontuurisildid, punktisildid, kattuvus, õhufoto, kaardikihid pinnal, 3D, kolmemõõtmeline, 3D-vaade, vaatekuup, kompass, orbiit, perspektiiv, paralleelprojektsioon, isomeetriline, iso, vertikaalne liialdus, maastik, mudel, alamudel, ümber sõitmine, visualiseerimine, renderdamine, torud 3D-s, rajatised, kaevud, koridor 3D-s, tee 3D-s, teepind, sõidurajad, äärekivid, kõnniteed, taimed 3D-s, puud 3D-s, põõsad, hekid, haljastus 3D-s, rambid 3D-s, trepid, müürid, sillutis 3D-s
from: a16bafe1
---

3D-vaade näitab ala ühe mudelina: olemasolev maapind ja profileeritud pind, neile kantud kontuurid, murdejooned ja pinna serv, iga trass oma projekteerimisprofiilil koos pikettide märkidega, koridori joonelemendid ja tee ise (sõidurajad, õlaalad, kraavid, äärekivid, ribad ja kõnniteed omal värvil), platsid koos nõlvajoontega, torustik torude ja rajatistega oma tegelikel kõrgustel ning haljastuse tööruumist taimed, sillutis, rajad, müürid, äärekivid, rambid ja trepid. See loeb sama projekti mis plaan, nii et iga muudatus on mõlemas näha.

## Ava 3D-vaade

1. Ava mõõdistuspunktid (või LandXML- või projektifail), et oleks pind. Taimed, sillutis või rambid üksi piisavad samuti selle avamiseks.
2. Vajuta {{key:D}} või klõpsa tööriistariba jaotises {{ui:View}} nuppu {{ui:3D}}.
   3D-vaade avaneb plaani peale ja vaatab kogu ala kagust. Esimesel korral laadimine võtab hetke.
3. Vajuta {{key:D}} uuesti või klõpsa {{ui:3D}} uuesti, et naasta plaanile. Joonistamise tööriista, nagu {{ui:Alignment}} või {{ui:Pad}}, valimine viib samuti plaanile, sest joonistamine toimub seal.

## Liikumine

| Eesmärk | Tee nii |
|---|---|
| Orbiit | Lohista vasaku või keskmise nupuga |
| Panoraam | Lohista parema nupuga või {{key:Shift}} ja lohista |
| Suum | Keeruta ratast; suumib kursori suunas |
| Orbiit puuteplaadil | Pühi kahe sõrmega ({{key:Shift}} ja pühkimine panoraamib) |
| Suum puuteplaadil | Pigista |
| Puuteekraan | Üks sõrm orbiteerib; kaks sõrme pigistavad suumimiseks ja liiguvad panoraamimiseks |
| Klahvid (vaade on fookuses) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbiteerivad, koos {{key:Shift}}-ga panoraamivad; {{key:Plus}} ja {{key:Minus}} suumivad |

Vaate riba sisaldab ülejäänut:

- Vaadete loend: **Iso**, **Ülalt**, **Alt**, **Eest** (põhja poole vaadates), **Taha**, **Vasakult** ja **Paremalt**.
- {{ui:Perspective}}: vajutatuna on perspektiivvaade; klõpsa, et lülituda paralleelprojektsioonile (ilma lühendamiseta).
- {{ui:Extents}}: näitab kõike uuesti. {{key:F}} teeb sama, kui 3D-vaade on avatud.

## Vaatekuup

Vaatekuup paremas ülanurgas pöörleb koos vaatega. Klõpsa küljel, servas või nurgas, et vaadata ala sealt (kaamera pöördub sujuvalt, kui su süsteem ei nõua vähendatud liikumist). Lohista kuupi, et orbiteerida. Selle all olev kompassirõngas näitab põhja (võrgu põhja, +Y): lohista rõngast, et pöörata ala ümber vertikaali, või klõpsa N, E, S või W, et vaadata sellelt küljelt. {{ui:Home}}, väike maja selle vasakus ülanurgas, viib tagasi kogu ala isovaatesse. Klaviatuuriga: {{key:Tab}} viib kuubini, nooled valivad külje, serva või nurga ning {{key:Enter}} vaatab sealt.

Plaanil näitab sama kuup ülaosa. Klõpsa mis tahes teisel küljel, servas või nurgas (või lohista seda), et avada 3D-vaade sealt vaadates: see on kiireim tee 3D-sse antud suunast. Kuubi asendamiseks väikese teljeikooniga või peitmiseks vt [CivilCraft'i sätted](topic:settings) jaotist **Nurgaindikaator**.

## Vertikaalne liialdus

Ala on tavaliselt palju laiem kui kõrge, seega venitatakse kõrgusi algul **2×**-ga. Vali **1×**, **2×**, **3×**, **5×** või **10×** ribal olevast loendist või [CivilCraft'i sätete](topic:settings) jaotisest **3D vertikaalne liialdus** (need on üks ja sama säte). Muutub ainult vaade: mahud, profiilid ja eksport jäävad tõelisse mõõtkavasse.

## Värvi pinnad

- **Kõrgusvööndid**: samad vööndid ja värvid kui plaani kõrgusvööndid (vööndite arv määratakse vasakpoolses paneelis jaotises **Kuva**). Iga vööndi serv lõigatakse täpselt oma kõrgusel.
- **Üks värv**: olemasolev maapind ja profileeritud pind kumbki ühe lihtsa värviga.
- **Kaardikihid**: plaani all näidatud kaardikihid (georefereeritud pilt, kaardiruudud või kaardiserver; vt [Kaardikihid](topic:map-layers)) asetatakse pindadele nagu leht, nii et õhufoto paistab mäel. Veel saabuvad pildid täidetakse järk-järgult. Kui ükski kaardikiht pole näidatud, säilitavad pinnad oma kõrgusvööndid ja vaade ütleb seda. Pilt on ainult ekraani jaoks: GLB- ja OBJ-eksport seda ei sisalda.

Kui mõlemad pinnad on näidatud, on olemasolev maapind profileeritud pinna kohal läbipaistev, nii et näed kaevamist (maapind projekti kohal) ja täidet.

## Vali, mis näidatakse

Klõpsa ribal {{ui:Show}} ja märgi või eemalda märkeruut:

| Üksus | Mis see on |
|---|---|
| Olemasolev maapind | Mõõdistuspunktidest ehitatud pind (või loetud LandXML-ist) |
| Profileeritud pind | Olemasolev maapind koos koridoride ja platsidega profileeritud (ainult siis, kui neid on) |
| Kolmnurkade servad | Iga TIN-serv joontena |
| Kontuurid | Iga näidatud pinna peen- ja põhikontuurid plaani intervalliga |
| Pinna serv | Iga näidatud pinna välisserv tema kõrgustel |
| Murdejooned | Iga murdejoon tema kõrgustel |
| Trassid ja pikettid | Iga trass oma projekteerimisprofiilil (maapinnal, kui profiili pole), märkidega iga 50 ft või 20 m tagant |
| Koridori joonelemendid | Kattekihi serv, õlaala ja nõlvajoon mõlemal pool |
| Teepinnad | Tee, mille iga koridor ehitab oma koostest: sõidurajad, õlaalad, kraavid, äärekivid, ribad ja kõnniteed, igaüks oma värviga, profileeritud pinnal |
| Taimed | Iga taim ning peenardes ja hekkides olevad taimed lihtsate kujunditena, mille suurus tuleb taimenimekirjast: puu on tüvi ja ümmargune võra (okaspuul koonus, kõrgel tüvel palmil tupp), põõsad, hekitaimed, mitmeaastsed taimed ja maakattetaimed on kuplid, rohud tuustid ja ronitaimed õhukesed sambad. Need seisavad profileeritud pinnal (või olemasoleval maapinnal) suuruses, mida plaan näitab: täiskasvanud või istutamisel |
| Kõvakate | Sillutis ja rajad koos oma langustega, müürid, äärekivid, trepid ning rambid, mis tõusevad lõikudena tasaste platvormide vahel |
| Platsid ja nõlvajooned | Iga platsi piirjoon tema kõrgusel ja tema nõlvajoon |
| Torud ja rajatised | Torud ümmargustena nende põhjadevahel, rajatised servast settekaevuni |
| Mõõdistuspunktid | Punkt igal punktil koos kõrgusega (algul väljas) |
| GIS-kihid | Plaanil näidatud GIS-kihid nende värvides: jooned ja piirjooned oma kõrgustel, teised laotud olemasolevale maapinnale (järgivad seda täpselt); punktid väikeste ristidena. Pinnalt väljas olevad kujundid ilma kõrgusteta jäetakse välja ja vaade ütleb, mitu neid on |
| Sildid | Nimed ja väärtused, mis on alati sinu poole: iga trassi nimi tema alguses ja pikettid iga 100 ft (või 100 m) tagant, iga põhikontuuri kõrgus, platsid, joonelemendid ja rajatised nime järgi ning kui **Mõõdistuspunktid** on märgitud, siis iga punkti number ja kõrgus |

Sildid jäävad alati samaks suuruseks ja püsti, olenemata sellest, kuidas pöörad või suumid, ning ees olev mägi peidab sildi. Kui need hakkaksid kokku jooksma, näidatakse kõige tähtsamaid ja ülejäänud ootavad, kuni suumid sisse: esimesena trassid, siis rajatised, platsid, joonelemendid, pikettid, kontuurid ja punktid, lähemad enne. Need on ainult ekraanil; eksport ja väljatrükid neid ei sisalda.

Sinu valikud, liialdus ja värvimine jäävad selle brauseri mällu.

Tee ehitatakse olemasolevale maapinnale. Trassi ja koridoriga, kuid ilma mõõdistuspunktide või pinnata joonistatakse tee lamedale ajutisele maapinnale: profiili keskmisel kõrgusel või tasasena kõrgusel 0, kui profiili pole. Hoiatus 3D-vaate all ja koridori omadustes ütleb seda. See on ainult pilt: sellest ei tule mahte ega lõikeid. Ava mõõdistuspunktid või pind ja tee liigub ise päris maapinnale.

Taimed, sillutis ja rambid on lihtsad kujundid, mitte detailsed mudelid: tuhanded neist jäävad kiiresti pööratavaks ja suumitavaks. Vertikaalne liialdus venitab maapinda, mitte taimi: need seisavad liialdatud maapinnal oma tegeliku kõrguse ja laiusega, nii et puu näeb igal seadistusel välja nagu puu.

## Torud ja rajatised

- Toru joonistatakse nii, et tema põhi on sisemiselt sinu määratud põhjade (inverts) juures ja ülemine (kroon) üks sisediameeter kõrgemal. Diameetrid on tollides jala-projektis ja millimeetrites meetri-projektis, nagu parempoolses paneelis.
- Rajatis ulatub oma servast (sisestatud või maapinnast) alla settekaevuni (madalaim põhi miinus settekaevu sügavus). Ilma ühegi põhjata joonistatakse see 5 ft (1.5 m) sügavusena.
- Torud ja rajatised, millel on probleem (vt võrgukontrolli parempoolses paneelis), joonistatakse punasena.
- Toru ilma põhjadeta ei joonistata; vaate all olev märkus ütleb, mitu neid on.

## Vali 3D-vaates

Klõpsa trassi (või tema teed), platsi, joonelementi, toru, rajatist, mõõdistuspunkti, taime, rampi või muud kõvakatet. See valitakse täpselt nii, nagu oleks klõpsatud plaanil: selle omadused avanevad parempoolses paneelis, kus saad neid muuta, ning see joonistatakse 3D-s valiku värviga kõige peale. Mida plaanil valid, on 3D-s samuti esile tõstetud. Kursori kõrval olev vihje nimetab, mida klõpsasid, koos ida-, põhja- ja kõrgusega. Torusid ja rajatisi saab klõpsata isegi seal, kus need on maa all; mäe taha peidetud joont läbi mäe klõpsata ei saa.

Klõpsa murdejoonele, et näha, milline see on: see tõstetakse esile ja olekuriba nimetab selle (murdejoontel endil omadusi ei ole).

Klõpsa maapinnale, et lugeda vihjest ida-, põhja- ja kõrgus.

## Sõida mööda trassi

Klõpsa 3D-ribal **Sõida** ja vali trass. Vaade liigub juhi istmele: 3.5 ft (1.07 m) tee kohal, selle projekteerimisprofiilil (olemasoleval maapinnal keskjoone järgi, kui profiili pole veel), vaadates mööda ette.

- **Esita** või {{key:Space}} sõidab valitud kiirusel (10 kuni 65 mph või 15 kuni 100 km/h); {{key:Space}} uuesti peatab. See peatub lõpus; **Esita** alustab siis uuesti algusest.
- Liugur hüppab mis tahes pikketile; {{key:Left}} ja {{key:Right}} liiguvad 10 ft (5 m) tagasi ja edasi.
- Vaates lohistamine peatab ja laseb ringi vaadata.
- **Stopp** või {{key:Esc}} paneb vaate tagasi sinna, kus see oli.

Vertikaalne liialdus kehtib ka sõitmisel: sea see 1×-le, et näha teed nii, nagu see saab olema.

## Päike

Ava **Päike** 3D-ribal ja märgi **Valgus päikesest**. Anna kuupäev, kellaaeg ja ajavöönd (nihe UTC-st: suvel suveaja oma), ning ala laius- ja pikkuskraad. Kui projektil on koordinaatsüsteem, täidetakse need sellest.

Ala valgustatakse siis sellest suunast, kus päike on, varjudega üle maapinna, koridori ja platside; menüü ütleb päikese asimuudi ja kui kõrgel ta on, või et ta on horisondist allpool. Asendid tulevad NOAA päikesevõrranditest. Varjud langevad õiges suunas igal liialdusel, kuid need peatuvad ala servas: sellest kaugemal olevad mäed ja hooned ei heida varju.

## Ekspordi 3D-vaade

Klõpsa ribal {{ui:GLB}} või {{ui:OBJ}}. Mida vaade näitab, salvestatakse tõelises mõõtkavas (ilma liialduseta), meetrites, Y üles. Üksikasjad: [Ala ekspordi 3D-s](topic:export-3d).
