---
title: Terraplenagem para paisagismo
summary: Plataformas, camalhões, valas de drenagem e terraplenagem livre com cotas de nível e curvas de nível que você arrasta, corte e aterro em tempo real, análise de declividade, setas de fluxo e empoçamento — tudo na superfície projetada do CivilCraft.
keywords: muro de arrimo, muros de arrimo, lado vertical, muro em vez de talude, talude por lado, aterro, terraplenagem, terraplenagem para paisagismo, plataforma, terraço, camalhão, montículo, vala de drenagem, cota de nível, curvas de nível, editar curvas de nível, corte e aterro, movimento de terra, análise de declividade, acessibilidade, encostas íngremes, setas de fluxo, drenagem, empoçamento, poças
from: e1559eb9
---

Tudo aqui é terraplenado na **superfície projetada**, com a mesma terraplenagem de plataformas e corredores. O **terreno existente** nunca é alterado, e o Movimento de terra contabiliza tudo. O menu Terraplenagem fica no grupo Paisagismo.

## Plataformas

{{ui:Terraplenagem}} › {{ui:Plataforma}}, depois clique nos cantos e pressione {{key:Enter}}. A plataforma começa na elevação média do terreno sob ela; digite uma **Elevação** para defini-la, ou deixe vazio para seguir o terreno de novo. Uma **Queda** em % e **Cai para** em graus (0 = leste, 90 = norte) a inclinam. Seus lados são terraplenados até o terreno, com o **Talude de corte** e o **Talude de aterro** (horizontal para 1).

## Taludes por lado e muros de arrimo

Em **Lados e muros de arrimo** nas Propriedades de uma plataforma, de um camalhão ou de uma área, cada lado pode ser terraplenado do seu próprio jeito. O lado 1 vai do primeiro canto que você clicou até o segundo, o lado 2 do segundo ao terceiro, e assim por diante.

- **Todos os lados**: **Inclinado** usa os taludes de corte e aterro acima em todos os lados; **Vertical: muros de arrimo** coloca um muro em todos os lados.
- Por lado: **Taludes acima**, **Taludes próprios** (digite um talude de corte e um de aterro para aquele lado) ou **Vertical (muro de arrimo)**.
- Digite um talude como `3` ou `3:1` (horizontal para 1 vertical), `33%` ou `18.4°`; ele é exibido como H:1. O **Talude de corte** e o **Talude de aterro** da própria plataforma aceitam o mesmo.
- Um lado vertical não tem aterro de talude: um muro de arrimo corre ao longo da borda, da plataforma descendo até o terreno existente (em aterro) ou do terreno descendo até a plataforma (em corte). A **Espessura do muro** (0.3 m ou 1 ft como ponto de partida) é quanto o terreno dá degrau da borda da plataforma até o terreno existente. Os volumes de corte e aterro deixam de fora o talude que esse lado não tem mais.
- Onde um muro encontra um lado inclinado, o talude contorna a extremidade do muro; dois muros se encontram em meia-esquadria.
- Abaixo dos campos: o comprimento dos muros, a face exposta (altura × comprimento), a altura máxima e a média.

A planta desenha a face externa de cada muro com pequenos traços transversais e sua altura nas duas extremidades e no ponto mais alto (na camada de muros de arrimo, que também vai para DXF e DWG). A vista 3D mostra os muros como sólidos (Mostrar › Muros de arrimo), e as exportações GLB, OBJ e USD os incluem. Seções atravessando a borda mostram o degrau.

**Avisos** (nas Propriedades e no painel Problemas): um muro mais alto que **Avisar acima de uma altura de muro de** (1.0 m ou 3.3 ft como ponto de partida) "pode precisar de muro projetado por engenheiro ou de licença; verifique as regras locais", e, quando você digita a **Inclinação máxima que o solo sustenta**, qualquer lado cujo talude de corte ou aterro seja mais íngreme que isso. São avisos: a terraplenagem continua sendo construída. Cada alteração conta como uma etapa para {{key:Mod+Z}}.

## Camalhões

{{ui:Terraplenagem}} › {{ui:Camalhão}}: um monte cujo topo fica a sua **Altura** acima do terreno médio sob ele, com seus lados terraplenados.

## Valas de drenagem

{{ui:Terraplenagem}} › {{ui:Vala de drenagem}}, depois clique ao longo da vala **no sentido em que a água corre** e pressione {{key:Enter}}. Defina sua **Profundidade**, a **Largura do fundo** (0 para uma vala em V) e o **Talude lateral**. Sem uma **Queda**, o fundo segue o terreno, a sua profundidade abaixo dele, e nunca sobe morro acima; digite uma queda para dar a ela uma queda constante a partir do início.

## Cotas de nível e curvas de nível

1. {{ui:Terraplenagem}} › {{ui:Área de terraplenagem}}: clique no contorno da área que você quer moldar.
2. {{ui:Terraplenagem}} › {{ui:Cota de nível}}: clique dentro da área. Digite a elevação nas Propriedades, ou use os botões ▲ ▼.
3. {{ui:Terraplenagem}} › {{ui:Editar uma curva de nível}}: clique em uma curva de nível dentro da área para tomá-la como uma linha que você pode remodelar.

Selecione uma cota ou uma curva de nível e **arraste** (ou seus pontos) na planta: a superfície acompanha quando você solta, em uma etapa de desfazer. Dentro da área, o terreno é reconstruído a partir da sua borda (onde ela encontra o terreno existente), das cotas de nível e das curvas de nível editadas.

## Corte e aterro, ao vivo

As Propriedades de cada objeto de terraplenagem mostram seu **Corte** e **Aterro**, e os do local inteiro, pelo método de grade que o Movimento de terra usa, à medida que você os altera. Problemas (fora da superfície, um contorno que se cruza) aparecem ali.

## Verificações de terraplenagem

Na seção **Verificações de terraplenagem** à esquerda:

- **Análise de declividade** colore a superfície pela inclinação: até o limite suave, entre os dois, e mais íngreme que o limite íngreme (5 % e 33.3 % como ponto de partida: o usual 1:20 para rotas acessíveis e 1:3 para corte de grama). A legenda informa quanto da área cai em cada faixa. As áreas íngremes também são impressas nas folhas.
- **Setas de fluxo e empoçamento** desenham para onde a água escorre e marcam em círculo cada lugar onde ela empoçaria, com sua profundidade; a seção informa quantos lugares são, o mais fundo e quanta água eles retêm.

As verificações leem a superfície projetada quando algo é terraplenado; caso contrário, leem o terreno existente.
