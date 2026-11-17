---
title: Oman asettelun järjestäminen ja asetusten tallentaminen
summary: Valitse, mikä paneeli näyttää projektiselaimen tai Ominaisuudet ja paneelin oman sisällön, mihin työkalupakki sijoitetaan ja mitä palkit pitävät, tallenna se omaksi asetteluksi ja säilytä koko asetukset nimettyinä, jotta niiden välillä voi vaihtaa.
keywords: asettelu, työtila, järjestä, mukauta, oma asettelu, paneelit, muokkaimet, projektiselain, ominaisuudet, työkalupakki, pikapalkki, tietoruutu, työympäristö, asetus, profiili, tallenna asetus, vaihda asetus, vie asetus, tuo asetus, ccenv
from: 6af528e0
---

Kolmen sisäänrakennetun asettelun lisäksi voi järjestää oman asettelun ja tallentaa koko asetuksen nimellä, jotta siihen voi palata yhdellä askeleella.

## Järjestä oma asettelu

1. Avaa {{ui:Asetukset}} (vaihde tai {{key:Mod+,}}), valitse {{ui:Yleinen}} ja sitten {{ui:Asettelu}}.
2. Valitse {{ui:Järjestä oma asettelusi…}}. Valintaikkuna alkaa nykyisestä asettelusta.
3. Anna sille nimi ja valitse:
   - **Piirustuksen päällä:** sovelluksen työkalurivi, valintanauha tai ei kumpaakaan; otsikkopalkki; tietoruutu ja sen sisältämät säätimet.
   - **Piirustuksen vieressä:** työkalupakki vasemmalla, oikealla tai ei lainkaan, {{ui:Omat työkalut}} mukana tai ilman; mikä paneeli pitää paletit, mikä on päällimmäisenä (esimerkiksi projektiselain tai {{ui:Ominaisuudet}}) ja mitkä ovat sen alla välilehtinä.
   - **Piirustusalue:** näkymävälilehdet, pikapalkki ja näkymäpalkki valitsemillasi säätimillä, muokkauspaletti ja tilarivi.
   - **Ulkoasu:** koko, painikkeiden reunat ja välilehtityyli.
4. Valitse {{ui:Käytä tätä asettelua}}. Sovellus vaihtuu siihen heti, ja jokainen asetteluja käyttävä sovellus käyttää sitä myös.

Vain sovelluksen omat osat tarjotaan. Asettelu näkyy kohdassa {{ui:Lisäosista ja tiedostoista}}; {{ui:Vie tämä asettelu}} tallentaa sen tiedostoksi, jonka voi antaa työkaverille, ja {{ui:Poista}}-painike poistaa sen. Paneelit, joita asettelu täyttää, kiinnittyvät, kelluvat ja siirtyvät omiin ikkunoihinsa kuten kohdassa [Paneelien järjestäminen](common:arrange-panels).

## Tallenna asetuksesi työympäristönä

Työympäristö on koko asetuksesi kaikille tämän selaimen sovelluksille: asettelu, valikkotyyli ja näppäimet, työkalurivin tyyli, paneelit ja niiden koot sekä {{ui:Omat työkalut}}. Teema ja kieli eivät kuulu siihen.

- **Tallenna:** kirjoita nimi kohtaan {{ui:Työympäristöt}} ja valitse {{ui:Tallenna asetukseni}}. Jos nimi on jo käytössä, tallennus korvaa sen asetuksen.
- **Vaihda:** valitse asetus luettelosta ja valitse {{ui:Vaihda siihen}}. Sovellus latautuu uudelleen tähän asetukseen. Jos tallentamattomia muutoksia on, sovellus kysyy ensin, kuten missä tahansa uudelleenlatauksessa.
- **Jaa:** {{ui:Vie}} tallentaa valitun asetuksen tiedostoksi `.ccenv.json`; {{ui:Tuo asetuskokonaisuus…}} lisää sen tiedostosta. Tiedosto asettaa vain nämä valinnat, ei mitään muuta.
- **Poista:** valitse asetus ja valitse {{ui:Poista}}.

Voit säilyttää enintään kaksitoista asetusta.

Asettelun muuttamiseen ilman valintaikkunaa (vedä lohkoa, napsauta työkalua hiiren oikealla) katso [Muuta asettelua näytöllä](common:layout-edit). Sisäänrakennettujen järjestelyjen kokeilemiseen katso ensin [työkalupakin ja tietoruudun asettelu](common:layout-toolbox), [valintanauhan ja projektiselaimen asettelu](common:layout-ribbon) ja [Piirustuksen asettelu](common:layout-drafting).
