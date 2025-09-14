'use client';

import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Typography, Box } from '@mui/material';
import { MembershipTier } from '../../types/membershipTier';
import {
  Edit,
  Delete,
  AccessTime,
  Star,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import './MembershipTierCard.css';

// Animation constants
const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
};

const clamp = (val: number, min = 0, max = 100) =>
  Math.min(Math.max(val, min), max);
const round = (val: number, p = 3) => parseFloat(val.toFixed(p));
const adjust = (
  val: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) => round(toMin + ((toMax - toMin) * (val - fromMin)) / (fromMax - fromMin));
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

interface MembershipTierCardProps {
  tier: MembershipTier;
  onEdit: (tier: MembershipTier) => void;
  onDelete: (id: string) => void;
  onViewDetails: (tier: MembershipTier) => void;
}

const MembershipTierCard: FC<MembershipTierCardProps> = ({
  tier,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const animationHandlers = useMemo(() => {
    let rafId: number | null = null;

    const updateTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const { clientWidth: width, clientHeight: height } = card;
      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const props: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(centerY, centerX) / 50, 0, 1)}`,
        '--rotate-x': `${round(-(centerY / 5))}deg`,
        '--rotate-y': `${round(centerX / 4)}deg`,
      };
      Object.entries(props).forEach(([p, v]) => wrap.style.setProperty(p, v));
    };

    const smoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLElement
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const loop = (currentTime: number) => {
        const progress = clamp((currentTime - startTime) / duration);
        const eased = easeInOutCubic(progress);
        const currentX = adjust(eased, 0, 1, startX, targetX);
        const currentY = adjust(eased, 0, 1, startY, targetY);
        updateTransform(currentX, currentY, card, wrap);
        if (progress < 1) rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    return {
      updateTransform,
      smoothAnimation,
      cancel: () => rafId && cancelAnimationFrame(rafId),
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!cardRef.current || !wrapRef.current || !animationHandlers) return;
      const rect = cardRef.current.getBoundingClientRect();
      animationHandlers.updateTransform(
        e.clientX - rect.left,
        e.clientY - rect.top,
        cardRef.current,
        wrapRef.current
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    if (!wrapRef.current || !cardRef.current || !animationHandlers) return;
    animationHandlers.cancel();
    wrapRef.current.classList.add('active');
    cardRef.current.classList.add('active');
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (!wrapRef.current || !cardRef.current || !animationHandlers) return;
      wrapRef.current.classList.remove('active');
      cardRef.current.classList.remove('active');
      animationHandlers.smoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY,
        cardRef.current,
        wrapRef.current
      );
    },
    [animationHandlers]
  );

  useEffect(() => {
    if (!animationHandlers || !wrapRef.current || !cardRef.current) return;

    const wrap = wrapRef.current;
    const card = cardRef.current;
    const { INITIAL_DURATION } = ANIMATION_CONFIG;

    const initialX = wrap.clientWidth / 2;
    const initialY = wrap.clientHeight / 2;

    animationHandlers.updateTransform(initialX, initialY, card, wrap);
    animationHandlers.smoothAnimation(
      INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap
    );
  }, [animationHandlers]);

  const getMaskedPrice = (price: number) => {
    const priceStr = price.toString();
    const lastTwo = priceStr.slice(-2);
    return `₹**,***,${lastTwo}`;
  };

  return (
    <div
      ref={wrapRef}
      className='hc-wrapper membership-tier-card-container'
      style={{
        width: '320px',
        height: '192px',
        perspective: '1000px',
      }}
    >
      <div
        ref={cardRef}
        className='hc-card'
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          background:
            'linear-gradient(135deg, rgb(107, 142, 35) 0%, rgb(94, 129, 34) 100%)',
          position: 'relative',
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
        }}
      >
        <div
          className='hc-inside'
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div className='hc-shine' />
          <div className='hc-glare' />
          <div
            className='hc-content-wrapper'
            style={{
              width: '100%',
              height: '100%',
              padding: '24px',
              position: 'relative',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Action Buttons in Top Right Corner */}
            <Box
              sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => onEdit(tier)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '28px',
                  width: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s ease',
                }}
                title='Edit Tier'
              >
                <Edit sx={{ fontSize: '14px' }} />
              </button>
              <button
                onClick={() => onDelete(tier.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '28px',
                  width: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s ease',
                }}
                title='Delete Tier'
              >
                <Delete sx={{ fontSize: '14px' }} />
              </button>
            </Box>

            {/* Header with Tier Name and Visibility Toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <div style={{ flex: 1, paddingRight: '60px' }}>
                <Typography
                  variant='h4'
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: 1.2,
                    marginBottom: '4px',
                  }}
                >
                  {tier.name}
                </Typography>
              </div>

              <button
                onClick={() => setIsVisible(!isVisible)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  width: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
                aria-label={
                  isVisible ? 'Hide tier details' : 'Show tier details'
                }
              >
                {isVisible ? (
                  <VisibilityOff sx={{ fontSize: '16px' }} />
                ) : (
                  <Visibility sx={{ fontSize: '16px' }} />
                )}
              </button>
            </Box>

            {/* Price - Prominent Display */}
            <div style={{ marginBottom: '24px' }}>
              <Typography
                variant='h3'
                sx={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  letterSpacing: '0.02em',
                  color: 'white',
                  lineHeight: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {isVisible
                  ? `₹${new Intl.NumberFormat('en-IN').format(tier.price)}`
                  : getMaskedPrice(tier.price)}
              </Typography>
            </div>

            {/* Details Section - Bottom Area */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '2px',
                  }}
                >
                  <AccessTime sx={{ fontSize: '10px' }} />
                  Duration
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '0.85rem',
                  }}
                >
                  {tier.duration_months}{' '}
                  {tier.duration_months === 1 ? 'Month' : 'Months'}
                </Typography>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginBottom: '2px',
                  }}
                >
                  <Star sx={{ fontSize: '10px' }} />
                  Benefits
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '0.85rem',
                  }}
                >
                  {isVisible
                    ? `${(tier.benefits || []).length} Features`
                    : '** Features'}
                </Typography>
              </div>
            </Box>

            {/* Decorative Elements */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
                opacity: 0.08,
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '-30px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                opacity: 0.05,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTierCard;
