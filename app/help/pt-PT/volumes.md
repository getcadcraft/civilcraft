---
title: Volumes de terraplenagem
summary: Ler os volumes de escavação, de aterro e líquidos entre o terreno natural e a superfície proposta, por plataforma e corredor e no total, e compreender o método da grelha por trás deles.
keywords: volumes, terraplenagem, escavação, aterro, líquido, escavação e aterro, quantidades, método da grelha, comparação de superfícies, superfície de volume, jardas cúbicas, metros cúbicos
from: 299d7bc7
---

Assim que uma plataforma ou um corredor é modelado sem problemas, o CivilCraft compara a superfície proposta com o terreno natural e indica a escavação e o aterro. Os números atualizam-se a cada alteração.

## Onde os ler

- **Terraplenagem** no painel direito sem nada selecionado (a vista **Projeto**), quando há pelo menos uma plataforma ou um corredor.
- **Terraplenagem** no painel direito quando uma plataforma está selecionada (os mesmos totais para o projeto inteiro).
- A linha sob as definições de um corredor, com a escavação e o aterro desse corredor.

O bloco **Terraplenagem** mostra:

- **Escavação**, **Aterro** e **Líquido** (com "aterro" ou "escavação" a seguir, conforme o que for maior)
- uma linha por item quando há mais de um, por exemplo "Plataforma 1: escavação 120.4 yd³, aterro 310.2 yd³"
- a linha do método: "Método da grelha: terreno natural e superfície modelada amostrados a cada 0.5 ft dentro das linhas de intersecção do talude (92,891 células). Sem fator de empolamento nem de contração aplicado."

Os volumes são em yd³ num projeto em pés e em m³ num projeto em metros.

## Enviar para o TakeoffCraft

Para orçamentar a terraplenagem, escolha {{ui:Enviar para o TakeoffCraft}} no fundo do bloco **Terraplenagem**. O CivilCraft guarda um ficheiro de quantidades (`<site>.quantities.json`) com duas quantidades: escavação e aterro, em yd³ (projeto em pés) ou m³ (projeto em metros), com os mesmos números do bloco, arredondados à centésima. Abra-o no TakeoffCraft com **Abrir medição**, ou largue-o lá: tornam-se dois itens que pode orçamentar ([Escavação e aterro a partir do CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Envie de novo depois de uma alteração e abra o novo ficheiro: os mesmos itens recebem os novos números.

Só os totais são enviados, para que nada seja contado duas vezes; a nota do ficheiro indica a escavação e o aterro próprios de cada plataforma e de cada corredor.

## Como são calculados

O CivilCraft usa o **método da grelha**:

1. Sobrepõe-se uma grelha de células quadradas à área dentro de cada linha de intersecção do talude.
2. No centro de cada célula, amostram-se as duas superfícies.
3. Cada célula conta como um prisma: a diferença de cota vezes a área da célula. Onde a superfície proposta está mais baixa, há escavação; mais alta, há aterro.
4. As células são somadas.

O tamanho da célula é escolhido para si de modo que o retângulo à volta das áreas modeladas tenha cerca de 250,000 células, arredondado a um valor redondo (1, 2 ou 5 vezes uma potência de dez). Ainda não pode defini-lo. A linha do método indica o tamanho e o número de células. Células mais pequenas são mais exatas ao longo das arestas; em células inteiras entre planos, o resultado é exato.

## Aspetos a saber

- Só é contabilizada a área dentro das linhas de intersecção do talude. O terreno fora delas fica igual.
- Uma plataforma ou um corredor com um problema não é modelado e não acrescenta nada. Se o bloco disser "Ainda não há volumes: uma plataforma precisa de modelar sem problemas.", procure uma caixa vermelha acima dele.
- Onde os itens se sobrepõem, o último substituiu o anterior dentro da sua linha de intersecção, e a sobreposição é contada uma vez.
- Não é aplicado nenhum fator de empolamento ou de contração. Se precisar de volumes em banco, soltos ou compactados, multiplique os resultados pelos respetivos fatores.
- A decapagem de terra vegetal, as espessuras de pavimento e de subleito, e os volumes de prismas TIN a TIN ainda não estão disponíveis.

## Verificar um resultado

- Ligue {{ui:Proposta (modelada)}} em **Visualização** e veja as curvas de nível dentro das linhas de intersecção do talude.
- Mova o ponteiro sobre a área modelada: a barra de estado mostra **Terreno** e **Modelado**. A diferença é a profundidade de escavação ou de aterro nesse ponto.
- Para um corredor, a leitura da vista de perfil mostra a escavação ou o aterro no eixo, em cada PK.
