/**
 * Ocak 2026 ehliyet sınav soruları - ehliyet.io ve mebehliyetsinavsorulari kaynaklarından alınmıştır.
 */

import type { RawQuestion } from '@/data/ehliyetSorulari';

export const ocak2026Sorulari: RawQuestion[] = [
  // --- 1 Ocak 2026 ---
  {
    question:
      'Merkezi sinir sisteminde uyuşturucu etki, beyindeki frenleme ve karar verme yeteneğinin bozulması, alkol miktarının artması ile duyarlılığın artması. Yukarıdakilerden hangileri kişide alkole bağlı olarak gelişmektedir?',
    options: {
      a: '1 ve 2',
      b: '1 ve 3',
      c: '2 ve 3',
      d: '1, 2 ve 3',
    },
    answer: 'd',
    categoryId: 'trafikadabi',
  },
  {
    question: 'Lastik üzerinde yazan rakamlar (155x60x14) hangisiyle ilgilidir?',
    options: {
      a: 'Lastik desenleri',
      b: 'Lastik ömrü',
      c: 'Lastik ebatları',
      d: 'Lastik türü',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question: 'Aracın kısa farları yakıldığında gösterge panelinde ne renk ışık yanar?',
    options: { a: 'Sarı', b: 'Mavi', c: 'Yeşil', d: 'Kırmızı' },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question:
      'Aşağıdakilerden hangisi trafik psikolojisinin hedeflerindendir?',
    options: {
      a: 'Trafik kültürünün ve güvenlik bilincinin gelişmesine katkıda bulunmak',
      b: 'Trafik kazalarına neden olabilecek riskli davranışlar kazandırmak',
      c: 'Bireye, aile yapısına ve diğer insanlara zarar vermek',
      d: 'Stresli olarak araç kullanmayı teşvik etmek',
    },
    answer: 'a',
    categoryId: 'trafikadabi',
  },
  {
    question: 'Aşağıdakilerin hangisinde şok pozisyonu vermek sakıncalıdır?',
    options: {
      a: 'Bacağında kanama olanlarda',
      b: 'El bileğinde açık kırık olanlarda',
      c: 'Tansiyonu düşük ve nabız alınamayanlarda',
      d: 'Burnundan ve kulağından kanama olanlarda',
    },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question: 'Bacakta turnike uygulama bölgesi neresidir?',
    options: {
      a: 'Diz ile kalça arası',
      b: 'Ayak bileğinin alt kısmı',
      c: 'Ayak bileğinin üst kısmı',
      d: 'Diz kapağının olduğu bölge',
    },
    answer: 'a',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Sürücülerin iniş eğimli bir yolda aşağıdakilerden hangisini yapması yasaktır?',
    options: {
      a: 'Düşük hızla seyretmesi',
      b: 'Çıkışta kullandığı vitesle inmesi',
      c: 'Hız azaltmak için frene basması',
      d: 'Motorun çalışmasını durdurup vitesi boşa alarak inmesi',
    },
    answer: 'd',
    categoryId: 'trafik',
  },
  {
    question:
      'Duyu organlarının hiçbir uyarana tepki veremeyecek şekilde fonksiyonlarını yitirmesiyle beliren uzun süreli bilinç kaybı hâli aşağıdakilerden hangisidir?',
    options: { a: 'Şok', b: 'Bayılma', c: 'Koma', d: 'Kansızlık' },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Kamyon, kamyonet ve römorklarda yükle birlikte yolcu taşınırken aşağıdakilerden hangisinin yapılması yasaktır?',
    options: {
      a: 'Yüklerin bağlanması',
      b: 'Yolcuların yüklerin üzerine oturtulması',
      c: 'Kasanın yan ve arka kapaklarının kapatılması',
      d: 'Yolcuların kasa içinde ayrılmış bir yere oturtulması',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Aşağıdakilerden hangisi Karayolları Trafik Kanunu\'na göre sürücü olabilmenin şartlarından biri değildir?',
    options: {
      a: 'Bir meslek sahibi olmak',
      b: 'Belirli bir eğitim seviyesine sahip olmak',
      c: 'Kullanacağı araca göre belirli bir yaşın üzerinde olmak',
      d: 'Sürücülük yapmaya uygun olduğunu gösterir sağlık raporu almak',
    },
    answer: 'a',
    explanation:
      'Karayolları Trafik Kanunu\'na göre sürücü olabilmek için belirli eğitim, yaş ve sağlık raporu gerekir; meslek sahibi olmak şart değildir.',
    categoryId: 'trafik',
  },
  {
    question:
      'Geceleyin, görüşün yeterli olmadığı kavşağa yaklaşan sürücü gelişini nasıl haber vermelidir?',
    options: {
      a: 'Birkaç defa selektör yaparak',
      b: 'Acil uyarı ışıklarını yakarak',
      c: 'Birkaç defa korna çalarak',
      d: 'Dönüş ışıklarını yakarak',
    },
    answer: 'a',
    categoryId: 'trafik',
  },
  {
    question:
      'Kaza sonrası solunum durması, yangın tehlikesi, patlama gibi tehlikeli durumların olasılığı mevcut ise kazazedenin omuriliğine zarar vermeden araçtan çıkarılmasında kullanılan teknik aşağıdakilerden hangisidir?',
    options: {
      a: 'Rentek manevrası',
      b: 'İtfaiyeci yöntemi ile omuzda taşıma',
      c: 'Ayak bileklerinden sürükleme yöntemi',
      d: 'Koltuk altından tutarak sürükleme yöntemi',
    },
    answer: 'a',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Bir araç sürücüsünün kendini geçmekte olan bir araca yavaşlayarak kolaylık sağlaması durumu trafikte hangi değer ile ifade edilir?',
    options: {
      a: 'Bencillik',
      b: 'Feragat',
      c: 'Diğerkâmlık',
      d: 'Sorumsuzluk',
    },
    answer: 'b',
    categoryId: 'trafikadabi',
  },
  {
    question:
      'Araçta yanmış bir sigortayı daha yüksek amperli bir sigortayla değiştirmek ya da telle sarmak aşağıdakilerden hangisine neden olabilir?',
    options: {
      a: 'Bujinin daha iyi ateşlemesine',
      b: 'Farların daha canlı yanmasına',
      c: 'Akünün daha çabuk bitmesine',
      d: 'Elektrik tesisatının yanmasına',
    },
    answer: 'd',
    categoryId: 'motor',
  },
  {
    question:
      'Taşıt yollarını veya yol bölümlerini birbirinden ayıran, bir taraftaki taşıtların diğer tarafa geçmesini engelleyen veya zorlaştıran karayolu yapısı, trafik tertibatı veya gerece ne denir?',
    options: { a: 'Ada', b: 'Ayırıcı', c: 'Şerit', d: 'Banket' },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Egzoz emisyon ölçümünün yapılması, araçların çevreye verdiği zararlardan hangisini önlemeye yönelik bir uygulamadır?',
    options: {
      a: 'Görüntü kirliliğini',
      b: 'Gürültü kirliliğini',
      c: 'Hava kirliliğini',
      d: 'Su kirliliğini',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question:
      'Aracın periyodik bakımı yapılırken aşağıdakilerden hangisinin değiştirilmemesi araç motorunun çalışmasını olumsuz etkiler?',
    options: {
      a: 'Fren balatasının',
      b: 'Polen filtresinin',
      c: 'Yakıt filtresinin',
      d: 'Geri vites müşirinin',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question:
      'Kazazedenin durumu değerlendirilirken yaşam bulgularının var veya yok olması yapılacak müdahaleler için önem taşımaktadır. Buna göre, aşağıdakilerden hangisi kazazedenin yaşam bulguları içerisinde yer alır?',
    options: { a: 'Yaşı', b: 'Boyu', c: 'Cinsiyeti', d: 'Vücut ısısı' },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Aksine bir durum yoksa saatte 100 kilometre hızla seyreden bir sürücü, önündeki araca en fazla kaç metre yaklaşabilir?',
    options: { a: '20', b: '30', c: '40', d: '50' },
    answer: 'd',
    categoryId: 'trafik',
  },
  {
    question:
      'Sürücüler neden ilk yardım bilgi ve becerisine sahip olmalıdır?',
    options: {
      a: 'Trafikteki kaza sayısını azaltmak için',
      b: 'Sağlık personeli niteliğini kazanmak için',
      c: 'Hastaları iyileştirici tıbbi tedaviyi uygulamak için',
      d: 'Kazalarda hayat kurtarıcı ilk müdahaleyi yapılabilmek için',
    },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Aksine bir işaret bulunmadıkça, otoyolda otomobiller için azami hız saatte kaç kilometredir?',
    options: { a: '110', b: '120', c: '100', d: '130' },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Aşağıdakilerden hangisi, kan şekeri aniden düştüğünde görülen belirtilerden biri değildir?',
    options: { a: 'Titreme', b: 'Zindelik', c: 'Yorgunluk', d: 'Aniden Acıkma' },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Bir kaza anında, yapılan ilk yardım uygulamaları ile ilgili olarak aşağıdakilerden hangisi doğru değildir?',
    options: {
      a: 'Mevcut araç-gereçlerle yapılması',
      b: 'Hayat kurtarıcı uygulamalar olması',
      c: 'Olay yerinde bulunan kişiler tarafından yapılması',
      d: 'Müdahale için doktor ya da sağlık personelinin beklenmesi',
    },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Kalp atımları alınamayan yetişkin bir insana, göğüs kemiğine uygulanan baskı ne kadar çökme sağlamalıdır?',
    options: { a: '3 cm', b: '4 cm', c: '5 cm', d: '6 cm' },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question: 'Turnike en fazla kaç saat uygulanabilir?',
    options: { a: '4 saat', b: '3 saat', c: '2 saat', d: '1 saat' },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Aşağıdakilerden hangisi "park etme" kuralıdır?',
    options: {
      a: 'Araçta bir gözcü bulundurmak',
      b: 'Aracın anahtarını park görevlilerine teslim etmek',
      c: '5 dakikayı geçmeyecek şekilde beklemek',
      d: 'Park yerindeki araçların çıkışını engellememek',
    },
    answer: 'd',
    categoryId: 'trafik',
  },
  {
    question:
      'İnsan vücudunda ağız, yemek borusu, mide, ince ve kalın bağırsakların yer aldığı sistem hangisidir?',
    options: {
      a: 'Sinir sistemi',
      b: 'Dolaşım sistemi',
      c: 'Solunum sistemi',
      d: 'Sindirim sistemi',
    },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Derinin sert bir yüzeye sürtünmesi sonucunda derinin dış tabakasının bir bölümünün kaybı ile oluşan yara aşağıdakilerden hangisidir?',
    options: {
      a: 'Parçalı yara',
      b: 'Kesik yara',
      c: 'Sıyrık yara',
      d: 'Delici yara',
    },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Aşağıdakilerden hangisinin bozuk olması ön tekerleklerde düzensiz lastik aşıntısına sebep olur?',
    options: {
      a: 'Rot ayarının',
      b: 'Buji ayarının',
      c: 'Avans ayarının',
      d: 'Rölanti ayarının',
    },
    answer: 'a',
    categoryId: 'motor',
  },
  {
    question:
      'Aşağıdakilerden hangisi debriyaj balatasının sıyrılarak aşınmasına sebep olur?',
    options: {
      a: 'Aracın hızlı kullanılması',
      b: 'Aracın yavaş kullanılması',
      c: 'Ani ve sert kalkış yapılması',
      d: 'Park hâlinde viteste bırakılması',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  // --- 2 Ocak 2026 ---
  {
    question:
      'Kişinin çevre ile bağlantısının tamamen kesildiği, uyaranlara cevap veremediği derin bilinç kaybına ne denir?',
    options: { a: 'Hâlsizlik', b: 'Şok', c: 'Kansızlık', d: 'Koma' },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question: 'Aşağıdakilerden hangisi yakıt sarfiyatını artırır?',
    options: {
      a: 'Rölanti devrinin yüksek olması',
      b: 'Fren hidroliğinin tamamlanması',
      c: 'Soğutma suyuna antifriz katılması',
      d: 'Lastik hava basınçlarının kontrol edilmesi',
    },
    answer: 'a',
    categoryId: 'motor',
  },
  {
    question:
      'Solunum yolu yabancı bir cisimle tıkanmış olan kazazede öksürüyor, nefes alabiliyor ve konuşabiliyorsa bu kazazedede aşağıdakilerden hangisinin olduğu düşünülür?',
    options: {
      a: 'Koma',
      b: 'Kısmi tıkanma',
      c: 'Tam tıkanma',
      d: 'Solunum durması',
    },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Kazaya karışan veya olay yerinden geçmekte olan kişiler aşağıdakilerden hangilerini yapmakla yükümlüdür? I. Maddi hasar tespiti II. Olayı zabıta/sağlık kuruluşuna bildirmek III. İlk yardım tedbirleri IV. Yaralıları sağlık kuruluşuna götürmek (yetkililer isteğinde)',
    options: {
      a: 'Yalnız III',
      b: 'I, II ve IV',
      c: 'I, III ve IV',
      d: 'II, III ve IV',
    },
    answer: 'd',
    categoryId: 'trafik',
  },
  {
    question:
      'Trafik kuralının ihlal edildiği tarihten geriye doğru bir yıl içinde, toplam 100 ceza puanını aştığı birinci defa tespit edilen sürücülerin sürücü belgeleri kaç ay süre ile geri alınır?',
    options: { a: '2', b: '3', c: '6', d: '7' },
    answer: 'c',
    categoryId: 'trafik',
  },
  {
    question:
      'Aksine bir durum yoksa, ışıklı trafik işaret cihazında kırmızı ışık yanmakta ise sürücü ne yapmalıdır?',
    options: {
      a: 'Aracını durdurmalı',
      b: 'Durmadan geçmeli',
      c: 'Gelen araç yoksa dikkatli geçmeli',
      d: 'Yayalar geçebileceği için yavaş gitmeli',
    },
    answer: 'a',
    categoryId: 'trafik',
  },
  {
    question:
      'Alkol, belirli durumlara tepki verme, karar alma ya da hızlı reaksiyon gösterme becerilerini etkileyerek beynin işlevlerini yavaşlatır. Alkol özellikle vücudumuzdaki hangi sistem üzerinde etkilidir?',
    options: {
      a: 'Sindirim sistemi',
      b: 'Dolaşım sistemi',
      c: 'Solunum sistemi',
      d: 'Merkezi sinir sistemi',
    },
    answer: 'd',
    categoryId: 'trafikadabi',
  },
  {
    question: 'Kırıkların sabitlenme nedeni aşağıdakilerden hangisidir?',
    options: {
      a: 'Üşümeyi engellemek',
      b: 'Kırık bölgesini her yöne hareket ettirebilmek',
      c: 'Kırık uçlarının kana karışıp kalbe gitmesini engellemek',
      d: 'Kırık kemik uçlarının dokulara zarar vermesini engellemek',
    },
    answer: 'd',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Aşağıdakilerden hangisi solunum durmasının nedenlerinden biri değildir?',
    options: {
      a: 'Suda boğulma',
      b: 'Birinci derece yanıklar',
      c: 'Zehirli gazların solunması',
      d: 'Solunum yolunun tıkanması',
    },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'I. Deri soğuk ve nemlidir. II. Nabız düzenli ve dolgundur. III. Solunum yüzeysel ve hızlıdır. Verilen bulgulardan hangileri şok belirtisidir?',
    options: {
      a: 'Yalnız I',
      b: 'Yalnız II',
      c: 'I ve III',
      d: 'II ve III',
    },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question: 'Araçta motor yağı seviyesi ne zaman kontrol edilmelidir?',
    options: {
      a: 'Motor çalışırken yağ seviyesi kontrol edilmelidir.',
      b: 'Araç soğukken kontrol edilmelidir.',
      c: 'Araç durdurulduktan sonra 4-5 dakika beklenip kontrol edilmelidir.',
      d: 'Araç uzun süre çalıştırılmadan kontrol edilmelidir.',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question:
      'Aşağıdakilerden hangisi motor yağının görevlerinden biri değildir?',
    options: {
      a: 'Motor parçalarının aşınmasını önlemek',
      b: 'Motorun soğutulmasına yardımcı olmak',
      c: 'Motor parçalarını temizlemek',
      d: 'Yakıtın daha verimli yanmasını sağlamak',
    },
    answer: 'd',
    explanation:
      'Motor yağı, motorun soğutulmasına ve parçaların aşınmasını önlemeye yardımcı olur. Yakıtın yanmasını sağlamak motor yağının görevi değildir.',
    categoryId: 'motor',
  },
  {
    question:
      'Motorun hareketini vites kutusuna iletmek veya kesmek aşağıdakilerden hangisinin görevidir?',
    options: {
      a: 'Marş sisteminin',
      b: 'Şarj sisteminin',
      c: 'Ateşleme sisteminin',
      d: 'Kavrama (debriyaj) sisteminin',
    },
    answer: 'd',
    categoryId: 'motor',
  },
  {
    question:
      'Araç park edildikten sonra aşağıdakilerden hangisini yapmak gerekir?',
    options: {
      a: 'El frenini çekmek',
      b: 'Vitesi boşa almak',
      c: 'Fren pedalına basmak',
      d: 'Debriyaj pedalına basmak',
    },
    answer: 'a',
    categoryId: 'motor',
  },
  {
    question:
      'Aşağıdakilerden hangisi ilk yardımı tanımlayan doğru ifadedir?',
    options: {
      a: 'Olay yerinde olan müdahaledir.',
      b: 'Kişinin hayatını korumak, sağlık durumunun kötüleşmesini önlemek ve iyileşmesine destek olmak amacıyla yapılan müdahaledir.',
      c: 'Mevcut imkânlarla yapılan müdahaledir.',
      d: 'Hepsi',
    },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Şarj sisteminin gerilimini sınırlandıran parça aşağıdakilerden hangisidir?',
    options: {
      a: 'Regülatör',
      b: 'Sigorta',
      c: 'Karbüratör',
      d: 'Marş motoru',
    },
    answer: 'a',
    categoryId: 'motor',
  },
  {
    question:
      'Radyatördeki su seviyesi yeterli olmazsa motor nasıl etkilenir?',
    options: {
      a: 'Motor zengin karışımla çalışır.',
      b: 'Motor aşırı soğur ve performans düşer.',
      c: 'Motor aşırı ısınır ve hararet yapar.',
      d: 'Motorun yağlama sistemi bozulur.',
    },
    answer: 'c',
    explanation:
      'Radyatör suyu motoru soğutmak için kullanılır. Su seviyesi düşükse motor ısısı hızla artar ve hararet yapar.',
    categoryId: 'motor',
  },
  // --- 3 Ocak 2026 ---
  {
    question:
      'Binek araçlarda, kamyonet ve minibüslerde bulundurulması gereken yangın tüpü kaç kg ve kaç adet olmalıdır?',
    options: {
      a: '1 adet 1 kg',
      b: '1 adet 3 kg',
      c: '1 adet 2 kg',
      d: '2 adet 1 kg',
    },
    answer: 'c',
    categoryId: 'trafik',
  },
  {
    question:
      'Motor çalışır durumda iken aracın gösterge panelinde yağ basıncı ikaz ışığı yanıyorsa aşağıdakilerden hangisi yapılır?',
    options: {
      a: 'Motor devri düşürülür.',
      b: 'Motor devri yükseltilir.',
      c: 'Motor hemen durdurulur.',
      d: 'Motor rölantide çalıştırılır.',
    },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question:
      'Araca römork bağlandığı zaman aşağıdakilerden hangisinin yapılması zorunludur?',
    options: {
      a: 'Römorka yük konulması',
      b: 'Römorkun farlarının yakılması',
      c: 'Römorkun üzerine branda çekilmesi',
      d: 'Römorkun elektrik sisteminin prize takılması',
    },
    answer: 'd',
    categoryId: 'trafik',
  },
  {
    question:
      'Dört zamanlı motorlarda krank milinin kaç hareketinde bir iş meydana gelir?',
    options: { a: '2', b: '3', c: '4', d: '5' },
    answer: 'c',
    categoryId: 'motor',
  },
  {
    question: 'Ezik yara nasıl meydana gelir?',
    options: {
      a: 'Sivri cisimlerin batmasıyla',
      b: 'Sert, künt cisimlerin darbesiyle',
      c: 'Keskin cisimlerin kesmesiyle',
      d: 'Yakıcı cisimlerin yakmasıyla',
    },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Kamu hizmeti yapan yolcu taşıtlarının yolcu veya hizmetlileri bindirmeleri, indirmeleri için yatay ve düşey işaretlerle belirlenmiş yere ne ad verilir?',
    options: { a: 'Garaj', b: 'Durak', c: 'Otopark', d: 'Park yeri' },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Hangisi, toplum adabına aykırı davranışlardandır?',
    options: {
      a: 'Trafikte aracı arızalanan birine yardımcı olmak',
      b: 'Kaza, deprem, sel gibi felaketlerden çıkar sağlamaya çalışmak',
      c: 'Engellilere ayrılmış alanların dışına park etmek',
      d: 'Toplu taşıma araçlarındaki yaşlı, çocuklu veya engelli insanlara yer vermek',
    },
    answer: 'b',
    categoryId: 'trafikadabi',
  },
  {
    question:
      '"Emme zamanında silindire alınan temiz hava sıkıştırılır ve basıncı artar. Kızgın havanın üstüne yakıt püskürtülür ve yanma işlemi başlar." Verilen çalışma prensibi aşağıdaki motor tiplerinden hangisine aittir?',
    options: {
      a: 'Benzinli',
      b: 'Dizel',
      c: 'Elektrikli',
      d: 'Buharlı',
    },
    answer: 'b',
    categoryId: 'motor',
  },
  {
    question:
      'Yetişkinlere yapılan dış kalp masajı uygulamasıyla ilgili olarak verilenlerden hangisi doğrudur?',
    options: {
      a: 'Ellerin parmakları göğüs kafesiyle temas ettirilmeden, dirsekler bükülmeden tutulması',
      b: 'Göğüs kemiğinin alt ve üst ucunun tespit edilerek üst yarısına bası uygulanması',
      c: 'Uygulama hızının dakikada 30 bası olacak şekilde ayarlanması',
      d: 'Göğüs kemiği 3 cm aşağı inecek şekilde bası uygulanması',
    },
    answer: 'a',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Akciğerler vücudumuzdaki hangi sistemde yer alır?',
    options: {
      a: 'Sinir sisteminde',
      b: 'Hareket sisteminde',
      c: 'Solunum sisteminde',
      d: 'Boşaltım sisteminde',
    },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Zorunlu mali sorumluluk sigortası hakkında aşağıda verilen bilgilerden hangisi yanlıştır?',
    options: {
      a: 'Motorlu araçlar için zorunludur.',
      b: 'Motorlu araçlar için isteğe bağlıdır.',
      c: 'Teminat limitleri ve sigorta primi yasa ile belirlenir.',
      d: 'Araç sahibine düşen hukuki sorumluluğu teminat altına alır.',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Akü araca nasıl takılmalıdır?',
    options: {
      a: 'Önce (+), sonra (-) uç takılır',
      b: 'Önce (-), sonra (+) uç takılır',
      c: 'Her ikisi aynı anda takılmalı',
      d: 'Fark etmez',
    },
    answer: 'b',
    categoryId: 'motor',
  },
  {
    question:
      'Bayılan hastaya ilk yardım olarak aşağıdakilerden hangisi uygulanmaz?',
    options: {
      a: 'Soğuk içecekler içirmek',
      b: 'Şok pozisyonu vermek',
      c: 'Duyu organlarını uyarmak',
      d: 'Temiz hava almasını sağlamak',
    },
    answer: 'a',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Araç lastiklerinin hava basıncı, en doğru sonuç için ne zaman kontrol edilmelidir?',
    options: {
      a: 'Lastikler uzun bir yolculuktan hemen sonra sıcakken',
      b: 'Yağmurlu ve ıslak havalarda',
      c: 'Lastikler soğukken ve araç uzun süre hareket etmemişken',
      d: 'Havanın çok sıcak olduğu yaz aylarında',
    },
    answer: 'c',
    explanation:
      'En doğru lastik basıncı ölçümü, lastikler soğukken ve araç en az 2-3 saat hareket etmemişken yapılır.',
    categoryId: 'motor',
  },
  {
    question:
      'Hararet yapan bir araca soğutma suyu eklerken dikkat edilmesi gereken en önemli şey nedir?',
    options: {
      a: 'Sıcakken ve hızla eklemek',
      b: 'Motorun çalışır durumda olması',
      c: 'Sadece su eklemek ve antifriz kullanmamak',
      d: 'Motor tamamen soğuduktan sonra ve yavaşça eklemek',
    },
    answer: 'd',
    explanation:
      'Sıcak bir motorun üzerine aniden soğuk su eklemek, motor bloğunun çatlamasına neden olabilir.',
    categoryId: 'motor',
  },
  {
    question:
      'Vites değiştirirken vites kutusundan ses geliyorsa sebebi aşağıdakilerden hangisi olabilir?',
    options: {
      a: 'Kavramanın tam ayırmaması',
      b: 'Gaz pedalına tam basılmaması',
      c: 'Fren pedalına tam basılmaması',
      d: 'Lastik hava basıncının düşük olması',
    },
    answer: 'a',
    categoryId: 'motor',
  },
  {
    question:
      'Koşulların uygun olması hâlinde sürücü kesik yol çizgileri boyunca aşağıdakilerden hangisini yapabilir?',
    options: {
      a: 'Diğer şeride geçemez.',
      b: 'Önündeki aracı geçebilir.',
      c: 'Takip mesafesini azaltabilir.',
      d: 'Sol şeritte sürekli seyredebilir.',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  // --- ehliyetrehberi.com örnek günlük test (1–2 Ocak 2026 sayfaları) ---
  {
    question:
      'Kavşağa yaklaşırken "Dur" levhası gören sürücünün doğru davranışı hangisidir?',
    options: {
      a: 'Hızlanıp kavşağı hızlıca geçmek',
      b: 'Kavşağa girmeden önce tamamen durup yolu kontrol etmek',
      c: 'Sadece korna çalarak geçmek',
      d: 'Sola sinyal verip durmadan dönmek',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question: 'Şerit değiştirmeden önce ilk yapılması gereken hangisidir?',
    options: {
      a: 'Korna çalmak',
      b: 'Hızlanmak',
      c: 'Ayna kontrolü ve kör nokta kontrolü yapmak',
      d: 'Frene sert basmak',
    },
    answer: 'c',
    categoryId: 'trafik',
  },
  {
    question: 'Yaya geçidine yaklaşırken doğru davranış hangisidir?',
    options: {
      a: 'Yayayı görünce selektör yapmak',
      b: 'Yayaya geçiş önceliği verip hızını azaltmak',
      c: 'Hızlanıp geçidi çabuk geçmek',
      d: 'Yayayı bekletmek için korna çalmak',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question: 'Takip mesafesi için genel güvenli kural aşağıdakilerden hangisidir?',
    options: {
      a: 'Öndeki araçla arada "görüş mesafesi" kadar boşluk',
      b: 'Öndeki aracın arkasına çok yakın seyretmek',
      c: 'Hız arttıkça takip mesafesini artırmak',
      d: 'Sadece şehir içinde takip mesafesi bırakmak',
    },
    answer: 'c',
    categoryId: 'trafik',
  },
  {
    question:
      'Gece sürüşünde karşıdan araç geliyorsa hangi far kullanımı doğrudur?',
    options: {
      a: 'Uzun farları açık tutmak',
      b: 'Kısa farlara geçmek',
      c: 'Farları tamamen kapatmak',
      d: 'Dörtlüleri yakmak',
    },
    answer: 'b',
    categoryId: 'trafik',
  },
  {
    question:
      'Bilinci kapalı, solunumu olan kazazedeye hangi pozisyon önerilir?',
    options: {
      a: 'Sırtüstü düz yatırmak',
      b: 'Yarı oturur pozisyon',
      c: 'Yan (koma) pozisyonu',
      d: 'Yüzüstü pozisyon',
    },
    answer: 'c',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Kanaması olan kazazedede ilk yapılması gereken temel uygulama hangisidir?',
    options: {
      a: 'Kanayan bölgeyi yıkayıp açık bırakmak',
      b: 'Kanayan yere doğrudan basınç uygulamak',
      c: 'Kazazedeyi hemen ayağa kaldırmak',
      d: 'Kanayan yere buz koyup bırakmak',
    },
    answer: 'b',
    categoryId: 'ilkyardim',
  },
  {
    question:
      'Motor hararet yaptığında (aşırı ısınma) ilk güvenli adım hangisidir?',
    options: {
      a: 'Aracı daha hızlı sürmek',
      b: 'Güvenli yere çekip motoru dinlendirmek',
      c: 'Hemen radyatör kapağını açmak',
      d: 'Klimayı en soğuğa almak ve devam etmek',
    },
    answer: 'b',
    categoryId: 'motor',
  },
  {
    question:
      'Gösterge panelinde akü/şarj uyarı lambası yanıyorsa aşağıdakilerden hangisi olasıdır?',
    options: {
      a: 'Yakıt bitti',
      b: 'Şarj sistemi/alternatör ile ilgili sorun olabilir',
      c: 'Lastik basıncı düşük',
      d: 'Silecek suyu bitti',
    },
    answer: 'b',
    categoryId: 'motor',
  },
  {
    question:
      'Trafikte "doğru davranış" için en uygun yaklaşım hangisidir?',
    options: {
      a: 'Haklıysan tartışmayı büyütmek',
      b: 'Diğer sürücüye ders vermek için ani fren yapmak',
      c: 'Empati kurup sakin kalmak, riskli hareketlerden kaçınmak',
      d: 'Korna ile sürekli uyararak ilerlemek',
    },
    answer: 'c',
    categoryId: 'trafikadabi',
  },
];
