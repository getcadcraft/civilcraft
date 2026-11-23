---
title: Pyyhkäise tien käytävä
summary: Ota käytävä käyttöön linjaukselle, aseta ajokaistan, piennarin ja luiskan arvot ja lue syntyvät poikkileikkaukset, rajaviivat ja maamäärät.
keywords: liittymä, risteys, tie kohtaa tien, sivutie, T-liittymä, risteys, platan taso, liitos, kiinnitys, kallistus, ylikorotus, kallistus, siirtymä, lähtösiirtymä, tyyppitaulukko, poikkikaltevuus, kierto, käytävä, poikkileikkausrakenne, tyyppipoikkileikkaus, tie, ajokaista, piennar, poikkikaltevuus, sivuluiska, rajaviiva, leikkaus, täyttö, poikkileikkaukset, kohde, kohteet, leveyskohde, korkeuskohde, siirtymäkohde, levennys, ajoradan reuna, seuraa toista käytävää
from: 6dcb92b3
---

Käytävä pyyhkäisee yhden yksinkertaisen tyyppipoikkileikkauksen (poikkileikkausrakenteen) linjauksen ja sen suunnitellun pituusleikkauksen mukaan, tasaa sen olemassa olevaan maanpintaan ja lisää tuloksen suunniteltuun maastomalliin. Yhdellä linjauksella voi olla useita käytäviä eri paalualueilla, ja käytävä voidaan rakentaa paaluittain uudelleen käytettävistä pohjista ([Käytäväpohjat](topic:corridor-templates)). Alla oleva yksinkertainen poikkileikkausrakenne on molemmilla puolilla sama. Jos haluat antaa kummallekin puolelle omat osat, katso [Rakenna kumpikin puoli osista](topic:corridor#build-each-side-from-parts).

## Poikkileikkausrakenne

Keskilinjasta ulospäin kummallakin puolella:

1. **ajokaista** annetulla leveydellä, joka laskee harjalta **ajokaistan kaltevuudella**
2. **piennar** annetulla leveydellä **piennarin kaltevuudella**
3. **sivuluiska** piennarin reunasta siihen kohtaan, jossa se liittyy maanpintaan: **leikkausluiska**, kun maanpinta on korkeammalla, ja **penkereen luiska**, kun maanpinta on alempana

Lähtöarvot ovat paikkamerkkejä, eivät suunnitteluohjeita:

| Arvo | US feet | Metrit |
|---|---|---|
| Ajokaistan leveys | 12 ft | 3.6 m |
| Ajokaistan kaltevuus | 2% | 2% |
| Piennarin leveys | 4 ft | 1.2 m |
| Piennarin kaltevuus | 4% | 4% |
| Leikkausluiska | 2 : 1 | 2 : 1 |
| Penkereen luiska | 3 : 1 | 3 : 1 |
| Poikkileikkaus välein | 10 ft | 5 m |

Sivuluiskojen kaltevuudet ilmoitetaan vaakasuunnassa pystysuuntaan (H:V): 3 : 1 tarkoittaa 3 vaakasuunnassa 1 pystysuunnassa.

## Rakenna käytävä

Tarvitset virheettömän linjauksen ja suunnitellun pituusleikkauksen, jossa on vähintään kaksi PVI-pistettä eikä virheitä.

1. Valitse linjaus.
2. Valitse oikeanpuoleisessa paneelissa kohdassa **Käytävä** ruutu **Pyyhkäise poikkileikkausrakenne suunnitellun pituusleikkauksen mukaan**.
   Kentät tulevat näkyviin ja käytävä rakentuu heti. Pohjapiirroksessa näkyvät ajokaistan ja piennarin reunat sekä rajaviivat. Kun kohdassa **Näyttö** on valittu {{ui:Suunniteltu (tasattu)}}, korkeuskäyrät näyttävät uuden maanpinnan.
3. Muuta mitä tahansa arvoa: **Ajokaistan leveys**, **Ajokaistan kaltevuus**, **Piennarin leveys**, **Piennarin kaltevuus**, **Leikkausluiska**, **Penkereen luiska**, **Poikkileikkaus välein**. Paina jokaisen jälkeen {{key:Enter}}. Leikkauksen, täytön ja poikkileikkausvälin on oltava suurempia kuin 0.
4. Lue kenttien alla oleva rivi, esimerkiksi ”39 poikkileikkausta paalusta 0+00.00 paaluun 3+86.36; leikkaus 240.2 cu yd, täyttö 556.0 cu yd.”

Poikkileikkaukset leikataan joka **Poikkileikkaus välein** -askeleelle, päihin sekä jokaisen vaaka- ja pystykaaren alkuun ja loppuun. Jokainen poikkileikkaus ja sen läpi kulkevat viivat (keskilinja, ajokaistan ja piennarin reunat, rajaviiva) muodostuvat suunnitellun maastomallin taitelinjoiksi.

Kytke käytävä pois poistamalla ruudun valinta. Sen arvot säilyvät seuraavaa kertaa varten.

## Kun käytävä ei rakennu

Kenttien alla oleva punainen ruutu kertoo syyn:

| Viesti | Mitä tehdä |
|---|---|
| ”Käytävä tarvitsee suunnitellun pituusleikkauksen ilman virheitä.” | Lisää PVI-pisteitä tai korjaa päällekkäiset pystykaaret (katso [Suunnittele pystyprofiili](topic:profile)). |
| ”Suunniteltu pituusleikkaus ei mene päällekkäin linjauksen kanssa.” | Siirrä PVI-pisteet linjauksen paaluvälille. |
| ”Käytävä tarvitsee maastomallilla vähintään kaksi poikkileikkausta.” | Suurin osa käytävästä on olemassa olevan maanpinnan ulkopuolella. |
| ”4 sivuluiskaa menevät maastomallin ulkopuolelle ennen kuin ne kohtaavat maanpinnan.” | Maastomallin reunan lähellä luiska ei yllä maanpintaan. Pidä tie loitolla reunasta tai laske penkereen tai leikkauksen korkeutta siinä kohdassa. |
| ”Käytävän rajaviivat leikkaavat toisensa (poikkileikkaukset menevät päällekkäin, esimerkiksi tiukan kaarteen sisäpuolella). Käytä suurempaa sädettä tai kapeampaa poikkileikkausrakennetta.” | Terävän kaarteen sisäpuolella poikkileikkaukset menevät päällekkäin. Suurenna sädettä tai kavenna poikkileikkausrakennetta. |

Virheellistä käytävää ei tasata maastoon, eikä se lasketa maamääriin.

## Käytävät ja plattat yhdessä

Suunniteltu maasto rakennetaan järjestyksessä: ensin jokainen käytävä, sitten jokainen platta. Jos platan tasaus menee päällekkäin käytävän kanssa, platta voittaa. Jos myöhempi kohde menee päällekkäin tien kanssa, korvataan vain se osa tiestä, joka on myöhemmän kohteen rajaviivan sisällä; tien muu osa ja mikä tahansa maanpinnan taitelinja, jonka tie ylittää, säilyttää muotonsa. Tilavuudet lasketaan kaikkien rajaviivojen sisällä yhdessä; katso [Maamäärät](topic:volumes).

## Kallistus

Kaarteessa tie voi kallistua kaarteen sisäpuolelle, jolloin liikenne työntyy vähemmän ulospäin. Valitse linjauksen **Ominaisuudet**-kohdassa **Kallistus**-osion alla ruutu **Kallista kaarteet**:

- Jokainen ympyräkaari saa kallistusasteen **e** asteetaulukosta: ensimmäinen rivi, jonka säteeseen kaari yltää (rivi, jonka aste on tyhjä, säilyttää normaalin harjakallistuksen). Taulukko ja **Suurin suhteellinen kaltevuus** (aluksi 0.5 %) ovat paikkamerkkejä, eivät standardi: aseta ne omien suunnitteluperusteidesi mukaan. Lisää tai poista rivejä tarpeen mukaan.
- Ajokaistat kiertyvät keskilinjan ympäri. Ennen kaarretta ulkoajokaista tasoittuu **lähtösiirtymän** (normaali harjakallistus ÷ e × siirtymä) yli, sitten **siirtymän** (ajokaistan leveys × e ÷ kaltevuus) yli ulkoajokaista kiertyy edelleen, kunnes koko tie kallistuu asteella e sisäpuolelle; kaksi kolmannesta siirtymästä on ennen kaarretta ja yksi kolmannes sen päällä. Kaarteen jälkeen tapahtuu sama käänteisessä järjestyksessä.
- Matalalla puolella oleva piennar ei ole koskaan loivempi kuin oma ajokaistansa; korkealla puolella se säilyttää oman kaltevuutensa (se kääntyy yli).
- Sen alla oleva taulukko luettelee kunkin kaarteen säteen, asteen, siirtymän ja lähtösiirtymän sekä kohdat, joissa täysi kallistus alkaa ja päättyy. **Kallistuskaavio** piirtää molempien ajokaistojen poikkikaltevuudet paalujen mukaan (vasen ajokaista yhtenäisenä, oikea katkoviivana).
- Kaarre, joka on liian lyhyt täyteen kallistukseen, tai kaksi kaarretta, joiden siirtymät menevät päällekkäin, ilmoitetaan taulukon yläpuolella olevassa ruudussa.

Poikkileikkaukset, tilavuudet, 3D-näkymä ja arkit näyttävät kaikki kallistetun tien. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Kohteet

Kohde siirtää yhden pisteen tien yhdeltä puolelta viivaan: **ajoradan reunan** tai **piennarreunan** kohdalle **vasemmalla** tai **oikealla** puolella. Jokainen poikkileikkaus kohtaa viivan keskilinjaan nähden suorassa kulmassa ja menee ulos vain tällä puolella, joten oikean puolen kohde ei koskaan siirrä vasenta puolta.

| Asettaa | Mitä tapahtuu, kun poikkileikkaus kohtaa viivan |
|---|---|
| **Leveys** | Piste on viivalla: ajokaista (tai piennar) leventyy tai kapenee siihen ja säilyttää poikkikaltevuutensa. |
| **Korkeus** | Piste saa viivan korkeuden siinä kohdassa omalla etäisyydellään: ajokaistan (tai piennarin) poikkikaltevuus seuraa perässä. |

Viiva voi olla taitelinja (mikä tahansa sen **Käyttö**) tai toisen käytävän viiva: sen keskilinja, ajoradan reunat, piennarreunat tai rajaviivat. Käytävän viiva seuraa tuota käytävää: jos muutat toista tietä, tämä seuraa perässä. CivilCraft rakentaa toisen käytävän ensin; kaksi käytävää, jotka kohdistuisivat toisiinsa silmukassa, hylätään toiselta puolelta, ja taulukko kertoo, mikä.

1. Valitse linjaus ja kytke sen käytävä päälle.
2. Kohdassa **Kohteet** valitse {{ui:Lisää kohde}}.
3. Valitse **Puoli**, **Piste**, mitä se **Asettaa** ja **Viivaan**. Jokainen muutos on yksi kumoamisvaihe.

**Tulos** kertoo, monessako poikkileikkauksessa viiva saavutettiin. Poikkileikkaukset, jotka eivät yllä siihen (viivan päiden ohi tai keskilinjan takana), säilyttävät poikkileikkausrakenteen arvot. Poistettu viiva jättää käytävän siihen tilaan kuin se oli ennen kohdetta, ja taulukko kertoo sen. Yhdellä puolella voi olla yksi leveys- ja yksi korkeuskohde kutakin pistettä kohden.

## Rakenna kumpikin puoli osista

Kytke käytävän asetuksissa päälle **Rakenna kumpikin puoli osista**. Tällöin kummallakin puolella on oma luettelonsa keskilinjasta ulospäin: ajokaistat, piennar, vesiränni, reunakivi, istutuskaista, jalkakäytävä ja viimeisenä sivuluiska maanpintaan (omine leikkaus- ja täyttösuhteineen). Aloita {{ui:Maantie}} tai {{ui:Kaupunkikatu}} -pohjasta, lisää ja poista osia, siirrä niitä nuolilla ja {{ui:Kopioi}} yksi puoli toiselle. Jokainen muutos on yksi kumoamisvaihe.

Poikkikaltevuus on lasku poispäin tiestä, joten jalkakäytävä, joka viettää tiehen päin, on negatiivinen. Reunakivi on pinta, jonka korkeus on annettu, yläreuna annetulla leveydellä ja valinnainen pudotus takana. Kallistus kääntää jokaisen ajokaistan ensimmäisellä rivillä; vesiränni, reunakivi, kaista ja jalkakäytävä riippuvat rakennetun ajokaistan reunasta. Kohteet siirtävät edelleen ajokaistojen päätä ja viimeistä osaa. Poikkileikkauksissa merkitään vesirännin virtausviiva, reunakiven yläreuna ja takareuna sekä muut. Kaarteessa, jossa on siirtymäkaaria, siirtymä on siirtymäkaari: tasainen harja TS-pisteessä, täysi kallistus SC-pisteessä.

## Päällysrakennekerrokset

Ajokaistalla, piennarilla, vesirännillä, istutuskaistalla tai jalkakäytävällä voi olla oma rakenne: osan alla {{ui:Lisää kerros}} lisää kerroksen nimen, materiaalin, paksuuden ja lajin (pintakerros, sideaine, kantava kerros, jakava kerros, routasuojaus tai muu) ylhäältä alas. Kerrokset eivät siirrä tien pintaa (sen yläpinta on suunnittelupinta); jokainen kerros on osan alla, ja sen syvyys mitataan suoraan alaspäin. Poikkileikkauksissa jokaisen kerroksen alareuna piirretään katkoviivana, ja {{ui:Päällysrakennekerrokset: määrät}} luettelee jokaisen kerroksen pohjapinta-alan ja tilavuuden (ala käytävää pitkin sen poikkileikkauksista, tilavuus = ala × paksuus). IFC-vienti kirjoittaa jokaisen kerroksen omana elementtinään paksuuden ja materiaalin kanssa (katso [IFC-vienti ja -tuonti](topic:ifc)). Kirjoittamasi paksuus on sinun: CivilCraft ei mitoita päällysrakenteita.

## Missä tiet kohtaavat teitä, plattoja ja polkuja

Kun {{ui:Liitä tien kohtaamat tiet ja plattat}} on päällä (se on päällä jokaiselle käytävälle), CivilCraft liittää käytävän siihen, mitä se kohtaa pohjapiirroksessa:

- **Tie, joka päättyy toiseen tiehen** (sen linjauksen pää on toisella tiellä tai noin puolen oman ajoradan leveyden sisällä tuon tien reunasta) on liittymän sivutie. Tie, johon se kohtaa, avaa reunansa sivutien ajoradalle: suun yli piennar, reunakivi, kaista ja kävelytie asetetaan ajokaistan poikkikaltevuudelle ja piirretään ajoratana. Sivutie asetetaan pääteen maastomallin pinnalle siinä kohdassa, missä ne menevät päällekkäin, ja se tasataan siihen ylös- tai alaspäin lähestymisen yli.
- **Kaksi tietä, jotka risteävät**, liitetään samalla tavalla molemmin puolin. Linjauksissa ensimmäisenä luetteloitu tie on läpikulkutie; toinen seuraa sen pintaa yli.
- **Tie, joka päättyy plattaan** (platan sisällä tai noin puolen ajoradan leveyden sisällä sen reunasta) saapuu platan tasolle ja tasataan siihen lähestymisen yli.
- **Polku** (Maisema › Kovat pinnat) päättyy tien ulkoreunaan sen kävelytien tai piennarin tasolle sen sijaan, että se menisi tien päälle. Tien ylittävä polku muuttuu kahdeksi osaksi. Päätä, joka on piirretty hieman tien lyhyeksi (enintään kaksinkertaisen polun leveyden päähän), jatketaan reunaan asti.

**Ominaisuudet** kertoo, mitä kukin käytävä liitti, kuinka paljon sitä nostettiin tai laskettiin siinä kohdassa ja minkä matkan yli. Tuo matka on suurempi kuin 10 m (30 ft) ja muutoksen kaksikymmenkertainen arvo, eikä koskaan yli 45 % käytävästä. **Suunniteltua pituusleikkausta ei muuteta**: pituusleikkausnäkymä näyttää edelleen piirtämäsi kaltevuusviivan, ja poikkileikkaukset, suunniteltu maastomalli, tilavuudet ja 3D-näkymä näyttävät tien liitettynä. Jos haluat tehdä liitoksesta suunnitelmallisesti tarkan, siirrä viimeinen PVI-piste tasoon, jonka Ominaisuudet ilmoittaa.

Kytke käytävästä kytkin pois, jolloin se jää täsmälleen sen pituusleikkauksen ja poikkileikkausrakenteen mukaiseksi; silloin se ei osallistu mihinkään liittymään, ei sivutienä eikä läpikulkutienä. Tiet, jotka kohtaavat lähes suorassa linjassa (noin 20° alle), jätetään rauhaan, samoin ajourat.

Mitä liittymä ei vielä tee: reunakivien kaarevia kulmia ei ole (kulmat ovat suoria), ei kääntymiskaistoja eikä saarekkeita, sivutien pää leikataan suoraan omaan linjaukseensa nähden, ja pohjista rakennettu käytävä avaa reunansa samalla yksinkertaisella tavalla (oja tai seinä sen päätetilassa tasataan suun yli ilman rumpua). Pohjapiirroksen reunakivikaaria, näkemäkolmioita ja tiemerkintöjä varten katso [Maaperä, tiet, mittaus, kaivokset ja yhteydet](topic:soils-roads-survey-mines-links).

## Ei vielä toteutettu

Rajaviivan luiskan kohteet eivät ole vielä käytettävissä. Tielle muuttuvaa käytävää, jossa vasen ja oikea puoli erotetaan, käytä [Käytäväpohjat](topic:corridor-templates). Katso [Ei vielä toteutettu](topic:not-built-yet).
