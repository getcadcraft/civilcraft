---
title: Työskentely työkalupakin ja tietoruudun asettelussa
summary: Vaihda sovellus työkalusarakkeeseen vasemmalla, jossa on paikat omille työkaluille, tietoruutuun yläreunassa, joka seuraa käynnissä olevaa työkalua tai valittua kohdetta, navigaattoriin oikealla, välilehteen jokaiselle näkymälle, pikavaihtoehtoihin ja muokkauspalettiin, ja palaa klassiseen asetteluun milloin tahansa.
keywords: asettelu, työtila, työkalupakki, työkalusarake, tietoruutu, tietopalkki, navigaattori, projektikartta, pikapalkki, pikavaihtoehdot, muokkauspaletti, paletti, omat työkalut, suosikkityökalut, näkymävälilehdet, työkalupakin ikkuna, klassinen asettelu, vaihda asettelu
from: ec341666
---

**Työkalupakki ja tietoruutu** on yksi sovelluksen kolmesta työtilan asettelusta. Piirustustyökalut ovat sarakkeessa vasemmalla, tietoruutu yläreunassa näyttää, mitä käynnissä oleva työkalu tarvitsee tai mitä on valittu, jokaisella näkymällä on välilehti ja piirustuksen alla on pikapalkki muutamille tavallisimmille vaihtoehdoille. Työkalut ovat sovelluksen omia: kaikki, mitä klassisessa asettelussa voi tehdä, toimii tässäkin, ja piirustus, valikkotyyli ja näppäimet pysyvät ennallaan.

## Valitse se

1. Avaa {{ui:Asetukset}} (vaihde tai {{key:Mod+,}}).
2. Valitse välilehti {{ui:Yleinen}} ja siirry kohtaan {{ui:Asettelu}} › {{ui:Työtila}}.
3. Valitse {{ui:Työkalupakki ja tietoruutu}}.

Asettelu vaihtuu heti. Valinta on yhteinen kaikille tämän selaimen sovelluksille: jokainen sovellus avautuu siihen tästä eteenpäin, ja se on paikallaan ennen sivun piirtymistä, joten klassista asettelua ei koskaan näy ensin.

## Missä mikäkin on

- **Työkalurivi:** sovelluksen oma työkalurivi pysyy piirustusalueen yläreunassa valikoineen.
- **Tietoruutu:** työkalurivin alla. Kun työkalu on käynnissä, se näyttää työkalun ja sen, mitä se pyytää. Kun valitset jotakin, se näyttää sen pääasetukset (seinälle: tyypin, paksuuden, pituuden, sijaintiviivan ja korkeuden), ja niitä voi muuttaa suoraan siellä: muutos on sama kuin Ominaisuudet-paletissa, ja {{key:Mod+Z}} kumoaa sen. Kun mitään ei ole valittu, siinä lukee ”Mitään ei ole valittu”. Kukin sovellus lisää tähän omia ruutujaan, kuten nykyisen tason tai kerroksen tai avoimen asiakirjan.
- **Työkalupakki:** vasemmalla oleva sarake, jossa sovelluksen työkalut ovat ryhmissä. Napsauta ryhmän nimeä taittaaksesi sen tai avataksesi sen uudelleen. Käynnissä oleva työkalu on valaistu.
- **Omat työkalut:** työkalupakin ensimmäinen ryhmä, kahdeksan tyhjää paikkaa eniten käytettyjä työkaluja varten. Napsauta tyhjää paikkaa, jos haluat valita minkä tahansa sovelluksen työkalun tai komennon; tai napsauta työkalua työkalupakissa hiiren oikealla ja valitse {{ui:Lisää Omiin työkaluihin}}; tai vedä työkalu paikkaan. Paikan voi vaihtaa tai tyhjentää napsauttamalla sitä hiiren oikealla. Paikat tallentuvat kullekin sovellukselle tähän selaimeen.
- **Navigaattori:** oikea paneeli. Sovelluksen projektiselain on ylhäällä (pohjapiirrokset, leikkaukset, julkisivut, 3D-näkymät, luettelot, arkit, sovelluksessa olevien mukaan): napsauta yhtä avataksesi sen. Sen alla ovat {{ui:Ominaisuudet}} ja välilehti oikean paneelin muulle sisällölle.
- **Näkymävälilehdet:** välilehti jokaiselle avoimen tiedoston näkymälle (arkki, pohjapiirros, kohtaus…) piirustuksen päällä.
- **Pikapalkki:** piirustuksen alla näkymäasetukset ja sovelluksen tavanomaiset vaihtoehdot, kuten mittakaava, yksityiskohtaisuus, näkymäalue, sovitus, pohjapiirros, jakonäkymä tai 3D, tartunnat ja yksiköt.
- **Muokkauspaletti:** napsauta jotakin piirustuksessa, ja osoittimen viereen tulee pieni paletti kyseisen kohteen muokkauskomennoilla, kuten siirto, kopiointi, kierto, peilaus, monistus tai poisto, sekä {{ui:Ominaisuudet}}. {{key:Esc}}, hiiren rulla, toinen napsautus tai sen sulkupainike piilottaa sen.

Työkalu, jota ei voi käyttää juuri nyt, on harmaana, ja sen ohjeteksti kertoo syyn. Napsauta sitä tai paina {{key:Enter}} sen kohdalla, niin syy näkyy ruudussa.

{{key:Esc}} lopettaa ensin käynnissä olevan työkalun, kuten klassisessa asettelussa, ja jokainen pikanäppäin sekä {{key:Ctrl+Shift+F}} (näyttötilat) toimivat kuten ennenkin.

## Anna työkalupakille oma ikkuna

Työkalupakin yläreunan {{ui:Siirrä työkalupakki}}-painikkeessa on {{ui:Siirrä uuteen ikkunaan}}: työkalupakki avautuu kapeaan omaan ikkunaansa, jonka voi sijoittaa sovelluksen viereen tai toiselle näytölle. Siellä painetut näppäimet menevät sovellukseen. {{ui:Palauta työkalupakki}} tai ikkunan sulkeminen tuo sen takaisin.

Työkalurivin asetukset koskevat myös työkalupakkia: {{ui:Asetukset}} › {{ui:Yleinen}} › {{ui:Työkalurivi}} › {{ui:Kuvakkeet ja nimiöt}}, {{ui:Vain kuvakkeet}} tai {{ui:Vain nimiöt}}, sekä {{ui:Näytä ryhmien nimet (Tiedosto, Piirrä, …)}}.

## Paneelit pysyvät omina

Vasen ja oikea paneeli säilyttävät kaiken kohdassa [Paneelien järjestäminen](common:arrange-panels) kuvatun: kiinnityksen, kellutuksen, nastan, piilotuksen, välilehdet, {{ui:Siirrä uuteen ikkunaan}} ja {{ui:Palauta asettelu}}.

## Palaa klassiseen asetteluun

Avaa {{ui:Asetukset}} › {{ui:Yleinen}} › {{ui:Asettelu}} › {{ui:Työtila}} ja valitse {{ui:CadCraft klassinen}}. Jokainen työkalurivi, välilehti ja paneeli palaa entiseen paikkaansa.

:::note
Puhelimessa tai ikkunassa, joka on 760 pikseliä leveä tai kapeampi, sovellus käyttää puhelinasettelua valinnastasi riippumatta. Leveämpi ikkuna tuo asettelun takaisin.
:::

Muun järjestelyn kokeilemiseen katso [valintanauhan ja projektiselaimen asettelu](common:layout-ribbon).

Asettelun näytettävän sisällön muuttamiseen katso [Muuta asettelua näytöllä](common:layout-edit); tummaan järjestelyyn, jossa on valikkopalkki ja valintanauha, katso [Piirustuksen asettelu](common:layout-drafting).
