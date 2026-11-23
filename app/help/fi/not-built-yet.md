---
title: Ei vielä toteutettu
summary: Mitä tämä CivilCraftin versio ei vielä tee ja mitä tehdä sen sijaan tänään.
keywords: puuttuu, rajoitukset, tiekartta, ei saatavilla, spiraalit, levennys, dwg, dxf, kaivot, pidätysallas, poikkileikkaukset, tulossa myöhemmin, rajat
from: b91588d4
---

CivilCraft on vielä varhaisessa vaiheessa. Tämä sivu luettelee, mitä nykyinen versio ei tee, jotta et etsi sitä turhaan. Mitään tässä ei ole luvattu tietylle päivälle.

## Pisteet

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Toisen pistetiedoston lisääminen ensimmäiseen | Yhdistä tiedostot ensin tekstieditorilla tai taulukkolaskennalla |
| Pistetekstitiedoston vienti | Vie LandXML (pisteet menevät CgPoints-elementteinä), käytä GIS-toimintoa {{ui:Vie}} (pisteet kentillä P, N, E, Z ja D) tai {{ui:Kopioi}} pisteet taulukkolaskentaan |
| Pistetunnisteiden tyylit, symbolit kuvauskoodeittain, kaaret viivakoodeista, kuvauskoodien tiedosto jaettavaksi projektien välillä | Tunnisteet näyttävät numeron, korkeuden ja kuvauksen tai vähemmän ([CivilCraftin asetukset](topic:settings)); koodit säilytetään projektitiedostossa |
| Yksikkömuunnos | Muunna tiedosto ennen tuontia; **Yksiköt** vain nimeää uudelleen |

## Pinnat

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Useampi kuin yksi pinta pisteistä | Yksi projekti per pinta |
| Sisäisten rajojen piilottaminen | Käytä **Pisin ulkoreuna** tai ulkoraja |
| Yhden piirretyn taitelinjan valinta tai muokkaus | {{key:Mod+Z}}, tai {{ui:Poista piirretyt taitelinjat}} ja piirrä uudelleen |
| LandXML-tiedostosta luetun pinnan muokkaus (taitelinjat, raja) | {{ui:Rakenna maastomalli uudelleen pisteistä}} |
| Korkeusruudukosta tehdyn pinnan muokkaus | Tuo ruudukko uudelleen eri valinnoilla |
| LandXML-tiedostosta luetun pinnan muuntaminen, kun koordinaatisto vaihtuu | {{ui:Rakenna maastomalli uudelleen pisteistä}} ensin |
| Nimetyt korkeuspisteet ja kaltevuusarvot | Lue ne tilarivillä tai värjää pinta kaltevuuden mukaan **Kaltevuusanalyysi**-toiminnolla maisematyötilassa ([Maiseman tasaus](topic:landscape-grading#grading-checks)) |

## Linjaukset ja pituusleikkaukset

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Muut spiraalit kuin klotoidi; spiraali kahden kaarteen välissä (yhdistetyt siirtymät) | Klotoidispiraalit kaarteen päissä ovat käytettävissä; muut on nimetty ja ohitetaan LandXML-tuonnissa |
| PI:n lisääminen kahden muun väliin | Piirrä linjaus uudelleen tai kirjoita PI-koordinaatit uudelleen |
| Linjaukset kohteista, siirtymistä, levennyksistä | Piirrä PI-pisteillä |
| K:n kirjoittaminen pystykaarelle | Kirjoita L (K näytetään) |
| Ympyrä- ja epäsymmetriset pystykaaret | Vain symmetriset paraboliset kaaret |
| Useampi kuin yksi suunniteltu pituusleikkaus linjausta kohti | Yksi linjaus per muunnos |
| Pituusleikkausnäkymän zoomaus, pituusleikkauksen alle tulevat kaistat | Pituusleikkausnäkymä sovittaa koko linjauksen; tulosta se [suunnitelma- ja pituusleikkausarkeille](topic:plan-profile-sheets) |
| Poikkileikkaukset DWG- tai LandXML-muodossa | Poikkileikkausarkit PDF-muodossa; {{ui:CSV}} alueista ja tilavuuksista |
| Mittausviivat kulmassa tai eri leveyksisinä tien varrella | Yksi leveys kummallekin puolelle koko linjauksen matkalta |

## Käytävät

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Keskikaistat, esteet ja kallistus, joka kiertää pohjia | Piirrä ne pohjina ([Käytäväpohjat](topic:corridor-templates)); paaluittain tehdyt pohjat eivät vielä ota kallistusta huomioon |
| Asteittainen muutos kahden alueen pohjien välillä (siirtymät, kapenemat) | Vaihda pohjaa paalulla tai anna pisteelle leveyskohde viivaan, joka on piirretty kapenemaksi |
| Kierto reunan ympäri, kallistus LandXML:ssä | Kallistus kiertää keskilinjan ympäri kaarteissa; levennä ajokaistaa leveyskohteella taitelinjaan |
| Kohteet sivuluiskille (rajaviiva viivaan tai pintaan), omat käytävämaastomallit | Kohteet siirtävät ajoradan reunoja ja piennarreunoja ([Käytävät](topic:corridor)); käytävä tasataan suunniteltuun maastomalliin |
| Reunakivien kaaret, kääntymiskaistat ja saarekkeet tasattuna liittymään; sivutien pää leikattuna pääteen reunaan vinossa; polku liitettynä tiehen pohjapiirroksessa, sen pituudessa ja pinta-alassa | Kohtaavat tiet liitetään suorassa kulmassa: pääteen reuna avataan ja sivutie tasataan siihen ([Missä tiet kohtaavat](topic:corridor#where-roads-meet-roads-pads-and-paths)); polku päättyy tien reunaan suunnitellussa maastomallissa ja 3D:ssä |
| Käytävät vietynä LandXML-tieverkkoina; toinen käytävä linjauksella IFC-viennissä | Suunniteltu maastomalli viedään |
| Maastopohjat, jotka muuttavat suunniteltua maastomallia 3D:ssä tai poikkileikkauksissa | Ne antavat kunkin kerroksen alat ja tilavuudet ([Maastopohjat](topic:corridor-templates#terrain-templates)) |
| Kääntöradat nopeudella, renkaiden liukumisella, ohjausajalla, ohjattavilla perävaunuilla tai korivarauksella; vakiosuunnitteluajoneuvojen kirjasto; kääntörata, joka piirretään vetämällä ajoneuvoa | Hitaat kääntöradat maastomallin viivaa tai linjausta pitkin omilla ajoneuvomitoillasi ([Ajoneuvojen kääntöradat](topic:swept-paths)) |

## Tasaus ja tilavuudet

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Penkat, avoimet taitelinjat tasattuna suunnitelmaan, tasaus taitelinjaan muualta | Sulje taitelinja ([Taitelinjat](topic:feature-lines)) tai käytä sitä maanpinnan taitelinjana |
| Taitelinjan kärkipisteen lisääminen tai poistaminen | Piirrä viiva uudelleen tai tee siitä portaittainen siirtymä |
| Kaaret piirretyissä taitelinjoissa (mittauspisteiden kautta), spiraalit taitelinjoissa | Piirrä taitelinja kaarilla ja käytä sitä maanpinnan taitelinjana |
| Tasaus etäisyyteen, korkeuteen tai toiseen pintaan | Rajaviiva vain olemassa olevaan maanpintaan |
| Platan kulman lisääminen tai poistaminen | Poista platta ja piirrä se uudelleen |
| TIN–TIN-tilavuudet (prismat), ruudukkosolun koon valinta | Ruudukkomenetelmä, solukoko valitaan puolestasi |
| Paisuminen ja kutistuminen, pintamaa, päällysrakenteen syvyydet | Käytä kertoimia raportoituihin lukuihin itse |
| Vapaakuljetus- ja ylikuljetuskustannukset, kuljetus eri linjausten yli, lainauspaikat ja jätealueet pohjapiirroksessa | Massakuljetuskaavio tasapainopisteineen, siirretyt tilavuudet ja keskimääräiset kuljetusmatkat |

## Putkiverkot

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Useampi kuin yksi verkko projektia kohti | Erilliset projektit sadevedelle ja jätevedelle |
| Vesijohdot: vesilaatu ja ikä, sääntöpohjaiset ohjaukset, muut venttiilityypit (virtaussäätö, kuristus, paineen ylläpito), pumput tehon mukaan, paineesta riippuva kysyntä, Darcy–Weisbach-vaihtoehto, putkiluettelo seinämävahvuuksilla ja painoluokilla. Muu paineverkkojen osa on laboratoriossa: [Vesijohdot](topic:water-mains) | Tarkista ne vesijakeluohjelmalla; jätevesien mitoitusvirtaamat ovat kohdassa [Jätevesien mitoitusvirtaamat](topic:sanitary-design) |
| Viemärivirtaamat ajan yli (hydrografit, dynaaminen reititys, varastointi, pumput, ylivuodot) | [Jätevesien mitoitusvirtaamat](topic:sanitary-design) antaa tasaisen huippuvirtaaman, jota mitoituslomake käyttää |
| Sadevesikaivon kapasiteetti, vesirännin leviäminen, viivytysallasreititys, hydrografit, muut energiahäviöt kuin yhden liitoskertoimen | Tarkista ne muulla ohjelmalla; virtaamat, koot ja korkeuslinjat ovat kohdassa [Sadevesien johtaminen](topic:storm-drainage) |
| Valuma-alueet PDF-piirroksessa, DWG:ssä, DXF:ssä tai LandXML:ssä; valuma-alueet maanpinnasta (vedenjakajat) | Piirrä valuma-alueet käsin; ne tallennetaan projektitiedostoon |
| Putkiluettelot, ei-pyöreät putket, rakenteet, jotka eivät ole pystysuoria laatikoita tai sylintereitä (kartiot, portaat, penkat), kuivatusluokka kirjastossa | Rakennetyypit parametreista ([Putkiverkko](topic:pipe-network)); putket, joilla on halkaisija |
| Putket pituusleikkausnäkymässä, kaarevat putket | Lue pohjan korot ja peitesyvyys oikeanpuoleisesta paneelista |

## Tontit

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Tonttien sijoittelu pinta-alan tai rintaman mukaan, tontit ympäröivistä viivoista, tierasite | Piirrä jokainen tontti kulmiensa mukaan tai kirjoita sen kulmakutsut |
| Kaaritaulukot ja viivataulukot pohjapiirroksessa; käsin siirretyt tunnisteet | Jokainen osuus on nimetty sen varrella |
| Tontit LandXML:ssä | Tontit tallennetaan projektitiedostoon ja menevät PDF-, DWG- ja DXF-tiedostoihin |

## Jonomittaukset

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Pienimmän neliösumman tasoitus, kulkusääntö, kulmien painotus etäisyyksiin nähden | Kompassisääntö |
| Taitekulmat, zeniittikulmat ja vinoetäisyydet, korkeudet trigonometrisella tasauksella | Muunna vaakaetäisyyksiksi ja kulmiksi oikein tai käytä suuntakulmia |
| Sivumittaukset, raakadatatiedostot mittauslaitteilta | Tuo pisteet pistetiedostona |

## Maastoon merkintä

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Siirtopaalut (vertailupisteet paalusta taaksepäin), luiskapaalut tarttumapisteessä | Merkitse paalut tarvitsemillasi etäisyyksillä, myös piennarin ulkopuolelle |
| Paalujen lähettäminen suoraan mittauslaitteen omaan muotoon | CSV avautuu useimpien mittauslaitteiden toimistoohjelmissa |
| Putkien, plattojen ja tonttien merkintä | Käytä linjauksen lähellä olevia mittauspisteitä tai tontin osuuksia |

## Tiedostot ja tuloste

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Teksti, viivoitukset ja mitoitukset DWG- tai DXF-tiedostoista; paperitila; linkitetyt piirustukset (xref-viittaukset); binäärinen DXF | Viivatyö mallitilasta avautuu ([Avaa DWG tai DXF viivatyönä](topic:open-dwg-dxf)); avaa linkitetyt piirustukset erikseen |
| Useiden pisteiden siirtäminen kerralla vetämällä | Leikkaa ja liitä ne tai muokkaa yksi kerrallaan |
| Pystysuuntaiset arkit, omat piirustusotsikot, itse järjestettävät näkymäruudut, suunnitelma- ja pituusleikkausarkit DWG:nä | Yksi vaakasuuntainen suunnitelma-arkki per PDF, tai suunnitelma- ja pituusleikkausarkit linjausta pitkin (PDF) |
| Korkeuskaistojen ja pituusleikkausten tulostus | Kaistat ovat vain näytöllä; ota kuvakaappaus, jos tarvitset niitä |
| Tasonimien, värien tai tunnistetyylien muuttaminen | Muuta ne CAD-ohjelmassa DXF-viennin jälkeen |
| Pilvitallennus ja versiohistoria | Tallenna `.civilcraft.json`-tiedostot ja varmuuskopioi ne; työskennelläksesi yhdessä projektin parissa käytä live-istuntoa CadCraft Studiossa ([Suunnittele yksi työmaa yhdessä, live](topic:work-live)) |
| CadCraft Studio iPad- ja iPhone-laitteissa sekä Google Play -kaupasta | Käytä CivilCraftia selaimessa laitteella; Androidilla CadCraft Studio asennetaan APK-tiedostosta osoitteessa getcadcraft.com/download |
| Useiden piste- tai projektitiedostojen avaaminen kerralla | Yksi tiedosto kerrallaan avoinna (toisiinsa kuuluvat GIS-tiedostot, kuten shape-tiedoston osat, avautuvat yhdessä) |

## Maisema

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Valmistajien pään ja suuttimien mallit | Yleiset päät, tai lisää omia päitä tiedostosta; valmistajan tiedot tulevat sitä mukaa kuin ne annetaan käyttöön |
| Tippuletkujen suurin sivuhaaran pituus, virtaamat ajan yli, pumput, silmukoidut putkiverkot | Pidä tippalinjat valmistajan julkaisemassa pituudessa; tarkistus edellyttää haarautuvaa verkkoa |
| Kuperan vapaamuotoisen kohteen tarkka ääriviiva; sen maanpinnan alapuolinen tilavuus mitattuna tarkasti | Kupera vaippa tasataan, ja maanpinnan alapuolinen tilavuus on arvio (ilmoitetaan Ominaisuuksissa) |
| Kasvit BimCraftin ja ModelCraftin omasta kirjastosta sijoitettuina | Vie maisema-IFC ja avaa se BimCraftissa rakennuksen rinnalla |
| Yksityiskohtaiset kasvimallit (lehdet, oksat, vuodenajat) 3D-näkymässä; vapaamuotoiset kohteet ja kastelu 3D-näkymässä | Kasvit näkyvät 3D:ssä yksinkertaisina muotoina, joiden koko perustuu kasviluetteloon ([Tarkastele aluetta 3D:ssä](topic:site-3d)); ModelCraftin hajauttaminen tekee istutuskuvia |
| Kovat muurit, jotka pidättävät tasatun tason takanaan maastomallilla | Anna tasanteelle tai plattalle pystysuorat reunat: ne ovat tukimuureja maastomallissa ([Tasaus](topic:grading)) |
| SVG-muunnokset omissa symboleissa; omien GLB-kasvimallien pinnat ja värit; pakattu GLB-geometria | Litistä muunnokset piirrosohjelmassa ensin; mallit piirretään kasvin värillä; vie GLB ilman pakkausta ([Kasvigrafiikka](topic:plant-graphics)) |
| Oma kasvilista, joka on tallennettuna kirjastotilillesi (muokattavissa sovelluksessa) | Muokkaa projektin omaa luetteloa Kasvitaulukossa ja tallenna se kasvitiedostona |
| Maisematyökalut avustajille ilman ikkunaa (tiedostopalvelin ja komentorivi) | Ne toimivat, kun CivilCraft-ikkuna on auki ([Anna AI-avustajan työskennellä kohteesi kanssa](topic:assistants)) |

## Voimalinjat

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Maakohtainen standardi sisäänrakennettuna (kuormitustapaukset, välykset, kertoimet) | Aseta standardisi arvot kohdassa {{ui:Kuormitustapaukset ja rajat…}} ja tallenna ne kirjastosi kanssa paketiksi, jonka voi käyttää uudelleen ja jakaa ([Paketit](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Johtimen sivuttainen etäisyys puun latvaan tai linjan viereiseen seinään | Johdon ylittämien kasvien ja seinien suora pystysuuntainen välys ([Voimalinjatarkistukset](topic:power-line-checks#clearances)) |
| Johtimen virumisen ja uuden johtimen venymän | Huomioi ne vetolaskentataulukon lämpötiloissa |
| Maahan asetettujen kaapelien lämpöluokitus (virtakestävyys asennustavasta) | Anna toimittajasi virtakestävyys kaapelikohteessa |
| Oikosulku-, suojaus- ja maadoitustutkimukset | Käytä erillistä sähköohjelmaa; CivilCraft antaa verkon pituudet ja kaapelit |
| Ristikkomastot suunniteltu sauva kerrallaan ja maahan ankkuroidut vaijerit | Tuet tarkistetaan nimelliskuormalla; vaijerit mitoituskuormalla |
| `.DON`-tutkimustiedosto, joka tarkistetaan sen lukevassa ohjelmassa | Tarkista tiedosto siellä; lähetä meille näyte, jotta voimme testata oikealla |
| Voimalinjat 3D-näkymässä ja IFC:ssä | Suunnitelma, linjan pituusleikkaus, arkit ja GIS-tasot |
| Voimalinjatyökalut avustajille ilman ikkunaa | Ne toimivat, kun CivilCraft-ikkuna on auki ([Anna AI-avustajan työskennellä kohteesi kanssa](topic:assistants)) |

## Rakennusmassat

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Kaavoitusmääräysten kirjasto tai minkään kaupungin säännöt | Kirjoita rajat omasta kaavamääräyksestäsi ([Kaavarajoitukset](topic:zoning-limits)) |
| Taivasvalo seinillä (julkisivun päivänvalo), tuuli | [Auringonpaistetunnit](topic:sun-hours) laskee vain suoran auringon |
| Varjo puista, kasveista tai kaikesta, mitä ei ole piirretty massana | Piirrä naapurirakennukset massoina |
| Kattomuodot massoissa | Tasakattoiset massat |
| Aukot, katot ja seinätyypit, kun massa kehitetään BimCraftissa | BimCraft rakentaa jokaiseen kerrokseen ja lattiaan yksinkertaiset ulkoseinät; lisää muut siellä |

## GIS ja koordinaatistot

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| File Geodatabase; KML-tyylit, kuvakkeet, maanpinnan peitteet ja verkkolinkit | Muunna ensin GeoPackage-, shape- tai GeoJSON-muotoon; KML-merkit luetaan ilman tyylejä |
| GIS-kohteiden tai niiden attribuuttien muokkaus | Muokkaa niitä GIS-ohjelmassa ja tuo uudelleen. Analysoi-paneeli luo uusia tasoja (puskuri, päällekkäisyys, liitos, valinta) ja lisää pinta-ala- ja pituuskentät, mutta se ei muokkaa kohdetta paikanpäällä |
| Verkko- ja rasterianalyysi, puskurit tasaisilla tai neliömäisillä päillä ja yksipuoliset puskurit, rivien lisääminen tai poistaminen ja kentän tyypin muuttaminen attribuuttitaulukossa, luokkien käsin tehdyt värit, tyylijaottelu piirroksissa | Käytä Valitse-toimintoa kohteiden valitsemiseen ja tee niistä taso; tasaisia päitä ei tarjota. Attribuutin mukaan värjäys ja attribuuttitaulukko ovat jo rakennettu: katso [Tyylitä taso attribuutin mukaan](topic:gis-symbology) ja [Työskentele tason attribuuttitaulukon kanssa](topic:gis-table) |
| Tunnistetyylit (koko, sijoittelu) ja toisiaan välttävät tunnisteet | Tunnisteet ovat yhtä kokoisia ja voivat mennä päällekkäin, kun kohteet ovat tiheässä |
| Pystysuorat vertausjärjestelmät ja geoidimallit | Korkeudet käytetään sellaisina kuin tiedosto ne antaa; tarkista pystysuora vertausjärjestelmä itse |
| Muut ruudukkosiirrot kuin NAD27:stä NAD83:een, jotka ehdotetaan alueen mukaan (OSTN15, NTv2 muille vertausjärjestelmille toimii, kun lisäät tiedoston), useita ruudukoita kerralla, pystysuorat ruudukot | Lisää ruudukkotiedosto vertausjärjestelmällesi itse; yksi ruudukko projektia kohti |
| Karttatasot DXF:ssä tai 3D-vienneissä | Karttatasot menevät PDF-piirrokseen ja DWG:n rinnalle kuvana |
| Karttapalvelimet, jotka vaativat kirjautumisen, avaimen tai tunnuksen | Käytä julkisia palveluja tai geoviitattua kuvatiedostoa |
| LAS- tai LAZ-tiedostojen kirjoittaminen maastomallista, maanpintamallista tai korkeusruudukko- ja LiDAR-työkaluista | Vie maastomallit GeoTIFF-korkeusruudukkona. [Pistepilvet](topic:point-clouds)-lisäosa kirjoittaa siivotun pilven LAS 1.4- tai LAZ-muodossa |
| LiDAR-intensiteetti, väri ja paluut; korkeusruudukot useilla kaistoilla; ruudukko- tai LiDAR-tiedostot yli 200 MB | LiDAR suodatetaan vain luokan mukaan, ruudukot käyttävät ensimmäistä kaistaa; leikkaa suuret tiedostot ensin osiksi |

## Syöttö

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Laatikkovalinta kosketuksella (se vaatii {{key:Shift}}-näppäimen) | Pidä jokaista mittauspistettä pitkään painettuna lisätäksesi sen |
| Kirjoitetut koordinaatit tai etäisyydet piirtäessä | Piirrä suunnilleen, kirjoita sitten tarkat PI-koordinaatit linjauksen PI-taulukkoon |
| Koordinaattien kirjoittaminen platan kulmille ja rakenteille | Vedä niiden ottepisteitä; zoomaa tarkkuuden vuoksi ja seuraa E- ja N-arvoja tilarivillä |
| Tarttuminen kohteisiin (muut kuin taitelinjojen mittauspisteet) | Zoomaa ja seuraa tilariviä |

## 3D-näkymä

| Ei vielä toteutettu | Sen sijaan tänään |
|---|---|
| Piirtäminen tai muokkaaminen 3D-näkymässä | Piirrä ja muokkaa pohjapiirroksessa; 3D-näkymä seuraa jokaista muokkausta |
| Käytävän taitelinjojen tai GIS-kohteiden valinta napsauttamalla 3D:ssä | Napsauta niitä pohjapiirroksessa |
| Liioitellun näkymän vienti tai vienti jaloissa | Viennit ovat oikeassa mittakaavassa metreinä; katso [Vie tontti 3D:nä](topic:export-3d) |
| Tunnisteet GLB- tai OBJ-vienneissä, tunnisteiden koot ja tyylit 3D:ssä | Tunnisteet näkyvät vain 3D-näkymässä, yhtä kokoisina; katso [Tarkastele aluetta 3D:ssä](topic:site-3d) |
| Kuvista otetut pinnat, ajon tallentaminen videona, varjot alueen ulkopuolelta, auringonpaistetunnit 3D-näkymässä | Karttatasot peitettyinä maastomalleille; ajo ja auringon asento yhdellä hetkellä; [auringonpaistetunnit](topic:sun-hours) päivälle tai vuodenajalle pohjapiirroksessa |
