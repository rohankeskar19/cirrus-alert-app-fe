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

// ---------- Types (updated to new schema) ----------
type Citation = {
  // at least one of these will exist
  source_ids?: number[];
  urls?: string[];

  // optional metadata (not used for layout here, but kept for future)
  position?: number; // character index hint
  label?: string;
  quote?: string;
};

type HeadingBlock = {
  type: "heading";
  id: string;
  level: number;
  text: string;
  citations?: Citation[];
};

type ParagraphBlock = {
  type: "paragraph";
  id: string;
  text: string;
  citations?: Citation[];
};

type ListItem = {
  text: string;
  citations?: Citation[];
};

type ListBlock = {
  type: "list";
  id: string;
  style: "ordered" | "unordered";
  items: ListItem[];
  citations?: Citation[]; // optional block-level citations
};

type TableCell = {
  text: string;
  citations?: Citation[];
};

type TableBlock = {
  type: "table";
  id: string;
  headers: string[];
  rows: TableCell[][];
  caption?: string;
  citations?: Citation[];
};

type Block = HeadingBlock | ParagraphBlock | ListBlock | TableBlock;

type Source = {
  id: number; // 1-based
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
  id: number; // 1-based
  title: string;
  url: string;
  domain: string;
  favicon?: string;
};

interface SummaryContentRendererProps {
  summaryContent: SummaryContent;
  matchesData: MatchData[];
}

// ---------- Component ----------
const SummaryContentRenderer: React.FC<SummaryContentRendererProps> = ({
  summaryContent,
  matchesData,
}) => {
  const textColor = useThemeColor("textColor");
  const backgroundColor = useThemeColor("background");
  const accentColor = useThemeColor("accentColor");
  const borderColor = useThemeColor("inputBorder");

  // Fast lookups
  const sourceMap = summaryContent.sources.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {} as Record<number, Source>);

  const matchesMap = matchesData.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {} as Record<number, MatchData>);

  // ---------- Helpers ----------
  const toDomain = (maybeUrl?: string) => {
    if (!maybeUrl) return undefined;
    try {
      return new URL(maybeUrl).hostname;
    } catch {
      return undefined;
    }
  };

  const faviconForDomain = (domain?: string) => {
    if (!domain) return "https://via.placeholder.com/16";
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
  };

  const getFaviconBySourceId = (sourceId: number): string => {
    const source = sourceMap[sourceId];
    const match = matchesMap[sourceId];
    if (source?.favicon) return source.favicon;
    if (match?.favicon) return match.favicon;
    return faviconForDomain(source?.domain || match?.domain);
  };

  const getSourceTitle = (sourceId: number): string => {
    const source = sourceMap[sourceId];
    const match = matchesMap[sourceId];
    return source?.title || match?.title || `Source ${sourceId}`;
  };

  // Resolve citations → array of clickable "targets"
  type CitationTarget = {
    key: string;
    title: string;
    url: string;
    favicon: string;
  };

  const resolveCitationTargets = (citations?: Citation[]): CitationTarget[] => {
    if (!citations || citations.length === 0) return [];

    const targets: CitationTarget[] = [];

    citations.forEach((c) => {
      if (Array.isArray(c.source_ids)) {
        c.source_ids.forEach((sid) => {
          const src = sourceMap[sid] || matchesMap[sid];
          if (src?.url) {
            targets.push({
              key: `sid:${sid}`,
              title: getSourceTitle(sid),
              url: src.url,
              favicon: getFaviconBySourceId(sid),
            });
          }
        });
      }

      // From direct urls
      if (Array.isArray(c.urls)) {
        c.urls.forEach((u) => {
          const domain = toDomain(u);
          targets.push({
            key: `url:${u}`,
            title: domain || u.replace(/^https?:\/\//, ""),
            url: u,
            favicon: faviconForDomain(domain),
          });
        });
      }
    });

    // Dedupe by URL while preserving order
    const seen = new Set<string>();
    const deduped: CitationTarget[] = [];
    for (const t of targets) {
      if (seen.has(t.url)) continue;
      seen.add(t.url);
      deduped.push(t);
    }
    return deduped;
  };

  const renderCitationChips = (citations?: Citation[], keySuffix?: string) => {
    const targets = resolveCitationTargets(citations);
    if (targets.length === 0) return null;

    return (
      <View key={`cites-${keySuffix}`} style={styles.citationContainer}>
        {targets.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.citationItem, { borderColor }]}
            onPress={() => Linking.openURL(t.url)}
          >
            <Image source={{ uri: t.favicon }} style={styles.citationFavicon} />
            <Text
              style={[styles.citationText, { color: textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
      <View key={`heading-${block.id}-${index}`} style={styles.blockContainer}>
        <Text style={headingStyle}>{block.text}</Text>
        {renderCitationChips(block.citations, `heading-${block.id}`)}
      </View>
    );
  };

  const renderParagraph = (block: ParagraphBlock, index: number) => {
    return (
      <View
        key={`paragraph-${block.id}-${index}`}
        style={styles.blockContainer}
      >
        <Text style={[styles.paragraphText, { color: textColor }]}>
          {block.text}
        </Text>
        {renderCitationChips(block.citations, `para-${block.id}`)}
      </View>
    );
  };

  const renderList = (block: ListBlock, index: number) => {
    return (
      <View key={`list-${block.id}-${index}`} style={styles.blockContainer}>
        {renderCitationChips(block.citations, `list-${block.id}-top`)}

        {block.items.map((item, itemIndex) => (
          <View
            key={`list-item-${block.id}-${itemIndex}`}
            style={styles.listItem}
          >
            <Text style={[styles.listBullet, { color: textColor }]}>
              {block.style === "ordered" ? `${itemIndex + 1}.` : "•"}
            </Text>
            <View style={styles.listItemContent}>
              <Text style={[styles.listItemText, { color: textColor }]}>
                {item.text}
              </Text>
              {renderCitationChips(
                item.citations,
                `list-item-${block.id}-${itemIndex}`
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTable = (block: TableBlock, index: number) => {
    return (
      <View key={`table-${block.id}-${index}`} style={styles.blockContainer}>
        {block.caption && (
          <Text style={[styles.tableCaption, { color: textColor }]}>
            {block.caption}
          </Text>
        )}

        {renderCitationChips(block.citations, `table-${block.id}-top`)}

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
                key={`header-${block.id}-${headerIndex}`}
                style={[styles.tableHeaderCell, { color: "#ffffff" }]}
              >
                {header}
              </Text>
            ))}
          </View>

          {/* Rows */}
          {block.rows.map((row, rowIndex) => (
            <View
              key={`row-${block.id}-${rowIndex}`}
              style={[styles.tableRow, { borderColor }]}
            >
              {row.map((cell, cellIndex) => (
                <View
                  key={`cell-${block.id}-${rowIndex}-${cellIndex}`}
                  style={styles.tableCell}
                >
                  <Text style={[styles.tableCellText, { color: textColor }]}>
                    {cell.text}
                  </Text>
                  {renderCitationChips(
                    cell.citations,
                    `cell-${block.id}-${rowIndex}-${cellIndex}`
                  )}
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
        return renderHeading(block as HeadingBlock, index);
      case "paragraph":
        return renderParagraph(block as ParagraphBlock, index);
      case "list":
        return renderList(block as ListBlock, index);
      case "table":
        return renderTable(block as TableBlock, index);
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
  container: { flex: 1 },
  title: {
    fontSize: moderateScale(24),
    fontFamily: "Inter-Bold",
    lineHeight: moderateScale(32),
    marginBottom: verticalScale(20),
  },
  blockContainer: { marginBottom: verticalScale(16) },
  heading: { fontFamily: "Inter-SemiBold", marginBottom: verticalScale(8) },
  heading1: { fontSize: moderateScale(28), lineHeight: moderateScale(36) },
  heading2: { fontSize: moderateScale(24), lineHeight: moderateScale(32) },
  heading3: { fontSize: moderateScale(20), lineHeight: moderateScale(28) },
  heading4: { fontSize: moderateScale(18), lineHeight: moderateScale(26) },
  heading5: { fontSize: moderateScale(16), lineHeight: moderateScale(24) },
  heading6: { fontSize: moderateScale(14), lineHeight: moderateScale(22) },
  paragraphText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(8),
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
  listItemContent: { flex: 1 },
  listItemText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  table: { borderWidth: 1, borderRadius: moderateScale(8), overflow: "hidden" },
  tableCaption: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1 },
  tableHeaderRow: { backgroundColor: "#007AFF" },
  tableHeaderCell: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(14),
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  tableCell: { flex: 1, padding: moderateScale(12), borderRightWidth: 1 },
  tableCellText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-Regular",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(4),
  },
  citationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: verticalScale(8),
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
    marginBottom: verticalScale(4),
    maxWidth: horizontalScale(160),
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
    maxWidth: horizontalScale(110),
  },
});

export default SummaryContentRenderer;
