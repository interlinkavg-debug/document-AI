import openai
import logging
from typing import Dict, Any
from app.utils.config import settings

logger = logging.getLogger(__name__)

# DeepSeek model is free on OpenRouter, so cost is 0
PRICING = {
    "deepseek/deepseek-chat": {
        "prompt": 0.0,
        "completion": 0.0
    }
}

async def call_llm_api(prompt: str, model: str = "deepseek/deepseek-chat") -> Dict[str, Any]:
    """
    Call the OpenRouter API to get a response for the given prompt.
    
    Args:
        prompt (str): The prompt to send to the LLM
        model (str): The model to use (DeepSeek via OpenRouter)
        
    Returns:
        Dict containing the response and token usage information
    """
    if not settings.openai_api_key:
        raise ValueError("OpenRouter API key not configured")
    
    try:
        # Configure OpenAI client to use OpenRouter
        client = openai.OpenAI(
            api_key=settings.openai_api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides clear, concise summaries and analysis."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        # Extract token usage
        usage = response.usage
        prompt_tokens = usage.prompt_tokens if usage else 0
        completion_tokens = usage.completion_tokens if usage else 0
        total_tokens = usage.total_tokens if usage else 0
        
        # Calculate estimated cost (free for DeepSeek)
        estimated_cost = 0.0
        
        content = response.choices[0].message.content if response.choices else ""
        
        return {
            "summary": content,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "estimated_cost": estimated_cost
        }
        
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise