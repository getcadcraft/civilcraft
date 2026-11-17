---
title: Tunnusjooned
summary: Joonista 3D-jooni, mida profileerid tipu kaupa, tee nende astmelisi nihkeid ning kasuta neid maapinna murdejoontena või projekteeritud kaldus platvormidena.
keywords: kaar, kõver, raadius, 3D-kaar, spiraal, kõver äärekivi, kalde kiht, kõrgusmärgi kiht, kaldenoolded, tunnusjoon, kalle, kaldumus, kõrgusmärk, astmeline nihe, nihe, murdejoon, äärekivi, kraav, pank, kaldus platvorm, väljumine, vertikaalplaneerimine, 3D-murdjoon
from: d55b25fb
---

Tunnusjoon on joon, millel on kõrgusmärk igas tipus: äärekivi, kraavi voolujoon, pankrannaku ülemine serv, kaldus platvormi serv. Määrad selle kõrgused arvu või kalde järgi, kopeerid selle külgsuunas koos sammuga üles või alla ja valid, mida pinnad selle abil teevad.

## Joonista üks

1. Vali **Pind** › {{ui:Veel}} › {{ui:Tunnusjoon}} või vajuta {{key:L}}.
2. Klõpsa plaanil selle tippe. Klõps mõõdistuspunktil võtab punkti koha ja kõrgusmärgi; mujal võtab tipp olemasoleva maapinna kõrguse sellel kohal.
3. Vajuta {{key:Enter}}, et lõpetada avatud joon, või klõpsa esimesele tipule uuesti, et joon sulgeda.

Uus joon on valitud ja algab olemasoleva maapinna murdejoonena, mis asub maapinnal.

## Kaared

Lõik võib plaanil olla kaar, mille otspunktid on erinevatel kõrgustel: äärekivi pööre, kõverdatud kraav, pöörav rambi. Selle kalle kulgeb kaare kaupa ühtlaselt ja selle pikkus mõõdetakse mööda kõverat.

- **Joonistamise ajal:** vajuta {{key:C}} (puutekuval {{ui:Kaar}} plaani kohal olevas ribas), et kaared sisse lülitada. Pärast tippu klõpsa kõvera punktil ja seejärel kohas, kus kaar lõpeb. Sirgete lõikude jaoks vajuta {{key:C}} uuesti. {{key:Backspace}} eemaldab kõigepealt kõvera punkti.
- **Hiljem:** jaotises **Omadused** sisesta tipu kasti **Kaar** raadius ja pöördesuund, näiteks `50 L` või `50 R` (vasakule või paremale, kui kõnnid mööda joont), ning vajuta {{key:Enter}}. Tühjenda kast, et lõik muutuks uuesti sirgeks. Raadius, mis on väiksem kui pool lõigust, lükatakse tagasi.

Valitud joon näitab iga kaare raadiust oma kalde kõrval. **Pikkus** on mööda kaari plaanil; **3D-pikkus** arvestab ka tõusu ja langust. Astmelised nihked säilitavad kaared: kõvera välisküljel olev kaar kasvab, sisemine kahaneb, ja nihe, mis ulatub üle kaare keskpunkti, lükatakse tagasi.

Pinnad, 3D-vaade ning DXF ja DWG võtavad iga kaare lühikeste sirgete tükkidena, mis jäävad kõverast 0.01 piiresse. LandXML hoiab need kaarena (vt allpool **Kaared teistes failides**).

## Kõrguste ja kallete määramine

**Omadused** loetleb tipud koos nende kaugusega mööda joont, nende **Kõrgusmärgi** ja **Kalle järgmiseni** (protsentides). Sisesta kumbki ja vajuta {{key:Enter}}:

- Kõrgusmärk liigutab ainult seda tippu.
- Kalle määrab kõrgusmärgi selle lõigu kaugemas otsas; tipud pärast seda jäävad oma kohale, nii et järgmise lõigu kalle muutub.

Samuti jaotises **Omadused**:

| Toiming | Mida see teeb |
|---|---|
| **Tõsta või langeta kõiki võrra** | Lisab sisestatud kõrguse igale tipule. |
| {{ui:Kõrgusmärgid maapinnast}} | Paneb iga tipu tagasi olemasolevale maapinnale (pinnast väljas olevad tipud säilitavad oma kõrguse ja loetakse üles). |
| {{ui:Üks kalle esimesest viimaseni}} | Säilitab esimese ja viimase kõrgusmärgi ning paneb nende vahel olevad tipud ühtlasele kaldele. |

Joon näitab plaanil oma kõrgusmärke tippudel ja kaldeid lõikudel. Tipu liigutamiseks lohista seda {{ui:Vali}}-ga; selle kõrgusmärk jääb samaks.

## Astmelised nihked

Jaotises **Astmeline nihe** sisesta **Kaugus** (positiivne joone suuna paremal küljel, negatiivne vasakul), seejärel kõrgus (üles või alla võrra) või kalle protsentides, ning klõpsa {{ui:Tee nihkejoon}}. Koopia on uus tunnusjoon: näiteks äärekivi tagakülg 0.5 ft külje peal ja 0.5 ft kõrgemal või kraavi serv 6 ft välja 2 %-lise kaldega. Kaugus, mis paneks koopia terava pöörde kohal iseendale kokku, lükatakse tagasi.

## Kalded ja kõrgusmärgid ekraanil

Vajuta {{key:E}} või märgi jaotises **Kuva** **Kalded ja kõrgusmärgid tunnusjoontel**, et näha iga tunnusjoone kallet igal lõigul (väikese noolega, mis osutab allamäge) ja selle kõrgusmärki tippudel. Need kuvatakse ainult ekraanil: joonisele midagi ei lisata ning PDF, DXF ja DWG jäävad samaks. Lühikesed lõigud ja tihedad tipud jäävad sildistamata, kuni suumid sisse. Valitud joon näitab alati oma kaldeid ja kõrgusmärke.

## Profiilivaates

Tunnusjoon, mis ristub trassiga, ilmub selle trassi profiilivaatesse koos nime ja kõrgusmärgiga ristumiskohas; selle kõrval jooksvad jooned võib samuti näidata. Vt [Vertikaalprofiili koostamine](topic:profile).

## Mida pinnad sellega teevad

Vali **Kasuta**:

| Kasutus | Mis juhtub |
|---|---|
| Olemasoleva maapinna murdejoon | Olemasolev maapind kulgeb joonest läbi oma kõrgusmärkidel, nagu joonistatud murdejoon. |
| Projekteeritud pinnaks profileeritud | **Suletud** joon muutub kaldus platvormiks: selle sees olev projekteeritud pind profileeritakse selle servani. Lülita sisse **Väljumine maapinnale**, et jooksutada lõike ja täitekaldeid (horisontaalselt vertikaalse 1 kohta) selle servast maapinnani, nagu platvormil; iga kalle algab seal serva enda kõrgusest. |
| Ainult joonistatud | See jääb plaanile ja läheb välja DXF-is, DWG-s ja PDF-is (kiht C-GRAD-FEAT, 3D-murdjooned), kuid pinnad seda ignoreerivad. |

Mahud, lõiked ja 3D-vaade hõlmavad projekteeritud pinda suunatud tunnusjooni, nagu platvorme. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Joonte jagamine meeskonnaga

Joonistes, mille avad oma pilvefailidest CadCrafti Studios meeskonnaplaanil, on projekti **Omaduste** all (midagi valimata) jaotis **Meeskond** koos {{ui:Meeskonna jooned…}}-ga: meeskonna jagatud jooned, igaüks oma versiooniga, ilma et peaksid enne tunnusjoont valima. Vali joon, et see jagada, lükata uus versioon, tõmmata meeskonna versioon või lõpetada jagamine. Väljaspool seda seadistust ütleb jaotis, mida see vajab.

## Kaared teistes failides

| Fail | Mis juhtub kaartega tunnusjooniga |
|---|---|
| CivilCraft-projekt | Säilib täpselt. |
| LandXML | Kirjutatakse plaani tunnusjoonena, mille lõigud ja kaared on koos kõrgusmärkidega, ning loetakse tagasi koos kaartega. Teise programmi tunnusjoon tuleb sisse **Ainult joonistatud** kujul: vali selle **Kasuta**, et see pinda panna. |
| DWG ja DXF | 3D-murdjoon ei saa hoida kaart, seega kirjutatakse joon lühikeste tükkidena, mis jäävad iga kaare 0.01 piiresse. CivilCraft märgib joonisesse ka, millised tükid olid kaared: kui avad joonise joonestikuna, toob {{ui:Tunnusjooned}} need tagasi tunnusjoontena koos kaartega. Teised programmid näevad tavalist 3D-murdjoont. |
