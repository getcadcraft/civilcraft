---
title: Mittausviivat ja poikkileikkaukset
summary: Leikkaa poikkileikkaukset kohtisuoraan linjaukseen, katso maanpinta, suunnitelma sekä leikkaus ja täyttö kullakin paalulla ja saa tilavuudet keskimääräisten pääpinta-alojen menetelmällä.
keywords: massakäyrä, massakäyrän kuvaaja, tasapainopiste, kutistuma, paisuma, siirtomatka, lainaus, ylijäämä, leikkausarkit, poikkileikkausarkit, leikkaukset pdf, leikkaukset, poikkileikkaukset, mittausviivat, leikkausnäkymä, leikkaus, täyttö, pinta-alat, keskimääräinen pääpinta-ala, päätepinta-alojen tilavuudet, maansiirto, paalu, siirtymä, csv
from: 5060173c
---

Poikkileikkaus näyttää tien sellaisena kuin se rakennetaan: linjauksen poikki yhdellä paalulla, nykyinen maanpinta, suunnitelma (käytävä tai alusta tasattuna) sekä leikkaus ja täyttö niiden välillä.

## Lisää mittausviivat

1. Valitse linjaus. Kohdassa **Ominaisuudet**, osiossa **Mittausviivat**, napsauta {{ui:Lisää mittausviivat}}.
2. Aseta **Väli** (tiheys: 50 ft tai 20 m aluksi), **Vasen leveys** ja **Oikea leveys** (kuinka kauas kukin leikkaus ulottuu keskilinjasta).
3. Leikataksesi leikkauksen tietyllä paalulla kirjoita se kenttään **Lisää paalu** (esimerkiksi `2+35`) ja paina {{key:Enter}}.

Leikkaukset tehdään jokaisessa välin kokonaiskerrannassa, linjauksen molemmissa päissä, kunkin kaarteen alussa ja lopussa (PC ja PT) sekä lisäämilläsi paaluilla. Mittausviivat näkyvät pohjakuvassa harmaina viivoina linjauksen poikki; ne menevät myös DXF-, DWG- ja PDF-tiedostoihin tasolle C-ROAD-SCTN. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Leikkausnäkymä

Avaa se {{ui:Leikkausnäkymä}}-painikkeella linjauksen **Ominaisuudet**-kohdassa, {{ui:Leikkaukset}}-kohdasta **Maastomalli** › {{ui:Lisää}} -kohdassa tai {{key:X}}-näppäimellä. Se korvaa pituusleikkausnäkymän pohjakuvan alla.

- Siirry leikkauksesta toiseen palkin nuolilla, paalulistalla tai näppäimillä {{key:Left}} ja {{key:Right}}, kun leikkausnäkymä on valittuna ({{key:Home}} ja {{key:End}} ensimmäiseen ja viimeiseen).
- Harmaa viiva on nykyinen maanpinta, punainen viiva suunnitelma. Leikkaus on oranssilla varjostettu, täyttö vihreällä. Käytävän pisteet on merkitty: CL (keskilinja), EOP (päällysteen reuna), SH (olkapää) ja DL (reunaviiva).
- Otsikossa näkyvät paalu, tämän leikkauksen leikkaus- ja täyttöala sekä pystysuuntainen liioittelu. **Sovita** täyttää paneelin; valitse 1× nähdäksesi leikkauksen mittakaavassa.
- Paksu viiva pohjakuvassa näyttää, mikä leikkaus on näkyvissä.

## Leikkausarkit

{{ui:Leikkausarkit (PDF)}} kohdassa **Mittausviivat** sijoittaa jokaisen leikkauksen PDF-sivuille riveihin vasemmalta oikealle ja ylhäältä alas paalujärjestyksessä. Valitse **Paperi**, **Pohjakuvan mittakaava** (leikkausten vaakamittakaava) ja **Pituusleikkauksen liioittelu** (1×, 2×, 5× tai 10×); ikkuna kertoo, montako leikkausta sivulle mahtuu ja montako sivua siitä tulee.

Jokaisessa leikkauksessa on ruudukko siirtymillä ja korkeuksilla, maanpinta (katkoviiva), suunnitelma, leikkaus ja täyttö varjostettuina (oranssi ja vihreä), käytävän pisteet sekä sen alla paalu ja leikkaus- ja täyttöalat. Kaikki arkkien leikkaukset piirretään samankokoisina, riittävän korkeina suurimmalle. Kun se ei mahdu sivulle liioittelullasi, CivilCraft käyttää suurinta, joka mahtuu, ja kertoo siitä. Nimiökaistassa on linjauksen nimi, sivun paalut, mittakaavat ja ”Arkki 1 / 3”.

## Tilavuudet keskimääräisillä pääpinta-aloilla

Kahden vierekkäisen leikkauksen välillä tilavuus on niiden kahden pinta-alan keskiarvo kerrottuna paalujen välisellä etäisyydellä. Palkki näyttää linjauksen kokonaissummat, ja {{ui:CSV}} lataa jokaisen leikkauksen pinta-alat ja tilavuudet juoksevine summineen (kuutiojaardia jalkaprojekteissa, kuutiometriä metrijärjestelmäprojekteissa).

**Ominaisuudet** näyttää samat summat ruudukkomenetelmän tilavuuksien vieressä kohdasta [Maansiirron tilavuudet](topic:volumes). Ne ovat eri arvioita: lähemmät leikkaukset tuovat ne lähemmäs toisiaan, ja suoralla tiellä tasaisella maalla ne ovat samat.

:::note
Leikkaus ja täyttö lasketaan vain tasatuilla alueilla (käytävän tai alustan reunaviivojen sisällä), kuten ruudukkomenetelmässä. Ilman käytävää tai alustaa suunnitelma on maanpinta, joten leikkaus ei näytä leikkausta eikä täyttöä.
:::

## Massakäyrä

**Massakäyrä** kohdassa **Mittausviivat** piirtää massakäyrän samoista päätepinta-alan tilavuuksista: paalujen mukaan juokseva summa leikkauksesta miinus täyttö.

- **Leikkauksen kutistuma (−) tai paisuma (+)** kertoo, mitä kuutiojaardi leikkausta tekee, kun se on sijoitettu täytöksi: −10 % (aloitusarvo, paikkamerkki) tarkoittaa, että se kutistuu arvoon 0.9; paisuva kallio voi olla +5 %. Käytä geoteknisen raporttisi lukua.
- Missä viiva nousee, tie on leikkauksessa; missä se laskee, täytössä. Nollan yläpuolella (oranssilla varjostettu) maa siirtyy paalua ylöspäin; nollan alapuolella (vihreä) alaspäin.
- **Tasapainopisteet** ovat kohdat, joissa viiva ylittää nollan: kahden niiden välillä leikkaus ja täyttö tasapainottuvat. Taulukko listaa kunkin tasapainotetun osuuden, siirretyn tilavuuden (sen korkein tai matalin piste) ja keskimääräisen siirtomatkan (varjostettu ala jaettuna tuolla tilavuudella).
- Missä viiva päättyy nollasta poikkeavaan arvoon, jäljelle jäävä on **ylijäämää** (yläpuolella) tai **lainausta** (alapuolella). Viimeisellä osuudella siirretyksi lasketaan vain se maa, joka on sen tason yläpuolella, jolle se päättyy.

**CSV** tallentaa massaordinaatin jokaisella leikkauksella, osuudet ja kertoimen.
