import requests
import pyspark
from pyspark.sql import SparkSession

from io import BytesIO
from zipfile import ZipFile



spark = SparkSession.builder.master("local") \
    .appName("react-iceberg") \
    .config("spark.sql.extensions","org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions") \
    .config("spark.sql.catalog.spark_catalog","org.apache.iceberg.spark.SparkSessionCatalog") \
    .config("spark.sql.catalog.spark_catalog.type","hive") \
    .config("spark.sql.catalog.local","org.apache.iceberg.spark.SparkCatalog") \
    .config("spark.sql.catalog.local.type","hadoop") \
    .config("spark.sql.catalog.local.warehouse","/workspaces/react-iceberg/warehouse") \
    .getOrCreate()

df = spark.sql("select 'spark' as hello ")

df.show()



spark.conf.set("spark.sql.caseSensitive", "true")
url = 'https://raw.githubusercontent.com/OTRF/mordor/master/datasets/small/windows/persistence/host/proxylogon_ssrf_rce_poc.zip'
zipFileRequest = requests.get(url)
zipFile = ZipFile(BytesIO(zipFileRequest.content))
jsonFilePath = zipFile.extract(zipFile.namelist()[0])
jsonFilePath

# Creating a Spark Dataframe
df2 = spark.read.json(jsonFilePath)
# Validating Type of Output
df2.createOrReplaceTempView("mordorTable")

spark.sql(
'''
SELECT Hostname,Channel,EventID, Count(*) as count
FROM mordorTable
GROUP BY Hostname,Channel,EventID
ORDER BY count DESC
'''
).show(truncate=False)

df2.write.format("iceberg").saveAsTable("local.db.table")     