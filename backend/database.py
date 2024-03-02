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

def makeTables(db_conn):
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS POINTS (
            ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            LATITUDE FLOAT NOT NULL,
            LONGITUDE FLOAT NOT NULL,
            USERNAME VARCHAR(255) NOT NULL,
            DATE DATETIME NOT NULL
            FOREIGN KEY (USERNAME) REFERENCES USERS(USERNAME)"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS DISEASES_LIST (
            ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            NAME VARCHAR(255) NOT NULL)"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS SYMPTOMS_LIST (
            ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            NAME VARCHAR(255) NOT NULL)"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS DISEASES (
            POINT_ID INT NOT NULL,
            DISEASE_ID INT NOT NULL,
            FOREIGN KEY (POINT_ID) REFERENCES POINTS(ID),
            FOREIGN KEY (DISEASE_ID) REFERENCES DISEASES_LIST(ID))"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS SYMPTOMS (
            POINT_ID INT NOT NULL,
            SYMPTOM_ID INT NOT NULL,
            FOREIGN KEY (POINT_ID) REFERENCES POINTS(ID),
            FOREIGN KEY (SYMPTOM_ID) REFERENCES SYMPTOMS_LIST(ID))"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS USERS (
            USERNAME VARCHAR(255) NOT NULL PRIMARY KEY)"""
    ))
    db_conn.execute(sqlalchemy.text(
        """CREATE TABLE IF NOT EXISTS GROUPS (
            POINT_ID INT NOT NULL,
            GROUP_NUM INT NOT NULL,
            FOREIGN KEY (POINT_ID) REFERENCES POINTS(ID))"""
    ))
    db_conn.commit()


connector = Connector()
pool = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,
)
pool.connect()
