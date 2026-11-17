---
title: Chaves de descrición e códigos de liña
summary: Converta os códigos de campo en grupos de puntos con descricións, e una os puntos codificados en liñas (inicio, fin, peche) que se converten en liñas de quebra.
keywords: chaves de descrición, códigos de campo, códigos de liña, figuras, debuxo lineal, inicio, fin, peche, grupos de puntos, códigos, códigos de levantamento, colector de datos, liñas de quebra, bordo, bordo do firme
from: b3d1af8d
---

As cuadrillas de levantamento codifican cada disparo no campo: `EP` para bordo do firme, `TC` para cume do bordo, `BLDG` para unha esquina de edificio. O código é a primeira palabra da descrición do punto. CivilCraft agrupa os puntos por el e converte en liñas os códigos de liña que seguen.

## Códigos de liña

Un código de liña é a palabra que segue inmediatamente ao código de campo:

| Descrición | Significado |
|---|---|
| `EP B` | Comeza unha nova liña de bordo do firme neste punto |
| `EP` | Continúa a liña EP actual |
| `EP E` | Remata a liña EP actual neste punto |
| `BLDG C` | Pecha o edificio: une este punto co primeiro punto da liña |

Os puntos co mesmo código únense pola orde dos seus números. Códigos distintos son liñas distintas aínda que compartan grupo, así que `EP1` e `EP2` dan dous bordos á vez. Un código que nunca usa un código de liña únese por todos os seus puntos, como nas versións anteriores.

As liñas dun grupo usado como **Liña de quebra** convértense en liñas de quebra, unha por liña, de xeito que un bordo con un oco non se estende sobre el. As liñas doutros grupos debúxanse no plano (capa V-NODE-LINE) e saen en DXF, DWG e PDF.

As palabras para inicio, fin e peche son `B`, `BEG`, `START`; `E`, `END`; e `C`, `CLO`, `CLOSE`. Cámbeas, ou desactive os códigos de liña, no diálogo de abaixo.

## Chaves de descrición

Unha chave de descrición converte un código nun grupo de puntos, nun uso e nunha descrición longa.

1. Debaixo de **Puntos**, prema {{ui:Chaves de descrición e códigos de liña}}.
2. Prema {{ui:Engadir unha chave}} e complete a fila:
   - **Código**: o código de campo que hai que coincidir. `*` representa calquera conxunto de caracteres e `?` un só, polo que `EP*` colle EP, EP1 e EP12.
   - **Grupo**: o grupo de puntos ao que se unen estes puntos (baleiro = o propio código). `EP*` co grupo `EP` pon EP1 e EP2 nun mesmo grupo, aínda que sigan sendo liñas separadas.
   - **Uso**: Puntos, Liña de quebra ou Excluír, para cando aparece o grupo por primeira vez (ou déixeo á táboa de **Puntos**).
   - **Descrición**: o nome longo, que se mostra nas **Propiedades** dun punto.
3. A columna **Puntos** conta os puntos que colle cada chave mentres escribe. Gaña a primeira chave que coincide cun código.
4. Prema {{ui:Aplicar}}. Os grupos, a superficie e o plano seguen nun só paso: {{key:Mod+Z}} o desfai.

Un grupo conserva o uso que lle deu na táboa de **Puntos**; o uso dunha chave só o fixa para un grupo novo. As chaves e os códigos de liña gárdanse no ficheiro do proxecto.
