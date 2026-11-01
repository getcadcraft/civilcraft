---
title: Tiedostot, joita voit avata, tallentaa ja viedä
summary: Pistetiedostot, LandXML ja CivilCraft-projektit sisään; projektit, LandXML, DXF ja PDF ulos; mitä kukin säilyttää, minne tiedostot menevät ja mitä muuttuu offline-tilassa.
keywords: avaa, tallenna, vie, tuo, tiedostomuodot, csv, txt, landxml, xml, dxf, pdf, json, lataa, projektitiedosto
from: a7debb61
---

CivilCraft avaa tiedostoja tietokoneelta ja tallentaa lataamalla tiedostot takaisin tietokoneelle. Mitään ei lähetetä, eikä mitään säilytetä palvelimella. Katso myös [Omat tiedostot](common:your-files).

## Mitä se avaa

Napsauta {{ui:Open}} (tai paina {{key:Mod+O}}) ja valitse tiedosto, tai vedä tiedosto {{pick:mac=Finder|windows=Resurssienhallinta|linux=tiedostonhallinta}} piirustukseen. Kerrallaan yksi tiedosto; yli 200 MB:n tiedostot hylätään.

| Tyyppi | Tiedostonimet | Mitä tapahtuu |
|---|---|---|
| Pistetiedosto | `.csv`, `.txt`, `.pnt`, `.xyz` (mikä tahansa tekstitiedosto) | **Tuo pisteet** -valintaikkuna avautuu. Pisteet korvaavat projektin pisteet; linjaukset, alustat ja putket säilyvat. |
| LandXML | `.xml`, `.landxml` | Tiedostosta tehdään **uusi projekti**. Kysytään ensin, jos nykyisessä projektissa on tallentamattomia muutoksia. |
| CivilCraft-projekti | `.civilcraft.json` (mikä tahansa `.json`) | Projekti avautuu tallennetussa tilassaan. Kysytään ensin, jos nykyisessä projektissa on tallentamattomia muutoksia. |

CivilCraft päättää tiedostotyypin tiedostopäätteen perusteella ja sen jälkeen tiedoston ensimmäisten merkkien perusteella: tekstin, joka alkaa merkillä `{`, luetaan projektiksi, merkillä `<` alkavan LandXML-tiedostona ja muut pistetiedostoina. Tiedoston, jonka avaamisikkuna harmaannuttaa, voi silti pudottaa piirustukseen.

:::note
Pistetiedoston tuominen projektiin, jossa on jo pisteitä, korvaa ne kysymättä ja tyhjentää kumoushistorian (minkä tahansa tiedoston avaaminen aloittaa kumoamisen alusta). Jos pinta on tuotu LandXML-tiedostosta, pisteiden tuominen vaihtaa sen takaisin pisteistä rakennettuun pintaan. Tallenna ensin, jos haluat myöhemmin vanhat pisteet takaisin.
:::

Lisätietoja: [Pistetiedostomuodot](topic:point-file-formats), [LandXML: mitä luetaan ja kirjoitetaan](topic:landxml-reference).

## Mitä se tallentaa

{{ui:Save}} ({{key:Mod+S}}) kirjoittaa kaksi tiedostoa vierekkäin. Tiedostojen nimet tulevat vasemman paneelin **Nimi**-kentästä: `<name>.civilcraft.json` on projekti, jota jatkat muokkaamista, ja `<name>.ifc` on sama suunnitelma IFC 4.3 -muodossa muita ohjelmia varten (katso [IFC-vienti ja -tuonti](topic:ifc)). Kumpikin tiedosto viittaa toiseen. IFC-tiedosto sisältää myös pakatun kopion projektista, joten pelkkä IFC-tiedosto aukeaa edelleen täysin muokattavana.

- **Studio-sovelluksessa** molemmat tiedostot kirjoitetaan vierekkäin paikoilleen.
- **Chrome- ja Edge-selaimissa** ensimmäinen tallennus pyytää kansiota ja kirjoittaa molemmat siihen. Myöhemmät tallennukset menevät samaan kansioon. Peruuta kansiokysymys, jos haluat ladata molemmat tiedostot sen sijaan.
- **Muissa selaimissa** molemmat tiedostot ladataan, projektitiedosto ensin.

Kumman tahansa tiedoston avaaminen etsii toisen. Avaa molemmat yhdessä (tai pudota molemmat), tai avaa yksi. Studio-sovelluksessa toinen löytyy samasta kansiosta. Selaimessa CivilCraft pyytää lisäämään toisen tai jatkamaan sillä tiedostolla, joka on käytettävissä. Jos toinen ohjelma muutti IFC-tiedostoa sen jälkeen, kun CivilCraft tallensi sen, tai jompikumpi tiedosto on vanhempi kuin toinen, projekti avautuu uudemmasta suunnitelmasta. Ongelmat-paneeli kertoo, mitä tapahtui, ja tarjoaa vaihtoehdot **Tallenna nyt** (kirjoittaa molemmat tiedostot uudelleen) ja **Näytä IFC:n geometria vertailuna**. Pelkkä IFC-tiedosto, jonka toinen ohjelma on muuttanut, avautuu sen kopiosta projektista niillä osilla, jotka vastaavat yhä. Linjaukset, joita toinen ohjelma muutti, saavat sen geometrian. Kohteet, jotka se poisti, jätetään pois. Muut muutokset luetellaan, mutta niitä ei oteta käyttöön. Ennen versiota 0.7.1 tehty projektitiedosto avautuu kuten ennen.

Projektitiedosto säilyttää:

- jokaisen pisteen (numero, koordinaatit, korkeus ja kuvaus) sekä sen pistetiedoston nimen, josta ne tulivat
- pinnan asetukset: ryhmävalinnat, piirretyt taitelinjat, rajan, pisimmän ulkoreunan ja LandXML-tiedostosta luetun TIN:n
- näyttöasetukset
- linjaukset PI-pisteineen, säteineen ja alkupaaluineen, niiden suunnitelmaprofiilit (PVI-pisteet ja kaarten pituudet) sekä käytävän asetukset
- alustat ja putkiverkon sääntöineen

Kumoushistoriaa se ei säilytä. Pinnat, korkeuskäyrät, päivänvalolinjat ja tilavuudet eivät tallennu. Ne rakennetaan uudelleen tallennetuista lähtötiedoista, kun projekti avautuu. Uudemmasta CivilCraft-versiosta tehty projektitiedosto hylätään viestillä, joka nimeää sen version.

## Mitä se vie

| Painike | Tiedosto | Sisältö |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pisteet, nykyinen maanpinta (ja tasattu pinta, jos sellainen on) TIN-pintoina, linjaukset, maanpinnan ja suunnitelmaprofiilit sekä putkiverkko |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF:n pohjapiirustuksen viivat näkyvinä, nimetyillä tasoilla |
| {{ui:DWG}} | `<name>.dwg` | Sama viivatyö DWG-piirustuksena valitsemassasi muodossa (2000–2018) |
| {{ui:PDF}} | `<name>.pdf` | Pohjapiirustuksen vektorikuva arkille valitsemassasi mittakaavassa |
| {{ui:GLB}} tai {{ui:OBJ}} (3D-näkymän palkissa) | `<name>-3d.glb`, `<name>-3d.obj` | Mitä 3D-näkymä näyttää 3D-mallina: metrejä, Y ylöspäin, todellinen mittakaava tallennetun paikallisen origon ympärillä |

Mitä kukin jättää pois: [LandXML-vaihto](topic:landxml), [Piirustuksen vienti DXF-muotoon](topic:dxf-export) (DWG myös), [Piirustuksen plottaus PDF-muotoon](topic:plot-pdf), [Työmaan vienti 3D-muodossa](topic:export-3d).

## Minne tiedostot menevät

Tallennetut ja viedyt tiedostot menevät sinne, minne selain tallentaa lataukset, yleensä Lataukset-kansioon. Jos haluat valita kansion joka kerta:

:::chromium
Avaa selaimen **Asetukset**, sitten **Lataukset**, ja ota käyttöön **Kysy, mihin kukin tiedosto tallennetaan ennen lataamista**.
:::

:::firefox
Avaa **Asetukset**, sitten **Yleiset**, ja kohdassa **Tiedostot ja sovellukset** valitse **Kysy aina, mihin tiedostot tallennetaan**.
:::

:::safari
Avaa **Safari > Asetukset > Yleiset** ja aseta **Lataustiedoston sijainti** -asetukseksi **Kysy jokaisen latauksen kohdalla**.
:::

Jos tallennat kahdesti samalla nimellä, selain voi lisätä toiseen tiedostoon numeron, esimerkiksi `Site (1).civilcraft.json`. Avaa seuraavalla kerralla uusin.

## Verkossa ja offline-tilassa

CivilCraft toimii kummassakin tapauksessa vain tietokoneellasi: avaaminen lukee tiedoston selaimessa, tallennus lataa sen. Jos haluat avata CivilCraftin ilman yhteyttä lainkaan, tallenna se ensin offline-käyttöön:

1. Kun olet verkossa, napsauta sovelluspalkin yläosassa {{ui:Tallenna offline-käyttöön}}.
2. Painike laskee ("Tallennetaan 12/30") ja näyttää sitten {{ui:Offline valmis}}. CivilCraft on pieni (noin 0.6 MB), joten tähän menee hetki. Tallennettu kopio sisältää tämän ohjeen ja esimerkkityömaan.
3. Ilman yhteyttä avaa sama osoite (tai sen kirjanmerkki). Kaikki toimii, myös {{ui:Avaa esimerkkityömaa}}.

Painikkeen muut tilat:

- {{ui:Tallennus ei onnistunut}}: osa tiedostoista ei latautunut. Tarkista yhteys ja napsauta painiketta uudelleen.
- {{ui:Offline ei käytettävissä}}: tämä selainikkuna ei voi säilyttää offline-kopiota (yksityiset ikkunat ja jotkin hallinnoidut tietokoneet estävät sen). Käytä tavallista ikkunaa.

Napsauta {{ui:Offline valmis}} nähdäksesi, milloin kopio tallennettiin. Vaihtoehtoja on kaksi: {{ui:Tallenna uudelleen (hae uusin versio)}} ja {{ui:Poista offline-kopio}}. Tallenna uudelleen ennen työmaakäyntiä, jotta kopio vastaa uusinta versiota. Lisää: [Offline-käyttö](common:offline).

:::offline
Olet nyt offline-tilassa. Jos CivilCraft on tallennettu offline-käyttöön, kaikki toimii, myös esimerkkityömaa. Jos ei, pysy tässä välilehdessä, mutta älä lataa sitä uudelleen ennen kuin olet taas verkossa. Ilman tallennettua kopiota {{ui:Avaa esimerkkityömaa}} epäonnistuu, ja näkyviin tulee viesti "Esimerkkiä ei voitu ladata".
:::

:::tip
Kenttäkäyttöä varten tallenna CivilCraft offline-käyttöön ja kopioi pistetiedostot itse kannettavalle tietokoneelle. Projektit ja viennit tallentuvat lataustiedostoina ilman yhteyttä, joten voit tuoda päivän mittaukset, tarkistaa pinnan ja tallentaa projektin työmaalla.
:::

Pilvitallennus ei ole vielä toteutettu, eikä työpöytäversioita ole vielä julkaistu. Tällä hetkellä tallentamasi tiedostot ovat ainoa kopio, joten säilytä niitä paikassa, josta on varmuuskopio.

## Lisäosat, joita tiedosto käyttää

Kun tallennat projektin, jossa on lisäosan tietoja (Rakennusmääräykset-valintaruudut tai Osoitteesta työmaalle -lähde), tiedosto tallentaa lisäosat ja niiden versiot. Jos avaat tiedoston tietokoneella, josta lisäosa puuttuu, piirustuksen yläpuolella oleva palkki kertoo siitä ja tarjoaa lisäyksen tilisi luettelosta. Merkintä on vain muistiinpano: tiedosto avautuu joka tapauksessa.

## Kumoa Studio-sovelluksesta

Studio-sovelluksen sisällä jokainen CivilCraft-sovelluksessa loppuun viety vaihe ilmoitetaan Studiolle, joten sen projektitason kumoaminen voi perua viimeisimmän vaiheen sovellusten välillä. Studio kumoaa vaiheen vain, jos CivilCraft-sovelluksen oma kumoopino on täsmälleen siinä tilassa kuin vaihe jätti sen. Kun avaat toisen tiedoston, Studio ohittaa tämän ikkunan.

## Sulkeminen tallentamattomilla muutoksilla

Kun projektissa on tallentamattomia muutoksia ja suljet välilehden, lataat sivun uudelleen tai poistut sivulta, selain kysyy, haluatko poistua. Sen sanamuoto ja ulkoasu kuuluvat selaimelle, eikä CivilCraft voi muuttaa niitä. {{ui:Uusi}} sekä projektin tai LandXML-tiedoston avaaminen kysyvät sen sijaan CivilCraft-sovelluksen omassa **Tallentamattomat muutokset** -ikkunassa, jossa ovat painikkeet {{ui:Peruuta}}, {{ui:Älä tallenna}} ja {{ui:Tallenna kopio}}.
