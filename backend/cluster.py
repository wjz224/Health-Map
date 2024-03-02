from sklearn.cluster import DBSCAN
import numpy as np
import database

class Cluster:
    def __init__(self, eps=0.5, min_samples=5, db = database.Database()):
        self.eps = eps
        self.min_samples = min_samples
        self.db = db
        self.db_data = self.db.getClusterData()

    def makeDiseaseGroups(self):
        # make groups based on diseases
        diseases = {}
        for point in self.db_data:
            for disease in point['DISEASES']:
                if disease not in diseases:
                    diseases[disease] = []
                diseases[disease].append(point["ID"])
        for d, i in enumerate(diseases):
            diseases[i] = list(set(diseases[d]))
        return diseases
