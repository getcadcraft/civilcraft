---
title: Vindo de outro software civil
summary: Como os fluxos de trabalho de projeto civil conhecidos correspondem ao CivilCraft, e as diferenças que pegam usuários experientes na primeira hora.
keywords: migração, migrar, conhecido, diferenças, fluxo de trabalho, comandos, mapeamento, cogo, corredor, terraplenagem, rede de tubos, estilos, linha de comando
from: feae37d6
---

Se você já usou o Civil 3D, já conhece as ideias do CivilCraft: pontos e grupos de pontos, superfícies TIN com linhas de quebra e limites, alinhamentos por PI, perfis por PIV, seções-tipo (assemblies) varridas em corredores, terraplenagem até o pé de talude, redes de tubos por gravidade, LandXML. O que é diferente é quase tudo em volta delas: não há arquivo de desenho, não há linha de comando (a menos que você escolha o estilo de menu {{ui:Desenho clássico}}), não há estilos, não há Prospector e não há caixas de configurações. O CivilCraft é uma ferramenta pequena e focada em um navegador, e nesta versão ela faz uma fração do que um pacote civil completo faz. Esta página relaciona o que você conhece com o que existe aqui.

:::tip
Se você gosta da faixa de opções (ribbon) do Civil 3D, escolha o estilo de menu {{ui:Ribbon civil}} em {{ui:Configurações}} › {{ui:CivilCraft}} › {{ui:Menus, teclas e mouse}}: abas Início, Superfícies, Modificar, Geolocalização, Exibir e Saída, o botão do meio faz pan, e {{key:Shift}} com o botão do meio orbita a visualização 3D. Se você digita comandos, {{ui:Desenho clássico}} adiciona uma linha de comando (ALIGNMENT, PAD, PROFILE, ZOOM …). Veja [Menus, teclas e mouse](topic:menus-keys-and-mouse).
:::

## Mapa de fluxo de trabalho

| O que você quer fazer | Forma conhecida | No CivilCraft |
|---|---|---|
| Trazer pontos de levantamento | Importar pontos com um formato de arquivo de pontos | {{ui:Abrir}}, depois confira a ordem das colunas em **Importar pontos** ([Importe pontos de levantamento](topic:import-points)) |
| Ordenar pontos | Grupos de pontos, chaves de descrição | Grupos automáticos pela primeira palavra da descrição; sem chaves de descrição |
| Editar um ponto | Editor de pontos, grips | Clique nele e digite em Propriedades, ou arraste-o ([Edite um ponto de levantamento](topic:edit-points)) |
| Construir o terreno natural | Criar superfície, adicionar grupos de pontos como dados | Automático: a superfície é reconstruída sempre que suas entradas mudam |
| Adicionar linhas de quebra | Adicionar linhas de quebra a partir de polilinhas ou linhas de feição | Defina um grupo de pontos como {{ui:Linha de quebra}}, ou clique em pontos com a ferramenta {{ui:Linha de quebra}} ({{key:B}}) |
| Aparar a superfície | Limite externo, limite oculto, comprimento máximo de triângulo | {{ui:Limite}} ({{key:O}}, apenas externo) e **Maior aresta externa** |
| Mostrar curvas de nível | Estilo de superfície | **Exibir** no painel esquerdo: intervalo, maior a cada, rótulos, faixas, setas de declividade |
| Desenhar um eixo | Ferramentas de criação de alinhamento, configurações de curva e espiral | {{ui:Alinhamento}} ({{key:A}}): clique nos PIs, {{key:Enter}}; raios e comprimentos de espiral na tabela de PIs |
| Criar uma vista de perfil | Assistente de vista de perfil, faixas | {{ui:Perfil}} ({{key:R}}): uma vista de perfil sob o plano, sempre ajustada |
| Projetar o greide | Ferramentas de layout de perfil | {{ui:Começar do terreno}}, {{ui:Adicionar PIVs}} ({{key:I}}), arraste os PIVs, digite **Curva L** |
| Construir uma estrada | Seção-tipo, subseções-tipo, corredor, alvos, regiões | Marque **Varrer uma seção-tipo ao longo do perfil de projeto** no alinhamento; uma faixa, acostamento e talude de cada lado, ou cada lado montado a partir de partes (sarjeta, meio-fio, calçada …) |
| Terraplenar uma plataforma | Linhas de feição, grupos de terraplenagem, critérios de terraplenagem | {{ui:Plataforma}} ({{key:G}}): uma plataforma plana com taludes de corte e aterro até o pé de talude |
| Calcular movimento de terra | Superfícies de volume, painel de volumes | **Movimento de terra** no painel direito, método de grade, atualiza ao vivo |
| Projetar drenagem pluvial ou esgoto | Rede de tubos com lista de peças, regras | {{ui:Tubos}} ({{key:P}}): clique nas estruturas a jusante; três regras que você define; cotas de fundo automáticas |
| Trocar com outros | Importação e exportação LandXML | {{ui:Abrir}} um arquivo LandXML; {{ui:LandXML}} para exportar ([Troque arquivos LandXML](topic:landxml)) |
| Enviar linhas ao CAD | Exportar para DWG | {{ui:DWG}} (formato 2000 a 2018) ou {{ui:DXF}} (R12) |
| Plotar | Layouts, viewports, conjuntos de folhas | {{ui:PDF}}: uma folha paisagem do plano em uma escala escolhida; folhas de plano e perfil e folhas de seção como PDF |
| Compartilhar trabalho entre arquivos | Atalhos de dados, referências | Não disponível: um projeto por arquivo |
| Desfazer | Desfazer | {{key:Mod+Z}} e {{key:Mod+Y}}, 200 passos; configurações de exibição não são passos de desfazer |

## Diferenças que pegam as pessoas

**Não há linha de comando** a menos que você escolha o estilo de menu {{ui:Desenho clássico}}. As ferramentas são botões da barra e letras isoladas: {{key:A}} alinhamento, {{key:G}} plataforma, {{key:P}} tubos, {{key:B}} linha de quebra, {{key:O}} limite, {{key:R}} perfil, {{key:I}} adicionar PIVs, {{key:V}} selecionar, {{key:F}} ajustar. Nos outros estilos de menu, digitar um nome de comando não faz nada. Veja [Teclas e mouse](topic:keyboard).

**Enter finaliza; o duplo clique é arriscado.** Clique no último ponto uma vez e depois pressione {{key:Enter}}. Nesta versão o duplo clique também finaliza, mas elimina o ponto em que você deu duplo clique. O clique com o botão direito não finaliza nem repete; ele só faz pan quando você arrasta com ele.

**Tudo é dinâmico, o tempo todo.** Altere um grupo de pontos, um raio, um PIV ou a declividade de uma plataforma, e a superfície, as curvas de nível, o corredor, as linhas de pé de talude e os volumes são atualizados na hora. Não há nada para reconstruir e nada fica desatualizado.

**Nada é um objeto de desenho.** O plano é uma vista do projeto, não um desenho que você edita com comandos de CAD. Você não pode adicionar as suas próprias linhas ou textos, mudar a cor de uma camada ou explodir qualquer coisa. Exporte para DXF e termine o desenho em um programa de CAD.

**Sem estilos.** Cores, espessuras de linha, tamanhos de rótulo e nomes de camada são fixos (veja [Camadas do plano](topic:plan-layers)). Papel e Modelo na barra do aplicativo alternam entre uma tela clara e uma escura.

**Um de cada.** Uma superfície de terreno natural, um resultado terraplenado e uma rede de tubos por projeto. Muitos alinhamentos e plataformas são permitidos.

**As unidades são rótulos.** Escolher {{ui:Pés dos EUA}} ou {{ui:Metros}} não converte nada. Não há escala de desenho. Um sistema de coordenadas é opcional: defina um em {{ui:Coordenadas}} e nada se move; ele apenas diz o que os números significam (veja [Defina o sistema de coordenadas do projeto](topic:coordinate-systems)). Pés são tratados como pés de levantamento dos EUA (US survey feet) quando gravados em LandXML.

**Grupos de linha de quebra se unem na ordem dos números dos pontos.** Um grupo definido como {{ui:Linha de quebra}} vira uma linha só, passando por todos os seus pontos, em ordem numérica. Códigos compartilhados (dois córregos de fluxo codificados como "FL") formam uma única linha em ziguezague; desenhe essas à mão.

**Estacas têm a mesma aparência, mas em metros são diferentes.** Pés usam estacas de 100 ft (12+34.56); metros usam estacas de 1000 m (1+234.567).

**Delete em um Mac.** A tecla de Mac rotulada delete equivale a Backspace no navegador. Use Fn e delete, ou o botão {{ui:Excluir}}, para excluir uma seleção.

**Os arquivos são downloads.** {{ui:Salvar}} baixa um arquivo `.civilcraft.json` a cada vez; não há "salvar sobre o arquivo aberto". Uma cópia de recuperação do trabalho não salvo fica neste navegador ([Recupere trabalho não salvo](common:recover)). Abrir um arquivo de pontos substitui os pontos sem perguntar. Veja [Arquivos que você pode abrir, salvar e exportar](topic:files).

**As regras são suas.** As regras da rede de tubos e a seção-tipo do corredor começam com valores provisórios que não são um padrão. Defina os seus antes de confiar em qualquer verificação.

**Volumes são baseados em grade.** Corte e aterro vêm de uma grade fina entre as duas superfícies, dentro das linhas de pé de talude, sem empolamento nem contração. Ficam próximos de, mas não são iguais a, um volume TIN para TIN.

## O que falta

Espirais além da clotoide, seções-tipo que mudam ao longo da estrada, plataformas com declividade, capacidade de bocas de lobo e detenção, catálogos de peças, tubos no perfil, layouts de lotes e dimensionamento de lotes, ajustamento por mínimos quadrados e bancos de dados de levantamento, abrir DWG, e mais. A lista completa, com o que fazer em vez disso hoje, está em [Ainda não implementado](topic:not-built-yet).
