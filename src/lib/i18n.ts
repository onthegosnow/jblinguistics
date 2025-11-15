export const languages = ["en", "de", "nl", "fr", "sv", "es", "zh"] as const;
export type Lang = (typeof languages)[number];

