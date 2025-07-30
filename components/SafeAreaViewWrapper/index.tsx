import { verticalScale } from "@/utils/metrics";
import { SafeAreaView } from "react-native-safe-area-context";

const SafeAreaViewWrapper = ({ children, style }) => {
  return (
    <SafeAreaView
      style={[{ flex: 1, paddingVertical: verticalScale(20) }, style]}
    >
      {children}
    </SafeAreaView>
  );
};
