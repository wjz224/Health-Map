from google.cloud.sql.connector import Connector
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
import copy
from os import environ
from random import random
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

class Database:
    def __init__(self):
        self.INSTANCE_CONNECTION_NAME = environ.get('INSTANCE_CONNECTION_NAME')
        self.DB_USER = environ.get('DB_USER')
        self.DB_PASS = environ.get('DB_PASS')
        self.DB_NAME = environ.get('DB_NAME')
        pool = create_engine(
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
        # USERS
        self.conn.execute(text(
            """CREATE TABLE IF NOT EXISTS USERS (
                USERNAME VARCHAR(255) NOT NULL PRIMARY KEY)"""
        ))
        # POINTS
        self.conn.execute(text(
            """CREATE TABLE IF NOT EXISTS POINTS (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    LATITUDE FLOAT NOT NULL,
                    LONGITUDE FLOAT NOT NULL,
                    USERNAME VARCHAR(255) NOT NULL,
                    DATE DATETIME NOT NULL,
                    PIN VARCHAR(5) NOT NULL,
                    FOREIGN KEY (USERNAME) REFERENCES USERS(USERNAME))"""
        ))
        # DISEASES_LIST
        self.conn.execute(text(
            """CREATE TABLE IF NOT EXISTS DISEASES_LIST (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    NAME VARCHAR(255) NOT NULL)"""
        ))
        # SYMPTOMS_LIST
        self.conn.execute(text(
            """CREATE TABLE IF NOT EXISTS SYMPTOMS_LIST (
                    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    NAME VARCHAR(255) NOT NULL)"""
        ))
        # DISEASES
        self.conn.execute(text(
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
        # SYMPTOMS
        self.conn.execute(text(
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
        # POINT_GROUP
        self.conn.execute(text(
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
        self.conn.execute(text("DELETE FROM SYMPTOMS_LIST"))
        for s in symptoms:
            self.conn.execute(text(
                "INSERT INTO SYMPTOMS_LIST (NAME) VALUES (:symptom)"),
                parameters={"symptom":s}
            )
        self.conn.commit()


    def putDiseaseList(self, diseases: iter):
        # Insert the list of diseases into the database
        self.conn.execute(text("DELETE FROM DISEASES_LIST"))
        for d in diseases:
            self.conn.execute(text(
                "INSERT INTO DISEASES_LIST (NAME) VALUES (:disease)"),
                parameters={"disease":d}
            )
        self.conn.commit()

    def getSymptomList(self) -> list:
        # Get the list of symptoms from the database
        result = self.conn.execute(text("SELECT NAME FROM SYMPTOMS_LIST"))
        return [row[0] for row in result]

    def getDiseaseList(self) -> list:
        # Get the list of diseases from the database
        result = self.conn.execute(text("SELECT NAME FROM DISEASES_LIST"))
        return [row[0] for row in result]

    def _stringTime(self, date: datetime) -> str:
        # Convert a datetime object to a string
        return date.strftime("%m-%d-%Y")

    def _fillSymptoms(self, point_id: int, symptoms: iter):
        # Fill the symptoms for a given point
        self.conn.execute(text(
            "DELETE FROM SYMPTOMS WHERE POINT_ID = :point_id"),
            parameters={"point_id":point_id}
        )
        for s in symptoms:
            result = self.conn.execute(text(
                "SELECT ID FROM SYMPTOMS_LIST WHERE NAME = :symptom"),
                parameters={"symptom":s}
            )
            symptom_id = result.fetchone()[0]
            self.conn.execute(text(
                "INSERT INTO SYMPTOMS (POINT_ID, SYMPTOM_ID) VALUES (:point_id, :symptom_id)"),
                parameters={"point_id":point_id, "symptom_id":symptom_id}
            )
        self.conn.commit()

    def _fillDiseases(self, point_id: int, diseases: iter):
        # Fill the diseases for a given point
        self.conn.execute(text(
            "DELETE FROM DISEASES WHERE POINT_ID = :point_id"),
            parameters={"point_id":point_id}
        )
        for d in diseases:
            result = self.conn.execute(text(
                "SELECT ID FROM DISEASES_LIST WHERE NAME = :disease"),
                parameters={"disease":d}
            )
            disease_id = result.fetchone()[0]
            self.conn.execute(text(
                "INSERT INTO DISEASES (POINT_ID, DISEASE_ID) VALUES (:point_id, :disease_id)"),
                parameters={"point_id":point_id, "disease_id":disease_id}
            )
        self.conn.commit()

    def addPoint(self, username: str, latitude: float, longitude: float, symptoms: iter, diseases: iter, pin: str):
        # Add a point to the database
        res = self.conn.execute(text(
            "INSERT INTO POINTS (LATITUDE, LONGITUDE, USERNAME, DATE, PIN) VALUES (:latitude, :longitude, :username, :date, :pin)"),
            parameters={"latitude":latitude, "longitude":longitude, "username":username, "date":datetime.now(), "pin":pin}
        )
        self._fillSymptoms(res.lastrowid, symptoms)
        self._fillDiseases(res.lastrowid, diseases)
        map = self._makeDiseaseGroups()
        self.makeCluster(map)
        self.conn.commit()

    def _getMedInfo(self, table: list[dict]) -> list[dict]:
        # Get the medical information for a point
        for row in table:
            symptoms = self.conn.execute(text(
                "SELECT NAME FROM SYMPTOMS_LIST WHERE ID IN (SELECT SYMPTOM_ID FROM SYMPTOMS WHERE POINT_ID = :point_id)"),
                parameters={"point_id":row["ID"]}
            )
            row["SYMPTOMS"] = [row[0] for row in symptoms]
            diseases = self.conn.execute(text(
                "SELECT NAME FROM DISEASES_LIST WHERE ID IN (SELECT DISEASE_ID FROM DISEASES WHERE POINT_ID = :point_id)"),
                parameters={"point_id":row["ID"]}
            )
            row["DISEASES"] = [row[0] for row in diseases]
        return table


    def getAllPoints(self) -> list[dict]:
        # Get all points from the database
        result = self.conn.execute(text("SELECT (ID, LATITUDE, LONGITUDE, USERNAME, DATE) FROM POINTS"))
        result = [dict(row._mapping) for row in result]
        for row in result:
            row["DATE"] = self._stringTime(row["DATE"])
        result = self._getMedInfo(result)
        result = self._getCluster(result)
        return result

    def addUser(self, username: str):
        # Add a user to the database
        try:
            self.conn.execute(text(
                "INSERT INTO USERS (USERNAME) VALUES (:username)"),
                parameters={"username":username}
            )
            self.conn.commit()
        except IntegrityError:
            pass

    def _wipePoints(self):
        # Wipe all points from the database
        self.conn.execute(text("DROP TABLE SYMPTOMS"))
        self.conn.execute(text("DROP TABLE DISEASES"))
        self.conn.execute(text("DROP TABLE POINTS"))
        # self.conn.execute(text("DELETE FROM POINTS"))
        self.conn.commit()

    def filterPoints(self, symptoms: iter, diseases: iter) -> list[dict]:
        # return a filtered list of points
        result = self.conn.execute(text(
            """SELECT (ID, LATITUDE, LONGITUDE, USERNAME, DATE)
                FROM POINTS
                WHERE ID IN (SELECT POINT_ID FROM SYMPTOMS WHERE SYMPTOM_ID IN (SELECT ID FROM SYMPTOMS_LIST WHERE NAME IN (:symptoms)))
                OR ID IN (SELECT POINT_ID FROM DISEASES WHERE DISEASE_ID IN (SELECT ID FROM DISEASES_LIST WHERE NAME IN (:diseases)))"""),
            parameters={"symptoms": ",".join(symptoms), "diseases": ",".join(diseases)}
        )
        result = [dict(row._mapping) for row in result]
        for row in result:
            row["DATE"] = self._stringTime(row["DATE"])
        self._getMedInfo(result)
        self._getCluster(result)
        return result

    def _getClusterData(self) -> list[dict]:
        # Get relevant info from all points from the database
        result = self.conn.execute(text("SELECT ID, LATITUDE, LONGITUDE FROM POINTS"))
        result = [dict(row._mapping) for row in result]
        self._getMedInfo(result)
        return result

    def makeCluster(self, map: dict[int, list[int]]):
        # Make a cluster of points given a map
        self.conn.execute(text("DELETE FROM POINT_GROUP"))
        for group in map:
            for point in map[group]:
                self.conn.execute(text(
                    "INSERT INTO POINT_GROUP (POINT_ID, GROUP_NUM) VALUES (:point_id, :group_num)"),
                    parameters={"point_id":point, "group_num":group}
                )
        self.conn.commit()

    def _getCluster(self, data: list[dict]) -> list[dict]:
        for row in data:
            result = self.conn.execute(text(
                "SELECT GROUP_NUM FROM POINT_GROUP WHERE POINT_ID = :point_id"),
                parameters={"point_id":row["ID"]}
            )
            row["GROUP"] = result.fetchone()[0]
        return data

    def _makeDiseaseGroups(self) -> dict:
        # make groups based on diseases
        diseases = {}
        for point in self._getClusterData():
            s = ",".join(point['DISEASES'])
            if s not in diseases:
                diseases[s] = []
            diseases[s].append(point["ID"])
        # return diseases
        ret = {}
        for d, i in enumerate(diseases):
            print(d, i)
            ret[i + 1] = diseases[d]
        return ret


    def checkPin(self, pin: str, point_id: int) -> bool:
        # Check if a pin is correct for a given point
        result = self.conn.execute(text(
            "SELECT PIN FROM POINTS WHERE ID = :point_id"),
            parameters={"point_id":point_id}
        )
        if result.fetchone()[0] == pin:
            self.conn.execute(text("DELETE FROM POINTS WHERE ID = :point_id"),
                              parameters={"point_id":point_id}
            )
            self.conn.commit()
            return True
        return False

    def makePoints(self):
        # Add some points for testing
        space = 0.001
        db._wipePoints()
        db.makeTables()
        self.addUser("bob")
        self.addUser("billy")
        self.putDiseaseList(["COVID-19", "Flu", "Cold"])
        self.putSymptomList(["cough", "fever", "sore throat", "runny nose"])
        points = [(40.6041, -75.38249)]
        for _ in range(3):
            temp_points = copy.deepcopy(points)
            for point in temp_points:
                ofset = (random() * space)
                points.append((point[0] + ofset, point[1]))
                ofset = (random() * space)
                points.append((point[0], point[1] + ofset))
                ofset = (random() * space)
                points.append((point[0] + ofset, point[1] + ofset))
                ofset = (random() * space)
                points.append((point[0] + ofset, point[1]))
                ofset = (random() * space)
                points.append((point[0], point[1] + ofset))
            points = list(set(points))
        for i, point in enumerate(points):
            d = None
            if i % 4 == 0:
                d = ["COVID-19"]
            elif i % 4 == 1:
                d = ["Flu"]
            elif i % 4 == 2:
                d = []
            else:
                d = ["Cold"]
            self.addPoint("bob", point[0], point[1], ["cough", "fever"], d, datetime.now(), "80085")
        print(self.getAllPoints())

if __name__ == "__main__":
    db = Database()
    db.makePoints()
