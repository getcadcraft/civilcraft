---
title: Desenhar com snaps, cantos escolhidos e mover, copiar e rodar
summary: Posicione diretrizes, plataformas, lotes e linhas características exatamente sobre pontos e cantos que já tem, escreva ou escolha a coordenada E e N de um canto, oriente uma tangente para dois pontos, e mova, copie ou rode um objeto por uma distância ou um ângulo.
keywords: snap, snaps, osnap, snap a ponto, snap a canto, PI, vértice, canto, escolher, cruzeta, coordenada E, coordenada N, coordenadas, coordenadas escritas, tangente, direção, rumo, mover, copiar, rodar, transformar, copiar e rodar, duplicar, alt, ponto livre, desenho
from: 49864dda
---

Novidade na 0.9: ao desenhar, o cursor cai sobre os pontos e cantos que já estão na planta, e um canto de plataforma, lote ou linha característica pode ser escrito ou escolhido. Este tópico percorre as três ferramentas.

## O que vai fazer

- Desenhar com snaps, para que uma nova diretriz, plataforma, lote ou linha comece e termine exatamente sobre algo que já existe.
- Definir a coordenada E e N de um canto, escrevendo-a ou escolhendo um local na planta.
- Orientar uma tangente de diretriz para dois pontos escolhidos.
- Mover, copiar ou rodar um objeto inteiro.

## Passos

1. Escolha uma ferramenta de desenho, por exemplo {{ui:Diretriz}}, {{ui:Plataforma}}, {{ui:Lote}} ou {{ui:Linha característica}}. Mova o cursor para perto de um ponto topográfico, de um PI de diretriz, de um canto de plataforma, lote ou massa, de um vértice de linha característica ou de uma estrutura pluvial. Aparece um marcador com uma etiqueta (PI, Canto, Vértice, Estrutura ou Ponto e o seu número) e a coordenada E e N onde vai cair. Clique para colocar o ponto aí.
2. Para colocar um ponto livremente, mantenha {{key:Alt}} premido ao clicar. O snap desliga-se.
3. Selecione uma plataforma, um lote ou uma linha característica. Nas Propriedades, o bloco {{ui:Cantos}} lista cada canto com uma caixa de E e uma caixa de N. Escreva novos números, ou prima o botão da cruzeta ao lado de um canto e clique num local na planta. O canto toma essa coordenada E e N. Prima {{key:Esc}} para cancelar uma escolha. A cruzeta só funciona na planta: feche primeiro a vista 3D.
4. Para orientar uma tangente, selecione uma diretriz. Nas Propriedades, em {{ui:Tangente a partir de dois pontos}}, escolha a tangente, prima {{ui:Primeiro ponto}} e clique na planta, prima {{ui:Segundo ponto}} e clique de novo, depois prima {{ui:Definir direção}}. A tangente passa a ir do primeiro ponto para o segundo e mantém o seu comprimento.
5. Para mover, copiar ou rodar, selecione uma diretriz, plataforma, lote ou linha característica. Nas Propriedades, em {{ui:Mover, copiar e rodar}}, escreva {{ui:Mover para Este}} e {{ui:Mover para Norte}} (números negativos vão para Oeste e Sul) e prima {{ui:Mover}} ou {{ui:Copiar}}. Ou prima {{ui:Distância a partir de dois pontos}} e clique no ponto de onde mover e no ponto para onde mover.
6. Para rodar, escreva o ângulo em {{ui:Rodar no sentido anti-horário}} (graus), depois prima {{ui:Rodar}} ou {{ui:Copiar e rodar}}. Roda em torno do centro dos seus cantos, a não ser que escolha um ponto em torno do qual rodar com a cruzeta ao lado do ângulo.

## Notas

- Uma cópia deixa o original onde está e fica selecionada depois.
- Cada movimento, cópia, rotação, canto escolhido e tangente orientada é um passo de anulação.
- Os snaps alcançam 10 pixels de ecrã a partir do cursor. Um marcador de snap apenas oferece um local; nada é alterado até clicar.
- A mesma cruzeta está nas linhas de PI de uma diretriz. Veja [Diretrizes](topic:alignment), [Lotes](topic:parcels) e [Linhas características](topic:feature-lines).
