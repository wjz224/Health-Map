from google.cloud.sql.connector import Connector
import sqlalchemy
import os
from dotenv import load_dotenv
load_dotenv()

class Database:
    def __init__(self):
        self.INSTANCE_CONNECTION_NAME = os.environ.get('INSTANCE_CONNECTION_NAME')
        self.DB_USER = os.environ.get('DB_USER')
        self.DB_PASS = os.environ.get('DB_PASS')
        self.DB_NAME = os.environ.get('DB_NAME')
        pool = sqlalchemy.create_engine(
            "mysql+pymysql://",
            creator=self._getConn
        )
        self.conn = pool.connect()

    def __del__(self):
        # Close the connection when object is deleted
        self.conn.close()

    def _getConn(self):
        # Use the connector to connect to the google cloud sql instance
        connector = Connector()
        conn = connector.connect(
            self.INSTANCE_CONNECTION_NAME,
            "pymysql",
            user=self.DB_USER,
            password=self.DB_PASS,
            db=self.DB_NAME,
        )
        return conn

    def makeTables(self):
        # Create the tables if they don't exist
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS USERS (
                USERNAME VARCHAR(255) NOT NULL PRIMARY KEY)"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS POINTS (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    LATITUDE FLOAT NOT NULL,
                    LONGITUDE FLOAT NOT NULL,
                    USERNAME VARCHAR(255) NOT NULL,
                    DATE DATETIME NOT NULL,
                    FOREIGN KEY (USERNAME) REFERENCES USERS(USERNAME))"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS DISEASES_LIST (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    NAME VARCHAR(255) NOT NULL)"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS SYMPTOMS_LIST (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    NAME VARCHAR(255) NOT NULL)"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS DISEASES (
                    POINT_ID INT NOT NULL,
                    DISEASE_ID INT NOT NULL,
                    FOREIGN KEY (POINT_ID)
                        REFERENCES POINTS(ID)
                        ON DELETE CASCADE,
                    FOREIGN KEY (DISEASE_ID)
                        REFERENCES DISEASES_LIST(ID)
                        ON DELETE CASCADE)"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS SYMPTOMS (
                    POINT_ID INT NOT NULL,
                    SYMPTOM_ID INT NOT NULL,
                    FOREIGN KEY (POINT_ID)
                        REFERENCES POINTS(ID)
                        ON DELETE CASCADE,
                    FOREIGN KEY (SYMPTOM_ID)
                        REFERENCES SYMPTOMS_LIST(ID)
                        ON DELETE CASCADE)"""
        ))
        self.conn.execute(sqlalchemy.text(
            """CREATE TABLE IF NOT EXISTS POINT_GROUP (
                    POINT_ID INT NOT NULL,
                    GROUP_NUM INT NOT NULL,
                    FOREIGN KEY (POINT_ID)
                        REFERENCES POINTS(ID)
                        ON DELETE CASCADE)"""
        ))
        self.conn.commit()

    def putSymptomList(self, symptoms: iter):
        # Insert the list of symptoms into the database
        self.conn.execute(sqlalchemy.text("DELETE FROM SYMPTOMS_LIST"))
        for s in symptoms:
            self.conn.execute(sqlalchemy.text(
                "INSERT INTO SYMPTOMS_LIST (NAME) VALUES (:symptom)"),
                parameters={"symptom":s}
            )
        self.conn.commit()

    def putDiseaseList(self, diseases: iter):
        # Insert the list of diseases into the database
        self.conn.execute(sqlalchemy.text("DELETE FROM DISEASES_LIST"))
        for d in diseases:
            self.conn.execute(sqlalchemy.text(
                "INSERT INTO DISEASES_LIST (NAME) VALUES (:disease)"),
                parameters={"disease":d}
            )
        self.conn.commit()

    def getSymptomList(self):
        # Get the list of symptoms from the database
        result = self.conn.execute(sqlalchemy.text("SELECT NAME FROM SYMPTOMS_LIST"))
        return [row[0] for row in result]

    def getDiseaseList(self):
        # Get the list of diseases from the database
        result = self.conn.execute(sqlalchemy.text("SELECT NAME FROM DISEASES_LIST"))
        return [row[0] for row in result]


# pool = sqlalchemy.create_engine(
#     "mysql+pymysql://",
#     creator=getconn
# )
# with pool.connect() as db_conn:
#     makeTables(db_conn)
db = Database()
db.putDiseaseList(["COVID-19", "Flu", "Cold"])
print(db.getDiseaseList())
