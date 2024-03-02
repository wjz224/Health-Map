from sklearn.cluster import DBSCAN
import numpy as np
import database

class Cluster:
    def __init__(self, eps=0.5, min_samples=5):
        self.eps = eps
        self.min_samples = min_samples
        self.db = database.Database()

    def _makeData(self):
        data = self.db.getClusterData()
