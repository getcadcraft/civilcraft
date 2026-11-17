---
title: Vapaamuotoiset kohteet
summary: Tuo muussa sovelluksessa tehty muoto (STL, OBJ tai kirjastokohde) työmaalle; se seisoo maanpinnalla tai leikataan siihen, ja sen tilavuus, pinta-ala ja pohjapiirros lasketaan kuten muut kohteet.
keywords: vapaamuotoinen, mukautettu kohde, veistos, istutusastia, penkki, verkko, stl, obj, kirjastokohde, maastoon sopiva, seuraa maanpintaa, leikkautuu maanpintaan, määrät, tilavuus, ifc
from: ec835f33
---

Kertaluonteinen kohde (istutusastia, istuinmuuri, veistos, leikkikumpu) voidaan tehdä ModelCraftissa tai PartCraftissa ja asettaa tähän, jotta se on samassa mallissa ja luetteloissa kuin kaikki muu.

1. Maisema › {{ui:Lisää}} › {{ui:Vapaamuotoinen kohde…}} ja valitse **STL**- tai **OBJ**-tiedosto (projektin yksiköissä: jaloissa jalkaprojektissa, metreissä metriprojektissa) tai CadCraft-**kirjastokohde** (`.json`), jossa on verkkorunko.
2. Napsauta kohtaa, johon se menee.

## Sen pohja

- **Seuraa maanpintaa**: sen alin piste asetetaan alimman maanpinnan kohdalle sen pohjapiirroksen alla, joten mikään ei leiju. Ominaisuudet arvioivat, kuinka suuri osa siitä on maanpinnan alla.
- **Leikkaa maanpintaan**: sen pohja asetetaan tiettyyn korkeuteen, ja maanpinta sen pohjapiirroksen sisällä tasoitetaan siihen maanpinnan liittymäluiskilla; ne lasketaan maansiirrossa kuten alusta.

Käännä sitä kohdasta **Kierrä** ja vedä pohjakuvassa siirtääksesi sitä.

## Laskettu

Ominaisuudet antavat sen **tilavuuden** (suljetulle kiinteälle kappaleelle), **pinta-alan**, **pohjapiirroksen** ja **korkeuden**, mitattuna verkosta. IFC-vienti kirjoittaa sen valitsemallasi **IFC-luokalla** ja näillä määrillä.

:::note
Pohjapiirros on ääriviivan kupera vaippa: kovera muoto (L-muotoinen istutusastia) tasoitetaan kuin se olisi täytetty.
:::
