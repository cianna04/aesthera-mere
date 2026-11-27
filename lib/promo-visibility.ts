export type DatedPromotion = {
  isActive?: boolean;
  publishedAt?: string;
  validUntil?: string;
};

export function isPublicPromoOnDate(promo: DatedPromotion, localDate: string): boolean {
  if (promo.isActive === false) return false;
  if (promo.publishedAt && promo.publishedAt.slice(0, 10) > localDate) return false;
  if (promo.validUntil && promo.validUntil < localDate) return false;
  return true;
}
