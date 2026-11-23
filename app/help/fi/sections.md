---
title: Mittausviivat ja poikkileikkaukset
summary: Leikkaa poikkileikkaukset linjaukseen nähden suorassa kulmassa, katso maanpinta, suunnitelma sekä leikkaus ja täyttö kullakin paalulla ja laske tilavuudet keskipinta-alamenetelmällä.
keywords: massakuljetus, massakaavio, tasapainopiste, kutistuminen, paisuminen, kuljetusmatka, lainaus, jäte, poikkileikkausarkit, leikkausarkit, poikkileikkaukset pdf, poikkileikkaukset, mittausviivat, leikkausnäkymä, leikkaus, täyttö, pinta-alat, keskipinta-ala, maamäärät, paalu, siirtymä, csv
from: 09639ce2
---

Poikkileikkaus näyttää tien siinä muodossa, jossa se rakennetaan: linjauksen poikki yhdessä paalussa olevan maanpinnan, suunnitelman (käytävä tai platta tasattuna sisään) sekä niiden välisen leikkauksen ja täytön.

## Lisää mittausviivat

1. Valitse linjaus. Kohdassa **Ominaisuudet** ja **Mittausviivat** napsauta {{ui:Lisää mittausviivat}}.
2. Aseta **Väli** (aluksi 50 ft tai 20 m), **Vasen leveys** ja **Oikea leveys** (kuinka pitkälle kukin poikkileikkaus ulottuu keskilinjasta).
3. Leikataksesi poikkileikkauksen tietyssä paalussa, kirjoita se kohtaan **Lisää paalu** (esimerkiksi `2+35`) ja paina {{key:Enter}}.

Poikkileikkaukset leikataan jokaisessa välin kokonaiskerrannaisessa, linjauksen molemmissa päissä, jokaisen kaarteen alussa ja lopussa (PC ja PT) sekä lisäämissäsi paaluissa. Mittausviivat näkyvät pohjapiirroksessa harmaina viivoina linjauksen poikki; ne menevät myös DXF-, DWG- ja PDF-tiedostoihin tasolle C-ROAD-SCTN. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Poikkileikkausnäkymä

Avaa se linjauksen **Ominaisuudet**-kohdan {{ui:Leikkausnäkymä}}-painikkeella, kohdasta **Maastomalli** › {{ui:Lisää}} › {{ui:Leikkaukset}}, tai näppäimellä {{key:X}}. Se korvaa pohjapiirroksen alla olevan pituusleikkausnäkymän.

- Siirry poikkileikkauksissa palkin nuolilla, paaluluettelosta tai näppäimillä {{key:Left}} ja {{key:Right}} kun leikkausnäkymä on aktiivinen ({{key:Home}} ja {{key:End}} ensimmäiseen ja viimeiseen).
- Harmaa viiva on nykyinen maanpinta, punainen viiva suunnitelma. Leikkaus on varjostettu oranssilla, täyttö vihreällä. Käytävän pisteet on merkitty: CL (keskilinja), EOP (ajoradan reuna), SH (piennar) ja DL (rajaviiva).
- Otsikko kertoo paalun, tämän poikkileikkauksen leikkaus- ja täyttöalat sekä pystysuuntaisen liioittelun. {{ui:Sovita}} täyttää paneelin; valitse 1× nähdäksesi poikkileikkauksen oikeassa mittakaavassa.
- Pohjapiirroksen paksu viiva näyttää, mikä poikkileikkaus on näytöllä.
- **Zoomaus ja siirto:** rulla zoomaa osoittimen kohdalta, ja vetäminen siirtää näkymää. {{ui:Sovita}} (tai {{key:F}} tai kaksoisnapsautus) sovittaa koko poikkileikkauksen taas.

## Mittaa poikkileikkauksessa

1. Napsauta leikkauspalkin {{ui:Mittaa}}-painiketta tai paina {{key:M}}. Vihje sanoo: ”Napsauta ensimmäinen piste ja sen jälkeen toinen.”
2. Napsauta kaksi pistettä. Kukin tarttuu viivan päähän tai käytävän pisteeseen (CL, EOP, SH, DL); pidä {{key:Alt}} painettuna vapaalle pisteelle.
3. Lukema antaa vaakaetäisyyden (ΔH), pystyetäisyyden (ΔV), kaltevuuden prosentteina suhteineen ja suoran pituuden projektin yksiköissä.

Napsauta uudelleen aloittaaksesi uuden mittauksen. {{key:Esc}} tyhjentää sen, ja {{key:M}} kytkee Mittaa-toiminnon pois.

## Poikkileikkausarkit

{{ui:Leikkausarkit (PDF)}} kohdassa **Mittausviivat** laittaa jokaisen poikkileikkauksen PDF-sivuille riveihin vasemmalta oikealle ja ylhäältä alas paalujärjestyksessä. Valitse **Paperi**, **Mittakaava** (poikkileikkausten vaakamittakaava) ja **Pystysuuntainen liioittelu** (1×, 2×, 5× tai 10×); valintaikkuna kertoo, kuinka monta poikkileikkausta mahtuu sivulle ja kuinka monta sivua siitä tulee.

Jokaisessa poikkileikkauksessa on ruudukko etäisyyksineen ja korkeuksineen, maanpinta (katkoviivana), suunnitelma, leikkaus ja täyttö varjostettuina (oranssi ja vihreä), käytävän pisteet, ja sen alla paalu sekä leikkaus- ja täyttöalat. Kaikki arkkien poikkileikkaukset piirretään samankokoisina, riittävän korkeina suurimmalle niistä; kun se ei mahdu sivulle käytetyllä liioittelulla, CivilCraft käyttää suurinta, joka mahtuu, ja kertoo siitä. Otsikkoriviin tulevat linjauksen nimi, sivun paalut, mittakaavat ja ”Arkki 1/3”.

## Mihin leikkaus ja täyttö mitataan

Käytävällä voi olla kerroksia päällysteen alla: päällysrakennekerroksia, pohjan osia, ajorata. Leikkauspalkin valitsin **Tilavuudet mitataan** määrittää, mihin leikkaus ja täyttö ulottuvat:

- **Alapinta** (oletus): näiden osien alareunaan asti, joten leikkaukseen kuuluu päällysrakenteen syvyys.
- **Yläpinta**: vain suunnitelman yläreunaan asti, niin kuin ennen osia laskettiin.

Otsikon alat, alla olevat tilavuudet, CSV ja massakuljetus seuraavat kaikki tätä valintaa, ja se tallennetaan projektin mukana.

## Tilavuudet keskipinta-alamenetelmällä

Kahden vierekkäisen poikkileikkauksen välillä tilavuus on niiden kahden alan keskiarvo kerrottuna niiden paalujen välisellä etäisyydellä. Palkki näyttää linjauksen yhteissummat, ja {{ui:CSV}} lataa jokaisen poikkileikkauksen alat ja tilavuudet juoksevine summineen (kuutiojaardia jalkaprojekteissa, kuutiometriä metrisissä).

**Ominaisuudet** näyttää samat summat ruudukkomenetelmän tilavuuksien rinnalla kohdasta [Maamäärät](topic:volumes). Ne ovat eri likiarvoja: tiheämmät poikkileikkaukset tuovat ne lähemmäs toisiaan, ja suoralla tiellä tasaisella maalla ne ovat samat.

:::note
Leikkaus ja täyttö lasketaan vain tasatun alueen sisällä (käytävän tai platan rajaviivojen sisällä), kuten ruudukkomenetelmässä. Ilman käytävää tai plattaa suunnitelma on maanpinta, joten poikkileikkaus ei näytä leikkausta eikä täyttöä.
:::

## Massakuljetus

**Massakuljetus** kohdassa **Mittausviivat** piirtää massakuljetuskaavion samoista keskipinta-alatilavuuksista: paalujen mukaan juokseva summa leikkauksesta vähennettynä täytöllä.

- **Leikkauksen kutistuminen (−) tai paisuminen (+)** kertoo, mitä kuutiojaardi leikkausta tuottaa, kun se asetetaan täytöksi: −10 % (aloitusarvo, paikkamerkki) tarkoittaa, että se kutistuu arvoon 0.9; kallio, joka paisuu, voi olla +5 %. Käytä geoteknisen raporttisi lukua.
- Kohdassa, jossa viiva nousee, tie on leikkauksessa; kohdassa, jossa se laskee, täytössä. Nollan yläpuolella (oranssilla varjostettu) maa siirtyy paaluluvun kasvavaan suuntaan; nollan alapuolella (vihreä) pienenevään suuntaan.
- **Tasapainopisteet** ovat kohdat, joissa viiva ylittää nollan: niiden välillä leikkaus ja täyttö tasapainottuvat. Taulukko luettelee kunkin tasapainotetun osuuden, siirretyn tilavuuden (sen korkein tai matalin piste) ja keskimääräisen kuljetusmatkan (varjostettu ala jaettuna tuolla tilavuudella).
- Kohdassa, jossa viiva päättyy nollan ulkopuolelle, jäljelle jäävä on **jätettä** (yläpuolella) tai **lainausta** (alapuolella). Viimeisellä osuudella siirretyksi lasketaan vain se maa, joka ylittää tason, jolla viiva päättyy.

**CSV** tallentaa massaordinaatin jokaisessa poikkileikkauksessa, osuudet ja kertoimen.
