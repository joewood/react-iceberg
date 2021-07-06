import { useEffect, useState } from "react";
import { deserializeAvro, getFile, S3Options } from "./file-io";
import { Table } from "./iceberg-types";

interface MetadataRet {
    metadata: Table | undefined;
    error?: string;
    options: S3Options;
}

/** Fetch the table's Metadata from S3
 * @param catalog - name of the S3 bucket that contains the table
 * @param s3Options - S3 connection options
 */
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

export function useManifests(metadata: Table | undefined, options: S3Options) {
    const snapshots = metadata?.snapshots;
    useEffect(() => {
        if (!snapshots || !snapshots[0]) return;
        let avroFile = snapshots[0]["manifest-list"];
        avroFile = avroFile.replace("s3a://", "");
        const [bucket, ...pathParts] = avroFile.split("/");
        const path = pathParts.join("/");
        getFile(bucket, path, options).then((manifestAvroBuffer) => {
            // const buffer = Buffer.from(manifestAvroBuffer);
            deserializeAvro(manifestAvroBuffer)
                .then((metadata) => {
                    console.log("SUCCESS", metadata);
                    // if (metadata) readAvro(metadata, manifestAvroBuffer.buffer);
                })
                .catch((err) => console.error("ERROR", err));
        });
    }, [snapshots]);
    return [];
}
