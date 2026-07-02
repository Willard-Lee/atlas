export const  CATEGORIES = {
        travel: { color: "var(--secondary)", symbol: "✈" , label: "TRAVERSE"},
        photography: { color: "var(--primary)", symbol:"◉" , label: "CAPTURE"},
        visits: { color: "var(--tertiary)", symbol: "◎", label: "RECON"},
        personal: { color: "var(--on-background)", symbol: "◈", label: "PERSONAL_LOG"},
        readings: { color: "var(--primary-fixed-dim)", symbol: "▣", label: "INTAKE"},
        sports: { color: "var(--error)", symbol: "◆", label: "FIELD_OPS"}
    }

export function getCategory(tags?: string[]){
    if (!tags ) return null;
    return Object.keys(CATEGORIES).find(c => tags.includes(c)) ?? null;
}
