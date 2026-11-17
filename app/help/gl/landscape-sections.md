---
title: Seccións de paisaxismo e conxunto de publicación
summary: Liñas de sección que cortan o terreo existente e o proposto, muros con cimentacións, pavimentos e capas de formación das áreas plantadas, escaleiras e plantas en tamaño adulto, en follas propias; un único conxunto de publicación cunha lista de follas, un PDF e un DWG por folla.
keywords: sección, corte transversal, alzado, marcador de sección, liña de sección, publicar, conxunto de follas, lista de follas, rexistro de debuxos, conxunto PDF, DWG por folla
from: 7271ac50
---

{{ui:Levels}} › {{ui:Section line}}: prema no inicio e no final. As seccións nómanse A, B, C… (cambíelles o nome en Propiedades). Unha sección debuxa, ao longo da súa liña:

- o terreo existente (tracexado) e o terreo proposto;
- os muros cos seus cimentos, onde a liña os cruza;
- as capas de pavimento e de sendeiro, e o cuberto e a terra vexetal das áreas plantadas (despois do recorte), colgando por debaixo da superficie acabada;
- as escaleiras en perfil;
- as plantas a menos da distancia establecida da liña, como siluetas en tamaño adulto.

Propiedades fixa esa distancia e unha esaxeración vertical. No diálogo Follas, **Seccións** pón as seccións nas súas propias follas, ata catro por folla, cada unha a unha escala estándar que cabe.

## O conxunto de publicación

{{ui:Publish set (.zip)}} no diálogo Follas fai, nun único .zip:

- un PDF que abre coa **lista de follas** e despois cada folla de paisaxismo, numerada L-1, L-2… (plantación, movemento de terras, rego, detalles, seccións, follas de cálculo);
- un **DWG por cada folla de planta** coas capas desa folla (os nomes `L-*` mantéñense) e un DWG por cada debuxo de sección.

Cada liña de sección do plano indica en que folla está (`A / L-5`); o número calcúlase a partir do conxunto cada vez, así que engadir, eliminar ou renomear seccións renumera as follas.
