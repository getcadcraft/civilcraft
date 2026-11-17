---
title: Desenhar com snaps, cantos escolhidos e mover, copiar, girar
summary: Posicione alinhamentos, plataformas, lotes e linhas de feição exatamente sobre pontos e cantos que você já tem, digite ou escolha a coordenada E e N de um canto, oriente uma tangente para dois pontos e mova, copie ou gire um objeto por uma distância ou um ângulo.
keywords: snap, snaps, osnap, snap no ponto, snap no canto, PI, vértice, canto, escolher, mira, coordenada E, coordenada N, coordenadas, coordenadas digitadas, tangente, direção, rumo, mover, copiar, girar, transformar, copiar girado, duplicar, alt, ponto livre, desenho
from: 49864dda
---

Novidade na 0.9: ao desenhar, o cursor se posiciona nos pontos e cantos que já estão na planta, e um canto de plataforma, lote ou linha de feição pode ser digitado ou escolhido. Este tópico percorre as três ferramentas.

## O que você vai fazer

- Desenhar com snaps, para que um novo alinhamento, plataforma, lote ou linha comece e termine exatamente sobre algo que já existe.
- Definir a coordenada E e a coordenada N de um canto, digitando-as ou escolhendo um lugar na planta.
- Orientar a tangente de um alinhamento para dois pontos escolhidos.
- Mover, copiar ou girar um objeto inteiro.

## Passos

1. Escolha uma ferramenta de desenho, por exemplo {{ui:Alinhamento}}, {{ui:Plataforma}}, {{ui:Lote}} ou {{ui:Linha de feição}}. Mova o ponteiro para perto de um ponto de levantamento, de um PI de alinhamento, de um canto de plataforma, de lote ou de massa, de um vértice de linha de feição ou de uma estrutura pluvial. Aparece um marcador com um rótulo (PI, Canto, Vértice, Estrutura ou Ponto e seu número) e a coordenada E e N onde o ponto vai cair. Clique para posicionar o ponto ali.
2. Para posicionar um ponto livremente, segure {{key:Alt}} enquanto clica. O snap é desligado.
3. Selecione uma plataforma, um lote ou uma linha de feição. Em Propriedades, o bloco {{ui:Cantos}} lista cada canto com uma caixa Leste e uma caixa Norte. Digite novos números, ou pressione o botão de mira ao lado de um canto e clique em um lugar na planta. O canto assume essa coordenada E e N. Pressione {{key:Esc}} para cancelar uma escolha. A mira funciona apenas na planta: feche antes a visualização 3D.
4. Para orientar uma tangente, selecione um alinhamento. Em Propriedades, em {{ui:Tangente por dois pontos}}, escolha a tangente, pressione {{ui:Primeiro ponto}} e clique na planta, pressione {{ui:Segundo ponto}} e clique de novo, e então pressione {{ui:Definir direção}}. A tangente passa a ir do primeiro ponto em direção ao segundo e mantém seu comprimento.
5. Para mover, copiar ou girar, selecione um alinhamento, uma plataforma, um lote ou uma linha de feição. Em Propriedades, em {{ui:Mover, copiar e girar}}, digite {{ui:Mover para leste}} e {{ui:Mover para norte}} (números negativos vão para oeste e sul) e pressione {{ui:Mover}} ou {{ui:Copiar}}. Ou pressione {{ui:Distância entre dois pontos}} e clique no ponto de origem e no ponto de destino.
6. Para girar, digite o ângulo em {{ui:Girar no sentido anti-horário}} (graus), depois pressione {{ui:Girar}} ou {{ui:Copiar girado}}. Ele gira em torno do meio dos seus cantos, a menos que você escolha um ponto de giro com a mira ao lado do ângulo.

## Observações

- Uma cópia deixa o original onde está e fica selecionada depois.
- Cada movimento, cópia, rotação, canto escolhido e tangente orientada é uma etapa de desfazer.
- Os snaps alcançam 10 pixels de tela a partir do cursor. Um marcador de snap apenas oferece um lugar; nada é alterado até você clicar.
- A mesma mira está nas linhas de PI de um alinhamento. Veja [Alinhamentos](topic:alignment), [Lotes](topic:parcels) e [Linhas de feição](topic:feature-lines).
