---
title: Selvitystiedostot toiselle linjaohjelmalle (.DON)
summary: Tallenna yksi ilmajohtolinja .DON-selvitystiedostona tai lue toisen ohjelman tuet uuteen linjaan. Ei testattu sen ohjelman kanssa, joka niitä lukee.
keywords: don, .don, selvitystiedosto, xml, vienti, tuonti, ilmajohtolinjaohjelma, vetotaulukko, canton
from: 1abc4d07
---

Jotkin ilmajohtolinjaohjelmat tallentavat selvityksen `.DON`-tiedostoon (XML-teksti). CivilCraft voi kirjoittaa yhden linjan tällaiseen tiedostoon ja lukea yhden linjan tuet.

:::warning
**Testaamatta.** Rakensimme tämän käyttäjän jakamasta luettelosta muodon kenttien nimistä, emme oikeasta tiedostosta. Emme ole myöskään avanneet tiedostojamme ohjelmassa, joka niitä lukee. Avaa tiedosto siellä ja tarkista jokainen arvo ennen kuin luotat siihen. Jos voit jakaa `.DON`-tiedoston (asiakkaan tiedot poistettuina), se auttaa meitä korjaamaan tämän.
:::

## Tallenna selvitystiedosto

1. Anna linjalle johdin ja varmista, että siinä on tuloksia (ei ”ei ole laskettu” ominaisuuksissa).
2. {{ui:Lisää}} › {{ui:Tallenna selvitystiedosto (.DON)…}}, valitse linja, lisää kuvaus ja työnumero.
3. {{ui:Tallenna selvitystiedosto}}.

Tiedosto sisältää linjan tuet (koordinaatit, maanpinta, korkeudet, roolit, poikkipalkki, tuki joko säilytettynä tai ehdotettuna, kuormat kuormitustapauksittain, perustus), yhden osuuden päätetukien välisistä osista (johdin, jännite, ohjausväli, välit, jännitys ja riippukäyrän parametri, suurin jännitys kuormitustapauksittain) sekä vetotaulukot. Pituudet ovat metreinä ja voimat daN:nä. Teksti kirjoitetaan Latin-1-merkistöön, joten sen ulkopuolinen merkki muuttuu merkiksi `?`.

## Lue selvitystiedosto

{{ui:Lisää}} › {{ui:Avaa selvitystiedosto (.DON)…}} lukee tuet uuteen linjaan. Johdin, tuet ja poikkipalkit yhdistetään kirjastoosi nimen perusteella. Kaikki, mitä ei löydy, jätetään valittavaksi kohdassa Ominaisuudet.
