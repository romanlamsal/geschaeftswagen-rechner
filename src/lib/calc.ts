import type { GlobalState } from "./state.svelte"

export const ELECTRIC_PRICE_THRESHOLD = 70_000

const VAT = 1.19

export function leasingGross(car: GlobalState["car"]): number {
  return car.leasingPriceMode === "gross" ? car.leasingPriceEur : car.leasingPriceEur * VAT
}

export function leasingNet(car: GlobalState["car"]): number {
  return car.leasingPriceMode === "net" ? car.leasingPriceEur : car.leasingPriceEur / VAT
}

export function onePercentRate(
  engineType: GlobalState["geschaeftswagen"]["engineType"],
  grossListPrice: number,
): number {
  if (engineType === "combustion") return 0.01
  if (engineType === "hybrid") return 0.005
  return grossListPrice <= ELECTRIC_PRICE_THRESHOLD ? 0.0025 : 0.005
}

export type GeschaeftswagenBreakdown = {
  leasing: number
  insurance: number
  gV1Prozent: number
  gVPendel: number
  geldwerterVorteil: number
  agSozialAufGV: number
  total: number
}

export function geschaeftswagenCost(state: GlobalState): GeschaeftswagenBreakdown {
  const leasing = leasingNet(state.car)
  const insurance = state.car.insurancePerMonth

  const rate = onePercentRate(state.geschaeftswagen.engineType, state.car.grossListPrice)
  const gV1Prozent = rate * state.car.grossListPrice

  const { commuteMethod, commuteKm, commuteDaysPerMonth } = state.geschaeftswagen
  const gVPendel =
    commuteMethod === "pauschal"
      ? 0.0003 * commuteKm * state.car.grossListPrice
      : 0.00002 * commuteKm * commuteDaysPerMonth * state.car.grossListPrice

  const geldwerterVorteil = gV1Prozent + gVPendel
  const agSozialAufGV = geldwerterVorteil * state.payroll.employerContributionRate

  return {
    leasing,
    insurance,
    gV1Prozent,
    gVPendel,
    geldwerterVorteil,
    agSozialAufGV,
    total: leasing + insurance + agSozialAufGV,
  }
}

export type PrivatBreakdown = {
  leasing: number
  insurance: number
  netNeeded: number
  grossUp: number
  agAnteil: number
  total: number
}

export function privatCost(state: GlobalState): PrivatBreakdown {
  const leasing = leasingGross(state.car)
  const insurance = state.car.insurancePerMonth
  const netNeeded = leasing + insurance
  const grossUp = netNeeded / state.payroll.netGrossRatio
  const agAnteil = grossUp * state.payroll.employerContributionRate
  return {
    leasing,
    insurance,
    netNeeded,
    grossUp,
    agAnteil,
    total: grossUp + agAnteil,
  }
}

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
})

export function formatEur(value: number): string {
  return eurFormatter.format(value)
}
