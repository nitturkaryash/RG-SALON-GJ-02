import React, { useState, useEffect, useRef } from 'react';
import { Box, LinearProgress, Paper, Typography, Fade } from '@mui/material';
import { KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';

interface ScrollIndicatorProps {
  targetId?: string;
  targetRef?: React.RefObject<HTMLElement>;
  showScrollToTop?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  height?: number;
  position?: 'top' | 'bottom';
  showPercentage?: boolean;
  className?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  targetId,
  targetRef,
  showScrollToTop = true,
  color = 'primary',
  height = 4,
  position = 'top',
  showPercentage = false,
  className = ''
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Get the target element
    const getTargetElement = () => {
      if (targetRef?.current) {
        return targetRef.current;
      }
      if (targetId) {
        return document.getElementById(targetId);
      }
      return window as any; // Default to window scroll
    };

    const targetElement = getTargetElement();
    scrollTargetRef.current = targetElement;

    const calculateScrollProgress = () => {
      let scrollTop: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (targetElement === window) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else if (targetElement && targetElement instanceof HTMLElement) {
        scrollTop = targetElement.scrollTop;
        scrollHeight = targetElement.scrollHeight;
        clientHeight = targetElement.clientHeight;
      } else {
        return;
      }

      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      
      setScrollProgress(Math.min(progress, 100));
      setIsVisible(scrollTop > 50);
      setShowScrollButton(scrollTop > 200);
    };

    const handleScroll = () => {
      requestAnimationFrame(calculateScrollProgress);
    };

    // Add scroll listener
    if (targetElement === window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (targetElement && targetElement instanceof HTMLElement) {
      targetElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Initial calculation
    calculateScrollProgress();

    return () => {
      if (targetElement === window) {
        window.removeEventListener('scroll', handleScroll);
      } else if (targetElement && targetElement instanceof HTMLElement) {
        targetElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [targetId, targetRef]);

  const scrollToTop = () => {
    const targetElement = scrollTargetRef.current;
    if (targetElement === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetElement && targetElement instanceof HTMLElement) {
      targetElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const positionStyles = position === 'top' 
    ? { top: 0, left: 0, right: 0 }
    : { bottom: 0, left: 0, right: 0 };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <Fade in={isVisible}>
        <Box
          className={className}
          sx={{
            position: 'fixed',
            ...positionStyles,
            zIndex: 1300,
            backgroundColor: 'transparent',
            pointerEvents: 'none'
          }}
        >
          <LinearProgress
            variant="determinate"
            value={scrollProgress}
            color={color}
            sx={{
              height: height,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                transition: 'transform 0.1s ease-out'
              }
            }}
          />
          {showPercentage && (
            <Box
              sx={{
                position: 'absolute',
                right: 8,
                top: position === 'top' ? height + 4 : -(height + 20),
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                pointerEvents: 'auto'
              }}
            >
              {Math.round(scrollProgress)}%
            </Box>
          )}
        </Box>
      </Fade>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Fade in={showScrollButton}>
          <Paper
            elevation={6}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1200,
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: color === 'primary' ? 'primary.main' : `${color}.main`,
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: color === 'primary' ? 'primary.dark' : `${color}.dark`,
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
            onClick={scrollToTop}
          >
            <ArrowUpIcon />
          </Paper>
        </Fade>
      )}
    </>
  );
};

export default ScrollIndicator; 