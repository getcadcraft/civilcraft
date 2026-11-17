---
title: Valikot, näppäimet ja hiiri
summary: Valitse valikkotyyli, joka vastaa tapaasi työskennellä, anna jollekin komennolle oma näppäin, siirrä komentoja valintanauhan välilehtien välillä ja määritä, mitä rulla ja hiiren painikkeet tekevät suunnitelmassa ja 3D-näkymässä.
keywords: valikkotyyli, valikot, valintanauha, väyläsuunnittelun valintanauha, työkalurivi, komentorivi, piirtämisen klassikko, pikanäppäimet, näppäimet, mukauta, uudelleenmääritä, hiiri, rulla, käänteinen suunta, zoomauksen suunta, keskipainike, oikea painike, panoroi, kiertää, vie, tuo, vaihtaminen, tutut
from: 07ac73a0
---

CivilCraftin komennot ovat samat, mistä tahansa niitä käytät. **Valikkotyyli** määrää vain sen, missä ne ovat näytöllä, mikä niiden nimi siellä on ja mitkä näppäimet ne suorittavat, joten voit pitää omat tapasi. Valitse se kohdasta {{ui:Asetukset}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Valikot, näppäimet ja hiiri}}; muutos tulee heti voimaan, ja tämä selain muistaa sen.

## Kolme tyyliä

| Tyyli | Mitä saat |
|---|---|
| {{ui:CivilCraft}} | CivilCraftin oma työkalurivi ({{ui:Tiedosto}}, {{ui:Vie}}, {{ui:Maastomalli}}, Suunnittelu, Muokkaa, GIS, {{ui:Näytä}}) ja yksittäiset näppäimet: {{key:A}} linjaus, {{key:G}} alusta, {{key:P}} putket, {{key:B}} taitelinja, {{key:O}} raja, {{key:L}} muotoviiva, {{key:R}} pituusleikkaus, {{key:X}} poikkileikkaukset, {{key:E}} tasaukset, {{key:D}} 3D, {{key:F}} sovita, {{key:V}} valitse. Lähtökohta. |
| {{ui:Piirtämisen klassikko}} | Pieni valintanauha ({{ui:Aloitus}}, {{ui:Lisää}}, {{ui:Tuloste}}) ja komentorivi niille, jotka kirjoittavat komentoja: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (kumoa), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Aloita kirjoittaminen mistä tahansa, ja kirjaimet menevät komentoriville; {{key:Enter}} suorittaa, {{key:Enter}} tyhjällä rivillä toistaa viimeisen komennon, {{key:Esc}} tyhjentää sen. Keskipainike panoroi. |
| {{ui:Väyläsuunnittelun valintanauha}} | Välilehtiä, joissa on suuret painikkeet, ryhmiteltynä niin kuin tiesuunnitteluohjelmat ryhmittelevät työkalunsa: {{ui:Aloitus}} (maaperätiedot, suunnittelun luonti, pituus- ja poikkileikkausnäkymät), {{ui:Maastomallit}}, {{ui:Muokkaa}}, {{ui:Paikannus}}, {{ui:Näytä}} ja {{ui:Tuloste}}, sekä {{ui:Tiedosto}}-valikko ja pikapainikkeet oikealla. Yksittäiset näppäimet säilyvät. Keskipainike panoroi suunnitelmaa; 3D-näkymässä keskipainike panoroi ja {{key:Shift}} keskipainikkeen kanssa kiertää. |

Jokainen tyyli säilyttää {{key:Mod}}-näppäimet: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Näppäin, joka kuuluu CivilCraftin omaan asetteluun mutta jonka tyylisi on antanut toiselle komennolle, ei tee mitään, ja tilarivi kertoo, minne sen komento siirtyi (”Omat näppäimet: Pad on Ctrl+Alt+G”). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} ja nuolinäppäimet säilyttävät aina merkityksensä, ja kun piirrät viivaa, sen pisteet säilyttävät näppäimensä ({{key:Backspace}}, {{key:Enter}}).
:::

## Tee se omaksesi

1. Valitse lähimpänä haluamaasi tyyliä ja napsauta {{ui:Mukauta…}}.
2. Kohdassa {{ui:Näppäimet ja valikot}} etsi komento (hakukenttä auttaa). Napsauta {{ui:Lisää avain}} ja paina näppäintä, tai kahta näppäintä peräkkäin kaksikirjaimista näppäintä varten. Napsauta näppäintä poistaaksesi sen.
3. Valintanauhan kanssa {{ui:Sijainti}} siirtää komennon toiseen välilehteen ja ryhmään, {{ui:Tiedosto}}-valikkoon tai kohtaan {{ui:Vain näppäimet}}.
4. Kohdassa {{ui:Hiiri}} määritä rulla, painikkeet, jotka panoroivat suunnitelmaa, ja mitä kukin painike tekee 3D-näkymässä.
5. Anna sille nimi ja napsauta {{ui:Tallenna}}.

Sisäänrakennetun tyylin tallentaminen tekee oman kopion (”Oma väyläsuunnittelun valintanauha”); sisäänrakennettu pysyy aina ennallaan. Näppäin, joka on annettu kahdelle komennolle tai joka tulisi suoritetuksi ennen kaksikirjaimisen näppäimen kirjoittamista, näkyy punaisena ja se täytyy korjata ennen tallentamista.

## Hiiri

- **Hiiren rulla**: {{ui:Vieritys ylös lähentää}} (oletus) tai {{ui:Vieritys ylös loitontaa}}, ja kuinka nopeasti, suunnitelmassa ja 3D-näkymässä. Kosketuslevyn nipistys zoomaa aina sormien liikkeen suuntaan.
- **Panoroi suunnitelmaa**: keskipainikkeella, oikealla painikkeella tai molemmilla. {{key:Space}} ja vetäminen panoroi myös. Vasen painike valitsee ja piirtää aina.
- **Vetäminen 3D-näkymässä**: {{ui:Kunkin näkymän oma}} säilyttää CivilCraftin painikkeet (vasen kiertää, oikea panoroi). Tai aseta kukin painike kiertämään, panoroimaan, zoomaamaan tai ei mitään; {{key:Shift}} painikkeen kanssa vaihtaa kiertämisen ja panoroinnin. Napsautus ilman vetämistä valitsee silti.

## Ota mukaasi

{{ui:Vie}} tallentaa käytössä olevan tyylin pienenä `.ccinput.json`-tiedostona; {{ui:Tuo…}} lisää sellaisen toiselta tietokoneelta tai kollegalta. Tuotu tiedosto voi viitata vain CivilCraftin omiin komentoihin: muu jätetään pois ja se lasketaan tilariville. {{ui:Poista tämä tyyli}} poistaa yhden omistasi.

:::note
Nämä asetukset pysyvät tässä selaimessa. {{ui:Käytä tätä tyyliä jokaisessa sovelluksessa}} tyylikorttien alla saa jokaisen sovelluksen avautumaan vastaavassa tyylissä (oma työkalurivi, valintanauha tai Piirtämisen klassikko), tekemillesi muutoksilla kussakin sovelluksessa. CivilCraftissa ei ole valikkorivityyliä: kun jonkin muun sovelluksen valikkorivi valitaan kaikille sovelluksille, CivilCraft pitää oman työkalurivinsä.
:::

Liittyvää: [Näppäimistö ja hiiri](topic:keyboard) · [CivilCraftin asetukset](topic:settings) · [Siirtyminen muusta väyläohjelmistosta](topic:coming-from)
