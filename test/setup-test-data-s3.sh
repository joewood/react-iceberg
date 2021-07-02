rm -rf test/warehouse
echo "waiting 20 seconds for spark"
cd /workspaces/react-iceberg/test
sleep 20

# Spark Catalog implementation class: https://spark.apache.org/docs/latest/configuration.html#~:text:=spark.sql.catalog.spark_catalog 
# https://iceberg.apache.org/spark-configuration/
# org.apache.iceberg.spark.SparkSessionCatalog adds support for Iceberg tables to Spark’s built-in catalog, and delegates to the built-in catalog for non-Iceberg tables
# Minio config from here: https://github.com/minio/minio/issues/10744

spark-submit --verbose \
    --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
    --conf spark.sql.catalog.spark_catalog=org.apache.iceberg.spark.SparkSessionCatalog \
    --conf spark.sql.catalog.spark_catalog.type=hive \
    --conf spark.sql.catalog.local=org.apache.iceberg.spark.SparkCatalog \
    --conf spark.sql.catalog.local.warehouse=s3a://catalog \
    --conf spark.sql.catalog.local.type=hadoop \
    --conf spark.hadoop.fs.s3a.path.style.access=true \
    --conf spark.hadoop.fs.s3a.committer.name=directory \
    --conf spark.hadoop.fs.s3a.committer.staging.tmp.path=/tmp/staging  \
    --conf spark.hadoop.fs.s3a.access.key=vscode \
    --conf spark.hadoop.fs.s3a.secret.key=password \
    --conf spark.hadoop.fs.s3a.endpoint=http://minio:9000 \
    --conf spark.hadoop.fs.s3a.connection.ssl.enabled=false \
    --jars "spark/jars/hadoop-aws-2.8.5.jar,spark/jars/httpclient-4.5.3.jar,spark/jars/aws-java-sdk-core-1.11.234.jar,spark/jars/aws-java-sdk-kms-1.11.234.jar,spark/jars/aws-java-sdk-1.11.234.jar,spark/jars/aws-java-sdk-s3-1.11.234.jar,spark/jars/joda-time-2.9.9.jar" \
    --py-files /workspaces/react-iceberg/test/create-test-table.py \
    --verbose \
    create-test-table.py
echo "Ready..."
