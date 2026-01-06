from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Import Firebase and Resend configs
from firebase_config import db, USERS_COLLECTION, DOCUMENTS_COLLECTION, COMMENTS_COLLECTION, NOTIFICATIONS_COLLECTION
from resend_config import send_comment_notification
from models import User, UserRole, Document, DocumentStatus, Comment, Notification, IMSection, ExportFormat

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Redwood IM Platform API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AUTH & USER MANAGEMENT ====================

class UserCreate(BaseModel):
    email: str
    display_name: str
    uid: str
    role: UserRole = UserRole.EDITOR

@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create or update user profile in MongoDB (fallback if Firestore unavailable)"""
    user_dict = user_data.model_dump()
    user_dict['created_at'] = datetime.utcnow().isoformat()
    
    # Try Firestore first, fallback to MongoDB if it fails
    try:
        user_ref = db.collection(USERS_COLLECTION).document(user_data.uid)
        user_ref.set(user_dict, merge=True)
    except Exception as e:
        print(f"Firestore error (using MongoDB fallback): {str(e)}")
        # Store in MongoDB instead
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ['MONGO_URL']
        mongo_client = AsyncIOMotorClient(mongo_url)
        mongo_db = mongo_client[os.environ['DB_NAME']]
        await mongo_db.users.update_one(
            {'uid': user_data.uid},
            {'$set': user_dict},
            upsert=True
        )
    
    return User(**user_dict)

@app.get("/api/users/{uid}", response_model=User)
async def get_user(uid: str):
    """Get user by UID"""
    user_ref = db.collection(USERS_COLLECTION).document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc.to_dict())

@app.get("/api/users", response_model=List[User])
async def list_users():
    """List all users"""
    users_ref = db.collection(USERS_COLLECTION)
    users = users_ref.stream()
    
    return [User(**user.to_dict()) for user in users]

@app.patch("/api/users/{uid}/role")
async def update_user_role(uid: str, role: UserRole):
    """Update user role (Admin only)"""
    user_ref = db.collection(USERS_COLLECTION).document(uid)
    user_ref.update({'role': role.value})
    return {"message": "Role updated successfully"}

# ==================== DOCUMENT MANAGEMENT ====================

class DocumentCreate(BaseModel):
    title: str
    created_by: str

@app.post("/api/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate):
    """Create a new IM document"""
    doc_id = str(uuid.uuid4())
    
    # Initialize with default IM sections
    sections = [
        IMSection(
            section_id="exec_summary",
            section_number="1",
            title="Executive Summary & Investment Highlights",
            content={},
            instructions="Provide company details, business summary, investment rationale, and key highlights"
        ),
        IMSection(
            section_id="opportunity",
            section_number="2",
            title="Opportunity Analysis & Investment Rationale",
            content={},
            instructions="Outline founding team strength, market need, size, innovation, scalability"
        ),
        IMSection(
            section_id="journey",
            section_number="3",
            title="Applicant's Journey in this Program",
            content={},
            instructions="Step-by-step process from application to final selection"
        ),
        IMSection(
            section_id="business_overview",
            section_number="4",
            title="Business Overview",
            content={},
            instructions="Problem statement, solution stage, business model, technology summary"
        ),
        IMSection(
            section_id="financial",
            section_number="5",
            title="Financial Overview",
            content={},
            instructions="Funds raised, P&L insights, balance sheet, bank statements, projections"
        ),
        IMSection(
            section_id="market",
            section_number="6",
            title="Market & Industry Analysis",
            content={},
            instructions="TAM/SAM/SOM, Indian and global market, competition, regulatory impact"
        ),
        IMSection(
            section_id="positioning",
            section_number="7",
            title="Strategic Positioning",
            content={},
            instructions="Competitive advantage, SWOT analysis, risk mitigation"
        ),
        IMSection(
            section_id="management",
            section_number="8",
            title="Management & Governance",
            content={},
            instructions="Founding team background, cap table, employee details"
        ),
        IMSection(
            section_id="risk",
            section_number="9",
            title="Risk Analysis",
            content={},
            instructions="Market, operational, financial, regulatory, and external risks"
        ),
        IMSection(
            section_id="transaction",
            section_number="10",
            title="Transaction Details",
            content={},
            instructions="Fund utilization plan, exit mechanisms, recommendation"
        ),
    ]
    
    # Add annexures
    for i in range(1, 14):
        sections.append(
            IMSection(
                section_id=f"annexure_{i}",
                section_number=str(10 + i),
                title=f"Annexure {i}",
                content={},
                instructions=f"Supporting documentation for section {i}"
            )
        )
    
    doc = Document(
        id=doc_id,
        title=doc_data.title,
        created_by=doc_data.created_by,
        sections=[s.model_dump() for s in sections],
        collaborators=[doc_data.created_by]
    )
    
    doc_dict = doc.model_dump()
    doc_dict['created_at'] = doc_dict['created_at'].isoformat()
    doc_dict['updated_at'] = doc_dict['updated_at'].isoformat()
    
    db.collection(DOCUMENTS_COLLECTION).document(doc_id).set(doc_dict)
    
    return doc

@app.get("/api/documents", response_model=List[Document])
async def list_documents(user_id: Optional[str] = None):
    """List all documents, optionally filtered by user"""
    docs_ref = db.collection(DOCUMENTS_COLLECTION)
    
    if user_id:
        docs = docs_ref.where('collaborators', 'array_contains', user_id).stream()
    else:
        docs = docs_ref.stream()
    
    documents = []
    for doc in docs:
        doc_data = doc.to_dict()
        doc_data['created_at'] = datetime.fromisoformat(doc_data['created_at'])
        doc_data['updated_at'] = datetime.fromisoformat(doc_data['updated_at'])
        documents.append(Document(**doc_data))
    
    return documents

@app.get("/api/documents/{doc_id}", response_model=Document)
async def get_document(doc_id: str):
    """Get document by ID"""
    doc_ref = db.collection(DOCUMENTS_COLLECTION).document(doc_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_data = doc.to_dict()
    doc_data['created_at'] = datetime.fromisoformat(doc_data['created_at'])
    doc_data['updated_at'] = datetime.fromisoformat(doc_data['updated_at'])
    
    return Document(**doc_data)

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[DocumentStatus] = None
    sections: Optional[List[Dict[str, Any]]] = None

@app.patch("/api/documents/{doc_id}")
async def update_document(doc_id: str, updates: DocumentUpdate):
    """Update document fields"""
    doc_ref = db.collection(DOCUMENTS_COLLECTION).document(doc_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    doc_ref.update(update_data)
    
    return {"message": "Document updated successfully"}

@app.post("/api/documents/{doc_id}/collaborators/{user_id}")
async def add_collaborator(doc_id: str, user_id: str):
    """Add collaborator to document"""
    doc_ref = db.collection(DOCUMENTS_COLLECTION).document(doc_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_data = doc.to_dict()
    if user_id not in doc_data.get('collaborators', []):
        doc_ref.update({
            'collaborators': firestore.ArrayUnion([user_id])
        })
    
    return {"message": "Collaborator added successfully"}

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete document"""
    db.collection(DOCUMENTS_COLLECTION).document(doc_id).delete()
    return {"message": "Document deleted successfully"}

# ==================== COMMENTS ====================

class CommentCreate(BaseModel):
    document_id: str
    section_id: Optional[str] = None
    user_id: str
    user_name: str
    text: str
    mentions: List[str] = []
    parent_id: Optional[str] = None

@app.post("/api/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate):
    """Create a new comment"""
    comment_id = str(uuid.uuid4())
    
    comment = Comment(
        id=comment_id,
        **comment_data.model_dump()
    )
    
    comment_dict = comment.model_dump()
    comment_dict['created_at'] = comment_dict['created_at'].isoformat()
    
    db.collection(COMMENTS_COLLECTION).document(comment_id).set(comment_dict)
    
    # Send email notifications for mentions
    if comment_data.mentions:
        doc_ref = db.collection(DOCUMENTS_COLLECTION).document(comment_data.document_id)
        doc = doc_ref.get()
        doc_title = doc.to_dict().get('title', 'Untitled Document') if doc.exists else 'Document'
        
        for email in comment_data.mentions:
            # Create in-app notification
            notif_id = str(uuid.uuid4())
            notification = Notification(
                id=notif_id,
                user_id=email,
                type="mention",
                title="New Mention",
                message=f"{comment_data.user_name} mentioned you in a comment",
                document_id=comment_data.document_id
            )
            notif_dict = notification.model_dump()
            notif_dict['created_at'] = notif_dict['created_at'].isoformat()
            db.collection(NOTIFICATIONS_COLLECTION).document(notif_id).set(notif_dict)
            
            # Send email
            await send_comment_notification(
                to_email=email,
                mentioned_by=comment_data.user_name,
                comment_text=comment_data.text,
                document_title=doc_title,
                doc_id=comment_data.document_id
            )
    
    return comment

@app.get("/api/comments", response_model=List[Comment])
async def list_comments(document_id: Optional[str] = None, section_id: Optional[str] = None):
    """List comments with optional filters"""
    comments_ref = db.collection(COMMENTS_COLLECTION)
    
    if document_id:
        comments_ref = comments_ref.where('document_id', '==', document_id)
    if section_id:
        comments_ref = comments_ref.where('section_id', '==', section_id)
    
    comments = comments_ref.order_by('created_at').stream()
    
    result = []
    for comment in comments:
        comment_data = comment.to_dict()
        comment_data['created_at'] = datetime.fromisoformat(comment_data['created_at'])
        result.append(Comment(**comment_data))
    
    return result

@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: str):
    """Delete a comment"""
    db.collection(COMMENTS_COLLECTION).document(comment_id).delete()
    return {"message": "Comment deleted successfully"}

# ==================== NOTIFICATIONS ====================

@app.get("/api/notifications/{user_id}", response_model=List[Notification])
async def get_notifications(user_id: str, unread_only: bool = False):
    """Get notifications for a user"""
    notifs_ref = db.collection(NOTIFICATIONS_COLLECTION).where('user_id', '==', user_id)
    
    if unread_only:
        notifs_ref = notifs_ref.where('read', '==', False)
    
    notifs = notifs_ref.order_by('created_at', direction='DESCENDING').limit(50).stream()
    
    result = []
    for notif in notifs:
        notif_data = notif.to_dict()
        notif_data['created_at'] = datetime.fromisoformat(notif_data['created_at'])
        result.append(Notification(**notif_data))
    
    return result

@app.patch("/api/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    """Mark notification as read"""
    db.collection(NOTIFICATIONS_COLLECTION).document(notif_id).update({'read': True})
    return {"message": "Notification marked as read"}

# ==================== EXPORT ====================

@app.post("/api/export/{doc_id}")
async def export_document(doc_id: str, format: ExportFormat):
    """Export document in specified format"""
    doc_ref = db.collection(DOCUMENTS_COLLECTION).document(doc_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_data = doc.to_dict()
    
    # Create export directory
    export_dir = Path("/tmp/exports")
    export_dir.mkdir(exist_ok=True)
    
    if format == ExportFormat.JSON:
        # Return JSON export
        return JSONResponse(content=doc_data)
    
    elif format == ExportFormat.COMPILED:
        # Generate compiled HTML + TXT file
        html_content = generate_html_export(doc_data)
        txt_content = generate_txt_export(doc_data)
        
        html_path = export_dir / f"{doc_id}.html"
        txt_path = export_dir / f"{doc_id}.txt"
        
        html_path.write_text(html_content)
        txt_path.write_text(txt_content)
        
        return {
            "html_url": f"/api/download/{doc_id}.html",
            "txt_url": f"/api/download/{doc_id}.txt"
        }
    
    elif format == ExportFormat.PDF:
        from export_pdf import generate_pdf
        pdf_path = export_dir / f"{doc_id}.pdf"
        generate_pdf(doc_data, str(pdf_path))
        return FileResponse(
            path=str(pdf_path),
            filename=f"{doc_data['title']}.pdf",
            media_type="application/pdf"
        )
    
    elif format == ExportFormat.DOCX:
        from export_docx import generate_docx
        docx_path = export_dir / f"{doc_id}.docx"
        generate_docx(doc_data, str(docx_path))
        return FileResponse(
            path=str(docx_path),
            filename=f"{doc_data['title']}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid export format")

def generate_html_export(doc_data: Dict) -> str:
    """Generate HTML export of the document"""
    sections_html = ""
    for section in doc_data.get('sections', []):
        sections_html += f"""
        <section>
            <h2>{section['section_number']}. {section['title']}</h2>
            <div>{json.dumps(section.get('content', {}), indent=2)}</div>
        </section>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{doc_data['title']}</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #064E3B; }}
            h2 {{ color: #1E293B; border-bottom: 1px solid #ccc; padding-bottom: 8px; }}
            section {{ margin-bottom: 32px; }}
        </style>
    </head>
    <body>
        <h1>{doc_data['title']}</h1>
        <p>Status: {doc_data['status']}</p>
        <p>Created: {doc_data['created_at']}</p>
        {sections_html}
    </body>
    </html>
    """
    return html

def generate_txt_export(doc_data: Dict) -> str:
    """Generate plain text export"""
    lines = [
        f"REDWOOD INVESTMENT MEMORANDUM",
        f"=" * 60,
        f"Title: {doc_data['title']}",
        f"Status: {doc_data['status']}",
        f"Created: {doc_data['created_at']}",
        f"",
        f"=" * 60,
        ""
    ]
    
    for section in doc_data.get('sections', []):
        lines.append(f"\n{section['section_number']}. {section['title']}")
        lines.append("-" * 60)
        lines.append(json.dumps(section.get('content', {}), indent=2))
        lines.append("")
    
    return "\n".join(lines)

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Download exported file"""
    file_path = Path("/tmp/exports") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream"
    )

# ==================== IMPORT ====================

@app.post("/api/import/{user_id}")
async def import_document(user_id: str, document_data: Dict[str, Any]):
    """Import document from JSON"""
    doc_id = str(uuid.uuid4())
    document_data['id'] = doc_id
    document_data['created_by'] = user_id
    document_data['created_at'] = datetime.utcnow().isoformat()
    document_data['updated_at'] = datetime.utcnow().isoformat()
    
    db.collection(DOCUMENTS_COLLECTION).document(doc_id).set(document_data)
    
    return {"message": "Document imported successfully", "id": doc_id}

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Redwood IM Platform"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
