---
title: Editar um ponto do levantamento
summary: Alterar o número, as coordenadas, a cota ou a descrição de um ponto, ou arrastá-lo para um novo lugar na planta.
keywords: editar ponto, mover ponto, alterar cota, renumerar, número do ponto, descrição, arrastar, norte, este, fixar ponto, visada errada
from: 375ae2e9
---

Uma visada mal feita, uma altura da mira errada, uma descrição escrita mal: corrija esse ponto e a superfície segue-o.

## Alterar os valores de um ponto

1. Com {{ui:Select}}, clique no ponto na planta. **Propriedades** mostra o número, a coordenada este, a coordenada norte, a cota e a descrição em campos.
2. Escreva o novo valor e prima {{key:Enter}} (ou clique fora). Deixe **Cota** vazio para um ponto sem cota.
3. A superfície, as curvas de nível e tudo o que assenta nelas são atualizados de imediato.

Cada alteração é um passo: {{key:Mod+Z}} anula-a e {{key:Mod+Y}} refaz-a. Um valor que o CivilCraft não consegue usar (um número que outro ponto já tem, letras numa coordenada) é recusado: a caixa fica com contorno e a barra de estado indica o motivo.

Uma nova descrição de código cria um novo grupo de pontos, tal como uma importação (ver [Construir uma superfície](topic:build-surface)).

## Mover um ponto na planta

1. Selecione o ponto (fica com um anel).
2. Arraste o anel. A barra de estado mostra a coordenada este e a coordenada norte para onde vai.
3. Largue para mover; a cota mantém-se. Prima {{key:Esc}} antes de largar para o repor.

## As linhas de quebra seguem o ponto

Uma linha de quebra desenhada com a ferramenta {{ui:Breakline}} copia os pontos por onde passa. Ao mover um ponto ou alterar a cota dele, os vértices da linha de quebra que lhe correspondem movem-se com ele, no mesmo passo. Os grupos de linhas de quebra criados a partir de descrições são sempre reconstruídos a partir dos pontos.

:::note
Uma superfície lida de um ficheiro LandXML mantém os próprios triângulos: as alterações aos pontos só a modificam depois de {{ui:Reconstruir a superfície a partir dos pontos}}.
:::
