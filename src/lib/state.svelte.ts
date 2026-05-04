export type EngineType = "electric" | "hybrid" | "combustion"
export type CommuteMethod = "pauschal" | "einzelbewertung"
export type PriceMode = "gross" | "net"

export type GlobalState = {
  car: {
    name: string
    grossListPrice: number
    leasingPriceEur: number
    leasingPriceMode: PriceMode
    insurancePerMonth: number
  }
  geschaeftswagen: {
    engineType: EngineType
    commuteKm: number
    commuteMethod: CommuteMethod
    commuteDaysPerMonth: number
  }
  payroll: {
    netGrossRatio: number
    employerContributionRate: number
  }
}

export const globalState = $state<GlobalState>({
  car: {
    name: "Hyundai IONIQ 5 CENTRIQ",
    grossListPrice: 58_300,
    leasingPriceEur: 450,
    leasingPriceMode: "net",
    insurancePerMonth: 150,
  },
  geschaeftswagen: {
    engineType: "electric",
    commuteKm: 60,
    commuteMethod: "einzelbewertung",
    commuteDaysPerMonth: 1,
  },
  payroll: {
    netGrossRatio: 0.6,
    employerContributionRate: 0.2,
  },
})
