import React from "react";

import CharacterIdle1 from "@/assets/icons/character-idle-1.svg";
import CharacterIdle2 from "@/assets/icons/character-idle-2.svg";
import CharacterIdle3 from "@/assets/icons/character-idle-3.svg";
import CharacterNotepadIdle1 from "@/assets/icons/character-notepad-idle-1.svg";
import CharacterNotepadIdle2 from "@/assets/icons/character-notepad-idle-2.svg";
import CharacterNotepadShocked from "@/assets/icons/character-notepad-shocked.svg";
import CharacterNotepadWriting1 from "@/assets/icons/character-notepad-writing-1.svg";
import CharacterNotepadWriting2 from "@/assets/icons/character-notepad-writing-2.svg";
import CharacterNotepadWriting3 from "@/assets/icons/character-notepad-writing-3.svg";
import CharacterNotepadWritingIdle1 from "@/assets/icons/character-notepad-writing-idle-1.svg";
import CharacterNotepadWritingIdle2 from "@/assets/icons/character-notepad-writing-idle-2.svg";

export const CharacterStates = {
  IDLE: "idle",
  IDLE_TALKING: "idle_talking",
  NOTEPAD_IDLE: "notepad_idle",
  NOTEPAD_TALKING: "notepad_talking",
  NOTEPAD_WRITING_IDLE: "notepad_writing_idle",
  NOTEPAD_WRITING: "notepad_writing",
  NOTEPAD_SHOCKED: "notepad_shocked",
} as const;

export type AnimationBehavior = "loop" | "once" | "hold_last";

export interface AnimationFrame {
  icon: React.ReactElement;
  duration: number;
}

export interface StateAnimationConfig {
  frames: AnimationFrame[];
  behavior: AnimationBehavior;
  defaultFrameDuration?: number;
}

const WRITING_LOOP = [
  {
    icon: (
      <CharacterNotepadWriting1
        key="notepad-writing-1"
        width={"100%"}
        height={"100%"}
      />
    ),
    duration: 80,
  },
  {
    icon: (
      <CharacterNotepadWriting2
        key="notepad-writing-2"
        width={"100%"}
        height={"100%"}
      />
    ),
    duration: 80,
  },
  {
    icon: (
      <CharacterNotepadWriting3
        key="notepad-writing-3"
        width={"100%"}
        height={"100%"}
      />
    ),
    duration: 80,
  },
];

export const CharacterStateConfigs: Record<string, StateAnimationConfig> = {
  [CharacterStates.IDLE]: {
    frames: [
      {
        icon: <CharacterIdle1 key="idle-1" width={"100%"} height={"100%"} />,
        duration: 1500,
      },
      {
        icon: <CharacterIdle2 key="idle-2" width={"100%"} height={"100%"} />,
        duration: 150,
      },
    ],
    behavior: "loop",
    defaultFrameDuration: 1000,
  },

  [CharacterStates.IDLE_TALKING]: {
    frames: [
      {
        icon: (
          <CharacterIdle1 key="idle-talking-1" width={"100%"} height={"100%"} />
        ),
        duration: 300,
      },
      {
        icon: (
          <CharacterIdle2 key="idle-talking-2" width={"100%"} height={"100%"} />
        ),
        duration: 200,
      },
      {
        icon: (
          <CharacterIdle3 key="idle-talking-3" width={"100%"} height={"100%"} />
        ),
        duration: 250,
      },
    ],
    behavior: "once",
    defaultFrameDuration: 300,
  },

  [CharacterStates.NOTEPAD_IDLE]: {
    frames: [
      {
        icon: (
          <CharacterNotepadIdle1
            key="notepad-idle-1"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 3000,
      },
    ],
    behavior: "loop",
    defaultFrameDuration: 1000,
  },

  [CharacterStates.NOTEPAD_TALKING]: {
    frames: [
      {
        icon: (
          <CharacterNotepadIdle1
            key="notepad-talking-1"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 1500,
      },
      {
        icon: (
          <CharacterNotepadIdle2
            key="notepad-talking-2"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 150,
      },
    ],
    behavior: "loop",
    defaultFrameDuration: 400,
  },

  [CharacterStates.NOTEPAD_WRITING_IDLE]: {
    frames: [
      {
        icon: (
          <CharacterNotepadWritingIdle1
            key="notepad-writing-idle-1"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 1500,
      },
      {
        icon: (
          <CharacterNotepadWritingIdle2
            key="notepad-writing-idle-2"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 150,
      },
    ],
    behavior: "loop",
    defaultFrameDuration: 1500,
  },

  [CharacterStates.NOTEPAD_WRITING]: {
    frames: [
      ...WRITING_LOOP,
      ...WRITING_LOOP,
      ...WRITING_LOOP,
      ...WRITING_LOOP,
    ],
    behavior: "once",
    defaultFrameDuration: 400,
  },
  [CharacterStates.NOTEPAD_SHOCKED]: {
    frames: [
      {
        icon: (
          <CharacterNotepadShocked
            key="notepad-shocked"
            width={"100%"}
            height={"100%"}
          />
        ),
        duration: 1200,
      },
      ...WRITING_LOOP,
      ...WRITING_LOOP,
    ],
    behavior: "once",
    defaultFrameDuration: 2000,
  },
};

export const CharacterStateIcons = Object.keys(CharacterStateConfigs).reduce(
  (acc, state) => {
    acc[state] = CharacterStateConfigs[state].frames.map((frame) => frame.icon);
    return acc;
  },
  {} as Record<string, React.ReactElement[]>
);

export const getAnimationConfig = (state: string): StateAnimationConfig => {
  return (
    CharacterStateConfigs[state] || CharacterStateConfigs[CharacterStates.IDLE]
  );
};

export const getTotalAnimationDuration = (state: string): number => {
  const config = getAnimationConfig(state);
  return config.frames.reduce((total, frame) => total + frame.duration, 0);
};

export const shouldLoop = (state: string): boolean => {
  const config = getAnimationConfig(state);
  return config.behavior === "loop";
};

export const isOneTimeAnimation = (state: string): boolean => {
  const config = getAnimationConfig(state);
  return config.behavior === "once";
};
