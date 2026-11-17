---
title: Yksiköt tuonnissa: tiedosto kertoo yksikkönsä tai sinulta kysytään ensin
summary: Kun piirros tai verkko, jonka tuot projektiin, kertoo yksikkönsä, CivilCraft muuntaa sen ja kertoo siitä. Kun se ei kerro, CivilCraft kysyy ennen lukemista ja muistaa vastauksesi kyseiselle tiedostolle.
keywords: yksiköt, tuonti, DWG, DXF, STL, OBJ, mittaus, jalat, US survey -jalat, metrit, millimetrit, mittakaava, väärä koko, liian suuri, liian pieni, kysy, muistettu, INSUNITS, piirroksen yksiköt
from: 60921963
---

## Mitä teet

Tuo tiedosto projektiin ja varmista, että se tulee oikeaan kokoon.

## Vaiheet

1. Avaa tiedosto tavalliseen tapaan: {{ui:Avaa}}, pudota se suunnitelmalle tai käytä CAD-piirroskomentoa.
2. Jos tiedosto kertoo yksikkönsä, mitään ei kysytä: tuontiikkuna näyttää ne kohdassa **Piirroksen mukaan**.
3. Jos ei kerro, valintaikkuna kysyy ennen tuontiikkunan avautumista **tiedoston yksikköä**: valitse, mitä yksi yksikkö tiedostossa tarkoittaa, ja napsauta {{ui:Käytä näitä yksiköitä}}.
4. {{ui:Peruuta}} (tai {{key:Esc}}) ohittaa tiedoston. Siitä ei lueta projektiin mitään.

## Mitkä tiedostot kertovat yksikkönsä

- **DWG ja DXF**: piirroksen lisäysyksiköt (`$INSUNITS`). Tiedostosta ilman niitä kysytään. Tuontiikkunan **Piirroksen yksiköt** -luettelo alkaa vastauksestasi ja voi yhä muuttua.
- **STL ja OBJ** (maisemamuotojen vapaamuotoiset muodot): eivät koskaan kerro yksiköitä. Sinulta kysytään.
- **Pistelistat** (CSV, TXT) ja etenemismittausten luettelot: luettelo, joka kertoo yksikkönsä ensimmäisillä riveillään, muunnetaan, ja tilarivi kertoo siitä. Luettelosta, joka ei kerro mitään, kysytään, kun painat {{ui:Tuo}}-painiketta, ennen kuin pisteet viedään sisään. Leveys- ja pituuspiirisarakkeet kulkevat sen sijaan koordinaattijärjestelmän kautta.
- **Pistepilvi-lisäosa**: kysyy, kun rakennat pilven, jonka tiedosto ei kerro yksikköä, ja merkitsee pilven luvut yksikössä, jonka pilvi kantaa.
- **IFC ja LandXML**: kertovat omansa; ne muunnetaan projektin yksiköiksi.
- **LAS, LAZ ja korkeusrasterit**: sijoitetaan koordinaattijärjestelmänsä mukaan; maastoikkuna kysyy korkeuden yksikköä, kun tiedosto ei kerro sitä.

## Hyvä tietää

- Vastaus muistetaan kyseiselle tiedostolle tällä tietokoneella, kaikissa CadCraft-sovelluksissa. Seuraavalla tuonnilla sinulta ei kysytä.
- Jos haluat tulla kysytyksi uudelleen: komentopaletti ({{key:Mod+K}}) › **Kysy uudelleen tuotujen tiedostojen yksiköistä**.
- Luettelon ilmoittama yksikkö luetaan sen ensimmäisistä kahdeksasta rivistä: rivi kuten `units: ft`, tai sarakeotsikot, joissa kaikissa on sama yksikkö sulkeissa, kuten `Elevation (m)`.
