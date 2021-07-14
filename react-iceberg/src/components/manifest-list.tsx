import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue } from "./key-value";
import { S3Options } from "../file-io";
import { ManifestFile, useManifestFiles } from "../hooks";

interface ManifestListPropsBase {
    selected?: ManifestFile | undefined;
    onSelected?: (manifestFile: ManifestFile) => void;
}

interface ManifestListPropsS3 extends ManifestListPropsBase {
    manifestList: string;
    options: S3Options;
    onLoaded?: (manifestFiles: ManifestFile[]) => void;
}

export const IcebergManifestListS3: FC<ManifestListPropsS3> = ({ options, manifestList, onLoaded, ...other }) => {
    const manifestFiles = useManifestFiles(manifestList, options);
    useEffect(() => {
        if (manifestFiles.length === 0) return;
        onLoaded?.(manifestFiles);
        if (!other.selected) other.onSelected?.(manifestFiles[0]);
    }, [manifestFiles]);
    return <IcebergManifestList manifestFile={manifestFiles} {...other} />;
};

interface Props extends ManifestListPropsBase {
    manifestFile: ManifestFile[];
}

export const IcebergManifestList: FC<Props> = ({ manifestFile }) => {
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
            <KeyValue key="ManifestFile" field="manifest-files" value={manifestFile} elementKey="ManifestFile" />
        </div>
    );
};
