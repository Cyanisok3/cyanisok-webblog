# Cyan Digital Twin 部署包

## 内容
- `adapter/` — ep1 LoRA 权重（25MB，从 r3 SFT checkpoint-162）
- `system_prompt.txt` — b1 人设提示词（旧版，不要用 hardened 版）
- `inference.py` — 加载 + chat 脚本

## 部署（2核4G 服务器）
```bash
# 1. 装依赖（4bit 需要 bitsandbytes）
pip install torch transformers peft bitsandbytes fastapi uvicorn

# 2. 下载底座（国内走 modelscope）
python -c "from modelscope import snapshot_download; snapshot_download('Qwen/Qwen3-1.7B', local_dir='/path/to/Qwen3-1.7B')"

# 3. 指向底座
export BASE_MODEL=/path/to/Qwen3-1.7B

# 4. 启动 HTTP
python inference.py --port 8000

# 或 CLI demo
python inference.py --demo
```

## API
POST `/chat`
```json
{"messages": [{"role": "user", "content": "what's up"}]}
→ {"reply": "..."}
```

## 已知限制（1.7B 天花板）
- 诱导式问"回复太快/要照片"偶发自称 bot/digital version
- 偶发粗口
- 编造具体事实 → 留给 RAG 补
- 部署时页面保留 "Chat with me" 标注

## 不要做
- 别往 system prompt 加否定式硬规则（"never say bot"）——1.7B 会反而激活这些词
- 别用 DPO r3/r4 的 adapter（已删，风格退化）
