---
title: Piirrä ilmajohto
summary: Sijoita pylväät suunnitelmaan, anna CivilCraftin päätellä kunkin pylvään rooli ja päätepylväiden väliset osuudet, ja siirrä pylväitä suunnitelmassa tai linjan pituusleikkauksessa.
keywords: ilmajohto, pylväs, väli, osuus, päätepylväs, kulma, riippuva, pituusleikkaus, korkeus, poikkipalkki, vaijeri, ankkuri
from: b8e5e272
---

## Piirrä se

1. Maanpinnan on oltava olemassa: linjan alla oleva maa tulee maastomallista ([Rakenna maastomalli](topic:build-surface)). Pylväs, jonka alla ei ole maata, luetellaan kohdassa **Tarkistukset**; kirjoita sen **Maanpinnan korkeus** sen sijaan Ominaisuuksiin.
2. Napsauta {{ui:Johto}} Voimalinjat-ryhmässä ja napsauta jokaista pylvästä suunnitelmassa.
3. Kaksoisnapsauta viimeistä, tai paina {{key:Enter}}.

Linja saa johtimen, pylväs- ja varustekokoonpanon, jota käytit viimeksi tällä tietokoneella (ensimmäisellä kerralla: esimerkit kirjastosta). Vaihda ne Ominaisuuksista.

## Linja Ominaisuuksissa

Valitse linja (napsauta väliä), jotta voit asettaa sen **Johdin**, **Johtimia piiriä kohden**, **Piirit**, **Jännite**, **Välysääntö**, jonka se pitää maanpinnan yläpuolella, ja varusteet **Jokaisessa pylväässä** (poikkipalkki, eristimet, kiinnikkeet). Taulukko luettelee sen **osuudet** kunkin ohjausvälin, tavallisen jännityksen ja kuormitustapauksen, joka niitä määrää.

## Pylväät

Napsauta pylvästä valitaksesi sen. Ominaisuuksissa:

- **Pylväs**: sen kirjastokohde. Kun se on liian heikko, {{ui:Käytä …}} asettaa kirjastostasi pienimmän saman materiaalin pylvään, joka kantaa kuorman.
- **Rooli**: Automaattinen, Riippuva, Kulma tai Päätepylväs. Automaattinen tarkoittaa: ensimmäinen ja viimeinen pylväs ovat päätepylväitä; käännös, joka ylittää sääntösarjan kulman, tekee kulmapylvään; suurempi käännös tekee päätepylvään.
- **Korkeus maanpinnan yläpuolella**: tyhjä ottaa sen kirjastokohteesta (sen pituus miinus syvyys maassa).
- **Myös tälle pylvälle**: lisävarusteet, kuten **vaijeri** (ankkurivaijeri). Vaijerilla tuettu pylväs siirtää linjan vedon vaijerille.
- **Olemassa oleva pylväs**: se tarkistetaan kuten muut, mutta jätetään määrien ulkopuolelle.

{{ui:Pylväs}} lisää pylvään lähimpään väliin napsautuksesi kohdalla. Vedä pylvästä suunnitelmassa siirtääksesi sitä. {{ui:Poista}} poistaa sen (linjassa on oltava vähintään kaksi).

Osuudet kulkevat päätepylväiden välillä: osuuden sisällä johdin kulkee vapaasti riippukiinnikkeiden läpi, joten yksi jännitys pätee koko osuuteen.

## Linjan pituusleikkaus

Napsauta {{ui:Pituusleikkaus}} (tai **Pituusleikkaus** linjan Ominaisuuksista). Suunnitelman alla oleva paneeli näyttää maanpinnan linjaa pitkin, jokaisen pylvään maanpinnasta yläosaan, johtimen alimman vaiheen valitsemassasi **Kuormitustapaus**-kohdassa ja välyksen, jonka linjan on pidettävä, katkoviivana. Väli, joka ei täytä vaatimuksia, on punainen; luku kunkin välin alla on sen alin välys.

- **Linja** valitsee näytettävän ilmajohdon. Toisen linjan tai sen pylvään valitseminen suunnitelmassa vaihtaa profiilin siihen.
- Siirrä osoitinta profiilin päällä: ohjausviiva seuraa sitä, ja nimiö kertoo etäisyyden linjaa pitkin, maanpinnan, johtimen ja välyksen siinä kohdassa (ja kertoo, kun välys on linjan sääntöä pienempi).
- {{ui:Mittaa}} profiilin palkissa: napsauta kahta pistettä saadaksesi niiden välisen etäisyyden poikki, korkeuseron, suoran etäisyyden ja kaltevuuden. Napsautus lähellä maanpintaa, johdinta tai pylvään yläosaa kiinnittyy siihen. Napsauta {{ui:Mittaa}} uudelleen lopettaaksesi.
- Linjan ylittävät esteet nousevat maanpinnasta: piirretyt esteet palkkeina, Maisema-kasvit latvoineen, seinät palkkeina (katso [Voimalinjatarkistukset](topic:power-line-checks#clearances)). Kaapelireitit ja putket, joita linja ylittää, merkitään maan alapuolelle niiden yläreunassa nimineen.

- Vedä pylvästä sivusuunnassa siirtääksesi sitä linjaa pitkin.
- Vedä sen yläosaa ylös tai alas asettaaksesi sen korkeuden maanpinnan yläpuolella.
