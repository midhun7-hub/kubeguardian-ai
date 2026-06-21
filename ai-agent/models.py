from pydantic import BaseModel

class Incident(BaseModel):
    pod: str
    issue: str
    severity: str
    root_cause: str
    recommendation: str