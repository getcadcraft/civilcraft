---
title: Ver o local em 3D
summary: Abrir a vista 3D, orbitar, deslocar a vista e aplicar zoom, definir o exagero vertical e a coloração, escolher o que se mostra, e clicar em diretrizes, plataformas, linhas características, linhas de quebra, coletores, órgãos e pontos para os selecionar.
keywords: etiquetas, etiquetas 3D, etiquetas voltadas para a câmara, etiquetas de PK, etiquetas de curvas de nível, etiquetas de pontos, aplicar, aérea, camadas de mapa na superfície, 3d, três dimensões, vista 3D, cubo de vistas, rosa dos ventos, orbitar, perspetiva, paralela, isométrica, iso, exagero vertical, terreno, modelo, modelo do local, sobrevoar, visualizar, renderizar, coletores em 3D, órgãos, caixas de visita, corredor em 3D, estrada em 3D, superfície da estrada, faixas, lancis, passeios, plantas em 3D, árvores em 3D, arbustos, sebes, paisagismo em 3D, rampas em 3D, degraus, muros, pavimentação, elementos construídos em 3D
from: a16bafe1
---

A vista 3D mostra o local como um só modelo: o terreno natural e a superfície modelada, as curvas de nível aplicadas sobre eles, as linhas de quebra e o limite da superfície, cada diretriz no seu perfil de projeto com as marcas de PK, as linhas características do corredor e a própria estrada (faixas, berma, valetas, lancis, faixas laterais e passeios, cada um na sua cor), as plataformas com as suas linhas de intersecção do talude, a rede de coletores com os coletores e os órgãos às suas cotas reais, e, a partir do espaço de trabalho Paisagismo, as plantas, a pavimentação, os caminhos, os muros, os lancis, as rampas e os degraus. Lê o mesmo projeto que a planta, por isso cada alteração aparece nas duas.

## Abrir a vista 3D

1. Abra pontos topográficos (ou um ficheiro LandXML ou de projeto) para existir uma superfície. Plantas, pavimentação ou rampas sozinhas também bastam para a abrir.
2. Prima {{key:D}}, ou clique em {{ui:3D}} no grupo {{ui:Ver}} da barra de ferramentas.
   A vista 3D abre sobre a planta, a olhar para o local inteiro a partir de sudeste. Da primeira vez, demora um momento a carregar.
3. Prima {{key:D}} de novo, ou clique outra vez em {{ui:3D}}, para voltar à planta. Escolher uma ferramenta de desenho, como {{ui:Diretriz}} ou {{ui:Plataforma}}, também volta à planta, já que o desenho acontece aí.

## Deslocar-se

| Para | Faça isto |
|---|---|
| Orbitar | Arraste com o botão esquerdo ou o do meio |
| Deslocar a vista (pan) | Arraste com o botão direito, ou mantenha {{key:Shift}} e arraste |
| Aplicar zoom | Rode a roda; o zoom faz-se na direção do ponteiro |
| Orbitar num touchpad | Deslize com dois dedos ({{key:Shift}} e deslizar desloca a vista) |
| Aplicar zoom num touchpad | Gesto de pinça |
| Toque | Um dedo orbita; dois dedos em pinça aplicam zoom e deslocam a vista |
| Teclas (a vista tem o foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitam; com {{key:Shift}} deslocam a vista; {{key:Plus}} e {{key:Minus}} aplicam zoom |

A barra sobre a vista tem o resto:

- A lista de vistas: **Iso**, **Topo**, **Inferior**, **Frente** (a olhar para norte), **Trás**, **Esquerda**, **Direita**.
- {{ui:Perspetiva}}: premido é uma vista em perspetiva; clique para uma projeção paralela (sem encurtamento).
- {{ui:Extensão}}: mostra tudo de novo. {{key:F}} faz o mesmo com a vista 3D aberta.

## O cubo de vistas

O cubo de vistas no canto superior direito roda com a vista. Clique num lado, numa aresta ou num canto para olhar o local a partir daí (a câmara roda suavemente, a não ser que o sistema peça movimento reduzido). Arraste o cubo para orbitar. A rosa dos ventos por baixo dele mostra o norte (norte da grelha, +Y): arraste o anel para rodar o local em torno da vertical, ou clique em N, E, S ou O para olhar desse lado. {{ui:Base}}, a pequena casa no seu canto superior esquerdo, volta à vista iso do local inteiro. Com o teclado: {{key:Tab}} para o cubo, as setas escolhem um lado, uma aresta ou um canto, e {{key:Enter}} olha dessa direção.

Na planta, o mesmo cubo mostra o topo. Clique em qualquer outro lado, aresta ou canto (ou arraste-o) para abrir a vista 3D a olhar dessa direção: é a forma mais rápida de entrar em 3D a partir de uma direção dada. Para trocar o cubo por um pequeno ícone dos eixos, ou para o ocultar, veja **Indicador de canto** em [Definições do CivilCraft](topic:settings).

## Exagerar as cotas

Os locais são normalmente muito mais largos do que altos, por isso as cotas são esticadas **2×** para começar. Escolha **1×**, **2×**, **3×**, **5×** ou **10×** na lista da barra, ou em **Exagero vertical 3D** nas [Definições do CivilCraft](topic:settings) (são a mesma definição). Só a vista muda: volumes, perfis e exportações mantêm a escala real.

## Colorir as superfícies

- **Faixas de cota**: as mesmas faixas e cores das faixas de cota da planta (o número de faixas define-se em **Visualização**, no painel esquerdo). Cada limite de faixa é cortado exatamente à sua cota.
- **Uma cor**: o terreno natural e a superfície modelada, cada um numa cor lisa.
- **Camadas de mapa**: as camadas de mapa mostradas sob a planta (uma imagem georreferenciada, mosaicos de mapa ou um serviço de mapas; ver [Camadas de mapa](topic:map-layers)) estendidas sobre as superfícies como uma folha, por isso uma fotografia aérea aparece nas colinas. As imagens que ainda chegam vão preenchendo à medida que chegam. Sem nenhuma camada de mapa visível, as superfícies mantêm as suas faixas de cota e a vista di-lo. A imagem é para o ecrã: as exportações GLB e OBJ não a incluem.

Quando as duas superfícies são mostradas, o terreno natural é transparente sobre a superfície modelada, para que se vejam a escavação (terreno acima do projeto) e o aterro.

## Escolher o que se mostra

Clique em {{ui:Mostrar}} na barra e marque ou desmarque:

| Item | O que é |
|---|---|
| Terreno natural | A superfície construída a partir dos pontos topográficos (ou lida de um LandXML) |
| Superfície modelada | O terreno natural com os corredores e as plataformas modelados (só quando existem) |
| Arestas dos triângulos | Cada aresta da TIN, como linhas |
| Curvas de nível | Curvas mestras e secundárias de cada superfície mostrada, ao intervalo da planta |
| Limite da superfície | O limite exterior de cada superfície mostrada, às suas cotas |
| Linhas de quebra | Cada linha de quebra, às suas cotas |
| Diretrizes e estacas | Cada diretriz no seu perfil de projeto (no terreno onde não há perfil), com marcas a cada 50 ft ou 20 m |
| Linhas características do corredor | Bordo da faixa de rodagem, berma e linha de intersecção do talude dos dois lados |
| Superfícies da estrada | A estrada que cada corredor constrói, a partir da sua secção-tipo: faixas, bermas, valetas, lancis, faixas laterais e passeios, cada um na sua cor, sobre a superfície modelada |
| Plantas | Cada planta, e as plantas em canteiros e sebes, como formas simples dimensionadas a partir da lista de plantas: uma árvore é um tronco e uma copa redonda (um cone para uma conífera, um tufo sobre um tronco alto para uma palmeira); arbustos, plantas de sebe, vivazes e cobridoras do solo são cúpulas, as gramíneas são tufos e as trepadeiras são colunas finas. Assentam na superfície modelada (ou no terreno natural) à dimensão que a planta mostra: adulta, ou no momento da plantação |
| Elementos construídos | Pavimentos e caminhos com as suas quedas, muros, lancis, degraus e rampas que sobem em lanços com patamares entre eles |
| Plataformas e linhas de intersecção | O contorno de cada plataforma à sua cota e a sua linha de intersecção do talude |
| Coletores e órgãos | Coletores como tubos circulares entre as suas soleiras, órgãos desde a tampa até ao poço |
| Pontos topográficos | Um ponto em cada ponto com cota (desligado no início) |
| Camadas SIG | As camadas SIG mostradas na planta, nas suas cores: linhas e contornos com as suas próprias cotas às cotas dessas, outros assentes no terreno natural (seguem-no exatamente); pontos como pequenas cruzes. As formas sem cotas fora da superfície ficam de fora, e a vista indica quantas |
| Etiquetas | Nomes e valores que estão sempre voltados para si: o nome de cada diretriz no seu início e as estacas a cada 100 ft (ou 100 m), a cota de cada curva de nível mestra, plataformas, linhas características e órgãos pelo nome e, com **Pontos topográficos** marcado, o número e a cota de cada ponto |

As etiquetas mantêm o mesmo tamanho e na vertical, qualquer que seja a rotação ou o zoom, e uma elevação à frente de uma etiqueta oculta-a. Onde se amontoariam, mostram-se as mais importantes e as restantes esperam até aproximar o zoom: primeiro as diretrizes, depois os órgãos, plataformas, linhas características, estacas, curvas de nível e pontos, os mais próximos primeiro. São apenas para o ecrã; as exportações e as impressões deixam-nas de fora.

As suas escolhas, o exagero e a coloração ficam memorizados neste navegador.

Uma estrada é construída sobre o terreno natural. Com uma diretriz e um corredor mas sem pontos topográficos nem superfície ainda, a estrada é desenhada sobre um terreno provisório plano: à cota média do seu perfil de projeto, ou ao nível 0 quando não há perfil. Um aviso na parte inferior da vista 3D e nas propriedades do corredor di-lo. É apenas uma imagem: não resultam dela volumes nem perfis. Ao abrir pontos topográficos ou uma superfície, a estrada passa sozinha para o terreno real.

O exagero vertical estica o terreno, não as plantas: estas assentam no terreno exagerado à sua altura real e com a sua largura real, por isso uma árvore parece uma árvore com qualquer definição. As plantas são formas simples, não modelos detalhados: milhares delas continuam rápidas de rodar e de ampliar.

## Coletores e órgãos

- Um coletor é desenhado com a sua parte inferior interior nas soleiras que definiu e a sua parte superior interior (a geratriz superior) um diâmetro interior mais alto. Os diâmetros estão em polegadas num projeto em pés e em milímetros num projeto métrico, como no painel da direita.
- Um órgão vai desde a sua tampa (indicada, ou da superfície) até ao seu poço (a soleira mais baixa menos a profundidade do poço). Sem nenhuma soleira, é desenhado com 5 ft (1.5 m) de profundidade.
- Coletores e órgãos com um problema (ver a verificação da rede no painel da direita) são desenhados a vermelho.
- Um coletor sem soleiras não é desenhado; uma nota na parte inferior da vista indica quantos são.

## Selecionar a partir da vista 3D

Clique numa diretriz (ou na sua estrada), numa plataforma, numa linha característica, num coletor, num órgão, num ponto topográfico, numa planta, numa rampa ou noutro elemento construído. Fica selecionado exatamente como se o tivesse clicado na planta: as suas propriedades abrem-se no painel da direita, onde pode editá-las, e é desenhado na cor de seleção por cima de tudo na 3D. O que selecionar na planta fica também realçado na 3D. Uma dica junto ao ponteiro indica o que clicou, com a sua coordenada este, norte e cota. Coletores e órgãos podem ser clicados mesmo quando estão debaixo do terreno; uma linha escondida atrás de uma colina não pode ser clicada através dela.

Clique numa linha de quebra para ver qual é: fica realçada, e a barra de estado indica o seu nome (as linhas de quebra não têm propriedades próprias).

Clique no terreno para ler a coordenada este, norte e a cota aí na dica.

## Conduzir ao longo de uma diretriz

Clique em **Conduzir** na barra 3D e escolha uma diretriz. A vista desloca-se para o lugar do condutor: 3.5 ft (1.07 m) acima da estrada, sobre o seu perfil de projeto (sobre o terreno natural ao longo do eixo quando ainda não tem nenhum), a olhar em frente ao longo dela.

- **Reproduzir** ou {{key:Space}} conduz à velocidade que escolher (10 a 65 mph, ou 15 a 100 km/h); {{key:Space}} de novo pausa. Para no fim; **Reproduzir** volta então a começar desde o início.
- O cursor salta para qualquer PK; {{key:Left}} e {{key:Right}} avançam ou recuam 10 ft (5 m).
- Arrastar na vista pausa e deixa-o olhar à volta.
- **Parar** ou {{key:Esc}} devolve a vista ao sítio onde estava.

O exagero vertical aplica-se também ao conduzir: defina-o para 1× para ver a estrada como ficará.

## Luz do sol

Abra **Sol** na barra 3D e marque **Luz do sol**. Indique uma data, uma hora de relógio e o seu fuso horário (o desvio em relação ao UTC: no verão, o da hora de verão), e a latitude e a longitude do local. Quando o projeto tem um sistema de coordenadas, estas são preenchidas a partir dele.

O local fica então iluminado a partir de onde está o sol, com **Sombras** sobre o terreno, o corredor e as plataformas; o menu indica o azimute do sol e a sua altura, ou que está abaixo do horizonte. As posições vêm das equações solares da NOAA. As sombras caem do lado certo em qualquer exagero, mas param na borda do local: colinas e edifícios para além dele não projetam nenhuma.

## Exportar a vista 3D

Clique em {{ui:GLB}} ou {{ui:OBJ}} na barra. O que a vista mostra é guardado à escala real (sem exagero), em metros, com Y para cima. Detalhes: [Exportar o local em 3D](topic:export-3d).
