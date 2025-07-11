import { useRef, useState, useEffect } from "react";

const STORAGE_KEY = "draggable-button-offsetY";

export function DraggableButton({ onClick }: { onClick: () => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetY, setOffsetY] = useState(64); // default posisi awal

  // Load posisi dari localStorage saat mount
  useEffect(() => {
    const storedY = localStorage.getItem(STORAGE_KEY);
    if (storedY) {
      setOffsetY(parseInt(storedY));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newY = Math.max(0, e.clientY);
        setOffsetY(newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Simpan posisi ke localStorage
      localStorage.setItem(STORAGE_KEY, String(offsetY));
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offsetY]);

  return (
    <div
      ref={buttonRef}
      className="fixed left-4 z-50 lg:hidden cursor-grab active:cursor-grabbing"
      style={{ top: offsetY }}
      onMouseDown={() => setIsDragging(true)}
    >
      <button
        className="btn btn-md btn-circle bg-base-100 text-black hover:btn-primary shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) onClick();
        }}
      >
        ⭆
      </button>
    </div>
  );
}
