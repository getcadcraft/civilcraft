---
title: Näyttö osa kerrallaan
summary: Kierros jokaiseen CivilCraftin palkkiin ja paneeliin sen näyttönimellä, työkaluriviltä tilariville.
keywords: käyttöliittymä, näyttö, työkalurivi, paneelit, ominaisuudet, tilarivi, pituusleikkausnäkymä, asettelu, kierros
from: 76272010
---

CivilCraftissa on yksi näyttö. Välilehtiä ja asetteluja ei ole. Sivupaneeleja voi siirtää, irrottaa kelluviksi tai viedä omaan ikkunaansa: katso [Järjestä paneelit ja käytä toista näyttöä](common:arrange-panels). Ylhäältä alas ja vasemmalta oikealle:

- **sovelluspalkki** (CadCraft-tunnus, sovelluksen nimi, versio, Tietoja, näyttötila, Ohje, Tallenna offline-käyttöön, Paperi ja Malli)
- **työkalurivi**, jossa on seitsemän painikeryhmää
- **vasen paneeli**: Työmaa, Pisteet, Maastomalli, Näyttö ja, kun olet tuonut niitä, GIS-tasot
- keskellä **pohjakuva**, jonka alla on **pituusleikkausnäkymä**, kun se on auki
- **oikea paneeli**: valitun kohteen Ominaisuudet
- alareunassa **tilarivi**

## Sovelluspalkki

Aivan ylhäällä oleva ohut palkki kuuluu CadCraft-sivustolle, ei CivilCraftille itselleen.

- Versiovalikko näyttää, mitä koontiversiota ajat.
- {{ui:Tietoja: CivilCraft}} avaa sovelluksen sivun sivustolla.
- {{ui:Koko näyttö}} vaihtaa näyttötiloja: koko näyttö, sitten koko näyttö palkit piilotettuna, sitten takaisin normaaliin. {{key:Ctrl+Shift+F}} tekee saman kaikilla alustoilla, myös Macilla (siellä se on Control-näppäin, ei Command). Kun palkit on piilotettu, vie osoitin yläreunaan tuodaksesi ne takaisin.
- {{ui:Ohje}} (tai {{key:F1}}) avaa tämän ohjeen sivupaneeliin; {{key:F1}} tai {{key:Esc}} sulkee sen.
- {{ui:Tallenna offline-käyttöön}} säilyttää CivilCraftin tässä selaimessa, jotta se aukeaa ilman yhteyttä; sen jälkeen siinä lukee {{ui:Offline valmis}}. Katso [Tiedostot, jotka voit avata, tallentaa ja viedä](topic:files#online-and-offline).
- {{ui:Paperi}} ja {{ui:Malli}} vaihtavat vaalean ja tumman teeman välillä. Pohjakuva ja pituusleikkaus seuraavat teemaa; PDF-tiedostot tulostuvat aina valkoiselle.

## Työkalurivi

Jokaisella ryhmällä on pieni nimike painikkeiden yläpuolella. Pidä osoitinta painikkeen päällä nähdäksesi sen työkaluvihjeen ja näppäimen.

| Ryhmä | Painikkeet | Mitä ne tekevät |
|---|---|---|
| Tiedosto | {{ui:Uusi}}, {{ui:Avaa}}, {{ui:Tallenna}} | Aloittaa alusta, avaa pistetiedoston, LandXML:n tai projektin, tallentaa projektin latauksena |
| Vie | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Kirjoittaa LandXML 1.2:n, R12-DXF:n tai DWG:n pohjakuvasta tai plottaa pohjakuvan PDF:ksi |
| Maastomalli | {{ui:Taitelinja}}, {{ui:Raja}} | Piirtää taitelinjan mittauspisteiden kautta; piirtää ulkorajan |
| Suunnittelu | {{ui:Linjaus}}, {{ui:Alusta}}, {{ui:Putket}}, {{ui:Pituusleikkaus}} | Piirtää linjauksen, alustan, putkivedon; näyttää tai piilottaa pituusleikkausnäkymän |
| Muokkaa | {{ui:Kumoa}}, {{ui:Tee uudelleen}}, {{ui:Kopioi}}, {{ui:Liitä}}, {{ui:Lisää}} | Kumoaa, tekee uudelleen, kopioi ja liittää mittauspisteitä; {{ui:Lisää}} sisältää Leikkaa, Liitä samaan paikkaan, Monista, Poista, Valitse kaikki pisteet ja Poista valinta |
| GIS | {{ui:Koordinaatit}}, {{ui:Tuo}}, {{ui:Vie}}, {{ui:Kartta}} | Asettaa koordinaattijärjestelmän, tuo ja vie GIS-tiedostoja, näyttää karttatasoja pohjakuvan alla |
| Näytä | {{ui:Valitse}}, {{ui:Sovita}}, {{ui:3D}} | Poimii ja siirtää asioita; zoomaa näyttämään kaiken; näyttää työmaan 3D:nä ([Katso työmaata 3D:nä](topic:site-3d)) |

Piirtotyökalu pysyy painettuna, kun se on aktiivinen. Sen napsauttaminen uudelleen, {{key:Esc}} tai {{key:V}} palauttaa {{ui:Valitse}}-työkalun. {{ui:Kumoa}}, {{ui:Tee uudelleen}}, {{ui:Kopioi}} ja {{ui:Lisää}}-valikon kohdat ovat harmaina, kun ne eivät voi toimia; työkaluvihje kertoo syyn (esimerkiksi "Valitse ensin mittauspisteet"). Jokainen painike on lueteltu aiheessa [Työkalurivin viite](topic:toolbar).

Kapeassa ikkunassa työkalurivi vierittyy sivusuunnassa.

## Vasen paneeli

### Työmaa

- **Nimi**: projektin nimi. Se nimeää jokaisen tallentamasi tai viemäsi tiedoston ja tulostuu PDF:n otsikkoriville.
- **Yksiköt**: {{ui:US feet}} tai {{ui:Metriä}}. Tämä kertoo, mitä luvut tarkoittavat. Sen muuttaminen **ei** muunna koordinaatteja; katso [Yksiköt, paalut ja lukumuodot](topic:units-and-stations).

### Pisteet

Tyhjänä se kertoo, miten pistetiedosto avataan. Pisteiden kanssa se näyttää tiedostonimen, pisteiden määrän ja sen, kuinka monella on korko, sitten **pisteryhmien** taulukon: yksi rivi kuvauksen ensimmäistä sanaa kohti (GRD, FL, TBS …), määrä ja **Maastomalli**-valinta:

- {{ui:Pisteet}}: pisteet menevät maastomalliin (oletus jokaiselle ryhmälle).
- {{ui:Taitelinja}}: ryhmän pisteet yhdistetään pistenumerojärjestyksessä yhdeksi taitelinjaksi.
- {{ui:Jätetty pois}}: ryhmä ei kosketa maastomallia.

### Maastomalli

Tietoja nykyisestä maanpinnasta: pisteet, kolmiot, alin ja ylin korko, keskikorko, 2D- ja 3D-ala, taitelinjat ja onko rajaa. Tietojen alla oleva ruutu luettelee kaiken, mitä maastomallin rakentaja joutui korjaamaan tai ei voinut tehdä. Sitten:

- **Pisin ulkoreuna**: 0 säilyttää jokaisen ulkokolmion; luku typistää pitkät ohuet kolmiot ulkoreunasta.
- Linkit, jotka ilmestyvät, kun ne ovat käyttökelpoisia: {{ui:Poista raja}}, {{ui:Poista piirretyt taitelinjat}} ja LandXML:stä luetulle maastomallille {{ui:Rakenna maastomalli uudelleen pisteistä}}.

### Näyttö

- **Maastomalli**: {{ui:Nykyinen maanpinta}} tai {{ui:Suunniteltu (tasattu)}}. Jälkimmäinen on käytettävissä, kun alusta tai käytävä tasaa ilman ongelmia.
- **Korkeuskäyrät joka**, **Pääkäyrä joka** ja **Vyöhykkeet** (värivyöhykkeiden määrä).
- Valintaruudut: {{ui:Korkeuskäyrät}}, {{ui:Korkeuskäyrien tunnisteet}}, {{ui:Kolmiot}}, {{ui:Korkeusvyöhykkeet}}, {{ui:Kaltevuusnuolet}}, {{ui:Pisteet}}, {{ui:Pistetunnisteet}}, {{ui:Taitelinjat}}, {{ui:Maastomallin reuna}}, {{ui:Putket}}.
- Vyöhykkeiden korkojen selite ilmestyy, kun vyöhykkeet ovat päällä.

Näyttöasetukset tallennetaan projektin mukana, mutta ne eivät ole kumoamisvaiheita: {{key:Mod+Z}} ei koskaan käännä valintaruutua takaisin.

## Pohjakuva

Pohjakuva näyttää pisteet, maastomallin ja kaiken suunnittelemasi pohjakuvana pohjoinen ylöspäin. Rulla zoomaa osoittimen kohdalla, tyhjän tilan vetäminen panoroi. Koko luettelo on aiheessa [Näppäimet ja hiiri](topic:keyboard).

- Tyhjässä projektissa ruutu otsikolla **Aloita mittauspisteistä** luettelee ensimmäiset vaiheet ja tarjoaa {{ui:Avaa esimerkkityömaa}}.
- Kun piirtotyökalu on aktiivinen, pohjakuvan yläreunan vihje kertoo, mitä napsauttaa ja miten lopettaa.
- Tiedoston vetäminen pohjakuvan päälle näyttää "Pudota pistetiedosto, LandXML tai projekti".
- Valitut kohteet korostetaan. Valitulla linjauksella tai alustalla on neliönmuotoiset otteet taitepisteissä tai kulmissa; valitulla rakenteella on yksi ote. Vedä otetta siirtääksesi sitä.
- Valituilla mittauspisteillä on rengas. {{key:Shift}} ja napsautus lisää tai poistaa pisteen; {{key:Shift}} ja veto piirtää ruudun (tai niiden ympäri vedettynä lassoon), joka lisää sen sisällä olevat pisteet. Katso [Valitse, kopioi ja liitä mittauspisteitä](topic:copy-paste-points).

## Pituusleikkausnäkymä

Paina {{key:R}} tai napsauta {{ui:Pituusleikkaus}} avataksesi sen pohjakuvan alle. Sen palkissa on:

- linjausluettelo (käytössä, kun linjauksia on kaksi tai useampia)
- {{ui:Lisää PVI:t}}: kun se on painettuna, napsautus pituusleikkauksessa lisää PVI:n ({{key:I}} kytkee sen)
- lukema paalusta, maanpinnasta, suunnitelmakorosta, kaltevuudesta sekä leikkauksesta tai pengerryksestä osoittimen kohdalla
- sulkemispainike

Pituusleikkaus näyttää nykyisen maanpinnan, suunnitelmapituusleikkauksen, kunkin suoran kaltevuudet, kunkin PVI:n paalun ja koron, kunkin pystykaaren L:n ja K:n BVC:n ja EVC:n kanssa, ylä- ja alapisteet sekä pystysuuntaisen liioittelun. Se sovittaa aina koko linjauksen: se ei zoomaa eikä panoroi. Osoittimen liikuttaminen sen päällä asettaa pisteen linjaukselle pohjakuvassa.

## Oikea paneeli: Ominaisuudet

Sen otsikko kertoo, mitä se näyttää.

- **Projekti** (mitään ei ole valittu): linjaukset ja alustat linkkeinä, **Maanrakennus**-lohko ja **Putkiverkko**-lohko sääntöineen ja ongelmineen.
- **Linjaus**: nimi, alkupaalu, pituus, PI-taulukko, kaaret, suunnitelmapituusleikkauksen PVI-taulukko ja tiedot sekä **Käytävä**-asetukset.
- **Alusta**: nimi, korko, leikkaus- ja penger-luiskat, ala, luiskaus maanpintaan -tiedot ja maanrakennus.
- **Rakenne** tai **Putki**: koot, kansikorot, pohjakorot, kaltevuus, peitesyvyys ja mahdolliset ongelmat.
- **Piste** ja sen numero: pisteen koordinaatit, korko, kuvaus ja ryhmä (vain luku).

Kentät tulevat voimaan, kun painat {{key:Enter}} tai poistut kentästä. Arvo, jota ei hyväksytä, merkitään virheelliseksi eikä mikään muutu.

## Tilarivi

- **I** ja **P**: osoittimen kohdalla oleva itä- ja pohjoiskoordinaatti.
- **Maanpinta**: korko siinä (ja **Tasattu**, jos alusta tai käytävä muutti sitä) tai "Maastomallin ulkopuolella".
- Lähin linjaus (tai valittu) sekä osoittimen kohdalla oleva **paalu** ja sivuetäisyys (**R** tai **L**).
- Oikealla viestit: mitä juuri tapahtui tai miksi jokin evättiin. Viesti poistuu itsestään muutaman sekunnin kuluttua.

## Valintaikkunat

- **Tuo pisteet**: avautuu jokaisella pistetiedostolla. Katso [Tuo mittauspisteitä](topic:import-points).
- **Plottaa pohjakuva PDF:ksi**: katso [Plottaa pohjakuva PDF:ksi](topic:plot-pdf).
- **Tallentamattomat muutokset**: kysyy ennen kuin {{ui:Uusi}} tai projektin tai LandXML-tiedoston avaaminen hävittää tallentamattoman työn. {{ui:Tallenna kopio}} lataa projektin ensin.

## Pienet näytöt

Enintään 760 pikselin leveydellä, kuten puhelimessa, pohjakuva pitää näytön: työkalurivi on yksi sivusuunnassa vierivä rivi, ja paneelit avautuvat arkkeina alareunan palkista. {{ui:Työkalut}} piilottaa työkalurivin ja {{ui:Siirrä}} asettaa sen alareunaan.
