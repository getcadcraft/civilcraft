---
title: Joen vedenpinnan profiilit
summary: Mallinna joki maanpinnasta ja laske vakaat vedenpinnan profiilit standardivaihemenetelmällä: vedenkorkeudet, energia, nopeudet, Froude-luvut ja tulva-alue pohjakuvassa. Laboratoriotoiminto; jokainen tulos vaatii insinöörin tarkistuksen.
keywords: pengerrys, tehoton virtausalue, leikkausmuokkain, joki, hydrauliikka, vedenpinnan profiili, patoutuma, standardivaihe, vakaa virtaus, 1D, poikkileikkaukset, Manning, karkeus, kuljetuskyky, kriittinen syvyys, normaali syvyys, Froude, energiaviiva, tulva-alue, tulvatasanko, tulviminen, uoman reunapisteet, osuuksien pituudet, supistuma, laajeneminen, alivirtaus, ylivirtaus, sekavirtaus, hydraulinen hyppy
from: fb8bf425
---

CivilCraft laskee vakaat, yksiulotteiset vedenpinnan profiilit joen suuntaisesti: jokaiselle antamallesi virtaamalle vedenkorkeuden jokaisessa poikkileikkauksessa, naapurileikkausten välisestä energiataseesta (standardivaihemenetelmä). Toiminto on laboratoriossa, kunnes se on tarkistettu.

**Vain suunnittelun apuna.** Vedenkorkeuksiin tulee insinöörin tarkistus ennen kuin niihin luotetaan: 1D-malli on yhtä hyvä kuin sen leikkaukset, karkeusarvot, osuuksien pituudet ja reunaehdot, eikä se tiedä silloista, rummuista tai joesta poistuvasta virtauksesta.

## Piirrä joki

1. Rakenna ensin nykyinen maanpinta (pisteet, taitelinjat tai avaamasi TIN).
2. Valitse **Maastomalli** › {{ui:Lisää}} -kohdasta {{ui:Joki}}.
3. Napsauta joen keskilinjaa **ylävirrasta alavirtaan** ja paina {{key:Enter}} tai kaksoisnapsauta.

CivilCraft leikkaa maanpinnasta kohtisuoran leikkauksen keskilinjaan 50 m (200 ft) välein, 100 m (300 ft) kumpaankin suuntaan. Joen paalut mitataan alavirran päästä, joten ne kasvavat ylävirtaan. Törmät arvataan aluksi 10 m (30 ft) kummallekin puolelle kunkin leikkauksen alimmasta pisteestä.

Kun joki kapenee tai rakenne sijaitsee kohdalla, valitse joki, napsauta {{ui:Lisää leikkaus}} ja piirrä leikkausviiva yli (kumpi tahansa suunta käy: se käännetään kulkemaan vasemmalta oikealle alavirtaan katsottaessa).

## Aseta joki

Valitse joki, niin näet sen **Ominaisuudet**-kohdassa:

- **Virtausmuoto**: alivirtaus (tavallinen: lasketaan ylävirtaan alavirran reunaehdosta), ylivirtaus (lasketaan alavirtaan ylävirran reunaehdosta) tai sekavirtaus (molemmat, sitten kummin tahansa suurempi ominaisvoima kussakin leikkauksessa; esikatselu).
- **Virtausprofiilit**: nimi ja virtaama kullekin (esimerkiksi 10 vuoden ja 100 vuoden virtaama) sekä reunaehto alavirran päässä (ja ylävirran päässä, kun muoto ei ole alivirtaus): **Normaali syvyys** energiakaltevuudella (pohjan kaltevuus on ensiarvio), **Tunnettu vedenpinta** -korkeus tai **Kriittinen syvyys**.
- **Leikkaukset maanpinnasta**: välimatka, etäisyys vasemmalle ja oikealle, törmäarvio sekä kaksi Manningin n-arvoa. {{ui:Leikkaa leikkaukset uudelleen}} korvaa leikkaukset (yksi kumoamisvaihe).
- **Leikkaustaulukko**: kullekin leikkaukselle vasemman ja oikean törmän siirtymät, uoman n ja ylävirtausalueen n, osuuksien pituudet seuraavaan alavirran leikkaukseen (vasen ylävirtausalue, uoma, oikea ylävirtausalue; mitattu pohjakuvasta alkaen) sekä supistuma- ja laajenemiskertoimet (aluksi 0.1 ja 0.3: asteittaiset siirtymät). {{ui:Muokkaa}} avaa leikkausmuokkaimen (seuraava kohta). Piste sen vieressä tarkoittaa, että leikkauksessa on pengerrys tai tehoton alue.

Jokainen muutos on yksi kumoamisvaihe ({{key:Mod+Z}}).

## Muokkaa leikkausta: törmät, pengerrykset ja tehottomat alueet

{{ui:Muokkaa}} leikkauksessa piirtää sen maanpinnan ja antaa vetää siitä ne kohdat, jotka ratkaisija lukee: **vasen ja oikea törmä** (ne jakavat leikkauksen vasemmaksi ylävirtausalueeksi, pääuomaksi ja oikeaksi ylävirtausalueeksi), **pengerrys** kummallakin puolella ja **tehottomat virtausalueet**. Jokaista kahvaa voi siirtää myös nuolinäppäimillä, ja jokaisen luvun voi kirjoittaa kuvaajan viereen. {{ui:Käytä}} on yksi kumoamisvaihe.

- **Pengerryksellä** on paikka (siirtymä) ja harjakorkeus. Maa pengerryksen takana, poispäin joesta, erotetaan joesta, kun vedenpinta on harjan alapuolella: sen pinta-ala, kostutettu kehä ja kuljetuskyky jätetään pois. Harjan yläpuolella koko leikkaus lasketaan taas mukaan. Pengerys seisoo suojaamansa törmän ulkopuolella; törmän sisäpuolella oleva merkitään.
- **Tehoton virtausalue** pidättää vettä, mutta ei kanna virtausta (lammikko patoluiskan takana, seisova vesi sillan lähestymisen vieressä). Anna sen kaksi siirtymää ja halutessasi vedenkorkeus, jonka alapuolella alue on tehoton ({{ui:aina}}, jos jätät tyhjäksi): tuon tason yläpuolella se virtaa kuten muu. Pääuomaa osittain peittävä alue merkitään.
- Kahden leikkauksen välillä tulva-alue jättää kuivaksi sen maan, joka on molempien leikkausten pengerryksen takana, kun vedenpinta siellä on harjan alapuolella (kahden harjan välinen viiva on suora).

## Laske ja lue tulokset

Napsauta {{ui:Vedenpinnan profiilit}}. Valitsemastasi profiilista saat:

- **kuvaajan** joen suuntaisesti (virtaus vasemmalta oikealle): uoman pohja, törmät, vedenpinta, energiaviiva ja kriittinen vedenpinta. Leikkaukset, joissa pidetään kriittinen syvyys, on ympyröity;
- **taulukon** kullekin leikkaukselle: joen paalu, virtaama, uoman pohja, vedenpinta, kriittinen vedenpinta, energiaviiva, syvyys, nopeus uomassa ja kokonaisuutena, uoman Froude-luku, virtausala, yläleveys, virtaama kummassakin ylävirtausalueessa ja uomassa, energiakaltevuus sekä varoitukset;
- **varoitukset** selkokielisinä, esimerkiksi leikkaus asetettu kriittiseen syvyyteen, vesi leikkauksen päiden yli tai suuri kuljetuskyvyn muutos kahden leikkauksen välillä (lisää leikkauksia väliin).

{{ui:Taulukko (CSV)}}, {{ui:Raportti}} (pelkkä teksti menetelmästä, reunaehdoista ja jokaisesta taulukosta) ja {{ui:Kuvaaja (SVG)}} tallentuvat lataustiedostoihisi. Jokaisessa on tarkistusrivi.

Rastita **Ominaisuudet**-kohdassa {{ui:Näytä tulva-alue}}, niin valitun profiilin märkä alue varjostetaan pohjakuvaan, ja vesiviiva piirretään siihen, missä syvyys on nolla. Leikkausten välissä vedenpinta on joen poikki tasainen ja muuttuu lineaarisesti joen paalun mukaan. Pengerryksen takainen maa jää kuivaksi, kun vesi on harjan alapuolella. Muu matala maa joen käytävän sisällä, johon vesi ei yllä (esimerkiksi tien patoluiskan takana), varjostetaan silti: tarkista se.

## Piirustuksessa ja Ongelmat-paneelissa

Joen viivat menevät pohjakuvaan, PDF:ään ja DWG:hen omilla tasoillaan: **C-WATR-CNTR** (keskilinja), **C-WATR-SCTN** (kukin leikkausviiva joen paalun kanssa) ja **C-WATR-FLOD** (tulva-alueen vesiviiva, kun {{ui:Näytä tulva-alue}} on rastitettu profiilille). Joen varoitukset (leikkaus kriittisessä syvyydessä, vesi leikkauksen päiden yli, kuljetuskyvyn muutos, joka vaatii lisää leikkauksia, energiatase, joka ei sulkeutunut, pengerys törmien sisäpuolella) menevät myös **Ongelmat**-paneeliin, joen kohdalle ja siihen leikkaukseen, josta ne tulevat.

## Miten lasketaan

- Energia kahden leikkauksen välillä: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Kuljetuskyky osittamalla: kukin ylävirtausalue jaetaan kohdista, joissa sen n muuttuu, K = Σ (1/n)·A·R^(2/3) (1.486/n USA-yksiköissä); uoma on yksi osa, yhdistetty n, kun sen n muuttuu. α saadaan kuljetuskyvyn jaosta.
- Kitkakaltevuus keskimääräisellä kuljetuskyvyllä, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², virtaamalla painotetulla osuuden pituudella.
- Supistumakerroin, kun virtaus kiihtyy alavirtaan, laajenemiskerroin, kun se hidastuu.
- Kriittinen syvyys = pienin ominaisenergia. Jokainen vedenkorkeus ratkaistaan välillä, joten se ei koskaan hyppää kriittisen väärälle puolelle; kun ratkaisua ei ole, se asetetaan kriittiseen syvyyteen ja merkitään.

Ohjelma on tarkistettu Manningin normaalisyvyyttä, suorakaiteen muotoisen uoman kriittistä syvyyttä ja Chow'n patoutumaesimerkkiä vastaan (*Open-Channel Hydraulics*, 1959, luku 10), joka on laskettu itsenäisesti. Sama menetelmä on yleisissä 1D-jokiohjelmissa, joten käsinlasku tai opiskelijan muistiinpanot sopivat tuloksiin.

## Rummut ja sillat

Joen **Ominaisuudet**-kohdassa, **Rummut ja sillat** -osiossa {{ui:Lisää rumpu}} tai {{ui:Lisää silta}} asettaa rakenteen kahden leikkauksen väliin (jokaisella osuudella on oltava vähintään kaksi leikkausta). Sen alapuolella oleva profiili ei muutu; rakenteen juuri yläpuolella oleva vedenpinta tulee rakenteesta, ja profiili jatkuu ylävirtaan siitä. **Tulokset** lisää taulukon kustakin rakenteesta: alavesi, ylävedenkorkeus, mikä ohjaus hallitsee, aukon läpi virtaava virtaama ja tien tai kannen yli virtaava virtaama. Vain alivirtaus.

- **Rumpu** (laatikko tai pyöreä, yksi tai useampi yhtä suuri putki). Sisääntulon ohjaus on patovirtausta, kun sisääntulo on vapaa, ja aukkovirtausta, kun se on upotettu; sekoitus tehdään ylävedenkorkeuden välillä, joka on yhdestä ja puolestatoista kertaa nousu. Ulosvirtauksen ohjaus on energiatase: sisäänmenohäviö, kitka ja poistonopeuskorkeus, yli korkeamman arvon alavesi tai kriittisen syvyyden keskikorkeus ja holvi, vähennettynä pudotuksella putken pituudella. Ylävesi on näistä suurempi. Rastita **Vesi voi tulvia tien yli**, niin tien patovirtaus jakaa virtaaman putkien kanssa.
- **Silta.** Aukko on siltaa alempi leikkaus, leikattuna tukipilareista, ja kukin tukipilari on alue, joka ei kanna virtausta. Aukon vedenpinta tulee alemmasta leikkauksesta (laajenemiskerroin), ja yläpuolinen leikkaus aukosta (supistumakerroin). Jos aukko ei päästä virtaamaa tuolla alavedellä, se virtaa kriittisessä syvyydessä ja silta merkitään tukkeutuvaksi. Jos vesi yltää alapinnalle, virtaus on paineellista (lukkotyyppinen, kun alavesi on alapinnan alapuolella, upotettu sen yläpuolella), ja kannen yli virtaava vesi lisää patovirtausta; ylävedenkorkeus on se, jolla nämä yhteensä antavat virtaaman.

Kertoimet (purkaus, sisäänmenohäviö, pato) ovat kirjoitettuja pyöreitä oletusarvoja. Vaihda ne omaan suunnitteluusi. Ne eivät ole sovitettuja kaavioita, joita rumpusuunnitteluohjeet painavat, joten pidä rummun ylävettä lähellä rajaansa arviona. Tien tai kannen yli virtaava vesi, upotettu sisäänmeno, tukkeutunut aukko ja nopea virtaus putkessa näkyvät **Ongelmat**-paneelissa.

## Epästationaarinen virtaus

{{ui:Epästationaarinen virtaus…}} joen **Ominaisuudet**-kohdassa ohjaa tulvahydrografin leikkausten läpi. Kirjoita sisäänvirtaus tunteina ja virtaamina, yksi pari riville, alavirran kaltevuus (normaali syvyys) ja kuinka kauan ajetaan. Se alkaa vakaasta vedenpinnasta ensimmäisellä virtaamalla ja ratkaisee täydet yksiulotteiset yhtälöt (implisiittinen nelipistemenetelmä, painotus 0.6 ajassa). Saat huippuvedenkorkeuden ja -virtaaman jokaisessa leikkauksessa tunteineen, kuvaajan kahden pään virtaamasta ja tilavuustarkistuksen (sisään, ulos ja varastoitu muutos). Malli tarkistetaan sen varalta, että vakaa virtaus pysyy vakaana, sisäänvirtauksen porras päättyy uuden virtaaman vakaaseen profiiliin, tilavuus sulkeutuu ja tulvan aallon nopeus vastaa kinemaattista aaltoa. Alivirtaus, yksi osuus, ei sivuvirtausta, eikä ajon sisällä rumpuja tai siltoja.

## Liittymät

Osuudet, jotka yhtyvät yhteen ulostuloon: virtaamat lasketaan yhteen, ja alavirran osuuden alun vedenpinta kuljetaan ylös niihin osuuksiin, jotka siihen yhtyvät (sama vedenpinta liittymässä, yksinkertainen menetelmä: ei kulmaa, ei liikemäärää, joten se sopii pieniin Froude-lukuihin). Malli ja testit ovat paikoillaan (`river-structures.js`); paneeli kahden joen yhdistämiseksi pohjakuvassa ei ole vielä toteutettu.

## Ei vielä toteutettu

Padot ja sulkuluukut omina rakenteinaan, paneeli liittymille, rakenteet epästationaarisen ajon sisällä ja ylivirtaus epästationaarisessa virtauksessa. Sekavirtausajo merkitsee hydraulisen hypyn kahden leikkauksen välille, mutta ei sijoita sitä.

**Missä joet yhtyvät.** Joen Ominaisuudet-kohdassa ”Virtaa joeen” nimeää joen, johon se yhtyy. Yhtyvät joet ratkaistaan yhdessä: joki, johon ne virtaavat, kantaa niiden virtaamien summan, ja jokainen niistä päättyy sen joen ensimmäisen leikkauksen vedenpintaan (yhtäsuuren vedenpinnan menetelmä; se jättää pois virtausten kulman ja liikemäärän). Yhdistääksesi pääjoen ja puron piirrä lyhyt joki liittymän alapuolelle ja anna molempien virrata siihen. Tulokset näyttävät liittymätaulukon. Näiden tulosten oletusarvot (supistuma 0.1, laajeneminen 0.3, yksiosainen uoma yhdistetyllä karkeudella, sekavirtaus ominaisvoiman mukaan) pysyvät, kunnes insinööri on tarkistanut ne, ja Tulokset kertoo sen.
