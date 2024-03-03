import database
import copy

class Cluster:
    def __init__(self, db = database.Database()):
        self.db = db
        self.db_data = self.db.getClusterData()

    def makeDiseaseGroups(self, data=None) -> dict:
        # make groups based on diseases
        if not data:
            data = copy.deepcopy(self.db_data)
        diseases = {}
        for point in data:
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
