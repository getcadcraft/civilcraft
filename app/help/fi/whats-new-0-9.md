---
title: Mitä uutta versiossa 0.9
summary: Käytävä- ja maastomallipohjat, tarttumat ja poimintapainikkeet piirtäessä, GIS-analyysi attribuuttitaulukon kanssa, varjo-, aurinkotuotto-, mukavuus- ja tuulitutkimukset työmaalle, 3D-renderöintinäkymä sekä Pistepilvet- ja WaterCraft-lisäosat.
keywords: mitä uutta, 0.9, julkaisutiedot, käytäväpohjat, maastomallipohjat, pohjien muokkain, tyypillinen poikkileikkaus, useita käytäviä, tarttuma, tarttumat, poimi, siirrä, kopioi, kierrä, tangentti, renderöinti, 3D-renderöinti, GIS-analyysi, puskuri, päällekkäisyys, attribuuttitaulukko, tyyli attribuutin mukaan, varjotutkimus, aurinkotuotto, UTCI, ulkoilmamukavuus, tuulitutkimus, OpenFOAM, pistepilvet, LAS, LAZ, watercraft, palovirtaama, paloposti, veden ikä, kloori, kysynnät, työkaluvihjeet, asettelu, mitä uutta, muutosloki, muutokset, 0.8, 0.8.1, versio, uudet ominaisuudet, sade, sadevesi, lammikoituminen, tulvaus, maamassat, tasapainotus, leikkaus ja täyttö, kuljetus, paras reitti, pienin kustannus, linjaus, viivytysallas, purkuvirtaama, vapaakorkeus, edistyminen, mittaus, drooni, varastokasa, osoitteesta työmaaksi, tontti, maaperä, tulva, luiskan vakavuus, Bishop, painuma, liittymä, merkinnät, opasteet, näkemäetäisyys, tasoitus, pienimmän neliösumman menetelmä, umpeutuva kiertäminen, avolouhos, lohkomalli, radiolinkki, Fresnel, vaihde, ristikkäisraide, languages, kielet, ongelmat, live, dwg
from: d7ac5b14
---

Tämä on se, mitä CivilCraft 0.9:ssä muuttui verrattuna versioon 0.8.1. CivilCraft 0.9 on osa CadCraft Studio 0.9:ää ja sen kahdeksaa sovellusta. Suuret osat ovat käytävä- ja maastomallipohjat, tarttumat piirtäessä, GIS-analyysi, työmaan auringon, aurinkotuoton, mukavuuden ja tuulen tutkimukset sekä kaksi lisäosaa: Pistepilvet ja WaterCraft.

## Uutta

### Käytävä- ja maastomallipohjat

- **Käytäväpohjat.** Avaa {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Käytäväpohjat…}} (tai kirjoita {{cmd:TEMPLATES}}). Pohja on pieni poikkileikkaus komponentteineen, siirtymineen, kaltevuuksineen, materiaaleineen ja pistekoodeineen. Säilytä niitä projektissa, kohdassa {{ui:Oma kirjasto}} tai `.cctemplates.json`-tiedostona. Pohjamuokkain näyttää todellisessa mittakaavassa piirretyn kuvan ja listaa ongelmat kirjoittaessasi.
- **Rakenna pohjista paaluittain.** Valitse linjaus ja kytke Ominaisuuksissa päälle {{ui:Rakenna mallipohjista paaluittain}}. Kullakin alueen puolella on oma päällystysluettelo ja oma päätyehto. {{ui:Lisää käytävä}} kohdassa {{ui:Tämän linjauksen käytävät}} asettaa useita käytäviä samalle linjaukselle.
- **Maastomallipohjat.** {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Maastomallipohjat…}} (tai kirjoita {{cmd:TERRAINTEMPLATES}}) levittää kerroksellisia materiaaleja, kuten pintamaan tai päällysteen ja pohjan, maastomallin päälle, ja antaa pinta-alan ja tilavuuden kerroksittain. Katso [Käytäväpohjat ja maastomallipohjat](topic:corridor-templates).

### Piirtäminen

- **Tarttumat.** Alignment-, Pad-, Parcel-, Mass-, Feature line-, Measure-, Boundary- ja Catchment-työkalut tarttuvat tasomittauspisteisiin, PI-pisteisiin, kulmiin, kärkipisteisiin ja rakenteisiin, ja merkin vieressä on nimi. Pidä {{key:Alt}} pohjassa saadaksesi vapaan pisteen.
- **Poimintapainikkeet, tangentti sekä siirrä, kopioi, kierrä.** Tasanteen, tontin ja taitelinjan kulmissa on kirjoitettavat Itä- ja Pohjoinen-kentät sekä ristikkoa vastaava Poimi-painike. Ominaisuuksissa on myös {{ui:Tangentti kahdesta pisteestä}} linjauksille ja {{ui:Siirrä, kopioi ja kierrä}} linjauksille, tasanteille, tonteille ja taitelinjoille. Katso [Piirrä tarttumilla, poimituilla kulmilla sekä siirrä, kopioi ja kierrä](topic:draft-with-snaps).
- **Renderöintinäkymä 3D:ssä.** Painike {{ui:Renderöinti}} 3D-palkissa piirtää maan luonnollisin väripaletein, taivaan, sumun ja pehmeät varjot. Se ei muuta mallia. {{ui:Aurinko}}-valikossa on nyt painikkeet {{ui:Käytä}} ja {{ui:Sulje}}. Katso [Katso työmaa 3D:ssä](topic:site-3d).
- **Paneelit avautuvat yksi osio kerrallaan.** Vasen paneeli ja Ominaisuudet-paneeli avaavat yhden osion ja sulkevat muut, ja Maisema-nauhan useita työkaluja sisältävät ruudut ovat jaettuja painikkeita.

### GIS-analyysi

- **Analysoi.** {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Analysoi}} tarjoaa puskurin, päällekkäisyyden, paikkaliitoksen, valinnan attribuutin tai muodon mukaan sekä mittauksen. Jokainen työkalu tekee uuden tason yhdellä kumoamisella.
- **Attribuuttitaulukko.** Tason kolmen pisteen valikossa ovat {{ui:Attribuuttitaulukko…}} ja {{ui:Tyyli attribuutin mukaan…}}. Katso [Analysoi GIS-tasoja](topic:gis-analysis) ja [Työskentele tason attribuuttitaulukon kanssa](topic:gis-table).

### Työmaa: aurinko, aurinkotuotto, mukavuus ja tuuli

- **Ympäristö-osio.** Valitse massa: {{ui:Ympäristö}}-osio on kohdassa {{ui:Aurinkotunnit}} sen Ominaisuuksissa. Siinä on varjotutkimus (kartta, taulukko, animaatio, CSV), aurinkotuotto vuoden tyypillisen sääsäätiedoston (.epw) perusteella ja ulkoilmamukavuus (UTCI).
- **Tuuli, vain seulonta.** {{ui:Suorita tuulitutkimus}} värittää maan istumisesta epämukavaan kullekin tuulensuunnalle sääsäätiedostossa. Se ei ole validoitu, ja paneeli kertoo sen.
- **Jalankulkijatuuli (OpenFOAM) -lisäosa.** Se on pois päältä, kunnes kytket sen päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}. OpenFOAM on ohjelma, jonka asennat itse. Katso [Varjo, aurinkotuotto ja ulkoilmamukavuus](topic:environment).

### Pistepilvet (lisäosa)

- Kytke {{ui:Pistepilvet}} päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}; Pistepilvet-välilehti ilmestyy oikeanpuoleiseen paneeliin. Avaa LAS- tai LAZ-tiedosto, puhdista se, lajittele maanpinnaksi, kasvillisuudeksi ja rakennuksiksi, rakenna maanpinta, korkeuskäyrät ja tilavuudet sekä vie LAS tai LAZ. Katso [Pistepilvet drooni- tai skannerimittauksesta](topic:point-clouds).

### WaterCraft (lisäosa)

- Kytke {{ui:WaterCraft (vedenjakelu)}} päälle kohdassa {{ui:Asetukset}} › {{ui:Lisäosat}}; WaterCraft-välilehti ilmestyy. Siinä ovat asiakkaiden kysynnät, palovirtaama jokaisessa paloposti, mikä päävesijohdon katkos on merkittävin, sekä veden ikä ja kloori, kaikki tallennettavissa CSV-tiedostoina. Katso [WaterCraft: kysynnät, palovirtaama, katkokset ja veden ikä](topic:watercraft).

### Yhdessä työskentely

- Live-istunnossa näet toistesi kohdistimet ja nimet suunnitelmassa. Kirjaston kasvit: CivilCraft Landscape aloittaa oletuskirjastokokoelmasta, {{ui:CivilCraft landscape}}.

## Kaikissa sovelluksissa

- Vihjeet näkyvät Bootstrap-työkaluvihjeinä, ja aloitusvihjeen voi sulkea.
- Paneelin välilehtirivi, joka ei mahdu, vierittyy eikä leikkaudu pois.
- Selainvälilehtien otsikot ovat muotoa `<asiakirja> - CivilCraft | CadCraft`.
- {{ui:Asetukset}}-ikkunassa on Asettelu-osio, jossa asettelut ovat pudotusvalikko kaksirivisin vaihtoehdoin.
- Paino- ja lämpötilayksiköt ovat kohdassa {{ui:Asetukset}} › {{ui:Yleinen}} › {{ui:Yksiköt}}.
- Kielilistassa näkyvät kielet, joille koontiversiossa on tiedostot. Muut kuin englanti ovat konekäännöksiä.

## Korjattu

- Osoitehaku- ja EnergyPlus-tarkistuslisäosia ei voinut kytkeä päälle; nyt voi.
- Ohje kertoo nyt, että Pistepilvet-lisäosa kirjoittaa siivotun pilven LAS 1.4- tai LAZ-muodossa.
- Valitun kohteen oman kahvan napsauttaminen ei enää aloita kahvan vetoa, joka pysäytti odottavan poiminnan.

## Rajoitukset

- Esimerkkikäytäväpohjat ovat paikanpitäjiä, eivät mistään standardista; insinöörin on tarkistettava ne. Maastomallipohjat eivät lisää pintaa, eikä niitä piirretä 3D-näkymään tai poikkileikkausnäkymään. Linjauksen toinen käytävä ei ole IFC-viennissä. Kahden pohjan välillä ei ole kapenemista paalun mukaan.
- Pistepilvet on testattu keksityillä tiedostoilla, ei todellisella droonimittauksella. Vain LAS- ja LAZ-tiedostot luetaan.
- GIS-analyysi on testattu keksityillä tasoilla.
- Varjo, aurinko ja mukavuus ovat suunnitteluarvioita; tuuli on validoimaton seulonta. Mikään niistä ei ole suunnitteluarvo.
- WaterCraft on laskenta-apu, joka on tarkistettu keksityillä verkoilla. Vesihuoltoinsinööri päättää, mitä luvut ovat arvoltaan.
- Muut kuin englanninkieliset kielet ovat konekäännöksiä.
- Windows-asennusohjelmat eivät ole koodilla allekirjoitettuja, ja macOS-levykuvaa ei ole notarisoitu.

## Aiemmin: 0.8 ja 0.8.1

Tämä on se, mitä CivilCraft 0.8:ssa (2026-11-01) ja 0.8.1:ssä (2026-11-02) muuttui verrattuna versioon 0.7. Suuret uudet osat ovat työkalut, jotka testaavat tasaustasi ja työmaatasi (sade, maamassat, reitit, altaat, edistyminen), sekä kuusi laskentaikkunaa maalle, teille, mittauksille, kaivoksille, yhteyksille ja raiteille.

### Uutta

**Testaa tasaustasi**

- **Anna sataa.** {{ui:Sadetus…}} (kohdassa {{ui:Maastomalli}}) antaa myrskyn tasatulle maalle. Näet, miten vesi valuu tasanteilta, lammikoituu matalissa kulmissa ja tulvii liian pienistä altaista. Ajo animoidaan, ja se antaa tilavuudet, huippuulosvirtauksen ja CSV-tiedoston jokaisesta altaasta. Oletussolu on karkea, jotta ensimmäinen katsaus on nopea; hienompi solu on hitaampi. Tulvivat altaat näkyvät myös Ongelmat-paneelissa.
- **Maamassojen tasapainottaja.** {{ui:Maamassojen tasapainottaja…}} nostaa tai laskee tasanteen, kunnes leikkaus on yhtä suuri kuin täyttö, ja näyttää kuljetustaulukon niiden välillä.
- **Paras reitti.** {{ui:Paras reitti…}}: valitse alku ja loppu, ja CivilCraft löytää halvimman reitin maaston yli, joka pysyy kaltevuus- ja kaarirajoissasi, ja tekee siitä linjauksen.
- **Viivytysaltaat.** {{ui:Viivytysaltaat…}} laskee vaiheen ja varaston maastostasi, ottaa purkulaitteita (aukko, pato, V-aukko, ylivuotoallas), ajaa myrskyn altaan läpi ja tarkistaa pidätetyn huippuvirtaaman, tyhjenemisajan ja vapaakorkeuden.
- **Edistyminen mittauksista.** {{ui:Edistyminen mittauksista…}} vertaa eri päivien drooni- tai skannauspintoja maahan sellaisena kuin se oli, ja suunnitelmaan: prosentti valmiina tilavuudella, liian syvät ja liian täytetyt alueet, varastokasat sekä se, milloin työ valmistuu tällä vauhdilla (merkittynä arvioksi).

**Tunne työmaa**

- **Osoitteesta työmaaksi.** {{ui:Osoitteesta työmaaksi…}} kokoaa yhteen avoimet tontti-, rakennus-, kaavoitus-, maaperä-, tulva- ja maastotiedot yhdelle työmaalle. Voit säilyttää työmaan projektitiedostossa: kirjoitetun osoitteen, kunkin lähteen sekä sen päivän, jolloin hait sen, ja sen lisenssin ja sen, mitä palautui. Kun avaat tai jaat projektin uudelleen, työmaa on yhä siinä, eikä mitään haeta uudelleen. Voit myös tallentaa sen työmaatiedostona tai lähettää BimCraftiin. Katso [Osoitteesta työmaaksi](topic:address-to-site).

**Maa, tiet, mittaus, kaivokset, yhteydet ja raiteet**

- **Maaperä ja luiskat.** {{ui:Maaperä ja luiskat…}} piirtää maaperäprofiilin kirjoittamiesi porausten välille. Bishopin menetelmä etsii sitten kriittisen ympyrän maastostasi, huomioiden pohjaveden, lisäkuorman ja maanjäristyskertoimen; perustuksen painumaan lasketaan konsolidaatio, välitön painuma ja aika.
- **Liittymät ja merkinnät.** {{ui:Liittymät ja merkinnät…}} kokoaa haarat yhteen reunakivipaluilla (yksi säde haaraa kohden tai kolmikeskisiä paluita), suunnittelunopeuden näkemäetäisyyden, näkemiskolmioiden tarkistuksen, suojatiet, pysäytysviivat, merkinnät ja opasteet opastetaulukon kanssa. Ne piirtyvät suunnitelmaan ja tallennetaan .dxf-tiedostona nimetyillä tasoilla.
- **Mittausten tasoitus.** {{ui:Mittausten tasoitus…}} ajaa pienimmän neliösumman tasoituksen monikulmiolle tai verkolle: tasoitetut koordinaatit, virhe-ellipsit, khiin neliö -testi ja merkintä mittauksesta, joka ei sovi. Vapaat verkot sekä monikulmion sulkeminen kompassisäännöllä ja RW5 ovat mukana, ja GSI-, JobXML- ja CSV-kenttätiedostot luetaan; tasoitetut pisteet tallentuvat CSV-tiedostoina.
- **Avolouhokset.** {{ui:Avolouhokset…}} muuttaa porausnäytteet lohkomalliksi ja loppukaivokseksi kaltevuuskulmasi sisällä, kaivosluvun, taulukon penkereittäin sekä pitoisuus- ja tonnikäyrän kanssa. Sisäkkäiset kaivokset tuottokertoimen mukaan ja diskontattu rahavirtatuotanto-aikataulu ovat myös mukana.
- **Radiolinkit.** {{ui:Radiolinkit…}} tarkistaa näkölinjan maastosi yli maapallon kaarevuuden ja ensimmäisen Fresnel-vyöhykkeen kanssa, sekä linkkibudjetin, häipymämarginaalin ja monitie-katkoksen, ja antaa masto korkeuden, joka vapauttaa reitin. Se tekee myös kuitu-häviöbudjetit, reittimäärät ja tuulen tornille.
- **Raidevaihteet.** {{ui:Raidevaihteet…}} tekee vaihteen sen sydänluvun perusteella, ristikkäisraiteet rinnakkaisten raiteiden välillä sekä rakennusvapaan tilan, joka kallistuu kallistuksen mukaan ja levenee kaarteessa. Vaihde voi sijaita linjauksen paalulla. 

Katso [Maaperä, liittymät, mittauksen tasoitus, kaivokset, radiolinkit ja vaihteet](topic:soils-roads-survey-mines-links).

### Kaikissa sovelluksissa

- **Kielet.** 54 kieltä, joista kymmenen on uutta. Muut kuin englanti ovat konekäännöksiä, kunnes äidinkielinen puhuja lukee ne. Ohjeaiheet ovat yhä enimmäkseen englanniksi.
- **Työkalurivit.** {{ui:Asetukset}} › {{ui:Yleiset}} › {{ui:Työkalurivin rivit}}: Rivitys (kuten ennen), 2 riviä tai 1 rivi. CivilCraftin Nauha näyttää eniten käytetyn työkalun suurena, seuraavat pieninä ja loput ryhmän nimen nuolen takana.
- **Syöttölaitteet.** Kosketuslevy, kynä, 3D-hiiri, ohjain ja MIDI voivat ohjata sovelluksia.
- **Ongelmat.** Ongelmat-paneeli, joka varoittaa kaikissa sovelluksissa, ja tarkistukset, jotka lukevat säännöstöpaketteja.
- **Live.** Näkymä siitä, kuka on missä Live-istunnossa.
- **Lisäosat.** Lisäosaluettelo valaistuslisäosineen.
- **Yhdistä tekoälysi.** Mikä tahansa yhdistämäsi avustaja voi ohjata CivilCraftin työkaluja. Mukana on huomautus, että yhden napsautuksen yhdistäminen CadCraft Studiossa ja hostattu liitin eivät ole vielä valmiita. Katso [Anna tekoälyavustajan työskennellä työmaasi kanssa](topic:assistants).

### Korjattu versiossa 0.8.1

- **DWG-luokkaosio.** Se luettiin väärän tyyppisenä (GitHub cadcraft#5). Korjattu CivilCraftissa yhdessä CadCraftin, BimCraftin, ModelCraftin ja TakeoffCraftin kanssa.
- **Kielen vaihtaminen ajon aikana.** CadCraft Studio ja pakatut versiot voivat vaihtaa kieltä ajon aikana. Ennen ne olivat vain englanniksi. Ei vielä testattu kaikilla alustoilla: kerro, jos kieli ei vaihdu.

### Ei vielä tässä versiossa

- **Nämä ovat laskenta-apuja.** Jokainen uusien ikkunoiden tulos vaatii insinöörin tarkistuksen. Maaperän lujuudet lähtevät maaperäryhmän tyypillisistä arvoista, ja ikkuna kertoo sen.
- **Sateen tekeminen.** Ajo esimerkkityömaalla voi kestää yli kaksi minuuttia selaimessa hienolla solulla. Sitä on tarkistettu käsin lasketuilla tapauksilla ja V-muotoisella valuma-alueella, ei vielä todellisella tasatulla työmaalla.
- **Osoitteesta työmaaksi.** Se lukee avoimia datatiedostoja, jotka tuot itse, ja sitä on testattu vain omilla tiedostoillamme. Puita ei ole lähteenä. Lähteiden hakeminen puolestasi odottaa tietosuojasanamuotoilua.
- **Edistyminen mittauksista.** Testattu vain keksityillä mittauksilla. Edistymistä arkeilla ja merkinnöillä (MarkupCraft) sekä skannausta mallia vastaan (BimCraft) ei ole toteutettu.
- **Maaperä ja luiskat.** Vain ympyrän muotoiset pinnat: ei kiilaa tai lohkohakua eikä jännityshalkeamaa.
- **Liittymät.** Yksi säde haaraa kohden, ei kuorma-autojen ajouria, eivätkä ne mene vielä käytävään.
- **Kenttätiedostot.** Lukijat on kirjoitettu julkisista formaattikuvauksista ja kokeiltu omilla tiedostoillamme. Todellisia mittalaitetiedostoja tarvitaan.
- **Linkit ja raiteet.** Radiolinkit: vain vapaatilan häviö ja monitie (ei sadehäipymää eikä antennikuvioita), eikä rautatiestandardia: jokainen raja-arvo on paikanpitäjä, ja luonnosluvut ovat sellaisia, joita yksikään rautatieinsinööri ei ole tarkistanut.
- **Windows ja macOS.** 0.8 ei ole koodilla allekirjoitettu. Windows voi varoittaa, ja macOS pyytää hiiren oikean painikkeen napsautusta ja sitten Avaa.

Kaikki muu on luettelossa [Ei vielä toteutettu](topic:not-built-yet). Aiempi julkaisu: [Mitä uutta versiossa 0.7](topic:whats-new-0-7).
