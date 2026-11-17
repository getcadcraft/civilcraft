---
title: Piirrä rakennusmassat kohteelle
summary: Piirrä rakennusmassa tontille, anna sille kerrokset ja kerroskorkeus, katso sen bruttokerrosala, valitse miten se istuu rinteeseen, työnnä ja vedä sen korkeutta 3D:ssä ja lähetä se BimCraftiin tai tallenna IFC-tiedostona.
keywords: massa, massoittelu, rakennusmassa, tilavuus, pohjapiirros, kerrokset, kerroskorkeus, bruttokerrosala, gfa, rinne, sokkeli, leikkaus ja täyttö, työnnä vedä, 3d, kohdetutkimus, varhainen suunnittelu, ifc, kehitä, bimcraft, a-mass
from: e5a67c16
---

Rakennusmassa on pohjapiirros, kerrosmäärä ja kerroskorkeus: varhainen kysymys siitä, kuinka paljon rakennusta tähän mahtuu ja mitä se tekee maanpinnalle. Massat sijoittuvat suunnitelmalle nimensä, kerrosmääränsä ja bruttokerrosalansa kanssa, menevät PDF-tulosteeseen sekä DWG- ja DXF-vientiin tasoille `A-MASS` ja `A-MASS-TEXT`, ja ne tallentuvat projektitiedostoon.

## Piirrä massa

1. Kohdassa **Ominaisuudet**, kohdassa **Rakennusmassat**, napsauta **Piirrä massa**. (Se on myös työkalurivin **Lisää**-valikossa **Maastomalli**-painikkeen vieressä.)
2. Napsauta pohjapiirroksen kulmia. Napsautus lähellä tontin kulmaa tai mittauspistettä ottaa sen pisteen tarkan paikan.
3. Napsauta ensimmäistä kulmaa uudelleen tai paina {{key:Enter}} lopettaaksesi. {{key:Backspace}} ottaa takaisin viimeisen kulman; {{key:Esc}} pysäyttää.

Uusi massa on kolmikerroksinen ja sen kerroskorkeus on 12 ft (3.6 m). Se kuuluu tontille, johon sen keskikohta osuu.

## Kerrokset, korkeus ja ala

Napsauta massaa vaihtaaksesi sen **Nimen**, **Käytön**, **Kerrosten**, **Kerroskorkeuden** ja **Tontin**. **Korkeus** on kerrokset kertaa kerroskorkeus: kirjoita korkeus, niin kerrosmäärä muuttuu lähimpään kokonaiseen kerrosmäärään (vähintään yksi). **Pohjapiirros** ja **Bruttokerrosala** (pohjapiirros kertaa kerrokset) lasketaan puolestasi.

## Rinteessä

Massan alla oleva maanpinta luetaan maastomallista: nykyinen maanpinta tai tasattu maanpinta, jos valitsit **Suunniteltu maanpinta (tasattu)**. **Rinteessä** kertoo, mihin alakerran lattia sijoitetaan:

- **Porrastettu**: massan alla olevan keskimääräisen maanpinnan tasolle. Matala puoli täytetään siihen asti ja korkea puoli leikataan, ja ne lähes tasapainottuvat.
- **Sokkeli**: korkeimman maanpinnan tasolle. Kiinteä sokkeli täyttää matalan puolen.
- **Leikkaus**: matalimman maanpinnan tasolle. Korkea puoli leikataan pois mäkeen.

Ominaisuudet näyttää massan alla olevan maanpinnan vaihteluvälin, **Alakerran tason** sekä täytön ja leikkauksen tilavuuden maanpinnan ja tuon tason välillä. Pohjapiirroksen kohdat, jotka ovat maastomallin ulkopuolella, jätetään pois, ja Ominaisuudet kertoo kuinka monta.

## 3D-näkymässä

Massat piirretään 3D-tilanäkymään, jossa jokaisen kerroksen ympärillä on viiva ja nimet katon yläpuolella. **Näytä**-kohdassa on valintaruutu **Rakennusmassat**. Napsauta massaa valitaksesi sen. Kun massa on valittu:

- vedä sen kattoa ylös tai alas työntääksesi tai vetääksesi sitä kerros kerrallaan, tai paina {{key:PageUp}} ja {{key:PageDown}};
- koko siirto on yksi kumottava askel.

**Aja**-tilan katunäkymä näkee massatkin, ja **Aurinko** heittää niiden varjot maanpinnalle.

## Lähetä eteenpäin

- **Massat IFC:nä** tallentaa jokaisen massan IFC4-tiedostona: alueen, rakennuksen kerroksineen ja massan rakennusosana, jonka luvut ovat ominaisuusjoukossa `CadCraft_SiteMass`. Kun projektille on asetettu koordinaatistojärjestelmä, tiedosto sijoitetaan karttaan ja sisältää kohteen leveys- ja pituuspiirin; ilman sitä se ei kerro, missä kohde on.
- **Kehitä BimCraftissa** avaa BimCraftin uudessa välilehdessä massojen kanssa. Siellä massan valitseminen näyttää sen luvut ja painikkeen **Kehitä tämä massa**, joka rakentaa seinät jokaiselle tasolle ja lattian rakennuksen alle pohjapiirroksesta yhdellä kumottavalla askeleella. Mitään ei lähetetä: tiedosto kulkee tämän selaimen kahden välilehden välillä.

Katso myös **Kaavoitusrajat** ja **Auringon tunnit**.
