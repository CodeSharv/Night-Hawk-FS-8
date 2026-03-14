import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function AnimatedPage({ children }) {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("page-enter");
    // Trigger reflow
    void el.offsetWidth;
    el.classList.add("page-enter");
  }, [location.pathname]);

  return (
    <div ref={ref} className="animated-page page-enter">
      {children}
    </div>
  );
}
