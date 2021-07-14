import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue, KeyValueContainer } from "./key-value";
import { S3Options } from "../file-io";
import { DataFile, ManifestEntry, ManifestFile, useManifestEntries } from "../hooks";
import { ChartValues } from "./chart-values";
import { Schema } from "../iceberg-types";
import { Selector } from "./selector";

interface BaseProps {
    onLoaded?: (manifestEntries: ManifestEntry[]) => void;
    onSelected?: (manifestEntry: ManifestEntry | undefined) => void;
    selected?: ManifestEntry | undefined;
}
interface LoaderProps extends BaseProps {
    options: S3Options;
    manifestFile: ManifestFile;
}

/** A component that loads then lists all of the Manifest Entries and provides selection events */
export const ManfiestEntrySelectorLoader: FC<LoaderProps> = ({ options, manifestFile, onLoaded, ...props }) => {
    const manifestEntries = useManifestEntries(manifestFile, options);
    useEffect(() => {
        if (!manifestEntries || manifestEntries.length === 0) return;
        onLoaded?.(manifestEntries);
        if (!props.selected) props.onSelected?.(manifestEntries[0]);
    }, [manifestEntries]);
    return <ManfiestEntrySelector manifestEntries={manifestEntries} {...props} />;
};

function getManifestEntryKey(manifestEntry?: ManifestEntry) {
    if (!manifestEntry) return undefined;
    return typeof manifestEntry.data_file === "string" ? manifestEntry.data_file : manifestEntry.data_file.file_path;
}

interface Props extends BaseProps {
    manifestEntries: ManifestEntry[];
}

/** A component that loads then lists all of the Manifest Entries and provides selection events */
export const ManfiestEntrySelector: FC<Props> = ({ manifestEntries, onSelected, selected }) => {
    return (
        <Selector
            items={manifestEntries.map((e) => ({
                key: getManifestEntryKey(e) || "UNKNOWN",
                item: (
                    <div style={{ padding: 3 }}>
                        {typeof e.data_file === "string" ? (
                            <b>e.data_file</b>
                        ) : (
                            <div>
                                <div style={{ display: "block", fontWeight: "bold" }}>
                                    {e.data_file.record_count.toString()} Rows{" "}
                                    {(e.data_file.file_size_in_bytes / 1024n).toLocaleString()}KB
                                </div>
                                <div style={{ display: "block" }}>
                                    {Object.values(e.data_file.partition).join(", ")}
                                </div>
                            </div>
                        )}
                    </div>
                ),
            }))}
            onSelected={(key) =>
                onSelected?.(manifestEntries.find((me) => getManifestEntryKey(me) === key) || undefined)
            }
            selected={getManifestEntryKey(selected)}
        />
    );
};

function getName(o: any): string {
    return o?.__proto__?.constructor?.name;
}

function getRange(lowerBound: Buffer | undefined, upperBound: Buffer | undefined, schemaTypes: string) {
    return `"${lowerBound?.toString() || "..."}" to "${upperBound?.toString() || "..."}"`;
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
            p[c.name] = getRange(lowerBounds?.[c.id]?.value, upperBounds?.[c.id]?.value, "string");
        }
        return p;
    }, {});
    return (
        <KeyValueContainer>
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
        </KeyValueContainer>
    );
};
