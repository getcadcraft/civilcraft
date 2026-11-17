---
title: Talotasanteet rinteisillä tonteilla
summary: Alustan tasaaminen rinteessä: tukimuurit alustan reunoina, leikkaus- ja pengerkartta syvyyden mukaan varjostettuna korkeuspisteineen (suunnitelma ja 3D), vapaasti piirrettävä leikkaus maanpinnan ja suunnitelman läpi sekä rampit tai kaltevat alustat ajoteille.
keywords: talotasanne, alusta, talon alusta, rinne, rinnetontti, tukimuuri, leikkaus ja penger, leikkauskartta, korkeuspisteet, vapaa leikkaus, leikkausviiva, kunnan piirustukset, ajotie, ramppi, kaltevat alustat, tasaus, turpoamiskerroin, maanrakennus
from: daa08a3f
---

Talotasanne on **alusta** (**Suunnittelu** › {{ui:Alusta}}): tasainen monikulmio yhdessä korkeudessa, tasattuna maanpintaan. Neljä asiaa auttaa rinteessä.

## Tukimuurit alustan reunoina

Valitse alusta ja aseta sivu arvoon {{ui:Pystysuora (tukimuuri)}} rinteen sijaan (**Ominaisuudet** › {{ui:Sivut ja tukimuurit}}, tai {{ui:Pystysuora: tukimuurit}} kaikille sivuille kerralla). Seinän korkeus luetaan maanpinnasta sen vierestä: yläpinta maanpinnassa, alapinta alustassa. Se näytetään molemmissa päissä ja korkeimmassa kohdassa suunnitelmalla, ja varoitus tulee, kun se on korkeampi kuin asettamasi raja. Seinät ja rinteet voi yhdistää vierekkäin.

## Leikkaus- ja pengerkartta

Rastita {{ui:Leikkaus- ja penger kartta}} kohdassa **Näytä**. Suunnitelma varjostetaan sen mukaan, kuinka syvä leikkaus tai penger on, yhtä suurin askelin (leikkaus lämmin, penger sininen, lähes tasainen vaalea) selitteen kera. Alustalle tulostetaan **korkeuspisteet**: tason muutos ruudukon pisteissä, sekä syvin leikkaus ja korkein penger merkittyinä ▲. Solut ovat samat, joita maanrakennuksen tilavuudet käyttävät, joten kartta ja luvut täsmäävät aina.

3D-näkymässä valitse **Leikkaus ja penger** värilistasta, jolloin samat värit levitetään maanpinnan ja suunnitelman päälle.

Turpoamis- tai kutistumiskerroin on massakäyrän työkalussa (**Suunnittelu** › {{ui:Massakäyrä}}); sitä ei sovelleta alustan tilavuuksiin.

## Vapaa leikkaus

Valitse **Pinta** › {{ui:Lisää}}, sitten {{ui:Vapaa leikkaus}}, napsauta leikkausviivan pisteet mihin tahansa (se saa taipua) ja paina {{key:Enter}}. Ikkuna piirtää leikkauksen: nykyisen maanpinnan, suunnitellun tasatun pinnan (katkoviivalla) ja niiden välisen leikkauksen ja pengerryksen varjostettuna pinta-aloineen (suunnitelma lasketaan vain alustojen ja teiden sisältä). **Pystysuuntainen liioittelu** asettuu oletuksena sopimaan piirrokseen; {{ui:Tallenna SVG:nä}} ja {{ui:Tallenna CSV:nä}} antavat piirroksen kunnalle ja luvut.

## Rampit ja kaltevat alustat

Valitse **Pinta** › {{ui:Lisää}}, sitten {{ui:Ramppi tai kalteva alusta}}, napsauta alempi pää ja sitten korkeampi pää, paina {{key:Enter}} ja anna leveys, alemman pään korkeus ja kaltevuus. Alusta on kaistale, jonka kulmissa on nuo tasot (kahden kulman välinen reuna kulkee vakiokaltevuudella), ja se tasataan maanpintaan kuten mikä tahansa alusta. Minkä tahansa alustan kulmilla voi olla myös omat korkeutensa, joten ajotie, ramppi tai kallistettu terassi on alusta, jonka jokaisessa kulmassa on korkeus.
