---
title: Selecionar, copiar e colar pontos de levantamento
summary: Selecione pontos de levantamento por clique, Shift e uma caixa, ou todos de uma vez; copie, recorte, cole, cole no mesmo local, duplique e exclua-os com novos números de ponto que nunca se repetem; cole linhas de pontos de e para uma planilha.
keywords: copiar, colar, recortar, duplicar, excluir pontos, selecionar pontos, selecionar tudo, seleção por caixa, janela, área de transferência, planilha, csv, renumerar, números de ponto, colar no mesmo local, clonar, locação
from: 78a6aea7
---

Pontos de levantamento podem ser copiados e colados dentro de um projeto, entre projetos em duas abas do navegador e de e para uma planilha. Cada alteração é uma etapa de desfazer, e a superfície é refeita a partir dos novos pontos imediatamente.

## Selecionar pontos

Com {{ui:Selecionar}} ({{key:V}}):

- **Clique** em um ponto para selecioná-lo (e somente ele). Os números dele aparecem em **Propriedades**.
- {{key:Shift}} e **clique** adicionam um ponto à seleção ou o tiram dela.
- {{key:Shift}} e **arraste** desenham uma caixa: os pontos dentro dela são adicionados à seleção. Arraste ao redor dos pontos e ela vira um laço; veja [Seleção de pontos de levantamento por laço](topic:lasso-selection). Arrastar sem {{key:Shift}} faz pan, como sempre.
- {{key:Mod+A}} (ou {{ui:Mais}} › {{ui:Selecionar todos os pontos}}) seleciona todos os pontos.
- {{key:Esc}} (ou {{ui:Mais}} › {{ui:Limpar seleção}}) limpa a seleção.

Os pontos selecionados têm um anel. Com mais de um selecionado, **Propriedades** mostra quantos são, os números deles, a amplitude de cotas e os grupos.

## Copiar, recortar e excluir

- {{ui:Copiar}} ou {{key:Mod+C}} copia os pontos selecionados. O CivilCraft guarda a cópia e também a coloca na área de transferência do sistema como linhas de pontos, para que você possa colá-la diretamente em uma planilha ou em um arquivo de texto.
- {{ui:Mais}} › {{ui:Recortar}} ou {{key:Mod+X}} copia os pontos e os exclui, em uma única etapa.
- {{ui:Mais}} › {{ui:Excluir}} ou {{key:Delete}} exclui os pontos. {{key:Mod+Z}} os traz de volta.

As linhas são: ponto, norte, leste, cota, descrição (P,N,E,Z,D), separadas por vírgulas, com três casas decimais. Para obter o leste antes do norte, defina **Linhas de pontos** em [Configurações do CivilCraft](topic:settings). Uma descrição que uma planilha trataria como fórmula (começando com =, +, - ou @) recebe um apóstrofo na frente, para continuar sendo texto.

## Colar

1. Pressione {{key:Mod+V}} ou clique em {{ui:Colar}}. Os pontos seguem o ponteiro como pequenas cruzes, com uma linha pontilhada de volta ao lugar de onde vieram.
2. Clique onde eles devem ir. O centro dos pontos copiados cai no ponto clicado.
3. Ou pressione {{key:Enter}} para colocá-los nas próprias coordenadas, ou {{key:Esc}} para cancelar.

{{ui:Mais}} › {{ui:Colar no mesmo local}} ou {{key:Mod+Shift+V}} cola nas próprias coordenadas dos pontos imediatamente. Os pontos colados ficam selecionados depois, para que você possa copiá-los, movê-los ou excluí-los de novo.

:::note
Clicar em {{ui:Colar}} na barra de ferramentas lê a área de transferência do sistema. Na primeira vez, o navegador pode perguntar se o CivilCraft pode acessar a área de transferência. Se você recusar, o botão da barra cola apenas a cópia do próprio CivilCraft; {{key:Mod+V}} ainda cola linhas de uma planilha sem perguntar.
:::

## Números de ponto nunca se repetem

Dois pontos nunca compartilham um número. Ao colar:

- Um ponto colado mantém seu número quando nenhum ponto do projeto o tem. Assim, depois de **Recortar**, os pontos voltam a ser colados com os próprios números, e pontos copiados de outro projeto mantêm os deles onde estiverem livres.
- Um ponto colado cujo número já está em uso recebe um novo número inteiro: um a mais que o maior número em uso, contando para cima.
- A barra de status informa o que aconteceu, por exemplo "1 manteve o número; 9 receberam números novos: 10–18 passaram a ser 277–285".

Em [Configurações do CivilCraft](topic:settings) você pode escolher **Sempre números novos**, e um número inicial para os novos números, por exemplo 5000 para pontos de projeto.

:::warning
Grupos de pontos que constroem a superfície como **linha de quebra** unem seus pontos na ordem dos números. Cópias coladas de pontos de linha de quebra (por exemplo, medições FL) recebem números novos e maiores e se unem ao fim dessa linha de quebra, possivelmente com um salto longo. Confira a planta depois de colar esses pontos, ou defina o grupo deles como {{ui:Pontos}}.
:::

## Duplicar

{{ui:Mais}} › {{ui:Duplicar}} ou {{key:Mod+D}} cria uma cópia dos pontos selecionados que segue o ponteiro: clique onde ela deve ir. As cópias sempre recebem números novos, e a área de transferência do CivilCraft fica como estava.

## De uma planilha ou de um arquivo de texto

Selecione linhas de pontos em uma planilha (ponto, norte, leste, cota, descrição) e copie-as. No CivilCraft, pressione {{key:Mod+V}} e clique onde elas devem ir, ou pressione {{key:Mod+Shift+V}} para colocá-las nas próprias coordenadas, que normalmente é o que você quer para dados reais de levantamento.

As linhas são lidas exatamente como um [arquivo de pontos](topic:point-file-formats): vírgulas, tabulações ou espaços, uma linha de cabeçalho se houver. Sem cabeçalho, a ordem das colunas vem de **Linhas de pontos** em [Configurações do CivilCraft](topic:settings).

Quando ambos estão presentes, o CivilCraft decide pelo que é mais recente: linhas na área de transferência do sistema que diferem da última cópia do CivilCraft foram copiadas depois, por isso são coladas. Texto que não contém pontos é ignorado, e a cópia do próprio CivilCraft é colada no lugar.

## Entre projetos e abas

A cópia é mantida neste navegador, então uma segunda aba do CivilCraft pode colá-la, mesmo depois que a primeira aba é fechada. Pontos copiados de um projeto em metros e colados em um projeto em pés mantêm os números como estão: nada é convertido, e a barra de status informa isso.

## O que não é copiado

Por enquanto, apenas pontos de levantamento são copiados. Alinhamentos, plataformas, redes de tubulações, linhas de quebra e contornos ainda não podem ser copiados ou colados. Colar não pode mover pontos existentes: use {{ui:Recortar}} e colar, ou mova um ponto de cada vez ([Editar um ponto de levantamento](topic:edit-points)).
