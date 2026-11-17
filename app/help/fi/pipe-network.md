---
title: Suunnittele painovoimainen putkiverkko
summary: Piirrä sade- tai jätevesiputkia rakenne kerrallaan, aseta kaltevuus-, peite- ja pudotussäännöt, anna CivilCraftin asettaa pohjien korkeudet ja korjaa sen luettelemat ongelmat.
keywords: rakenteen muokkain, rakennetyyppi, suorakaiderakenne, sadevesikaivo, kehys, peite, seinämänpaksuus, kirjastokohde, putkiverkko, sade, jätevesi, viemäri, kaivot, sadevesikaivot, pohjien korkeudet, peite, kaltevuus, pudotus, reuna, lietekuoppa, painovoimaputket
from: 10a3c14d
---

Projektissa on yksi painovoimainen putkiverkko, sade- tai jätevesi. Se koostuu rakenteista (kaivoista ja sadevesikaivoista) ja suorista putkista niiden välillä. Virtaus kulkee siihen suuntaan, johon piirrät. CivilCraft tarkistaa jokaisen putken ja rakenteen kolmea asettamaasi sääntöä vastaan ja voi asettaa kaikki pohjien korkeudet näistä säännöistä.

## Piirrä juoksu

Voit piirtää putkia ilman maastomallia, mutta reunat, peite ja automaattiset pohjien korkeudet tarvitsevat sen.

1. Paina {{key:P}}, tai napsauta {{ui:Putket}} **Suunnittelu**-ryhmässä.
   Vihje sanoo: ”Putket: napsauta rakenteita juoksun yläpäästä alaspäin (napsauta olemassa olevaa liittääksesi sen). Enter lopettaa.”
2. Napsauta, mihin yläjuoksun rakenne menee. Rakenne sijoitetaan.
3. Napsauta jokainen seuraava rakenne alavirtaan. Liittääksesi olemassa olevaan rakenteeseen napsauta sitä: tilarivi sanoo ”Liitetty S3.”
4. Paina {{key:Enter}}.
   Putket piirretään, niiden pohjien korkeudet asetetaan säännöistä, ja tilarivi kertoo esimerkiksi ”3 putkea piirretty, 12 pohjan korkeutta asetettu säännöistä; kaikki tarkistukset läpäisty.”

Uudet rakenteet nimetään S1, S2 … halkaisijalla 48 in (1200 mm). Uudet putket nimetään P1, P2 … halkaisijalla 12 in (300 mm). Halkaisijat ovat tuumina jalkaprojektissa ja millimetreinä metriprojektissa.

Lopeta {{key:Enter}}-näppäimellä. Kaksoisnapsautus toimii myös, mutta kun kaksoisnapsautat olemassa olevaa rakennetta lopettaaksesi juoksun siihen, liitos katoaa: napsauta sitä kerran ja paina sitten {{key:Enter}}.

## Aseta säännöt

Kun mitään ei ole valittu, oikea paneeli (**Projekti**) sisältää **Putkiverkko**-lohkon:

| Asetus | Aloitusarvo | Merkitys |
|---|---|---|
| Tyyppi | Sade | {{ui:Sadevesi}} tai {{ui:Jätevesi}}; kirjoitetaan LandXML:ään |
| Vähimmäiskaltevuus | 0.50% | Jokaisen putken on laskettava vähintään tämän verran |
| Vähimmäispeite | 2 ft (0.6 m) | Maanpinta putken laelle, koko putken matkalta |
| Pudotus rakenteissa | 0.10 ft (0.03 m) | Ulosvirtauksen pohjan korkeuden on oltava vähintään näin paljon alempana kuin jokaisen sisävirtauksen pohjan korkeus |

**Nämä aloitusarvot ovat paikanpitäjiä, eivät standardi.** Aseta arvot, jotka viranomaisesi tai projektisi vaatii. Peite mitataan maanpinnasta laelle (pohjan korkeus plus sisähalkaisija); seinämänpaksuutta ei lasketa. Missä alustat tai käytävät on tasattu, tasattu pinta on maanpinta.

## Anna CivilCraftin asettaa pohjien korkeudet

- {{ui:Aseta kaikki pohjan korot säännöistä}} (**Putkiverkko**-lohkossa) asettaa kaikki putket.
- {{ui:Aseta sen pohjan korot säännöistä}} (kun yksi putki on valittu) asettaa vain sen putken.

Alavirtaan työskennellessä kukin juoksu alkaa vähintään peitteen verran yläpään rakenteessaan, laskee vähintään vähimmäiskaltevuuden verran, laskee vähintään pudotuksen kussakin rakenteessa ja menee syvemmälle missä tahansa, missä putken varrella oleva maanpinta jättäisi alle vähimmäispeitteen. Pohjien korkeudet pyöristetään alaspäin 0.01:een, ei koskaan ylöspäin. Tilarivi sanoo ”Pohjat asetettu: vähintään peite juoksun yläpäässä, vähintään vähimmäiskaltevuus, vähintään pudotus kussakin rakenteessa.” tai nimeää, mitä se ei voinut tehdä.

## Muokkaa rakenteita ja putkia

Napsauta rakennetta tai putkea {{ui:Valitse}}-työkalulla nähdäksesi sen oikealla paneelilla.

**Rakenne**: **Nimi**, **Reuna**, **Lietekuopan syvyys**, **Halkaisija**, sitten **Käytetty reuna**, **Lietekuoppa**, **Itä** ja **Pohjoinen**, sekä siihen ja siitä lähtevät putket pohjien korkeuksineen.

- Jätä **Reuna** tyhjäksi, niin se otetaan maanpinnasta; laatikko näyttää silloin pinnan arvon harmaalla. Kirjoita arvo kiinnittääksesi reunan.
- Vedä rakenteen ottetta suunnitelmassa siirtääksesi sitä. Sen putket seuraavat; niiden pohjien korkeudet pysyvät ennallaan, joten tarkista ongelmat jälkikäteen.

**Tyyppi**: valitse yksi verkon rakennetyypeistä (alla) tai ei mitään, jolloin rakenne on pyöreä omalla halkaisijallaan.

**Putki**: **Nimi**, rakenteet, joiden välillä se kulkee, **Halkaisija**, **Ylempi pohjan korkeus**, **Alempi pohjan korkeus**, sitten **Pituus**, **Kaltevuus** ja **Vähimmäispeite**.

Paina {{key:Enter}} jokaisen arvon jälkeen.

## Lue ja korjaa ongelmat

**Putkiverkko**-lohko luettelee jokaisen ongelman (enintään 40); napsauta sitä valitaksesi putken tai rakenteen. Valittu putki tai rakenne luettelee omansa. Kun mitään ei ole valittu, lohko sanoo ”Kaikki putket ja rakenteet täyttävät säännöt.”

| Viesti (esimerkkejä) | Mitä tehdä |
|---|---|
| "P2 kulkee ylämäkeen (-0.40%)." tai "… kulkee tasaisesti …" | Vaihda pohjien korkeudet, tai aseta ne säännöistä. |
| "P2 on 0.30%:ssa loivempi kuin vähimmäisarvo 0.50%." | Laske alavirran pohjan korkeutta tai nosta yläjuoksun pohjan korkeutta. |
| "P3:n peite on 1.40 putken pituudella 35, mikä on alle vähimmäisarvon 2." | Laske putkea; aseta sen pohjan korkeudet säännöistä. |
| "S3:ssa P4 lähtee tasolta 245.20, mikä on alle 0.1 P3:n tulevan tason 245.25 alapuolella." | Laske ulosvirtausputken ylempää pohjan korkeutta. |
| "P1:n laki on S1:n reunan yläpuolella." | Putki on liian korkealla rakenteeseen nähden. |
| "S2:sta lähtee 2 putkea; painovoimaverkossa jokaisesta rakenteesta pitäisi lähteä yksi putki." | Poista yksi lähtevä putki, tai piirrä se uudelleen oikeaan suuntaan. |
| "Putket muodostavat silmukan; virtauksen on päätyttävä ulosvirtaukseen." | Juoksu on piirretty takaisin itseensä; poista putki. |
| "S5 on maanpinnan ulkopuolella eikä sillä ole reunan korkeutta." | Kirjoita reuna, tai siirrä rakenne maanpinnalle. |
| "P6 kulkee osittain maanpinnan ulkopuolella; peite siinä ei ole tiedossa." | Laajenna pintaa, tai hyväksy, ettei peitettä tarkisteta siinä. |
| "P7:llä ei vielä ole pohjien korkeuksia." | Kirjoita ne, tai aseta ne säännöistä. |

Ongelmaputket ja -rakenteet merkitään myös punaisella suunnitelmassa.

## Rakennetyypit

Rakennetyyppi on rakenne, joka on rakennettu parametreistaan: kaivo, sadevesikaivo, liitoskaivo tai ulosvirtaus, **pyöreä** (sisähalkaisija) tai **suorakaiteen muotoinen** (sisäleveys ja -pituus), seinämänpaksuus, lattialaatta, lietekuoppa alimman putken alapuolella sekä kehys ja kansi (pyöreä tai suorakaiteen muotoinen aukko, kehyksen korkeus). Tyypit kuuluvat verkkoon, kohdassa **Rakennetyypit** projektin Ominaisuuksissa.

1. Napsauta {{ui:Uusi rakennetyyppi}}. Valintaikkuna piirtää rakenteen suunnitelmassa ja leikkauksessa kirjoittaessasi.
2. Napsauta {{ui:Lisää tyyppi}}.
3. Valitse rakenne ja valitse tyyppi kohdasta **Tyyppi**. Se saa tyypin koon ja lietekuopan; sen oma lietekuoppa voidaan yhä muuttaa.

Muokkaa tyyppiä, ja jokainen sen tyypin rakenne seuraa sen kokoja. Poista tyyppi, ja sen rakenteet jäävät pyöreiksi rakenteiksi samalla leveydellä. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

Suorakaiderakenne piirretään suunnitelmaan, DXF:ään, DWG:hen ja PDF:ään sekä 3D:hen suorakaiteena, jonka pituus on ulosvirtausputken suuntainen; putket alkavat sen seinästä. LandXML kirjoittaa sen suorakaiderakenteena (`RectStruct`) seinämänpaksuuksineen ja lukee sellaiset rakenteet takaisin tyyppeinä.

### Jaa tyyppi kirjaston kautta

{{ui:Tallenna kirjastokohteeksi}} kirjoittaa tyypin CadCraft-kirjastokohteena (`.json`-tiedosto): sen suunnitelmasymbolin, 3D-rungon tyypilliseen syvyyteen ja kaikki koot. Lähetä se kirjastoon jakaaksesi sen. {{ui:Avaa kirjastokohde}} lukee näin tallennetun rakenteen takaisin verkkoon, muunnettuna projektin yksiköiksi. Kirjastokohteet, jotka eivät ole CivilCraftissa tehtyjä rakenteita, hylätään syyn kanssa.

## Poista

Valitse putki ja paina {{key:Delete}} poistaaksesi sen. Rakenteen poistaminen poistaa myös siihen liittyvät putket. Macissa paina Fn ja Delete, tai napsauta {{ui:Poista}}.

## Ei vielä toteutettu

Virtaamat, putkikoot ja hydraulinen korkeuslinja ovat kohdassa [Sadevesien johtaminen](topic:storm-drainage). Putkikatalogit, pyöreät putket, profiilinäkymän putket, kaarevat putket ja useampi verkko projektia kohden eivät ole vielä käytettävissä. Katso [Ei vielä toteutettu](topic:not-built-yet).
