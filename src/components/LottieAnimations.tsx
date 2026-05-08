"use client";

import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef } from "react";

interface LottieAnimationProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className = "",
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}

export const loadingAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Loading",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [30, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [100, 100, 100] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 15, s: [120, 120, 100] },
            { t: 30, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [20, 20] },
          p: { a: 0, k: [0, 0] },
          nm: "Ellipse"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.133, 0.773, 0.369, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Circle 2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 10, s: [100, 100, 100] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 25, s: [120, 120, 100] },
            { t: 40, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [20, 20] },
          p: { a: 0, k: [0, 0] },
          nm: "Ellipse"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.133, 0.773, 0.369, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Circle 3",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [70, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 20, s: [100, 100, 100] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 35, s: [120, 120, 100] },
            { t: 50, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [20, 20] },
          p: { a: 0, k: [0, 0] },
          nm: "Ellipse"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.133, 0.773, 0.369, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

export const successAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          s: { a: 0, k: [60, 60] },
          p: { a: 0, k: [0, 0] },
          nm: "Circle"
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.133, 0.773, 0.369, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill"
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

export const emptyAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Empty",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Box",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0, 0, 100] },
            { t: 30, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [80, 80] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 10 },
          nm: "Rectangle"
        },
        {
          ty: "st",
          c: { a: 0, k: [0.6, 0.6, 0.6, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 2,
          nm: "Stroke"
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

export function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <LottieAnimation
        animationData={loadingAnimation}
        className={`w-[${size}px] h-[${size}px]`}
      />
    </div>
  );
}

export function SuccessCheck({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <LottieAnimation
        animationData={successAnimation}
        loop={false}
        className={`w-[${size}px] h-[${size}px]`}
      />
    </div>
  );
}

export function EmptyState({ 
  title = "Nenhum item encontrado", 
  description = "",
  size = 120 
}: { 
  title?: string; 
  description?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 opacity-50">
        <LottieAnimation
          animationData={emptyAnimation}
          className={`w-[${size}px] h-[${size}px]`}
        />
      </div>
      <p className="text-lg font-medium" style={{ color: "var(--foreground)" }}>
        {title}
      </p>
      {description && (
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
