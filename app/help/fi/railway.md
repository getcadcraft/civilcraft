---
title: Rautatieradan suunnittelu
summary: Tee linjauksesta rautatie: siirtymäkaaret (klotoidi, kuutioparabeli, Bloss, Helmert, siniaallon puolijakso, sini), kunkin kaaren ylikorotus tasapainoylikorotuksineen, ylikorotusvaje ja -ylitys, ylikorotuksen ja radan geometrian rajat varoituksina, vaihteet ja ristikytkennät paalun mukaan, linjaa pitkin pyyhkäistävä vapaatilan rajaus sekä rata kiskoineen, pölkkyineen ja ballastikerroksineen käytävänä pohjakuvassa, leikkauksissa, pituusleikkauksessa, 3D-näkymässä ja määrissä.
keywords: rautatie, rata, raide, juna, metro, raitiotie, ylikorotus, ylikorotusvaje, ylikorotusylitys, tasapainoylikorotus, siirtymä, siirtymäkaari, klotoidi, kuutioparabeli, Bloss, Helmert, siniaallon puolijakso, kosini, raideleveys, normaaliraideleveys, leveä raideleveys, metriraide, kapearaide, ratapölkky, pölkky, ballasti, alaballasti, ratapohja, reunaosa, raiteiden keskiväli, 60E1, 54E1, UIC60, 115RE, 136RE, ylikorotuksen kaltevuus, ylikorotuksen muutosnopeus, vaihde, kielekkeet, ristikytkentä, sydän, sydänluku, johtoväli, sulkukaari, haaran nopeus, vapaatila, vapaatilan rajaus, rakennusrajoite, kinemaattinen rajaus, laituri, laiturivälys, kaltevuus, pystykaari, vähimmäissäde, LandXML-ylikorotus
from: 99de9745
---

Mikä tahansa linjaus voi olla rautatieraide. Sen kaarteet saavat silloin siirtymät ja ylikorotuksen (kiskojen ylikorotus), ja sen käytävä rakennetaan radaksi: kiskot pölkyillä ballastikerroksen päällä, tasattuna maahan kuten tie. Vaihteet ja ristikytkennät sijoitetaan paalun mukaan, ja vapaatilan rajaus voidaan pyyhkäistä pitkin linjaa ja tarkistaa radan vieressä olevia kohteita vastaan.

Jokainen alla oleva luku on **paikkamerkki**, ei standardi. Rautatiet asettavat rajansa linjanopeuden, radantyypin ja maan mukaan; aseta ne oman rautatiesi standardista. CivilCraft ei sisällä kansallista taulukkoa.

## Tee linjauksesta rautatie

1. Valitse linjaus ja etsi **Rautatie** Ominaisuudet-paneelista.
2. Rastita **Tämä linjaus on rautatieraide**. Jokainen muutos on yksi kumoamisvaihe.
3. Aseta **Suunnittelunopeus** linjauksen Ominaisuudet-paneelin yläosassa: se on linjanopeus, jota ylikorotusta verrataan. **Hitaimmat junat** (Rautatie-osiossa) on nopeus, jota ylikorotusylitystä verrataan.

## Siirtymät

Anna kullekin kaarteelle siirtymäpituus kummassakin päässä PI-taulukossa (**Siirtymä sisään**, **Siirtymä ulos**), valitse sitten sen tyyppi Rautatie-osion kaaritaulukosta tai valitse **Siirtymä jokaiselle kaarteelle**:

| Tyyppi | Kaarevuus siirtymässä |
|---|---|
| Klotoidi | kasvaa tasaisesti (tien siirtymäkaari) |
| Kuutioparabeli | y = x³ / (6·R·L), L mitattuna tangentilla; itse kaari on hieman pidempi |
| Bloss | 3u² − 2u³ täydestä kaarevuudesta (u = osuus pituudesta): alkaa ja päättyy pehmeästi |
| Helmert | kaksi paraabelia, ensin 2u² ja sitten 1 − 2(1 − u)² |
| Siniaallon puolijakso | (1 − cos πu) / 2 |
| Sini | u − sin(2πu) / 2π |

Kaikki paitsi kuutioparabeli kääntyvät kulman L / 2R verran, kuten klotoidi. Paalut kulkevat todellista pituutta pitkin. LandXML säilyttää tyypin (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Ylikorotus

Kirjoita kunkin kaarteen **Ylikorotus** millimetreinä. Taulukko näyttää kullekin kaarteelle:

- **Tasapainoylikorotus** = G·v² / (g·R), G on kiskojen keskiväli (**Kiskojen keskiväli**, eli raideleveys plus kiskon pääleveys, ellet kirjoita sitä itse). Kun G = 1500 mm, tämä on tuttu 11.8·V² / R (V km/h, R m).
- **Ylikorotusvaje** = tasapainoylikorotus linjanopeudella − käytetty ylikorotus.
- **Ylikorotusylitys** = käytetty ylikorotus − tasapainoylikorotus hitaimpien junien nopeudella.
- **Nousu**: ylikorotuksen suurin kaltevuus nousuissaan, mm metriltä.

Ylikorotus nousee jokaisen siirtymän yli muotoutuen kuten sen kaarevuus: suorana klotoidille tai kuutioparabelille, Bloss-muotoisena Blossille ja niin edelleen. Kaaren päässä ilman siirtymää ylikorotus nousee edeltävällä suoralla niin pitkälle kuin ylikorotuksen kaltevuusraja vaatii, ja järjestelmä kertoo siitä: ylikorotus muuttuu silloin siellä, missä kaarevuus ei muutu.

**Ylikorotus kiertyy** kertoo, mikä kisko pysyy suunnitelluilla linjoilla: **alempi kisko** (tavallinen), **sisempi kisko** tai **radan keskilinja** (kumpikin kisko liikkuu puolet ylikorotuksesta). Suunniteltu pinta on siinä kiskon yläpinta.

**Ylikorotuskaavio** piirtää kunkin kiskon korkeuden pituusleikkauksen yli paalujen mukaan. Pituusleikkausnäkymä sekä pohjakuva- ja pituusleikkausarkit saavat saman nauhana pituusleikkauksen alle.

## Ylikorotuksen rajat ja varoitukset

**Suurin käytetty ylikorotus**, **Suurin ylikorotusvaje**, **Suurin ylikorotusylitys**, **Jyrkin ylikorotuksen kaltevuus** ja **Nopein ylikorotuksen muutos** (kaltevuus linjanopeudella, mm/s) tarkistetaan jokaisella kaarteella. Rajan ylittävä arvo on varoitus Rautatie-osiossa ja Ongelmat-paneelissa, ja siinä näkyvät raja ja löydetty arvo. Ilman suunnittelunopeutta vajetta ja muutosnopeutta ei tarkisteta (huomautus kertoo niin).

## Rata

Aseta **Raideleveys** (normaali 1435 mm, leveä, metri- tai kapea esiasetus, tai oma), **Kiskoprofiili** (60E1, 54E1, 49E1, 115RE, 136RE: vain niiden julkaistut mitat), **Raiteet**-määrä ja **Raiteiden keskiväli**. Aseta sitten **Pölkyt ja ballasti**: pölkkyjen materiaali, pituus, leveys, paksuus ja väli; ballastin paksuus pölkyn alla (alemman kiskon kohdalla), olkapää, luiska ja kuinka paljon sen yläpinta on pölkkyjen alapuolella; alaballastin paksuus, reunaosa ballastin reunan takana ja ratapohjan poikittaiskaltevuus.

Paina **Rakenna rata**. Se kytkeytyy linjauksen käytävään, joka rakennetaan radaksi suunnitellun pituusleikkauksen mukaan: kiskot ja pölkyt kallistuvat ylikorotuksen mukaan, ratapohja ei. Leikkaus- ja täyttöluiskat lähtevät käytävän leikkauksessa ja täytössä reunaosan reunasta, ja rata tasautuu suunniteltuun pintaan kuten tie.

- **Pohjakuva**: molemmat kiskot jokaisesta radasta (taso C-RAIL-TRAK) ja useammalla raiteella kunkin raiteen keskilinja (C-RAIL-CNTR), näytöllä, DXF-, DWG- ja PDF-muodossa sekä pohjakuva- ja pituusleikkausarkeilla.
- **Leikkaukset**: pölkyt, kiskot sekä ballastin ja alaballastin alapinnat jokaisessa leikkauksessa.
- **3D**: kiskot, jokainen pölkky ja ballastikerros (Näytä › Rata), myös GLB-, OBJ- ja USD-muodossa.
- **Määrät**: radan pituus, kiskot (molemmat kiskot jokaisesta radasta, kunkin raiteen omaa linjaa pitkin), pölkyt, ballastikerros ja ballasti pölkyt pois lukien sekä alaballasti, keskimääräisillä pääpinta-aloilla leikkausten välillä.

## Radan geometrian tarkistukset

Ylikorotuksen lisäksi Rautatie-osio tarkistaa itse linjauksen kuutta muuta rajaa vastaan (kaikki paikkamerkkejä, kaikki sinun asetettavissasi):

- **Jyrkin kaltevuus** suunnitellussa pituusleikkauksessa, mm metriltä.
- **Pienin pystykaaren säde**, kertoimena k kaavassa R ≥ k·V² (R metreinä, V km/h). Pystykaari, jonka pituus on L kahden kaltevuuden välillä, on säteeltään L jaettuna kaltevuuden muutoksella.
- **Lyhin pystykaari**.
- **Pienin kaarevuussäde** pohjakuvassa (0 kytkee tarkistuksen pois).
- **Lyhin kaari tai suora**, sekunteina ajoaikana linjanopeudella: ympyrän kaari tai kahden kaarteen välinen suora, joka on lyhyempi kuin tuo matka, antaa varoituksen. 1.8 s on tuttu "puolet nopeudesta km/h, metreinä".
- **Ylikorotusvajeen muutosnopeus** kunkin siirtymän yli, mm/s linjanopeudella.

**Radan geometria** luettelee löydetyn suurimman kaltevuuden ja jokaisen pystykaaren säteineen sekä säteen, jota linjanopeus vaatii. Pystykaari, joka osuu siirtymään tai ylikorotusnousuun, saa huomautuksen. Ilman suunnittelupituusleikkausta tai suunnittelunopeutta tarkistukset, jotka niitä tarvitsevat, ohitetaan, ja huomautus kertoo niin.

## Vaihteet ja ristikytkennät

**Vaihteet ja ristikytkennät** -kohdassa paina **Lisää vaihde**. Vaihde sijoitetaan pisimmälle suoralle; aseta taulukossa:

- **Kielekkeen kärjen paalu**: missä vaihde alkaa tällä linjauksella.
- **Sydän**: sydänluku N (1:N). Sydämen kulma on 2·atan(1 / 2N).
- **Puoli**: vasen tai oikea, katsottuna paalun kasvusuuntaan.
- **Ristikytkennän väli** metreinä: kun se on yli 0, vaihde muuttuu ristikytkennäksi rinnakkaiselle raiteelle tuon välin päähän (kaksi vaihdetta ja niiden välinen suora).

Taulukko näyttää **Johtovälin** (kielekkeen kärjestä sydämeen), sulkukaaren **Säteen** ja **Haaran nopeuden**, jonka tuo säde sallii ylikorotusvajerajallasi ilman ylikorotusta. **Tee sen rata** muuttaa haaraireitin omaksi linjauksekseen (vaihde, sulkukaari, sitten suoraan sydämen kulmassa) samoilla rautatieasetuksilla, valmiina pidennettäväksi.

Pohjakuva piirtää kunkin vaihteen kaksi haarakiskoa, sen keskilinjan, merkin kielekkeen kärkeen ja sydämeen sekä "1:N" (taso C-RAIL-TURN), näytöllä sekä DXF-, DWG- ja PDF-muodossa ja arkeilla. 3D-näkymä piirtää haarakiskot pääradan tasolle.

Muoto on **paikkamerkki**: suora vaihde ja yksi sulkukaari sydänluvusta. Rakennettu vaihde seuraa rautatiesi standardia ja valmistajan piirustusta. Varoitukset: vaihde, joka ulottuu linjauksen ulkopuolelle, sijaitsee kaarteella, siirtymässä, ylikorotuksessa tai pystykaarella, tai menee päällekkäin toisen vaihteen kanssa. Huomautus annetaan, kun linjanopeus on suurempi kuin vaihteen haaran nopeus.

## Vapaatilan rajaus

Rastita **Pyyhkäise vapaatilan rajaus pitkin tätä rataa**. Valitse **Ääriviiva** (kaksi paikkamerkkimuotoa tai **Oma ääriviiva**, kirjoitettuna yksi piste riviä kohden: poikkeama radan keskilinjasta, sitten korkeus kiskon yläpinnan yläpuolella, metreinä), **Ajoneuvon pituus** ja **Telien keskiväli**. Jos sellainen on, valitse myös **Laiturin reuna** (puoli, etäisyys radan keskilinjasta, korkeus kiskosta).

Joka asemalla ääriviivaa kallistetaan ylikorotuksella matalamman kiskon ympäri ja levennetään kaarteen mukaan: ajoneuvon keskikohta siirtyy sisään b² / 8R verran ja sen päät ulos (L² − b²) / 8R verran (b telien keskiväli, L ajoneuvon pituus, R säde kohdassa, siirtymän mukaan). Rautatie-osio piirtää leikkauksen suoralla ja siinä, missä se on leveimmillään, ja luettelee:

- **leveimmän rajauksen** ja missä se on,
- **raiteiden keskivälit** verrattuna keskiväleihin, jotka kaksi naapurirajausta vaativat,
- **laiturin reunalle** jäävän tilan tai kuinka paljon rajaus on sen sisällä,
- jokaisen **vapaatilan sisälle** jäävän piirrelinjan, putkirakenteen ja muun rautatielinjauksen.

Korkeustiedoin varustettua piirrelinjaa verrataan ääriviivaan sen korkeudella kiskosta. Ilman suunnittelupituusleikkausta tai pisteelle, jolla ei ole korkeutta, sitä arvioidaan vain pohjakuvassa, ja luettelo kertoo niin. Pohjakuva näyttää rajauksen kaksi reunaa (taso C-RAIL-CLRN) ja ristin jokaisen sisällä olevan kohteen kohdalla.

Tarjotut ääriviivat ovat **paikkamerkkejä, eivät minkään rautatien rakennusrajoitetta**. Kirjoita oman rautatiesi rakennusrajoite ennen kuin luotat tulokseen.

## Muissa ohjelmissa

- **LandXML**: rautatielinjaus kirjoitetaan siirtymineen (spiType) ja `Cant`-osiolla: raideleveys, kiertopiste, linjanopeus sekä asema, jossa kukin ylikorotusnousu alkaa ja päättyy, käytettyine ylikorotuksineen, tasapainoylikorotuksineen ja vajeineen. Kun avaat LandXML-tiedoston, jossa on `Cant`-osio, siitä linjauksesta tulee rautatie näillä ylikorotuksilla.
- **IFC**: linjaus ylikorotussegmentteineen, kiskot, pölkyt, ballasti ja alaballasti.

## Ei vielä toteutettu

Vaihteet IFC-viennissä. Vaihdeperheet sulkukaaren ylittäen: kaarevat kielekkeet, heilurisydämet, kytkentäristeykset ja timanttiristeykset. Kinemaattiset rajasäännöt (rajaus on kiinteä ääriviiva kaarteen siirrolla). Ilmajohdot ja liikenteenohjaus.

**Mitä standardia.** Rautatie-osion ”Standard to cite” -kohdassa valitaan None tai European (UIC ja EN). Valinta European nimeää asiakirjat, joihin eurooppalainen hanke viittaa (EN 13803 linjausparametreille, EN 13232 vaihteille ja risteyksille, EN 15273 rakennusrajoitteille, EN 13848 radan geometrian laadulle), ja antaa kullekin rajalle ruudun, johon kirjoitetaan lauseke, josta se on peräisin. Mitään standardin lukua ei ole rakennettu sisään: ylikorotuksen, vajeen, ylityksen, kaltevuuden ja muutosnopeuden rajat, vaihteen geometria ja rakennusrajoite ovat yhä paikkamerkkejä, ja ikkuna sanoo niin. Rautatieinsinööri tarkistaa jokaisen arvon standardin omasta tekstistä ja kirjoittaa lausekkeen sen viereen ennen kuin mitään rakennetaan. Etelä-Afrikka ja AREMA-taulukot eivät kuulu tähän julkaisuun.
