---
title: Mostrar camadas de mapa sob a planta
summary: Coloque uma imagem georreferenciada, ladrilhos de mapa, um servidor WMS ou WMTS ou um serviço de mapas sob a planta como contexto do local, com a configuração de internet, opacidade, ordem e atribuição.
keywords: camadas de mapa, mapa base, plano de fundo, aérea, ortofoto, imagem, satélite, raster, world file, pgw, jgw, tfw, wld, geotiff, imagem georreferenciada, xyz, ladrilhos, mosaico, wms, wmts, getcapabilities, serviço de mapas, rest, mapserver, imageserver, usgs, national map, atribuição, opacidade
from: 32d7718e
---

Camadas de mapa são imagens desenhadas sob o seu projeto: uma foto aérea com o seu world file, ou mapas de servidores da internet. São apenas contexto do local na tela: elas **não** entram nas plotagens em PDF, nas exportações DXF ou DWG, nem na vista 3D.

Clique em {{ui:Map}} no grupo {{ui:GIS}}. A caixa de diálogo **Camadas de mapa** lista as camadas do projeto e adiciona novas. As camadas de mapa precisam do sistema de coordenadas do projeto ([Definir o sistema de coordenadas do projeto](topic:coordinate-systems)), exceto uma imagem cujo world file use as próprias coordenadas do projeto.

## A configuração de internet

O CivilCraft nunca pede nada a um servidor de mapas até que você permita: {{ui:Settings}}, {{ui:CivilCraft}}, **Camadas de mapa da internet**: **Desligado** (o início) ou **Ligado**.

:::note
Quando ligada, o CivilCraft pede aos servidores de mapas que você adicionar as imagens da área na tela. O seu desenho continua neste computador; o servidor vê a área e o seu endereço de internet.
:::

Enquanto estiver desligada, as camadas da internet aparecem na caixa de diálogo em cinza, com o motivo, e nada é desenhado nem solicitado. Abrir um projeto que cita servidores de mapas também não os contata. Uma imagem de arquivo funciona de qualquer forma. O botão {{ui:Open Settings}} da caixa de diálogo leva até lá.

## Uma imagem georreferenciada (funciona offline)

1. Em **Adicionar uma camada**, mantenha **Imagem georreferenciada** e escolha os arquivos: a imagem (PNG ou JPEG) **junto com** o seu world file (`.pgw` para PNG, `.jgw` para JPEG, ou `.wld`) e, se houver, o seu `.prj`. Você também pode soltá-los juntos na planta.
2. Sem `.prj`, o CivilCraft pergunta qual sistema o world file usa: {{ui:The project’s system}} (o mais comum), {{ui:Pick a system…}}, ou, em um projeto sem sistema, **Coordenadas do projeto**.
3. A imagem aparece sob a planta, e {{ui:Fit}} a inclui.

Um GeoTIFF RGB (uma foto aérea salva como GeoTIFF) traz a sua própria posição e sistema: abra-o sozinho. A imagem fica **dentro do arquivo do projeto** (até 25 MB); uma maior é recusada com o seu tamanho, então salve uma cópia menor (menos pixels, ou JPEG).

## Ladrilhos, WMS, WMTS e serviços de mapas

Ative **Camadas de mapa da internet** primeiro. Depois, em **Adicionar uma camada**:

| De | O que colar | O que o CivilCraft faz |
|---|---|---|
| URL de ladrilhos | Um modelo com `{z}`, `{x}` e `{y}` (ou `{-y}`), e `{s}` para a letra de um servidor, por exemplo `https://tile.example.org/{z}/{x}/{y}.png`. Dê um nome e a sua atribuição. | Ladrilhos em web Mercator para a área e o zoom na tela. |
| Servidor WMS | O endereço do servidor, ou o seu link GetCapabilities. Escolha {{ui:Get the layers}}, depois a camada. | Uma imagem da área na tela, pedida no código EPSG do projeto quando o servidor oferece, senão em web Mercator ou WGS 84. |
| Servidor WMTS | O endereço do servidor, ou o seu `WMTSCapabilities.xml`. Escolha {{ui:Get the layers}}, depois a camada e o conjunto de matrizes de ladrilhos. | Ladrilhos do conjunto no sistema do projeto quando há um, senão web Mercator. |
| Serviço de mapas ArcGIS (REST) | Um URL que termina em `/MapServer` ou `/ImageServer`. Escolha {{ui:Read the service}}. | Serviços em web Mercator com cache são desenhados a partir dos seus ladrilhos; os outros recebem um pedido de uma imagem da área na tela. |

Nenhum servidor vem pré-definido. Exemplos públicos, todos do USGS National Map (domínio público):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Serviço de mapas: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (também `USGSImageryOnly` para fotos aéreas)

Muitos departamentos de GIS de cidades e condados publicam os seus próprios WMS ou serviços de mapas; as páginas de GIS deles dão o endereço. Um servidor que pede login ou chave não funciona: o CivilCraft não envia nomes de usuário, senhas nem chaves.

## Como as camadas são desenhadas

- Imagens em outro sistema que o do projeto são deformadas para dentro dele: a imagem é cortada em pedaços, cada um posicionado para ficar a até um quarto de pixel da tela do ponto onde uma conversão exata o colocaria.
- Os ladrilhos são escolhidos para a área na tela e o zoom: nunca mais de 64 por vista, 6 por vez. Ao mover ou dar zoom, as solicitações da vista anterior são canceladas. Cerca de 200 ladrilhos ficam na memória (nada é guardado em disco).
- Uma imagem WMS ou de serviço de mapas é solicitada depois que a vista para de se mover; até a nova chegar, a última permanece no lugar.
- A atribuição de cada camada aparece na tela, em letras pequenas, no canto inferior direito da planta.

## Alterar, ordenar e remover camadas

Na caixa de diálogo, cada camada tem uma caixa de seleção para mostrar ou ocultar, um controle deslizante de **Opacidade**, setas para desenhá-la antes (mais abaixo) ou depois (por cima), um botão de zoom (imagens) e um botão de remover. A primeira camada da lista é desenhada por baixo. Cada alteração é um passo de desfazer.

## Quando uma camada não mostra nada

O motivo aparece uma vez na linha de status e fica sob o nome da camada na caixa de diálogo:

| Mensagem | O que fazer |
|---|---|
| Desligada: as camadas de mapa da internet estão desligadas nas Configurações. | Ligue **Camadas de mapa da internet**. |
| Precisa do sistema de coordenadas do projeto | Defina-o em {{ui:Coordinates}}. |
| O servidor não permitiu que esta página usasse as suas imagens (CORS), ou não foi possível acessá-lo. | O servidor não deixa páginas da web usarem as suas imagens, ou está fora do ar. Após quatro recusas, o CivilCraft para de pedir; oculte e mostre a camada para tentar de novo. |
| O servidor respondeu 404 … / O servidor enviou text/xml, não uma imagem: … | O URL, a camada ou o estilo está errado, ou a mensagem do servidor diz o que ele quer. |
| Esta camada não é oferecida no sistema do projeto, em web Mercator nem em WGS 84 | O servidor não consegue desenhar onde o CivilCraft consegue posicioná-la. |

## O que foi verificado

- Os números dos ladrilhos foram conferidos com a grade padrão de web Mercator; as respostas de WMS 1.1.1 e 1.3.0, WMTS e serviços de mapas foram lidas de arquivos escritos à mão e de respostas reais salvas dos servidores USGS National Map e terrestris OpenStreetMap; os pedidos WMS 1.3.0 colocam a latitude primeiro para EPSG:4326, como manda o padrão.
- A deformação foi comparada com uma conversão exata pixel a pixel usando os números do PROJ: dentro de 0.13 px para ladrilhos, imagens WMS e uma imagem do tamanho de um condado, na escala do local e com zoom afastado.
- Uma imagem com o seu world file e um GeoTIFF RGB escrito pelo GDAL (através do rasterio) foram desenhados onde a posição deles indica, conferido pixel a pixel no navegador.
- No navegador, contra um servidor de teste na máquina de testes: os ladrilhos caem no ladrilho em que o PROJ coloca cada ponto, uma imagem WMS cai a até 2 px, no máximo 6 pedidos rodam por vez, e com a configuração desligada nenhuma solicitação sai da página. O serviço de mapas do USGS National Map acima também foi lido e desenhado ao vivo no navegador uma vez (os ladrilhos chegaram e foram desenhados, com o seu texto de direitos autorais); os outros servidores públicos foram lidos apenas de respostas salvas.
