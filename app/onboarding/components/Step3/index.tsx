import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";

import BlogsIcon from "@/assets/icons/blogs-icon.svg";
import NewsArticleIcon from "@/assets/icons/news-article.svg";
import RedditIcon from "@/assets/icons/reddit.svg";
import YoutubeIcon from "@/assets/icons/youtube-icon.svg";

import RadioOption from "@/components/RadioOption";
import { useThemeColor } from "@/hooks/useThemeColor";
import { moderateScale, verticalScale } from "@/utils/metrics";

type Step3Props = {
  selectedSources: string[];
  setSelectedSources: (value: string[]) => void;
};

const Step3 = ({ selectedSources, setSelectedSources }: Step3Props) => {
  const textColor = useThemeColor("textColor");
  const intl = useIntl();

  const radioOptions = [
    {
      value: "news",
      label: intl.formatMessage({ id: "news_article" }),
      icon: <NewsArticleIcon />,
    },
    {
      value: "reddit",
      label: intl.formatMessage({ id: "reddit" }),
      icon: <RedditIcon />,
    },
    {
      value: "blogs",
      label: intl.formatMessage({ id: "blogs" }),
      icon: <BlogsIcon />,
    },
    {
      value: "youtube",
      label: intl.formatMessage({ id: "youtube" }),
      icon: <YoutubeIcon />,
    },
  ];

  const handleSelect = (value: string) => {
    if (selectedSources.includes(value)) {
      setSelectedSources(selectedSources.filter((src) => src !== value));
    } else {
      setSelectedSources([...selectedSources, value]);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: textColor }]}>
        <FormattedMessage id="step3_title" />
      </Text>

      <View style={styles.radioGroup}>
        {radioOptions.map((option) => (
          <RadioOption
            key={option.value}
            label={option.label}
            icon={option.icon}
            isSelected={selectedSources.includes(option.value)}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    width: "100%",
    fontSize: moderateScale(35),
    marginBottom: verticalScale(27),
    marginTop: verticalScale(20),
    fontFamily: "SpaceGrotesk-Medium",
  },
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioGroup: {
    width: "100%",
    gap: verticalScale(21),
  },
});

export default Step3;
