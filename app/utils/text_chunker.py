from typing import List

def chunk_text(text: str, max_chunk_size: int = 1500) -> List[str]:
    """
    Splits text into chunks for LLM processing.
    
    Args:
        text (str): The text to split.
        max_chunk_size (int): Maximum size of each chunk.
        
    Returns:
        List[str]: A list of text chunks.
    """
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) + 1 > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_length = len(word) + 1
        else:
            current_chunk.append(word)
            current_length += len(word) + 1
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks