import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")  # This is actually the OpenRouter API key
    max_file_size_mb: int = 10
    llm_model: str = "deepseek/deepseek-chat"  # DeepSeek model via OpenRouter
    
    class Config:
        env_file = ".env"

settings = Settings()