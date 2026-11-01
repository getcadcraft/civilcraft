---
title: Ficheiros que é possível abrir, guardar e exportar
summary: Ficheiros de pontos, LandXML e projetos CivilCraft para importar; projetos, LandXML, DXF e PDF para exportar; o que guarda cada um, onde ficam os ficheiros e o que muda offline.
keywords: abrir, guardar, exportar, importar, formatos de ficheiro, csv, txt, landxml, xml, dxf, pdf, json, transferir, ficheiro de projeto
from: a7debb61
---

O CivilCraft abre ficheiros do computador e guarda-os transferindo-os de volta para o computador. Não é carregado nada e nada fica guardado num servidor. Veja também [Os seus ficheiros](common:your-files).

## O que abre

Clique em {{ui:Abrir}} (ou prima {{key:Mod+O}}) e escolha um ficheiro, ou arraste o ficheiro do {{pick:mac=Finder|windows=Explorador de Ficheiros|linux=gestor de ficheiros}} para a planta. Um ficheiro de cada vez; os ficheiros com mais de 200 MB são recusados.

| Tipo | Nomes de ficheiro | O que acontece |
|---|---|---|
| Ficheiro de pontos | `.csv`, `.txt`, `.pnt`, `.xyz` (qualquer ficheiro de texto) | Abre-se a caixa de diálogo **Importar pontos**. Os pontos substituem os pontos do projeto; os alinhamentos, as plataformas e as tubagens mantêm-se. |
| LandXML | `.xml`, `.landxml` | Cria-se um **novo projeto** a partir do ficheiro (pergunta-se primeiro se o projeto atual tiver alterações não guardadas). |
| Projeto CivilCraft | `.civilcraft.json` (qualquer `.json`) | O projeto abre-se tal como foi guardado (pergunta-se primeiro se o projeto atual tiver alterações não guardadas). |

O CivilCraft decide pela terminação do ficheiro e, depois, pelos primeiros caracteres: o texto que começa por `{` é lido como projeto, o que começa por `<` como LandXML, e tudo o resto como ficheiro de pontos. Um ficheiro que a caixa de abertura mostra a cinzento ainda pode ser largado na planta.

:::note
Importar um ficheiro de pontos para um projeto que já tem pontos substitui-os sem perguntar, e limpa o histórico de anulações (abrir qualquer ficheiro é um começo novo para anular). Se a superfície veio de LandXML, importar pontos volta a transformá-la numa superfície criada a partir dos pontos. Convém guardar primeiro se os pontos antigos puderem ser precisos mais tarde.
:::

Detalhes: [Formatos de ficheiros de pontos](topic:point-file-formats), [LandXML: o que é lido e escrito](topic:landxml-reference).

## O que guarda

{{ui:Guardar}} ({{key:Mod+S}}) escreve dois ficheiros lado a lado, com o nome indicado em **Nome** no painel da esquerda: `<name>.civilcraft.json`, o projeto que continua a editar, e `<name>.ifc`, o mesmo desenho em IFC 4.3 para os restantes programas (ver [Exportação e importação IFC](topic:ifc)). Cada ficheiro regista o outro, e o IFC também leva uma cópia comprimida do projeto, pelo que um IFC enviado sozinho continua a reabrir-se totalmente editável.

- **No Studio** os dois ficheiros são escritos lado a lado, no mesmo sítio.
- **No Chrome e no Edge** o primeiro {{ui:Guardar}} pergunta por uma pasta e escreve os dois ficheiros nela; as vezes seguintes que guardar, vão para a mesma pasta. Cancele a pergunta sobre a pasta para transferir os dois.
- **Noutros navegadores** os dois ficheiros são transferidos, primeiro o ficheiro de projeto.

Abrir qualquer um dos ficheiros procura o outro. Abra os dois em conjunto (ou largue os dois), ou abra apenas um: no Studio o outro é encontrado na mesma pasta; num navegador o CivilCraft pergunta se se pretende adicioná-lo, ou se se prefere continuar apenas com o que se tem. Se o IFC tiver sido alterado por outro programa depois de o CivilCraft o guardar, ou se um dos ficheiros for mais antigo que o outro, o projeto abre-se a partir do desenho mais recente e o painel Problemas explica o que aconteceu, com {{ui:Guardar agora}} (volta a escrever os dois ficheiros) e {{ui:Mostrar a geometria do IFC como referência}}. Um IFC sozinho que outro programa tenha alterado abre-se a partir da cópia do projeto que contém, com o que ainda corresponde: os alinhamentos que foram alterados tomam a geometria desse IFC, os objetos que foram removidos ficam de fora, e as restantes alterações são listadas, não aplicadas. Um ficheiro de projeto anterior à versão 0.7.1 abre-se como antes.

O ficheiro de projeto guarda:

- todos os pontos (número, coordenadas, cota, descrição) e o nome do ficheiro de pontos de onde vieram
- as definições da superfície: escolhas de grupos, linhas de quebra desenhadas, o limite, a aresta exterior mais longa e uma TIN lida de LandXML
- as definições de visualização
- os alinhamentos com os respetivos PI, raios e estaca inicial, os perfis de projeto (PVI e comprimentos de curva) e as definições de corredor
- as plataformas e a rede de tubagens com as respetivas regras

Não guarda o histórico de anulações. As superfícies, curvas de nível, linhas de intersecção do talude e volumes não são guardadas; são recriadas a partir dos dados guardados quando o projeto abre. Um ficheiro de projeto de um CivilCraft mais recente é recusado, com uma mensagem que indica essa versão.

## O que exporta

| Botão | Ficheiro | Conteúdo |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontos, o terreno existente (e a superfície modelada, quando existir) como superfícies TIN, alinhamentos, perfis do terreno e de projeto, a rede de tubagens |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 da linha da planta tal como está visível, em camadas com nome |
| {{ui:DWG}} | `<name>.dwg` | As mesmas linhas como desenho DWG, no formato que escolher (2000 a 2018) |
| {{ui:PDF}} | `<name>.pdf` | Uma impressão vetorial da planta numa folha, à escala que escolher |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da vista 3D) | `<name>-3d.glb`, `<name>-3d.obj` | O que a vista 3D mostra como modelo 3D: metros, Y para cima, escala real, em torno de uma origem local registada |

O que cada um deixa de fora: [Troca de LandXML](topic:landxml), [Exportar a planta para DXF](topic:dxf-export) (DWG também), [Imprimir a planta para PDF](topic:plot-pdf), [Exportar o local em 3D](topic:export-3d).

## Onde ficam os ficheiros

Os ficheiros guardados e exportados vão para onde o navegador põe as transferências, normalmente a pasta Transferências. Para escolher uma pasta de cada vez:

:::chromium
Abra as **Definições** do navegador, depois **Transferências**, e ative **Perguntar onde guardar cada ficheiro antes de transferir**.
:::

:::firefox
Abra as **Definições**, depois **Geral**, e em **Ficheiros e Aplicações** escolha **Perguntar sempre onde guardar os ficheiros**.
:::

:::safari
Abra **Safari > Definições > Geral** e defina **Localização de transferência de ficheiros** como **Perguntar para cada transferência**.
:::

Se guardar duas vezes com o mesmo nome, o navegador pode acrescentar um número ao segundo ficheiro, por exemplo `Site (1).civilcraft.json`. Abra o mais recente da próxima vez.

## Online e offline

Em qualquer dos casos, o CivilCraft funciona apenas no computador: abrir lê o ficheiro no navegador, guardar transfere-o. Para abrir o CivilCraft sem qualquer ligação, guarde-o primeiro para utilização offline:

1. Com ligação, clique em {{ui:Guardar para offline}} na barra da aplicação, no topo.
2. O botão conta à medida que avança ("A guardar 12 de 30") e depois mostra {{ui:Pronto para offline}}. O CivilCraft é pequeno (cerca de 0.6 MB), por isso isto demora um momento. A cópia guardada inclui esta ajuda e o local de exemplo.
3. Sem ligação, abra o mesmo endereço (ou um marcador desse endereço). Tudo funciona, incluindo {{ui:Abrir o local de exemplo}}.

Os outros estados do botão:

- {{ui:Não foi possível guardar}}: alguns ficheiros não foram transferidos. Verifique a ligação e clique nele para tentar de novo.
- {{ui:Offline indisponível}}: esta janela do navegador não consegue manter uma cópia offline (as janelas privadas e alguns computadores geridos bloqueiam-no). Use uma janela normal.

Clique em {{ui:Pronto para offline}} para ver quando a cópia foi guardada, com duas opções: {{ui:Guardar novamente (obter a versão mais recente)}} e {{ui:Remover a cópia offline}}. Volte a guardar antes de uma visita ao local, para que a cópia corresponda à versão mais recente. Mais em [Offline](common:offline).

:::offline
Neste momento, está sem ligação. Se o CivilCraft foi guardado para utilização offline, tudo funciona, incluindo o local de exemplo. Se não foi, continue a trabalhar neste separador, mas não o recarregue enquanto não tiver ligação; sem uma cópia guardada, {{ui:Abrir o local de exemplo}} falha com "The sample could not be loaded".
:::

:::tip
Para uso no terreno, guarde o CivilCraft para utilização offline e leve os ficheiros de pontos para o próprio portátil. Projetos e exportações são guardados como transferências sem ligação, pelo que pode importar os levantamentos de um dia, verificar a superfície e guardar o projeto no local.
:::

O armazenamento na nuvem ainda não está disponível, e as versões para computador ainda não foram lançadas. Por agora, os ficheiros que guarda são a única cópia: guarde-os num local com cópia de segurança.

## Suplementos que um ficheiro usa

Ao guardar um projeto que contém dados de um suplemento (as marcações de regulamentação de edifícios, ou uma fonte de endereço para local), o ficheiro regista quais os suplementos e que versões. Ao abri-lo num computador que não os tenha, uma barra acima da planta indica-o e oferece a possibilidade de os adicionar a partir da lista da conta. O registo é apenas uma nota: o ficheiro abre-se de qualquer forma.

## Anular a partir do Studio

Dentro do CadCraft Studio, cada passo concluído no CivilCraft é comunicado ao Studio, para que a anulação ao nível do projeto possa desfazer o último passo entre aplicações. O Studio só anula um passo quando a pilha de anulações do próprio CivilCraft está exatamente como esse passo a deixou; depois de abrir outro ficheiro, ignora esta janela.

## Fechar com alterações não guardadas

Quando o projeto tem alterações não guardadas e se fecha o separador, se recarrega a página ou se sai dela, o navegador pergunta se se pretende sair. O texto e o aspeto são do navegador e o CivilCraft não os pode alterar. {{ui:Novo}}, e abrir um projeto ou um ficheiro LandXML, pedem confirmação, em vez disso, na caixa **Alterações não guardadas** do próprio CivilCraft, com {{ui:Cancelar}}, {{ui:Não guardar}} e {{ui:Guardar uma cópia}}.
