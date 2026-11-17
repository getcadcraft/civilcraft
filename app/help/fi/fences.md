---
title: Aidat
summary: Aita taitelinjan, linjauksen, tontin tai alustan varrella: pylväät, kiskot, paneelit tai pystylaudat, portit, maaston mukaisesti tai porrastettuna, luettelo, suunnitelman symbolit ja IFC-rakennusosat. Saatavilla myös avustajalle.
keywords: aita, pylväät, kiskot, paneelit, pystylaudat, portti, maaston mukainen, porrastettu, maasto, luettelo, ifc, kaide, rajaus
from: c0e7b84a
---

Tee aita taitelinjan, linjauksen, tontin tai alustan varteen. Pylväät ja portit sijoitetaan puolestasi.

## Aidan tekeminen

1. Valitse viiva, tontti tai alusta.
2. Avaa **Maastomalli, Lisää, Aidat...**
3. Valitse tyyli (paneelit, kiskot tai pystylaudat), maaston mukainen tai porrastettu, korkeus, pylväsväli ja porttileveys. Valitse sitten **Aita valintaa pitkin** tai **Portilla**, jolloin portti sijoitetaan pisimmän suoran osuuden keskelle.

Pylväät sijoitetaan päihin, jokaiseen kulmaan (kärkeen, joka kääntyy vähintään 20 astetta), jokaisen portin molempiin reunoihin sekä tasavälein väliin niin, ettei mikään väli ole pitempi kuin pylväsväli. **Maaston mukaiset** paneelit seuraavat maanpintaa pylväiden välillä. **Porrastetut** paneelit pysyvät vaakasuorina ja porrastuvat pylväissä. Rako paneelin alla on leveimmillään sen alamäen puoleisessa pylväässä. Ikkuna varoittaa, jos rako ylittää rajan tai jos maanpinta nousee paneelin läpi. Portit, joiden leveys on 6 feet (1.8 m) tai enemmän, saavat kaksi lehteä. Pohjapiirroksessa lehdet näkyvät auki heilahdusalueineen.

## Luettelo ja tulosteet

Jokaisen aidan pituus, pylväät tyypeittäin, paneelit, portit ja askelmat näkyvät. **CSV**-luettelo sisältää pylväät, paneelit, kiskot, pystylaudat ja portit. Pohjapiirroksessa on aidan tasot (C-FENC, C-FENC-POST, C-FENC-GATE) PDF-, DXF- ja DWG-muotoihin. IFC-vienti sisältää pylväät (IfcMember, post), paneelit (IfcRailing, user defined fence panel), kiskot (IfcMember) ja portit (IfcDoor, gate). Järjestelmiä on yksi kutakin aitaa kohti.

## Avustajalta

`fence_build` tekee aidan (pisteiden tai nimetyn viivan, tontin tai alustan mukaan, portit paaluluvun mukaan), ja `fence_list` listaa aidat luetteloineen.

## Mitä ei ole vielä toteutettu

Aloituskoot ovat tavallisia valintoja, eivät määräyksiä. Kirjaston tyypit kulkevat mukana vain nimenä. Porttien täytyy sijaita yhdellä suoralla osuudella. BimCraftissa ei vielä ole tätä työkalua.
