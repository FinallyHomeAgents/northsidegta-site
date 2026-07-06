export const FUTURE_RESIDENT_LABEL = 'Future NorthSide GTA Resident'

export function buildCardLabel(primaryTown) {
  if (!primaryTown) return 'NorthSide GTA Member'
  if (primaryTown === 'Considering a move to the NorthSide GTA') return FUTURE_RESIDENT_LABEL
  return `${primaryTown} Member`
}
