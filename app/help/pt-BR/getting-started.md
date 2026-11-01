---
title: Primeiros passos com o CivilCraft
summary: O que o CivilCraft faz, como abri-lo e os primeiros dez minutos com a implantação de exemplo, dos pontos às curvas de nível, uma estrada e um projeto salvo.
keywords: início, primeira execução, implantação de exemplo, introdução, início rápido, tutorial, começar, novo projeto
from: c9b6dd8e
---

O CivilCraft é o aplicativo de projeto civil e de implantação da família CadCraft. Ele transforma pontos de levantamento em uma superfície (uma TIN) com curvas de nível e permite traçar alinhamentos com perfis de projeto, varrer um corredor de estrada simples, terraplenar plataformas de edifícios até o pé de talude, verificar uma rede de tubos por gravidade contra suas regras e ver os volumes de corte e aterro. Lê e grava LandXML, exporta a planta como DXF e a plota em PDF.

Se você já usou o Civil 3D, as ideias vão parecer familiares: pontos, grupos de pontos, linhas de quebra, alinhamentos por PI, perfis por PIV, corredores, terraplenagem, redes de tubos. A forma de trabalhar é diferente, e bem menor: não há linha de comando, nem estilos, nem arquivo de desenho. Leia [Vindo de outros softwares civis](topic:coming-from) uma vez antes do seu primeiro trabalho de verdade.

## O que você precisa

- Um navegador de computador recente: Chrome, Edge, Firefox ou Safari. Veja [Navegadores](common:browsers).
- Um mouse ou trackpad e um teclado, ou uma tela de toque: nela o desenho tem os botões {{ui:Concluir}}, {{ui:Desfazer ponto}} e {{ui:Cancelar}} na tela (veja [Mouse, trackpad e toque](topic:keyboard#mouse-trackpad-and-touch)).
- A planta é desenhada em 2D com o canvas do navegador. A [vista 3D](topic:site-3d) usa os gráficos WebGL do navegador; se ela não puder iniciar, a barra de status diz por quê e a planta continua funcionando.
- Sem conta e sem envio de arquivos. Os arquivos são abertos no seu computador e salvos como downloads. Veja [Seus arquivos](common:your-files).

:::note
Hoje o CivilCraft roda como uma versão inicial no navegador, que ainda está sendo feita. As versões para desktop ainda não estão disponíveis, e o salvamento na nuvem também não. Tudo o que você faz fica no seu computador até que você salve ou exporte.
:::

## Abra o CivilCraft

1. Abra o CivilCraft no navegador.
2. Espere a tela se preencher: uma barra de ferramentas no alto, um painel à esquerda, a planta no meio e um painel **Propriedades** à direita.
3. Em uma planta vazia você vê uma caixa com o título **Comece com pontos de levantamento**. Ela lista os primeiros passos e tem um link, {{ui:Abrir a implantação de exemplo}}.

Para usar o CivilCraft sem conexão mais tarde, clique em {{ui:Salvar para uso offline}} na barra do aplicativo e espere por {{ui:Pronto para uso offline}}. Isso inclui esta ajuda, a implantação de exemplo e as bibliotecas 3D e GIS. Veja [Offline](common:offline). Pressione {{key:F1}} ou clique em {{ui:Ajuda}} a qualquer momento para abrir esta ajuda ao lado do aplicativo.

## Seus primeiros dez minutos: a implantação de exemplo

A implantação de exemplo é um pequeno levantamento em pés dos EUA: 276 pontos em coordenadas do plano estadual, um espigão, um talvegue com uma linha de fundo e dois topos de talude. Ela vem com o aplicativo, então você pode acompanhar sem um arquivo seu.

1. Clique em {{ui:Abrir a implantação de exemplo}} na caixa sobre a planta.
   A caixa de diálogo **Importar pontos** se abre. Ela diz "276 pontos lidos como PNEZD (pela linha de cabeçalho), separados por vírgulas." e mostra as primeiras linhas.
2. Clique em {{ui:Importar}}.
   A planta se enche de pontos, curvas de nível e a borda da superfície. A barra de status, embaixo, informa que os pontos foram importados e quantos triângulos a superfície tem (546).
3. Veja o painel esquerdo, em **Pontos**. Os pontos são agrupados pela primeira palavra da descrição: CP, FL, GRD, RIDGE, TBN, TBS e TREE.
4. Na coluna **Superfície** dessa tabela, defina **FL**, **RIDGE**, **TBN** e **TBS** como {{ui:Linha de quebra}}.
   A superfície é refeita na hora. Os dados de **Superfície** agora dizem "Linhas de quebra: 4", e as curvas de nível se dobram bruscamente ao longo da linha de fundo e do espigão, em vez de cortá-los.
5. Passe o ponteiro sobre a planta. A barra de status mostra a coordenada leste e a norte sob o ponteiro e a cota do terreno ali.
6. Em **Exibição**, defina {{ui:Curvas de nível a cada}} como 0.5 ft e ative {{ui:Faixas de elevação}}. Uma rampa de cores aparece, com uma legenda sob as caixas de seleção. Desative as faixas de novo quando terminar.

Agora você tem uma superfície de terreno natural. A seguir, uma estrada.

## Trace uma estrada curta

1. Pressione {{key:A}} (ou clique em {{ui:Alinhamento}} no grupo **Projeto**).
2. Clique em três pontos pela implantação, um após o outro. Uma linha vermelha acompanha o ponteiro e mostra o comprimento e o rumo da próxima tangente.
3. Pressione {{key:Enter}} para concluir.
   O alinhamento aparece com o estaqueamento. O painel direito mostra **Alinhamento**: seu comprimento, a tabela de PIs e a curva no PI do meio (raio de 100 ft, ou menor se 100 ft não couber).
4. No painel direito, em **Perfil de projeto**, clique em {{ui:Começar do terreno}}.
   A vista de perfil se abre sob a planta, com o terreno natural e um greide de projeto reto de ponta a ponta.
5. Pressione {{key:I}} para ativar {{ui:Adicionar PIVs}} e clique uma vez na vista de perfil, perto do meio. Um PIV aparece.
6. Na tabela de PIVs à direita, digite um comprimento de curva (por exemplo, 100) na caixa **L da curva** do PIV do meio e pressione {{key:Enter}}. O perfil agora tem uma curva vertical, com seu valor K indicado.
7. Em **Corredor**, marque **Varrer uma montagem ao longo do perfil de projeto**.
   A estrada é terraplenada no terreno: faixas, acostamentos e taludes até o pé de talude. O bloco **Movimento de terra** mostra corte e aterro.

Não se preocupe com valores exatos. Todo número pode ser alterado no painel direito, e {{key:Mod+Z}} desfaz a última alteração.

## Salve seu trabalho

1. Digite um nome em **Nome**, no alto do painel esquerdo.
2. Pressione {{key:Mod+S}} (ou clique em {{ui:Salvar}}).
   O navegador baixa um arquivo com o nome da implantação, terminado em `.civilcraft.json`. Ele guarda os pontos, as configurações da superfície, alinhamentos, perfis, corredores, plataformas e tubos.
3. Para continuar depois, clique em {{ui:Abrir}} (ou pressione {{key:Mod+O}}) e escolha esse arquivo, ou solte-o sobre a planta.

:::warning
Não há salvamento automático. Se você fechar a guia com alterações não salvas, o navegador pergunta se deseja sair; se sair, as alterações se perdem. Salve com frequência.
:::

## Para onde ir em seguida

- [Importe pontos de levantamento](topic:import-points) com seus próprios arquivos.
- [Monte e refine a superfície](topic:build-surface) com linhas de quebra e um limite.
- [A tela, parte por parte](topic:workspace).
- [Teclas e mouse](topic:keyboard).
