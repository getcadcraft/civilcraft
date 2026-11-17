---
title: Ver o local em 3D
summary: Abra a vista 3D, oriente, faça pan e zoom, defina o exagero vertical e as cores, escolha o que aparece, e clique em alinhamentos, pads, linhas de feição, linhas de quebra, tubos, estruturas e pontos para selecioná-los.
keywords: rótulos, rótulos 3D, rótulo sempre voltado para a câmera, rótulos voltados para a câmera, rótulos de estaca, rótulos de curva de nível, rótulos de ponto, drapejar, aéreo, camadas de mapa sobre a superfície, 3d, três dimensões, vista 3D, cubo de vista, bússola, orbitar, perspectiva, paralela, isométrica, iso, exagero vertical, terreno, modelo, modelo do local, sobrevoar, visualizar, renderizar, tubos em 3D, estruturas, poços de visita, corredor em 3D, estrada em 3D, superfície da estrada, faixas, meios-fios, calçadas, plantas em 3D, árvores em 3D, arbustos, sebes, paisagismo em 3D, rampas em 3D, degraus, muros, pavimentação, elementos rígidos em 3D
from: a16bafe1
---

A vista 3D mostra o local como um único modelo: o terreno existente e a superfície terraplenada, curvas de nível aplicadas sobre eles, linhas de quebra e a borda da superfície, cada alinhamento sobre o seu perfil de projeto com marcas de estaca, as linhas de feição do corredor e a própria estrada (faixas, acostamentos, sarjetas, meios-fios, faixas e calçadas, cada um em sua cor), pads com as suas linhas de pé de talude, a rede de tubos com tubos e estruturas nas suas cotas reais, e, a partir do espaço de trabalho Paisagismo, as plantas, a pavimentação, os caminhos, os muros, os meios-fios, as rampas e os degraus. Ela lê o mesmo projeto que a planta, então toda edição aparece nas duas.

## Abrir a vista 3D

1. Abra pontos topográficos (ou um arquivo LandXML ou de projeto) para que exista uma superfície. Plantas, pavimentação ou rampas sozinhas já bastam para abri-la.
2. Pressione {{key:D}}, ou clique em {{ui:3D}} no grupo {{ui:View}} da barra de ferramentas.
   A vista 3D abre sobre a planta, olhando o local inteiro a partir do sudeste. Na primeira vez, ela leva um momento para carregar.
3. Pressione {{key:D}} de novo, ou clique em {{ui:3D}} novamente, para voltar à planta. Escolher uma ferramenta de desenho como {{ui:Alignment}} ou {{ui:Pad}} também volta à planta, já que o desenho acontece ali.

## Movimentar-se

| Para | Faça isto |
|---|---|
| Orbitar | Arraste com o botão esquerdo ou o do meio |
| Fazer pan | Arraste com o botão direito, ou mantenha {{key:Shift}} e arraste |
| Dar zoom | Gire a roda; ela dá zoom na direção do ponteiro |
| Orbitar em um trackpad | Deslize com dois dedos ({{key:Shift}} e deslizar faz pan) |
| Dar zoom em um trackpad | Pinça |
| Toque | Um dedo orbita; dois dedos pinçam para dar zoom e se movem para fazer pan |
| Teclas (a vista tem o foco) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitam; com {{key:Shift}} fazem pan; {{key:Plus}} e {{key:Minus}} dão zoom |

A barra sobre a vista tem o restante:

- A lista de vistas: **Iso**, **Superior**, **Inferior**, **Frente** (olhando para o norte), **Trás**, **Esquerda** e **Direita**.
- {{ui:Perspective}}: pressionado é uma vista em perspectiva; clique para uma projeção paralela (sem escorço).
- {{ui:Extents}}: mostra tudo de novo. {{key:F}} faz o mesmo enquanto a vista 3D estiver aberta.

## O cubo de vista

O cubo de vista no canto superior direito gira com a vista. Clique em um lado, uma aresta ou um canto para olhar o local a partir dali (a câmera gira suavemente, a menos que o seu sistema peça movimento reduzido). Arraste o cubo para orbitar. O anel da bússola abaixo dele mostra o norte (norte da malha, +Y): arraste o anel para girar o local em torno da vertical, ou clique em N, L, S ou O para olhar a partir desse lado. {{ui:Home}}, a pequena casa no canto superior esquerdo dele, volta à vista iso de todo o local. Com o teclado: {{key:Tab}} até o cubo, as setas escolhem um lado, uma aresta ou um canto, e {{key:Enter}} olha a partir dali.

Na planta, o mesmo cubo mostra o topo. Clique em qualquer outro lado, aresta ou canto (ou arraste-o) para abrir a vista 3D olhando a partir dali: é a forma mais rápida de entrar em 3D em uma determinada direção. Para trocar o cubo por um pequeno ícone de eixos, ou ocultá-lo, veja **Indicador de canto** em [Configurações do CivilCraft](topic:settings).

## Exagerar as cotas

Os locais costumam ser muito mais largos do que altos, então as cotas são esticadas em **2×** para começar. Escolha **1×**, **2×**, **3×**, **5×** ou **10×** na lista da barra, ou em **Exagero vertical 3D** nas [Configurações do CivilCraft](topic:settings) (as duas são uma única configuração). Só a vista muda: volumes, perfis e exportações permanecem na escala real.

## Colorir as superfícies

- **Faixas de cota**: as mesmas faixas e cores das faixas de cota da planta (o número de faixas é definido em **Exibir** no painel esquerdo). Cada borda de faixa é cortada exatamente na sua cota.
- **Uma cor**: o terreno existente e a superfície terraplenada, cada um em uma cor única.
- **Camadas de mapa**: as camadas de mapa mostradas sob a planta (uma imagem georreferenciada, blocos de mapa ou um serviço de mapa; veja [Camadas de mapa](topic:map-layers)) sobrepostas às superfícies como uma folha, de modo que uma foto aérea aparece sobre as colinas. Imagens que ainda estão chegando vão se completando conforme chegam. Sem nenhuma camada de mapa visível, as superfícies mantêm as suas faixas de cota e a vista informa isso. A imagem é para a tela: as exportações GLB e OBJ não a incluem.

Quando as duas superfícies são mostradas, o terreno existente fica transparente sobre a superfície terraplenada, para que você veja o corte (terreno acima do projeto) e o aterro.

## Escolher o que aparece

Clique em {{ui:Show}} na barra e marque ou desmarque:

| Item | O que é |
|---|---|
| Terreno existente | A superfície construída a partir dos pontos topográficos (ou lida de um LandXML) |
| Superfície terraplenada | O terreno existente com os corredores e pads terraplenados (somente quando há algum) |
| Arestas de triângulos | Cada aresta do TIN, como linhas |
| Curvas de nível | Curvas de nível secundárias e mestras de cada superfície mostrada, no intervalo da planta |
| Borda da superfície | A borda externa de cada superfície mostrada, nas suas cotas |
| Linhas de quebra | Cada linha de quebra, nas suas cotas |
| Alinhamentos e estacas | Cada alinhamento sobre o seu perfil de projeto (sobre o terreno quando não há perfil), com marcas a cada 50 ft ou 20 m |
| Linhas de feição do corredor | Borda da pista, acostamento e pé de talude dos dois lados |
| Superfícies de estrada | A estrada que cada corredor constrói, a partir da sua seção-tipo: faixas, acostamentos, sarjetas, meios-fios, faixas e calçadas, cada um em sua cor, sobre a superfície terraplenada |
| Plantas | Cada planta, e as plantas em canteiros e sebes, como formas simples dimensionadas pela lista de plantas: uma árvore é um tronco e uma copa redonda (um cone para uma conífera, um tufo sobre um tronco alto para uma palmeira), arbustos, plantas de sebe, perenes e cobertura do solo são domos, gramíneas são tufos, trepadeiras são colunas finas. Elas ficam sobre a superfície terraplenada (ou o terreno existente) no tamanho que a planta mostra: adulta, ou no plantio |
| Elementos rígidos | Pavimentação e caminhos com as suas quedas, muros, meios-fios, degraus e rampas que sobem em lances com patamares nivelados entre eles |
| Pads e pé de talude | O contorno de cada pad na sua cota e a sua linha de pé de talude |
| Tubos e estruturas | Tubos como tubos redondos entre as suas geratrizes inferiores, estruturas desde a tampa até o poço |
| Pontos de levantamento | Um ponto em cada ponto com cota (desligado no início) |
| Camadas SIG | As camadas SIG mostradas na planta, nas suas cores: linhas e contornos com suas próprias cotas nessas cotas, outras apoiadas sobre o terreno existente (seguindo-o exatamente); pontos como pequenas cruzes. Formas sem cota fora da superfície ficam de fora, e a vista informa quantas são |
| Rótulos | Nomes e valores que sempre ficam voltados para você: o nome de cada alinhamento no seu início e as suas estacas a cada 100 ft (ou 100 m), a cota de cada curva de nível mestra, pads, linhas de feição e estruturas pelo nome, e, com **Pontos de levantamento** marcado, o número e a cota de cada ponto |

Os rótulos mantêm o mesmo tamanho e ficam na vertical, não importa como você gire ou dê zoom, e uma colina na frente de um rótulo o oculta. Quando eles ficariam amontoados, os mais importantes aparecem e o resto espera até você dar zoom: primeiro os alinhamentos, depois as estruturas, pads, linhas de feição, estacas, curvas de nível e pontos, os mais próximos primeiro. Eles existem somente na tela; exportações e plotagens os deixam de fora.

Suas escolhas, o exagero e as cores são lembrados neste navegador.

Uma estrada é construída sobre o terreno existente. Com um alinhamento e um corredor, mas ainda sem pontos topográficos nem superfície, a estrada é desenhada sobre um terreno provisório plano por enquanto: na cota média do seu perfil de projeto, ou nivelada na cota 0 quando nem há perfil. Um aviso na parte inferior da vista 3D e nas propriedades do corredor informa isso. É apenas uma imagem: nenhum volume ou seção sai dela. Abra pontos topográficos ou uma superfície e a estrada passa sozinha para o terreno real.

O exagero vertical estica o terreno, não as plantas: elas ficam sobre o terreno exagerado na sua altura e amplitude reais, então uma árvore parece uma árvore em qualquer configuração. As plantas são formas simples, não modelos detalhados: milhares delas continuam rápidas para girar e dar zoom.

## Tubos e estruturas

- Um tubo é desenhado com a sua geratriz inferior dentro das geratrizes que você definiu e o seu topo dentro (a geratriz superior) um diâmetro interno acima. Os diâmetros são em polegadas em um projeto em pés e em milímetros em um projeto métrico, como no painel da direita.
- Uma estrutura vai desde a sua tampa (digitada, ou a partir da superfície) até o seu poço (a menor geratriz menos a profundidade do poço). Sem nenhuma geratriz, ela é desenhada com 5 ft (1,5 m) de profundidade.
- Tubos e estruturas com um problema (veja a verificação da rede no painel da direita) são desenhados em vermelho.
- Um tubo sem geratrizes não é desenhado; uma nota na parte inferior da vista informa quantos são.

## Selecionar a partir da vista 3D

Clique em um alinhamento (ou na sua estrada), em um pad, em uma linha de feição, em um tubo, em uma estrutura, em um ponto topográfico, em uma planta, em uma rampa ou em outro elemento rígido. Ele fica selecionado exatamente como se você tivesse clicado na planta: as suas propriedades abrem no painel da direita, onde você pode editá-las, e ele é desenhado na cor de seleção sobre tudo em 3D. O que você seleciona na planta também fica destacado em 3D. Uma dica ao lado do ponteiro informa o nome do que você clicou, com a sua coordenada leste, norte e a cota. Tubos e estruturas podem ser clicados mesmo onde estão sob o terreno; uma linha escondida atrás de uma colina não pode ser clicada através dela.

Clique em uma linha de quebra para ver qual é: ela fica destacada, e a barra de status a nomeia (linhas de quebra não têm propriedades próprias).

Clique no terreno para ler a coordenada leste, norte e a cota ali na dica.

## Percorrer um alinhamento

Clique em **Percorrer** na barra 3D e escolha um alinhamento. A vista vai para o banco do motorista: 3,5 ft (1,07 m) acima da estrada, sobre o seu perfil de projeto (sobre o terreno existente ao longo do eixo, quando ele ainda não tem um), olhando para a frente ao longo dele.

- **Reproduzir** ou {{key:Space}} percorre na velocidade que você escolher (de 10 a 65 mph, ou de 15 a 100 km/h); {{key:Space}} de novo pausa. Ele para no fim; **Reproduzir** então recomeça do início.
- O controle deslizante pula para qualquer estaca; {{key:Left}} e {{key:Right}} avançam ou recuam 10 ft (5 m).
- Arrastar na vista pausa e permite olhar ao redor.
- **Parar** ou {{key:Esc}} devolve a vista ao lugar onde estava.

O exagero vertical também se aplica ao percorrer: defina-o em 1× para ver a estrada como ela será.

## Luz do sol

Abra **Sol** na barra 3D e marque **Luz do sol**. Informe uma data, um horário e o seu fuso (a diferença em relação ao UTC: no verão, a do horário de verão), e a latitude e a longitude do local. Quando o projeto tem um sistema de coordenadas, elas são preenchidas a partir dele.

O local é então iluminado a partir de onde está o sol, com **Sombras** sobre o terreno, o corredor e os pads; o menu informa o azimute do sol e a sua altura, ou que ele está abaixo do horizonte. As posições vêm das equações solares da NOAA. As sombras caem do lado certo em qualquer exagero, mas param na borda do local: colinas e edificações além dela não projetam sombra.

## Exportar a vista 3D

Clique em {{ui:GLB}} ou {{ui:OBJ}} na barra. O que a vista mostra é salvo na escala real (sem exagero), em metros, com Y para cima. Detalhes: [Exportar o local em 3D](topic:export-3d).
