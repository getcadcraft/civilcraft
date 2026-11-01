---
title: CivilCraftin aloitusopas
summary: Mitä CivilCraft tekee, miten sen avaa ja ensimmäiset kymmenen minuuttia esimerkkityömaan kanssa pisteistä korkeuskäyriin, tiehen ja tallennettuun projektiin.
keywords: aloitus, ensimmäinen käyttökerta, esimerkkityömaa, johdanto, pikaopas, opas, aloita, uusi projekti
from: c9b6dd8e
---

CivilCraft on CadCraft-perheen maa- ja rakennustekniikan suunnittelusovellus. Se muuttaa mittauspisteet maastomalliksi (TIN) korkeuskäyrineen ja antaa sitten asettaa linjauksia suunnitelmapituusleikkauksineen, vetää yksinkertaisen tiekäytävän, luiskata rakennusalustat maanpintaan, tarkistaa painovoimaisen putkiverkon omia sääntöjäsi vasten ja nähdä leikkaus- ja penger-tilavuudet. Se lukee ja kirjoittaa LandXML:ää, vie pohjakuvan DXF:nä ja plottaa sen PDF:ksi.

Jos olet käyttänyt Civil 3D:tä, ajatukset ovat tuttuja: pisteet, pisteryhmät, taitelinjat, linjaukset taitepisteillä (PI), pituusleikkaukset pystytaitepisteillä (PVI), käytävät, tasaus, putkiverkot. Työtapa on erilainen ja paljon pienempi: komentoriviä, tyylejä ja piirustustiedostoa ei ole. Lue [Tulossa muista maa- ja rakennustekniikan ohjelmista](topic:coming-from) kerran ennen ensimmäistä oikeaa työtäsi.

## Mitä tarvitset

- Ajantasainen työpöytäselain: Chrome, Edge, Firefox tai Safari. Katso [Selaimet](common:browsers).
- Hiiri tai ohjauslevy ja näppäimistö tai kosketusnäyttö: piirtämisessä on näytöllä painikkeet {{ui:Valmis}}, {{ui:Kumoa piste}} ja {{ui:Peruuta}} (katso [Hiiri, ohjauslevy ja kosketus](topic:keyboard#mouse-trackpad-and-touch)).
- Pohjakuva piirretään 2D:nä selaimen canvasilla. [3D-näkymä](topic:site-3d) käyttää selaimen WebGL-grafiikkaa; jos se ei käynnisty, tilarivi kertoo syyn ja pohjakuva toimii silti.
- Ei tiliä eikä lähetystä. Tiedostot avataan tietokoneellasi ja tallennetaan latauksina. Katso [Tiedostosi](common:your-files).

:::note
CivilCraft toimii nyt vielä keskeneräisenä varhaisena selainversiona. Työpöytäversioita ei ole vielä saatavilla, eikä pilvitallennus ole vielä käytettävissä. Kaikki, mitä teet, pysyy tietokoneellasi, kunnes tallennat tai viet sen.
:::

## Avaa CivilCraft

1. Avaa CivilCraft selaimessasi.
2. Odota, että näyttö täyttyy: työkalurivi ylhäällä, paneeli vasemmalla, pohjakuva keskellä ja **Ominaisuudet**-paneeli oikealla.
3. Tyhjässä pohjakuvassa näet ruudun otsikolla **Aloita mittauspisteistä**. Se luettelee ensimmäiset vaiheet ja sisältää linkin {{ui:Avaa esimerkkityömaa}}.

Jos haluat käyttää CivilCraftia myöhemmin ilman yhteyttä, napsauta sovelluspalkissa {{ui:Tallenna offline-käyttöön}} ja odota, kunnes lukee {{ui:Offline valmis}}. Se sisältää tämän ohjeen, esimerkkityömaan sekä 3D- ja GIS-kirjastot. Katso [Offline](common:offline). Paina {{key:F1}} tai napsauta {{ui:Ohje}} milloin tahansa avataksesi tämän ohjeen sovelluksen viereen.

## Ensimmäiset kymmenen minuuttia: esimerkkityömaa

Esimerkkityömaa on pieni mittaus Yhdysvaltain jaloissa: 276 pistettä osavaltiotason koordinaateissa, harjanne, laskuoja virtausuomineen ja kaksi luiskan yläreunaa. Se tulee sovelluksen mukana, joten voit seurata mukana ilman omaa tiedostoa.

1. Napsauta {{ui:Avaa esimerkkityömaa}} pohjakuvan ruudussa.
   **Tuo pisteet** -valintaikkuna avautuu. Siinä lukee "276 pistettä luettu muodossa PNEZD (otsikkorivin mukaan), erotettu pilkuilla." ja se näyttää ensimmäiset rivit.
2. Napsauta {{ui:Tuo}}.
   Pohjakuva täyttyy pisteistä, korkeuskäyristä ja maastomallin reunasta. Alareunan tilarivi kertoo, että pisteet tuotiin, ja kuinka monta kolmiota maastomallissa on (546).
3. Katso vasemmalta paneelilta kohtaa **Pisteet**. Pisteet on ryhmitelty kuvauksen ensimmäisen sanan mukaan: CP, FL, GRD, RIDGE, TBN, TBS ja TREE.
4. Aseta kyseisen taulukon **Maastomalli**-sarakkeessa **FL**, **RIDGE**, **TBN** ja **TBS** arvoon {{ui:Taitelinja}}.
   Maastomalli rakentuu heti uudelleen. **Maastomalli**-tiedoissa lukee nyt "Taitelinjat: 4", ja korkeuskäyrät taittuvat jyrkästi virtausuoman ja harjanteen kohdalla sen sijaan, että leikkaisivat niiden poikki.
5. Vie osoitin pohjakuvan päälle. Tilarivi näyttää osoittimen alla olevan itä- ja pohjoiskoordinaatin sekä maanpinnan korkeuden siinä.
6. Aseta kohdassa **Näyttö** {{ui:Korkeuskäyrät joka}} arvoon 0,5 ft ja kytke päälle {{ui:Korkeusvyöhykkeet}}. Väriasteikko ilmestyy selitteineen valintaruutujen alle. Kytke vyöhykkeet pois päältä, kun olet valmis.

Sinulla on nyt nykyisen maanpinnan maastomalli. Seuraavaksi tie.

## Aseta lyhyt tie

1. Paina {{key:A}} (tai napsauta {{ui:Linjaus}} **Suunnittelu**-ryhmässä).
2. Napsauta kolmea pistettä työmaan poikki peräkkäin. Punainen viiva seuraa osoitinta ja näyttää seuraavan suoran pituuden ja suuntakulman.
3. Paina {{key:Enter}} lopettaaksesi.
   Linjaus ilmestyy paalulukuineen. Oikea paneeli näyttää **Linjaus**: sen pituuden, PI-taulukon ja keskimmäisen taitepisteen kaaren (säde 100 ft tai pienempi, jos 100 ft ei mahdu).
4. Napsauta oikeassa paneelissa kohdassa **Suunnitelmapituusleikkaus** {{ui:Aloita maanpinnasta}}.
   Pituusleikkausnäkymä avautuu pohjakuvan alle nykyisen maanpinnan ja suoran suunnitelmakaltevuuden kanssa päästä päähän.
5. Paina {{key:I}} kytkeäksesi päälle {{ui:Lisää PVI:t}} ja napsauta sitten kerran pituusleikkausnäkymässä keskikohdan lähellä. PVI ilmestyy.
6. Kirjoita oikealla olevassa PVI-taulukossa keskimmäisen PVI:n **Kaaren L** -ruutuun kaaren pituus (esimerkiksi 100) ja paina {{key:Enter}}. Pituusleikkauksessa on nyt pystykaari, jonka K-arvo on merkitty.
7. Valitse kohdassa **Käytävä** **Vedä rakenne suunnitelmapituusleikkauksen mukaan**.
   Tie tasataan maahan: kaistat, pientareet ja luiskat maanpintaan asti. **Maanrakennus**-lohko näyttää leikkauksen ja pengerryksen.

Älä murehdi tarkkoja arvoja. Jokaista lukua voi muuttaa oikeassa paneelissa, ja {{key:Mod+Z}} kumoaa viimeisen muutoksen.

## Tallenna työsi

1. Kirjoita nimi vasemman paneelin yläreunan **Nimi**-kenttään.
2. Paina {{key:Mod+S}} (tai napsauta {{ui:Tallenna}}).
   Selain lataa tiedoston, joka on nimetty työmaan mukaan ja päättyy `.civilcraft.json`. Se sisältää pisteet, maastomallin asetukset, linjaukset, pituusleikkaukset, käytävät, alustat ja putket.
3. Voit jatkaa myöhemmin napsauttamalla {{ui:Avaa}} (tai painamalla {{key:Mod+O}}) ja valitsemalla kyseisen tiedoston tai pudottamalla sen pohjakuvalle.

:::warning
Automaattista tallennusta ei ole. Jos suljet välilehden tallentamattomin muutoksin, selain kysyy, poistutaanko; jos poistut, muutokset menetetään. Tallenna usein.
:::

## Mihin seuraavaksi

- [Tuo mittauspisteitä](topic:import-points) omista tiedostoistasi.
- [Rakenna ja tarkenna maastomalli](topic:build-surface) taitelinjoilla ja rajauksella.
- [Näyttö osa kerrallaan](topic:workspace).
- [Näppäimet ja hiiri](topic:keyboard).
