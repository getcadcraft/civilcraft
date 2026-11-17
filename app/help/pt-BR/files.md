---
title: Arquivos que você pode abrir, salvar e exportar
summary: Arquivos de pontos, LandXML e projetos do CivilCraft entram; projetos, LandXML, DXF e PDF saem; o que cada um mantém, para onde vão os arquivos e o que muda offline.
keywords: abrir, salvar, exportar, importar, formatos de arquivo, csv, txt, landxml, xml, dxf, pdf, json, baixar, arquivo de projeto
from: 82bff559
---

O CivilCraft abre arquivos do seu computador e salva baixando os arquivos de volta para ele. Nada é enviado e nada fica armazenado em servidor. Veja também [Seus arquivos](common:your-files).

## O que ele abre

Clique em {{ui:Open}} (ou pressione {{key:Mod+O}}) e escolha um arquivo, ou arraste o arquivo de {{pick:mac=Finder|windows=File Explorer|linux=seu gerenciador de arquivos}} para a planta. Um arquivo por vez; arquivos acima de 200 MB são recusados. Um arquivo LandXML ou de projeto acima de 32 MB é lido em partes de cerca de 4 MB, nunca como um único bloco de texto; enquanto um LandXML abre, espere que ele use cerca de 13 vezes o tamanho do arquivo na memória (um arquivo de 69 MB usou cerca de 0.9 GB no nosso teste).

| Tipo | Nomes de arquivo | O que acontece |
|---|---|---|
| Arquivo de pontos | `.csv`, `.txt`, `.pnt`, `.xyz` (qualquer arquivo de texto) | A caixa **Importar pontos** abre. Os pontos substituem os pontos do projeto; alinhamentos, plataformas e tubulações permanecem. |
| LandXML | `.xml`, `.landxml` | Um **novo projeto** é criado a partir do arquivo (você é perguntado antes se o projeto atual tem alterações não salvas). |
| Projeto do CivilCraft | `.civilcraft.json` (qualquer `.json`) | O projeto abre como foi salvo (você é perguntado antes se o projeto atual tem alterações não salvas). |

O CivilCraft decide pela terminação do arquivo e, depois, pelos primeiros caracteres: texto que começa com `{` é lido como projeto, texto que começa com `<` como LandXML, e qualquer outra coisa como arquivo de pontos. Um arquivo que a caixa de abrir deixa esmaecido ainda pode ser arrastado para a planta.

:::note
Importar um arquivo de pontos para um projeto que já tem pontos os substitui sem perguntar, e limpa o histórico de desfazer (abrir qualquer arquivo é um início novo para desfazer). Se a superfície veio de um LandXML, importar pontos a troca de volta para uma superfície criada a partir dos pontos. Salve antes se você puder querer os pontos antigos de volta.
:::

Detalhes: [Formatos de arquivo de pontos](topic:point-file-formats), [LandXML: o que é lido e escrito](topic:landxml-reference).

## O que ele salva

{{ui:Save}} ({{key:Mod+S}}) salva dois arquivos lado a lado, com o nome definido em **Nome** no painel da esquerda: `<name>.civilcraft.json`, o projeto que você continua editando, e `<name>.ifc`, o mesmo desenho em IFC 4.3 para os demais programas (veja [Exportação e importação IFC](topic:ifc)). Cada arquivo registra o outro, e o IFC também traz uma cópia compactada do projeto, de modo que um IFC enviado sozinho ainda reabre totalmente editável.

- **No Studio** os dois arquivos são salvos um ao lado do outro, no mesmo lugar.
- **No Chrome e no Edge** o primeiro Salvar pede uma pasta e grava os dois nela; os salvamentos seguintes vão para a mesma pasta. Cancele a pergunta da pasta para baixar os dois arquivos.
- **Em outros navegadores** os dois arquivos são baixados, o de projeto primeiro.

Ao abrir qualquer um dos arquivos, o outro é procurado. Abra os dois juntos (ou arraste os dois), ou abra apenas um: no Studio o outro é encontrado na mesma pasta; em um navegador o CivilCraft pede que você o adicione, ou permite continuar só com o que você tem. Se o IFC foi alterado por outro programa depois de o CivilCraft tê-lo salvado, ou se um dos arquivos é mais antigo que o outro, o projeto abre a partir do desenho mais recente e o painel Problemas explica o que aconteceu, com **Salvar agora** (grava os dois arquivos de novo) e **Mostrar a geometria do IFC como referência**. Um IFC sozinho que outro programa alterou abre a partir da sua cópia do projeto, com o que ainda combina: alinhamentos que ele mudou assumem a geometria dele, objetos que ele removeu ficam de fora, e o restante das alterações é listado, não aplicado. Um arquivo de projeto anterior à versão 0.7.1 abre como antes.

O arquivo de projeto mantém:

- cada ponto (número, coordenadas, elevação, descrição) e o nome do arquivo de pontos de onde ele veio
- as configurações da superfície: escolhas de grupo, linhas de quebra desenhadas, o contorno, a maior borda externa e um TIN lido do LandXML
- as configurações de exibição
- alinhamentos com seus PIs, raios e estaca inicial, seus perfis de projeto (PVIs e comprimentos de curva) e as configurações de corredor
- plataformas e a rede de tubulações com suas regras

Ele não mantém o histórico de desfazer. Superfícies, curvas de nível, linhas de pé de talude e volumes não são armazenados; são refeitos a partir das entradas salvas quando o projeto abre. Um arquivo de projeto de um CivilCraft mais novo é recusado com uma mensagem que informa a versão dele.

## O que ele exporta

| Botão | Arquivo | Conteúdo |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontos, o terreno natural (e a superfície de terraplenagem, quando existir) como superfícies TIN, alinhamentos, perfis do terreno e de projeto, a rede de tubulações |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 das linhas da planta como estão exibidas, em camadas nomeadas |
| {{ui:DWG}} | `<name>.dwg` | As mesmas linhas como desenho DWG, no formato escolhido (2000 a 2018) |
| {{ui:PDF}} | `<name>.pdf` | Uma plotagem vetorial da planta em uma folha, em uma escala escolhida |
| {{ui:GLB}} ou {{ui:OBJ}} (na barra da visualização 3D) | `<name>-3d.glb`, `<name>-3d.obj` | O que a visualização 3D mostra como modelo 3D: metros, Y para cima, escala real, em torno de uma origem local registrada |

O que cada um deixa de fora: [LandXML de intercâmbio](topic:landxml), [Exportar a planta para DXF](topic:dxf-export) (DWG também), [Plotar a planta em PDF](topic:plot-pdf), [Exportar o site em 3D](topic:export-3d).

## Para onde vão os arquivos

Arquivos salvos e exportados vão para onde o seu navegador coloca os downloads, geralmente a pasta Downloads. Para escolher uma pasta toda vez:

:::chromium
Abra as **Configurações** do navegador, depois **Downloads**, e ative **Perguntar onde salvar cada arquivo antes de baixar**.
:::

:::firefox
Abra **Configurações**, depois **Geral**, e em **Arquivos e aplicativos** escolha **Sempre perguntar onde salvar arquivos**.
:::

:::safari
Abra **Safari > Configurações > Geral** e defina **Local de download de arquivos** como **Perguntar a cada download**.
:::

Se você salvar duas vezes com o mesmo nome, o navegador pode acrescentar um número ao segundo arquivo, por exemplo `Site (1).civilcraft.json`. Abra o mais recente da próxima vez.

## Online e offline

O CivilCraft funciona apenas no seu computador de qualquer forma: abrir lê o arquivo no navegador, salvar o baixa. Para abrir o CivilCraft sem nenhuma conexão, salve-o para uso offline antes:

1. Com conexão, clique em {{ui:Save for offline}} na barra de aplicativos no topo.
2. O botão conta ("Salvando 12 de 30") e depois mostra {{ui:Offline ready}}. O CivilCraft é pequeno (cerca de 0.6 MB), então isso leva um momento. A cópia salva inclui esta ajuda e o site de exemplo.
3. Sem conexão, abra o mesmo endereço (ou um favorito dele). Tudo funciona, incluindo {{ui:Open the sample site}}.

Os outros estados do botão:

- {{ui:Could not save}}: alguns arquivos não foram baixados. Verifique a conexão e clique para tentar de novo.
- {{ui:Offline not available}}: esta janela do navegador não consegue manter uma cópia offline (janelas privadas e alguns computadores gerenciados bloqueiam isso). Use uma janela normal.

Clique em {{ui:Offline ready}} para ver quando a cópia foi salva, com duas opções: {{ui:Save again (get the newest version)}} e {{ui:Remove the offline copy}}. Salve de novo antes de uma visita ao local, para que a cópia corresponda à versão mais recente. Mais em [Offline](common:offline).

:::offline
Você está offline agora. Se o CivilCraft foi salvo para uso offline, tudo funciona, incluindo o site de exemplo. Se não foi, continue trabalhando nesta aba, mas não a recarregue até estar online de novo; sem uma cópia salva, {{ui:Open the sample site}} falha com "The sample could not be loaded".
:::

:::tip
Para uso em campo, salve o CivilCraft para uso offline e leve seus arquivos de pontos no próprio notebook. Projetos e exportações são salvos como downloads sem conexão, então você pode importar as medições do dia, conferir a superfície e salvar o projeto no local.
:::

O salvamento na nuvem ainda não está disponível, e os aplicativos para desktop ainda não foram lançados. Hoje, os arquivos que você salva são a única cópia: mantenha-os em um lugar que tenha backup.

## Complementos usados por um arquivo

Quando você salva um projeto que tem dados de um complemento (as marcações de regulamentos de construção, ou uma fonte de Endereço para o local), o arquivo registra quais complementos e quais versões. Abra-o em um computador que não tenha um deles e uma barra acima da planta avisa e oferece adicioná-lo pela lista da sua conta. O registro é apenas uma nota: o arquivo abre de qualquer forma.

## Desfazer a partir do Studio

Dentro do CadCraft Studio, cada etapa que você conclui no CivilCraft é informada ao Studio, para que o desfazer no nível do projeto possa desfazer a última etapa entre os aplicativos. O Studio só desfaz uma etapa quando a pilha de desfazer do próprio CivilCraft está exatamente como essa etapa a deixou; depois que você abre outro arquivo, ele ignora esta janela.

## Fechando com alterações não salvas

Quando o projeto tem alterações não salvas e você fecha a aba, recarrega a página ou sai dela, o navegador pergunta se você quer sair. A redação e a aparência dessa pergunta são do navegador e não podem ser alteradas pelo CivilCraft. {{ui:New}} e abrir um projeto ou arquivo LandXML pedem confirmação na caixa **Alterações não salvas** do próprio CivilCraft, com {{ui:Cancel}}, {{ui:Don’t save}} e {{ui:Save a copy}}.
