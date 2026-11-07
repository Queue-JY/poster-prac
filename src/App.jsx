import { useEffect, useState } from "react";
import { MY_CARD } from "./config";
import { registerCard } from "./lib/api";
import Ticket from "./components/Ticket";
import OtherCards from "./components/OtherCards";

export default function App() {
  const [notice, setNotice] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function run() {
      if (!MY_CARD.id || !MY_CARD.number) {
        setNotice("src/config.js 에서 id와 number를 입력해주세요!");
        return;
      }
      const { error } = await registerCard(MY_CARD);
      if (error) {
        console.warn("[poster-card] 카드 등록 실패:", error.message);
        setNotice("카드 등록에 실패했어요. 잠시 뒤 새로고침해보세요.");
      }
      setReady(true);
    }
    run();
  }, []);

  return (
    <main className="page">
      {notice && <p className="notice">{notice}</p>}

      <Ticket card={MY_CARD} />

      {ready && <OtherCards myId={MY_CARD.id} />}
    </main>
  );
}
