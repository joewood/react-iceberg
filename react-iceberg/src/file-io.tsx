import * as AWS from "aws-sdk";

import { Type, streams, types, Schema } from "avsc";
const { BlockDecoder } = streams;

export interface S3Options {
    accessKeyId: string,
    secretAccessKey: string,
    endpoint:string;
}

const longType = types.LongType.__with({
    fromBuffer: (buf: Buffer) => {
        buf.readBigInt64LE();
    },
    toBuffer: (n: bigint) => {
        const buf = Buffer.alloc(8);
        buf.writeBigInt64LE(n);
        return buf;
    },
    fromJSON: BigInt,
    toJSON: Number,
    isValid: (n: bigint) => typeof n == "bigint",
    compare: (n1: bigint, n2: bigint) => {
        return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
    },
});

export async function getFile(bucket: string, path: string, s3Options: S3Options): Promise<Uint8Array> {
    try {
        const client = new AWS.S3({
            ...s3Options,
            signatureVersion: "v4",
            s3ForcePathStyle: true,
            endpoint: s3Options.endpoint || window.location.origin
        });
        const s3Object = await client.getObject({ Bucket: bucket, Key: path }).promise();
        if (!s3Object.Body) throw Error("Contents Empty");
        if (s3Object.Body instanceof Uint8Array) return s3Object.Body;
        if (s3Object.Body instanceof Buffer) return s3Object.Body;
        throw Error("Not compatible type for Buffer S3 Object");
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export function readAvro(schema: Schema, buf: ArrayBufferLike) {
    const t = Type.forSchema(schema);
    const r = t.decode(buf as any);
    console.log(r);
}

export async function deserializeAvro(array8: Uint8Array): Promise<Schema | null> {
    let metadata: Schema | null = null;
    // let data: any = null;
    return new Promise((resolve, reject) => {
        new BlockDecoder({
            parseHook: (schema) => {
                console.log(schema);
                metadata = schema;
                return Type.forSchema(schema, { registry: { long: longType } }); //, { wrapUnions: true });
            },
        })

            .on("data", (_data: any) => {
                console.log("data ");
            })
            .on("metadata", (_meta: any, f: any) => {
                console.log("META", metadata);
            })
            .on("end", () => {
                resolve(metadata);
            })
            .on("error", (err) => reject(err))
            .end(array8.buffer);
    });
}
