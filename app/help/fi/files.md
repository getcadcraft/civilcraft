---
title: Tiedostot, jotka voit avata, tallentaa ja viedä
summary: Pistetiedostot, LandXML ja CivilCraft-projektit sisään; projektit, LandXML, DXF ja PDF ulos; mitä kukin säilyttää, minne tiedostot menevät ja mitä muuttuu offline-tilassa.
keywords: avaa, tallenna, vie, tuo, tiedostomuodot, csv, txt, landxml, xml, dxf, pdf, json, lataa, projektitiedosto
from: 82bff559
---

CivilCraft avaa tiedostoja tietokoneeltasi ja tallentaa lataamalla tiedostot takaisin sinne. Mitään ei lähetetä eikä mitään säilytetä palvelimella. Katso myös [Omat tiedostot](common:your-files).

## Mitä se avaa

Napsauta {{ui:Open}} (tai paina {{key:Mod+O}}) ja valitse tiedosto, tai vedä tiedosto kohteesta {{pick:mac=Finder|windows=Resurssienhallinta|linux=tiedostonhallinta}} piirustukselle. Kerrallaan yksi tiedosto; yli 200 MB:n tiedostot hylätään. LandXML- tai projektitiedosto, joka on yli 32 MB, luetaan noin 4 MB:n osina, ei yhtenä tekstilohkona. Kun LandXML avautuu, varaudu siihen, että se käyttää muistia noin 13 kertaa tiedoston kokoon verrattuna (69 MB:n tiedosto käytti testissämme noin 0.9 GB).

| Tyyppi | Tiedostonimet | Mitä tapahtuu |
|---|---|---|
| Pistetiedosto | `.csv`, `.txt`, `.pnt`, `.xyz` (mikä tahansa tekstitiedosto) | Valintaikkuna **Tuo pisteet** avautuu. Pisteet korvaavat projektin pisteet; linjaukset, alustat ja putket säilyvät. |
| LandXML | `.xml`, `.landxml` | Tiedostosta luodaan **uusi projekti** (sinulta kysytään ensin, jos nykyisessä projektissa on tallentamattomia muutoksia). |
| CivilCraft-projekti | `.civilcraft.json` (mikä tahansa `.json`) | Projekti avautuu samassa tilassa kuin se tallennettiin (sinulta kysytään ensin, jos nykyisessä projektissa on tallentamattomia muutoksia). |

CivilCraft tunnistaa tiedoston ensin tiedostopäätteestä ja sitten sen ensimmäisistä merkeistä: teksti, joka alkaa merkillä `{`, luetaan projektina, teksti, joka alkaa merkillä `<`, LandXML-tiedostona ja kaikki muu pistetiedostona. Tiedoston, jonka avaamisikkuna harmaannuttaa, voi silti pudottaa piirustukselle.

:::note
Pistetiedoston tuominen projektiin, jossa on jo pisteitä, korvaa pisteet kysymättä, ja se tyhjentää kumoushistorian (minkä tahansa tiedoston avaaminen aloittaa kumoamisen alusta). Jos pinta on peräisin LandXML-tiedostosta, pisteiden tuominen vaihtaa sen takaisin pisteistä muodostetuksi pinnaksi. Tallenna ensin, jos haluat myöhemmin vanhat pisteet takaisin.
:::

Lisätietoja: [Pistetiedostojen muodot](topic:point-file-formats), [LandXML: mitä luetaan ja kirjoitetaan](topic:landxml-reference).

## Mitä se tallentaa

{{ui:Save}} ({{key:Mod+S}}) kirjoittaa kaksi tiedostoa rinnakkain, nimettyinä vasemman paneelin kentän **Nimi** mukaan: `<nimi>.civilcraft.json`, projekti, jota jatkat muokkaamista, ja `<nimi>.ifc`, sama suunnitelma IFC 4.3 -muodossa muita ohjelmia varten (katso [IFC-vienti ja -tuonti](topic:ifc)). Kumpikin tiedosto viittaa toiseen, ja IFC-tiedosto sisältää myös projektin pakatun kopion, joten pelkkä IFC-tiedosto avautuu edelleen täysin muokattavana.

- **Studiossa** molemmat tiedostot kirjoitetaan vierekkäin paikoilleen.
- **Chromessa ja Edgessä** ensimmäinen tallennus kysyy kansion ja kirjoittaa molemmat siihen; myöhemmät tallennukset menevät samaan kansioon. Peru kansion kysely, jos haluat sen sijaan ladata molemmat.
- **Muissa selaimissa** molemmat tiedostot ladataan, projektitiedosto ensin.

Kun avaat jommankumman tiedoston, CivilCraft etsii toisen. Avaa molemmat yhdessä (tai pudota molemmat), tai avaa vain yksi: Studiossa toinen löytyy samasta kansiosta; selaimessa CivilCraft kysyy, lisätäänkö se, tai voit jatkaa vain sillä, mikä sinulla on. Jos toinen ohjelma muutti IFC-tiedostoa CivilCraftin tallennuksen jälkeen tai toinen tiedosto on vanhempi kuin toinen, projekti avautuu uudemmasta suunnitelmasta ja Ongelmat-paneeli kertoo, mitä tapahtui, ja tarjoaa vaihtoehdot **Tallenna nyt** (kirjoittaa molemmat tiedostot uudelleen) ja **Näytä IFC:n geometria viitteenä**. Toisen ohjelman muuttama pelkkä IFC-tiedosto avautuu sen kopiosta projektista niiltä osin, jotka vastaavat toisiaan: linjaukset, joita se muutti, saavat sen geometrian, kohteet, jotka se poisti, jätetään pois, ja muut muutokset luetellaan, mutta niitä ei oteta käyttöön. Projektitiedosto, joka on versiosta 0.7.1 aiemmin, avautuu kuten ennenkin.

Projektitiedosto säilyttää:

- jokaisen pisteen (numero, koordinaatit, korkeus, kuvaus) ja sen lähdetiedoston nimen
- pinnan asetukset: ryhmävalinnat, piirretyt taitelinjat, rajan, pisin ulkoreuna sekä LandXML:stä luetun TIN-mallin
- näyttöasetukset
- linjaukset PI-pisteineen, säteineen ja alkupaaluineen, niiden suunnitelmaprofiilit (PVI-pisteet ja kaarten pituudet) sekä käytävän asetukset
- alustat ja putkiverkon sääntöineen

Kumoushistoriaa ei tallenneta. Pinnat, korkeuskäyrät, leikkauslinjat ja tilavuudet eivät tallennu; ne muodostetaan uudelleen tallennetuista lähtötiedoista, kun projekti avautuu. Uudemmasta CivilCraft-versiosta tehty projektitiedosto hylätään, ja viesti nimeää sen version.

## Mitä se vie

| Painike | Tiedosto | Sisältö |
|---|---|---|
| {{ui:LandXML}} | `<nimi>.xml` | LandXML 1.2: pisteet, luonnontila (ja suunniteltu pinta, jos sellainen on) TIN-pintoina, linjaukset, maanpinnan ja suunnitelmien profiilit sekä putkiverkko |
| {{ui:DXF}} | `<nimi>.dxf` | R12 DXF:nä piirustuksen viivat sellaisina kuin ne näkyvät, nimetyillä tasoilla |
| {{ui:DWG}} | `<nimi>.dwg` | Samat viivat DWG-piirustuksena valitsemassasi muodossa (versiosta 2000 versioon 2018) |
| {{ui:PDF}} | `<nimi>.pdf` | Vektorimuotoinen tulostus suunnitelmasta arkille valitsemassasi mittakaavassa |
| {{ui:GLB}} tai {{ui:OBJ}} (3D-näkymän palkissa) | `<nimi>-3d.glb`, `<nimi>-3d.obj` | Se, mitä 3D-näkymä näyttää 3D-mallina: metreissä, Y ylöspäin, todellisessa mittakaavassa, tallennetun paikallisen origon ympärillä |

Mitä kukin jättää pois: [LandXML-vienti](topic:landxml), [Vie suunnitelma DXF-muotoon](topic:dxf-export) (myös DWG), [Tulosta suunnitelma PDF-muotoon](topic:plot-pdf), [Vie työmaa 3D-muodossa](topic:export-3d).

## Minne tiedostot menevät

Tallennetut ja viedyt tiedostot menevät sinne, minne selaimesi sijoittaa lataukset, yleensä Lataukset-kansioon. Jos haluat valita kansion joka kerta:

:::chromium
Avaa selaimen **Asetukset**, sitten **Lataukset**, ja ota käyttöön **Kysy, minne kukin tiedosto tallennetaan ennen lataamista**.
:::

:::firefox
Avaa **Asetukset**, sitten **Yleiset**, ja valitse kohdassa **Tiedostot ja sovellukset** **Kysy aina, minne tiedostot tallennetaan**.
:::

:::safari
Avaa **Safari > Asetukset > Yleiset** ja aseta **Tiedostojen lataussijainti** arvoon **Kysy jokaisella latauksella**.
:::

Jos tallennat kahdesti samalla nimellä, selain saattaa lisätä toiseen tiedostoon numeron, esimerkiksi `Sivusto (1).civilcraft.json`. Avaa uusin seuraavalla kerralla.

## Online ja offline

CivilCraft toimii aina vain tietokoneellasi: avaaminen lukee tiedoston selaimessa, tallentaminen lataa sen. Jos haluat avata CivilCraftin ilman yhteyttä lainkaan, tallenna se ensin offline-käyttöön:

1. Kun olet yhteydessä, napsauta sovelluspalkin yläosassa {{ui:Save for offline}}.
2. Painike laskee ylöspäin (”Tallennetaan 12 / 30”) ja näyttää sitten {{ui:Offline ready}}. CivilCraft on pieni (noin 0.6 MB), joten tähän menee hetki. Tallennettuun kopioon kuuluu tämä ohje ja esimerkkityömaa.
3. Ilman yhteyttä avaa sama osoite (tai sen kirjanmerkki). Kaikki toimii, myös {{ui:Open the sample site}}.

Painikkeen muut tilat:

- {{ui:Could not save}}: osa tiedostoista ei latautunut. Tarkista yhteys ja napsauta painiketta yrittääksesi uudelleen.
- {{ui:Offline not available}}: tämä selainikkuna ei voi säilyttää offline-kopiota (yksityiset ikkunat ja jotkin hallinnoidut tietokoneet estävät sen). Käytä tavallista ikkunaa.

Napsauta {{ui:Offline ready}}, jos haluat nähdä, milloin kopio tallennettiin; siinä on kaksi vaihtoehtoa: {{ui:Save again (get the newest version)}} ja {{ui:Remove the offline copy}}. Tallenna uudelleen ennen työmaakäyntiä, jotta kopio vastaa uusinta versiota. Lisätietoja: [Offline](common:offline).

:::offline
Olet nyt offline-tilassa. Jos CivilCraft tallennettiin offline-käyttöön, kaikki toimii, myös esimerkkityömaa. Jos ei, voit jatkaa työskentelyä tässä välilehdessä, mutta älä lataa sitä uudelleen ennen kuin olet yhteydessä; ilman tallennettua kopiota {{ui:Open the sample site}} epäonnistuu viestillä ”Esimerkkiä ei voitu ladata”.
:::

:::tip
Kenttätyöhön tallenna CivilCraft offline-käyttöön ja vie pistetiedostosi kannettavalle itselleen. Projektit ja viennit tallentuvat ilman yhteyttäkin latauksina, joten voit tuoda päivän mittaukset, tarkistaa pinnan ja tallentaa projektin paikan päällä.
:::

Pilvitallennus ei ole vielä käytettävissä, eikä työpöytäversioita ole vielä julkaistu. Tällä hetkellä tallentamasi tiedostot ovat ainoa kopio: säilytä niitä paikassa, josta otetaan varmuuskopio.

## Tiedostot, joita käyttää lisäosa

Kun tallennat projektin, joka sisältää lisäosan tietoja (Rakennusmääräysten valintaruudut tai Osoitteesta työmaalle -lähde), tiedosto tallentaa, mitä lisäosia ja mitä versioita käytettiin. Jos avaat sen tietokoneella, jolta lisäosa puuttuu, suunnitelman yläpuolella oleva palkki kertoo siitä ja tarjoaa lisäyksen tilisi luettelosta. Tieto on vain muistiinpano: tiedosto avautuu kummin tahansa.

## Kumoaminen Studiosta

CadCraft Studion sisällä jokainen CivilCraftissa päättämäsi vaihe ilmoitetaan Studiolle, joten sen projektitason kumoaminen voi perua viimeisimmän vaiheen eri sovellusten välillä. Studio kumoaa vaiheen vain silloin, kun CivilCraftin oma kumoopino on täsmälleen siinä tilassa kuin vaihe jätti sen; kun avaat toisen tiedoston, Studio ohittaa tämän ikkunan.

## Sulkeminen tallentamattomilla muutoksilla

Kun projektissa on tallentamattomia muutoksia ja suljet välilehden, lataat sivun uudelleen tai poistut sivulta, selain kysyy, haluatko poistua. Sen sanamuoto ja ulkoasu kuuluvat selaimelle, eikä CivilCraft voi muuttaa niitä. {{ui:New}} sekä projektin tai LandXML-tiedoston avaaminen kysyvät sen sijaan CivilCraftin omassa ikkunassa **Tallentamattomat muutokset** kanssa valinnoilla {{ui:Cancel}}, {{ui:Don’t save}} ja {{ui:Save a copy}}.
