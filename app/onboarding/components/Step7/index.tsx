import React, { useState } from "react";

import { StyleSheet, View } from "react-native";

import OnboardingQuestCard from "@/components/OnboardingQuestCard";
import QuestBottomSheet from "@/components/QuestBottomSheet";
import { QuestTemplates } from "@/constants/QuestTemplates";
import { Quest } from "@/types";

type Step7Props = {
  selectedQuests: string[];
  setSelectedQuests: (quests: string[]) => void;
};

const Step7 = ({ selectedQuests, setSelectedQuests }: Step7Props) => {
  const [questData, setQuestData] = useState(QuestTemplates);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);

  return (
    <View style={styles.stepContainer}>
      {questData.map((quest: any) => (
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
          onEdit={(quest) => {
            setCurrentQuest(quest);
          }}
        />
      ))}

      <QuestBottomSheet
        visible={currentQuest != null}
        editingQuest={currentQuest}
        onDismiss={() => setCurrentQuest(null)}
        onQuestCreated={() => {}}
        onQuestUpdated={(updatedQuest) => {
          setQuestData((prevState: any) =>
            prevState.map((quest: Quest) =>
              quest.id === updatedQuest.id ? updatedQuest : quest
            )
          );
          setCurrentQuest(null);
        }}
      />
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
