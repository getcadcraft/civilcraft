---
title: Poves in napetost
summary: Vaši obtežni primeri (temperatura, veter, led) in omejitve napetosti, kako CivilCraft izračuna napetost vsakega prereza in tabele napenjanja.
keywords: poves, napetost, obtežni primer, temperatura, veter, led, asimetrični led, merodajni raspon, ekvivalentni raspon, sprememba stanja, verižnica, tabela napenjanja, prelomna trdnost, vsakdanja napetost
from: f8876c35
---

## Obtežni primeri in omejitve

{{ui:Več}} › {{ui:Obtežni primeri in omejitve …}} ureja pravila, ki jim sledi vsaka linija v projektu.

- **Obtežni primeri**: temperatura, tlak vetra na vodnik (Pa) in radialni led (mm, z njegovo gostoto). Prvi primer je referenčni.
- **Omejitve napetosti**: delež prelomne trdnosti vodnika, na vodoravno napetost ali na največjo napetost na podpori, v enem obtežnem primeru. Ali vpišite vodoravno napetost sami.
- **Odmiki**: odmik, ki ga vodnik ohrani nad tlemi, cesto, stavbo in podobno. Dodajajte, preimenujte in odstranjujte jih: so vaši. Pod njimi izberite pravila za **Rastlinje pod daljnovodom**, **Zidovi v krajini pod daljnovodom** in **Podzemni prehodi**.
- **Primeri, ki jih uporabljajo preverjanja**: kateri primer da največji poves (vroče), odklon izolatorja (veter), led in led na eni strani podpore.
- **Faktorji**: faktor razmika faz k, največji odklon izolatorja, faktor na obremenitve podpor in spojk, koti zasuka, pri katerih nastanejo kotne in zaključne podpore, najmanjša krovna plast nad zakopanimi kabli in največji padec napetosti.

## Paketi: pravila in knjižnica za državo

Nobena država pravil ni vgrajena v CivilCraft. **Paket** hrani nabor pravil in knjižnico skupaj v eni datoteki (`.cclinepack.json`), za državo, upravljavca omrežja ali podjetje:

- **Shrani kot paket…** v {{ui:Obtežni primeri in omejitve …}} zapiše prikazani nabor pravil in vašo knjižnico (ali, če v vaši knjižnici še ni ničesar, elemente, ki jih ta projekt uporablja). Najprej vpišite **Država ali regija**.
- **Odpri nabor pravil ali paket…** prebere paket, datoteko s pravili ali datoteko knjižnice. Pravila paketa so prikazana v pogovornem oknu (kliknite **Uporabi**, da jih uporabite), njegovi elementi pa gredo v vašo knjižnico.
- Paketi, ki jih drugi delijo, so navedeni na strani dodatkov pod **Paketi za daljnovode**. Dva primera paketov prikazujeta obliko; nista pravili nobene države.

Vsak paket se ob odpiranju preveri, kot vsaka datoteka. Pred gradnjo preverite vsako vrednost glede na veljaven standard.

Na voljo sta dva primera naborov pravil za začetek: **Primer: hladno podnebje** in **Primer: blago podnebje**. Njune vrednosti ne izhajajo iz nobenega standarda: vnesite vrednosti, ki jih določa vaš standard. {{ui:Shrani pravila}} in {{ui:Odpri pravila …}} delita nabor pravil kot datoteko.

## Kako se izračuna napetost

Za vsak prerez med zaključnimi podporami:

1. **Merodajni raspon** je √(ΣL³ ÷ ΣL) njegovih razponov.
2. Vsaka omejitev se pretvori v vodoravno napetost v referenčnem primeru prek **enačbe spremembe stanja** na merodajnem razponu: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najostrejša določi napetost.
3. Napetost vsakega obtežnega primera izhaja iz te, obliko vsakega raspona pa določa natančna **verižnica** skozi njegovi dve pritrdišči (tudi raspone na pobočju): poves glede na tetivo, dolžina in napetost na vsakem koncu.

Obtežba na meter v primeru: teža plus led (površina ledu × gostota × g) navpično; tlak vetra × premer z ledom vodoravno.

## Tabele napenjanja

{{ui:Več}} › {{ui:Tabele napenjanja …}} za vsak prerez izpiše vodoravno napetost in poves vsakega raspona pri vsaki temperaturi nabora pravil (na začetku od −5 °C do 40 °C po 5 °C), v mirnem zraku. Shranite jih in tabelo podpor kot CSV.

Ni upoštevano: lezenje vodnika skozi leta in raztezek novega vodnika. Dodajte ju prek temperatur, pri katerih napenjate.
