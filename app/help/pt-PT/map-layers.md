---
title: Mostrar camadas de mapa sob a planta
summary: Coloque uma imagem georreferenciada, mosaicos de mapa, um servidor WMS ou WMTS ou um serviço de mapas sob a planta como contexto do terreno, com a definição da internet, a opacidade, a ordem e a atribuição.
keywords: camadas de mapa, mapa base, fundo, fotografia aérea, ortofotografia, imagens, satélite, raster, ficheiro de mundo, pgw, jgw, tfw, wld, geotiff, imagem georreferenciada, xyz, tiles, mapa slippy, wms, wmts, getcapabilities, serviço de mapas, rest, mapserver, imageserver, usgs, national map, atribuição, opacidade
from: 32d7718e
---

As camadas de mapa são imagens desenhadas por baixo do seu desenho: uma fotografia aérea com o seu ficheiro de mundo, ou mapas de servidores da internet. São apenas contexto do terreno no ecrã: **não** entram nas impressões PDF, nas exportações DXF ou DWG, nem na vista 3D.

Escolha {{ui:Mapa}} no grupo {{ui:SIG}}. A caixa de diálogo **Camadas de mapa** lista as camadas do projeto e adiciona novas. As camadas de mapa precisam do sistema de coordenadas do projeto ([Definir o sistema de coordenadas do projeto](topic:coordinate-systems)), exceto uma imagem cujo ficheiro de mundo use as coordenadas do próprio projeto.

## A definição da internet

O CivilCraft nunca pede nada a um servidor de mapas enquanto não o permitir: {{ui:Definições}}, {{ui:CivilCraft}}, **Camadas de mapa a partir da internet**: **Desligado** (predefinição) ou **Ligado**.

:::note
Quando estiver ligado, o CivilCraft pede aos servidores de mapas que adicionar imagens da área no ecrã. O seu desenho fica neste computador; o servidor vê a área e o seu endereço de internet.
:::

Enquanto estiver desligado, as camadas da internet aparecem na caixa de diálogo, mas a cinzento, com o motivo, e não se desenha nem se pede nada. Abrir um projeto que indique servidores de mapas também não os contacta. Uma imagem de um ficheiro funciona de qualquer forma. O botão {{ui:Abrir Definições}} da caixa de diálogo leva-o até lá.

## Uma imagem georreferenciada (funciona offline)

1. Em **Adicionar uma camada**, mantenha **Imagem georreferenciada** e escolha os ficheiros: a imagem (PNG ou JPEG) **juntamente com** o seu ficheiro de mundo (`.pgw` para PNG, `.jgw` para JPEG, ou `.wld`) e, se existir, o seu `.prj`. Também pode arrastá-los para a planta em conjunto.
2. Sem `.prj`, o CivilCraft pergunta que sistema usa o ficheiro de mundo: {{ui:The project’s system}} (o mais comum), {{ui:Pick a system…}}, ou, num projeto sem sistema, **Coordenadas do projeto**.
3. A imagem aparece sob a planta e {{ui:Fit}} inclui-a.

Um GeoTIFF RGB (uma fotografia aérea guardada como GeoTIFF) tem a sua própria colocação e sistema: abra-o sozinho. A imagem fica **dentro do ficheiro de projeto** (até 25 MB); uma maior é recusada com o seu tamanho, pelo que deve guardar uma cópia mais pequena (menos pixels, ou JPEG).

## Mosaicos, WMS, WMTS e serviços de mapas

Ligue primeiro **Camadas de mapa a partir da internet**. Depois, em **Adicionar uma camada**:

| A partir de | O que colar | O que o CivilCraft faz |
|---|---|---|
| URL de mosaicos | Um modelo com `{z}`, `{x}` e `{y}` (ou `{-y}`), e `{s}` para a letra de um servidor, por exemplo `https://tile.example.org/{z}/{x}/{y}.png`. Dê-lhe um nome e a sua atribuição. | Mosaicos em web Mercator para a área e o zoom no ecrã. |
| Servidor WMS | O endereço do servidor, ou a sua ligação GetCapabilities. Escolha {{ui:Get the layers}}, depois a camada. | Uma imagem da área no ecrã, pedida no código EPSG do projeto quando o servidor o oferece; caso contrário em web Mercator ou WGS 84. |
| Servidor WMTS | O endereço do servidor, ou o seu `WMTSCapabilities.xml`. Escolha {{ui:Get the layers}}, depois a camada e o conjunto de matrizes de mosaicos. | Mosaicos do conjunto no sistema do projeto quando existe, caso contrário em web Mercator. |
| Serviço de mapas ArcGIS (REST) | Um URL que termine em `/MapServer` ou `/ImageServer`. Escolha {{ui:Read the service}}. | Os serviços em web Mercator com cache são desenhados a partir dos seus mosaicos; os outros pedem uma imagem da área no ecrã. |

Nenhum servidor vem predefinido. Exemplos públicos, todos do USGS National Map (domínio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Serviço de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (também `USGSImageryOnly` para fotografias aéreas)

Muitos departamentos SIG das câmaras municipais publicam os seus próprios WMS ou serviços de mapas; as páginas de SIG dão o endereço. Um servidor que peça um início de sessão ou uma chave não funciona: o CivilCraft não envia nomes de utilizador, palavras-passe nem chaves.

## Como as camadas são desenhadas

- As imagens num sistema diferente do projeto são deformadas para ele: a imagem é cortada em partes, cada uma colocada de modo a ficar a menos de um quarto de pixel do ecrã do sítio onde uma conversão exata a põe.
- Os mosaicos são escolhidos para a área no ecrã e para o zoom: nunca mais de 64 por vista, 6 de cada vez. Ao deslocar a vista ou fazer zoom, os pedidos da vista anterior são cancelados. Cerca de 200 mosaicos são mantidos em memória (nada é guardado em disco).
- Uma imagem WMS ou de serviço de mapas é pedida quando a vista deixar de se mover; até chegar, a última mantém-se no lugar.
- A atribuição de cada camada no ecrã aparece em pequeno, no canto inferior direito da planta.

## Alterar, ordenar e remover camadas

Na caixa de diálogo, cada camada tem uma caixa de verificação para a mostrar ou ocultar, um cursor de **Opacidade**, setas para a desenhar mais cedo (por baixo) ou mais tarde (por cima), um botão de zoom (imagens) e um botão de remoção. A primeira camada da lista é desenhada por baixo. Cada alteração é um único passo de anulação.

## Quando uma camada não mostra nada

O motivo aparece uma vez na linha de estado e fica por baixo do nome da camada na caixa de diálogo:

| Mensagem | O que fazer |
|---|---|
| "Desligado: as camadas de mapa da internet estão desligadas nas Definições." | Ligue **Camadas de mapa a partir da internet**. |
| "Precisa do sistema de coordenadas do projeto." | Defina-o em {{ui:Coordenadas}}. |
| "O servidor não permitiu que esta página usasse as suas imagens (CORS), ou não foi possível contactá-lo." | O servidor não deixa as páginas web usarem as suas imagens, ou está em baixo. Após quatro recusas, o CivilCraft deixa de pedir; oculte e mostre a camada para tentar de novo. |
| "O servidor respondeu 404 …" / "O servidor enviou text/xml, e não uma imagem: …" | O URL, a camada ou o estilo estão errados, ou a mensagem do servidor indica o que pretende. |
| "Esta camada não é oferecida no sistema do projeto, em web Mercator nem em WGS 84." | O servidor não consegue desenhar onde o CivilCraft a pode colocar. |

## O que foi verificado

- Os números dos mosaicos foram verificados contra a numeração padrão de mosaicos web Mercator; as respostas WMS 1.1.1 e 1.3.0, WMTS e de serviços de mapas foram lidas de ficheiros escritos à mão e de respostas reais guardadas dos servidores USGS National Map e terrestris OpenStreetMap; os pedidos WMS 1.3.0 põem a latitude em primeiro lugar para EPSG:4326, como a norma indica.
- A deformação foi comparada com uma conversão exata, pixel a pixel, usando os números do PROJ: dentro de 0.13 px para mosaicos, imagens WMS e uma imagem com a dimensão de um concelho, à escala do terreno e com zoom para fora.
- Uma imagem com o seu ficheiro de mundo e um GeoTIFF RGB escrito pelo GDAL (através do rasterio) foram desenhados onde a sua colocação indica, verificados pixel a pixel no navegador.
- No navegador, contra um servidor de substituição no computador de teste: os mosaicos caem no mosaico em que o PROJ coloca cada ponto, uma imagem WMS cai a menos de 2 px, no máximo 6 pedidos correm de cada vez, e com a definição desligada nenhum pedido sai da página. O serviço de mapas do USGS National Map acima também foi lido e desenhado em direto no navegador uma vez (os seus mosaicos chegaram e foram desenhados, com o texto de direitos de autor); os outros servidores públicos foram lidos apenas a partir de respostas guardadas.
