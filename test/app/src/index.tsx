import * as React from "react";
import { useEffect } from "react";
import { FC, StrictMode, useState } from "react";
import ReactDOM from "react-dom";
import { IcebergMetadata, Table, IcebergTableUpdated } from "react-iceberg";

const App: FC = () => {
    const [icebergTableMetadata, setIcebergTableMetadata] = useState<Table>();
    useEffect(() => {
        (async () => {
            return await (await fetch("/v1.metadata.json")).json();
        })().then(setIcebergTableMetadata);
    }, [setIcebergTableMetadata]);
    return (
        <div>
            <div style={{ width: 600, margin: 5 }}>
                <h2>Update</h2>
                {icebergTableMetadata && <IcebergTableUpdated table={icebergTableMetadata} />}
            </div>
            <div style={{ width: 400, margin: 5 }}>
                <h2>Schema</h2>
                {icebergTableMetadata && <IcebergMetadata schema={icebergTableMetadata.schema} />}
            </div>
        </div>
    );
};

ReactDOM.render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById("root")
);
