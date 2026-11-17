---
title: Vianmääritys
summary: Oireet, syyt ja korjaukset CivilCraftin ongelmiin sekä sovelluksen näyttämät tarkat viestit.
keywords: ongelmat, virheet, ei toimi, korjaus, ohje, viestit, vianmääritys, evätty, puuttuu, väärin, vaihtunut, korkeuskäyrät puuttuvat
from: a9f7dedc
---

Viestit näkyvät oikeassa alareunassa tilarivillä, vasemman ja oikean paneelin laatikoissa sekä valintaikkunoissa. Ne on lainattu tässä niin kuin sovellus ne näyttää.

## Tiedostojen avaaminen

**”Tiedosto on yli 200 MB; CivilCraft ei vielä avaa näin suuria tiedostoja.”**
Jaa pistetiedosto tai harvenna tiedot ennen avaamista.

**”Tiedostoa site.json ei voitu avata: Tämä ei ole CivilCraft-projektitiedosto.”**
Tiedoston pääte on `.json` tai se alkaa merkillä `{`, mutta se ei ole CivilCraft-projekti. Pistetiedostot eivät saa alkaa merkillä `{`.

**”Tiedostoa ei voitu avata … Tämä projektitiedosto on uudemmasta CivilCraftista (versio 2).”**
Projekti on tallennettu uudemmalla versiolla. Avaa se siellä tai vie siitä LandXML.

**”Tiedostoa ei voitu avata … Tämä on XML, mutta ei LandXML (juurielementti on <…>).”**
Tiedosto on eri XML-tyyppiä. Vie LandXML toisesta ohjelmasta.

**”… ei sisällä pisteitä, TIN-pintoja tai linjauksia, joita CivilCraft osaa lukea.”**
Tiedostossa kaikki on sellaista, minkä CivilCraft ohittaa (esimerkiksi vain ruudukkopinnat tai vain kierrelinjaukset). Viestin loppuosa kertoo, mitä tiedostossa oli. Katso [LandXML: mitä luetaan ja kirjoitetaan](topic:landxml-reference).

**”Esimerkkiä ei voitu ladata: …”**
{{ui:Avaa esimerkkikohde}} lukee tiedoston CadCraft-sivustolta. Ilman yhteyttä se toimii vain, jos CivilCraft on tallennettu offline-käyttöön (sovelluspalkin painike näyttää {{ui:Offline valmis}}). Siirry verkkoon, napsauta {{ui:Tallenna offline-käyttöön}}, ja siitä lähtien se toimii offline. Katso [Offline](common:offline).

**{{ui:Tallenna offline-käyttöön}} näyttää {{ui:Tallennus ei onnistunut}}.**
Osa tiedostoista ei latautunut. Tarkista yhteys ja napsauta painiketta uudelleen.

**{{ui:Tallenna offline-käyttöön}} näyttää {{ui:Offline ei käytettävissä}}.**
Tämä selainikkuna ei voi säilyttää offline-kopiota, yleensä siksi että se on yksityinen ikkuna tai tietokonetta hallitaan. Avaa CivilCraft tavallisessa ikkunassa.

**Offline-tilassa sovellus ei avaudu lainkaan.**
Sitä ei ole tallennettu offline-käyttöön tässä selaimessa, tai selain tyhjensi sivuston tiedot (Safari tekee näin sivustoille, joilla ei ole käyty useisiin viikkoihin). Siirry verkkoon, avaa CivilCraft ja napsauta {{ui:Tallenna offline-käyttöön}}.

**Offline-kopio on vanhempi versio.**
Napsauta {{ui:Offline valmis}} ja sitten {{ui:Tallenna uudelleen (hae uusin versio)}} verkkoyhteyden ollessa päällä.

**Tiedosto näkyy harmaana avauslaatikossa.**
Laatikko listaa päätteiden perusteella vain pistetiedostot, LandXML-tiedostot ja projektitiedostot. Vedä tiedosto sen sijaan suunnitelmalle tai nimeä se uudelleen `.txt`-päätteeseen.

## Pisteiden tuonti

**”Tästä tiedostosta ei voitu lukea pisteitä.”**
Valitse sarakkeiden järjestys käsin kohdasta **Sarakkeet**. Jos mikään ei toimi, avaa tiedosto tekstieditorissa ja tarkista, että siinä on yksi piste per rivi ja että rivillä on numeroita.

**Kohde näyttää peilautuneelta, kierretyltä tai venyneeltä viivaksi.**
Pohjoinen ja itä ovat vaihtuneet. Yhteenvedossa luki ”arvattu sarakemäärän perusteella”. Valitse kohdasta **Sarakkeet** PENZD PNEZD:n sijaan (tai päinvastoin), tai tuo uudelleen.

**Pisteet kaukana muista, ja suunnitelma loitontui pisteeksi.**
Rivillä on kirjoitusvirhe koordinaatissa, tai tiedostossa on sekoitettu koordinaattijärjestelmiä. Etsi piste (napsauta sitä nähdäksesi numeron) ja korjaa tiedosto.

**Rivit, jotka on lueteltu kohdassa ”Rivejä, joita ei luettu”.**
Katso taulukko kohdasta [Tuo pisteet](topic:import-points#rows-that-are-not-read).

**Vanhat pisteeni ovat poissa.**
Pistetiedoston tuonti korvaa kaikki pisteet ja tyhjentää kumoushistorian. Saat ne takaisin avaamalla tallennetun projektisi.

## Maastomalli

**”Maastomalli: Ei rakennettu” punaisessa laatikossa.**
Laatikko kertoo syyn: ”Maastomalli tarvitsee vähintään kolme pistettä, joilla on korkeus.”, ”Pisteet ovat kaikki samalla suoralla: ei kolmioita.”, ”Ei pisteitä, joilla on korkeus.”, ”Rajaus ei mene päällekkäin pisteiden kanssa.” tai ”Rajauksen sisään ei jää yhtään kolmiota.” Tarkista sarakkeiden järjestys, pisteryhmät (ovatko ne {{ui:Jätetty pois}}?) ja rajaus.

**Korkeuskäyrät leikkaavat ojan tai harjanteen suoraan poikki.**
Tuo viiva ei ole taitelinja. Aseta sen ryhmäksi {{ui:Taitelinja}} tai piirrä se {{ui:Taitelinja}}-työkalulla. Katso [Rakenna ja tarkenna maastomalli](topic:build-surface).

**Taitelinjaryhmä piirtää sahalaitaviivan.**
Ryhmässä on useampi kuin yksi viiva, tai sen pisteet eivät ole numeroitu viivan suunnassa. Aseta ryhmä takaisin tilaan {{ui:Pisteet}} ja piirrä jokainen viiva {{ui:Taitelinja}}-työkalulla.

**Pitkiä, ohuita kolmioita reunoja pitkin.**
Piirrä rajaus ({{key:O}}) tai aseta **Pisin ulkoreuna**.

**Ei lainkaan korkeuskäyriä, vaikka maastomalli on rakennettu.**
Joko {{ui:Korkeuskäyrät}} on pois päältä kohdassa **Näyttö**, tai väli on niin pieni, että korkeuskäyräportaita tulisi yli 2,000. Valitse suurempi väli.

**Taitelinjat tai rajaus eivät muuta mitään.**
Maastomalli on tullut LandXML-tiedostosta (”Maastomalli (LandXML-tiedostosta)”). Sitä käytetään sellaisenaan. Napsauta {{ui:Rakenna maastomalli uudelleen pisteistä}}, jos haluat rakentaa sen pisteistä.

**”Maastomallia ei ole vielä: tuo ensin pisteet.”**
Taitelinja, rajaus ja tasanne tarvitsevat olemassa olevan maanpinnan. Tuo ensin pisteet.

**”Napsauta pistettä, jolla on korkeus: taitelinja ottaa pisteiden korkeudet.”**
{{ui:Taitelinja}}-työkalu valitsee vain pisteitä. Zoomaa lähemmäs ja napsauta pistettä (oranssi neliö näyttää, minkä pisteen se ottaa).

## Piirtäminen

**Viimeinen pisteeni katosi, kun kaksoisnapsautin lopettaakseni.**
Tässä versiossa kaksoisnapsautus lopettaa linjauksen, tasanteen, taitelinjan tai rajauksen, mutta pudottaa kaksoisnapsautetun pisteen. Napsauta viimeistä pistettä kerran ja paina {{key:Enter}}. Jos näin on jo käynyt, käytä {{key:Mod+Z}} ja piirrä uudelleen.

**En voi lopettaa piirrosta tabletilla.**
Lopettaminen vaatii {{key:Enter}}-näppäimen; näytöllä ei ole vielä painiketta. Liitä näppäimistö. Katso [Hiiri, kosketuslevy ja kosketus](topic:keyboard#mouse-trackpad-and-touch).

**Pisteen sijoittaminen vetämällä panoroi sen sijaan.**
Yli muutaman pikselin vetäminen panoroi suunnitelmaa kaikissa työkaluissa. Napsauta liikuttamatta.

**”Linjaus tarvitsee vähintään kaksi pistettä.” / ”Tasanne tarvitsee vähintään kolme kulmaa.” / ”Putkiosuus tarvitsee vähintään kaksi rakennetta.”**
Painoit {{key:Enter}}-näppäintä liian aikaisin. Piirros hylätään; aloita alusta.

**Näppäimet kuten A tai G eivät tee mitään.**
Paneelin tekstikenttä tai luettelo on yhä kohdistettuna, joten kirjaimet menevät sinne. Napsauta suunnitelmaa kerran ja paina sitten näppäintä. Mac-tietokoneen näppäimistössä selain tulkitsee poistonäppäimen Backspace-näppäimeksi: poista valinta painamalla Fn ja Delete.

## Linjaukset ja profiilit

**”Kaaret kohdissa PI 2 ja PI 3 menevät päällekkäin: … Käytä pienempiä säteitä.”**
Kaksi kaarta tarvitsevat enemmän tangenttia kuin niiden PI-pisteiden välissä on. Pienennä yhden tai molempien säteitä PI-taulukossa tai siirrä PI-pisteitä kauemmas toisistaan.

**”PI 3 kääntyy suoraan takaisin; siihen ei voi tulla kaarta.”**
Linjaus kääntyy takaisin itseensä kyseisessä PI-pisteessä. Siirrä tai poista PI-piste.

**”Tällä linjauksella ei ole maanpintaa alla, josta aloittaa.”**
Linjaus on maastomallin ulkopuolella. Siirrä se maastomallin päälle tai lisää PVI-pisteitä napsauttamalla, kun {{ui:Lisää PVI:t}} on päällä.

**”Pystykaari kohdassa PVI 3 (L = …) alkaa ennen kuin sitä edeltävä kaari tai PVI päättyy.” / ”… ulottuu seuraavan PVI:n yli.”**
Lyhennä kaaren pituutta tai siirrä PVI-pisteitä kauemmas toisistaan.

**”Kohdassa … on jo PVI.”**
Kyseisessä paalussa on PVI. Napsauta muualle tai vedä olemassa oleva.

**Profiilinäkymä on tyhjä: ”Piirrä linjaus nähdäksesi sen profiilin.”**
Linjausta ei ole, tai valitussa linjauksessa on virheitä.

## Käytävät ja tasanteet

**”Käytävä tarvitsee suunnitteluprofiilin ilman virheitä.”**
Aloita suunnitteluprofiili ({{ui:Aloita maanpinnasta}}) ja korjaa kaarten päällekkäisyydet.

**”… sivuluiskat menevät maastomallin ulkopuolelle ennen kuin kohtaavat maanpinnan.” / ”… luiskaviivat menevät maastomallin ulkopuolelle ennen kuin kohtaavat sen …”**
Tasaus saavuttaa maastomallin reunan ennen kuin kohtaa maanpinnan. Siirrä suunnitelma reunasta sisäänpäin tai tuo se lähemmäs maanpintaa. Osittain maastomallin ulkopuolelle piirretty uusi tasanne voi alkaa korkeudesta 0: kirjoita todellinen korkeus.

**”Käytävän päivänvalolinjat leikkaavat …” / ”Päivänvalolinja leikkaa itsensä …”**
Eri puolilta tulevat luiskat osuvat toisiinsa: tiukat kaaret, kapeat tasanteet, syvät leikkaukset tai korkeat penkat. Käytä suurempaa sädettä, kapeampaa rakennetta, leveämpää tasannetta tai jyrkempiä luiskia.

**”Tilavuuksia ei vielä ole: tasanteen tasauksen täytyy onnistua ilman ongelmia.”**
Korjaa punaisessa laatikossa sen yläpuolella luetellut ongelmat.

**{{ui:Suunniteltu (tasattu)}} on harmaana.**
Yhtään tasannetta tai käytävää ei ole vielä tasattu.

## Putket

**”Kohteella P2 ei ole vielä pohjan korkoja.”**
Napsauta {{ui:Aseta sen pohjan korot säännöistä}} tai kirjoita pohjan korot.

**”P1: kohdassa S1 ei ole maanpintaa, josta aloittaa.”**
Ylävirran rakenne on maastomallin ulkopuolella eikä sillä ole reunakorkoa. Kirjoita sille reunakorko.

**Jokainen putki on merkitty, kun siirsin rakennetta.**
Rakenteen siirtäminen ei muuta pohjan korkoja. Napsauta {{ui:Aseta kaikki pohjan korot säännöistä}}.

Kaikki verkon viestit selitetään kohdassa [Suunnittele painovoimainen putkiverkko](topic:pipe-network#read-and-fix-problems).

## Tallentaminen ja vieminen

**”Ei vielä mitään vietävää.” / ”Ei vielä mitään plotattavaa.”**
Projekti on tyhjä. Tuo ensin pisteet.

**En löydä tallennettua tiedostoa.**
Se on selaimen latauksissa (yleensä Lataukset-kansiossa). Katso [Tiedostot, joita voi avata, tallentaa ja viedä](topic:files#where-the-files-go).

**PDF:n mittakaava on paperilla väärä.**
Tulosta 100 %:n tai todellisessa koossa, ei ”sovita sivulle”.

**PDF-tekstissä on kysymysmerkkejä.**
Nimissä tai kuvauksissa on merkkejä länsieurooppalaisen merkistön ulkopuolelta. Tilaviesti laskee ne. Nimeä uudelleen tavallisilla merkeillä.

**Plotti leikkautuu reunoista.**
Mittakaava on liian suuri arkille. Valitse mittakaava, jossa lukee ”(sopii)”, suurempi arkki tai {{ui:Se, mikä on näytöllä}}.

**{{key:Mod+P}} avasi selaimen tulostusikkunan.**
Sivu ei ollut kohdistettuna. Sulje ikkuna, napsauta suunnitelmaa ja paina {{key:Mod+P}} uudelleen tai napsauta {{ui:PDF}}.

## Sovellus itse

**Näyttö on tyhjä tai työkalurivi ei tee mitään.**
Käytä jotakin ajantasaista selainta: Chrome, Edge, Firefox tai Safari, ja lataa sivu uudelleen. Katso [Selaimet](common:browsers).

**Sovellus on hidas suuren pistetiedoston kanssa.**
Poista käytöstä {{ui:Kolmiot}}, {{ui:Pistetunnisteet}} ja {{ui:Korkeusvyöhykkeet}}, ja käytä suurempaa korkeuskäyrävälia. Hyvin suuret maastomallit rakentuvat hetken jokaisen muutoksen jälkeen uudelleen.

**Selain kysyy ”Poistutaanko sivulta?”**
Projektissa on tallentamattomia muutoksia. Pysy sivulla, tallenna {{key:Mod+S}}-näppäimillä ja poistu sitten.
