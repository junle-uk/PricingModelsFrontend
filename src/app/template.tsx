"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    setTransitionStage("exit");
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage("enter");
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={transitionStage === "enter" ? "page-transition-enter" : "page-transition-exit"}>
      {displayChildren}
    </div>
  );
}

