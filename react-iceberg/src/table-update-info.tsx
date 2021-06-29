import * as React from "react";
import { FC } from "react";
import { Schema, Snapshot, Table } from "./iceberg-types";

interface Props {
    table: Table;
}

export const IcebergTableUpdated: FC<Props> = ({ table }) => {
    const {
        properties,
        "current-snapshot-id": currentSnapshot,
        "last-updated-ms": lastUpdated,
        location,
        snapshots,
    } = table;
    return (
        <div
            style={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: "auto 1fr",
                gridTemplateRows: "20px auto",
                columnGap: 10,
                border: "1px solid #333",
                padding: 3,
                rowGap: 5,
            }}
        >
            <KeyValue field="Current Snapshot:" value={currentSnapshot} />
            <KeyValue
                field="Last Updated"
                value={new Date(lastUpdated).toLocaleString()}
                elementKey={currentSnapshot.toString() + "Update"}
            />
            <KeyValue field="Location:" value={location} />
            {Object.entries(properties).map(([key, value]) => (
                <KeyValue field={key} value={value} elementKey="properties" />
            ))}
            <KeyValue field="Snapshots" value="" />
            {snapshots.map((snapshot) => (
                <TableSnapshot snapshot={snapshot} />
            ))}
        </div>
    );
};

const KeyValue: FC<{ field: string; value: string | number; elementKey?: string }> = ({
    field,
    value,
    elementKey = "",
}) => (
    <>
        <div key={elementKey + field + "KEY"} style={{ fontWeight: 800, paddingLeft: elementKey.length > 0 ? 20 : 0 }}>
            {field}
        </div>
        <div key={elementKey + field + "VALUE"} style={{}}>
            {value}
        </div>
    </>
);

interface SnapshotProps {
    snapshot: Snapshot;
}

export const TableSnapshot: FC<SnapshotProps> = ({ snapshot }) => {
    const { summary, "snapshot-id": snapshotId, "manifest-list": manifestList, "timestamp-ms": timestampMs } = snapshot;
    return (
        <>
            <KeyValue field="Snapshot ID:" value={snapshotId} elementKey={snapshotId.toString()} />
            {Object.entries(summary).map(([k, v]) => (
                <KeyValue field={k} value={v} elementKey="summary" />
            ))}
            <KeyValue
                field="Timestamp:"
                value={new Date(timestampMs).toLocaleString()}
                elementKey={snapshotId.toString() + "time"}
            />
            <KeyValue field="Manifest List:" value={manifestList} elementKey={snapshotId.toString() + "manifest"} />
        </>
    );
};
