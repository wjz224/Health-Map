from google.cloud.sql.connector import Connector
import sqlalchemy
import os

INSTANCE_CONNECTION_NAME = os.environ.get('INSTANCE_CONNECTION_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_NAME = os.environ.get('DB_NAME')

def getconn():
    conn = connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pymysql",
        user=DB_USER,
        password=DB_PASS,
        db=DB_NAME
    )
    return conn

def makeTable(title: str, columns: dir[str, object]):
    metadata = sqlalchemy.MetaData()
    table = sqlalchemy.Table(
        title,
        metadata,
        *[
            sqlalchemy.Column(name, columns[name])
            for name in columns
        ]
    )
    metadata.create_all(pool)
    return table

connector = Connector()
pool = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,
)
