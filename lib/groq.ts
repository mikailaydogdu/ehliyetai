/**
 * Groq API – soru üretimi ve yanlış cevap açıklaması.
 * Model: moonshotai/kimi-k2-instruct-0905
 */

import Constants from 'expo-constants';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-instruct-0905';

function getApiKey(): string {
  const key = Constants.expoConfig?.extra?.groqApiKey as string | undefined;
  if (!key) throw new Error('GROQ_API_KEY bulunamadı. .env dosyasına ekleyip uygulamayı yeniden başlatın.');
  return key;
}

export interface AIQuestion {
  soru: string;
  siklar: string[];
  dogruIndex: number;
}

async function groqChat(userContent: string, systemContent?: string): Promise<string> {
  const apiKey = getApiKey();
  const messages: { role: string; content: string }[] = [];
  if (systemContent) messages.push({ role: 'system', content: systemContent });
  messages.push({ role: 'user', content: userContent });

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API hatası (${res.status}): ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? '';
  return content.trim();
}

/** JSON cevabından objeyi çıkar (markdown code block varsa temizle). */
function parseJsonFromResponse(text: string): AIQuestion[] {
  let raw = text;
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) raw = match[1];
  raw = raw.trim();
  return JSON.parse(raw) as AIQuestion[];
}

/**
 * Verilen kategori için B ehliyet sınavı tarzında 5 çoktan seçmeli soru üretir.
 */
export async function generateQuestionsForCategory(categoryName: string): Promise<AIQuestion[]> {
  const system = `Sen Türkiye B sınıfı ehliyet sınavı soru yazarısın. Verdiğin cevap sadece geçerli bir JSON dizisi olmalı, başka metin ekleme.`;
  const user = `${categoryName} kategorisinde 5 adet çoktan seçmeli soru üret. Her soru 4 şık (A, B, C, D), tek doğru cevap. Format:
[{"soru": "Soru metni?", "siklar": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"], "dogruIndex": 0}]
dogruIndex 0-3 arası (doğru şıkkın sırası). Sadece JSON döndür.`;

  const content = await groqChat(user, system);
  const questions = parseJsonFromResponse(content);
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Groq geçerli soru listesi döndürmedi.');
  }
  return questions.slice(0, 5).map((q) => ({
    soru: String(q.soru ?? ''),
    siklar: Array.isArray(q.siklar) ? q.siklar.map(String) : [],
    dogruIndex: Math.max(0, Math.min(3, Number(q.dogruIndex) || 0)),
  }));
}

/**
 * Kullanıcı yanlış cevapladığında: neden doğru cevabın bu olduğunu kısa açıklar.
 */
export async function generateWrongExplanation(
  questionText: string,
  options: string[],
  userSelectedIndex: number,
  correctIndex: number
): Promise<string> {
  const userOption = options[userSelectedIndex] ?? '?';
  const correctOption = options[correctIndex] ?? '?';
  const user = `Ehliyet sorusu: ${questionText}
Şıklar: ${options.map((o, i) => `${['A','B','C','D'][i]}) ${o}`).join(' ')}

Kullanıcı yanlış şıkkı seçti. Doğru cevap: ${correctOption}. Kullanıcının seçtiği: ${userOption}.

Neden doğru cevap "${correctOption}"? 2-3 cümleyle, anlaşılır Türkçe açıkla. Sadece açıklama metnini yaz, başlık veya ekstra metin ekleme.`;

  const content = await groqChat(user);
  return content;
}
