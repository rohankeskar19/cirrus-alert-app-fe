import React from "react";

import { StyleSheet, View } from "react-native";

import OnboardingQuestCard from "@/components/OnboardingQuestCard";
import { QuestTemplates } from "@/constants/QuestTemplates";

type Step7Props = {
  selectedQuests: string[];
  setSelectedQuests: (quests: string[]) => void;
};

const Step7 = ({ selectedQuests, setSelectedQuests }: Step7Props) => {
  return (
    <View style={styles.stepContainer}>
      {QuestTemplates.map((quest: any) => (
        <OnboardingQuestCard
          key={quest.id}
          isSelected={selectedQuests.includes(quest.id)}
          quest={quest}
          onAddToggle={(quest) => {
            if (selectedQuests.includes(quest.id)) {
              setSelectedQuests(
                selectedQuests.filter(
                  (id) => id !== quest.id && id !== quest.title
                )
              );
              return;
            } else {
              setSelectedQuests([...selectedQuests, quest.id]);
            }
          }}
          onEdit={(quest) => {}}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Step7;
