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

    def makeDiseaseGroups(self, data=None) -> dict:
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

    def predictDiseaseGroups(self, data=None) -> dict:
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

    def cluster(self, data=None) -> dict:
        # cluster the data based on location, symptoms and diseases but giving a higher weight to diseases
        if not data:
            data = copy.deepcopy(self.db_data)
        all_diseases = self.db.getDiseaseList()
        all_symptoms = self.db.getSymptomList()
        X = []
        for point in data:
            x = [point['LATITUDE'], point['LONGITUDE']]
            for disease in all_diseases:
                x.append(1 if disease in point['DISEASES'] else 0)
            for symptom in all_symptoms:
                x.append(1 if symptom in point['SYMPTOMS'] else 0)
            X.append(x)
        X = np.array(X)
        db = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit(X)
        labels = db.labels_
        clusters = {}
        for i, label in enumerate(labels):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(data[i])
        return clusters
