from pydantic import BaseModel


class PolicyIngestRequest(BaseModel):
    id: int
    content: str
    category_name: str
