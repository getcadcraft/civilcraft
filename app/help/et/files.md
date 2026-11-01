---
title: Failid, mida saad avada, salvestada ja eksportida
summary: Punktifailid, LandXML ja CivilCraft'i projektid sisse; projektid, LandXML, DXF ja PDF välja; mida iga fail hoiab, kuhu failid lähevad ja mis muutub võrguta.
keywords: ava, salvesta, ekspordi, impordi, failivormingud, csv, txt, landxml, xml, dxf, pdf, json, allalaadimine, projektifail
from: a7debb61
---

CivilCraft avab failid sinu arvutist ja salvestab need tagasi arvutisse allalaadimisena. Midagi ei üleslaadita ega hoita serveris. Vaata ka [Sinu failid](common:your-files).

## Mida see avab

Klõpsa {{ui:Ava}} (või vajuta {{key:Mod+O}}) ja vali fail, või lohista fail plaanile ({{pick:mac=Finder|windows=Failihaldur|linux=sinu failihaldur}}). Korraga üks fail; üle 200 MB faile ei võeta vastu.

| Liik | Failinimed | Mis juhtub |
|---|---|---|
| Punktifail | `.csv`, `.txt`, `.pnt`, `.xyz` (mis tahes tekstifail) | Avaneb dialoog **Impordi punktid**. Punktid asendavad projekti punktid; trassid, platsid ja torud jäävad alles. |
| LandXML | `.xml`, `.landxml` | Failist tehakse **uus projekt** (enne küsitakse, kui praegusel projektil on salvestamata muudatusi). |
| CivilCraft'i projekt | `.civilcraft.json` (mis tahes `.json`) | Projekt avaneb nii, nagu see salvestati (enne küsitakse, kui praegusel projektil on salvestamata muudatusi). |

CivilCraft otsustab faililõpu järgi ja seejärel faili esimeste märkide järgi: tekst, mis algab märgiga `{`, loetakse projektina, märgiga `<` algav tekst LandXML-ina ja kõik muu punktifailina. Fail, mille avamise aken on hallina, saab ikkagi plaanile lohistada.

:::note
Punktifaili importimine projekti, millel on juba punktid, asendab need küsimata ja tühjendab tagasivõtmise ajaloo (mis tahes faili avamine on tagasivõtmise jaoks uus algus). Kui pind tuli LandXML-ist, lülitub punktide importimisel pind tagasi punktidest koostatud pinnaks. Salvesta enne, kui võid vanad punktid hiljem tagasi tahta.
:::

Üksikasjad: [Punktifailide vormingud](topic:point-file-formats), [LandXML: mida loetakse ja kirjutatakse](topic:landxml-reference).

## Mida see salvestab

{{ui:Salvesta}} ({{key:Mod+S}}) kirjutab kõrvuti kaks faili, mis on nimetatud vasakpaneelil oleva **Nimi** järgi: `<name>.civilcraft.json`, projekt, mida edasi muudad, ja `<name>.ifc`, sama projekt IFC 4.3 vormingus teistele rakendustele (vaata [IFC eksport ja import](topic:ifc)). Kumbki fail viitab teisele. IFC-fail sisaldab ka tihendatud koopiat projektist, nii et IFC, mis saadetakse eraldi, avaneb ikka täielikult muudetavana.

- **Rakenduses Studio** kirjutatakse mõlemad failid kõrvuti, samasse kohta.
- **Chrome'is ja Edge'is** küsib esimene salvestamine kausta ja kirjutab mõlemad sinna; järgmised salvestamised lähevad samasse kausta. Kui kausta küsimisel klõpsad {{ui:Loobu}}, laaditakse mõlemad alla.
- **Teistes brauserites** laaditakse mõlemad failid alla, esmalt projektifail.

Faili avamisel otsitakse üles ka teine fail. Ava mõlemad korraga (või lohista mõlemad), või ava üks: rakenduses Studio leitakse teine samast kaustast; brauseris küsib CivilCraft, kas lisada see, või jätkata ainult sinu failiga. Kui IFC-d muutis pärast CivilCraft'i salvestamist mõni muu programm või kui üks fail on teisest vanem, avaneb projekt uuema disaini järgi ja probleemide paneel ütleb, mis juhtus, ning pakub valikuid **Salvesta kohe** (kirjutab mõlemad failid uuesti) ja **Näita IFC geomeetriat võrdlusena**. Muu programmi muudetud IFC avaneb oma projektikoopiast koos sellega, mis veel sobib: trassid, mida see muutis, võtavad enda geomeetria; objektid, mille see kustutas, jäetakse välja; ja ülejäänud muudatused on loetletud, aga neid ei võeta üle. Enne versiooni 0.7.1 salvestatud projektifail avaneb nagu varem.

Projektifail hoiab:

- iga punkti (number, koordinaadid, kõrgus, kirjeldus) ja punktifaili nime, millest need pärinevad
- pinna seaded: rühmavalikud, joonistatud murdejooned, piirjoon, pikim väliserv ja LandXML-ist loetud TIN
- kuvaseaded
- trassid koos PI-de, raadiuste ja algjaamaga, nende projekteeritud profiilid (PVI-d ja kõverate pikkused) ning koridori seaded
- platsid ja torustik koos reeglitega

Tagasivõtmise ajalugu ei hoita. Pinnad, samakõrgusjooned, maapinna lõikejooned ja mahud ei salvestu; need koostatakse uuesti salvestatud sisendite põhjal projekti avamisel. Uuema CivilCraft'i projektifail lükatakse tagasi ja teade nimetab selle versiooni.

## Mida see ekspordib

| Nupp | Fail | Sisu |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punktid, olemasolev maapind (ja planeeritud pind, kui see on) TIN-pindadena, trassid, maapinna ja projekteeritud profiilid, torustik |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF plaani joonestusest nii, nagu see kuvatakse, nimetatud kihtidel |
| {{ui:DWG}} | `<name>.dwg` | Sama joonestus DWG-joonisena valitud vormingus (2000 kuni 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plaani vektorjoonis lehel valitud mõõtkavas |
| {{ui:GLB}} või {{ui:OBJ}} (3D-vaate ribal) | `<name>-3d.glb`, `<name>-3d.obj` | See, mida 3D-vaade kuvab 3D-mudelina: meetrites, Y üleval, tõene mõõtkava, salvestatud kohaliku alguspunkti ümber |

Mida igaüks välja jätab: [LandXML vahetus](topic:landxml), [Plaani eksportimine DXF-ina](topic:dxf-export) (DWG samuti), [Plaani plottimine PDF-iks](topic:plot-pdf), [Ala eksportimine 3D-na](topic:export-3d).

## Kuhu failid lähevad

Salvestatud ja eksporditud failid lähevad sinna, kuhu brauser allalaadimised paneb, tavaliselt kausta Allalaadimised. Et valida kaust iga kord:

:::chromium
Ava brauseri **Sätted**, siis **Allalaadimised**, ja lülita sisse **Küsi enne allalaadimist, kuhu iga fail salvestada**.
:::

:::firefox
Ava **Sätted**, siis **Üldine**, ja jaotises **Failid ja rakendused** vali **Küsi alati, kuhu failid salvestada**.
:::

:::safari
Ava **Safari > Sätted > Üldine** ja sea **Faili allalaadimise asukoht** väärtuseks **Küsi iga allalaadimise korral**.
:::

Kui salvestad kaks korda sama nimega, võib brauser teise faili nimele numbri lisada, näiteks `Site (1).civilcraft.json`. Ava järgmisel korral uusim.

## Võrgus ja võrguta

CivilCraft töötab alati ainult sinu arvutis: avamine loeb faili brauseris, salvestamine laadib faili alla. Et avada CivilCraft ilma ühenduseta, salvesta see enne võrguks:

1. Võrgus olles klõpsa rakenduse ülaosas olevat {{ui:Salvesta võrguks}}.
2. Nupp loeb („Salvestamine 12 / 30“) ja näitab siis {{ui:Valmis ka võrguta}}. CivilCraft on väike (umbes 0,6 MB), nii et see võtab hetke. Salvestatud koopias on ka see abi ja näidisala.
3. Ilma ühenduseta ava sama aadress (või selle järjehoidja). Kõik töötab, sealhulgas {{ui:Ava näidisala}}.

Nupu muud olekud:

- {{ui:Salvestamine ebaõnnestus}}: mõned failid ei laadinud alla. Kontrolli ühendust ja klõpsa nuppu uuesti.
- {{ui:Võrguta kasutamine pole saadaval}}: see brauseriaken ei saa hoida võrguta koopiat (privaatsed aknad ja mõned hallatud arvutid blokeerivad seda). Kasuta tavalist akent.

Klõpsa {{ui:Valmis ka võrguta}}, et näha, millal koopia salvestati; saad kaks valikut: {{ui:Salvesta uuesti (võta uusim versioon)}} ja {{ui:Eemalda võrguvälise koopia}}. Salvesta enne objekti külastust uuesti, et koopia vastaks uusimale versioonile. Lisateave: [Võrguta kasutamine](common:offline).

:::offline
Oled praegu võrguühenduseta. Kui CivilCraft on salvestatud võrguks, töötab kõik, sealhulgas näidisala. Kui ei ole, jätka selles vahelehes tööd, aga ära lae seda uuesti enne, kui oled jälle võrgus; ilma salvestatud koopiata ebaõnnestub {{ui:Ava näidisala}} teatega „Näidisala ei saanud laadida“.
:::

:::tip
Välitööks salvesta CivilCraft võrguks ja too punktifailid kaasa sülearvutisse. Projektid ja ekspordid salvestuvad ühenduseta allalaadimistena, nii et võid päeva mõõdistused importida, pinna üle vaadata ja projekti kohapeal salvestada.
:::

Pilvesalvestus pole veel saadaval ja töölauaversioonid pole veel valmis. Praegu on sinu salvestatud failid ainus koopia: hoia neid kohas, mida varundatakse.

## Failis kasutatud lisandmoodulid

Kui salvestad projekti, mis sisaldab lisandmooduli andmeid (Ehitusnõuete märgistused või aadressist objektini allikas), kirjutab fail üles, millised lisandmoodulid ja millised versioonid. Kui avad selle arvutis, millel seda pole, kuvab plaani kohal riba sellest teate ja pakub lisamist sinu konto nimekirjast. See märge on ainult märkus: fail avaneb igal juhul.

## Tagasivõtmine Studiost

Rakenduses CadCraft Studio antakse Studiole teada iga samm, mille lõpetad CivilCraftis, nii et Studio projektitasandi tagasivõtmine saab viimase sammu tagasi võtta mitme rakenduse vahel. Studio võtab sammu tagasi ainult siis, kui CivilCraft'i enda tagasivõtmise virn on täpselt sellises seisus, nagu see samm selle jättis; kui avad mõne muu faili, jätab Studio selle akna vahele.

## Sulgemine salvestamata muudatustega

Kui projektil on salvestamata muudatusi ja sulged vahelehe, laed lehe uuesti või lahkud lehelt, küsib brauser, kas tahad lahkuda. Selle sõnastus ja välimus kuuluvad brauserile ja CivilCraft ei saa neid muuta. {{ui:Uus}} ning projekti või LandXML-faili avamine küsivad seevastu CivilCraft'i enda kastis **Salvestamata muudatused** ja pakuvad {{ui:Loobu}}, {{ui:Ära salvesta}} ja {{ui:Salvesta koopia}}.
