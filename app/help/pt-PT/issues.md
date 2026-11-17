---
title: Questões e BCF
summary: Fixe uma questão no plano, numa estaca PK do alinhamento, num ponto da superfície ou num coletor, atribua-lhe um estado e comentários, e troque as questões em ficheiros BCF 2.1 junto ao ficheiro LandXML.
keywords: questão, questões, bcf, comentário, anotação, pendência, defeito, obra, marcador, estado, aberto, resolvido, fechado, formato de colaboração BIM, landxml, problemas
from: e44153b1
---

Uma questão é uma nota fixada num local do desenho do CivilCraft, com um título, um estado e comentários. Use-a para indicar à equipa de obra ou a outro programa o que deve ver, e para ler as respostas.

## Adicionar uma questão

1. Abra **Superfície, Mais, Questões (BCF)...**
2. Escreva um título e o que está errado.
3. Escolha onde a fixar: o centro da vista em planta, o ponto da superfície no centro, uma estaca PK do alinhamento selecionado (escreva a estaca e um deslocamento; à direita é positivo), ou o coletor, o órgão ou a linha característica selecionados.
4. Prima **Adicionar questão**. O marcador aparece na planta como um pequeno losango com o respetivo número.

Clique no título de uma questão para fazer zoom sobre ela, altere o estado na lista (Aberto, Ativo, Resolvido, Fechado) e adicione comentários. Cada alteração corresponde a um passo de anulação, e as questões são guardadas no ficheiro do projeto.

## Trocar em BCF

- **Exportar BCF** escreve um ficheiro BCF 2.1 com um tópico por questão: título, estado, comentários e uma vista com uma câmara ortogonal em planta e o marcador.
- **Importar BCF** lê um ficheiro BCF (os ficheiros 2.0 e 3.0 são lidos na medida em que correspondam à versão 2.1). Um tópico com um guid que já existe atualiza essa questão (estado, novos comentários) em vez de acrescentar uma segunda.
- **A partir de Problemas** cria uma questão para cada entrada aberta no painel Problemas que indique onde está.

O BCF guarda as medidas em metros, nas coordenadas próprias deste projeto, sem deslocamento. O outro programa tem de estar no mesmo sistema de coordenadas do ficheiro LandXML para que os marcadores fiquem no sítio certo. O elemento a que um marcador aponta (diretriz, PK, deslocamento, coletor) segue como etiquetas que começam por "cc:", que o CivilCraft lê de volta.

## O que não foi verificado

Os marcadores e as vistas foram testados apenas escrevendo um ficheiro e lendo-o de volta no CivilCraft. Nenhum outro programa BIM os abriu ainda. Também depende do programa se o campo «view to world scale» do BCF significa a altura completa ou metade da altura da vista: o CivilCraft escreve a altura completa.
