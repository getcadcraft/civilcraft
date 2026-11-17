---
title: Horisontaaltrassi koostamine
summary: Joonista trass selle PI-de järgi, määra kõverate raadiused ja alguspikett, teisalda PI-sid ning loe kõverate andmeid ning pikketti ja nihet.
keywords: trass, lahendus puudub, kõver ei mahu, suurim raadius, väikseim raadius, miinimumraadius, projekteerimiskiirus, kattumine, telg, PI, horisontaalkõver, raadius, pikettimine, sirglõik, loo trass, trassi paigutus, PC, PT, pikett, nihe
from: 8c5df4aa
---

Trass CivilCraftis on sirglõikude ahel läbi lõikepunktide (PI), kusjuures igal sisemisel PI-l, millel on raadius, on ringjoonekujuline kõver. Trass on piketeeritud valitud alguspiketist lähtudes. Projektil võib olla palju trasse.

## Trassi joonistamine

1. Vajuta {{key:A}} või klõpsa rühmas **Projekteerimine** nupule {{ui:Trass}}.
   Vihje ütleb: „Trass: klõpsa PI-d järjekorras. Enter või topeltklõps lõpetab, Backspace eemaldab viimase, Esc tühistab.“
2. Klõpsa esimesele PI-le (trassi algusele).
3. Klõpsa järgnevatele PI-dele järjekorras. Punane joon käib kursori järel ja näitab joonistatava sirglõigu pikkust ja suunda, näiteks „212.40 ft  N 63°12'05" E“.
4. Klõpsa viimasele PI-le (trassi lõpule).
5. Vajuta {{key:Enter}}.
   Trass joonistatakse piketeeritult ja on valitud. Olekuriba ütleb näiteks „Trass 1: 386.36 ft, kõverad 100 ft raadiusega seal, kus need mahuvad. Muuda raadiusi atribuutides; Pikiprofiil (R), et kujundada selle kalle.“

Joonistamise ajal: {{key:Backspace}} eemaldab viimase PI, {{key:Esc}} tühistab ning lohistamine tühjal alal nihutab vaadet ilma PI-d lisamata.

:::warning
Lõpeta klahviga {{key:Enter}}. Topeltklõps lõpetab ka, kuid selles versioonis eemaldab topeltklõpsatud PI-i. Klõpsa viimasel PI-l üks kord ja vajuta seejärel {{key:Enter}}.
:::

Iga sisemine PI saab 100 ft kõvera (meetrites projektis 30 m) või suurima täisarvulise raadiuse, mis mahub poole igast sirglõigust, kui 100 ft ei mahu. Väga teravad või sirgelt läbivad PI-d kõverat ei saa.

## Raadiuste ja koordinaatide määramine

Kui trass on valitud, näitab parempoolne paneel **Trass**'i:

1. **Nimi** ja **Alguspikett**. Sisesta pikett kujul `10+00` (jalad) või `0+500` (meetrid) või lihtne number. Vaata [Ühikud, pikettid ja arvuvormingud](topic:units-and-stations).
2. **Pikkus** ja **Lõpppikett** arvutatakse sinu eest.
3. **PI-de** tabel loetleb iga PI **Idakoordinaadi** ja **Põhjakoordinaadi** ning iga sisemise PI **Raadiuse**. Sisesta uus väärtus ja vajuta {{key:Enter}}.
   - Raadius 0 teeb nurgapunkti ilma kõverata.
   - Esimesel ja viimasel PI-l ei ole kunagi raadiust.
   - Rea lõpus olev väike x eemaldab selle PI (trassil on vähemalt kaks).
4. Loe **Kõverate** loendit: iga kõvera kohta tema PC ja PT pikketid, raadius R, kõrvalekalle Δ ja suund (vasak või parem), pikkus L, tangens T, väline E ja kõõl.
5. Kõverate all olev rida annab esimese sirglõigu suuna.

## Kui kõver ei mahu

Kui kõverad vajavad PI-de vahel rohkem tangenssi, kui seal on, siis trassil pole lahendust: seda ei joonistata õigesti, kuni sa selle ei paranda, ja see jäetakse LandXML-i ekspordist välja. Punane kast ütleb põhjuse arvudega ja pakub, mis mahuks:

- „Kõverad PI 2 ja PI 3 juures vajavad nende vahel 240.00 ft tangenssi (130.00 + 110.00), kuid PI-d on 180.00 ft kaugusel.“ — või, kui neist ainult ühel on kõver, „Kõver PI 2 juures vajab 240.00 ft tangenssi PI 1 suunas …“.
- Iga PI nupp seab sealse **suurima mahtuva raadiuse**, teine kõver jääb samaks (see peab mahtuma ka PI teise sirglõiku). Kui mõlemal PI-l on kõverad, kahandab **Mõlemad** kaks raadiust proportsionaalselt, nii et need just kokku puutuvad.
- Kui üksainus kõver on pikem kui tangens, ütleb kast, et teisel PI-l ei saa ühtegi kõverat, kui see on nii suur.
- PI, mis pöörab otse tagasi, ei saa kõverat; kast pakub **Ilma kõverata PI n**.

Iga nupp on üks samm: {{key:Mod+Z}} taastab raadiused. Pakutud raadiused ümardatakse alla 0.01-ni, et need alati mahuksid.

### Projekteerimise miinimumraadius

Sisesta **Miinimumraadius** (näiteks projekteerimiskiiruse järgi), et iga kõver selle vastu kontrollitaks; tühjaks jätmisel kontrolli ei tehta. Selle alla jääv kõver on loendis koos nupuga **väikseima raadiuse, mis vastab miinimumile**, kui see raadius mahub. Kui see ei mahu, ütleb kast seda ja annab suurima raadiuse, mida tangensid lubavad, et sa teaksid PI-d liigutada või miinimumi alandada.

## Liiguta PI-sid plaanil

1. Kui {{ui:Vali}} on aktiivne, klõpsa trassil, et see valida. Ruudukujulised käepidemed ilmuvad PI-de juurde.
2. Lohista käepidet. Trass, selle piketeerimine, profiil ja koridor järgnevad.
3. Vabasta. Liigutus on üks tagasivõtmise samm.

Kahe olemasoleva PI vahele uue PI lisamine pole veel saadaval: eemalda trass ja joonista uuesti või sisesta olemasolevatele PI-dele uued koordinaadid.

## Loe pikett ja nihe

Liiguta kursor plaanil. Olekuriba näitab lähimat trassi (või valitud trassi) koos piketi ja nihkega, **L** või **R** vaadates piketi suunas, näiteks „Trass 1: pk 2+15.30, nihe 18.42 R“. Kummastki otsast kaugemal lisab ta „(otsast väljas)“.

## Mida joonistatakse

Plaanil, DXF-is ja PDF-is: telgjoon (sirglõigud joontena, kõverad tõeliste kaartena), märk iga 50 ft (20 m) järel, pikem märk ja piketisilt iga 100 ühiku järel ning PC- ja PT-märgid koos pikettidega.

## Trassi kustutamine

Vali see ja vajuta {{key:Delete}} või klõpsa tööriistaribal või parema paneeli all nupule {{ui:Kustuta}}. Selle profiil ja koridor kaovad koos sellega. {{key:Mod+Z}} toob selle tagasi.

:::mac
Macis ei kustuta klahv, mis on märgistatud **delete**, brauseris valikut ({{key:Backspace}}). Vajuta {{key:Delete}} (Fn ja delete) või kasuta nuppu {{ui:Kustuta}}.
:::

## Järgmine

- [Koosta vertikaalprofiil](topic:profile).
## Projekteerimiskiirus ja klass

Trassi atribuutide all hoitakse **Projekteerimiskiirust** (km/h või mph) ja **Projekteerimisklassi** trassiga koos; need salvestatakse projekti ja kirjutatakse IFC-sse (Pset_RoadDesignCriteriaCommon). CivilCraftis pole tabelit, mis seoks kiiruse miinimumraadiusega, seega neist ei kontrollita midagi: sea **Miinimumraadius** oma projekteerimisstandardi järgi.

## Spiraalid

Kõveral võib olla klotoidspiraal kummalgi otsal: sirglõik, spiraal, kõver, spiraal, sirglõik. PI-tabelis sisesta PI-le, millel on raadius, pikkus väljadele **Spiraal sisse** ja **Spiraal välja**. PI jääb paika; kõver liigub ruumi tegemiseks sisse, nii et tangensi kaugus kasvab spiraali nihke võrra. Kaks pikkust võivad erineda ja PI, millel on ainult üks pikkus, saab spiraali ainult sellel otsal.

Kõverate loend näitab siis TS, SC, CS ja ST (sirglõik–spiraal, spiraal–kõver, kõver–spiraal, spiraal–sirglõik) koos spiraali nurgaga θs, tangensi kaugustega ja välise kaugusega. Pikketid kulgevad mööda spiraale nagu mujal. Spiraalid, mis kokku pööravad rohkem kui kõver, lükatakse tagasi koos PI nimega; spiraal, mis on pikem kui tangens lubab, on kattumine nagu iga kõvera puhul. Ülekõrgus kasutab spiraali kui üleminekulõiku (vt [Koridor](topic:corridor)).
