rm -rf data/warehouse
rm -f data/*.json
echo "waiting 30 seconds for spark"
pwd
whoami
env | grep -i python
env | grep -i spark
sleep 30
spark-submit --help
spark-submit --verbose \
    -c spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
    -c spark.sql.catalog.spark_catalog=org.apache.iceberg.spark.SparkSessionCatalog \
    -c spark.sql.catalog.spark_catalog.type=hive \
    -c spark.sql.catalog.local=org.apache.iceberg.spark.SparkCatalog \
    -c spark.sql.catalog.local.type=hadoop \
    -c spark.sql.catalog.local.warehouse=/workspaces/react-iceberg/data/warehouse \
    --py-files /workspaces/react-iceberg/test.py \
    test.py
echo "done"