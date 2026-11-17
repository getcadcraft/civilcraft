---
title: Abastecemento de auga: presións, caudais e caudal de incendio
summary: Debuxe no plano unha rede de presión de nós, embalses, tanques, tubaxes, bombas e válvulas reductoras de presión; CivilCraft calcula as alturas, as presións e os caudais (Hazen–Williams, redes malladas), o caudal dispoñible para un incendio e un día de demanda. Función de laboratorio; cada resultado precisa a comprobación dun enxeñeiro.
keywords: auga, abastecemento, rede de abastecemento, rede de presión, tubaxe a presión, rede mallada, hazen-williams, coeficiente C, perda de carga, presión residual, caudal de incendio, boca de incendio, demanda, nó, embalse, tanque, bomba, curva da bomba, válvula reductora de presión, prv, válvula de retención, período estendido, epanet, inp, velocidade
from: df46bf6d
---

O abastecemento de auga é o lado de presión dun sitio: tubaxes sempre cheas, coa auga empuxada por un embalse, un tanque ou unha bomba. CivilCraft calcula a altura e a presión en cada nó e o caudal en cada tubaxe, incluídas as redes malladas, nas que a auga ten máis dun camiño. Está no laboratorio mentres se comproba.

**Só unha axuda de cálculo.** Cada número precisa a comprobación dun enxeñeiro cualificado: a resposta só vale tanto como as demandas, as cotas, os tamaños de tubaxe e os valores de rugosidade que lle deu, e un modelo en réxime permanente non sabe nada de golpe de ariete, calidade da auga ou o comportamento real dunha bomba de incendio.

## Debuxar a rede

1. En **Superficie** › {{ui:Máis}}, escolla {{ui:Abastecemento de auga…}}. A ventá queda aberta mentres traballa no plano.
2. Escolla {{ui:Embalse}} e prema no plano onde está o subministro. A súa altura comeza 100 ft (30 m) por enriba do terreo; cámbiea en Propiedades.
3. Escolla {{ui:Nó}} e prema en cada lugar onde se saca auga ou onde se encontran tubaxes. Un nó toma a súa cota do terreo; escriba outra en Propiedades para substituíla.
4. Escolla {{ui:Tubaxe}}, prema un nó e despois o nó ao que se une. A ferramenta mantense activa para a seguinte tubaxe. Unha {{ui:Bomba}} e unha {{ui:Válvula reductora de presión}} debúxanse igual, desde o nó de succión (ou augas arriba) ata o nó de impulsión (ou augas abaixo). Un {{ui:Tanque}} colócase como un nó.
5. Seleccione un nó e escriba a súa {{ui:Demanda}} (gpm, ou L/s nun proxecto en metros). Seleccione unha tubaxe e estableza o seu {{ui:Diámetro}} (in, ou mm) e, se o coñece, o seu coeficiente C de Hazen–Williams.

Cada cambio é un paso de desfacer. Suprimir elimina o nó e as tubaxes que terminan nel.

## Que significa cada parte

- **Tubaxe.** A lonxitude mídese ao longo do plano, salvo que a escriba. C é a rugosidade de Hazen–Williams (130 para empezar; cambie o valor por defecto na ventá). Un coeficiente de perda menor K engade as perdas de curvas e accesorios. Marque **Válvula de retención** nunha tubaxe que non debe deixar pasar a auga cara atrás; unha tubaxe **Pechada** non transporta nada.
- **Embalse.** Unha fonte cunha altura fixa, o nivel de auga que mantén por riba do datum. Dá ou toma o que precise a rede.
- **Tanque.** Un nivel que cambia ao longo do día. Nos resultados en réxime permanente é unha fonte no seu nivel actual.
- **Bomba.** Un punto de deseño (caudal e altura) dá a curva habitual que pasa por el: a altura con caudal cero é o 133 % da altura de deseño, e a altura é cero co dobre do caudal de deseño. Unha bomba nunca empurra a auga cara atrás.
- **Válvula reductora de presión.** Mantén a presión que fixa augas abaixo mentres o subministro é máis alto. Cando o subministro é máis baixo, está aberta e non mantén nada; se a auga fose cara atrás, pecha.

## Ler os resultados

A ventá mostra a altura e a presión de cada nó e o caudal, a velocidade e a perda de carga por cada 1 000 ft (ou por km) de cada ligazón, cos nós coloreados no plano: verde entre a presión mínima e a máxima que fixou, vermello por baixo, ámbar por riba. As frechas de caudal mostran o sentido. Seleccione un nó ou unha tubaxe para ler os seus números en Propiedades.

Debaixo das táboas hai unha lista do que hai que mirar: presión baixa ou alta, unha tubaxe máis rápida que o seu límite, un nó cortado de todas as fontes, ou un cálculo que non converxeu. As mesmas conclusións están no panel de Problemas. Os límites establéceos na ventá (20 psi, 100 psi e 10 ft/s para empezar; 140 kPa, 700 kPa e 3 m/s nun proxecto en metros).

## Caudal de incendio

{{ui:Caudal de incendio…}} debuxa un caudal nun nó e mostra a presión alí e a presión máis baixa en calquera punto da rede. Tamén calcula o caudal dispoñible nese nó mentres o nó máis débil da rede mantén a presión residual que indique. As demais demandas quedan como están.

## Un día de demanda

{{ui:Un día de demanda…}} executa a rede hora a hora. Indique o patrón de demanda nos axustes do ficheiro (unha lista de multiplicadores que se repite); os tanques énchense e baléiranse co caudal que entra e sae, e unha bomba pode seguir un patrón de conexión e desconexión. Un tanque que chega ao seu nivel máis alto ou máis baixo sinálase na lista: CivilCraft non pecha a súa entrada nin a súa saída por vostede, así que lea iso como "este tanque é demasiado pequeno ou a bomba demasiado grande".

## Texto EPANET

{{ui:Gardar como texto EPANET (.inp)}} escribe a rede no formato de texto plano que lle en moitos programas de auga, e {{ui:Abrir texto EPANET (.inp)…}} lee un. Só pasa o que CivilCraft modela: nós, embalses, tanques, tubaxes, bombas con curva de altura, válvulas reductoras de presión, patróns de demanda e os tempos. Os demais tipos de válvula, as bombas dadas por potencia e as outras fórmulas de perda de carga figuran por nome e quedan fóra. O ficheiro debe usar as mesmas unidades que o proxecto.

## Bocas de incendio, válvulas e accesorios

Seleccione un nó e marque **Boca de incendio** para colocar unha alí; seleccione unha canle e prema **Engadir no medio** para colocar unha válvula, unha válvula de aire, un desaugadoiro ou un contador. Son obxectos da rede: móvense con ela e un paso de desfacer elimínaos.

A traza implica tamén accesorios, e CivilCraft listaos sen que llo pidan: un **te** onde se encontran tres canles, unha **cruz** onde se encontran catro, unha **curva** (co seu ángulo) onde dúas canles xiran 5° ou máis, un **reductor** onde se encontran dous tamaños, e un **tapón** nun fin morto. {{ui:Cuadro de accesorios (CSV)}} conta os accesorios e as canles por tamaño. Isto é o que implica a traza: unha medición que debe comprobar cos seus propios detalles, non unha lista para pedir.

As canles tenden a ir ao terreo menos unha cobertura (4 ft ou 1,2 m) para poder debuxalas e modelalas en 3D; as presións de arriba non dependen nunca dela.

## No plano e nos ficheiros

O plano, o PDF e o DWG ou DXF levan as canles na capa **C-WATR-MAIN** cos seus tamaños na capa **C-WATR-TEXT**, as bocas de incendio na capa **C-WATR-HYDR**, as válvulas na capa **C-WATR-VALV** e os accesorios na capa **C-WATR-FITT**. A exportación a LandXML escribe unha rede de tubaxes de auga (unha estrutura por cada nó, unha tubaxe por cada canle, bocas de incendio con nome); a importación de LandXML lee unha de volta como abastecemento de auga, sen demandas, bombas nin válvulas, que LandXML non leva. A exportación a IFC escribe as canles como segmentos de tubaxe, bocas de incendio, válvulas e accesorios nun só sistema de auga. Estes ficheiros comprobáronse co noso lector e escritores; próbeos nos seus outros programas e dígannos que din.

## O que aínda non está

Calidade e idade da auga, controis e regras máis aló do patrón de conexión e desconexión dunha bomba, outros tipos de válvula, demanda en función da presión, tubaxes con diámetro variable, e caudais de saneamento ao longo do tempo. Vexa [Aínda non construído](topic:not-built-yet). Os caudais de deseño sanitario, que son outro cálculo, están en [Caudais de deseño sanitario](topic:sanitary-design).
