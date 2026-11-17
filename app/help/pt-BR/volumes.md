---
title: Volumes de terraplenagem
summary: Leia os volumes de corte, aterro e líquido entre o terreno existente e a superfície projetada, por plataforma e corredor e no total, e entenda o método de malha por trás deles.
keywords: volumes, terraplenagem, corte, aterro, líquido, corte e aterro, quantitativos, método de malha, comparação de superfícies, superfície de volume, jardas cúbicas, metros cúbicos
from: 299d7bc7
---

Assim que uma plataforma ou um corredor terraplena sem problemas, o CivilCraft compara a superfície projetada com o terreno existente e informa corte e aterro. Os números são atualizados a cada alteração.

## Onde lê-los

- **Terraplenagem** no painel direito sem nada selecionado (a vista **Projeto**), quando há pelo menos uma plataforma ou um corredor.
- **Terraplenagem** no painel direito quando uma plataforma está selecionada (os mesmos totais do projeto inteiro).
- A linha abaixo das configurações de um corredor, com o corte e o aterro próprios desse corredor.

O bloco **Terraplenagem** mostra:

- **Corte**, **Aterro** e **Líquido** (com "aterro" ou "corte" depois, o que for maior)
- uma linha por item quando há mais de um, por exemplo "Plataforma 1: corte 120.4 yd³, aterro 310.2 yd³"
- a linha do método: "Método de malha: terreno existente e a superfície terraplenada amostrados a cada 0.5 ft dentro das linhas de pé de talude (92,891 células). Nenhum fator de empolamento ou contração aplicado."

Os volumes são em jardas cúbicas (yd³) em projeto em pés, e em metros cúbicos (m³) em projeto em metros.

## Envie-os para o TakeoffCraft

Para orçar a terraplenagem, escolha {{ui:Enviar para o TakeoffCraft}} na parte inferior do bloco **Terraplenagem**. O CivilCraft salva um arquivo de quantitativos (`<site>.quantities.json`) com duas quantidades: corte e aterro, em jardas cúbicas (projeto em pés) ou metros cúbicos (projeto em metros), os mesmos números do bloco, com duas casas decimais. Abra-o no TakeoffCraft com **Abrir levantamento de quantitativos**, ou solte-o lá: eles viram dois itens que você pode orçar ([Corte e aterro do CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Envie de novo após uma alteração e abra o novo arquivo: os mesmos itens recebem os novos números.

Só os totais são enviados, então nada é contado duas vezes; a nota do arquivo lista o corte e o aterro de cada plataforma e de cada corredor.

## Como são calculados

O CivilCraft usa o **método de malha**:

1. Uma malha de células quadradas é sobreposta à área dentro de cada linha de pé de talude.
2. No centro de cada célula, as duas superfícies são amostradas.
3. Cada célula conta como um prisma: a diferença de cota vezes a área da célula. Onde a superfície projetada está mais baixa, há corte; onde está mais alta, há aterro.
4. As células são somadas.

O tamanho da célula é escolhido para você, de modo que o retângulo em volta das áreas terraplenadas tenha cerca de 250,000 células, arredondado para um valor limpo (1, 2 ou 5 vezes uma potência de dez). Você ainda não pode defini-lo. A linha do método informa o tamanho e o número de células. Células menores são mais precisas nas bordas; em células inteiras entre planos lisos, o resultado é exato.

## Coisas a saber

- Só a área dentro das linhas de pé de talude é contada. O terreno fora delas não muda.
- Uma plataforma ou um corredor com problema não é terraplenado e não soma nada. Se o bloco disser "Ainda não há volumes: uma plataforma precisa ser terraplenada sem problemas.", procure uma caixa vermelha acima dele.
- Onde os itens se sobrepõem, o posterior substituiu o anterior dentro da linha de pé de talude dele, e a sobreposição é contada uma vez.
- Nenhum fator de empolamento ou de contração é aplicado. Multiplique os resultados você mesmo se precisar de volumes in situ, soltos ou compactados.
- Decapagem de solo vegetal, espessuras de pavimento e de subleito, e volumes de prisma TIN para TIN ainda não estão disponíveis.

## Conferindo um resultado

- Ative {{ui:Projetado (terraplenado)}} em **Exibição** e olhe as curvas de nível dentro das linhas de pé de talude.
- Passe o ponteiro sobre a área terraplenada: a barra de status mostra **Terreno** e **Terraplenado**. A diferença é a profundidade de corte ou aterro naquele ponto.
- Em um corredor, a leitura da vista de perfil mostra corte ou aterro no eixo em cada estaca.
