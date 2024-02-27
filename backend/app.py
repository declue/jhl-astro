from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import shutil
import uuid
import os
app = FastAPI()

# CORS를 허용할 오리진 리스트 설정
origins = [
    "http://localhost:4321",  # React 앱이 실행되는 주소
    "http://127.0.0.1:4321",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 모든 출처 허용 시 ["*"] 사용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

image_path = os.path.abspath(os.path.join(os.path.pardir, "public", "upload"))
os.makedirs(image_path, exist_ok=True)

app.mount("/upload-image", StaticFiles(directory=image_path), name="uploaded_images")

@app.post("/upload/")
async def upload_image(image: UploadFile = File(...)):
    # 파일을 저장할 경로 생성
    file_name = f"{uuid.uuid4()}.png"
    file_full_name = os.path.join(image_path, file_name)

    # 파일 저장
    with open(file_full_name, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 접근 가능한 URL 반환
    return {"imageUrl": f"/upload/{file_name}"}

class PostData(BaseModel):
    title: str
    description: str
    series: str
    content: str
    slug: str

def safe_filename(input_string):
    invalid_chars = set(r'\/:*?"<>|')
    safe_filename = []
    for char in input_string:
        if char in invalid_chars:
            encoded_char = char.encode('utf-8').hex()
            safe_filename.append(f"%{encoded_char}")
        else:
            safe_filename.append(char)
    return ''.join(safe_filename)

async def save_markdown_file(post_data: PostData) -> str:
    # 현재 시간을 기준으로 파일명 생성
    file_name = f"{safe_filename(post_data.title)}.md"
    file_path = os.path.abspath(os.path.join(os.path.pardir, "src", "content", "blog", file_name))
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # Markdown 형식으로 파일 내용 작성
    markdown_content = f"""---
title: {post_data.title}
description: {post_data.description}
pubDate: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
series: {post_data.series}
---
{post_data.content}
"""

    # 파일에 데이터 쓰기
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(markdown_content)

    return file_name

def convert_title_to_slug(title: str) -> str:
    # 소문자로 변환
    title = title.lower()
    # 공백을 하이픈으로 대체
    slug = title.replace(" ", "-")
    # URL에 사용 불가능한 특수 문자 제거 (예시에서는 간단하게 처리)
    # 보다 정교한 처리를 위해서는 정규식 사용을 고려할 수 있음
    for char in "!@#$%^&*()+=[]{};:'\"\\|,.<>?":
        slug = slug.replace(char, "")
    # 연속된 하이픈 축약
    slug = "-".join(filter(None, slug.split("-")))
    return slug


@app.post("/post/")
async def create_post(post_data: PostData):
    file_name = await save_markdown_file(post_data)
    return {"message": "Post saved successfully.", "file_name": file_name, "slug" : convert_title_to_slug(post_data.title)}

@app.patch("/post/")
async def modify_post(post_data: PostData):
    file_name = await modify_markdown_file(post_data)
    return {"message": "Post modified successfully.", "file_name": file_name, "slug" : post_data.slug}

@app.delete("/post/")
async def delete_post(post_data: PostData):
    print(post_data)
    file_name = await delete_markdown_file(post_data)
    return {"message": "Post deleted successfully.", "file_name": file_name}

async def modify_markdown_file(post_data: PostData) -> str:
    # 파일 경로 결정
    file_name = f"{post_data.slug}.md"
    file_path = os.path.abspath(os.path.join(os.path.pardir, "src", "content", "blog", file_name))

    # 파일 존재 여부 확인
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Markdown 파일 수정
    markdown_content = f"""---
title: {post_data.title}
description: {post_data.description}
pubDate: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
series: {post_data.series}
---
{post_data.content}
"""

    # 파일에 변경 사항 쓰기
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(markdown_content)

    return file_name

async def delete_markdown_file(post_data: PostData) -> str:
    # 파일 경로 결정
    file_name = f"{safe_filename(post_data.title)}.md"
    file_path = os.path.abspath(os.path.join(os.path.pardir, "src", "content", "blog", file_name))

    # 파일 존재 여부 확인 및 삭제
    if os.path.exists(file_path):
        os.remove(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")

    return file_name
