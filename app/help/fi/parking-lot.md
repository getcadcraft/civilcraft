---
title: Pysäköintialueen sijoittelu
summary: Sijoita paikat, ajoväylät, esteettömät ja pakettiautojen paikat sekä saarekkeet rajauksen sisään, anna alueelle kaltevuudet sadevesikaivoihin nykyistä maanpintaa vasten, ja päällystä sekä istuta alue. Saatavilla myös avustajalle.
keywords: pysäköinti, alue, parkkipaikka, ajoväylä, esteetön, ada, pakettiauto, saareke, sadevesikaivo, kaltevuus, leikkaus, täyttö, päällyste, kivipäällyste, istutus, puut, maasto, pistepilvi, mcp, avustaja
from: 06c14da9
---

Sovita pysäköintialue tontin, alustan tai suljetun taitelinjan sisään. Saat laskennat, tasauksen ja päällysteen yhdellä kertaa.

## Sijoittelu

1. Valitse pohjapiirroksesta tontti, alusta tai suljettu taitelinja.
2. Avaa **Maastomalli, Lisää, Pysäköintialue...**
3. Valitse säännöt, paikan kulma (90, 75, 60, 45, 30 astetta tai rinnakkain) sekä yksisuuntaiset tai kaksisuuntaiset ajoväylät. Paikkojen, ajoväylien ja saarekkeiden koot lähtevät taulukosta, ja jokaisen voi kirjoittaa päälle.
4. Valitse **Sijoita**.

Rivit kulkevat rajauksen reunaa pitkin siten, että paikkoja tulee eniten (tai kirjoittamassasi kulmassa). Paikka lasketaan vain, jos se on kokonaan rajauksen sisällä. Jos tilaa jää yhdelle riville ja ajoväylälle, lisätään yksipuolinen kaista. Ikkuna luettelee tilat, esteettömät ja pakettiautojen paikat, saarekkeet, sadevesikaivot sekä pinta-alan paikkaa kohden. Pohjapiirroksessa näkyvät paikat, esteettömät paikat varjostettuine esteettömine ajoväylineen, saarekkeet, ajoväylien keskiviivat ja sadevesikaivot omilla tasoillaan (C-PARK-...), joten ne siirtyvät PDF-, DXF- ja DWG-muotoon.

## Esteettömät paikat

Yhdysvaltain säännöillä lukumäärä seuraa 2010 ADA Standards -standardin taulukkoa 208.2 tarjottujen paikkojen osalta. Yksi kuudesta, pyöristettynä ylöspäin, on pakettiauton paikka. Paikat sijoitetaan rajauksen ensimmäisen kulman (sisäänkäynnin) lähimmälle kohdalle, ja jokaisella on esteetön ajoväylä. Kaksi paikkaa voi jakaa yhden ajoväylän. Paikka, joka on kapeampi kuin esteettömän paikan leveys, tai kaltevuus, joka on jyrkempi kuin 1:48 esteettömillä paikoilla, näkyy ongelmana. **Nämä luvut on kirjoitettu standardista muistin mukaan, eikä niitä ole tarkistettu painetusta standardista.** Tavalliset paikka- ja ajoväylämitat tulevat pysäköintisuunnitteluoppaista, ja nekin ovat tarkistamatta. Tarkista molemmat sekä paikalliset määräykset, ennen kuin luotat niihin. Valitse **Mukautettu**, jos haluat syöttää oman esteettömien paikkojen määrän.

## Kaltevuudet kuivatuskaivoihin, leikkaus ja täyttö

Ellet kytke sitä pois, alue muuttuu tasausalueeksi Maisema-työtilassa. Sadevesikaivot sijoitetaan ajoväylien keskiviivoille noin 100 feetin (30 m) välein. Pinta nousee jokaisesta kaivosta antamasi kaltevuuden mukaan (aluksi 1.5 prosenttia), joten jokainen piste laskee lähimpään kaivoon. Korkotaso valitaan niin, että alueen leikkaus ja täyttö tasapainottuvat nykyisessä maanpinnassa. Nykyinen maanpinta on projektin olemassa oleva pinta. Se voi tulla mittauspisteistä, LandXML-tiedostosta, lidar- tai skannauksen pistepilvestä muunnettuna pinnaksi tai korkeuskäyristä. Ikkuna näyttää leikkauksen ja täytön arvion, ja projektin omat tilavuudet antavat tarkan luvun myöhemmin. Tasausalue pitää reunansa nykyisessä maanpinnassa. Jos uusi pinta eroaa reunan maanpinnasta, syntyy porras, ja ikkuna kertoo sen koon.

## Päällyste ja istutus

Koko rajaus saa kivipäällysteen (limityskuvio, jota voi muuttaa kohdasta Maisema, Kovat pinnat). Jokainen saareke saa pensasistutuksen ja, jos se on tarpeeksi leveä, puun kasviluettelosta. Kaikki on sen jälkeen tavallinen Maisema-kohde: muokkaa sitä tai valitse **Sijoita uudelleen**, jolloin alueen tekemät kohteet korvataan. Alueen poistaminen poistaa myös sen tekemät kohteet.

## Avustajalta

Samaa aluetta voi pyytää MCP:n kautta. `parking_layout` esikatselee, `parking_build` kirjoittaa ja `parking_remove` poistaa alueen. Pyydä tontin nimellä tai lähetä rajaus.

## Mitä ei ole vielä toteutettu

Ajoväylien yhteyttä kadulle ei tarkisteta. Päällyste kattaa koko rajauksen, joten sen pinta-alaan kuuluvat myös saarekkeet. Kirjaston päällystemateriaalit ja kirjaston tyyppi paikoille eivät ole toteutettuja. Päällystekuvio on Kovat pinnat -kuvio. Muiden maiden säännöt eivät ole toteutettuja.
