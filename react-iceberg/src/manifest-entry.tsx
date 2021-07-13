import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue } from "./common";
import { S3Options } from "./file-io";
import { ManifestEntry, ManifestFile, useManifestEntries } from "./hooks";

interface ManifestEntryPropsS3 {
    options: S3Options;
    manifestFile: ManifestFile;
    onLoad?: (manifestEntries: ManifestEntry[]) => void;
    onSelect?: (manifestEntry: ManifestEntry) => void;
    selected?: ManifestEntry;
}

export const IcebergManifestEntriesS3: FC<ManifestEntryPropsS3> = ({
    options,
    onLoad: onLoadManifestEntry,
    onSelect,
    selected,
    manifestFile,
}) => {
    const manifestEntries = useManifestEntries(manifestFile, options);
    if (!manifestEntries) return <div>NULL</div>;
    useEffect(() => {
        if (!manifestEntries || manifestEntries.length === 0) return;
        onLoadManifestEntry?.(manifestEntries);
        if (!selected) onSelect?.(manifestEntries[0]);
    }, [manifestEntries]);
    return (
        <div
            style={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: "auto 1fr",
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

export const IcebergManifestEntry: FC<{ manifestEntry: ManifestEntry | undefined }> = ({ manifestEntry }) => {
    if (!manifestEntry) return <div>NULL</div>;
    return (
        <div
            style={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: "auto 1fr",
                gridTemplateRows: "auto",
                columnGap: 10,
                rowGap: 5,
            }}
        >
            <KeyValue key="manifest" field={null} value={manifestEntry} elementKey="ManifestEntry" />
        </div>
    );
};
