import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from pathlib import Path

# Initialize Firebase Admin SDK
# For production, use service account JSON
# For now, we'll use the web config and initialize without credentials for Firestore
try:
    firebase_app = firebase_admin.get_app()
except ValueError:
    # Initialize with minimal config - Firestore will connect via Firebase Web SDK
    firebase_app = firebase_admin.initialize_app(options={
        'projectId': 'im-b169f'
    })

db = firestore.client()

# Collections
USERS_COLLECTION = 'users'
DOCUMENTS_COLLECTION = 'documents'
COMMENTS_COLLECTION = 'comments'
NOTIFICATIONS_COLLECTION = 'notifications'
