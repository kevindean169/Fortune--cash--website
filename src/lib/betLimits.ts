export interface CartLimitItem {
  gameId?: string
  gameName: string
  drawTime: string
  amount: number
}

function normalizeKey(value: string | undefined): string {
  return (value || '').trim().toLowerCase()
}

export function getCartHeldAmount(
  cart: CartLimitItem[],
  gameId: string | undefined,
  gameName: string | undefined,
  drawTime: string,
): number {
  const normalizedGameId = normalizeKey(gameId)
  const normalizedGameName = normalizeKey(gameName)
  const normalizedDrawTime = normalizeKey(drawTime)

  if (!normalizedGameId && !normalizedGameName) return 0

  return cart.reduce((sum, item) => {
    const sameGame = normalizedGameId
      ? normalizeKey(item.gameId) === normalizedGameId
      : normalizeKey(item.gameName) === normalizedGameName

    if (!sameGame || normalizeKey(item.drawTime) !== normalizedDrawTime) return sum
    return sum + item.amount
  }, 0)
}

export function clampRemainingLimit(limit: number): number {
  if (!Number.isFinite(limit)) return limit
  return Math.max(limit, 0)
}
