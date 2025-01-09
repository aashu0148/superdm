import { useEffect, useRef, ReactNode } from "react";

interface InfiniteScrollWrapperProps {
  className?: string;
  children: ReactNode;
  onNearEnd?: () => void;
  loadBefore?: number;
}

const InfiniteScrollWrapper = ({
  className = "",
  children,
  onNearEnd,
  loadBefore = 900,
}: InfiniteScrollWrapperProps) => {
  const bufferRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const nearEndFunc = useRef<() => void>(() =>
    console.log("function not attached")
  );

  function handleNearEndReached() {
    loadingRef.current = true;
    nearEndFunc.current();
    setTimeout(() => {
      loadingRef.current = false;
    }, 500);
  }

  const handleObserverCallback = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];

    if (target.isIntersecting && !loadingRef.current) handleNearEndReached();
  };

  function handleWindowScroll() {
    if (loadingRef.current) return;

    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const diff = Math.abs(documentHeight - scrollPosition - windowHeight);
    const endReached = diff < 4;

    if (endReached) handleNearEndReached();
  }

  useEffect(() => {
    if (typeof onNearEnd === "function") {
      nearEndFunc.current = onNearEnd;
    }
  }, [onNearEnd]);


  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${loadBefore}px`, // Load before reaching the end
      threshold: 0.1,
    };
    const observer = new IntersectionObserver(handleObserverCallback, options);
    const buffer = bufferRef.current;

    if (buffer) {
      observer.observe(buffer);
    }

    window.addEventListener("scroll", handleWindowScroll);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      observer.unobserve(buffer!);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {children}

      <div ref={bufferRef} className="h-2" style={{ visibility: "hidden" }} />
    </div>
  );
};

export default InfiniteScrollWrapper;
