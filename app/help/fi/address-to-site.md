---
title: Osoite kohteeksi
summary: Muunna osoite kohteen tarvitsemiksi tiedoiksi: tontti, sen ympärillä olevat rakennukset, kaavoitus, maaperä ja tulvavyöhyke avoimesta datasta, jonka pyydät painikkeella tai tuot tiedostoina, ja lähetä ne BimCraftiin ehdotuksina.
keywords: osoite, geokoodaus, kohde, tontti, rakennukset, kaavoitus, maaperä, tulva, avoin data, openstreetmap, fema, ssurgo, usgs, konteksti, ccsite, bimcraft
from: 125d848a
---

## Mitä se tekee

Maastomalli › Lisää › Osoite kohteeksi antaa pisteelle vastauksen: mihin tonttiin se kuuluu, mitkä rakennukset ovat sen ympärillä, kaavoituksen, maaperän ja tulvavyöhykkeen. Data on avointa: lisäät tiedostoja (GeoJSON, shapefile, KML, GeoPackage) ja, kun kytket lisäosat päälle, painikkeita, joista kukin pyytää yhden avoimen palvelun.

## Käyttö

1. Kirjoita osoite ja paina osoitehakupainiketta (lisäosa ”Osoitehaku”) tai kirjoita leveyspiiri ja pituuspiiri.
2. Lisää tasoja: tiedostot painikkeella ”Lisää tiedostoja” tai muilla lähdepainikkeilla (tulvavyöhyke, rakennukset, maaperä, maanpinnan korkeus, kunnan tontit). Palvelua pyydetään vain, kun painat sen painiketta; mitään ei haeta käynnistettäessä.
3. Paina ajopainiketta, niin saat vastauksen sanoin ja CSV-tiedostona.
4. ”Tallenna kohde tiedostona” tai ”Lähetä BimCraftiin ehdotuksina” antaa ääriviivat BimCraftille tai ModelCraftille; ne listataan, ja niistä lisätään vain ne, jotka valitset.

## Hyvä tietää

- Osoitehaku kulkee getcadcraft.com-palvelun kautta, joka kysyy OpenStreetMapin Nominatimilta puolestasi (enintään yksi pyyntö sekunnissa; vastaukset säilytetään 90 päivää, joten samaa osoitetta ei kysytä kahdesti; tallennetaan vain osoitteen tiivisteen arvo, ei koskaan sitä, kuka kysyi). Muut painikkeet menevät suoraan selaimestasi niiden palveluun.
- Jokaisella lähteellä on oma lisenssinsä (OpenStreetMap on ODbL: säilytä lähdemerkintä).
- Tasot ovat yhtä hyviä kuin avoin data paikkakunnallasi. Tarkista tärkeät asiat mittauksella.
