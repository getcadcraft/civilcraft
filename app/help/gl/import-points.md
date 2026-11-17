---
title: Importar puntos topográficos
summary: Abra un ficheiro de puntos en CSV ou texto, comprobe a orde das columnas no diálogo Importar puntos, corrixa as filas que non se poden ler e ordene os puntos en grupos.
keywords: importar puntos, csv, txt, pnezd, penzd, ficheiro de puntos, levantamento, puntos cogo, grupos de puntos, columnas, norte este
from: ad33d88a
---

Un ficheiro de puntos é un ficheiro de texto con un punto por liña: número do punto, norte, este, cota e descrición en calquera orde, separados por comas, tabulacións, punto e coma ou espazos. CivilCraft léeo no navegador e constrúe de inmediato unha superficie a partir del.

## Antes de empezar

- Coñeza a orde das columnas, se pode (PNEZD e PENZD parecen iguais para un ordenador).
- Coñeza as súas unidades. CivilCraft non converte: defina **Unidades** no panel esquerdo para que coincidan co ficheiro (ver [Unidades, estacións e formatos numéricos](topic:units-and-stations)).
- As coordenadas poden ser grandes (as dos planos estatais, con norte e este en millóns, están ben).

## Importar o ficheiro

1. Faga clic en {{ui:Open}} na barra de ferramentas, ou prema {{key:Mod+O}}, e escolla o ficheiro. Tamén pode arrastralo ao plano.
   Ábrese o diálogo **Importar puntos** co nome do ficheiro, unha lista **Columnas** definida en {{ui:Detect}}, unha liña de resumo e os seis primeiros puntos.
2. Lea a liña de resumo. Indica cantos puntos se leron, en que orde de columnas, como se achou esa orde e que separa as columnas. As tres formas de achar a orde:
   - «desde a fila de cabeceira»: a primeira liña nomea as súas columnas (Punto, Norte, Este, Cota, Descrición, ou X, Y, Z …). É a máis segura.
   - «como se escolleu»: vostede escolleu unha orde en **Columnas**.
   - «adiviñada a partir do número de columnas e da opción de filas de punto (PNEZD), comprobe que norte e este non estean trocados»: non había unha cabeceira utilizable. Se os seus ficheiros adoitan ter primeiro o este, defina **Filas de punto** como P, E, N, Z, D en [Configuración de CivilCraft](topic:settings).
3. Comprobe a táboa de vista previa. As súas columnas son sempre **Punto**, **Norte**, **Este**, **Cota** e **Descrición**, sexa cal sexa a orde do ficheiro. Os norte e os este dun sitio real adoitan ter tamaños claramente distintos: se parecen trocados, a adiviña foi errada.
4. Se a orde é incorrecta, escolla a correcta en **Columnas** (por exemplo, {{ui:PENZD — point, easting, northing, elevation, description}}). O resumo e a vista previa actualízanse de inmediato.
5. Busque debaixo da vista previa **Filas non lidas**. Cada liña indica o número de liña do ficheiro, o motivo e o inicio da fila. Ver [Filas que non se len](topic:import-points#rows-that-are-not-read).
6. Faga clic en {{ui:Import}}.
   Os puntos aparecen no plano, a vista achégase a eles e constrúese a superficie. A barra de estado indica, por exemplo, «Importados 276 puntos de site.csv; superficie: 546 triángulos».

Se o proxecto aínda non tiña nome, toma o nome do ficheiro.

## Comprobar os grupos

Cada punto pertence a un grupo co nome da **primeira palabra da súa descrición**, en maiúsculas: «GRD», «FL 12» e «fl» son os grupos GRD, FL e FL. Os puntos sen descrición van no grupo «(sen descrición)».

1. Vexa a táboa baixo **Puntos** no panel esquerdo: grupo, número de puntos e unha opción de **Superficie**.
2. Cada grupo empeza como {{ui:Points}}. Cambie as liñas de fluxo, os bordos de pavimento, as cimas e pés de talude, as cristas e as liñas codificadas similares a {{ui:Breakline}}. Defina como {{ui:Left out}} os grupos que non deben modelar o terreo (puntos de control, copas de árbores, postes de servizos medidos pola cima).
3. Faga clic nun punto do plano (con {{ui:Select}}) para ver o seu número, coordenadas, cota, descrición e grupo no panel dereito.

:::warning
Un grupo de liña de ruptura une **todos** os seus puntos nunha **soa** liña, en orde de número de punto. Iso funciona cando cada liña codificada se mediu en orde co seu propio código. Dúas liñas de fluxo separadas, ambas codificadas «FL», convértense nunha liña en zigzag entre elas. Se os códigos son compartidos, use a ferramenta {{ui:Breakline}} para facer clic nos puntos de cada liña (ver [Construír e refinar a superficie](topic:build-surface)).
:::

## Filas que non se len

| Motivo mostrado | Que significa | Que facer |
|---|---|---|
| « o norte ou o este non é un número » | Unha columna de coordenadas contén texto | Comprobe a orde das columnas, ou unha fila de texto perdida no medio do ficheiro |
| « a cota non é un número » | A columna de cota contén texto | Orde de columnas incorrecta, ou unha descrición na columna de cota |
| « non hai número de punto » | A columna de punto está baleira | Numere o punto, ou escolla unha orde sen P (NEZD, NEZ …): os puntos numéranse entón 1, 2, 3 … |
| « o punto 12 aparece dúas veces (conservarase o primeiro) » | Dúas filas comparten un número | Renumere unha delas no ficheiro se ambas son medicións reais |
| « 3 columnas, esperábanse 5 (PNEZD) » | A fila é curta | Unha liña rota, ou a orde de columnas incorrecta |

Un punto con cota baleira consérvase, pero non se usa na superficie. Os datos de **Puntos** indican cantos puntos teñen cota.

As liñas que comezan con `#`, `;` ou `//` son comentarios e sáltanse. As liñas baleiras tamén se saltan.

## Substituír ou engadir puntos

Importar de novo **substitúe** todos os puntos; non os engade. As súas aliñacións, plataformas, tubaxes, liñas de ruptura debuxadas e o límite quedan. O historial de desfacer bórrase, así que garde primeiro o proxecto se pode querer os puntos antigos. Para combinar dous ficheiros, únaos nun editor de texto ou nunha folla de cálculo antes de importar (vixíe os números de punto repetidos).

Por agora os puntos non se poden mover, editar nin eliminar dentro de CivilCraft. Corríxaos no ficheiro e impórteos de novo.

## Relacionado

- [Formatos de ficheiros de puntos](topic:point-file-formats): cada orde de columnas e como se recoñecen as cabeceiras.
- [Construír e refinar a superficie](topic:build-surface).
