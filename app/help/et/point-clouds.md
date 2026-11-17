---
title: Punktipilved droonilt või skannerilt
summary: Lisandmooduliga Punktipilved saad avada miljonite punktidega LAS- või LAZ-faili, vaadata seda tervikuna, puhastada, jaotada maapinnaks, taimestikuks ja hooneteks ning luua sellest maapinna, samakõrgusjooned ja mahud.
keywords: punktipilv, las, laz, droon, fotogrammeetria, recap, lidar, skannimine, maapind, klassifitseerimine, müra, hunnik, maht, kaevamine ja täitmine, samakõrgusjooned, murdejoon, eye-dome, ortomosaiik, ortho, katmine, kaardikiht, ekspordi las, ekspordi laz, pakkimine
from: e4a4901f
---

Enamik inimesi seda ei vaja, seetõttu on see lisandmoodul. Lülita sisse {{ui:Punktipilved}} jaotises Sätted › Lisandmoodulid; parempoolsesse paneelisse ilmub vahekaart {{ui:Punktipilved}}. Fail loetakse sinu brauseris ja lõigatakse plokkideks, mis hoitakse brauseri enda salvestusruumis (või kaustas, mille valid). **Midagi ei laadita üles.**

:::warning
Kõik, mida see vahekaart näitab, on arv sinu andmetest, mitte sertifikaat. Seda katsetati väljamõeldud objektil, mitte veel päris droonimõõdistusel: vaata esimesi tulemusi ettevaatlikult ja anna meile teada, mida leidsid. Maapinna, samakõrgusjoonte ja mahtude väärtuse otsustab registreeritud spetsialist.
:::

## Pilve avamine

Jaotises {{ui:Ava pilv}} vali LAS- või LAZ-fail. Vahekaart ütleb, mitu punkti fail sisaldab, selle koordinaatsüsteemi ja ühikud ning kui palju ruumi ehitus vajab; vajuta {{ui:Ehita pilv}}. Ehitust saab peatada ja see jätkub nupuga {{ui:Jätka}} (vali sama fail uuesti). Faili ei muudeta kunagi. 100 miljoni punktiga fail ehitatakse töökohaarvutil minutitega ja vajab ruumi umbes sama palju kui fail ise.

Jaotises {{ui:Pilved sellel arvutil}} avad või eemaldad pilve. {{ui:Hoia pilved kaustas…}} (Chrome, Edge ja Studio rakendus) hoiab plokke kaustas, mille valid, näiteks CadCraft'i pilvede kaustas dokumentide hulgas, nii et 10 GB pilv ei pea mahtuma brauseri salvestusruumi; varem ehitatud pilved jäävad sinna, kus need ehitati. Pärast taaskäivitamist küsib brauser loa uuesti: vajuta {{ui:Kasuta kausta … uuesti}}.

## Vaata seda

{{ui:Vaata 3D-vaates}} joonistab pilve jämedatest plokkidest ja täpsustub, kui liigud lähemale, kuid mitte kunagi rohkem kui {{ui:Kõige rohkem joonistatud punkte}} korraga (2,5 miljonit; telefonis 500 tuhat). Värvi saab määrata faili enda värvi, kõrguse, klassi, intensiivsuse või jääkviga järgi. {{ui:Eye-dome valgustus}} varjutab servi sügavuse järgi, nii et kuju on loetav ilma normaalideta (telefonis välja lülitatud); {{ui:Punktid kahanevad kaugusega}} muudab kauged punktid väiksemaks ja lähedased suuremaks; {{ui:Punkti suurus}} määrab suuruse. Plaanil kuvatakse pilv joonise all rastrina ja **täpsustub, kui suumid sisse** selle osale.

## Puhasta see

Jaotises {{ui:Puhasta}} joonista plaanil lasso, kast või hulknurk (või 3D-vaates pealtvaatest: 3D-s võetakse kontuur otse alla, nii et see on täpne ainult ülevalt). Vahekaart näitab, mitu punkti on sees **enne** rakendamist: {{ui:Kustuta need punktid}}, {{ui:Muuda nende klassi}}, {{ui:Taasta kustutatud punktid}} või {{ui:Lõika selle piirjoone järgi}}. {{ui:Võta tagasi}} ja {{ui:Tee uuesti}} liiguvad muutmislogis; fail ise ei muutu kunagi. {{ui:Müra filter…}} märgib eksinud punktid madalate punktidena (klass 7) või kõrge müra punktidena (klass 18).

## Sorteeri see

{{ui:Leia maapind}} töötab plokkhaaval ja märgib maapinna (klass 2) ja madalad punktid; tolerants on 0.15 m või 0.08 m, kui mõõdistuskvaliteedi lüliti on sisse lülitatud. Ta teatab plokkide piiril lahknevatest kohtadest. {{ui:Liigita taimestik ja hooned}} märgib seejärel madala, keskmise ja kõrge taimestiku ning hooned, lähtudes kõrgusest maapinnast ja sellest, kui tasane on ümbrus. Masinõpet ei kasutata, seega võib puude vahel asuv lamekatusega kuur olla valesti märgistatud: vaata üle.

## Maapind, samakõrgusjooned, murdejooned

{{ui:Ehita maapind}} loob olemasoleva maapinna maapinnapunktidest ja lisab selle projekti samal viisil nagu LAS-impordi (üks tagasivõtmise samm). Seejärel võrdleb ta punkte sellega: keskmine, RMS, 95. protsentiil, tolerantsi piires olev osa ning kümme kohta, mis erinevad kõige enam, igaüks koos nupuga {{ui:Mine sinna}}. Värvimine järgi {{ui:Jääkviga}} näitab, kus maapind ja pilv ei ühti.

**Murdejoon** (äärekivi, kraav või kaldaserv) valitakse pilvel: {{ui:Vali murdejoon pilvel}} 3D-vaates võtab iga klõpsuga lähima joonistatud punkti ja {{ui:Vali murdejoon plaanil}} võtab iga klõpsu all lähima pilvepunkti (eelistatult maapinna oma); topeltklõps või Enter lõpetab joone. Järgmine {{ui:Ehita maapind}} kasutab seda. {{ui:Näita samakõrgusjooni}} joonistab samakõrgusjooned pilve peale väikesesse pilti ja määrab projekti intervalli.

## Mahud

{{ui:Hunniku maht…}} arvutab pinna mahu baasi kohal joonistatud piirjoone sees. Joonista piirjoon hunniku ümber tasasel maapinnal ja vali baas: piirjoone madalaim punkt, tasand, sujuv kumer baas, piirjoonest läbiv pind või sisestatud kõrgus. Kaldus või kumeral maapinnal kasuta tasandit või kumerat baasi; madalaim punkt annab liiga kõrge tulemuse. Piirjoone punktid, mis seisavad teistest kõrgemal (puu joonel), jäetakse baasist välja. {{ui:Lennult lennule}} annab kaevamise ja täitmise kahe pilve vahel. Mõlemad saab salvestada CSV-na.

## Ortomosaiik

Jaotises {{ui:Ortomosaiik (pilt pealtvaatest)}} vali drooni ortomosaiik koos maailmafailiga ja `.prj`-failiga, kui neid on: GeoTIFF või PNG või JPEG. See muutub projekti **kaardikihiks**, nii et plaan näitab seda sinu joonise all, ja 3D-vaade (värv {{ui:Kaart}}) katab selle ehitatud maapinna, seetõttu ehita enne {{ui:Ehita maapind}}. Vahekaart ütleb, kui suure osa pilvest pilt katab, ja hoiatab, kui ei kata ühtegi: tavaline põhjus on teistsugune koordinaatsüsteem, seega anna kaasa `.prj`-fail. Kui `.prj` puudub, küsib programm, kus koordinaadid on. Pilt hoitakse projektifailis; GeoTIFF üle 200 MB lükatakse tagasi ja väga suur mosaiik vähendatakse 16 megapikslini, seega suure mõõdistuse puhul lõika mosaiik enne kohale.

## Eksport

{{ui:Ekspordi}} kirjutab puhastatud ja klassifitseeritud pilve uue failina (kõik punktid, puhtad klassid või ainult maapind). Jaotises {{ui:Failitüüp}} vali:

- **LAS 1.4 (tihendamata)**: punktivorming 6 või 7 koos värviga.
- **LAZ (tihendatud)**: samad punktid kaotusteta tihendatult, nii et iga punkt tuleb täpselt tagasi. See kirjutatakse punktivormingus 0 või 2 koos värviga LAS 1.4 faili sees. Väljamõeldud 300 m objektil oli LAZ umbes viiendik LAS 1.4 faili suurusest. LAZ-vormingud 0 ja 2 hoiavad ainult klasse 0 kuni 31: kõrgema klassiga punkt lükatakse tagasi koos teatega, seega ekspordi selline pilv LAS 1.4-na.

LAZ kirjutab CadCraft'i enda tihendaja, mis on tehtud avaldatud LAZ-spetsifikatsiooni järgi. Oleme kontrollinud, et meie oma lugeja ja kaks sõltumatut LAZ-lugejat (laz-perf, mida rakendus kasutab LAZ-failide avamiseks, ning laspy koos lazrs-iga) loevad iga punkti täpselt tagasi ja et laspy tehtud LAZ-failid on baitide kaupa identsed, kui nende punktid uuesti kirjutame. Teisi programme pole veel proovitud, seega kui mõni ei ava faili, anna meile teada, milline.

Kui brauser saab faili kirjutada juba töö käigus, valid faili enne ja väga suur pilv kirjutatakse sinna plokkhaaval, selle asemel et koguda see mällu; muidu fail kogutakse ja laetakse alla, mis on kuni mõne sajani megabaidini sobiv.

## Mida see ei tee

See loeb ainult LAS- ja LAZ-faile (E57, PLY ja PCD pole selle vahekaardiga veel ühendatud ning ühe lennu mitut faili ei liideta), ei teisenda pilve koordinaatsüsteemi (eeldatakse projekti süsteemi ja meetreid), ei loe Autodeski RCP- ega RCS-faile, ei loo pinda fotodest ega leia ise poste, äärekive ega torusid.
