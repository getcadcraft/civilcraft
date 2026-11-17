---
title: Pyyhkäise tiekäytävä
summary: Kytke käytävä päälle linjaukselle, aseta kaistan, piennarten ja sivuluiskan arvot ja lue sen tuottamat poikkileikkaukset, maanvarausviivat ja maansiirto.
keywords: kallistus, superelevaatio, kallistuskulma, tasoitusosuus, siirtymäosuus, kallistustaulukko, poikkikaltevuus, pyöritys, käytävä, tyyppipoikkileikkaus, kokoonpano, osakokoonpano, ajorata, kaista, piennar, sivuluiska, maanvaraus, leikkaus, penger, poikkileikkaukset, kohde, kohteet, leveyskohde, korkeuskohde, reunakohde, levennys, päällysteen reuna, seuraa toista käytävää
from: 91303189
---

Käytävä pyyhkäisee yhden yksinkertaisen tyyppipoikkileikkauksen (kokoonpanon) pitkin linjausta ja sen suunnittelun pituusleikkausta, sovittaa sen olemassa olevaan maanpintaan ja lisää tuloksen suunniteltuun maastomalliin. Linjauksella voi olla useita käytäviä eri paaluväleillä, ja käytävä voidaan rakentaa uudelleenkäytettävistä mallipohjista paaluittain ([Käytäväpohjat](topic:corridor-templates)). Alla oleva yksinkertainen kokoonpano on molemmilla puolilla sama; jos haluat antaa kummallekin puolelle omat osansa, katso [Rakenna kumpikin puoli osista](topic:corridor#build-each-side-from-parts).

## Kokoonpano

Keskiviivasta ulospäin kummallakin puolella:

1. **kaista** annetulla leveydellä, joka laskee harjasta **kaistaluiskalla**
2. **piennar** annetulla leveydellä **piennarluiskalla**
3. **sivuluiska** piennarreunasta kohtaan, jossa se kohtaa maanpinnan: **leikkausluiska**, kun maanpinta on yläpuolella, ja **penkereen luiska**, kun se on alapuolella

Lähtöarvot ovat paikkamerkkejä eivätkä suunnitteluperusteita:

| Arvo | US feet | Metrit |
|---|---|---|
| Kaistan leveys | 12 ft | 3.6 m |
| Kaistaluiska | 2% | 2% |
| Piennarin leveys | 4 ft | 1.2 m |
| Piennarluiska | 4% | 4% |
| Leikkausluiska | 2 : 1 | 2 : 1 |
| Penkereen luiska | 3 : 1 | 3 : 1 |
| Poikkileikkaus joka | 10 ft | 5 m |

Sivuluiskojen luiskat ovat vaaka–pysty (H:V): 3 : 1 tarkoittaa 3 vaakasuunnassa 1 pystysuunnassa.

## Rakenna käytävä

Tarvitset virheettömän linjauksen ja suunnitelman pituusleikkauksen, jossa on vähintään kaksi PVI:tä eikä virheitä.

1. Valitse linjaus.
2. Oikeassa paneelissa, kohdassa **Käytävä**, rastita **Pyyhkäise kokoonpano suunnitelman pituusleikkauksen mukaisesti**.
   Kentät ilmestyvät, ja käytävä rakennetaan heti. Suunnitelma näyttää kaistan ja piennarin reunat sekä maanvarausviivat; kun kohdassa **Näyttö** on valittu {{ui:Suunniteltu (tasattu)}}, korkeuskäyrät näyttävät uuden maanpinnan.
3. Muuta mitä tahansa arvoa: **Kaistan leveys**, **Kaistaluiska**, **Piennarin leveys**, **Piennarluiska**, **Leikkausluiska**, **Penkereen luiska**, **Poikkileikkaus joka**. Paina jokaisen jälkeen {{key:Enter}}. Leikkauksen, penkereen ja poikkileikkausvälin on oltava suurempia kuin 0.
4. Lue kenttien alla oleva rivi, esimerkiksi ”39 poikkileikkausta paaluvälillä 0+00.00 – 3+86.36; leikkaus 240.2 cu yd, penger 556.0 cu yd.”

Poikkileikkaukset leikataan jokaisessa **Poikkileikkaus joka** -välissä, päissä sekä jokaisen tasokaaren ja pystykaaren alussa ja lopussa. Jokainen poikkileikkaus ja sen kautta kulkevat viivat (keskiviiva, kaistan ja piennarin reunat, maanvaraus) muodostuvat suunnitellun maastomallin taitelinjoiksi.

Kytke käytävä pois päältä poistamalla rastitus. Sen arvot säilyvät seuraavaa kertaa varten.

## Kun se ei rakennu

Kenttien alla oleva punainen laatikko kertoo syyn:

| Viesti | Mitä tehdä |
|---|---|
| Käytävä tarvitsee suunnitelman pituusleikkauksen ilman virheitä. | Lisää PVI:tä tai korjaa päällekkäiset pystykaaret (katso [Suunnittele pystyprofiili](topic:profile)). |
| Suunnitelman pituusleikkaus ei mene päällekkäin linjauksen kanssa. | Siirrä PVI:t linjauksen paaluvälille. |
| Käytävässä on oltava vähintään kaksi poikkileikkausta maastomallilla. | Suurin osa käytävästä on nykyisen maanpinnan ulkopuolella. |
| 4 sivuluiskaa menee maastomallin ulkopuolelle ennen maanpintaan kohtaamista. | Maastomallin reunan lähellä luiska ei ulotu maanpintaan. Pidä tie kaukana reunasta tai laske penkereen tai leikkauksen korkeutta siellä. |
| Käytävän maanvarausviivat leikkaavat (poikkileikkaukset menevät päällekkäin, esimerkiksi tiukan kaaren sisäpuolella). Käytä suurempaa sädettä tai kapeampaa kokoonpanoa. | Terävän kaaren sisäpuolen poikkileikkaukset menevät päällekkäin. Suurenna sädettä tai kapenna kokoonpanoa. |

Ongelmallista käytävää ei tasata maastomalliin, eikä se lasketa maansiirtoon.

## Käytävät ja alustat yhdessä

Suunniteltu maastomalli rakennetaan järjestyksessä: ensin jokainen käytävä, sitten jokainen alusta. Kohdassa, jossa alustan tasaus menee päällekkäin käytävän kanssa, alusta voittaa. Tilavuudet lasketaan kaikkien maanvarausviivojen sisällä yhdessä; katso [Maansiirron tilavuudet](topic:volumes).

## Kallistus

Kaaressa tie voi kallistua kaarteen sisäpuolelle, jolloin liikenne työntyy vähemmän ulospäin. Rastita **Kallista kaaret** kohdasta **Kallistus** linjauksen **Ominaisuudet**-osiossa:

- Jokainen ympyräkaari saa kallistusarvon **e** kallistustaulukosta: ensimmäinen rivi, jonka säteeseen kaari yltää (tyhjällä arvolla oleva rivi säilyttää normaalin harjan). Taulukko ja **Suurin suhteellinen kaltevuus** (alussa 0.5 %) ovat paikkamerkkejä eivätkä standardeja: aseta ne omien suunnitteluperusteidesi mukaan. Lisää tai poista rivejä tarpeen mukaan.
- Kaistat kiertyvät keskiviivan ympäri. Ennen kaarta ulkokaista tasoittuu **tasoitusosuuden** (normaali harja ÷ e × siirtymäosuus) yli, ja sitten **siirtymäosuuden** (kaistan leveys × e ÷ kaltevuus) yli ulkokaista jatkaa kääntymistä, kunnes koko tie kallistuu arvolla e sisäänpäin; kaksi kolmasosaa siirtymäosuudesta on ennen kaarta ja yksi kolmasosa kaarella. Kaaren jälkeen tapahtuu sama käänteisessä järjestyksessä.
- Matalalla puolella oleva piennar ei ole koskaan loivempi kuin kaistansa; korkealla puolella se säilyttää oman luiskansa (se vierii yli).
- Sen alla oleva taulukko luettelee jokaisen kaaren säteen, arvon, siirtymäosuuden ja tasoitusosuuden sekä kohdat, joissa täysi kallistus alkaa ja päättyy. **Kallistuskaavio** piirtää molempien kaistojen poikkikaltevuudet paaluittain (vasen kaista yhtenäisenä, oikea katkoviivana).
- Kaari, joka on liian lyhyt saavuttamaan täyden kallistuksen, tai kaksi kaarta, joiden siirtymät menevät päällekkäin, ilmoitetaan laatikossa taulukon yläpuolella.

Poikkileikkaukset, tilavuudet, 3D-näkymä ja arkit näyttävät kaikki kallistetun tien. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Kohteet

Kohde siirtää yhden tien sivun pisteen viivalle: **Päällysteen reuna** tai **Piennarin reuna**, **Vasen** tai **Oikea** puoli. Jokainen poikkileikkaus kohtaa viivan keskiviivaa vastaan suorassa kulmassa ja menee ulos vain sille puolelle, joten oikean puolen kohde ei siirrä koskaan vasenta puolta.

| Asettaa | Mitä tapahtuu kohdassa, jossa poikkileikkaus kohtaa viivan |
|---|---|
| **Leveys** | Piste on viivalla: kaista (tai piennar) leventyy tai kapenee siihen säilyttäen poikkikaltevuutensa. |
| **Korkeus** | Piste saa viivan korkeuden siinä omalla siirtymällään: kaistan (tai piennarin) poikkikaltevuus seuraa perässä. |

Viiva voi olla taitelinja (mikä tahansa sen **Käyttö**) tai toisen käytävän viiva: sen keskiviiva, päällysteen reunat, piennarin reunat tai maanvarausviivat. Käytävän viiva seuraa sitä käytävää: muuta toista tietä, ja tämä seuraa perässä. CivilCraft rakentaa toisen käytävän ensin; kaksi käytävää, jotka kohdistuisivat toisiinsa silmukassa, hylätään toisella puolella, ja taulukko kertoo, kumpi.

1. Valitse linjaus ja kytke sen käytävä päälle.
2. Kohdassa **Kohteet** napsauta {{ui:Lisää kohde}}.
3. Valitse **Puoli**, **Piste**, mitä se **Asettaa** ja **Viivalle**. Jokainen muutos on yksi kumoamisvaihe.

**Tulos** kertoo, monessa poikkileikkauksessa viiva saavutettiin. Poikkileikkaukset, jotka eivät yllä siihen (sen päiden ohi tai keskiviivan takana), säilyttävät kokoonpanon arvot. Poistettu viiva jättää käytävän siihen tilaan kuin se oli ennen kohdetta, ja taulukko kertoo sen. Yhdellä sivulla voi olla yksi leveyskohde ja yksi korkeuskohde kutakin pistettä kohden.

## Rakenna kumpikin puoli osista

Kytke **Rakenna kumpikin puoli osista** käytävän asetuksista. Jokaisella sivulla on silloin oma luettelonsa keskiviivasta ulospäin: kaistat, piennar, reunaoja, reunakivi, istutuskaista, jalkakäytävä ja viimeisenä sivuluiska maanpintaan (omine leikkaus- ja penkereen suhteineen). Aloita {{ui:Maantie}} tai {{ui:Kaupunkikatu}}, lisää ja poista osia, siirrä niitä nuolilla ja {{ui:Kopioi}} yksi sivu toiselle. Jokainen muutos on yksi kumoamisvaihe.

Poikkikaltevuus on lasku tiestä poispäin, joten jalkakäytävä, joka valuttaa kohti tietä, on negatiivinen. Reunakivi on annetun korkeuden mittainen pinta, annetun leveyden mittainen yläpinta ja valinnainen pudotus takana. Kallistus kääntää jokaisen kaistan ensimmäisellä rivillä; reunaoja, reunakivi, kaistale ja jalkakäytävä riippuvat rakennetun kaistan reunasta. Kohteet siirtävät edelleen kaistojen päätä ja viimeistä osaa. Poikkileikkauksissa merkitään reunaojan virtaviiva, reunakiven yläreuna ja takareuna sekä muu. Spiraalikaarella siirtymäosuus on spiraali: tasainen harja TS-pisteessä, täysi kallistus SC-pisteessä.

## Päällystekerrokset

Kaistalla, piennarilla, reunaojalla, istutuskaistalla tai jalkakäytävällä voi olla oma rakennekerroksensa: osan alla {{ui:Lisää kerros}} lisää kerroksen, jolla on nimi, materiaali, paksuus ja tyyppi (pintakerros, sidekerros, kantava kerros, pohjakerros, suojakerros tai muu), ylhäältä alas. Kerrokset eivät siirrä tien pintaa (sen yläpinta on suunnittelupinta); jokainen sijaitsee osansa alla, ja sen syvyys mitataan suoraan alaspäin. Poikkileikkauksissa jokaisen kerroksen alareuna piirretään katkoviivana, ja {{ui:Päällystekerrokset: määrät}} luettelee jokaisen kerroksen pohjapinta-alan ja tilavuuden (pinta-ala käytävää pitkin poikkileikkauksista, tilavuus = pinta-ala × paksuus). IFC-vienti kirjoittaa jokaisen kerroksen omana elementtinään paksuutensa ja materiaalinsa kanssa (katso [IFC-vienti ja -tuonti](topic:ifc)). Kirjoittamasi paksuus on sinun: CivilCraft ei mitoita päällysteitä.

## Mitä ei ole vielä toteutettu

Kohteet maanvarausluiskalle eivät ole vielä käytettävissä. Käytävään, joka muuttuu tien varrella ja jonka vasen ja oikea puoli on erotettu, käytä [Käytäväpohjia](topic:corridor-templates). Katso [Ei vielä toteutettu](topic:not-built-yet).
