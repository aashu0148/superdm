import { useEffect, useRef, ReactNode } from "react";

interface InfiniteScrollWrapperProps {
  className?: string;
  children: ReactNode;
  onNearEnd?: (entry: IntersectionObserverEntry) => void;
  onScrolledEnd?: () => void;
  stripeHeight?: number;
}

const InfiniteScrollWrapper = ({
  className = "",
  children,
  onNearEnd,
  stripeHeight,
  onScrolledEnd,
}: InfiniteScrollWrapperProps) => {
  const stripeRef = useRef<HTMLDivElement>(null);
  const nearEndFunc = useRef<(entry: IntersectionObserverEntry) => void>(() =>
    console.log("function not attached")
  );
  const scrolledToEnd = useRef<() => void>(() =>
    console.log("function not attached")
  );

  const handleObserverCallback = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry.isIntersecting && nearEndFunc.current) {
      nearEndFunc.current(entry);
    }
  };

  function handleWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const diff = Math.abs(documentHeight - scrollPosition - windowHeight);
    const endReached = diff < 4;

    if (endReached) scrolledToEnd.current();
  }
  useEffect(() => {
    if (typeof onNearEnd === "function") {
      nearEndFunc.current = onNearEnd;
    }
  }, [onNearEnd]);

  useEffect(() => {
    if (typeof onScrolledEnd === "function") {
      scrolledToEnd.current = onScrolledEnd;
    }
  }, [onScrolledEnd]);

  useEffect(() => {
    const stripe = stripeRef.current;
    if (!stripe) return;

    const observer = new IntersectionObserver(handleObserverCallback, {
      threshold: [0.3, 0.95],
    });

    observer.observe(stripe);

    window.addEventListener("scroll", handleWindowScroll);

    return () => {
      observer.unobserve(stripe);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  const defaultHeight =
    typeof window !== "undefined"
      ? window.innerHeight > 1300
        ? 1300
        : window.innerHeight
      : 1300;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={stripeRef}
        className="absolute bottom-0 left-0 w-10 pointer-events-none "
        style={{
          height: `${stripeHeight || defaultHeight}px`,
        }}
      />
      {children}
    </div>
  );
};

export default InfiniteScrollWrapper;
