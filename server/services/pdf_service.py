#!/usr/bin/env python3
import sys
import json
import os
import asyncio
import traceback
from pathlib import Path

# Add the parent directory to Python path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.services.pdf_service import extract_text_from_pdf, summarize_text_with_llm

async def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python pdf_service.py <pdf_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        # Check if file exists
        if not os.path.exists(pdf_path):
            raise Exception(f"File not found: {pdf_path}")
        
        # Extract text
        extracted_text = extract_text_from_pdf(pdf_path)
        
        if not extracted_text:
            raise Exception("No text could be extracted from the PDF")
        
        # Generate summary
        summary_result = await summarize_text_with_llm(extracted_text)
        
        # Return results
        result = {
            "success": True,
            "text": extracted_text,
            "summary": summary_result["summary"],
            "tokens_used": summary_result["total_tokens"],
            "estimated_cost": summary_result["estimated_cost"],
            "pages": extracted_text.count('\n') + 1,  # Rough page estimate
            "word_count": len(extracted_text.split()),
            "char_count": len(extracted_text)
        }
        
        print(json.dumps(result))
    
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
