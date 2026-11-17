---
title: Laadi vaakasuuntainen linjaus
summary: Piirrä linjaus sen PI-pisteiden avulla, aseta kaarien säteet ja alkupaalu, siirrä PI-pisteitä ja lue kaaritiedot sekä paalu ja siirtymä.
keywords: linjaus, ei ratkaisua, kaari ei mahdu, suurin säde, pienin säde, vähimmäissäde, suunnittelunopeus, päällekkäisyys, keskilinja, pi, vaakakaari, säde, paaluitus, tangentti, luo linjaus, linjauksen laadinta, pc, pt, paalu siirtymä
from: 8c5df4aa
---

Linjaus CivilCraftissa on tangenttiketju taitepisteiden (PI) kautta, ja jokaisessa sisäisessä PI:ssä, jolla on säde, on ympyräkaari. Se on paalutettu alkupaalusta, jonka valitset. Projektissa voi olla monta linjausta.

## Piirrä linjaus

1. Paina {{key:A}} tai napsauta {{ui:Alignment}}-painiketta (Linjaus) **Suunnittelu**-ryhmässä.
   Vihje kuuluu: ”Linjaus: napsauta PI-pisteitä järjestyksessä. Enter tai kaksoisnapsautus lopettaa, Backspace poistaa viimeisen, Esc peruuttaa.”
2. Napsauta ensimmäistä PI-pistettä (linjauksen alkua).
3. Napsauta jokaista seuraavaa PI-pistettä järjestyksessä. Punainen viiva seuraa osoitinta ja näyttää piirtämäsi tangentin pituuden ja suunnan, esimerkiksi ”212.40 ft  N 63°12'05" E”.
4. Napsauta viimeistä PI-pistettä (linjauksen loppua).
5. Paina {{key:Enter}}.
   Linjaus piirtyy paaluituksineen ja on valittuna. Tilarivi kertoo esimerkiksi: ”Linjaus 1: 386.36 ft, kaaret 100 ft säteellä missä ne mahtuvat. Muokkaa säteitä Ominaisuuksissa; Pituusleikkaus (R) suunnittelee sen kaltevuuden.”

Piirtäessä: {{key:Backspace}} poistaa viimeisen PI-pisteen, {{key:Esc}} peruuttaa, ja vetäminen tyhjään kohtaan panoroi näkymää lisäämättä PI-pistettä.

:::warning
Lopeta {{key:Enter}}-näppäimellä. Kaksoisnapsautus lopettaa myös, mutta tässä versiossa se pudottaa kaksoisnapsautetun PI-pisteen. Napsauta viimeistä PI-pistettä kerran ja paina sitten {{key:Enter}}.
:::

Jokaiselle sisäiselle PI-pisteelle tulee 100 ft:n kaari (metrisessä projektissa 30 m), tai suurin kokonainen säde, joka mahtuu puolelle kumpaakin tangenttia, jos 100 ft ei mahdu. Hyvin terävät tai suoraan läpi kulkevat PI-pisteet eivät saa kaarta.

## Aseta säteet ja koordinaatit

Kun linjaus on valittuna, oikeassa paneelissa näkyy **Linjaus**:

1. **Nimi** ja **Alkupaalu**. Kirjoita paalu muodossa `10+00` (jalat) tai `0+500` (metrit), tai pelkkänä lukuna. Katso [Yksiköt, paalut ja lukumuodot](topic:units-and-stations).
2. **Pituus** ja **Loppupaalu** lasketaan puolestasi.
3. **PI-pisteet**-taulukko listaa jokaisen PI-pisteen **Itä**- ja **Pohjoinen**-koordinaatit sekä **Säteen** jokaiselle sisäiselle PI-pisteelle. Kirjoita uusi arvo ja paina {{key:Enter}}.
   - Säde 0 tekee kulmapisteen ilman kaarta.
   - Ensimmäisellä ja viimeisellä PI-pisteellä ei ole koskaan sädettä.
   - Rivin lopussa oleva pieni x poistaa sen PI-pisteen (linjauksessa on vähintään kaksi).
4. Lue **Kaaret**-luettelo: jokaiselle kaarelle sen PC- ja PT-paalut, säde R, taitekulma Δ ja suunta (vasen tai oikea), pituus L, tangentti T, ulkoetäisyys E ja jänne.
5. Kaarten alla oleva rivi antaa ensimmäisen tangentin suunnan.

## Kun kaari ei mahdu

Jos kaaret tarvitsevat enemmän tangenttia kuin PI-pisteiden välissä on, linjauksella ei ole ratkaisua: sitä ei piirretä oikein ennen kuin korjaat sen, ja se jätetään pois LandXML-vienneistä. Punainen laatikko kertoo syyn luvuin ja tarjoaa, mikä mahtuisi:

- ”Kaaret PI 2:ssa ja PI 3:ssa tarvitsevat keskenään 240.00 ft tangenttia (130.00 + 110.00), mutta PI-pisteet ovat 180.00 ft päässä toisistaan.” Tai jos vain toisella on kaari: ”Kaari PI 2:ssa tarvitsee 240.00 ft tangenttia kohti PI 1:tä …”.
- Jokaisen PI-pisteen painike asettaa **suurimman mahtuvan säteen** siihen, kun toinen kaari pidetään ennallaan (sen täytyy mahtua myös PI-pisteen toiseen tangenttiin). Kun molemmilla PI-pisteillä on kaari, **Molemmat** kutistaa molempia sädettä suhteessa toisiinsa, juuri niin että ne kohtaavat.
- Kun yksi kaari on yksinään tangenttia pidempi, laatikko kertoo, ettei toisessa PI-pisteessä voi olla kaarta, kun kaari on näin suuri.
- PI-piste, joka kääntyy suoraan takaisin, ei voi saada kaarta; laatikko tarjoaa **Ei kaarta PI n:ssä**.

Jokainen painike on yksi askel: {{key:Mod+Z}} palauttaa säteet. Tarjotut säteet pyöristetään alaspäin 0.01:een, jotta ne aina mahtuvat.

### Suunnittelun vähimmäissäde

Kirjoita **Suunnittelun vähimmäissäde** (esimerkiksi suunnittelunopeutesi perusteella), niin jokainen kaari tarkistetaan sitä vasten; jätä tyhjäksi, jos vähimmäissädettä ei tarvita. Vähimmäissädettä pienempi kaari listataan painikkeella **Pienin säde, joka täyttää vähimmäisvaatimuksen**, kun se mahtuu. Kun se ei mahdu, laatikko kertoo sen ja antaa suurimman säteen, minkä tangentit sallivat, jotta tiedät siirtää PI-pistettä tai laskea vähimmäisvaatimusta.

## Siirrä PI-pisteitä suunnitelmalla

1. Kun {{ui:Select}} (Valitse) on aktiivinen, napsauta linjausta valitaksesi sen. Sen PI-pisteisiin ilmestyy neliömäiset otteet.
2. Vedä otetta. Linjaus, sen paaluitus, pituusleikkaus ja käytävä seuraavat.
3. Vapauta. Siirto on yksi kumottava askel.

PI-pisteen lisääminen kahden olemassa olevan väliin ei ole vielä käytettävissä: poista linjaus ja piirrä se uudelleen tai kirjoita olemassa olevien PI-pisteiden uudet koordinaatit.

## Lue paalu ja siirtymä

Vie osoitin suunnitelman päälle. Tilarivi näyttää lähimmän linjauksen (tai valitun) paalun ja siirtymän, **V** tai **O** katsottaessa kohti kasvavaa paalua, esimerkiksi ”Linjaus 1: Paalu 2+15.30, siirtymä 18.42 O”. Päiden ulkopuolella lisätään ”(päätyjen ulkopuolella)”.

## Mitä piirretään

Suunnitelmalle, DXF:ään ja PDF:ään: keskilinja (tangentit viivoina, kaaret todellisina kaarina), merkki joka 50 ft:n (20 m:n) välein, pidempi merkki ja paaluteksti joka 100 yksikön välein sekä PC- ja PT-merkit paaluineen.

## Poista linjaus

Valitse se ja paina {{key:Delete}}, tai napsauta {{ui:Delete}}-painiketta (Poista) työkalurivillä tai oikean paneelin alareunassa. Sen profiili ja käytävä lähtevät mukana. {{key:Mod+Z}} palauttaa sen.

:::mac
Macin näppäimistöllä näppäin, jossa lukee **delete**, on selaimessa {{key:Backspace}} eikä poista valintaa. Paina {{key:Delete}} (Fn ja delete) tai käytä {{ui:Delete}}-painiketta.
:::

## Seuraava

- [Suunnittele pystyprofiili](topic:profile).

## Suunnittelunopeus ja luokka

Linjauksen Ominaisuuksissa **Suunnittelunopeus** (km/h tai mph) ja **Suunnitteluluokka** säilyvät linjauksen yhteydessä, tallentuvat projektiin ja kirjoitetaan IFC:hen (Pset_RoadDesignCriteriaCommon). CivilCraftissa ei ole taulukkoa, joka yhdistäisi nopeuden vähimmäissäteeseen, joten niistä ei tarkisteta mitään: aseta **Vähimmäissäde** omasta suunnittelustandardistasi.

## Siirtymäkaaret

Kaaressa voi olla klotoidisiirtymäkaari kumpaankin päähän: tangentti, siirtymäkaari, kaari, siirtymäkaari, tangentti. PI-taulukossa kirjoita pituus kenttiin **Siirtymä sisään** ja **Siirtymä ulos** PI-pisteelle, jolla on säde. PI-piste pysyy paikallaan; kaari siirtyy sisään tilaa varten, joten tangentin etäisyys kasvaa siirtymän verran. Kaksi pituutta voivat erota, ja PI-piste, jolla on vain yksi pituus, saa siirtymän vain sille puolelle.

Kaarilistassa lukee nyt TS, SC, CS ja ST (tangentti–siirtymä, siirtymä–kaari, kaari–siirtymä, siirtymä–tangentti) siirtymäkulmineen θs, tangenttietäisyyksineen ja ulkoetäisyyksineen. Paalut kulkevat siirtymäkaarien läpi kuten muualla. Siirtymäkaaret, jotka yhdessä kääntävät enemmän kuin kaari, hylätään ja PI-piste nimetään; liian pitkä siirtymäkaari on päällekkäisyys, kuten mikä tahansa kaari. Ylikorotus käyttää siirtymäkaarta kallistuksen muutosvälinä (katso [Käytävä](topic:corridor)).
