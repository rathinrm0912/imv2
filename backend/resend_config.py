import resend
import os
from typing import List

resend.api_key = "re_bGa2JRFn_NLNyrrZayKkDc83REYYg37s2"

FROM_EMAIL = "noreply@emergentagent.com"

async def send_comment_notification(to_email: str, mentioned_by: str, comment_text: str, document_title: str, doc_id: str):
    """Send email notification when user is mentioned in a comment"""
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": f"You were mentioned in {document_title}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #064E3B;">New Comment Mention</h2>
                <p><strong>{mentioned_by}</strong> mentioned you in a comment:</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0;">{comment_text}</p>
                </div>
                <p>Document: <strong>{document_title}</strong></p>
                <a href="https://docsync-online.preview.emergentagent.com/editor/{doc_id}" 
                   style="display: inline-block; background: #064E3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                    View Document
                </a>
            </div>
            """
        }
        email = resend.Emails.send(params)
        return email
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return None
