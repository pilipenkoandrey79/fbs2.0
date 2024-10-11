import { GroupRow, BaseMatch, ChessCell } from "@fbs2.0/types";
import { getResultLabel } from "./common";

const RESULT_PLACEHOLDER = "- : -";

export const addChessTable = (rows: GroupRow[], matchesOfGroup: BaseMatch[]) =>
  rows.map((row, rowIndex, arr) => ({
    ...row,
    chessCells: new Array(rows.length)
      .fill(1)
      .map<ChessCell>((_, columnIndex) => {
        if (rowIndex === columnIndex) {
          return { label: "", match: null };
        }

        const rival = arr[columnIndex]?.team;

        const match = matchesOfGroup.find(
          ({ host, guest }) => host.id === row.team.id && guest.id === rival?.id
        );

        const label = match
          ? getResultLabel(match, { tech: match.tech ?? false }) ||
            RESULT_PLACEHOLDER
          : "";

        return {
          date: match?.date ?? "",
          label,
          match: match || null,
        };
      }),
  }));
