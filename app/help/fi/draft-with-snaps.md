---
title: Piirrä tartunnoilla, valituilla kulmilla sekä siirrä, kopioi ja kierrä
summary: Sijoita linjaukset, alustat, tontit ja taitelinjat tarkalleen olemassa oleviin pisteisiin ja kulmiin, kirjoita tai valitse kulman itä- ja pohjoiskoordinaatti, käännä tangentti kahta pistettä kohti sekä siirrä, kopioi tai kierrä kohdetta etäisyydellä tai kulmalla.
keywords: tartunta, tartunnat, kohteen tartunta, tartu pisteeseen, tartu kulmaan, PI, kärkipiste, kulma, valitse, tähtäin, itä, pohjoinen, koordinaatit, kirjoitetut koordinaatit, tangentti, suunta, suuntakulma, siirrä, kopioi, kierrä, muunna, kopioi kierrettynä, monista, Alt, vapaa piste, piirtäminen
from: 49864dda
---

Uutta versiossa 0.9: kun piirrät, kursori osuu jo suunnitelmassa oleviin pisteisiin ja kulmiin, ja alustan, tontin tai taitelinjan kulman voi kirjoittaa tai valita. Tämä aihe käy läpi kolme työkalua.

## Mitä teet

- Piirrä tartunnoilla, niin että uusi linjaus, alusta, tontti tai viiva alkaa ja päättyy tarkalleen olemassa olevaan kohtaan.
- Aseta kulman itä- ja pohjoiskoordinaatti kirjoittamalla se tai valitsemalla paikka suunnitelmasta.
- Käännä linjauksen tangentti kahta valittua pistettä kohti.
- Siirrä, kopioi tai kierrä koko kohde.

## Vaiheet

1. Valitse piirtotyökalu, esimerkiksi {{ui:Linjaus}}, {{ui:Alusta}}, {{ui:Tontti}} tai {{ui:Taitelinja}}. Vie osoitin lähelle mittauspistettä, linjauksen PI:tä, alustan, tontin tai massan kulmaa, taitelinjan kärkipistettä tai hulevesirakennetta. Merkki ilmestyy tunnisteen (PI, Kulma, Kärkipiste, Rakenne tai Piste ja sen numero) ja itä- ja pohjoiskoordinaattien kanssa, joihin se osuu. Napsauta sijoittaaksesi pisteen siihen.
2. Jos haluat sijoittaa pisteen vapaasti, pidä {{key:Alt}}-näppäintä pohjassa napsauttaessasi. Tartunta kytkeytyy pois.
3. Valitse alusta, tontti tai taitelinja. Ominaisuuksissa lohko {{ui:Kulmat}} luettelee jokaisen kulman, jolla on Itä-kenttä ja Pohjoinen-kenttä. Kirjoita uudet numerot tai paina kulman vieressä olevaa tähtäinpainiketta ja napsauta paikkaa suunnitelmassa. Kulma saa sen itä- ja pohjoiskoordinaatin. Paina {{key:Esc}} peruuttaaksesi valinnan. Tähtäin toimii vain suunnitelmassa: sulje ensin 3D-näkymä.
4. Kääntääksesi tangentin valitse linjaus. Ominaisuuksissa kohdassa {{ui:Tangentti kahdesta pisteestä}} valitse tangentti, paina {{ui:Ensimmäinen piste}} ja napsauta suunnitelmassa, paina {{ui:Toinen piste}} ja napsauta uudelleen, ja paina sitten {{ui:Aseta suunta}}. Tangentti kääntyy kulkemaan ensimmäisestä pisteestä kohti toista ja säilyttää pituutensa.
5. Siirtääksesi, kopioidaksesi tai kiertääksesi valitse linjaus, alusta, tontti tai taitelinja. Ominaisuuksissa kohdassa {{ui:Siirrä, kopioi ja kierrä}} kirjoita {{ui:Siirrä itään}} ja {{ui:Siirrä pohjoiseen}} (negatiiviset luvut menevät länteen ja etelään) ja paina {{ui:Siirrä}} tai {{ui:Kopioi}}. Tai paina {{ui:Etäisyys kahdesta pisteestä}} ja napsauta pistettä, josta siirretään, ja pistettä, johon siirretään.
6. Kiertääksesi kirjoita kulma kenttään {{ui:Kierrä vastapäivään}} (asteina) ja paina sitten {{ui:Kierrä}} tai {{ui:Kopioi kierrettynä}}. Kohde kiertyy kulmiensa keskikohdan ympäri, ellei valitse kulman vieressä olevalla tähtäimellä pistettä, jonka ympäri kiertää.

## Huomautuksia

- Kopio jättää alkuperäisen paikalleen, ja kopio valitaan sen jälkeen.
- Jokainen siirto, kopiointi, kierto, valittu kulma ja käännetty tangentti on yksi kumoamisvaihe.
- Tartunta ulottuu 10 näyttöpikselin päähän kursorista. Tartuntamerkki ehdottaa vain paikkaa; mitään ei muuteta ennen kuin napsautat.
- Sama tähtäin on linjauksen PI-riveillä. Katso [Linjaukset](topic:alignment), [Tontit](topic:parcels) ja [Taitelinjat](topic:feature-lines).
