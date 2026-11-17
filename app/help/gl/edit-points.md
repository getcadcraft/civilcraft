---
title: Editar un punto de levantamento
summary: Cambie o número, as coordenadas, a cota ou a descrición dun punto, ou arrástreo a un novo lugar do plano.
keywords: editar punto, mover punto, cambiar cota, renumerar, número de punto, descrición, arrastrar, norte, este, corrixir un punto, disparo fallido
from: 375ae2e9
---

Un disparo fallido, unha altura de estadal errada, unha descrición mal escrita: corrixa o punto e a superficie séguea.

## Cambiar os valores dun punto

1. Con {{ui:Seleccionar}}, prema o punto no plano. **Propiedades** mostra o seu número, o este, o norte, a cota e a descrición en caixas.
2. Escriba o novo valor e prema {{key:Enter}} (ou faga clic fóra). Deixe **Cota** baleira para un punto sen cota.
3. A superficie, as curvas de nivel e todo o construído sobre elas actualízanse á vez.

Cada cambio é un paso: {{key:Mod+Z}} desfai e {{key:Mod+Y}} refai. Un valor que CivilCraft non pode usar (un número que outro punto xa ten, letras nunha coordenada) recházase: a caixa márcase cun contorno e a barra de estado di por que.

Un novo código de descrición crea un novo grupo de puntos, como o fai unha importación (ver [Construír unha superficie](topic:build-surface)).

## Mover un punto no plano

1. Seleccione o punto (recibe un anel).
2. Arrastre o anel. A barra de estado mostra o este e o norte onde irá.
3. Solte para movelo; a súa cota mantense. Prema {{key:Esc}} antes de soltar para devolvelo ao sitio.

## As liñas de ruptura seguen o punto

Unha liña de ruptura debuxada coa ferramenta {{ui:Liña de ruptura}} copia os puntos polos que pasa. Cando move un punto ou cambia a súa cota, os vértices da liña de ruptura nese punto móvense con el, no mesmo paso. Os grupos de liñas de ruptura creados a partir das descricións reconstrúense sempre a partir dos puntos.

:::note
Unha superficie lida dun ficheiro LandXML conserva os seus propios triángulos: as edicións de puntos só a cambian despois de {{ui:Reconstruír a superficie a partir dos puntos}}.
:::
