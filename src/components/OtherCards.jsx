import { useEffect, useState } from "react";
import { fetchOtherCards } from "../lib/api";

export default function OtherCards({ myId }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!myId) return;
    let alive = true;
    fetchOtherCards(myId).then((c) => alive && setCards(c));
    return () => {
      alive = false;
    };
  }, [myId]);

  if (cards.length === 0) return null;

  return (
    <section className="others">
      <h2 className="others__title">다른 사람들의 카드 ({cards.length})</h2>
      <p className="others__hint">미션 카드에 적힌 번호를 찾아 눌러보세요</p>
      <div className="others__grid">
        {cards.map((c) => (
          <a
            key={c.id}
            className="others__item"
            href={c.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="others__no">
              NO.{String(c.number).padStart(2, "0")}
            </span>
            <strong className="others__name">{c.title}</strong>
            <span className="others__desc">{c.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}