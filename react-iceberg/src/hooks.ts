import { useEffect, useState } from "react";
import { getFile, S3Options } from "./file-io";
import { Table } from "./iceberg-types";

interface MetadataRet {
    metadata: Table | undefined;
    error?: string;
    options: S3Options;
}

export function useMetadata(catalog: string, s3Options: S3Options): MetadataRet {
    const [icebergTableMetadata, setIcebergTableMetadata] = useState<Table>();
    const [error, setError] = useState<string>();
    useEffect(() => {
        (async () => {
            const metadataJson = await getFile(catalog, "db/table/metadata/v1.metadata.json", s3Options);
            return JSON.parse(metadataJson.toString());
        })()
            .then(setIcebergTableMetadata)
            .catch((err) => setError(err.message));
    }, [setIcebergTableMetadata]);
    return { metadata: icebergTableMetadata, error, options: s3Options };
}
