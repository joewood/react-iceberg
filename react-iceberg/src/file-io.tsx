import * as AWS from "aws-sdk";

import { Type, streams, types, Schema } from "avsc";
const { BlockDecoder } = streams;
var toBuffer = require("typedarray-to-buffer");

export interface S3Options {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
}

function bufToBn(buf: Uint8Array) {
    const byt = buf.slice(buf.byteOffset, buf.byteOffset + 8);
    const hex = byt.reduce((p, i) => {
        var h = i.toString(16);
        if (h.length % 2) {
            h = "0" + h;
        }
        return h + p;
    }, "");
    return BigInt("0x" + hex);
}

const longType = types.LongType.__with({
    fromBuffer: (buf: Uint8Array) => {
        const ttt = bufToBn(buf);
        return ttt;
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
            endpoint: s3Options.endpoint || window.location.origin,
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

export async function deserializeAvro<T extends Object>(array8: Uint8Array): Promise<[T[], Schema | null]> {
    let metadata: Schema | null = null;
    const buffer: Buffer = Buffer.from(toBuffer(array8));
    let decodeType: Type | null = null;
    let moreData: T[] = [];
    return new Promise((resolve, reject) => {
        new BlockDecoder({
            noDecode: true,
            parseHook: (schema) => {
                metadata = schema;
                decodeType = Type.forSchema(schema, { registry: { long: longType } }); //, { wrapUnions: true });
                return decodeType;
            },
        })

            .on("data", (_data: any) => {
                if (!decodeType) {
                    reject("Error deserializing: Schema not found in file");
                    return;
                }
                try {
                    moreData.push(decodeType.fromBuffer(toBuffer(_data)) as T);
                } catch (e) {
                    reject("Error deserializing: " + e.message);
                }
            })
            .on("end", () => {
                resolve([moreData, metadata]);
            })
            .on("error", (err) => {
                console.error("Error", err);
                reject(err);
            })
            .end(buffer);
    });
}
