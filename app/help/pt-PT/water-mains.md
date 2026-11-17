---
title: Condutas de água: pressões, caudais e caudal de incêndio
summary: Desenhe na planta uma rede de pressão com nós de consumo, reservatórios, depósitos, coletores, bombas e válvulas redutoras de pressão; o CivilCraft calcula as cargas, pressões e caudais (Hazen–Williams, redes em malha), o caudal disponível para um incêndio e um dia de consumo. Uma funcionalidade em laboratório; todos os resultados precisam da verificação de um engenheiro.
keywords: água, conduta de água, rede de distribuição, rede de pressão, coletor de pressão, rede em malha, hazen-williams, fator C, perda de carga, pressão residual, caudal de incêndio, hidrante, consumo, nó de consumo, reservatório, depósito, bomba, curva da bomba, válvula redutora de pressão, prv, válvula de retenção, período estendido, epanet, inp, velocidade
from: df46bf6d
---

As condutas de água são o lado de pressão de um local: tubos sempre cheios, com a água empurrada por um reservatório, um depósito ou uma bomba. O CivilCraft calcula a carga e a pressão em cada nó e o caudal em cada coletor, incluindo redes em malha em que a água tem mais do que um caminho. Está em laboratório enquanto é verificado.

**Apenas uma ferramenta de cálculo.** Todos os números precisam da verificação de um engenheiro qualificado: a resposta só é tão boa como os consumos, as cotas, as dimensões dos coletores e os valores de rugosidade que indicou, e um modelo em regime permanente não conhece o golpe de aríete, a qualidade da água nem o comportamento real de uma bomba de incêndio.

## Desenhar a rede

1. Em **Superfície** › {{ui:Mais}}, escolha {{ui:Condutas de água…}}. A janela mantém-se aberta enquanto trabalha na planta.
2. Escolha {{ui:Reservatório}} e clique na planta onde está a alimentação. A carga começa 100 ft (30 m) acima do terreno; altere-a nas Propriedades.
3. Escolha {{ui:Nó de consumo}} e clique em cada sítio onde se retira água ou onde os coletores se encontram. Um nó de consumo toma a cota do terreno; escreva outra nas Propriedades para a substituir.
4. Escolha {{ui:Coletor}}, clique num nó e depois no nó que ele liga. A ferramenta mantém-se ativa para o coletor seguinte. Uma {{ui:Bomba}} e uma {{ui:Válvula redutora de pressão}} desenham-se da mesma forma, do nó de aspiração (ou de montante) para o nó de descarga (ou de jusante). Um {{ui:Depósito}} coloca-se como um nó de consumo.
5. Selecione um nó de consumo e escreva o seu {{ui:Consumo}} (gpm, ou L/s num projeto em metros). Selecione um coletor e defina o seu {{ui:Diâmetro}} (in, ou mm) e, se o souber, o seu fator C de Hazen–Williams.

Cada alteração é um passo de anulação. Delete remove o nó e os coletores que nele terminam.

## O que significa cada elemento

- **Coletor.** O comprimento é medido ao longo da planta, a menos que o escreva. C é a rugosidade de Hazen–Williams (130 para começar; altere o valor por defeito na janela). Um coeficiente de perda singular K soma as perdas de curvas e acessórios. Assinale **Válvula de retenção** num coletor que não pode transportar água para trás; um coletor **Fechado** não transporta nada.
- **Reservatório.** Uma fonte com carga fixa, o nível de água que mantém acima do datum. Fornece ou retira o que a rede precisar.
- **Depósito.** Um nível que muda ao longo do dia. Nos resultados em regime permanente é uma fonte ao seu nível atual.
- **Bomba.** Um ponto de projeto (caudal e carga) dá a curva habitual que passa por ele: a carga com caudal zero é 133 % da carga de projeto, e a carga é zero com o dobro do caudal de projeto. Uma bomba nunca empurra água para trás.
- **Válvula redutora de pressão.** Mantém a pressão que definiu a jusante enquanto a alimentação é mais alta. Quando a alimentação é mais baixa, está aberta e não mantém nada; se a água fosse correr para trás, fecha-se.

## Ler os resultados

A janela mostra a carga e a pressão de cada nó, e o caudal, a velocidade e a perda de carga por 1,000 ft (ou por km) de cada ligação, com os nós de consumo coloridos na planta: verde entre a pressão mínima e a máxima que definiu, vermelho abaixo, âmbar acima. As setas de caudal mostram o sentido. Selecione um nó ou coletor para ler os seus números nas Propriedades.

Por baixo das tabelas há uma lista do que observar: pressão baixa ou alta, um coletor mais rápido do que o seu limite, um nó de consumo isolado de todas as fontes, ou um solucionador que não convergiu. As mesmas conclusões estão no painel de Problemas. Defina os limites na janela (20 psi, 100 psi e 10 ft/s para começar; 140 kPa, 700 kPa e 3 m/s num projeto em metros).

## Caudal de incêndio

{{ui:Caudal de incêndio…}} simula um caudal num nó de consumo e mostra a pressão aí e a pressão mais baixa em qualquer ponto da rede. Calcula também o caudal disponível nesse nó enquanto o nó mais fraco da rede mantém a pressão residual que indicar. Os restantes consumos mantêm-se como estão.

## Um dia de consumo

{{ui:Um dia de consumo…}} corre a rede hora a hora. Indique o padrão de consumo nas definições do ficheiro (uma lista de multiplicadores que se repete); os depósitos enchem e esvaziam com o caudal que entra e sai, e uma bomba pode seguir um padrão de ligar/desligar. Um depósito que atinge o seu nível mais alto ou mais baixo é indicado na lista: o CivilCraft não fecha a entrada nem a saída por si, por isso leia isso como "este depósito é pequeno de mais ou a bomba é grande de mais".

## EPANET em texto

{{ui:Guardar como texto EPANET (.inp)}} escreve a rede no formato de texto simples que muitos programas de água leem, e {{ui:Abrir texto EPANET (.inp)…}} lê um. Só passa o que o CivilCraft modela: nós de consumo, reservatórios, depósitos, coletores, bombas com curva de carga, válvulas redutoras de pressão, padrões de consumo e os tempos. Outros tipos de válvula, bombas definidas por potência e outras fórmulas de perda de carga são indicados e deixados de fora. O ficheiro tem de usar as mesmas unidades do projeto.

## Hidrantes, válvulas e acessórios

Selecione um nó de consumo e assinale **Hidrante** para lhe colocar um; selecione uma conduta principal e prima **Adicionar no meio** para lhe pôr uma válvula, uma ventosa, uma descarga de fundo ou um contador. São objetos da rede: movem-se com ela, e um passo de anulação remove-os.

O traçado também implica acessórios, e o CivilCraft lista-os sem ser pedido: um **tê** onde se encontram três condutas, uma **cruzeta** onde se encontram quatro, uma **curva** (com o seu ângulo) onde duas condutas mudam de direção 5° ou mais, uma **redução** onde se encontram duas dimensões, e um **tampão** numa extremidade cega. {{ui:Mapa de acessórios (CSV)}} conta-os e conta as condutas por dimensão. Isto é o que o traçado implica, uma medição a confrontar com os seus próprios detalhes, não uma lista para encomendar.

As condutas são assentes à cota do terreno menos uma cobertura (4 ft ou 1.2 m), para poderem ser desenhadas e modeladas em 3D; as pressões acima nunca dependem dela.

## Na planta e nos ficheiros

A planta, o PDF e o DWG ou DXF levam as condutas em **C-WATR-MAIN**, com as respetivas dimensões em **C-WATR-TEXT**, os hidrantes em **C-WATR-HYDR**, as válvulas em **C-WATR-VALV** e os acessórios em **C-WATR-FITT**. O LandXML de saída escreve uma rede de condutas de água (uma estrutura por nó, um coletor por conduta, hidrantes com nome); o LandXML de entrada lê-a de volta como condutas de água, sem consumos, bombas nem válvulas, que o LandXML não transporta. A exportação IFC escreve as condutas como segmentos de tubo, hidrantes, válvulas e acessórios num só sistema de água. Estes ficheiros foram verificados com os nossos próprios leitores e escritores; experimente-os nos seus outros programas e diga-nos o que mostram.

## O que ainda não existe

Qualidade e idade da água, controlos e regras além do padrão de ligar/desligar de uma bomba, outros tipos de válvula, consumo por pressão, coletores com diâmetro variável, e caudais de esgoto ao longo do tempo. Veja [Ainda não implementado](topic:not-built-yet). Os caudais de projeto de saneamento, que são um cálculo diferente, estão em [Caudais de projeto de saneamento](topic:sanitary-design).
