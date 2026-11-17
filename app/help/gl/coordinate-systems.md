---
title: Definir o sistema de coordenadas do proxecto
summary: Indique en que sistema de coordenadas está o levantamento, para que CivilCraft mostre a latitude e a lonxitude, sitúe os ficheiros GIS e as capas de mapa, e escriba ficheiros .prj. Escolla por código, por nome, polas propias coordenadas ou desde un ficheiro .prj.
keywords: sistema de coordenadas, crs, epsg, srid, plano estatal, spcs, utm, nad83, wgs 84, proxección, prj, wkt, datum, latitude, lonxitude, lat long, xeográfico, cuadrícula, xeorreferencia, asignar sistema de coordenadas
from: 964250e2
---

As coordenadas dun proxecto son simples números ata que indique o que significan. Definir o sistema de coordenadas **non move nada nunca**: indica a CivilCraft que, por exemplo, E 6.150.000 N 2.080.000 son coordenadas do plano estatal da zona 6 de California en pés de agrimensura dos EUA. Unha vez que o sabe:

- a barra de estado mostra a latitude e a lonxitude do punteiro,
- os ficheiros GIS doutros sistemas (shapefiles, GeoJSON, GeoPackage, mallas de altitudes, LiDAR) conviértense ao proxecto ao abrirse,
- as capas de mapa pódense debuxar debaixo do plano ([Mostrar capas de mapa debaixo do plano](topic:map-layers)),
- as exportacións a formatos GIS levan o sistema (un `.prj` para shapefiles, o código EPSG para GeoPackage e GeoTIFF).

## Escoller o sistema

1. Escolla {{ui:Coordenadas}} no grupo {{ui:GIS}} da barra de ferramentas. Ábrese o diálogo **Sistema de coordenadas**. Na parte superior indica en que sistema está o proxecto agora, ou **Ningún — as coordenadas son só números**.
2. Atope o sistema dunha destas formas:
   - **Busca**: escriba o código EPSG (`2277`, `EPSG:2277`) ou palabras do nome (`texas central`, `utm 14n`, `lambert-93`). Co código, a lista comeza polo que escribiu; coas palabras, a lista inclúe os sistemas cuxo nome contén todas as palabras.
   - {{ui:Sistemas aos que se axustan estas coordenadas}} (cando o proxecto ten puntos ou unha superficie): CivilCraft le o centro do proxecto en todos os sistemas da mesma familia de unidades e lista os que teñen a súa zona de uso. As coordenadas do plano estatal adoitan axustarse só a algunhas zonas: un proxecto en Texas en E 3.115.000 N 10.070.000 pés de agrimensura dos EUA axústase ás catro variantes de Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada mostra onde quedaría o centro do proxecto.
   - **Preto de (latitude, lonxitude)** e {{ui:Suxerir}}: escriba onde está o terreo, por exemplo `30.27, -97.74` ou `30°16′N 97°44′W`, e CivilCraft lista os sistemas proxectados que teñen a súa zona, primeiro as cuadrículas nacionais e estatais.
   - {{ui:Ler un ficheiro .prj…}}: abra o `.prj` que acompañaba un shapefile ou un debuxo. CivilCraft compárao coa súa lista polas fórmulas da proxección (así, un `.prj` que nomee un datum de outro xeito aínda atopa o sistema correcto) e indica cal é; cando non coincide exactamente nada, úsase a descrición propia do ficheiro. Tamén pode arrastrar un `.prj` ao diálogo, ou abrilo ou arrastralo ao plano por si só.
3. Prema nun sistema da lista. En **Escollido** móstranse o nome, o código EPSG, a unidade, o axuste do seu datum a WGS 84, a súa zona de uso en latitude e lonxitude, e onde cae o centro do proxecto dentro dela.
4. Deixe seleccionado **Cuadrícula** (a maioría dos proxectos; para as outras opcións, ver [Terreo e coordenadas locais](topic:ground-and-local-coordinates)) e escolla {{ui:Aplicar}}.

A barra de estado mostra agora a latitude e a lonxitude do punteiro xunto a E e N. Definir o sistema é un só paso de desfacer: {{key:Mod+Z}} o desfai.

:::note
As unidades teñen que coincidir: un proxecto en pés admite sistemas en pés de agrimensura dos EUA ou en pés internacionais; un proxecto en metros admite sistemas en metros. CivilCraft explica a negativa («O proxecto está en pés pero este sistema está en metros…»). Un proxecto en pés cun sistema en pé de agrimensura dos EUA usa pés de agrimensura: o «ft» do proxecto significa o pé do sistema. Os sistemas xeográficos (latitude e lonxitude, como o propio WGS 84) non poden ser o sistema dun proxecto: os debuxos precisan coordenadas este e norte.
:::

## Cambiar ou quitar o sistema

Abra de novo {{ui:Coordenadas}}, escolla outro sistema e prema {{ui:Aplicar}}. Cando o proxecto ten puntos ou un deseño, CivilCraft pregunta **As coordenadas xa están en …?**

- {{ui:Si — non se move nada}}: os números quedan como están e só cambia o seu significado. Use esta opción cando o sistema anterior se escolleu por erro.
- {{ui:Non — convértaas}}: cada punto de levantamento, liña de quebra, límite, PI de trazado, esquina de plataforma e estrutura convértese do sistema anterior ao novo, nun só paso de desfacer. Unha superficie lida de LandXML como triángulos non se pode converter; reconstrúa primeiro a partir dos puntos.

{{ui:Quitar o sistema}} elimina o sistema (non se move nada). As capas GIS que xa están no proxecto quedan onde están.

## Latitude e lonxitude na barra de estado

Mentres o proxecto teña un sistema, a barra de estado mostra a latitude e a lonxitude do punteiro en WGS 84, por exemplo `30°18′00.00″ N  97°42′00.00″ W`. Para usar graos decimais, escolla en {{ui:Configuración}}, {{ui:CivilCraft}}, **Latitude e lonxitude** ([Configuración de CivilCraft](topic:settings)). Con coordenadas do terreo ou locais, a lectura pasa antes por ese paso, polo que é correcta para o punto baixo o punteiro.

## Como de boa é a transformación do datum

A latitude, a lonxitude, o GeoJSON e as capas de mapa están todos en WGS 84. A relación de cada sistema con WGS 84 móstrase no diálogo:

| O que di o diálogo | Que significa |
|---|---|
| WGS 84 en si | Ningunha transformación. |
| NAD83 tómase como WGS 84 | Os dous difiren en un ou dous metros na maior parte de Norteamérica, como moito uns metros. Válido para capas de mapa e contexto do terreo; non para o control de levantamento. |
| Coñecido a uns *n* m (cifra de EPSG) | Unha transformación publicada; as capas de mapa e o GeoJSON poden desviarse uns tanto. |
| Non coñecido para este datum | Non hai transformación publicada sen un ficheiro de malla: as capas de mapa e o GeoJSON poden desviarse centos de metros. |
| Do ficheiro de transformación por malla … | Úsase un ficheiro de transformación por malla (abaixo): dentro da malla, a uns 10 cm de NAD83. |

As coordenadas do propio proxecto nunca pasan por unha transformación de datum: só o que se converte desde ou cara a latitude e lonxitude. Os datums verticais e os modelos de xeoide non se tratan (as cotas nunca se converten). Cando a mellor transformación necesita un ficheiro de malla, a lista leva unha transformación publicada máis aproximada e o diálogo mostra a súa precisión (os sistemas NAD27, por exemplo, uns 20 m), ata que engada a malla.

## Ficheiros de transformación por malla

Para un sistema NAD27, **Ficheiro de transformación por malla** no diálogo do sistema de coordenadas sitúa a latitude, a lonxitude, os ficheiros GIS e as capas de mapa a uns 10 cm de NAD83 en lugar de a uns 20 m:

- **Descargar** a malla que suxire para a zona do sistema (NADCON5 para os Estados Unidos continentais, NADCON para Alaska, NTv2 para Canadá) desde cdn.proj.org, o servidor público de mallas de PROJ. Só se envía o nome do ficheiro da malla.
- Ou **Engadir un ficheiro de malla…** que xa teña: NTv2 (`.gsb`) ou unha malla GeoTIFF de PROJ (`.tif`), de ata 20 MB.

A malla gárdase no ficheiro do proxecto, polo que viaxa con el. A sección indica se o centro do proxecto está dentro da malla: fóra dela non se aplica ningunha transformación, así que use unha malla que cubra o terreo. **Deixar de usar a malla** volve á transformación aproximada. Cada cambio é un paso: {{key:Mod+Z}} o desfai.

As capas GIS que xa están no proxecto quedan onde están cando cambia a malla; impórteas de novo para situalas a través da malla. As coordenadas do propio proxecto nunca se moven.

## Que se comprobou

- Cada conversión se comparou con PROJ (pyproj 3.7.1 con PROJ 9.5.1), a biblioteca de coordenadas que usan a maioría dos programas GIS, en máis de 330 sistemas: plano estatal en pés de agrimensura dos EUA e en pés, UTM norte e sur, Lambert-93, British National Grid, GDA2020 MGA, Transversa de Mercator de Nova Zelandia e Mercator web, entre eles. As coordenadas este e norte coinciden ata 1 cm coa mesma transformación de datum (na maioría, moi por debaixo de 1 mm), e as fórmulas de proxección coinciden coas definicións propias de PROJ ata 1 cm.
- Os ficheiros `.prj` escritos por PROJ nas dúas formas habituais (ESRI e OGC) lúronse de novo para 105 sistemas: 208 dos 210 coincidiron co seu código EPSG exacto e os outros dous cun sistema coas mesmas fórmulas no mesmo elipsoide. Os ficheiros `.prj` que escribe CivilCraft PROJ léos como o mesmo sistema. Os ficheiros `.prj` ESRI para sistemas estereográficos polares (UPS, polar de Alaska) non se poden ler; escolla eses sistemas por código.
- A latitude e a lonxitude da barra de estado coincidiron con PROJ ata 0,01″ no navegador.
