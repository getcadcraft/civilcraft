---
title: Taitelinjat
summary: Piirrä 3D-viivoja, joita tasoitat kärkipiste kerrallaan, tee niistä porrasmaisia siirtymiä ja käytä niitä maanpinnan taitelinjoina tai suunnitelman kaltevina tasanteina.
keywords: kaari, käyrä, säde, 3D-kaari, kierukka, kaareva reunakivi, tasoituksen peitto, korkeuden peitto, tasoitusnuolet, taitelinja, tasoitus, kaltevuus, korkeus, porrasmainen siirtymä, siirtymä, reunakivi, oja, penger, kaltevuustasanne, maanpinnan liittymä, 3D-polyviiva
from: d55b25fb
---

Taitelinja on viiva, jolla on korkeus jokaisessa kärkipisteessä: reunakivi, ojan virtausviiva, pengerryksen yläreuna tai kaltevan tasanteen reuna. Asetat sen korkeudet luvulla tai kaltevuudella, kopioit sen sivulle askeleen verran ylös tai alas ja valitset, mitä pinnat sille tekevät.

## Piirrä yksi

1. Valitse **Maastomalli** › {{ui:Lisää}} › {{ui:Taitelinja}}, tai paina {{key:L}}.
2. Napsauta sen kärkipisteet pohjakuvassa. Napsautus mittauspisteen kohdalla ottaa pisteen paikan ja korkeuden; muualla kärkipiste saa nykyisen maanpinnan korkeuden siinä kohdassa.
3. Paina {{key:Enter}} lopettaaksesi avoimen viivan, tai napsauta ensimmäistä kärkipistettä uudelleen sulkeaksesi sen.

Uusi viiva on valittu ja alkaa taitelinjana nykyiselle maanpinnalle, maanpinnan tasossa.

## Kaaret

Segmentti voi olla pohjakuvassa kaari, jonka päät ovat eri korkeuksilla: reunakiven kaari, kaareva oja, kääntyvä luiska. Sen kaltevuus kulkee tasaisesti kaarta pitkin, ja sen pituus mitataan käyrää pitkin.

- **Piirtäessä:** paina {{key:C}} (kosketusnäytöllä {{ui:Kaari}} pohjakuvan yläpuolella olevassa palkissa) kaarien kytkemiseksi päälle. Kärkipisteen jälkeen napsauta kohtaa käyrällä ja sitten kohtaa, jossa kaari päättyy. Paina {{key:C}} uudelleen suoria segmenttejä varten. {{key:Backspace}} poistaa ensin käyrän pisteen.
- **Myöhemmin:** kohdassa **Ominaisuudet** kirjoita säde ja kääntymissuunta kärkipisteen **Kaari**-ruutuun, esimerkiksi `50 L` tai `50 R` (vasen tai oikea, kun kävelet viivaa pitkin), ja paina {{key:Enter}}. Tyhjennä ruutu tehdäksesi segmentistä taas suoran. Säde, joka on pienempi kuin puolet segmentistä, hylätään.

Valittu viiva näyttää kunkin kaaren säteen kaltevuuden vieressä. **Pituus** on kaarten pituus pohjakuvassa; **3D-pituus** laskee mukaan myös nousun ja laskun. Porrasmaiset siirtymät säilyttävät kaaret: mutkan ulkopuolella oleva kaari kasvaa, sisäpuolella oleva kutistuu, ja siirtymä, joka ylittää kaaren keskipisteen, hylätään.

Pinnat, 3D-näkymä sekä DXF ja DWG ottavat jokaisen kaaren lyhyinä suorina paloina, jotka pysyvät 0.01:n etäisyydellä käyrästä. LandXML säilyttää ne kaarina (katso alla **Kaaret muissa tiedostoissa**).

## Aseta korkeudet ja kaltevuudet

**Ominaisuudet** luettelee kärkipisteet niiden etäisyyden kanssa viivaa pitkin, niiden **Korkeus** ja **Kaltevuus seuraavaan** (prosentteina). Kirjoita jompikumpi ja paina {{key:Enter}}:

- Korkeus siirtää vain sitä kärkipistettä.
- Kaltevuus asettaa korkeuden segmentin kaukaisempaan päähän; sitä seuraavat kärkipisteet pysyvät paikoillaan, joten seuraavan segmentin kaltevuus muuttuu.

Myös kohdassa **Ominaisuudet**:

| Toiminto | Mitä se tekee |
|---|---|
| **Nosta tai laske kaikkia** | Lisää kirjoittamasi korkeuden jokaiseen kärkipisteeseen. |
| {{ui:Korkeudet maanpinnasta}} | Asettaa jokaisen kärkipisteen takaisin nykyiselle maanpinnalle (maastomallin ulkopuolella olevat kärkipisteet säilyttävät korkeutensa ja luetellaan). |
| {{ui:Yksi kaltevuus, ensimmäisestä viimeiseen}} | Säilyttää ensimmäisen ja viimeisen korkeuden ja asettaa niiden väliset kärkipisteet tasaiselle kaltevuudelle. |

Valittu viiva näyttää korkeutensa kärkipisteissä ja kaltevuutensa segmenteissä pohjakuvassa. Vedä kärkipistettä {{ui:Valitse}}-työkalulla siirtääksesi sen; sen korkeus säilyy.

## Porrasmaiset siirtymät

Kohdassa **Porrasmainen siirtymä** kirjoita **Etäisyys** (positiivinen viivan suunnan oikealle puolelle, negatiivinen vasemmalle), sitten korkeus (ylös- tai alaspäin) tai kaltevuus prosentteina, ja napsauta {{ui:Tee siirtymäviiva}}. Kopio on uusi taitelinja: esimerkiksi reunakiven takaosa 0.5 ft sivulle ja 0.5 ft korkeammalle, tai ojan reuna 6 ft ulkopuolella 2 %:n kaltevuudella. Etäisyys, joka taittaisi kopion päälleen tiukassa mutkassa, hylätään.

## Kaltevuudet ja korkeudet näytöllä

Paina {{key:E}} tai valitse kohdassa **Näyttö** ruutu **Taitelinjojen kaltevuudet ja korkeudet** nähdäksesi jokaisen taitelinjan kaltevuuden segmenttien varrella (pienellä nuolella, joka osoittaa alamäkeen) ja sen korkeuden kärkipisteissä. Ne näkyvät vain näytöllä: piirustukseen ei lisätä mitään, eivätkä PDF, DXF ja DWG muutu. Lyhyitä segmenttejä ja tiiviitä kärkipisteitä ei nimetä ennen kuin zoomaat lähemmäs. Valittu viiva näyttää aina omat kaltevuutensa ja korkeutensa.

## Profiilinäkymässä

Taitelinja, joka ylittää linjauksen, näkyy tuon linjauksen pituusleikkausnäkymässä nimensä ja korkeutensa kanssa risteyskohdassa; viereen kulkevat viivat voidaan näyttää myös. Katso [Suunnittele pystyprofiili](topic:profile).

## Mitä pinnat sille tekevät

Valitse **Käyttö**:

| Käyttö | Mitä tapahtuu |
|---|---|
| Nykyisen maanpinnan taitelinja | Nykyinen maanpinta kulkee viivan läpi sen korkeuksilla, kuten piirretty taitelinja. |
| Tasoitettu suunnitelmaan | **Suljettu** viiva muuttuu kaltevaksi tasanteeksi: sen sisällä oleva suunniteltu pinta tasoitetaan sen reunaan. Kytke päälle **Maanpinnan liittymä**, jolloin leikkaus- ja täyttöluiskat (vaaka 1 : pysty 1) kulkevat sen reunasta maanpintaan kuten tasanteella; jokainen luiska alkaa reunan omasta korkeudesta siinä kohdassa. |
| Vain piirretty | Se pysyy pohjakuvassa ja menee DXF-, DWG- ja PDF-tiedostoihin (taso C-GRAD-FEAT, 3D-polyviivat), mutta pinnat eivät huomioi sitä. |

Tilavuudet, leikkaukset ja 3D-näkymä sisältävät suunnitelmaan tasoitetut taitelinjat, kuten tasanteet. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Jaa viivoja tiimisi kanssa

CadCraft Studiossa pilvitiedostoistasi avatussa piirustuksessa tiimisuunnitelmalla projektin **Ominaisuudet** (kun mitään ei ole valittuna) sisältää osion **Tiimi**, jossa on {{ui:Tiimin linjat…}}: tiimisi jakamat viivat, kukin revisionsa kanssa, ilman että sinun täytyy valita taitelinjaa ensin. Valitse viiva jakaaksesi sen, työnnä uusi revisio, vedä tiimin revisio tai lopeta jakaminen. Muussa asetuksessa osio kertoo, mitä se tarvitsee.

## Kaaret muissa tiedostoissa

| Tiedosto | Mitä tapahtuu kaarilla varustetulle taitelinjalle |
|---|---|
| CivilCraft-projekti | Säilyy täsmälleen. |
| LandXML | Kirjoitetaan suunnitelman taitelinjana, jossa on viivoja ja kaaria korkeuksineen, ja luetaan takaisin kaarineen. Toisen ohjelman taitelinja tulee tilaan **Vain piirretty**: valitse sen **Käyttö**, jotta se menee pintaan. |
| DWG ja DXF | 3D-polyviiva ei voi pitää kaarta, joten viiva kirjoitetaan lyhyinä paloina 0.01:n sisällä kustakin kaaresta. CivilCraft merkitsee piirustukseen myös, mitkä palat olivat kaaria: kun avaat piirustuksen viivoina, {{ui:Taitelinjat}} tuo viivat takaisin taitelinjoina kaarineen. Muut ohjelmat näkevät tavallisen 3D-polyviivan. |
