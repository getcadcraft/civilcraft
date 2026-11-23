---
title: WaterCraft : demandes, débit incendie, coupures et âge de l'eau
summary: Avec le module complémentaire WaterCraft, transformez les abonnés en demandes sur vos conduites d'eau, vérifiez le débit disponible à chaque poteau d'incendie, repérez la conduite dont la coupure pénalise le plus, et suivez l'âge de l'eau et le chlore au fil d'une journée.
keywords: watercraft, distribution d'eau, demandes, abonnés, coefficient de pointe, profil de demande, débit incendie, poteau d'incendie, pression résiduelle, criticité, coupure, tronçon à vannes, âge de l'eau, chlore, résiduel, suivi de source, impasse, csv, module complémentaire
from: 066fb17a
---

WaterCraft est un module complémentaire qui travaille sur le réseau d'eau que vous avez déjà dessiné avec les outils de conduites d'eau. Il ajoute un onglet au panneau de droite, avec quatre sections.

:::warning
Un simple outil de calcul. Il a été vérifié par rapport à des calculs manuels sur des réseaux fictifs, pas sur un modèle de distributeur réel. Un ingénieur en eau doit vérifier chaque résultat. Les scénarios, les règles de régulation, les vannes et les mesures de terrain ont leurs propres rubriques, « Scénarios » et « Études », dans l'aide du module complémentaire WaterCraft.
:::

## Ce que vous allez faire

- Placer les abonnés sur le réseau comme demandes.
- Repérer les poteaux d'incendie qui n'atteignent pas le débit requis.
- Repérer les conduites dont la perte a le plus d'impact.
- Repérer l'eau ancienne et le chlore faible.

## Étapes

1. Ouvrez {{ui:Paramètres}} › {{ui:Modules complémentaires}} et activez {{ui:WaterCraft (distribution d'eau)}}. Un onglet {{ui:WaterCraft}} apparaît dans le panneau de droite.
2. Dessinez d'abord un réservoir, des nœuds et des conduites avec les outils de conduites d'eau (voir [Conduites d'eau](topic:water-mains)). Sans réseau, l'onglet vous le signale.
3. Sous {{ui:Demandes}}, collez un abonné par ligne : identifiant, x, y, type, quantité. Choisissez le {{ui:Coefficient de pointe}} et le {{ui:Profil horaire}} (jour résidentiel, jour commercial, plat, ou conserver le profil tel quel). Cliquez sur {{ui:Contrôler}} pour voir où tombe chaque abonné (le nœud le plus proche), puis sur {{ui:Mettre dans le réseau}}. Annuler retire les demandes.
4. Sous {{ui:Débit incendie}}, réglez le débit requis et la pression résiduelle, choisissez si la pression résiduelle est maintenue {{ui:Au poteau d'incendie seulement}} ou {{ui:Partout dans le réseau (plus strict)}}, puis cliquez sur {{ui:Emmarchement en plan}}. Chaque poteau est listé du plus défavorable au meilleur, comme « atteint » ou « insuffisant ».
5. Sous {{ui:Quelle conduite compte le plus}}, choisissez {{ui:une conduite à la fois}} ou {{ui:un tronçon à vannes à la fois}}, puis cliquez sur {{ui:Emmarchement en plan}}. Chaque coupure affiche la demande coupée, les nœuds isolés, les nœuds nouvellement sous la pression minimale et la pression la plus basse restante.
6. Sous {{ui:Âge de l'eau et chlore}}, choisissez ce que vous suivez (âge de l'eau, chlore ou suivi de source), réglez les heures de simulation et les limites souhaitées, puis cliquez sur {{ui:Emmarchement en plan}}. Les nœuds hors de vos limites sont listés.
7. Cliquez sur {{ui:Enregistrer en CSV}} sous n'importe quel tableau pour le conserver.

## Remarques

- Le débit d'incendie requis et la consommation par logement ou par acre sont des valeurs de départ, pas des normes. Utilisez les chiffres propres à votre distributeur.
- Une conduite partiellement coupée par une vanne est fermée entièrement ; la coupure affichée est donc légèrement pire que la réalité.
- Laissez la section qualité de l'eau tourner assez longtemps pour que le profil journalier se répète avant de lire le dernier jour.
- {{ui:Arrêter}} met fin à un long calcul ; la liste n'affiche alors que ce qui a été fait.
- Votre réseau reste dans ce projet et sur cet ordinateur. Rien n'est envoyé nulle part.
