---
title: Abrir um DWG ou DXF como linework
summary: Abra a linework de um desenho no plano, camada por camada, use suas curvas de nível, polilinhas 3D e contornos fechados para a superfície, e transforme os seus blocos de pontos em pontos topográficos.
keywords: verificação topográfica, cotas de texto, dwg, dxf, cad, desenho, linework, curvas de nível, linhas de quebra, limite, polilinha, polilinha 3D, camadas, mapa base, topo, desenho topográfico, blocos, referências de bloco, pontos topográficos a partir de blocos, atributos, blocos de pontos, ponto de inserção
from: da0f4c58
---

Um levantamento topográfico costuma chegar como um desenho: curvas de nível como polilinhas na sua cota, linhas de quebra como polilinhas 3D, o contorno do local como uma polilinha fechada. O CivilCraft abre o **espaço modelo** do desenho como camadas no plano, e pode transformar essas linhas diretamente na superfície.

## Abrir o desenho

1. Clique em {{ui:Linework}} no grupo **Surface** (ou em {{ui:Open}}, ou solte o arquivo no plano) e escolha um arquivo `.dwg` ou `.dxf`. O desenho é lido neste computador; nada é enviado. São lidos DWG de 2000 a 2018 e DXF ASCII.
2. A caixa de diálogo **Linework** lista as camadas do desenho que contêm linhas, formas fechadas ou pontos, e se elas têm **cotas**. Camadas desligadas no desenho começam desmarcadas. Textos, hachuras, cotas e outros objetos que não são linework são contados e deixados de fora (a caixa informa quais).
3. Confira **Drawing units**. Quando o desenho informa suas unidades, o CivilCraft as converte para as do projeto (milímetros em metros, metros em pés, polegadas em pés). Um desenho em pés é lido como pés dos EUA (survey feet) sem escala: a diferença entre eles é de 2 partes por milhão, e escalar coordenadas de plano estadual por essa diferença as moveria em pés. Quando o desenho não informa suas unidades, os números são lidos nas unidades do projeto; escolha as unidades corretas na lista se não forem essas.
4. Em **Use for the surface**, escolha o que cada camada fornece à superfície (ou deixe **Only show it**). Camadas com nomes de curvas de nível (TOPO, CONT, CNTR) que têm cotas começam como linhas de quebra.
5. Clique em {{ui:Add}}. As camadas aparecem em **GIS layers** no painel esquerdo; cada uso é incluído na superfície. Cada parte é um passo próprio: {{key:Mod+Z}} as desfaz uma de cada vez.

## O que cada tipo de camada pode fornecer

| A camada contém | Use para a superfície |
|---|---|
| Curvas de nível (polilinhas em uma cota) | Linhas de quebra na cota própria das linhas, ou no campo ELEV |
| Polilinhas 3D | Linhas de quebra nas próprias cotas |
| Um contorno fechado | O limite da superfície (a maior forma fechada, ou a que você selecionou) |
| Pontos com cota | Pontos topográficos, descritos com o nome da camada |
| Linhas na cota 0 (linework do plano) | Nada: permanece no plano como um desenho de base |

Um desenho escrito pelo CivilCraft guarda suas linhas de feição como polilinhas 3D que lembram os seus arcos. A caixa de diálogo então mostra **Feature lines**: deixe marcado para trazê-las de volta como linhas de feição, com seus arcos e usos (um passo de desfazer), ou desmarque para lê-las como linework, como qualquer outra camada.

Mais tarde, use {{ui:Use for the surface}} no menu da camada, em **GIS layers**, para fazer o mesmo com uma camada que você apenas mostrou.

## Pontos topográficos a partir de blocos

Desenhos topográficos costumam trazer seus pontos como blocos: um pequeno símbolo em cada visada, com atributos para o número do ponto, a descrição e a cota. Quando o desenho tem referências de bloco, a caixa de diálogo tem uma seção **Survey points from blocks**:

1. Marque os blocos a pegar (a tabela informa quantas referências cada um tem, em quais camadas e quais atributos), ou marque camadas para pegar todas as referências de bloco nelas.
2. Escolha de onde vêm o **número**, a **descrição** e a **cota** de cada ponto: um atributo, o nome do bloco ou da camada, os próximos números livres, ou o Z do ponto de inserção. O CivilCraft começa pelos atributos prováveis (PT, DESC, ELEV e semelhantes), e pega a cota de um atributo somente quando os blocos estão na cota zero.
3. Desmarque as camadas de linework se quiser apenas os pontos, depois clique em {{ui:Add}}.

Cada referência vira um ponto topográfico no seu ponto de inserção. Só contam as referências colocadas no espaço modelo; blocos aninhados dentro de outros blocos não. Números que já existem no projeto, ou usados duas vezes no desenho, recebem novos números depois do maior; um atributo de cota que não é número deixa esse ponto sem cota; a linha de status conta os dois casos. O desenho nunca é alterado, e cada ponto guarda o seu bloco: as suas Propriedades mostram **From block** com o bloco, a camada e o identificador. Acrescentar os pontos é um único passo, então {{key:Mod+Z}} os remove todos.

## Cotas escritas como texto, e a verificação

Cotas pontuais escritas como texto (ou em um atributo de bloco que não é um bloco de ponto topográfico) não são linework. A seção **Survey levels and check** pode tomá-las como pontos topográficos, e lista o que parece errado no desenho: unidades, sistema de coordenadas, distância da origem, curvas de nível planas, cotas estranhas, pontos duplicados. Veja [Verificar um desenho topográfico na importação](topic:survey-check).

## Como o desenho é lido

- Arcos, círculos, elipses, segmentos de polilinha com curvatura e splines viram pequenos trechos retos (a cada 5° no máximo).
- Referências de bloco são desenhadas onde estão colocadas, inclusive blocos aninhados; o que um bloco tem na camada 0 assume a camada da referência.
- Objetos desenhados em outro plano (com uma direção de extrusão diferente) são colocados em coordenadas globais.
- Cada objeto recebe três campos: LAYER, TYPE (o tipo do objeto) e ELEV (a cota dele, quando todos os seus pontos têm uma só).
- As coordenadas são usadas como estão: o desenho precisa usar as mesmas coordenadas do projeto (por exemplo, a mesma zona do plano estadual). Desenhos vinculados (xrefs) não são abertos: abra-os separadamente.

:::tip
Um desenho de curvas de nível dá a melhor superfície com algumas cotas pontuais em topos de morros e em depressões, onde as curvas sozinhas deixam triângulos planos. Adicione-as como pontos topográficos, ou a partir de uma camada de pontos do desenho.
:::
