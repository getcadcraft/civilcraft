---
title: Mõõdistuspunktide valimine, kopeerimine ja kleepimine
summary: Vali mõõdistuspunkte klõpsu, Shifti ja kastiga või kõik korraga; kopeeri, lõika, kleebi, kleebi samasse kohta, dubleeri ja kustuta neid uute, kunagi kattumata punktinumbritega; kleebi punktiridu tabelarvutusest ja tabelarvutusse.
keywords: kopeeri, kleebi, lõika, dubleeri, kustuta punktid, vali punktid, vali kõik, kastvalik, aken, lõikelaud, tabelarvutus, csv, nummerda uuesti, punktinumbrid, kleebi samasse kohta, kloon, väljamärkimine
from: 78a6aea7
---

Mõõdistuspunkte saab kopeerida ja kleepida projekti sees, kahe CivilCrafti brauseri vahekaardi vahel ning tabelarvutusse ja sealt. Iga muudatus on üks võtmistagasi samm ning pind koostatakse uutest punktidest kohe uuesti.

## Punktide valimine

Tööriistaga {{ui:Vali}} ({{key:V}}):

- **Klõpsa** punktil, et see valida (ja ainult see). Selle numbrid näidatakse jaotises **Omadused**.
- {{key:Shift}} ja **klõps** lisab punkti valikusse või eemaldab selle.
- {{key:Shift}} ja **lohistamine** joonistab kasti: selle sees olevad punktid lisatakse valikusse. Kui lohistad punktide ümber, tekib lasso; vaata [Mõõdistuspunktide lassovalik](topic:lasso-selection). Lohistamine ilma {{key:Shift}}-ita nihutab vaadet nagu alati.
- {{key:Mod+A}} (või {{ui:Veel}} › {{ui:Vali kõik punktid}}) valib kõik punktid.
- {{key:Esc}} (või {{ui:Veel}} › {{ui:Tühista valik}}) tühjendab valiku.

Valitud punktidel on rõngas. Kui on valitud rohkem kui üks, näitab **Omadused** nende arvu, numbreid, kõrgusvahemikku ja gruppe.

## Kopeerimine, lõikamine ja kustutamine

- {{ui:Kopeeri}} või {{key:Mod+C}} kopeerib valitud punktid. CivilCraft hoiab koopiat ning paneb selle ka süsteemi lõikelauale punktiridadena, nii et saad selle kohe kleepida tabelarvutusse või tekstifaili.
- {{ui:Veel}} › {{ui:Lõika}} või {{key:Mod+X}} kopeerib need ja kustutab need ühe sammuga.
- {{ui:Veel}} › {{ui:Kustuta}} või {{key:Delete}} kustutab need. {{key:Mod+Z}} toob need tagasi.

Read on punkt, põhjakoordinaat, idakoordinaat, kõrgus, kirjeldus (P,N,E,Z,D), eraldatud komadega ja kolme komakohaga. Et idakoordinaat tuleks enne põhjakoordinaati, määra jaotises [CivilCrafti sätted](topic:settings) **Punktiread**. Kirjeldus, mida tabelarvutus käsitleks valemina (algab märgiga =, +, - või @), saab ette ülakoma, et see jääks tekstiks.

## Kleepimine

1. Vajuta {{key:Mod+V}} või klõpsa {{ui:Kleebi}}. Punktid järgnevad kursorile väikeste ristidena, punktiirjoonega tagasi algusesse.
2. Klõpsa kohta, kuhu need peavad minema. Kopeeritud punktide keskkoht satub klõpsule.
3. Või vajuta {{key:Enter}}, et need paigutada nende enda koordinaatidele, või {{key:Esc}}, et tühistada.

{{ui:Veel}} › {{ui:Kleebi samasse kohta}} või {{key:Mod+Shift+V}} kleebib punktid kohe nende enda koordinaatidele. Kleebitud punktid valitakse pärast seda, nii et saad neid uuesti kopeerida, teisaldada või kustutada.

:::note
Tööriistaribal {{ui:Kleebi}} klõpsamine loeb süsteemi lõikelauda. Esimesel korral võib brauser küsida, kas CivilCraftil on lubatud lõikelauda näha. Kui keeldud, kleebib tööriistaribanupp ainult CivilCrafti enda koopia; {{key:Mod+V}} kleebib tabelarvutuse read ikka küsimata.
:::

## Punktinumbrid ei kattu kunagi

Kaks punkti ei jaga kunagi numbrit. Kleepimisel:

- Kleebitud punkt säilitab oma numbri, kui projektis ei ole ühtegi punkti selle numbriga. Seega pärast **Lõika** kleebitakse punktid tagasi oma numbritega ning teisest projektist kopeeritud punktid säilitavad oma numbri seal, kus see on vaba.
- Kleebitud punkt, kelle number on hõivatud, saab uue täisarvu: ühe võrra suurema kui kasutuses olev suurim number, lugedes edasi.
- Olekuriba ütleb, mis juhtus, näiteks „1 säilitas oma numbri; 9 said uued numbrid: 10–18 said 277–285“.

Jaotises [CivilCrafti sätted](topic:settings) saad valida **Alati uued numbrid** ja numbri, millest uued numbrid alustavad, näiteks 5000 projekteerimispunktide jaoks.

:::warning
Punktigrupid, mis koostavad pinna **murdejoonena**, ühendavad oma punktid numbrijärjekorras. Kleebitud murdejoone punktide koopiad (näiteks FL-mõõdud) saavad uued, kõrgemad numbrid ja liituvad selle murdejoone lõpuga, võimalik et pika hüppega. Vaata pärast selliste punktide kleepimist plaani üle või sea nende grupi kasutuseks {{ui:Punktid}}.
:::

## Dubleerimine

{{ui:Veel}} › {{ui:Dubleeri}} või {{key:Mod+D}} teeb valitud punktidest koopia, mis järgneb kursorile: klõpsa kohta, kuhu see peab minema. Koopiatele antakse alati uued numbrid ning CivilCrafti lõikelaud jääb samaks.

## Tabelarvutusest või tekstifailist

Vali punktiread tabelarvutuses (punkt, põhjakoordinaat, idakoordinaat, kõrgus, kirjeldus) ja kopeeri need. CivilCraftis vajuta {{key:Mod+V}} ja klõpsa kohta, kuhu need peavad minema, või vajuta {{key:Mod+Shift+V}}, et need paigutada nende enda koordinaatidele, mis on tavaliselt see, mida soovid päris mõõdistusandmete puhul.

Read loetakse täpselt nagu [punktifail](topic:point-file-formats): komad, tabulaatorid või tühikud, päisrida, kui see on. Ilma päiseta tuleb veergude järjekord jaotisest **Punktiread** [CivilCrafti sätetest](topic:settings).

Kui mõlemad on olemas, otsustab CivilCraft selle järgi, mis on uuem: lõikelaua read, mis erinevad CivilCrafti viimasest koopiast, kopeeriti hiljem ja need kleebitakse. Tekst, milles punkte ei ole, ignoreeritakse ja kleebitakse hoopis CivilCrafti enda koopia.

## Projektide ja vahekaartide vahel

Koopia hoitakse selles brauseris, nii et CivilCrafti teine vahekaart saab selle kleepida ka pärast esimese vahekaardi sulgemist. Meetrites projektist kopeeritud punktid, mis kleebitakse jalgades projekti, säilitavad oma numbrid nagu need on: midagi ei teisendata ja olekuriba ütleb seda.

## Mida ei kopeerita

Praegu kopeeritakse ainult mõõdistuspunkte. Trasse, platse, torustikke, murdejooni ja piire ei saa veel kopeerida ega kleepida. Kleepimine ei saa olemasolevaid punkte liigutada: kasuta {{ui:Lõika}} ja kleebi või teisalda üks punkt korraga ([Mõõdistuspunkti muutmine](topic:edit-points)).
