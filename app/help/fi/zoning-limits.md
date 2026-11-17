---
title: Tarkista massat kirjoittamiesi kaavamääräysten mukaan
summary: Kirjoita tontin rakennusetäisyydet riveittäin, korkeusrajoitus, taivasvalotaso, tehokkuusluku ja rakennusprosentti, näe rakennusala suunnitelmassa ja lue, mitkä massat rikkovat mitäkin rajaa.
keywords: kaavoitus, rakennusetäisyys, rakennusetäisyydet, etu, sivu, takana, rakennusala, rakennettava ala, korkeusrajoitus, taivasvalotaso, tehokkuusluku, FAR, rakennusprosentti, tontti, kiinteistö, kaavamääräys, määräystarkistus
from: 3e267b31
---

**CivilCraftiin ei ole sisäänrakennettu kaavoitusmääräyksiä.** Se ei tunne minkään kaupungin sääntöjä eikä toimita niiden kirjastoa. Jokainen tällä sivulla oleva luku on sinun kirjoittamasi, omasta kaavamääräyksestäsi otettu, ja jokainen tulos kertoo, että se on mitattu kirjoittamiasi rajoja vastaan. Se on tapa nähdä, miten tontin rajat muokkaavat rakennusta, eikä päätös siitä, onko suunnitelma sallittu.

## Kirjoita rajat

Ominaisuuksissa, kohdassa **Rakennusmassat**, valitse **Tontti** (tai valitse massa: sen tontin rajat näkyvät sen alla). Täytä sitten sovellettavat kentät; jätä ruutu tyhjäksi, jos rajaa ei ole:

- **Katulinja**: tontin raja kadun puolella. **Etuetäisyys** koskee sitä, **takaetäisyys** kaikkein vastakkaisinta linjaa ja **sivuetäisyys** muita.
- **Korkeusrajoitus**.
- **Taivasvalotaso**: se alkaa tontin rajalla tietystä korkeudesta ja nousee kirjoittamasi määrän jokaista sisäänpäin mentävää yksikköä kohti, mitattuna katulinjasta tai jokaisesta tontin rajasta (2 tarkoittaa 2:1). Pisteen päälle sallittu korkeus on tason ja korkeusrajoituksen pienempi.
- **Tehokkuusluku** (tontilla olevien massojen bruttokerrosala jaettuna tontin alalla) ja **Rakennusprosentti** (niiden pohjapinta-ala jaettuna tontin alalla, kirjoitettuna prosentteina).

## Rakennusala

Rastita **Näytä rakennusala suunnitelmassa** piirtääksesi sen tasolle `A-MASS-ENVL`. Rakennusala on tontti, josta jokaisen tontin rajan omalla etäisyydellä on otettu pois reunoja; siirretyt rajat kohtaavat viistoin kulmin. Kaarevasta tontin rajasta otetaan lyhyitä jänteitä, jotka pysyvät 0.01 etäisyydellä kaaresta. Sekä kuperat että koverat tontit käyvät. Jos etäisyydet menevät päällekkäin (syvä etäisyys kapealla tai hyvin koveralla tontilla), rakennusalaa ei ole, ja Ominaisuudet kertoo sen; kokeile pienempiä etäisyyksiä.

## Tulos

Laatikoiden alla jokaiselle massalle ja jokaiselle rajalle on oma rivi, jossa on rasti tai risti:

- **rakennusetäisyydet**: massan ala, joka jää rakennusalan ulkopuolelle;
- **korkeus**: massan korkeus verrattuna suurimpaan sallittuun sen pohjapinnan päällä (yhtä korkea prisma rajoittuu alimman sallitun korkeuden mukaan mistä tahansa sen kulmasta);
- **tehokkuusluku** ja **rakennusprosentti**: kaikki tontilla olevat massat yhteenlaskettuina.
