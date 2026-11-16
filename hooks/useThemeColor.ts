// hooks/useThemeColor.ts
import { ThemeContext } from "@/app/_layout";
import { Colors } from "@/constants/Colors";
import { THEMES } from "@/utils/constants";
import { useContext } from "react";
import { useColorScheme } from "react-native";

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props: { light?: string; dark?: string } = {}
) {
  const { theme } = useContext(ThemeContext) as any;
  const systemScheme = useColorScheme() ?? "light";
console.log("Hello");
  // Resolve which scheme to use
  const resolvedScheme =
    theme === THEMES.AUTO
      ? systemScheme // follow system
      : theme === THEMES.DARK
      ? "dark"
      : "light";

  const colorFromProps = props[resolvedScheme];
  return colorFromProps ?? Colors[resolvedScheme][colorName];
}
