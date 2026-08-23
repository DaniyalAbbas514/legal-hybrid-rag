import { useEffect, useRef, useState } from 'react';

/**
 * Viewport-triggered reveal wrapper.
 * Uses IntersectionObserver + CSS classes (see index.css) so no animation
 * library is required and only opacity/transform are animated.
 * Reveals once, then stops observing. Reduced motion is handled in CSS.
 */
const Reveal = ({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  threshold = 0.15,
  className = '',
  style,
  children,
  ...rest
}) => {
  const ref = useRef(null);
  // When IntersectionObserver is unavailable, start visible so content is
  // never withheld — no state update needed on mount.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
