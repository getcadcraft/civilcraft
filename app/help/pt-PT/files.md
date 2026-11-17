---
title: Ficheiros para abrir, guardar e exportar
summary: Ficheiros de pontos, LandXML e projetos do CivilCraft para abrir; projetos, LandXML, DXF e PDF para exportar; o que cada um guarda, onde ficam os ficheiros e o que muda offline.
keywords: abrir, guardar, exportar, importar, formatos de ficheiro, csv, txt, landxml, xml, dxf, pdf, json, transferir, ficheiro de projeto
from: 82bff559
---

O CivilCraft abre ficheiros do seu computador e guarda transferindo os ficheiros de volta para ele. Nada é carregado e nada fica guardado num servidor. Veja também [Os seus ficheiros](common:your-files).

## O que abre

Clique em {{ui:Abrir}} (ou prima {{key:Mod+O}}) e escolha um ficheiro, ou arraste o ficheiro de {{pick:mac=Finder|windows=File Explorer|linux=o gestor de ficheiros}} para a planta. Um ficheiro de cada vez; os ficheiros com mais de 200 MB são recusados. Um ficheiro LandXML ou de projeto com mais de 32 MB é lido em partes de cerca de 4 MB, nunca como um só bloco de texto; enquanto um LandXML abre, conte com cerca de 13 vezes o tamanho do ficheiro em memória (um ficheiro de 69 MB usou cerca de 0,9 GB no nosso teste).

| Tipo | Nomes de ficheiros | O que acontece |
|---|---|---|
| Ficheiro de pontos | `.csv`, `.txt`, `.pnt`, `.xyz` (qualquer ficheiro de texto) | Abre-se a caixa de diálogo **Importar pontos**. Os pontos substituem os pontos do projeto; as diretrizes, as plataformas e as tubagens mantêm-se. |
| LandXML | `.xml`, `.landxml` | Cria-se um **novo projeto** a partir do ficheiro (pede-se confirmação antes, se o projeto atual tiver alterações não guardadas). |
| Projeto do CivilCraft | `.civilcraft.json` (qualquer `.json`) | O projeto abre-se tal como foi guardado (pede-se confirmação antes, se o projeto atual tiver alterações não guardadas). |

O CivilCraft decide pela terminação do ficheiro e, depois, pelos primeiros caracteres: texto que começa por `{` é lido como projeto, texto que começa por `<` como LandXML, e qualquer outro como ficheiro de pontos. Um ficheiro que a caixa de abertura deixa a cinzento ainda pode ser largado na planta.

:::note
Importar um ficheiro de pontos para um projeto que já tem pontos substitui-os sem perguntar e limpa o histórico de anular (abrir qualquer ficheiro é um começo novo para anular). Se a superfície veio de LandXML, importar pontos volta a torná-la numa superfície construída a partir dos pontos. Guarde primeiro se quiser recuperar os pontos antigos.
:::

Detalhes: [Formatos de ficheiros de pontos](topic:point-file-formats), [LandXML: o que é lido e escrito](topic:landxml-reference).

## O que guarda

{{ui:Guardar}} ({{key:Mod+S}}) guarda dois ficheiros lado a lado, com o nome indicado em **Nome** no painel esquerdo: `<name>.civilcraft.json`, o projeto que continua a editar, e `<name>.ifc`, o mesmo desenho em IFC 4.3 para os outros programas (ver [Exportação e importação IFC](topic:ifc)). Cada ficheiro regista o outro, e o IFC transporta também uma cópia comprimida do projeto, para que um IFC enviado sozinho continue a abrir-se totalmente editável.

- **No Studio** os dois ficheiros são guardados lado a lado, no mesmo sítio.
- **No Chrome e no Edge** a primeira vez que se guarda pede uma pasta e escreve os dois ficheiros nela; as gravações seguintes vão para a mesma pasta. Cancele a pergunta da pasta para transferir os dois ficheiros.
- **Noutros navegadores** os dois ficheiros são transferidos, primeiro o ficheiro do projeto.

Ao abrir qualquer um dos ficheiros, procura-se o outro. Abra os dois em conjunto (ou largue os dois), ou abra apenas um: no Studio o outro é encontrado na mesma pasta; num navegador o CivilCraft pede para o adicionar, ou para continuar apenas com o que se tem. Se o IFC tiver sido alterado por outro programa depois de o CivilCraft o guardar, ou se um dos ficheiros for mais antigo do que o outro, o projeto abre-se a partir do desenho mais recente e o painel Problemas diz o que aconteceu, com **Guardar agora** (volta a escrever os dois ficheiros) e **Mostrar a geometria do IFC como referência**. Um IFC sozinho que outro programa tenha alterado abre-se a partir da respetiva cópia do projeto, com o que ainda corresponde: as diretrizes que essa cópia alterou tomam a geometria desse IFC, os objetos que foram removidos ficam de fora, e o resto das alterações é listado, não aplicado. Um ficheiro de projeto anterior à versão 0.7.1 abre-se como antes.

O ficheiro do projeto guarda:

- todos os pontos (número, coordenadas, cota, descrição) e o nome do ficheiro de pontos de onde vieram
- as definições da superfície: escolhas de grupos, linhas de quebra desenhadas, o limite, a aresta exterior mais longa e uma TIN lida de LandXML
- as definições de visualização
- as diretrizes com os respetivos PI, raios e PK inicial, os respetivos perfis de projeto (PVI e comprimentos de curva) e as definições de corredor
- as plataformas e a rede de coletores com as respetivas regras

Não guarda o histórico de anulação. Superfícies, curvas de nível, linhas de intersecção do talude e volumes não são guardados; são reconstruídos a partir dos dados guardados quando o projeto abre. Um ficheiro de projeto de um CivilCraft mais recente é recusado com uma mensagem que indica a respetiva versão.

## O que exporta

| Botão | Ficheiro | Conteúdo |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontos, o terreno existente (e a superfície modelada, quando existir) como superfícies TIN, diretrizes, perfis do terreno e de projeto, a rede de coletores |
| {{ui:DXF}} | `<name>.dxf` | Linhas da planta em DXF R12 tal como são apresentadas, em camadas com nome |
| {{ui:DWG}} | `<name>.dwg` | As mesmas linhas como desenho DWG, no formato escolhido (2000 a 2018) |
| {{ui:PDF}} | `<name>.pdf` | Impressão vetorial da planta numa folha, à escala escolhida |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da vista 3D) | `<name>-3d.glb`, `<name>-3d.obj` | O que a vista 3D mostra como modelo 3D: metros, Y para cima, escala real, em torno de uma origem local registada |

O que cada um deixa de fora: [Intercâmbio LandXML](topic:landxml), [Exportar a planta para DXF](topic:dxf-export) (DWG também), [Imprimir a planta em PDF](topic:plot-pdf), [Exportar o local em 3D](topic:export-3d).

## Onde ficam os ficheiros

Os ficheiros guardados e exportados vão para onde o navegador põe as transferências, normalmente a pasta Transferências. Para escolher uma pasta de cada vez:

:::chromium
Abra as **Definições** do navegador, depois **Transferências**, e ative **Perguntar onde guardar cada ficheiro antes de o transferir**.
:::

:::firefox
Abra **Definições**, depois **Geral**, e em **Ficheiros e aplicações** escolha **Perguntar sempre onde guardar os ficheiros**.
:::

:::safari
Abra **Safari > Definições > Geral** e defina **Localização de transferência de ficheiros** como **Perguntar em cada transferência**.
:::

Se guardar duas vezes com o mesmo nome, o navegador pode acrescentar um número ao segundo ficheiro, por exemplo `Site (1).civilcraft.json`. Abra o mais recente da próxima vez.

## Online e offline

O CivilCraft funciona apenas no computador em qualquer dos casos: abrir lê o ficheiro no navegador, guardar transfere-o. Para abrir o CivilCraft sem qualquer ligação, guarde-o primeiro para utilização offline:

1. Enquanto estiver ligado, clique em {{ui:Guardar para offline}} na barra de aplicações no topo.
2. O botão mostra o progresso ("A guardar 12 de 30") e depois mostra {{ui:Pronto para offline}}. O CivilCraft é pequeno (cerca de 0.6 MB), por isso isto demora um momento. A cópia guardada inclui esta ajuda e o site de exemplo.
3. Sem ligação, abra o mesmo endereço (ou um marcador dele). Tudo funciona, incluindo {{ui:Abrir o site de exemplo}}.

Os outros estados do botão:

- {{ui:Não foi possível guardar}}: alguns ficheiros não foram transferidos. Verifique a ligação e clique nele para tentar de novo.
- {{ui:Offline indisponível}}: esta janela do navegador não consegue manter uma cópia offline (as janelas privadas e alguns computadores geridos bloqueiam-na). Use uma janela normal.

Clique em {{ui:Pronto para offline}} para ver quando a cópia foi guardada, com duas opções: {{ui:Guardar novamente (obter a versão mais recente)}} e {{ui:Remover a cópia offline}}. Guarde novamente antes de uma visita ao local, para que a cópia corresponda à versão mais recente. Mais em [Offline](common:offline).

:::offline
Está offline neste momento. Se o CivilCraft tiver sido guardado para utilização offline, tudo funciona, incluindo o site de exemplo. Se não, continue a trabalhar neste separador, mas não o recarregue até voltar a estar ligado; sem uma cópia guardada, {{ui:Abrir o site de exemplo}} falha com « O exemplo não pôde ser carregado ».
:::

:::tip
Para utilização no terreno, guarde o CivilCraft para utilização offline e leve os ficheiros de pontos no próprio portátil. Os projetos e as exportações são guardados como transferências sem ligação, por isso pode importar as medições de um dia, verificar a superfície e guardar o projeto no local.
:::

Guardar na nuvem ainda não está disponível, e as versões para computador ainda não foram lançadas. Hoje, os ficheiros que guarda são a única cópia: guarde-os num sítio que tenha cópia de segurança.

## Suplementos que um ficheiro usa

Quando se guarda um projeto que contém dados de um suplemento (as marcações de regulamentos de construção, ou uma fonte de Endereço para o local), o ficheiro regista os suplementos e as respetivas versões. Ao abri-lo num computador que não tenha um deles, uma barra acima da planta indica-o e oferece a sua adição a partir da lista da conta. O registo é apenas uma nota: o ficheiro abre-se de qualquer forma.

## Anular a partir do Studio

Dentro do CadCraft Studio, cada passo concluído no CivilCraft é comunicado ao Studio, para que a anulação ao nível do projeto possa desfazer o último passo entre aplicações. O Studio só anula um passo quando a pilha de anulação do próprio CivilCraft está exatamente como esse passo a deixou; depois de abrir outro ficheiro, ignora esta janela.

## Fechar com alterações não guardadas

Quando o projeto tem alterações não guardadas e se fecha o separador, se recarrega a página ou se sai dela, o navegador pergunta se se pretende sair. O texto e o aspeto pertencem ao navegador e não podem ser alterados pelo CivilCraft. {{ui:Novo}}, e abrir um projeto ou um ficheiro LandXML, pedem antes confirmação na caixa **Alterações não guardadas** do próprio CivilCraft, com {{ui:Cancelar}}, {{ui:Não guardar}} e {{ui:Guardar uma cópia}}.
