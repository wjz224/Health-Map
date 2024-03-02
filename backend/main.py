from fastapi import FastAPI 

app = FastAPI()
    
@app.get("/")
async def root():
    return {"message" : "hello world"}

@app.post("/points", description = "Get all the points")
async def get_all_points():
    return {"points" : "entire list of points"}

@app.get("/points/{point_id}", description = "Get specific point associated with an id")
async def get_specific_point(point_id: int):
    return {"point" : point_id}