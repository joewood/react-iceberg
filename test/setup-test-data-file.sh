rm -rf test/warehouse
echo "waiting 20 seconds for spark"
pwd
cd /workspaces/react-iceberg/test
sleep 20
spark-submit --verbose \
    -c spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
    -c spark.sql.catalog.spark_catalog=org.apache.iceberg.spark.SparkSessionCatalog \
    -c spark.sql.catalog.spark_catalog.type=hive \
    -c spark.sql.catalog.local=org.apache.iceberg.spark.SparkCatalog \
    -c spark.sql.catalog.local.type=hadoop \
    -c spark.sql.catalog.local.warehouse=/workspaces/react-iceberg/test/warehouse \
    --py-files /workspaces/react-iceberg/test/create-test-table.py \
    create-test-table.py
echo "Ready..."