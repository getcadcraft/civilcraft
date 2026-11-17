---
title: Selecionar, copiar e colar pontos topográficos
summary: Selecione pontos topográficos por clique, com Shift e uma caixa, ou todos de uma vez; copie, corte, cole, cole no mesmo sítio, duplique e elimine-os com novos números de ponto que nunca colidem; cole linhas de pontos para e de uma folha de cálculo.
keywords: copiar, colar, cortar, duplicar, eliminar pontos, selecionar pontos, selecionar tudo, seleção por caixa, janela, área de transferência, folha de cálculo, csv, renumerar, números de ponto, colar no mesmo sítio, clonar, implantação
from: 78a6aea7
---

Os pontos topográficos podem ser copiados e colados dentro de um projeto, entre projetos em dois separadores do navegador, e para e de uma folha de cálculo. Cada alteração é um único passo de anulação, e a superfície reconstrói-se logo a partir dos novos pontos.

## Selecionar pontos

Com {{ui:Selecionar}} ({{key:V}}):

- **Clique** num ponto para o selecionar (e só ele). Os seus números aparecem em **Propriedades**.
- {{key:Shift}} e **clique** acrescenta um ponto à seleção, ou retira-o.
- {{key:Shift}} e **arraste** desenha uma caixa: os pontos dentro dela são acrescentados à seleção. Se arrastar à volta dos pontos em vez disso, passa a ser um laço; veja [Seleção por laço de pontos topográficos](topic:lasso-selection). Arrastar sem {{key:Shift}} desloca a vista, como sempre.
- {{key:Mod+A}} (ou {{ui:Mais}} › {{ui:Selecionar todos os pontos}}) seleciona todos os pontos.
- {{key:Esc}} (ou {{ui:Mais}} › {{ui:Limpar seleção}}) limpa a seleção.

Os pontos selecionados têm um anel. Com mais de um selecionado, **Propriedades** mostra quantos são, os seus números, a amplitude de cotas e os seus grupos.

## Copiar, cortar e eliminar

- {{ui:Copiar}} ou {{key:Mod+C}} copia os pontos selecionados. O CivilCraft guarda a cópia e também a coloca na área de transferência do sistema como linhas de pontos, para a colar diretamente numa folha de cálculo ou num ficheiro de texto.
- {{ui:Mais}} › {{ui:Cortar}} ou {{key:Mod+X}} copia-os e elimina-os, num só passo.
- {{ui:Mais}} › {{ui:Eliminar}} ou {{key:Delete}} elimina-os. {{key:Mod+Z}} traz-los de volta.

As linhas são: ponto, norte, este, cota, descrição (P,N,E,Z,D), separadas por vírgulas, com três casas decimais. Para ter o este antes do norte, defina **Linhas de pontos** em [Definições do CivilCraft](topic:settings). Uma descrição que uma folha de cálculo trataria como fórmula (a começar por =, +, - ou @) recebe um apóstrofo à frente, para continuar a ser texto.

## Colar

1. Prima {{key:Mod+V}} ou clique em {{ui:Colar}}. Os pontos seguem o cursor como pequenas cruzes, com uma linha pontilhada até ao sítio de origem.
2. Clique onde devem ir. O centro dos pontos copiados cai no clique.
3. Ou prima {{key:Enter}} para os colocar nas suas próprias coordenadas, ou {{key:Esc}} para cancelar.

{{ui:Mais}} › {{ui:Colar no mesmo sítio}} ou {{key:Mod+Shift+V}} cola nas coordenadas próprias dos pontos de imediato. Os pontos colados ficam selecionados depois, para os poder copiar, mover ou eliminar de novo.

:::note
Clicar em {{ui:Colar}} na barra de ferramentas lê a área de transferência do sistema. Na primeira vez, o navegador pode perguntar se o CivilCraft pode ver a área de transferência. Se recusar, o botão da barra de ferramentas cola apenas a cópia do próprio CivilCraft; {{key:Mod+V}} continua a colar linhas de uma folha de cálculo sem perguntar.
:::

## Os números de ponto nunca colidem

Dois pontos nunca partilham um número. Ao colar:

- Um ponto colado mantém o seu número quando nenhum ponto do projeto o tem. Assim, depois de **Cortar**, os pontos voltam a colar com os seus próprios números, e os pontos copiados de outro projeto mantêm os seus onde estão livres.
- Um ponto colado cujo número esteja ocupado recebe um novo número inteiro: mais um do que o maior número em uso, a contar a partir daí.
- A barra de estado diz o que aconteceu, por exemplo "1 manteve o número; 9 receberam números novos: 10–18 passaram a 277–285".

Em [Definições do CivilCraft](topic:settings) pode escolher **Sempre números novos**, e um número a partir do qual os números novos começam, por exemplo 5000 para pontos de projeto.

:::warning
Os grupos de pontos que constroem a superfície como **Linha de quebra** unem os seus pontos pela ordem dos números. As cópias coladas de pontos de linha de quebra (por exemplo, leituras FL) recebem números novos e maiores e juntam-se ao fim dessa linha de quebra, possivelmente com um salto longo. Verifique a planta depois de colar esses pontos, ou defina o seu grupo como {{ui:Pontos}}.
:::

## Duplicar

{{ui:Mais}} › {{ui:Duplicar}} ou {{key:Mod+D}} faz uma cópia dos pontos selecionados que segue o cursor: clique onde deve ir. As cópias recebem sempre números novos, e a área de transferência do CivilCraft fica como estava.

## A partir de uma folha de cálculo ou de um ficheiro de texto

Selecione linhas de pontos numa folha de cálculo (ponto, norte, este, cota, descrição) e copie-as. No CivilCraft prima {{key:Mod+V}} e clique onde devem ir, ou prima {{key:Mod+Shift+V}} para as colocar nas suas próprias coordenadas, que é normalmente o que se quer para dados topográficos reais.

As linhas são lidas exatamente como um [ficheiro de pontos](topic:point-file-formats): vírgulas, tabulações ou espaços, com uma linha de cabeçalho se houver. Sem cabeçalho, a ordem das colunas vem de **Linhas de pontos** em [Definições do CivilCraft](topic:settings).

Quando há as duas, o CivilCraft decide pelo que é mais recente: as linhas da área de transferência do sistema que diferem da última cópia do CivilCraft foram copiadas depois, por isso são coladas. O texto que não contém pontos é ignorado, e é colada a cópia do próprio CivilCraft.

## Entre projetos e separadores

A cópia fica guardada neste navegador, por isso um segundo separador do CivilCraft pode colá-la, mesmo depois de o primeiro separador fechar. Pontos copiados num projeto em metros e colados num projeto em pés mantêm os seus números tal como estão: nada é convertido, e a barra de estado indica-o.

## O que não é copiado

Só os pontos topográficos são copiados, por enquanto. Diretrizes, plataformas, redes de tubagens, linhas de quebra e limites não podem ser copiados nem colados ainda. Colar não pode mover pontos existentes: use {{ui:Cortar}} e colar, ou mova um ponto de cada vez ([Editar um ponto topográfico](topic:edit-points)).
