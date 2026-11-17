---
title: Ei vielä toteutettu
summary: Mitä tämä CivilCraftin versio ei vielä tee ja mitä tehdä sen sijaan nyt.
keywords: puuttuu, rajoitukset, tiekartta, ei saatavilla, siirtymäkaaret, leventäminen, dwg, dxf, sadevesikaivot, viivytys, poikkileikkaukset, myöhemmin, rajat
from: a2d970ef
---

CivilCraft on vielä alkuvaiheessa. Tämä sivu luettelee, mitä nykyinen versio ei tee, jotta et etsi sitä turhaan. Mitään tässä ei ole luvattu tiettyyn päivämäärään.

## Pisteet

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Toisen pistetiedoston liittäminen ensimmäiseen | Yhdistä tiedostot tekstieditorissa tai taulukkolaskennassa ensin |
| Pistetekstitiedoston vienti | Vie LandXML (pisteet menevät CgPoints-muodossa), käytä GIS-{{ui:Vie}}-toimintoa (pisteet kentillä P, N, E, Z ja D) tai {{ui:Kopioi}} pisteet taulukkolaskentaan |
| Pistemerkintätyylit, symbolit kuvaustunnuksittain, kaaret viivakoodeista, kuvaustunnusten tiedosto jaettavaksi projektien välillä | Nimiöissä näkyvät numero, korkeus ja kuvaus, tai vähemmän ([CivilCraftin asetukset](topic:settings)); tunnukset säilyvät projektitiedostossa |
| Yksikkömuunnos | Muunna tiedosto ennen tuontia; **Yksiköt** vain nimeää uudelleen |

## Maastomallit

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Useampi kuin yksi maastomalli pisteistä | Yksi projekti per maastomalli |
| Sisempien rajojen piilottaminen | Käytä **Pisin ulkoreuna** tai ulkorajaa |
| Yhden piirretyn taitelinjan valinta tai muokkaus | {{key:Mod+Z}}, tai {{ui:Poista piirretyt taitelinjat}} ja piirrä uudelleen |
| LandXML:stä luetun maastomallin muokkaus (taitelinjat, raja) | {{ui:Rakenna maastomalli uudelleen pisteistä}} |
| Korkeusruudukosta tehdyn maastomallin muokkaus | Tuo ruudukko uudelleen muilla valinnoilla |
| LandXML:stä luetun maastomallin muuntaminen, kun koordinaatisto muuttuu | Ensin {{ui:Rakenna maastomalli uudelleen pisteistä}} |
| Nimetyt pistekorkeudet ja kaltevuusarvot | Lue ne tilarivistä, tai väritä maastomalli kaltevuuden mukaan **Kaltevuusanalyysi**-toiminnolla Maisematyötilassa ([Maisemien tasaus](topic:landscape-grading#grading-checks)) |

## Linjaukset ja pituusleikkaukset

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Muut spiraalit kuin klotoidi; spiraali kahden kaaren välillä (yhdistelmäsiirtymät) | Klotoidispiraalit kaarien päissä ovat käytettävissä; muut on nimetty ja ohitetaan LandXML-tuonnissa |
| PI:n lisääminen kahden muun väliin | Piirrä linjaus uudelleen tai kirjoita PI-koordinaatit uudelleen |
| Linjaukset kohteista, siirtymät, leventämiset | Piirrä PI-pisteillä |
| K:n kirjoittaminen pystykaarelle | Kirjoita L (K näkyy) |
| Ympyrämäiset ja epäsymmetriset pystykaaret | Vain symmetriset paraboliset kaaret |
| Useampi kuin yksi suunnittelupituusleikkaus linjausta kohden | Yksi linjaus per vaihtoehto |
| Pituusleikkausnäkymän zoomaus, kaistat pituusleikkauksen alla | Pituusleikkausnäkymä sovittaa koko linjauksen; tulosta se [suunnitelma- ja pituusleikkausarkeille](topic:plan-profile-sheets) |
| Poikkileikkaukset DWG:nä tai LandXML:nä | Poikkileikkausarkit PDF:nä; {{ui:CSV}} pinta-aloista ja tilavuuksista |
| Näytelinjat kulmassa tai eri leveyksillä tien varrella | Yksi leveys kummallekin puolelle koko linjaukselle |

## Käytävät

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Keskikaistat, esteet ja ylikorotus, joka kiertää mallipohjia | Piirrä ne mallipohjina ([Käytävän mallipohjat](topic:corridor-templates)); asemittaiset mallipohjat eivät vielä ota ylikorotusta huomioon |
| Asteittainen muutos kahden alueen mallipohjien välillä (siirtymät, kapenemat) | Vaihda mallipohja asemassa, tai anna pisteelle leveystavoite viivalle, joka piirretään kapenemaksi |
| Kierto reunan ympäri, ylikorotus LandXML:ssä | Ylikorotus kiertää keskiviivan ympäri ympyräkaarilla; leventä kaista leveystavoitteella muotoviivaan |
| Tavoitteet luiskille (päivänvalo viivaan tai pintaan), käytävän omat pinnat | Tavoitteet siirtävät päällysteen ja olkapäiden reunoja ([Käytävät](topic:corridor)); käytävä tasataan suunniteltuun pintaan |
| Käytävät vietynä LandXML-tieinä; toinen käytävä linjauksella IFC-viennissä | Suunniteltu pinta viedään |
| Maastomallipohjat, jotka muuttavat suunniteltua pintaa 3D:ssä tai poikkileikkauksissa | Ne antavat kunkin kerroksen pinta-alat ja tilavuudet ([Maastomallipohjat](topic:corridor-templates#terrain-templates)) |
| Ajoneuvon kulkureitit nopeudella, renkaiden luisumisella, ohjausajalla, ohjattavilla perävaunuilla tai rungon vapaalla tilalla; kirjasto vakiosuunnitteluajoneuvoista; kulkureitti piirretty vetämällä ajoneuvoa | Matalan nopeuden kulkureitit taitelinjaa tai linjausta pitkin omilla ajoneuvon mitoilla ([Ajoneuvojen kulkureitit](topic:swept-paths)) |

## Tasaus ja tilavuudet

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Penkit, auki jätetyt muotoviivat suunnitelmaan tasattuina, tasaus muotoviivaan muualta | Sulje muotoviiva ([Muotoviivat](topic:feature-lines)), tai käytä sitä olemassa olevan maanpinnan taitelinjana |
| Muotoviivan kärjen lisääminen tai poistaminen | Piirrä viiva uudelleen, tai tee siitä porrastettu siirtymä |
| Kaaret piirretyissä taitelinjoissa (mittauspisteiden kautta), spiraalit muotoviivoissa | Piirrä muotoviiva kaarineen ja käytä sitä olemassa olevan maanpinnan taitelinjana |
| Tasaus etäisyyteen, korkeuteen tai toiseen pintaan | Päivänvalo vain olemassa olevaan maanpintaan |
| Alustan kulman lisääminen tai poistaminen | Poista alusta ja piirrä se uudelleen |
| TIN-TIN-tilavuudet (prisma), ruudukon solukoon valinta | Ruudukkomenetelmä, solukoko valitaan puolestasi |
| Turvotus ja kutistuminen, pintamaa, päällysteen paksuudet | Sovella kertoimia ilmoitettuihin lukuihin itse |
| Vapaa kuljetus ja ylikuljetus kustannuksineen, kuljetus eri linjausten välillä, lainakuopat ja jätealueet suunnitelmassa | Massakuljetuskaavio tasapainopisteineen, siirrettyine tilavuuksineen ja keskimääräisine kuljetusmatkoineen |

## Putkiverkot

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Useampi kuin yksi verkko projektia kohden | Erilliset projektit sadevedelle ja jätevedelle |
| Vesijohdot: veden laatu ja ikä, sääntöpohjaiset ohjaukset, muut venttiilityypit (virtauksen säätö, kuristus, ylläpito), tehon mukaan annetut pumput, paineesta riippuva kysyntä, Darcy–Weisbach-vaihtoehto, putkiluettelo seinämänpaksuuksineen ja painuokkineen. Muu paineverkkojen osa on laboratoriossa: [Vesijohdot](topic:water-mains) | Tarkista ne vesijakeluohjelmistossa; jätevesien mitoitusvirtaamat ovat kohdassa [Jätevesien mitoitusvirtaamat](topic:sanitary-design) |
| Viemärivirtaamat ajan mukaan (hydrografit, dynaaminen reititys, varastointi, pumput, ylivuodot) | [Jätevesien mitoitusvirtaamat](topic:sanitary-design) antaa vakaan huippuvirtaaman, jota mitoituslomake käyttää |
| Sadevesikaivojen kapasiteetti, reunaojan leviäminen, viivytysreititys, hydrografit, muut energiahäviöt kuin yksi liitoskerroin | Tarkista ne muissa ohjelmissa; virtaamat, koot ja vedenpinnan linjat ovat kohdassa [Sadevesien johtaminen](topic:storm-drainage) |
| Valuma-alueet PDF-tulosteessa, DWG:ssä, DXF:ssä tai LandXML:ssä; valuma-alueet pinnasta (vedenjakajat) | Piirrä valuma-alueet käsin; ne tallentuvat projektitiedostoon |
| Putkikatalogit, pyöreät putket, rakenteet, jotka eivät ole pystysuoria laatikoita tai sylintereitä (kartiot, portaat, penkit), kuivatusluokka kirjastossa | Rakennetyypit parametreista ([Putkiverkko](topic:pipe-network)); putket halkaisijalla |
| Putket profiilinäkymässä, kaarevat putket | Lue pohjien korkeudet ja peite oikeasta paneelista |

## Tontit

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Tonttijako pinta-alan tai rintaman mukaan, tontit ympäröivien viivojen mukaan, tiealue | Piirrä jokainen tontti kulmiltaan tai kirjoita sen kutsut |
| Kaaritaulukot ja viivataulukot suunnitelmassa; nimiöitä siirretty käsin | Jokainen osuus nimetään itsestään |
| Tontit LandXML:ssä | Tontit tallennetaan projektitiedostoon, ja ne menevät PDF:ään, DWG:hen ja DXF:ään |

## Jonomittaukset

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Pienimmän neliösumman tasoitus, siirtosääntö, kulmien painottaminen etäisyyksien mukaan | Kompassisääntö |
| Taivutuskulmat, zeniittikulmat ja vinoetäisyydet, korkeudet trigonometrisellä tasauksella | Pelkistä vaakaetäisyyksiksi ja kulmiksi oikein, tai suuntakulmiksi |
| Sivumittaukset, mittaustietokoneiden raakadatatiedostot | Tuo pisteet pistetiedostona |

## Maastoon merkintä

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Irtomerkit (lähtöpisteet, asetettu paalusta taaksepäin), luiskapaalut kohtapisteessä | Merkitse paalut tarvitsemissasi siirtymissä, myös olkapään ulkopuolelle |
| Paalujen lähettäminen suoraan mittaustietokoneen omaan muotoon | CSV avautuu useimpien mittaustietokoneiden toimistoohjelmistoon |
| Putkien, alustojen ja tonttien merkintä | Käytä linjauksen lähellä olevia mittauspisteitä tai tontin osuuksia |

## Tiedostot ja tuloste

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Tekstit, viivoitukset ja mitoitukset DWG:stä tai DXF:stä; paperitila; linkitetyt piirustukset (xref:t); binaarinen DXF | Mallitilan viivageometria avautuu ([Avaa DWG tai DXF viivageometriana](topic:open-dwg-dxf)); avaa linkitetyt piirustukset erikseen |
| Useiden pisteiden siirtäminen kerralla vetämällä | Leikkaa ja liitä ne, tai muokkaa yksi kerrallaan |
| Pystysuuntaiset arkit, omat piirustusotsikot, näkymäruudut, joita järjestät, suunnitelma- ja pituusleikkausarkit DWG:nä | Yksi vaakasuuntainen suunnitelma-arkki per PDF, tai suunnitelma- ja pituusleikkausarkit linjauksen varrella (PDF) |
| Korkeuskaistojen ja pituusleikkausten tulostus | Kaistat näkyvät vain näytöllä; ota kuvakaappaus, jos tarvitset ne |
| Kerrosten nimien, värien tai nimiötyylien muuttaminen | Muuta ne CAD-ohjelmassa DXF-viennin jälkeen |
| Pilvitallennus ja versiohistoria | Tallenna `.civilcraft.json`-tiedostot ja pidä niistä varmuuskopio; yhteistyöhön projektissa käytä live-istuntoa CadCraft Studiossa ([Suunnittele yksi työmaa yhdessä, live](topic:work-live)) |
| CadCraft Studio iPadille ja iPhonelle sekä Google Playsta | Käytä CivilCraftia selaimessa laitteella; Androidilla CadCraft Studio asennetaan APK-tiedostosta osoitteesta getcadcraft.com/download |
| Useiden piste- tai projektitiedostojen avaaminen kerralla | Yksi tiedosto kerrallaan (toisiinsa kuuluvat GIS-tiedostot, kuten shapefilen osat, avautuvat yhdessä) |

## Maisema

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Valmistajien päät ja suuttimet | Yleiset päät, tai lisää omat päät tiedostosta; valmistajien tiedot tulevat, kun he antavat luvan |
| Tippaputkien enimmäispituudet sivuhaaroille, virtaamat ajan mukaan, pumput, silmukoidut putkiverkot | Pidä tippaputkiajot valmistajan julkaisemassa pituudessa; tarkistus vaatii haarautuvan verkon |
| Kuperan vapaamuotoisen kohteen tarkka ääriviiva; sen maanpinnan alainen tilavuus mitattuna tarkasti | Kupera vaippa tasataan, ja maanpinnan alainen tilavuus on arvio (kerrotaan Ominaisuuksissa) |
| Kasvit BimCraftin ja ModelCraftin omassa Sijoita kirjastosta -toiminnossa | Vie maisema-IFC ja avaa se BimCraftissa rakennuksen rinnalla |
| Yksityiskohtaiset kasvimallit (lehdet, oksat, vuodenajat) 3D-näkymässä; vapaamuotoiset kohteet ja kastelu 3D-näkymässä | Kasvit näkyvät 3D:ssä yksinkertaisina muotoina, joiden koko on kasviluettelosta ([Katso työmaa 3D:nä](topic:site-3d)); ModelCraftin hajauttaminen tekee istutuskuvia |
| Kovapintaiset seinät, jotka pidättävät tasatun tason takanaan pinnalla | Anna alustalle tai padille pystysuorat reunat: ne ovat pinnan tukimuureja ([Tasaus](topic:grading)) |
| Oman symbolin SVG-muunnokset; oman GLB-kasvimallin tekstuurit ja värit; pakattu GLB-geometria | Litistä muunnokset piirto-ohjelmassa ensin; mallit piirretään kasvin värillä; vie GLB pakkaamatta ([Kasvigrafiikka](topic:plant-graphics)) |
| Oma kasviluettelo, joka on tallennettu Kirjasto-tilillesi (muokataan sovelluksessa) | Muokkaa projektin omaa luetteloa Kasvitaulukossa ja tallenna se kasvitiedostona |
| Maisematyökalut avustajille ilman ikkunaa (tiedostopalvelin ja komentorivi) | Ne toimivat, kun CivilCraft-ikkuna on auki ([Anna tekoälyavustajan työskennellä työmaasi kanssa](topic:assistants)) |

## Voimalinjat

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Maan standardi valmiina sisäänrakennettuna (kuormitustapaukset, välykset, kertoimet) | Aseta standardisi arvot kohdassa {{ui:Kuormitustapaukset ja rajat…}} ja tallenna ne kirjastosi kanssa paketiksi, jonka voi käyttää ja jakaa uudelleen ([Paketit](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Johtimen sivuttaisetäisyys puun latvaan tai johdon viereiseen seinään | Pystysuora välys kasvien ja seinien yli, jotka linja ylittää ([Voimalinjatarkistukset](topic:power-line-checks#clearances)) |
| Johtimen virumisen ja uuden johtimen venymän huomioiminen | Ota ne huomioon asennustaulukon lämpötilojen kautta |
| Maahan asetettujen kaapelien lämpöluokitus (virtaluokitus asennustavasta) | Syötä toimittajasi virtaluokitus kaapelikohteeseen |
| Oikosulku-, suojaus- ja maadoitustutkimukset | Käytä erillistä sähköohjelmaa; CivilCraft antaa verkon pituudet ja kaapelit |
| Hilatornit, jotka on suunniteltu sauva kerrallaan, ja maahan kiinnitetyt vaijerinkiinnitykset | Pylväät tarkistetaan nimelliskuormalla; vaijerit mitoituskuormalla |
| `.DON`-tutkimustiedoston tarkistus ohjelmassa, joka sen lukee | Tarkista tiedosto siellä; lähetä meille näyte, jotta voimme testata oikeaa tiedostoa vastaan |
| Voimalinjat 3D-näkymässä ja IFC:ssä | Suunnitelma, linjan pituusleikkaus, arkit ja GIS-tasot |
| Voimalinjatyökalut avustajille ilman ikkunaa | Ne toimivat, kun CivilCraft-ikkuna on auki ([Anna tekoälyavustajan työskennellä työmaasi kanssa](topic:assistants)) |

## Rakennusmassat

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Kirjasto kaavoitusmääräyksistä tai minkä tahansa kaupungin säännöistä | Kirjoita rajat omasta määräyksestäsi ([Kaavoitusrajat](topic:zoning-limits)) |
| Taivaanvalo seinillä (julkisivun päivänvalo), tuuli | [Aurinkotunnit](topic:sun-hours) laskee vain suoran auringon |
| Varjo puista, kasveista tai kaikesta, mitä ei ole piirretty massana | Piirrä naapurirakennukset massoina |
| Kattomuodot massoilla | Tasakattoiset massat |
| Aukot, katot ja seinätyypit, kun massa kehitetään BimCraftissa | BimCraft rakentaa tavalliset ulkoseinät jokaiselle tasolle ja lattialle; lisää loput siellä |

## GIS ja koordinaatistot

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| File Geodatabase; KML-tyylit, kuvakkeet, maanpäälliset peitteet ja verkkolinkit | Muunna ensin GeoPackageksi, shapefileksi tai GeoJSONiksi; KML-merkit luetaan ilman tyylejä |
| GIS-kohteiden tai niiden attribuuttien muokkaus | Muokkaa niitä GIS-ohjelmassa ja tuo uudelleen. Analysoi-paneeli tekee uusia tasoja (puskuri, päällekkäisyys, liitos, valinta) ja lisää pinta-ala- ja pituuskentät, mutta se ei muokkaa kohdetta paikallaan |
| Verkko- ja rasterianalyysi, puskurit tasaisilla tai neliömäisillä päillä ja yksipuoliset puskurit, rivien lisääminen tai poistaminen attribuuttitaulukossa tai kentän tyypin muuttaminen, manuaaliset luokkavärit, tyylilegenda tulosteissa | Valitse kohteet työkalulla Valitse ja tee niistä taso; tasaisia päitä ei tarjota. Attribuutin mukaan väritys ja attribuuttitaulukko on toteutettu: katso [Tyylitä taso attribuutin mukaan](topic:gis-symbology) ja [Työskentely tason attribuuttitaulukon kanssa](topic:gis-table) |
| Nimiötyylit (koko, sijoittelu) ja toisiaan välttävät nimiöt | Nimiöt ovat yhtä kokoisia ja voivat mennä päällekkäin, kun kohteet ovat tiheässä |
| Pystysuuntaiset datumit ja geoidimallit | Korkeudet käytetään niin kuin tiedosto ne antaa; tarkista pystydatum itse |
| Ruudukkosiirrot muualle kuin NAD83:een NAD27:stä alueen mukaan ehdotettuna (OSTN15, NTv2 muille datumeille toimivat, kun lisäät tiedoston), useat ruudukot kerralla, pystyruudukot | Lisää datumisi ruudukkotiedosto itse; yksi ruudukko projektia kohden |
| Karttatasot DXF:ssä tai 3D-vienneissä | Karttatasot menevät PDF-tulosteeseen, ja DWG:n rinnalle ne tulevat kuvana |
| Karttapalvelimet, jotka vaativat kirjautumisen, avaimen tai tunnuksen | Käytä julkisia palveluja tai georeferoitua kuvatiedostoa |
| LAS- tai LAZ-tiedostojen kirjoittaminen pinnasta, maaperämallista tai korkeusruudukko- ja LiDAR-työkaluista | Vie pinnat GeoTIFF-korkeusruudukkona. [Pistepilvet](topic:point-clouds)-lisäosa kirjoittaa puhdistetun pilven LAS 1.4- tai LAZ-muodossa |
| LiDAR-intensiteetti, väri ja paluut; korkeusruudukot useilla kaistoilla; ruudukko- tai LiDAR-tiedostot yli 200 MB | LiDAR suodatetaan vain luokan mukaan, ruudukot käyttävät ensimmäistä kaistaa; jaa suuret tiedostot ensin osiin |

## Syöte

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Valinta-alue kosketuksella (vaatii {{key:Shift}}) | Pidä painettuna kutakin mittauspistettä lisätäksesi sen |
| Kirjoitetut koordinaatit tai etäisyydet piirtäessä | Piirrä karkeasti ja kirjoita tarkat PI-koordinaatit linjauksen PI-taulukkoon |
| Koordinaattien kirjoittaminen alustan kulmille ja rakenteille | Vedä niiden otteista; zoomaa lähemmäs tarkkuutta varten ja seuraa E:tä ja N:ää tilarivillä |
| Kohteisiin tarttuminen (muut kuin mittauspisteet taitelinjoille) | Zoomaa lähemmäs ja seuraa tilariviä |

## 3D-näkymä

| Ei vielä toteutettu | Sen sijaan nyt |
|---|---|
| Piirtäminen tai muokkaus 3D-näkymässä | Piirrä ja muokkaa suunnitelmassa; 3D-näkymä seuraa jokaista muokkausta |
| Käytävän muotoviivojen tai GIS-kohteiden valinta napsauttamalla 3D:ssä | Napsauta niitä suunnitelmassa |
| Liioitellun näkymän tai ft-yksiköiden vienti | Viennit ovat oikeassa mittakaavassa metreinä; katso [Vie työmaa 3D:nä](topic:export-3d) |
| Nimiöt GLB- tai OBJ-vienneissä, nimiöiden koot ja tyylit 3D:ssä | Nimiöt näkyvät vain 3D-näkymässä, yhdessä koossa; katso [Katso työmaa 3D:nä](topic:site-3d) |
| Tekstuurit valokuvista, ajon tallentaminen videona, varjot työmaan ulkopuolelta, aurinkotunnit 3D-näkymässä | Karttatasot piirrettynä pinnoille; ajo ja auringon asento yhdellä hetkellä; [aurinkotunnit](topic:sun-hours) päivälle tai vuodenajalle suunnitelmassa |
