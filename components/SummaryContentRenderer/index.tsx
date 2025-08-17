import { useThemeColor } from "@/hooks/useThemeColor";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import React from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Citation = {
  position: number;
  source_ids: number[];
};

type HeadingBlock = {
  type: "heading";
  level: number;
  text: string;
  citations?: number[];
};

type ParagraphBlock = {
  type: "paragraph";
  text: string;
  citations?: Citation[];
};

type ListItem = {
  text: string;
  citations?: number[];
};

type ListBlock = {
  type: "list";
  style: "ordered" | "unordered";
  items: ListItem[];
};

type TableCell = {
  text: string;
  citations?: number[];
};

type TableBlock = {
  type: "table";
  headers: string[];
  rows: TableCell[][];
  caption?: string;
};

type Block = HeadingBlock | ParagraphBlock | ListBlock | TableBlock;

type Source = {
  id: number;
  title: string;
  url: string;
  domain: string;
  author?: string;
  published_at?: string;
  source_type: string;
  favicon?: string;
  excerpt?: string;
};

type SummaryContent = {
  title: string;
  content: {
    blocks: Block[];
  };
  sources: Source[];
};

type MatchData = {
  id: number;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
};

interface SummaryContentRendererProps {
  summaryContent: SummaryContent;
  matchesData: MatchData[];
}

const SummaryContentRenderer: React.FC<SummaryContentRendererProps> = ({
  summaryContent,
  matchesData,
}) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");

  // Create a map for quick source lookup
  const sourceMap = summaryContent.sources.reduce((acc, source) => {
    acc[source.id] = source;
    return acc;
  }, {} as Record<number, Source>);

  // Create a map for matches data lookup
  const matchesMap = matchesData.reduce((acc, match) => {
    acc[match.id] = match;
    return acc;
  }, {} as Record<number, MatchData>);

  const getFaviconUrl = (sourceId: number): string => {
    const source = sourceMap[sourceId];
    const match = matchesMap[sourceId];

    if (source?.favicon) return source.favicon;
    if (match?.favicon) return match.favicon;
    if (source?.domain) {
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${source.domain}`;
    }
    return "https://via.placeholder.com/16";
  };

  const getSourceTitle = (sourceId: number): string => {
    const source = sourceMap[sourceId];
    const match = matchesMap[sourceId];
    return source?.title || match?.title || `Source ${sourceId}`;
  };

  const renderCitation = (sourceIds: number[], index: number) => {
    if (!sourceIds || sourceIds.length === 0) return null;

    return (
      <View key={`citation-${index}`} style={styles.citationContainer}>
        {sourceIds.map((sourceId, idx) => (
          <TouchableOpacity
            key={`source-${sourceId}-${idx}`}
            style={[styles.citationItem, { borderColor }]}
            onPress={() => {
              const source = sourceMap[sourceId] || matchesMap[sourceId];
              if (source?.url) {
                Linking.openURL(source.url);
              }
            }}
          >
            <Image
              source={{ uri: getFaviconUrl(sourceId) }}
              style={styles.citationFavicon}
            />
            <Text
              style={[styles.citationText, { color: textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getSourceTitle(sourceId)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderParagraphWithCitations = (
    text: string,
    citations?: Citation[]
  ) => {
    if (!citations || citations.length === 0) {
      return (
        <Text style={[styles.paragraphText, { color: textColor }]}>{text}</Text>
      );
    }

    // Sort citations by position to handle them in order
    const sortedCitations = [...citations].sort(
      (a, b) => a.position - b.position
    );

    let lastPosition = 0;
    const textParts: any = [];

    sortedCitations.forEach((citation, index) => {
      // Add text before citation
      if (citation.position > lastPosition) {
        textParts.push(
          <Text
            key={`text-${index}`}
            style={[styles.paragraphText, { color: textColor }]}
          >
            {text.slice(lastPosition, citation.position)}
          </Text>
        );
      }

      // Add citation
      textParts.push(renderCitation(citation.source_ids, index));
      lastPosition = citation.position;
    });

    // Add remaining text
    if (lastPosition < text.length) {
      textParts.push(
        <Text
          key="text-end"
          style={[styles.paragraphText, { color: textColor }]}
        >
          {text.slice(lastPosition)}
        </Text>
      );
    }

    return <View style={styles.paragraphWithCitations}>{textParts}</View>;
  };

  const renderHeading = (block: HeadingBlock, index: number) => {
    const headingStyle = [
      styles.heading,
      { color: textColor },
      block.level === 1 && styles.heading1,
      block.level === 2 && styles.heading2,
      block.level === 3 && styles.heading3,
      block.level === 4 && styles.heading4,
      block.level === 5 && styles.heading5,
      block.level === 6 && styles.heading6,
    ];

    return (
      <View key={`heading-${index}`} style={styles.blockContainer}>
        <Text style={headingStyle}>{block.text}</Text>
      </View>
    );
  };

  const renderParagraph = (block: ParagraphBlock, index: number) => {
    return (
      <View key={`paragraph-${index}`} style={styles.blockContainer}>
        {renderParagraphWithCitations(block.text, block.citations)}
      </View>
    );
  };

  const renderList = (block: ListBlock, index: number) => {
    return (
      <View key={`list-${index}`} style={styles.blockContainer}>
        {block.items.map((item, itemIndex) => (
          <View key={`list-item-${itemIndex}`} style={styles.listItem}>
            <Text style={[styles.listBullet, { color: textColor }]}>
              {block.style === "ordered" ? `${itemIndex + 1}.` : "•"}
            </Text>
            <View style={styles.listItemContent}>
              <Text style={[styles.listItemText, { color: textColor }]}>
                {item.text}
              </Text>
              {item.citations && renderCitation(item.citations, itemIndex)}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTable = (block: TableBlock, index: number) => {
    return (
      <View key={`table-${index}`} style={styles.blockContainer}>
        {block.caption && (
          <Text style={[styles.tableCaption, { color: textColor }]}>
            {block.caption}
          </Text>
        )}
        <View style={[styles.table, { borderColor }]}>
          {/* Headers */}
          <View
            style={[
              styles.tableRow,
              styles.tableHeaderRow,
              { backgroundColor: accentColor },
            ]}
          >
            {block.headers.map((header, headerIndex) => (
              <Text
                key={`header-${headerIndex}`}
                style={[styles.tableHeaderCell, { color: "#ffffff" }]}
              >
                {header}
              </Text>
            ))}
          </View>

          {/* Rows */}
          {block.rows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={[styles.tableRow, { borderColor }]}
            >
              {row.map((cell, cellIndex) => (
                <View key={`cell-${cellIndex}`} style={styles.tableCell}>
                  <Text style={[styles.tableCellText, { color: textColor }]}>
                    {cell.text}
                  </Text>
                  {cell.citations && renderCitation(cell.citations, cellIndex)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case "heading":
        return renderHeading(block, index);
      case "paragraph":
        return renderParagraph(block, index);
      case "list":
        return renderList(block, index);
      case "table":
        return renderTable(block, index);
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {summaryContent.content.blocks.map((block, index) =>
        renderBlock(block, index)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(32),
    marginBottom: verticalScale(20),
  },
  blockContainer: {
    marginBottom: verticalScale(16),
  },
  heading: {
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
  },
  heading1: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(36),
  },
  heading2: {
    fontSize: moderateScale(24),
    lineHeight: moderateScale(32),
  },
  heading3: {
    fontSize: moderateScale(20),
    lineHeight: moderateScale(28),
  },
  heading4: {
    fontSize: moderateScale(18),
    lineHeight: moderateScale(26),
  },
  heading5: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
  },
  heading6: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
  },
  paragraphText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(24),
  },
  paragraphWithCitations: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: verticalScale(8),
    alignItems: "flex-start",
  },
  listBullet: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    marginRight: horizontalScale(8),
    minWidth: horizontalScale(20),
  },
  listItemContent: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  listItemText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(24),
  },
  table: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    overflow: "hidden",
  },
  tableCaption: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    backgroundColor: "#007AFF",
  },
  tableHeaderCell: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  tableCell: {
    flex: 1,
    padding: moderateScale(12),
    borderRightWidth: 1,
  },
  tableCellText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(20),
  },
  citationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: horizontalScale(4),
  },
  citationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    marginRight: horizontalScale(4),
    marginVertical: verticalScale(2),
    maxWidth: horizontalScale(120),
  },
  citationFavicon: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: horizontalScale(4),
  },
  citationText: {
    fontSize: moderateScale(10),
    fontFamily: "Inter-Regular",
    flex: 1,
  },
});

export default SummaryContentRenderer;
