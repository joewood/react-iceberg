import * as React from "react";
import { FC } from "react";
import { KeyValue } from "./common";
import { Snapshot } from "./iceberg-types";

interface Props {
    snapshot: Snapshot[];
}

export const IcebergManifestList: FC<Props> = ({ snapshot }) => {
    if (!snapshot) return <div></div>;
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
            <KeyValue key="snapshot" field={null} value={snapshot} elementKey="snapshot" />
        </div>
    );
};
