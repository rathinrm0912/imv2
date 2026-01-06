from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from typing import Dict, Any
import json

def generate_pdf(doc_data: Dict[str, Any], output_path: str):
    """Generate a formatted PDF from IM data"""
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#064E3B'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#064E3B'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        fontName='Helvetica'
    )
    
    # Title
    story.append(Paragraph('Redwood Partners Investment Memorandum', title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Document info
    story.append(Paragraph(f"<b>Title:</b> {doc_data['title']}", body_style))
    story.append(Paragraph(f"<b>Status:</b> {doc_data['status'].upper()}", body_style))
    story.append(Paragraph(f"<b>Created:</b> {doc_data['created_at']}", body_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(PageBreak())
    
    # Table of Contents
    story.append(Paragraph('Table of Contents', heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    for section in doc_data.get('sections', []):
        toc_text = f"{section['section_number']}. {section['title']}"
        story.append(Paragraph(toc_text, body_style))
    
    story.append(PageBreak())
    
    # Sections
    for section in doc_data.get('sections', []):
        # Section heading
        heading_text = f"{section['section_number']}. {section['title']}"
        story.append(Paragraph(heading_text, heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Instructions (only if enabled)
        if section.get('show_instructions', True) and section.get('instructions'):
            inst_style = ParagraphStyle(
                'Instructions',
                parent=body_style,
                fontSize=10,
                textColor=colors.grey,
                fontName='Helvetica-Oblique'
            )
            story.append(Paragraph(f"<i>Instructions: {section['instructions']}</i>", inst_style))
            story.append(Spacer(1, 0.1*inch))
        
        # Content
        content = section.get('content', {})
        if content:
            for key, value in content.items():
                if value:
                    field_text = f"<b>{key.replace('_', ' ').title()}:</b> {str(value)}"
                    story.append(Paragraph(field_text, body_style))
                    story.append(Spacer(1, 0.05*inch))
        else:
            story.append(Paragraph('[Content to be added]', body_style))
        
        story.append(Spacer(1, 0.2*inch))
    
    # Build PDF
    doc.build(story)
    return output_path
