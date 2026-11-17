---
title: Conception de l'irrigation
summary: Un outil de calcul, non un plan certifié : arroseurs, canalisations latérales, conduite principale, vannes et lignes goutte-à-goutte sur le site ; zones déduites des canalisations ; perte de charge par Hazen–Williams, arroseur le plus défavorable, débit et pression par rapport à l'alimentation, débits de précipitation, durées d'arrosage, couverture et nomenclature.
keywords: irrigation, arrosage, arroseur, aspersion, rotor, buse rotative, bulleur, goutte-à-goutte, ligne goutte-à-goutte, goutteur, vanne, zone, station, programmateur, conduite principale, canalisation latérale, point de raccordement, alimentation en eau, pression, psi, kpa, débit, gpm, perte par frottement, hazen williams, débit de précipitation, durée d'arrosage, couverture, tête à tête, nomenclature
from: 7d6342c1
---

:::warning
Il s'agit d'un outil de calcul, non d'un plan certifié : un concepteur en irrigation vérifie chaque résultat avant toute réalisation.
:::

## Implanter le réseau

1. Dans la section **Irrigation** à gauche, choisissez l'**Arroseur**, son **Arc** et l'endroit où l'arc commence, ainsi que les diamètres des canalisations latérales et de la conduite principale.
2. {{ui:Irrigation}} › {{ui:Point de raccordement}} : cliquez à l'endroit où l'alimentation en eau se raccorde. Réglez sa **pression**, le **débit disponible** et les pertes du compteur et du clapet anti-retour dans Propriétés.
3. {{ui:Irrigation}} › {{ui:Vanne}} : cliquez à l'endroit où va la vanne de chaque zone. Une vanne démarre une zone.
4. {{ui:Irrigation}} › {{ui:Arroseur}} : cliquez pour placer les arroseurs ; chaque clic en place un.
5. {{ui:Irrigation}} › {{ui:Canalisation latérale}} : cliquez depuis une vanne en passant par ses arroseurs, puis appuyez sur {{key:Enter}}. {{ui:Conduite principale}} : du point de raccordement à chaque vanne.

Les extrémités de canalisations s'accrochent aux arroseurs, aux vannes, à l'alimentation et aux autres extrémités de canalisations, de sorte que le réseau se raccorde. Une zone est tout ce qui est atteint depuis sa vanne par les canalisations latérales ; la conduite principale transporte une seule zone à la fois.

## Goutte-à-goutte

{{ui:Irrigation}} › {{ui:Ligne goutte-à-goutte}} : cliquez le long de la ligne, en commençant là où elle est alimentée (extrémité d'une canalisation latérale ou vanne). Réglez le **débit du goutteur** et l'**espacement** dans Propriétés ; son débit est celui des goutteurs qui la composent.

## Le contrôle

{{ui:Irrigation}} › {{ui:Vérifier le système…}} liste chaque zone :

| Colonne | Mode de calcul |
|---|---|
| Débit | La somme des débits des arroseurs (et des lignes goutte-à-goutte) |
| À la vanne | La pression de service de l'arroseur le plus défavorable, plus les pertes de charge des canalisations jusqu'à lui (Hazen–Williams, diamètre intérieur de la canalisation, variation d'altitude), et la perte dans la vanne |
| À l'alimentation | Idem, plus la perte de la conduite principale qui transporte cette zone, et les pertes du compteur et du clapet |
| Précipitation | Le débit des arroseurs rapporté à la surface qu'ils arrosent, à l'espacement tête à tête |
| Minutes par semaine | Pour appliquer le réglage **Arrosage par semaine** |
| Problèmes | Vitesse au-delà de la limite, arroseur hors de sa plage de pression, aspersions et turbines sur une même vanne, pression ou débit insuffisant à l'alimentation, arroseurs hors zone, boucles |

Sélectionnez une vanne pour voir les chiffres de sa zone et son arroseur le plus défavorable entouré sur le plan. La nomenclature compte les arroseurs par type et par arc, les canalisations par diamètre, les vannes, la ligne goutte-à-goutte et les goutteurs, ainsi que les stations du programmateur. **Enregistrer en CSV** conserve les deux.

Réglages de la section Irrigation : **Hazen–Williams C** (150 pour les tubes plastiques neufs), la **vitesse maximale** dans une canalisation (1.5 m/s), la **perte dans une vanne** et l'**arrosage par semaine**. Ce sont des valeurs par défaut signalées.

## Couverture

{{ui:Irrigation}} › {{ui:Afficher la couverture}} indique la surface que les arroseurs laissent sèche, celle qu'arrosent deux arroseurs ou plus, et les arroseurs qui n'atteignent pas un voisin (espacement tête à tête).

## Arroseurs

Les arroseurs listés sont des types **génériques** établis par CadCraft à partir de débits de précipitation de calcul (aspersions fixes, buses rotatives, turbines à engrenages, bulleurs, micro-aspersions, goutteurs), et non les produits d'un fabricant. **Ajouter des arroseurs depuis un fichier…** lit vos propres arroseurs (une liste JSON avec la portée, le débit ou le débit de précipitation de chacun, et sa plage de pression) ; ils sont enregistrés avec le projet. Les données publiées d'un fabricant ne s'y ajoutent qu'avec l'autorisation écrite de ce fabricant.

Sous les arroseurs génériques, la liste comporte des **arroseurs types** (leurs noms se terminent par « valeurs typiques ») : tailles de buses des aspersions fixes, buses rotatives et turbines à engrenages, micro-aspersions, bulleurs et goutteurs, avec un rayon, un débit et une plage de pression. CadCraft les calcule à partir de formules publiées (équation de l'orifice pour le débit, mise à l'échelle de la portée du jet pour le rayon) et de classes de débit nominales, à partir de sources ouvertes uniquement ; aucune table de fabricant n'est copiée. Choisissez-en un et le sélecteur affiche sa base et sa licence. Un projet qui en utilise un conserve l'arroseur et sa source dans le fichier de projet. Ils servent à la planification : vérifiez les données propres de l'arroseur réel avant toute réalisation.
