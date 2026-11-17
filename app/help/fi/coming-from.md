---
title: Siirtyminen muusta siviilisuunnitteluohjelmasta
summary: Miten tutut siviilisuunnittelun työkulut vastaavat CivilCraftia ja mitkä erot kaatavat kokeneet käyttäjät ensimmäisen tunnin aikana.
keywords: siirtyminen, siirrä, tuttu, erot, työkulku, komennot, vastaavuus, cogo, käytävä, maanrakennus, putkiverkko, tyylit, komentorivi
from: feae37d6
---

Jos olet käyttänyt Civil 3D:tä, tunnet jo CivilCraftin ideat: pisteet ja pisteryhmät, TIN-maastomallit taitelinjoineen ja rajoineen, linjaukset PI-pisteiden mukaan, profiilit PVI-pisteiden mukaan, poikkileikkauskokoonpanot käytäviksi, tasaus maanpintaan, painovoimaiset putkiverkot ja LandXML. Lähes kaikki niiden ympärillä on toisin: piirustustiedostoa ei ole, ei komentoriviä (paitsi jos valitset {{ui:Drafting classic}} -valikkotyylin), ei tyylejä, ei Prospectoria eikä asetusikkunoita. CivilCraft on pieni, keskittynyt työkalu selaimessa, ja tässä versiossa se tekee murto-osan siitä, mitä täysi siviilipaketti tekee. Tämä sivu kertoo, mitä tiedät ja mitä tässä on.

:::tip
Jos pidät Civil 3D:n nauhasta, valitse {{ui:Civil ribbon}} (Väyläsuunnittelun valintanauha) -valikkotyyli kohdasta {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}: välilehdet Koti, Maastomallit, Muokkaa, Geosijainti, Näkymä ja Tuloste, keskipainike panoroi, ja {{key:Shift}} keskipainikkeen kanssa kiertää 3D-näkymää. Jos kirjoitat komentoja, {{ui:Drafting classic}} (Piirtämisen klassikko) lisää komentorivin (ALIGNMENT, PAD, PROFILE, ZOOM …). Katso [Valikot, näppäimet ja hiiri](topic:menus-keys-and-mouse).
:::

## Työkulkukartta

| Mitä haluat tehdä | Tuttu tapa | CivilCraftissa |
|---|---|---|
| Tuo mittauspisteitä | Tuo pisteet pistetiedostomuodolla | {{ui:Open}} (Avaa), tarkista sarakejärjestys kohdassa **Tuo pisteet** ([Tuo mittauspisteet](topic:import-points)) |
| Lajittele pisteitä | Pisteryhmät, kuvausavaimet | Automaattiset ryhmät kuvauksen ensimmäisen sanan mukaan; ei kuvausavaimia |
| Muokkaa pistettä | Pisteeditori, otteet | Napsauta sitä ja kirjoita Ominaisuuksiin tai vedä ([Muokkaa mittauspistettä](topic:edit-points)) |
| Rakenna maanpinta | Luo pinta, lisää pisteryhmiä datana | Automaattinen: maastomalli rakentuu uudelleen aina, kun sen syötteet muuttuvat |
| Lisää taitelinjoja | Lisää taitelinjoja polylinjoista tai ominaisuuslinjoista | Aseta pisteryhmä {{ui:Breakline}}-tilaan tai napsauta pisteitä {{ui:Breakline}}-työkalulla ({{key:B}}) |
| Typistä maastomalli | Ulkoraja, piilotettava raja, enimmäiskolmion pituus | {{ui:Boundary}} ({{key:O}}, vain ulkoinen) ja **Pisin ulkoreuna** |
| Näytä korkeuskäyrät | Pintatyyli | **Näyttö** vasemmassa paneelissa: väli, pääväli, nimiöt, vyöhykkeet, rinnenuolet |
| Laadi keskilinja | Linjauksen luontityökalut, kaari- ja siirtymäasetukset | {{ui:Alignment}} ({{key:A}}): napsauta PI-pisteitä, {{key:Enter}}; säteet ja siirtymien pituudet PI-taulukossa |
| Luo pituusleikkausnäkymä | Profiilinäkymän ohjatoimi, vyöhykkeet | {{ui:Profile}} ({{key:R}}): yksi profiilinäkymä suunnitelman alla, aina sovitettuna |
| Suunnittele kaltevuus | Profiilin laadintatyökalut | {{ui:Start from the ground}} (Aloita maanpinnasta), {{ui:Add PVIs}} ({{key:I}}), vedä PVI-pisteitä, kirjoita **Kaari L** |
| Rakenna tie | Kokoonpano, osakokoonpanot, käytävä, kohteet, alueet | Rastita **Vie kokoonpano suunnitellun profiilin pitkin** linjauksen alla: kaista, pengerrys ja luiska kumpaankin puoleen, tai kumpikin puoli osista (ränni, reunakivi, jalkakäytävä …) |
| Tasaa alusta | Ominaisuuslinjat, tasausryhmät, tasauskriteerit | {{ui:Pad}} ({{key:G}}): tasainen alusta, jossa leikkaus- ja täyttöluiskat maanpintaan |
| Laske maansiirto | Tilavuuspinnat, tilavuusnäkymä | **Maansiirto** oikeassa paneelissa, ruudukkomenetelmä, päivittyy heti |
| Laadi sade- tai viemärilinja | Putkiverkko osaluettelolla, säännöt | {{ui:Pipes}} ({{key:P}}): napsauta rakenteita virtaan päin; kolme sääntöä, jotka asetat; pohjien korkeudet automaattisesti |
| Vaihda tietoa muiden kanssa | LandXML-tuonti ja -vienti | {{ui:Open}} LandXML-tiedosto; {{ui:LandXML}} viedäksesi ([Vie LandXML](topic:landxml)) |
| Vie viivat CAD:iin | Vienti DWG:hen | {{ui:DWG}} (2000–2018 -muoto) tai {{ui:DXF}} (R12) |
| Tulosta | Asettelut, näkymäruudut, arkkisarjat | {{ui:PDF}}: yksi vaakasuuntainen arkki suunnitelmasta valitussa mittakaavassa; suunnitelma- ja profiiliarkit sekä poikkileikkausarkit PDF:nä |
| Jaa työtä tiedostojen välillä | Datakytkennät, viittaukset | Ei saatavilla: yksi projekti per tiedosto |
| Kumoa | Kumoa | {{key:Mod+Z}} ja {{key:Mod+Y}}, 200 askelta; näytön asetukset eivät ole kumottavia askelia |

## Erot, jotka kaatavat ihmiset

**Komentoriviä ei ole**, paitsi jos valitset {{ui:Drafting classic}} -valikkotyylin. Työkalut ovat työkalurivipainikkeita ja yksittäisiä kirjaimia: {{key:A}} linjaus, {{key:G}} alusta, {{key:P}} putket, {{key:B}} taitelinja, {{key:O}} raja, {{key:R}} profiili, {{key:I}} lisää PVI-pisteitä, {{key:V}} valinta, {{key:F}} sovita. Muissa valikkotyyleissä komennon nimen kirjoittaminen ei tee mitään. Katso [Näppäimet ja hiiri](topic:keyboard).

**Enter lopettaa; kaksoisnapsautus on riskialtis.** Napsauta viimeistä pistettä kerran ja paina sitten {{key:Enter}}. Tässä versiossa kaksoisnapsautus lopettaa myös, mutta pudottaa kaksoisnapsautetun pisteen. Hiiren oikea painike ei lopeta eikä toista; se vain panoroi, kun vedät sillä.

**Kaikki on dynaamista koko ajan.** Muuta pisteryhmää, sädettä, PVI-pistettä tai alustan luiskaa, ja maastomalli, korkeuskäyrät, käytävä, leikkausviivat ja tilavuudet päivittyvät heti. Mitään ei tarvitse rakentaa uudelleen eikä mikään vanhene.

**Mikään ei ole piirustusobjekti.** Suunnitelma on näkymä suunnittelusta, ei piirustus, jota voit muokata CAD-komennoilla. Et voi lisätä omia viivoja tai tekstiä, muuttaa tason väriä tai räjäyttää mitään. Vie DXF:ään ja viimeistele piirustus CAD-ohjelmassa.

**Ei tyylejä.** Värit, viivanpaksuudet, nimiöiden koot ja tasojen nimet ovat kiinteät (katso [Suunnitelman tasot](topic:plan-layers)). Paperi ja Malli sovelluspalkissa vaihtavat vaalean ja tumman näytön välillä.

**Yksi kumpaakin.** Yksi maanpintamalli, yksi tasattu tulos ja yksi putkiverkko projektia kohden. Monta linjausta ja alustaa on sallittu.

**Yksiköt ovat nimiöitä.** {{ui:US feet}} tai {{ui:Metres}} -valinta ei muunna mitään. Piirrosmittakaavaa ei ole. Koordinaatistojärjestelmä on valinnainen: aseta se kohdasta {{ui:Coordinates}} (Koordinaatit), eikä mikään liiku, se vain kertoo, mitä luvut tarkoittavat (katso [Aseta projektin koordinaatistojärjestelmä](topic:coordinate-systems)). Jalat tulkitaan US-mittajalkoina kirjoitettaessa LandXML:ään.

**Taitelinjaryhmät liittyvät pistenumerojärjestyksessä.** {{ui:Breakline}}-tilaan asetettu ryhmä muodostaa yhden viivan kaikkien pisteidensä läpi numerojärjestyksessä. Jaetut koodit (kaksi virtausviivaa, molemmat koodilla ”FL”) muodostavat yhden siksak-viivan; piirrä ne käsin.

**Paalut näyttävät samalta, metrit eroavat.** Jaloissa paalut ovat 100 ft:n välein (12+34.56); metreissä 1000 m:n välein (1+234.567).

**Poisto Macissa.** Macin näppäin, jossa lukee delete, on selaimessa {{key:Backspace}}. Käytä fn- ja delete-näppäimiä tai {{ui:Delete}}-painiketta valinnan poistamiseen.

**Tiedostot ovat latauksia.** {{ui:Save}} lataa `.civilcraft.json`-tiedoston joka kerta; ei ole ”tallenna avoimen tiedoston päälle” -toimintoa. Tallentamattoman työn palautuskopio säilytetään tässä selaimessa ([Palauta tallentamaton työ](common:recover)). Pistetiedoston avaaminen korvaa pisteet kysymättä. Katso [Tiedostot, jotka voit avata, tallentaa ja viedä](topic:files).

**Säännöt ovat sinun.** Putkiverkon säännöt ja käytävän kokoonpano alkavat paikanvaraisilla arvoilla, jotka eivät ole standardi. Aseta omat ennen kuin luotat mihinkään tarkistukseen.

**Tilavuudet perustuvat ruudukkoon.** Leikkaus ja täyttö lasketaan hienosta ruudukosta kahden pinnan välillä leikkausviivojen sisällä, ilman turpoamista tai kutistumista. Ne ovat lähellä TIN-tilavuutta, mutta eivät samoja.

## Mitä puuttuu

Muut kuin klotoidisiirtymät, kokoonpanot, jotka muuttuvat tien varrella, kaltevat alustat, sadevesikaivon kapasiteetti ja pidätys, osaluettelot, putket profiilissa, tonttijärjestelyt ja tonttikoot, pienimmän neliösumman tasoitus ja mittaustietokannat, DWG:n avaaminen ja muuta. Täydellinen luettelo ja mitä tehdä sen sijaan tänään on sivulla [Ei vielä toteutettu](topic:not-built-yet).
