from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from mysql.connector import connect

from db import build_db_config

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR / '.env.example', override=False)

SCHEMA_SQL = Path(__file__).with_name('schema.sql')


def ensure_database() -> None:
    db_name = os.getenv('MYSQL_DATABASE', 'apicta_2026')

    admin_config = build_db_config(include_database=False)
    with connect(**admin_config) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()

    schema = SCHEMA_SQL.read_text()
    statements = [statement.strip() for statement in schema.split(';') if statement.strip()]

    db_config = build_db_config(include_database=True)
    with connect(**db_config) as connection:
        with connection.cursor() as cursor:
            for statement in statements:
                if statement.upper().startswith('CREATE DATABASE'):
                    continue
                cursor.execute(statement)
        connection.commit()


if __name__ == '__main__':
    ensure_database()
    print('MySQL database and tables are ready.')
