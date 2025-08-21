#!/usr/bin/env python3
import sys
import json
import os
import asyncio
import re
from difflib import SequenceMatcher
import traceback

# Add the parent directory to Python path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.utils.llm_client import call_llm_api

MAX_TEXT_LENGTH = 50000  # Limit text length for comparison

def calculate_similarity(text1, text2):
    """Calculate basic similarity score between two texts"""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

async def compare_documents(text1, text2):
    """Compare two documents using OpenAI API"""
    try:
        # Truncate texts if too long
        if len(text1) > MAX_TEXT_LENGTH:
            text1 = text1[:MAX_TEXT_LENGTH] + "..."
        if len(text2) > MAX_TEXT_LENGTH:
            text2 = text2[:MAX_TEXT_LENGTH] + "..."
        
        # Calculate basic similarity
        similarity_score = calculate_similarity(text1, text2)
        
        # Create prompt for detailed comparison
        prompt = f"""Please perform a detailed comparison of these two documents and provide:

1. Key similarities (list 4-6 main points)
2. Key differences (list 4-6 main points)
3. Overall analysis summary

Document 1:
{text1}

Document 2:
{text2}

Please format your response as JSON with the following structure:
{{
    "similarities": ["similarity 1", "similarity 2", ...],
    "differences": ["difference 1", "difference 2", ...],
    "analysis": "Overall analysis paragraph"
}}"""

        result = await call_llm_api(prompt, model="deepseek/deepseek-chat")
        response_text = result["summary"]
        
        # Extract JSON from response (in case there's extra text)
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            comparison_data = json.loads(json_match.group())
        else:
            # Fallback parsing
            comparison_data = {
                "similarities": ["Unable to parse detailed similarities"],
                "differences": ["Unable to parse detailed differences"],
                "analysis": response_text
            }
        
        return {
            "similarity_score": round(similarity_score * 100, 1),  # Convert to percentage
            "similarities": comparison_data.get("similarities", []),
            "differences": comparison_data.get("differences", []),
            "analysis": comparison_data.get("analysis", ""),
            "tokens_used": result["total_tokens"],
            "estimated_cost": result["estimated_cost"]
        }
    
    except Exception as e:
        raise Exception(f"Document comparison failed: {str(e)}")

async def main():
    if len(sys.argv) != 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: python llm_client.py compare <text1> <text2> OR compare-files <file1> <file2>"
        }))
        sys.exit(1)
    
    mode = sys.argv[1]
    
    if mode == "compare":
        text1 = sys.argv[2]
        text2 = sys.argv[3]
    elif mode == "compare-files":
        try:
            with open(sys.argv[2], 'r', encoding='utf-8') as f:
                text1 = f.read()
            with open(sys.argv[3], 'r', encoding='utf-8') as f:
                text2 = f.read()
        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": f"Failed to read files: {str(e)}"
            }))
            sys.exit(1)
    else:
        print(json.dumps({
            "success": False,
            "error": "Invalid mode. Use 'compare' or 'compare-files'"
        }))
        sys.exit(1)
    
    try:
        if not text1 or not text2:
            raise Exception("Both text inputs are required")
        
        # Perform comparison
        result = await compare_documents(text1, text2)
        result["success"] = True
        
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
