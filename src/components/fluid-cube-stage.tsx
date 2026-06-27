"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTaskWantedLocale, type Locale } from "@/components/site-header";

export type FluidCubeFace = {
  id: string;
  label: string;
  labelZh?: string;
  tone?: "hero" | "accent" | "dark" | "plain";
  content: ReactNode;
};

type FluidCubeStageProps = {
  faces: FluidCubeFace[];
  initialFace?: string;
  title: string;
  titleZh?: string;
  compact?: boolean;
};

const rotations = [
  "rotateX(0deg) rotateY(0deg)",
  "rotateX(0deg) rotateY(-90deg)",
  "rotateX(-90deg) rotateY(-90deg)",
  "rotateX(0deg) rotateY(90deg)",
  "rotateX(0deg) rotateY(180deg)",
  "rotateX(90deg) rotateY(0deg)",
];

export function FluidCubeStage({
  faces,
  initialFace,
  title,
  titleZh,
  compact = false,
}: FluidCubeStageProps) {
  const locale = useTaskWantedLocale();
  const reduce = useReducedMotion();
  const initialIndex = Math.max(
    0,
    faces.findIndex((face) => face.id === initialFace),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeFace = faces[activeIndex] ?? faces[0];

  useEffect(() => {
    function syncHash() {
      if (typeof window === "undefined") {
        return;
      }
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        return;
      }
      const index = faces.findIndex((face) => face.id === hash);
      if (index >= 0) {
        setActiveIndex(index);
      }
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [faces]);

  const cubeTransform = reduce
    ? "none"
    : (rotations[activeIndex % rotations.length] ?? rotations[0]);

  function move(delta: number) {
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) {
        return faces.length - 1;
      }
      if (next >= faces.length) {
        return 0;
      }
      return next;
    });
  }

  const faceButtons = useMemo(
    () =>
      faces.map((face, index) => (
        <button
          aria-current={index === activeIndex ? "step" : undefined}
          aria-controls={`panel-${face.id}`}
          aria-selected={index === activeIndex}
          className={`cube-tab ${index === activeIndex ? "active" : ""}`}
          id={`tab-${face.id}`}
          key={face.id}
          onClick={() => setActiveIndex(index)}
          role="tab"
          type="button"
        >
          {faceLabel(face, locale)}
        </button>
      )),
    [activeIndex, faces, locale],
  );

  if (!faces.length) {
    return null;
  }

  return (
    <section
      aria-label={locale === "zh" && titleZh ? titleZh : title}
      className={`fluid-cube-stage ${compact ? "compact" : ""}`}
      data-active-face={activeFace.id}
      data-testid="fluid-cube-stage"
      id={`${activeFace.id}-stage`}
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 16) {
          return;
        }
        const target = event.target as HTMLElement;
        if (target.closest("[data-cube-scrollable='true']")) {
          return;
        }
        event.preventDefault();
        move(event.deltaY > 0 ? 1 : -1);
      }}
    >
      <div className="cube-orbit" aria-hidden="true">
        <motion.div
          animate={{ transform: cubeTransform }}
          className="cube-object"
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {faces.slice(0, 6).map((face, index) => (
            <span
              className={`cube-shell-face face-${index} tone-${face.tone ?? "plain"}`}
              key={face.id}
            />
          ))}
        </motion.div>
      </div>

      <div className="cube-content-shell">
        <div className="cube-toolbar">
          <div className="cube-tabs" role="tablist" aria-label="Cube faces">
            {faceButtons}
          </div>
          <div className="cube-steppers">
            <button
              aria-label="Previous cube face"
              className="nav-icon"
              onClick={() => move(-1)}
              type="button"
            >
              <CaretLeft size={17} />
            </button>
            <button
              aria-label="Next cube face"
              className="nav-icon"
              onClick={() => move(1)}
              type="button"
            >
              <CaretRight size={17} />
            </button>
          </div>
        </div>

        <div className="cube-face-stack">
          {faces.map((face, index) => (
            <motion.div
              animate={{
                opacity: index === activeIndex ? 1 : 0.2,
                scale: index === activeIndex ? 1 : 0.96,
                y: index === activeIndex ? 0 : 18,
              }}
              aria-hidden={index === activeIndex ? undefined : true}
              aria-labelledby={`tab-${face.id}`}
              className={`cube-content-face ${index === activeIndex ? "active" : ""}`}
              id={`panel-${face.id}`}
              key={face.id}
              role="tabpanel"
              tabIndex={index === activeIndex ? undefined : -1}
              transition={{ duration: reduce ? 0 : 0.32 }}
            >
              {face.content}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function faceLabel(face: FluidCubeFace, locale: Locale) {
  return locale === "zh" && face.labelZh ? face.labelZh : face.label;
}
