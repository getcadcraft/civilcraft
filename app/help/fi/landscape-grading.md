---
title: Maiseman tasaaminen
summary: Tasanteet, maavallit, laskuojat ja vapaa tasaus korkeuspisteillä ja korkeuskäyrillä, joita vedät, leikkaus ja penger elävinä, rinneanalyysi, virtausnuolet ja allas — kaikki CivilCraftin suunnitellussa pinnassa.
keywords: tukimuuri, tukimuurit, pystysuora sivu, seinä luiskan sijaan, luiska sivuittain, penger, maiseman tasaus, tasanne, terassi, alusta, maavalli, kumpu, laskuoja, korkeuspiste, korkeuskäyrät, muokkaa korkeuskäyriä, leikkaus ja penger, maanrakennus, rinneanalyysi, esteettömyys, jyrkät rinteet, virtausnuolet, kuivatus, allas, lätäkkö
from: e1559eb9
---

Kaikki tässä tasataan **suunniteltuun pintaan** samalla tasauksella kuin alustat ja käytävät. **Nykyistä maanpintaa** ei koskaan muuteta, ja Maanrakennus laskee sen kaiken. Tasaus-valikko on Maisema-ryhmässä.

## Tasanteet

{{ui:Tasaa}} › {{ui:Tasanne}}, napsauta kulmat ja paina {{key:Enter}}. Tasanne alkaa alla olevan maanpinnan keskikorkeudesta; kirjoita **Korkeus** asettaaksesi sen, tai tyhjennä kenttä, jotta se seuraa maanpintaa jälleen. **Kaltevuus** prosentteina ja **Kaltevuuden suunta** asteina (0 = itä, 90 = pohjoinen) kallistavat sitä. Sen reunat tasataan maanpintaan **Leikkausluiskalla** ja **Pengerluiskalla** (vaakasuoraan 1:ltä).

## Luiskat sivuittain ja tukimuurit

Maavallin, alustan tai tasanteen ominaisuuksissa kohdassa **Sivut ja tukimuurit** kukin sivu voidaan tasata omalla tavallaan. Sivu 1 kulkee ensimmäisestä napsauttamastasi kulmasta toiseen, sivu 2 toisesta kolmanteen, ja niin edelleen.

- **Kaikki sivut**: **Luiskattu** käyttää yllä olevia leikkaus- ja pengerluiskoja jokaisella sivulla; **Pystysuora: tukimuurit** asettaa seinän jokaiselle sivulle.
- Sivuittain: **Yllä olevat luiskat**, **Oma luiska** (kirjoita leikkaus- ja pengerluiska kyseiselle sivulle) tai **Pystysuora (tukimuuri)**.
- Kirjoita luiska muodossa `3` tai `3:1` (vaakasuoraan 1:ltä pystysuoraan), `33%` tai `18.4°`; se näytetään muodossa H:1. Alustan omat **Leikkausluiska** ja **Pengerluiska** hyväksyvät samat.
- Pystysuoralla sivulla ei ole penkereitä: tukimuuri kulkee reunaa pitkin alustasta alas nykyiseen maanpintaan (pengerryksessä) tai maanpinnasta alas alustaan (leikkauksessa). **Seinän paksuus** (oletuksena 0.3 m tai 1 ft) on se, kuinka paljon maanpinta askeltaa alustan reunasta nykyiseen maanpintaan. Leikkaus- ja pengertilavuudet jättävät pois penkereen, jota sivulla ei enää ole.
- Missä seinä kohtaa luiskan sivun, luiska kiertää seinän pään ympäri; kaksi seinää kohtaavat viistosaumalla.
- Kenttien alla: seinien pituus, näkyvä pinta (korkeus × pituus), korkein ja keskimääräinen korkeus.

Suunnitelma piirtää kunkin seinän ulkopinnan lyhyillä poikkiviivoilla ja sen korkeuden molemmissa päissä ja korkeimmassa kohdassa (tukimuurien tasolla, joka menee myös DXF- ja DWG-tiedostoihin). 3D-näkymä näyttää seinät kiinteinä kappaleina (Näytä › Tukimuurit), ja GLB-, OBJ- ja USD-viennit sisältävät ne. Reunan poikki otetut leikkaukset näyttävät askelman.

**Varoitukset** (Ominaisuuksissa ja Ongelmat-paneelissa): seinä, joka on korkeampi kuin **Varoita, kun seinän korkeus on yli** (oletuksena 1.0 m tai 3.3 ft), ”saattaa tarvita insinöörin suunnittelemaa seinää tai luvan; tarkista paikalliset säännöt”, ja kun kirjoitat **Jyrkin luiska, jonka maa kestää**, kaikki sivut, joiden leikkaus- tai pengerluiska on sitä jyrkempi. Ne ovat varoituksia: tasaus rakentuu silti. Jokainen muutos on yksi askel {{key:Mod+Z}}:lle.

## Maavallit

{{ui:Tasaa}} › {{ui:Maavalli}}: kumpu, jonka huippu on **Korkeus** keskimääräisen maanpinnan yläpuolella sen alla, ja sen sivut tasataan.

## Laskuojat

{{ui:Tasaa}} › {{ui:Laskuoja}}, napsauta laskuojaa pitkin **siihen suuntaan, johon vesi virtaa**, ja paina {{key:Enter}}. Aseta sen **Syvyys**, **Pohjan leveys** (0 V-muotoiselle) ja **Luiskan kaltevuus**. Ilman **Kaltevuutta** sen pohja seuraa maanpintaa, syvyys sen alapuolella, eikä se koskaan kulje ylämäkeen; kirjoita kaltevuus, jotta siitä tulee tasainen alusta.

## Korkeuspisteet ja korkeuskäyrät

1. {{ui:Tasaa}} › {{ui:Tasausalue}}: napsauta muotoiltavan alueen ääriviivaa.
2. {{ui:Tasaa}} › {{ui:Korkeuspiste}}: napsauta alueen sisältä. Kirjoita sen korkeus Ominaisuuksissa tai käytä ▲ ▼ -painikkeita.
3. {{ui:Tasaa}} › {{ui:Muokkaa korkeuskäyrää}}: napsauta alueen sisällä olevaa korkeuskäyrää ottaaksesi sen viivana, jota voi muotoilla uudelleen.

Valitse piste tai korkeuskäyrä ja **vedä** sitä (tai sen pisteitä) suunnitelmalla: pinta seuraa, kun päästät irti, yhtenä kumousaskelena. Alueen sisällä maanpinta rakentuu uudelleen sen reunasta (missä se kohtaa nykyisen maanpinnan), korkeuspisteistä ja muokatuista korkeuskäyristä.

## Leikkaus ja penger elävinä

Jokaisen tasausobjektin Ominaisuudet näyttävät sen **Leikkauksen** ja **Pengerryksen** sekä koko kohteen, Maanrakennuksen käyttämällä ruudukkomenetelmällä, aina kun muutat sitä. Ongelmat (pinnan ulkopuolella, ääriviiva, joka risteää itsensä kanssa) luetellaan siellä.

## Tasaustarkistukset

**Tasaustarkistukset**-osiossa vasemmalla:

- **Rinneanalyysi** värittää pinnan kaltevuuden mukaan: enintään loiven rajan, sen väliltä ja jyrkemmät kuin jyrkän rajan (oletuksena 5 % ja 33.3 %: tavallinen 1:20 esteettömille reiteille ja 1:3 niittoon). Selite kertoo, kuinka suuri osa alueesta kuuluu kuhunkin. Jyrkät alueet tulostuvat myös arkeille.
- **Virtausnuolet ja allas** piirtävät, mihin suuntaan vesi virtaa, ja merkitsevät jokaisen kohdan, jossa se kertyisi, syvyyksineen; osio kertoo, kuinka monta kohtaa on, syvin ja kuinka paljon vettä niissä on.

Tarkistukset lukevat suunniteltua pintaa, kun jotakin on tasattu, muuten nykyistä maanpintaa.
