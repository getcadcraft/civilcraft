---
title: Kohteen tarkastelu 3D:ssä
summary: Avaa 3D-näkymä, kierrä, panoroi ja zoomaa, aseta pystysuuntainen liioittelu ja värit, valitse mitä näytetään ja valitse linjauksia, alustoja, ominaisuusviivoja, taitelinjoja, putkia, rakenteita ja pisteitä napsauttamalla niitä.
keywords: tunnisteet, 3D-tunnisteet, näyttötunnisteet, tunnisteet kameraa kohti, paaluntunnisteet, korkeuskäyrätunnisteet, pistetunnisteet, pudotus, ilmakuva, karttatasot pinnalla, 3D, kolmiulotteinen, 3D-näkymä, näkymäkuutio, kompassi, kierto, perspektiivi, yhdensuuntainen, isometrinen, iso, pystysuuntainen liioittelu, maasto, malli, kohdemalli, lentää ympäri, visualisoi, renderöi, putket 3D:ssä, rakenteet, kaivot, käytävä 3D:ssä, tie 3D:ssä, tiekaistat, reunakivet, jalkakäytävät, kasvit 3D:ssä, puut 3D:ssä, pensaat, pensasaidat, maisema 3D:ssä, rampit 3D:ssä, portaat, muurit, kovat pinnat 3D:ssä
from: a16bafe1
---

3D-näkymä näyttää kohteen yhtenä mallina: nykyisen maanpinnan ja tasatun pinnan, niiden päälle pudotetut korkeuskäyrät, taitelinjat ja pinnan reunan, kunkin linjauksen suunnitelmaprofiilillaan paalumerkkeineen, käytävän ominaisuusviivat ja tien itsensä (kaistat, olkapäät, ojat, reunakivet, kaistat ja jalkakäytävät omissa väreissään), alustat reunaviivoineen, putkiverkon putket ja rakenteet todellisissa korkeuksissaan sekä Maisema-työtilasta kasvit, päällysteet, polut, muurit, reunakivet, rampit ja portaat. Se lukee saman projektin kuin pohjakuva, joten jokainen muutos näkyy molemmissa.

## Avaa 3D-näkymä

1. Avaa mittauspisteet (tai LandXML- tai projektitiedosto), jotta pinta on olemassa. Pelkät kasvit, päällysteet tai rampit riittävät myös avaamaan sen.
2. Paina {{key:D}} tai napsauta {{ui:3D}}-painiketta {{ui:Näytä}}-ryhmässä työkalurivillä.
   3D-näkymä avautuu pohjakuvan päälle ja katsoo koko kohdetta kaakosta. Ensimmäisellä kerralla lataaminen vie hetken.
3. Paina {{key:D}} uudelleen tai napsauta {{ui:3D}}-painiketta uudelleen palataksesi pohjakuvaan. Jos valitset piirtotyökalun, kuten {{ui:Linjaus}} tai {{ui:Alusta}}, sekin palauttaa pohjakuvaan, koska piirtäminen tapahtuu siellä.

## Liiku

| Tavoite | Tee näin |
|---|---|
| Kierrä | Vedä vasemmalla tai keskipainikkeella |
| Panoroi | Vedä oikealla painikkeella tai paina {{key:Shift}} ja vedä |
| Zoomaa | Käännä rullaa; zoomaus tapahtuu osoittimen kohdalle |
| Kierrä kosketuslevyllä | Pyyhkäise kahdella sormella ({{key:Shift}} ja pyyhkäisy panoroi) |
| Zoomaa kosketuslevyllä | Nipistä |
| Kosketus | Yksi sormi kiertää; kaksi sormea nipistävät zoomatakseen ja liikkuvat panoroidakseen |
| Näppäimet (näkymällä on kohdistus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} kiertävät, {{key:Shift}}-näppäimen kanssa ne panoroivat; {{key:Plus}} ja {{key:Minus}} zoomaavat |

Näkymän yllä oleva palkki sisältää muut:

- Näkymäluettelo: **Iso**, **Päältä**, **Alta**, **Edestä** (katsoo pohjoiseen), **Takaa**, **Vasemmalta** ja **Oikealta**.
- {{ui:Perspektiivi}}: painettuna on perspektiivinäkymä; napsauta sitä saadaksesi yhdensuuntaisen projektion (ei lyhennystä).
- {{ui:Laajuus}}: näyttää kaiken uudelleen. {{key:F}} tekee saman, kun 3D-näkymä on auki.

## Näkymäkuutio

Näkymäkuutio oikeassa yläkulmassa kääntyy näkymän mukana. Napsauta sivua, reunaa tai kulmaa katsoaksesi kohdetta sieltä (kamera kääntyy sujuvasti, ellei järjestelmäsi pyydä vähennettyä liikettä). Vedä kuutiota kiertääksesi. Sen alla oleva kompassirengas näyttää pohjoisen (ruudukon pohjoinen, +Y): vedä rengasta kääntääksesi kohdetta pystyakselin ympäri tai napsauta N, E, S tai W katsoaksesi sieltä. {{ui:Aloitus}}, pieni talo sen vasemmassa yläkulmassa, palaa kohteen koko iso-näkymään. Näppäimistöllä: {{key:Tab}} kuutioon, nuolet valitsevat sivun, reunan tai kulman ja {{key:Enter}} katsoo sieltä.

Pohjakuvassa sama kuutio näyttää päällyksen. Napsauta mitä tahansa muuta sivua, reunaa tai kulmaa (tai vedä sitä) avataksesi 3D-näkymän katsomaan sieltä: tämä on nopein tapa päästä 3D:hen tietystä suunnasta. Jos haluat vaihtaa kuution pieneen akselikuvakkeeseen tai piilottaa sen, katso **Kulmanäyttö** kohdassa [CivilCraftin asetukset](topic:settings).

## Liioittele korkeuksia

Kohteet ovat yleensä paljon leveämpiä kuin korkeita, joten korkeuksia venytetään aluksi **2×**-kertoimella. Valitse **1×**, **2×**, **3×**, **5×** tai **10×** palkin luettelosta tai kohdasta **3D:n pystysuuntainen liioittelu** [CivilCraftin asetuksissa](topic:settings) (ne ovat yksi asetus). Vain näkymä muuttuu: tilavuudet, pituusleikkaukset ja viennit pysyvät todellisessa mittakaavassa.

## Väritä pinnat

- **Korkeusvyöhykkeet**: samat vyöhykkeet ja värit kuin pohjakuvan korkeusvyöhykkeillä (vyöhykkeiden määrä asetetaan **Näytä**-kohdassa vasemmalla paneelissa). Jokainen vyöhykkeen reuna leikataan tarkasti omassa korkeudessaan.
- **Yksi väri**: nykyinen maanpinta ja tasattu pinta, kumpikin yksivärisenä.
- **Karttatasot**: pohjakuvan alla näkyvät karttatasot (georeferoitu kuva, karttalaatat tai karttapalvelu; katso [Karttatasot](topic:map-layers)) levitetään pintojen päälle kuin arkki, joten ilmakuva näkyy mäillä. Kuvat, jotka vielä latautuvat, täydentyvät saapuessaan. Kun karttatasoa ei näy, pinnat säilyttävät korkeusvyöhykkeensä ja näkymä kertoo sen. Kuva on näyttöä varten: GLB- ja OBJ-viennit eivät sisällä sitä.

Kun molemmat pinnat näkyvät, nykyinen maanpinta on läpinäkyvä tasatun pinnan päällä, joten näet leikkauksen (maanpinta suunnitelman yläpuolella) ja täytön.

## Valitse, mitä näkyy

Napsauta palkin kohdasta {{ui:Näytä}} ja rastita tai poista rastitus:

| Kohde | Mitä se on |
|---|---|
| Nykyinen maanpinta | Mittauspisteistä rakennettu pinta (tai luettu LandXML:stä) |
| Tasattu pinta | Nykyinen maanpinta, johon käytävät ja alustat on tasattu (vain kun niitä on) |
| Kolmioiden reunat | Jokainen TIN-reuna viivoina |
| Korkeuskäyrät | Kunkin pinnan pää- ja apukäyrät pohjakuvan välillä |
| Pinnan reuna | Kunkin näkyvän pinnan ulkoreuna sen korkeuksissa |
| Taitelinjat | Jokainen taitelinja sen korkeuksissa |
| Linjaukset ja paalut | Kukin linjaus suunnitelmaprofiilillaan (maanpinnalla, jos profiilia ei ole), paalumerkit 50 ft:n tai 20 m:n välein |
| Käytävän ominaisuusviivat | Päällysteen reuna, olkapää ja reunaviiva molemmilla puolilla |
| Tiepinnat | Jokaisen käytävän rakentama tie kokoonpanostaan: kaistat, olkapäät, ojat, reunakivet, kaistat ja jalkakäytävät, kukin omalla värillään, tasatulla pinnalla |
| Kasvit | Jokainen kasvi sekä istutusalueiden ja pensasaitojen kasvit yksinkertaisina muotoina kasvilistan koon mukaan: puu on runko ja pyöreä latva (kartio havupuulle, tuuhea latva korkealle rungolle palmulle), pensaat, aitakasvit, monivuotiset kasvit ja maanpeitekasvit ovat kupoleja, heinät tupsuja, kiipeilijät ohuita pylväitä. Ne seisovat tasatulla pinnalla (tai nykyisellä maanpinnalla) siinä koossa, jonka pohjakuva näyttää: kypsä tai istutushetkellä |
| Kovat pinnat | Päällysteet ja polut kaltevuuksineen, muurit, reunakivet, portaat sekä rampit, jotka nousevat vaiheittain tasanteiden välissä |
| Alustat ja reunaviivat | Kunkin alustan ääriviiva omassa korkeudessaan ja sen reunaviiva |
| Putket ja rakenteet | Putket pyöreinä putkina niiden pohjien välissä, rakenteet reunasta kuoppaan |
| Mittauspisteet | Piste kunkin korkeuden kohdalla (aluksi pois päältä) |
| GIS-tasot | Pohjakuvan GIS-tasot niiden väreissä: viivat ja ääriviivat omilla korkeuksillaan niiden korkeuksissa, muut maanpinnan päällä (ne seuraavat sitä tarkasti); pisteet pieninä ristinä. Muodot ilman korkeuksia pinnan ulkopuolella jätetään pois, ja näkymä kertoo montako |
| Tunnisteet | Nimet ja arvot, jotka aina ovat sinua kohti: kunkin linjauksen nimi sen alussa ja paalut 100 ft:n tai 100 m:n välein, pääkäyrän korkeus, alustat, ominaisuusviivat ja rakenteet nimellä ja kun **Mittauspisteet** on rastitettu, jokaisen pisteen numero ja korkeus |

Tunnisteet pysyvät samankokoisina ja pystysuorina, kun kiert­ät tai zoomaat, ja mäki tunnisteen edessä piilottaa sen. Kun ne ruuhkautuisivat, tärkeimmät näkyvät ja loput odottavat, kunnes zoomaat sisään: ensin linjaukset, sitten rakenteet, alustat, ominaisuusviivat, paalut, korkeuskäyrät ja pisteet, lähimmät ensin. Ne näkyvät vain näytöllä; viennit ja tulosteet jättävät ne pois.

Valintasi, liioittelu ja värit muistetaan tässä selaimessa.

Tie rakennetaan nykyiselle maanpinnalle. Kun linjaus ja käytävä ovat, mutta mittauspisteitä tai pintaa ei vielä ole, tie piirretään tasaiselle korvaavalle maalle toistaiseksi: suunnitelmaprofiilin keskimääräiseen korkeuteen tai tasaiseksi korkeuteen 0, kun profiiliakaan ei ole. 3D-näkymän alareunassa ja käytävän ominaisuuksissa on varoitus. Se on vain kuva: siitä ei tule tilavuuksia tai leikkauksia. Avaa mittauspisteet tai pinta, niin tie siirtyy itsestään todelliselle maalle.

Pystysuuntainen liioittelu venyttää maanpintaa, ei kasveja: ne seisovat liioitellulla maanpinnalla todellisella korkeudellaan ja leveydellään, joten puu näyttää puulta missä tahansa asetuksessa. Kasvit ovat yksinkertaisia muotoja, eivät yksityiskohtaisia malleja: tuhannet niistä pysyvät nopeina kiertää ja zoomata.

## Putket ja rakenteet

- Putki piirretään siten, että sen pohja on asetetuissa pohjissa ja sen yläosa (holvi) yhden sisähalkaisijan verran korkeammalla. Halkaisijat ovat tuumina jalkaprojektissa ja millimetreinä metrijärjestelmäprojektissa, kuten oikeassa paneelissa.
- Rakenne ulottuu reunastaan (kirjoitettu tai maanpinnalta) kuoppaansa (alimman pohjan miinus kuopan syvyys). Ilman yhtään pohjaa se piirretään 5 ft (1.5 m) syvänä.
- Putket ja rakenteet, joissa on ongelma (katso verkon tarkistus oikeasta paneelista), piirretään punaisina.
- Putki ilman pohjia ei piirry; näkymän alareunassa oleva huomautus kertoo, montako.

## Valitse 3D-näkymästä

Napsauta linjausta (tai sen tietä), alustaa, ominaisuusviivaa, putkea, rakennetta, mittauspistettä, kasvia, rampia tai muuta kovaa pintaa. Se valitaan aivan kuten pohjakuvassa: sen ominaisuudet aukeavat oikeaan paneeliin, missä voit muokata niitä, ja se piirretään valinnan värillä kaiken päällä 3D:ssä. Mitä tahansa valitset pohjakuvassa, korostuu myös 3D:ssä. Osoittimen vieressä oleva vihje nimeää napsauttamasi kohteen idän, pohjoisen ja korkeuden kera. Putket ja rakenteet voi napsauttaa, vaikka ne ovat maan alla; mäen taakse piilotettua viivaa ei voi napsauttaa läpi.

Napsauta taitelinjaa nähdäksesi, mikä se on: se korostuu, ja tilarivi nimeää sen (taitelinjoilla ei ole omia ominaisuuksia).

Napsauta maanpintaa lukeaksesi idän, pohjoisen ja korkeuden siinä vihjeestä.

## Aja linjauksen varrella

Napsauta **Aja** 3D-palkista ja valitse linjaus. Näkymä siirtyy kuljettajan paikalle: 3.5 ft (1.07 m) tien yläpuolelle, suunnitelmaprofiilille (olemassa olevalle maanpinnalle keskilinjaa pitkin, kun profiilia ei vielä ole), katsoen eteenpäin sitä pitkin.

- **Toista** tai {{key:Space}} ajaa valitsemallasi nopeudella (10–65 mph tai 15–100 km/h); {{key:Space}} uudelleen pysäyttää. Se pysähtyy loppuun; **Toista** aloittaa sitten alusta.
- Liukusäädin hyppää mihin tahansa paaluun; {{key:Left}} ja {{key:Right}} siirtävät 10 ft (5 m) taakse ja eteen.
- Vetäminen näkymässä pysäyttää ajon ja antaa katsella ympärille.
- **Pysäytä** tai {{key:Esc}} palauttaa näkymän sinne, missä se oli.

Pystysuuntainen liioittelu on voimassa ajettaessakin: aseta se 1×, niin näet tien sellaisena kuin se tulee olemaan.

## Valo auringosta

Avaa **Aurinko** 3D-palkista ja rastita **Valaistus auringosta**. Anna päivämäärä, kellonaika ja sen aikavyöhyke (ero UTC:hen: kesällä kesäaikainen), sekä kohteen leveys- ja pituuspiiri. Kun projektilla on koordinaattijärjestelmä, ne täytetään siitä.

Kohde valaistaan auringon sijainnin mukaan, ja **Varjot** heittävät varjon maanpinnan, käytävän ja alustojen yli. Valikko kertoo auringon atsimuutin ja korkeuden tai että se on horisontin alapuolella. Sijainnit tulevat NOAA:n aurinkoyhtälöistä. Varjot osuvat oikein missä tahansa liioittelussa, mutta ne päättyvät kohteen reunaan: sen takana olevat mäet ja rakennukset eivät heitä varjoa.

## Vie 3D-näkymä

Napsauta palkin kohtaa {{ui:GLB}} tai {{ui:OBJ}}. Näkymä tallentuu todellisessa mittakaavassa (ei liioittelua), metreinä, Y ylöspäin. Lisätietoja: [Vie kohde 3D:nä](topic:export-3d).
