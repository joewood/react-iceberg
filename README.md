## React Iceberg

A set of React components to visualize [Apache Iceberg](https://iceberg.apache.org/) Tables.

## Usage

```bash
$ npm install react-iceberg
```

The component includes the S3 client library, used to access the metadata and manifests in the Apache Iceberg table. This data is loaded using a React Hook.

```typescript
import { IcebergMetadata, IcebergTableUpdated, useMetadata } from "react-iceberg";

const options = {
    accessKeyId: /** S3 Access Key ID */,
    secretAccessKey: /** Secret Access key */,
    // TODO: this should be able to use the proxy (window.location.origin)
    endpoint: /** S3 APi Endpoint */,
}

const Component: FC = () => {
    const { metadata, error, options } = useMetadata(
        "catalog" /** name of the S3 Bucket */,
        options);

    return <IcebergTableUpdated table={metadata} options={options} />

    return <IcebergMetadata schema={metadata.schema} />}
}
```

## Development

These components are in the early stages of development. The repository includes the configuration for a VSCode Development Container. The pre-requisites for development are. It's highly recommended to use the preconfigured dev container environment. Please install Docker, use WSL2 for Windows with Docker for WSL2 enabled.

The dev container environment provides the following:

* [Apache Spark](https://spark.apache.org/) container with a single master running in local mode, this includes the Apache Iceberg libraries and configured catalog
* A [Minio Container](https://github.com/minio/minio) providing an S3 compatible service
* An init-container that runs setup script configuring the S3 based environment
* [Create React App](https://create-react-app.dev/docs/getting-started/) test application for development inside the containerized environment

The Apache Iceberg catalog and table is created using the **create-test-table.py** script, this is submitted using the following command:

```bash
$ spark-submit create-test-table.py
```