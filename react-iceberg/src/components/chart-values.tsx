import * as React from "react";
import { FC, useMemo } from "react";
import { AxisOptions, Chart, UserSerie } from "react-charts";
import { Schema } from "../iceberg-types";

type KeyValue = { key: string; value: bigint | number };

interface Props {
    values: KeyValue[];
    schema: Schema;
    seriesName: string;
}

export const ChartValues: FC<Props> = ({ values, schema, seriesName }) => {
    const data = useMemo<UserSerie<KeyValue>[]>(
        () => [
            {
                label: seriesName,
                data: values,
            },
        ],
        []
    );
    const primaryAxis = useMemo<AxisOptions<KeyValue>>(
        () => ({
            isPrimary: true,
            scaleType: "band",
            showGrid: false,
            show: false,
            position: "bottom",
            getValue: (datum) => datum.key,
            formatters: {
                tooltip: (x, f) => schema.fields[x as unknown as number]?.name,
            },
        }),
        []
    );

    const secondaryAxes = useMemo<AxisOptions<KeyValue>[]>(
        () => [
            {
                scaleType: "linear",
                position: "left",
                getValue: (datum) => (typeof datum.value === "bigint" ? parseInt(datum.value.toString()) : datum.value),
                elementType: "bar",
            },
        ],
        []
    );
    return (
        <div
            style={{
                width: "800px",
                height: "300px",
                gridColumn: "1/3",
            }}
        >
            <Chart<KeyValue> options={{ data, primaryAxis, secondaryAxes, groupingMode: "primary", tooltip: true }} />
        </div>
    );
};
