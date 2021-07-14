import * as React from "react";
import { cloneElement, FC, ReactNode } from "react";

interface Props {
    items: { key: string; item: ReactNode }[];
    selected: string | undefined;
    onSelected: (item: string) => void;
}

export function Selector({ items, selected, onSelected }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", cursor: "pointer" }}>
            {items.map(({ key, item }, index) => (
                <div
                    key={key}
                    onClick={() => onSelected(key)}
                    style={{ backgroundColor: selected === key ? "#eee" : "#fff", margin: 2 }}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}
