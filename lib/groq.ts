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
