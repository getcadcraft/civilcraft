---
title: CivilCraft parametrai
summary: Pasirinkite nukopijuotų ir įklijuotų taškų eilučių stulpelių tvarką ir failo stulpelių spėjimą, kaip numeruojami įklijuoti taškai, ką rodo taškų žymos, kampo indikatorių, 3D vertikalų perdėjimą, kaip rodoma platuma ir ilguma bei ar žemėlapių sluoksniai ateina iš interneto.
keywords: parametrai, nuostatos, pnezd, penzd, stulpelių tvarka, taškų eilutės, pernumeruoti, taškų numeriai, pradinis numeris, taškų žymos, žymos, aprašymas, aukštis, rodinio kubas, ašies piktograma, kampo indikatorius, kompasas, vertikalus perdėjimas, 3d, platuma, ilguma, dms, dešimtainiai laipsniai, žemėlapių sluoksniai, internetas, privatumas
from: 64b9cb92
---

Atverkite {{ui:Parametrai}} su krumpliaračio piktograma programos juostoje arba {{key:Mod+,}}. Pirmoji kortelė, {{ui:CivilCraft}}, laiko šios programos nustatymus; {{ui:Bendra}} laiko tuos, kuriuos bendrai naudoja visos CadCraft programos (tema, įrankių juosta, skydeliai). CivilCraft nustatymai egzistuoja tik programoje: keičiate juos čia, o ši naršyklė juos prisimena. {{ui:Atstatyti CivilCraft parametrus}} grąžina kiekvieną nustatymą į pradinę būseną.

## Taškų eilutės

**P, N, E, Z, D** (pradžioje) arba **P, E, N, Z, D**: taškas, šiaurinė koordinatė, rytinė koordinatė, aukštis, aprašymas, arba rytinė koordinatė prieš šiaurinę. Ji naudojama trijose vietose:

- **Kopijuoti**: eilutės, kurias CivilCraft deda į sistemos iškarpinę skaičiuoklei.
- **Įklijuoti**: eilutės, įklijuotos iš skaičiuoklės ar teksto failo be antraštės eilutės.
- **Importuoti**: spėjimas dialogo lange **Importuoti taškus**, kai failas neturi antraštės eilutės (failas su keturiais stulpeliais skaitomas kaip PENZ, su trimis – kaip ENZ). Žr. [Taškų failų formatai](topic:point-file-formats).

Antraštės eilutė, kurioje įvardijami stulpeliai, visada laimi, kaip ir pasirinkimas importavimo dialogo sąraše **Stulpeliai**.

## Įklijuotų taškų numeriai

- **Išlaikyti laisvus numerius** (pradžioje): įklijuotas taškas išlaiko savo numerį, jei jo neturi joks taškas; tik kertantys taškai gauna naujus numerius.
- **Visada nauji numeriai**: kiekvienas įklijuotas taškas gauna naują numerį, net jei jo paties numeris laisvas.

**Nauji numeriai prasideda nuo**: palikite tuščią, kad skaičiuotų nuo vieno daugiau nei didžiausias naudojamas numeris. Įveskite numerį, pavyzdžiui 5000, kad nauji taškai gautų numerius nuo 5000; jau naudojami numeriai praleidžiami. Abiem atvejais du taškai niekada nedalijasi numeriu. Žr. [Pasirinkite, kopijuokite ir įklijuokite topografinius taškus](topic:copy-paste-points#point-numbers-never-clash).

## Taškų žymos

Ką rodo taškų žyma, kai {{ui:Taškų žymos}} įjungtos skyriuje **Rodymas**: **Numeris**, **Numeris ir aukštis** arba **Numeris, aukštis ir aprašymas** (pradžioje). DXF, DWG ir PDF eksportai rodo tas pačias žymas kaip ekrane.

## Kampo indikatorius

Kas yra plano ir 3D rodinio kampe: **Rodinio kubas** (pradžioje), **Ašies piktograma** arba **Nėra**.

- **Rodinio kubas** (viršuje dešinėje). Plane jis rodo viršų su kompaso žiedu: N yra tinklelio šiaurė (aukštyn plane). Spustelėkite bet kurią kitą kubo pusę, kraštą ar kampą arba jį vilkite, ir [3D rodinys](topic:site-3d) atsiveria žiūrint iš ten. {{ui:Pradžia}} ant plano kubo pritaiko planą.
- 3D rodinyje kubas sukasi kartu su rodiniu: spustelėkite pusę, kraštą ar kampą, kad žiūrėtumėte iš ten; vilkite kubą, kad sukiotumėte; vilkite kompaso žiedą, kad pasuktumėte apie vertikalę; spustelėkite raidę, kad žiūrėtumėte iš tos pusės, ir naudokite {{ui:Pradžia}} visos vietovės izometriniam rodiniui. Tiesiai žiūrint į pusę, mažos rodyklės pereina į kitą pusę, o lenktos rodyklės pasuka rodinį ketvirtadaliu apsisukimo.
- **Ašies piktograma** (apačioje kairėje): mažas X (rytai) ir Y (šiaurė) žymuo plane, X, Y ir Z (aukštyn) 3D.

## 3D vertikalus perdėjimas

Kiek 3D rodinys ištempia aukščius: **1×**, **2×** (pradžioje), **3×**, **5×** arba **10×**. Sąrašas 3D rodinio juostoje yra tas pats nustatymas, todėl pakeitus bet kurį, pasikeičia abu. Tūriai, profiliai ir 3D eksportai lieka tikru mastu.

## Platuma ir ilguma

Kaip būsenos juosta rodo žymeklio platumą ir ilgumą, kai projektas turi koordinačių sistemą: **laipsniai, minutės ir sekundės** (pradžioje, pavyzdžiui `30°18′00.00″ N`) arba **dešimtainiai laipsniai** (`30.300000° N`). Žr. [Nustatykite projekto koordinačių sistemą](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Žemėlapių sluoksniai iš interneto

**Išjungta** (pradžioje) arba **Įjungta**. Kai įjungta, CivilCraft klausia žemėlapių serverių, kuriuos pridedate, dėl ekrane esančios vietovės paveikslėlių. Jūsų brėžinys lieka šiame kompiuteryje; serveris mato vietovę ir jūsų interneto adresą. Kol tai išjungta, joks žemėlapių serveris nieko neklausiamas, net kai atidarytas projektas jį nurodo; geografiškai susietas paveikslėlis iš failo veikia abiem atvejais. Žr. [Rodyti žemėlapių sluoksnius po planu](topic:map-layers).

## Dirbtinio intelekto asistentai

**Leisti DI asistentams ir scenarijams naudoti CivilCraft** (pradžioje išjungta) leidžia kompiuteryje esančiam asistentui pasiekti atidarytą vietovę per CadCraft Studio: **Skaityti** aprašo vietovę ir pateikia taškus, paviršiaus aukščius, pikietus, profilius, tūrius ir sklypus; **Redaguoti** leidžia jam pasirinkti ir pridėti topografinius taškus; **Įrašyti** ir **Eksportuoti** leidžia jam įrašyti projektą arba įrašyti LandXML ar DWG. **Aplankai, kuriuos jis gali naudoti** (Studio) yra vietos, kur jis gali įrašyti ir eksportuoti. **Veikla** išvardija jo iškvietimus. Žr. [Leiskite DI asistentui dirbti su jūsų vietove](topic:assistants).
