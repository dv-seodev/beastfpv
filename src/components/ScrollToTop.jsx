"use client";

import { useEffect, useState } from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`scroll-top ${isVisible ? "is-visible" : ""}`}
      aria-label="Наверх"
      title="Наверх"
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
};

export default ScrollToTop;
