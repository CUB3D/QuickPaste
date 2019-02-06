#!/usr/bin/env python3
import sqlite3
import sys

if len(sys.argv) < 2:
    DB_PATH = "database.sqlite"
else:
    DB_PATH = sys.argv[-1]

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""CREATE TABLE Notes (
noteID INTEGER PRIAMRY KEY,
noteKey VARCHAR(255),
noteToken VARCHAR(255),
noteFile VARCHAR(255),
creationTime REAL
)""")
conn.commit()
conn.close()

