/** Link que leva a pessoa convidada direto ao aceite do convite de grupo. */
export function linkDeConvite(token: string, origem = window.location.origin): string {
    return `${origem}/grupos?convite=${encodeURIComponent(token)}`;
}
