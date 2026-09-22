#!/usr/bin/env python3
"""Cyan digital twin inference server.

Deploy: Qwen3-1.7B (4-bit) + ep1 LoRA adapter + b1 system prompt.
Fits 2-core / 4GB host with bitsandbytes 4-bit.

Usage:
  python inference.py                 # starts HTTP on :8000
  python inference.py --demo         # CLI chat demo
"""
import argparse
import os
from pathlib import Path

import torch

ROOT = Path(__file__).parent
BASE_MODEL = os.environ.get("BASE_MODEL", "Qwen/Qwen3-1.7B")
ADAPTER = ROOT / "adapter"
SYSTEM_PROMPT = (ROOT / "system_prompt.txt").read_text(encoding="utf-8").strip()

GEN_KWARGS = {"temperature": 0.7, "top_p": 0.9, "max_new_tokens": 256, "do_sample": True}


def load():

    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
    from peft import PeftModel

    bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16)
    tok = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL, quantization_config=bnb, device_map="auto", trust_remote_code=True
    )
    model = PeftModel.from_pretrained(model, str(ADAPTER))
    model.eval()
    return model, tok


def chat(model, tok, history):
    """history: list of {"role","content"}. Appends assistant reply, returns it."""
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}] + history
    text = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    inputs = tok(text, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(**inputs, **GEN_KWARGS, pad_token_id=tok.eos_token_id)
    new = out[0][inputs["input_ids"].shape[1]:]
    reply = tok.decode(new, skip_special_tokens=True).strip()
    history.append({"role": "assistant", "content": reply})
    return reply


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--demo", action="store_true")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()

    model, tok = load()
    if args.demo:
        history = []
        print("Cyan demo (Ctrl-C to quit). You:")
        try:
            while True:
                u = input("> ").strip()
                if not u:
                    continue
                history.append({"role": "user", "content": u})
                print("Cyan:", chat(model, tok, history))
        except (KeyboardInterrupt, EOFError):
            pass
        return

    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI()

    class Req(BaseModel):
        messages: list  # [{role, content}]

    @app.post("/chat")
    def endpoint(req: Req):
        history = [m for m in req.messages if m["role"] in ("user", "assistant")]
        return {"reply": chat(model, tok, history)}

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
