---
title: Verificar a exportação IFC contra o IDS de um cliente
summary: Carregar o ficheiro .ids que um cliente ou uma autoridade rodoviária entregou e ver, em Problemas, cada elemento exportado que não cumpra.
keywords: ids, especificação de entrega de informação, buildingsmart, requisitos, entrega, verificação, validação, qa, exportação ifc, ifc 4.3, diretriz, estrada, contratação pública
from: 183d9a0e
---

## O que vai fazer

Um IDS (Information Delivery Specification, norma da buildingSMART) é a lista do que um IFC tem de conter. A contratação pública costuma enviar um com a obra. O CivilCraft verifica o IFC que este projeto exporta, na versão IFC escolhida para a exportação, contra esse IDS, e lista cada elemento que fica aquém.

## Passos

1. Abra o projeto.
2. Clique em {{ui:IFC}} no grupo Exportar da barra de ferramentas. Na caixa de diálogo, escolha a versão IFC que vai entregar.
3. Clique em {{ui:Verificar com IDS…}}.
4. Clique em {{ui:Carregar um ficheiro .ids…}} e escolha o ficheiro. Nada é enviado.
5. Leia o resultado: cada especificação com {{ui:Cumpre}} ou {{ui:Falha}} e quantos elementos abrange.
6. Abra Problemas ({{key:Ctrl+Shift+M}}) e clique numa falha para selecionar a diretriz, a plataforma, o coletor, a estrutura ou o volume de edifício de onde vem.

## O que deve ver

- Um aviso por cada elemento exportado e cada requisito que falhe, com o nome da especificação, o que o IDS pede e o que a exportação tem.
- O relatório de verificação (em Problemas) começa pelo IDS: o título, a versão, o autor e a contagem de cada especificação.

## Bom saber

- O IDS fica guardado no ficheiro do projeto, pelo que é verificado de novo ao abrir o projeto. Carregá-lo ou esquecê-lo é um passo que pode anular.
- Cada alteração é verificada de novo pouco depois. As superfícies grandes demoram mais a escrever, pelo que a verificação espera um pouco mais entre execuções.
- A verificação usa o mesmo ficheiro que a exportação {{ui:IFC}} escreve, na versão escolhida por último ali (IFC 4.3 se não tiver escolhido nenhuma).
- Os números são comparados em unidades SI: um projeto em pés é convertido primeiro para metros.

- Os padrões no IDS são lidos como o valor inteiro. Um `^` no início e um `$` no fim também são tomados como «o valor inteiro», como a maioria dos ficheiros IDS os entende.

## Seguinte

- [Exportar IFC](topic:ifc)
