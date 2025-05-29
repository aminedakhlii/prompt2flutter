import os
from flask import Flask, request, jsonify
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_core.documents import Document
import openai

# ---- Config ----
CHROMA_PATH = "chroma"
LIB_DIR = "lib"
openai.api_key = os.environ.get("OPENAI_API_KEY")

app = Flask(__name__)

# ---- Embedding Setup ----
def get_embedding_function():
    return OllamaEmbeddings(model="nomic-embed-text")

# ---- Embed Dart Paths ----
def embed_dart_paths():
    embedding_function = get_embedding_function()
    docs = []

    for root, _, files in os.walk(LIB_DIR):
        for file in files:
            if file.endswith(".dart"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, LIB_DIR)
                docs.append(Document(page_content=rel_path, metadata={"full_path": full_path}))

    db = Chroma.from_documents(documents=docs, embedding=embedding_function, persist_directory=CHROMA_PATH)
    print(f"✅ Embedded {len(docs)} Dart paths.")

# ---- Find Similar Files ----
def get_similar_files(query, top_k=2):
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
    results = db.similarity_search_with_score(query, k=top_k)

    matched_files = []
    for doc, score in results:
        matched_files.append(doc.metadata["full_path"])
    return matched_files

# ---- Load Code From Files ----
def load_code_from_files(file_paths):
    contents = []
    for path in file_paths:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                code = f.read()
                contents.append(f"// File: {path}\n{code}")
        except Exception as e:
            print(f"⚠️ Error reading {path}: {e}")
    return "\n\n".join(contents)

# ---- Build Prompt ----
PROMPT_TEMPLATE = """
You are a top-tier Flutter UI/UX designer and developer.

Here are some existing Dart files related to the user request, inspire from them to fit the user request:

{context}

Now, based on the user request: "{question}", generate full Dart code using the latest Flutter and Material 3 best practices.

Dark theme: {isDarkTheme}
Rounded corners: {hasRoundedCorners}

Create clean, minimal but visually stunning UI with animations, custom components, shadows, rounded corners, and spacing. Use `main()` and complete structure that works in DartPad do not use state management. Avoid deprecated APIs.
"""

def build_prompt(similar_code, user_prompt, isDarkTheme, hasRoundedCorners):
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    return prompt_template.format(context=similar_code, question=user_prompt, isDarkTheme=isDarkTheme, hasRoundedCorners=hasRoundedCorners)

# ---- GPT-4o Call ----
def get_flutter_code_with_gpt(prompt):
    response = openai.chat.completions.create(
        model="o3-mini",
        messages=[
            {"role": "system", "content": (
                "Add interactivity and modern layout structure. only output the code, no other text and no comments, keep in mind that headline1, 2... are no longer supported"
            )},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

# ---- Optional CLI for First-Time Embedding ----
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--embed", action="store_true", help="Embed Dart paths")

    args = parser.parse_args()
    if args.embed:
        embed_dart_paths()
