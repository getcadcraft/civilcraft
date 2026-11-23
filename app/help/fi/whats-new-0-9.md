---
title: Uutta versiossa 0.9 (aiemmin)
summary: Käytäväpohjat ja maastopohjat, tartunnat ja poimintapainikkeet piirtäessä, GIS-analyysi attribuuttitaulukolla, varjo-, aurinkoenergia-, mukavuus- ja tuulitutkimukset alueelle, 3D-renderöintinäkymä sekä Pistepilvet- ja WaterCraft-lisäosat.
keywords: uutta 0.9, aiempi julkaisu, uutta, 0.9, julkaisutiedot, käytäväpohjat, maastopohjat, pohjaeditori, tyyppipoikkileikkaus, useita käytäviä, tartunta, tartunnat, poimi, siirrä, kopioi, kierrä, tangentti, renderöinti, 3d-renderöinti, gis-analyysi, puskuri, päällekkäisyys, paikkaliitos, attribuuttitaulukko, tyylitä attribuutin mukaan, varjotutkimus, aurinkoenergia, utci, ulkoilmamukavuus, tuulitutkimus, openfoam, pistepilvet, las, laz, watercraft, palovirtaama, palopostti, veden ikä, kloori, kysyntä, työkaluvihjeet, asettelu, uutta, julkaisutiedot, muutosloki, muutokset, 0.8, 0.8.1, versio, uudet ominaisuudet, sade, sadetus, maamassat, tasapaino, leikkaus ja täyttö, kuljetus, paras reitti, lyhin kustannus, linjaus, viivytysallas, purku, tyhjeneminen, vapaakorkeus, edistyminen, mittaus, drone, kasa, osoite, tontti, maaperä, tulva, luiskan vakavuus, bishop, painuma, liittymä, merkinnät, opasteet, näkemäetäisyys, tasoitus, pienimmän neliösumman, jonomittaus, avolouhos, lohkomalli, radiolinkki, fresnel, vaihde, ohitusraide, live, dwg
from: 4664522c
---

Tämä on se, mikä muuttui CivilCraft 0.9:ssä verrattuna versioon 0.8.1. CivilCraft 0.9 on osa CadCraft Studio 0.9 -ohjelmistoa ja sen kahdeksaa sovellusta. Suurimmat osat ovat käytävä- ja maastopohjat, tartunnat piirtäessä, GIS-analyysi, tutkimukset tontin auringosta, aurinkoenergiasta, mukavuudesta ja tuulesta sekä kaksi lisäosaa: Pistepilvet ja WaterCraft.

## Uutta

### Käytäväpohjat ja maastopohjat

- **Käytäväpohjat.** Avaa {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Käytäväpohjat…}} (tai kirjoita {{cmd:TEMPLATES}}). Pohja on pieni poikkileikkaus osineen, etäisyyksineen, kaltevuuksineen, materiaaleineen ja pistekoodeineen. Säilytä ne projektissa, {{ui:Oma kirjasto}}-kirjastossa tai `.cctemplates.json`-tiedostona. Pohjamuokkain näyttää piirroksen oikeassa mittakaavassa ja luettelee ongelmat kirjoittaessasi.
- **Rakenna mallipohjista paaluittain.** Valitse linjaus ja kytke sen Ominaisuuksissa päälle {{ui:Rakenna mallipohjista paaluittain}}. Jokaisella alueen puolella on oma päällysrakennelistansa ja oma päätetilansa. {{ui:Lisää käytävä}} kohdassa {{ui:Tämän linjauksen käytävät}} asettaa useita käytäviä yhdelle linjaukselle.
- **Maastopohjat.** {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Maastopohjat…}} (tai kirjoita {{cmd:TERRAINTEMPLATES}}) asettaa kerrostetut materiaalit, kuten pintamaan tai päällysteen ja kantavan kerroksen, maastoon, ja jokaiselle kerrokselle pinta-alan ja tilavuuden. Katso [Käytäväpohjat ja maastopohjat](topic:corridor-templates).

### Piirtäminen

- **Tartunnat.** Linjaus-, platta-, tontti-, massa-, taitelinja-, mittaus-, raja- ja valuma-alueen työkalut tarttuvat mittauspisteisiin, PI-pisteisiin, kulmiin, kärkipisteisiin ja rakenteisiin, ja merkin vieressä on tunniste. Pidä {{key:Alt}} painettuna vapaalle pisteelle.
- **Poimintapainikkeet, tangentti sekä siirto, kopiointi ja kierto.** Platan, tontin ja taitelinjan kulmissa on kirjoitettavat itä- ja pohjoiskentät sekä Poimi-painike tähtäimen kuvalla. Ominaisuuksissa on myös {{ui:Tangentti kahdesta pisteestä}} linjauksille ja {{ui:Siirrä, kopioi ja kierrä}} linjauksille, plateille, tonteille ja taitelinjoille. Katso [Piirrä tartunnoilla, valituilla kulmilla sekä siirrä, kopioi ja kierrä](topic:draft-with-snaps).
- **Renderöintinäkymä 3D:ssä.** 3D-palkin {{ui:Renderöinti}}-painike piirtää maaston luonnollisin värein, taivaan, sumun ja pehmeät varjot. Se ei muuta mallia. {{ui:Aurinko}}-valikossa on nyt {{ui:Käytä}}- ja {{ui:Sulje}}-painikkeet. Katso [Tarkastele aluetta 3D:ssä](topic:site-3d).
- **Paneelit avautuvat yksi osio kerrallaan.** Vasen paneeli ja Ominaisuudet-paneeli avaavat yhden osion ja sulkevat muut, ja Maiseman valintanauhan laatat, joissa on useita työkaluja, ovat jaettuja painikkeita.

### GIS-analyysi

- **Analysoi.** {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Analysoi}} tarjoaa puskurin, päällekkäisyyden, paikkaliitoksen, valinnan attribuutin tai muodon mukaan sekä mittauksen. Jokainen työkalu tekee uuden tason yhdessä kumoamisvaiheessa.
- **Attribuuttitaulukko.** Tason kolmen pisteen valikossa on {{ui:Attribuuttitaulukko…}} ja {{ui:Tyylitä attribuutin mukaan…}}. Katso [Analysoi GIS-tasot](topic:gis-analysis) ja [Työskentele tason attribuuttitaulukon kanssa](topic:gis-table).

### Tontti: aurinko, aurinkoenergia, mukavuus ja tuuli

- **Ympäristöosio.** Valitse massa: Ympäristö-osio on sen Ominaisuuksissa kohdan {{ui:Aurinkotunnit}} alla. Siinä on varjotutkimus (kartta, taulukko, animaatio, CSV), aurinkoenergia tyypillisen vuoden säätiedostosta (.epw) ja ulkoilmamukavuus (UTCI).
- **Tuuli, vain seulonta.** {{ui:Suorita tuulitutkimus}} värittää maanpinnan istuttavasta epämukavaan kullekin tuulensuunnalle säätiedostossa. Sitä ei ole validoitu, ja paneeli kertoo sen.
- **Jalankulkijatuuli (OpenFOAM) -lisäosa.** Pois päältä, kunnes kytket sen päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}. OpenFOAM on ohjelmisto, jonka asennat itse. Katso [Varjo, aurinkoenergia ja ulkoilmamukavuus](topic:environment).

### Pistepilvet (lisäosa)

- Kytke {{ui:Pistepilvet}} päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}; oikeanpuoleiseen paneeliin ilmestyy Pistepilvet-välilehti. Avaa LAS- tai LAZ-tiedosto, siivoa se, lajittele maanpintaan, kasvillisuuteen ja rakennuksiin, rakenna maanpinta, korkeuskäyrät ja tilavuudet sekä vie LAS- tai LAZ-tiedosto. Katso [Pistepilvet dronesta tai skannerista](topic:point-clouds).

### WaterCraft (lisäosa)

- Kytke {{ui:WaterCraft (vesijakelu)}} päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}; WaterCraft-välilehti ilmestyy. Siinä on asiakkaiden kysyntä, palovirtaama jokaisessa palopostissa, se, mikä vesijohtokatko haittaa eniten, sekä veden ikä ja kloori, kukin tallennettuna CSV-muodossa. Katso [WaterCraft: kysyntä, palovirtaama, katkot ja veden ikä](topic:watercraft).

### Yhdessä työskentely

- Live-istunnossa näet toistesi osoittimet ja nimet pohjapiirroksessa. Kirjastokasvit: CivilCraft Landscape aloittaa oletuskokoelmastaan, {{ui:CivilCraft landscape}}.

## Jokaisessa sovelluksessa

- Vihjeet näkyvät Bootstrap-työkaluvihjeinä, ja aloitusvihjeen voi sulkea.
- Paneelin välilehtirivi, joka ei mahdu, saa vierityksen sen sijaan, että se leikattaisiin.
- Selainvälilehtien otsikot ovat muotoa `<document> - CivilCraft | CadCraft`.
- {{ui:Asetukset}}-kohdassa on Asettelu-osio, jossa asettelut ovat pudotusvalikko kaksirivisin vaihtoehdoin.
- Paino- ja lämpötilayksiköt ovat kohdassa {{ui:Asetukset}} › {{ui:Yleinen}} › {{ui:Yksiköt}}.
- Kieliluettelo näyttää ne kielet, joille versiolla on tiedostot. Muut kuin englannin kielet ovat konekäännöksiä luonnoksina.

## Korjattu

- Osoitehaun ja EnergyPlus-tarkistuksen lisäosia ei voinut kytkeä päälle; nyt voi.
- Ohje kertoo nyt, että Pistepilvet-lisäosa kirjoittaa siivotun pilven LAS 1.4- tai LAZ-muodossa.
- Valitun kohteen oman otteen napsautus ei enää aloita otteen vetoa, joka pysäytti odottavan Poimi-toiminnon.

## Rehelliset rajat

- Esimerkkikäytäväpohjat ovat paikkamerkkejä, joilla ei ole standardia; insinöörin on tarkistettava ne. Maastopohjat eivät lisää pintaa, eikä niitä piirretä 3D:ssä tai poikkileikkausnäkymässä. Linjauksen toinen käytävä ei ole IFC-viennissä. Kahden pohjan välillä paaluittain ei ole kapenemista.
- Pistepilviä on testattu keksityillä tiedostoilla, ei todellisella drone-mittauksella. Vain LAS- ja LAZ-tiedostot luetaan.
- GIS-analyysiä on testattu keksityillä tasoilla.
- Varjo-, aurinko- ja mukavuustiedot ovat suunnitteluarvioita; tuuli on vahvistamaton seulonta. Mikään niistä ei ole suunnitteluarvo.
- WaterCraft on laskentaapu, jota on tarkistettu keksityillä verkoilla. Vesi-insinööri päättää, mitä luvut ovat arvoiltaan.
- Muut kuin englannin kielet ovat konekäännöksiä luonnoksina.
- Windows-asentajat eivät ole koodisignoituja, eikä macOS-levykuvaa ole notarisoitu.

## Aiemmin: 0.8 ja 0.8.1

Tämä on se, mikä muuttui CivilCraft 0.8:ssa (2026-11-01) ja 0.8.1:ssä (2026-11-02) verrattuna versioon 0.7. Suurimmat uudet osat ovat työkaluja, jotka testaavat tasauksesi ja tonttisi (sade, maamassat, reitit, altaat, edistyminen), sekä kuusi laskentaikkunaa maaperälle, teille, mittauksille, kaivoksille, yhteyksille ja rautatielle.

### Uutta

**Testaa tasaus**

- **Anna sataa.** {{ui:Sadetus…}} ({{ui:Maastomalli}}-kohdassa) päästää myrskyn tasatulle maalle. Näet veden valuvan platoilta, lammikoituvan matalille kulmille ja ylivuotavan liian pienistä altaista. Ajo on animoitu, ja se antaa tilavuudet, huippuvirtaaman ja CSV:n jokaisesta altaasta. Oletussolu on karkea, joten ensimmäinen katsaus on nopea; hienompi solu on hitaampi. Ylivuotavat altaat näkyvät myös Ongelmat-paneelissa.
- **Maamassojen tasapainottaja.** {{ui:Maamassojen tasapainottaja…}} nostaa tai laskee plattaa, kunnes leikkaus on yhtä suuri kuin täyttö, ja näyttää niiden välisen kuljetustaulukon.
- **Paras reitti.** {{ui:Paras reitti…}}: valitse alku ja loppu, ja CivilCraft löytää halvimman polun maaston yli, joka pysyy kaltevuus- ja kaarirajoissasi, ja tekee siitä linjauksen.
- **Viivytysaltaat.** {{ui:Viivytysaltaat…}} laskee vedenkorkeuden ja varastoinnin maastostasi, ottaa huomioon purkulaitteet (aukko, pato, V-aukko, ylivuotokynnys), reitittää myrskyn altaan läpi ja tarkistaa pidätetyn huippuvirtaaman, tyhjenemisajan ja vapaakorkeuden.
- **Edistyminen mittauksista.** {{ui:Edistyminen mittauksista…}} vertaa eri päivinä otettuja drone- tai skannauspintoja maanpintaan sellaisena kuin se oli, ja suunnitelmaan: valmiusaste tilavuutena, yli kaivetut ja yli täytetyt alueet, upotuskasat ja milloin työ valmistuu tällä vauhdilla (merkitty arvioksi).

**Tunne tontti**

- **Osoitteesta työmaaksi.** {{ui:Osoitteesta työmaaksi…}} kokoaa avoimet tonttitiedot, rakennus-, kaavoitus-, maaperä-, tulva- ja maastotiedot yhdelle tontille. Voit säilyttää tontin projektitiedostossa: kirjoitetun osoitteen, kunkin lähteen haun päivän ja lisenssin sekä palautuneet tiedot. Avaa projekti uudelleen tai jaa se, niin tontti on yhä siellä, eikä mitään haeta uudelleen. Voit myös tallentaa sen tonttitiedostona tai lähettää sen BimCraft-ohjelmaan. Katso [Osoitteesta työmaaksi](topic:address-to-site).

**Maa, tiet, mittaus, kaivokset, yhteydet ja rautatie**

- **Maaperä ja luiskat.** {{ui:Maaperä ja luiskat…}} piirtää maaperäprofiilin kirjoittamiesi porausten väliin. Bishopin menetelmä etsii sitten kriittisen ympyrän maastostasi vedenpinnan, ylikuorman ja maanjäristyskertoimen kanssa; perustuksen painuma saa konsolidaation, välittömän painuman ja ajan.
- **Liittymät ja merkinnät.** {{ui:Liittymät ja merkinnät…}} kokoaa haarat yhteen reunakivikaarilla (yksi säde haaraa kohti tai kolmen keskipisteen kaaret), suunnittelunopeuden näkemäetäisyyden, näkemäkolmioiden tarkistuksen, suojatiet, pysäytysviivat, merkinnät ja opasteet opastetaulukon kanssa. Ne piirretään pohjapiirrokseen ja tallennetaan .dxf-tiedostona nimetyille tasoille.
- **Mittausten tasoitus.** {{ui:Mittausten tasoitus…}} tekee pienimmän neliösumman tasoituksen jonomittaukselle tai verkolle: tasoitetut koordinaatit, virhe-ellipsit, chi-neliötesti ja merkintä mittauksessa, joka ei sovi. Mukana ovat vapaat verkot, jonon sulkeminen kompassisäännöllä sekä RW5-, GSI-, JobXML- tai CSV-kenttätiedostot, ja tasoitetut pisteet tallentuvat CSV-muodossa.
- **Avolouhokset.** {{ui:Avolouhokset…}} muuttaa poranäytteet lohkomalliksi ja lopulliseksi louhokseksi luiskakulmasi sisällä, mukana kuorintasuhde, taulukko penkereittäin sekä pitoisuus- ja tonnikäyrä. Myös sisäkkäiset louhokset tuottokertoimen mukaan sekä tuotantoaikataulu diskontatulla rahavirralla ovat mukana.
- **Radiolinkit.** {{ui:Radiolinkit…}} tarkistaa näköyhteyden maastosi yli maapallon kaarevuuden, ensimmäisen Fresnel-vyöhykkeen, linkkibudjetin, häipymävaran ja monitiekatkon huomioiden sekä antaa mastokorkeuden, joka vapauttaa polun. Se tekee myös kuitujen häviöbudjetit, reittimäärät ja tuulen mastoon kohdistuvana kuormana.
- **Raidevaihteet.** {{ui:Raidevaihteet…}} tekee vaihteen sydänkappaleluvun perusteella, risteysvaihteet rinnakkaisten raiteiden välillä sekä rakennusrajan, joka kallistuu kallistuksen mukaan ja levenee kaarteessa. Vaihde voi sijaita linjauksen paalussa.

Katso [Maaperä, liittymät, mittausten tasoitus, louhokset, radiolinkit ja vaihteet](topic:soils-roads-survey-mines-links).

### Korjattu versiossa 0.8.1

- **DWG-luokkaosio.** Se luettiin väärän tyyppisenä (GitHub cadcraft#5). Korjattu CivilCraftissa yhdessä sovellusten CadCraft, BimCraft, ModelCraft ja TakeoffCraft kanssa.
- **Kielen vaihtaminen käynnin aikana.** CadCraft Studio ja pakatut versiot voivat vaihtaa kieltä ajon aikana. Ennen ne olivat vain englanniksi. Ei vielä testattu jokaisella alustalla: kerro meille, jos kieli ei vaihdu.

### Ei vielä tässä versiossa

- **Nämä ovat laskentaapuja.** Jokainen uusien ikkunoiden tulos tarvitsee insinöörin tarkistuksen. Maaperän lujuudet alkavat maaperäryhmän tyypillisistä arvoista, ja ikkuna kertoo sen.
- **Anna sataa.** Ajo näytealueella voi kestää yli kaksi minuuttia selaimessa hienolla solulla. Sitä on tarkistettu käsin lasketuilla tapauksilla ja V-muotoisella valuma-alueella, mutta ei vielä todellisella tasatulla alueella.
- **Osoitteesta työmaaksi.** Se lukee avoimia datatiedostoja, jotka tuot, ja on testattu vain omilla tiedostoillamme. Puut eivät ole lähde. Lähteiden hakeminen puolestasi odottaa tietosuojailmoituksen sanamuotoa.
- **Edistyminen mittauksista.** Testattu vain keksityillä mittauksilla. Edistymisen seuranta arkeilla ja merkinnöillä (MarkupCraft) sekä skannauksen vertaaminen malliin (BimCraft) ei ole rakennettu.
- **Maaperä ja luiskat.** Vain ympyrämäiset pinnat: ei kiila- eikä lohkohakua eikä jännityssäröä.
- **Liittymät.** Yksi säde haaraa kohti, ei raskaan liikenteen kääntöratoja, eivätkä ne vielä mene käytävään.
- **Kenttätiedostot.** Lukijat on kirjoitettu julkisten formaattikuvausten pohjalta ja kokeiltu omilla tiedostoillamme. Todellisia mittalaitetiedostoja toivotaan.
- **Yhteydet ja rautatie.** Radiolinkit: vain vapaatilan vaimennus ja monitie (ei sateen aiheuttamaa häipymistä eikä antennikuvioita), eikä rautatiestandardia: jokainen raja on paikkamerkki, luonnosarvoilla, joita yksikään rautatieinsinööri ei ole tarkistanut.
- **Windows ja macOS.** 0.8 ei ole koodisignoitu. Windows voi varoittaa, ja macOS pyytää napsauttamaan hiiren oikealla painikkeella ja sitten Avaa.

Kaikki muu on kohdassa [Ei vielä toteutettu](topic:not-built-yet). Aiempaan julkaisuun katso [Uutta versiossa 0.7](topic:whats-new-0-7).
