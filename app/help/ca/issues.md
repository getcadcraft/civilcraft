---
title: Incidències i BCF
summary: Fixeu un problema al plànol, a una estació de l'eix, a un punt de la superfície o a un tub, doneu-li un estat i comentaris, i intercanvieu les incidències com a fitxers BCF 2.1 juntament amb el fitxer LandXML.
keywords: incidència, incidències, bcf, comentari, marca, defecte, obra, marcador, estat, obert, resolt, tancat, format de col·laboració BIM, landxml, problemes
from: e44153b1
---

Una incidència és una nota fixada en un lloc del dibuix de CivilCraft, amb un títol, un estat i comentaris. Serveix per indicar al personal de l'obra o a un altre programa què cal revisar, i per llegir-ne les respostes.

## Afegeix una incidència

1. Obriu **Superfície, Més, Incidències (BCF)...**
2. Escriviu un títol i què no està bé.
3. Trieu on fixar-la: el centre de la vista en planta, el punt de la superfície del centre, una estació de l'eix seleccionat (escriviu l'estació i un desplaçament; la dreta és positiu), o el tub, l'estructura o la línia característica seleccionats.
4. Premeu **Afegeix incidència**. El marcador es mostra a la planta com un petit rombe amb el seu número.

Feu clic al títol d'una incidència per fer zoom fins a ella, canvieu-ne l'estat a la llista (Obert, Actiu, Resolt, Tancat) i afegiu-hi comentaris. Cada canvi és un pas de desfer, i les incidències es desen al fitxer del projecte.

## Intercanvia-les en format BCF

- **Exporta BCF** escriu un fitxer BCF 2.1 amb un tema per incidència: títol, estat, comentaris i un punt de vista amb una càmera ortogonal de planta i el marcador.
- **Importa BCF** llegeix un fitxer BCF (els fitxers 2.0 i 3.0 es llegeixen en la mesura que coincideixen amb la 2.1). Un tema amb un guid que ja teniu actualitza aquella incidència (estat, comentaris nous) en lloc d'afegir-ne una segona.
- **Des de Problemes** crea una incidència per a cada entrada oberta del tauler Problemes que indiqui on es troba.

El BCF porta els metres en les coordenades pròpies d'aquest projecte, sense desplaçament. L'altre programa ha d'estar en el mateix sistema de coordenades que el fitxer LandXML perquè els marcadors caiguin al lloc correcte. L'element al qual apunta un marcador (eix, estació, desplaçament, tub) viatja com a etiquetes que comencen per «cc:», que CivilCraft llegeix després.

## Què no s'ha comprovat

Els marcadors i els punts de vista només s'han provat escrivint un fitxer i tornant-lo a llegir a CivilCraft. Cap altre programa BIM no n'ha obert encara cap. A més, si el «view to world scale» del BCF vol dir l'alçada completa o la meitat de l'alçada de la vista differeix segons el programa: CivilCraft escriu l'alçada completa.
