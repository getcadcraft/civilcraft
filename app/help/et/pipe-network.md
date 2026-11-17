---
title: Koosta gravitatsioonitoru võrk
summary: Joonista sademevee- või reoveetorud rajatis-rajatise kaupa, sea oma kalde-, katte- ja languseeskirjad, lase CivilCraft'il määrata sisepõhjad ning paranda nimekirjas olevad probleemid.
keywords: rajatise koostaja, rajatise tüüp, ristkülikukujuline rajatis, sademeveekaev, raam, kate, seina paksus, teegiüksus, torustik, sademevesi, reovesi, kanalisatsioon, rajatised, kaevud, sisepõhjad, kate, kalle, langus, kaane kõrgus, settekaev, gravitatsioonitorud
from: 10a3c14d
---

Projektis on üks gravitatsioonitoru võrk, sademevee või reovee oma. See koosneb rajatistest (kaevud, sissevoolud) ja sirgetest torudest nende vahel. Vool kulgeb suunas, kuhu joonistad. CivilCraft kontrollib iga toru ja rajatist kolme reegli vastu, mille sina seadistad, ja suudab kõik sisepõhjad nende reeglite järgi määrata.

## Joonista lõik

Võid joonistada torusid ilma pinnata, kuid kaane kõrgused, katted ja automaatsed sisepõhjad vajavad pinda.

1. Vajuta {{key:P}} või klõpsa {{ui:Pipes}} grupis **Design**.
   Vihje ütleb: „Torud: klõpsa rajatisi lõigu ülevalt alla (klõpsa olemasolevat, et ühineda). Enter lõpetab.“
2. Klõpsa kohta, kuhu läheb ülesvoolu rajatis. Rajatis paigutatakse.
3. Klõpsa iga järgmist rajatist allavoolu. Et ühenduda juba olemasoleva rajatisega, klõpsa sellel: olekurida ütleb „Ühendatud S3.“
4. Vajuta {{key:Enter}}.
   Torud joonistatakse, nende sisepõhjad määratakse reeglite järgi ja olekurida ütleb näiteks „3 toru joonistatud, 12 sisepõhja määratud reeglite järgi; kõik kontrollid läbitud.“

Uued rajatised nimetatakse S1, S2 … läbimõõduga 48 in (1200 mm). Uued torud nimetatakse P1, P2 … läbimõõduga 12 in (300 mm). Läbimõõdud on tollides jalgades projektis ja millimeetrites meetri-projektis.

Lõpeta {{key:Enter}}-ga. Topeltklõps töötab ka, aga kui topeltklõpsad olemasolevat rajatist, et lõik seal lõpetada, katkeb ühendus: klõpsa seda üks kord ja vajuta siis {{key:Enter}}.

## Sea oma reeglid

Kui midagi pole valitud, on parempoolses paneelis (**Project**) plokk **Pipe network**:

| Seade | Algväärtus | Tähendus |
|---|---|---|
| Type | Storm | {{ui:Storm}} või {{ui:Sanitary}}; kirjutatakse LandXML-i |
| Least slope | 0.50% | Iga toru peab langema vähemalt nii palju |
| Least cover | 2 ft (0.6 m) | Maapind kuni toru tipuni, kogu toru ulatuses |
| Drop in structures | 0.10 ft (0.03 m) | Väljavoolu sisepõhi peab olema vähemalt nii palju allpool iga sissevoolu sisepõhja |

**Need algväärtused on kohatäited, mitte standard.** Sea väärtused, mida sinu amet või projekt nõuab. Kate mõõdetakse maapinnast toru laed (sisepõhi pluss sisemine läbimõõt); seina paksust ei arvestata. Kus padid või koridorid on tasandatud, on tasandatud pind maapinnaks.

## Lase CivilCraft'il määrata sisepõhjad

- {{ui:Set every invert from the rules}} (plokis **Pipe network**) määrab kõik torud.
- {{ui:Set its inverts from the rules}} (kui on valitud üks toru) määrab ainult selle toru.

Allavoolu töötades algab iga lõik vähemalt katte kaugusel oma ülemisest rajatisest, langeb vähemalt vähima kalde jagu, langeb vähemalt iga rajatise läbimisel langust ning läheb sügavamale kohas, kus maapind mööda toru jätaks vähem kui vähima katte. Sisepõhjad ümardatakse alla 0.01 täpsusega, mitte üles. Olekurida ütleb „Sisepõhjad määratud: vähim kate lõigu ülemises otsas, vähemalt vähim kalle, vähemalt langus igas rajatises.“ või nimetab, mida ta ei suutnud teha.

## Muuda rajatisi ja torusid

Klõpsa rajatisel või torul käsuga {{ui:Select}}, et see näha parempoolses paneelis.

**Structure**: **Name**, **Rim**, **Sump depth**, **Diameter**, siis **Rim used**, **Sump**, **Easting** ja **Northing** ning sisse- ja väljavoolutorud koos nende sisepõhjadega.

- Jäta **Rim** tühjaks, et see võtta pinnalt; kast näitab siis pinnaväärtust hallilt. Trüki väärtus, et kaane kõrgus paika panna.
- Lohista rajatise käepidet plaanil, et seda liigutada. Selle torud järgivad; nende sisepõhjad jäävad endiseks, seega kontrolli probleeme pärast.

**Type**: vali üks võrgu rajatiste tüüpidest (allpool) või none ümmarguse rajatise jaoks oma läbimõõduga.

**Pipe**: **Name**, rajatised, mille vahel see kulgeb, **Diameter**, **Upper invert**, **Lower invert**, siis **Length**, **Slope** ja **Least cover**.

Vajuta iga väärtuse järel {{key:Enter}}.

## Loe ja paranda probleeme

Plokk **Pipe network** loetleb iga probleemi (kuni 40); klõpsa ühel, et valida toru või rajatis. Valitud toru või rajatis loetleb oma probleemid. Kui midagi pole valitud, ütleb see „Kõik torud ja rajatised läbivad reeglid.“

| Teade (näited) | Mida teha |
|---|---|
| „P2 voolab üles mäkke (-0.40%).“ või „… on lame …“ | Vaheta sisepõhjad või määra need reeglite järgi. |
| „P2 on 0.30% juures lamedam kui miinimum 0.50%.“ | Langeta allavoolu sisepõhja või tõsta ülesvoolu oma. |
| „P3-l on selle ulatuses 1.40 katet 35, mis on vähem kui miinimum 2.“ | Langeta toru; määra sisepõhjad reeglite järgi. |
| „S3-s lahkub P4 kohal 245.20, mis on 0.1 võrra vähem kui sisse tulev P3 kohal 245.25.“ | Langeta väljavoolutoru ülemist sisepõhja. |
| „P1 kroon on S1 kaanest kõrgemal.“ | Toru on rajatise jaoks liiga kõrgel. |
| „S2-st lahkub 2 toru; gravitatsioonivõrgul peaks olema üks väljumisviis igast rajatisest.“ | Eemalda üks väljuv toru või joonista see õiges suunas uuesti. |
| „Torud moodustavad silmuse; vool peab lõppema väljavoolul.“ | Lõik on joonistatud tagasi iseendasse; kustuta toru. |
| „S5 on pinnalt väljas ja tal pole kaane kõrgust.“ | Trüki kaane kõrgus või liiguta rajatis pinnale. |
| „P6 kulgeb osaliselt väljaspool pinda; kate seal on teadmata.“ | Laienda pinda või aktsepteeri, et kate seal ei ole kontrollitud. |
| „P7-l pole veel sisepõhju.“ | Trüki need või määra need reeglite järgi. |

Probleemsed torud ja rajatised on plaanil ka punasega märgitud.

## Rajatiste tüübid

Rajatise tüüp on rajatis, mis on ehitatud oma parameetritest: kaev, sissevool, ühenduskast või väljavool, **round** (sisemine läbimõõt) või **rectangular** (sisemine laius ja pikkus), koos oma **seina paksusega**, **põranda plaadiga**, **settekaevuga** madalaima toru all ning **raami ja kaanega** (ümar või ristkülikukujuline ava, raami kõrgus). Tüübid kuuluvad võrgule, jaotises **Structure types** projekti Omadustes.

1. Klõpsa {{ui:New structure type}}. Dialoog joonistab rajatise plaanil ja lõikes, kui sa kirjutad.
2. Klõpsa {{ui:Add the type}}.
3. Vali rajatis ja vali tüüp jaotises **Type**. See võtab tüübi suuruse ja settekaevu; oma settekaevu võib siiski muuta.

Muuda tüüpi ja iga selle tüübi rajatis järgib selle mõõtmeid. Eemalda tüüp ja selle rajatised jäävad ümarate rajatistena sama laiusega. Iga muudatus on üks samm: {{key:Mod+Z}} tühistab selle.

Ristkülikukujuline rajatis joonistatakse plaanile, DXF-i, DWG-sse ja PDF-i ning 3D-s ristkülikuna, mille pikkus kulgeb mööda selle väljavoolutoru; torud algavad selle seinast. LandXML kirjutab selle ristkülikukujulise rajatisena (`RectStruct`) koos seina paksusega ja loeb sellised rajatised tagasi tüüpidena.

### Jaga tüüpi teegi kaudu

{{ui:Save as library item}} kirjutab tüübi CadCraft teegiüksusena (`.json` fail): selle plaanisümboli, 3D-keha tüüpilise sügavuseni ja kõik mõõdud. Laadi see teeki üles, et seda jagada. {{ui:Open a library item}} loeb nii salvestatud rajatise tagasi võrku, teisendatuna projekti ühikutesse. Teegiüksused, mis ei ole CivilCraft'is tehtud rajatised, lükatakse tagasi koos põhjusega.

## Kustuta

Vali toru ja vajuta {{key:Delete}}, et see eemaldada. Rajatise kustutamine eemaldab ka selle külge ühendatud torud. Macil vajuta Fn ja kustuta või klõpsa {{ui:Delete}}.

## Veel pole valmis

Voolud, torude suurused ja hüdrauliline gradient on [Sademevee drenaaži](topic:storm-drainage) all. Torukataloogid, mittevoorud torud, profiilivaates torud, kõverad torud ja rohkem kui üks võrk projekti kohta pole veel saadaval. Vaata [Veel pole valmis](topic:not-built-yet).
