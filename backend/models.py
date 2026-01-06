from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    uid: str
    email: str
    display_name: Optional[str] = None
    role: UserRole = UserRole.EDITOR
    created_at: datetime = Field(default_factory=datetime.utcnow)
    avatar_url: Optional[str] = None

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    ARCHIVED = "archived"

class IMSection(BaseModel):
    section_id: str
    section_number: str
    title: str
    content: Dict[str, Any] = Field(default_factory=dict)
    instructions: Optional[str] = None
    show_instructions: bool = True

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    status: DocumentStatus = DocumentStatus.DRAFT
    created_by: str  # user uid
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    sections: List[IMSection] = Field(default_factory=list)
    collaborators: List[str] = Field(default_factory=list)  # list of uids
    version: int = 1

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    document_id: str
    section_id: Optional[str] = None
    user_id: str
    user_name: str
    text: str
    mentions: List[str] = Field(default_factory=list)  # list of mentioned user emails
    parent_id: Optional[str] = None  # for threading
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited: bool = False

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    type: str  # "mention", "comment", "document_updated"
    title: str
    message: str
    document_id: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExportFormat(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    JSON = "json"
    COMPILED = "compiled"
