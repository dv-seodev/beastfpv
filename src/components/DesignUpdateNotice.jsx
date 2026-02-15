"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "beastfpv_design_notice_dismissed_at";
const HIDE_FOR_MS = 30 * 24 * 60 * 60 * 1000;

export default function DesignUpdateNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const rawValue = localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        setIsVisible(true);
        return;
      }

      const dismissedAt = Number(rawValue);
      const isExpired = Number.isNaN(dismissedAt) || Date.now() - dismissedAt > HIDE_FOR_MS;

      if (isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        setIsVisible(true);
      }
    } catch (error) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (error) {
      // Ignore storage errors (private mode, quota, etc.)
    }

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="design-notice" role="status" aria-live="polite">
      <div className="design-notice__inner container">
        <p className="design-notice__text">
          Уважаемые друзья, для вашего удобства мы полностью переработали дизайн нашего сайта. Если вы будете испытывать какие-либо проблемы с оформлением заказа, обязательно
          напишите нам на почту <a href="mailto:order@beastfpv.ru" className="design-notice__link">order@beastfpv.ru</a>, или свяжитесь с нами через <a href="/#contact-us" className="design-notice__link">форму обратной связи</a> на главной странице. Надеемся на ваше понимание.
        </p>
        <button type="button" className="design-notice__button" onClick={handleDismiss}>
          Понятно
        </button>
      </div>
    </div>
  );
}
