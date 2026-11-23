---
title: Suunnittele pystyprofiili
summary: Avaa pituusleikkausnäkymä, aloita suunniteltu pituusleikkaus maanpinnasta, lisää ja vedä PVI-pisteitä, aseta pystykaarten pituudet ja lue kaltevuudet, K-arvot sekä korkeimmat ja matalimmat pisteet.
keywords: pituusleikkaus, pystylinjaus, pvi, pystykaari, kaltevuus, k-arvo, harjanne, kuoppa, bvc, evc, pituusleikkausnäkymä, lopullinen tasaus, fg, nykyisen maanpinnan pituusleikkaus, taitelinjat pituusleikkauksessa, risteykset, projisoitu, reunakivi, oja, tunnisteet
from: dbb1f32d
---

Jokaisella linjauksella on yksi suunniteltu pituusleikkaus: luettelo PVI-pisteistä (paalu ja korkeus), jotka on yhdistetty suorilla kaltevuuksilla, ja jokaisessa sisäpisteessä, jolla on pituus, symmetrinen paraboli-pystykaari. Nykyisen maanpinnan pituusleikkaus otetaan puolestasi maastomallista.

## Avaa pituusleikkausnäkymä

1. Valitse linjaus (napsauta sitä {{ui:Valitse}}-työkalulla).
2. Paina {{key:R}}, napsauta työkalurivin {{ui:Pituusleikkaus}}-painiketta tai oikean paneelin alareunan {{ui:Pituusleikkausnäkymä}}-painiketta.
   Pituusleikkausnäkymä avautuu pohjapiirroksen alle, ja linjauksen varrella näkyy nykyinen maanpinta. Kun linjauksia on kaksi tai enemmän, valitse yksi pituusleikkauspalkin vasemmalla puolella olevasta luettelosta.

Näkymä näyttää aluksi koko linjauksen ja venyttää korkeudet täyttämään paneelin; liioittelu näkyy vasemmassa alakulmassa, esimerkiksi ”Pystysuuntainen liioittelu 10×”.

## Zoomaa ja siirrä pituusleikkausta

- **Zoomaus:** käännä hiiren rullaa (tai nipistä kosketuslevyllä), ja näkymä zoomaa osoittimen kohdalta. Pidä {{key:Shift}} painettuna zoomataksesi vain paaluja tai {{key:Alt}} painettuna zoomataksesi vain korkeuksia (tämä muuttaa liioittelua). Kun pituusleikkausnäkymä on aktiivinen, plus- ja miinusnäppäimet zoomaavat keskeltä.
- **Siirto:** vedä oikealla tai keskimmäisellä hiiren painikkeella tai pyyhkäise kahdella sormella kosketuslevyllä.
- **Sovita:** kaksoisnapsauta pituusleikkausta tai paina {{key:F}} näyttääksesi taas koko linjauksen.

PVI:n muokkaus säilyttää valitsemasi zoomauksen; näkymä ei hyppää takaisin sovitukseen.

Siirrä osoitinta pituusleikkausta pitkin: palkki näyttää paalun, maanpinnan ja suunnitellut korkeudet, kaltevuuden sekä siinä kohdassa olevan leikkauksen tai täytön, ja piste seuraa linjausta pohjapiirroksessa.

## Aloita suunniteltu pituusleikkaus

1. Valitse oikeassa paneelissa kohdassa **Suunniteltu pituusleikkaus** {{ui:Aloita maanpinnasta}}.
   Kaksi PVI-pistettä asetetaan maanpinnalle linjauksen kahteen päähän ja ne yhdistetään yhdellä suoralla kaltevuudella. Tilarivi kertoo: ”Suunniteltu pituusleikkaus aloitettu maanpinnasta molemmissa päissä. Ota käyttöön Lisää PVI:t ja napsauta lisätäksesi kaltevuuden taitekohtia; anna niille pystykaaren pituus taulukossa.”

Jos linjaus ei leikkaa maastomallia, saat viestin ”Tämän linjauksen alla ei ole maanpintaa, josta aloittaa.” Lisää silloin PVI-pisteitä napsauttamalla (seuraava osio).

## Lisää PVI:t

1. Paina {{key:I}} tai napsauta pituusleikkauspalkin {{ui:Lisää PVI:t}}-painiketta. Se pysyy painettuna.
2. Napsauta pituusleikkauksessa kohtaa, johon haluat kaltevuuden taitekohdan. PVI lisätään siihen paaluun ja korkeuteen, pyöristettynä arvoon 0.01, ja se valitaan.
3. Lisää niin monta kuin tarvitset ja paina sitten {{key:I}} uudelleen lopettaaksesi lisäämisen.

Napsautus kohtaan, jossa on jo PVI, hylätään (”Kohdassa … on jo PVI”). PVI:t pysyvät aina paalujärjestyksessä.

## Tartunta lisättäessä tai vedettäessä

**Tartunta**-painike pituusleikkauspalkissa on aluksi päällä. Kun se on päällä, lisäämäsi tai vetämäsi PVI osuu lähimpään PVI-pisteeseen, maanpintapisteeseen, PVI-paaluun tai maanpinnan viivaan, ja merkin vieressä oleva tunniste kertoo, mihin. Pidä {{key:Alt}} painettuna vapaalle pisteelle mihin tahansa.

## Muokkaa PVI-pisteitä

- **Vedä** PVI:tä pituusleikkauksessa siirtääksesi sitä. Se ei voi mennä naapureidensa ohi. Siirto on yksi kumoamisvaihe.
- **Kirjoita** tarkat arvot oikean paneelin PVI-taulukkoon: **Paalu**, **Korkeus**, **Kaltevuus %** ja **Kaaren pituus L** (pystykaaren pituus). Paina jokaisen jälkeen {{key:Enter}}.
- **Valitse** arvo pituusleikkauksesta: PVI:n paalun tai korkeuden vieressä oleva pieni painike odottaa yhtä napsautusta pituusleikkausnäkymässä ja täyttää arvon. Napsautus tarttuu kuten Lisää PVI:t; pidä {{key:Alt}} painettuna vapaalle pisteelle; {{key:Esc}} peruuttaa.
- **Kaltevuus %** on sen tangentin kaltevuus, joka alkaa tästä PVI:stä ja kulkee seuraavaan. Sen kirjoittaminen siirtää **seuraavan** PVI:n korkeutta (sen paalu ei koskaan siirry). Jos seuraava PVI on lukittu, siirtyy sen sijaan edellisen PVI:n korkeus.
- **Lukitse** PVI riviensä lopussa olevalla lukolla. Lukittua PVI:tä ei vedetä, eikä kaltevuuden muokkaus siirrä sitä. Jos tangentin molemmat päät ovat lukittuina, sen kaltevuutta ei voi muuttaa: tilarivi kertoo sen, ja avaat ensin toisen pään. Lukitus tallennetaan tiedostoon.
- **Poista** PVI rivinsä lopussa olevalla x-merkillä tai valitse se (napsauta) ja paina {{key:Delete}}. Kun pituusleikkausnäkymä on aktiivinen, myös {{key:Backspace}} poistaa sen.

Ensimmäinen ja viimeinen PVI eivät koskaan saa kaarta.

## Pystykaaret

1. Kirjoita pituus kohtaan **Kaaren pituus L** sisäiselle PVI:lle, esimerkiksi 200.
2. Kaari piirretään PVI:n keskelle. Pituusleikkaus ja oikea paneeli näyttävät sen tyypin (harjanne tai kuoppa), L:n ja K:n, BVC- ja EVC-paalut ja korkeudet sekä sen korkeimman tai matalimman pisteen, jos sellainen on kaaren sisällä.

K lasketaan L:stä (K = L jaettuna kaltevuuksien algebrallisella erotuksella prosentteina). Kirjoitat L:n; K:n suora kirjoittaminen ei ole vielä käytettävissä.

Jos pystykaari ei mahdu, punainen ruutu kertoo syyn: se menee takaisin edeltävään PVI:hen tai kaareen tai ohi seuraavan PVI:n, ja kuinka paljon tilaa on kyseisellä puolella (kaari tarvitsee puolet pituudestaan kummallekin puolelle PVI:tä). Sen painike asettaa **pisimmän mahtuvan kaaren** K-arvoineen yhdeksi vaiheeksi ({{key:Mod+Z}} kumoaa sen). Tai siirrä PVI:t kauemmas toisistaan.

## Lue tiedot

PVI-taulukon alla luettelo antaa kunkin kaltevuuden prosentteina (”Kaltevuus 1: +1.25%”) ja kunkin kaaren, esimerkiksi ”Harjanne kohdassa 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, sen jälkeen ”Korkein piste 1+62.40, 254.12”.

Jos PVI:t eivät ulotu linjauksen molempiin päihin, huomautus kertoo siitä. Käytävä rakennetaan vain siinä kohdassa, missä pituusleikkaus ja linjaus menevät päällekkäin.

## Taitelinjat pituusleikkauksessa

Taitelinjat näkyvät myös pituusleikkausnäkymässä, joten näet reunakiven, ojan tai muurin yläreunan tien pituusleikkausta vasten.

- Kohdassa, jossa taitelinja **ylittää** linjauksen, pituusleikkaus näyttää pienen timantin siinä paalussa ja korkeudessa, tunnisteena viivan nimi ja sen korkeus siinä (viivan oma korkeus, laskettuna ylittävää osuutta pitkin).
- Kirjoita etäisyys kohtaan {{ui:Vierellä enintään}} piirtääksesi myös taitelinjat, jotka **kulkevat vierellä** linjauksen kyseisellä etäisyydellä, katkoviivoina omissa korkeuksissaan. Tyhjä tai 0 näyttää vain risteykset.
- Merkit ja tunnisteet seuraavat jokaista muutosta: siirrä kärkipistettä, kirjoita kaltevuus tai nosta viivaa, ja pituusleikkaus näyttää uudet korkeudet heti.
- Napsauta risteyksen timanttia valitaksesi kyseisen taitelinjan; valittu viiva piirretään korostusvärillä.
- {{ui:Taitelinjat}} pituusleikkauspalkissa piilottaa tai näyttää ne kaikki. Molemmat asetukset tallennetaan projektin mukana.

Katso [Taitelinjat](topic:feature-lines).

## Seuraavaksi

- [Pyyhkäise tien käytävä](topic:corridor) linjauksen ja tämän pituusleikkauksen mukaan.
- Pituusleikkaus kirjoitetaan LandXML-tiedostoon linjauksen mukana; katso [LandXML-vaihto](topic:landxml).
