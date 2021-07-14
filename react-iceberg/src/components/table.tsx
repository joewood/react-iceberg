import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue } from "./key-value";
import { S3Options } from "../file-io";
import { useTableS3 } from "../hooks";
import { Snapshot, Table } from "../iceberg-types";

interface BaseProps {
    selected?: Snapshot | undefined;
    onSelect?: (snapshot: Snapshot) => void;
}

interface LoaderProps extends BaseProps {
    options: S3Options;
    catalog: string;
    onLoaded?: (table: Table) => void;
    onErrorLoading?: (error: string) => void;
}

interface Props extends BaseProps {
    table: Table;
}

export const IcebergTableS3: FC<LoaderProps> = ({
    catalog,
    options,
    onLoaded: onLoaded,
    onErrorLoading: onErrorLoading,
    ...other
}) => {
    const { table, error } = useTableS3(catalog, options);
    useEffect(() => {
        if (!table) return;
        // new table is loaded, notify through callback and set the selected snapshot to currentSnapshot
        onLoaded?.(table);
        const currentSnapshot = table.snapshots.find(
            (snapshot) => snapshot["snapshot-id"] === table["current-snapshot-id"]
        );
        currentSnapshot && other.onSelect?.(currentSnapshot);
    }, [table]);
    useEffect(() => (error && onErrorLoading?.(error)) as void, [error]);
    if (!table) return <div>Loading</div>;
    return !!error ? <div>Error Loading Metadata: {error}</div> : <IcebergTable table={table} {...other} />;
};

export const IcebergTable: FC<Props> = ({ table, selected, onSelect }) => {
    const { snapshots, schema, ...other } = table;
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
            <KeyValue key="props" field={null} value={other} elementKey="props" paddingLeft={0} />
            <div style={{ fontWeight: "bold" }}>Snapshots</div>
            <table style={{ margin: 5, justifySelf: "start" }}>
                <thead>
                    <tr>
                        <th>Updated</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshots.map((snapshot) => (
                        <tr key={snapshot["snapshot-id"]} onClick={() => onSelect?.(snapshot)}>
                            <td style={{ padding: 5 }}>{new Date(snapshot["timestamp-ms"]).toLocaleString()}</td>
                            <td style={{ padding: 5 }}>{snapshot.summary.operation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
