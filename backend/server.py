from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
mongo_client = AsyncIOMotorClient(mongo_url)
mongo_db = mongo_client[os.environ['DB_NAME']]

# Import models
from models import User, UserRole, Document, DocumentStatus, Comment, Notification, IMSection, ExportFormat
from resend_config import send_comment_notification

app = FastAPI(title="Redwood IM Platform API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create models
class UserCreate(BaseModel):
    email: str
    display_name: str
    uid: str
    role: UserRole = UserRole.EDITOR

class DocumentCreate(BaseModel):
    title: str
    created_by: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[DocumentStatus] = None
    sections: Optional[List[Dict[str, Any]]] = None

class CommentCreate(BaseModel):
    document_id: str
    section_id: Optional[str] = None
    user_id: str
    user_name: str
    text: str
    mentions: List[str] = []
    parent_id: Optional[str] = None

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Redwood IM Platform"}

# Users
@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    user_dict = user_data.model_dump()
    user_dict['created_at'] = datetime.utcnow().isoformat()
    await mongo_db.users.update_one({'uid': user_data.uid}, {'$set': user_dict}, upsert=True)
    return User(**user_dict)

@app.get("/api/users/{uid}", response_model=User)
async def get_user(uid: str):
    user_doc = await mongo_db.users.find_one({'uid': uid}, {'_id': 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

@app.get("/api/users", response_model=List[User])
async def list_users():
    users = await mongo_db.users.find({}, {'_id': 0}).to_list(1000)
    return [User(**user) for user in users]

@app.patch("/api/users/{uid}/role")
async def update_user_role(uid: str, role: UserRole):
    await mongo_db.users.update_one({'uid': uid}, {'$set': {'role': role.value}})
    return {"message": "Role updated successfully"}

# Documents
@app.post("/api/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate):
    doc_id = str(uuid.uuid4())
    sections = []
    section_defs = [
        ("exec_summary", "1", "Executive Summary & Investment Highlights"),
        ("opportunity", "2", "Opportunity Analysis & Investment Rationale"),
        ("journey", "3", "Applicant's Journey in this Program"),
        ("business_overview", "4", "Business Overview"),
        ("financial", "5", "Financial Overview"),
        ("market", "6", "Market & Industry Analysis"),
        ("positioning", "7", "Strategic Positioning"),
        ("management", "8", "Management & Governance"),
        ("risk", "9", "Risk Analysis"),
        ("transaction", "10", "Transaction Details"),
    ]
    for sid, snum, title in section_defs:
        sections.append({
            'section_id': sid,
            'section_number': snum,
            'title': title,
            'content': {},
            'instructions': f"Complete {title}",
            'show_instructions': True
        })
    for i in range(1, 14):
        sections.append({
            'section_id': f"annexure_{i}",
            'section_number': str(10 + i),
            'title': f"Annexure {i}",
            'content': {},
            'instructions': f"Add annexure {i}",
            'show_instructions': True
        })
    
    doc_dict = {
        'id': doc_id,
        'title': doc_data.title,
        'status': 'draft',
        'created_by': doc_data.created_by,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'sections': sections,
        'collaborators': [doc_data.created_by],
        'version': 1
    }
    await mongo_db.documents.insert_one(doc_dict)
    doc_dict['created_at'] = datetime.fromisoformat(doc_dict['created_at'])
    doc_dict['updated_at'] = datetime.fromisoformat(doc_dict['updated_at'])
    return Document(**doc_dict)

@app.get("/api/documents", response_model=List[Document])
async def list_documents(user_id: Optional[str] = None):
    query = {'collaborators': user_id} if user_id else {}
    docs = await mongo_db.documents.find(query, {'_id': 0}).to_list(1000)
    result = []
    for doc in docs:
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        result.append(Document(**doc))
    return result

@app.get("/api/documents/{doc_id}", response_model=Document)
async def get_document(doc_id: str):
    doc = await mongo_db.documents.find_one({'id': doc_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    return Document(**doc)

@app.patch("/api/documents/{doc_id}")
async def update_document(doc_id: str, updates: DocumentUpdate):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    await mongo_db.documents.update_one({'id': doc_id}, {'$set': update_data})
    return {"message": "Document updated successfully"}

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    await mongo_db.documents.delete_one({'id': doc_id})
    return {"message": "Document deleted successfully"}

# Comments
@app.post("/api/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate):
    comment_id = str(uuid.uuid4())
    comment_dict = {
        'id': comment_id,
        **comment_data.model_dump(),
        'created_at': datetime.utcnow().isoformat(),
        'edited': False
    }
    await mongo_db.comments.insert_one(comment_dict)
    
    if comment_data.mentions:
        doc = await mongo_db.documents.find_one({'id': comment_data.document_id}, {'_id': 0})
        doc_title = doc.get('title', 'Untitled') if doc else 'Document'
        for email in comment_data.mentions:
            notif_dict = {
                'id': str(uuid.uuid4()),
                'user_id': email,
                'type': 'mention',
                'title': 'New Mention',
                'message': f"{comment_data.user_name} mentioned you",
                'document_id': comment_data.document_id,
                'read': False,
                'created_at': datetime.utcnow().isoformat()
            }
            await mongo_db.notifications.insert_one(notif_dict)
            try:
                await send_comment_notification(email, comment_data.user_name, comment_data.text, doc_title, comment_data.document_id)
            except:
                pass
    
    comment_dict['created_at'] = datetime.fromisoformat(comment_dict['created_at'])
    return Comment(**comment_dict)

@app.get("/api/comments", response_model=List[Comment])
async def list_comments(document_id: Optional[str] = None):
    query = {'document_id': document_id} if document_id else {}
    comments = await mongo_db.comments.find(query, {'_id': 0}).to_list(1000)
    result = []
    for c in comments:
        c['created_at'] = datetime.fromisoformat(c['created_at'])
        result.append(Comment(**c))
    return result

# Notifications
@app.get("/api/notifications/{user_id}", response_model=List[Notification])
async def get_notifications(user_id: str):
    notifs = await mongo_db.notifications.find({'user_id': user_id}, {'_id': 0}).to_list(100)
    result = []
    for n in notifs:
        n['created_at'] = datetime.fromisoformat(n['created_at'])
        result.append(Notification(**n))
    return result

@app.patch("/api/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    await mongo_db.notifications.update_one({'id': notif_id}, {'$set': {'read': True}})
    return {"message": "Marked as read"}

# Export
@app.post("/api/export/{doc_id}")
async def export_document(doc_id: str, format: str):
    doc = await mongo_db.documents.find_one({'id': doc_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if format == "json":
        return JSONResponse(content=doc)
    
    return {"message": f"{format} export available - download ready"}

# Import
@app.post("/api/import/{user_id}")
async def import_document(user_id: str, document_data: Dict[str, Any]):
    doc_id = str(uuid.uuid4())
    document_data['id'] = doc_id
    document_data['created_by'] = user_id
    document_data['created_at'] = datetime.utcnow().isoformat()
    document_data['updated_at'] = datetime.utcnow().isoformat()
    await mongo_db.documents.insert_one(document_data)
    return {"message": "Imported successfully", "id": doc_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
