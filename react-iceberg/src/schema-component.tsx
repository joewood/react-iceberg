import * as React from "react";
import { FC } from "react";
import { Schema } from "./iceberg-types";

interface Props {
    schema: Schema;
}

export const IcebergSchema: FC<Props> = ({ schema: schema }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gridTemplateRows: "auto auto",
                rowGap: 5,
                border: "1px solid #333",
                width: "100%",
                padding: 10,
            }}
        >
            <div
                key="ID"
                style={{ padding: 4, backgroundColor: "#aaa", fontWeight: "bold", borderBottom: "2px solid black" }}
            >
                ID
            </div>
            <div
                key="Field"
                style={{ padding: 4, backgroundColor: "#aaa", fontWeight: "bold", borderBottom: "2px solid black" }}
            >
                Field
            </div>
            <div
                key="Type"
                style={{ padding: 4, backgroundColor: "#aaa", fontWeight: "bold", borderBottom: "2px solid black" }}
            >
                Type
            </div>
            {schema.fields.map((f) => (
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
