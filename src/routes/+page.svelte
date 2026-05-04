<script lang="ts">
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { Separator } from "$lib/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group"
import { globalState } from "$lib/state.svelte"
import { formatEur, geschaeftswagenCost, onePercentRate, privatCost } from "$lib/calc"

const gw = $derived(geschaeftswagenCost(globalState))
const pr = $derived(privatCost(globalState))
const ersparnis = $derived(pr.total - gw.total)

let period = $state<"monthly" | "yearly">("monthly")
const periodFactor = $derived(period === "yearly" ? 12 : 1)
const periodSuffix = $derived(period === "yearly" ? "/ Jahr" : "/ Monat")

const ratePercent = $derived(
    onePercentRate(globalState.geschaeftswagen.engineType, globalState.car.grossListPrice) * 100,
)
const rateLabel = $derived(ratePercent.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + "%")

const netGrossPercent = {
    get value() {
        return Math.round(globalState.payroll.netGrossRatio * 100)
    },
    set value(v: number) {
        globalState.payroll.netGrossRatio = (v || 0) / 100
    },
}

const agPercent = {
    get value() {
        return Math.round(globalState.payroll.employerContributionRate * 100)
    },
    set value(v: number) {
        globalState.payroll.employerContributionRate = (v || 0) / 100
    },
}
</script>

<main id="content" class="mx-auto max-w-5xl px-4 py-8 space-y-8">
    <h1 class="text-3xl font-bold">Geschäftswagen ja bitte</h1>

    <section class="space-y-4">
        <h2 class="text-xl font-semibold">Auto & Vertrag</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for="car-name">Name</Label>
                <Input id="car-name" type="text" bind:value={globalState.car.name} placeholder="z.B. Tesla Model Y" />
            </div>
            <div class="space-y-2">
                <Label for="gross-list-price">Bruttolistenpreis (€)</Label>
                <Input id="gross-list-price" type="number" min="0" bind:value={globalState.car.grossListPrice} />
            </div>
            <div class="space-y-2">
                <Label for="leasing-price">Leasingrate / Monat (€)</Label>
                <Input id="leasing-price" type="number" min="0" bind:value={globalState.car.leasingPriceEur} />
                <RadioGroup bind:value={globalState.car.leasingPriceMode} class="grid-cols-2 pt-1">
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="net" id="leasing-net" />
                        <Label for="leasing-net">Netto</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="gross" id="leasing-gross" />
                        <Label for="leasing-gross">Brutto (inkl. MwSt.)</Label>
                    </div>
                </RadioGroup>
            </div>
            <div class="space-y-2">
                <Label for="insurance">Versicherung / Monat (€)</Label>
                <Input id="insurance" type="number" min="0" bind:value={globalState.car.insurancePerMonth} />
            </div>
        </div>
    </section>

    <Separator />

    <section class="space-y-4">
        <h2 class="text-xl font-semibold">Lohnbuchhaltung</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for="net-gross">Netto/Brutto-Verhältnis (%)</Label>
                <Input id="net-gross" type="number" min="1" max="100" bind:value={netGrossPercent.value} />
                <p class="text-xs text-muted-foreground">100 € brutto ergeben {netGrossPercent.value} € netto</p>
            </div>
            <div class="space-y-2">
                <Label for="ag-anteil">Arbeitgeber-Anteil Sozialabgaben (%)</Label>
                <Input id="ag-anteil" type="number" min="0" max="100" bind:value={agPercent.value} />
                <p class="text-xs text-muted-foreground">AG-Anteil auf das Bruttogehalt</p>
            </div>
        </div>
    </section>

    <Separator />

    <div class="flex items-center justify-end gap-4">
        <Label>Zeitraum</Label>
        <RadioGroup bind:value={period} class="grid-cols-2 w-auto">
            <div class="flex items-center gap-2">
                <RadioGroupItem value="monthly" id="period-monthly" />
                <Label for="period-monthly">Monatlich</Label>
            </div>
            <div class="flex items-center gap-2">
                <RadioGroupItem value="yearly" id="period-yearly" />
                <Label for="period-yearly">Jährlich</Label>
            </div>
        </RadioGroup>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section class="space-y-4 rounded-2xl border p-6">
            <h2 class="text-xl font-semibold">Als Geschäftswagen</h2>

            <div class="space-y-2">
                <Label>Antrieb</Label>
                <RadioGroup bind:value={globalState.geschaeftswagen.engineType} class="grid-cols-3">
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="electric" id="engine-electric" />
                        <Label for="engine-electric">Elektro</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="hybrid" id="engine-hybrid" />
                        <Label for="engine-hybrid">Hybrid</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="combustion" id="engine-combustion" />
                        <Label for="engine-combustion">Verbrenner</Label>
                    </div>
                </RadioGroup>
            </div>

            <div class="space-y-2">
                <Label for="commute-km">Entfernung Wohnung ↔ Arbeit (km, einfach)</Label>
                <Input id="commute-km" type="number" min="0" bind:value={globalState.geschaeftswagen.commuteKm} />
            </div>

            <div class="space-y-2">
                <Label>Methode Pendelweg</Label>
                <RadioGroup bind:value={globalState.geschaeftswagen.commuteMethod}>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="pauschal" id="commute-pauschal" />
                        <Label for="commute-pauschal">Pauschal (0,03% × km × Listenpreis / Monat)</Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioGroupItem value="einzelbewertung" id="commute-einzel" />
                        <Label for="commute-einzel">Einzelbewertung (0,002% × km × Tage × Listenpreis)</Label>
                    </div>
                </RadioGroup>
            </div>

            {#if globalState.geschaeftswagen.commuteMethod === "einzelbewertung"}
                <div class="space-y-2">
                    <Label for="commute-days">Fahrten zur Arbeit / Monat</Label>
                    <Input
                        id="commute-days"
                        type="number"
                        min="0"
                        max="15"
                        bind:value={globalState.geschaeftswagen.commuteDaysPerMonth}
                    />
                </div>
            {/if}

            <Separator />

            <dl class="space-y-1 text-sm">
                <div class="flex justify-between">
                    <dt>Leasing (Netto, Vorsteuer-Abzug)</dt>
                    <dd>{formatEur(gw.leasing)}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>Versicherung</dt>
                    <dd>{formatEur(gw.insurance)}</dd>
                </div>
                <div class="flex justify-between text-muted-foreground">
                    <dt>geldwerter Vorteil ({rateLabel}-Anteil)</dt>
                    <dd>{formatEur(gw.gV1Prozent)}</dd>
                </div>
                <div class="flex justify-between text-muted-foreground">
                    <dt>geldwerter Vorteil (Pendelweg)</dt>
                    <dd>{formatEur(gw.gVPendel)}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>AG-Anteil auf gV</dt>
                    <dd>{formatEur(gw.agSozialAufGV)}</dd>
                </div>
            </dl>

            <Separator />

            <div class="flex justify-between text-lg font-semibold">
                <span>Kosten Arbeitgeber {periodSuffix}</span>
                <span>{formatEur(gw.total * periodFactor)}</span>
            </div>
        </section>

        <section class="space-y-4 rounded-2xl border p-6">
            <h2 class="text-xl font-semibold">Privat</h2>
            <p class="text-sm text-muted-foreground">
                Mitarbeiter least das gleiche Auto privat. Arbeitgeber gleicht über zusätzliches Bruttogehalt aus,
                sodass das Netto die Leasingrate + Versicherung deckt.
            </p>

            <Separator />

            <dl class="space-y-1 text-sm">
                <div class="flex justify-between">
                    <dt>Leasing (Brutto)</dt>
                    <dd>{formatEur(pr.leasing)}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>Versicherung</dt>
                    <dd>{formatEur(pr.insurance)}</dd>
                </div>
                <div class="flex justify-between text-muted-foreground">
                    <dt>Brutto-Aufschlag (Netto/Brutto-Quote)</dt>
                    <dd>{formatEur(pr.grossUp)}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>AG-Anteil auf Brutto-Aufschlag</dt>
                    <dd>{formatEur(pr.agAnteil)}</dd>
                </div>
            </dl>

            <Separator />

            <div class="flex justify-between text-lg font-semibold">
                <span>Kosten Arbeitgeber {periodSuffix}</span>
                <span>{formatEur(pr.total * periodFactor)}</span>
            </div>
        </section>
    </div>

    <p class="text-center text-lg">
        Ersparnis als Geschäftswagen:
        <strong class={ersparnis >= 0 ? "text-green-600" : "text-red-600"}>
            {formatEur(ersparnis * periodFactor)} {periodSuffix}
        </strong>
    </p>
</main>
