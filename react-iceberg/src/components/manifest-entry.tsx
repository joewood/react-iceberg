import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue } from "./key-value";
import { S3Options } from "../file-io";
import { DataFile, ManifestEntry, ManifestFile, useManifestEntries } from "../hooks";
import { ChartValues } from "./chart-values";
import { Schema } from "../iceberg-types";

interface ManifestEntryPropsS3 {
    options: S3Options;
    manifestFile: ManifestFile;
    onLoaded?: (manifestEntries: ManifestEntry[]) => void;
    onSelect?: (manifestEntry: ManifestEntry) => void;
    selected?: ManifestEntry;
}

export const IcebergManifestEntriesS3: FC<ManifestEntryPropsS3> = ({
    options,
    onLoaded,
    onSelect,
    selected,
    manifestFile,
}) => {
    const manifestEntries = useManifestEntries(manifestFile, options);
    if (!manifestEntries) return <div>NULL</div>;
    useEffect(() => {
        if (!manifestEntries || manifestEntries.length === 0) return;
        onLoaded?.(manifestEntries);
        if (!selected) onSelect?.(manifestEntries[0]);
    }, [manifestEntries]);
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto auto",
                gridTemplateRows: "auto",
                columnGap: 10,
                rowGap: 5,
            }}
        >
            <KeyValue
                key="manifest"
                field={null}
                value={manifestEntries.map((e, i) => `Seq:${e.sequence_number || i} (${e.status})`)}
                elementKey="ManifestEntry"
            />
        </div>
    );
};

function getName(o: any): string {
    return o?.__proto__?.constructor?.name;
}

export const IcebergManifestEntry: FC<{ manifestEntry: ManifestEntry | undefined; schema: Schema }> = ({
    manifestEntry,
    schema,
}) => {
    if (!manifestEntry) return <div>NULL</div>;
    const { data_file, ...other } = manifestEntry;
    const {
        column_sizes: columnSizes,
        value_counts: valueCounts,
        distinct_counts: distinctCounts,
        null_value_counts: nullCounts,
        nan_value_counts: nanCounts,
        lower_bounds: lowerBounds,
        upper_bounds: upperBounds,
        ...otherDataFile
    } = typeof data_file !== "string" ? data_file : ({ file_path: data_file } as unknown as DataFile);
    const range = schema.fields.reduce<Record<string, string>>((p, c) => {
        if (lowerBounds?.[c.id]?.value !== undefined || upperBounds?.[c.id]?.value !== undefined) {
            p[c.name] = `"${lowerBounds?.[c.id]?.value?.toString()}" to "${upperBounds?.[c.id]?.value?.toString()}"`;
        }
        return p;
    }, {});
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto auto",
                gridTemplateRows: "auto",
                columnGap: 10,
                rowGap: 5,
            }}
        >
            {columnSizes && <ChartValues values={columnSizes} schema={schema} seriesName="Column Size" />}
            {valueCounts && <ChartValues values={valueCounts} schema={schema} seriesName="Value Counts" />}
            {distinctCounts && <ChartValues values={distinctCounts} schema={schema} seriesName="Distinct Counts" />}
            {nullCounts && <ChartValues values={nullCounts} schema={schema} seriesName="Null Counts" />}
            {nanCounts && nanCounts.length > 0 && (
                <ChartValues values={nanCounts} schema={schema} seriesName="NaN Counts" />
            )}
            <KeyValue
                key="manifest"
                field={null}
                value={{ ...other, ...otherDataFile, ["Column Ranges"]: range }}
                elementKey="ManifestEntry"
            />
        </div>
    );
};
