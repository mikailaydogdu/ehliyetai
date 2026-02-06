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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function groqChat(
  userContent: string,
  systemContent?: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();
  const messages: { role: string; content: string }[] = [];
  if (systemContent) messages.push({ role: 'system', content: systemContent });
  messages.push({ role: 'user', content: userContent });
  const maxTokens = options?.maxTokens ?? 4096;

  const doRequest = async (): Promise<string> => {
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
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API hatası (${res.status}): ${err}`);
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';
    return content.trim();
  };

  try {
    return await doRequest();
  } catch (firstError) {
    await delay(800);
    return await doRequest();
  }
}

/** Tek soru JSON'unu parse et. */
function parseSingleQuestion(text: string): AIQuestion | null {
  let raw = text;
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) raw = match[1];
  raw = raw.trim();
  try {
    const parsed = JSON.parse(raw);
    const q = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!q || typeof q.soru !== 'string') return null;
    return {
      soru: String(q.soru),
      siklar: Array.isArray(q.siklar) ? q.siklar.map(String).slice(0, 4) : [],
      dogruIndex: Math.max(0, Math.min(3, Number(q.dogruIndex) ?? 0)),
    };
  } catch {
    return null;
  }
}

/** Tek bir soru JSON'unu veya dizideki elemanı parse et. */
function parseOneQuestion(parsed: unknown): AIQuestion | null {
  const q = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!q || typeof (q as { soru?: unknown }).soru !== 'string') return null;
  const obj = q as { soru: string; siklar?: unknown; dogruIndex?: unknown };
  return {
    soru: String(obj.soru),
    siklar: Array.isArray(obj.siklar) ? obj.siklar.map(String).slice(0, 4) : [],
    dogruIndex: Math.max(0, Math.min(3, Number(obj.dogruIndex) ?? 0)),
  };
}

/** Birden fazla soru içeren cevabı parse et. */
function parseQuestionArray(text: string): AIQuestion[] {
  let raw = text;
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) raw = match[1];
  raw = raw.trim();
  const results: AIQuestion[] = [];
  try {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of arr) {
      const q = parseOneQuestion(item);
      if (q && q.siklar.length >= 2) results.push(q);
    }
  } catch {
    const single = parseSingleQuestion(text);
    if (single && single.siklar.length >= 2) results.push(single);
  }
  return results;
}

/** Tek bir soru üretir (tek API çağrısı). */
async function generateSingleQuestion(categoryName: string): Promise<AIQuestion> {
  const system = `Sen Türkiye B sınıfı ehliyet sınavı soru yazarısın. Cevabın sadece tek bir soru için geçerli JSON objesi olmalı, başka metin ekleme.`;
  const user = `${categoryName} kategorisinde 1 adet çoktan seçmeli soru üret. 4 şık (A, B, C, D), tek doğru cevap. Format:
{"soru": "Soru metni?", "siklar": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"], "dogruIndex": 0}
dogruIndex 0-3 arası. Sadece bu JSON'u döndür.`;

  const content = await groqChat(user, system, { maxTokens: 1024 });
  const question = parseSingleQuestion(content);
  if (!question || question.siklar.length < 2) {
    throw new Error('Groq geçerli soru döndürmedi.');
  }
  return question;
}

const WANTED_QUESTIONS = 5;

/**
 * Verilen kategori için B ehliyet sınavı tarzında 5 çoktan seçmeli soru üretir.
 * Önce tek istekte 5 soru istenir (hızlı); yetersiz kalırsa eksikler tek tek tamamlanır.
 */
export async function generateQuestionsForCategory(categoryName: string): Promise<AIQuestion[]> {
  const system = `Sen Türkiye B sınıfı ehliyet sınavı soru yazarısın. Cevabın sadece bir JSON dizisi olmalı, başka metin ekleme.`;
  const user = `${categoryName} kategorisinde ${WANTED_QUESTIONS} adet çoktan seçmeli soru üret. Her soru 4 şık (A, B, C, D), tek doğru cevap.
Format: [{"soru": "Soru metni?", "siklar": ["A", "B", "C", "D"], "dogruIndex": 0}, ...]
dogruIndex 0-3 arası. Sadece JSON dizisini döndür.`;

  let results: AIQuestion[] = [];
  try {
    const content = await groqChat(user, system, { maxTokens: 4096 });
    results = parseQuestionArray(content);
  } catch {
    // Tek seferde alınamadıysa tek tek üret
  }

  for (let i = results.length; i < WANTED_QUESTIONS; i++) {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const q = await generateSingleQuestion(categoryName);
        results.push(q);
        break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt === 0) await delay(500);
      }
    }
    if (results.length <= i && lastError) throw lastError;
  }

  if (results.length === 0) throw new Error('Groq soru üretemedi.');
  return results.slice(0, WANTED_QUESTIONS);
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

Neden doğru cevap "${correctOption}"? 1-2 cümleyle, anlaşılır Türkçe açıkla. Sadece açıklama metnini yaz, başlık veya ekstra metin ekleme.`;

  const content = await groqChat(user, undefined, { maxTokens: 256 });
  return content;
}
