import sqlite3
from datetime import datetime
from typing import Optional, List, Dict

DB_PATH = "conversations.sqlite3"  # file created in BackEnd folder

def init_db():
    """Create database and conversations table if not present."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            question TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()

def save_conversation(user: str, question: str, response: str, timestamp: Optional[str] = None) -> None:
    """Save a single conversation entry."""
    if timestamp is None:
        timestamp = datetime.utcnow().isoformat()  # store in UTC ISO format
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO conversations (user, question, response, timestamp) VALUES (?, ?, ?, ?)",
        (user, question, response, timestamp),
    )
    conn.commit()
    conn.close()

def get_conversation_history(user: Optional[str] = None, limit: Optional[int] = None) -> List[Dict]:
    """Retrieve conversation history. If user is None, returns all history."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    if user:
        query = "SELECT user, question, response, timestamp FROM conversations WHERE user = ? ORDER BY id ASC"
        params = (user,)
    else:
        query = "SELECT user, question, response, timestamp FROM conversations ORDER BY id ASC"
        params = ()
    if limit:
        query = query + " LIMIT ?"
        params = params + (limit,)
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    result = [
        {"user": r[0], "question": r[1], "response": r[2], "timestamp": r[3]} for r in rows
    ]
    return result