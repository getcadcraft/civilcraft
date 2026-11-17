---
title: Paneelien järjestäminen ja toinen näyttö
summary: Kiinnitä sivupaneelit vasemmalle, oikealle tai alareunaan, pinoa ne, ryhmitä välilehdiksi, nasta tai piilota ne, kelluta piirustuksen päälle, tiivistä asettelua, valitse työkalurivien rivimäärä tai siirrä paneelit omaan ikkunaansa toisella näytöllä.
keywords: paneelit, kiinnitä, kelluta, siirrä paneeli, vedä, asettelu, välilehdet, välilehtiryhmä, pinoa, nasta, automaattinen piilotus, piilota paneeli, sulje paneeli, tiivis, asettelun tiheys, tiheä, työkalurivin rivimäärä, rivitä, 1 rivi, 2 riviä, toinen näyttö, kaksi näyttöä, kaksoisnäyttö, useita näyttöjä, ikkuna, ponnahdusikkuna, palauta asettelu
from: 49530239
---

Piirustuksen vieressä olevia paneeleja voi siirtää. Ne voi sijoittaa haluttuun paikkaan tai antaa niille oma ikkuna toisella näytöllä, jotta piirustus saa koko ensimmäisen näytön.

:::note
Jokaisessa paneelissa on otsikkopalkki: kapea palkki, jossa ovat paneelin nimi, {{ui:⋯}}-valikko, nasta ja sulkupainike paneelin yläreunassa. Versioissa ennen 0.7 on vain nimi ja {{ui:⋯}}-valikko.
:::

## Siirrä paneeli ikkunassa

1. Vedä paneelia sen nimestä yläreunassa.
2. Vedettäessä piirustuksen vasempaan, oikeaan ja alareunaan ilmestyy reunustettuja alueita. Pudota paneeli johonkin niistä, niin se kiinnittyy siihen. Alue, jonka päällä olet, tummenee.
3. Pudota se muualle piirustuksen päälle, jolloin se kelluu.

Paneelit voivat jakaa yhden reunan: ne pinoutuvat, ja kahden paneelin välinen viiva jakaa tilan vetämällä. Kun viiva on kohdistettuna, nuolinäppäimet siirtävät sitä, ja viivan kaksoisnapsautus jakaa tilan tasan. Kiinnitetyn reunan sisäreunaa vedetään leventämiseksi tai kapeuttamiseksi; reunan kaksoisnapsautus palauttaa sen.

Kelluva paneeli pysyy piirustuksen päällä. Sitä siirretään nimestä, ja kokoa muutetaan vetämällä sen oikeaa alakulmaa (tai siirtymällä {{key:Tab}}-näppäimellä kulmaan ja käyttämällä nuolinäppäimiä). Kaksoisnapsauta nimeä, niin paneeli kiinnittyy takaisin siihen kohtaan, jossa se oli.

:::touch
Vedä yhdellä sormella paneelin nimestä. Kelluvan paneelin oikeaa alakulmaa vedetään yhdellä sormella koon muuttamiseksi, ja kiinnitettyjen paneelien välisiä reunoja samalla tavalla. Kellutukseen tai kiinnitykseen ilman vetämistä käytetään {{ui:⋯}}-valikkoa.
:::

## Ryhmitä paneelit välilehdiksi

Kaksi paneelia voi jakaa yhden kehyksen ja näyttää vain toisen kerrallaan. Vedä paneeli nimestään toisen paneelin otsikkopalkin päälle (palkki reunustuu, kun olet sen päällä) ja päästä irti: kehyksessä on nyt välilehti jokaiselle paneelille otsikkopalkissa. Näytä paneeli napsauttamalla sen välilehteä. Kun välilehti on kohdistettuna, {{key:Left}} ja {{key:Right}} vaihtavat välilehteä, ja {{key:Home}} ja {{key:End}} siirtävät ensimmäiseen ja viimeiseen.

Paneelin poistamiseksi ryhmästä valitse sen {{ui:⋯}}-valikosta {{ui:Siirrä pois välilehtiryhmästä}} tai vedä se muualle. Valitse {{ui:Ryhmitä välilehdiksi}} ja paneelin nimi, jos haluat ryhmitellä ne ilman vetämistä.

## Nastaa, piilota ja palauta

- Paneelin otsikkopalkin nasta tekee siitä **automaattisesti piilottuvan**: paneeli poistuu kiinnityspaikastaan ja muuttuu reunassa pieneksi välilehdeksi. Osoita välilehteä, kohdista se tai napsauta sitä, niin paneeli liukuu esiin piirustuksen päälle. Siirry pois (tai paina {{key:Esc}}), niin se liukuu takaisin. Paina nastaa uudelleen tai valitse {{ui:Irrota nasta}}, niin paneeli kiinnittyy pysyvästi.
- Sulkupainike tai valikon {{ui:Piilota tämä paneeli}} piilottaa paneelin ja sulkee sen kiinnityspaikan. Reunassa oleva katkoviivainen välilehti tuo paneelin takaisin: napsauta sitä tai kohdista se ja paina {{key:Enter}}.

## Tiivistä asettelua

{{ui:Asetukset}} › {{ui:Yleiset}} › {{ui:Asettelun tiheys}} sisältää kaksi valintaa. {{ui:Väljä}} on oletus. {{ui:Tiivis}} tiivistää rivien korkeuden, paneelien täytön, työkalurivin painikkeet ja paneelien tekstin kyseisessä sovelluksessa, jotta näytölle mahtuu enemmän. Se tallennetaan kullekin sovellukselle erikseen. Kosketusnäytöllä suuret painikkeet säilyvät molemmissa, ja puhelimessa on oma asettelunsa. {{ui:Palauta asettelu}} ei muuta asettamaasi tiheyttä.

## Valitse työkalurivin rivimäärä

{{ui:Asetukset}} › {{ui:Yleiset}} › {{ui:Työkalurivin rivit}} sisältää kolme valintaa. {{ui:Rivitä}} on oletus: jokainen työkaluryhmä näkyy niin monella rivillä kuin tarvitaan. {{ui:2 riviä}} pitää työkalurivin kahdella rivillä ja {{ui:1 rivi}} yhdellä, jolloin piirustukselle jää enemmän korkeutta. Ryhmät, jotka eivät mahdu, vierittyvät sivusuunnassa työkalurivin sisällä (käytä hiiren rullaa, kahden sormen pyyhkäisyä tai siirry työkaluun {{key:Tab}}-näppäimellä). Työkalurivi, joka mahtuu jo kahdelle riville, säilyy ennallaan valinnalla {{ui:2 riviä}}, sillä ruudukko vain tekisi siitä korkeamman. Valinta tallennetaan kullekin sovellukselle erikseen. Kosketusnäyttö ja puhelin pitävät oman asettelunsa. CadCraft-sovelluksessa on oma asetuksensa työkalurivilleen kohdassa {{ui:Asetukset}} › {{ui:CadCraft}}.

## Näppäimistön käyttö

Jokaisen paneelin {{ui:⋯}}-painike avaa valikon: {{ui:Kiinnitä vasemmalle}}, {{ui:Kiinnitä oikealle}}, {{ui:Kiinnitä alas}}, {{ui:Kelluta piirustuksen päällä}}, {{ui:Nastaa reunaan}}, {{ui:Piilota tämä paneeli}}, {{ui:Ryhmitä välilehdiksi}} toisen paneelin kanssa, {{ui:Siirrä uuteen ikkunaan}} ja {{ui:Palauta se}}. Siirry painikkeeseen {{key:Tab}}-näppäimellä, paina {{key:Enter}}, siirrä nuolinäppäimillä ja paina {{key:Enter}} uudelleen. {{key:Esc}} sulkee valikon.

## Siirrä paneelit toiselle näytölle

1. Valitse paneelin {{ui:⋯}}, sitten {{ui:Siirrä kaikki paneelit uuteen ikkunaan}}. Voit valita myös {{ui:Siirrä paneelit uuteen ikkunaan}} kohdasta {{ui:Asetukset}}.
2. Pieni ikkuna avautuu ja siinä ovat paneelit. Vedä se toiselle näytölle ja tee se haluamasi kokoiseksi.
3. Jatka työskentelyä: paneelit vaikuttavat piirustukseen kuten ennenkin, ja piirustus täyttää pääikkunan.

Pikanäppäimet toimivat, kun paneeliikkuna on edessä: näppäimet, joita painetaan siellä, muita kuin kirjoittaessa ruutuun, menevät piirustukseen. Sovelluksen kysymykset ja valintaikkunat avautuvat edelleen pääikkunassa, joten katso sieltä, kun jokin ilmestyy. Teema ja paneelien tekstin koko seuraavat pääikkunaa.

:::chromium
Chrome ja Edge voivat sijoittaa ikkunan toiselle näytölle automaattisesti. Kun toinen näyttö on kytketty, valitse paneeliikkunasta {{ui:Siirrä toiselle näytölleni}} (tai paneelin {{ui:⋯}}-valikosta {{ui:Siirrä paneelit toiselle näytölleni}}). Selain kysyy kerran, saako tämä sivusto nähdä näyttösi; kun sallit sen, paneeliikkuna avautuu aina tälle näytölle.
:::

:::firefox safari
Vedä paneeliikkuna toiselle näytölle itse. Se avautuu seuraavalla kerralla samaan paikkaan ja samankokoisena.
:::

## Useampi paneeliikkuna

Jokaisella paneelilla voi olla oma ikkuna: enintään neljä paneeliikkunaa, esimerkiksi yksi kullekin näytölle.

- Paneelin {{ui:⋯}}-valikossa {{ui:Siirrä uuteen ikkunaan}} avaa paneelille oman ikkunan, ja {{ui:Siirrä paneeliikkunaan 2}} (ja niin edelleen) siirtää sen avoinna olevaan ikkunaan. Toista ikkunaa kutsutaan nimellä ”paneelit 2”.
- Paneeli vedetään nimestä yhdestä ikkunasta toiseen. Pudotettaessa pääikkunan päälle paneeli kiinnittyy siihen (reunustetut alueet näkyvät, kun ollaan sen päällä) tai kelluu, ja pudotettaessa toisen paneeliikkunan päälle se siirtyy siihen. Muualle pudotettaessa paneeli pysyy entisessä paikassaan.
- Paneeliikkuna, jossa ei ole enää paneeleja, sulkeutuu itsestään.

Sivun uudelleenlatauksen jälkeen sovellus tarjoaa paneeliikkunat uudelleen. Selaimet avaavat yhden ikkunan napsautusta kohden, joten valitse {{ui:Avaa seuraava}} kerran jokaiselle ikkunalle.

## Sama tapa koko asettelun osille

Valintanauha, työkalupakki, työkalurivit ja tilarivi siirtyvät omaan ikkunaansa samalla tavalla kuin paneeli: avaa osan {{ui:⋯}}-valikko ja valitse {{ui:Siirrä uuteen ikkunaan}}. {{ui:Palauta se}} (tai ikkunan sulkeminen) tuo osan takaisin. Ikkunassa painetut näppäimet menevät sovellukseen, kuten paneeliikkunassa. Jokaisella osalla on yksi tällainen valikko.

## Siirrä valintaikkuna

Jokaista valintaikkunaa voi siirtää piirustuksen tieltä: valintaikkunan otsikkopalkki vedetään paikasta toiseen. Valintaikkuna muistaa, mihin se jätettiin; jokainen valintaikkuna muistaa oman paikkansa ja palaa siihen seuraavalla avauskerralla. Kaksoisnapsauta otsikkopalkkia keskittääksesi valintaikkunan uudelleen.

Näppäimistöllä: kun kohdistus on valintaikkunan sisällä, paina {{key:Alt}}+{{key:Shift}}+nuolinäppäin siirtääksesi sitä 16 pikseliä kerrallaan; lisää {{key:Ctrl}} siirtääksesi 64 pikseliä kerrallaan. Valintaikkuna, joka jää näytön ulkopuolelle (pienemmän ikkunan tai näytön jälkeen), tuodaan takaisin.

Puhelimessa valintaikkunat pysyvät koko leveyden kokoisina arkkeina eivätkä siirry.

CadCraft Studio -sovelluksen {{ui:Plottaa PDF-tiedostoon}}-valintaikkunassa, jonka voi pitää auki työskentelyn ajan, on otsikkopalkissa painike {{ui:Avaa omaan ikkunaansa}}. Valintaikkuna siirtyy omaan ikkunaansa, jonka voi sijoittaa toiselle näytölle. Valintaikkunan sulkeminen sulkee ikkunan, ja ikkunan sulkeminen sulkee valintaikkunan.

## Palauta paneelit

- Valitse paneeliikkunasta {{ui:Palauta paneelit}} tai yksinkertaisesti sulje se. Paneelit palaavat entisiin paikkoihinsa.
- Pääikkunan sulkeminen tai uudelleenlataaminen sulkee myös paneeliikkunan. Kun sovellus avautuu uudelleen, se kertoo paneelien olleen omassa ikkunassaan; valitse {{ui:Avaa se}} tuodaksesi ikkunan takaisin tai {{ui:Pidä ne täällä}}.
- {{ui:Asetukset}} › {{ui:Yleiset}} › {{ui:Palauta asettelu}} palauttaa jokaisen paneelin alkuperäiseen paikkaansa.

:::tip
Jos mitään ei avaudu, kun paneeleja siirretään uuteen ikkunaan, selain esti ponnahdusikkunan. Sovellus kertoo tästä ja pitää paneelit entisissä paikoissaan. Salli ponnahdusikkunat sivustolle getcadcraft.com ja yritä uudelleen.
:::

Asettelu tallentuu kullekin sovellukselle tähän selaimeen muiden asetusten rinnalle.
