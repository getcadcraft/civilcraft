---
title: Voimalinjojen tarkistukset
summary: Mitä CivilCraft tarkistaa jokaisesta linjasta ja kaapelista aina ajan tasalla: selvitykset, välit, heilahdus, nosto, tukikuormat ja mitoitus, kiinnikkeet, ankkurit, perustukset, puuttuvat tiedot, liitännät, ylikuormat ja jännitehäviö.
keywords: tarkistukset, selvitys, maavara, este, risteys, vaihevälit, eristimen heilahdus, nosto, tukikuorma, nimelliskuorma, mitoitus, perustus, ankkuri, kiinnike, poikkipalkki, jännitehäviö, ylikuorma, puuttuvat tiedot, irti
from: e6a0da47
---

**Tarkistukset** kohdassa Voimalinjat-osio luettelee jokaisen ongelman: punaisella ne, jotka epäonnistuvat, ja keltaisella varoitukset. Napsauta yhtä, jolloin valitaan linja, tuki, kaapeli tai laite, jota se koskee. Epäonnistuneet tuet ja välit ympyröidään punaisella pohjakuvassa, kun työtila on auki.

:::warning
Suunnittelun apuväline: nämä ovat suunnittelusi tarkistuksia omia sääntöjäsi vastaan, eivät sertifiointia.
:::

## Selvitykset

Johtimen alin vaihe seurataan jokaista väliä pitkin jokaisessa kuormitustapauksessa. Sen alimman selvityksen maanpinnan yläpuolella on täytettävä linjan **selvityssääntö**. Kun väli ylittää **esteen** (piirretään kohdalla {{ui:Este}}: piste tai viiva, sen korkeus maanpinnasta ja oma selvityssääntö), esteen päällä oleva selvitys tarkistetaan samalla tavalla.

**Myös Maisema-työtilan maanpinnan yläpuolelle sijoittamat kohteet lasketaan mukaan.** Yksittäiset kasvit (latvus kypsässä leveydessään ja korkeudessaan), pensasaidat ja istutusalueet (niiden korkein laji) sekä seinät (niiden yläreuna) ovat linjan alla olevia esteitä, ilman että niitä piirretään uudelleen. Ne noudattavat kohdassa {{ui:Kuormitustapaukset ja rajat…}} asetettuja sääntöjä: **Maisemakasvit linjan alla** (esimerkkijoukoissa *Puut ja kasvit*, 3 m) ja **Maisemaseinät linjan alla** (*Rakennus*). Valitse **Ei tarkisteta**, jos haluat jättää ne pois. Selvitys mitataan suoraan ylöspäin kasvin tai seinän yläreunasta johtimeen siinä kohdassa, jossa väli sen ylittää. Etäisyyttä sivuttain linjan viereiseen latvukseen ei tarkisteta. Puun siirtäminen tai seinän korottaminen muuttaa tarkistuksia heti.

Selvityssäännöt ovat omiasi: avaa ne painikkeella **Säännöt…** minkä tahansa **selvityssäännön** vierestä (tai kohdasta {{ui:Kuormitustapaukset ja rajat…}}), jolloin voit lisätä, nimetä uudelleen, muuttaa tai poistaa niitä.

## Väli ja heilahdus

- **Vaadittu vaihevälys**: k·√(riippuma + eristimen pituus) + U/150, kuuman tapauksen riippumalla ja jännitteellä U kV:ssa (yleinen muoto; k on sääntöjoukkosi mukainen). Verrataan poikkipalkin vaihevälin kanssa.
- **Eristimen heilahdus** riipputuilla tuilla tuulitapauksessa: atan(poikkikuorma ÷ pystykuorma), verrattuna sääntöjoukon suurimpaan heilahdukseen.
- **Nosto**: riipputuki, joka on matalampi kuin naapurinsa, voi nousta kylmässä; se merkitään.

## Tukikuormat ja mitoitus

Jokaiselle tuelle ja kuormitustapaukselle kaikkien linjan johtimien kanssa:

- **Poikittainen**: tuuli metriä kohti × tuulivälli (puolet kahdesta välistä), lisättynä 2·H·sin(kääntökulman ÷ 2) käännöksessä.
- **Linjan suunnassa**: kahden puolen jännitysten erotus päätetuessa tai kulmassa; riipputuessa vain jäätyneenä toisella puolella (jokainen väli lasketaan erikseen, mikä jää varmalle puolelle).
- **Pystysuuntainen**: pystykuorma metriä kohti × painoväli (kahden puolen alimpien pisteiden välillä) lisättynä laitteiden kuormalla.

Vaakakuorma siirretään tuen nimelliskohtaan (vastaava kuorma = kuorma × kiinnityskorkeus ÷ nimelliskohdan korkeus) ja verrataan sen **nimelliskuormaan** × sääntöjoukon kerroin. Kun se on liian heikko, ehdotetaan kirjastostasi pienintä samasta materiaalista olevaa tukea, joka kestää sen. Tuki, jossa on **ankkuri**, siirtää vaakakuorman ankkurille. Ankkuri kantaa kuorman ÷ sin(ankkurin kulma) ja tarkistetaan omaa kestävyyttään vasten.

Kiinnikkeet (puristimet, eristimet, poikkipalkit) tarkistetaan nimelliskuormaansa vasten: ankkurointikiinnike kantaa johtimen jännityksen, riippukiinnike osuutensa pysty- ja poikittaiskuormasta. Näytetty **perustus** on tuen syvyys maassa ja kuoppa, joka on hieman leveämpi kuin sen jalka.

## Tiedot, liitännät ja virta

- Kohde, jonka tarvittava kenttä on tyhjä, tai avain, jota ei ole kirjastossa.
- Kaapelireitin pää tai laite, joka ei ole kytketty mihinkään.
- **Jännitehäviö** ja **virta** jokaisesta lähteestä (laite merkitty lähteeksi) kuormiin (kW ja tehokerroin laitteissa), ilmajohtovälien ja kaapelien pituudella: √3·I·L·(R cos φ + X sin φ), R 20 °C:ssa. Virta, joka ylittää kaapelin virrankeston, tai häviö, joka ylittää sääntöjoukon salliman, merkitään.
