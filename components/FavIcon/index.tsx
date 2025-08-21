import GlobeFavIcon from "@/assets/icons/globe-favicon.svg";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

type FaviconProps = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
};

const Favicon: React.FC<FaviconProps> = ({ uri, style }) => {
  const [error, setError] = useState(false);

  const secondaryGray = useThemeColor("secondaryGray");

  if (!uri || error) {
    return (
      <GlobeFavIcon
        width={20}
        height={20}
        style={style}
        color={secondaryGray}
      />
    );
  }

  return (
    <Image source={{ uri }} style={style} onError={() => setError(true)} />
  );
};

export default Favicon;
