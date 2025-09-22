import os
import subprocess
import sys
from pathlib import Path

def check_requirements():
    try:
        import torch
        import transformers
        return True
    except ImportError:
        return False

def install_requirements():
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", 
        "torch", 
        "transformers>=4.34.0", 
        "accelerate", 
        "bitsandbytes>=0.41.1",
        "scipy",
        "sentencepiece"
    ])

def setup_model():
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch

    print("Downloading DeepSeek Coder model...")
    model_name = "deepseek-ai/deepseek-coder-33b-instruct"
    
    # Download tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.save_pretrained("./models/deepseek-coder")
    
    # Download model with 4-bit quantization for efficiency
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        load_in_4bit=True,
        trust_remote_code=True,
        device_map="auto"
    )
    model.save_pretrained("./models/deepseek-coder")
    
    print("Model setup complete!")

def setup_server():
    # Create server directory if it doesn't exist
    os.makedirs("rica-server", exist_ok=True)
    
    # Create server.py
    server_code = """
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
import uvicorn
from typing import List, Optional
import os

app = FastAPI()

# Load model and tokenizer
print("Loading DeepSeek Coder model...")
model_path = "./models/deepseek-coder"
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    load_in_4bit=True,
    trust_remote_code=True,
    device_map="auto"
)

class ChatRequest(BaseModel):
    messages: List[dict]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2000

class ChatResponse(BaseModel):
    content: str
    usage: dict

@app.post("/v1/chat/completions")
async def chat_completion(request: ChatRequest):
    try:
        # Format messages for the model
        prompt = ""
        for msg in request.messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt += f"System: {content}\\n"
            else:
                prompt += f"{content}\\n"
        
        # Generate response
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Calculate token usage
        input_tokens = len(inputs.input_ids[0])
        output_tokens = len(outputs[0]) - input_tokens
        
        return ChatResponse(
            content=response_text,
            usage={
                "prompt_tokens": input_tokens,
                "completion_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=11434)
"""
    
    with open("rica-server/server.py", "w") as f:
        f.write(server_code.strip())
    
    # Create requirements.txt
    requirements = """
fastapi>=0.68.0
uvicorn>=0.15.0
torch>=2.0.0
transformers>=4.34.0
accelerate>=0.20.0
bitsandbytes>=0.41.1
pydantic>=1.8.0
scipy>=1.7.0
sentencepiece>=0.1.99
"""
    
    with open("rica-server/requirements.txt", "w") as f:
        f.write(requirements.strip())

def main():
    print("Setting up DeepSeek Coder environment...")
    
    if not check_requirements():
        install_requirements()
    
    # Create models directory
    os.makedirs("models", exist_ok=True)
    
    # Download and setup the model
    setup_model()
    
    # Setup the server
    setup_server()
    
    print("\nSetup complete! To start the server:")
    print("1. cd rica-server")
    print("2. pip install -r requirements.txt")
    print("3. python server.py")
    print("\nThe server will be available at http://localhost:11434")

if __name__ == "__main__":
    main()
