---
title: Arquivos para abrir, salvar e exportar
summary: Entrada de arquivos de pontos, LandXML e projetos do CivilCraft; saída de projetos, LandXML, DXF e PDF; o que cada um mantém, para onde vão os arquivos e o que muda offline.
keywords: abrir, salvar, exportar, importar, formatos de arquivo, csv, txt, landxml, xml, dxf, pdf, json, baixar, arquivo de projeto
from: a7debb61
---

O CivilCraft abre arquivos do seu computador e salva baixando os arquivos de volta para ele. Nada é enviado e nada fica armazenado em um servidor. Veja também [Seus arquivos](common:your-files).

## O que ele abre

Clique em {{ui:Abrir}} (ou pressione {{key:Mod+O}}) e escolha um arquivo, ou arraste o arquivo de {{pick:mac=Finder|windows=Explorador de Arquivos|linux=seu gerenciador de arquivos}} para a planta. Um arquivo por vez; arquivos acima de 200 MB são recusados.

| Tipo | Nomes de arquivo | O que acontece |
|---|---|---|
| Arquivo de pontos | `.csv`, `.txt`, `.pnt`, `.xyz` (qualquer arquivo de texto) | A caixa de diálogo **Importar pontos** é aberta. Os pontos substituem os pontos do projeto; alinhamentos, plataformas e tubos permanecem. |
| LandXML | `.xml`, `.landxml` | Um **novo projeto** é criado a partir do arquivo (antes, o programa pergunta se o projeto atual tem alterações não salvas). |
| Projeto CivilCraft | `.civilcraft.json` (qualquer `.json`) | O projeto abre como foi salvo (antes, o programa pergunta se o projeto atual tem alterações não salvas). |

O CivilCraft decide pela terminação do arquivo e, depois, pelos primeiros caracteres: texto que começa com `{` é lido como projeto, texto que começa com `<` como LandXML, e qualquer outra coisa como arquivo de pontos. Um arquivo que aparece em cinza na caixa de abertura ainda pode ser arrastado para a planta.

:::note
Importar um arquivo de pontos para um projeto que já tem pontos os substitui sem perguntar, e limpa o histórico de desfazer (abrir qualquer arquivo começa um novo histórico para desfazer). Se a superfície veio de LandXML, importar pontos a volta a ser uma superfície construída a partir dos pontos. Salve primeiro se talvez quiser os pontos antigos de volta.
:::

Detalhes: [Formatos de arquivo de pontos](topic:point-file-formats), [LandXML: o que é lido e gravado](topic:landxml-reference).

## O que ele salva

{{ui:Salvar}} ({{key:Mod+S}}) grava dois arquivos lado a lado, com o nome definido em **Nome** no painel esquerdo: `<name>.civilcraft.json`, o projeto que continua sendo editado, e `<name>.ifc`, o mesmo projeto em IFC 4.3 para os demais programas (veja [Exportação e importação IFC](topic:ifc)). Cada arquivo registra o outro, e o IFC também traz uma cópia compactada do projeto, de modo que um IFC enviado sozinho ainda pode ser reaberto totalmente editável.

- **No Studio**, os dois arquivos são gravados lado a lado, no próprio local.
- **No Chrome e no Edge**, o primeiro Salvar pede uma pasta e grava os dois nela; os salvamentos seguintes vão para a mesma pasta. Cancele a pergunta da pasta para baixar os dois.
- **Em outros navegadores**, os dois arquivos são baixados, o do projeto primeiro.

Ao abrir qualquer um dos dois, o programa procura o outro. Abra os dois juntos (ou arraste os dois), ou abra apenas um: no Studio, o outro é encontrado na mesma pasta; em um navegador, o CivilCraft pergunta se deve adicioná-lo ou se deve seguir apenas com o que está disponível. Se o IFC foi alterado por outro programa depois que o CivilCraft o salvou, ou se um dos arquivos é mais antigo que o outro, o projeto abre a partir do desenho mais recente e o painel Problemas informa o que aconteceu, com **Salvar agora** (grava os dois arquivos de novo) e **Mostrar a geometria do IFC como referência**. Um IFC sozinho que outro programa alterou abre a partir da sua cópia do projeto, com o que ainda corresponde: os alinhamentos alterados assumem a geometria dele, os objetos que ele removeu são deixados de fora, e o restante das alterações é listado, mas não aplicado. Um arquivo de projeto anterior à versão 0.7.1 abre como antes.

O arquivo de projeto guarda:

- cada ponto (número, coordenadas, elevação, descrição) e o nome do arquivo de pontos de onde vieram
- as configurações da superfície: escolhas de grupo, linhas de quebra desenhadas, o contorno, a aresta externa mais longa e uma TIN lida de LandXML
- as configurações de exibição
- alinhamentos com seus PIs, raios e estaca inicial, seus perfis de projeto (PVIs e comprimentos de curva) e as configurações de corredor
- plataformas e a rede de tubulações com suas regras

Ele não guarda o histórico de desfazer. Superfícies, curvas de nível, linhas de pé de talude e volumes não são armazenados; são reconstruídos a partir dos dados salvos quando o projeto abre. Um arquivo de projeto de uma versão mais nova do CivilCraft é recusado, com uma mensagem que informa a versão.

## O que ele exporta

| Botão | Arquivo | Conteúdo |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontos, o terreno existente (e a superfície terraplenada, quando houver) como superfícies TIN, alinhamentos, perfis do terreno e de projeto, a rede de tubulações |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 das linhas da planta como estão exibidas, em camadas nomeadas |
| {{ui:DWG}} | `<name>.dwg` | As mesmas linhas como um desenho DWG, no formato escolhido (2000 a 2018) |
| {{ui:PDF}} | `<name>.pdf` | Uma plotagem vetorial da planta em uma folha, em uma escala escolhida |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da visualização 3D) | `<name>-3d.glb`, `<name>-3d.obj` | O que a visualização 3D mostra como modelo 3D: metros, Y para cima, escala real, em torno de uma origem local registrada |

O que cada um deixa de fora: [Intercâmbio LandXML](topic:landxml), [Exportar a planta para DXF](topic:dxf-export) (DWG também), [Plotar a planta em PDF](topic:plot-pdf), [Exportar o local em 3D](topic:export-3d).

## Onde os arquivos ficam

Arquivos salvos e exportados vão para onde o seu navegador coloca os downloads, geralmente a pasta Downloads. Para escolher uma pasta toda vez:

:::chromium
Abra as **Configurações** do navegador, depois **Downloads**, e ative **Perguntar onde salvar cada arquivo antes de baixar**.
:::

:::firefox
Abra **Configurações**, depois **Geral**, e em **Arquivos e aplicativos** escolha **Sempre perguntar onde salvar arquivos**.
:::

:::safari
Abra **Safari > Configurações > Geral** e defina **Local de download de arquivo** como **Perguntar a cada download**.
:::

Se salvar duas vezes com o mesmo nome, o navegador pode acrescentar um número ao segundo arquivo, por exemplo `Site (1).civilcraft.json`. Da próxima vez, abra o mais recente.

## Online e offline

O CivilCraft funciona apenas no seu computador de qualquer forma: abrir lê o arquivo no navegador, e salvar o baixa. Para abrir o CivilCraft sem nenhuma conexão, salve-o para uso offline primeiro:

1. Com conexão, clique em {{ui:Salvar para uso offline}} na barra superior do aplicativo.
2. O botão conta ("Salvando 12 de 30") e depois mostra {{ui:Pronto para uso offline}}. O CivilCraft é pequeno (cerca de 0.6 MB), então isso leva um momento. A cópia salva inclui esta ajuda e o local de exemplo.
3. Sem conexão, abra o mesmo endereço (ou um favorito dele). Tudo funciona, incluindo {{ui:Abrir a implantação de exemplo}}.

Os outros estados do botão:

- {{ui:Não foi possível salvar}}: alguns arquivos não foram baixados. Verifique a conexão e clique nele para tentar de novo.
- {{ui:Offline indisponível}}: esta janela do navegador não consegue manter uma cópia offline (janelas privativas e alguns computadores gerenciados bloqueiam isso). Use uma janela normal.

Clique em {{ui:Pronto para uso offline}} para ver quando a cópia foi salva, com duas opções: {{ui:Salvar de novo (obter a versão mais recente)}} e {{ui:Remover a cópia offline}}. Salve de novo antes de uma visita ao local, para que a cópia corresponda à versão mais recente. Mais em [Offline](common:offline).

:::offline
Não há conexão no momento. Se o CivilCraft foi salvo para uso offline, tudo funciona, incluindo o local de exemplo. Se não foi, continue trabalhando nesta aba, mas não a recarregue até voltar a ter conexão; sem uma cópia salva, {{ui:Abrir a implantação de exemplo}} falha com a mensagem "O exemplo não pôde ser carregado".
:::

:::tip
Para uso em campo, salve o CivilCraft para uso offline e leve os arquivos de pontos no próprio notebook. Projetos e exportações são salvos como downloads sem conexão, então é possível importar as leituras do dia, verificar a superfície e salvar o projeto no local.
:::

O armazenamento na nuvem ainda não está disponível, e as versões para desktop ainda não foram lançadas. Hoje, os arquivos salvos são a única cópia: mantenha-os em um lugar com backup.

## Complementos usados por um arquivo

Quando um projeto é salvo com dados de um complemento (as caixas de seleção de Regulamentos de construção, ou uma fonte Endereço para local), o arquivo registra quais complementos e quais versões. Ao abri-lo em um computador sem algum deles, uma barra acima da planta avisa e oferece adicioná-lo pela lista da conta. O registro é apenas uma nota: o arquivo abre de qualquer forma.

## Desfazer no Studio

Dentro do CadCraft Studio, cada etapa concluída no CivilCraft é informada ao Studio, para que o desfazer em nível de projeto possa desfazer a última etapa entre os aplicativos. O Studio só desfaz uma etapa quando a pilha de desfazer do próprio CivilCraft está exatamente como essa etapa a deixou; depois que outro arquivo é aberto, ele ignora esta janela.

## Fechar com alterações não salvas

Quando o projeto tem alterações não salvas e a aba é fechada, a página é recarregada ou a página é deixada, o navegador pergunta se a saída deve ser confirmada. O texto e a aparência dessa pergunta são do navegador, e o CivilCraft não pode alterá-los. {{ui:Novo}}, assim como abrir um projeto ou um arquivo LandXML, pede confirmação na caixa **Alterações não salvas** do próprio CivilCraft, com {{ui:Cancelar}}, {{ui:Não salvar}} e {{ui:Salvar uma cópia}}.
