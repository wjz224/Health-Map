from sklearn.cluster import DBSCAN
import numpy as np
import database
import copy

class Cluster:
    def __init__(self, eps=0.5, min_samples=5, db = database.Database()):
        self.eps = eps
        self.min_samples = min_samples
        self.db = db
        self.db_data = self.db.getClusterData()

    def makeDiseaseGroups(self, data=None):
        # make groups based on diseases
        if not data:
            data = copy.deepcopy(self.db_data)
        diseases = {}
        for point in data:
            for disease in point['DISEASES']:
                if disease not in diseases:
                    diseases[disease] = []
                diseases[disease].append(point["ID"])
        for d, i in enumerate(diseases):
            diseases[i] = list(set(diseases[d]))
        return diseases

    def predictDiseaseGroups(self, data=None):
        # predict disease in people who have an empty disease list based on if they have similar symptoms
        if not data:
            data = copy.deepcopy(self.db_data)
        diseases = self.makeDiseaseGroups(data)
        for point in data:
            if len(point['DISEASES']) == 0:
                for disease in diseases:
                    if len(point["DISEASES"]) > 0:
                        break
                    if len(set(point['SYMPTOMS']).intersection(set(diseases[disease]))) >= 2:
                        point['DISEASES'].append(disease)
        return self.makeDiseaseGroups(data)
