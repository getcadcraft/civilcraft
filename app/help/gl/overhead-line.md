---
title: Debuxar unha liña aérea
summary: Coloque apoios no plano, deixe que CivilCraft calcule o papel de cada apoio e os váns entre fins de liña, e mova os apoios no plano ou no perfil da liña.
keywords: liña aérea, apoio, poste, van, sección, fin de liña, ángulo, suspensión, perfil, altura, cruceta, tirante, retenida
from: b8e5e272
---

## Debuxao

1. Teña unha superficie: o terreo baixo a liña vén dela ([Construír unha superficie](topic:build-surface)). Un apoio sen terreo debaixo aparece en **Comprobacións**; escriba o seu **Nivel do terreo** nas Propiedades.
2. Prema {{ui:Line}} no grupo Liñas eléctricas e prema en cada apoio do plano.
3. Faga dobre clic no último, ou prema {{key:Enter}}.

A liña recibe o condutor, o apoio e o equipo que usou por última vez neste ordenador (a primeira vez, exemplos da biblioteca). Cámbieos nas Propiedades.

## A liña nas Propiedades

Seleccione a liña (prema nun van) para fixar o seu **Condutor**, **Condutores por circuíto**, **Circuítos**, **Tensión**, a **Regra de distancia libre** que debe manter sobre o terreo, e o equipo **En cada apoio** (unha cruceta, illadores, accesorios). A táboa lista as súas **seccións**, con o van de regulación de cada unha, a tensión habitual e a hipótese de carga que a rexe.

## Apoios

Prema nun apoio para seleccionalo. Nas Propiedades:

- **Apoio**: o seu elemento da biblioteca. Cando é demasiado débil, Usar … pon o apoio máis pequeno do mesmo material na súa biblioteca que aguanta a carga.
- **Papel**: Automático, Suspensión, Ángulo ou Fin de liña. Automático significa: o primeiro e o último apoio son de fin de liña; un xiro por riba do ángulo da regra fai un apoio de ángulo; un xiro maior, de fin de liña.
- **Altura sobre o terreo**: baleiro toma a altura do elemento da biblioteca (a súa lonxitude menos a profundidade no terreo).
- **Tamén neste apoio**: equipo extra, como un **tirante** (retenida). Un apoio con tirante pasa a tracción da liña ao seu tirante.
- **Apoio existente**: compróbase como os demais pero omítese nas cantidades.

{{ui:Support}} engade un apoio no van máis próximo ao seu clic. Arrastre un apoio no plano para movelo. Eliminar quita un (unha liña conserva polo menos dous).

As seccións van entre fins de liña: dentro dunha sección o condutor corre libremente polas pinzas de suspensión, así que unha tensión mantén toda a sección.

## O perfil da liña

Prema {{ui:Profile}} (ou **Perfil** nas Propiedades da liña). O panel baixo o plano amosa o terreo ao longo da liña, cada apoio desde o terreo ata a súa parte superior, a fase máis baixa do condutor á **Hipótese de carga** que escolla, e a distancia libre que a liña debe manter, como unha liña discontinua. Un van que falla está en vermello; o número baixo cada van é a súa distancia libre mínima.

- **Liña** escolle a liña aérea a amosar. Seleccionar outra liña, ou un dos seus apoios no plano, cambia o perfil a ela.
- Pase o punteiro sobre o perfil: unha guía segue o punteiro, e a etiqueta indica a distancia ao longo da liña, o terreo, o condutor e a distancia libre nese punto (e indica cando a distancia libre está baixo a regra da liña).
- {{ui:Measure}} na barra do perfil: prema dous puntos para obter a distancia horizontal, a diferenza de altura, a distancia recta e a pendente entre eles. Un clic preto do terreo, do condutor ou da parte superior dun apoio encaixa nese punto. Prema de novo {{ui:Measure}} para parar.
- Os obstáculos que a liña cruza érguense desde o terreo: os debuxados como barras, as plantas de Paisaxismo pola súa copa, os muros como barras (vexa [Comprobacións de liñas eléctricas](topic:power-line-checks#clearances)). As rutas de cables e as tubaxes que a liña cruza márcanse baixo o terreo, na súa parte superior, co seu nome.

- Arrastre un apoio de lado para movelo ao longo da liña.
- Arrastre a súa parte superior cara arriba ou abaixo para fixar a súa altura sobre o terreo.
