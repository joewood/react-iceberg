import { useEffect, useState } from "react";
import { deserializeAvro, getFile, S3Options } from "./file-io";
import { Snapshot, Table } from "./iceberg-types";

interface Partition {
    contains_null: boolean;
    lower_bound: Uint8Array | null;
    upper_bound: Uint8Array | null;
}

export interface Manifest1 {
    schema: ManifestEntry; //	JSON representation of the table schema at the time the manifest was written
    schema_id?: string; //	ID of the schema used to write the manifest as a string
    partition_spec?: string; //fields representation of the partition spec used to write the manifest
    partition_spec_id: string; //	ID of the partition spec used to write the manifest as a string
    format_version: string; //	Table format version number of the manifest as a string
    Type?: any; // of content files tracked by the manifest: “data” or “deletes”
}

export interface ManifestFile {
    manifest_path: string;
    manifest_length: bigint;
    partition_spec_id: number;
    added_snapshot_id?: bigint | null;
    added_data_files_count?: number | null;
    exinsting_data_files_count?: number | null;
    deleted_data_files_count?: number | null;
    partitions?: Partition[] | null;
    added_rows_count?: bigint | null;
    existing_rows_count?: bigint | null;
    deleted_rows_count?: bigint | null;
}

export interface ManifestEntry {
    status: number; //	int with meaning: 0: EXISTING 1: ADDED 2: DELETED	Used to track additions and deletions
    snapshot_id: bigint; //	long	Snapshot id where the file was added, or deleted if status is 2. Inherited when null.
    sequence_number: bigint; //	long	Sequence number when the file was added. Inherited when null.
    data_file: string | DataFile; //	data_file struct (see below)
}

export interface DataFile {
    content: number; //	int with meaning: 0: DATA, 1: POSITION DELETES, 2: EQUALITY DELETES	Type of content stored by the data file: data, equality deletes, or position deletes (all v1 files are data files)
    file_path: string; //	string	Full URI for the file with FS scheme
    file_format: string; //	String file format name, avro, orc or parquet
    partition: any; //	Partition data tuple, schema based on the partition spec output using partition field ids for the struct field ids
    record_count: bigint; //	Number of records in this file
    file_size_in_bytes: bigint; //	long	Total file size in bytes
    block_size_in_bytes: bigint; //	long	Deprecated. Always write a default in v1. Do not write in v2.
    file_ordinal: number; //	int	Deprecated. Do not write.
    sort_columns?: any; //	Deprecated. Do not write.
    column_sizes: Record<string, bigint>; //	map<117: int, 118: long>	Map from column id to the total size on disk of all regions that store the column. Does not include bytes necessary to read other columns, like footers. Leave null for row-oriented formats (Avro)
    value_counts?: Record<number, bigint>; //	map<119: int, 120: long>	Map from column id to number of values in the column (including null and NaN values)
    null_value_counts?: Record<number, bigint>; //	Map from column id to number of null values in the column
    nan_value_counts?: Record<number, bigint>; //	Map from column id to number of NaN values in the column
    distinct_counts?: Record<number, bigint>; //	map<123: int, 124: long>	Deprecated. Do not write.
    lower_bounds?: Record<number, Uint8Array>; //	map<126: int, 127: binary>	Map from column id to lower bound in the column serialized as binary [1]. Each value must be less than or equal to all non-null, non-NaN values in the column for the file [2]
    upper_bounds?: Record<number, Uint8Array>; //>	Map from column id to upper bound in the column serialized as binary [1]. Each value must be greater than or equal to all non-null, non-Nan values in the column for the file [2]
    key_metadata?: Uint8Array; //	binary	Implementation-specific key metadata for encryption
    split_offsets?: bigint[]; //	list<133: long>	Split offsets for the data file. For example, all row group offsets in a Parquet file. Must be sorted ascending
    equality_ids?: number[]; //	list<136: int>	Field ids used to determine row equality in equality delete files. Required when content=2 and should be null otherwise. Fields with ids listed in this column must be present in the delete file
    sort_order_id?: number; //	int
}

interface MetadataRet {
    table: Table | undefined;
    error?: string;
    options: S3Options;
}

/** Fetch the table's Metadata from S3
 * @param catalog - name of the S3 bucket that contains the table
 * @param s3Options - S3 connection options
 */
export function useTableS3(catalog: string, s3Options: S3Options): MetadataRet {
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
    return { table: icebergTableMetadata, error, options: s3Options };
}

function convertS3Path(path: string): { bucket: string; path: string } {
    let avroFile = path.replace("s3a://", "");
    const [bucket, ...pathParts] = avroFile.split("/");
    return { bucket, path: pathParts.join("/") };
}

async function fetcchAvroFile<T extends Object>(url: string, options: S3Options): Promise<[string, T[] | null]> {
    try {
        const { bucket, path } = convertS3Path(url);
        const manifestAvroBuffer = await getFile(bucket, path, options);
        const [data] = await deserializeAvro<T>(manifestAvroBuffer);
        if (!data) throw Error("Null data cannot process file " + path);
        return [url, data];
    } catch (e) {
        throw Error("Error deserializing avro manifest file: " + e.message);
    }
}

export function useManifestFiles(manifestList: string, options: S3Options): ManifestFile[] {
    const [manifestFile, setManifestFile] = useState<ManifestFile[]>();
    useEffect(() => {
        if (!manifestFile) {
            fetcchAvroFile<ManifestFile>(manifestList, options)
                .then(([, manifestList]) => {
                    manifestList && setManifestFile(manifestList);
                })
                .catch((err) => console.error(err));
        }
    }, [manifestList]);
    return manifestFile || [];
}

export function useManifestEntries(manifestFile: ManifestFile, options: S3Options) {
    const [manifestEntry, setManifestEntry] = useState<ManifestEntry[]>();
    useEffect(() => {
        if (!manifestFile) return;
        fetcchAvroFile<ManifestEntry>(manifestFile.manifest_path, options)
            .then(([, manifestEntry]) => manifestEntry && setManifestEntry(manifestEntry))
            .catch((err) => console.error(err));
    }, [manifestFile]);
    return manifestEntry || [];
}

// export function useManifests(metadata: Table | undefined, options: S3Options) {
//     const snapshots = metadata?.snapshots;
//     useEffect(() => {}, [snapshots]);
//     useEffect(() => {
//         if (!snapshots || !snapshots[0]) return;
//         let avroFile = snapshots[0]["manifest-list"];
//         if (!manifests[avroFile]) {
//             fetcchAvroFile(avroFile, options).then(([url, manifest]) => {
//                 setManifests((manifests) => ({ ...manifests, [url]: manifest }));
//             });
//         }
//         const missingManifests = Object.values(manifests).filter((manifest) => !manifests[manifest.manifest_path]);
//         console.log("Missing Manigest", missingManifests);
//         Promise.all(missingManifests.map((manifest) => fetcchAvroFile(manifest.manifest_path, options))).then((ms) => {
//             setManifests((manifests) => ms.reduce((p, c) => ({ ...p, [c[0]]: c[1] }), manifests));
//         });
//     }, [manifests, snapshots]);
//     return manifests;
// }
