---
title: Intercambiar LandXML
summary: Abra LandXML doutro software civil como proxecto novo, exporte puntos, superficies, trazados, perfís e a rede de tubaxes como LandXML 1.2, e coñeza o que non viaxa.
keywords: landxml, xml, importar, exportar, intercambio, tin, superficie, trazado, perfil, rede de tubaxes, interoperabilidade, intercambio de datos
from: 870d5ece
---

LandXML é o formato de intercambio aberto que a maioría dos programas civís len e escriben. CivilCraft lee e escribe LandXML 1.2. Se usou Civil 3D, os seus diálogos de importación e exportación de LandXML son o máis parecido; aquí non hai opcións que tomar, e as notas indícanlle o que se deixou fóra.

## Abrir un ficheiro LandXML

1. Prema {{ui:Open}} (ou prema {{key:Mod+O}}) e escolla o ficheiro `.xml` ou `.landxml`, ou solteo sobre o plano.
2. Se o proxecto actual ten cambios sen gardar, CivilCraft pregunta primeiro. Escolla {{ui:Save a copy}}, {{ui:Don’t save}} ou {{ui:Cancel}}.
3. Créase un **proxecto novo**. A barra de estado indica o que se leu, por exemplo "Aberto site.xml: 412 puntos, 2 superficies, 3 trazados."
4. Mire a caixa baixo os datos da **Superficie**. Lista todo o que se omitiu ou cambiou, por exemplo:
   - "Só se abriu a primeira superficie ("EG"); o ficheiro ten 1 máis."
   - "O trazado "Rampa A" ten elementos que CivilCraft aínda non pode debuxar (non son liñas, arcos nin espirais clotoides); omitiuse."
   - "As regras da rede de tubaxes non estaban no ficheiro; en uso están os valores provisionais; estableza os seus en Proxecto."

Que se converte en que:

| No ficheiro | En CivilCraft |
|---|---|
| Unidades (Imperial ou Metric) | As **Unidades** do proxecto (pés ou metros) |
| Nome do proxecto | O **Nome** do proxecto |
| CgPoints | Os puntos do proxecto; a descrición (ou o código) indica o grupo |
| A primeira superficie TIN | O terreo existente, usado tal cal ("Superficie (desde LandXML)") |
| Cada trazado de liñas, arcos e espirais clotoides | Un trazado cos seus PI, radios e lonxitudes de espiral reconstruídos desde as curvas |
| O primeiro perfil de deseño de cada trazado | O seu perfil de deseño, con curvas verticais parabólicas |
| A primeira rede de tubaxes | A rede de tubaxes, cos seus bordos, sumidoiros e cotas de fondo |
| Liñas de elemento de liñas e arcos | Liñas de elemento, con arcos conservados; desde outro programa empezan como **Só debuxada** |

A lista completa de elementos e atributos está en [LandXML: o que se lee e se escribe](topic:landxml-reference).

:::note
Unha superficie lida desde LandXML non se reconstrúe cando cambia os grupos de puntos ou cando debuxa liñas de rotura. Prema {{ui:Rebuild the surface from the points}} na sección **Superficie** para construíla a partir dos puntos ({{key:Mod+Z}} devolve a superficie LandXML).
:::

## Exportar LandXML

1. Prema {{ui:LandXML}} no grupo **Exportar**.
2. O navegador descarga `<nome>.xml`. A barra de estado indica o que se incluíu, por exemplo "Exportado LandXML 1.2: 276 puntos, 2 superficies, 1 trazado, a rede de tubaxes. As plataformas non forman parte de LandXML aquí; si a superficie nivelada."

O ficheiro contén:

- **Unidades**: pés de levantamento dos EUA ou metros.
- **CgPoints**: cada punto co seu número como nome, a súa descrición e o seu grupo como código.
- **Superficies**: o terreo existente como TIN, coas súas liñas de rotura e o límite exterior como datos de orixe; e, cando as plataformas ou os corredores nivelan, unha segunda superficie TIN chamada "Proposed".
- **Trazados**: liñas, arcos e espirais clotoides coas súas estacións, cada un cun perfil que conserva o terreo existente mostrado ao longo del e o perfil de deseño (PVI e curvas parabólicas) cando ten polo menos dous PVI.
- **PipeNetworks**: estruturas cos seus bordos, sumidoiros e cota de fondo por tubaxe, e as tubaxes con diámetro, lonxitude e pendente.
- **PlanFeatures**: cada liña de elemento como liñas e arcos, coa elevación en cada extremo e para que se usa.

## O que non viaxa

- Plataformas e corredores como obxectos. O seu resultado está na superficie "Proposed".
- Trazados con erros (por exemplo, curvas que se solapan): déixanse fóra e cóntanse na mensaxe de estado.
- Tubaxes sen as dúas cotas de fondo, e redes con menos de dúas estruturas.
- Un bordo tomado da superficie escríbese como bordo fixo. Ao abrilo de novo, a estrutura conserva ese número aínda que cambie a superficie.
- Regras de rede (pendente mínima, recubrimento, caída): LandXML non ten lugar para elas.
- Axustes de visualización e opcións de superficie dos grupos de puntos: para iso, garde un proxecto de CivilCraft.

Ao abrir, CivilCraft non lee espirais distintas de clotoide, superficies de cuadrícula, puntos que só remiten a outros puntos, parcelas, espirais en liñas de planta, vías ou datos de levantamento. Cada un indícase nas notas, nunca se adiviña.

## Ida e volta

Para entregar traballo a alguén que usa outro software civil e recuperalo, exporte LandXML, deixe que o edite e abra o seu LandXML como proxecto novo. Conserve tamén o seu `.civilcraft.json`: é o único ficheiro que garda todo o que CivilCraft sabe.
