import * as React from "react";
import { FC } from "react";
import { KeyValue, KeyValueContainer } from "./key-value";
import { Snapshot } from "../iceberg-types";

interface Props {
    snapshot: Snapshot[];
}

export const IcebergManifestList: FC<Props> = ({ snapshot }) => {
    if (!snapshot) return <div></div>;
    return (
        <KeyValueContainer>
            <KeyValue key="snapshot" field={null} value={snapshot} elementKey="snapshot" />
        </KeyValueContainer>
    );
};
