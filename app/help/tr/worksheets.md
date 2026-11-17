---
title: Çalışma sayfaları: nesnelere bağlı listeler
summary: Bitkilerden, ekili alanlardan, kaplamadan, duvarlardan, basamaklardan, zemin değiştiricilerden ya da tüm miktarlardan satırları olan kayıtlı çalışma sayfaları; kendi sütunlarınız ve formülleriniz, gruplarınız ve toplamlarınız; CSV, XLSX ve sayfalardaki bir tablo, her zaman güncel.
keywords: çalışma sayfası, liste, bitki listesi, sert zemin listesi, miktarlar, sütunlar, formül, toplam, toplama, sayım, grup, filtre, csv, xlsx, elektronik tablo, sayfadaki tablo
from: 11bc1bac
---

{{ui:Çalışma sayfaları}} (Peyzaj › Daha fazla) bu projenin çalışma sayfalarını açar. İlk kez açıldığında **bitki listesi** ve **sert zemin ve alan listesi** sizin için oluşturulur. Bir çalışma sayfası, her gösterildiğinde, yazdırıldığında ya da bir sayfaya konulduğunda nesnelerden yeniden hesaplanır: bir yatağı değiştirin, sayıları her yerde değişir.

- **Satırlar kaynağı**: bitkiler (tür, çeşit ve boyut başına bir satır), ekili alanlar, kaplama, duvarlar, basamaklar, zemin değiştiriciler (kazı ve dolgu) ya da tüm miktarlar.
- **Sütunlar**: bir alan (`qty`, `area`, `botanical` ya da `[Net area]` gibi köşeli parantez içinde bir ad) ya da bir formül: `+ - * / ^ %`, metni birleştirmek için `&`, `= <> < <= > >=` ve `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Hesaplanamayan bir formül, hücresinde `#ERR` (ya da `#DIV/0`) gösterir. Formüller CadCraft'ın kendi ayrıştırıcısı tarafından okunur; içlerindeki hiçbir şey kod olarak çalıştırılmaz.
- Her sütun için **Toplam** (toplam, sayı, ortalama, en küçük, en büyük), **Grupla** (her grup için ara toplamlar) ve **Yalnızca şu satırlar**.
- {{ui:CSV olarak kaydet}}, {{ui:XLSX olarak kaydet}} ve **Bu çalışma sayfasını sayfalara koy** (Sayfalar › Çalışma sayfaları, bunu bir tablo olarak çizer; gerektiği kadar sayfaya yayılır).

Bitkilerdeki ve alanlardaki etiketler aynı alan adlarını okur (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
