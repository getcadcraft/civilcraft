---
title: Koridori mallid ja maapinna mallid
summary: Koosta väikesed korduvkasutatavad mallid (bordüür ja rennkivi, kõnnitee, sein, kraav), koosta neist koridor jaamade kaupa, vasak- ja paremküljega eraldi, jaga trass mitmeks koridoriks ning kata maapind kihiliste materjalidega.
keywords: mall, mallid, malliteek, malli koostamine, tüüplõige, koost, alamkoost, komponendid, punktikoodid, lõppseisund, piirijoon, kraav, tugisein, bordüür, rennkivi, kõnnitee, piirkonnad, jaamavahemik, mitu koridori, vasak ja parem, maapinna mall, pealmine muld, sõidutee, alus, katmine, materjalid, kogused
from: ce70e58b
---

Mall on väike ristlõige, mille joonistad ühe korra ja kasutad uuesti: punktid nihete, kallete ja punktikoodidega ning komponendid materjalidega. Koridori saab koostada mallidest jaamade kaupa, igal küljel oma sõidutee mallide ja oma lõppseisundiga, ning samu malle saab katta ka maapinnal.

:::warning
Näitemallid on kohatäitjad, millest alustada. Nende arvud ei ole võetud ühestki standardist ega ametkonnast. Insener peab iga malli ja iga selle väärtuse üle kontrollima enne, kui seda projekteerimises kasutatakse.
:::

## Mallide avamine

Ava {{ui:Pind}} › {{ui:Veel}} › {{ui:Koridori mallid…}} (või kirjuta {{cmd:TEMPLATES}}). Aknas on kolm loendit:

- **Selles projektis**: mallid, mida selle projekti koridorid ja maapinna mallid kasutavad. Need salvestatakse projektifaili.
- **Minu teek**: mallid, mis hoitakse selles brauseris ja on saadaval igas projektis. Projekti malli hoidmiseks kasuta {{ui:Salvesta Minu teeki}}.
- **Näited**: kaks sõiduriba koos kihtidega, bordüür ja rennkivi, kõnnitee, piirijoon, kraav, tugisein, pealmine muld maapinna all ning sõidutee maapinnal. Igal neist on märge „Insenerile kontrollimiseks“.

{{ui:Kasuta selles projektis}} kopeerib teegi või näitemalli projekti. {{ui:Ekspordi selle projekti mallid}} salvestab need failina `.cctemplates.json` ja {{ui:Impordi fail}} loeb ühe faili projekti ja Minu teeki. Kasuta faili malli jagamiseks või teisele arvutile viimiseks.

## Malli koostamine

{{ui:Uus mall}} (või {{ui:Muuda}} projekti malli juures) avab malli redaktori. Joonista parem pool väljapoole malli punktist 0,0; vasak pool kasutab sama malli väljapoole vasakule.

1. Anna sellele nimi ja liik: **Sõidutee** (järgmine mall liitub selle lõpuga), **Lõppseisund** (see kohtub maapinnaga) või **Maapinna mall**.
2. Lisa **väärtused**: nimega arvud, näiteks laius `w` või kalle `s`. Mis tahes arvuväljas malli sees võib olla arv või väärtuse nimi; `-t` on väärtus `t` negatiivsena. Koridor võib igale malli kasutuskorrale anda oma väärtused, nii et üks bordüürimall teenindab iga bordüürikõrgust.
3. Lisa **punktid** järjekorras. Igaüks asetatakse varasemast punktist (või punktist 0,0) oma piirangu järgi:

| Piirang | Asetab punkti |
|---|---|
| Nihe kaldega | Nihke väljapoole ja kalde (tõus jooksu kohta; −0.02 tähendab langust 2%) |
| Nihe ja tõus | Nihke ja tõusu |
| Otse üles või alla | Ainult tõusu |
| Külgkalle maapinnani | Väljapoole oma punktist maapinnani, lõikesuhtel, kus maapind on kõrgemal, ja täitesuhtel, kus see on madalamal |
| Maapinnani | Nihke, seejärel otse üles või alla maapinnani |
| Tugisein | Sein sisestatud paksusega: lõikes puutub selle pealmine ots maapinnaga tee servas, täitel läheb tee selle üle ja selle väliskülg langeb maapinnani |

   Märgi **Pealmine** punktide jaoks, mida valmis pind läbib. Viimane pealmine punkt on koht, kus järgmine mall sellel küljel algab. **Siht** lubab koridoril punkti liigutada: selle nihe või kõrgus tuleb joonelt.

4. Lisa **komponendid**: suletud kujundid punktikoodide kaudu (`0` on punkt 0,0), igaüks nime, materjali ja liigiga. Nende pindalad annavad mahud.

Joonis järgib iga muudatust tegelikus mõõtkavas ja loend selle all ütleb, mis on valesti (punkt, mis puutub maapinnaga enne lõppu, väärtus, mida mall ei oma, komponent ilma pindalata). {{ui:Lisa sellele projektile}} või {{ui:Salvesta}} hoiab selle alles ühe võtmistagasi sammuna.

## Koridori koostamine mallidest

Vali trass, millel on koridor, ja pane selle omaduste all sisse {{ui:Ehita mallide järgi jaamade kaupa}}. Koridor algab mõlemal küljel kahe sõiduraja ja piirijoone näidetega.

- **Piirkonnad.** Iga piirkond algab jaamast ja kulgeb järgmise piirkonna jaamani. {{ui:Lisa piirkond}} lisab ühe; muuda selle algusjaama selle kastis.
- **Vasak ja parem eraldi.** Igal küljel igas piirkonnas on oma **Sõidutee** loend keskjoonest väljapoole ja oma **Lõppseisund**: piirijoon, kraav, sein või mis tahes mall, mis puutub maapinnaga. Ilma lõppseisundita läheb külg piirijoonele koridori lõike- ja täitekalde juures. {{ui:Kopeeri vasakult paremale}} kopeerib külje.
- **Väärtused ja sihid.** Iga külje malli all on kast igale väärtusele (tühi = malli enda väärtus) ning punkti jaoks, mis võtab sihi, joon või teise koridori joon, mis seda liigutab.
- **Algus ja lõpp** piiravad koridori trassi osale.

Lõiked, plaanijooned iga punktikoodi jaoks, valmis pind, väljamärkimine ja mullatööd järgivad kõike. Omadused loetlevad iga komponendi mahu küljeti ja piirkonniti (keskmised otspindalad mööda keskjoont). Ülekallutus ja koridori servasihid ei ole kasutusel, kui koridor on koostatud mallidest.

## Mitu koridori ühel trassil

Jaotises **Selle trassi koridorid** {{ui:Lisa koridor}} lisab koridori trassi ülejäänud osale: esimesele koridorile antakse lõppjaam keskel (või see säilitab oma) ja uus algab seal, esimese viimase piirkonna mallidega. Igal koridoril on oma nimi, jaamavahemik, mallid ja mullatööd. Lülita üks välja selle {{ui:Sees}} kastiga. Kui vahemikud kattuvad, tasandab hilisem koridor varasema üle.

## Maapinna mallid

Maapinna mall katab malli kihid maapinnal selle punktist 0,0: punktist 0,0 allpool olev kiht läheb maapinda (pealmine muld, mis eemaldatakse), punktist kõrgemal olev kiht asub maapinnal (alus ja sõidutee parkimisplatsil). Laiused ja kallded ei loe, loeb ainult iga komponendi sügavus punktist 0,0 kõrgemal või madalamal.

Ava {{ui:Pind}} › {{ui:Veel}} › {{ui:Maapinna mallid…}} (või kirjuta {{cmd:TERRAINTEMPLATES}}); plokk on ka projekti omadustes. {{ui:Lisa maapinna mall}} lisab ühe pealmise mulla näitega. Iga malli kohta vali:

- **mall** (selle väärtusi saab selle jaoks muuta),
- **maapind**: olemasolev maapind või projekteeritud pind,
- **kuju**, mis seda lõikab: kogu maapind, kinnistu, plats või suletud tunnusjoon. Mitu maapinna malli saavad sama maapinna peal kasutada erinevaid kujusid.

Iga kiht loetleb oma paksuse, plaani pindala ja mahu. Maht on plaani pindala korda paksus, paksus mõõdetud otse allapoole; pindala mõõdetakse ruudustikul ja lisaks antakse ka kaldpinna (kaldega) pindala. Kujud joonistatakse plaanile kihile C-TOPO-TMPL. Maapinna mallid ei muuda projekteeritud pinda.

## Materjalid ja kogused

Projekti mullatööde plokk loetleb **Materjalid mallidest**: iga koridori komponendi ja maapinna malli kihi koos mahuga. {{ui:Saada programmi TakeoffCraft}} kirjutab need kogustefaili pärast lõiget ja täidist, üks kirje iga ühiku kohta, kuupjardides (jalgades projektid) või kuupmeetrites.

## Failid

Mallid, piirkonnad, lisakoridorid ja maapinna mallid salvestatakse projektifaili. Projekt, mis ei kasuta ühtegi neist, salvestatakse täpselt nagu varem, ja vanemad CivilCrafti versioonid avavad projekti, mis neid kasutab (nad ignoreerivad malle ja koostavad koridori enda koosti).
