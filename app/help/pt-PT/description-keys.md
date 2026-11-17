---
title: Códigos de descrição e códigos de linha
summary: Transforme códigos de campo em grupos de pontos com descrições, e una os pontos codificados em linhas (início, fim, fecho) que se tornam linhas de quebra.
keywords: códigos de descrição, códigos de campo, códigos de linha, figuras, traçado de linhas, início, fim, fechar, grupos de pontos, códigos, códigos de levantamento, coletor de dados, linhas de quebra, bordo da faixa de rodagem, lancil
from: b3d1af8d
---

As equipas de levantamento codificam cada leitura no campo: `EP` para bordo da faixa de rodagem, `TC` para topo do lancil, `BLDG` para um canto de edifício. O código é a primeira palavra da descrição do ponto. O CivilCraft agrupa os pontos por ele e transforma em linhas os códigos de linha que vêm a seguir.

## Códigos de linha

Um código de linha é a palavra logo a seguir ao código de campo:

| Descrição | Significado |
|---|---|
| `EP B` | Iniciar uma nova linha de bordo da faixa de rodagem neste ponto |
| `EP` | Continuar a linha EP atual |
| `EP E` | Terminar a linha EP atual neste ponto |
| `BLDG C` | Fechar o edifício: ligar este ponto ao primeiro ponto da linha |

Os pontos com o mesmo código são unidos pela ordem dos números de ponto. Códigos diferentes são linhas diferentes, mesmo quando partilham um grupo; assim, `EP1` e `EP2` dão duas arestas ao mesmo tempo. Um código que nunca usa um código de linha é unido por todos os seus pontos, como nas versões anteriores.

As linhas de um grupo usado como **Linha de quebra** tornam-se linhas de quebra, uma por linha, para que um lancil com um intervalo não seja esticado através desse intervalo. As linhas de outros grupos são desenhadas na planta (camada V-NODE-LINE) e saem em DXF, DWG e PDF.

As palavras para início, fim e fecho são `B`, `BEG`, `START`; `E`, `END`; e `C`, `CLO`, `CLOSE`. Altere-as, ou desligue os códigos de linha, na caixa de diálogo abaixo.

## Códigos de descrição

Um código de descrição transforma um código num grupo de pontos, numa utilização e numa descrição longa.

1. Em **Pontos**, clique em {{ui:Códigos de descrição e códigos de linha}}.
2. Clique em {{ui:Acrescentar um código}} e preencha a linha:
   - **Código**: o código de campo a comparar. `*` representa qualquer conjunto de caracteres e `?` um só, por isso `EP*` apanha EP, EP1 e EP12.
   - **Grupo**: o grupo de pontos a que estes pontos se juntam (vazio = o próprio código). `EP*` com grupo `EP` põe EP1 e EP2 num só grupo, mantendo-se linhas separadas.
   - **Utilização**: Pontos, Linha de quebra ou Deixar de fora, para quando o grupo aparece pela primeira vez (ou deixe-o à tabela **Pontos**).
   - **Descrição**: o nome longo, mostrado nas **Propriedades** de um ponto.
3. A coluna **Pontos** conta os pontos que cada código apanha à medida que escreve. A primeira linha que coincide com um código prevalece.
4. Clique em {{ui:Aplicar}}. Os grupos, a superfície e a planta seguem num só passo: {{key:Mod+Z}} desfaz essa ação.

Um grupo mantém a utilização que lhe deu na tabela **Pontos**; a utilização de um código de descrição só a define para um grupo novo. Os códigos de descrição e os códigos de linha ficam guardados no ficheiro do projeto.
