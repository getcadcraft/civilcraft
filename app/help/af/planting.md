---
title: Beplantingsplanne en skedules
summary: Plaas enkele plante, plantbedde wat by die plante se afstand gevul word met gemengde plante volgens persentasie, en heininge; merk hulle; tel hulle in 'n plantskedule vir 'n sigblad of TakeoffCraft.
keywords: beplantingsplan, plantskedule, plantbed, massabeplanting, heining, boom, bossie, grondbedekker, afstand, driehoekige afstand, plantetelling, hoeveelhede, etikette, kroon, plantsimbole, ifc, hoeveelheidsopname
from: ab49eab5
---

## Plaas plante

1. Kies 'n plant in **Plante** aan die linkerkant.
2. Klik {{ui:Plant}}, en klik dan op die plan: elke klik plaas een plant. Druk {{key:Esc}} om op te hou.

'n Plant se simbool word by sy spreiding by volwassenheid geteken; Meer › {{ui:Wys by plantgrootte}} teken elke plant op die grootte waarin dit geplant word. Bome staan op die grond onder hulle: wanneer jy die terrein later gelykmaak, volg hulle dit. Om 'n plant eerder op 'n hoogtepeil vas te sit, tik dit in **Hoogtepeil** in **Eienskappe**.

## Plantbedde

1. Kies die hoofplant, klik {{ui:Plantbed}} en klik die bed se hoeke. Druk {{key:Enter}} (of klik die eerste hoek weer) om dit te sluit.
2. Die bed word met daardie plant by sy afstand gevul, in 'n **driehoekige** patroon (die gewone een: elke plant dieselfde afstand van ses ander), 'n halwe afstand van die rand af.
3. In **Eienskappe** meng **Voeg 'n plant by** die plant wat links gekies is. Stel elke plant se **Aandeel %**: die bed neem presies daardie hoeveelheid van elk, versprei oor die bed. **Meng weer** skommel waar hulle gaan.

As **Afstand** leeg is, gebruik die plante se eie afstand (geweeg volgens hul aandele); tik een om dit vir elke plant te gebruik. **Patroon** kan vierkantig wees, en **Rye by** draai die rye.

## Heininge

Kies die heiningplant, klik {{ui:Heining}}, klik langs die heining en druk {{key:Enter}}. Plante gaan langs die lyn by hul afstand, gesentreer sodat albei punte dieselfde rand het. 'n Heining kan **twee rye, verspring** wees, 'n vaste afstand uitmekaar.

## Etikette

Enkele plante word met die etiketinstelling gemerk (standaard `{name}`); tik jou eie etiket vir een plant in **Eienskappe**. Plantbedde word met elke plant se telling gemerk, heininge met hulle s'n. Meer › {{ui:Plantetikette}} skakel etikette aan en af. Etiketvelde: `{name}`, `{botanical}`, `{size}` (die houer), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Die plantskedule

Meer › {{ui:Plantskedule…}} tel elke plant volgens spesie, van enkele plante, bedde en heininge saam, met sy plantgrootte. Stoor dit as **CSV** of **XLSX**, of **Stuur na TakeoffCraft**: 'n hoeveelhedelêer wat TakeoffCraft oopmaak om die plante te prys (met die harde afwerking- en besproeiingshoeveelhede langs hulle).

## IFC

Meer › {{ui:Voer landskap-IFC uit}} stoor die landskap as 'n IFC-lêer (IFC 4.3) wat 'n BIM-model kan hou: elke plant 'n `IfcGeographicElement` van tipe VEGETATION, getipeer volgens sy spesie met die plant se eienskappe (botaniese naam, groottes, winterhardheid, water, lig), elke bed en heining een element met sy tellings, op die terrein. BimCraft maak dit langs die gebou oop.
