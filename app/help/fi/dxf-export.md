---
title: Vie pohjakuva DXF-tiedostoksi
summary: Kirjoittaa pohjakuvan viivat R12-DXF-tiedostoon nimettyinä tasoina, korkeuskäyrät omilla korkeuksillaan ja taitelinjat 3D:nä, mihin tahansa CAD-ohjelmaan.
keywords: dxf, dwg, cad, vienti, viivat, r12, 2000, 2004, 2007, 2010, 2013, 2018, tasot, korkeuskäyrät, piirustuksen vaihto, taustakartta, tausta
from: f2d8ede9
---

{{ui:DXF}} kirjoittaa pohjakuvan näkyvän sisällön DXF-tiedostoksi R12-muodossa, eli versiona, jonka jokainen CAD-ohjelma avaa. Jos olet käyttänyt AutoCADia tai Civil 3D:tä, avaa tai lisää tiedosto samalla tavalla kuin mikä tahansa DXF-tiedosto.

## Vienti

1. Aseta pohjakuva haluamallasi tavalla piirustusta varten: valitse kohdassa **Näyttö** maastomalli (nykyinen tai suunniteltu), korkeuskäyrien väli sekä se, mitkä asiat ovat päällä (korkeuskäyrät, tekstit, pisteet, pistetekstit, kolmiot, taitelinjat, maastomallin reuna, putket, luiskanuolet).
2. Napsauta **Vie**-ryhmässä {{ui:DWG/DXF}}-painiketta ja valitse {{ui:DXF (R12, teksti) — tavallinen vaihtotiedosto}}, sitten {{ui:Lataa}}.
3. Selain lataa tiedoston `<name>.dxf`. Tilarivi kertoo esimerkiksi: "Vietiin R12 DXF: 2,140 kohdetta; tekstit mitoitettu suhteeseen 1" = 40'. Korkeusvyöhykkeitä ei viedä."

Koordinaatit kirjoitetaan projektin yksiköissä todellisina arvoinaan (tasokoordinaatit säilyvät ennallaan). Mitään ei skaalata eikä siirretä.

## Tiedoston sisältö

| Kohde | DXF-kohde | Taso |
|---|---|---|
| Pienet ja pääkorkeuskäyrät | 2D-polyviivat niiden korkeudella | C-TOPO-MINR, C-TOPO-MAJR |
| Korkeuskäyrien tekstit | Teksti | C-TOPO-TEXT |
| Kolmiot | Polyviivat | C-TOPO-TINN |
| Taitelinjat ja rajaus | 3D-polyviivat | C-TOPO-BRKL |
| Maastomallin reuna | Polyviivat | C-TOPO-BNDY |
| Luiskanuolet | Polyviivat | C-TOPO-SLOP |
| Mittauspisteet ja niiden tekstit | Pisteet (korkeuden kanssa), teksti | V-NODE, V-NODE-TEXT |
| Viivat viivakoodeista | 3D-polyviivat | V-NODE-LINE |
| Linjauksen keskiviivat | Viivat ja kaaret | C-ROAD-CNTR |
| Paalutusmerkit ja tekstit | Polyviivat, teksti | C-ROAD-STAN |
| Käytävän reunat | Polyviivat | C-ROAD-CORR |
| Poikkileikkauslinjat | Polyviivat | C-ROAD-SCTN |
| Tasanteet, leikkausrajat ja luiskaviivat | Polyviivat | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Taitelinjat | 3D-polyviivat (kaaret paloina 0.01:n sisällä; katso [Taitelinjat](topic:feature-lines)) | C-GRAD-FEAT |
| Kääntöradat | Polyviivat, teksti | C-ROAD-SWPT |
| Putket, rakenteet ja tekstit | Polyviivat, teksti | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Ongelmalliset putket ja rakenteet | Polyviivat | C-STRM-PROB |

Jokaisella tasolla on väri. Täydellinen luettelo on kohdassa [Suunnitelman tasot](topic:plan-layers).

## Tekstin koko

Tekstillä on oltava koko piirustusyksiköissä. CivilCraft mitoittaa tekstit mittakaavalle, jossa koko pohjakuva mahtuu Tabloid-arkille (jalat) tai A3-arkille (metrit), ja kertoo mittakaavan tilaviestissä. Jos tulostat toisessa mittakaavassa CAD-ohjelmassa, skaalaa teksti siellä.

## Mitä ei viedä

- Korkeusvyöhykkeet (vain näytöllä).
- Pituusleikkausnäkymä. Profiilit viedään LandXML-muodossa, eivät piirustuksena.
- Maastomalli itsessään 3D-kohteena. Käytä TIN:lle LandXML:ää tai kytke päälle {{ui:Kolmiot}}, jolloin sen reunat tulevat viivoina.
- Kaikki, minkä olet kytkenyt pois kohdassa **Näyttö**.

## DWG

{{ui:DWG/DXF}} kirjoittaa saman viivaston myös DWG-piirustukseksi. Sen valintaikkuna kysyy muodon: DXF tai DWG vuosilta 2000, 2004, 2007, 2010, 2013 tai 2018. Vuosi 2000 avautuu lähes jokaisessa CAD-ohjelmassa, vanhassa ja uudessa; valitse uudempi, kun piirustuksen saaja sitä pyytää. Valintasi muistetaan tässä selaimessa.

1. Napsauta **Vie**-ryhmässä {{ui:DWG}}-painiketta.
2. Valitse **Muoto** ja napsauta **Lataa DWG**.
3. Selain lataa tiedoston `<name>.dwg`. Tilarivi kertoo, mitä siihen meni, esimerkiksi: "Vietiin DWG (2018-muoto): 12 polyviivaa, 40 tekstiä 9 tasolla".

DWG-tiedostossa on samat tasot, värit, korkeuskäyrät (polyviivoina niiden korkeudella), 3D-taitelinjat, tekstit ja pisteet kuin DXF-tiedostossa, samoissa koordinaateissa. DWG:hen sopimattomat tasonimet muutetaan, ja tilarivi kertoo siitä. CivilCraft kirjoittaa DWG:n omalla koodillaan, joten mitään ei lähde tietokoneeltasi.

### Karttatasot DWG-tiedostossa

DWG-piirustukseen ei voi upottaa kuvaa: CAD-ohjelmat näyttävät kuvan piirustuksen vieressä. Kun karttatasot näkyvät, valintaikkunassa on **Karttatasot kuvana piirustuksen vieressä** -valinta. Kun se on ruksittu, lataus on `.zip`-tiedosto, joka sisältää `<name>.dwg`-tiedoston, `<name>-map.png`-kuvan (karttatasot koko piirustuksen päällä, enintään 4 096 pikseliä leveydeltään) ja `<name>-map.pgw`-tiedoston (maailmatiedosto GIS-ohjelmille). Piirustus näyttää kuvan tasolla G-MAP-IMAG paikallaan. Pura tiedostot yhteen kansioon ja pidä ne yhdessä.
