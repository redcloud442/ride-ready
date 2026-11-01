/** API decimals arrive as strings; null stays null. */
export const toNumber = (value: string | null | undefined) => (value == null ? null : Number(value));
