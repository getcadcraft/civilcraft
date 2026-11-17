---
title: Maansiirtotilavuudet
summary: Lue leikkaus-, täyttö- ja nettotilavuudet nykyisen maanpinnan ja suunnitellun maastomallin välillä, tasanteittain, käytävittäin ja yhteensä, ja ymmärrä niiden takana oleva ruudukkomenetelmä.
keywords: tilavuudet, maansiirto, leikkaus, täyttö, netto, leikkaus ja täyttö, määrät, ruudukkomenetelmä, pintavertailu, tilavuuspinta, kuutiojardit, kuutiometrit
from: 299d7bc7
---

Heti kun tasanne tai käytävä tasautuu ilman ongelmia, CivilCraft vertaa suunniteltua pintaa nykyiseen maanpintaan ja raportoi leikkauksen ja täytön. Luvut päivittyvät jokaisen muutoksen jälkeen.

## Mistä ne luetaan

- **Maansiirto** oikeassa paneelissa, kun mitään ei ole valittu (**Projekti**-näkymä), kun on vähintään yksi tasanne tai käytävä.
- **Maansiirto** oikeassa paneelissa, kun tasanne on valittu (samat yhteissummat koko projektille).
- Käytävän asetusten alla oleva rivi, jossa on käytävän oma leikkaus ja täyttö.

**Maansiirto**-lohko näyttää:

- **Leikkaus**, **Täyttö** ja **Netto** (perässä ”täyttö” tai ”leikkaus”, kumpi on suurempi)
- rivi kutakin kohdetta kohden, kun niitä on enemmän kuin yksi, esimerkiksi ”Tasanne 1: leikkaus 120.4 cu yd, täyttö 310.2 cu yd”
- menetelmärivi: ”Ruudukkomenetelmä: nykyinen maanpinta ja tasattu pinta otettiin näytteitä 0.5 ft:n välein päivänvalolinjojen sisällä (92,891 solua). Turpoamis- tai kutistumiskerrointa ei ole käytetty.”

Tilavuudet ovat kuutiojardeja jalkaprojektissa ja kuutiometrejä metriprojektissa.

## Lähetä ne TakeoffCraftiin

Maansiirron hinnoittelemiseksi valitse {{ui:Lähetä TakeoffCraftiin}} **Maansiirto**-lohkon alalaidasta. CivilCraft tallentaa määrätiedoston (`<site>.quantities.json`), jossa on kaksi määrää: leikkaus ja täyttö, kuutiojardeina (jalkaprojekti) tai kuutiometreinä (metriprojekti), samat luvut kuin lohkossa, sadasosaan asti. Avaa se TakeoffCraft-ohjelmassa **Avaa määrälaskenta** -toiminnolla tai pudota se sinne: niistä tulee kaksi nimikettä, jotka voit hinnoitella ([Leikkaus ja täyttö CivilCraft-ohjelmasta](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Lähetä uudelleen muutoksen jälkeen ja avaa uusi tiedosto: samat nimikkeet saavat uudet luvut.

Lähetetään vain yhteissummat, joten mitään ei lasketa kahdesti; tiedoston huomautuksessa luetellaan kunkin tasanteen ja käytävän oma leikkaus ja täyttö.

## Miten ne lasketaan

CivilCraft käyttää **ruudukkomenetelmää**:

1. Neliöistä solua muodostava ruudukko asetetaan kaikkien päivänvalolinjojen sisäpuolelle.
2. Kunkin solun keskipisteessä otetaan näyte molemmista pinnoista.
3. Kukin solu lasketaan prismana: korkeusero kertaa solun pinta-ala. Missä suunniteltu pinta on alempana, se on leikkausta; missä ylempänä, se on täyttöä.
4. Solut lasketaan yhteen.

Solukoko valitaan puolestasi niin, että tasattujen alueiden ympärillä oleva suorakulmio sisältää noin 250,000 solua, pyöristettynä siistiin arvoon (1, 2 tai 5 kertaa kymmenen potenssi). Et voi vielä asettaa sitä itse. Menetelmärivi kertoo koon ja solujen määrän. Pienemmät solut ovat tarkempia reunoilla; kokonaisilla soluilla tasaisten tasojen välillä tulos on tarkka.

## Hyvä tietää

- Lasketaan vain päivänvalolinjojen sisäinen alue. Niiden ulkopuolinen maanpinta ei muutu.
- Ongelmallista tasannetta tai käytävää ei tasata mukaan, eikä se lisää mitään. Jos lohko sanoo ”Tilavuuksia ei vielä ole: tasanteen tasauksen täytyy onnistua ilman ongelmia.”, etsi sen yläpuolelta punainen laatikko.
- Kun kohteet menevät päällekkäin, myöhempi on korvannut aiemman sen päivänvalolinjan sisällä, ja päällekkäisyys lasketaan kerran.
- Turpoamis- tai kutistumiskerrointa ei käytetä. Kerro tulokset itse, jos tarvitset penkka-, irto- tai tiivistetyn tilavuuden.
- Pintamaan poistoa, päällysrakenteen ja alustan syvyyksiä sekä TIN–TIN-prismatilavuuksia ei ole vielä käytettävissä.

## Tuloksen tarkistaminen

- Käännä {{ui:Suunniteltu (tasattu)}} päälle kohdassa **Näyttö** ja katso korkeuskäyriä päivänvalolinjojen sisällä.
- Vie osoitin tasatun alueen päälle: tilarivi näyttää **Maanpinta** ja **Tasattu**. Ero on leikkauksen tai täytön syvyys kohdassa.
- Käytävän osalta profiilinäkymän lukema näyttää leikkauksen tai täytön keskilinjalla jokaisessa paalussa.
