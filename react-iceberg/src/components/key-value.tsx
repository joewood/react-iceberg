import * as React from "react";
import { FC } from "react";

const KeyString: FC<{ field: string; valueString: string; elementKey: string; paddingLeft: number }> = ({
    field,
    valueString,
    elementKey,
    paddingLeft,
}) => (
    <>
        <div key={elementKey + "KEY"} style={{ fontWeight: "bold", paddingLeft }}>
            {field}
        </div>
        <div key={elementKey + "VALUE"} style={{}}>
            {valueString || ""}
        </div>
    </>
);

interface KeyValueProps {
    elementKey: string;
    paddingLeft?: number;
    field: string | null;
    value: boolean | string | number | Array<any> | Record<string, any>;
}

export const KeyValue: FC<KeyValueProps> = ({ field, value, elementKey, paddingLeft = 5 }) => {
    let valueString: string | null = null;
    const props = { paddingLeft, elementKey, field: field + ":", key: elementKey };
    // first check for null values
    if (value === undefined || value === null)
        return (
            <>
                <KeyString valueString="<null>" {...props} />
            </>
        );
    // for string values, just use KeyString directly
    if (typeof value === "string")
        return (
            <>
                <KeyString valueString={value} {...props} />
            </>
        );

    // For number values, check for dates and IDs - otherwise use LocaleString
    if (typeof value === "number" || typeof value === "bigint") {
        valueString = value.toLocaleString();
        if (field?.endsWith("-ms")) valueString = `${new Date(value).toLocaleString()} (${value % 1000} ms)`;
        if (field?.endsWith("-id") || field?.endsWith("_id")) valueString = value.toString();
        return (
            <>
                <KeyString valueString={valueString} {...props} />
            </>
        );
    }
    // For number values, check for dates and IDs - otherwise use LocaleString
    if (typeof value === "boolean") {
        return (
            <>
                <KeyString valueString={value.toString()} {...props} />
            </>
        );
    }

    if (!Array.isArray(value) && !Number.isNaN(Number.parseInt(Object.keys(value)[0]))) {
        value = Object.entries(value).reduce((p, [k, v]) => {
            p[parseInt(k)] = v;
            return p;
        }, [] as any[]);
    }

    // For Arrays, check for zero length arrays return just the name, otherwise iterate over the array
    if (Array.isArray(value)) {
        if (value.length === 0)
            return (
                <>
                    <KeyString
                        key={`${elementKey}.${field}`}
                        elementKey={`${elementKey}.${field}`}
                        field={field!}
                        valueString="[]"
                        paddingLeft={paddingLeft}
                    />
                </>
            );

        if (value instanceof Uint8Array || value instanceof Uint32Array || value instanceof Uint16Array) {
            return (
                <>
                    <KeyString
                        key={`${elementKey}.${field}`}
                        elementKey={`${elementKey}.${field}`}
                        field={field!}
                        valueString={value.toString()}
                        paddingLeft={paddingLeft}
                    />
                </>
            );
        }
        if (typeof value[0] === "number" || typeof value[0] === "bigint")
            return (
                <>
                    <KeyString
                        key={`${elementKey}.${field}`}
                        elementKey={`${elementKey}.${field}`}
                        field={field!}
                        valueString={value.join(", ")}
                        paddingLeft={paddingLeft}
                    />
                </>
            );
        return (
            <>
                {value.map((arrayValue, index) => (
                    <KeyValue
                        key={`${elementKey}.${field}[${index}]`}
                        elementKey={`${elementKey}.${field}[${index}]`}
                        field={`${field!}[${index}]`}
                        value={arrayValue}
                        paddingLeft={paddingLeft}
                    />
                ))}
            </>
        );
    }
    try {
        if ("key" in value && "value" in value) {
            if (!value.value) {
                return <></>;
            } else {
                value = value.value;
                field = field + " (key)";
                return (
                    <>
                        <KeyValue
                            key={`${elementKey}.${field}`}
                            elementKey={`${elementKey}.${field}`}
                            value={value}
                            paddingLeft={paddingLeft}
                            field={field}
                        />
                    </>
                );
            }
        }
    } catch (e) {
        console.error(e);
        return <></>;
    }

    // Lastly, for Objects - output one row for the field name, then iterate over the object
    // call recursively
    return (
        <>
            {field && (
                <KeyString
                    key={elementKey}
                    valueString=""
                    paddingLeft={paddingLeft}
                    elementKey={elementKey}
                    field={field}
                />
            )}
            {Object.entries(value).map(([subKey, subValue]) => (
                <KeyValue
                    key={`${elementKey}.${subKey}`}
                    elementKey={`${elementKey}.${subKey}`}
                    field={subKey}
                    value={subValue}
                    paddingLeft={field ? paddingLeft + 15 : paddingLeft}
                />
            ))}
        </>
    );
};
