// ============================================================
// SHAIKH RACE — Splash Screen
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import styles from '@/styles/splash.module.scss';

export default function SplashScreen() {
  const router = useRouter();
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate progress bar over 3 seconds
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: '100%',
        duration: 3,
        ease: 'power2.inOut',
        onComplete: () => {
          // Fade out container
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                router.push('/menu');
              }
            });
          } else {
            router.push('/menu');
          }
        }
      });
    }
  }, [router]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.particles} />
      
      <h1 className={styles.logo}>
        SHAIKH<br />RACE
      </h1>

      <div className={styles.progressContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>
    </div>
  );
}
