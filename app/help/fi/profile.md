---
title: Pystyprofiilin suunnittelu
summary: Avaa pituusleikkausnäkymä, aloita suunnittelupituusleikkaus maanpinnasta, lisää ja vedä PVI-pisteitä, aseta kaarien pituudet ja lue kaltevuudet, K-arvot sekä korkein ja matalin piste.
keywords: pituusleikkaus, pystylinjaus, pvi, pystykaari, kaltevuus, k-arvo, harja, notko, bvc, evc, pituusleikkausnäkymä, lopullinen kaltevuus, fg, nykyisen maanpinnan pituusleikkaus, taitelinjat pituusleikkauksessa, ylitykset, projisoitu, reunakivi, oja, tunnisteet
from: e9182bfa
---

Jokaisella linjauksella on yksi suunnittelupituusleikkaus: lista PVI-pisteitä (paalu ja korkeus), jotka on yhdistetty suorilla kaltevuuksilla, ja symmetrinen paraabelinen pystykaari jokaisessa sisäpisteessä, jolla on pituus. Nykyisen maanpinnan pituusleikkaus otetaan pinnasta puolestasi.

## Avaa pituusleikkausnäkymä

1. Valitse linjaus (napsauta sitä {{ui:Valitse}}-työkalulla).
2. Paina {{key:R}}, tai napsauta työkalurivin {{ui:Pituusleikkaus}}-painiketta tai oikean paneelin alareunan {{ui:Pituusleikkausnäkymä}}-kohtaa.
   Pituusleikkausnäkymä avautuu pohjakuvan alle, ja linjauksen varrella näkyy nykyinen maanpinta. Jos linjauksia on kaksi tai enemmän, valitse yksi pituusleikkauspalkin vasemmalla puolella olevasta luettelosta.

Näkymä näyttää aina koko linjauksen ja venyttää korkeudet täyttämään paneelin. Liioittelu tulostuu vasempaan alakulmaan, esimerkiksi ”Pystysuuntainen liioittelu 10×”. Sitä ei voi zoomata eikä panoroida.

Siirrä osoitinta pituusleikkauksen kohdalla: palkki näyttää paalun, maanpinnan ja suunnitelman korkeudet, kaltevuuden ja siinä olevan leikkauksen tai täytön. Pohjakuvassa linjauksella seuraa piste.

## Aloita suunnittelupituusleikkaus

1. Oikean paneelin kohdassa **Suunnittelupituusleikkaus** napsauta {{ui:Aloita maanpinnasta}}.
   Kaksi PVI-pistettä sijoitetaan maanpinnalle linjauksen kahteen päähän ja yhdistetään yhdellä suoralla kaltevuudella. Tilarivi kertoo: ”Suunnittelupituusleikkaus aloitettu maanpinnasta molemmista päistä. Ota käyttöön Lisää PVI:t ja napsauta lisätäksesi kaltevuuden taitepisteitä; anna niille kaarenpituus taulukossa.”

Jos linjaus ei ylitä pintaa, saat viestin ”Tällä linjauksella ei ole maanpintaa, josta aloittaa.” Lisää silloin PVI:t napsauttamalla (seuraava osio).

## Lisää PVI:t

1. Paina {{key:I}}, tai napsauta pituusleikkauspalkin {{ui:Lisää PVI:t}}-painiketta. Se pysyy painettuna.
2. Napsauta pituusleikkauksessa kohtaa, johon haluat kaltevuuden taitepisteen. PVI lisätään siihen paaluun ja korkeuteen, pyöristettynä arvoon 0.01, ja se valitaan.
3. Lisää niin monta kuin tarvitset, ja lopeta lisääminen painamalla {{key:I}} uudelleen.

Napsautus kohtaan, jossa on jo PVI, hylätään (”Kohdassa … on jo PVI”). PVI:t pysyvät aina paalujärjestyksessä.

## Säädä PVI:t

- **Vedä** PVI:tä pituusleikkauksessa siirtääksesi sitä. Se ei voi mennä naapureidensa ohi. Siirto on yksi kumoamisvaihe.
- **Kirjoita** tarkat arvot oikean paneelin PVI-taulukkoon: **Paalu**, **Korkeus** ja **Kaari L** (pystykaaren pituus). Paina {{key:Enter}} jokaisen jälkeen.
- **Poista** PVI rivin lopussa olevalla x:llä tai valitse se (napsauta sitä) ja paina {{key:Delete}}. Kun pituusleikkausnäkymällä on kohdistus, myös {{key:Backspace}} poistaa sen.

Ensimmäinen ja viimeinen PVI eivät koskaan saa kaarta.

## Pystykaaret

1. Kirjoita pituus kenttään **Kaari L** sisäpisteelle PVI, esimerkiksi 200.
2. Kaari piirretään PVI:n keskelle. Pituusleikkaus ja oikea paneeli näyttävät sen tyypin (harja tai notko), L:n ja K:n, BVC- ja EVC-paalut ja korkeudet sekä sen korkeimman tai matalimman pisteen, jos sellainen on kaaren sisällä.

K lasketaan L:stä (K = L jaettuna kaltevuuksien algebrallisella erotuksella prosentteina). Kirjoitat L:n. K:n suora kirjoittaminen ei ole vielä käytettävissä.

Jos pystykaari ei mahdu, punainen laatikko kertoo syyn: se ulottuu takaisin edellisen PVI:n tai kaaren sisään tai seuraavan PVI:n yli, ja kuinka paljon tilaa on kyseisellä puolella (kaari tarvitsee puolet pituudestaan kummallekin puolelle PVI:tä). Sen painike asettaa **pisimmän mahtuvan kaaren** K-arvoineen yhdeksi vaiheeksi ({{key:Mod+Z}} kumoaa sen). Tai siirrä PVI:t kauemmas toisistaan.

## Lue tiedot

PVI-taulukon alla luettelo antaa kunkin kaltevuuden prosentteina (”Kaltevuus 1: +1.25%”) ja jokaisen kaaren, esimerkiksi ”Harja kohdassa 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, sitten ”Korkein piste 1+62.40, 254.12”.

Jos PVI:t eivät ulotu linjauksen molempiin päihin, huomautus kertoo siitä. Käytävä rakennetaan vain siinä kohdassa, missä pituusleikkaus ja linjaus menevät päällekkäin.

## Taitelinjat pituusleikkauksessa

Taitelinjat näkyvät myös pituusleikkausnäkymässä, joten näet reunakiven, ojan tai seinän yläreunan tien pituusleikkausta vasten.

- Kun taitelinja **ylittää** linjauksen, pituusleikkaus näyttää pienen timantin siinä paalussa ja korkeudessa, nimettynä linjan nimellä ja sen korkeudella siinä (linjan oma korkeus, laskettuna ylittävän osuuden mukaan).
- Kirjoita etäisyys kenttään {{ui:Vierellä enintään}}, jolloin myös taitelinjat, jotka **kulkevat vierellä** linjauksen kyseisen etäisyyden sisällä, piirretään katkoviivoina omilla korkeuksillaan. Tyhjä tai 0 näyttää vain ylitykset.
- Merkit ja tunnisteet seuraavat jokaista muutosta: siirrä kärkipistettä, kirjoita kaltevuus tai nosta linjaa, ja pituusleikkaus näyttää uudet korkeudet heti.
- Napsauta ylityksen timanttia valitaksesi kyseisen taitelinjan. Valittu linja piirretään korostusvärillä.
- Pituusleikkauspalkin {{ui:Taitelinjat}} piilottaa tai näyttää ne kaikki. Molemmat asetukset tallennetaan projektin mukana.

Katso [Taitelinjat](topic:feature-lines).

## Seuraavaksi

- [Pyyhkäise tiekäytävä](topic:corridor) linjauksen ja tämän pituusleikkauksen mukaan.
- Pituusleikkaus kirjoitetaan LandXML-muotoon linjauksen mukana. Katso [LandXML-vaihto](topic:landxml).
