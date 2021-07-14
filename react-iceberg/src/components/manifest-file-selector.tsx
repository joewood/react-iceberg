import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue, KeyValueContainer } from "./key-value";
import { S3Options } from "../file-io";
import { ManifestFile, useManifestFiles } from "../hooks";

interface BaseProps {
    selected?: ManifestFile | undefined;
    onSelected?: (manifestFile: ManifestFile) => void;
}

interface LoaderProps extends BaseProps {
    manifestList: string;
    options: S3Options;
    onLoaded?: (manifestFiles: ManifestFile[]) => void;
}

/** Component to load and list the Manifest Files, then provide events for selection  */
export const ManifestFileSelectorLoader: FC<LoaderProps> = ({ options, manifestList, onLoaded, ...props }) => {
    const manifestFiles = useManifestFiles(manifestList, options);
    useEffect(() => {
        if (manifestFiles.length === 0) return;
        onLoaded?.(manifestFiles);
        if (!props.selected) props.onSelected?.(manifestFiles[0]);
    }, [manifestFiles]);
    return <ManifestFileSelector manifestFile={manifestFiles} {...props} />;
};

interface Props extends BaseProps {
    manifestFile: ManifestFile[];
}

export const ManifestFileSelector: FC<Props> = ({ manifestFile }) => {
    return (
        <KeyValueContainer>
            <KeyValue key="ManifestFile" field="manifest-files" value={manifestFile} elementKey="ManifestFile" />
        </KeyValueContainer>
    );
};
