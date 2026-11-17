---
title: Editar um ponto de levantamento
summary: Altere o número, as coordenadas, a elevação ou a descrição de um ponto, ou arraste-o para um novo lugar na planta.
keywords: editar ponto, mover ponto, alterar elevação, renumerar, número do ponto, descrição, arrastar, norte, leste, corrigir um ponto, medição errada
from: 375ae2e9
---

Uma leitura errada, uma altura da baliza incorreta, uma descrição digitada errado: corrija o ponto, e a superfície acompanha.

## Alterar os valores de um ponto

1. Com {{ui:Selecionar}}, clique no ponto na planta. **Propriedades** mostra o número, a leste, o norte, a elevação e a descrição em campos.
2. Digite o novo valor e pressione {{key:Enter}} (ou clique fora). Deixe o campo **Elevação** vazio para um ponto sem elevação.
3. A superfície, as curvas de nível e tudo que foi criado a partir delas são atualizados de uma vez.

Cada alteração é uma única etapa: {{key:Mod+Z}} a desfaz e {{key:Mod+Y}} a refaz. Um valor que o CivilCraft não pode usar (um número que outro ponto já tem, letras em uma coordenada) é recusado: o campo recebe contorno e a barra de status informa o motivo.

Uma nova chave de descrição cria um novo grupo de pontos, como acontece em uma importação (veja [Criar uma superfície](topic:build-surface)).

## Mover um ponto na planta

1. Selecione o ponto (ele recebe um anel).
2. Arraste o anel. A barra de status mostra a leste e o norte do novo local.
3. Solte para mover; a elevação permanece. Pressione {{key:Esc}} antes de soltar para devolvê-lo à posição original.

## As linhas de quebra acompanham o ponto

Uma linha de quebra desenhada com a ferramenta {{ui:Linha de quebra}} copia os pontos por onde passa. Quando você move um ponto ou altera a elevação dele, os vértices da linha de quebra sobre ele se movem junto, na mesma etapa. Grupos de linhas de quebra criados a partir de descrições são sempre reconstruídos a partir dos pontos.

:::note
Uma superfície lida de um arquivo LandXML mantém os próprios triângulos: as edições de pontos só a alteram depois de {{ui:Reconstruir a superfície a partir dos pontos}}.
:::
