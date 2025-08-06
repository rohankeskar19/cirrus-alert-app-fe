import React, { useEffect, useRef, useState } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import EyeOff from "@/assets/icons/eye-off.svg";
import EyeOn from "@/assets/icons/eye-on.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";

// Define input types
type InputType = "email" | "text" | "password";

interface InputProps {
  type?: InputType;
  placeholder: string;
  error?: string;
  showError?: boolean;
  onChangeText: (text: string) => void;
  value: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

/**
 * Input Component
 * A reusable input component with support for different types and error states
 */
const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  error,
  showError = false,
  onChangeText,
  value,
  style,
  inputStyle,
  errorStyle,
  ...props
}) => {
  const [inputFocus, setInputFocus] = useState<boolean>(false);
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(
    type === "password"
  );

  const inputBg = useThemeColor("inputBg");
  const inputBorder = useThemeColor("inputBorder");
  const placeholderGray = useThemeColor("placeholderGray");
  const accentColor = useThemeColor("accentColor");
  const onBackground = useThemeColor("onBackground");

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Determine keyboard type based on input type
  const getKeyboardType = (): "email-address" | "default" => {
    switch (type) {
      case "email":
        return "email-address";
      case "text":
      case "password":
      default:
        return "default";
    }
  };

  const toggleSecureEntry = (): void => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderEyeIcon = (): React.ReactNode => {
    if (type === "password") {
      return (
        <TouchableOpacity
          style={styles.eyeIconContainer}
          onPress={toggleSecureEntry}
          activeOpacity={1}
        >
          <View>{secureTextEntry ? <EyeOn /> : <EyeOff />}</View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const safeOnChangeText = (text: string) => {
    if (isMounted.current) onChangeText(text);
  };

  return (
    <View style={[{ borderRadius: moderateScale(20), width: "100%" }, style]}>
      <View
        style={[
          { backgroundColor: inputBg, borderRadius: moderateScale(20) },
          styles.container,
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            { borderColor: inputBorder },
            showError && error ? styles.inputError : null,
          ]}
        >
          <TextInput
            style={[{ color: onBackground }, styles.input, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={placeholderGray}
            value={value}
            onChangeText={safeOnChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={getKeyboardType()}
            autoCapitalize={type === "email" ? "none" : "sentences"}
            autoCorrect={false}
            selectionColor={accentColor}
            onFocus={() => setInputFocus(true)}
            onBlur={() => setInputFocus(false)}
            {...props}
          />
          {renderEyeIcon()}
        </View>
      </View>
      {showError && error ? (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: verticalScale(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingLeft: horizontalScale(20),
    paddingRight: horizontalScale(14),
    height: verticalScale(56),
  },
  inputError: {
    borderColor: "#FF6E6E",
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Outfit-Regular",
    paddingVertical: verticalScale(10),
  },
  eyeIconContainer: {
    padding: moderateScale(8),
  },
  eyeIcon: {
    fontSize: moderateScale(18),
    color: "#888888",
  },
  errorText: {
    color: "#FF6E6E",
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(16),
    fontFamily: "Outfit-Regular",
  },
});

export default Input;
