---
title: Näppäimistö ja hiiri
summary: Jokainen pikanäppäin sekä hiiren, kosketuslevyn ja kosketusnäytön toiminto CivilCraftissa ryhmiteltynä, selaimen ja alustan eroineen.
keywords: näppäimistö, pikanäppäimet, pikanäppäin, näppäimet, hiiri, kosketuslevy, kosketus, panoroi, zoomaa, nipistys, rulla, oikea napsautus, mac, Command-näppäin
from: a9756f46
---

Yksikirjaimiset näppäimet toimivat, kun et kirjoita ruutuun. Pikanäppäimet, joissa on {{key:Mod}}, käyttävät Macilla Command-näppäintä ja muualla Ctrl-näppäintä. Katso myös [Näppäimet selaimessa](common:keys).

## Tiedostot ja muokkaus

| Näppäin | Toiminto |
|---|---|
| {{key:Mod+O}} | Avaa pistetiedosto, LandXML tai projekti |
| {{key:Mod+S}} | Tallenna projekti (lataa `.civilcraft.json`-tiedoston) |
| {{key:Mod+P}} | Plottaa suunnitelma PDF-muotoon (avaa plottausikkunan, ei selaimen tulostusta) |
| {{key:Mod+Z}} | Kumoa |
| {{key:Mod+Y}} | Tee uudelleen |
| {{key:Delete}} | Poista valitut mittauspisteet, linjaus, alusta, rakenne, putki tai PVI |
| {{key:Mod+C}} | Kopioi valitut mittauspisteet (myös taulukkolaskentaan sopivina riveinä) |
| {{key:Mod+X}} | Leikkaa valitut mittauspisteet |
| {{key:Mod+V}} | Liitä pisteet: ne seuraavat osoitinta, napsauta, mihin ne menevät |
| {{key:Mod+Shift+V}} | Liitä samaan paikkaan: pisteiden omiin koordinaatteihin |
| {{key:Mod+D}} | Monista valitut pisteet: kopio seuraa osoitinta |
| {{key:Mod+A}} | Valitse kaikki mittauspisteet |
| {{key:Esc}} | Poista valinta (ja peru liittäminen) |

{{key:Mod+S}}, {{key:Mod+O}} ja {{key:Mod+P}} toimivat myös silloin, kun kirjoitat ruutuun. {{key:Mod+Z}} ja {{key:Mod+Y}} tekstiruudussa kumoavat kirjoituksesi tavalliseen tapaan, samoin {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} ja {{key:Mod+A}}: ruudussa ne kopioivat, leikkaavat, liittävät ja valitsevat sen tekstin. Kun sivulla (paneelissa) on tekstiä valittuna, {{key:Mod+C}} kopioi sen tekstin. {{key:Mod+Shift+Z}} ei tee CivilCraftissa mitään: käytä {{key:Mod+Y}} tai {{ui:Tee uudelleen}}-painiketta.

:::mac
Mac-näppäimistön delete-näppäin on selaimessa {{key:Backspace}}. Poistaaksesi valinnan paina {{key:Delete}} (Fn ja delete), tai valitse {{ui:Poista}} työkalurivin {{ui:Lisää}}-valikosta.
:::

## Työkalut

| Näppäin | Työkalu |
|---|---|
| {{key:V}} | {{ui:Valitse}} |
| {{key:M}} | {{ui:Mittaa}}: etäisyydet, alat ja kaltevuudet suunnitelmalla ([Mittaa](topic:measure)) |
| {{key:A}} | {{ui:Linjaus}} |
| {{key:G}} | {{ui:Alusta}} |
| {{key:P}} | {{ui:Putket}} |
| {{key:B}} | {{ui:Taitelinja}} |
| {{key:O}} | {{ui:Raja}} |
| {{key:R}} | Näytä tai piilota pituusleikkausnäkymä |
| {{key:I}} | Kytke {{ui:Lisää PVI:t}} päälle tai pois (avaa pituusleikkausnäkymän, jos se on kiinni) |
| {{key:F}} | {{ui:Sovita}}: näytä kaikki |
| {{key:D}} | {{ui:3D}}: näytä kohde 3D:nä tai palaa suunnitelmaan |
| {{key:E}} | Näytä tai piilota kaltevuudet ja korkeudet kaikkia taitelinjoja pitkin (vain näytöllä) |

Kun painat aktiivisen työkalun näppäintä uudelleen, palaat työkaluun {{ui:Valitse}}. Kirjaimet Shiftin kanssa eivät tee mitään.

## Piirtäessä

| Näppäin | Toiminto |
|---|---|
| {{key:Enter}} | Viimeistele linjaus, alusta, putkijuoksu, taitelinja tai raja |
| {{key:Backspace}} | Poista viimeksi napsautettu piste |
| {{key:C}} | Taitelinja: kytke kaaret päälle tai pois (kärjen jälkeen napsauta kaarella olevaa pistettä, sitten sen päätä) |
| {{key:Esc}} | Peru piirtäminen (tai liittäminen); kun painat uudelleen (tai kun mitään ei ole piirretty), palaat työkaluun {{ui:Valitse}} ja tyhjennät valinnan |

## Suunnitelmanäkymä

| Näppäin tai toiminto | Tulos |
|---|---|
| Rulla | Zoomaa sisään tai ulos osoittimen kohdalla |
| Veto tyhjään tilaan | Panoroi (missä tahansa työkalussa; lyhyt napsautus napsauttaa yhä; kun {{key:Shift}} on pohjassa, se piirtää valintalaatikon) |
| Veto keskinäppäimellä | Panoroi |
| Veto oikealla napilla | Panoroi (ei avaa valikkoa) |
| {{key:Space}} ja veto | Panoroi |
| Napsautus | Valitse ({{ui:Valitse}}-työkalulla) tai aseta piste (piirtotyökalulla) |
| {{key:Shift}} ja napsautus | Lisää mittauspiste valintaan tai poista se |
| {{key:Shift}} ja veto | Piirrä laatikko: sen sisällä olevat mittauspisteet lisätään valintaan. Vedä niiden ympäri [lassolla](topic:lasso-selection) |
| {{key:Space}} lassoa piirtäessä | Ikkuna, sitten leikkaava, sitten aita |
| Napsautus liitettäessä | Aseta liitetyt pisteet siihen ({{key:Enter}} asettaa ne niiden omiin koordinaatteihin) |
| Veto otetta | Siirtää PI:tä, alustan kulmaa tai rakennetta (yksi kumousaskel) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Panoroi, kun suunnitelmalla on kohdistus (napsauta ensin) |
| {{key:Plus}} ja {{key:Minus}} | Zoomaa sisään ja ulos keskeltä, kun suunnitelmalla on kohdistus |

Näppäin = zoomaa sisään kuten {{key:Plus}}, joten Shiftiä ei tarvita.

## Pituusleikkausnäkymä

| Toiminto | Tulos |
|---|---|
| Napsautus, kun {{ui:Lisää PVI:t}} on päällä | Lisää PVI siihen |
| Napsautus PVI:tä | Valitse se |
| Veto PVI:tä | Siirrä sitä (yksi kumousaskel) |
| {{key:Delete}} tai {{key:Backspace}} | Poista valittu PVI ({{key:Backspace}} vain, kun pituusleikkausnäkymällä on kohdistus) |

Pituusleikkausnäkymä ei zoomaa eikä panoroi.

## Näyttö ja ohje

| Näppäin | Toiminto |
|---|---|
| {{key:F1}} | Avaa tai sulje tämä ohje (sivupaneeli); {{ui:Ohje}} sovelluspalkissa tekee saman |
| {{key:Esc}} | Sulje ohjepaneeli, kun se on auki |
| {{key:Ctrl+Shift+F}} | Vaihda näyttötilaa: koko näyttö, koko näyttö piilotetuin palkein, normaali |
| {{key:Esc}} | Poistu koko näytöstä (selaimen oma näppäin) |

{{key:F1}} tavoittaa ohjeen ennen CivilCraftia, joten se toimii missä tahansa työkalussa. Useimmissa Mac-näppäimistöissä paina fn ja F1, tai napsauta {{ui:Ohje}}. {{key:Ctrl+Shift+F}} käyttää Control-näppäintä kaikilla alustoilla, myös Macilla. Katso [Ohjeen käyttö](common:help), miten tätä ohjetta haetaan.

## Hiiri, kosketuslevy ja kosketus

:::mouse
- Rulla zoomaa osoittimen kohdalla. Vapaasti pyörivä rulla zoomaa nopeasti: anna sille lyhyitä käännöksiä.
- Panoroi minkä tahansa vedon avulla tyhjällä tilalla, keskinäppäimellä, oikealla napilla tai {{key:Space}} ja veto.
:::

:::mac
Mac-kosketuslevyllä:

- Kahden sormen vieritys **zoomaa** (se ei panoroi), ja nipistys zoomaa myös.
- Panoroidaksesi paina ja vedä tyhjää tilaa yhdellä sormella, tai pidä {{key:Space}} pohjassa ja vedä.
- Kahden sormen napsautus (oikea napsautus) ei avaa valikkoa eikä tee mitään yksin.
:::

:::touch
Kosketusnäytöllä:

- Ensimmäinen kosketus tekee painikkeista ja valikkoriveistä sormen kokoisia.
- Napauta valitaksesi tai asettaaksesi pisteen; yksi sormi vedettynä tyhjällä tilalla panoroi. Napautus saattaa heilahtaa hieman: panoroi vasta, kun sormi on liikkunut noin 10 pikseliä.
- Kaksi sormea nipistää zoomaukseen ja liikkuu yhdessä panoroidakseen.
- Vedä otetta tai PVI:tä yhdellä sormella. Otteet ottavat sormen leveyden ympärilleen.
- Kun piirrät linjausta, alustaa, taitelinjaa, rajaa, putkijuoksua, virtausviivaa tai tonttia, suunnitelman yllä oleva palkki tarjoaa {{ui:Valmis}} ({{key:Enter}}), {{ui:Kumoa piste}} ({{key:Backspace}}) ja {{ui:Peruuta}} ({{key:Esc}}). Pitkä painallus (puoli sekuntia liikkumatta) viimeistelee myös.
- {{ui:Valitse}}-työkalussa pitkä painallus mittauspisteellä lisää sen valintaan tai poistaa sen, kuten {{key:Shift}}+napsautus tekee.
- 3D-näkymässä yksi sormi kiertää, kaksi nipistää ja panoroi, ja napautus valitsee.
- Kosketuksessa ei ole kohdistusta, joten tilarivin lukemat päivittyvät vain, kun sormi on alhaalla.
:::

## Selaimen näppäimet, jotka voittavat

Jotkin näppäimet kuuluvat selaimelle eivätkä koskaan tavoita CivilCraftia, esimerkiksi {{key:Mod+W}} (sulje välilehti), {{key:Mod+T}} (uusi välilehti), {{key:Mod+N}} (uusi ikkuna) ja {{key:F11}} (koko näyttö Windowsin ja Linuxin selaimissa). CivilCraft ei käytä niitä. Jos pikanäppäin avaa jotakin selaimessa, napsauta suunnitelmaa kerran, jotta sivulla on kohdistus, ja yritä uudelleen.

## Missä Siirrä-toiminto on

Siirrä-komentoa ei ole: valitse {{ui:Valitse}} ja vedä piste tai kärkipiste, tai muokkaa sen koordinaatteja kohdassa {{ui:Ominaisuudet}}. Katso [Muokkaa pisteitä](topic:edit-points).
