import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useState } from 'react';

const visuallyHiddenStyles: CSSProperties = {
  display: 'inline-block',
  position: 'absolute',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  height: 1,
  width: 1,
  margin: -1,
  padding: 0,
  border: 0,
};

type VisuallyHiddenProps = Omit<HTMLAttributes<HTMLElement>, 'style'> & {
  children: ReactNode;
};

export const VisuallyHidden = ({
  children,
  ...delegatedProps
}: VisuallyHiddenProps) => {
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'Alt') {
        setForceShow(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        setForceShow(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (forceShow) {
    return <>{children}</>;
  }

  return (
    <span style={visuallyHiddenStyles} {...delegatedProps}>
      {children}
    </span>
  );
};
