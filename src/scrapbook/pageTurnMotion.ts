import type { ResponsiveMode } from "../layouts/types";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";

export type TurnDirection = "forward" | "backward";
export type TurnSettleTarget = "source" | "destination";
export type TurnInputSource = "gesture" | "automatic";

export type TurnSnapshot = Readonly<{
  id: number;
  direction: TurnDirection;
  sourcePageIndex: number;
  destinationPageIndex: number;
  canCommit: boolean;
  mode: ResponsiveMode;
}>;

export type PageTurnState =
  | Readonly<{ phase: "idle" }>
  | Readonly<{ phase: "dragging"; turn: TurnSnapshot }>
  | Readonly<{
      phase: "settling";
      turn: TurnSnapshot;
      settleTarget: TurnSettleTarget;
      startProgress: number;
      durationMs: number;
    }>;

export type PendingTurnIntent = Readonly<{
  direction: TurnDirection;
  targetPageIndex: number;
}>;

export type GestureRelease = Readonly<{
  turnId: number;
  progress: number;
  distanceTowardDirectionPx: number;
  velocityTowardDirectionPxPerMs: number;
  horizontalDominant: boolean;
}>;

export const idlePageTurnState: PageTurnState = { phase: "idle" };
export const swipeDistanceThreshold = 44;
export const flickDistanceThreshold = 24;
export const flickVelocityThreshold = 0.45;
export const directionLockDistance = 8;
export const clickSuppressionDistance = 8;
export const fullTurnDistanceRatio = 0.72;
export const minimumFullTurnDistance = 120;
export const desktopAutomaticTurnDurationMs = 560;
export const mobileAutomaticTurnDurationMs = 480;
export const reducedTurnDurationMs = 140;
export const turnEasing = "cubic-bezier(0.22, 0.7, 0.2, 1)";
const maximumTurnAngleDegrees = 178;
const maximumTurnAngleRadians =
  (maximumTurnAngleDegrees * Math.PI) / 180;

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function progressForDistance(
  distanceTowardDirectionPx: number,
  pageWidthPx: number,
): number {
  const fullDistance = Math.max(
    minimumFullTurnDistance,
    pageWidthPx * fullTurnDistanceRatio,
  );

  return clampProgress(
    Math.max(0, distanceTowardDirectionPx) / fullDistance,
  );
}

export function progressForProjectedEdge(
  distanceTowardDirectionPx: number,
  pageWidthPx: number,
): number {
  const distance = Math.max(0, distanceTowardDirectionPx);
  const width = Math.max(1, pageWidthPx);
  const projectedEdge = Math.max(-1, Math.min(1, 1 - distance / width));

  return clampProgress(
    Math.acos(projectedEdge) / maximumTurnAngleRadians,
  );
}

export function shouldCommitSwipe(input: {
  distanceTowardDirectionPx: number;
  velocityTowardDirectionPxPerMs: number;
  horizontalDominant: boolean;
}): boolean {
  if (!input.horizontalDominant) {
    return false;
  }

  const distance = input.distanceTowardDirectionPx;
  const velocity = input.velocityTowardDirectionPxPerMs;

  return (
    distance >= swipeDistanceThreshold ||
    (distance >= flickDistanceThreshold &&
      velocity >= flickVelocityThreshold)
  );
}

export function adjacentPageIndex(input: {
  currentPageIndex: number;
  direction: TurnDirection;
  mode: ResponsiveMode;
  pageCount: number;
}): number | null {
  const lastPageIndex = Math.max(0, input.pageCount - 1);

  if (input.mode === "mobile") {
    const candidate =
      input.currentPageIndex + (input.direction === "forward" ? 1 : -1);

    return candidate >= 0 && candidate <= lastPageIndex ? candidate : null;
  }

  const spreadCount =
    1 + Math.ceil(Math.max(0, input.pageCount - 1) / 2);
  const currentSpread = desktopSpreadForPageIndex(input.currentPageIndex);
  const candidateSpread =
    currentSpread + (input.direction === "forward" ? 1 : -1);

  if (candidateSpread < 0 || candidateSpread >= spreadCount) {
    return null;
  }

  return firstPageIndexForDesktopSpread(candidateSpread);
}

export function settleDurationMs(input: {
  source: TurnInputSource;
  settleTarget: TurnSettleTarget;
  startProgress: number;
  velocityPxPerMs: number;
  reducedMotion: boolean;
  mode: ResponsiveMode;
}): number {
  if (input.reducedMotion) {
    return input.settleTarget === "destination" ? reducedTurnDurationMs : 1;
  }

  if (input.source === "automatic") {
    return input.mode === "desktop"
      ? desktopAutomaticTurnDurationMs
      : mobileAutomaticTurnDurationMs;
  }

  const progress = clampProgress(input.startProgress);

  if (input.settleTarget === "source") {
    return Math.round(140 + progress * 40);
  }

  const remaining = 1 - progress;
  const velocityReduction = Math.min(
    60,
    Math.max(0, input.velocityPxPerMs) * 60,
  );

  return Math.max(
    180,
    Math.min(320, Math.round(180 + remaining * 140 - velocityReduction)),
  );
}

export function fallbackDelayMs(durationMs: number): number {
  return durationMs + 120;
}

export function turnAngleDegrees(input: {
  mode: ResponsiveMode;
  direction: TurnDirection;
  progress: number;
}): number {
  const progress = clampProgress(input.progress);

  if (input.mode === "mobile") {
    return input.direction === "forward"
      ? -maximumTurnAngleDegrees * progress
      : -maximumTurnAngleDegrees * (1 - progress);
  }

  return input.direction === "forward"
    ? -maximumTurnAngleDegrees * progress
    : maximumTurnAngleDegrees * progress;
}

export function turnDepth(progress: number): number {
  return Math.sin(Math.PI * clampProgress(progress));
}
