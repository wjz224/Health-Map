from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Tuple
from pydantic import BaseModel
from datetime import datetime
from database import Database

app = FastAPI()

db = Database()

# Enable CORS for all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with the actual front-end domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Class to represent Point and its arguments.
class Point(BaseModel):
    pointId = int
    symptoms: Tuple[str, ...]  # Change List to Tuple
    diseases: Tuple[str, ...]  # Change List to Tuple
    longitude: float
    latitude: float
    date: datetime  # This should work without any additional installations

class Filter(BaseModel):
    symptoms: List[str]
    diseases: List[str]

# GET Route to get all the points and their related data from the database
@app.get("/points", description="Get all the points")
async def get_all_points():
    try:
        # Get all points from the database
        all_points = db.getAllPoints()
        # Convert each point in all_points to a Point instance
        formatted_points = [
            Point(
                pointId = point["ID"],
                symptoms=tuple(point["SYMPTOMS"]),  # Convert list to tuple
                diseases=tuple(point["DISEASES"]),  # Convert list to tuple
                longitude=point["LONGITUDE"],
                latitude=point["LATITUDE"],
                date=datetime(2022, 1, 1)
            )
            for point in all_points
        ]
        return {"points": formatted_points}
    except Exception as e:
        # Log the exception for debugging
        print(f"Exception: {e}")
        # Raise HTTPException with a 500 status code
        raise HTTPException(status_code=500, detail="Internal Server Error")

# GET Route to get the specified point's related data from the database
@app.get("/points/{point_id}", description="Get specific point associated with an id")
async def get_specific_point(point_id: int):
    return {"point": point_id}

# POST Route to upload a point and their related data
@app.post("/points", description="Upload a point")
async def upload_point(point: Point):
    return point

@app.get("/points/filter", description="Filter points based on symptoms and diseases")
async def filter_points(symptoms: List[str] = Body(..., embed=True), diseases: List[str] = Body(..., embed=True)):
    points = db.filterPoints(symptoms, diseases)
    formatted_points = [
        Point(
            pointId = point["ID"],
            symptoms=tuple(point["SYMPTOMS"]),
            diseases=tuple(point["DISEASES"]),
            longitude=point["LONGITUDE"],
            latitude=point["LATITUDE"],
            date=datetime(2022, 1, 1)
        )
        for point in points
    ]
    return {"points": formatted_points}
