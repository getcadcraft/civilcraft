---
title: Uutta versioissa 0.8 ja 0.8.1
summary: CivilCraft 0.8 lisää Sadetus-toiminnon (myrskysade tasatun maaston yli), maamassojen tasapainottajan, paras reitti -haun, viivytysaltaat, edistymisen mittauksista, osoitteesta työmaaksi -tuojan, joka säilyttää työmaan projektissa, sekä ikkunat maaperälle ja luiskille, liittymille ja merkinnöille, mittausten tasoitukselle, avolouhoksille, radiolinkeille ja raidevaihteille. 0.8.1 korjaa DWG-tiedostojen lukemisen.
keywords: uutta, mitä uutta, julkaisutiedot, muutosloki, muutokset, 0.8, 0.8.1, versio, uudet ominaisuudet, sade, myrsky, altaan ylivuoto, maamassat, tasapaino, leikkaus ja penger, kuljetus, paras reitti, vähimmäiskustannus, linjaus, viivytysallas, purku, tyhjennys, vapaakorkeus, edistyminen, mittaus, drone, materiaalikasa, osoitteesta työmaaksi, tontti, maaperä, tulva, luiskan vakavuus, Bishop, painuma, liittymä, merkinnät, liikennemerkit, näkemäetäisyys, tasoitus, pienimmän neliösumman, monikulmiomittaus, avolouhos, lohkomalli, radiolinkki, Fresnel, raidevaihde, ristivaihde, kielet, ongelmat, Live, dwg
from: b0932cf0
---

Tässä ovat muutokset CivilCraft 0.8 (2026-11-01) ja 0.8.1 (2026-11-02) verrattuna versioon 0.7. Suurimmat uudet osat ovat työkaluja, joilla voi testata tasausta ja työmaata (sade, maamassat, reitit, altaat, edistyminen), sekä kuusi laskentaikkunaa maastolle, teille, mittauksille, kaivoksille, linkeille ja raiteille.

## Uutta

### Testaa tasaus

- **Sadetus.** {{ui:Make it rain…}} (kohdassa {{ui:Surface}}) päästää myrskysateen tasatulle maastolle. Näet, miten vesi valuu pois alustoilta, kertyy matalimpiin kohtiin ja ylittää liian pienet altaat. Ajo on animoitu, ja se antaa tilavuudet, huippuvirtaaman ja CSV-tiedoston kaikista altaista. Oletusruudukko on karkea, jotta ensivilkaisu on nopea; tarkka ruudukko on hitaampi. Altaiden ylivuoto näkyy myös Ongelmat-paneelissa.
- **Maamassojen tasapainottaja.** {{ui:Earthwork balancer…}} nostaa tai laskee alustaa, kunnes leikkaus vastaa penkereitä, ja näyttää niiden välisen kuljetustaulukon.
- **Paras reitti.** {{ui:Best route…}}: valitse alku ja loppu, ja CivilCraft löytää halvimman polun maaston yli niin, että se pysyy tasauksen ja kaarteen rajoissa. Sen pohjalta tehdään linjaus.
- **Viivytysaltaat.** {{ui:Detention ponds…}} laskee tasot ja varastotilan maastosta, ottaa huomioon purkulaitteet (aukko, pato, V-aukko, ylivuotokanava), ajaa myrskyn altaan läpi ja tarkistaa pidätetyn huippuvirtaaman, tyhjennysajan ja vapaakorkeuden.
- **Edistyminen mittauksista.** {{ui:Progress from surveys…}} vertaa eri päivinä otettuja drone- tai skannauspintoja maastoon sellaisena kuin se oli ja suunnitelmaan: valmiusaste tilavuuden mukaan, yli kaivetut ja yli täytetyt alueet, materiaalikasat sekä arvio siitä, milloin työ valmistuu tällä vauhdilla (merkittynä arvioksi).

### Tunne työmaa

- **Osoitteesta työmaaksi.** {{ui:Address to site…}} kokoaa avoimet tonttitiedot, rakennustiedot, kaavoitustiedot, maaperä-, tulva- ja maastotiedot yhdeksi työmaaksi. Työmaan voi säilyttää projektitiedostossa: kirjoitettu osoite, jokainen lähde sen päivämäärineen ja lisenssineen sekä saatu tulos. Kun avaat tai jaat projektin uudelleen, työmaa on yhä tallessa, eikä mitään haeta uudelleen. Voit myös tallentaa sen työmaatiedostona tai lähettää sen BimCraftiin. Katso [Osoitteesta työmaaksi](topic:address-to-site).

### Maasto, tiet, mittaus, kaivokset, linkit ja raiteet

- **Maaperät ja luiskat.** {{ui:Soils and slopes…}} piirtää maaperäprofiilin kirjoittamiesi koepisteiden väliin. Bishopin menetelmä etsii sitten kriittisen ympyrän maastostasi, huomioon ottaen pohjaveden, lisäkuorman ja maanjäristyskertoimen. Perustuksen painumaan lisätään konsolidaatio, välitön painuma ja aika.
- **Liittymät ja merkinnät.** {{ui:Junctions and striping…}} kokoaa haarat yhteen reunakivien kaarteilla (yksi säde haaraa kohti tai kolmen keskipisteen kaaret), suunnittelunopeuden mukaisen näkemäetäisyyden, näkemäkolmioiden tarkistuksen, suojatiet, pysäytysviivat, merkinnät ja liikennemerkit merkkiluettelolla. Ne piirretään pohjapiirrokseen ja tallennetaan .dxf-tiedostoksi nimetyillä tasoilla.
- **Mittausten tasoitus.** {{ui:Survey adjustment…}} tekee monikulmiomittauksen tai verkon pienimmän neliösumman tasoituksen: tasoitetut koordinaatit, virheellipsit, khiin neliön testi ja merkintä mittauksesta, joka ei sovi. Mukana ovat vapaat verkot, monikulmion sulkeminen kompassisäännöllä sekä RW5-, GSI-, JobXML- ja CSV-kenttätiedostot, ja tasoitetut pisteet tallentuvat CSV-muodossa.
- **Avolouhokset.** {{ui:Open pits…}} muuttaa poraustiedot lohkomalliksi ja loppuavolouhokseksi kallion kaltevuuskulmasi sisällä, mukana louhintasuhde, taulukko penkereittäin sekä pitoisuus- ja tonnikäyrä. Mukana ovat myös tuoton mukaan sisäkkäiset kaivokset ja tuotantoaikataulu diskontatulla rahavirralla.
- **Radiolinkit.** {{ui:Radio links…}} tarkistaa näköyhteyden maastosi yli maapallon kaarevuus, ensimmäinen Fresnel-vyöhyke, linkkibudjetti, häipymämarginaali ja monitieheijastuksen katkot. Se antaa myös mastokorkeuden, jolla polku on vapaa. Lisäksi se laskee kuituhäviöbudjetit, reittimäärät ja tuulikuorman mastoon.
- **Raidevaihteet.** {{ui:Rail turnouts…}} tekee raidevaihteen sydänluvun perusteella, ristivaihteet rinnakkaisten raiteiden välille sekä rakennusrajan, joka kallistuu kallistuksen mukaan ja levenee kaarteessa. Raidevaihde voi sijaita linjauksen paalulla.

Katso [Maaperät, liittymät, mittausten tasoitus, kaivokset, radiolinkit ja raidevaihteet](topic:soils-roads-survey-mines-links).

## Kaikissa sovelluksissa

- **Kielet.** 54 kieltä, joista kymmenen on uusia. Muut kuin englanti ovat konekäännösluonnoksia, kunnes äidinkielenään puhuva lukee ne. Ohjeaiheet ovat yhä enimmäkseen englanniksi.
- **Työkalurivin rivit.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Rivitä (kuten ennen), 2 riviä tai 1 rivi. CivilCraftin valintanauha näyttää eniten käytetyn työkalun suurena, seuraavat pieninä ja loput ryhmän nimen nuolen takana.
- **Syöttölaitteet.** Kosketuslevy, kynä, 3D-hiiri, ohjain ja MIDI voivat ohjata sovelluksia.
- **Ongelmat.** Ongelmat-paneeli varoittaa kaikissa sovelluksissa, ja tarkistukset lukevat säännöstöpaketteja.
- **Live.** Näkymä siitä, kuka on missä Live-istunnossa.
- **Lisäosat.** Lisäosaluettelo, mukana valaistuslisäosat.
- **Yhdistä tekoälysi.** Mikä tahansa yhdistämäsi avustaja voi ohjata CivilCraftin työkaluja. Mukana on huomautus, että yhden napsautuksen yhdistäminen CadCraft Studiossa ja isännöidyssä liittimessä ei ole vielä valmis. Katso [Anna tekoälyavustajan työskennellä työmaasi kanssa](topic:assistants).

## Korjattu versiossa 0.8.1

- **DWG-luokkaosio.** Se luettiin väärän tyyppiseksi (GitHub cadcraft#5). Korjattu CivilCraftissa yhdessä CadCraftin, BimCraftin, ModelCraftin ja TakeoffCraftin kanssa.
- **Kielen vaihtaminen käynnin aikana.** CadCraft Studio ja paketoidut versiot voivat vaihtaa kieltä ajon aikana. Ennen ne olivat vain englanniksi. Ei vielä testattu kaikilla alustoilla: kerro, jos kieli ei vaihdu.

## Ei vielä tässä versiossa

- **Nämä ovat laskennan apuvälineitä.** Jokainen tulos uusissa ikkunoissa tarvitsee insinöörin tarkistuksen. Maaperän lujuudet alkavat maaperäryhmän tyypillisistä arvoista, ja ikkuna kertoo tämän.
- **Sadetus.** Ajo esimerkkikohteella voi kestää selaimessa yli kaksi minuuttia tarkalla ruudukolla. Se on tarkistettu käsin lasketuilla tapauksilla ja V-muotoisella valuma-alueella, mutta ei vielä oikealla tasatulla työmaalla.
- **Osoitteesta työmaaksi.** Se lukee avoimia datatiedostoja, jotka tuot itse, ja on testattu vain omilla tiedostoillamme. Puut eivät ole lähde. Lähteiden hakeminen puolestasi odottaa tietosuojasanamuotoa.
- **Edistyminen mittauksista.** Testattu vain keksityillä mittauksilla. Edistymistä lehdillä ja merkinnöillä (MarkupCraft) sekä skannausten vertailua malliin (BimCraft) ei ole toteutettu.
- **Maaperät ja luiskat.** Vain ympyrän muotoiset pinnat: ei kiilan eikä lohkon hakua eikä vetohalkeamaa.
- **Liittymät.** Yksi säde haaraa kohti, ei rekkojen kääntöratoja, eivätkä ne mene vielä käytävään.
- **Kenttätiedostot.** Lukijat on kirjoitettu julkisten formaattikuvausten pohjalta ja kokeiltu omilla tiedostoillamme. Oikeita mittalaitteiden tiedostoja tarvitaan.
- **Linkit ja raiteet.** Radiolinkit: vain vapaatilan vaimennus ja monitieheijastus (ei sadehäipymää eikä antennikuvioita), eikä rautatiestandardia: jokainen raja-arvo on paikkamerkki, luonnosnumeroilla, joita yksikään rautatieinsinööri ei ole tarkistanut.
- **Windows ja macOS.** 0.8 ei ole koodisignoitu. Windows voi varoittaa, ja macOS pyytää napsauttamaan hiiren oikealla ja valitsemaan Avaa.

Kaikki muu on kohdassa [Ei vielä toteutettu](topic:not-built-yet). Aiempi julkaisu: katso [Uutta versiossa 0.7](topic:whats-new-0-7).
