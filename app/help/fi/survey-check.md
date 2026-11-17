---
title: Tarkista mittauspiirros tuonnin yhteydessä
summary: Lue tekstinä tai lohkoattribuutteina kirjoitetut korkeudet pisteinä ja tarkista DWG tai DXF ennen maaston rakentamista: väärät yksiköt, puuttuva koordinaattijärjestelmä, kaukainen origo, tasaiset korkeuskäyrät, poikkeavat korkeudet ja kaksinkertaiset pisteet.
keywords: mittauksen tarkistus, tuontitarkistus, mittauskorkeudet, tekstikorkeudet, korkeudet tekstinä, attribuutit, yksiköt, koordinaattijärjestelmä, kaukana origosta, korkeuskäyrät nollassa, poikkeavat arvot, kaksoispisteet, ongelmat, maisema-arkkitehti, mittauspiirros
from: d46acd24
---

Mittauspiirros voi näyttää oikealta ja olla silti väärä maastolle: sen yksiköt voivat olla arvattuja, sen korkeuskäyrät voivat olla tasaisia korkeudella 0, tai sen korkeudet voivat olla tekstinä kirjoitettuina, eivätkä ne silloin ole lainkaan geometriaa. Osio **Mittauskorkeudet ja tarkistus** ikkunassa {{ui:Viivageometria}} (katso [Avaa DWG- tai DXF-tiedosto viivageometriana](topic:open-dwg-dxf)) lukee nämä korkeudet ja kertoo, mikä näyttää vialliselta ennen kuin mitään lisätään.

## Korkeudet tekstinä tai attribuutteina

Monet mittauspiirrokset antavat pistekorkeuden pienenä tekstinä ristin viereen, kuten `104.37` tai `EL 104.37`, tai pistelohkon attribuuttina. Nämä eivät ole viivoja, joten viivalukija jättää ne pois. Osio listaa, montako se löysi, ja antaa sinun ottaa ne **pisteiksi**:

1. Rastita **Ota … korkeutta pisteiksi**. Ruudut ovat aluksi tyhjiä, koska kaikki luvut piirroksessa eivät ole korkeuksia.
2. Teksti luetaan, kun se on yksinään korkeus: luku desimaaliosalla (`104.37`, `+104,37`, `-3.50`), tai luku tekstin `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` tai `LEVEL` jälkeen, valinnaisella `m`, `ft` tai `'` perässä. Pelkkä kokonaisluku (`12`) luetaan tontin tai arkin numeroksi, ei korkeudeksi. Tekstejä kuten `GATE 3` tai päivämäärää ei lueta koskaan. Tekstin muotoilukoodit ohitetaan.
3. Lohkoattribuutteja varten valitse **Korkeuden sisältävä lohkoattribuutti**. CivilCraft löytää tunnisteen nimeltä ELEV, Z, LEVEL, RL tai vastaavan itse; valitse toinen luettelosta, jos piirros käyttää omaa. Valinta muistetaan tälle tiedostonimelle tällä tietokoneella, joten sen avaaminen uudelleen alkaa samasta tunnisteesta. Valitsemasi tunniste ottaa myös kokonaisluvut korkeuksina.
4. Napsauta {{ui:Lisää}}. Pisteet numeroidaan projektin korkeimman numeron jälkeen, kukin piste kuvataan tasonsa (tai lohkonsa) mukaan, ja korkeudet muunnetaan projektin yksiköiksi kuten muu piirros. Kaikki tämä on yksi askel: {{key:Mod+Z}} poistaa pisteet.

Teksti sijaitsee omassa lisäyskohdassaan (tai tasauspisteessään, jos sellainen on). Lohkojen sisällä olevaa tekstiä ei lueta, eikä piirrosta muuteta koskaan.

## Tarkistus

Tarkistus ajetaan tuotavalle aineistolle, ja se luettelee löydökset, yhden rivin kullekin ongelmatyypille:

| Se sanoo | Mitä se tarkoittaa |
|---|---|
| **Yksiköitä ei ilmoitettu** | Piirros ei kerro yksiköitään, joten sen luvut luetaan projektin yksiköiksi. Tarkista yksi tuntemasi etäisyys. |
| **Yksiköt muunnettu** | Piirroksen yksiköt eroavat projektin yksiköistä, ja ne skaalataan (huomautus, ei virhe). |
| **Aineisto kattaa … km** tai **… m** | Ulottuvuus on suurempi kuin 200 km tai pienempi kuin puoli metriä, mikä tarkoittaa yleensä väärää yksikköä (millimetrit luettuna metreiksi tai päinvastoin). |
| **Ei koordinaattijärjestelmää** | Projektilla ei ole sellaista. Se on varoitus, kun aineisto on kaukana nollasta, kuten tasokoordinaatistot tai kansalliset koordinaatit ovat. Katso [Koordinaattijärjestelmät](topic:coordinate-systems). |
| **Kaukana origosta** | Aineisto on yli 100 km:n päässä nollasta. Kaukana nollasta 3D-näkymät ja viennit menettävät tarkkuutta ja heiluvat. |
| **Korkeuskäyräkerros … ei ole korkeutta** | Korkeuskäyriltä nimetty kerros (TOPO, CONT, CNTR, CONTOUR) sisältää viivoja korkeudella 0, joten niistä rakennettu maasto olisi tasainen. |
| **Korkeudet täsmälleen 0** | Osa korkeuksista on 0, vaikka tyypillinen korkeus on kaukana siitä: todennäköisesti korkeuksia puuttuu. |
| **Korkeudet kaukana muista** | Muutama korkeus on kaukana muista (mitattuna kaikkien korkeuksien keskustaa vasten, joten jyrkkä kohde laajalla vaihtelulla ei merkitse), tai yli 9,000 m tai alle -11,000 m. |
| **Pisteet toisen pisteen päällä** | Kaksi pistettä samassa kohdassa, samalla korkeudella tai eri korkeuksilla. |

Kun napsautat {{ui:Lisää}}, samat rivit menevät **Ongelmat**-listaan, yksi kutakin tyyppiä kohti, tiedostonimen kanssa, jotta voit palata niihin. Tarkistus arvioi piirroksen eikä muuta siinä mitään, eikä se estä käyttämästä piirrosta.

:::tip
Kun tarkistus sanoo korkeuskäyrien olevan tasaisia korkeudella 0 ja tekstinä on korkeuksia, ota korkeudet pisteiksi: ne kantavat usein todelliset korkeudet, joita korkeuskäyrillä ei ole.
:::

## Mitä ei tarkisteta

Tarkistus ei vertaa piirrosta toiseen mittaukseen, eikä se pysty päättelemään, missä koordinaattijärjestelmässä piirros on: se kertoo vain, ettei sellaista ole asetettu.
