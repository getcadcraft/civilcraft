---
title: Failid, mida saad avada, salvestada ja eksportida
summary: Punktifailide, LandXML-i ja CivilCrafti projektide sisestamine; projektide, LandXML-i, DXF-i ja PDF-i väljund; mida iga fail säilitab, kuhu failid lähevad ja mis muutub võrguta.
keywords: ava, salvesta, eksport, import, failivormingud, csv, txt, landxml, xml, dxf, pdf, json, allalaadimine, projektifail
from: 82bff559
---

CivilCraft avab faile sinu arvutist ja salvestab, laadides failid tagasi arvutisse allalaadimisena. Midagi ei laadita üles ega hoita serveris. Vaata ka [Sinu failid](common:your-files).

## Mida see avab

Klõpsa {{ui:Ava}} (või vajuta {{key:Mod+O}}) ja vali fail, või lohista fail {{pick:mac=Finder|windows=File Explorer|linux=sinu failihaldur}} plaanile. Korraga üks fail; üle 200 MB faile ei võeta vastu. LandXML-i või projektifaili, mis on suurem kui 32 MB, loetakse umbes 4 MB suuruste osadena, mitte ühe tekstiplokina; LandXML-i avamise ajal kulub mälu umbes 13 korda faili suurusest (69 MB fail kasutas meie testis umbes 0,9 GB).

| Liik | Failinimed | Mis juhtub |
|---|---|---|
| Punktifail | `.csv`, `.txt`, `.pnt`, `.xyz` (mis tahes tekstifail) | Avaneb dialoog **Impordi punktid**. Punktid asendavad projekti punktid; trassid, alused ja torud jäävad alles. |
| LandXML | `.xml`, `.landxml` | Failist tehakse **uus projekt** (kui praegusel projektil on salvestamata muudatusi, küsitakse enne). |
| CivilCrafti projekt | `.civilcraft.json` (mis tahes `.json`) | Projekt avaneb sellisena, nagu see salvestati (kui praegusel projektil on salvestamata muudatusi, küsitakse enne). |

CivilCraft otsustab faili lõpu järgi, seejärel faili esimeste märkide järgi: tekst, mis algab märgiga `{`, loetakse projektiks, tekst märgiga `<` LandXML-iks ning kõik muu punktifailiks. Fail, mille avamisdialoog hallina näitab, võib siiski plaanile lohistada.

:::note
Punktifailide importimine projekti, millel on juba punktid, asendab need küsimata ja tühjendab tagasivõtmise ajaloo (mis tahes faili avamine on tagasivõtmise jaoks uus algus). Kui pind pärineb LandXML-ist, lülitab punktide importimine selle tagasi punktidest loodud pinnaks. Salvesta enne, kui võid soovida vanu punkte tagasi.
:::

Üksikasjad: [Punktifailide vormingud](topic:point-file-formats), [LandXML: mida loetakse ja kirjutatakse](topic:landxml-reference).

## Mida see salvestab

{{ui:Salvesta}} ({{key:Mod+S}}) kirjutab kõrvuti kaks faili, nimetatud vasakpaneelil oleva **Nimi** järgi: `<nimi>.civilcraft.json`, projekt, mida edasi muudad, ja `<nimi>.ifc`, sama kujundus IFC 4.3 vormingus teistele kasutajatele (vt [IFC eksport ja import](topic:ifc)). Iga fail märgib teise ning IFC sisaldab ka projekti tihendatud koopiat, nii et eraldi saadetud IFC avaneb ikka täielikult muudetavana.

- **Studio** puhul kirjutatakse mõlemad failid kõrvuti, samasse kohta.
- **Chrome'is ja Edge'is** küsitakse esimesel salvestamisel kausta ning mõlemad kirjutatakse sinna; järgmised salvestused lähevad samasse kausta. Loobu kausta küsimusest, et mõlemad hoopis alla laadida.
- **Teistes brauserites** laaditakse mõlemad failid alla, projektifail esimesena.

Kumbki faili avamisel otsitakse teist. Ava mõlemad koos (või lohista mõlemad) või ava üks: Studio-s leitakse teine samast kaustast; brauseris küsib CivilCraft, kas lisad selle või jätkad olemasolevaga. Kui teine programm muutis IFC-d pärast seda, kui CivilCraft selle salvestas, või kui üks fail on teisest vanem, avatakse projekt uuema kujunduse järgi ning Probleemide paneel ütleb, mis juhtus, koos nuppudega **Salvesta kohe** (kirjutab mõlemad failid uuesti) ja **Näita IFC geomeetriat võrdlusena**. Üksik IFC, mida muutis teine programm, avaneb oma projektikoopiast koos sellega, mis veel sobib: muudetud trassid võtavad enda geomeetria, eemaldatud objektid jäetakse välja ning ülejäänud muudatused on loetletud, kuid mitte rakendatud. Enne versiooni 0.7.1 tehtud projektifail avaneb nagu varem.

Projektifail säilitab:

- iga punkti (number, koordinaadid, kõrgus, kirjeldus) ja punktifaili nime, millest need pärinevad
- pinna sätted: rühmavalikud, joonistatud murdejooned, piir, pikima välise serva ning LandXML-ist loetud TIN-i
- kuvasätted
- trassid koos nende PI-de, raadiuste ja algjaamaga, nende projekteeritud profiilid (PVI-d ja kõverate pikkused) ning koridori sätted
- alused ja torustik koos selle reeglitega

Tagasivõtmise ajalugu ei säilitata. Pindu, kontuurjooni, päevavalgusjooni ja mahte ei salvestata; need luuakse projekti avamisel uuesti salvestatud algandmete põhjal. Uuema CivilCrafti projektifail lükatakse tagasi teatega, mis nimetab selle versiooni.

## Mida see eksportib

| Nupp | Fail | Sisu |
|---|---|---|
| {{ui:LandXML}} | `<nimi>.xml` | LandXML 1.2: punktid, olemasolev maapind (ja valmis pind, kui see on olemas) TIN-pindadena, trassid, maapinna ja projekteeritud profiilid, torustik |
| {{ui:DXF}} | `<nimi>.dxf` | Plaani jooned R12 DXF-ina nii, nagu need on kuvatud, nimetatud kihtidel |
| {{ui:DWG}} | `<nimi>.dwg` | Samad jooned DWG-joonisena valitud vormingus (2000 kuni 2018) |
| {{ui:PDF}} | `<nimi>.pdf` | Plaani vektorjoonis lehel valitud mõõtkavas |
| {{ui:GLB}} või {{ui:OBJ}} (3D-vaate ribal) | `<nimi>-3d.glb`, `<nimi>-3d.obj` | Mida 3D-vaade näitab 3D-mudelina: meetrites, Y üleval, tõene mõõtkava, salvestatud kohaliku alguspunkti ümber |

Mida kumbki välja jätab: [LandXML-i vahetus](topic:landxml), [Plaani eksportimine DXF-ina](topic:dxf-export) (DWG-na samuti), [Plaani printimine PDF-ina](topic:plot-pdf), [Saidi eksportimine 3D-na](topic:export-3d).

## Kuhu failid lähevad

Salvestatud ja eksporditud failid lähevad sinna, kuhu sinu brauser allalaadimised paneb, tavaliselt kausta Allalaadimised. Et valida kaust igal korral:

:::chromium
Ava brauseri **Sätted**, seejärel **Allalaadimised**, ja lülita sisse **Küsi enne allalaadimist, kuhu iga fail salvestada**.
:::

:::firefox
Ava **Sätted**, seejärel **Üldine**, ja jaotises **Failid ja rakendused** vali **Küsi alati, kuhu failid salvestada**.
:::

:::safari
Ava **Safari > Sätted > Üldine** ja määra **Faili allalaadimise asukoht** väärtuseks **Küsi iga allalaadimise puhul**.
:::

Kui salvestad kaks korda sama nimega, võib brauser teisele failile lisada numbri, näiteks `Site (1).civilcraft.json`. Ava järgmine kord uusim.

## Võrgus ja võrguta

CivilCraft töötab mõlemal juhul ainult sinu arvutis: avamine loeb faili brauseris, salvestamine laadib selle alla. Et avada CivilCraft täiesti ilma ühenduseta, salvesta see enne võrguta kasutamiseks:

1. Võrgus olles klõpsa ülal rakendusribal nuppu {{ui:Salvesta võrguks}}.
2. Nupp näitab edenemist („Salvestamine: 12 / 30“) ja kuvab seejärel {{ui:Valmis ka võrguta}}. CivilCraft on väike (umbes 0,6 MB), seega see võtab hetke. Salvestatud koopia sisaldab seda abi ja näidisala.
3. Ilma ühenduseta ava sama aadress (või selle järjehoidja). Kõik töötab, sealhulgas {{ui:Ava näidisala}}.

Nupu muud olekud:

- {{ui:Salvestamine ebaõnnestus}}: mõned failid ei laadinud alla. Kontrolli ühendust ja klõpsa uuesti.
- {{ui:Võrguta kasutamine pole saadaval}}: see brauseriaken ei saa hoida võrguta koopiat (privaatsed aknad ja mõned hallatud arvutid blokeerivad selle). Kasuta tavalist akent.

Klõpsa {{ui:Valmis ka võrguta}}, et näha, millal koopia salvestati, ja kahte valikut: {{ui:Salvesta uuesti (võta uusim versioon)}} ja {{ui:Eemalda võrguvälise koopia}}. Salvesta uuesti enne objektikülastust, et koopia vastaks uusimale versioonile. Rohkem: [Võrguta kasutamine](common:offline).

:::offline
Oled praegu võrguta. Kui CivilCraft salvestati võrguta kasutamiseks, töötab kõik, sealhulgas näidisala. Kui ei, jätka tööd selles vahelehes, kuid ära laadi seda uuesti enne, kui oled jälle võrgus; ilma salvestatud koopiata ebaõnnestub {{ui:Ava näidisala}} teatega „Näidist ei õnnestunud laadida“.
:::

:::tip
Välitöödeks salvesta CivilCraft võrguta kasutamiseks ja too punktifailid kaasa sülearvutisse. Projektid ja eksportid salvestuvad allalaadimistena ka ilma ühenduseta, nii et võid importida päeva mõõdistused, kontrollida pinda ja salvestada projekti kohapeal.
:::

Pilvesalvestus pole veel saadaval ja töölauaversioonid pole veel välja antud. Praegu on sinu salvestatud failid ainus koopia: hoia neid kohas, mida varundatakse.

## Lisandmoodulid, mida fail kasutab

Kui salvestad projekti, mis sisaldab lisandmooduli andmeid (ehitusnõuete märkeruudud või aadressist asukohta allikas), salvestab fail, millised lisandmoodulid ja millised versioonid. Kui avad selle arvutis, kus neid pole, ütleb plaani kohal olev riba seda ja pakub lisamist sinu konto nimekirjast. Kirje on ainult märkus: fail avaneb igal juhul.

## Tagasivõtmine Studio-st

CadCraft Studio sees teatatakse Studio-le iga CivilCrafti sammust, mille lõpetad, et selle projektitasemel tagasivõtmine saaks võtta viimase sammu tagasi üle rakenduste. Studio võtab sammu tagasi ainult siis, kui CivilCrafti enda tagasivõtmise pinu on täpselt samas seisus, nagu see samm jättis; pärast teise faili avamist jäetakse see aken vahele.

## Sulgemine salvestamata muudatustega

Kui projektil on salvestamata muudatusi ja sa suled vahelehe, laadid lehe uuesti või lahkud lehelt, küsib brauser, kas soovid lahkuda. Selle sõnastuse ja välimuse määrab brauser ning CivilCraft ei saa seda muuta. {{ui:Uus}} ning projekti või LandXML-faili avamine küsivad seevastu CivilCrafti enda kastis **Salvestamata muudatused** koos valikutega {{ui:Loobu}}, {{ui:Ära salvesta}} ja {{ui:Salvesta koopia}}.
