---
title: Problemas e BCF
summary: Fixe um problema no plano, em uma estaca do alinhamento, em um ponto da superfície ou em um tubo, dê a ele um status e comentários, e troque os problemas como arquivos BCF 2.1 junto com o arquivo LandXML.
keywords: problema, problemas, bcf, comentário, marcação, pendência, defeito, obra, marcador, status, aberto, resolvido, fechado, formato de colaboração BIM, landxml, questões
from: e44153b1
---

Um problema é uma nota fixada em um local do seu desenho do CivilCraft, com um título, um status e comentários. Use-o para dizer à equipe de obra ou a outro programa o que verificar, e para ler de volta as respostas deles.

## Adicionar um problema

1. Abra **Superfície, Mais, Problemas (BCF)...**
2. Digite um título e o que está errado.
3. Escolha onde fixar: o centro da vista em planta, o ponto da superfície no centro, uma estaca do alinhamento selecionado (digite a estaca e um deslocamento; à direita é positivo), ou o tubo, a estrutura ou a linha de feição selecionados.
4. Pressione **Adicionar problema**. O marcador aparece na planta como um pequeno losango com o seu número.

Clique no título de um problema para dar zoom nele, altere o status na lista (Aberto, Ativo, Resolvido, Fechado) e adicione comentários. Cada alteração é uma etapa de desfazer, e os problemas são salvos no arquivo do projeto.

## Trocar em BCF

- **Exportar BCF** grava um arquivo BCF 2.1 com um tópico por problema: título, status, comentários e um ponto de vista com uma câmera ortogonal de planta e o marcador.
- **Importar BCF** lê um arquivo BCF (arquivos 2.0 e 3.0 são lidos na medida em que correspondem ao 2.1). Um tópico com um guid que você já tem atualiza esse problema (status, novos comentários) em vez de adicionar um segundo.
- **A partir de Problemas** cria um problema para cada entrada aberta no painel Problemas que informe onde ela está.

O BCF leva metros nas coordenadas próprias deste projeto, sem deslocamento. O outro programa deve estar no mesmo sistema de coordenadas do seu arquivo LandXML para que os marcadores caiam no lugar certo. O elemento para o qual um marcador aponta (alinhamento, estaca, deslocamento, tubo) é transportado como rótulos que começam com "cc:", que o CivilCraft lê de volta.

## O que não foi verificado

Os marcadores e pontos de vista foram testados apenas gravando um arquivo e lendo-o de volta no CivilCraft. Nenhum outro programa BIM os abriu ainda. Além disso, se o campo "view to world scale" do BCF significa a altura total ou a metade da altura da vista difere entre programas: o CivilCraft grava a altura total.
