---
title: Avaa DWG tai DXF viivageometriana
summary: Avaa piirustuksen viivageometria suunnitelmaan tasoittain, käytä sen ääriviivoja, 3D-murtoviivoja ja suljettuja ääriviivoja maastomallissa ja muuta sen pistelohkot mittauspisteiksi.
keywords: mittaustarkistus, tekstikorkeudet, dwg, dxf, cad, piirustus, viivageometria, ääriviivat, taitelinjat, raja, murtoviiva, 3D-murtoviiva, tasot, pohjakartta, topo, mittauspiirustus, lohkot, lohkoviittaukset, mittauspisteet lohkoista, attribuutit, pistelohkot, lisäyspiste
from: da0f4c58
---

Topografinen mittaus tulee usein piirustuksena: ääriviivat murtoviivoina omassa korkeudessaan, taitelinjat 3D-murtoviivoina ja työmaan reuna suljettuna murtoviivana. CivilCraft avaa piirustuksen **mallitilan** tasoina suunnitelmaan, ja se voi muuttaa nuo viivat suoraan maastomalliksi.

## Avaa piirustus

1. Napsauta {{ui:Viivageometria}} **Maastomalli**-ryhmässä (tai {{ui:Avaa}}, tai pudota tiedosto suunnitelmaan) ja valitse `.dwg`- tai `.dxf`-tiedosto. Piirustus luetaan tällä tietokoneella; mitään ei lähetetä. DWG-versiot 2000–2018 ja ASCII-DXF luetaan.
2. **Viivageometria**-valintaikkuna luettelee piirustuksen tasot, joilla on viivoja, suljettuja muotoja tai pisteitä, ja sen, onko niillä **korkeuksia**. Piirustuksessa pois päältä olevat tasot ovat alussa valitsematta. Teksti, viivoitukset, mitoitukset ja muut kuin viivageometria lasketaan ja jätetään pois (valintaikkuna kertoo, mitkä).
3. Tarkista **Piirustuksen yksiköt**. Kun piirustus kertoo yksikkönsä, CivilCraft muuntaa ne projektin yksiköiksi (millimetrit metreiksi, metrit jalkoihin, tuumat jalkoihin). Jalkoina oleva piirustus luetaan US survey feet -yksiköinä ilman skaalausta: ne eroavat toisistaan 2 miljoonasosaa, ja tasokoordinaattien skaalaus siirtäisi niitä jaloilla. Kun piirustus ei kerro yksiköitään, sen luvut luetaan projektin yksiköinä; valitse oikeat yksiköt luettelosta, jos ne eivät ole.
4. Kohdassa **Käytä maastomallissa** valitse, mitä kukin taso antaa maastomallille (tai jätä **Näytä vain**). Tasot, joiden nimi viittaa ääriviivoihin (TOPO, CONT, CNTR) ja joissa on korkeuksia, alkavat taitelinjoina.
5. Napsauta {{ui:Lisää}}. Tasot näkyvät **GIS-tasot**-kohdassa vasemmalla paneelissa; jokainen käyttö viedään maastomalliin. Jokainen osa on oma vaiheensa: {{key:Mod+Z}} kumoaa ne yksi kerrallaan.

## Mitä kukin tasotyyppi voi antaa

| Taso sisältää | Käyttö maastomallissa |
|---|---|
| Ääriviivat (murtoviivoja korkeudessaan) | Taitelinjat viivojen omalla korkeudella tai ELEV-kentän mukaan |
| 3D-murtoviivat | Taitelinjat omilla korkeuksillaan |
| Suljettu ääriviiva | Maastomallin raja (suurin suljettu muoto tai valitsemasi) |
| Pisteet korkeudella | Mittauspisteet, kuvattuna tason nimellä |
| Viivat korkeudella 0 (suunnitelman viivageometria) | Ei mitään: ne jäävät suunnitelmaan pohjapiirustuksena |

CivilCraftin kirjoittama piirustus tallentaa muotoviivansa 3D-murtoviivoina, jotka muistavat kaarensa. Valintaikkuna näyttää silloin **Muotoviivat**-kohdan: jätä se valituksi, jolloin ne palautuvat muotoviivoina kaarineen ja käyttöineen (yksi kumoamisvaihe), tai poista valinta, jolloin ne luetaan viivageometriana kuten muut tasot.

Myöhemmin voit käyttää tason valikossa **GIS-tasot**-kohdassa {{ui:Käytä maastomallissa}} -toimintoa tehdäksesi saman tasolle, jonka vain näytit.

## Mittauspisteet lohkoista

Mittauspiirustuksissa pisteet ovat usein lohkoina: pieni symboli jokaisessa mittauksessa, ja attribuutit pistenumerolle, kuvaukselle ja korkeudelle. Kun piirustuksessa on lohkoviittauksia, valintaikkunassa on **Mittauspisteet lohkoista** -kohta:

1. Valitse lohkot (taulukko kertoo, montako viittausta kullakin on, millä tasoilla ja mitkä attribuutit) tai valitse tasoja, jolloin otetaan kaikki niillä olevat lohkoviittaukset.
2. Valitse, mistä kunkin pisteen **numero**, **kuvaus** ja **korkeus** tulevat: attribuutista, lohkon tai tason nimestä, seuraavista vapaista numeroista tai lisäyspisteen Z-arvosta. CivilCraft aloittaa todennäköisistä attribuuteista (PT, DESC, ELEV ja vastaavat) ja ottaa korkeuden attribuutista vain, kun lohkot ovat nollakorkeudella.
3. Poista viivageometriatasojen valinta, jos haluat vain pisteet, ja napsauta {{ui:Lisää}}.

Jokainen viittaus tulee yhdeksi mittauspisteeksi lisäyspisteessään. Vain mallitilaan sijoitetut viittaukset lasketaan; toisten lohkojen sisään sisäkkäin sijoitetut lohkot eivät. Projektissa jo olevat numerot tai piirustuksessa kahdesti käytetyt saavat uudet numerot suurimman jälkeen, ja korkeusattribuutti, joka ei ole luku, jättää pisteen ilman korkeutta; tilarivi laskee molemmat. Piirustusta ei muuteta koskaan, ja jokainen piste muistaa lohkonsa: sen Ominaisuudet näyttävät kohdan **Lohkosta** lohkon, tason ja kahvan. Pisteiden lisääminen on yksi vaihe, joten {{key:Mod+Z}} vie ne kaikki pois.

## Tekstinä kirjoitetut korkeudet ja tarkistus

Tekstinä kirjoitetut pistekorkeudet (tai lohkon attribuutissa, joka ei ole mittauspisteen lohko) eivät ole viivageometriaa. **Mittauskorkeudet ja tarkistus** -kohta voi ottaa ne mittauspisteiksi ja luetella, mikä piirustuksessa näyttää pielessä: yksiköt, koordinaatisto, etäisyys nollasta, tasaiset ääriviivat, oudot korkeudet, kaksinkertaiset pisteet. Katso [Tarkista mittauspiirustus tuonnin yhteydessä](topic:survey-check).

## Miten piirustus luetaan

- Kaaret, ympyrät, ellipsit, pullistetut murtoviivan segmentit ja splinet muuttuvat lyhyiksi suoriksi osiksi (enintään 5° välein).
- Lohkoviittaukset piirretään siellä, missä ne sijaitsevat, samoin sisäkkäiset lohkot; tason 0 sisältö saa viittauksen tason.
- Muilla tasoilla piirretyt kohteet (eri ekstruusiosuunta) sijoitetaan maailmakoordinaatteihin.
- Jokainen kohde saa kolme kenttää: LAYER, TYPE (kohteen tyyppi) ja ELEV (sen korkeus, kun kaikilla pisteillä on sama).
- Koordinaatit otetaan sellaisenaan: piirustuksen on käytettävä samoja koordinaatteja kuin projekti (esimerkiksi sama tasokoordinaattivyöhyke). Linkitettyjä piirustuksia (xref) ei avata: avaa ne erikseen.

:::tip
Ääriviivapiirustus antaa parhaan maastomallin, kun lisäät muutaman pistekorkeuden huipuille ja painanteisiin, joissa pelkät ääriviivat jättävät litteitä kolmioita. Lisää ne mittauspisteiksi tai piirustuksen pistetasosta.
:::
