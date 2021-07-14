import * as React from "react";
import { FC, useEffect } from "react";
import { KeyValue, KeyValueContainer } from "./key-value";
import { S3Options } from "../file-io";
import { useTableLoader } from "../hooks";
import { Snapshot, Table } from "../iceberg-types";
import { Selector } from "./selector";

interface BaseProps {
    selected?: Snapshot | undefined;
    onSelect?: (snapshot: Snapshot | undefined) => void;
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

export const TableViewLoader: FC<LoaderProps> = ({
    catalog,
    options,
    onLoaded: onLoaded,
    onErrorLoading: onErrorLoading,
    ...other
}) => {
    const { table, error } = useTableLoader(catalog, options);
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
    return !!error ? <div>Error Loading Metadata: {error}</div> : <TableView table={table} {...other} />;
};

export const TableView: FC<Props> = ({ table, selected, onSelect }) => {
    const { snapshots, schema, ...other } = table;
    return (
        <KeyValueContainer>
            <KeyValue key="props" field={null} value={other} elementKey="props" paddingLeft={0} />
            <div style={{ fontWeight: "bold", gridColumn: "1/3" }}>
                <p>Snapshots</p>
                <Selector
                    items={snapshots.map((snapshot) => ({
                        key: snapshot["snapshot-id"].toString(),
                        item: (
                            <div>
                                <b>Timestamp:</b>
                                <span>{new Date(snapshot["timestamp-ms"]).toLocaleString()}</span>
                                <b>{snapshot.summary.operation}</b>
                            </div>
                        ),
                    }))}
                    selected={selected?.["snapshot-id"].toString()}
                    onSelected={(key) =>
                        onSelect?.(snapshots.find((s) => s["snapshot-id"].toString() === key) || undefined)
                    }
                />
            </div>
        </KeyValueContainer>
    );
};
