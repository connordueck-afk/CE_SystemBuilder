export const STANDARD_FUSE_RATINGS = [
  5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 75, 80, 100,
  110, 125, 130, 150, 175, 200, 225, 250, 300, 325, 350,
  400, 450, 500, 600, 750,
];

export function nextStandardFuse(currentA: number): number {
  return STANDARD_FUSE_RATINGS.find((r) => r >= currentA) ?? 750;
}
