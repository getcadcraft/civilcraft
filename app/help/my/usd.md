---
title: 3D ဆိုဒ်ကို USD အဖြစ် ထုတ်ရန်
summary: 3D view ကို (မျက်နှာပြင်များ၊ မျဉ်းများ၊ alignment များ၊ ပိုက်များနှင့် survey point များ) အမှန်တကယ် စကေးနှင့် အမှန်တကယ် coordinate များဖြင့် USD အဖြစ် ရေးရန်။
keywords: usd, usda, usdc, usdz, openusd, export, 3d, site, surface, alignment, survey points, coordinates, scene assembly
from: e7be08ec
---

3D view တွင် {{ui:USD}} သည် {{ui:GLB}} နှင့် {{ui:OBJ}} ၏ ဘေးတွင် ရှိပြီး view က ပြသသည်ကို USD အဖြစ် ရေးသည်။

1. 3D view ကို ဖွင့်ပြီး ပြသလိုသည်ကို ရွေးပါ။
2. {{ui:USD}} ကို ဖွင့်ပြီး {{ui:Text (.usda)}}၊ {{ui:Binary (.usdc)}} သို့မဟုတ် {{ui:Package (.usdz)}} ကို ရွေးပါ။

ဖိုင်သည် အမှန်တကယ် စကေးဖြင့် ရှိသည် (ဒေါင်လိုက် ကြီးမြှင့်ခြင်းကို ပြန်ဖယ်ထားသည်)၊ metres ဖြင့်၊ Z အပေါ်ဘက်ဖြင့်။ ဆိုဒ်သည် project ၏ easting၊ northing နှင့် elevation တွင် ရှိပြီး project တွင် coordinate system ရှိလျှင် ထိုအမည်ကို ဖော်ပြသည်။ မျက်နှာပြင်များ၊ ပိုက်များနှင့် structure များသည် ၎င်းတို့၏ အရောင်များဖြင့် mesh များ ဖြစ်သည်; contour၊ breakline နှင့် corridor မျဉ်းများသည် မျဉ်းများ ဖြစ်သည်; alignment တစ်ခုစီသည် ၎င်း၏ အမည်အောက်တွင် ကိုယ်ပိုင်မျဉ်းတစ်ကြောင်း ဖြစ်သည်; survey point များသည် ၎င်းတို့၏ နံပါတ်များကို ထိန်းသည်။
