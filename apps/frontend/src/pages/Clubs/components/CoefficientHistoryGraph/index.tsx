import { Country } from "@fbs2.0/types";
import { FC } from "react";
import Plot from "react-plotly.js";

import { LoadOrError } from "../../../../components/LoadOrError";
import { useCoefficientHistoryGraph } from "../../../../react-query-hooks/coefficient/useCoefficientHistoryGraph";

interface Props {
  country: Country;
}

const CoefficientHistoryGraph: FC<Props> = ({ country }) => {
  const {
    data: graphData,
    isLoading,
    error,
  } = useCoefficientHistoryGraph(country.id);

  const x = graphData?.map(({ season }) => season);

  return (
    <LoadOrError loading={isLoading} error={error}>
      <Plot
        data={[
          {
            x,
            y: graphData?.map(({ totalCoefficient }) => totalCoefficient),
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "#1C2127" },
            name: "Коефіцієнт",
            yaxis: "y2",
          },
          {
            type: "bar",
            x,
            y: graphData?.map(({ rank }) => rank),
            name: "Місце",
            marker: {
              color: "#32A467",
              opacity: 0.7,
            },
            text: graphData?.map(
              ({ place, places }) => `${place} місце (з ${places})`
            ),
            yaxis: "y1",
          },
        ]}
        layout={{
          autosize: true,
          showlegend: false,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          margin: { t: 0, r: 25, l: 25 },
          modebar: { bgcolor: "#ffffff" },
          yaxis2: { side: "left" },
          yaxis: { side: "right", tickvals: [0, 1] },
        }}
        config={{
          editable: false,
          responsive: true,
          scrollZoom: true,
          showSendToCloud: false,
          showEditInChartStudio: false,
          showTips: false,
          doubleClick: "reset",
        }}
      />
    </LoadOrError>
  );
};

export { CoefficientHistoryGraph };
