---
title: Exporta el lloc en 3D
summary: Desa el que mostra la vista 3D com a fitxer GLB o OBJ per a altres programes 3D, en metres amb Y cap amunt, al voltant d'un origen local que el fitxer registra.
keywords: glb, gltf, obj, exportació 3D, exporta 3D, exportació de model, motor de jocs, visualització, visor 3D, metres, Y cap amunt, origen, origen local, State Plane
from: 07d23992
---

La vista 3D exporta el que mostra com a model 3D que un altre programa pot obrir: un visor 3D, un modelador, un motor de jocs o una eina de visualització.

## Exporta

1. Obriu la vista 3D ({{key:D}}) i trieu què es mostra amb {{ui:Mostra}}. El que està ocult no s'exporta.
2. Feu clic a {{ui:GLB}} o {{ui:OBJ}} a la barra.
   El fitxer es baixa com a "*nom del projecte*-3d.glb" o "-3d.obj", i la barra d'estat diu l'origen.

## Què contenen els fitxers

| | GLB | OBJ |
|---|---|---|
| Superfícies | Malles amb normals i els colors de les franges o de les superfícies | Malles amb normals (sense colors) |
| Canonades i estructures | Malles arrodonides, les que tenen problemes en vermell | Malles arrodonides |
| Corbes de nivell, línies de ruptura, eixos, marques, línies del corredor i de plataformes | Línies, cada conjunt en el seu color | Registres de línia (`l`) |
| Punts topogràfics | Punts | Registres de punt (`p`) |

Cada conjunt conserva el seu nom ("Terreny actual", "Canonades", "Corbes de nivell principals" i així successivament), perquè el pugueu amagar o donar-li estil a l'altre programa.

## Unitats, eixos i origen

- **Metres.** Un projecte en peus es converteix des de peus d'agrimensura dels EUA (1 ft = 1200/3937 m).
- **Y cap amunt**, la convenció habitual per a aquests formats: l'est es converteix en +X, la cota en +Y, i el nord en −Z.
- **Escala real.** L'exageració vertical de la vista no s'aplica.
- **Un origen local.** Les coordenades State Plane són milions de peus, massa grans per als números de precisió simple que emmagatzemen aquests formats, de manera que el fitxer s'escriu relatiu a un origen proper: l'origen propi del terreny actual per a l'est i el nord, i la seva elevació més baixa arrodonida cap avall. L'origen, en unitats del projecte, queda registrat al fitxer: en un GLB com a `extras` a l'escena i al seu node superior, en un OBJ com a línia de comentari a prop del principi (`# origin easting … northing … elevation …`). Per col·locar el model de nou en coordenades del projecte, sumeu l'origen (després de tornar a convertir els metres a peus en un projecte en peus).

## Encara no implementat

- Exportació de la vista exagerada, o exportació en unitats del projecte en lloc de metres.
- Textures, un fitxer de materials per a OBJ (.mtl) i propietats per objecte (els noms de les canonades i de les estructures només són a CivilCraft).
- Exportació del corredor com a sòlids separats, o de la vista de perfil en 3D.
