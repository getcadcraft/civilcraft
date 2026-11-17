---
title: Chaves de descrição e códigos de linha
summary: Transforme códigos de campo em grupos de pontos com descrições, e una pontos codificados em linhas (início, fim, fechamento) que se tornam linhas de quebra.
keywords: chaves de descrição, códigos de campo, códigos de linha, feições, linhas, início, fim, fechar, grupos de pontos, códigos, códigos de levantamento, coletor de dados, linhas de quebra, meio-fio, bordo da pista
from: b3d1af8d
---

As equipes de levantamento codificam cada medição em campo: `EP` para bordo da pista, `TC` para topo do meio-fio, `BLDG` para canto de edificação. O código é a primeira palavra da descrição do ponto. O CivilCraft agrupa os pontos por ele e transforma em linhas os códigos de linha que vêm depois.

## Códigos de linha

Um código de linha é a palavra logo após o código de campo:

| Descrição | Significado |
|---|---|
| `EP B` | Inicia uma nova linha de bordo da pista neste ponto |
| `EP` | Continua a linha EP atual |
| `EP E` | Encerra a linha EP atual neste ponto |
| `BLDG C` | Fecha a edificação: liga este ponto de volta ao primeiro ponto da linha |

Pontos com o mesmo código são unidos na ordem dos números dos pontos. Códigos diferentes são linhas diferentes, mesmo quando compartilham um grupo, então `EP1` e `EP2` geram duas bordas ao mesmo tempo. Um código que nunca usa código de linha é unido por todos os seus pontos, como nas versões anteriores.

Linhas em um grupo usado como **Linha de quebra** tornam-se linhas de quebra, uma por linha, de modo que um meio-fio com uma falha não seja esticado através da falha. Linhas de outros grupos são desenhadas na planta (camada V-NODE-LINE) e saem em DXF, DWG e PDF.

As palavras para início, fim e fechamento são `B`, `BEG`, `START`; `E`, `END`; e `C`, `CLO`, `CLOSE`. Altere-as, ou desligue os códigos de linha, na caixa de diálogo abaixo.

## Chaves de descrição

Uma chave de descrição transforma um código em um grupo de pontos, um uso e uma descrição longa.

1. Em **Pontos**, clique em {{ui:Chaves de descrição e códigos de linha}}.
2. Clique em {{ui:Adicionar uma chave}} e preencha a linha:
   - **Código**: o código de campo a comparar. `*` representa qualquer conjunto de caracteres e `?` representa um, então `EP*` pega EP, EP1 e EP12.
   - **Grupo**: o grupo de pontos ao qual estes pontos se unem (vazio = o próprio código). `EP*` com grupo `EP` coloca EP1 e EP2 em um mesmo grupo, enquanto continuam sendo linhas separadas.
   - **Uso**: Pontos, Linha de quebra ou Deixar de fora, para quando o grupo aparece pela primeira vez (ou deixe isso para a tabela de **Pontos**).
   - **Descrição**: o nome longo, mostrado nas **Propriedades** de um ponto.
3. A coluna **Pontos** conta os pontos que cada chave pega conforme você digita. Vence a primeira chave que corresponde a um código.
4. Clique em {{ui:Aplicar}}. Os grupos, a superfície e a planta são atualizados em uma única etapa: {{key:Mod+Z}} a desfaz.

Um grupo mantém o uso que você lhe deu na tabela **Pontos**; o uso de uma chave só o define para um grupo novo. As chaves e os códigos de linha são salvos no arquivo do projeto.
