---
title: Voimalinjatyötila
summary: Ilmajohdot ja maakaapelit työmaallasi omine kirjastoineen, riippuma ja jännitys omilla kuormitustapauksillasi, selvitys- ja lujuustarkistukset, vetotaulukot, määrät, arkit ja GIS-vienti.
keywords: voimalinja, ilmajohto, sähkö, jakelu, pylväät, tuet, johdin, riippuma, jännitys, vetäminen, selvitys, maakaapeli, kaivanto, työtila, verkkoyhtiö
from: 638dd856
---

Voimalinjatyötila tuo ilmajohdot ja maakaapelit olemassa olevalle CivilCraft-työmaallesi: samat mittauspisteet, sama maanpinta, sama projektitiedosto.

:::warning
Suunnittelun apuväline. Työtila laskee riipuman, jännityksen, selvitykset ja kuormat **sinun** kuormitustapauksistasi ja rajoistasi. Minkään maan standardia ei ole sisäänrakennettu. Insinööri tarkistaa jokaisen tuloksen sovellettavaa standardia vastaan ennen kuin mitään rakennetaan.
:::

## Avaa se

Valitse {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Voimalinjatyötila}}, tai **Voimalinjat** kohdassa Työtila. Työkalurivillä näkyy sitten **Voimalinjat**-ryhmä; Suunnittelu- ja GIS-ryhmät väistyvät sivuun. Valitse **Siviili** kohdassa Työtila palataksesi takaisin. CivilCraft muistaa, mitä työtilaa käytit viimeksi tällä tietokoneella.

Vasempaan paneeliin tulee ylös kaksi osiota:

- **Voimalinjat**: kuormitustapauksesi ja rajasi, projektin linjat ja kaapelit sekä **Tarkistukset**, aina ajan tasalla. Napsauta tarkistusta valitaksesi kohteen, jota se koskee.
- **Kirjasto**: omat johtimet, kaapelit, tuet, laitteet ja kaivantotyypit. Katso [Oma voimalinjakirjasto](topic:power-line-library).

## Mitä Voimalinjat-ryhmässä on

| Työkalu | Mitä se tekee | Aihe |
|---|---|---|
| **Linja** | Ilmajohto: napsauta jokaista tukea | [Piirrä ilmajohto](topic:overhead-line) |
| **Tuki** | Lisää tuki väliin | [Piirrä ilmajohto](topic:overhead-line) |
| **Kaapeli** | Maakaapelireitti kaivannossa | [Maakaapelit](topic:underground-cables) |
| **Laite** | Kaappi, muuntaja, liitos tai verkon syöttölähde | [Maakaapelit](topic:underground-cables) |
| **Este** | Jokin, minkä linja ylittää: tie, rakennus, toinen linja | [Tarkistukset](topic:power-line-checks) |
| **Pituusleikkaus** | Linjan pituusleikkaus: maanpinta, tuet ja johdin kuormitustapauksittain | [Piirrä ilmajohto](topic:overhead-line#the-line-profile) |
| **Lisää** | Kuormitustapaukset ja rajat, vetotaulukot, määrät, arkit ja raportti, GIS, selvitystiedostot | [Riippuma ja jännitys](topic:sag-and-tension), [Tulosteet](topic:power-line-outputs), [Selvitystiedostot](topic:power-line-study-file) |

Kaikki, mitä lisäät, on yksi kumoamisvaihe, se tallennetaan projektitiedostoon ja piirtyy pohjakuvaan tasoille nimeltä `C-POWR-…`. Siksi DXF-, DWG- ja PDF-viennit sisältävät sen myös.
