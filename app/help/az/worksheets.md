---
title: İş cədvəlləri: obyektlərə bağlı cədvəllər
summary: Bitkilərdən, əkilmiş sahələrdən, döşəmədən, divarlardan, pillələrdən, torpaq dəyişdiricilərindən və ya bütün miqdarlardan sətirli saxlanılmış iş cədvəlləri; öz sütunlarınız və düsturlarınız, qruplar və cəmlər; CSV, XLSX və vərəqlərdə cədvəl, həmişə yenilənən.
keywords: iş cədvəli, cədvəl, bitki cədvəli, abadlaşdırma cədvəli, miqdarlar, sütunlar, düstur, cəm, say, qrup, filtr, csv, xlsx, cədvəl, vərəqdə cədvəl
from: 11bc1bac
---

{{ui:İş cədvəlləri}} (Abadlaşdırma › Daha çox) bu layihənin iş cədvəllərini açır. İlk dəfə **bitki cədvəli** və **döşəmə və sahələr cədvəli** sizin üçün hazırlanır. İş cədvəli hər dəfə göstərildikdə, yazıldıqda və ya vərəqə qoyulduqda obyektlərdən yenidən hesablanır: bir yatağı dəyişdirsəniz, onun saylar hər yerdə dəyişir.

- **Sətirlər mənbəyi**: bitkilər (hər növ, sort və ölçü üçün bir sətir), əkilmiş sahələr, döşəmə, divarlar, pillələr, torpaq dəyişdiriciləri (kəsmə və doldurma) və ya bütün miqdarlar.
- **Sütunlar**: sahə (`qty`, `area`, `botanical` və ya `[Net area]` kimi mötərizədə ad) və ya düstur: `+ - * / ^ %`, mətni birləşdirmək üçün `&`, `= <> < <= > >=`, və `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Hesablanmayan düstur öz xanasında `#ERR` (və ya `#DIV/0`) göstərir. Düsturları CadCraft-ın öz analizatoru oxuyur; onlardan heç nə kod kimi işlənmir.
- Hər sütun üzrə **Cəm** (cəm, say, orta, ən kiçik, ən böyük), **Qrupla** (hər qrup üzrə aralıq cəmlər) və **Yalnız bu sətirlər** (şərt).
- {{ui:CSV kimi saxla}}, {{ui:XLSX kimi saxla}} və **Bu iş cədvəlini vərəqlərə qoy** (Vərəqlər › İş cədvəlləri onu cədvəl kimi çəkir, lazım olan qədər vərəqdə).

Bitkilərdə və sahələrdə etiketlər eyni sahə adlarını oxuyur (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
