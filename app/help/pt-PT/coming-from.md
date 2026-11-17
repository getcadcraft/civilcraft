---
title: Vindo de outro software civil
summary: Como os fluxos de trabalho de projeto civil conhecidos se correspondem ao CivilCraft, e as diferenças que surpreendem os utilizadores experientes na primeira hora.
keywords: transição, migrar, familiar, diferenças, fluxo de trabalho, comandos, correspondência, cogo, corredor, regularização, rede de coletores, estilos, linha de comandos
from: feae37d6
---

Quem já trabalhou com o Civil 3D conhece as ideias do CivilCraft: pontos e grupos de pontos, superfícies TIN com linhas de quebra e limites, diretrizes por PI, perfis por PVI, montagens varridas em corredores, regularização até à linha de intersecção do talude, redes de coletores por gravidade, LandXML. O que é diferente é quase tudo o que está à volta: não há ficheiro de desenho, nem linha de comandos (a menos que escolha o estilo de menu {{ui:Desenho clássico}}), nem estilos, nem Prospector e nem caixas de definições. O CivilCraft é uma ferramenta pequena e focada, num navegador, e nesta versão faz uma fração do que um pacote civil completo faz. Esta página liga o que já conhece ao que existe aqui.

:::tip
Para quem prefere a faixa do Civil 3D, escolha o estilo de menu {{ui:Friso civil}} em {{ui:Definições}} › {{ui:CivilCraft}} › {{ui:Menus, teclas e rato}}: separadores Início, Superfícies, Modificar, Geolocalização, Vista e Saída, o botão do meio desloca a vista, e {{key:Shift}} com o botão do meio roda a vista 3D. Para quem escreve comandos, {{ui:Desenho clássico}} acrescenta uma linha de comandos (ALIGNMENT, PAD, PROFILE, ZOOM …). Ver [Menus, teclas e rato](topic:menus-keys-and-mouse).
:::

## Mapa de fluxos de trabalho

| O que se pretende fazer | Forma habitual | No CivilCraft |
|---|---|---|
| Trazer pontos de levantamento | Importar pontos com um formato de ficheiro de pontos | {{ui:Abrir}}, depois verificar a ordem das colunas em **Importar pontos** ([Importar pontos de levantamento](topic:import-points)) |
| Ordenar pontos | Grupos de pontos, chaves de descrição | Grupos automáticos pela primeira palavra da descrição; sem chaves de descrição |
| Editar um ponto | Editor de pontos, pegas | Clicar nele e escrever nas Propriedades, ou arrastá-lo ([Editar um ponto de levantamento](topic:edit-points)) |
| Construir o terreno existente | Criar uma superfície, adicionar grupos de pontos como dados | Automático: a superfície é recalculada sempre que as entradas mudam |
| Acrescentar linhas de quebra | Linhas de quebra a partir de polilinhas ou linhas características | Definir um grupo de pontos como {{ui:Linha de quebra}}, ou clicar em pontos com a ferramenta {{ui:Linha de quebra}} ({{key:B}}) |
| Aparar a superfície | Limite exterior, limite de ocultação, comprimento máximo de triângulo | {{ui:Limite}} ({{key:O}}, só exterior) e **Aresta exterior mais longa** |
| Mostrar curvas de nível | Estilo de superfície | **Visualização** no painel da esquerda: intervalo, principal a cada, etiquetas, faixas, setas de declive |
| Traçar um eixo | Ferramentas de criação de diretriz, definições de curva e espiral | {{ui:Diretriz}} ({{key:A}}): clicar nos PI, {{key:Enter}}; raios e comprimentos de espiral na tabela de PI |
| Criar uma vista de perfil | Assistente de vista de perfil, faixas | {{ui:Perfil}} ({{key:R}}): uma vista de perfil sob o plano, sempre ajustada |
| Projetar a rasante | Ferramentas de traçado de perfil | {{ui:Começar a partir do terreno}}, {{ui:Adicionar PVI}} ({{key:I}}), arrastar os PVI, escrever **Curva L** |
| Construir uma estrada | Montagem, subconjuntos, corredor, alvos, regiões | Marcar **Varrer uma montagem ao longo do perfil de projeto** sob a diretriz; uma via, uma berma e um talude de cada lado, ou cada lado construído a partir de peças (sarjeta, lancil, passeio …) |
| Regularizar uma plataforma | Linhas características, grupos de regularização, critérios de regularização | {{ui:Plataforma}} ({{key:G}}): uma plataforma plana com taludes de escavação e aterro até ao terreno natural |
| Calcular a movimentação de terras | Superfícies de volume, painel de volumes | **Movimentação de terras** no painel da direita, método de grelha, atualizado em tempo real |
| Traçar a drenagem | Rede de coletores com lista de peças, regras | {{ui:Coletores}} ({{key:P}}): clicar nas estruturas a jusante; três regras que define; cotas de fundo automáticas |
| Trocar com outros | Importação e exportação LandXML | {{ui:Abrir}} um ficheiro LandXML; {{ui:LandXML}} para exportar ([Trocar LandXML](topic:landxml)) |
| Enviar linhas para o CAD | Exportar para DWG | {{ui:DWG}} (formato de 2000 a 2018) ou {{ui:DXF}} (R12) |
| Imprimir | Layouts, viewports, conjuntos de folhas | {{ui:PDF}}: uma folha paisagem do plano a uma escala escolhida; folhas de plano e de perfil e folhas de secção em PDF |
| Partilhar trabalho entre ficheiros | Atalhos de dados, referências | Não disponível: um projeto por ficheiro |
| Anular | Anular | {{key:Mod+Z}} e {{key:Mod+Y}}, 200 passos; as definições de visualização não são passos de anulação |

## Diferenças que surpreendem as pessoas

**Não há linha de comandos** a menos que escolha o estilo de menu {{ui:Desenho clássico}}. As ferramentas são botões da barra e letras isoladas: {{key:A}} diretriz, {{key:G}} plataforma, {{key:P}} coletores, {{key:B}} linha de quebra, {{key:O}} limite, {{key:R}} perfil, {{key:I}} adicionar PVI, {{key:V}} selecionar, {{key:F}} ajustar. Nos outros estilos de menu, escrever um nome de comando não faz nada. Ver [Teclas e rato](topic:keyboard).

**Enter termina; o duplo clique é arriscado.** Clique uma vez no último ponto e, depois, prima {{key:Enter}}. Nesta versão, o duplo clique também termina, mas retira o ponto em que clicou duas vezes. O botão direito do rato não termina nem repete; só desloca a vista se arrastar com ele.

**Tudo é dinâmico, o tempo todo.** Altere um grupo de pontos, um raio, um PVI ou um declive de plataforma, e a superfície, as curvas de nível, o corredor, as linhas de intersecção do talude e os volumes atualizam-se de imediato. Não há nada para recalcular e nada fica desatualizado.

**Nada é um objeto de desenho.** O plano é uma vista do projeto, não um desenho que se possa editar com comandos de CAD. Não pode acrescentar as suas próprias linhas ou texto, alterar a cor de uma camada nem decompor coisas. Exporte para DXF e acabe o desenho num programa de CAD.

**Sem estilos.** As cores, as espessuras de linha, os tamanhos de etiqueta e os nomes de camadas são fixos (ver [Camadas do plano](topic:plan-layers)). Papel e Modelo na barra da aplicação alternam entre um ecrã claro e um escuro.

**Um de cada.** Uma superfície de terreno existente, um resultado regularizado e uma rede de coletores por projeto. Muitas diretrizes e plataformas são admissíveis.

**As unidades são rótulos.** Escolher {{ui:Pés dos EUA}} ou {{ui:Metros}} não converte nada. Não há escala de desenho. Um sistema de coordenadas é opcional: defina-o em {{ui:Coordenadas}} e nada se move; apenas indica o que os números significam (ver [Definir o sistema de coordenadas do projeto](topic:coordinate-systems)). Os pés são tratados como pés de levantamento dos EUA quando escritos em LandXML.

**As linhas de quebra juntam-se por ordem de número de ponto.** Um grupo definido como {{ui:Linha de quebra}} torna-se uma linha única que passa por todos os pontos do grupo, por ordem de número. Códigos partilhados (duas linhas de escoamento com o código "FL") fazem uma linha em ziguezague; desenhe essas à mão.

**Os PK parecem iguais, os metros não.** Os pés usam PK de 100 ft (12+34.56); os metros usam PK de 1000 m (1+234.567).

**Eliminar num Mac.** A tecla com o rótulo **delete** é {{key:Backspace}} para o navegador. Use Fn e delete, ou o botão {{ui:Eliminar}}, para eliminar uma seleção.

**Os ficheiros são transferências.** {{ui:Guardar}} transfere um ficheiro `.civilcraft.json` de cada vez; não existe «guardar por cima do ficheiro aberto». Uma cópia de recuperação do trabalho não guardado fica guardada neste navegador ([Recuperar trabalho não guardado](common:recover)). Abrir um ficheiro de pontos substitui os pontos sem perguntar. Ver [Ficheiros que pode abrir, guardar e exportar](topic:files).

**As regras têm de ser definidas por quem projeta.** As regras da rede de coletores e a montagem do corredor começam com valores provisórios que não são uma norma. Defina os valores próprios antes de confiar em qualquer verificação.

**Os volumes são baseados em grelha.** A escavação e o aterro vêm de uma grelha fina entre as duas superfícies, dentro das linhas de intersecção do talude, sem empolamento nem contração. Estão próximos de, mas não são iguais a, um volume TIN a TIN.

## O que falta

Espirais que não sejam clotoides, montagens que mudam ao longo da estrada, plataformas inclinadas, capacidade de entradas e de retenção, catálogos de peças, coletores em perfil, traçado de lotes e dimensionamento de lotes, ajustamento por mínimos quadrados e bases de dados de levantamento, abrir DWG, e mais. A lista completa, com o que fazer em vez disso hoje, está em [Ainda não implementado](topic:not-built-yet).
