import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    ChakraProvider,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import * as React from "react";
import { FC, StrictMode } from "react";
import ReactDOM from "react-dom";
import { IcebergMetadata, IcebergTableUpdated, useManifests, useMetadata } from "react-iceberg";

const App: FC = () => {
    const { metadata, error, options } = useMetadata("catalog", {
        accessKeyId: "vscode",
        secretAccessKey: "password",
        // TODO: this should be able to use the proxy (window.location.origin)
        endpoint: "http://localhost:9000",
    });
    const manifests = useManifests(metadata, options);
    return (
        <Box p={4}>
            {error ? (
                <Alert status="error">
                    <AlertIcon />
                    <AlertTitle mr={2}>Error Loading Metadata</AlertTitle>
                    <AlertDescription>{JSON.stringify(error)}</AlertDescription>
                </Alert>
            ) : (
                <Tabs>
                    <TabList>
                        <Tab>Metadata</Tab>
                        <Tab>Schema</Tab>
                        <Tab>Data</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Box maxWidth={800} m={5}>
                                {metadata && <IcebergTableUpdated table={metadata} options={options} />}
                            </Box>
                        </TabPanel>
                        <TabPanel>
                            <Box maxWidth={800} m={5}>
                                {metadata && <IcebergMetadata schema={metadata.schema} />}
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </Box>
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
