---
title: Líneas de rasgo
summary: Ojapo línea 3D ojerádi vértice-pe vértice, paso desplazamiento escalonado, ha oiporu terreno línea de quiebre térã pendiente plataforma diseño-pe.
keywords: arco, curva, radio, arco 3D, hélice, cordón curvo, superposición de pendiente, superposición de elevación, flechas de pendiente, línea de rasgo, pendiente, elevación, desplazamiento escalonado, desplazamiento, línea de quiebre, cordón, zanja, berma, plataforma pendiente, corte y relleno, movimiento de suelo, polilínea 3D
from: d55b25fb
---

Línea de rasgo peteĩ línea elevación cada vértice-pe: cordón, zanja flujo línea, berma tope, plataforma pendiente borde. Elevaciones número térã pendiente-pe emoĩ, copia lado-pe paso arriba térã abajo-pe, ha superficies-kuéra mba'éichapa oiporu eleguá.

## Dibujar una

1. Eleguá **Superficie** › {{ui:Más}} › {{ui:Línea de rasgo}}, térã ejepe'a {{key:L}}.
2. Ejepe'a vértice-kuéra plano-pe. Punto relevamiento-pe ejepe'a punto lugar ha elevación oguereko; ambue lugar-pe vértice terreno existente elevación oguereko.
3. Ejepe'a {{key:Enter}} línea abierta tapaiñe, térã ejepe'a primero vértice jey ha cerrá.

Línea pyahu eleguá ha oñepyrũ terreno existente línea de quiebre, terreno ruguére.

## Arcos

Segmento plano arco ikatu, punta elevaciones ambue-ambue-pe: cordón esquina, zanja curva, ramp ojeaprovecha. Pendiente arco-pe pareje oguahẽ, ha longitud curva-pe medida.

- **Dibujando:** ejepe'a {{key:C}} (pantalla táctil-pe, {{ui:Arco}} barra plano ykére) arco ojapo hag̃ua. Vértice rire, ejepe'a punto curva-pe, upéi arco fin lugar-pe. Ejepe'a {{key:C}} jey segmento recto-pe. {{key:Backspace}} punto curva-pe ojehe'ỹ primero.
- **Después:** **Propiedades**-pe, radio emoĩ ha dirección vértice **Arco** cuadro-pe, por ejemplo `50 L` térã `50 R` (izquierda térã derecha línea recorrida-pe), ha ejepe'a {{key:Enter}}. Cuadro ndaipóri, segmento recto jey. Radio segmento mitad gui menor ndojeporúi.

Eleguáva línea ohechauka arco radio grado ruguére. **Longitud** arcos plano-pe; **Longitud 3D** elevación subida ha bajada avei. Desplazamientos escalonados arcos oguereko: curva afuera crece, adentro achica, ha desplazamiento arco centro rupi ndojeporúi.

Superficies, 3D vista, DXF ha DWG arco cada uno ro corta recta-kuéra pedazo-pe oguereko, curva-pe 0.01 ryepýpe. LandXML arco oguereko ambue-ambue (ver **Arcos en otros archivos** abajo).

## Fijar elevaciones y pendientes

**Propiedades** vértice-kuéra ohechauka línea gui distancia, **Elevación** ha **Pendiente al siguiente** (porcentaje). Emoĩ peteĩ térã ambue ha ejepe'a {{key:Enter}}:

- Elevación peteĩ vértice ñemboguejy.
- Pendiente segmento fin-pe elevación ojapo; sigo vértice ohóvo ojeguahẽ, upéi siguiente segmento pendiente oñemboguejy.

Ambue **Propiedades**-pe:

| Acción | Mba'e ojapo |
|---|---|
| **Subir o bajar todo en** | Emoĩ altura vértice-kuéra ryepýpe ohupyty. |
| {{ui:Cotas desde el terreno}} | Vértice-kuéra terreno existente ryepýpe (superficie ndaipórã ojeguahẽ ohendu oĩ). |
| {{ui:Una pendiente, primero gui último peve}} | Primero ha último elevación ojekuaa, ha ryepýpe vértice pareje pendiente-pe. |

Eleguáva línea elevación vértice-kuéra ha pendiente segmento-kuéra plano-pe ohechauka. Vértice eipyso {{ui:Seleccionar}}-gui; elevación oĩ.

## Desplazamientos escalonados

**Desplazamiento escalonado** ruguére, emoĩ **Distancia** (positivo línea dirección derecha-pe, negativo izquierda-pe), upéi altura (arriba térã abajo) térã pendiente porcentaje-pe, ha ejepe'a {{ui:Omoĩ línea desplazada}}. Copia peteĩ pyahu línea de rasgo: por ejemplo cordón atrás 0.5 pie costado-pe ha 0.5 pie yvateve-pe, térã zanja borde 6 pie afuera 2 %-pe. Distancia copia curva estrecha-pe ijyvate ndoiporúi.

## Pendientes y elevaciones en la pantalla

Ejepe'a {{key:E}}, térã **Pendientes y elevaciones en líneas de rasgo** **Visualización**-pe, cada línea de rasgo pendiente segmento-pe (flecha pequeña yvy ro'y pe) ha vértice-pe elevación ohechauka. Pantalla-pe ohechauka: nada ndojeporúi dibujo-pe, PDF, DXF ha DWG peteĩ-peteĩ. Segmento ikiri ha vértice mbyto ndojehecha zoom ojekuaáramo. Eleguáva línea ipropio pendiente ha elevación ohechauka.

## En la vista de perfil

Línea de rasgo alineación-pe ojehe'a ha perfil vista-pe ohechauka, nombre ha elevación cruce-pe; línea oñepyrũ ambue ohechauka avei hag̃ua. Ver [Diseñar un perfil vertical](topic:profile).

## Qué hacen las superficies con ella

Eleguá **Usar**:

| Uso | Mba'e ojapo |
|---|---|
| Línea de quiebre del terreno existente | Terreno existente línea elevación-pe, dibujada línea de quiebre haguéicha. |
| Modelada en el diseño | **Cerrada** línea plataforma pendiente-pe ojapo: superficie proyectada ryepýpe borde-pe modelada. Eleguá **Luz hasta el terreno** corte ha relleno pendiente (horizontal 1 vertical) borde-gui terreno-pe, plataforma haguéicha; peteĩ-peteĩ pendiente borde elevación-pe oñepyrũ. |
| Solo dibujada | Plano-pe oĩ ha DXF, DWG ha PDF-pe oñeguarda (capa C-GRAD-FEAT, polilíneas 3D), superficies ndojehecha. |

Volúmenes, cortes ha 3D vista línea de rasgo modelada diseño-pe oguereko, plataforma haguéicha. Peteĩ-peteĩ cambio peteĩ paso: {{key:Mod+Z}} oheja hikuái.

## Compartir líneas con tu equipo

CadCraft Studio-pe nube archivo-gui ojehe'a dibujo-pe, equipo plan-pe, proyecto Propiedades (nada eleguáva) **Equipo** sección ohechauka {{ui:Líneas del equipo…}}: equipo ojeguerekóva compartidas líneas, cada una revisión ndive, línea de rasgo primero eleguáramo. Línea eleguá compartir, revisión pyahu oguahẽ, equipo oguahẽ, térã compartir omboty. Ko configuración ndoguerekóramo, sección mba'e oipota oĩ.

## Arcos en otros archivos

| Archivo | Mba'e oiko arcos oguereko línea de rasgo-pe |
|---|---|
| Proyecto CivilCraft | Ojeguarda ojehecha haguéicha. |
| LandXML | Plano línea rasgo haguéicha líneas arcos ha elevaciones ndive oñeguarda, arcos ndive oguahẽ. Ambue programa línea de rasgo **Solo dibujada**-pe oguahẽ: superficie-pe oike hag̃ua **Usar** eleguá. |
| DWG ha DXF | 3D polilínea arco ndoguerekói, upévare arco cada uno curva 0.01 ryepýpe pedazo-kuéra-pe oñeguarda. CivilCraft dibujo-pe ohechauka mba'e pedazo arco ojapo: dibujo línea-pe ojehe'a jave, {{ui:Líneas de rasgo}} arcos ndive línea de rasgo-pe omboguejy. Ambue programa ohecha ordinario 3D polilínea. |
