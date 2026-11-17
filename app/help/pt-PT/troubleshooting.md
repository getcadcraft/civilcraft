---
title: Resolução de problemas
summary: Sintomas, causas e soluções para os problemas que surgem no CivilCraft, com as mensagens exatas que a aplicação mostra.
keywords: problemas, erros, não funciona, solução, ajuda, mensagens, resolver, recusado, em falta, errado, trocado, curvas de nível em falta
from: a9f7dedc
---

As mensagens aparecem na barra de estado, no canto inferior direito, em caixas nos painéis esquerdo e direito e nas caixas de diálogo. São citadas aqui tal como a aplicação as mostra.

## Abrir ficheiros

**"Este ficheiro tem mais de 200 MB; o CivilCraft ainda não abre ficheiros tão grandes."**
Divida o ficheiro de pontos ou reduza os dados antes de o abrir.

**"Não foi possível abrir site.json: Este não é um ficheiro de projeto do CivilCraft."**
O ficheiro termina em `.json` ou começa por `{`, mas não é um projeto do CivilCraft. Os ficheiros de pontos não podem começar por `{`.

**"Não foi possível abrir … Este ficheiro de projeto é de um CivilCraft mais recente (versão 2)."**
O projeto foi guardado com uma versão mais recente. Abra-o nessa versão, ou exporte dele um LandXML.

**"Não foi possível abrir … Isto é XML, mas não LandXML (o elemento raiz é <…>)."**
O ficheiro é outro tipo de XML. Exporte um LandXML a partir do outro programa.

**"… não tem pontos, superfícies TIN nem diretrizes que o CivilCraft consiga ler."**
Tudo o que está no ficheiro é algo que o CivilCraft ignora (por exemplo, apenas superfícies em grelha, ou apenas diretrizes em espiral). O resto da mensagem diz o que lá existia. Veja [LandXML: o que é lido e escrito](topic:landxml-reference).

**"Não foi possível carregar a amostra: …"**
{{ui:Abrir o site de exemplo}} lê um ficheiro do site do CadCraft. Sem ligação, só funciona se o CivilCraft tiver sido guardado para utilização offline (o botão na barra da aplicação mostra {{ui:Pronto para offline}}). Ligue-se à Internet, clique em {{ui:Guardar para offline}} e passa a funcionar offline a partir daí. Veja [Offline](common:offline).

**{{ui:Guardar para offline}} mostra {{ui:Não foi possível guardar}}.**
Alguns ficheiros não foram transferidos. Verifique a ligação e clique novamente no botão.

**{{ui:Guardar para offline}} mostra {{ui:Offline indisponível}}.**
Esta janela do navegador não consegue guardar uma cópia offline, normalmente porque é uma janela privada ou porque o computador é gerido. Abra o CivilCraft numa janela normal.

**Offline, a aplicação não abre de todo.**
Não foi guardada para utilização offline neste navegador, ou o navegador apagou os dados do site (o Safari faz isto a sites não visitados durante várias semanas). Ligue-se à Internet, abra o CivilCraft e clique em {{ui:Guardar para offline}}.

**A cópia offline é de uma versão anterior.**
Clique em {{ui:Pronto para offline}} e, estando ligado, em {{ui:Guardar novamente (obter a versão mais recente)}}.

**Um ficheiro aparece a cinzento na caixa de abertura.**
A caixa lista apenas ficheiros de pontos, LandXML e de projeto, pelas respetivas terminações. Arraste o ficheiro para a planta, ou mude-lhe o nome para `.txt`.

## Importar pontos

**"Não foi possível ler pontos deste ficheiro."**
Escolha manualmente a ordem das colunas em **Colunas**. Se nada resultar, abra o ficheiro num editor de texto e verifique se tem um ponto por linha, com números.

**O local aparece espelhado, rodado ou esticado numa linha.**
A coordenada norte e a coordenada este estão trocadas. O resumo dizia "adivinhado a partir do número de colunas". Escolha PENZD em vez de PNEZD (ou o contrário) em **Colunas**, ou importe novamente.

**Pontos muito afastados do resto, e a planta reduzida a um ponto.**
Uma linha tem um erro de digitação numa coordenada, ou o ficheiro mistura sistemas de coordenadas. Encontre o ponto (clique nele para ver o número) e corrija o ficheiro.

**Linhas listadas em "Linhas não lidas".**
Veja a tabela em [Importar pontos topográficos](topic:import-points#rows-that-are-not-read).

**Os meus pontos antigos desapareceram.**
Importar um ficheiro de pontos substitui todos os pontos e limpa o histórico de anulações. Abra o projeto guardado para os recuperar.

## A superfície

**"Superfície: não criada" com uma caixa vermelha.**
A caixa indica o motivo: "Uma superfície precisa de pelo menos três pontos com cotas.", "Os pontos estão todos sobre a mesma linha: não há triângulos.", "Não há pontos com cotas.", "A fronteira não se sobrepõe aos pontos." ou "Não restam triângulos dentro da fronteira." Verifique a ordem das colunas, os grupos de pontos (estão em {{ui:Deixado de fora}}?) e a fronteira.

**As curvas de nível cortam em linha reta uma vala ou uma crista.**
Essa linha não é uma linha de quebra. Defina o respetivo grupo como {{ui:Linha de quebra}}, ou desenhe-a com a ferramenta {{ui:Linha de quebra}}. Veja [Criar e refinar a superfície](topic:build-surface).

**Um grupo de linhas de quebra desenha um ziguezague.**
O grupo tem mais de uma linha, ou os respetivos pontos não estão numerados ao longo da linha. Defina o grupo novamente como {{ui:Pontos}} e desenhe cada linha com a ferramenta {{ui:Linha de quebra}}.

**Triângulos longos e finos ao longo do exterior.**
Desenhe uma fronteira ({{key:O}}) ou defina **Aresta exterior mais longa**.

**Nenhuma curva de nível, embora a superfície esteja criada.**
Ou {{ui:Curvas de nível}} está desligado em **Visualização**, ou o intervalo é tão pequeno que haveria mais de 2,000 níveis de curvas. Escolha um intervalo maior.

**Linhas de quebra ou uma fronteira não mudam nada.**
A superfície veio de um LandXML ("Superfície (a partir de LandXML)"). É usada tal como está. Clique em {{ui:Reconstruir a superfície a partir dos pontos}} para a criar a partir dos pontos.

**"Ainda não há superfície: abra primeiro os pontos topográficos."**
Linha de quebra, fronteira e plataforma precisam de uma superfície de terreno existente. Importe primeiro os pontos.

**"Clique num ponto topográfico com cota: uma linha de quebra usa as cotas dos pontos."**
A ferramenta {{ui:Linha de quebra}} só escolhe pontos topográficos. Aproxime a vista e clique num ponto (um quadrado laranja mostra o que será escolhido).

## Desenho

**O meu último ponto desapareceu quando fiz duplo clique para terminar.**
Nesta versão, o duplo clique termina a diretriz, a plataforma, a linha de quebra ou a fronteira, mas descarta o ponto em que fez duplo clique. Clique uma vez no último ponto e prima {{key:Enter}}. Use {{key:Mod+Z}} se já tiver acontecido e desenhe de novo.

**Não consigo terminar um desenho num tablet.**
Terminar requer {{key:Enter}}; ainda não há botão no ecrã. Ligue um teclado. Veja [Rato, trackpad e toque](topic:keyboard#mouse-trackpad-and-touch).

**Arrastar para colocar um ponto desloca a vista.**
Um arrastamento de mais de alguns píxeis desloca a planta em todas as ferramentas. Clique sem mover.

**"Uma diretriz precisa de pelo menos dois pontos." / "Uma plataforma precisa de pelo menos três cantos." / "Um troço de coletor precisa de pelo menos duas estruturas."**
Prima {{key:Enter}} cedo demais. O desenho é descartado; comece de novo.

**Teclas como A ou G não fazem nada.**
Uma caixa de texto ou uma lista num painel ainda tem o foco, por isso as letras vão para lá. Clique uma vez na planta e depois prima a tecla. Num Mac, a tecla delete corresponde a Backspace para o navegador: use Fn e Delete para eliminar uma seleção.

## Diretrizes e perfis

**"As curvas do PI 2 e do PI 3 sobrepõem-se: … Use raios menores."**
Duas curvas precisam de mais tangente do que a que existe entre os respetivos PI. Reduza um ou ambos os raios na tabela de PI, ou afaste os PI.

**"O PI 3 retrocede em linha reta; não pode receber uma curva."**
A diretriz volta sobre si própria nesse PI. Mova ou remova o PI.

**"Esta diretriz não tem terreno por baixo para começar."**
A diretriz está fora da superfície. Mova-a para cima da superfície, ou acrescente PVI clicando com {{ui:Adicionar PVI}} ativado.

**"A curva vertical no PVI 3 (L = …) começa antes de a curva ou o PVI anterior terminar." / "… ultrapassa o PVI seguinte."**
Encurte o comprimento da curva ou afaste os PVI.

**"Já existe um PVI em …"**
Existe um PVI nessa estaca. Clique noutro sítio, ou arraste o existente.

**A vista de perfil está vazia: "Desenhe uma diretriz para ver o seu perfil."**
Não há diretriz, ou a selecionada tem erros.

## Corredores e plataformas

**"O corredor precisa de um perfil de projeto sem erros."**
Comece um perfil de projeto ({{ui:Começar a partir do terreno}}) e corrija as sobreposições de curvas.

**"… os taludes laterais saem da superfície antes de encontrar o terreno." / "… as linhas de talude saem da superfície antes de a encontrar …"**
A modelação do terreno chega ao limite da superfície antes de encontrar o terreno natural. Afaste o projeto da extremidade, ou aproxime-o do terreno. Uma nova plataforma desenhada em parte fora da superfície pode começar à cota 0: escreva uma cota real.

**"As linhas de intersecção do talude do corredor cruzam …" / "A linha de intersecção do talude cruza-se a si própria …"**
Taludes de lados diferentes chocam uns com os outros: curvas apertadas, plataformas estreitas, escavações profundas ou aterros altos. Use um raio maior, um perfil transversal tipo mais estreito, uma plataforma mais larga ou taludes mais inclinados.

**"Ainda não há volumes: uma plataforma precisa de modelar sem problemas."**
Corrija os problemas indicados na caixa vermelha acima.

**{{ui:Proposta (modelada)}} está a cinzento.**
Ainda nenhuma plataforma ou corredor está modelado.

## Coletores

**"P2 ainda não tem cotas de soleira."**
Clique em {{ui:Definir as cotas de soleira a partir das regras}} ou escreva as cotas de soleira.

**"P1: não há terreno em S1 para começar."**
A estrutura de montante está fora da superfície e não tem cota de tampa. Escreva uma cota de tampa para ela.

**Todos os coletores ficam assinalados depois de eu mover uma estrutura.**
Mover uma estrutura não altera as cotas de soleira. Clique em {{ui:Definir todas as cotas de soleira a partir das regras}}.

Todas as mensagens da rede são explicadas em [Dispor uma rede de coletores por gravidade](topic:pipe-network#read-and-fix-problems).

## Guardar e exportar

**"Ainda não há nada para exportar." / "Ainda não há nada para imprimir."**
O projeto está vazio. Importe primeiro pontos.

**Não encontro o ficheiro guardado.**
Está nas transferências do navegador (normalmente a pasta Transferências). Veja [Ficheiros que pode abrir, guardar e exportar](topic:files#where-the-files-go).

**A escala do PDF está errada no papel.**
Imprima a 100% ou em tamanho real, não em "ajustar à página".

**Pontos de interrogação no texto do PDF.**
Os nomes ou descrições usam caracteres fora do conjunto da Europa Ocidental. A mensagem de estado conta-os. Mude o nome com caracteres simples.

**A impressão é cortada nas margens.**
A escala é grande demais para a folha. Escolha a escala marcada "(cabe)", uma folha maior, ou {{ui:O que está no ecrã}}.

**{{key:Mod+P}} abriu a caixa de impressão do navegador.**
A página não tinha o foco. Feche a caixa, clique na planta e prima {{key:Mod+P}} de novo, ou clique em {{ui:PDF}}.

## A própria aplicação

**O ecrã está em branco ou a barra de ferramentas não faz nada.**
Use uma versão atual do Chrome, Edge, Firefox ou Safari, e recarregue a página. Veja [Navegadores](common:browsers).

**A aplicação está lenta com um ficheiro de pontos grande.**
Desligue {{ui:Triângulos}}, {{ui:Etiquetas dos pontos}} e {{ui:Faixas de cota}}, e use um intervalo de curvas de nível maior. As superfícies muito grandes demoram um momento a reconstruir-se após cada alteração.

**O navegador pergunta "Sair do site?"**
O projeto tem alterações não guardadas. Fique na página, guarde com {{key:Mod+S}} e só depois saia.
