import { useEffect, useState } from 'react';
import type { Somatotipo } from '@/types';
import { getWeeklySetsByMuscle, setsToColor, setsToLabel, type MuscleSetMap } from '@/utils/muscleVolumeCalculator';

interface Props {
  userId: string;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
}

// ─── Scale transforms per somatotipo ─────────────────────────────────────────
// Applied only to torso+arms group and legs group — head/hands/feet stay unchanged

const TORSO_SX: Record<string, number> = { ectomorfo: 0.80, mesomorfo: 1.00, endomorfo: 1.24 };
const LEG_SX:   Record<string, number> = { ectomorfo: 0.82, mesomorfo: 1.00, endomorfo: 1.22 };

// SVG group transform: horizontal scale around center X=60
const torsoTx = (sx: number) => `translate(60,0) scale(${sx},1) translate(-60,0)`;
// Leg scale centered at x=60, anchored at hip y=174
const legTx = (sx: number) => `translate(60,174) scale(${sx},1) translate(-60,-174)`;

function getSets(map: MuscleSetMap, key: string): number {
  return map[key] ?? 0;
}

function col(sets: MuscleSetMap, key: string): string {
  return setsToColor(getSets(sets, key));
}

// ─── Front SVG ─────────────────────────────────────────────────────────────────
// Base paths drawn for mesomorfo male. Somatotipo handled via SVG group transform.
// Female: different chest + wider hips (path override inside torso group).

function FrontBody({
  sets,
  somatotipo = 'mesomorfo',
  sexo = 'masculino',
  uid,
}: {
  sets: MuscleSetMap;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
  uid: string;
}) {
  const skin = '#d4a876';
  const skinDark = '#b8895a';
  const skinMid = '#c49a68';
  const isFemale = sexo === 'femenino';
  const tSx = TORSO_SX[somatotipo] ?? 1;
  const lSx = LEG_SX[somatotipo] ?? 1;
  const outlineColor = isFemale ? '#f472b6' : '#60a5fa';
  const hairColor = '#4a3728';

  const headGrad = `${uid}-fhg`;
  const hlGrad   = `${uid}-fhl`;

  return (
    <svg viewBox="0 0 120 300" className="w-full h-full">
      <defs>
        {/* Head gradient */}
        <radialGradient id={headGrad} cx="38%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#f2c98a" />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        {/* General highlight overlay */}
        <radialGradient id={hlGrad} cx="35%" cy="28%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.38" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── HEAD (no somatotipo transform) ── */}
      <ellipse cx="60" cy="18" rx="13" ry="15" fill={`url(#${headGrad})`} stroke={outlineColor} strokeWidth="0.8" />
      <ellipse cx="57" cy="14" rx="7" ry="8" fill={`url(#${hlGrad})`} />
      {/* Ears */}
      <ellipse cx="46.5" cy="18" rx="2.5" ry="4" fill={skinDark} />
      <ellipse cx="73.5" cy="18" rx="2.5" ry="4" fill={skinDark} />

      {/* ── FEMALE: coleta (ponytail) ── */}
      {isFemale && (
        <>
          {/* Hair on top of head */}
          <path d="M 48,8 C 52,2 68,2 72,8 C 74,12 73,18 73,18 C 68,14 52,14 47,18 C 47,18 46,12 48,8 Z"
            fill={hairColor} />
          {/* Ponytail base band */}
          <ellipse cx="60" cy="5" rx="8" ry="3.5" fill={hairColor} />
          {/* Ponytail strand */}
          <path d="M 56,3 C 54,-2 58,-10 60,-14 C 62,-10 66,-2 64,3"
            fill={hairColor} stroke={hairColor} strokeWidth="0.5" />
          {/* Ponytail end tapered */}
          <path d="M 56,3 C 55,-4 58,-12 60,-16 C 62,-12 65,-4 64,3 C 62,5 58,5 56,3 Z"
            fill={hairColor} />
          {/* Hair tie/band */}
          <ellipse cx="60" cy="3" rx="5" ry="2" fill={outlineColor} opacity="0.85" />
        </>
      )}

      {/* Neck connector to torso group */}
      <path d="M 55,33 L 65,33 L 65,43 L 55,43 Z" fill={skinMid} />

      {/* ─── TORSO + ARMS GROUP (somatotipo horizontal scale) ─── */}
      <g transform={torsoTx(tSx)}>
        {/* Trapezius slopes */}
        <path d="M 55,37 Q 46,40 38,44 L 39,48 Q 47,44 56,41 Z" fill={skinMid} />
        <path d="M 65,37 Q 74,40 82,44 L 81,48 Q 73,44 64,41 Z" fill={skinMid} />

        {/* Left shoulder (deltoid) */}
        <path d="M 36,43 C 26,42 21,49 21,63 C 21,74 33,77 37,70 C 38,62 37,50 36,43 Z"
          fill={col(sets, 'hombros')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="26" cy="55" rx="3.5" ry="6" fill="rgba(255,255,255,0.25)" />
        {/* Right shoulder */}
        <path d="M 84,43 C 94,42 99,49 99,63 C 99,74 87,77 83,70 C 82,62 83,50 84,43 Z"
          fill={col(sets, 'hombros')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="94" cy="55" rx="3.5" ry="6" fill="rgba(255,255,255,0.25)" />

        {/* CHEST — male or female */}
        {isFemale ? (
          <>
            {/* Left breast */}
            <path d="M 60,44 C 52,42 37,48 37,65 C 37,80 50,92 60,88 Z"
              fill={col(sets, 'pecho')} stroke={outlineColor} strokeWidth="0.7" />
            <ellipse cx="48" cy="68" rx="8" ry="12" fill="rgba(255,255,255,0.2)" />
            {/* Right breast */}
            <path d="M 60,44 C 68,42 83,48 83,65 C 83,80 70,92 60,88 Z"
              fill={col(sets, 'pecho')} stroke={outlineColor} strokeWidth="0.7" />
            <ellipse cx="72" cy="68" rx="8" ry="12" fill="rgba(255,255,255,0.2)" />
          </>
        ) : (
          <>
            {/* Left pec */}
            <path d="M 60,44 C 52,41 37,47 37,64 C 37,76 48,84 60,80 Z"
              fill={col(sets, 'pecho')} stroke={outlineColor} strokeWidth="0.7" />
            <ellipse cx="48" cy="62" rx="8" ry="9" fill="rgba(255,255,255,0.22)" />
            {/* Right pec */}
            <path d="M 60,44 C 68,41 83,47 83,64 C 83,76 72,84 60,80 Z"
              fill={col(sets, 'pecho')} stroke={outlineColor} strokeWidth="0.7" />
            <ellipse cx="72" cy="62" rx="8" ry="9" fill="rgba(255,255,255,0.22)" />
            {/* Sternal line */}
            <line x1="60" y1="44" x2="60" y2="80" stroke="rgba(0,0,0,0.14)" strokeWidth="0.7" />
          </>
        )}

        {/* Left bicep */}
        <path d="M 37,57 C 23,61 20,84 23,108 C 24,114 37,114 38,108 C 38,84 38,61 37,57 Z"
          fill={col(sets, 'biceps')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="23.5" cy="80" rx="3" ry="9" fill="rgba(255,255,255,0.28)" />
        {/* Right bicep */}
        <path d="M 83,57 C 97,61 100,84 97,108 C 96,114 83,114 82,108 C 82,84 82,61 83,57 Z"
          fill={col(sets, 'biceps')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="96.5" cy="80" rx="3" ry="9" fill="rgba(255,255,255,0.28)" />

        {/* Left forearm */}
        <path d="M 22,109 C 20,118 20,136 23,150 C 24,155 37,155 37,150 C 38,136 38,118 37,109 Z"
          fill={col(sets, 'antebrazos')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="22" cy="128" rx="2.5" ry="10" fill="rgba(255,255,255,0.2)" />
        {/* Right forearm */}
        <path d="M 98,109 C 100,118 100,136 97,150 C 96,155 83,155 83,150 C 82,136 82,118 83,109 Z"
          fill={col(sets, 'antebrazos')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="98" cy="128" rx="2.5" ry="10" fill="rgba(255,255,255,0.2)" />

        {/* Hands */}
        <ellipse cx="29" cy="159" rx="6" ry="7.5" fill={skinDark} stroke={outlineColor} strokeWidth="0.5" />
        <ellipse cx="91" cy="159" rx="6" ry="7.5" fill={skinDark} stroke={outlineColor} strokeWidth="0.5" />
        {/* Knuckle hints */}
        <ellipse cx="27" cy="156" rx="4" ry="2" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="93" cy="156" rx="4" ry="2" fill="rgba(255,255,255,0.15)" />

        {/* ABS (torso body) */}
        <path d="M 37,80 C 36,100 48,124 48,148 L 72,148 C 72,124 84,100 83,80 Z"
          fill={col(sets, 'abdominales')} stroke={outlineColor} strokeWidth="0.7" />
        {/* Linea alba */}
        <line x1="60" y1="80" x2="60" y2="147" stroke="rgba(0,0,0,0.16)" strokeWidth="0.9" />
        {/* Horizontal ab lines */}
        <line x1="50" y1="97"  x2="70" y2="97"  stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
        <line x1="50" y1="113" x2="70" y2="113" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
        <line x1="50" y1="129" x2="70" y2="129" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
        {/* Ab highlights (3D blobs) */}
        <ellipse cx="55" cy="89"  rx="4" ry="5.5" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="65" cy="89"  rx="4" ry="5.5" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="55" cy="105" rx="4" ry="5.5" fill="rgba(255,255,255,0.16)" />
        <ellipse cx="65" cy="105" rx="4" ry="5.5" fill="rgba(255,255,255,0.16)" />
        <ellipse cx="55" cy="121" rx="4" ry="5"   fill="rgba(255,255,255,0.13)" />
        <ellipse cx="65" cy="121" rx="4" ry="5"   fill="rgba(255,255,255,0.13)" />

        {/* Hip connector */}
        {isFemale ? (
          <path d="M 48,148 C 44,158 42,165 43,178 L 77,178 C 78,165 76,158 72,148 Z" fill={skinMid} />
        ) : (
          <path d="M 48,148 C 46,158 44,166 46,178 L 74,178 C 76,166 74,158 72,148 Z" fill={skinMid} />
        )}
        {/* V-cut hint */}
        <path d="M 54,142 Q 60,150 66,142" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
      </g>
      {/* ─── END TORSO GROUP ─── */}

      {/* ─── LEGS GROUP (separate somatotipo scale, anchored at hip y=174) ─── */}
      <g transform={legTx(lSx)}>
        {/* Left quad */}
        <path d="M 44,175 C 39,187 33,218 38,250 C 40,257 56,258 57,250 C 59,218 60,187 60,175 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="38" cy="210" rx="5" ry="15" fill="rgba(255,255,255,0.18)" />
        {/* Quad separation line */}
        <path d="M 48,182 Q 47,210 48,244" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
        {/* Right quad */}
        <path d="M 76,175 C 81,187 87,218 82,250 C 80,257 64,258 63,250 C 61,218 60,187 60,175 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="82" cy="210" rx="5" ry="15" fill="rgba(255,255,255,0.18)" />
        <path d="M 72,182 Q 73,210 72,244" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />

        {/* Knees */}
        <ellipse cx="47" cy="252" rx="9"  ry="5.5" fill={skinDark} opacity="0.8" />
        <ellipse cx="73" cy="252" rx="9"  ry="5.5" fill={skinDark} opacity="0.8" />
        <ellipse cx="45" cy="250" rx="5"  ry="3"   fill="rgba(255,255,255,0.2)" />
        <ellipse cx="71" cy="250" rx="5"  ry="3"   fill="rgba(255,255,255,0.2)" />

        {/* Left shin */}
        <path d="M 38,258 C 34,270 35,286 39,294 C 41,298 54,298 56,294 C 58,286 57,268 57,258 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="36.5" cy="274" rx="3" ry="10" fill="rgba(255,255,255,0.18)" />
        {/* Right shin */}
        <path d="M 82,258 C 86,270 85,286 81,294 C 79,298 66,298 64,294 C 62,286 63,268 63,258 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="83.5" cy="274" rx="3" ry="10" fill="rgba(255,255,255,0.18)" />

        {/* Feet */}
        <ellipse cx="46" cy="298" rx="11" ry="3.5" fill={skinDark} />
        <ellipse cx="74" cy="298" rx="11" ry="3.5" fill={skinDark} />
      </g>
      {/* ─── END LEGS GROUP ─── */}
    </svg>
  );
}

// ─── Back SVG ──────────────────────────────────────────────────────────────────

function BackBody({
  sets,
  somatotipo = 'mesomorfo',
  sexo = 'masculino',
  uid,
}: {
  sets: MuscleSetMap;
  somatotipo?: Somatotipo;
  sexo?: 'masculino' | 'femenino';
  uid: string;
}) {
  const skinDark = '#b8895a';
  const skinMid = '#c49a68';
  const isFemale = sexo === 'femenino';
  const tSx = TORSO_SX[somatotipo] ?? 1;
  const lSx = LEG_SX[somatotipo] ?? 1;
  const outlineColor = isFemale ? '#f472b6' : '#60a5fa';
  const hairColor = '#4a3728';

  const headGrad = `${uid}-bhg`;

  return (
    <svg viewBox="0 0 120 300" className="w-full h-full">
      <defs>
        <radialGradient id={headGrad} cx="62%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#f2c98a" />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
      </defs>

      {/* ── HEAD (no transform) ── */}
      <ellipse cx="60" cy="18" rx="13" ry="15" fill={`url(#${headGrad})`} stroke={outlineColor} strokeWidth="0.8" />
      {/* Ears */}
      <ellipse cx="46.5" cy="18" rx="2.5" ry="4" fill={skinDark} />
      <ellipse cx="73.5" cy="18" rx="2.5" ry="4" fill={skinDark} />

      {/* ── FEMALE: coleta visible desde atrás ── */}
      {isFemale && (
        <>
          {/* Hair covering back of head */}
          <path d="M 48,6 C 52,1 68,1 72,6 C 75,10 74,20 73,24 C 68,20 52,20 47,24 C 46,20 45,10 48,6 Z"
            fill={hairColor} />
          {/* Ponytail hanging down from top */}
          <path d="M 55,4 C 54,-2 57,-8 60,-12 C 63,-8 66,-2 65,4 C 63,6 57,6 55,4 Z"
            fill={hairColor} />
          {/* Ponytail strand going down */}
          <path d="M 57,3 C 55,8 54,18 56,28 C 58,34 62,34 64,28 C 66,18 65,8 63,3 C 61,5 59,5 57,3 Z"
            fill={hairColor} />
          {/* Hair tie */}
          <ellipse cx="60" cy="4" rx="5" ry="2" fill={outlineColor} opacity="0.85" />
          {/* Ponytail end */}
          <path d="M 57,26 C 55,32 56,40 60,44 C 64,40 65,32 63,26 Z"
            fill={hairColor} opacity="0.85" />
        </>
      )}

      {/* Neck */}
      <path d="M 55,33 L 65,33 L 65,43 L 55,43 Z" fill={skinMid} />

      {/* ─── TORSO + ARMS GROUP ─── */}
      <g transform={torsoTx(tSx)}>
        {/* Upper traps */}
        <path d="M 55,37 Q 46,40 38,44 L 40,48 Q 47,44 56,41 Z" fill={skinMid} />
        <path d="M 65,37 Q 74,40 82,44 L 80,48 Q 73,44 64,41 Z" fill={skinMid} />

        {/* Rear shoulders */}
        <path d="M 36,43 C 26,42 21,49 21,63 C 21,74 33,77 37,70 C 38,62 37,50 36,43 Z"
          fill={col(sets, 'hombros')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="26" cy="55" rx="3.5" ry="6" fill="rgba(255,255,255,0.2)" />
        <path d="M 84,43 C 94,42 99,49 99,63 C 99,74 87,77 83,70 C 82,62 83,50 84,43 Z"
          fill={col(sets, 'hombros')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="94" cy="55" rx="3.5" ry="6" fill="rgba(255,255,255,0.2)" />

        {/* BACK — upper traps block */}
        <path d="M 38,44 C 38,44 60,40 60,40 C 60,40 82,44 82,44 L 83,70 C 75,67 60,66 45,67 Z"
          fill={col(sets, 'espalda')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="60" cy="52" rx="14" ry="8" fill="rgba(255,255,255,0.18)" />

        {/* Lats */}
        <path d="M 38,68 C 34,80 33,115 39,142 L 81,142 C 87,115 86,80 82,68 C 74,65 46,65 38,68 Z"
          fill={col(sets, 'espalda')} stroke={outlineColor} strokeWidth="0.7" />
        {/* Spine line */}
        <line x1="60" y1="68" x2="60" y2="140" stroke="rgba(0,0,0,0.16)" strokeWidth="0.9" />
        {/* Horizontal back lines (rhomboids / mid trap) */}
        <path d="M 44,78 Q 60,80 76,78"  stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
        <path d="M 42,94 Q 60,96 78,94"  stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
        <path d="M 41,110 Q 60,112 79,110" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
        {/* Lat highlights */}
        <ellipse cx="44" cy="100" rx="4" ry="16" fill="rgba(255,255,255,0.14)" />
        <ellipse cx="76" cy="100" rx="4" ry="16" fill="rgba(255,255,255,0.14)" />

        {/* Left tricep */}
        <path d="M 37,57 C 23,61 20,84 23,108 C 24,114 37,114 38,108 C 38,84 38,61 37,57 Z"
          fill={col(sets, 'triceps')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="25" cy="82" rx="3" ry="8" fill="rgba(255,255,255,0.22)" />
        {/* Right tricep */}
        <path d="M 83,57 C 97,61 100,84 97,108 C 96,114 83,114 82,108 C 82,84 82,61 83,57 Z"
          fill={col(sets, 'triceps')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="95" cy="82" rx="3" ry="8" fill="rgba(255,255,255,0.22)" />

        {/* Left forearm (back view) */}
        <path d="M 22,109 C 20,118 20,136 23,150 C 24,155 37,155 37,150 C 38,136 38,118 37,109 Z"
          fill={col(sets, 'antebrazos')} stroke={outlineColor} strokeWidth="0.7" />
        {/* Right forearm */}
        <path d="M 98,109 C 100,118 100,136 97,150 C 96,155 83,155 83,150 C 82,136 82,118 83,109 Z"
          fill={col(sets, 'antebrazos')} stroke={outlineColor} strokeWidth="0.7" />

        {/* Hands */}
        <ellipse cx="29" cy="159" rx="6" ry="7.5" fill={skinDark} stroke={outlineColor} strokeWidth="0.5" />
        <ellipse cx="91" cy="159" rx="6" ry="7.5" fill={skinDark} stroke={outlineColor} strokeWidth="0.5" />

        {/* Glutes */}
        {isFemale ? (
          <>
            <path d="M 39,142 C 35,152 34,168 37,178 L 83,178 C 86,168 85,152 81,142 Z"
              fill={col(sets, 'femorales_gluteos')} stroke={outlineColor} strokeWidth="0.7" />
            <line x1="60" y1="143" x2="60" y2="177" stroke="rgba(0,0,0,0.13)" strokeWidth="0.8" />
            <ellipse cx="47" cy="162" rx="8" ry="10" fill="rgba(255,255,255,0.16)" />
            <ellipse cx="73" cy="162" rx="8" ry="10" fill="rgba(255,255,255,0.16)" />
          </>
        ) : (
          <>
            <path d="M 41,142 C 37,152 36,168 40,178 L 80,178 C 84,168 83,152 79,142 Z"
              fill={col(sets, 'femorales_gluteos')} stroke={outlineColor} strokeWidth="0.7" />
            <line x1="60" y1="143" x2="60" y2="177" stroke="rgba(0,0,0,0.13)" strokeWidth="0.8" />
            <path d="M 43,170 Q 60,176 77,170" stroke="rgba(0,0,0,0.10)" strokeWidth="0.6" fill="none" />
            <ellipse cx="49" cy="160" rx="7" ry="8" fill="rgba(255,255,255,0.15)" />
            <ellipse cx="71" cy="160" rx="7" ry="8" fill="rgba(255,255,255,0.15)" />
          </>
        )}
      </g>
      {/* ─── END TORSO GROUP ─── */}

      {/* ─── LEGS GROUP ─── */}
      <g transform={legTx(lSx)}>
        {/* Left hamstring */}
        <path d="M 44,175 C 39,187 33,220 38,250 C 40,257 56,258 57,250 C 59,218 60,187 60,175 Z"
          fill={col(sets, 'femorales_gluteos')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="38" cy="212" rx="5" ry="14" fill="rgba(255,255,255,0.15)" />
        {/* Right hamstring */}
        <path d="M 76,175 C 81,187 87,220 82,250 C 80,257 64,258 63,250 C 61,218 60,187 60,175 Z"
          fill={col(sets, 'femorales_gluteos')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="82" cy="212" rx="5" ry="14" fill="rgba(255,255,255,0.15)" />

        {/* Knees back */}
        <ellipse cx="47" cy="252" rx="9"  ry="5.5" fill={skinDark} opacity="0.75" />
        <ellipse cx="73" cy="252" rx="9"  ry="5.5" fill={skinDark} opacity="0.75" />

        {/* Left calf */}
        <path d="M 38,258 C 33,270 34,284 39,293 C 41,298 55,298 57,293 C 58,284 57,266 57,258 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        {/* Calf highlight (gastrocnemius bulge) */}
        <ellipse cx="37" cy="273" rx="3.5" ry="9" fill="rgba(255,255,255,0.22)" />
        <ellipse cx="47" cy="271" rx="3.5" ry="9" fill="rgba(255,255,255,0.16)" />
        {/* Calf separation */}
        <path d="M 47,262 Q 47,275 48,288" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />
        {/* Right calf */}
        <path d="M 82,258 C 87,270 86,284 81,293 C 79,298 65,298 63,293 C 62,284 63,266 63,258 Z"
          fill={col(sets, 'piernas')} stroke={outlineColor} strokeWidth="0.7" />
        <ellipse cx="83" cy="273" rx="3.5" ry="9" fill="rgba(255,255,255,0.22)" />
        <ellipse cx="73" cy="271" rx="3.5" ry="9" fill="rgba(255,255,255,0.16)" />
        <path d="M 73,262 Q 73,275 72,288" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" fill="none" />

        {/* Feet */}
        <ellipse cx="46" cy="298" rx="11" ry="3.5" fill={skinDark} />
        <ellipse cx="74" cy="298" rx="11" ry="3.5" fill={skinDark} />
      </g>
      {/* ─── END LEGS GROUP ─── */}
    </svg>
  );
}

// ─── Legend & labels ──────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#94a3b8', label: 'Sin entrenar' },
  { color: '#60a5fa', label: '1-3 series' },
  { color: '#34d399', label: '4-7 series' },
  { color: '#fbbf24', label: '8-12 series' },
  { color: '#f87171', label: '13+ series' },
];

const MUSCLE_LABELS: Record<string, string> = {
  pecho:             'Pecho',
  espalda:           'Espalda',
  hombros:           'Hombros',
  biceps:            'Bíceps',
  triceps:           'Tríceps',
  antebrazos:        'Antebrazos',
  abdominales:       'Abdominales',
  piernas:           'Piernas',
  femorales_gluteos: 'Fem./Glúteos',
};

export const SOMA_META: Record<string, { label: string; color: string; description: string }> = {
  ectomorfo: { label: 'Ectomorfo', color: '#60a5fa', description: 'Delgado · metabolismo rápido' },
  mesomorfo: { label: 'Mesomorfo', color: '#34d399', description: 'Atlético · gana músculo con facilidad' },
  endomorfo: { label: 'Endomorfo', color: '#fb923c', description: 'Robusto · fuerza natural alta' },
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function BodyMuscleMap({ userId, somatotipo = 'mesomorfo', sexo = 'masculino' }: Props) {
  const [sets, setSets] = useState<MuscleSetMap>({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<string | null>(null);

  // Unique ID prefix to avoid gradient ID collisions when both front+back render
  const uid = `bm-${somatotipo[0]}${sexo[0]}`;

  useEffect(() => {
    getWeeklySetsByMuscle(userId).then((data) => {
      setSets(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Cargando mapa muscular...
      </div>
    );
  }

  const meta = SOMA_META[somatotipo];

  return (
    <div className="space-y-4">
      {/* Somatotipo badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-sm text-muted-foreground">{meta.description}</span>
        <span className="ml-auto text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
          {sexo}
        </span>
      </div>

      {/* Body diagrams */}
      <div className="grid grid-cols-2 gap-4" onMouseLeave={() => setTooltip(null)}>
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground font-medium tracking-widest uppercase">Frontal</p>
          <div className="h-72 flex items-center justify-center">
            <FrontBody sets={sets} somatotipo={somatotipo} sexo={sexo} uid={`${uid}-f`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-center text-muted-foreground font-medium tracking-widest uppercase">Posterior</p>
          <div className="h-72 flex items-center justify-center">
            <BackBody sets={sets} somatotipo={somatotipo} sexo={sexo} uid={`${uid}-b`} />
          </div>
        </div>
      </div>

      {/* Muscle stats grid */}
      <div className="grid grid-cols-3 gap-1.5" onMouseLeave={() => setTooltip(null)}>
        {Object.entries(MUSCLE_LABELS).map(([key, label]) => {
          const n = getSets(sets, key);
          const color = setsToColor(n);
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 bg-muted/50 cursor-default"
              onMouseEnter={() => setTooltip(`${label}: ${n} series — ${setsToLabel(n)}`)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs truncate">{label}</span>
              <span className="text-xs font-bold ml-auto tabular-nums">{n}</span>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <p className="text-xs text-center text-muted-foreground italic">{tooltip}</p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Últimos 7 días de entrenamiento
      </p>
    </div>
  );
}
