import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
export default function WorkspaceWindow({
  title,
  subtitle,
  children,
  onClose,
  hidden = false,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  hidden?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (hidden) return;
    returnFocus.current = document.activeElement as HTMLElement;
    (
      ref.current?.querySelector<HTMLElement>(
        'input:not([type="range"]),[role="combobox"]',
      ) ?? ref.current
    )?.focus({ preventScroll: true });
    return () => {
      if (returnFocus.current?.isConnected)
        returnFocus.current.focus({ preventScroll: true });
    };
  }, [hidden]);
  return (
    <div
      className="yt-backdrop"
      hidden={hidden}
      inert={hidden}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`yt-window ${wide ? "yt-wide" : ""}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const items = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'button:not(:disabled),input,select,a[href],summary,[tabindex="0"]',
              ),
            ).filter((item) => item.getClientRects().length > 0);
            const first = items[0],
              last = items.at(-1);
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="yt-window-header">
          <div>
            <span>{title}</span>
            {subtitle && <small>{subtitle}</small>}
          </div>
          <button onClick={onClose}>
            close <kbd>esc</kbd>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
