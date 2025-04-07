import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { defaultConfig } from "@tamagui/config/v4";

const interFont = createInterFont();

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: interFont,
    body: interFont,
  },
});

export type AppConfig = typeof tamaguiConfig;

// declare module "tamagui" {
//   interface TamaguiCustomConfig extends AppConfig {}
// }

export default tamaguiConfig;
