---
title: Tasaa rakennusalusta
summary: Piirrä tasainen alusta, aseta sen korkeus sekä leikkaus- ja täyttöluiskat, ja anna CivilCraftin päivänvalottaa se maanpintaan ja lisätä suunniteltuun pintaan.
keywords: tukimuuri, tukimuurit, pystysivu, seinä luiskan sijaan, luiska sivuittain, penger, tasaus, alusta, rakennusalusta, päivänvalo, ominaisuuslinja, tasausryhmä, leikkausluiska, täyttöluiska, valmis maanpinta, suunniteltu pinta, sivutasaus
from: 482319a6
---

Alusta on tasainen alue yhdellä korkeudella. Sen reunasta CivilCraft tasaa ulospäin leikkausluiskallasi, jossa maanpinta on alustaa korkeammalla, ja täyttöluiskallasi, jossa se on matalampi, kunnes luiska kohtaa nykyisen maanpinnan. Tuo kohtaamislinja on päivänvalolinja. Alusta ja sen luiskat korvaavat nykyisen maanpinnan päivänvalolinjan sisäpuolella ja muodostavat suunnitellun pinnan.

## Piirrä alusta

Tarvitset ensin olemassa olevan maanpinnan.

1. Paina {{key:G}} tai napsauta **Suunnittelu**-ryhmän {{ui:Alusta}}-painiketta.
   Vihje sanoo: "Alusta: napsauta sen kulmat. Enter tai kaksoisnapsautus viimeistelee, Backspace poistaa viimeisen, Esc peruuttaa."
2. Napsauta alustan kulmia järjestyksessä, kumpaan suuntaan tahansa. Sininen ääriviiva seuraa osoitinta.
3. Paina {{key:Enter}} viimeisen kulman jälkeen (vähintään kolme).
   Alusta piirtyy ja valitaan. Se alkaa maanpinnan korkeudesta sen keskikohdalla, pyöristettynä 0.1:een, 2 : 1 leikkausluiskalla ja 3 : 1 täyttöluiskalla. Tilarivi kertoo esimerkiksi: "Alusta 1 korkeudella 254.3 (maanpinta sen keskellä), leikkaus 2:1, täyttö 3:1. Muuta niitä kohdassa Ominaisuudet."

:::warning
Viimeistele painamalla {{key:Enter}}. Kaksoisnapsautus myös viimeistelee, mutta tässä versiossa se poistaa kaksoisnapsautetun kulman. Napsauta viimeistä kulmaa kerran ja paina sitten {{key:Enter}}.
:::

Alustan ääriviiva ei saa leikata itseään: ”Alustan ääriviiva leikkaa itsensä.”

## Aseta korkeus ja luiskat

Kun alusta on valittu, oikea paneeli näyttää **Alusta**:

1. **Nimi**.
2. **Korkeus**: alustan tasainen korkeus.
3. **Leikkausluiska** ja **Täyttöluiska** muodossa H:V (2 tarkoittaa 2 : 1). Molempien on oltava suurempia kuin 0.
4. **Alustan pinta-ala** ja **Kulmat** näytetään viitteenä.

Paina {{key:Enter}} jokaisen arvon jälkeen. Päivänvalolinja, suunniteltu pinta ja tilavuudet päivittyvät heti.

Kenttien alla oleva rivi kertoo esimerkiksi: "Päivänvalolinja: 48 luiskalinjaa (20 leikkauksessa, 28 täytössä), kauimmainen 31.20 ft päässä." Suunnitelma piirtää päivänvalolinjan ja luiskalinjat magentalla.

## Miten päivänvalo löydetään

- Luiskalinjat lähtevät kustakin reunasta suorassa kulmassa, noin joka kahdeskymmenes alustan kokoa.
- Ulkokulmissa ne viuhkautuvat joka 10°, joten luiska kiertää kulman.
- Sisäkulmissa yksi linja kulkee puolittajaa pitkin, missä kahden reunan luiskat kohtaavat.
- Kukin linja nousee leikkausluiskalla tai laskeutuu täyttöluiskalla, kunnes se saavuttaa maanpinnan.

## Luiskat sivuittain ja tukimuurit

Kohdassa **Sivut ja tukimuurit** alustan, korokkeen tai penkereen ominaisuuksissa jokaista sivua voi tasata omalla tavallaan. Sivu 1 kulkee ensimmäisestä napsauttamastasi kulmasta toiseen, sivu 2 toisesta kolmanteen ja niin edelleen.

- **Kaikki sivut**: **Luiskattu** käyttää yllä olevia leikkaus- ja täyttöluiskia joka sivulla; **Pystysuora: tukimuurit** asettaa muurin joka sivulle.
- Sivuittain: **Yllä olevat luiskat**, **Oma luiska** (kirjoita sivulle leikkaus- ja täyttöluiska) tai **Pystysuora (tukimuuri)**.
- Kirjoita luiska muodossa `3` tai `3:1` (vaakasuoraan 1 pystysuoraan), `33%` tai `18.4°`; se näytetään muodossa H:1. Alustan omat **Leikkausluiska** ja **Täyttöluiska** hyväksyvät saman.
- Pystysuoralla sivulla ei ole penkkaa: tukimuuri kulkee reunaa pitkin alustasta alas olemassa olevaan maanpintaan (täytössä) tai maanpinnasta alas alustaan (leikkauksessa). **Seinän paksuus** (aluksi 0.3 m tai 1 ft) kertoo, kuinka paljon maanpinta askeltaa alustan reunasta olemassa olevaan maanpintaan. Leikkaus- ja täyttötilavuudet jättävät pois penkan, jota sivulla ei enää ole.
- Kun seinä kohtaa loivan sivun, luiska kiertää seinän pään; kaksi seinää kohtaavat viistosaumalla.
- Kenttien alla näkyvät seinien pituus, paljas pinta (korkeus × pituus), korkein ja keskimääräinen korkeus.

Suunnitelma piirtää kunkin seinän ulkopinnan lyhyin poikkiviivoin sekä sen korkeuden molemmista päistä ja korkeimmasta kohdasta (tukimuurien tasolla, joka menee myös DXF- ja DWG-tiedostoihin). 3D-näkymä näyttää seinät kiinteinä kappaleina (Näytä › Tukimuurit), ja GLB-, OBJ- ja USD-viennit sisältävät ne. Reunan poikki otetut leikkaukset näyttävät portaan.

**Varoitukset** (Ominaisuudet-kohdassa ja Ongelmat-paneelissa): seinä, joka on korkeampi kuin **Varoita, kun seinän korkeus ylittää** (aluksi 1.0 m tai 3.3 ft), saa viestin ”voi vaatia suunnitellun seinän tai luvan; tarkista paikalliset määräykset”. Kun kirjoitat **Jyrkin luiska, jossa maa pysyy**, mikä tahansa sivu, jonka leikkaus- tai täyttöluiska on jyrkempi, saa varoituksen. Ne ovat varoituksia: tasaus rakentuu silti. Jokainen muutos on yksi vaihe: {{key:Mod+Z}}.

## Siirrä kulmia

Valitse alusta ja vedä neliön muotoista otetta kulmassa. Jokainen veto on yksi kumoamisvaihe. Kulmien lisääminen tai poistaminen ei ole vielä käytettävissä: poista alusta ja piirrä se uudelleen.

## Kun tasaus ei onnistu

Punainen laatikko kohdassa **Maansiirto** nimeää alustan ja ongelman:

| Viesti | Mitä tehdä |
|---|---|
| ”3 luiskalinjaa menee pinnan ulkopuolelle ennen kuin ne kohtaavat sen: alusta on liian lähellä pinnan reunaa tai liian korkealla tai matalalla.” | Siirrä alustaa pinnan reunasta sisäänpäin tai tuo sen korkeus lähemmäs maanpintaa. |
| ”Päivänvalolinja leikkaa itsensä (alustan eri sivujen luiskat törmäävät toisiinsa). Muokkaa alustan muotoa tai vaihda luiskia.” | Tyypillistä kapeille tai L-muotoisille alustoille syvässä leikkauksessa tai korkeassa täytössä. Leventä alustaa, pienennä korkeuseroa tai jyrkennä luiskia. |
| ”Alustan ääriviiva leikkaa itsensä.” | Piirrä kulmat uudelleen järjestyksessä alustan ympäri. |

Ongelmallinen alusta jätetään suunnitellun pinnan ja tilavuuksien ulkopuolelle, kunnes se korjataan.

## Katso tulos

1. Aseta kohdassa **Näyttö** **Pinta**-asetukseksi {{ui:Suunniteltu (tasattu)}}.
   Korkeuskäyrät kulkevat nyt tasaisina alustan yli ja seuraavat luiskia päivänvalolinjaan asti.
2. Vie osoitin alustan päälle: tilarivi näyttää **Maanpinta**- ja **Tasattu**-korkeudet.
3. Lue leikkaus ja täyttö kohdasta **Maansiirto**; ks. [Maansiirron tilavuudet](topic:volumes).

Alustat tasataan käytävien jälkeen piirtämisjärjestyksessä. Myöhempi alusta korvaa kaiken aiemman oman päivänvalolinjansa sisäpuolella.

## Poista alusta

Valitse se ja paina {{key:Delete}} (Macissa Fn ja Delete) tai napsauta {{ui:Poista}}-painiketta.

## Ei vielä toteutettu

Alustat ovat tasaisia: vinoja alustoja, vaihtuvan kaltevuuden ominaisuuslinjoja, terasseja sekä tasausta etäisyys- tai korkeustavoitteeseen ei ole vielä saatavilla. Ks. [Ei vielä toteutettu](topic:not-built-yet).
