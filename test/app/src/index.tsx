import { Box, ChakraProvider, Heading, HStack } from "@chakra-ui/react";
import * as React from "react";
import { FC, StrictMode, useState } from "react";
import ReactDOM from "react-dom";
import {
    IcebergSchema,
    IcebergManifestListS3,
    IcebergTableS3,
    IcebergManifestEntriesS3,
    IcebergManifestEntry,
} from "react-iceberg";
import { ManifestEntry, ManifestFile } from "react-iceberg/src/hooks";
import { Snapshot, Table } from "react-iceberg/src/iceberg-types";

const BoxStep: FC<{ heading: string }> = ({ heading, children }) => (
    <Box m={5} boxShadow="lg" padding={3}>
        <Heading size="sm">{heading}</Heading> {children}
    </Box>
);

const App: FC = () => {
    const options = {
        accessKeyId: "vscode",
        secretAccessKey: "password",
        // TODO: this should be able to use the proxy (window.location.origin)
        endpoint: "http://localhost:9000",
    };
    const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot>();
    const [table, setTable] = useState<Table>();
    const [manifestFile, setManifestFile] = useState<ManifestFile>();
    const [manifestEntry, setManifestEntry] = useState<ManifestEntry>();
    return (
        <HStack p={4} fontSize="small" overflowX="scroll" alignItems="start">
            <BoxStep heading="Table: Catalog">
                <IcebergTableS3
                    catalog="catalog"
                    onSelectSnapshot={setSelectedSnapshot}
                    selectedSnapshot={selectedSnapshot}
                    onLoadedTable={setTable}
                    options={options}
                />
            </BoxStep>
            {table?.schema && (
                <BoxStep heading="Schema">
                    <IcebergSchema schema={table.schema} />
                </BoxStep>
            )}
            {selectedSnapshot && (
                <BoxStep heading={"Snapshot: " + selectedSnapshot["snapshot-id"]}>
                    <IcebergManifestListS3
                        manifestList={selectedSnapshot["manifest-list"]}
                        onSelected={setManifestFile}
                        options={options}
                    />
                </BoxStep>
            )}
            {manifestFile && (
                <BoxStep heading={"Manifest Entry: " + manifestFile.manifest_path}>
                    <IcebergManifestEntriesS3
                        manifestFile={manifestFile}
                        onSelect={setManifestEntry}
                        selected={manifestEntry}
                        options={options}
                    />
                </BoxStep>
            )}
            {manifestEntry && (
                <BoxStep
                    heading={
                        "Manifest Entry: " +
                        (typeof manifestEntry.data_file === "string"
                            ? manifestEntry.data_file
                            : manifestEntry.data_file.file_path)
                    }
                >
                    <IcebergManifestEntry manifestEntry={manifestEntry} />
                </BoxStep>
            )}
        </HStack>
    );
};

ReactDOM.render(
    <StrictMode>
        <ChakraProvider>
            <App />
        </ChakraProvider>
    </StrictMode>,
    document.getElementById("root")
);
