import asyncio
from pymongo import MongoClient

def main():
    client = MongoClient("mongodb://localhost:27017")
    db = client["legal_rag"]
    users = list(db.users.find({}, {"_id": 0, "username": 1, "email": 1}))
    print("USERS:", users)
    admins = list(db.admins.find({}, {"_id": 0, "adminid": 1, "email": 1}))
    print("ADMINS:", admins)

if __name__ == "__main__":
    main()
