---
title: Abrir um DWG ou DXF como traçado
summary: Abra o traçado de um desenho camada a camada na planta, use as suas curvas de nível, polilinhas 3D e contornos fechados para a superfície, e transforme os seus blocos de pontos em pontos de levantamento.
keywords: verificação de levantamento, cotas em texto, dwg, dxf, cad, desenho, traçado, curvas de nível, linhas de quebra, limite, polilinha, polilinha 3D, camadas, mapa base, topo, desenho de levantamento, blocos, referências de bloco, pontos de levantamento a partir de blocos, atributos, blocos de pontos, ponto de inserção
from: da0f4c58
---

Um levantamento topográfico chega muitas vezes como desenho: curvas de nível como polilinhas à sua cota, linhas de quebra como polilinhas 3D, o contorno do local como polilinha fechada. O CivilCraft abre o **espaço modelo** do desenho como camadas na planta, e pode transformar essas linhas diretamente em superfície.

## Abrir o desenho

1. Clique em {{ui:Linhas}} no grupo **Superfície** (ou em {{ui:Abrir}}, ou arraste o ficheiro para a planta) e escolha um ficheiro `.dwg` ou `.dxf`. O desenho é lido neste computador; nada é enviado. São lidos os DWG de 2000 a 2018 e os DXF em ASCII.
2. A caixa de diálogo **Linhas** lista as camadas do desenho que têm linhas, figuras fechadas ou pontos, e se têm **cotas**. As camadas desligadas no desenho começam desmarcadas. Textos, tramas, cotagens e outros objetos que não são traçado são contados e deixados de fora (a caixa indica quais).
3. Verifique as **Unidades do desenho**. Quando o desenho indica as suas unidades, o CivilCraft converte-as para as do projeto (milímetros em metros, metros em pés, polegadas em pés). Um desenho em pés é lido como pés de inquérito dos EUA, sem escala: as duas unidades diferem em 2 partes por milhão, e escalar coordenadas state plane por essa diferença deslocá-las-ia em pés. Quando o desenho não indica as suas unidades, os números são lidos nas unidades do projeto; escolha as unidades certas na lista se não estiverem.
4. Em **Usar na superfície**, escolha o que cada camada dá à superfície (ou deixe **Só mostrar**). Camadas com nomes de curvas de nível (TOPO, CONT, CNTR) que têm cotas começam como linhas de quebra.
5. Clique em {{ui:Acrescentar}}. As camadas aparecem em **Camadas GIS** no painel esquerdo; cada utilização é colocada na superfície. Cada parte é um passo próprio: {{key:Mod+Z}} anula-as uma de cada vez.

## O que cada tipo de camada pode dar

| A camada contém | Usar na superfície |
|---|---|
| Curvas de nível (polilinhas a uma cota) | Linhas de quebra à cota da própria linha, ou à do campo ELEV |
| Polilinhas 3D | Linhas de quebra às suas próprias cotas |
| Um contorno fechado | O limite da superfície (a maior figura fechada, ou a que selecionou) |
| Pontos com cota | Pontos de levantamento, descritos com o nome da camada |
| Linhas à cota 0 (traçado da planta) | Nada: fica na planta como desenho de base |

Um desenho escrito pelo CivilCraft contém as suas linhas características como polilinhas 3D que guardam os seus arcos. A caixa de diálogo mostra então **Linhas características**: deixe-a marcada para as trazer de volta como linhas características, com os seus arcos e utilizações (um passo de anulação), ou desmarque-a para as ler como traçado, como qualquer outra camada.

Mais tarde, use {{ui:Usar na superfície}} no menu da camada, em **Camadas GIS**, para fazer o mesmo com uma camada que apenas mostrou.

## Pontos de levantamento a partir de blocos

Os desenhos de levantamento trazem muitas vezes os seus pontos como blocos: um pequeno símbolo em cada visada, com atributos para o número do ponto, a descrição e a cota. Quando o desenho tem referências de bloco, a caixa de diálogo tem uma secção **Pontos de levantamento a partir de blocos**:

1. Marque os blocos a tomar (a tabela indica quantas referências tem cada um, em que camadas e que atributos), ou marque camadas para tomar cada referência de bloco nelas.
2. Escolha de onde vêm o **número**, a **descrição** e a **cota** de cada ponto: um atributo, o nome do bloco ou da camada, os números livres seguintes, ou a cota Z do ponto de inserção. O CivilCraft começa pelos atributos prováveis (PT, DESC, ELEV e semelhantes), e só toma a cota de um atributo quando os blocos estão na cota zero.
3. Desmarque as camadas de traçado se quiser apenas os pontos, depois clique em {{ui:Acrescentar}}.

Cada referência torna-se um ponto de levantamento no seu ponto de inserção. Só contam as referências colocadas no espaço modelo; blocos aninhados dentro de outros blocos não. Números já existentes no projeto, ou usados duas vezes no desenho, recebem novos números a seguir ao maior, e um atributo de cota que não seja um número deixa esse ponto sem cota; a linha de estado conta ambos os casos. O desenho nunca é alterado, e cada ponto recorda o seu bloco: as suas Propriedades mostram **Do bloco**, com o bloco, a camada e o identificador (handle). Acrescentar os pontos é um só passo, por isso {{key:Mod+Z}} retira-os todos.

## Cotas escritas em texto, e a verificação

Cotas pontuais escritas em texto (ou num atributo de bloco que não seja um bloco de ponto de levantamento) não são traçado. A secção **Cotas de levantamento e verificação** pode tomá-las como pontos de levantamento, e lista o que parece errado no desenho: unidades, sistema de coordenadas, distância à origem, curvas de nível planas, cotas estranhas, pontos duplicados. Veja [Verificar um desenho de levantamento ao importar](topic:survey-check).

## Como o desenho é lido

- Arcos, círculos, elipses, segmentos de polilinha com curvatura e splines tornam-se pequenos troços retos (de 5° no máximo).
- As referências de bloco são desenhadas onde estão colocadas, incluindo os blocos aninhados; o que um bloco tem na camada 0 toma a camada da referência.
- Objetos desenhados noutro plano (com uma direção de extrusão diferente) são colocados em coordenadas do mundo.
- Cada objeto recebe três campos: LAYER, TYPE (o tipo do objeto) e ELEV (a sua cota, quando todos os seus pontos têm a mesma).
- As coordenadas são tomadas tal como são: o desenho tem de usar as mesmas coordenadas do projeto (por exemplo, a mesma zona state plane). Os desenhos referenciados (xrefs) não são abertos: abra-os separadamente.

:::tip
Um desenho de curvas de nível dá a melhor superfície com algumas cotas pontuais nos topos e nas depressões, onde só as curvas deixam triângulos planos. Acrescente-as como pontos de levantamento, ou a partir de uma camada de pontos no desenho.
:::
