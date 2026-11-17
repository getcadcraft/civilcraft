---
title: Tõrkeotsing
summary: Sümptomid, põhjused ja lahendused CivilCraftis esinevate probleemide kohta koos rakenduse täpsete teadetega.
keywords: probleemid, vead, ei tööta, lahendus, abi, teated, tõrkeotsing, keeldutud, puudu, vale, vahetatud, samakõrgusjooned puuduvad
from: a9f7dedc
---

Teated ilmuvad olekuribal paremal all, vasaku ja parema paneeli kastides ning dialoogides. Need on siin tsiteeritud täpselt nii, nagu rakendus neid näitab.

## Failide avamine

**„See fail on suurem kui 200 MB; CivilCraft ei ava veel nii suuri faile.“**
Jaga punktifail osadeks või vähenda andmeid enne avamist.

**„Faili site.json ei saanud avada: See ei ole CivilCrafti projektifail.“**
Fail lõpeb `.json`-iga või algab `{`-ga, kuid see ei ole CivilCrafti projekt. Punktifailid ei tohi alata märgiga `{`.

**„Faili … ei saanud avada: See projektifail on uuemast CivilCraftist (versioon 2).“**
Projekt salvestati uuema versiooniga. Ava see seal või ekspordi sellest LandXML.

**„Faili … ei saanud avada: See on XML, kuid mitte LandXML (juurelement on <…>).“**
See on muud tüüpi XML. Ekspordi LandXML teisest programmist.

**„… ei sisalda CivilCrafti loetavaid punkte, TIN-pindu ega trasse.“**
Kõik failis on sellised, mida CivilCraft vahele jätab (näiteks ainult ruudustikpinnad või ainult spiraaltrassid). Ülejäänud teade ütleb, mis seal oli. Vt [LandXML: mida loetakse ja kirjutatakse](topic:landxml-reference).

**„Näidist ei saanud laadida: …“**
{{ui:Ava näidisala}} loeb faili CadCraft'i lehelt. Ilma ühenduseta töötab see ainult siis, kui CivilCraft on salvestatud võrguta kasutamiseks (rakenduse ribal olev nupp näitab {{ui:Valmis ka võrguta}}). Mine võrku, klõpsa {{ui:Salvesta võrguks}} ja edaspidi töötab see ka võrguta. Vt [Võrguta](common:offline).

**{{ui:Salvesta võrguks}} näitab {{ui:Salvestamine ebaõnnestus}}.**
Mõned failid ei laadinud alla. Kontrolli ühendust ja klõpsa nuppu uuesti.

**{{ui:Salvesta võrguks}} näitab {{ui:Võrguta kasutamine pole saadaval}}.**
See brauseriaken ei saa hoida võrgukoopiat, tavaliselt seetõttu, et see on privaatne aken või arvutit hallatakse. Ava CivilCraft tavalises aknas.

**Võrguta ei avane rakendus üldse.**
Seda ei ole selles brauseris võrguks salvestatud või brauser on kustutanud selle saidi andmed (Safari teeb seda saitide puhul, mida ei ole mitme nädala jooksul külastatud). Mine võrku, ava CivilCraft ja klõpsa {{ui:Salvesta võrguks}}.

**Võrgukoopia on vanem versioon.**
Klõpsa {{ui:Valmis ka võrguta}}, seejärel {{ui:Salvesta uuesti (võta uusim versioon)}} võrgus olles.

**Fail on avamisaknas hall.**
Aken loetleb faile lõppude järgi ainult punktifailid, LandXML ja projektifailid. Lohista fail hoopis plaanile või nimeta see ümber `.txt`-faili.

## Punktide importimine

**„Sellest failist ei õnnestunud ühtegi punkti lugeda.“**
Vali **Veerud** jaotises veergude järjestus käsitsi. Kui miski ei aita, ava fail tekstiredaktoris ja kontrolli, et igal real on üks punkt ja selles on numbrid.

**Ala näib peegeldatud, pööratud või ühele joonele venitatud.**
Põhjakoordinaat ja idakoordinaat on vahetatud. Kokkuvõttes oli öeldud „arvatud veergude arvu järgi“. Vali **Veerud** jaotises PENZD asemel PNEZD (või vastupidi) või impordi uuesti.

**Punktid on teistest kaugel ja plaan on suumitud välja punktini.**
Real on koordinaadis kirjaviga või fail segab koordinaatsüsteeme. Leia punkt (klõpsa sellel, et näha selle numbrit) ja paranda fail.

**Read, mis on loetletud jaotises „Lugemata read“.**
Vt tabelit lehel [Mõõdistuspunktide importimine](topic:import-points#rows-that-are-not-read).

**Mu vanad punktid on kadunud.**
Punktifaili importimine asendab kõik punktid ja tühjendab tagasivõtmise. Saad need tagasi, kui avad salvestatud projekti.

## Pind

**„Pind: pole koostatud“ punase kastiga.**
Kast ütleb, miks: „Pind vajab vähemalt kolme punkti kõrgusmärkidega.“, „Kõik punktid on ühel joonel: kolmnurki ei tule.“, „Kõrgusmärkidega punkte ei ole.“, „Piir ei kattu punktidega.“ või „Piiri sees ei jää ühtegi kolmnurka.“ Kontrolli veergude järjestust, punktirühmi (kas need on {{ui:Jäetakse välja}}?) ja piiri.

**Samakõrgusjooned lõikuvad otse üle kraavi või harja.**
See joon ei ole murdejoon. Määra selle rühmaks {{ui:Murdejoon}} või joonista see tööriistaga {{ui:Murdejoon}}. Vt [Pinna koostamine ja täpsustamine](topic:build-surface).

**Murdejoone rühm joonistab sikksakki.**
Rühmas on mitu joont või selle punktid pole joone järgi nummerdatud. Määra rühm tagasi {{ui:Punktid}}-iks ja joonista iga joon tööriistaga {{ui:Murdejoon}}.

**Pikad kitsad kolmnurgad välisserva ääres.**
Joonista piir ({{key:O}}) või määra **Pikim välisserv**.

**Samakõrgusjooni ei ole üldse, kuigi pind on koostatud.**
Kas {{ui:Samakõrgusjooned}} on jaotises **Kuva** välja lülitatud, või on intervall nii väike, et samakõrgusjoonte tasemeid oleks üle 2,000. Vali suurem intervall.

**Murdejooned või piir ei muuda midagi.**
Pind tuli LandXML-ist („Pind (LandXML-ist)“). Seda kasutatakse nagu see on. Klõpsa {{ui:Koosta pind uuesti punktidest}}, et selle asemel koostada pind punktidest.

**„Pinda veel pole: ava kõigepealt mõõdistuspunktid.“**
Murdejoon, piir ja platvorm vajavad olemasolevat maapinda. Impordi kõigepealt punktid.

**„Klõpsa mõõdistuspunkti kõrgusmärgiga: murdejoon võtab punktide kõrgusmärgid.“**
Tööriist {{ui:Murdejoon}} valib ainult mõõdistuspunkte. Suumi sisse ja klõpsa punktil (oranž ruut näitab, milline punkt võetakse).

## Joonistamine

**Mu viimane punkt kadus, kui lõpetamiseks topeltklõpsasin.**
Selles versioonis lõpetab topeltklõps trassi, platvormi, murdejoone või piiri, kuid jätab topeltklõpsatud punkti välja. Klõpsa viimasel punktil üks kord ja vajuta {{key:Enter}}. Kui see juba juhtus, kasuta {{key:Mod+Z}} ja joonista siis uuesti.

**Tahvelarvutis ei saa joonistust lõpetada.**
Lõpetamiseks on vaja {{key:Enter}}-it; ekraanil nuppu veel ei ole. Ühenda klaviatuur. Vt [Hiir, puuteplaat ja puuteekraan](topic:keyboard#mouse-trackpad-and-touch).

**Punkti paigutamiseks lohistamine hoopis nihutab vaadet.**
Lohistamine rohkem kui mõne piksli võrra nihutab plaani igas tööriistas. Klõpsa ilma liigutamata.

**„Trass vajab vähemalt kahte punkti.“ / „Platvorm vajab vähemalt kolme nurka.“ / „Torulõik vajab vähemalt kahte rajatist.“**
Vajutasid {{key:Enter}} liiga vara. Joonistus visatakse ära; alusta uuesti.

**Klahvid nagu A või G ei tee midagi.**
Tekstikast või paneeli loend on endiselt fookuses, nii et tähed lähevad sinna. Klõpsa korra plaanil ja vajuta siis klahvi. Macis on kustutusklahv brauseris Backspace, seega valiku kustutamiseks kasuta Fn ja delete.

## Trassid ja pikiprofiilid

**„Kõverad PI 2 ja PI 3 juures kattuvad: … Kasuta väiksemaid raadiusi.“**
Kaks kõverat vajavad rohkem puutujat, kui nende PI-de vahel on. Vähenda ühe või mõlema raadiust PI-tabelis või liiguta PI-sid lahku.

**„PI 3 pöördub otse tagasi; sinna ei saa kõverat panna.“**
Trass pöördub selles PI-s iseendale tagasi. Liiguta või eemalda PI.

**„Selle trassi all ei ole maapinda, millest alustada.“**
Trass on pinnast väljas. Liiguta see pinnale või lisa PVI-d, klõpsates nupu {{ui:Lisa PVI-d}} ollessa sisse lülitatud.

**„Vertikaalkõver PVI 3 juures (L = …) algab enne, kui eelnev kõver või PVI lõpeb.“ / „… ulatub üle järgmise PVI.“**
Lühenda kõvera pikkust või liiguta PVI-d lahku.

**„Juba on PVI kohas …“**
Sellel pikettil on PVI. Klõpsa mujal või lohista olemasolevat.

**Pikiprofiilivaade on tühi: „Joonista trass, et näha selle profiili.“**
Trassi pole, või valitud trassil on vigu.

## Koridorid ja platvormid

**„Koridor vajab projekteerimisprofiili ilma vigadeta.“**
Alusta projekteerimisprofiili ({{ui:Alusta maapinnast}}) ja paranda kõverate kattumised.

**„… külgnõlvad lähevad pinnast välja enne maapinnaga kohtumist.“ / „… nõlvajooned lähevad pinnast välja enne selle kohtamist …“**
Planeerimine jõuab pinna servani enne maapinnaga kohtumist. Nihuta projekt servast sisemaale või too see maapinnale lähemale. Uus platvorm, mis joonistati osaliselt pinnast välja, võib alata kõrgusmärgilt 0: sisesta tegelik kõrgusmärk.

**„Koridori päevajooned ristuvad …“ / „Päevajoon ristub iseendaga …“**
Erinevatest külgedest tulevad nõlvad kokku: kitsad kõverad, kitsad platvormid, sügavad kaevised või kõrged täited. Kasuta suuremat raadiust, kitsamat koosti, laiemat platvormi või järsemaid nõlvu.

**Mahusid veel ei ole: platvorm peab planeeruma ilma probleemideta.**
Paranda punase kasti ülal loetletud probleemid.

**{{ui:Projekteeritud (planeeritud)}} on hall.**
Ühtegi platvormi ega koridori pole veel planeeritud.

## Torud

**„P2-l ei ole veel sisepõhju.“**
Klõpsa {{ui:Sea selle sisepõhjad reeglite järgi}} või sisesta sisepõhjad.

**„P1: S1 juures ei ole maapinda, millest alustada.“**
Ülesvoolu rajatis on pinnast väljas ja sellel ei ole äärt. Sisesta sellele ääris.

**Pärast rajatise liigutamist on kõik torud märgistatud.**
Rajatise liigutamine ei muuda sisepõhju. Klõpsa {{ui:Sea kõik sisepõhjad reeglite järgi}}.

Kõik võrgu teated on selgitatud jaotises [Gravitatsioonilise torustiku planeerimine](topic:pipe-network#read-and-fix-problems).

## Salvestamine ja eksportimine

**„Eksportida pole veel midagi.“ / „Väljatrükkimiseks pole veel midagi.“**
Projekt on tühi. Impordi kõigepealt punktid.

**Ma ei leia salvestatud faili.**
See on brauseri allalaadimistes (tavaliselt kaustas Allalaadimised). Vt [Failid, mida saab avada, salvestada ja eksportida](topic:files#where-the-files-go).

**PDF-i mõõtkava on paberil vale.**
Trüki 100% või tegelikus suuruses, mitte „sobita lehele“.

**PDF-i tekstis on küsimärke.**
Nimedes või kirjeldustes on Lääne-Euroopa märgistikust väljapoole jäävad märgid. Olekuteade loeb need kokku. Nimeta ümber lihtsate märkidega.

**Väljatrükk on servadest ära lõigatud.**
Mõõtkava on lehe jaoks liiga suur. Vali mõõtkava, mis on märgitud „(sobib)“, suurem leht või {{ui:Mis on ekraanil}}.

**{{key:Mod+P}} avas brauseri printimisdialoogi.**
Lehel ei olnud fookust. Sulge dialoog, klõpsa plaanil ja vajuta {{key:Mod+P}} uuesti või klõpsa {{ui:PDF}}.

## Rakendus ise

**Ekraan on tühi või tööriistariba ei tee midagi.**
Kasuta Chrome'i, Edge'i, Firefoxi või Safari uusimat versiooni ja laadi leht uuesti. Vt [Brauserid](common:browsers).

**Rakendus on suure punktifailiga aeglane.**
Lülita välja {{ui:Kolmnurgad}}, {{ui:Punktide sildid}} ja {{ui:Kõrgusvööndid}} ning kasuta suuremat samakõrgusjoonte intervalli. Väga suurte pindade koostamine pärast iga muudatust võtab mõne hetke.

**Brauser küsib „Kas lahkud lehelt?“**
Projektis on salvestamata muudatusi. Jää lehele, salvesta klahvidega {{key:Mod+S}} ja lahku siis.
