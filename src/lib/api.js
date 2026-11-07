import { supabase, isConfigured } from "./supabase";

/* 네트워크가 불안정해도 화면이 죽지 않도록 모든 호출을 감쌉니다. */
async function safe(fn, fallback) {
  if (!isConfigured) return fallback;
  try {
    return await fn();
  } catch (e) {
    console.warn("[poster-card] 네트워크 오류:", e?.message || e);
    return fallback;
  }
}

/** 배포되면 사이트가 스스로 자기 정보를 등록합니다. */
export async function registerCard(card) {
  return safe(
    async () => {
      const { error } = await supabase.from("cards").upsert(
        {
          id: card.id,
          number: card.number,
          title: card.title,
          description: card.description,
          url: window.location.origin, // ← 배포 주소를 스스로 기록
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      return { error };
    },
    { error: null }
  );
}

/** 이 카드가 지금까지 받은 반응 수 */
export async function fetchReactionCounts(cardId) {
  return safe(async () => {
    const { data, error } = await supabase
      .from("reactions")
      .select("emoji")
      .eq("card_id", cardId);

    if (error || !data) return {};
    return data.reduce((acc, row) => {
      acc[row.emoji] = (acc[row.emoji] || 0) + 1;
      return acc;
    }, {});
  }, {});
}

/** 반응 남기기 */
export async function addReaction(cardId, emoji) {
  return safe(
    async () => {
      const { error } = await supabase
        .from("reactions")
        .insert({ card_id: cardId, emoji });
      return { error };
    },
    { error: null }
  );
}

/** 이 카드에 숨어 있는 미션 숫자 (반응을 남긴 뒤에만 호출) */
export async function fetchSecretDigit(number) {
  return safe(async () => {
    const { data, error } = await supabase
      .from("secrets")
      .select("digit")
      .eq("number", number)
      .maybeSingle();
    if (error || !data) return null;
    return data.digit;
  }, null);
}

/** 다른 사람들의 카드 — 전부, 번호순 (미션에서 특정 번호를 찾아야 하므로) */
export async function fetchOtherCards(myId) {
  return safe(async () => {
    const { data, error } = await supabase
      .from("cards")
      .select("id, number, title, description, url")
      .neq("id", myId)
      .order("number");

    if (error || !data) return [];
    return data;
  }, []);
}
