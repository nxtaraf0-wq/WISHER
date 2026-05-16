export type ThemeId = string;

export interface WishPayload {
  /** To / Recipient */
  t: string;
  /** From / Sender */
  f: string;
  /** Custom Message */
  m: string;
  /** Target Date (ISO YYYY-MM-DD string) */
  d: string;
  /** Theme ID */
  th: ThemeId;
  /** Header Font */
  hf?: string;
  /** Body Font */
  bf?: string;
  /** Wish Mode */
  mo?: 'time' | 'letter';
  /** Background GIF */
  bg?: string;
  /** Photos */
  p1?: string;
  p2?: string;
  p3?: string;
}

export interface SavedWish extends WishPayload {
  id: string;
  createdAt: number;
}
