import requests
from pyspark.sql import SparkSession
from io import BytesIO
from zipfile import ZipFile

sparkSession = (
    SparkSession.builder.master("local").appName("react-iceberg").getOrCreate()
)

helloDataFrame = sparkSession.sql("select 'spark' as hello ")
helloDataFrame.show()

sparkSession.conf.set("spark.sql.caseSensitive", "true")
url = "https://raw.githubusercontent.com/OTRF/mordor/master/datasets/small/windows/persistence/host/proxylogon_ssrf_rce_poc.zip"
zipFileRequest = requests.get(url)
zipFile = ZipFile(BytesIO(zipFileRequest.content))
jsonFilePath = zipFile.extract(zipFile.namelist()[0], "/tmp")

# Creating a Spark Dataframe
dataFrame = sparkSession.read.json(jsonFilePath)
# Validating Type of Output
dataFrame.createOrReplaceTempView("mordorTable")

summaryDf = sparkSession.sql(
    """
SELECT Hostname,Channel,EventID, Count(*) as count
FROM mordorTable
GROUP BY Hostname,Channel,EventID
ORDER BY count DESC
"""
)

summaryDf.show(truncate=False)

dataFrame.write.format("iceberg").saveAsTable("local.db.table", partitionBy="Channel", mode="overwrite", format="parquet")
