import * as React from "react";
import { FC } from "react";
import { Schema, Table } from "./iceberg-types";

interface Props {
    schema: Schema;
}

export const IcebergMetadata: FC<Props> = ({ schema: schema }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gridTemplateRows: "auto auto",
                rowGap: 5,
                border: "1px solid #333",
                width: "100%",
            }}
        >
            <div style={{ padding: 4, backgroundColor: "#aaa", borderBottom: "2px solid black" }}>ID</div>
            <div style={{ padding: 4, backgroundColor: "#aaa", borderBottom: "2px solid black" }}>Field</div>
            <div style={{ padding: 4, backgroundColor: "#aaa", borderBottom: "2px solid black" }}>Type</div>
            {schema.fields.map((f, i) => (
                <>
                    <div key={f.name + "_id"} style={{ paddingRight: 6, textAlign: "right" }}>
                        {f.id}
                    </div>
                    <div key={f.name + "_name"} style={{ fontWeight: f.required ? "bold" : "inherit" }}>
                        {f.name}
                    </div>
                    <div key={f.name + "_type"} style={{}}>
                        {f.type}
                    </div>
                </>
            ))}
        </div>
    );
};
