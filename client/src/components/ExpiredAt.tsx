import { useEffect, useState } from "react";
import { useRefresh } from "../hooks/auth.hook";

export function SessionCountdown() {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showRefresh, setShowRefresh] = useState(false);
  const { mutate: refresh } = useRefresh();

  useEffect(() => {
    const expiredAt = Number(localStorage.getItem("expiredAt"));

    const updateCountdown = () => {
      const now = Date.now();
      const diff = expiredAt - now;

      if (diff <= 0) {
        setTimeLeft("expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes < 10) {
        setShowRefresh(true);
      }

      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateCountdown(); // initial
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-2 mb-2 place-items-center">
      <p className="text-sm">
        {timeLeft === "expired"
          ? "Your session has expired, please login again"
          : `Your session will expire in ${timeLeft}`}
      </p>
      {showRefresh && (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            refresh();
          }}
        >
          Refresh
        </button>
      )}
    </div>
  );
}
