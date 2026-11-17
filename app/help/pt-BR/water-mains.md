---
title: Redes de água: pressões, vazões e vazão de incêndio
summary: Desenhe na planta uma rede de pressão com nós, reservatórios, tanques, tubos, bombas e válvulas redutoras de pressão; o CivilCraft calcula as cargas, pressões e vazões (Hazen–Williams, redes em malha), a vazão disponível para um incêndio e um dia de demanda. Recurso de laboratório; todo resultado precisa da verificação de um engenheiro.
keywords: água, rede de água, distribuição de água, rede de pressão, tubulação de pressão, rede em malha, hazen-williams, fator C, perda de carga, pressão residual, vazão de incêndio, hidrante, demanda, nó, reservatório, tanque, bomba, curva da bomba, válvula redutora de pressão, prv, vrp, válvula de retenção, período estendido, epanet, inp, velocidade
from: df46bf6d
---

Redes de água são o lado de pressão de um terreno: tubos sempre cheios, com a água empurrada por um reservatório, um tanque ou uma bomba. O CivilCraft calcula a carga e a pressão em cada nó e a vazão em cada tubo, inclusive em redes em malha, onde a água tem mais de um caminho. Está em laboratório enquanto é verificado.

**Apenas uma ferramenta de cálculo.** Todo número precisa da verificação de um engenheiro habilitado: a resposta é tão boa quanto as demandas, as cotas, os diâmetros de tubo e os valores de rugosidade que você informou, e um modelo em regime permanente não conhece golpe de aríete, qualidade da água ou o comportamento real de uma bomba de incêndio.

## Desenhe a rede

1. Em **Superfície** › {{ui:Mais}}, escolha {{ui:Redes de água…}}. A janela fica aberta enquanto você trabalha na planta.
2. Escolha {{ui:Reservatório}} e clique na planta onde está a fonte. A carga dele começa 100 ft (30 m) acima do terreno; altere-a em Propriedades.
3. Escolha {{ui:Nó}} e clique em cada lugar onde a água é retirada ou onde os tubos se encontram. Um nó recebe sua cota do terreno; digite outra em Propriedades para substituí-la.
4. Escolha {{ui:Tubo}}, clique em um nó e depois no nó que ele une. A ferramenta continua ativa para o próximo tubo. Uma {{ui:Bomba}} e uma {{ui:Válvula redutora de pressão}} são desenhadas do mesmo modo, do nó de sucção (ou de montante) ao nó de recalque (ou de jusante). Um {{ui:Tanque}} é posicionado como um nó.
5. Selecione um nó e digite a {{ui:Demanda}} dele (gpm, ou L/s em projeto em metros). Selecione um tubo e defina o {{ui:Diâmetro}} dele (in, ou mm) e, se você souber, o C de Hazen–Williams.

Cada alteração é um passo de desfazer. Delete remove o nó e os tubos que terminam nele.

## O que cada parte significa

- **Tubo.** O comprimento é medido ao longo da planta, a menos que você digite um. C é a rugosidade de Hazen–Williams (130 para começar; altere o padrão na janela). Um coeficiente de perda singular K soma as perdas de curvas e conexões. Marque **Válvula de retenção** para um tubo que não pode levar água para trás; um tubo **Fechado** não transporta nada.
- **Reservatório.** Uma fonte com carga fixa, o nível de água que ele mantém acima do datum. Ele fornece ou recebe o que a rede precisar.
- **Tanque.** Um nível que muda ao longo do dia. Nos resultados em regime permanente, é uma fonte no nível atual.
- **Bomba.** Um ponto de projeto (vazão e carga) define a curva usual que passa por ele: a carga com vazão zero é 133 % da carga de projeto, e a carga é zero com o dobro da vazão de projeto. Uma bomba nunca empurra água para trás.
- **Válvula redutora de pressão.** Mantém a pressão que você define a jusante enquanto a alimentação é maior. Quando a alimentação é menor, ela fica aberta e não mantém nada; se a água fosse correr para trás, ela fecha.

## Leia os resultados

A janela mostra a carga e a pressão de cada nó e a vazão, a velocidade e a perda de carga de cada trecho por 1,000 ft (ou por km), com os nós coloridos na planta: verde entre a menor e a maior pressão que você definiu, vermelho abaixo, âmbar acima. Setas de fluxo mostram a direção. Selecione um nó ou tubo para ler os números em Propriedades.

Abaixo das tabelas há uma lista do que observar: pressão baixa ou alta, um tubo mais rápido que seu limite, um nó isolado de todas as fontes, ou um solucionador que não convergiu. Os mesmos achados estão no painel Problemas. Defina os limites na janela (20 psi, 100 psi e 10 ft/s para começar; 140 kPa, 700 kPa e 3 m/s em projeto em metros).

## Vazão de incêndio

{{ui:Vazão de incêndio…}} desenha uma vazão em um nó e mostra a pressão ali e a menor pressão em qualquer ponto da rede. Ele também encontra a vazão disponível nesse nó enquanto o nó mais fraco da rede mantém a pressão residual que você informar. As outras demandas permanecem como estão.

## Um dia de demanda

{{ui:Um dia de demanda…}} roda a rede hora a hora. Informe o padrão de demanda nas configurações do arquivo (uma lista de multiplicadores que se repete); os tanques enchem e esvaziam conforme a vazão de entrada e saída, e uma bomba pode seguir um padrão liga/desliga. Um tanque que atinge seu nível mais alto ou mais baixo é citado na lista: o CivilCraft não fecha a entrada ou a saída por você, então leia isso como "este tanque é pequeno demais ou a bomba é grande demais".

## Texto EPANET

{{ui:Salvar como texto EPANET (.inp)}} grava a rede no formato de texto simples que muitos programas de água leem, e {{ui:Abrir texto EPANET (.inp)…}} lê um. Só o que o CivilCraft modela é transferido: nós, reservatórios, tanques, tubos, bombas com curva de carga, válvulas redutoras de pressão, padrões de demanda e os horários. Outros tipos de válvula, bombas informadas por potência e outras fórmulas de perda de carga são citados e deixados de fora. O arquivo deve usar as mesmas unidades do projeto.

## Hidrantes, válvulas e conexões

Selecione um nó e marque **Hidrante** para colocar um ali; selecione uma tubulação principal e pressione **Adicionar no meio** para colocar nela uma válvula, uma ventosa, uma descarga de fundo ou um medidor. Eles são objetos da rede: movem-se com ela, e um passo de desfazer os remove.

O traçado também implica conexões, e o CivilCraft as lista sem ser pedido: um **tê** onde três tubulações se encontram, uma **cruzeta** onde quatro se encontram, uma **curva** (com seu ângulo) onde duas tubulações mudam de direção em 5° ou mais, um **redutor** onde dois diâmetros se encontram, e um **tampão** em uma extremidade cega. {{ui:Tabela de conexões (CSV)}} conta-as e conta as tubulações por diâmetro. Isso é o que o traçado implica: um levantamento de quantitativos para conferir com seus próprios detalhes, não uma lista para pedir compra.

As tubulações são assentadas na cota do terreno menos um recobrimento (4 ft ou 1.2 m), para que possam ser desenhadas e modeladas em 3D; as pressões acima nunca dependem disso.

## Na planta e em arquivos

A planta, o PDF e o DWG ou DXF levam as tubulações na camada **C-WATR-MAIN**, com seus diâmetros na **C-WATR-TEXT**, os hidrantes na **C-WATR-HYDR**, as válvulas na **C-WATR-VALV** e as conexões na **C-WATR-FITT**. O LandXML de saída grava uma rede de tubulação de água (uma estrutura para cada nó, um tubo para cada tubulação, hidrantes nomeados); o LandXML de entrada lê de volta como tubulações de água, sem demandas, bombas ou válvulas, que o LandXML não transporta. A exportação IFC grava as tubulações como segmentos de tubo, hidrantes, válvulas e conexões em um único sistema de água. Esses arquivos foram verificados com nossos próprios leitores e gravadores; teste-os em seus outros programas e diga-nos o que eles mostram.

## O que ainda não está aqui

Qualidade e idade da água, controles e regras além do padrão liga/desliga de uma bomba, outros tipos de válvula, demanda por pressão, tubos com diâmetro variável e vazões de esgoto ao longo do tempo. Veja [Ainda não implementado](topic:not-built-yet). As vazões de projeto de esgoto sanitário, que são outro cálculo, estão em [Vazões de projeto de esgoto sanitário](topic:sanitary-design).
