---
title: Modelação do terreno para paisagismo
summary: Plataformas, taludes de terra, valas e modelação livre, com cotas pontuais e curvas de nível que arrasta, escavação e aterro em tempo real, análise de declives, setas de escoamento e zonas de acumulação de água — tudo na superfície proposta do CivilCraft.
keywords: muro de suporte, muros de suporte, lado vertical, muro em vez de talude, talude por lado, aterro, modelação, modelação paisagística, plataforma, terraço, plataforma de implantação, talude de terra, montículo, vala, cota pontual, curvas de nível, editar curvas de nível, escavação e aterro, movimento de terras, análise de declives, acessibilidade, declives acentuados, setas de escoamento, drenagem, acumulação de água, poças
from: e1559eb9
---

Tudo isto é modelado na **superfície proposta** com a mesma modelação das plataformas e dos corredores. O **terreno natural** nunca é alterado, e o Earthwork contabiliza tudo. O menu {{ui:Modelação}} está no grupo Paisagismo.

## Plataformas

{{ui:Modelação}} › {{ui:Plataforma}}, depois clique nos cantos e prima {{key:Enter}}. A plataforma começa na cota média do terreno sob ela; escreva uma **Cota** para a definir, ou deixe-a vazia para voltar a seguir o terreno. Um **Declive** em % e a **Direção do declive** em graus (0 = Este, 90 = Norte) inclinam-na. Os seus lados são modelados até ao terreno com o **Talude de escavação** e o **Talude de aterro** (horizontal para 1).

## Taludes por lado e muros de suporte

Em **Lados e muros de suporte** nas **Propriedades** de uma plataforma ou de um talude de terra, cada lado pode ser modelado à sua maneira. O lado 1 vai do primeiro canto que clicou até ao segundo, o lado 2 do segundo ao terceiro, e assim por diante.

- **Todos os lados**: **Inclinado** usa os taludes de escavação e aterro acima em cada lado; **Verticais: muros de suporte** coloca um muro em cada lado.
- Por lado: **Taludes acima**, **Taludes próprios** (escreva um talude de escavação e um de aterro para esse lado) ou **Vertical (muro de suporte)**.
- Escreva um talude como `3` ou `3:1` (horizontal para 1 vertical), `33%` ou `18.4°`; é apresentado como H:1. Os **Taludes de escavação** e **de aterro** da própria plataforma aceitam o mesmo.
- Um lado vertical não tem talude: um muro de suporte corre ao longo da aresta, desde a plataforma até ao terreno natural (em aterro) ou desde o terreno até à plataforma (em escavação). A **Espessura do muro** (0.3 m ou 1 ft como ponto de partida) é a distância a que o terreno se desloca da aresta da plataforma até ao terreno natural. Os volumes de escavação e aterro excluem o talude que esse lado já não tem.
- Onde um muro encontra um lado inclinado, o talude contorna a extremidade do muro; dois muros encontram-se numa meia-esquadria.
- Por baixo dos campos: o comprimento dos muros, a face exposta (altura × comprimento), a altura mais alta e a média.

A planta desenha a face exterior de cada muro com pequenos traços que a atravessam e a sua altura nas duas extremidades e no ponto mais alto (na camada dos muros de suporte, que também vai para DXF e DWG). A vista 3D mostra os muros como sólidos (**Mostrar** › **Muros de suporte**), e as exportações GLB, OBJ e USD incluem-nos. As secções transversais à aresta mostram o degrau.

**Avisos** (nas Propriedades e no painel Problemas): um muro mais alto do que **Avisar acima de uma altura de muro de** (1.0 m ou 3.3 ft como ponto de partida) "pode precisar de um muro projetado por engenheiro ou de licença; verifique as regras locais", e, quando escrever o **Declive máximo que o solo suporta**, qualquer lado cujo talude de escavação ou aterro seja mais íngreme do que isso. São avisos: a modelação é criada na mesma. Cada alteração é um só passo para {{key:Mod+Z}}.

## Taludes de terra

{{ui:Modelação}} › {{ui:Talude de terra}}: um montículo cujo topo fica a uma **Altura** acima da cota média do terreno sob ele, com os lados modelados.

## Valas

{{ui:Modelação}} › {{ui:Vala de drenagem}}, depois clique ao longo da vala **no sentido em que a água corre** e prima {{key:Enter}}. Defina a sua **Profundidade**, a **Largura do fundo** (0 para um V) e o **Talude lateral**. Sem **Declive**, o fundo segue o terreno, a uma profundidade abaixo dele, e nunca sobe; escreva um declive para lhe dar um declive constante desde o início.

## Cotas pontuais e curvas de nível

1. {{ui:Modelação}} › {{ui:Zona de modelação}}: clique no contorno da área que quer moldar.
2. {{ui:Modelação}} › {{ui:Cota altimétrica}}: clique dentro da área. Escreva a sua cota nas Propriedades, ou use os botões ▲ ▼.
3. {{ui:Modelação}} › {{ui:Editar uma curva de nível}}: clique numa curva de nível dentro da área para a tomar como uma linha que pode remodelar.

Selecione uma cota ou uma curva de nível e **arraste**-a (ou os seus pontos) na planta: a superfície segue quando soltar, num só passo de anulação. Dentro da área, o terreno é reconstruído a partir da sua aresta (onde encontra o terreno natural), das cotas pontuais e das curvas de nível editadas.

## Escavação e aterro em tempo real

Nas Propriedades de cada objeto de modelação aparecem a sua **Escavação** e o seu **Aterro**, e os do local inteiro, pelo método de grelha que o Earthwork usa, à medida que os altera. Os problemas (fora da superfície, um contorno que se cruza a si mesmo) são listados aí.

## Verificações de modelação

Na secção **Verificações de modelação** à esquerda:

- **Análise de declives** colore a superfície pelo gradiente: até ao limite suave, entre os dois, e mais íngreme do que o limite de declive acentuado (5 % e 33.3 % como ponto de partida: o habitual 1:20 para percursos acessíveis e 1:3 para relvados). A legenda indica que área cai em cada classe. As áreas íngremes também são impressas nas folhas.
- **Setas de escoamento e acumulações** desenha o sentido em que a água corre e assinala com um círculo cada sítio onde ela se acumularia, com a sua profundidade; a secção indica quantos sítios são, o mais fundo e quanta água retêm.

As verificações leem a superfície proposta quando há algo modelado; caso contrário, leem o terreno natural.
