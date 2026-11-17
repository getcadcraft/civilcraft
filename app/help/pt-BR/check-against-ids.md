---
title: Verifique a exportação IFC contra o IDS de um cliente
summary: Carregue o arquivo .ids que um cliente ou uma autoridade rodoviária lhe deu e veja, em Problemas, cada elemento exportado que não atende a ele.
keywords: ids, information delivery specification, buildingsmart, requisitos, entrega, verificação, validação, qa, exportação ifc, ifc 4.3, alinhamento, estrada, licitação
from: 183d9a0e
---

## O que você vai fazer

Um IDS (Information Delivery Specification, um padrão da buildingSMART) é a lista do que um IFC precisa conter. Licitações públicas costumam enviar um com o trabalho. O CivilCraft verifica o IFC que este projeto exporta, na versão IFC que você escolheu para a exportação, contra ele, e lista cada elemento que fica aquém.

## Passos

1. Abra o seu projeto.
2. Clique em {{ui:IFC}} no grupo Exportar da barra de ferramentas. Na caixa de diálogo, escolha a versão IFC que você vai entregar.
3. Clique em {{ui:Verificar com IDS…}}.
4. Clique em {{ui:Carregar um arquivo .ids…}} e escolha o arquivo. Nada é enviado.
5. Leia o resultado: cada especificação com {{ui:Passa}} ou {{ui:Falha}} e em quantos elementos ela se aplica.
6. Abra Problemas ({{key:Ctrl+Shift+M}}) e clique em uma falha para selecionar o alinhamento, a plataforma, o tubo, a estrutura ou a massa de edificação de onde ela veio.

## O que você deve ver

- Um aviso por elemento exportado e requisito que ele não cumpre, com o nome da especificação, o que o IDS pede e o que a exportação tem.
- O relatório de verificação (em Problemas) começa pelo IDS: o título, a versão, o autor e a contagem de cada especificação.

## Bom saber

- O IDS é salvo no arquivo do projeto, então é verificado de novo ao abrir o projeto. Carregá-lo ou esquecê-lo é um passo que você pode desfazer.
- Cada alteração é verificada de novo um momento depois. Superfícies grandes demoram mais para serem gravadas, então a verificação espera um pouco mais entre as execuções.
- A verificação usa o mesmo arquivo que a exportação {{ui:IFC}} grava, na versão escolhida por último ali (IFC 4.3 quando você não escolheu nenhuma).
- Números são comparados em unidades SI: um projeto em pés é convertido para metros antes.

- Padrões no IDS são lidos como o valor inteiro. Um `^` no começo e um `$` no fim também são lidos como "o valor inteiro", como a maioria dos arquivos IDS quer dizer.

## Próximo

- [Exportar IFC](topic:ifc)
