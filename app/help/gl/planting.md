---
title: Planos de plantación e cadros
summary: Colocar plantas individuais, canteiros de plantación enchidos á distancia das plantas con plantas mesturadas por porcentaxe, e sebes; etiquetalas; contalas nun cadro de plantas para unha folla de cálculo ou para TakeoffCraft.
keywords: plano de plantación, cadro de plantas, canteiro de plantación, plantación masiva, seto, árbore, arbusto, cuberta vexetal, distancia, distancia triangular, conta de plantas, cantidades, etiquetas, copa, símbolos de plantas, ifc, takeoff
from: ab49eab5
---

## Colocar plantas

1. Escolla unha planta en **Plantas**, á esquerda.
2. Prema {{ui:Plant}} e logo prema no plano: cada clic coloca unha planta. Prema {{key:Esc}} para parar.

O símbolo dunha planta debúxase coa súa extensión na madurez; More › {{ui:Show at planting size}} debuxa cada planta co tamaño co que se planta. As árbores asentan no chan debaixo delas: cando logo mova o terreo, seguen ao terreo. Para fixar unha planta a unha cota, escríbaa en **Elevación** en Propiedades.

## Canteiros de plantación

1. Escolla a planta principal, prema {{ui:Bed}} e prema as esquinas do canteiro. Prema {{key:Enter}} (ou prema de novo a primeira esquina) para pechalo.
2. O canteiro énchese con esa planta á súa distancia, en patrón **triangular** (o habitual: cada planta á mesma distancia de seis outras), a media distancia do bordo.
3. En Propiedades, **Engadir unha planta** mestura a planta escollida á esquerda. Estableza o **% de participación** de cada planta: o canteiro toma exactamente esa porcentaxe de cada unha, repartida por todo el. **Mesturar de novo** reparte de novo onde van.

Se a **Distancia** queda baleira, úsase a distancia propia das plantas (ponderada polas súas participacións); escriba unha para usala en todas. **Patrón** pode ser cadrado, e **Filas a** xira as filas.

## Sebes

Escolla a planta da sebe, prema {{ui:Hedge}}, prema ao longo da sebe e prema {{key:Enter}}. As plantas van pola liña á súa distancia, centradas para que os dous extremos teñan a mesma marxe. Unha sebe pode ser de **dúas filas, alternadas**, a unha distancia fixada.

## Etiquetas

As plantas individuais etiquétanse coa configuración de etiqueta (`{name}` por defecto); escriba a súa propia etiqueta para unha planta en Propiedades. Os canteiros etiquétanse co número de cada planta, e as sebes co seu. More › {{ui:Plant labels}} activa e desactiva as etiquetas. Campos de etiqueta: `{name}`, `{botanical}`, `{size}` (o recipiente), `{qty}`, `{height}`, `{spread}`, `{container}`.

## O cadro de plantas

More › {{ui:Plant schedule…}} conta cada planta por especie, sumando plantas individuais, canteiros e sebes, co seu tamaño de plantación. Gárdeo como **CSV** ou **XLSX**, ou **Enviar a TakeoffCraft**: un ficheiro de cantidades que TakeoffCraft abre para pór prezo ás plantas (xunto ás cantidades de elementos construídos e rego).

## IFC

More › {{ui:Export landscape IFC}} garda o paisaxismo como ficheiro IFC (IFC 4.3) que un modelo BIM pode conter: cada planta é un `IfcGeographicElement` de tipo VEGETATION, tipado pola súa especie coas propiedades da planta (nome botánico, tamaños, rusticidade, auga, luz), e cada canteiro e sebe é un elemento co seu número, no sitio. BimCraft ábreo xunto ao edificio.
