import * as React from "react";
import { FC } from "react";
import { Schema } from "../iceberg-types";

interface Props {
    schema: Schema;
}

export const IcebergSchema: FC<Props> = ({ schema: schema }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto auto auto",
                gridTemplateRows: "auto",
                columnGap: 10,
                rowGap: 5,
            }}
        >
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
