/**
 * Groq API – yanlış cevap açıklaması.
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

/**
 * EhliyetAi öğrenme asistanı: kullanıcı sorar, ehliyet/trafik konusunda eğitici bilgi verilir.
 */
export async function askEhliyetAiLearning(question: string): Promise<string> {
  const system = `Sen EhliyetAi öğrenme asistanısın. B sınıfı ehliyet sınavına hazırlanan kullanıcıya trafik kuralları, ilk yardım, motor, trafik işaretleri vb. konularda kısa, net ve eğitici bilgi ver.
Kurallar: Sadece Türkçe yaz. Sadece bilgi ver; başlık, "EhliyetAi:" gibi ön ek veya emoji ekleme. 2-5 cümleyle doğrudan açıkla. Resmi kurallara uygun bilgi ver.`;

  const content = await groqChat(question.trim(), system, { maxTokens: 512 });
  return content;
}

/**
 * Sınav Stratejisi: psikolojik destek / sınav taktikleri (süre yönetimi, soru sırası, heyecan kontrolü).
 */
export async function generateSinavStratejisi(): Promise<string> {
  const system = `Sen ehliyet sınavına hazırlanan adaylara psikolojik destek ve sınav stratejisi veren bir danışmansın.
Konular: Süre yönetimi (sınırlı sürede nasıl ilerlenir), hangi soruyu sona bırakmalı (zor soruda takılırsan geç, işaretle ve sona bırak gibi), heyecan kontrolü (sınav öncesi ve sırasında).
Kurallar: Sadece Türkçe yaz. Analiz tarzında, madde madde, net ve uygulanabilir notlar ver. Örnek cümleler kullan: "Zor soruda takılırsan geç, işaretle ve sona bırak." gibi. Başlık veya "AI:" ekleme. Emoji kullanma. 8-15 madde veya kısa paragraflar halinde yaz.`;

  const user = `B sınıfı ehliyet sınavına hazırlanan bir aday için sınav stratejisi ve psikolojik destek notları yaz. Süre yönetimi, hangi soruyu sona bırakmalı, heyecan kontrolü konularını analiz tarzında, uygulanabilir notlarla açıkla.`;

  const content = await groqChat(user, system, { maxTokens: 1024 });
  return content;
}
