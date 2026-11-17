---
title: Paiguta päikesepaneelid maapinnale
summary: Paiguta maapinnale rajatud päikesepaneelialused kinnistusse või platsi sisse. Read paigutatakse maapinna järgi, järsk maapind jäetakse tühjaks, aasta energia arvutatakse ning alused kuvatakse plaanil ja 3D-vaates.
keywords: päikesepaneel, pv, fotogalvaaniline, päikeseväli, maapinnale paigaldus, paneelialused, read, reavahe, varjutus, maapind, kalle, vaiad, saagis, kWp, energia, horisont
from: 95593fd6
---

## Mida õpid

Kuidas paigutada päikesepaneelialuste väli ebatasasele alale ja mida arvud tähendavad. Ava see menüüst Pind › Veel › Päikesepaneelide väljad.

## Paiguta paneelialused

1. Vali **Kus**: projekti kinnistu või plats või sisesta ala nurgad. Märgi ära kõik platsid või kinnistud, mis peavad jääma **tühjaks** (hoone, tiik).
2. Sisesta ala **laiuskraad ja pikkuskraad**. Päike sõltub neist; midagi ei oleta. Kui projektil on koordinaatsüsteem, täidab **Paiguta koordinaatsüsteemi järgi** need väljad ise.
3. Määra kalle, suund (tühi tähendab ekvaatori poole), mitu moodulit moodustavad ühe paneelialuse ning mooduli võimsus ja mõõtmed. Mooduli arvud on algul üldised väärtused ja on nii märgistatud; sisesta oma.
4. Vajuta **Paiguta paneelialused**. Aken näitab paneelialuste ja moodulite arvu, suurust kWp-des ja reavahet.

Iga paneelialus on ala sees oma veerg, mis paigutatakse algusest ja liigutatakse tagasi. Paneelialus paigutatakse ainult kohta, kus maapind selle all jääb lubatud kalde piiresse, ala ja tagasiastte sisse ning kus vajalikud vaiad ei ole sinu määratud piirist kõrgemad. Kohad, kus see ei õnnestu, jäetakse tühjaks ja aken ütleb, mitu neid on ja miks.

## Read on paigutatud maapinna järgi

Tasasel maal on read tavapärase varjuvaba reegli järgi üksteisest eraldatud: rea vari keskpäeval talvisel pööripäeval ei tohi ulatuda tagumise rea alumise servani. Kaldel rakendab CivilCraft sama reeglit maapinnale, millel järgmine rida tegelikult seisab. Kui maapind tõuseb paneelialuse taga, võivad read seista lähemal; kui see langeb, seisavad need kaugemal. Aken näitab kõige lähemat, kaugemat ja keskmist vahet koos tasase maa vahega, nii et näed, mida maastik muutis.

Paneelialuse tasapinda tõstetakse vaiadel, kuni iga selle all olev punkt jääb maapinnast sinu määratud vabaruumist kõrgemale. Kõige kõrgem vai kuvatakse tulemuses.

## Aasta energia

**Aasta energia** arvutab kaldtasapinnale langeva valguse iga kuu esindusliku päeva kohta, elemendi temperatuuri, sisestatud kaod, paneelialuste üksteise varjutamise ning horisondil olevad künkad, mis varjavad päikest. Taevas on selge, seega on vastus ülemine piir; tegelik ilm annab vähem. See on projekteerimise algfaasi hinnang, mitte saagiaruanne.

## Salvesta

**Salvesta projekti** jätab sisendid ja arvud projektifaili; paneelialused arvutatakse faili avamisel maapinna järgi uuesti, nii et muudetud pind nihutab neid. Need kuvatakse plaanil ja 3D-vaates (Kuva › Päikeseväljad). Paneelialuste loend laaditakse alla CSV-na. Üks tagasivõtmise samm eemaldab või taastab välja.

## Veel valmis pole

Ilmaandmed selge taeva asemel, paneelialused, mis järgivad maapinda ida-lääne suunas, jälgijad ning elektriprojekt (stringid, juhtmed, inverterid) CivilCraftis. BimCraft'i Solar PV paneelil on katuste jaoks stringid ja ühejooneskeem.
