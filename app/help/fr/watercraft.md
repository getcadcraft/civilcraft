---
title: WaterCraft : demandes, débit incendie, coupures et âge de l'eau
summary: Avec le module complémentaire WaterCraft, transformez les clients en demandes sur vos conduites d'eau, vérifiez le débit disponible à chaque poteau d'incendie, repérez la conduite dont la coupure pénalise le plus, et suivez l'âge de l'eau et le chlore au fil d'une journée.
keywords: watercraft, distribution d'eau, demandes, clients, coefficient de pointe, profil de demande, débit incendie, poteau d'incendie, pression résiduelle, criticité, coupure, tronçon à vannes, âge de l'eau, chlore, résiduel, traçage de source, cul-de-sac, csv, module complémentaire
from: 76809f01
---

WaterCraft est un module complémentaire qui travaille sur le réseau d'eau que vous avez déjà dessiné avec les outils Conduites d'eau. Il ajoute un onglet au panneau de droite, avec quatre sections.

:::warning
Un outil d'aide au calcul uniquement. Il a été vérifié par rapport à des calculs manuels sur des réseaux fictifs, pas sur un modèle de distributeur réel. Un ingénieur en eau doit vérifier chaque résultat. Il n'existe pas encore de stations de surpression, de dégradation de second ordre ni de scénarios.
:::

## Ce que vous allez faire

- Placer les clients sur le réseau sous forme de demandes.
- Repérer les poteaux d'incendie qui n'atteignent pas le débit nécessaire.
- Repérer les conduites dont la coupure a le plus d'impact.
- Repérer une eau trop ancienne et un chlore trop faible.

## Étapes

1. Ouvrez {{ui:Paramètres}} › {{ui:Modules complémentaires}} et activez {{ui:WaterCraft (distribution d'eau)}}. Un onglet {{ui:WaterCraft}} apparaît dans le panneau de droite.
2. Dessinez d'abord un réservoir, des nœuds et des conduites avec les outils Conduites d'eau (voir [Conduites d'eau](topic:water-mains)). Sans réseau, l'onglet vous le signale.
3. Sous {{ui:Demandes}}, collez un client par ligne : identifiant, x, y, type, quantité. Choisissez le {{ui:Coefficient de pointe}} et le {{ui:Profil horaire}} (journée résidentielle, journée commerciale, constant, ou garder le profil tel quel). Appuyez sur {{ui:Contrôler}} pour voir où tombe chaque client (le nœud le plus proche), puis sur {{ui:Placer dans le réseau}}. Annuler retire les demandes.
4. Sous {{ui:Débit incendie}}, réglez le débit nécessaire et la pression résiduelle, choisissez si la pression résiduelle est maintenue {{ui:Au poteau d'incendie seulement}} ou {{ui:Partout dans le réseau (plus strict)}}, puis appuyez sur {{ui:Emmarchement en plan}}. Chaque poteau d'incendie est listé du plus défavorable au moins défavorable, comme « Conforme » ou « Insuffisant ».
5. Sous {{ui:Quelle conduite compte le plus}}, choisissez {{ui:une conduite à la fois}} ou {{ui:un tronçon à vannes à la fois}}, puis appuyez sur {{ui:Emmarchement en plan}}. Chaque coupure affiche la demande isolée, les nœuds isolés, les nœuds passant nouvellement sous la pression minimale et la pression la plus basse restante.
6. Sous {{ui:Âge de l'eau et chlore}}, choisissez ce que vous suivez (âge de l'eau, chlore ou traçage de source), réglez les heures de calcul et les limites souhaitées, puis appuyez sur {{ui:Emmarchement en plan}}. Les nœuds hors de vos limites sont listés.
7. Appuyez sur {{ui:Enregistrer en CSV}} sous n'importe quel tableau pour le conserver.

## Remarques

- La pression d'incendie nécessaire et la consommation par logement ou par acre sont des valeurs de départ, pas des normes. Utilisez les chiffres propres à votre distributeur.
- Une conduite partiellement coupée par une vanne est fermée entièrement, donc la coupure affichée est légèrement pire qu'une coupure réelle.
- Lancez la section qualité de l'eau assez longtemps pour que le profil journalier se répète avant de lire le dernier jour.
- {{ui:Arrêter}} met fin plus tôt à un long calcul ; la liste ne montre alors que ce qui a été fait.
- Votre réseau reste dans ce projet et sur cet ordinateur. Rien n'est envoyé ailleurs.
