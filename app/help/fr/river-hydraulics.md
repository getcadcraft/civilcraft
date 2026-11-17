---
title: Lignes d'eau en rivière
summary: Modéliser une rivière à partir de la surface du terrain et calculer les lignes d'eau en régime permanent par la méthode du pas standard : niveaux d'eau, énergie, vitesses, nombres de Froude et emprise de la crue sur le plan. Fonction en essai ; chaque résultat exige la revue d'un ingénieur.
keywords: digue, zone d'écoulement inactive, éditeur de profil, rivière, hydraulique, ligne d'eau, remous, pas standard, régime permanent, 1d, profils en travers, manning, rugosité, débitance, hauteur critique, hauteur normale, froude, ligne de charge, emprise de la crue, plaine inondable, inondation, stations des berges, longueurs de bief, contraction, expansion, fluvial, torrentiel, régime mixte, ressaut hydraulique
from: fb8bf425
---

CivilCraft calcule des lignes d'eau permanentes et unidimensionnelles le long d'une rivière : pour chaque débit que vous donnez, le niveau d'eau à chaque profil en travers, à partir du bilan d'énergie entre profils voisins (méthode du pas standard). Cette fonction est en essai pendant sa vérification.

**Aide au calcul uniquement.** Les niveaux d'eau doivent être revus par un ingénieur qualifié avant que quiconque s'y fie : un modèle 1D ne vaut que par ses profils, ses valeurs de rugosité, ses longueurs de bief et ses conditions aux limites, et il ne connaît ni les ponts, ni les buses, ni les débordements hors de la rivière.

## Dessiner la rivière

1. Construisez d'abord la surface du terrain existant (points, lignes de rupture ou un TIN ouvert).
2. Sous **Surface** › {{ui:More}}, choisissez {{ui:River}}.
3. Cliquez le long de l'axe de la rivière **de l'amont vers l'aval**, puis appuyez sur {{key:Enter}} ou double-cliquez.

CivilCraft trace un profil perpendiculaire à l'axe tous les 50 m (200 ft), avec 100 m (300 ft) de part et d'autre, à partir du terrain. Les PK de la rivière sont mesurés depuis l'extrémité aval, ils augmentent donc vers l'amont. Les berges sont d'abord estimées à 10 m (30 ft) de part et d'autre du point le plus bas de chaque profil.

Pour ajouter un profil là où la rivière se rétrécit ou où un ouvrage se trouve, sélectionnez la rivière, cliquez sur {{ui:Ajouter un profil}} et tracez une ligne de coupe en travers (dans les deux sens : elle est tournée pour aller de gauche à droite en regardant vers l'aval).

## Paramétrer la rivière

Sélectionnez la rivière pour la voir dans **Propriétés** :

- **Régime d'écoulement** : fluvial (le cas habituel : calculé depuis l'aval, à partir de la condition aval), torrentiel (calculé depuis l'amont, à partir de la condition amont) ou mixte (les deux, puis celui qui a la plus grande force spécifique à chaque profil ; un aperçu est affiché).
- **Profils d'écoulement** : un nom et un débit pour chacun (par exemple une crue décennale et une crue centennale), et la condition à l'extrémité aval (et à l'extrémité amont lorsque le régime n'est pas fluvial) : **Hauteur normale** avec une pente de la ligne d'énergie (la pente du lit est une première estimation), une **Cote de surface d'eau connue**, ou **Hauteur critique**.
- **Profils issus du terrain** : l'espacement, la distance à gauche et à droite, l'estimation des berges et les deux valeurs de n de Manning ; {{ui:Recouper les profils}} remplace les profils (une seule étape d'annulation).
- **Le tableau des profils** : pour chaque profil, les décalages de berge gauche et droite, le n du lit et le n du lit majeur, les longueurs de bief jusqu'au profil suivant vers l'aval (lit majeur gauche, lit mineur, lit majeur droit ; mesurées sur le plan pour commencer), et les coefficients de contraction et d'expansion (0,1 et 0,3 pour commencer : transitions progressives). {{ui:Edit}} ouvre l'éditeur de profil (ci-dessous) ; un point après ce bouton signale que le profil comporte une digue ou une zone inactive.

Chaque modification correspond à une étape d'annulation ({{key:Mod+Z}}).

## Modifier un profil : berges, digues et zones inactives

{{ui:Edit}} sur un profil affiche son terrain et vous permet de déplacer ce que le calcul lit : les **berges gauche et droite** (elles découpent le profil en lit majeur gauche, lit mineur et lit majeur droit), une **digue** de chaque côté et des **zones d'écoulement inactives**. Chaque poignée se déplace aussi avec les touches fléchées, et chaque valeur se saisit à côté du graphique. {{ui:Apply}} est une seule étape d'annulation.

- Une **digue** a une position (décalage) et une cote de crête. Le terrain situé au-delà, à l'opposé de la rivière, est coupé de la rivière tant que la surface de l'eau est sous la crête : sa surface, son périmètre mouillé et sa débitance sont exclus. Au-dessus de la crête, tout le profil compte à nouveau. Une digue se place à l'extérieur de la berge qu'elle protège ; une digue placée à l'intérieur des berges est signalée.
- Une **zone d'écoulement inactive** retient l'eau mais ne transporte aucun débit (une poche derrière un remblai, une eau morte à côté d'un accès de pont). Donnez ses deux décalages et, si vous le souhaitez, une cote d'eau en dessous de laquelle elle est inactive ({{ui:toujours}} si la case est vide) : au-dessus de cette cote, elle s'écoule comme le reste. Une zone qui couvre une partie du lit mineur est signalée.
- Entre deux profils, l'emprise de la crue laisse à sec le terrain situé derrière une digue commune aux deux profils, tant que la surface de l'eau est sous la crête (la ligne entre les deux crêtes est droite).

## Calculer et lire les résultats

Cliquez sur {{ui:Lignes d'eau}}. Pour le régime que vous choisissez, vous obtenez :

- un **graphique** le long de la rivière (débit de gauche à droite) : fond du lit, berges, surface de l'eau, ligne de charge et surface d'eau critique ; les profils maintenus à la hauteur critique sont entourés ;
- un **tableau** par profil : PK de la rivière, débit, fond du lit, surface de l'eau, surface d'eau critique, ligne de charge, hauteur, vitesse dans le lit et globale, nombre de Froude du lit, aire mouillée, largeur au miroir, débit dans chaque lit majeur et dans le lit mineur, pente de la ligne d'énergie, et les avertissements ;
- des **avertissements** en termes simples, par exemple un profil fixé à la hauteur critique, de l'eau au-dessus des extrémités d'un profil, ou un fort changement de débitance entre deux profils (ajoutez des profils entre les deux).

{{ui:Tableau (CSV)}}, {{ui:Report}} (texte brut avec la méthode, les conditions aux limites et chaque tableau) et {{ui:Graphique (SVG)}} enregistrent dans vos téléchargements. Chacun porte la mention de revue.

Cochez {{ui:Afficher l'emprise de la crue}} dans **Propriétés** pour ombrer la zone mouillée sur le plan pour le profil choisi, avec la ligne d'eau tracée là où la hauteur est nulle. Entre deux profils, la surface de l'eau est horizontale en travers de la rivière et varie linéairement avec le PK. Le terrain situé derrière une digue reste à sec tant que l'eau est sous sa crête. D'autres zones basses du corridor de la rivière que l'eau ne peut pas atteindre (derrière un remblai routier, par exemple) restent ombrées : vérifiez-les.

## Sur le dessin et dans Problèmes

Les tracés de la rivière vont sur le plan, le PDF et le DWG, sur leurs propres calques : **C-WATR-CNTR** (l'axe), **C-WATR-SCTN** (chaque ligne de coupe, avec son PK) et **C-WATR-FLOD** (la ligne d'eau de l'emprise de la crue, lorsque {{ui:Afficher l'emprise de la crue}} est coché pour un profil). Les avertissements de la rivière (un profil fixé à la hauteur critique, de l'eau au-dessus des extrémités d'un profil, une variation de débitance qui demande plus de profils, un bilan d'énergie non fermé, une digue à l'intérieur des berges) vont aussi dans le panneau **Problèmes**, rattachés à la rivière et placés au profil d'origine.

## Méthode de calcul

- Énergie entre deux profils : WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Débitance par subdivision : chaque lit majeur est découpé là où son n change, K = Σ (1/n)·A·R^(2/3) (1,486/n en unités US) ; le lit mineur forme une seule partie, avec un n composé lorsque son n change. α vient de la répartition de la débitance.
- Pente de frottement par débitance moyenne, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sur la longueur de bief pondérée par le débit.
- Coefficient de contraction lorsque l'écoulement accélère vers l'aval, d'expansion lorsqu'il ralentit.
- Hauteur critique = énergie spécifique minimale. Chaque niveau d'eau est résolu dans un encadrement, de sorte qu'il ne passe jamais du mauvais côté de la hauteur critique ; lorsqu'aucune solution n'existe, il est fixé à la hauteur critique et signalé.

Le programme est vérifié par la hauteur normale de Manning, la hauteur critique dans un canal rectangulaire, et l'exemple de remous de Chow (*Open-Channel Hydraulics*, 1959, chapitre 10), intégré indépendamment. La même méthode est utilisée par les logiciels 1D courants de rivière : un calcul à la main ou les notes d'un étudiant s'y rapportent directement.

## Buses et ponts

Dans **Propriétés** de la rivière, sous **Buses et ponts**, {{ui:Ajouter une buse}} ou {{ui:Ajouter un pont}} place un ouvrage entre deux profils (chaque tronçon garde au moins deux profils). Le profil situé en dessous n'est pas modifié ; la surface de l'eau juste à l'amont provient de l'ouvrage, et le profil se poursuit vers l'amont à partir de là. **Résultats** ajoute un tableau pour chaque ouvrage : charge aval, cote de charge amont, le contrôle qui gouverne, le débit à travers l'ouverture et le débit par-dessus la route ou le tablier. Régime fluvial uniquement.

- **Buse** (cadre ou circulaire, une ou plusieurs cellules de même dimension). Le contrôle à l'entrée est un écoulement de déversoir tant que l'entrée est libre, puis un écoulement d'orifice une fois noyée, avec une transition entre une charge amont d'une à une fois et demie la hauteur. Le contrôle à la sortie est le bilan d'énergie : perte à l'entrée, frottement et hauteur de vitesse à la sortie, au-dessus du plus haut entre la charge aval et le milieu de la hauteur critique et la clé de voûte, moins la chute le long de la cellule. La charge amont est la plus grande des deux. Cochez **L'eau peut passer par-dessus la route** et le débit de déversoir de la route se partage le débit avec les cellules.
- **Pont.** L'ouverture est le profil situé sous le pont, coupé aux culées, chaque pile étant une aire qui ne transporte aucun débit. La surface de l'eau dans l'ouverture provient du profil situé en dessous (coefficient d'expansion), et le profil situé au-dessus provient de l'ouverture (coefficient de contraction). Si l'ouverture ne peut pas évacuer le débit à cette charge aval, l'écoulement se fait à la hauteur critique et le pont est signalé comme engorgé. Si l'eau atteint le dessous des poutres, l'écoulement est en charge (de type vanne tant que la charge aval est sous le dessous des poutres, noyé au-dessus), et l'eau par-dessus le tablier ajoute un débit de déversoir ; le niveau amont est celui pour lequel ces débits s'additionnent au débit total.

Les coefficients (débit, perte à l'entrée, déversoir) sont des valeurs par défaut arrondies, saisies à la main. Modifiez-les pour votre projet. Ce ne sont pas les abaques ajustés que publient les manuels de calcul des buses : traitez donc la charge amont d'une buse proche de sa limite comme une estimation. L'eau par-dessus une route ou un tablier, une entrée noyée, une ouverture engorgée et un écoulement rapide dans une cellule sont affichés dans **Problèmes**.

## Écoulement non permanent

{{ui:Écoulement non permanent…}} dans **Propriétés** de la rivière fait transiter un hydrogramme de crue le long des profils. Saisissez l'apport sous forme d'heures et de débits, une paire par ligne, la pente aval (hauteur normale) et la durée du calcul. Le calcul part de la surface d'eau permanente au premier débit et résout les équations unidimensionnelles complètes (schéma implicite à quatre points, pondéré à 0,6 dans le temps). Vous obtenez le niveau d'eau et le débit de pointe à chaque profil, avec l'heure de chacun, un graphique du débit aux deux extrémités, et le contrôle de volume (entrant, sortant et variation stockée). Il est vérifié que l'écoulement permanent reste permanent, qu'un échelon d'apport aboutit à la ligne d'eau permanente du nouveau débit, que le volume se ferme, et la vitesse de l'onde de crue est comparée à l'onde cinématique. Écoulement fluvial, un seul bief, sans apport latéral, sans buse ni pont dans le calcul.

## Confluences

Des biefs qui se rejoignent en une seule sortie : les débits s'additionnent, et la surface de l'eau à l'amont du bief aval est reportée jusqu'aux extrémités des biefs qui le rejoignent (même surface d'eau à la confluence, méthode simple : pas d'angle, pas de quantité de mouvement, donc adaptée aux faibles nombres de Froude). Le modèle et les essais sont en place (`river-structures.js`) ; un panneau pour relier deux rivières sur le plan n'est pas encore disponible.

## Pas encore disponible

Seuils et vannes comme ouvrages propres, un panneau pour les confluences, des ouvrages dans un calcul non permanent, et l'écoulement torrentiel non permanent. Un calcul en régime mixte signale un ressaut hydraulique entre deux profils, mais ne le place pas.

**Où les rivières se rejoignent.** Dans les Propriétés d'une rivière, « Se jette dans » désigne la rivière qu'elle rejoint. Les rivières qui se rejoignent sont résolues ensemble : la rivière où elles se jettent porte la somme de leurs débits, et chacune d'elles se termine à la surface d'eau du premier profil de cette rivière (méthode de la surface d'eau égale ; elle néglige l'angle et la quantité de mouvement des débits). Pour relier une rivière principale et un ruisseau, tracez une courte rivière en aval de la confluence et faites-y se jeter les deux. Les résultats affichent un tableau de confluence. Les valeurs par défaut de ces résultats (contraction 0,1, expansion 0,3, lit en une seule partie avec une rugosité composée, régime mixte par force spécifique) restent en vigueur jusqu'à leur revue par un ingénieur, et les Résultats le précisent.
